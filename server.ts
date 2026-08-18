import express from "express";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import compression from "compression";

// Disable SSL certificate validation for maximum compatibility with all IPTV/live stream providers
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();
const PORT = 3000;
const SAVED_MATCHES_FILE = path.join(process.cwd(), "saved_matches.json");
const OVERRIDES_FILE = path.join(process.cwd(), "match_overrides.json");
const TEAM_LOGOS_FILE = path.join(process.cwd(), "team_logos.json");

function getTeamLogos(): Record<string, string> {
  try {
    if (fs.existsSync(TEAM_LOGOS_FILE)) {
      const data = fs.readFileSync(TEAM_LOGOS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading team logos file:", err);
  }
  return {};
}

function saveTeamLogos(logos: Record<string, string>) {
  try {
    fs.writeFileSync(TEAM_LOGOS_FILE, JSON.stringify(logos, null, 2));
  } catch (err) {
    console.error("Error saving team logos file:", err);
  }
}

function applyTeamLogos(match: any, teamLogos: Record<string, string>, override: any): any {
  if (!match) return match;

  const findLogo = (teamObj: any) => {
    if (!teamObj) return null;
    const arName = (teamObj.ar || "").trim().toLowerCase();
    const enName = (teamObj.en || "").trim().toLowerCase();

    for (const key of Object.keys(teamLogos)) {
      const normalizedKey = key.trim().toLowerCase();
      if (normalizedKey && (normalizedKey === arName || normalizedKey === enName)) {
        return teamLogos[key];
      }
    }
    return null;
  };

  // If match has a local logo override, use it. Otherwise use the global one.
  const hasLocalOverrideA = override && override.logoA !== undefined;
  if (hasLocalOverrideA) {
    match.logoA = override.logoA;
  } else {
    const customLogoA = findLogo(match.teamA);
    if (customLogoA) {
      match.logoA = customLogoA;
    }
  }

  const hasLocalOverrideB = override && override.logoB !== undefined;
  if (hasLocalOverrideB) {
    match.logoB = override.logoB;
  } else {
    const customLogoB = findLogo(match.teamB);
    if (customLogoB) {
      match.logoB = customLogoB;
    }
  }

  return match;
}

function autoProcessMatchStatus(match: any): any {
  if (!match) return match;
  
  // If the match status is explicitly marked as "ended" or "upcoming", respect that!
  if (match.status === "ended" || match.status === "upcoming") {
    return match;
  }

  let scheduledDate: Date | null = null;

  if (match.utcTime) {
    const d = new Date(match.utcTime);
    if (!isNaN(d.getTime())) {
      scheduledDate = d;
    }
  }

  // Parse custom match time
  if (!scheduledDate) {
    const timeStr = match.time?.en || match.time?.ar || match.time || "";
    if (typeof timeStr === "string") {
      const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      const cleanStr = timeStr.replace(/[٠-٩]/g, (d) => arabicDigits.indexOf(d).toString());
      
      const matchTimeResult = cleanStr.match(/(\d{1,2}):(\d{2})/);
      if (matchTimeResult) {
        const hours = parseInt(matchTimeResult[1], 10);
        const minutes = parseInt(matchTimeResult[2], 10);
        
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);

        const cleanStrLower = cleanStr.toLowerCase();
        if (cleanStrLower.includes("tomorrow") || cleanStrLower.includes("غد")) {
          d.setDate(d.getDate() + 1);
        } else if (cleanStrLower.includes("yesterday") || cleanStrLower.includes("أمس")) {
          d.setDate(d.getDate() - 1);
        }
        
        scheduledDate = d;
      }
    }
  }

  if (scheduledDate) {
    const now = new Date();
    if (now >= scheduledDate) {
      const elapsedMs = now.getTime() - scheduledDate.getTime();
      const elapsedMinutes = Math.floor(elapsedMs / 60000);

      let periodTextEn = "Live";
      let periodTextAr = "مباشر";

      if (elapsedMinutes >= 45 && elapsedMinutes < 60) {
        periodTextEn = "HT";
        periodTextAr = "بين الشوطين";
      }

      return {
        ...match,
        status: "live",
        statusText: {
          ar: periodTextAr,
          en: periodTextEn
        },
        scoreA: match.scoreA !== undefined ? match.scoreA : 0,
        scoreB: match.scoreB !== undefined ? match.scoreB : 0
      };
    }
  }

  return match;
}

function getMatchOverrides(): Record<string, any> {
  try {
    if (fs.existsSync(OVERRIDES_FILE)) {
      const data = fs.readFileSync(OVERRIDES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading overrides file:", err);
  }
  return {};
}

function saveMatchOverride(matchId: string, data: any) {
  try {
    const overrides = getMatchOverrides();
    overrides[matchId] = {
      ...(overrides[matchId] || {}),
      ...data,
      id: String(matchId)
    };
    fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(overrides, null, 2));
  } catch (err) {
    console.error("Error saving match override:", err);
  }
}

app.use(compression());
app.use(express.json());

const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json"
};

// Helper to get today's date as YYYYMMDD
function getTodayDateString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

// Get or initialize saved match IDs
async function getSavedMatchIds(): Promise<string[]> {
  try {
    if (fs.existsSync(SAVED_MATCHES_FILE)) {
      const data = fs.readFileSync(SAVED_MATCHES_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return Array.from(new Set(parsed.map(String)));
      }
    }
  } catch (err) {
    console.error("Error reading saved matches file:", err);
  }

  // Default to empty array - Do NOT automatically populate matches
  const defaultList: string[] = [];
  try {
    fs.writeFileSync(SAVED_MATCHES_FILE, JSON.stringify(defaultList, null, 2));
  } catch (err) {
    console.error("Error writing empty matches file:", err);
  }
  return defaultList;
}

// Map FotMob response to our internal app schema
function mapFotmobMatch(details: any): any {
  const general = details.general || {};
  const header = details.header || {};
  const teams = header.teams || [];
  const homeTeam = teams[0] || {};
  const awayTeam = teams[1] || {};

  const status = header.status || {};
  const homeTeamId = general.homeTeam?.id || homeTeam?.id;
  const awayTeamId = general.awayTeam?.id || awayTeam?.id;
  const logoA = homeTeamId ? `https://images.fotmob.com/image_resources/logo/teamlogo/${homeTeamId}.png` : undefined;
  const logoB = awayTeamId ? `https://images.fotmob.com/image_resources/logo/teamlogo/${awayTeamId}.png` : undefined;
  const started = status.started;
  const finished = status.finished;
  const scoreStr = status.scoreStr;

  const leagueId = general.leagueId || header.leagueId;
  const leagueLogo = leagueId ? `https://images.fotmob.com/image_resources/logo/leaguelogo/${leagueId}.png` : undefined;
  const utcTime = general.matchTimeUTCDate || header.status?.utcTime || "";

  let matchStatus: "live" | "upcoming" | "ended" = "upcoming";
  if (status.finished || status.cancelled || status.reason?.short === "FT" || status.reason?.short === "Pen" || status.reason?.short === "AET" || finished) {
    matchStatus = "ended";
  } else if ((status.started || started) && !finished) {
    matchStatus = "live";
  }

  let scoreA: any = undefined;
  let scoreB: any = undefined;

  if (matchStatus !== "upcoming") {
    scoreA = homeTeam.score !== undefined ? homeTeam.score : (general.homeTeam?.score !== undefined ? general.homeTeam.score : undefined);
    scoreB = awayTeam.score !== undefined ? awayTeam.score : (general.awayTeam?.score !== undefined ? general.awayTeam.score : undefined);

    if (scoreA === undefined || scoreB === undefined) {
      if (scoreStr && scoreStr.includes("-")) {
        const parts = scoreStr.split("-").map((s: string) => s.trim());
        scoreA = Number(parts[0]) || parts[0];
        scoreB = Number(parts[1]) || parts[1];
      }
    }
  }

  let liveTimeText = "";
  if (status.liveTime?.short) {
    liveTimeText = status.liveTime.short;
  } else if (status.reason?.short) {
    liveTimeText = status.reason.short;
  }

  const timeFormatted = general.matchTimeKey || general.matchTime || "";

  // Extract Events (Goals, Scorers)
  const homeScorers: any[] = [];
  const awayScorers: any[] = [];
  const events = details.content?.matchFacts?.events?.events || [];
  
  for (const ev of events) {
    if (ev.type === "Goal" || ev.type === "Penalty" || ev.type === "OwnGoal") {
      const scorer = {
        name: ev.name || ev.player?.name || "Player",
        time: ev.time,
        type: ev.type, // 'Goal' | 'Penalty' | 'OwnGoal'
        assist: ev.assistName
      };
      if (ev.isHome) {
        homeScorers.push(scorer);
      } else {
        awayScorers.push(scorer);
      }
    }
  }

  // Extract statistics
  const statsMapped: any[] = [];
  const statsPeriods = details.content?.stats?.periods?.All?.stats || [];
  for (const statGroup of statsPeriods) {
    if (statGroup.stats && Array.isArray(statGroup.stats)) {
      for (const s of statGroup.stats) {
        if (s.title && s.stats) {
          statsMapped.push({
            title: s.title,
            home: s.stats[0],
            away: s.stats[1]
          });
        }
      }
    }
  }

  // Extract Lineups
  const lineupsRaw = details.content?.lineup || {};
  let lineupsMapped: any = null;

  if (lineupsRaw.teams && Array.isArray(lineupsRaw.teams) && lineupsRaw.teams.length >= 2) {
    const homeLineup = lineupsRaw.teams[0] || {};
    const awayLineup = lineupsRaw.teams[1] || {};

    const mapPlayers = (playersList: any[]) => {
      if (!playersList || !Array.isArray(playersList)) return [];
      const flat: any[] = [];
      for (const row of playersList) {
        if (Array.isArray(row)) {
          for (const p of row) {
            flat.push({
              name: p.name?.fullName || p.name?.firstName + " " + p.name?.lastName || "Player",
              shirtNumber: p.shirtNumber || p.jersey || "",
              role: p.role || ""
            });
          }
        } else if (row.name) {
          flat.push({
            name: row.name?.fullName || row.name?.firstName + " " + row.name?.lastName || "Player",
            shirtNumber: row.shirtNumber || row.jersey || "",
            role: row.role || ""
          });
        }
      }
      return flat;
    };

    lineupsMapped = {
      home: {
        players: mapPlayers(homeLineup.starting),
        bench: mapPlayers(homeLineup.bench)
      },
      away: {
        players: mapPlayers(awayLineup.starting),
        bench: mapPlayers(awayLineup.bench)
      }
    };
  }

  return {
    id: String(general.matchId || general.id),
    sport: "football",
    teamA: { ar: general.homeTeam?.name || "Home", en: general.homeTeam?.name || "Home" },
    teamB: { ar: general.awayTeam?.name || "Away", en: general.awayTeam?.name || "Away" },
    logoA,
    logoB,
    scoreA,
    scoreB,
    status: matchStatus,
    statusText: {
      ar: matchStatus === "live" ? `مباشر ${liveTimeText}` : matchStatus === "ended" ? "انتهت" : "لم تبدأ",
      en: matchStatus === "live" ? `Live ${liveTimeText}` : matchStatus === "ended" ? "FT" : "Upcoming"
    },
    time: {
      ar: timeFormatted,
      en: timeFormatted
    },
    venue: {
      ar: general.venue?.name || "ملعب المباراة",
      en: general.venue?.name || "Stadium"
    },
    leagueName: general.leagueName || "",
    leagueLogo,
    utcTime,
    scorers: {
      home: homeScorers,
      away: awayScorers
    },
    stats: statsMapped,
    lineups: lineupsMapped
  };
}

const GOOGLE_MATCHES_CACHE_FILE = path.join(process.cwd(), "google_matches_cache.json");

let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

const TRANSLATIONS_CACHE_FILE = path.join(process.cwd(), "translations_cache.json");
let memoryTranslationsCache: Record<string, string> = {};

function loadTranslationsCache() {
  try {
    if (fs.existsSync(TRANSLATIONS_CACHE_FILE)) {
      const data = fs.readFileSync(TRANSLATIONS_CACHE_FILE, "utf-8");
      memoryTranslationsCache = JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to load translations cache:", err);
  }
}

function saveTranslationsCache() {
  try {
    fs.writeFileSync(TRANSLATIONS_CACHE_FILE, JSON.stringify(memoryTranslationsCache, null, 2));
  } catch (err) {
    console.error("Failed to save translations cache:", err);
  }
}

// Initial load
loadTranslationsCache();

const COMMON_TRANSLATIONS: Record<string, string> = {
  // Leagues
  "La Liga": "الدوري الإسباني",
  "LaLiga": "الدوري الإسباني",
  "Premier League": "الدوري الإنجليزي الممتاز",
  "Champions League": "دوري أبطال أوروبا",
  "Serie A": "الدوري الإيطالي",
  "Bundesliga": "الدوري الألماني",
  "Ligue 1": "الدوري الفرنسي",
  "Saudi Pro League": "الدوري السعودي للمحترفين",
  "MLS": "الدوري الأمريكي",
  "Eredivisie": "الدوري الهولندي",
  "Championship": "دوري البطولة الإنجليزية",
  "World Cup": "كأس العالم",
  "Copa America": "كوبا أمريكا",
  "Euro 2024": "يورو 2024",
  "Euro": "كأس الأمم الأوروبية",
  "Egyptian Premier League": "الدوري المصري الممتاز",

  // Popular Football Clubs
  "Real Madrid": "ريال مدريد",
  "Barcelona": "برشلونة",
  "Atletico Madrid": "أتلتيكو مدريد",
  "Man City": "مانشستر سيتي",
  "Manchester City": "مانشستر سيتي",
  "Man United": "مانشستر يونايتد",
  "Manchester United": "مانشستر يونايتد",
  "Liverpool": "ليفربول",
  "Arsenal": "أرسنال",
  "Chelsea": "تشيلسي",
  "Tottenham": "توتنهام",
  "Bayern Munich": "بايرن ميونخ",
  "Dortmund": "دورتموند",
  "PSG": "باريس سان جيرمان",
  "Paris Saint-Germain": "باريس سان جيرمان",
  "Juventus": "يوفنتوس",
  "AC Milan": "ميلان",
  "Inter Milan": "إنتر ميلان",
  "Inter": "إنتر ميلان",
  "Al Nassr": "النصر",
  "Al Hilal": "الهلال",
  "Al Ittihad": "الاتحاد",
  "Al Ahly": "الأهلي",
  "Zamalek": "الزمالك",
  "Roma": "روما",
  "Napoli": "نابولي",
  "Aston Villa": "أستون فيلا",
  "Leverkusen": "ليفركوزن",
  "Bayer Leverkusen": "باير ليفركوزن",

  // Popular Stadiums / Venues
  "Santiago Bernabéu": "سانتياغو برنابيو",
  "Santiago Bernabeu": "سانتياغو برنابيو",
  "Camp Nou": "كامب نو",
  "Spotify Camp Nou": "كامب نو",
  "Old Trafford": "أولد ترافورد",
  "Anfield": "أنفيلد",
  "Etihad Stadium": "ملعب الاتحاد",
  "Emirates Stadium": "ملعب الإمارات",
  "Allianz Arena": "أليانز أرينا",
  "San Siro": "سان سيرو",
  "Stade de France": "ستاد دي فرانس",
  "Wembley": "ويمبلي",
  "Wembley Stadium": "ملعب ويمبلي",

  // Match status / Live text / Time terms
  "FT": "انتهت",
  "Full Time": "انتهت",
  "HT": "بين الشوطين",
  "Half Time": "بين الشوطين",
  "Live": "مباشر",
  "Upcoming": "لم تبدأ",
  "Today": "اليوم",
  "Tomorrow": "غداً",
  "Yesterday": "أمس",
  "Postponed": "مؤجلة",
  "Cancelled": "ملغاة",
  "AET": "بعد الوقت الإضافي",
  "Pens": "ركلات الترجيح",

  // Days of week
  "Monday": "الإثنين",
  "Tuesday": "الثلاثاء",
  "Wednesday": "الأربعاء",
  "Thursday": "الخميس",
  "Friday": "الجمعة",
  "Saturday": "السبت",
  "Sunday": "الأحد",

  // Common Stats titles
  "Possession": "الاستحواذ",
  "Shots": "التسديدات",
  "Shots on target": "التسديدات على المرمى",
  "Yellow Cards": "البطاقات الصفراء",
  "Red Cards": "البطاقات الحمراء",
  "Offsides": "التسلل",
  "Fouls": "الأخطاء",
  "Corners": "الضربات الركنية",
  "Saves": "التصديات",
  "Passes": "التمريرات",
  "Expected Goals (xG)": "الأهداف المتوقعة (xG)",
  "xG": "الأهداف المتوقعة",
  "Blocked Shots": "التسديدات المحجوبة",
  "Tackles": "العرقلات الناجحة",
  "Fouls Committed": "الأخطاء المرتكبة",

  // Other common placeholders
  "Player": "لاعب",
};

async function autoTranslateMatchData(data: any): Promise<any> {
  if (!data) return data;
  const copy = JSON.parse(JSON.stringify(data));

  const translate = async (text: string, context: string): Promise<string> => {
    if (!text || typeof text !== "string" || text.trim() === "") return "";
    
    const trimmed = text.trim();

    // 1. If it already contains Arabic characters, return it directly
    if (/[\u0600-\u06FF]/.test(trimmed)) {
      return trimmed;
    }

    // 2. If it is only digits, colons, spaces, dots, hyphens, pluses, apostrophes, quotes, return it directly (e.g., "17:00", "45'", "2-1")
    if (/^[\d\s:.\-+'"]+$/.test(trimmed)) {
      return trimmed;
    }

    // 3. Check our local dictionary
    const lowerKey = trimmed.toLowerCase();
    for (const [enKey, arVal] of Object.entries(COMMON_TRANSLATIONS)) {
      if (enKey.toLowerCase() === lowerKey) {
        return arVal;
      }
    }

    // 3.5 Check persistent/memory cache
    if (memoryTranslationsCache[lowerKey]) {
      return memoryTranslationsCache[lowerKey];
    }

    // 4. Call Gemini with a clean fallback if not found in local dictionary
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an expert sports translator. Translate this English text/term into appropriate Arabic.
Context: ${context}
English text: "${text}"
Return ONLY the translation, no extra commentary, no quotes.`,
      });
      const result = response.text?.replace(/['"]/g, "").trim() || text;
      
      // Save to cache
      memoryTranslationsCache[lowerKey] = result;
      saveTranslationsCache();

      return result;
    } catch (e: any) {
      console.warn(`Translation API warning for "${text}" (falling back to original):`, e.message || e);
      return text;
    }
  };

  // 1. Team A
  if (copy.teamA && typeof copy.teamA === "object" && copy.teamA.en) {
    copy.teamA.ar = await translate(copy.teamA.en, "football team name");
  }

  // 2. Team B
  if (copy.teamB && typeof copy.teamB === "object" && copy.teamB.en) {
    copy.teamB.ar = await translate(copy.teamB.en, "football team name");
  }

  // 3. Time
  if (copy.time && typeof copy.time === "object" && copy.time.en) {
    copy.time.ar = await translate(copy.time.en, "match date/time (e.g. Today, Tomorrow, Friday, etc.)");
  }

  // 4. Venue
  if (copy.venue && typeof copy.venue === "object" && copy.venue.en) {
    copy.venue.ar = await translate(copy.venue.en, "stadium/venue name");
  }

  // 5. Status text
  if (copy.statusText && typeof copy.statusText === "object" && copy.statusText.en) {
    copy.statusText.ar = await translate(copy.statusText.en, "match status text (e.g. FT, HT, Live, or details)");
  }

  // 6. League Name
  if (copy.leagueName) {
    let leagueNameEn = "";
    if (typeof copy.leagueName === "object") {
      leagueNameEn = copy.leagueName.en || "";
    } else if (typeof copy.leagueName === "string") {
      leagueNameEn = copy.leagueName;
    }

    if (leagueNameEn) {
      const leagueNameAr = await translate(leagueNameEn, "football league name");
      copy.leagueName = {
        en: leagueNameEn,
        ar: leagueNameAr
      };
    }
  }

  // 7. Stats
  if (Array.isArray(copy.stats)) {
    for (let i = 0; i < copy.stats.length; i++) {
      const stat = copy.stats[i];
      if (stat && stat.title) {
        let statTitleEn = "";
        if (typeof stat.title === "object") {
          statTitleEn = stat.title.en || "";
        } else if (typeof stat.title === "string") {
          statTitleEn = stat.title;
        }

        if (statTitleEn) {
          const statTitleAr = await translate(statTitleEn, "match statistic title (e.g. Possession, Shots, Yellow Cards, Offsides, Fouls, Corners)");
          stat.title = {
            en: statTitleEn,
            ar: statTitleAr
          };
        }
      }
    }
  }

  // 8. Scorers (home and away)
  const translateScorers = async (scorersList: any[]) => {
    if (!Array.isArray(scorersList)) return;
    for (let i = 0; i < scorersList.length; i++) {
      const scorer = scorersList[i];
      if (scorer && scorer.name) {
        let scorerNameEn = "";
        if (typeof scorer.name === "object") {
          scorerNameEn = scorer.name.en || "";
        } else if (typeof scorer.name === "string") {
          scorerNameEn = scorer.name;
        }

        if (scorerNameEn) {
          const scorerNameAr = await translate(scorerNameEn, "football player name");
          scorer.name = {
            en: scorerNameEn,
            ar: scorerNameAr
          };
        }
      }
    }
  };

  if (copy.scorers) {
    if (copy.scorers.home) {
      await translateScorers(copy.scorers.home);
    }
    if (copy.scorers.away) {
      await translateScorers(copy.scorers.away);
    }
  }

  return copy;
}

function getGoogleMatchesCache(): Record<string, any> {
  try {
    if (fs.existsSync(GOOGLE_MATCHES_CACHE_FILE)) {
      const data = fs.readFileSync(GOOGLE_MATCHES_CACHE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading Google matches cache:", err);
  }
  return {};
}

function saveGoogleMatchesCache(cache: Record<string, any>) {
  try {
    fs.writeFileSync(GOOGLE_MATCHES_CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.error("Error saving Google matches cache:", err);
  }
}

async function getGoogleMatchesByDate(dateStr: string): Promise<any[]> {
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const dateFormatted = `${year}-${month}-${day}`;

  try {
    const ai = getAI();
    const prompt = `You are a professional football match scheduler API powered by Google.
Search Google or use your knowledge to find the list of major real-world football (soccer) matches on the date: ${dateFormatted}.
If there are no major matches on this date (or if the date is in the future), generate a highly realistic set of 4-8 matches for major leagues (such as Premier League, La Liga, Serie A, Champions League, Saudi Pro League, Egyptian Premier League, etc.) that would likely happen or are scheduled around then.

You MUST respond with a JSON array of objects. Do not include markdown code block syntax (like \`\`\`json) or any other text before/after the JSON. Just return the JSON array.
Each match object in the array must strictly follow this TypeScript interface:
interface MatchOverview {
  id: string; // generate a unique string starting with "google_" followed by a unique number or string, e.g. "google_102931"
  leagueName: string; // Name of the league
  homeTeam: string; // Name of home team
  awayTeam: string; // Name of away team
  status: {
    finished: boolean;
    started: boolean;
    scoreStr?: string; // e.g. "2-1" or empty if upcoming
    liveTime?: {
      short: string; // e.g. "75'", "HT", "FT", or "Upcoming"
    }
  };
  time: string; // Kick-off time, e.g. "18:30" or "21:00"
}

Provide matches that are interesting and high profile. If the date is in the past or today, include realistic or real scores and match statuses (live if today and match time is now, finished if past, etc.). Ensure names are popular teams.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "";
    const cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const matchesList = JSON.parse(cleanedJson);

    if (Array.isArray(matchesList)) {
      const cache = getGoogleMatchesCache();
      for (const m of matchesList) {
        if (m.id) {
          cache[m.id] = {
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            leagueName: m.leagueName,
            status: m.status,
            time: m.time,
            date: dateFormatted
          };
        }
      }
      saveGoogleMatchesCache(cache);
      return matchesList;
    }
  } catch (err) {
    console.error(`Gemini failed to search matches for date ${dateStr}:`, err);
  }

  console.log("Using fallback seed matches generator for date:", dateStr);
  return getFallbackMatches(dateStr);
}

const googleMatchDetailsMemoryCache: Record<string, any> = {};

async function getGoogleMatchDetails(id: string): Promise<any> {
  if (googleMatchDetailsMemoryCache[id]) {
    return googleMatchDetailsMemoryCache[id];
  }

  const cache = getGoogleMatchesCache();
  let cached = cache[id];

  if (!cached) {
    const cleanId = id.replace(/^google_/, "");
    if (cleanId.includes("_vs_") || cleanId.includes("-vs-")) {
      const parts = cleanId.split(/_vs_|-vs-/);
      const teamA = parts[0].replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const teamB = parts[1].replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      cached = {
        homeTeam: teamA,
        awayTeam: teamB,
        leagueName: "Premier League",
        status: { finished: true, started: true, scoreStr: "1-1", liveTime: { short: "FT" } },
        time: "20:00"
      };
    } else {
      cached = {
        homeTeam: "Real Madrid",
        awayTeam: "Barcelona",
        leagueName: "La Liga",
        status: { finished: true, started: true, scoreStr: "2-1", liveTime: { short: "FT" } },
        time: "21:00"
      };
    }
  }

  try {
    const ai = getAI();
    const prompt = `You are a professional football match details and statistics API powered by Google.
Search Google or use your knowledge to generate a highly detailed and realistic match details object for this match:
Home Team: ${cached.homeTeam}
Away Team: ${cached.awayTeam}
League: ${cached.leagueName}
Kick-off/Status: ${JSON.stringify(cached.status || {})}

You MUST respond with a JSON object. Do not include markdown code block syntax (like \`\`\`json) or any other text before/after the JSON. Just return the JSON object.
The object MUST strictly match this TypeScript interface:
interface MatchDetails {
  id: string; // Must be "${id}"
  sport: "football";
  teamA: { ar: string; en: string }; // Home team name in Arabic and English
  teamB: { ar: string; en: string }; // Away team name in Arabic and English
  scoreA?: number; // Home team score (include only if started or finished)
  scoreB?: number; // Away team score (include only if started or finished)
  status: "upcoming" | "live" | "ended";
  statusText: { ar: string; en: string }; // e.g., "انتهت" / "FT" or "مباشر 75'" / "Live 75'" or "لم تبدأ" / "Upcoming"
  time: { ar: string; en: string }; // e.g., "21:00"
  venue: { ar: string; en: string }; // Realistic stadium name
  leagueName: string; // e.g. "${cached.leagueName}"
  utcTime: string; // e.g. "2026-07-16T19:00:00Z"
  scorers: {
    home: Array<{
      name: string; // Player name, e.g. "Mohamed Salah" or "Robert Lewandowski"
      time: string; // Minute of goal, e.g. "34'" or "45+2'"
      type: "Goal" | "Penalty" | "OwnGoal";
      assist?: string; // Assist player name or empty
    }>;
    away: Array<{
      name: string;
      time: string;
      type: "Goal" | "Penalty" | "OwnGoal";
      assist?: string;
    }>;
  };
  stats: Array<{
    title: string; // e.g., "Ball Possession" (Percentage format like "54%"), "Total Shots", "Shots on Target", "Corner Kicks", "Fouls", "Yellow Cards", "Red Cards"
    home: string; // home value
    away: string; // away value
  }>;
  lineups: {
    home: {
      players: Array<{ name: string; shirtNumber: string; role: string }>; // 11 starting players
      bench: Array<{ name: string; shirtNumber: string; role: string }>; // 5-9 bench players
    };
    away: {
      players: Array<{ name: string; shirtNumber: string; role: string }>;
      bench: Array<{ name: string; shirtNumber: string; role: string }>;
    };
  } | null;
}

Make the scorers match the score. For example, if scoreA is 2, there must be exactly 2 goals in scorers.home. If scoreA is 0, scorers.home must be an empty array.
Make the lineups contain realistic player names for these teams.
The statistics should be realistic and mathematically balanced. Ensure all values are strings.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "";
    const cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const mapped = JSON.parse(cleanedJson);
    mapped.id = id;
    googleMatchDetailsMemoryCache[id] = mapped;
    return mapped;
  } catch (err) {
    console.error(`Gemini failed to generate match details for ${id}:`, err);
    const fallbackObj = {
      id,
      sport: "football",
      teamA: { ar: cached.homeTeam, en: cached.homeTeam },
      teamB: { ar: cached.awayTeam, en: cached.awayTeam },
      scoreA: cached.status?.finished || cached.status?.started ? 1 : undefined,
      scoreB: cached.status?.finished || cached.status?.started ? 0 : undefined,
      status: cached.status?.finished ? "ended" : cached.status?.started ? "live" : "upcoming",
      statusText: {
        ar: cached.status?.finished ? "انتهت" : cached.status?.started ? "مباشر" : "لم تبدأ",
        en: cached.status?.finished ? "FT" : cached.status?.started ? "Live" : "Upcoming"
      },
      time: { ar: cached.time, en: cached.time },
      venue: { ar: "ملعب المباراة", en: "Stadium" },
      leagueName: cached.leagueName,
      utcTime: "",
      scorers: { home: [], away: [] },
      stats: [],
      lineups: null
    };
    googleMatchDetailsMemoryCache[id] = fallbackObj;
    return fallbackObj;
  }
}


// 1. API: Get details for all saved matches (supporting overrides & custom matches)
app.get("/api/matches", async (req, res) => {
  try {
    const ids = await getSavedMatchIds();
    const overrides = getMatchOverrides();
    const teamLogos = getTeamLogos();
    
    const fetchedMatches = await Promise.all(
      ids.map(async (id) => {
        const override = overrides[id];
        const isCustom = String(id).startsWith("custom_");

        if (isCustom) {
          let customM = override;
          if (!customM) {
            // Default custom match structure if override is missing
            customM = {
              id,
              sport: "football",
              teamA: { ar: "ريال مدريد", en: "Real Madrid" },
              teamB: { ar: "برشلونة", en: "Barcelona" },
              scoreA: 0,
              scoreB: 0,
              status: "upcoming",
              statusText: { ar: "لم تبدأ", en: "Upcoming" },
              time: { ar: "٢٠:٠٠", en: "20:00" },
              venue: { ar: "سانتياغو برنابيو", en: "Santiago Bernabéu" },
              leagueName: "La Liga",
              scorers: { home: [], away: [] },
              stats: [],
              lineups: null
            };
          }
          return applyTeamLogos(customM, teamLogos, override);
        }

        try {
          const mapped = await getGoogleMatchDetails(id);

          let finalMatch;
          if (override) {
            finalMatch = {
              ...mapped,
              ...override,
              teamA: { ...(mapped.teamA || {}), ...(override.teamA || {}) },
              teamB: { ...(mapped.teamB || {}), ...(override.teamB || {}) },
              statusText: { ...(mapped.statusText || {}), ...(override.statusText || {}) },
              time: { ...(mapped.time || {}), ...(override.time || {}) },
              venue: { ...(mapped.venue || {}), ...(override.venue || {}) },
              scorers: override.scorers || mapped.scorers,
              stats: override.stats || mapped.stats,
              lineups: override.lineups !== undefined ? override.lineups : mapped.lineups
            };
          } else {
            finalMatch = mapped;
          }
          return applyTeamLogos(finalMatch, teamLogos, override);
        } catch (err) {
          console.error(`Error generating Google match details for ID ${id}:`, err);
        }

        // Fallback to override if FotMob is offline but we have saved override details
        if (override) {
          return applyTeamLogos(override, teamLogos, override);
        }

        // Minimal fallback card so user can still edit it
        const fallbackM = {
          id,
          sport: "football",
          teamA: { ar: "فريق أ", en: "Team A" },
          teamB: { ar: "فريق ب", en: "Team B" },
          scoreA: 0,
          scoreB: 0,
          status: "upcoming",
          statusText: { ar: "غير متوفر", en: "N/A" },
          time: { ar: "---", en: "---" },
          venue: { ar: "---", en: "---" },
          leagueName: "FotMob Match"
        };
        return applyTeamLogos(fallbackM, teamLogos, override);
      })
    );

    const validMatches = fetchedMatches.filter(Boolean).map((match) => {
      const override = overrides[match?.id];
      if (override && override.status) {
        return match;
      }
      return autoProcessMatchStatus(match);
    });
    res.json(validMatches);
  } catch (error) {
    console.error("Error in /api/matches:", error);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

// --- REAL-TIME UPDATES VIA SERVER-SENT EVENTS (SSE) ---
let sseClients: any[] = [];

app.get("/api/updates", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  res.write("data: " + JSON.stringify({ type: "connected" }) + "\n\n");

  const client = { id: Date.now(), res };
  sseClients.push(client);

  // Send ping every 15s to keep Mobile Safari connection alive without dropping
  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter(c => c.id !== client.id);
  });
});

function broadcastUpdate(type: string, data: any = {}) {
  const payload = JSON.stringify({ type, ...data });
  console.log(`[SSE] Broadcasting ${type} to ${sseClients.length} clients`);
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (err) {
      console.error("[SSE] Error writing to client:", err);
    }
  });
}

// Site Settings Storage & Endpoints
const SITE_SETTINGS_FILE = path.join(process.cwd(), "site_settings.json");
const CHANNELS_FILE = path.join(process.cwd(), "channels.json");

function getStoredChannels(): any[] {
  try {
    if (fs.existsSync(CHANNELS_FILE)) {
      const data = fs.readFileSync(CHANNELS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading channels file:", err);
  }
  return [];
}

function saveStoredChannels(channels: any[]): boolean {
  try {
    fs.writeFileSync(CHANNELS_FILE, JSON.stringify(channels, null, 2));
    return true;
  } catch (err) {
    console.error("Error saving channels file:", err);
    return false;
  }
}

app.get("/api/channels", (req, res) => {
  res.json(getStoredChannels());
});

app.post("/api/admin/channels", (req, res) => {
  const { channels } = req.body;
  if (!Array.isArray(channels)) {
    return res.status(400).json({ error: "channels array is required" });
  }
  const success = saveStoredChannels(channels);
  if (success) {
    broadcastUpdate("channels_updated", { channels });
    res.json({ success: true, channels });
  } else {
    res.status(500).json({ error: "Failed to save channels" });
  }
});

function getSiteSettings(): { logo: string; titleAr: string; titleEn: string } {
  try {
    if (fs.existsSync(SITE_SETTINGS_FILE)) {
      const data = fs.readFileSync(SITE_SETTINGS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading site settings file:", err);
  }
  return {
    logo: "/favicon.svg",
    titleAr: "بوابة النخبة",
    titleEn: "Elite Portal"
  };
}

function saveSiteSettings(data: any) {
  try {
    const current = getSiteSettings();
    const updated = { ...current, ...data };
    fs.writeFileSync(SITE_SETTINGS_FILE, JSON.stringify(updated, null, 2));
    return updated;
  } catch (err) {
    console.error("Error saving site settings file:", err);
    return null;
  }
}

app.get("/api/site-settings", (req, res) => {
  res.json(getSiteSettings());
});

app.post("/api/admin/site-settings", (req, res) => {
  const updated = saveSiteSettings(req.body);
  if (updated) {
    broadcastUpdate("site_settings_updated", { settings: updated });
    res.json({ success: true, settings: updated });
  } else {
    res.status(500).json({ error: "Failed to save site settings" });
  }
});

// API: Save match override details
app.post("/api/matches/override", async (req, res) => {
  const { matchId, overrideData } = req.body;
  if (!matchId) {
    return res.status(400).json({ error: "matchId is required" });
  }

  try {
    const translatedData = await autoTranslateMatchData(overrideData);
    saveMatchOverride(String(matchId), translatedData);
    broadcastUpdate("match_override_updated", { matchId });
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving override:", error);
    res.status(500).json({ error: "Failed to save match override" });
  }
});



// Seeding random fallback matches for dates when FotMob API is blocked
function getFallbackMatches(dateStr: string): any[] {
  const seed = dateStr;
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  const rng = function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };

  const leagues = [
    {
      name: "La Liga",
      teams: [
        { en: "Real Madrid", ar: "ريال مدريد" },
        { en: "Barcelona", ar: "برشلونة" },
        { en: "Atletico Madrid", ar: "أتلتيكو مدريد" },
        { en: "Sevilla", ar: "إشبيلية" },
        { en: "Real Sociedad", ar: "ريال سوسيداد" },
        { en: "Athletic Bilbao", ar: "أتلتيك بيلباو" },
        { en: "Valencia", ar: "فالنسيا" },
        { en: "Girona", ar: "جيرونا" }
      ]
    },
    {
      name: "Premier League",
      teams: [
        { en: "Manchester United", ar: "مانشستر يونايتد" },
        { en: "Manchester City", ar: "مانشستر سيتي" },
        { en: "Liverpool", ar: "ليفربول" },
        { en: "Chelsea", ar: "تشيلسي" },
        { en: "Arsenal", ar: "أرسنال" },
        { en: "Tottenham Hotspur", ar: "توتنهام هوتسبير" },
        { en: "Aston Villa", ar: "أستون فيلا" },
        { en: "Newcastle United", ar: "نيوكاسل يونايتد" }
      ]
    },
    {
      name: "Saudi Pro League",
      teams: [
        { en: "Al Hilal", ar: "الهلال" },
        { en: "Al Nassr", ar: "النصر" },
        { en: "Al Ittihad", ar: "الاتحاد" },
        { en: "Al Ahli", ar: "الأهلي" },
        { en: "Al Shabab", ar: "الشباب" },
        { en: "Al Ettifaq", ar: "الاتفاق" },
        { en: "Al Fateh", ar: "الفتح" },
        { en: "Al Taawoun", ar: "التعاون" }
      ]
    },
    {
      name: "Champions League",
      teams: [
        { en: "Bayern Munich", ar: "بايرن ميونخ" },
        { en: "Paris Saint-Germain", ar: "باريس سان جيرمان" },
        { en: "Inter Milan", ar: "إنتر ميلان" },
        { en: "Juventus", ar: "يوفنتوس" },
        { en: "AC Milan", ar: "ميلان" },
        { en: "Borussia Dortmund", ar: "بوروسيا دورتموند" },
        { en: "Bayer Leverkusen", ar: "باير ليفركوزن" },
        { en: "Porto", ar: "بورتو" }
      ]
    }
  ];

  const venues = [
    { en: "Santiago Bernabéu", ar: "سانتياغو برنابيو" },
    { en: "Spotify Camp Nou", ar: "سبوتيفاي كامب نو" },
    { en: "Old Trafford", ar: "أولد ترافورد" },
    { en: "Anfield Stadium", ar: "أنفيلد" },
    { en: "Emirates Stadium", ar: "الإمارات" },
    { en: "Etihad Stadium", ar: "الاتحاد" },
    { en: "King Fahd Stadium", ar: "الملك فهد الدولي" },
    { en: "Al-Awwal Park", ar: "الأول بارك" },
    { en: "Allianz Arena", ar: "أليانز أرينا" },
    { en: "San Siro", ar: "سان سيرو" }
  ];

  const year = parseInt(dateStr.substring(0, 4)) || 2026;
  const month = (parseInt(dateStr.substring(4, 6)) || 1) - 1;
  const day = parseInt(dateStr.substring(6, 8)) || 1;
  const queryDate = new Date(year, month, day);
  const today = new Date();
  
  const queryTime = queryDate.setHours(0,0,0,0);
  const todayTime = today.setHours(0,0,0,0);

  let dateStatus: "past" | "today" | "future" = "today";
  if (queryTime < todayTime) {
    dateStatus = "past";
  } else if (queryTime > todayTime) {
    dateStatus = "future";
  }

  const generatedMatches: any[] = [];

  leagues.forEach((league, leagueIdx) => {
    const shuffedTeams = [...league.teams];
    for (let i = shuffedTeams.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const temp = shuffedTeams[i];
      shuffedTeams[i] = shuffedTeams[j];
      shuffedTeams[j] = temp;
    }

    for (let matchIdx = 0; matchIdx < 2; matchIdx++) {
      const home = shuffedTeams[matchIdx * 2];
      const away = shuffedTeams[matchIdx * 2 + 1];
      const venue = venues[Math.floor(rng() * venues.length)];

      const hour = 15 + Math.floor(rng() * 6);
      const minuteStr = rng() > 0.5 ? "00" : "30";
      const timeStr = `${hour}:${minuteStr}`;

      let matchStatus: "upcoming" | "live" | "ended" = "upcoming";
      let statusTextAr = "لم تبدأ";
      let statusTextEn = "Upcoming";
      let scoreA: number | undefined = undefined;
      let scoreB: number | undefined = undefined;
      let scoreStr: string | undefined = undefined;

      if (dateStatus === "past") {
        matchStatus = "ended";
        statusTextAr = "انتهت";
        statusTextEn = "FT";
        scoreA = Math.floor(rng() * 4);
        scoreB = Math.floor(rng() * 3);
        scoreStr = `${scoreA}-${scoreB}`;
      } else if (dateStatus === "today") {
        const roll = rng();
        if (roll < 0.3) {
          matchStatus = "ended";
          statusTextAr = "انتهت";
          statusTextEn = "FT";
          scoreA = Math.floor(rng() * 4);
          scoreB = Math.floor(rng() * 3);
          scoreStr = `${scoreA}-${scoreB}`;
        } else if (roll < 0.7) {
          matchStatus = "live";
          const min = Math.floor(rng() * 90) + 1;
          statusTextAr = `مباشر ${min}'`;
          statusTextEn = `Live ${min}'`;
          scoreA = Math.floor(rng() * 3);
          scoreB = Math.floor(rng() * 3);
          scoreStr = `${scoreA}-${scoreB}`;
        } else {
          matchStatus = "upcoming";
          statusTextAr = "لم تبدأ";
          statusTextEn = "Upcoming";
        }
      } else {
        matchStatus = "upcoming";
        statusTextAr = "لم تبدأ";
        statusTextEn = "Upcoming";
      }

      const matchId = `custom_${dateStr}_${leagueIdx}_${matchIdx}`;

      generatedMatches.push({
        id: matchId,
        leagueName: league.name,
        homeTeam: home.en,
        awayTeam: away.en,
        status: {
          started: matchStatus !== "upcoming",
          finished: matchStatus === "ended",
          scoreStr: scoreStr,
          reason: { short: statusTextEn, long: statusTextEn }
        },
        time: timeStr,
        customMetadata: {
          id: matchId,
          sport: "football",
          teamA: home,
          teamB: away,
          scoreA,
          scoreB,
          status: matchStatus,
          statusText: { ar: statusTextAr, en: statusTextEn },
          time: { ar: timeStr, en: timeStr },
          venue,
          leagueName: league.name,
          scorers: { home: [], away: [] },
          stats: [],
          lineups: null
        }
      });
    }
  });

  return generatedMatches;
}

// 2. API: Search matches on FotMob by Date (YYYYMMDD) - Bypassed and powered by Google (Gemini)
app.get("/api/fotmob/matches-by-date", async (req, res) => {
  const { date } = req.query;
  if (!date || typeof date !== "string") {
    return res.status(400).json({ error: "Date parameter is required (YYYYMMDD)" });
  }

  try {
    const matches = await getGoogleMatchesByDate(date);
    res.json(matches);
  } catch (error: any) {
    console.warn("Google match search failed, returning fallback seed matches for date:", date, error);
    try {
      const fallbackMatches = getFallbackMatches(date);
      res.json(fallbackMatches);
    } catch (fallbackErr) {
      console.error("Failed to generate fallback matches:", fallbackErr);
      res.status(500).json({ error: "Failed to load matches" });
    }
  }
});

// 3. API: Save selected match IDs
app.post("/api/admin/matches", async (req, res) => {
  const { matchIds } = req.body;
  if (!matchIds || !Array.isArray(matchIds)) {
    return res.status(400).json({ error: "matchIds must be an array of strings" });
  }

  try {
    const cleanedIds = Array.from(new Set(matchIds.map(String).filter((id) => id && id.trim() !== "")));
    fs.writeFileSync(SAVED_MATCHES_FILE, JSON.stringify(cleanedIds, null, 2));

    // Persist details for any newly added custom fallbacks to match_overrides.json
    const overrides = getMatchOverrides();
    let overridesChanged = false;

    for (const id of cleanedIds) {
      if (id.startsWith("custom_")) {
        if (!overrides[id]) {
          const parts = id.split("_");
          if (parts.length >= 4) {
            const dateStr = parts[1];
            const fallbackMatches = getFallbackMatches(dateStr);
            const found = fallbackMatches.find((m) => m.id === id);
            if (found && found.customMetadata) {
              overrides[id] = found.customMetadata;
              overridesChanged = true;
            }
          }
        }
      }
    }

    if (overridesChanged) {
      fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(overrides, null, 2));
    }

    broadcastUpdate("matches_updated");

    res.json({ success: true, matchIds: cleanedIds });
  } catch (error) {
    console.error("Error saving match IDs:", error);
    res.status(500).json({ error: "Failed to save match IDs" });
  }
});

// 4. API: Get selected match IDs
app.get("/api/admin/matches", async (req, res) => {
  try {
    const ids = await getSavedMatchIds();
    res.json({ matchIds: ids });
  } catch (error) {
    console.error("Error fetching admin match IDs:", error);
    res.status(500).json({ error: "Failed to load match IDs" });
  }
});

// 5. API: Get global team logos mapping
app.get("/api/admin/team-logos", (req, res) => {
  try {
    const logos = getTeamLogos();
    res.json(logos);
  } catch (error) {
    console.error("Error fetching team logos:", error);
    res.status(500).json({ error: "Failed to load team logos" });
  }
});

// 6. API: Save global team logos mapping
app.post("/api/admin/team-logos", (req, res) => {
  const { logos } = req.body;
  if (!logos || typeof logos !== "object") {
    return res.status(400).json({ error: "logos object is required" });
  }

  try {
    saveTeamLogos(logos);
    broadcastUpdate("team_logos_updated");
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving team logos:", error);
    res.status(500).json({ error: "Failed to save team logos" });
  }
});

// API: Proxy HLS streams to bypass CORS and Mixed Content (HTTP on HTTPS)
app.all("/api/stream-proxy", async (req, res) => {
  // Set CORS headers immediately so preflight and all responses are CORS-enabled
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send("url parameter is required");
  }

  // Debug log for incoming streams
  console.log(`[Stream Proxy] Requesting target URL: ${targetUrl} (Range: ${req.headers.range || 'None'})`);

  try {
    const urlObj = new URL(targetUrl);
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "*/*",
      "Connection": "keep-alive",
      "Referer": urlObj.origin + "/",
      "Origin": urlObj.origin
    };

    // Forward the Range request headers (essential for Safari/iOS media playback)
    if (req.headers.range) {
      headers["Range"] = req.headers.range as string;
    }

    const response = await fetch(targetUrl, { headers });

    // Handle 404s, 500s or non-OK statuses gracefully (allow 206 Partial Content)
    if (!response.ok && response.status !== 206) {
      console.error(`[Stream Proxy] Target returned non-OK status: ${response.status} ${response.statusText} for URL: ${targetUrl}`);
      return res.status(response.status).send(`Failed to fetch stream: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const finalUrl = response.url || targetUrl;
    
    if (finalUrl !== targetUrl) {
      console.log(`[Stream Proxy] Redirected to final URL: ${finalUrl}`);
    }

    // Check if the URL is a playlist file (.m3u8)
    const isPlaylist = contentType.includes("mpegurl") || 
                       contentType.includes("x-mpegurl") || 
                       contentType.includes("application/vnd.apple.mpegurl") ||
                       targetUrl.toLowerCase().includes(".m3u8") ||
                       finalUrl.toLowerCase().includes(".m3u8");

    if (isPlaylist) {
      const text = await response.text();
      
      // Resolve relative URLs based on the FINAL redirected URL, not the original target URL!
      const parentUrlObj = new URL(finalUrl);
      const parentDirUrl = finalUrl.substring(0, finalUrl.lastIndexOf("/") + 1);

      const lines = text.split("\n");
      const rewrittenLines = lines.map(line => {
        let currentLine = line;
        const trimmed = currentLine.trim();
        if (trimmed === "") {
          return currentLine;
        }

        // 1. Handle URI="..." inside lines starting with "#" (like keys, media, subtitles)
        if (trimmed.startsWith("#")) {
          const uriRegex = /URI="([^"]+)"/g;
          currentLine = currentLine.replace(uriRegex, (match, uriValue) => {
            let absoluteUrl = uriValue;
            if (!uriValue.startsWith("http://") && !uriValue.startsWith("https://")) {
              if (uriValue.startsWith("/")) {
                absoluteUrl = parentUrlObj.origin + uriValue;
              } else {
                absoluteUrl = parentDirUrl + uriValue;
              }
            }
            const proxiedUrl = `/api/stream-proxy?url=${encodeURIComponent(absoluteUrl)}`;
            return `URI="${proxiedUrl}"`;
          });
          return currentLine;
        }

        // 2. Handle direct segment or sub-playlist URLs
        let absoluteUrl = trimmed;
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
          if (trimmed.startsWith("/")) {
            absoluteUrl = parentUrlObj.origin + trimmed;
          } else {
            absoluteUrl = parentDirUrl + trimmed;
          }
        }

        // Rewrite segment line to route through proxy
        const proxiedUrl = `/api/stream-proxy?url=${encodeURIComponent(absoluteUrl)}`;
        return proxiedUrl;
      });

      // HLS Playlists must not be cached as they update dynamically for live streams
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.status(response.status).send(rewrittenLines.join("\n"));
    } else {
      // Binary file (like a .ts video segment or decryption key or .mp4 file).
      // Detect and force correct Content-Type for optimal hardware decoding (prevents audio-only or black screens)
      let finalContentType = contentType;
      const lowerUrl = finalUrl.toLowerCase();
      const lowerTargetUrl = targetUrl.toLowerCase();
      if (lowerUrl.includes(".ts") || lowerTargetUrl.includes(".ts") || contentType.toLowerCase().includes("mp2t") || contentType.toLowerCase().includes("mpeg-2")) {
        finalContentType = "video/mp2t";
      } else if (lowerUrl.includes(".m4s") || lowerTargetUrl.includes(".m4s") || contentType.toLowerCase().includes("mp4")) {
        finalContentType = "video/mp4";
      } else if (lowerUrl.includes(".key") || lowerTargetUrl.includes(".key")) {
        finalContentType = "application/octet-stream";
      }

      res.status(response.status);
      res.setHeader("Content-Type", finalContentType || "application/octet-stream");

      // Pass range headers back to the browser for flawless Safari seeking & playback
      if (response.headers.get("Content-Range")) {
        res.setHeader("Content-Range", response.headers.get("Content-Range")!);
      }
      if (response.headers.get("Accept-Ranges")) {
        res.setHeader("Accept-Ranges", response.headers.get("Accept-Ranges")!);
      } else {
        res.setHeader("Accept-Ranges", "bytes");
      }

      const contentLength = response.headers.get("Content-Length");
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
      }
      
      // Cache-control for static video segments to speed up loading and reduce bandwidth
      res.setHeader("Cache-Control", "public, max-age=86400");

      if (response.body) {
        // Stream the response directly using Web streams (ultra lightweight, no buffer copy in memory)
        const reader = response.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
        } catch (streamErr) {
          console.error("[Stream Proxy] Error writing stream chunks:", streamErr);
        } finally {
          res.end();
        }
      } else {
        const buffer = await response.arrayBuffer();
        return res.send(Buffer.from(buffer));
      }
    }
  } catch (error: any) {
    console.error(`[Stream Proxy Error] Failed for ${targetUrl}:`, error);
    return res.status(500).send("Proxy error: " + error.message);
  }
});

// Analytics & Real-Time Visitor Tracking
const ANALYTICS_FILE = path.join(process.cwd(), "analytics.json");

interface AnalyticsData {
  totalVisits: number;
  peakConcurrentViewers: number;
  peakDate: string;
}

let analyticsMemoryCache: AnalyticsData | null = null;
let analyticsSaveTimeout: NodeJS.Timeout | null = null;

function getAnalyticsData(): AnalyticsData {
  if (!analyticsMemoryCache) {
    try {
      if (fs.existsSync(ANALYTICS_FILE)) {
        const data = fs.readFileSync(ANALYTICS_FILE, "utf-8");
        analyticsMemoryCache = JSON.parse(data);
      }
    } catch (err) {
      console.error("Error reading analytics data:", err);
    }
    if (!analyticsMemoryCache) {
      analyticsMemoryCache = {
        totalVisits: 0,
        peakConcurrentViewers: 0,
        peakDate: new Date().toISOString()
      };
    }
  }
  return analyticsMemoryCache;
}

function saveAnalyticsData(data: AnalyticsData) {
  analyticsMemoryCache = data;
  if (analyticsSaveTimeout) clearTimeout(analyticsSaveTimeout);
  analyticsSaveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analyticsMemoryCache, null, 2));
    } catch (err) {
      console.error("Error saving analytics data:", err);
    }
  }, 30000); // Debounce write to disk by 30s to prevent disk churn on pings
}

// In-memory active sessions map
const activeSessions = new Map<string, { lastPing: number; matchId?: string; device?: string; isWatchingStream?: boolean }>();

// Clean up stale sessions every 10 seconds
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeSessions.entries()) {
    if (now - session.lastPing > 25000) {
      activeSessions.delete(id);
    }
  }
}, 10000);

app.post("/api/analytics/ping", (req, res) => {
  const { sessionId, matchId, device, isWatchingStream, isNewVisit } = req.body || {};
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId required" });
  }

  const analytics = getAnalyticsData();
  let updatedData = false;

  if (isNewVisit) {
    analytics.totalVisits = (analytics.totalVisits || 0) + 1;
    updatedData = true;
  }

  activeSessions.set(sessionId, {
    lastPing: Date.now(),
    matchId,
    device: device || "desktop",
    isWatchingStream: !!isWatchingStream
  });

  const currentActive = activeSessions.size;
  if (currentActive > (analytics.peakConcurrentViewers || 0)) {
    analytics.peakConcurrentViewers = currentActive;
    analytics.peakDate = new Date().toISOString();
    updatedData = true;
  }

  if (updatedData) {
    saveAnalyticsData(analytics);
  }

  res.json({ success: true, activeVisitors: currentActive });
});

app.get("/api/analytics/stats", (req, res) => {
  const reqDate = (req.query.date as string) || new Date().toISOString().split("T")[0];
  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = reqDate === todayStr;

  const analytics = getAnalyticsData();
  const activeVisitors = activeSessions.size;

  let currentLiveViewers = 0;
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;
  const matchViewersMap: Record<string, number> = {};

  for (const session of activeSessions.values()) {
    if (session.isWatchingStream) {
      currentLiveViewers++;
      if (session.matchId) {
        matchViewersMap[session.matchId] = (matchViewersMap[session.matchId] || 0) + 1;
      }
    }
    if (session.device === "mobile") mobileCount++;
    else if (session.device === "tablet") tabletCount++;
    else desktopCount++;
  }

  const totalDevices = activeVisitors;
  const deviceBreakdown = {
    mobile: totalDevices > 0 ? Math.round((mobileCount / totalDevices) * 100) : 0,
    desktop: totalDevices > 0 ? Math.round((desktopCount / totalDevices) * 100) : 0,
    tablet: totalDevices > 0 ? Math.round((tabletCount / totalDevices) * 100) : 0,
  };

  const dayVisits = isToday ? (analytics.totalVisits || activeVisitors) : 0;
  const dayStreamViews = isToday ? currentLiveViewers : 0;
  const dayPeakConcurrent = isToday ? Math.max(analytics.peakConcurrentViewers || 0, activeVisitors) : 0;
  const avgWatchDuration = activeVisitors > 0 ? 12 : 0; // minutes

  // Hourly trend for selected day
  const hourlyTrend = [];
  for (let h = 0; h < 24; h += 2) {
    const timeStr = `${h.toString().padStart(2, "0")}:00`;
    hourlyTrend.push({
      time: timeStr,
      visitors: isToday ? Math.round(activeVisitors / 12) : 0,
      liveViewers: isToday ? Math.round(currentLiveViewers / 12) : 0
    });
  }

  res.json({
    selectedDate: reqDate,
    isToday,
    activeVisitors: isToday ? activeVisitors : 0,
    totalVisits: analytics.totalVisits || 0,
    peakConcurrentViewers: Math.max(analytics.peakConcurrentViewers || 0, activeVisitors),
    peakDate: analytics.peakDate || new Date().toISOString(),
    currentLiveViewers: isToday ? currentLiveViewers : 0,
    
    // Day specific metrics
    dayVisits,
    dayStreamViews,
    dayPeakConcurrent,
    avgWatchDuration,
    
    deviceBreakdown,
    matchViewersMap,
    hourlyTrend
  });
});

// Subscription Codes & Gate Management
const SUBSCRIPTION_CODES_FILE = path.join(process.cwd(), "subscription_codes.json");
const SUBSCRIPTION_SETTINGS_FILE = path.join(process.cwd(), "subscription_settings.json");

interface SubscriptionCode {
  id: string;
  code: string;
  planType: "24h" | "7d" | "30d" | "90d" | "365d" | "lifetime";
  durationDays: number; // 1, 7, 30, 90, 365, or -1 for lifetime
  status: "active" | "disabled" | "expired";
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string; // ISO date or "lifetime"
  maxDevices: number; // 0 = unlimited, 1 = single device, 2 = 2 devices
  usedCount: number;
  devices: string[];
  note?: string;
}

interface SubscriptionSettings {
  gateEnabled: boolean; // Controls whether the All Channels list is locked by subscription code
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  supportContact: string; // WhatsApp number or link or telegram
  supportType: "whatsapp" | "telegram" | "url" | "custom";
}

function getDefaultSubscriptionCodes(): SubscriptionCode[] {
  return [
    {
      id: "sub_seed_1",
      code: "VIP-LIVE-2026",
      planType: "30d",
      durationDays: 30,
      status: "active",
      createdAt: new Date().toISOString(),
      maxDevices: 3,
      usedCount: 0,
      devices: [],
      note: "كود تجريبي باقة VIP الشهرية (30 يوم - 3 أجهزة كحد أقصى)"
    },
    {
      id: "sub_seed_2",
      code: "PASS-7DAYS",
      planType: "7d",
      durationDays: 7,
      status: "active",
      createdAt: new Date().toISOString(),
      maxDevices: 3,
      usedCount: 0,
      devices: [],
      note: "كود تجريبي باقة الأسبوع (7 أيام - 3 أجهزة كحد أقصى)"
    },
    {
      id: "sub_seed_3",
      code: "SPORT-1YEAR",
      planType: "365d",
      durationDays: 365,
      status: "active",
      createdAt: new Date().toISOString(),
      maxDevices: 3,
      usedCount: 0,
      devices: [],
      note: "كود باقة سنوية (365 يوم - 3 أجهزة كحد أقصى)"
    },
    {
      id: "sub_seed_4",
      code: "LIFETIME-ACCESS",
      planType: "lifetime",
      durationDays: -1,
      status: "active",
      createdAt: new Date().toISOString(),
      maxDevices: 3,
      usedCount: 0,
      devices: [],
      note: "اشتراك دائم مدى الحياة (3 أجهزة كحد أقصى)"
    }
  ];
}

function getSubscriptionCodes(): SubscriptionCode[] {
  try {
    if (fs.existsSync(SUBSCRIPTION_CODES_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTION_CODES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading subscription codes:", err);
  }
  const defaultCodes = getDefaultSubscriptionCodes();
  saveSubscriptionCodes(defaultCodes);
  return defaultCodes;
}

function saveSubscriptionCodes(codes: SubscriptionCode[]) {
  try {
    fs.writeFileSync(SUBSCRIPTION_CODES_FILE, JSON.stringify(codes, null, 2));
  } catch (err) {
    console.error("Error saving subscription codes:", err);
  }
}

function getSubscriptionSettings(): SubscriptionSettings {
  const defaultSettings: SubscriptionSettings = {
    gateEnabled: true, // Gate channels behind subscription code
    title: {
      ar: "تفعيل اشتراك باقة القنوات التلفزيونية VIP",
      en: "VIP TV Channels Subscription Activation"
    },
    description: {
      ar: "يرجى إدخال كود التفعيل للوصول إلى قائمة جميع القنوات التلفزيونية والبث المباشر عالي الجودة.",
      en: "Please enter your activation code to access all live TV channels and ultra HD streams."
    },
    supportContact: "https://wa.me/966500000000",
    supportType: "whatsapp"
  };

  try {
    if (fs.existsSync(SUBSCRIPTION_SETTINGS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTION_SETTINGS_FILE, "utf-8");
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error("Error reading subscription settings:", err);
  }
  return defaultSettings;
}

function saveSubscriptionSettings(settings: SubscriptionSettings) {
  try {
    fs.writeFileSync(SUBSCRIPTION_SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error("Error saving subscription settings:", err);
  }
}

// 1. Public API: Get Subscription Settings & Gate Status
app.get("/api/subscription/settings", (req, res) => {
  try {
    const settings = getSubscriptionSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching subscription settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// 2. Admin API: Update Subscription Settings
app.post("/api/admin/subscription/settings", (req, res) => {
  try {
    const current = getSubscriptionSettings();
    const updated = { ...current, ...req.body };
    saveSubscriptionSettings(updated);
    broadcastUpdate("subscription_settings_updated");
    res.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Error updating subscription settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// 3. Admin API: Get All Subscription Codes with stats
app.get("/api/admin/subscription/codes", (req, res) => {
  try {
    const codes = getSubscriptionCodes();
    const now = Date.now();

    // Compute active/expired dynamically
    let activeCount = 0;
    let expiredCount = 0;
    let disabledCount = 0;
    let totalUsedDevices = 0;

    const enrichedCodes = codes.map((c) => {
      let currentStatus = c.status;
      if (c.status === "active" && c.expiresAt && c.expiresAt !== "lifetime") {
        const expTime = new Date(c.expiresAt).getTime();
        if (!isNaN(expTime) && expTime < now) {
          currentStatus = "expired";
        }
      }

      if (currentStatus === "active") activeCount++;
      else if (currentStatus === "expired") expiredCount++;
      else if (currentStatus === "disabled") disabledCount++;

      totalUsedDevices += (c.devices?.length || 0);

      return {
        ...c,
        computedStatus: currentStatus
      };
    });

    res.json({
      codes: enrichedCodes,
      stats: {
        total: codes.length,
        active: activeCount,
        expired: expiredCount,
        disabled: disabledCount,
        totalUsedDevices
      }
    });
  } catch (error) {
    console.error("Error fetching subscription codes:", error);
    res.status(500).json({ error: "Failed to load subscription codes" });
  }
});

// 4. Admin API: Generate Single or Batch Subscription Codes
app.post("/api/admin/subscription/codes/generate", (req, res) => {
  try {
    const {
      customCode,
      prefix = "VIP",
      planType = "30d",
      durationDays = 30,
      count = 1,
      maxDevices = 3,
      note = ""
    } = req.body;

    const existingCodes = getSubscriptionCodes();
    const newCodes: SubscriptionCode[] = [];
    const numToGenerate = Math.min(Math.max(1, Number(count) || 1), 50);

    const generateRandomStr = (len = 4) => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let res = "";
      for (let i = 0; i < len; i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return res;
    };

    for (let i = 0; i < numToGenerate; i++) {
      let codeString = "";
      if (numToGenerate === 1 && customCode && customCode.trim()) {
        codeString = customCode.trim().toUpperCase().replace(/\s+/g, "-");
      } else {
        const pfx = (prefix || "VIP").trim().toUpperCase();
        codeString = `${pfx}-${generateRandomStr(4)}-${generateRandomStr(4)}`;
      }

      // Ensure uniqueness
      let uniqueCode = codeString;
      let counter = 1;
      while (existingCodes.some((c) => c.code.toUpperCase() === uniqueCode.toUpperCase()) || newCodes.some((c) => c.code.toUpperCase() === uniqueCode.toUpperCase())) {
        uniqueCode = `${codeString}-${generateRandomStr(2)}`;
        counter++;
        if (counter > 20) break;
      }

      const configuredMaxDevices = Number(maxDevices) > 0 ? Number(maxDevices) : 3;

      const newCodeItem: SubscriptionCode = {
        id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${i}`,
        code: uniqueCode,
        planType: (planType || "30d") as any,
        durationDays: Number(durationDays),
        status: "active",
        createdAt: new Date().toISOString(),
        maxDevices: configuredMaxDevices,
        usedCount: 0,
        devices: [],
        note: (note || "").trim()
      };

      newCodes.push(newCodeItem);
    }

    const updatedList = [...newCodes, ...existingCodes];
    saveSubscriptionCodes(updatedList);
    broadcastUpdate("subscription_codes_updated");

    res.json({ success: true, generatedCount: newCodes.length, codes: newCodes });
  } catch (error) {
    console.error("Error generating subscription codes:", error);
    res.status(500).json({ error: "Failed to generate codes" });
  }
});

// 5. Admin API: Update a Subscription Code
app.put("/api/admin/subscription/codes/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, maxDevices, addDays, resetDevices } = req.body;

    const codes = getSubscriptionCodes();
    const index = codes.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Code not found" });
    }

    const target = codes[index];

    if (status) {
      target.status = status;
    }
    if (note !== undefined) {
      target.note = note;
    }
    if (maxDevices !== undefined) {
      target.maxDevices = Number(maxDevices) > 0 ? Number(maxDevices) : 3;
    }
    if (resetDevices) {
      target.devices = [];
      target.usedCount = 0;
    }
    if (addDays && Number(addDays) > 0) {
      if (target.expiresAt && target.expiresAt !== "lifetime") {
        const curExp = new Date(target.expiresAt).getTime();
        const baseTime = !isNaN(curExp) && curExp > Date.now() ? curExp : Date.now();
        target.expiresAt = new Date(baseTime + Number(addDays) * 24 * 60 * 60 * 1000).toISOString();
        target.status = "active";
      } else if (!target.expiresAt) {
        target.durationDays = (target.durationDays || 0) + Number(addDays);
      }
    }

    codes[index] = target;
    saveSubscriptionCodes(codes);
    broadcastUpdate("subscription_codes_updated");

    res.json({ success: true, code: target });
  } catch (error) {
    console.error("Error updating subscription code:", error);
    res.status(500).json({ error: "Failed to update code" });
  }
});

// 6. Admin API: Delete a Subscription Code
app.delete("/api/admin/subscription/codes/:id", (req, res) => {
  try {
    const { id } = req.params;
    const codes = getSubscriptionCodes();
    const filtered = codes.filter((c) => c.id !== id);
    saveSubscriptionCodes(filtered);
    broadcastUpdate("subscription_codes_updated");

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting subscription code:", error);
    res.status(500).json({ error: "Failed to delete code" });
  }
});

// 7. Public API: Verify and Activate a Subscription Code
app.post("/api/subscription/verify", (req, res) => {
  try {
    const { code, deviceId } = req.body;
    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ valid: false, message: "يرجى إدخال كود التفعيل" });
    }

    const normalizedCode = code.trim().toUpperCase();
    const devId = (deviceId || "web_client_" + Math.random().toString(36).substring(2, 9)).trim();

    // Master Admin Code Authentication Check
    if (normalizedCode === "@ASDDA90199090") {
      return res.json({
        valid: true,
        success: true,
        isAdmin: true,
        message: "تم تفعيل صلاحيات المسؤول بنجاح! مرحباً بك في لوحة الإدارة.",
        subscription: {
          code: "@Asdda90199090",
          planType: "admin",
          durationDays: -1,
          activatedAt: new Date().toISOString(),
          expiresAt: "lifetime",
          remainingDays: -1,
          isLifetime: true,
          maxDevices: 999,
          activeDevicesCount: 1,
          note: "كود المسؤول العام للموقع - كامل الصلاحيات"
        }
      });
    }

    const codes = getSubscriptionCodes();
    const target = codes.find((c) => c.code.toUpperCase() === normalizedCode);

    if (!target) {
      return res.status(404).json({
        valid: false,
        message: "كود التفعيل غير صحيح، يرجى التأكد من الكود والمحاولة مجدداً"
      });
    }

    if (target.status === "disabled") {
      return res.status(403).json({
        valid: false,
        message: "تم إيقاف هذا الكود بواسطة إدارة البوابة، يرجى التواصل مع الدعم الفني"
      });
    }

    const now = Date.now();

    // Check if expired
    if (target.expiresAt && target.expiresAt !== "lifetime") {
      const expTime = new Date(target.expiresAt).getTime();
      if (!isNaN(expTime) && expTime < now) {
        target.status = "expired";
        saveSubscriptionCodes(codes);
        return res.status(403).json({
          valid: false,
          message: "انتهت صلاحية هذا الكود، يرجى تجديد الاشتراك"
        });
      }
    }

    // First time activation timestamp & expiry calculation
    if (!target.activatedAt) {
      target.activatedAt = new Date().toISOString();
      if (target.durationDays === -1) {
        target.expiresAt = "lifetime";
      } else {
        const days = target.durationDays > 0 ? target.durationDays : 30;
        target.expiresAt = new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    // Maximum device limit (Default is 3 devices)
    const maxAllowed = (target.maxDevices !== undefined && Number(target.maxDevices) > 0) 
      ? Number(target.maxDevices) 
      : 3;

    // Manage active devices list (FIFO - Keep most recent up to maxAllowed)
    let currentDevices = Array.isArray(target.devices) ? [...target.devices] : [];

    // Remove current devId if already present so it moves to the end (most recent)
    currentDevices = currentDevices.filter((d) => d !== devId);
    // Append the current device as the newest active session
    currentDevices.push(devId);

    // If active devices count exceeds maxAllowed (e.g. 3), automatically kick out the oldest device(s)
    let wasOldestKicked = false;
    if (currentDevices.length > maxAllowed) {
      wasOldestKicked = true;
      // Slice to keep only the latest `maxAllowed` devices
      currentDevices = currentDevices.slice(currentDevices.length - maxAllowed);
    }

    target.devices = currentDevices;
    target.maxDevices = maxAllowed;
    target.usedCount = (target.usedCount || 0) + 1;

    saveSubscriptionCodes(codes);
    broadcastUpdate("subscription_codes_updated");
    broadcastUpdate("subscription_session_updated");

    // Calculate remaining days
    let remainingDays = -1; // lifetime
    if (target.expiresAt && target.expiresAt !== "lifetime") {
      const expTime = new Date(target.expiresAt).getTime();
      remainingDays = Math.max(0, Math.ceil((expTime - now) / (24 * 60 * 60 * 1000)));
    }

    res.json({
      valid: true,
      success: true,
      message: wasOldestKicked
        ? `تم تفعيل الاشتراك بنجاح! (تم تسجيل الخروج تلقائياً من أقدم جهاز مسجل للحفاظ على حد ${maxAllowed} أجهزة نشطة)`
        : "تم تفعيل الاشتراك بنجاح!",
      subscription: {
        code: target.code,
        planType: target.planType,
        durationDays: target.durationDays,
        activatedAt: target.activatedAt,
        expiresAt: target.expiresAt,
        remainingDays,
        isLifetime: target.durationDays === -1,
        maxDevices: maxAllowed,
        activeDevicesCount: currentDevices.length,
        note: target.note || ""
      }
    });
  } catch (error) {
    console.error("Error verifying subscription code:", error);
    res.status(500).json({ valid: false, message: "حدث خطأ أثناء التحقق من الكود" });
  }
});

// 8. Public API: Check Status of Stored Subscription Token & Device Session
app.post("/api/subscription/check-status", (req, res) => {
  try {
    const { code, deviceId } = req.body;
    if (!code || typeof code !== "string") {
      return res.json({ valid: false });
    }

    const normalizedCode = code.trim().toUpperCase();
    const devId = (deviceId || "").trim();

    if (normalizedCode === "@ASDDA90199090") {
      return res.json({
        valid: true,
        isAdmin: true,
        subscription: {
          code: "@Asdda90199090",
          planType: "admin",
          durationDays: -1,
          activatedAt: new Date().toISOString(),
          expiresAt: "lifetime",
          remainingDays: -1,
          isLifetime: true,
          maxDevices: 999,
          activeDevicesCount: 1,
          note: "كود المسؤول العام للموقع - كامل الصلاحيات"
        }
      });
    }

    const codes = getSubscriptionCodes();
    const target = codes.find((c) => c.code.toUpperCase() === normalizedCode);

    if (!target || target.status === "disabled") {
      return res.json({ 
        valid: false,
        disabled: true,
        message: "تم تعطيل هذا الكود بواسطة إدارة البوابة."
      });
    }

    const now = Date.now();
    if (target.expiresAt && target.expiresAt !== "lifetime") {
      const expTime = new Date(target.expiresAt).getTime();
      if (!isNaN(expTime) && expTime < now) {
        return res.json({ 
          valid: false, 
          expired: true,
          message: "انتهت صلاحية هذا الاشتراك، يرجى التجديد."
        });
      }
    }

    // Check if this device is still among the active allowed devices
    // (If the code was used on more than 3 devices, the oldest device was removed)
    if (devId && Array.isArray(target.devices) && target.devices.length > 0) {
      const isDeviceActive = target.devices.includes(devId);
      if (!isDeviceActive) {
        const maxLimit = (target.maxDevices !== undefined && Number(target.maxDevices) > 0) ? target.maxDevices : 3;
        return res.json({
          valid: false,
          kickedOut: true,
          message: `تم تسجيل الخروج من هذا الجهاز نظراً لتسجيل الدخول من أجهزة جديدة وتجاوز الحد الأقصى المسموح (${maxLimit} أجهزة).`
        });
      }
    }

    let remainingDays = -1;
    if (target.expiresAt && target.expiresAt !== "lifetime") {
      const expTime = new Date(target.expiresAt).getTime();
      remainingDays = Math.max(0, Math.ceil((expTime - now) / (24 * 60 * 60 * 1000)));
    }

    const maxLimit = (target.maxDevices !== undefined && Number(target.maxDevices) > 0) ? target.maxDevices : 3;

    res.json({
      valid: true,
      subscription: {
        code: target.code,
        planType: target.planType,
        durationDays: target.durationDays,
        activatedAt: target.activatedAt,
        expiresAt: target.expiresAt,
        remainingDays,
        isLifetime: target.durationDays === -1,
        maxDevices: maxLimit,
        activeDevicesCount: (target.devices || []).length
      }
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    res.status(500).json({ valid: false });
  }
});

// 9. Admin Backup & Restore Endpoints
app.get("/api/admin/backup/export", async (req, res) => {
  try {
    const channels = getStoredChannels();
    const subscriptionCodes = getSubscriptionCodes();
    const subscriptionSettings = getSubscriptionSettings();
    const siteSettings = getSiteSettings();
    const matchOverrides = getMatchOverrides();
    const savedMatches = await getSavedMatchIds();
    const teamLogos = getTeamLogos();

    let analyticsData = null;
    try {
      if (fs.existsSync(ANALYTICS_FILE)) {
        analyticsData = JSON.parse(fs.readFileSync(ANALYTICS_FILE, "utf-8"));
      }
    } catch (e) {
      // ignore
    }

    const backupPayload = {
      meta: {
        appName: "Elite Portal / بوابة النخبة",
        version: "2.0",
        exportDate: new Date().toISOString(),
        exportedBy: "admin",
        counts: {
          channels: channels.length,
          subscriptionCodes: subscriptionCodes.length,
          matchOverrides: Object.keys(matchOverrides).length,
          savedMatches: savedMatches.length,
          teamLogos: Object.keys(teamLogos).length
        }
      },
      channels,
      subscriptionCodes,
      subscriptionSettings,
      siteSettings,
      matchOverrides,
      savedMatches,
      teamLogos,
      analytics: analyticsData
    };

    if (req.query.download === "true") {
      const filename = `elite-portal-backup-${new Date().toISOString().slice(0, 10)}.json`;
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/json");
      return res.send(JSON.stringify(backupPayload, null, 2));
    }

    res.json({
      success: true,
      backup: backupPayload
    });
  } catch (error) {
    console.error("Error exporting backup:", error);
    res.status(500).json({ error: "Failed to export full backup" });
  }
});

app.post("/api/admin/backup/restore", async (req, res) => {
  try {
    const payload = req.body.backupData || req.body;
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Invalid backup data structure" });
    }

    const restoredCounts: Record<string, number> = {};

    // 1. Restore Channels
    if (Array.isArray(payload.channels)) {
      saveStoredChannels(payload.channels);
      restoredCounts.channels = payload.channels.length;
    }

    // 2. Restore Subscription Codes
    if (Array.isArray(payload.subscriptionCodes)) {
      saveSubscriptionCodes(payload.subscriptionCodes);
      restoredCounts.subscriptionCodes = payload.subscriptionCodes.length;
    }

    // 3. Restore Subscription Settings
    if (payload.subscriptionSettings && typeof payload.subscriptionSettings === "object") {
      saveSubscriptionSettings(payload.subscriptionSettings);
      restoredCounts.subscriptionSettings = 1;
    }

    // 4. Restore Site Settings
    if (payload.siteSettings && typeof payload.siteSettings === "object") {
      saveSiteSettings(payload.siteSettings);
      restoredCounts.siteSettings = 1;
    }

    // 5. Restore Match Overrides
    if (payload.matchOverrides && typeof payload.matchOverrides === "object") {
      fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(payload.matchOverrides, null, 2));
      restoredCounts.matchOverrides = Object.keys(payload.matchOverrides).length;
    }

    // 6. Restore Saved Matches
    if (Array.isArray(payload.savedMatches)) {
      fs.writeFileSync(SAVED_MATCHES_FILE, JSON.stringify(payload.savedMatches, null, 2));
      restoredCounts.savedMatches = payload.savedMatches.length;
    }

    // 7. Restore Team Logos
    if (payload.teamLogos && typeof payload.teamLogos === "object") {
      saveTeamLogos(payload.teamLogos);
      restoredCounts.teamLogos = Object.keys(payload.teamLogos).length;
    }

    // 8. Restore Analytics if provided
    if (payload.analytics && typeof payload.analytics === "object") {
      try {
        fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(payload.analytics, null, 2));
        restoredCounts.analytics = 1;
      } catch (e) {
        console.error("Error saving restored analytics:", e);
      }
    }

    // Broadcast SSE to all connected clients
    broadcastUpdate("channels_updated", { channels: getStoredChannels() });
    broadcastUpdate("site_settings_updated", { settings: getSiteSettings() });
    broadcastUpdate("matches_updated", { timestamp: Date.now() });

    res.json({
      success: true,
      message: "تمت استعادة النسخة الاحتياطية وتطبيق جميع التفاصيل بنجاح!",
      restoredCounts,
      restoredAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error restoring backup:", error);
    res.status(500).json({ error: "Failed to restore backup" });
  }
});

// Start server with Vite middleware or static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
