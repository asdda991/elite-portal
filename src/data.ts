export type Language = "ar" | "en";
export type Theme = "black" | "white";

export interface TranslationSet {
  sports: string;
  cinema: string;
  language: string;
  theme: string;
  black: string;
  white: string;
  sportsTitle: string;
  cinemaTitle: string;
  sportsDesc: string;
  cinemaDesc: string;
  liveScores: string;
  matchSchedule: string;
  trendingMovies: string;
  showtimes: string;
  stadium: string;
  time: string;
  genre: string;
  rating: string;
  duration: string;
  searchPlaceholderSports: string;
  searchPlaceholderCinema: string;
  noResults: string;
  category: string;
  all: string;
  football: string;
  basketball: string;
  tennis: string;
  formula1: string;
  action: string;
  drama: string;
  scifi: string;
  thriller: string;
  ticketBooking: string;
  bookNow: string;
  selectSeat: string;
  seatSelected: string;
  seatAvailable: string;
  seatReserved: string;
  bookingSuccess: string;
  ticketPrice: string;
  total: string;
  currency: string;
  close: string;
  upcoming: string;
  live: string;
  ended: string;
  bookingFor: string;
  selectedSeats: string;
}

export const translations: Record<Language, TranslationSet> = {
  ar: {
    sports: "الرياضة",
    cinema: "السينما",
    language: "اللغة",
    theme: "اللون",
    black: "أسود",
    white: "أبيض",
    sportsTitle: "المنصة الرياضية",
    cinemaTitle: "منصة السينما والأفلام",
    sportsDesc: "تابع أحدث الفعاليات والنتائج الرياضية في العالم بلمسة واحدة.",
    cinemaDesc: "اكتشف أحدث العروض في دور السينما العالمية وأوقات عرضها.",
    liveScores: "النتائج المباشرة",
    matchSchedule: "جدول الفعاليات",
    trendingMovies: "أفلام معروضة حالياً",
    showtimes: "أوقات العرض",
    stadium: "الموقع/الملعب",
    time: "الوقت",
    genre: "التصنيف",
    rating: "التقييم",
    duration: "المدة",
    searchPlaceholderSports: "ابحث عن رياضة، فريق أو حدث...",
    searchPlaceholderCinema: "ابحث عن فيلم أو تصنيف...",
    noResults: "لا توجد نتائج مطابقة لبحثك",
    category: "الفئة",
    all: "الكل",
    football: "كرة القدم",
    basketball: "كرة السلة",
    tennis: "التنس",
    formula1: "فورمولا 1",
    action: "حركة",
    drama: "دراما",
    scifi: "خيال علمي",
    thriller: "تشويق",
    ticketBooking: "حجز التذاكر",
    bookNow: "احجز مقعدك الآن",
    selectSeat: "اختر مقعدك المفضل من المخطط أدناه",
    seatSelected: "محدد",
    seatAvailable: "متاح",
    seatReserved: "محجوز",
    bookingSuccess: "تهانينا! تم حجز التذاكر بنجاح.",
    ticketPrice: "سعر التذكرة",
    total: "الإجمالي",
    currency: "ريال",
    close: "إغلاق",
    upcoming: "قريباً",
    live: "مباشر الآن",
    ended: "انتهت",
    bookingFor: "حجز لفيلم",
    selectedSeats: "المقاعد المختارة"
  },
  en: {
    sports: "Sports",
    cinema: "Cinema",
    language: "Language",
    theme: "Color",
    black: "Black",
    white: "White",
    sportsTitle: "Sports Arena",
    cinemaTitle: "Cinema Hub",
    sportsDesc: "Follow the latest dynamic events and live highlights from around the globe.",
    cinemaDesc: "Explore cutting-edge cinematic releases and immersive theatre showtimes.",
    liveScores: "Live Highlights",
    matchSchedule: "Event Schedule",
    trendingMovies: "Now Playing",
    showtimes: "Showtimes",
    stadium: "Venue/Stadium",
    time: "Time",
    genre: "Genre",
    rating: "Rating",
    duration: "Duration",
    searchPlaceholderSports: "Search sport, team or event...",
    searchPlaceholderCinema: "Search movies or genres...",
    noResults: "No events match your criteria",
    category: "Category",
    all: "All",
    football: "Football",
    basketball: "Basketball",
    tennis: "Tennis",
    formula1: "Formula 1",
    action: "Action",
    drama: "Drama",
    scifi: "Sci-Fi",
    thriller: "Thriller",
    ticketBooking: "Ticket Booking",
    bookNow: "Book Your Seats Now",
    selectSeat: "Select your preferred seats from the layout below",
    seatSelected: "Selected",
    seatAvailable: "Available",
    seatReserved: "Reserved",
    bookingSuccess: "Congratulations! Your tickets have been reserved.",
    ticketPrice: "Ticket Price",
    total: "Total",
    currency: "SAR",
    close: "Close",
    upcoming: "Upcoming",
    live: "Live Now",
    ended: "Finished",
    bookingFor: "Booking for",
    selectedSeats: "Selected Seats"
  }
};

export interface Match {
  id: string;
  sport: "football" | "basketball" | "tennis" | "formula1";
  teamA: { ar: string; en: string };
  teamB: { ar: string; en: string };
  scoreA?: number | string;
  scoreB?: number | string;
  status: "live" | "upcoming" | "ended";
  statusText?: { ar: string; en: string };
  time: { ar: string; en: string };
  utcTime?: string;
  venue: { ar: string; en: string };
  logoA?: string;
  logoB?: string;
  streams?: any[];
  scorers?: any;
  stats?: any[];
  lineups?: any;
}

export const sportsMatches: Match[] = [
  {
    id: "s1",
    sport: "football",
    teamA: { ar: "ريال مدريد", en: "Real Madrid" },
    teamB: { ar: "برشلونة", en: "Barcelona" },
    scoreA: 2,
    scoreB: 1,
    status: "live",
    statusText: { ar: "الشوط الثاني '74", en: "2nd Half '74" },
    time: { ar: "اليوم، 21:00", en: "Today, 21:00" },
    utcTime: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    venue: { ar: "ملعب سانتياغو برنابيو", en: "Santiago Bernabéu" }
  },
  {
    id: "s2",
    sport: "basketball",
    teamA: { ar: "لوس أنجلوس ليكرز", en: "LA Lakers" },
    teamB: { ar: "غولدن ستيت واريورز", en: "Golden State Warriors" },
    status: "upcoming",
    time: { ar: "غداً، 04:30", en: "Tomorrow, 04:30" },
    utcTime: new Date(Date.now() + 3600000 * 20).toISOString(),
    venue: { ar: "صالة كريبتو كوم", en: "Crypto.com Arena" }
  },
  {
    id: "s3",
    sport: "tennis",
    teamA: { ar: "نوفاك دجوكوفيتش", en: "Novak Djokovic" },
    teamB: { ar: "كارلوس ألكاراز", en: "Carlos Alcaraz" },
    scoreA: 3,
    scoreB: 2,
    status: "ended",
    time: { ar: "أمس", en: "Yesterday" },
    utcTime: new Date(Date.now() - 3600000 * 28).toISOString(),
    venue: { ar: "الملعب الرئيسي، ويمبلدون", en: "Wimbledon Centre Court" }
  },
  {
    id: "s4",
    sport: "formula1",
    teamA: { ar: "سباق موناكو الكبرى", en: "Monaco Grand Prix" },
    teamB: { ar: "التصفيات التأهيلية", en: "Qualifying Session" },
    status: "upcoming",
    time: { ar: "الأحد، 15:00", en: "Sunday, 15:00" },
    utcTime: new Date(Date.now() + 3600000 * 50).toISOString(),
    venue: { ar: "حلبة مونت كارلو", en: "Circuit de Monaco" }
  },
  {
    id: "s5",
    sport: "football",
    teamA: { ar: "ليفربول", en: "Liverpool" },
    teamB: { ar: "مانشستر سيتي", en: "Manchester City" },
    status: "upcoming",
    time: { ar: "السبت، 18:30", en: "Saturday, 18:30" },
    utcTime: new Date(Date.now() + 3600000 * 42).toISOString(),
    venue: { ar: "ملعب أنفيلد", en: "Anfield Stadium" }
  }
];

export interface Movie {
  id: string;
  title: { ar: string; en: string };
  genre: "action" | "drama" | "scifi" | "thriller";
  genreText: { ar: string; en: string };
  rating: string;
  duration: { ar: string; en: string };
  description: { ar: string; en: string };
  showtimes: string[];
  price: number;
  banner: string;
}

export const cinemaMovies: Movie[] = [
  {
    id: "m1",
    title: { ar: "كثبان: الجزء الثاني", en: "Dune: Part Two" },
    genre: "scifi",
    genreText: { ar: "خيال علمي / مغامرة", en: "Sci-Fi / Adventure" },
    rating: "8.9",
    duration: { ar: "١٦٦ دقيقة", en: "166 mins" },
    description: {
      ar: "يتحد بول أتريدس مع شاني والفريمن في رحلة انتقامية ضد المتآمرين الذين دمروا عائلته، محاولاً منع مستقبل مرعب يراه وحده.",
      en: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family."
    },
    showtimes: ["13:00", "16:30", "20:00", "23:15"],
    price: 55,
    banner: "bg-radial from-amber-950/40 to-transparent"
  },
  {
    id: "m2",
    title: { ar: "فارس الظلام", en: "The Dark Knight" },
    genre: "action",
    genreText: { ar: "أكشن / جريمة", en: "Action / Crime" },
    rating: "9.0",
    duration: { ar: "١٥٢ دقيقة", en: "152 mins" },
    description: {
      ar: "عندما يظهر الجوكر ليعيث الفساد والفوضى في غوثام، يخوض باتمان أحد أعظم الاختبارات النفسية والجسدية لمكافحة الظلم.",
      en: "When the menace known as the Joker wreaks havoc and chaos on Gotham, Batman must accept one of the greatest psychological and physical tests."
    },
    showtimes: ["14:30", "18:00", "21:30"],
    price: 45,
    banner: "bg-radial from-slate-900/40 to-transparent"
  },
  {
    id: "m3",
    title: { ar: "أوبنهايمر", en: "Oppenheimer" },
    genre: "drama",
    genreText: { ar: "سيرة ذاتية / دراما", en: "Biography / Drama" },
    rating: "8.6",
    duration: { ar: "١٨٠ دقيقة", en: "180 mins" },
    description: {
      ar: "قصة العالم الفيزيائي جيه روبرت أوبنهايمر ودوره القيادي في مشروع مانهاتن لتطوير القنبلة الذرية التي غيرت العالم.",
      en: "The story of American physicist J. Robert Oppenheimer and his role in the Manhattan Project leading to the atomic bomb."
    },
    showtimes: ["12:00", "15:45", "19:30"],
    price: 60,
    banner: "bg-radial from-orange-950/40 to-transparent"
  },
  {
    id: "m4",
    title: { ar: "بين النجوم", en: "Interstellar" },
    genre: "scifi",
    genreText: { ar: "خيال علمي / مغامرة", en: "Sci-Fi / Adventure" },
    rating: "8.7",
    duration: { ar: "١٦٩ دقيقة", en: "169 mins" },
    description: {
      ar: "مجموعة من رواد الفضاء والمستكشفين يسافرون عبر ثقب دودي في الفضاء بحثاً عن كوكب بديل لضمان بقاء البشرية.",
      en: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival on a new home."
    },
    showtimes: ["15:00", "19:00", "22:45"],
    price: 50,
    banner: "bg-radial from-blue-950/40 to-transparent"
  }
];
