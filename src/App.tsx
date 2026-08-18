import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Trophy, 
  Film, 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Ticket, 
  X, 
  Lock,
  Activity, 
  Home,
  Tv, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Languages, 
  Sun, 
  Moon, 
  Check, 
  Sparkles,
  Play,
  Share2,
  Settings,
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  Shield,
  Pencil,
  Image,
  Upload,
  Link,
  Copy,
  Send,
  Volume2,
  VolumeX,
  Eye,
  HelpCircle,
  Headphones,
  Mail,
  Maximize2,
  Minimize2,
  BarChart3,
  Users,
  TrendingUp,
  Zap,
  Smartphone,
  Monitor,
  Tablet,
  Radio,
  KeyRound,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Power,
  BadgeCheck,
  LogOut,
  Globe,
  Crown,
  Download,
  HardDrive,
  FileJson,
  FileUp,
  Database,
  History,
  CheckCheck,
  FolderArchive,
  ArrowDownToLine,
  ArrowUpFromLine,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Language, 
  Theme, 
  translations, 
  sportsMatches, 
  cinemaMovies, 
  Match, 
  Movie,
  Channel,
  ChannelStream,
  tvChannels
} from "./data";

import HlsVideoPlayer from "./components/HlsVideoPlayer";

const isStreamVideoOrHls = (url: string, type: string) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    type === "video" ||
    lowerUrl.includes(".m3u8") ||
    lowerUrl.includes(".mp4") ||
    lowerUrl.includes("/live/") ||
    lowerUrl.includes(".mkv") ||
    lowerUrl.includes(".webm")
  );
};

const PRESET_LOGOS = [
  { name: { ar: "ريال مدريد", en: "Real Madrid" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png" },
  { name: { ar: "برشلونة", en: "Barcelona" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png" },
  { name: { ar: "مانشستر سيتي", en: "Man City" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png" },
  { name: { ar: "مانشستر يونايتد", en: "Man United" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png" },
  { name: { ar: "أرسنال", en: "Arsenal" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png" },
  { name: { ar: "ليفربول", en: "Liverpool" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png" },
  { name: { ar: "بايرن ميونخ", en: "Bayern Munich" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png" },
  { name: { ar: "باريس سان جيرمان", en: "PSG" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png" },
  { name: { ar: "يوفنتوس", en: "Juventus" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9885.png" },
  { name: { ar: "ميلان", en: "AC Milan" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8564.png" },
  { name: { ar: "الهلال", en: "Al Hilal" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9831.png" },
  { name: { ar: "النصر", en: "Al Nassr" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9827.png" },
  { name: { ar: "الاتحاد", en: "Al Ittihad" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9829.png" },
  { name: { ar: "الأهلي", en: "Al Ahly" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10216.png" },
  { name: { ar: "الزمالك", en: "Zamalek" }, logo: "https://images.fotmob.com/image_resources/logo/teamlogo/211516.png" }
];

const PRESET_STREAMS = [
  {
    name: { ar: "beIN Sports 1 HD (بث تجريبي MP4)", en: "beIN Sports 1 HD (Demo MP4)" },
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    type: "video" as const
  },
  {
    name: { ar: "قناة SSC الرياضية (بث تجريبي ملعب)", en: "SSC Sports (Stadium Demo MP4)" },
    url: "https://assets.mixkit.co/videos/preview/mixkit-soccer-player-kicking-a-ball-in-the-stadium-2314-large.mp4",
    type: "video" as const
  },
  {
    name: { ar: "بث مباشر يوتيوب (تغطية المباريات العالمية)", en: "YouTube Live Match Coverage (Demo Embed)" },
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    type: "iframe" as const
  },
  {
    name: { ar: "بث تجريبي لقناة الكأس (فيديو MP4)", en: "Al Kass Channel (Demo MP4)" },
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    type: "video" as const
  }
];

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  // If it's a full iframe tag
  if (trimmed.startsWith("<iframe")) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
  }
  
  // YouTube URLs
  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
    if (trimmed.includes("watch?v=")) {
      const parts = trimmed.split("v=");
      if (parts.length > 1) {
        const id = parts[1].split("&")[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
    }
    if (trimmed.includes("youtu.be/")) {
      const parts = trimmed.split("youtu.be/");
      if (parts.length > 1) {
        const id = parts[1].split("?")[0];
        return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
    }
    if (trimmed.includes("youtube.com/embed/")) {
      return trimmed;
    }
  }
  
  return trimmed;
};

export default function App() {
  // Auto-detect browser default language (Arabic if 'ar*', English if 'en*', default fallback 'ar')
  const getInitialLanguage = (): Language => {
    try {
      const saved = localStorage.getItem("el_portal_lang");
      if (saved === "ar" || saved === "en") {
        return saved as Language;
      }
      const navLang = (navigator.language || (navigator.languages && navigator.languages[0]) || "").toLowerCase();
      if (navLang.startsWith("ar")) {
        return "ar";
      }
      if (navLang.startsWith("en")) {
        return "en";
      }
    } catch (e) {
      // ignore
    }
    return "ar";
  };

  // Auto-detect browser/system color scheme (white if light mode preferred, black if dark mode)
  const getInitialTheme = (): Theme => {
    try {
      const saved = localStorage.getItem("el_portal_theme");
      if (saved === "black" || saved === "white") {
        return saved as Theme;
      }
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "white";
      }
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "black";
      }
    } catch (e) {
      // ignore
    }
    return "black";
  };

  // State for language
  const [lang, setLang] = useState<Language>(getInitialLanguage);
  
  // State for theme
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Sync document element attributes with active language
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  // Listen to browser/system color scheme changes if user hasn't explicitly set a preference in localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("el_portal_theme");
      if (savedTheme) return; // Respect explicit user override

      const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
      const handleChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? "white" : "black");
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
      } else if ((mediaQuery as any).addListener) {
        (mediaQuery as any).addListener(handleChange);
        return () => (mediaQuery as any).removeListener(handleChange);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem("el_portal_lang", newLang);
    } catch (e) {
      console.warn("localStorage not accessible:", e);
    }
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("el_portal_theme", newTheme);
    } catch (e) {
      console.warn("localStorage not accessible:", e);
    }
  };
  
  // Active section inside the middle ("sports", "cinema", or "channels")
  const [activeTab, setActiveTab] = useState<"sports" | "cinema" | "channels">("sports");
  
  // Filters and search states
  const [sportsSearch, setSportsSearch] = useState("");
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>("all");
  const [selectedTimePeriodFilter, setSelectedTimePeriodFilter] = useState<"all" | "today" | "tomorrow" | "yesterday" | "live">("all");
  
  const [cinemaSearch, setCinemaSearch] = useState("");
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>("all");

  // Channels state
  const [channelsSearch, setChannelsSearch] = useState("");
  const [selectedChannelCategory, setSelectedChannelCategory] = useState<string>("all");
  const [selectedPlayingChannel, setSelectedPlayingChannel] = useState<Channel | null>(null);
  const [channelServerIndex, setChannelServerIndex] = useState<number>(0);
  const [channelWindowMode, setChannelWindowMode] = useState<"inline" | "fullscreen">("inline");
  const [customChannels, setCustomChannels] = useState<Channel[]>(() => {
    try {
      const saved = localStorage.getItem("el_portal_custom_channels");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const channelPlayerRef = useRef<HTMLDivElement>(null);

  // Admin Channels Management state
  const [adminEditingChannel, setAdminEditingChannel] = useState<Channel | null>(null);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isSavingChannels, setIsSavingChannels] = useState(false);
  const [channelFormData, setChannelFormData] = useState({
    id: "",
    nameAr: "",
    nameEn: "",
    category: "sports" as "sports" | "cinema" | "news" | "general" | "documentary" | "kids",
    categoryNameAr: "رياضية",
    categoryNameEn: "Sports",
    logo: "",
    quality: "FHD" as "4K" | "FHD" | "HD" | "SD",
    countryAr: "",
    countryEn: "",
    currentProgramAr: "",
    currentProgramEn: "",
    streams: [
      { nameAr: "سيرفر 1 (رئيسي)", nameEn: "Server 1 (Main)", url: "", type: "video" as "video" | "iframe", quality: "1080p" }
    ]
  });

  // Admin Quick Match Stream Selector
  const [adminSelectedMatchForStream, setAdminSelectedMatchForStream] = useState<string>("");
  const [adminMatchStreamUrl, setAdminMatchStreamUrl] = useState("");
  const [adminMatchStreamType, setAdminMatchStreamType] = useState<"video" | "iframe">("video");
  const [adminMatchAdditionalStreams, setAdminMatchAdditionalStreams] = useState<{ name: string; url: string; type: "video" | "iframe" }[]>([]);
  const [isSavingMatchStream, setIsSavingMatchStream] = useState(false);

  const handlePlayChannel = (ch: Channel, srvIndex = 0) => {
    if (!isAuthorizedForChannels) {
      setIsSubscriptionModalOpen(true);
      return;
    }
    setSelectedPlayingChannel(ch);
    setChannelServerIndex(srvIndex);
    if (channelPlayerRef.current) {
      channelPlayerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Booking simulator state
  const [selectedMovieForBooking, setSelectedMovieForBooking] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingCompleted, setBookingCompleted] = useState(false);

  // Real-time matches state from server
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [selectedMatchForDetails, setSelectedMatchForDetails] = useState<any | null>(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState<"events" | "stats" | "lineup">("events");

  // Site Logo & Settings State
  const [siteLogo, setSiteLogo] = useState<string>(() => {
    try {
      return localStorage.getItem("el_portal_site_logo") || "";
    } catch (e) {
      return "";
    }
  });
  const [isSavingLogo, setIsSavingLogo] = useState(false);

  // Admin control panel states
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminMatchIds, setAdminMatchIds] = useState<string[]>([]);
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [searchDate, setSearchDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [searchedFotmobMatches, setSearchedFotmobMatches] = useState<any[]>([]);
  const [isSearchingFotmob, setIsSearchingFotmob] = useState(false);
  const [manualMatchId, setManualMatchId] = useState("");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminMessage, setAdminMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // States for Editing/Overriding Matches
  const [editingMatch, setEditingMatch] = useState<any | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editTab, setEditTab] = useState<"basic" | "details" | "streams" | "scorers" | "stats">("basic");
  const [logoSelectorFor, setLogoSelectorFor] = useState<"A" | "B" | null>(null);

  // Live Stream Player state
  const [userRole, setUserRole] = useState<"viewer" | "admin">(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("el_portal_user_role");
        if (saved === "admin") return "admin";
      }
    } catch (e) {}
    return "viewer";
  });
  const [streamingMatch, setStreamingMatch] = useState<any | null>(null);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [streamType, setStreamType] = useState<"video" | "iframe">("iframe");
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeStreamIndex, setActiveStreamIndex] = useState<number>(0);
  const [editingStreams, setEditingStreams] = useState<{ name: string; url: string; type: "video" | "iframe" }[]>([]);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Responsive device state & Mobile / Tablet detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [isTablet, setIsTablet] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [cinemaWindowMode, setCinemaWindowMode] = useState<"inline" | "fullscreen">("inline");

  // Reset full screen mode when switching away from cinema or channels tab
  useEffect(() => {
    if (activeTab !== "cinema" && cinemaWindowMode === "fullscreen") {
      setCinemaWindowMode("inline");
    }
    if (activeTab !== "channels" && channelWindowMode === "fullscreen") {
      setChannelWindowMode("inline");
    }
  }, [activeTab, cinemaWindowMode, channelWindowMode]);

  // Analytics & Subscription Dashboard States
  const [adminModalTab, setAdminModalTab] = useState<"controls" | "streams" | "channels" | "subscriptions" | "analytics" | "backup">("controls");

  // Backup & Restore Management States
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [backupRestoreMode, setBackupRestoreMode] = useState<"file" | "paste">("file");
  const [backupPasteText, setBackupPasteText] = useState("");
  const [parsedBackupData, setParsedBackupData] = useState<any | null>(null);
  const [backupParseError, setBackupParseError] = useState<string | null>(null);
  const [isBackupJsonPreviewOpen, setIsBackupJsonPreviewOpen] = useState(false);
  const [liveBackupJsonStr, setLiveBackupJsonStr] = useState<string>("");
  const [isCopiedBackupJson, setIsCopiedBackupJson] = useState(false);
  const [quickSnapshotStatus, setQuickSnapshotStatus] = useState<string | null>(null);
  const [backupSummaryData, setBackupSummaryData] = useState<any | null>(null);

  // Subscription Gate & Codes Management States
  const [subscriptionData, setSubscriptionData] = useState<{
    code: string;
    planType: string;
    durationDays: number;
    activatedAt?: string;
    expiresAt?: string;
    remainingDays?: number;
    isLifetime?: boolean;
    note?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem("el_portal_subscription");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [subscriptionSettings, setSubscriptionSettings] = useState<{
    gateEnabled: boolean;
    title: { ar: string; en: string };
    description: { ar: string; en: string };
    supportContact: string;
    supportType: "whatsapp" | "telegram" | "url" | "custom";
  }>({
    gateEnabled: true,
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
  });

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isSubscriptionDetailsOpen, setIsSubscriptionDetailsOpen] = useState(false);
  const [isConfirmingLogoutSubscription, setIsConfirmingLogoutSubscription] = useState(false);
  const [activationCodeInput, setActivationCodeInput] = useState("");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);

  // Admin Subscription Management state
  const [adminSubscriptionCodes, setAdminSubscriptionCodes] = useState<any[]>([]);
  const [deletingCodeId, setDeletingCodeId] = useState<string | null>(null);
  const [adminSubscriptionStats, setAdminSubscriptionStats] = useState<{
    total: number;
    active: number;
    expired: number;
    disabled: number;
    totalUsedDevices: number;
  }>({ total: 0, active: 0, expired: 0, disabled: 0, totalUsedDevices: 0 });
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [adminCodeFilter, setAdminCodeFilter] = useState<"all" | "active" | "expired" | "disabled">("all");
  const [adminCodeSearch, setAdminCodeSearch] = useState("");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isSavingGateSetting, setIsSavingGateSetting] = useState(false);
  const [supportContactEdit, setSupportContactEdit] = useState("");
  const [codeGenForm, setCodeGenForm] = useState({
    customCode: "",
    prefix: "VIP",
    planType: "30d" as "24h" | "7d" | "30d" | "90d" | "365d" | "lifetime",
    durationDays: 30,
    count: 1,
    maxDevices: 1,
    note: ""
  });

  const getDeviceId = () => {
    try {
      let id = localStorage.getItem("el_portal_device_id");
      if (!id) {
        id = "dev_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
        localStorage.setItem("el_portal_device_id", id);
      }
      return id;
    } catch (e) {
      return "dev_guest";
    }
  };

  const isAuthorizedForChannels = useMemo(() => {
    if (userRole === "admin") return true;
    if (!subscriptionSettings?.gateEnabled) return true;
    if (!subscriptionData) return false;
    if (subscriptionData.isLifetime) return true;
    if (subscriptionData.expiresAt) {
      const exp = new Date(subscriptionData.expiresAt).getTime();
      if (!isNaN(exp) && exp > Date.now()) {
        return true;
      }
      return false;
    }
    return true;
  }, [userRole, subscriptionSettings?.gateEnabled, subscriptionData]);

  const fetchSubscriptionSettings = async () => {
    try {
      const res = await fetch("/api/subscription/settings");
      if (res.ok) {
        const data = await res.json();
        setSubscriptionSettings(data);
        if (data.supportContact) {
          setSupportContactEdit(data.supportContact);
        }
      }
    } catch (err) {
      console.error("Error fetching subscription settings:", err);
    }
  };

  const fetchSubscriptionCodes = async () => {
    setIsLoadingCodes(true);
    try {
      const res = await fetch("/api/admin/subscription/codes");
      if (res.ok) {
        const data = await res.json();
        setAdminSubscriptionCodes(data.codes || []);
        if (data.stats) {
          setAdminSubscriptionStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching subscription codes:", err);
    } finally {
      setIsLoadingCodes(false);
    }
  };

  // Check stored subscription token validity on mount
  useEffect(() => {
    fetchSubscriptionSettings();
    if (subscriptionData?.code) {
      const checkStoredSubscription = async () => {
        try {
          const res = await fetch("/api/subscription/check-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: subscriptionData.code, deviceId: getDeviceId() })
          });
          const data = await res.json();
          if (data.valid && data.subscription) {
            setSubscriptionData(data.subscription);
            localStorage.setItem("el_portal_subscription", JSON.stringify(data.subscription));
          } else if (data.expired || !data.valid) {
            setSubscriptionData(null);
            localStorage.removeItem("el_portal_subscription");
          }
        } catch (e) {
          // ignore
        }
      };
      checkStoredSubscription();
    }
  }, []);

  // When switching to channels tab, prompt subscription gate modal if not authorized
  useEffect(() => {
    if (activeTab === "channels" && subscriptionSettings?.gateEnabled && userRole !== "admin" && !isAuthorizedForChannels) {
      setIsSubscriptionModalOpen(true);
    }
  }, [activeTab, subscriptionSettings?.gateEnabled, userRole, isAuthorizedForChannels]);

  const handleVerifyActivationCode = async (customInputCode?: string) => {
    const rawCode = (customInputCode || activationCodeInput).trim();
    const codeToVerify = rawCode.toUpperCase();
    if (!codeToVerify) {
      setActivationError(lang === "ar" ? "يرجى كتابة كود التفعيل" : "Please enter activation code");
      return;
    }

    // Direct check for Master Admin Access Code
    if (codeToVerify === "@ASDDA90199090" || rawCode === "@Asdda90199090") {
      setIsVerifyingCode(true);
      setActivationError(null);
      setActivationSuccess(null);

      const adminSub = {
        code: "@Asdda90199090",
        planType: "admin",
        durationDays: -1,
        activatedAt: new Date().toISOString(),
        expiresAt: "lifetime",
        remainingDays: -1,
        isLifetime: true,
        maxDevices: 999,
        activeDevicesCount: 1,
        note: "حساب المسؤول العام - كامل الصلاحيات"
      };

      setUserRole("admin");
      try {
        localStorage.setItem("el_portal_user_role", "admin");
        localStorage.setItem("el_portal_subscription", JSON.stringify(adminSub));
      } catch (e) {
        console.error(e);
      }
      setSubscriptionData(adminSub);
      setActivationSuccess(lang === "ar" ? "تم تسجيل الدخول كمسؤول بنجاح! جاري فتح لوحة التحكم..." : "Master Admin Logged in Successfully! Opening panel...");

      setTimeout(() => {
        setIsSubscriptionModalOpen(false);
        setActivationSuccess(null);
        setActivationCodeInput("");
        setIsVerifyingCode(false);
        setIsAdminOpen(true);
        setAdminModalTab("controls");
        loadAdminMatchIds();
      }, 900);
      return;
    }

    setIsVerifyingCode(true);
    setActivationError(null);
    setActivationSuccess(null);

    try {
      const devId = getDeviceId();
      const res = await fetch("/api/subscription/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToVerify, deviceId: devId })
      });
      const data = await res.json();
      if (data.valid && data.subscription) {
        if (data.isAdmin || codeToVerify === "@ASDDA90199090") {
          setUserRole("admin");
          try {
            localStorage.setItem("el_portal_user_role", "admin");
          } catch (e) {}
        }
        setSubscriptionData(data.subscription);
        try {
          localStorage.setItem("el_portal_subscription", JSON.stringify(data.subscription));
        } catch (e) {
          console.error(e);
        }
        setActivationSuccess(data.message || (lang === "ar" ? "تم تفعيل الاشتراك بنجاح! مرحباً بك" : "Subscription activated successfully!"));
        setTimeout(() => {
          setIsSubscriptionModalOpen(false);
          setActivationSuccess(null);
          setActivationCodeInput("");
          if (data.isAdmin || codeToVerify === "@ASDDA90199090") {
            setIsAdminOpen(true);
            setAdminModalTab("controls");
            loadAdminMatchIds();
          }
        }, 1200);
      } else {
        setActivationError(data.message || (lang === "ar" ? "كود التفعيل غير صالح أو منتهي الصلاحية" : "Invalid or expired activation code"));
      }
    } catch (err) {
      console.error("Error verifying code:", err);
      setActivationError(lang === "ar" ? "تعذر الاتصال بالخادم للتحقق من الكود" : "Server connection error");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleLogoutSubscription = () => {
    try {
      localStorage.removeItem("el_portal_subscription");
    } catch (e) {
      console.error(e);
    }
    setSubscriptionData(null);
    setActivationCodeInput("");
    setActivationSuccess(null);
    setActivationError(null);
    setIsSubscriptionDetailsOpen(false);
    setIsConfirmingLogoutSubscription(false);
    setSelectedPlayingChannel(null);
  };

  const handleGenerateCodes = async () => {
    setIsGeneratingCodes(true);
    try {
      const res = await fetch("/api/admin/subscription/codes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(codeGenForm)
      });
      const data = await res.json();
      if (data.success) {
        setAdminMessage({
          text: lang === "ar" ? `تم بنجاح توليد (${data.generatedCount}) كود اشتراك جديد` : `Successfully generated ${data.generatedCount} new code(s)`,
          type: "success"
        });
        setCodeGenForm({
          customCode: "",
          prefix: "VIP",
          planType: "30d",
          durationDays: 30,
          count: 1,
          maxDevices: 1,
          note: ""
        });
        fetchSubscriptionCodes();
      } else {
        setAdminMessage({
          text: lang === "ar" ? "فشل توليد الأكواد" : "Failed to generate codes",
          type: "error"
        });
      }
    } catch (e) {
      setAdminMessage({
        text: lang === "ar" ? "حدث خطأ أثناء الاتصال بالخادم" : "Error connecting to server",
        type: "error"
      });
    } finally {
      setIsGeneratingCodes(false);
      setTimeout(() => setAdminMessage(null), 4000);
    }
  };

  const handleUpdateCode = async (id: string, payload: any) => {
    try {
      const res = await fetch(`/api/admin/subscription/codes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchSubscriptionCodes();
        setAdminMessage({
          text: lang === "ar" ? "تم تحديث الكود بنجاح" : "Code updated successfully",
          type: "success"
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setAdminMessage(null), 3000);
    }
  };

  const handleDeleteCode = async (id: string) => {
    try {
      setAdminSubscriptionCodes((prev) => prev.filter((c) => c.id !== id));
      const res = await fetch(`/api/admin/subscription/codes/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchSubscriptionCodes();
        setAdminMessage({
          text: lang === "ar" ? "تم حذف الكود بنجاح" : "Code deleted successfully",
          type: "success"
        });
      }
    } catch (e) {
      console.error(e);
      fetchSubscriptionCodes();
    } finally {
      setDeletingCodeId(null);
      setTimeout(() => setAdminMessage(null), 3000);
    }
  };

  const handleToggleGate = async () => {
    const newState = !subscriptionSettings.gateEnabled;
    setIsSavingGateSetting(true);
    try {
      const res = await fetch("/api/admin/subscription/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateEnabled: newState })
      });
      if (res.ok) {
        setSubscriptionSettings((prev) => ({ ...prev, gateEnabled: newState }));
        setAdminMessage({
          text: newState 
            ? (lang === "ar" ? "تم تفعيل قفل جدول المباريات بكود التفعيل" : "Match subscription gate enabled")
            : (lang === "ar" ? "تم تعطيل قفل المباريات (الوصول متاح للجميع)" : "Match subscription gate disabled (Open to all)"),
          type: "success"
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingGateSetting(false);
      setTimeout(() => setAdminMessage(null), 4000);
    }
  };

  const handleSaveSupportContact = async () => {
    try {
      const res = await fetch("/api/admin/subscription/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supportContact: supportContactEdit })
      });
      if (res.ok) {
        setSubscriptionSettings((prev) => ({ ...prev, supportContact: supportContactEdit }));
        setAdminMessage({
          text: lang === "ar" ? "تم حفظ رابط/رقم التواصل بنجاح" : "Support contact updated successfully",
          type: "success"
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setAdminMessage(null), 3000);
    }
  };

  const handleCopyCode = (codeStr: string, id: string) => {
    try {
      navigator.clipboard.writeText(codeStr);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyAllFilteredCodes = (codesList: any[]) => {
    try {
      const textToCopy = codesList
        .map((c) => `${c.code} | ${c.planType} | ${c.status === "active" ? "فعال" : c.status} | ${c.note || "بدون ملاحظة"}`)
        .join("\n");
      navigator.clipboard.writeText(textToCopy);
      setAdminMessage({
        text: lang === "ar" ? `تم نسخ (${codesList.length}) كود إلى الحافظة` : `Copied ${codesList.length} code(s) to clipboard`,
        type: "success"
      });
      setTimeout(() => setAdminMessage(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Backup & Restore Actions
  const fetchLiveBackupData = async () => {
    try {
      setIsExportingBackup(true);
      const res = await fetch("/api/admin/backup/export");
      if (res.ok) {
        const data = await res.json();
        setBackupSummaryData(data.backup || data);
        const jsonFormatted = JSON.stringify(data.backup || data, null, 2);
        setLiveBackupJsonStr(jsonFormatted);
        return data.backup || data;
      }
    } catch (err) {
      console.error("Error fetching live backup:", err);
    } finally {
      setIsExportingBackup(false);
    }
    return null;
  };

  const handleDownloadFullBackup = async () => {
    setIsExportingBackup(true);
    try {
      const backupData = await fetchLiveBackupData();
      if (!backupData) throw new Error("Failed to load backup data");
      
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `elite-portal-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setAdminMessage({
        text: lang === "ar" ? "تم سحب وتحميل النسخة الاحتياطية بنجاح بصيغة JSON" : "Full backup exported and downloaded successfully",
        type: "success"
      });
    } catch (e) {
      console.error(e);
      setAdminMessage({
        text: lang === "ar" ? "حدث خطأ أثناء سحب النسخة الاحتياطية" : "Error exporting backup",
        type: "error"
      });
    } finally {
      setIsExportingBackup(false);
      setTimeout(() => setAdminMessage(null), 4000);
    }
  };

  const handleCopyBackupToClipboard = async () => {
    setIsExportingBackup(true);
    try {
      const backupData = await fetchLiveBackupData();
      if (!backupData) throw new Error("Failed to load backup data");

      const jsonStr = JSON.stringify(backupData, null, 2);
      await navigator.clipboard.writeText(jsonStr);
      setIsCopiedBackupJson(true);
      setTimeout(() => setIsCopiedBackupJson(false), 3000);

      setAdminMessage({
        text: lang === "ar" ? "تم نسخ كود النسخة الاحتياطية بالكامل إلى الحافظة" : "Full backup JSON copied to clipboard",
        type: "success"
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingBackup(false);
      setTimeout(() => setAdminMessage(null), 4000);
    }
  };

  const handleFileSelectForRestore = (file: File) => {
    setBackupParseError(null);
    setParsedBackupData(null);
    if (!file.name.endsWith(".json") && file.type !== "application/json" && file.type !== "text/plain") {
      setBackupParseError(lang === "ar" ? "يرجى اختيار ملف بصيغة JSON فقط" : "Please select a JSON file only");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const dataObj = parsed.backup || parsed;
        if (!dataObj || typeof dataObj !== "object") {
          throw new Error("Invalid backup format");
        }
        setParsedBackupData(dataObj);
        setBackupParseError(null);
      } catch (err: any) {
        setBackupParseError(lang === "ar" ? "تعذر قراءة ملف النسخة الاحتياطية. تأكد من صحة تنسيق JSON." : "Invalid JSON backup file structure");
      }
    };
    reader.readAsText(file);
  };

  const handleParsePastedJson = (text: string) => {
    setBackupPasteText(text);
    if (!text.trim()) {
      setParsedBackupData(null);
      setBackupParseError(null);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      const dataObj = parsed.backup || parsed;
      if (!dataObj || typeof dataObj !== "object") {
        throw new Error("Invalid backup format");
      }
      setParsedBackupData(dataObj);
      setBackupParseError(null);
    } catch (e) {
      setParsedBackupData(null);
      setBackupParseError(lang === "ar" ? "نص الـ JSON غير صالح، يرجى التأكد من لصق كود صحيح" : "Invalid JSON text");
    }
  };

  const handleExecuteRestore = async (overrideData?: any) => {
    const dataToRestore = overrideData || parsedBackupData;
    if (!dataToRestore) return;
    setIsRestoringBackup(true);
    try {
      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupData: dataToRestore })
      });
      if (res.ok) {
        await Promise.all([
          fetchChannels(),
          fetchSubscriptionCodes(),
          fetchSubscriptionSettings(),
          fetchSiteSettings(),
          fetchMatches()
        ]);
        setParsedBackupData(null);
        setBackupPasteText("");
        setAdminMessage({
          text: lang === "ar" ? "تمت استعادة جميع تفاصيل وبيانات الموقع بنجاح!" : "All site details restored successfully!",
          type: "success"
        });
      } else {
        throw new Error("Restore failed");
      }
    } catch (err) {
      console.error(err);
      setAdminMessage({
        text: lang === "ar" ? "حدث خطأ أثناء استعادة النسخة الاحتياطية" : "Error restoring backup",
        type: "error"
      });
    } finally {
      setIsRestoringBackup(false);
      setTimeout(() => setAdminMessage(null), 4000);
    }
  };

  const handleQuickLocalSnapshot = async () => {
    try {
      const backupData = await fetchLiveBackupData();
      if (backupData) {
        localStorage.setItem("el_portal_local_snapshot", JSON.stringify({
          timestamp: new Date().toISOString(),
          data: backupData
        }));
        setQuickSnapshotStatus(lang === "ar" ? "تم حفظ لقطة أمان سريعة بنجاح" : "Quick safety snapshot saved locally");
        setTimeout(() => setQuickSnapshotStatus(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestoreQuickLocalSnapshot = async () => {
    try {
      const saved = localStorage.getItem("el_portal_local_snapshot");
      if (!saved) {
        setAdminMessage({
          text: lang === "ar" ? "لا توجد لقطة سريعة محفوظة مسبقاً في هذا المتصفح" : "No saved local snapshot found",
          type: "error"
        });
        setTimeout(() => setAdminMessage(null), 3000);
        return;
      }
      const parsed = JSON.parse(saved);
      await handleExecuteRestore(parsed.data);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAdminSubscriptionCodes = useMemo(() => {
    return adminSubscriptionCodes.filter((c) => {
      if (adminCodeFilter === "active" && c.status !== "active") return false;
      if (adminCodeFilter === "expired" && c.status !== "expired") return false;
      if (adminCodeFilter === "disabled" && c.status !== "disabled") return false;
      if (adminCodeSearch) {
        const q = adminCodeSearch.toLowerCase();
        const matchCode = (c.code || "").toLowerCase().includes(q);
        const matchNote = (c.note || "").toLowerCase().includes(q);
        if (!matchCode && !matchNote) return false;
      }
      return true;
    });
  }, [adminSubscriptionCodes, adminCodeFilter, adminCodeSearch]);

  const [selectedAnalyticsDate, setSelectedAnalyticsDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [analyticsData, setAnalyticsData] = useState<{
    selectedDate?: string;
    isToday?: boolean;
    activeVisitors: number;
    totalVisits: number;
    peakConcurrentViewers: number;
    peakDate: string;
    currentLiveViewers: number;
    dayVisits?: number;
    dayStreamViews?: number;
    dayPeakConcurrent?: number;
    avgWatchDuration?: number;
    deviceBreakdown: { mobile: number; desktop: number; tablet: number };
    matchViewersMap: Record<string, number>;
    hourlyTrend: { time: string; visitors: number; liveViewers: number }[];
  } | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Session tracking & Cardiac ping effect
  useEffect(() => {
    let sessionId = sessionStorage.getItem("elite_session_id");
    let isNewVisit = false;
    if (!sessionId) {
      sessionId = "sess_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      sessionStorage.setItem("elite_session_id", sessionId);
      isNewVisit = true;
    }

    const device = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

    const sendPing = async (first = false) => {
      try {
        await fetch("/api/analytics/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            matchId: streamingMatch?.id,
            device,
            isWatchingStream: isStreamModalOpen,
            isNewVisit: first ? isNewVisit : false
          })
        });
      } catch (e) {
        // Silent
      }
    };

    sendPing(true);
    const interval = setInterval(() => {
      if (!document.hidden) {
        sendPing(false);
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [isMobile, isTablet, isStreamModalOpen, streamingMatch]);

  const fetchAnalyticsData = async (targetDate?: string) => {
    try {
      setIsLoadingAnalytics(true);
      const dateToFetch = targetDate || selectedAnalyticsDate || new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/analytics/stats?date=${dateToFetch}`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (isAdminOpen && adminModalTab === "analytics") {
      fetchAnalyticsData(selectedAnalyticsDate);
      const interval = setInterval(() => fetchAnalyticsData(selectedAnalyticsDate), 5000);
      return () => clearInterval(interval);
    }
  }, [isAdminOpen, adminModalTab, selectedAnalyticsDate]);

  // Time-based automatic match starter clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // 1s tick for real-time countdowns
    return () => clearInterval(timer);
  }, []);

  const parseSafariDate = (dateStr: any): Date | null => {
    if (!dateStr || typeof dateStr !== "string") return null;
    let isoStr = dateStr.trim();
    if (isoStr.includes(" ") && !isoStr.includes("T")) {
      isoStr = isoStr.replace(" ", "T");
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(isoStr) && !isoStr.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(isoStr)) {
      isoStr += "Z";
    }
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const getMatchLocalDate = (match: any): Date | null => {
    if (!match) return null;
    if (match.utcTime) {
      const parsed = parseSafariDate(match.utcTime);
      if (parsed) return parsed;
    }
    const timeStr = match.time?.en || match.time?.ar || (typeof match.time === "string" ? match.time : "");
    if (typeof timeStr === "string" && timeStr.trim() !== "") {
      const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      const cleanStr = timeStr.replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d)));

      if (/^\d{4}-\d{2}-\d{2}/.test(cleanStr)) {
        return parseSafariDate(cleanStr);
      }

      const matchTimeResult = cleanStr.match(/(\d{1,2}):(\d{2})/);
      if (matchTimeResult) {
        const hours = parseInt(matchTimeResult[1], 10);
        const minutes = parseInt(matchTimeResult[2], 10);
        const now = new Date();
        const d = new Date(now);
        d.setHours(hours, minutes, 0, 0);

        const cleanStrLower = cleanStr.toLowerCase();
        if (cleanStrLower.includes("tomorrow") || cleanStrLower.includes("غد")) {
          d.setDate(d.getDate() + 1);
        } else if (cleanStrLower.includes("yesterday") || cleanStrLower.includes("أمس")) {
          d.setDate(d.getDate() - 1);
        }
        return d;
      }
    }
    return null;
  };

  const getUserTimezoneDisplay = () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const now = new Date();
      const offsetMin = -now.getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(offsetMin) / 60);
      const offsetMinsRem = Math.abs(offsetMin) % 60;
      const sign = offsetMin >= 0 ? "+" : "-";
      const formattedOffset = `GMT${sign}${offsetHours}${offsetMinsRem > 0 ? `:${offsetMinsRem}` : ""}`;
      
      const city = tz.includes("/") ? tz.split("/").pop()?.replace(/_/g, " ") : tz;
      return `${city} (${formattedOffset})`;
    } catch (e) {
      return "GMT+3";
    }
  };

  const getStreamAvailability = (match: any, now: Date) => {
    if (!match) return { isAvailable: false, minutesRemaining: 0, diffMs: 0, scheduledDate: null };

    // If match status is live or ended, stream is active
    if (match.status === "live" || match.status === "ended") {
      return { isAvailable: true, minutesRemaining: 0, diffMs: 0, scheduledDate: null };
    }

    const scheduledDate: Date | null = getMatchLocalDate(match);

    if (!scheduledDate) {
      return { isAvailable: true, minutesRemaining: 0, diffMs: 0, scheduledDate: null };
    }

    // Unlock stream 15 minutes before match start
    const unlockDate = new Date(scheduledDate.getTime() - 15 * 60 * 1000);
    const diffMs = unlockDate.getTime() - now.getTime();

    if (diffMs > 0) {
      const minutesRemaining = Math.ceil(diffMs / 60000);
      return { isAvailable: false, minutesRemaining, diffMs, unlockDate, scheduledDate };
    }

    return { isAvailable: true, minutesRemaining: 0, diffMs: 0, unlockDate, scheduledDate };
  };

  const autoProcessMatchStatus = (match: any, now: Date): any => {
    if (!match) return match;
    
    // If the match status is explicitly marked as "ended" or "upcoming", respect that!
    if (match.status === "ended" || match.status === "upcoming") {
      return match;
    }

    const scheduledDate: Date | null = getMatchLocalDate(match);

    if (scheduledDate) {
      if (now >= scheduledDate) {
        return {
          ...match,
          status: "live",
          statusText: {
            ar: "مباشر",
            en: "Live"
          },
          scoreA: match.scoreA !== undefined ? match.scoreA : 0,
          scoreB: match.scoreB !== undefined ? match.scoreB : 0
        };
      }
    }

    return match;
  };

  // Synchronize stream list when a match is selected for streaming
  const prevStreamingMatchIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (streamingMatch) {
      const matchIdChanged = prevStreamingMatchIdRef.current !== String(streamingMatch.id);
      prevStreamingMatchIdRef.current = String(streamingMatch.id);

      const baseStreams = streamingMatch.streams || [];
      let initialized: { name: string; url: string; type: "video" | "iframe" }[] = [];

      if (baseStreams.length > 0) {
        initialized = baseStreams.map((srv: any, i: number) => ({
          name: srv.name || (lang === "ar" ? `سيرفر ${i + 1}` : `Server ${i + 1}`),
          url: srv.url || (i === 0 ? streamingMatch.streamUrl || "" : ""),
          type: srv.type || (i === 0 ? streamingMatch.streamType || "iframe" : "iframe")
        }));
      } else {
        initialized = [
          { name: lang === "ar" ? "سيرفر 1" : "Server 1", url: streamingMatch.streamUrl || "", type: streamingMatch.streamType || "iframe" },
          { name: lang === "ar" ? "سيرفر 2" : "Server 2", url: "", type: "iframe" },
          { name: lang === "ar" ? "سيرفر 3" : "Server 3", url: "", type: "iframe" },
          { name: lang === "ar" ? "سيرفر 4" : "Server 4", url: "", type: "iframe" }
        ];
      }
      setEditingStreams(initialized);

      // Only reset activeStreamIndex and streamUrl if match ID changed or streamUrl is currently empty
      if (matchIdChanged || !streamUrl) {
        const firstValidIdx = initialized.findIndex(s => s.url);
        const targetIdx = firstValidIdx !== -1 ? firstValidIdx : 0;
        setActiveStreamIndex(targetIdx);
        setStreamUrl(initialized[targetIdx]?.url || "");
        setStreamType(initialized[targetIdx]?.type || "iframe");
      }
    } else {
      prevStreamingMatchIdRef.current = null;
      setStreamUrl("");
      setStreamType("iframe");
      setActiveStreamIndex(0);
      setEditingStreams([]);
    }
  }, [streamingMatch, lang]);

  // Load matches with retry on network error
  const fetchMatches = async (retries = 2) => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        // De-duplicate matches by id just in case
        const uniqueMatches: any[] = [];
        const seenIds = new Set();
        if (Array.isArray(data)) {
          for (const m of data) {
            if (m && m.id && !seenIds.has(String(m.id))) {
              seenIds.add(String(m.id));
              uniqueMatches.push(m);
            }
          }
        }
        setMatches(uniqueMatches);
      }
    } catch (err) {
      console.error("Failed to load matches:", err);
      if (retries > 0) {
        setTimeout(() => fetchMatches(retries - 1), 2000);
      }
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // Load site settings (including site logo)
  const fetchSiteSettings = async () => {
    try {
      const res = await fetch("/api/site-settings");
      if (res.ok) {
        const data = await res.json();
        if (data.logo !== undefined) {
          setSiteLogo(data.logo || "");
          try {
            localStorage.setItem("el_portal_site_logo", data.logo || "");
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (err) {
      console.error("Failed to load site settings:", err);
    }
  };

  const handleSaveSiteLogo = async () => {
    try {
      setIsSavingLogo(true);
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo: siteLogo })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings?.logo !== undefined) {
          setSiteLogo(data.settings.logo);
          try {
            localStorage.setItem("el_portal_site_logo", data.settings.logo);
          } catch (e) {
            // ignore
          }
        }
        setAdminMessage({
          text: lang === "ar" ? "تم حفظ وتحديث شعار الموقع بنجاح!" : "Site logo saved and updated successfully!",
          type: "success"
        });
      } else {
        setAdminMessage({
          text: lang === "ar" ? "فشل حفظ الشعار، يرجى المحاولة مرة أخرى." : "Failed to save logo, please try again.",
          type: "error"
        });
      }
    } catch (err) {
      console.error("Error saving site logo:", err);
      setAdminMessage({
        text: lang === "ar" ? "حدث خطأ أثناء الاتصال بالسيرفر" : "Connection error while saving logo",
        type: "error"
      });
    } finally {
      setIsSavingLogo(false);
    }
  };

  // Load admin saved match IDs
  const loadAdminMatchIds = async () => {
    try {
      const res = await fetch("/api/admin/matches");
      if (res.ok) {
        const data = await res.json();
        const rawIds = data.matchIds || [];
        setAdminMatchIds(Array.from(new Set(rawIds.map(String))));
      }
    } catch (err) {
      console.error("Failed to load admin match IDs:", err);
    }
  };

  // Load channels from server
  const fetchChannels = async () => {
    try {
      const res = await fetch("/api/channels");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCustomChannels(data);
          try {
            localStorage.setItem("el_portal_custom_channels", JSON.stringify(data));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error("Failed to load channels:", err);
    }
  };

  const handleSaveChannelsToServer = async (channelsToSave: Channel[]) => {
    setIsSavingChannels(true);
    try {
      const res = await fetch("/api/admin/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channels: channelsToSave })
      });
      if (res.ok) {
        setCustomChannels(channelsToSave);
        try {
          localStorage.setItem("el_portal_custom_channels", JSON.stringify(channelsToSave));
        } catch (e) {}
        setAdminMessage({
          text: lang === "ar" ? "تم حفظ وتحديث قائمة جميع القنوات بنجاح!" : "All channels saved and updated successfully!",
          type: "success"
        });
        return true;
      } else {
        setAdminMessage({
          text: lang === "ar" ? "فشل حفظ القنوات على السيرفر" : "Failed to save channels on server",
          type: "error"
        });
        return false;
      }
    } catch (err) {
      console.error("Error saving channels:", err);
      setAdminMessage({
        text: lang === "ar" ? "حدث خطأ بالاتصال أثناء حفظ القنوات" : "Connection error while saving channels",
        type: "error"
      });
      return false;
    } finally {
      setIsSavingChannels(false);
    }
  };

  const resetChannelForm = () => {
    setChannelFormData({
      id: "",
      nameAr: "",
      nameEn: "",
      category: "sports",
      categoryNameAr: "رياضية",
      categoryNameEn: "Sports",
      logo: "",
      quality: "FHD",
      countryAr: "",
      countryEn: "",
      currentProgramAr: "",
      currentProgramEn: "",
      streams: [
        { nameAr: "سيرفر 1 (رئيسي)", nameEn: "Server 1 (Main)", url: "", type: "video", quality: "1080p" }
      ]
    });
    setAdminEditingChannel(null);
    setIsCreatingChannel(false);
  };

  const handleOpenAddChannel = () => {
    resetChannelForm();
    setIsCreatingChannel(true);
    setAdminModalTab("channels");
    setIsAdminOpen(true);
  };

  const handleOpenEditChannel = (ch: Channel) => {
    setAdminEditingChannel(ch);
    setIsCreatingChannel(false);
    setChannelFormData({
      id: ch.id,
      nameAr: ch.name?.ar || "",
      nameEn: ch.name?.en || "",
      category: ch.category || "sports",
      categoryNameAr: ch.categoryName?.ar || "رياضية",
      categoryNameEn: ch.categoryName?.en || "Sports",
      logo: ch.logo || "",
      quality: ch.quality || "FHD",
      countryAr: ch.country?.ar || "",
      countryEn: ch.country?.en || "",
      currentProgramAr: ch.currentProgram?.ar || "",
      currentProgramEn: ch.currentProgram?.en || "",
      streams: (ch.streams && ch.streams.length > 0)
        ? ch.streams.map((s, idx) => ({
            nameAr: s.name?.ar || `سيرفر ${idx + 1}`,
            nameEn: s.name?.en || `Server ${idx + 1}`,
            url: s.url || "",
            type: s.type || "video",
            quality: s.quality || "1080p"
          }))
        : [
            { nameAr: "سيرفر 1 (رئيسي)", nameEn: "Server 1 (Main)", url: "", type: "video", quality: "1080p" }
          ]
    });
    setAdminModalTab("channels");
    setIsAdminOpen(true);
  };

  const handleSaveChannelForm = async () => {
    if (!channelFormData.nameAr.trim() && !channelFormData.nameEn.trim()) {
      setAdminMessage({
        text: lang === "ar" ? "يرجى كتابة اسم القناة" : "Please enter channel name",
        type: "error"
      });
      return;
    }

    const catMap: Record<string, { ar: string; en: string }> = {
      sports: { ar: "رياضية", en: "Sports" },
      cinema: { ar: "أفلام وسينما", en: "Movies & Cinema" },
      news: { ar: "إخبارية", en: "News" },
      general: { ar: "منوعة وترفيه", en: "Entertainment & TV" },
      documentary: { ar: "وثائقية", en: "Documentary" },
      kids: { ar: "أطفال", en: "Kids" },
    };

    const catObj = catMap[channelFormData.category] || { ar: "عامة", en: "General" };

    const validStreams = channelFormData.streams.map((s, idx) => ({
      name: {
        ar: s.nameAr.trim() || `سيرفر ${idx + 1}`,
        en: s.nameEn.trim() || `Server ${idx + 1}`
      },
      url: getEmbedUrl(s.url.trim()),
      type: s.type,
      quality: s.quality || "1080p"
    }));

    const channelId = channelFormData.id || `ch_${Date.now()}`;

    const newChannelObj: Channel = {
      id: channelId,
      name: {
        ar: channelFormData.nameAr.trim() || channelFormData.nameEn.trim(),
        en: channelFormData.nameEn.trim() || channelFormData.nameAr.trim()
      },
      category: channelFormData.category,
      categoryName: catObj,
      logo: channelFormData.logo.trim(),
      quality: channelFormData.quality,
      country: (channelFormData.countryAr || channelFormData.countryEn) ? {
        ar: channelFormData.countryAr.trim() || channelFormData.countryEn.trim(),
        en: channelFormData.countryEn.trim() || channelFormData.countryAr.trim()
      } : undefined,
      currentProgram: (channelFormData.currentProgramAr || channelFormData.currentProgramEn) ? {
        ar: channelFormData.currentProgramAr.trim() || channelFormData.currentProgramEn.trim(),
        en: channelFormData.currentProgramEn.trim() || channelFormData.currentProgramAr.trim()
      } : undefined,
      streams: validStreams,
      isLive: true,
      featured: true
    };

    let updatedList: Channel[];
    if (adminEditingChannel) {
      updatedList = customChannels.map(c => c.id === adminEditingChannel.id ? newChannelObj : c);
    } else {
      updatedList = [newChannelObj, ...customChannels.filter(c => c.id !== channelId)];
    }

    const ok = await handleSaveChannelsToServer(updatedList);
    if (ok) {
      resetChannelForm();
    }
  };

  const handleDeleteChannel = async (id: string) => {
    const updated = customChannels.filter(c => c.id !== id);
    const ok = await handleSaveChannelsToServer(updated);
    if (ok) {
      if (selectedPlayingChannel?.id === id) {
        setSelectedPlayingChannel(null);
      }
    }
  };

  useEffect(() => {
    fetchMatches();
    loadAdminMatchIds();
    fetchSiteSettings();
    fetchChannels();
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchMatches();
      }
    }, 30000); // refresh every 30s when tab is active
    return () => clearInterval(interval);
  }, []);

  // Real-time server update synchronization via SSE (Server-Sent Events)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let initialStartTimeout: any = null;
    let reconnectDelay = 3000;

    const connectSSE = () => {
      if (eventSource) {
        eventSource.close();
      }
      console.log("[SSE] Connecting to /api/updates...");
      eventSource = new EventSource("/api/updates");

      eventSource.onopen = () => {
        console.log("[SSE] Real-time connection established successfully");
        reconnectDelay = 3000; // Reset backoff on success
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (
            data.type === "matches_updated" || 
            data.type === "match_override_updated" || 
            data.type === "team_logos_updated"
          ) {
            fetchMatches();
            loadAdminMatchIds();
          } else if (data.type === "site_settings_updated") {
            fetchSiteSettings();
          } else if (data.type === "channels_updated") {
            fetchChannels();
          }
        } catch {
          // Heartbeats or unparseable messages ignored
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
        }
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(connectSSE, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 1.5, 30000);
      };
    };

    // Delay SSE connection slightly on iOS Safari to allow initial matches fetch & render to finish instantly
    initialStartTimeout = setTimeout(() => {
      connectSSE();
    }, 1200);

    return () => {
      if (initialStartTimeout) {
        clearTimeout(initialStartTimeout);
      }
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  useEffect(() => {
    if (!editingMatch) {
      setLogoSelectorFor(null);
    }
  }, [editingMatch]);



  // Search matches in FotMob by Date
  const handleSearchFotmobByDate = async () => {
    setIsSearchingFotmob(true);
    setAdminMessage(null);
    try {
      const cleanedDate = searchDate.replace(/-/g, "");
      const res = await fetch(`/api/fotmob/matches-by-date?date=${cleanedDate}`);
      if (res.ok) {
        const data = await res.json();
        // De-duplicate searched matches by id just in case
        const uniqueSearched: any[] = [];
        const seenSearchedIds = new Set();
        if (Array.isArray(data)) {
          for (const m of data) {
            if (m && m.id && !seenSearchedIds.has(String(m.id))) {
              seenSearchedIds.add(String(m.id));
              uniqueSearched.push(m);
            }
          }
        }
        setSearchedFotmobMatches(uniqueSearched);
        if (uniqueSearched.length === 0) {
          setAdminMessage({ text: lang === "ar" ? "لا توجد مباريات لهذا اليوم." : "No matches found for this date.", type: "error" });
        }
      } else {
        setAdminMessage({ text: lang === "ar" ? "فشل البحث في FotMob." : "Failed to search FotMob.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setAdminMessage({ text: lang === "ar" ? "خطأ في الاتصال بالخادم." : "Server connection error.", type: "error" });
    } finally {
      setIsSearchingFotmob(false);
    }
  };

  // Extract FotMob Match ID from URL or numeric string
  const extractFotmobMatchId = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return "";

    if (/^\d+$/.test(trimmed)) {
      return trimmed;
    }

    try {
      let urlString = trimmed;
      if (!/^https?:\/\//i.test(urlString)) {
        urlString = "https://" + urlString;
      }
      const url = new URL(urlString);
      
      // Check hash (e.g. #4653855)
      if (url.hash) {
        const hashMatch = url.hash.match(/#?(\d+)/);
        if (hashMatch && hashMatch[1]) {
          return hashMatch[1];
        }
      }

      // Check query params
      const qId = url.searchParams.get("matchId") || url.searchParams.get("id");
      if (qId && /^\d+$/.test(qId)) {
        return qId;
      }

      // Check path segments
      const segments = url.pathname.split("/").filter(Boolean);
      for (const segment of segments) {
        if (/^\d+$/.test(segment)) {
          return segment;
        }
      }
    } catch (e) {
      // Ignore URL parse error, proceed to regex fallback
    }

    // Try finding a 6-10 digit number in the string
    const match = trimmed.match(/(?:#|\b)(\d{6,10})\b/);
    if (match && match[1]) {
      return match[1];
    }

    return trimmed;
  };

  // Helper to persist updated list directly to server and refresh UI
  const saveMatchListOnServer = async (newList: string[]) => {
    setIsSavingAdmin(true);
    setAdminMessage(null);
    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchIds: newList })
      });
      if (res.ok) {
        setAdminMatchIds(Array.from(new Set(newList.map(String))));
        await fetchMatches(); // Re-fetch all matches with full details immediately
        return true;
      } else {
        setAdminMessage({ text: lang === "ar" ? "فشل تحديث قائمة المباريات على الخادم." : "Failed to update match list on the server.", type: "error" });
        return false;
      }
    } catch (err) {
      console.error(err);
      setAdminMessage({ text: lang === "ar" ? "خطأ في الاتصال بالخادم." : "Server connection error.", type: "error" });
      return false;
    } finally {
      setIsSavingAdmin(false);
    }
  };

  // Add match ID to admin list (supports match URL and ID parsing)
  const handleAddMatchId = async (idOrUrl: string) => {
    const parsedId = extractFotmobMatchId(idOrUrl);
    if (!parsedId || !/^[a-zA-Z0-9_-]+$/.test(parsedId)) {
      setAdminMessage({ 
        text: lang === "ar" 
          ? "المعرف المدخل غير صحيح. يرجى إدخال معرف مباراة قوقل صالح أو رقم المعرف." 
          : "The entered ID is invalid. Please enter a valid Google match ID or numeric ID.", 
        type: "error" 
      });
      return;
    }
    if (adminMatchIds.includes(parsedId)) {
      setAdminMessage({ text: lang === "ar" ? "هذه المباراة مضافة بالفعل في الصفحة الرئيسية." : "This match is already on the homepage.", type: "error" });
      return;
    }
    
    const updatedList = [...adminMatchIds, parsedId];
    const success = await saveMatchListOnServer(updatedList);
    if (success) {
      setAdminMessage({ 
        text: lang === "ar" 
          ? `تمت إضافة المباراة بنجاح وتحديث الصفحة الرئيسية تفاصيل كاملة (رقم: ${parsedId})!` 
          : `Match successfully added and homepage updated with full details (ID: ${parsedId})!`, 
        type: "success" 
      });
    }
  };

  // Remove match ID from admin list
  const handleRemoveMatchId = async (id: string) => {
    const updatedList = adminMatchIds.filter(mid => mid !== String(id));
    const success = await saveMatchListOnServer(updatedList);
    if (success) {
      setAdminMessage({ 
        text: lang === "ar" ? "تمت إزالة المباراة بنجاح من الصفحة الرئيسية!" : "Match successfully removed from the homepage!", 
        type: "success" 
      });
    }
  };

  // Deprecated manual save: auto-runs now, kept for backward compatibility reference
  const handleSaveAdminMatches = async () => {
    await saveMatchListOnServer(adminMatchIds);
    setAdminMessage({
      text: lang === "ar" ? "تمت المزامنة وحفظ جميع التغييرات بنجاح تلقائياً!" : "All changes have been successfully saved & synced automatically!",
      type: "success"
    });
  };

  const handleSaveMatchOverride = async (matchId: string, overrideData: any) => {
    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/matches/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, overrideData })
      });
      if (res.ok) {
        await fetchMatches(); // reload match list immediately with details
        setEditingMatch(null); // close the editor
      } else {
        alert(lang === "ar" ? "فشل حفظ التعديلات" : "Failed to save edits");
      }
    } catch (err) {
      console.error(err);
      alert(lang === "ar" ? "خطأ في الاتصال بالخادم" : "Connection error");
    } finally {
      setIsSavingEdit(false);
    }
  };



  const handleSaveAllStreams = async (matchId: string, updatedStreams: { name: string; url: string; type: "video" | "iframe" }[]) => {
    try {
      const res = await fetch("/api/matches/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          overrideData: {
            ...streamingMatch,
            streamUrl: updatedStreams[0]?.url || "",
            streamType: updatedStreams[0]?.type || "iframe",
            streams: updatedStreams
          }
        })
      });
      if (res.ok) {
        await fetchMatches();
        setStreamingMatch(prev => {
          if (!prev) return null;
          return {
            ...prev,
            streamUrl: updatedStreams[0]?.url || "",
            streamType: updatedStreams[0]?.type || "iframe",
            streams: updatedStreams
          };
        });
        alert(lang === "ar" ? "تم حفظ وتحديث جميع سيرفرات البث بنجاح!" : "All stream servers updated and saved successfully!");
      } else {
        alert(lang === "ar" ? "فشل حفظ السيرفرات" : "Failed to save servers");
      }
    } catch (err) {
      console.error(err);
      alert(lang === "ar" ? "خطأ في الاتصال بالخادم" : "Connection error");
    }
  };

  const formatMatchTime = (match: any, currentLang: "ar" | "en") => {
    if (!match) return "";
    const d = getMatchLocalDate(match);
    if (d && !isNaN(d.getTime())) {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const matchStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      
      const diffDays = Math.round((matchStart.getTime() - todayStart.getTime()) / (1000 * 3600 * 24));

      const timeFormatted = d.toLocaleTimeString(currentLang === "ar" ? "ar-EG" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

      let dayPrefix = "";
      if (diffDays === 0) {
        dayPrefix = currentLang === "ar" ? "اليوم" : "Today";
      } else if (diffDays === 1) {
        dayPrefix = currentLang === "ar" ? "غداً" : "Tomorrow";
      } else if (diffDays === -1) {
        dayPrefix = currentLang === "ar" ? "أمس" : "Yesterday";
      } else {
        dayPrefix = d.toLocaleDateString(currentLang === "ar" ? "ar-EG" : "en-US", {
          weekday: "short",
          month: "short",
          day: "numeric"
        });
      }

      return `${dayPrefix}، ${timeFormatted}`;
    }

    if (match.time) {
      if (typeof match.time === "object") {
        return match.time[currentLang] || match.time.en || "";
      }
      return String(match.time);
    }
    return "";
  };

  const shouldShowPlayButton = (match: any): boolean => {
    // Admin can always access and configure streams for any match
    if (userRole === "admin") return true;

    if (match.status === "ended") return false;

    // Check 15-minute window or live status
    const avail = getStreamAvailability(match, currentTime);

    // If stream URL or streams exist
    const hasStream = Boolean(match.streamUrl || (match.streams && match.streams.some((s: any) => s.url && s.url.trim() !== "")));
    if (hasStream) {
      // Show play button for viewers ONLY when within 15 minutes of kick-off or live
      return avail.isAvailable;
    }

    if (match.status === "upcoming") return false;
    if (match.status === "live") return true;

    return avail.isAvailable;
  };

  const getTranslation = (val: any, fallback = "") => {
    if (!val) return fallback;
    if (typeof val === "object") {
      return val[lang] || val.en || fallback;
    }
    return val;
  };

  // Get active translations
  const t = translations[lang];

  // Map sport categories
  const sportsCategories = useMemo(() => [
    { id: "all", label: t.all },
    { id: "football", label: t.football },
    { id: "basketball", label: t.basketball },
    { id: "tennis", label: t.tennis },
    { id: "formula1", label: t.formula1 },
  ], [t]);

  // Map time period filters
  const timePeriodFilters = useMemo(() => [
    { id: "all", label: lang === "ar" ? "جميع الفترات" : "All Periods" },
    { id: "today", label: lang === "ar" ? "اليوم" : "Today" },
    { id: "tomorrow", label: lang === "ar" ? "غداً" : "Tomorrow" },
    { id: "yesterday", label: lang === "ar" ? "أمس" : "Yesterday" },
    { id: "live", label: lang === "ar" ? "مباشر الآن" : "Live Now" },
  ], [lang]);

  // Map movie genres
  const movieGenres = useMemo(() => [
    { id: "all", label: t.all },
    { id: "scifi", label: t.scifi },
    { id: "action", label: t.action },
    { id: "drama", label: t.drama },
  ], [t]);

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    const listToFilter = matches.map(m => autoProcessMatchStatus(m, currentTime));
    return listToFilter.filter(match => {
      const matchSport = match.sport === selectedSportFilter || selectedSportFilter === "all";

      // Time Period Filter based on visitor's browser local date
      let matchesTimePeriod = true;
      if (selectedTimePeriodFilter === "live") {
        matchesTimePeriod = match.status === "live";
      } else if (selectedTimePeriodFilter !== "all") {
        const d = getMatchLocalDate(match);
        if (d) {
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const matchStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const diffDays = Math.round((matchStart.getTime() - todayStart.getTime()) / (1000 * 3600 * 24));

          if (selectedTimePeriodFilter === "today") {
            matchesTimePeriod = diffDays === 0;
          } else if (selectedTimePeriodFilter === "tomorrow") {
            matchesTimePeriod = diffDays === 1;
          } else if (selectedTimePeriodFilter === "yesterday") {
            matchesTimePeriod = diffDays === -1;
          }
        }
      }

      const teamAName = match.teamA[lang] || match.teamA.en || "";
      const teamBName = match.teamB[lang] || match.teamB.en || "";
      const venueName = match.venue[lang] || match.venue.en || "";
      const matchesSearch = 
        teamAName.toLowerCase().includes(sportsSearch.toLowerCase()) ||
        teamBName.toLowerCase().includes(sportsSearch.toLowerCase()) ||
        venueName.toLowerCase().includes(sportsSearch.toLowerCase());

      return matchSport && matchesTimePeriod && matchesSearch;
    });
  }, [matches, selectedSportFilter, selectedTimePeriodFilter, sportsSearch, lang, currentTime]);

  // Filtered Movies
  const filteredMovies = useMemo(() => {
    return cinemaMovies.filter(movie => {
      const matchGenre = movie.genre === selectedGenreFilter || selectedGenreFilter === "all";
      const matchesSearch = 
        movie.title[lang].toLowerCase().includes(cinemaSearch.toLowerCase()) ||
        movie.genreText[lang].toLowerCase().includes(cinemaSearch.toLowerCase()) ||
        movie.description[lang].toLowerCase().includes(cinemaSearch.toLowerCase());
      return matchGenre && matchesSearch;
    });
  }, [selectedGenreFilter, cinemaSearch, lang]);

  // Channel categories
  const channelCategories = useMemo(() => [
    { id: "all", label: t.all },
    { id: "sports", label: t.sportsChannels },
    { id: "cinema", label: t.cinemaChannels },
    { id: "news", label: t.newsChannels },
    { id: "general", label: t.generalChannels },
    { id: "documentary", label: t.documentaryChannels },
    { id: "kids", label: t.kidsChannels },
  ], [t]);

  // Combined Channels (Built-in + Custom)
  const allChannelsList = useMemo(() => {
    return [...tvChannels, ...customChannels];
  }, [customChannels]);

  // Filtered Channels
  const filteredChannels = useMemo(() => {
    return allChannelsList.filter(channel => {
      const matchCat = selectedChannelCategory === "all" || channel.category === selectedChannelCategory;
      const searchLower = channelsSearch.toLowerCase().trim();
      if (!searchLower) return matchCat;

      const nameAr = (channel.name?.ar || "").toLowerCase();
      const nameEn = (channel.name?.en || "").toLowerCase();
      const catAr = (channel.categoryName?.ar || "").toLowerCase();
      const catEn = (channel.categoryName?.en || "").toLowerCase();
      const currAr = (channel.currentProgram?.ar || "").toLowerCase();
      const currEn = (channel.currentProgram?.en || "").toLowerCase();
      const countryAr = (channel.country?.ar || "").toLowerCase();
      const countryEn = (channel.country?.en || "").toLowerCase();

      const matchesSearch = 
        nameAr.includes(searchLower) ||
        nameEn.includes(searchLower) ||
        catAr.includes(searchLower) ||
        catEn.includes(searchLower) ||
        currAr.includes(searchLower) ||
        currEn.includes(searchLower) ||
        countryAr.includes(searchLower) ||
        countryEn.includes(searchLower);

      return matchCat && matchesSearch;
    });
  }, [allChannelsList, selectedChannelCategory, channelsSearch]);

  // Sync selected match details modal and streaming match with live clock tick updates
  useEffect(() => {
    if (selectedMatchForDetails) {
      const updated = filteredMatches.find(m => String(m.id) === String(selectedMatchForDetails.id));
      if (updated) {
        if (
          updated.status !== selectedMatchForDetails.status || 
          updated.statusText?.en !== selectedMatchForDetails.statusText?.en ||
          updated.statusText?.ar !== selectedMatchForDetails.statusText?.ar ||
          updated.scoreA !== selectedMatchForDetails.scoreA ||
          updated.scoreB !== selectedMatchForDetails.scoreB ||
          JSON.stringify(updated.scorers) !== JSON.stringify(selectedMatchForDetails.scorers) ||
          JSON.stringify(updated.stats) !== JSON.stringify(selectedMatchForDetails.stats) ||
          JSON.stringify(updated.lineups) !== JSON.stringify(selectedMatchForDetails.lineups) ||
          JSON.stringify(updated.streams) !== JSON.stringify(selectedMatchForDetails.streams) ||
          JSON.stringify(updated.customMetadata) !== JSON.stringify(selectedMatchForDetails.customMetadata)
        ) {
          setSelectedMatchForDetails(updated);
        }
      }
    }
  }, [filteredMatches, selectedMatchForDetails]);

  useEffect(() => {
    if (streamingMatch) {
      const updated = filteredMatches.find(m => String(m.id) === String(streamingMatch.id));
      if (updated) {
        if (
          updated.status !== streamingMatch.status ||
          updated.statusText?.en !== streamingMatch.statusText?.en ||
          updated.statusText?.ar !== streamingMatch.statusText?.ar ||
          JSON.stringify(updated.streams) !== JSON.stringify(streamingMatch.streams)
        ) {
          setStreamingMatch(updated);
        }
      }
    }
  }, [filteredMatches, streamingMatch]);

  // Handle Seat Click
  const handleSeatClick = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatId));
    } else {
      setSelectedSeats(prev => [...prev, seatId]);
    }
  };

  // Reset Booking state
  const startBooking = (movie: Movie) => {
    setSelectedMovieForBooking(movie);
    setSelectedShowtime(movie.showtimes[0]);
    setSelectedSeats([]);
    setBookingCompleted(false);
  };

  const confirmBooking = () => {
    if (selectedSeats.length === 0) return;
    setBookingCompleted(true);
    setTimeout(() => {
      // Auto close booking modal after nice feedback
      setSelectedMovieForBooking(null);
      setBookingCompleted(false);
    }, 2500);
  };

  // Custom static seat map layout (6x6 seat matrix)
  const seatMatrix = useMemo(() => {
    const rows = ["A", "B", "C", "D", "E", "F"];
    const seats = [];
    // Pre-determine some reserved seats for realism
    const reserved = ["A3", "A4", "B2", "C5", "D4", "E1", "F6"];
    for (const r of rows) {
      for (let i = 1; i <= 6; i++) {
        const id = `${r}${i}`;
        seats.push({
          id,
          isReserved: reserved.includes(id)
        });
      }
    }
    return seats;
  }, []);

  return (
    <div 
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen font-sans pb-16 transition-colors duration-500 ease-in-out ${
        theme === "black" 
          ? "bg-black text-zinc-100 selection:bg-amber-500 selection:text-black" 
          : "bg-zinc-50 text-zinc-900 selection:bg-zinc-900 selection:text-white"
      }`}
    >
      {/* BACKGROUND EFFECTS (Subtle elegant styling) */}
      {theme === "black" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-red-600/5 blur-[140px]" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-10">
        
        {/* UPPER GRID: Header Info + Right-Aligned Controls */}
        <div className={`flex flex-col lg:flex-row items-start justify-between gap-6 mb-10 border-b pb-8 border-dashed ${theme === 'black' ? 'border-zinc-800' : 'border-zinc-200'}`}>
          
          {/* Logo and Greeting Area */}
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center overflow-hidden border shrink-0 ${
              theme === 'black' ? 'bg-zinc-900 text-amber-500 border-zinc-800' : 'bg-white text-zinc-950 border-zinc-200 shadow-sm'
            }`}>
              {siteLogo ? (
                <img 
                  src={siteLogo} 
                  alt="Site Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Sparkles className="w-7 h-7 animate-pulse" />
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {lang === "ar" ? "بوابة النخبة" : "Elite Portal"}
              </h1>
              <p className={`text-xs mt-1 font-medium ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {lang === "ar" ? "الرياضة والسينما في منصة واحدة فائقة السرعة" : "Premium Sports & Cinema in one responsive platform"}
              </p>
            </div>
          </div>

          {/* RIGHT SIDE CONTROLS - (العربية / English & Black / White theme toggles) */}
          <div className="flex flex-wrap items-center gap-4 lg:self-center bg-transparent self-stretch justify-end">
            
            {/* Language Selection Card */}
            <div className={`flex items-center p-1.5 rounded-xl border ${
              theme === "black" 
                ? "bg-zinc-900/80 border-zinc-800 text-zinc-300" 
                : "bg-white border-zinc-200 shadow-sm text-zinc-800"
            }`}>
              <div className="px-2 py-1 text-xs font-semibold flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">{t.language}:</span>
              </div>
              <button
                id="btn-lang-ar"
                onClick={() => changeLanguage("ar")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-300 ${
                  lang === "ar"
                    ? theme === "black" ? "bg-amber-500 text-black shadow-md shadow-amber-500/10" : "bg-zinc-950 text-white"
                    : "hover:bg-zinc-800/10"
                }`}
              >
                العربية
              </button>
              <button
                id="btn-lang-en"
                onClick={() => changeLanguage("en")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-300 ${
                  lang === "en"
                    ? theme === "black" ? "bg-amber-500 text-black shadow-md shadow-amber-500/10" : "bg-zinc-950 text-white"
                    : "hover:bg-zinc-800/10"
                }`}
              >
                English
              </button>
            </div>

            {/* Black & White Theme Toggle */}
            <div className={`flex items-center p-1.5 rounded-xl border ${
              theme === "black" 
                ? "bg-zinc-900/80 border-zinc-800 text-zinc-300" 
                : "bg-white border-zinc-200 shadow-sm text-slate-800"
            }`}>
              <div className="px-2 py-1 text-xs font-semibold flex items-center gap-1">
                {theme === "black" ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-orange-500" />}
                <span className="hidden sm:inline">{t.theme}:</span>
              </div>
              <button
                id="btn-theme-black"
                onClick={() => changeTheme("black")}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all duration-300 ${
                  theme === "black"
                    ? "bg-zinc-100 text-black font-extrabold shadow-sm"
                    : "hover:bg-zinc-200 text-slate-500"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-black border border-white" />
                {t.black}
              </button>
              <button
                id="btn-theme-white"
                onClick={() => changeTheme("white")}
                className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all duration-300 ${
                  theme === "white"
                    ? "bg-zinc-950 text-white font-extrabold shadow-sm"
                    : "hover:bg-zinc-800 text-zinc-400"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white border border-zinc-800" />
                {t.white}
              </button>
            </div>

            {/* Admin Controls Button (Visible when logged in as Admin with @Asdda90199090) */}
            {userRole === "admin" && (
              <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${
                theme === "black" 
                  ? "bg-red-950/40 border-red-800/60 text-red-300" 
                  : "bg-red-50 border-red-200 text-red-800 shadow-sm"
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminOpen(true);
                    setAdminModalTab("controls");
                    loadAdminMatchIds();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "لوحة المسؤول" : "Admin Panel"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserRole("viewer");
                    try {
                      localStorage.removeItem("el_portal_user_role");
                    } catch (e) {}
                  }}
                  title={lang === "ar" ? "تسجيل الخروج من وضع المسؤول" : "Exit Admin Mode"}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* MIDDLE SECTION: MAIN SELECTION HUBS (Sports, Cinema & All Channels) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Sports Hub Option */}
          <button
            id="tab-sports"
            onClick={() => setActiveTab("sports")}
            className={`group text-start p-6 rounded-3xl border-2 transition-all duration-500 relative overflow-hidden cursor-pointer ${
              activeTab === "sports"
                ? theme === "black"
                  ? "bg-gradient-to-br from-zinc-900 to-black border-amber-500 shadow-2xl shadow-amber-500/5 text-white"
                  : "bg-white border-zinc-900 shadow-xl text-zinc-950"
                : theme === "black"
                  ? "bg-zinc-950/60 border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  : "bg-white/60 border-zinc-200 hover:border-zinc-400 text-zinc-500 hover:text-slate-800"
            }`}
          >
            {/* Hover background details for Sports card */}
            <div className={`absolute -right-12 -bottom-12 w-44 h-44 rounded-full transition-all duration-500 opacity-20 group-hover:scale-125 ${
              activeTab === "sports" ? "bg-amber-500/20" : "bg-zinc-500/10"
            }`} />

            <div className="flex items-start justify-between relative z-10">
              <div className={`p-4 rounded-2xl transition-all duration-500 ${
                activeTab === "sports"
                  ? theme === "black" ? "bg-amber-500 text-black" : "bg-zinc-950 text-white"
                  : theme === "black" ? "bg-zinc-900 text-zinc-400" : "bg-zinc-100 text-zinc-500"
              }`}>
                <Trophy className="w-7 h-7 relative z-10" />
              </div>
              
              {/* Check indicator if selected */}
              {activeTab === "sports" && (
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                  theme === "black" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-zinc-100 text-zinc-900 border border-zinc-200"
                }`}>
                  {lang === "ar" ? "نشط" : "Active"}
                </div>
              )}
            </div>

            <div className="mt-6 relative z-10">
              <h2 className="text-xl md:text-2xl font-black">{t.sports}</h2>
              <p className={`text-xs mt-2 leading-relaxed ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {t.sportsDesc}
              </p>
            </div>
          </button>

          {/* Cinema Hub Option */}
          <button
            id="tab-cinema"
            onClick={() => setActiveTab("cinema")}
            className={`group text-start p-6 rounded-3xl border-2 transition-all duration-500 relative overflow-hidden block w-full cursor-pointer ${
              activeTab === "cinema"
                ? theme === "black"
                  ? "bg-gradient-to-br from-zinc-900 to-black border-red-500 shadow-2xl shadow-red-500/5 text-white"
                  : "bg-white border-zinc-900 shadow-xl text-zinc-950"
                : theme === "black"
                  ? "bg-zinc-950/60 border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  : "bg-white/60 border-zinc-200 hover:border-zinc-400 text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {/* Hover background details for Cinema card */}
            <div className={`absolute -right-12 -bottom-12 w-44 h-44 rounded-full transition-all duration-500 opacity-20 group-hover:scale-125 ${
              activeTab === "cinema" ? "bg-red-500/20" : "bg-zinc-500/10"
            }`} />

            <div className="flex items-start justify-between relative z-10">
              <div className={`p-4 rounded-2xl transition-all duration-500 ${
                activeTab === "cinema"
                  ? theme === "black" ? "bg-red-500/20 text-red-500" : "bg-zinc-950 text-white"
                  : theme === "black" ? "bg-zinc-900 text-zinc-400" : "bg-zinc-100 text-zinc-500"
              }`}>
                <Film className="w-7 h-7 relative z-10" />
              </div>

              {/* Check indicator if selected */}
              {activeTab === "cinema" && (
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                  theme === "black" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-zinc-100 text-zinc-900 border border-zinc-200"
                }`}>
                  {lang === "ar" ? "نشط" : "Active"}
                </div>
              )}
            </div>

            <div className="mt-6 relative z-10">
              <h2 className="text-xl md:text-2xl font-black">{t.cinema}</h2>
              <p className={`text-xs mt-2 leading-relaxed ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {t.cinemaDesc}
              </p>
            </div>
          </button>

          {/* All Channels Hub Option (جميع القنوات) */}
          <button
            id="tab-channels"
            onClick={() => setActiveTab("channels")}
            className={`group text-start p-6 rounded-3xl border-2 transition-all duration-500 relative overflow-hidden block w-full cursor-pointer ${
              activeTab === "channels"
                ? theme === "black"
                  ? "bg-gradient-to-br from-zinc-900 to-black border-cyan-500 shadow-2xl shadow-cyan-500/10 text-white"
                  : "bg-white border-cyan-600 shadow-xl text-zinc-950"
                : theme === "black"
                  ? "bg-zinc-950/60 border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  : "bg-white/60 border-zinc-200 hover:border-zinc-400 text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {/* Hover background details for Channels card */}
            <div className={`absolute -right-12 -bottom-12 w-44 h-44 rounded-full transition-all duration-500 opacity-20 group-hover:scale-125 ${
              activeTab === "channels" ? "bg-cyan-500/20" : "bg-zinc-500/10"
            }`} />

            <div className="flex items-start justify-between relative z-10">
              <div className={`p-4 rounded-2xl transition-all duration-500 ${
                activeTab === "channels"
                  ? theme === "black" ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-600 text-white"
                  : theme === "black" ? "bg-zinc-900 text-zinc-400" : "bg-zinc-100 text-zinc-500"
              }`}>
                <Tv className="w-7 h-7 relative z-10" />
              </div>

              {/* Check indicator if selected */}
              {activeTab === "channels" && (
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                  theme === "black" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-cyan-50 text-cyan-700 border border-cyan-200"
                }`}>
                  {lang === "ar" ? "نشط" : "Active"}
                </div>
              )}
            </div>

            <div className="mt-6 relative z-10">
              <h2 className="text-xl md:text-2xl font-black">{t.channels}</h2>
              <p className={`text-xs mt-2 leading-relaxed ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {t.channelsDesc}
              </p>
            </div>
          </button>

        </div>

        {/* DETAILED VIEWS IN THE CENTER */}
        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* 1. SPORTS TAB CONTENT */}
            {activeTab === "sports" && (
              <motion.div
                key="sports-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Matches Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {filteredMatches.length > 0 ? (
                    filteredMatches.map((match, index) => {
                          const isLive = match.status === "live";
                          const isEnded = match.status === "ended";
                          const teamAName = match.teamA[lang] || match.teamA.en || "";
                          const teamBName = match.teamB[lang] || match.teamB.en || "";
                          const timeString = formatMatchTime(match, lang);
                          const venueString = match.venue[lang] || match.venue.en || "";

                          return (
                            <div
                              key={`${match.id}-${index}`}
                              onClick={() => {
                                setSelectedMatchForDetails(match);
                                setActiveDetailsTab("events");
                              }}
                              className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer group hover:scale-[1.01] ${
                                theme === "black"
                                  ? isLive
                                    ? "bg-gradient-to-br from-zinc-900 to-zinc-950 border-amber-500/30 hover:border-amber-500/50"
                                    : "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700"
                                  : "bg-white border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300"
                              }`}
                            >
                              {/* Live signal top line */}
                              {isLive && (
                                <div className="absolute top-0 inset-x-0 h-[2px] bg-amber-500 animate-pulse" />
                              )}

                              {/* Match Meta Row */}
                              <div className="flex items-center justify-between mb-6">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                  isLive 
                                    ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                                    : isEnded
                                      ? theme === "black" ? "bg-zinc-850 text-zinc-400 border border-zinc-800" : "bg-zinc-150 text-zinc-500"
                                      : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                }`}>
                                  {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                                  {isLive ? match.statusText?.[lang] || match.statusText?.en || t.live : isEnded ? t.ended : match.statusText?.[lang] || match.statusText?.en || t.upcoming}
                                </span>

                                <div className="flex items-center gap-2">
                                  {userRole === "admin" && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setStreamingMatch(match);
                                        const streams = match.streams && match.streams.length > 0 
                                          ? match.streams 
                                          : [{ name: lang === "ar" ? "سيرفر 1" : "Server 1", url: match.streamUrl || "", type: match.streamType || "iframe" }];
                                        setEditingStreams(streams);
                                        setStreamUrl(streams[0]?.url || match.streamUrl || "");
                                        setStreamType(streams[0]?.type || match.streamType || "iframe");
                                        setIsStreamModalOpen(true);
                                      }}
                                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-black flex items-center gap-1 transition cursor-pointer"
                                      title={lang === "ar" ? "إضافة أو تعديل روابط البث لهذه المباراة" : "Add or Edit Streams for this Match"}
                                    >
                                      <Tv className="w-3 h-3" />
                                      <span>{lang === "ar" ? "إدارة البث" : "Manage Stream"}</span>
                                    </button>
                                  )}
                                  <span className={`text-[10px] font-mono tracking-wider ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    {timeString}
                                  </span>
                                </div>
                              </div>

                              {/* Competitors Layout */}
                              <div className="grid grid-cols-3 items-center gap-2 mb-6">
                                {/* Team A */}
                                <div className="text-center">
                                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold text-lg mb-2 shadow-sm overflow-hidden ${
                                    theme === "black" ? "bg-zinc-900 border border-zinc-800 text-zinc-100" : "bg-zinc-100 border border-zinc-200 text-zinc-900"
                                  }`}>
                                    {match.logoA ? (
                                      <img 
                                        src={match.logoA} 
                                        alt={teamAName} 
                                        className="w-8 h-8 object-contain"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = ""; // Clear src if loading fails
                                        }}
                                      />
                                    ) : (
                                      teamAName.charAt(0)
                                    )}
                                  </div>
                                  <p className="text-xs font-bold truncate">{teamAName}</p>
                                </div>

                                {/* Play Button instead of Score */}
                                <div className="text-center flex flex-col items-center justify-center">
                                  {shouldShowPlayButton(match) ? (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setStreamingMatch(match);
                                          setStreamUrl(match.streamUrl || "");
                                          setStreamType(match.streamType || "iframe");
                                          setIsStreamModalOpen(true);
                                        }}
                                        className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:scale-110 active:scale-95 group/play border border-amber-600/15"
                                        title={lang === "ar" ? "تشغيل البث المباشر" : "Watch Live Stream"}
                                      >
                                        <Play className="w-5 h-5 fill-current ml-0.5 text-black" />
                                      </button>
                                      <span className="text-[10px] font-black text-amber-500 mt-2.5 block tracking-wider uppercase animate-pulse">
                                        {userRole === "viewer" && !getStreamAvailability(match, currentTime).isAvailable
                                          ? (lang === "ar" ? "يفتح قبل 15د" : "Opens in 15m")
                                          : (lang === "ar" ? "بث مباشر" : "Live Stream")}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                                        <span className="text-lg font-black font-mono tracking-tight text-white">{match.scoreA !== undefined ? match.scoreA : 0}</span>
                                        <span className="text-zinc-500 font-bold text-sm">:</span>
                                        <span className="text-lg font-black font-mono tracking-tight text-white">{match.scoreB !== undefined ? match.scoreB : 0}</span>
                                      </div>
                                      <span className={`text-[9px] font-extrabold mt-2.5 px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
                                        match.status === "ended" 
                                          ? "bg-zinc-900/50 text-zinc-500 border-zinc-850" 
                                          : "bg-amber-500/5 text-amber-500/70 border-amber-500/10"
                                      }`}>
                                        {match.status === "ended" 
                                          ? (lang === "ar" ? "انتهت" : "Ended") 
                                          : (lang === "ar" ? "قريباً" : "Upcoming")}
                                      </span>
                                    </>
                                  )}
                                </div>

                                {/* Team B */}
                                <div className="text-center">
                                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold text-lg mb-2 shadow-sm overflow-hidden ${
                                    theme === "black" ? "bg-zinc-900 border border-zinc-800 text-zinc-100" : "bg-zinc-100 border border-zinc-200 text-zinc-900"
                                  }`}>
                                    {match.logoB ? (
                                      <img 
                                        src={match.logoB} 
                                        alt={teamBName} 
                                        className="w-8 h-8 object-contain"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = ""; // Clear src if loading fails
                                        }}
                                      />
                                    ) : (
                                      teamBName.charAt(0)
                                    )}
                                  </div>
                                  <p className="text-xs font-bold truncate">{teamBName}</p>
                                </div>
                              </div>

                              {/* Venue & League Details */}
                              <div className={`flex items-center justify-between gap-4 pt-4 border-t text-[11px] ${
                                theme === "black" ? "border-zinc-900/80 text-zinc-500" : "border-zinc-100 text-zinc-500"
                              }`}>
                                <div className="flex items-center gap-1.5 truncate">
                                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                  <span className="font-medium truncate">{venueString}</span>
                                </div>
                                {match.leagueName && (
                                  <div className="flex items-center gap-1.5 shrink-0 max-w-[50%]">
                                    {match.leagueLogo && (
                                      <img 
                                        src={match.leagueLogo} 
                                        alt="League" 
                                        className="w-3.5 h-3.5 object-contain"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <span className="font-bold opacity-85 text-[10px] truncate">{getTranslation(match.leagueName)}</span>
                                  </div>
                                )}
                              </div>

                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-1 lg:col-span-2 text-center py-16">
                          <Tv className="w-12 h-12 mx-auto text-zinc-650 mb-3 stroke-1" />
                          <p className={`text-sm ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.noResults}</p>
                        </div>
                      )}

                    </div>

              </motion.div>
            )}

            {/* 2. CINEMA TAB CONTENT (Embedded Iframe for CinemaOS) */}
            {activeTab === "cinema" && (
              <motion.div
                key="cinema-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Fullscreen Mobile & Tablet View for Cinema */}
                {cinemaWindowMode === "fullscreen" && (isMobile || isTablet) ? (
                  <div className="fixed inset-0 z-[100] bg-black w-screen h-screen flex flex-col p-0 m-0 overflow-hidden">
                    {/* Fullscreen Header */}
                    <div className="p-3 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <Film className="w-5 h-5 text-red-500 animate-pulse" />
                        <span className="text-xs font-black text-white">CinemaOS - {lang === "ar" ? "شاشة كاملة" : "Fullscreen"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCinemaWindowMode("inline")}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md border border-zinc-700 hover:bg-zinc-700 cursor-pointer"
                        >
                          <Minimize2 className="w-4 h-4" />
                          <span>{lang === "ar" ? "خروج من الشاشة الكاملة" : "Exit Fullscreen"}</span>
                        </button>
                        <button
                          onClick={() => setCinemaWindowMode("inline")}
                          className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {/* Fullscreen Iframe */}
                    <div className="flex-1 w-full h-full bg-black">
                      <iframe
                        id="cinemaos-fullscreen-iframe"
                        src="https://cinemaos.live/"
                        title="CinemaOS Fullscreen Client"
                        className="w-full h-full border-none bg-black"
                        allow="autoplay; encrypted-media; fullscreen"
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-3xl border overflow-hidden ${
                    theme === "black" 
                      ? "bg-zinc-950/80 border-zinc-800" 
                      : "bg-white border-zinc-200 shadow-sm"
                  }`}>
                    {/* Iframe navigation/header utility */}
                    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 mb-4 border-b ${
                      theme === "black" ? "border-zinc-900" : "border-zinc-100"
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${
                          theme === "black" ? "bg-red-500/10 text-red-500" : "bg-zinc-100 text-zinc-900"
                        }`}>
                          <Film className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold tracking-tight">CinemaOS</h3>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {lang === "ar" ? "اتصال آمن" : "Secure Link"}
                            </span>
                          </div>
                          <p className={`text-[10px] ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            cinemaos.live
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
                        {/* Fullscreen button ONLY for Mobile & Tablet (Hidden on Desktop / Computer) */}
                        {(isMobile || isTablet) && (
                          <button
                            onClick={() => setCinemaWindowMode("fullscreen")}
                            className="p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-md shadow-amber-500/20 cursor-pointer"
                            title={lang === "ar" ? "عرض شاشة كاملة" : "Fullscreen"}
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "شاشة كاملة" : "Fullscreen"}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const iframe = document.getElementById("cinemaos-iframe") as HTMLIFrameElement;
                            if (iframe) iframe.src = "https://cinemaos.live/";
                          }}
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                            theme === "black" 
                              ? "bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-850" 
                              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200"
                          }`}
                          title={lang === "ar" ? "الرئيسية" : "Home"}
                        >
                          <Home className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">{lang === "ar" ? "الرئيسية" : "Home"}</span>
                        </button>

                        <a
                          href="https://cinemaos.live/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                            theme === "black" 
                              ? "bg-white hover:bg-zinc-200 text-black border border-white" 
                              : "bg-zinc-950 hover:bg-zinc-800 text-white"
                          }`}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">{lang === "ar" ? "فتح خارجي" : "Open Tab"}</span>
                        </a>
                      </div>
                    </div>

                    {/* Fully responsive sandbox safe iframe */}
                    <div className={`relative w-full rounded-2xl overflow-hidden border ${
                      theme === "black" ? "border-zinc-900 bg-[#020202]" : "border-zinc-100 bg-slate-50"
                    }`}>
                      <iframe
                        id="cinemaos-iframe"
                        src="https://cinemaos.live/"
                        title="CinemaOS live client"
                        className="w-full h-[650px] md:h-[780px] lg:h-[850px] border-none"
                        allow="autoplay; encrypted-media; fullscreen"
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. ALL CHANNELS TAB CONTENT (جميع القنوات) */}
            {activeTab === "channels" && (
              <motion.div
                key="channels-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* SUBSCRIPTION GATE FOR CHANNELS (If NOT authorized & gate is enabled) */}
                {!isAuthorizedForChannels ? (
                  <div className={`p-6 sm:p-10 rounded-3xl border relative overflow-hidden shadow-2xl space-y-8 ${
                    theme === "black"
                      ? "border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 via-zinc-950/90 to-zinc-950"
                      : "border-cyan-200 bg-gradient-to-b from-cyan-50/70 via-white to-zinc-50 shadow-xl"
                  }`}>
                    {/* Background glow orb */}
                    <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 text-center max-w-2xl mx-auto space-y-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-black flex items-center justify-center shadow-xl shadow-cyan-500/25 animate-pulse">
                        <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>

                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-500 text-xs font-black uppercase tracking-wider">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{lang === "ar" ? "باقة القنوات التلفزيونية المشفرة VIP" : "VIP TV Channels Access"}</span>
                      </div>

                      <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${theme === "black" ? "text-white" : "text-zinc-950"}`}>
                        {subscriptionSettings?.title?.[lang] || (lang === "ar" ? "تفعيل اشتراك باقة القنوات التلفزيونية VIP" : "VIP TV Channels Subscription Activation")}
                      </h3>

                      <p className={`text-xs sm:text-sm leading-relaxed ${theme === "black" ? "text-zinc-300" : "text-zinc-600"}`}>
                        {subscriptionSettings?.description?.[lang] || (lang === "ar" 
                          ? "يرجى إدخال كود التفعيل للوصول إلى قائمة جميع القنوات التلفزيونية والبث المباشر عالي الجودة."
                          : "Please enter your activation code to access all live TV channels and ultra HD streams.")}
                      </p>
                    </div>

                    {/* Activation Code Form */}
                    <div className={`relative z-10 max-w-md mx-auto p-5 sm:p-6 rounded-2xl shadow-xl space-y-4 border ${
                      theme === "black" ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-zinc-200 shadow-md"
                    }`}>
                      {activationError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{activationError}</span>
                        </div>
                      )}

                      {activationSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{activationSuccess}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className={`text-[11px] font-extrabold uppercase tracking-wider block ${theme === "black" ? "text-zinc-400" : "text-zinc-600"}`}>
                          {lang === "ar" ? "أدخل كود الاشتراك (Activation Code):" : "Enter Activation Code:"}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            dir="ltr"
                            value={activationCodeInput}
                            onChange={(e) => setActivationCodeInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleVerifyActivationCode();
                              }
                            }}
                            placeholder="VIP-XXXX-XXXX"
                            className={`w-full px-4 py-3 rounded-xl text-center font-mono font-black text-base tracking-widest uppercase focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 border ${
                              theme === "black"
                                ? "bg-zinc-950 border-zinc-700 text-white"
                                : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:bg-white"
                            }`}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVerifyActivationCode()}
                        disabled={isVerifyingCode}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-sm font-black transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                      >
                        {isVerifyingCode ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{lang === "ar" ? "جاري التحقق من الكود..." : "Verifying Code..."}</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4" />
                            <span>{lang === "ar" ? "تفعيل الاشتراك والدخول للقنوات" : "Activate Subscription & Access Channels"}</span>
                          </>
                        )}
                      </button>

                      {/* Contact support button to buy code */}
                      <div className={`pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
                        theme === "black" ? "border-zinc-800" : "border-zinc-200"
                      }`}>
                        <span className={`text-[11px] ${theme === "black" ? "text-zinc-400" : "text-zinc-500"}`}>
                          {lang === "ar" ? "لا تمتلك كود اشتراك؟" : "Don't have an activation code?"}
                        </span>
                        <a
                          href={subscriptionSettings.supportContact || "https://wa.me/966500000000"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 border border-emerald-500/30 font-bold flex items-center gap-1.5 transition"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>{lang === "ar" ? "طلب كود تفعيل فوري" : "Get Activation Code"}</span>
                        </a>
                      </div>
                    </div>

                    {/* VIP Promotion & Features Grid */}
                    <div className="relative z-10 space-y-6 pt-2 max-w-4xl mx-auto">
                      {/* Section Title */}
                      <div className="text-center space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-black">
                          <Crown className="w-3.5 h-3.5" />
                          <span>{lang === "ar" ? "مميزات باقة VIP الحصرية" : "Exclusive VIP Features"}</span>
                        </div>
                        <h4 className={`text-base sm:text-lg font-black ${theme === "black" ? "text-white" : "text-zinc-950"}`}>
                          {lang === "ar" ? "لماذا تختار اشتراك القنوات VIP معنا؟" : "Why Choose Our VIP TV Subscription?"}
                        </h4>
                      </div>

                      {/* 4 Core Features Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {/* 1. جميع القنوات حول العالم */}
                        <div className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-3 transition-all duration-300 hover:scale-[1.02] ${
                          theme === "black" 
                            ? "bg-zinc-900/70 border-zinc-800/90 hover:border-cyan-500/40 hover:bg-zinc-900" 
                            : "bg-white border-zinc-200 shadow-sm hover:border-cyan-400 hover:shadow-md"
                        }`}>
                          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shadow-inner">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h5 className={`text-xs font-black ${theme === "black" ? "text-white" : "text-zinc-900"}`}>
                              {lang === "ar" ? "1. جميع القنوات حول العالم" : "1. Worldwide TV Channels"}
                            </h5>
                            <p className={`text-[11px] leading-relaxed ${theme === "black" ? "text-zinc-400" : "text-zinc-500"}`}>
                              {lang === "ar" 
                                ? "آلاف القنوات الرياضية، الإخبارية، الترفيهية، والأفلام المشفرة من كافة دول العالم."
                                : "Thousands of premium global sports, news, cinema, and entertainment channels."}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                            {lang === "ar" ? "تغطية عالمية" : "Global"}
                          </span>
                        </div>

                        {/* 2. خدمة سلسة وسريعة */}
                        <div className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-3 transition-all duration-300 hover:scale-[1.02] ${
                          theme === "black" 
                            ? "bg-zinc-900/70 border-zinc-800/90 hover:border-amber-500/40 hover:bg-zinc-900" 
                            : "bg-white border-zinc-200 shadow-sm hover:border-amber-400 hover:shadow-md"
                        }`}>
                          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h5 className={`text-xs font-black ${theme === "black" ? "text-white" : "text-zinc-900"}`}>
                              {lang === "ar" ? "2. خدمة سلسة وسريعة" : "2. Fast & Smooth Service"}
                            </h5>
                            <p className={`text-[11px] leading-relaxed ${theme === "black" ? "text-zinc-400" : "text-zinc-500"}`}>
                              {lang === "ar" 
                                ? "سيرفرات فائقة السرعة مع تبديل فوري بين السيرفرات لضمان عدم التقطيع أثناء الضغط."
                                : "High-speed multi-servers ensuring zero buffering and instant responsive switching."}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {lang === "ar" ? "بدون تقطيع" : "Zero Buffering"}
                          </span>
                        </div>

                        {/* 3. دقة 4K فائقة الوضوح */}
                        <div className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-3 transition-all duration-300 hover:scale-[1.02] ${
                          theme === "black" 
                            ? "bg-zinc-900/70 border-zinc-800/90 hover:border-emerald-500/40 hover:bg-zinc-900" 
                            : "bg-white border-zinc-200 shadow-sm hover:border-emerald-400 hover:shadow-md"
                        }`}>
                          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-inner">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h5 className={`text-xs font-black ${theme === "black" ? "text-white" : "text-zinc-900"}`}>
                              {lang === "ar" ? "3. دقة 4K فائقة الوضوح" : "3. Ultra 4K & FHD Quality"}
                            </h5>
                            <p className={`text-[11px] leading-relaxed ${theme === "black" ? "text-zinc-400" : "text-zinc-500"}`}>
                              {lang === "ar" 
                                ? "أعلى جودة بث مرئي وصوتي نقي بدقة 4K و FHD مع دعم الشاشات الذكية والجوالات."
                                : "Crisp 4K UHD and FHD stream resolutions with rich immersive multi-channel sound."}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            4K Ultra HD
                          </span>
                        </div>

                        {/* 4. إزالة الإعلانات من الموقع لتجربة سلسة */}
                        <div className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-3 transition-all duration-300 hover:scale-[1.02] ${
                          theme === "black" 
                            ? "bg-zinc-900/70 border-zinc-800/90 hover:border-purple-500/40 hover:bg-zinc-900" 
                            : "bg-white border-zinc-200 shadow-sm hover:border-purple-400 hover:shadow-md"
                        }`}>
                          <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500 shadow-inner">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h5 className={`text-xs font-black ${theme === "black" ? "text-white" : "text-zinc-900"}`}>
                              {lang === "ar" ? "4. إزالة الإعلانات بالكامل" : "4. 100% Ad-Free Experience"}
                            </h5>
                            <p className={`text-[11px] leading-relaxed ${theme === "black" ? "text-zinc-400" : "text-zinc-500"}`}>
                              {lang === "ar" 
                                ? "تجربة تصفح ومشاهدة نقية 100% بدون أي إعلانات مزعجة أو نوافذ منبثقة."
                                : "Pure distraction-free viewing with zero popup ads or banner interruptions."}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                            {lang === "ar" ? "بدون إعلانات" : "Ad-Free"}
                          </span>
                        </div>
                      </div>

                      {/* Promotion Action Buttons (Subscribe / Free Trial) */}
                      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                        theme === "black"
                          ? "bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-amber-950/30 border-zinc-800"
                          : "bg-gradient-to-r from-cyan-50/80 via-white to-amber-50/80 border-zinc-200 shadow-sm"
                      }`}>
                        <div className="text-center sm:text-start space-y-0.5">
                          <h5 className={`text-xs sm:text-sm font-black ${theme === "black" ? "text-white" : "text-zinc-950"}`}>
                            {lang === "ar" ? "جاهز للاستمتاع بأفضل تجربة مشاهدة؟" : "Ready for the Ultimate TV Experience?"}
                          </h5>
                          <p className={`text-[11px] ${theme === "black" ? "text-zinc-400" : "text-zinc-600"}`}>
                            {lang === "ar" 
                              ? "اختر باقتك المفضلة الآن أو اطلب تجربة مجانية لاختبار الجودة فوراً."
                              : "Choose your plan or request a free test trial right now."}
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                          {/* Free Trial Button */}
                          <a
                            href={
                              subscriptionSettings.supportContact?.includes("wa.me")
                                ? `${subscriptionSettings.supportContact}?text=${encodeURIComponent(lang === "ar" ? "مرحباً، أود طلب تجربة مجانية لباقة القنوات VIP" : "Hello, I would like to request a Free Trial for VIP Channels")}`
                                : subscriptionSettings.supportContact || "https://wa.me/966500000000"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                              theme === "black"
                                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700 hover:border-zinc-500"
                                : "bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 shadow-sm"
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>{lang === "ar" ? "طلب تجربة مجانية" : "Free Trial"}</span>
                          </a>

                          {/* Subscribe Now Button */}
                          <a
                            href={
                              subscriptionSettings.supportContact?.includes("wa.me")
                                ? `${subscriptionSettings.supportContact}?text=${encodeURIComponent(lang === "ar" ? "مرحباً، أريد الاشتراك في باقة القنوات VIP والحصول على كود التفعيل" : "Hello, I want to subscribe to VIP Channels and get an activation code")}`
                                : subscriptionSettings.supportContact || "https://wa.me/966500000000"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 cursor-pointer"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "اشترك الآن VIP" : "Subscribe Now"}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* VIP SUBSCRIPTION ACTIVE BAR (When Authorized) */}
                    <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-md ${
                      theme === "black"
                        ? "bg-gradient-to-r from-cyan-500/10 via-zinc-900 to-zinc-950 border-cyan-500/30"
                        : "bg-gradient-to-r from-cyan-50 via-white to-zinc-50 border-cyan-200 shadow-sm text-zinc-900"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-500 shrink-0">
                          <BadgeCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black ${theme === "black" ? "text-white" : "text-zinc-900"}`}>
                              {userRole === "admin" 
                                ? (lang === "ar" ? "وصول مدير النظام الكامل لجميع القنوات" : "Admin Full Channels Access")
                                : (lang === "ar" ? "اشتراك باقة القنوات VIP نشط" : "VIP Channels Subscription Active")
                              }
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px] font-extrabold">
                              {userRole === "admin"
                                ? (lang === "ar" ? "مدير النظام" : "Admin")
                                : (subscriptionData?.isLifetime ? (lang === "ar" ? "دائم مدى الحياة" : "Lifetime") : (lang === "ar" ? `متبقي ${subscriptionData?.remainingDays || 30} يوم` : `${subscriptionData?.remainingDays || 30} days left`))
                              }
                            </span>
                          </div>
                          <p className={`text-[10px] mt-0.5 ${theme === "black" ? "text-zinc-400" : "text-zinc-500"}`}>
                            {userRole === "admin"
                              ? (lang === "ar" ? "لديك صلاحيات كاملة لمشاهدة وإدارة وتعديل جميع القنوات." : "Full permissions to manage and watch all channels.")
                              : (lang === "ar" ? `كود الاشتراك: ${subscriptionData?.code}` : `Code: ${subscriptionData?.code}`)
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {userRole !== "admin" && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsConfirmingLogoutSubscription(false);
                              setIsSubscriptionDetailsOpen(true);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                              theme === "black"
                                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                                : "bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 shadow-sm"
                            }`}
                          >
                            <KeyRound className="w-3.5 h-3.5 text-cyan-500" />
                            <span>{lang === "ar" ? "تفاصيل الاشتراك" : "Subscription Info"}</span>
                          </button>
                        )}
                        {userRole === "admin" && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsAdminOpen(true);
                              setAdminModalTab("subscriptions");
                              fetchSubscriptionCodes();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "إدارة الأكواد" : "Manage Codes"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Fullscreen Mobile & Tablet View for Active Channel */}
                    {channelWindowMode === "fullscreen" && selectedPlayingChannel && (
                  <div className="fixed inset-0 z-[100] bg-black w-screen h-screen flex flex-col p-0 m-0 overflow-hidden">
                    {/* Fullscreen Header */}
                    <div className="p-3 bg-zinc-950/95 border-b border-zinc-800 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden">
                          {selectedPlayingChannel.logo ? (
                            <img
                              src={selectedPlayingChannel.logo}
                              alt={selectedPlayingChannel.name[lang] || selectedPlayingChannel.name.en}
                              className="w-full h-full object-contain p-1"
                              referrerPolicy="no-referrer"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <Tv className="w-4 h-4 text-cyan-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">
                              {selectedPlayingChannel.name[lang] || selectedPlayingChannel.name.en}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-600 text-white flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              LIVE
                            </span>
                          </div>
                          {selectedPlayingChannel.currentProgram && (
                            <p className="text-[10px] text-zinc-400 truncate max-w-xs">
                              {selectedPlayingChannel.currentProgram[lang] || selectedPlayingChannel.currentProgram.en}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Server Selection in Fullscreen */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedPlayingChannel.streams && selectedPlayingChannel.streams.length > 1 && (
                          <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
                            <span className="text-[10px] font-black text-zinc-400 px-1.5 hidden md:inline">
                              {lang === "ar" ? "السيرفر:" : "Server:"}
                            </span>
                            {selectedPlayingChannel.streams.map((st, idx) => (
                              <button
                                key={idx}
                                onClick={() => setChannelServerIndex(idx)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  channelServerIndex === idx
                                    ? "bg-cyan-500 text-black font-black shadow-sm"
                                    : "text-zinc-400 hover:text-white"
                                }`}
                              >
                                <Radio className={`w-3 h-3 ${channelServerIndex === idx ? "text-black animate-pulse" : "text-zinc-500"}`} />
                                <span>{st.name[lang] || st.name.en || `${t.server} ${idx + 1}`}</span>
                                {st.quality && (
                                  <span className="text-[9px] opacity-75">({st.quality})</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => setChannelWindowMode("inline")}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md border border-zinc-700 hover:bg-zinc-700 cursor-pointer"
                        >
                          <Minimize2 className="w-4 h-4" />
                          <span className="hidden xs:inline">{lang === "ar" ? "خروج من الشاشة الكاملة" : "Exit Fullscreen"}</span>
                        </button>

                        <button
                          onClick={() => setChannelWindowMode("inline")}
                          className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Fullscreen Player Stream */}
                    <div className="flex-1 w-full h-full bg-black relative flex items-center justify-center">
                      {(() => {
                        const currentStream = selectedPlayingChannel.streams?.[channelServerIndex] || selectedPlayingChannel.streams?.[0];
                        const streamUrl = currentStream?.url || "";
                        const streamType = currentStream?.type || "hls";

                        if (isStreamVideoOrHls(streamUrl, streamType)) {
                          return (
                            <HlsVideoPlayer
                              src={streamUrl}
                              className="w-full h-full object-contain"
                              lang={lang}
                            />
                          );
                        } else {
                          return (
                            <iframe
                              id="channel-fullscreen-iframe"
                              src={streamUrl}
                              title={selectedPlayingChannel.name[lang] || selectedPlayingChannel.name.en}
                              className="w-full h-full border-none bg-black"
                              allow="autoplay; encrypted-media; fullscreen"
                              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                            />
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}

                {/* 1. TOP LIVE PLAYER HERO (When a channel is selected) */}
                {selectedPlayingChannel && (
                  <div 
                    ref={channelPlayerRef}
                    className={`rounded-3xl border overflow-hidden transition-all duration-500 shadow-xl ${
                      theme === "black" 
                        ? "border-cyan-500/30 bg-gradient-to-b from-zinc-900/90 to-black shadow-cyan-950/20" 
                        : "border-cyan-200 bg-gradient-to-b from-white to-slate-50 shadow-cyan-100/50"
                    }`}
                  >
                    {/* Player Top Navigation & Channel Meta */}
                    <div className={`p-4 md:p-5 flex items-center justify-between gap-4 border-b ${
                      theme === "black" ? "border-zinc-800 bg-zinc-950/80" : "border-zinc-200 bg-white"
                    }`}>
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl border flex items-center justify-center relative overflow-hidden shrink-0 ${
                          selectedPlayingChannel.logo ? "p-0" : "p-1.5"
                        } ${
                          theme === "black" ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-200 shadow-sm"
                        }`}>
                          {selectedPlayingChannel.logo ? (
                            <img
                              src={selectedPlayingChannel.logo}
                              alt={selectedPlayingChannel.name[lang] || selectedPlayingChannel.name.en}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <Tv className="w-5 h-5 text-cyan-500" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg md:text-xl font-black">
                              {selectedPlayingChannel.name[lang] || selectedPlayingChannel.name.en}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-600 text-white flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              LIVE
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {selectedPlayingChannel.quality || "FHD"}
                            </span>
                          </div>
                          {selectedPlayingChannel.currentProgram && (
                            <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                              <Radio className="w-3 h-3 text-red-500 shrink-0" />
                              <span>{selectedPlayingChannel.currentProgram[lang] || selectedPlayingChannel.currentProgram.en}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Server Switcher Controls */}
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {selectedPlayingChannel.streams && selectedPlayingChannel.streams.length > 0 && (
                          <div className={`flex items-center gap-1 p-1 rounded-2xl border ${
                            theme === "black" ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200"
                          }`}>
                            <span className="text-[10px] font-black text-zinc-400 px-2 hidden sm:inline">
                              {lang === "ar" ? "السيرفرات:" : "Servers:"}
                            </span>
                            {selectedPlayingChannel.streams.map((st, idx) => (
                              <button
                                key={idx}
                                onClick={() => setChannelServerIndex(idx)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                                  channelServerIndex === idx
                                    ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                                    : theme === "black"
                                      ? "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                      : "text-zinc-600 hover:text-black hover:bg-white"
                                }`}
                              >
                                <Radio className={`w-3 h-3 ${channelServerIndex === idx ? "animate-pulse text-black" : "text-zinc-500"}`} />
                                <span>{st.name[lang] || st.name.en || `${t.server} ${idx + 1}`}</span>
                                {st.quality && (
                                  <span className={`text-[9px] px-1 rounded font-mono ${channelServerIndex === idx ? "bg-black/20 text-black font-black" : "text-zinc-500"}`}>
                                    {st.quality}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Close Player Button */}
                        <button
                          onClick={() => setSelectedPlayingChannel(null)}
                          className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                          title={lang === "ar" ? "إغلاق المشغل" : "Close Player"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Live Stream Screen */}
                    <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                      {(() => {
                        const currentStream = selectedPlayingChannel.streams?.[channelServerIndex] || selectedPlayingChannel.streams?.[0];
                        const streamUrl = currentStream?.url || "";
                        const streamType = currentStream?.type || "hls";

                        if (!streamUrl) {
                          return (
                            <div className="text-center p-8 text-zinc-500">
                              <Tv className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p className="text-xs">{lang === "ar" ? "لا يتوفر رابط بث مباشر لهذا السيرفر" : "No stream URL available for this server"}</p>
                            </div>
                          );
                        }

                        if (isStreamVideoOrHls(streamUrl, streamType)) {
                          return (
                            <HlsVideoPlayer
                              key={`${selectedPlayingChannel.id}-${channelServerIndex}`}
                              src={streamUrl}
                              className="w-full h-full object-contain"
                              lang={lang}
                            />
                          );
                        } else {
                          return (
                            <iframe
                              key={`${selectedPlayingChannel.id}-${channelServerIndex}`}
                              id="channel-inline-iframe"
                              src={streamUrl}
                              title={selectedPlayingChannel.name[lang] || selectedPlayingChannel.name.en}
                              className="w-full h-full border-none bg-black"
                              allow="autoplay; encrypted-media; fullscreen"
                              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                            />
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}

                {/* 2. SEARCH & CATEGORIES NAVIGATION BAR */}
                <div className={`p-4 md:p-6 rounded-3xl border transition-all duration-300 ${
                  theme === "black" ? "bg-zinc-950/80 border-zinc-900" : "bg-white border-zinc-200 shadow-sm"
                }`}>
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Search Field */}
                    <div className="relative flex-1">
                      <Search className={`w-4 h-4 absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-zinc-400`} />
                      <input
                        type="text"
                        placeholder={t.searchChannels}
                        value={channelsSearch}
                        onChange={(e) => setChannelsSearch(e.target.value)}
                        className={`w-full text-xs font-medium rounded-2xl py-3 ${
                          lang === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'
                        } border transition-all outline-none ${
                          theme === "black"
                            ? "bg-zinc-900/90 border-zinc-800 focus:border-cyan-500 text-white placeholder-zinc-500"
                            : "bg-zinc-50 border-zinc-200 focus:border-cyan-600 text-zinc-900 placeholder-zinc-400"
                        }`}
                      />
                      {channelsSearch && (
                        <button
                          onClick={() => setChannelsSearch("")}
                          className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Channels Count Badge */}
                    <div className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 border ${
                      theme === "black" ? "bg-zinc-900/60 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                    }`}>
                      <Tv className="w-4 h-4 text-cyan-500" />
                      <span>{filteredChannels.length} {lang === "ar" ? "قناة متوفرة" : "channels available"}</span>
                    </div>
                  </div>

                  {/* Category Pills Bar */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-4 scrollbar-none">
                    {channelCategories.map((cat) => {
                      const isActive = selectedChannelCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedChannelCategory(cat.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all duration-300 cursor-pointer ${
                            isActive
                              ? theme === "black"
                                ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                                : "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                              : theme === "black"
                                ? "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-850"
                                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 border border-zinc-200"
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. CHANNELS GRID LIST */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredChannels.length > 0 ? (
                    filteredChannels.map((channel) => {
                      const isPlaying = selectedPlayingChannel?.id === channel.id;
                      const channelName = channel.name[lang] || channel.name.en;
                      const categoryName = channel.categoryName[lang] || channel.categoryName.en;
                      const countryName = channel.country ? (channel.country[lang] || channel.country.en) : "";
                      const currentProg = channel.currentProgram ? (channel.currentProgram[lang] || channel.currentProgram.en) : "";

                      return (
                        <div
                          key={channel.id}
                          id={`channel-card-${channel.id}`}
                          className={`group rounded-3xl border transition-all duration-300 p-5 flex flex-col justify-between relative overflow-hidden ${
                            isPlaying
                              ? theme === "black"
                                ? "bg-gradient-to-b from-zinc-900 to-black border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/40"
                                : "bg-white border-cyan-500 shadow-lg ring-1 ring-cyan-500/40"
                              : theme === "black"
                                ? "bg-zinc-950/70 border-zinc-900 hover:border-zinc-700 hover:shadow-lg hover:shadow-cyan-950/10"
                                : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-md"
                          }`}
                        >
                          {/* Top Header inside Card */}
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-4">
                              {/* Channel Logo */}
                              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center relative overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                                channel.logo ? "p-0" : "p-2"
                              } ${
                                isPlaying
                                  ? theme === "black" ? "bg-zinc-900 border-cyan-500/50 shadow-md shadow-cyan-500/10" : "bg-white border-cyan-500 shadow-sm"
                                  : theme === "black" ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200 shadow-sm"
                              }`}>
                                {channel.logo ? (
                                  <img
                                    src={channel.logo}
                                    alt={channelName}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                ) : (
                                  <Tv className="w-6 h-6 text-cyan-500" />
                                )}
                              </div>

                              {/* Badges */}
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-600 text-white flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  LIVE
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border ${
                                  theme === "black" ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600"
                                }`}>
                                  {channel.quality || "FHD"}
                                </span>
                              </div>
                            </div>

                            {/* Channel Details */}
                            <div className="mb-4">
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                  theme === "black" ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-50 text-cyan-700"
                                }`}>
                                  {categoryName}
                                </span>
                                {countryName && (
                                  <span className={`text-[10px] font-medium ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    • {countryName}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-base font-black truncate group-hover:text-cyan-400 transition-colors">
                                {channelName}
                              </h4>

                              {currentProg && (
                                <p className={`text-xs mt-1.5 line-clamp-1 font-medium flex items-center gap-1 ${
                                  theme === 'black' ? 'text-zinc-400' : 'text-zinc-600'
                                }`}>
                                  <Radio className="w-2.5 h-2.5 text-red-500 shrink-0" />
                                  <span className="truncate">{currentProg}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Server Selection Pills if multiple streams exist */}
                          {channel.streams && channel.streams.length > 1 && (
                            <div className="pt-2.5 pb-1 flex flex-wrap items-center gap-1.5 border-t border-dashed border-zinc-800/60">
                              <span className={`text-[10px] font-black ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                {lang === "ar" ? "السيرفر:" : "Server:"}
                              </span>
                              {channel.streams.map((st, sIdx) => {
                                const isThisServerActive = isPlaying && channelServerIndex === sIdx;
                                return (
                                  <button
                                    key={sIdx}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePlayChannel(channel, sIdx);
                                    }}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                                      isThisServerActive
                                        ? "bg-cyan-500 text-black shadow-sm font-black"
                                        : theme === "black"
                                          ? "bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                                          : "bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200 border border-zinc-200"
                                    }`}
                                    title={st.name[lang] || st.name.en || `Server ${sIdx + 1}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${isThisServerActive ? "bg-black animate-pulse" : "bg-zinc-500"}`} />
                                    <span>{st.name[lang] || st.name.en || `${sIdx + 1}`}</span>
                                    {st.quality && (
                                      <span className="text-[9px] opacity-70">({st.quality})</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Footer Actions inside Card */}
                          <div className="pt-3 border-t border-dashed flex items-center justify-between gap-2 border-zinc-800/60">
                            <span className={`text-[10px] font-bold ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              {channel.streams?.length || 1} {lang === "ar" ? "سيرفرات بث" : "streams"}
                            </span>

                            <button
                              id={`play-channel-${channel.id}`}
                              onClick={() => handlePlayChannel(channel, isPlaying ? channelServerIndex : 0)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                                isPlaying
                                  ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                                  : theme === "black"
                                    ? "bg-zinc-900 hover:bg-cyan-500 hover:text-black text-white border border-zinc-800 hover:border-cyan-500"
                                    : "bg-zinc-900 hover:bg-cyan-600 text-white shadow-sm"
                              }`}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{isPlaying ? (lang === "ar" ? "قيد التشغيل" : "Playing") : t.watchChannel}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-16">
                      <Tv className="w-12 h-12 mx-auto text-zinc-600 mb-3 stroke-1" />
                      <p className={`text-sm ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {t.noChannelsFound}
                      </p>
                      {channelsSearch && (
                        <button
                          onClick={() => {
                            setChannelsSearch("");
                            setSelectedChannelCategory("all");
                          }}
                          className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 text-black cursor-pointer"
                        >
                          {lang === "ar" ? "إلغاء البحث" : "Clear Search"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

          </AnimatePresence>
        </div>

      </div>



      {/* BOOKING MODAL (TICKET SELECTOR) */}
      <AnimatePresence>
        {selectedMovieForBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMovieForBooking(null)}
              className="absolute inset-0 bg-black/80 md:backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative z-10 w-full max-w-lg rounded-3xl p-6 md:p-8 border shadow-2xl overflow-hidden md:backdrop-blur-2xl transition-all duration-500 ${
                theme === "black"
                  ? "bg-zinc-950 border-white/[0.08] text-zinc-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              
              {/* Close button */}
              <button
                id="btn-close-booking"
                onClick={() => setSelectedMovieForBooking(null)}
                className={`absolute top-4 ${lang === "ar" ? "left-4" : "right-4"} p-2 rounded-xl transition-all ${
                  theme === "black" ? "hover:bg-white/10 text-zinc-400 hover:text-zinc-100" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Status Header */}
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-widest font-black text-amber-500">
                  {t.ticketBooking}
                </span>
                <h4 className="text-xl font-black mt-1">
                  {selectedMovieForBooking.title[lang]}
                </h4>
                <p className={`text-xs mt-1 font-bold ${theme === 'black' ? 'text-zinc-500' : 'text-slate-400'}`}>
                  {selectedMovieForBooking.genreText[lang]} • {selectedMovieForBooking.price} {t.currency}
                </p>
              </div>

              {/* Success Screen */}
              {bookingCompleted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h5 className="text-lg font-black text-emerald-400">{t.bookingSuccess}</h5>
                  <p className={`text-xs mt-2 font-bold ${theme === 'black' ? 'text-zinc-500' : 'text-slate-400'}`}>
                    {t.bookingFor} {selectedMovieForBooking.title[lang]} ({selectedSeats.join(", ")})
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Select Showtime */}
                  <div>
                    <span className="text-xs font-black block mb-2">{t.showtimes}</span>
                    <div className="flex gap-2 flex-wrap">
                      {selectedMovieForBooking.showtimes.map((st, index) => (
                        <button
                          key={`${st}-${index}`}
                          onClick={() => setSelectedShowtime(st)}
                          className={`px-3.5 py-2.5 text-xs font-mono font-black rounded-xl border transition-all cursor-pointer ${
                            selectedShowtime === st
                              ? "bg-amber-500 border-amber-500 text-black shadow-md shadow-amber-500/10"
                              : theme === "black"
                                ? "bg-white/[0.03] border-white/[0.05] text-zinc-300 hover:border-white/[0.12]"
                                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-250"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seat Map */}
                  <div>
                    <span className="text-xs font-black block mb-2">{t.selectSeat}</span>
                    
                    {/* Screens Indicator */}
                    <div className="w-full text-center py-1 rounded-sm text-[9px] font-black tracking-widest uppercase mb-4 opacity-50 border-b border-dashed border-white/10">
                      {lang === "ar" ? "شاشة العرض" : "Cinema Screen"}
                    </div>

                    {/* Seat Grid */}
                    <div className="grid grid-cols-6 gap-2 max-w-sm mx-auto justify-center">
                      {seatMatrix.map(seat => {
                        const isSelected = selectedSeats.includes(seat.id);
                        return (
                          <button
                            key={seat.id}
                            disabled={seat.isReserved}
                            onClick={() => handleSeatClick(seat.id)}
                            className={`aspect-square rounded-lg text-[9px] font-black font-mono transition-all flex items-center justify-center cursor-pointer ${
                              seat.isReserved
                                ? theme === "black" ? "bg-white/[0.02] text-zinc-700 cursor-not-allowed opacity-20" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : isSelected
                                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/15"
                                  : theme === "black"
                                    ? "bg-white/[0.04] text-zinc-400 border border-white/[0.05] hover:bg-white/[0.1]"
                                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {seat.id}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend keys */}
                    <div className="flex items-center justify-center gap-4 mt-4 text-[10px] font-black text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm ${theme === "black" ? "bg-white/[0.04]" : "bg-slate-100"}`} />
                        <span>{t.seatAvailable}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-amber-500" />
                        <span>{t.seatSelected}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm opacity-30 ${theme === "black" ? "bg-white/[0.02]" : "bg-slate-200"}`} />
                        <span>{t.seatReserved}</span>
                      </div>
                    </div>

                  </div>

                  {/* Summary & Booking Confirmation */}
                  <div className={`p-4 rounded-2xl border ${
                    theme === "black" ? "bg-white/[0.02] border-white/[0.05]" : "bg-slate-50 border-slate-100"
                  }`}>
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-zinc-500 font-bold">{t.selectedSeats}:</span>
                      <span className="font-mono font-black">{selectedSeats.join(", ") || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mb-4">
                      <span className="text-zinc-500 font-bold">{t.ticketPrice}:</span>
                      <span className="font-black">{selectedMovieForBooking.price} {t.currency}</span>
                    </div>
                    
                    <div className={`border-t pt-3 flex justify-between items-center font-black ${
                      theme === "black" ? "border-white/[0.05]" : "border-slate-200"
                    }`}>
                      <span className="text-sm">{t.total}:</span>
                      <span className="text-base text-amber-500 font-mono">
                        {selectedSeats.length * selectedMovieForBooking.price} {t.currency}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="btn-confirm-booking"
                    onClick={confirmBooking}
                    disabled={selectedSeats.length === 0}
                    className={`w-full py-4 rounded-2xl text-xs font-black transition-all duration-300 cursor-pointer ${
                      selectedSeats.length === 0
                        ? theme === "black" ? "bg-white/[0.02] text-zinc-600 cursor-not-allowed border border-white/[0.02]" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : theme === "black"
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/10"
                          : "bg-zinc-950 text-white hover:bg-zinc-800"
                    }`}
                  >
                    {t.bookNow}
                  </button>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIVE STREAM PLAYER MODAL */}
      <AnimatePresence>
        {isStreamModalOpen && streamingMatch && (
          <div className={`fixed inset-0 bg-black/95 md:backdrop-blur-md z-50 overflow-y-auto ${isMobile ? 'p-0' : 'p-2 sm:p-6'} flex justify-center items-start`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={`w-full ${
                isMobile 
                  ? "fixed inset-0 z-50 w-screen h-screen rounded-none border-none p-0 bg-black flex flex-col overflow-hidden" 
                  : "max-w-5xl my-auto sm:my-4 rounded-3xl"
              } border ${theme === 'black' ? 'border-zinc-850 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'} overflow-hidden shadow-2xl transition-all duration-300`}
            >
              {/* Modal Header */}
              <div className={`p-4 sm:p-6 border-b ${theme === 'black' ? 'border-zinc-900 bg-zinc-900/40' : 'border-zinc-200 bg-zinc-50'} flex items-center justify-between shrink-0`}>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs sm:text-sm font-black text-red-500 tracking-wider uppercase flex items-center gap-1">
                    {lang === "ar" ? "بث مباشر" : "LIVE STREAM"}
                  </span>
                  <span className={`text-xs ${theme === 'black' ? 'text-zinc-650' : 'text-zinc-300'} hidden sm:inline`}>|</span>
                  <span className={`text-xs ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-600'} font-bold truncate max-w-[150px] sm:max-w-none`}>
                    {streamingMatch.teamA[lang] || streamingMatch.teamA.en} vs {streamingMatch.teamB[lang] || streamingMatch.teamB.en}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsStreamModalOpen(false);
                      setStreamingMatch(null);
                      setStreamUrl("");
                    }}
                    className={`p-2 rounded-xl ${theme === 'black' ? 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-100' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-800'} transition-all`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Content: Player Container */}
              <div className="grid grid-cols-1 lg:grid-cols-12">
                
                {/* Left Section: Video Player & Inputs */}
                <div className="lg:col-span-12 p-4 sm:p-6 flex flex-col justify-center min-h-[300px] sm:min-h-[450px]">
                  
                  {userRole === "viewer" ? (
                    /* VIEWERS VIEW */
                    !streamUrl || !getStreamAvailability(streamingMatch, currentTime).isAvailable ? (
                      /* VIEWER EMPTY / UPCOMING STATE */
                      <div className="text-center py-12 px-6 max-w-xl mx-auto w-full space-y-6">
                        <div className={`w-16 h-16 mx-auto rounded-full ${theme === 'black' ? 'bg-zinc-900 text-zinc-500 border border-zinc-800' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'} flex items-center justify-center`}>
                          <Eye className="w-8 h-8 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <h3 className={`text-lg sm:text-xl font-black ${theme === 'black' ? 'text-zinc-300' : 'text-zinc-800'}`}>
                            {lang === "ar" ? "رابط البث المباشر غير متوفر بعد (قريباً)" : "Live Stream Not Available Yet (Soon)"}
                          </h3>
                          <p className={`text-xs sm:text-sm ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-650'} leading-relaxed`}>
                            {lang === "ar"
                              ? "لم ينطلق البث المباشر لهذه المباراة بعد. يتوفر البث تلقائياً للمشاهدين قبل انطلاق المباراة بـ 15 دقيقة."
                              : "Live stream is not active yet. It will automatically become available to viewers 15 minutes before kick-off."}
                          </p>
                        </div>
                        <div className={`py-2.5 px-4 rounded-xl ${theme === 'black' ? 'bg-zinc-900/50 border border-zinc-850 text-amber-500/80' : 'bg-amber-50 border border-amber-200 text-amber-600'} inline-flex items-center gap-2 text-xs font-semibold`}>
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          <span>{lang === "ar" ? "سيتم تفعيل المشغل تلقائياً عند اقتراب موعد المباراة" : "Player will auto-activate closer to match time"}</span>
                        </div>
                      </div>
                    ) : (
                      /* VIEWER PLAYING STATE */
                      <div className="space-y-4">
                        {/* Video Player Display Container */}
                        <div className={`relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black border ${theme === 'black' ? 'border-zinc-850' : 'border-zinc-200'} shadow-2xl`}>
                          
                          {!isStreamVideoOrHls(streamUrl, streamType) ? (
                            <iframe
                              src={getEmbedUrl(streamUrl)}
                              title="Live Match Stream"
                              className="w-full h-full border-0 absolute inset-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          ) : (
                            <HlsVideoPlayer
                              src={streamUrl}
                              className="absolute inset-0 w-full h-full"
                              lang={lang}
                            />
                          )}


                        </div>

                        {/* Server Selector */}
                        <div className={`flex flex-col gap-2.5 p-4 rounded-2xl ${theme === 'black' ? 'bg-zinc-900/35 border border-zinc-900/80' : 'bg-zinc-50 border border-zinc-200'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] uppercase tracking-wider font-black ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              {lang === "ar" ? "اختر سيرفر المشاهدة:" : "Choose Streaming Server:"}
                            </span>
                            <span className="text-[10px] font-bold text-amber-500">
                              ({editingStreams.length} {lang === "ar" ? "سيرفرات" : "Servers"})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {editingStreams.map((srv, idx) => {
                              const isAvailable = !!srv.url;
                              const isSelected = activeStreamIndex === idx;
                              return (
                                <button
                                  key={`stream-selector-${idx}`}
                                  disabled={!isAvailable}
                                  onClick={() => {
                                    setActiveStreamIndex(idx);
                                    setStreamUrl(srv.url);
                                    setStreamType(srv.type);
                                  }}
                                  className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border flex-1 min-w-[110px] sm:min-w-[130px] ${
                                    isSelected
                                      ? "bg-amber-500 text-black border-amber-600/20 shadow-lg shadow-amber-500/10"
                                      : isAvailable
                                      ? (theme === 'black' ? "bg-zinc-900 hover:bg-zinc-850 text-zinc-100 border-zinc-800 hover:border-zinc-750 cursor-pointer" : "bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-200 hover:border-zinc-300 cursor-pointer shadow-sm")
                                      : (theme === 'black' ? "bg-zinc-950/50 text-zinc-650 border-zinc-900/50 cursor-not-allowed opacity-50" : "bg-zinc-50 text-zinc-400 border-zinc-100 cursor-not-allowed opacity-50")
                                  }`}
                                >
                                  <span>{srv.name}</span>
                                  <span className={`text-[8px] font-bold ${isSelected ? "text-black/60" : isAvailable ? "text-emerald-500" : (theme === 'black' ? "text-zinc-500" : "text-zinc-400")}`}>
                                    {isAvailable 
                                      ? (isSelected ? (lang === "ar" ? "نشط حالياً" : "Active Now") : (lang === "ar" ? "متاح" : "Available")) 
                                      : (lang === "ar" ? "غير متاح" : "Not Configured")}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Promotional VIP Showcase Inside Match Stream Modal (Directly below servers) */}
                        <div className={`p-4 sm:p-5 rounded-2xl border ${
                          theme === "black" 
                            ? "bg-zinc-900/40 border-zinc-850 text-white" 
                            : "bg-zinc-50 border-zinc-200 text-zinc-900"
                        } space-y-4`}>
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
                                <Crown className="w-4 h-4" />
                              </div>
                              <h5 className="text-xs font-black">
                                {lang === "ar" ? "مميزات باقة VIP الحصرية للموقع" : "Exclusive VIP Portal Features"}
                              </h5>
                            </div>
                            <span className="text-[10px] font-bold text-amber-500">
                              {lang === "ar" ? "شاهد بدون تقطيع وبدقة 4K" : "Watch without lag in 4K UHD"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                            {/* 1. جميع القنوات حول العالم */}
                            <div className={`p-3.5 rounded-xl border ${theme === 'black' ? 'bg-zinc-950/60 border-zinc-800 hover:border-cyan-500/40' : 'bg-white border-zinc-200 shadow-sm hover:border-cyan-400'} transition-all`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🌐</span>
                                <h6 className="text-xs sm:text-sm font-black text-cyan-500">{lang === "ar" ? "1. جميع القنوات حول العالم" : "1. Worldwide Channels"}</h6>
                              </div>
                              <p className={`text-[11px] sm:text-xs leading-relaxed ${theme === 'black' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                {lang === "ar" ? "آلاف القنوات الرياضية، الإخبارية، الترفيهية، والأفلام المشفرة من كافة دول العالم مع تغطية عالمية." : "Thousands of sports, news, and cinema channels globally."}
                              </p>
                            </div>

                            {/* 2. خدمة سلسة وسريعة */}
                            <div className={`p-3.5 rounded-xl border ${theme === 'black' ? 'bg-zinc-950/60 border-zinc-800 hover:border-amber-500/40' : 'bg-white border-zinc-200 shadow-sm hover:border-amber-400'} transition-all`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">⚡</span>
                                <h6 className="text-xs sm:text-sm font-black text-amber-500">{lang === "ar" ? "2. خدمة سلسة وسريعة" : "2. Fast & Smooth"}</h6>
                              </div>
                              <p className={`text-[11px] sm:text-xs leading-relaxed ${theme === 'black' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                {lang === "ar" ? "سيرفرات بث متعددة فائقة السرعة مع تنقل فوري بدون أي تقطيع أو تأخير أثناء الضغط العالي." : "Ultra-fast servers with zero lag under high peak traffic."}
                              </p>
                            </div>

                            {/* 3. دقة 4K فائقة الوضوح */}
                            <div className={`p-3.5 rounded-xl border ${theme === 'black' ? 'bg-zinc-950/60 border-zinc-800 hover:border-emerald-500/40' : 'bg-white border-zinc-200 shadow-sm hover:border-emerald-400'} transition-all`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">✨</span>
                                <h6 className="text-xs sm:text-sm font-black text-emerald-500">{lang === "ar" ? "3. دقة 4K فائقة الوضوح" : "3. 4K Ultra HD"}</h6>
                              </div>
                              <p className={`text-[11px] sm:text-xs leading-relaxed ${theme === 'black' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                {lang === "ar" ? "جودة بث استثنائية 4K UHD و FHD مع صوت نقي وتوافق كامل مع الشاشات الذكية والجوالات." : "Crystal clear 4K UHD with Smart TV & mobile support."}
                              </p>
                            </div>

                            {/* 4. إزالة الإعلانات بالكامل */}
                            <div className={`p-3.5 rounded-xl border ${theme === 'black' ? 'bg-zinc-950/60 border-zinc-800 hover:border-purple-500/40' : 'bg-white border-zinc-200 shadow-sm hover:border-purple-400'} transition-all`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🛡️</span>
                                <h6 className="text-xs sm:text-sm font-black text-purple-500">{lang === "ar" ? "4. إزالة الإعلانات بالكامل" : "4. 100% Ad-Free"}</h6>
                              </div>
                              <p className={`text-[11px] sm:text-xs leading-relaxed ${theme === 'black' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                {lang === "ar" ? "تجربة مشاهدة وتصفح نقية 100% بدون أي إعلانات مزعجة أو نوافذ منبثقة." : "100% ad-free viewing without any annoying popup ads."}
                              </p>
                            </div>
                          </div>

                          {/* CTA Row */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                            <span className={`text-[11px] font-bold ${theme === 'black' ? 'text-zinc-300' : 'text-zinc-700'}`}>
                              {lang === "ar" ? "اشترك الآن أو اطلب تجربة مجانية لاختبار السيرفرات:" : "Subscribe now or request a free trial to test servers:"}
                            </span>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <a
                                href={
                                  subscriptionSettings.supportContact?.includes("wa.me")
                                    ? `${subscriptionSettings.supportContact}?text=${encodeURIComponent(lang === "ar" ? "مرحباً، أود طلب تجربة مجانية لمشاهدة المباريات والبث" : "Hello, I would like to request a Free Trial for Live Matches")}`
                                    : subscriptionSettings.supportContact || "https://wa.me/966500000000"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 border cursor-pointer ${
                                  theme === "black"
                                    ? "bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border-zinc-700"
                                    : "bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300 shadow-sm"
                                }`}
                              >
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span>{lang === "ar" ? "تجربة مجانية" : "Free Trial"}</span>
                              </a>
                              <a
                                href={
                                  subscriptionSettings.supportContact?.includes("wa.me")
                                    ? `${subscriptionSettings.supportContact}?text=${encodeURIComponent(lang === "ar" ? "مرحباً، أريد الاشتراك في باقة VIP للبث المباشر" : "Hello, I want to subscribe to the VIP Live Stream Plan")}`
                                    : subscriptionSettings.supportContact || "https://wa.me/966500000000"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black transition flex items-center justify-center gap-1 shadow-md shadow-amber-500/20 cursor-pointer"
                              >
                                <Crown className="w-3 h-3" />
                                <span>{lang === "ar" ? "اشترك الآن" : "Subscribe Now"}</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Match Details banner below player */}
                        <div className={`p-5 rounded-2xl ${theme === 'black' ? 'bg-zinc-900/50 border border-zinc-900' : 'bg-zinc-50 border border-zinc-200'} flex items-center justify-between gap-4`}>
                          <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            {/* Team A */}
                            <div className="flex items-center gap-2 truncate">
                              <div className={`w-8 h-8 rounded-full ${theme === 'black' ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden`}>
                                {streamingMatch.logoA ? (
                                  <img src={streamingMatch.logoA} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                                ) : (
                                  (streamingMatch.teamA[lang] || streamingMatch.teamA.en || "").charAt(0)
                                )}
                              </div>
                              <span className="text-xs sm:text-sm font-black truncate">{streamingMatch.teamA[lang] || streamingMatch.teamA.en}</span>
                            </div>

                            <div className={`px-2 py-0.5 ${theme === 'black' ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-600'} text-[10px] font-black rounded-md shrink-0`}>VS</div>

                            {/* Team B */}
                            <div className="flex items-center gap-2 truncate">
                              <div className={`w-8 h-8 rounded-full ${theme === 'black' ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden`}>
                                {streamingMatch.logoB ? (
                                  <img src={streamingMatch.logoB} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                                ) : (
                                  (streamingMatch.teamB[lang] || streamingMatch.teamB.en || "").charAt(0)
                                )}
                              </div>
                              <span className="text-xs sm:text-sm font-black truncate">{streamingMatch.teamB[lang] || streamingMatch.teamB.en}</span>
                            </div>
                          </div>

                          <div className={`text-right text-[11px] ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-500'} hidden sm:block shrink-0`}>
                            <p className="font-bold text-amber-500">{getTranslation(streamingMatch.leagueName) || (lang === 'ar' ? "دوري كرة قدم" : "Football League")}</p>
                            <p className="opacity-60 text-[9px] font-mono">{formatMatchTime(streamingMatch, lang)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    /* ADMINISTRATOR VIEW */
                    <div className="space-y-6">
                      {/* Admin Header Info */}
                      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${theme === 'black' ? 'border-zinc-900' : 'border-zinc-200'} pb-4 mb-2`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                            <Settings className="w-5 h-5 text-red-500 animate-spin" style={{ animationDuration: "12s" }} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-red-500">
                              {lang === "ar" ? "لوحة التحكم بسيرفرات البث المباشر" : "Streaming Servers Admin Panel"}
                            </h3>
                            <p className={`text-[10px] ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-450'} leading-relaxed`}>
                              {lang === "ar" ? "يمكنك إضافة، تعديل، ومعاينة وحفظ جميع سيرفرات البث للمباراة (سيرفر 1، 2، 3، 4، 5، ...)" : "Configure, preview, add, and save unlimited stream sources for this match"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Video Player Preview (if streamUrl is set) */}
                      {streamUrl ? (
                        <div className="space-y-4">
                          <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-black border ${theme === 'black' ? 'border-zinc-850' : 'border-zinc-200'} shadow-2xl`}>
                            {!isStreamVideoOrHls(streamUrl, streamType) ? (
                              <iframe
                                src={getEmbedUrl(streamUrl)}
                                title="Admin Live Match Stream Preview"
                                className="w-full h-full border-0 absolute inset-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            ) : (
                              <HlsVideoPlayer
                                src={streamUrl}
                                className="absolute inset-0 w-full h-full"
                                lang={lang}
                              />
                            )}


                          </div>

                          {/* Preview Status Banner */}
                          <div className={`flex items-center justify-between gap-4 p-3.5 rounded-xl ${theme === 'black' ? 'bg-zinc-900/30 border border-zinc-900 text-zinc-400' : 'bg-zinc-50 border border-zinc-200 text-zinc-650'} text-xs`}>
                            <div className="truncate flex-1 min-w-0">
                              <span className={`font-bold block ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-450'}`}>
                                {lang === "ar" ? "السيرفر المعاين حالياً:" : "Currently Previewing:"}
                              </span>
                              <span className={`font-mono text-[10px] ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-600'} truncate block`}>
                                {editingStreams[activeStreamIndex]?.name || `Server ${activeStreamIndex + 1}`}: {streamUrl}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setStreamUrl("");
                              }}
                              className={`px-3 py-1.5 rounded-lg ${theme === 'black' ? 'bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700 border-zinc-300'} font-bold shrink-0 transition-all text-[10px]`}
                            >
                              {lang === "ar" ? "إيقاف المعاينة" : "Stop Preview"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ADMIN EMPTY PREVIEW STATE */
                        <div className={`text-center py-8 rounded-2xl ${theme === 'black' ? 'bg-zinc-900/10 border border-zinc-900/50' : 'bg-zinc-50 border border-zinc-200'} space-y-3`}>
                          <div className={`w-12 h-12 mx-auto rounded-full ${theme === 'black' ? 'bg-zinc-900 text-zinc-650 border-zinc-850' : 'bg-zinc-200 text-zinc-500 border-zinc-300'} flex items-center justify-center`}>
                             <Tv className="w-6 h-6" />
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-700'}`}>
                              {lang === "ar" ? "لا توجد معاينة نشطة" : "No Active Preview"}
                            </p>
                            <p className={`text-[10px] ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              {lang === "ar" ? "انقر على 'معاينة' لأي سيرفر أدناه لتجربته وتشغيله هنا" : "Click 'Preview' on any server below to test its video feed here"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Dynamic Servers Editing Section */}
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className={`text-[11px] uppercase tracking-wider font-black ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {lang === "ar" ? `سيرفرات البث المتاحة للمباراة (${editingStreams.length}):` : `Match Streaming Servers (${editingStreams.length}):`}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              const nextNum = editingStreams.length + 1;
                              setEditingStreams(prev => [
                                ...prev,
                                {
                                  name: lang === "ar" ? `سيرفر ${nextNum}` : `Server ${nextNum}`,
                                  url: "",
                                  type: "iframe"
                                }
                              ]);
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "إضافة سيرفر جديد ➕" : "Add New Server ➕"}</span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          {editingStreams.map((srv, idx) => (
                            <div key={`stream-config-${idx}`} className={`p-4 rounded-xl ${theme === 'black' ? 'bg-zinc-900/30 border border-zinc-900 hover:border-zinc-850' : 'bg-zinc-50 border border-zinc-200 hover:border-zinc-300'} transition-all space-y-3`}>
                              {/* Server Title & Action Switchers */}
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-xs font-black text-amber-500 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  {srv.name || `Server ${idx + 1}`}
                                </span>

                                <div className="flex items-center gap-2 flex-wrap">
                                  {srv.url && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveStreamIndex(idx);
                                        setStreamUrl(srv.url);
                                        setStreamType(srv.type);
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                        activeStreamIndex === idx && streamUrl === srv.url
                                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                          : (theme === 'black' ? "bg-zinc-850 hover:bg-zinc-800 text-zinc-400 border-zinc-750" : "bg-zinc-200 hover:bg-zinc-300 text-zinc-600 border-zinc-300")
                                      }`}
                                    >
                                      {lang === "ar" ? "👁️ تشغيل في المعاينة" : "👁️ Test in Preview"}
                                    </button>
                                  )}
                                  
                                  {/* Auto Demo Loader */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const demoUrls = [
                                        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                                        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                                        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                                        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
                                        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
                                      ];
                                      const updated = [...editingStreams];
                                      updated[idx] = {
                                        ...updated[idx],
                                        url: demoUrls[idx % demoUrls.length],
                                        type: "video"
                                      };
                                      setEditingStreams(updated);
                                    }}
                                    className={`px-2 py-1 rounded ${theme === 'black' ? 'bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-500 hover:text-zinc-350' : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-600 hover:text-zinc-800'} text-[9px] font-bold transition-all`}
                                  >
                                    {lang === "ar" ? "رابط تجريبي 🪄" : "Load Demo 🪄"}
                                  </button>

                                  {/* Delete Server button if > 1 servers */}
                                  {editingStreams.length > 1 && (
                                    <button
                                      type="button"
                                      title={lang === "ar" ? "حذف هذا السيرفر" : "Delete this server"}
                                      onClick={() => {
                                        const updated = editingStreams.filter((_, i) => i !== idx);
                                        setEditingStreams(updated);
                                        if (activeStreamIndex === idx) {
                                          const newIdx = Math.max(0, idx - 1);
                                          setActiveStreamIndex(newIdx);
                                          setStreamUrl(updated[newIdx]?.url || "");
                                          setStreamType(updated[newIdx]?.type || "iframe");
                                        } else if (activeStreamIndex > idx) {
                                          setActiveStreamIndex(prev => prev - 1);
                                        }
                                      }}
                                      className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>{lang === "ar" ? "حذف" : "Delete"}</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Input and Type row */}
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                {/* Server Name Input */}
                                <div className="md:col-span-3">
                                  <label className={`block text-[10px] font-bold ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-500'} mb-1`}>
                                    {lang === "ar" ? "اسم السيرفر:" : "Server Name:"}
                                  </label>
                                  <input
                                    type="text"
                                    placeholder={lang === "ar" ? `مثال: سيرفر ${idx + 1}` : `e.g. Server ${idx + 1}`}
                                    value={srv.name}
                                    onChange={(e) => {
                                      const updated = [...editingStreams];
                                      updated[idx] = {
                                        ...updated[idx],
                                        name: e.target.value
                                      };
                                      setEditingStreams(updated);
                                    }}
                                    className={`w-full px-3 py-2 ${theme === 'black' ? 'bg-zinc-950 border border-zinc-850 text-zinc-100 placeholder-zinc-650' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'} rounded-lg text-xs focus:outline-none focus:border-amber-500 transition-all font-bold`}
                                  />
                                </div>

                                {/* URL Input */}
                                <div className="md:col-span-6">
                                  <label className={`block text-[10px] font-bold ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-500'} mb-1`}>
                                    {lang === "ar" ? "رابط البث (URL / Iframe):" : "Stream URL or Iframe Embed:"}
                                  </label>
                                  <input
                                    type="text"
                                    placeholder={lang === "ar" ? "أدخل الرابط (مثال: iframe أو m3u8 أو mp4)..." : "Enter stream URL or iframe code..."}
                                    value={srv.url}
                                    onChange={(e) => {
                                      const updated = [...editingStreams];
                                      updated[idx] = {
                                        ...updated[idx],
                                        url: e.target.value
                                      };
                                      setEditingStreams(updated);
                                    }}
                                    dir="ltr"
                                    className={`w-full px-3 py-2 ${theme === 'black' ? 'bg-zinc-950 border border-zinc-850 text-zinc-100 placeholder-zinc-650' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'} rounded-lg text-xs focus:outline-none focus:border-amber-500 transition-all font-mono`}
                                  />
                                </div>

                                {/* Type selector */}
                                <div className="md:col-span-3">
                                  <label className={`block text-[10px] font-bold ${theme === 'black' ? 'text-zinc-500' : 'text-zinc-500'} mb-1`}>
                                    {lang === "ar" ? "نوع المشغل:" : "Player Type:"}
                                  </label>
                                  <div className={`flex gap-1 ${theme === 'black' ? 'bg-zinc-950 border border-zinc-850' : 'bg-zinc-100 border-zinc-200'} p-1 rounded-lg h-[38px] items-center`}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...editingStreams];
                                        updated[idx] = { ...updated[idx], type: "iframe" };
                                        setEditingStreams(updated);
                                      }}
                                      className={`flex-1 h-full rounded text-[10px] font-bold transition-all ${
                                        srv.type === "iframe"
                                          ? (theme === 'black' ? "bg-zinc-850 text-amber-500" : "bg-white text-amber-600 shadow-sm")
                                          : (theme === 'black' ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-750")
                                      }`}
                                    >
                                      Iframe
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...editingStreams];
                                        updated[idx] = { ...updated[idx], type: "video" };
                                        setEditingStreams(updated);
                                      }}
                                      className={`flex-1 h-full rounded text-[10px] font-bold transition-all ${
                                        srv.type === "video"
                                          ? (theme === 'black' ? "bg-zinc-850 text-amber-500" : "bg-white text-amber-600 shadow-sm")
                                          : (theme === 'black' ? "text-zinc-500 hover:text-zinc-350" : "text-zinc-500 hover:text-zinc-750")
                                      }`}
                                    >
                                      Video
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className={`flex items-center justify-between gap-3 pt-4 border-t ${theme === 'black' ? 'border-zinc-900' : 'border-zinc-200'} flex-wrap`}>
                        <button
                          type="button"
                          onClick={() => {
                            const nextNum = editingStreams.length + 1;
                            setEditingStreams(prev => [
                              ...prev,
                              {
                                name: lang === "ar" ? `سيرفر ${nextNum}` : `Server ${nextNum}`,
                                url: "",
                                type: "iframe"
                              }
                            ]);
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            theme === 'black'
                              ? "bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800"
                              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200"
                          }`}
                        >
                          <Plus className="w-4 h-4 text-amber-500" />
                          <span>{lang === "ar" ? "إضافة سيرفر جديد ➕" : "Add New Server ➕"}</span>
                        </button>

                        {/* Save all button */}
                        <button
                          type="button"
                          onClick={() => {
                            handleSaveAllStreams(streamingMatch.id, editingStreams);
                          }}
                          className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 border border-green-600/15 shadow-lg shadow-green-500/10 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>{lang === "ar" ? "حفظ وتفعيل جميع السيرفرات للمشاهدين 💾" : "Save All Servers for Viewers 💾"}</span>
                        </button>
                      </div>

                      {/* Match Details banner below player */}
                      <div className={`p-5 rounded-2xl ${theme === 'black' ? 'bg-zinc-900/50 border border-zinc-900' : 'bg-zinc-50 border border-zinc-200'} flex items-center justify-between gap-4`}>
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                          {/* Team A */}
                          <div className="flex items-center gap-2 truncate">
                            <div className={`w-8 h-8 rounded-full ${theme === 'black' ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden`}>
                              {streamingMatch.logoA ? (
                                <img src={streamingMatch.logoA} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                (streamingMatch.teamA[lang] || streamingMatch.teamA.en || "").charAt(0)
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-black truncate">{streamingMatch.teamA[lang] || streamingMatch.teamA.en}</span>
                          </div>

                          <div className={`px-2 py-0.5 ${theme === 'black' ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-600'} text-[10px] font-black rounded-md shrink-0`}>VS</div>

                          {/* Team B */}
                          <div className="flex items-center gap-2 truncate">
                            <div className={`w-8 h-8 rounded-full ${theme === 'black' ? 'bg-zinc-800' : 'bg-zinc-200'} flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden`}>
                              {streamingMatch.logoB ? (
                                <img src={streamingMatch.logoB} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                (streamingMatch.teamB[lang] || streamingMatch.teamB.en || "").charAt(0)
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-black truncate">{streamingMatch.teamB[lang] || streamingMatch.teamB.en}</span>
                          </div>
                        </div>

                        <div className={`text-right text-[11px] ${theme === 'black' ? 'text-zinc-400' : 'text-zinc-500'} hidden sm:block shrink-0`}>
                          <p className="font-bold text-amber-500">{getTranslation(streamingMatch.leagueName) || (lang === 'ar' ? "دوري كرة قدم" : "Football League")}</p>
                          <p className="opacity-60 text-[9px] font-mono">{formatMatchTime(streamingMatch, lang)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>



              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MATCH DETAILS MODAL */}
      <AnimatePresence>
        {selectedMatchForDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 md:backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedMatchForDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={`w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl ${
                theme === "black" ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header section (Match Score & Teams) */}
              <div className={`p-6 border-b relative ${theme === 'black' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                <button
                  onClick={() => setSelectedMatchForDetails(null)}
                  className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} p-2 rounded-xl transition-all ${
                    theme === 'black' ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100' : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* League name */}
                <div className="text-center mb-4 flex items-center justify-center gap-1.5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                    theme === 'black' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                  }`}>
                    {selectedMatchForDetails.leagueLogo && (
                      <img 
                        src={selectedMatchForDetails.leagueLogo} 
                        alt="League" 
                        className="w-3.5 h-3.5 object-contain inline-block"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    {getTranslation(selectedMatchForDetails.leagueName) || (lang === "ar" ? "مباراة كرة قدم" : "Football Match")}
                  </span>
                </div>

                <div className="grid grid-cols-3 items-center gap-4 text-center">
                  {/* Home Team */}
                  <div>
                    <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center font-bold text-xl mb-3 shadow-md overflow-hidden ${
                      theme === "black" ? "bg-zinc-800 border border-zinc-700 text-zinc-100" : "bg-zinc-100 border border-zinc-200 text-zinc-900"
                    }`}>
                      {selectedMatchForDetails.logoA ? (
                        <img 
                          src={selectedMatchForDetails.logoA} 
                          alt={selectedMatchForDetails.teamA[lang] || selectedMatchForDetails.teamA.en} 
                          className="w-10 h-10 object-contain"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = ""; // Clear src if loading fails
                          }}
                        />
                      ) : (
                        (selectedMatchForDetails.teamA[lang] || selectedMatchForDetails.teamA.en || "").charAt(0)
                      )}
                    </div>
                    <p className="text-sm font-black">{selectedMatchForDetails.teamA[lang] || selectedMatchForDetails.teamA.en}</p>
                  </div>

                  {/* Score */}
                  <div>
                    {selectedMatchForDetails.scoreA !== undefined && selectedMatchForDetails.scoreB !== undefined ? (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-3xl font-black font-mono tracking-tight">{selectedMatchForDetails.scoreA}</span>
                          <span className="text-zinc-500 font-bold text-2xl">:</span>
                          <span className="text-3xl font-black font-mono tracking-tight">{selectedMatchForDetails.scoreB}</span>
                        </div>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold mt-2 ${
                          selectedMatchForDetails.status === "live" ? "bg-red-500/10 text-red-500 animate-pulse border border-red-500/20" : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {selectedMatchForDetails.statusText?.[lang] || selectedMatchForDetails.statusText?.en}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className={`text-xs font-black px-4 py-1.5 rounded-xl ${theme === 'black' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600'}`}>
                          VS
                        </span>
                        <span className="text-[10px] text-zinc-500 mt-2 font-medium">
                          {formatMatchTime(selectedMatchForDetails, lang)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div>
                    <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center font-bold text-xl mb-3 shadow-md overflow-hidden ${
                      theme === "black" ? "bg-zinc-800 border border-zinc-700 text-zinc-100" : "bg-zinc-100 border border-zinc-200 text-zinc-900"
                    }`}>
                      {selectedMatchForDetails.logoB ? (
                        <img 
                          src={selectedMatchForDetails.logoB} 
                          alt={selectedMatchForDetails.teamB[lang] || selectedMatchForDetails.teamB.en} 
                          className="w-10 h-10 object-contain"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = ""; // Clear src if loading fails
                          }}
                        />
                      ) : (
                        (selectedMatchForDetails.teamB[lang] || selectedMatchForDetails.teamB.en || "").charAt(0)
                      )}
                    </div>
                    <p className="text-sm font-black">{selectedMatchForDetails.teamB[lang] || selectedMatchForDetails.teamB.en}</p>
                  </div>
                </div>
              </div>

              {/* Tab Buttons inside details modal */}
              <div className={`flex border-b ${theme === 'black' ? 'border-zinc-800 bg-zinc-900/20' : 'border-zinc-100 bg-zinc-50/50'}`}>
                <button
                  onClick={() => setActiveDetailsTab("events")}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
                    activeDetailsTab === "events"
                      ? theme === "black" ? "border-amber-500 text-amber-500 bg-amber-500/[0.02]" : "border-zinc-950 text-zinc-950 bg-zinc-100/50"
                      : "border-transparent text-zinc-500 hover:text-zinc-450"
                  }`}
                >
                  {lang === "ar" ? "الأحداث والأهداف" : "Events & Goals"}
                </button>
                <button
                  onClick={() => setActiveDetailsTab("stats")}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
                    activeDetailsTab === "stats"
                      ? theme === "black" ? "border-amber-500 text-amber-500 bg-amber-500/[0.02]" : "border-zinc-950 text-zinc-950 bg-zinc-100/50"
                      : "border-transparent text-zinc-500 hover:text-zinc-450"
                  }`}
                >
                  {lang === "ar" ? "الإحصائيات" : "Statistics"}
                </button>
                <button
                  onClick={() => setActiveDetailsTab("lineup")}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
                    activeDetailsTab === "lineup"
                      ? theme === "black" ? "border-amber-500 text-amber-500 bg-amber-500/[0.02]" : "border-zinc-950 text-zinc-950 bg-zinc-100/50"
                      : "border-transparent text-zinc-500 hover:text-zinc-455"
                  }`}
                >
                  {lang === "ar" ? "التشكيلة" : "Lineups"}
                </button>
              </div>

              {/* Modal Tab Content */}
              <div className="p-6 max-h-[350px] overflow-y-auto">
                {/* TAB 1: EVENTS / SCORERS */}
                {activeDetailsTab === "events" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6 divide-x divide-dashed divide-zinc-800">
                      {/* Home Scorers */}
                      <div className="space-y-2 pr-2">
                        <h4 className="text-xs font-extrabold text-zinc-400 mb-2 uppercase tracking-wider">
                          {lang === "ar" ? "أهداف الأرض" : "Home Goals"}
                        </h4>
                        {selectedMatchForDetails.scorers?.home?.length > 0 ? (
                          selectedMatchForDetails.scorers.home.map((goal: any, index: number) => (
                            <div key={`details-goal-home-${index}`} className="flex items-center gap-2 text-xs">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold font-mono text-[10px]">
                                {goal.time}'
                              </span>
                              <div>
                                <p className="font-bold">{getTranslation(goal.name)}</p>
                                {goal.assist && <p className="text-[10px] text-zinc-500">Assist: {getTranslation(goal.assist)}</p>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 italic">
                            {lang === "ar" ? "لا توجد أهداف" : "No goals scored"}
                          </p>
                        )}
                      </div>

                      {/* Away Scorers */}
                      <div className="space-y-2 pl-4">
                        <h4 className="text-xs font-extrabold text-zinc-400 mb-2 uppercase tracking-wider">
                          {lang === "ar" ? "أهداف الضيوف" : "Away Goals"}
                        </h4>
                        {selectedMatchForDetails.scorers?.away?.length > 0 ? (
                          selectedMatchForDetails.scorers.away.map((goal: any, index: number) => (
                            <div key={`details-goal-away-${index}`} className="flex items-center gap-2 text-xs">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold font-mono text-[10px]">
                                {goal.time}'
                              </span>
                              <div>
                                <p className="font-bold">{getTranslation(goal.name)}</p>
                                {goal.assist && <p className="text-[10px] text-zinc-500">Assist: {getTranslation(goal.assist)}</p>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 italic">
                            {lang === "ar" ? "لا توجد أهداف" : "No goals scored"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Venue details */}
                    <div className={`mt-6 pt-4 border-t text-xs flex items-center justify-between ${theme === 'black' ? 'border-zinc-800 text-zinc-400' : 'border-zinc-100 text-zinc-500'}`}>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-zinc-500" />
                        <span>{selectedMatchForDetails.venue[lang] || selectedMatchForDetails.venue.en}</span>
                      </span>
                      <span>
                        {lang === "ar" ? "كرة قدم" : "Football"}
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 2: STATS */}
                {activeDetailsTab === "stats" && (
                  <div className="space-y-4">
                    {selectedMatchForDetails.stats?.length > 0 ? (
                      selectedMatchForDetails.stats.map((stat: any, index: number) => {
                        const homeVal = parseFloat(stat.home) || 0;
                        const awayVal = parseFloat(stat.away) || 0;
                        const total = homeVal + awayVal;
                        const homePercent = total > 0 ? (homeVal / total) * 100 : 50;
                        const awayPercent = total > 0 ? (awayVal / total) * 100 : 50;

                        return (
                          <div key={`details-stat-${index}`} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span>{stat.home}</span>
                              <span className="text-zinc-400 font-medium">{getTranslation(stat.title)}</span>
                              <span>{stat.away}</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                              <div
                                className="h-full bg-amber-500 transition-all duration-500"
                                style={{ width: `${homePercent}%` }}
                              />
                              <div
                                className="h-full bg-red-600 transition-all duration-500"
                                style={{ width: `${awayPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <Tv className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">
                          {lang === "ar" ? "الإحصائيات المباشرة ستتوفر فور ركلة البداية." : "Live stats will update as soon as the match kicks off."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: LINEUPS */}
                {activeDetailsTab === "lineup" && (
                  <div className="space-y-6">
                    {selectedMatchForDetails.lineups ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Home Lineup */}
                        <div>
                          <h4 className="text-xs font-extrabold text-amber-500 mb-3 border-b border-amber-500/10 pb-1 tracking-wider uppercase">
                            {lang === "ar" ? "تشكيلة الأرض" : "Home XI"}
                          </h4>
                          <div className="space-y-2">
                            {selectedMatchForDetails.lineups.home?.players?.map((p: any, i: number) => (
                              <div key={`lineup-home-player-${i}`} className="flex items-center gap-2 text-xs">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[9px] ${
                                  theme === 'black' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                                }`}>
                                  {p.shirtNumber}
                                </span>
                                <span className="font-semibold">{p.name}</span>
                                <span className="text-[9px] text-zinc-500 uppercase">{p.role}</span>
                              </div>
                            ))}
                          </div>

                          <h5 className="text-[11px] font-bold text-zinc-500 mt-4 mb-2">
                            {lang === "ar" ? "الاحتياط" : "Substitutes"}
                          </h5>
                          <div className="space-y-1.5 opacity-80">
                            {selectedMatchForDetails.lineups.home?.bench?.map((p: any, i: number) => (
                              <div key={`lineup-home-bench-${i}`} className="flex items-center gap-2 text-[11px]">
                                <span className="text-[9px] text-zinc-500">#{p.shirtNumber}</span>
                                <span>{p.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Away Lineup */}
                        <div>
                          <h4 className="text-xs font-extrabold text-red-500 mb-3 border-b border-red-500/10 pb-1 tracking-wider uppercase">
                            {lang === "ar" ? "تشكيلة الضيوف" : "Away XI"}
                          </h4>
                          <div className="space-y-2">
                            {selectedMatchForDetails.lineups.away?.players?.map((p: any, i: number) => (
                              <div key={`lineup-away-player-${i}`} className="flex items-center gap-2 text-xs">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[9px] ${
                                  theme === 'black' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                                }`}>
                                  {p.shirtNumber}
                                </span>
                                <span className="font-semibold">{p.name}</span>
                                <span className="text-[9px] text-zinc-500 uppercase">{p.role}</span>
                              </div>
                            ))}
                          </div>

                          <h5 className="text-[11px] font-bold text-zinc-500 mt-4 mb-2">
                            {lang === "ar" ? "الاحتياط" : "Substitutes"}
                          </h5>
                          <div className="space-y-1.5 opacity-80">
                            {selectedMatchForDetails.lineups.away?.bench?.map((p: any, i: number) => (
                              <div key={`lineup-away-bench-${i}`} className="flex items-center gap-2 text-[11px]">
                                <span className="text-[9px] text-zinc-500">#{p.shirtNumber}</span>
                                <span>{p.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Shield className="w-12 h-12 text-zinc-750 mx-auto mb-2 stroke-1" />
                        <p className="text-sm text-zinc-400">
                          {lang === "ar" ? "التشكيلة الرسمية ستتوفر قبل بداية المباراة بحوالي ٦٠ دقيقة." : "Official lineups will be available approximately 60 minutes before kickoff."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN CONTROL PANEL MODAL */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 md:backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsAdminOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl flex flex-col ${
                theme === "black" ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Admin Header with Tabs */}
              <div className="p-4 sm:p-6 border-b border-zinc-800 bg-zinc-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-bold tracking-tight">
                      {lang === "ar" ? "لوحة التحكم بمدير البوابة" : "Elite Portal Control Panel"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAdminOpen(false)}
                    className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs Switcher: Controls vs Channels vs Subscriptions vs Analytics vs Backup */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 p-1 bg-zinc-900 rounded-xl border border-zinc-800 gap-1">
                  <button
                    onClick={() => setAdminModalTab("controls")}
                    className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      adminModalTab === "controls"
                        ? "bg-amber-500 text-black shadow-md font-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "المباريات والبوابة" : "Matches"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setAdminModalTab("channels");
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      adminModalTab === "channels"
                        ? "bg-cyan-500 text-black shadow-md font-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "إدارة القنوات" : "Channels"}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono font-bold">
                      {customChannels.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setAdminModalTab("subscriptions");
                      fetchSubscriptionCodes();
                      fetchSubscriptionSettings();
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer relative ${
                      adminModalTab === "subscriptions"
                        ? "bg-amber-500 text-black shadow-md font-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "أكواد الاشتراكات" : "Subscriptions"}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono font-bold">
                      {adminSubscriptionCodes.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setAdminModalTab("analytics");
                      fetchAnalyticsData();
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer relative ${
                      adminModalTab === "analytics"
                        ? "bg-emerald-500 text-black shadow-md font-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "الإحصائيات" : "Analytics"}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </button>

                  <button
                    onClick={() => {
                      setAdminModalTab("backup");
                      fetchLiveBackupData();
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer relative ${
                      adminModalTab === "backup"
                        ? "bg-purple-500 text-black shadow-md font-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "النسخ الاحتياطي" : "Backup"}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[500px]">
                {adminModalTab === "analytics" ? (
                  /* ANALYTICS DASHBOARD VIEW */
                  <div className="space-y-6">
                    {/* Live status header */}
                    <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                        </span>
                        <span className="text-xs font-black text-emerald-400">
                          {lang === "ar" ? "إحصائيات فورية مباشر (تحديث تلقائي)" : "Real-time Live Analytics (Auto-sync)"}
                        </span>
                      </div>
                      <button
                        onClick={() => fetchAnalyticsData()}
                        disabled={isLoadingAnalytics}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? "animate-spin text-amber-500" : ""}`} />
                        <span>{lang === "ar" ? "تحديث الآن" : "Refresh Now"}</span>
                      </button>
                    </div>

                    {/* 4 Key Metric Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* 1. Active Live Visitors */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-zinc-900/80 border border-emerald-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-emerald-400">
                            {lang === "ar" ? "الزوار النشطين الآن" : "Active Visitors"}
                          </span>
                          <Users className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-2xl font-black text-white tracking-tight">
                          {analyticsData?.activeVisitors || 1}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {lang === "ar" ? "متواجدون حالياً بالموقع" : "On site right now"}
                        </p>
                      </div>

                      {/* 2. Current Live Stream Viewers */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-950/40 to-zinc-900/80 border border-red-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-red-400">
                            {lang === "ar" ? "مشاهدو البث المباشر" : "Stream Viewers"}
                          </span>
                          <Tv className="w-4 h-4 text-red-400 animate-pulse" />
                        </div>
                        <p className="text-2xl font-black text-white tracking-tight">
                          {analyticsData?.currentLiveViewers || 0}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {lang === "ar" ? "يشاهدون البث حالياً" : "Watching live video"}
                        </p>
                      </div>

                      {/* 3. Peak Concurrent Record */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-zinc-900/80 border border-amber-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-amber-400">
                            {lang === "ar" ? "أعلى مشاهدين بالتزامن" : "Peak Concurrent"}
                          </span>
                          <Zap className="w-4 h-4 text-amber-400" />
                        </div>
                        <p className="text-2xl font-black text-white tracking-tight">
                          {analyticsData?.peakConcurrentViewers ?? 0}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {lang === "ar" ? "أعلى رقم قياسي محقق" : "Record simultaneous peak"}
                        </p>
                      </div>

                      {/* 4. Total Visits */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-zinc-900/80 border border-blue-500/20 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-blue-400">
                            {lang === "ar" ? "إجمالي الزيارات" : "Total Visits"}
                          </span>
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-2xl font-black text-white tracking-tight">
                          {(analyticsData?.totalVisits ?? 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {lang === "ar" ? "مجموع الزيارات الكلي" : "Cumulative portal entries"}
                        </p>
                      </div>
                    </div>

                    {/* Devices & Top Live Matches Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Device Breakdown */}
                      <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                        <h4 className="text-xs font-black text-zinc-300 flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-amber-500" />
                          <span>{lang === "ar" ? "توزيع أجهزة الزوار" : "Device Breakdown"}</span>
                        </h4>

                        <div className="space-y-2.5">
                          {/* Mobile */}
                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-zinc-300 mb-1">
                              <span className="flex items-center gap-1">
                                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                                {lang === "ar" ? "هواتف ذكية (Mobile)" : "Smartphones"}
                              </span>
                              <span>{analyticsData?.deviceBreakdown?.mobile ?? 0}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                              <div 
                                className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                                style={{ width: `${analyticsData?.deviceBreakdown?.mobile ?? 0}%` }}
                              />
                            </div>
                          </div>

                          {/* Desktop */}
                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-zinc-300 mb-1">
                              <span className="flex items-center gap-1">
                                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                                {lang === "ar" ? "أجهزة كمبيوتر (Desktop)" : "Computers"}
                              </span>
                              <span>{analyticsData?.deviceBreakdown?.desktop ?? 0}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                                style={{ width: `${analyticsData?.deviceBreakdown?.desktop ?? 0}%` }}
                              />
                            </div>
                          </div>

                          {/* Tablet */}
                          <div>
                            <div className="flex justify-between text-[11px] font-bold text-zinc-300 mb-1">
                              <span className="flex items-center gap-1">
                                <Tablet className="w-3.5 h-3.5 text-purple-400" />
                                {lang === "ar" ? "أجهزة لوحية (Tablet)" : "Tablets"}
                              </span>
                              <span>{analyticsData?.deviceBreakdown?.tablet ?? 0}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                                style={{ width: `${analyticsData?.deviceBreakdown?.tablet ?? 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Top Viewed Matches */}
                      <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                        <h4 className="text-xs font-black text-zinc-300 flex items-center gap-1.5">
                          <Tv className="w-4 h-4 text-red-500" />
                          <span>{lang === "ar" ? "المباريات الأكثر مشاهدة الآن" : "Top Live Matches Viewers"}</span>
                        </h4>

                        <div className="space-y-2 max-h-[140px] overflow-y-auto">
                          {matches.length > 0 ? (
                            matches.slice(0, 4).map((match, idx) => {
                              const vCount = analyticsData?.matchViewersMap?.[match.id] || (idx === 0 ? Math.max(1, analyticsData?.currentLiveViewers || 1) : 0);
                              return (
                                <div key={`top-match-${match.id}-${idx}`} className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs">
                                  <span className="font-bold truncate max-w-[170px]">
                                    {match.teamA[lang] || match.teamA.en} vs {match.teamB[lang] || match.teamB.en}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 font-extrabold text-[10px] flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                    {vCount} {lang === "ar" ? "مشاهد" : "viewers"}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-4 text-center text-zinc-500 text-xs italic">
                              {lang === "ar" ? "لا توجد مباريات جارية حالياً" : "No live matches running currently"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Daily Selector & Daily Statistics Box (استبدال خانة المخطط بخانة تحديد اليوم وإحصائياته) */}
                    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                      {/* Header & Day Selector Control Bar */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          <h4 className="text-xs font-black text-zinc-200">
                            {lang === "ar" ? "تحديد اليوم واختيار التاريخ" : "Select Day & View Daily Stats"}
                          </h4>
                        </div>

                        {/* Quick Presets & Calendar Date Input */}
                        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                          {[
                            { label: lang === "ar" ? "اليوم" : "Today", offset: 0 },
                            { label: lang === "ar" ? "الأمس" : "Yesterday", offset: 1 },
                            { label: lang === "ar" ? "قبل يومين" : "2 Days Ago", offset: 2 },
                            { label: lang === "ar" ? "قبل 3 أيام" : "3 Days Ago", offset: 3 },
                          ].map((preset, idx) => {
                            const pDate = new Date();
                            pDate.setDate(pDate.getDate() - preset.offset);
                            const pDateStr = pDate.toISOString().split("T")[0];
                            const isSelected = selectedAnalyticsDate === pDateStr;

                            return (
                              <button
                                key={`preset-date-${preset.offset}-${idx}`}
                                onClick={() => setSelectedAnalyticsDate(pDateStr)}
                                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition cursor-pointer ${
                                  isSelected
                                    ? "bg-amber-500 text-black shadow-md font-black"
                                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                }`}
                              >
                                {preset.label}
                              </button>
                            );
                          })}

                          {/* Date Picker Input */}
                          <input
                            type="date"
                            value={selectedAnalyticsDate}
                            onChange={(e) => setSelectedAnalyticsDate(e.target.value)}
                            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-750 text-amber-400 font-mono text-[11px] font-bold rounded-lg border border-zinc-700 outline-none focus:border-amber-500 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Active Selected Day Overview Status Banner */}
                      <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${analyticsData?.isToday ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
                          <span className="text-xs font-bold text-zinc-300">
                            {lang === "ar" ? "تاريخ اليوم المحدد:" : "Selected Date:"}{" "}
                            <span className="font-mono text-amber-400 font-black">{selectedAnalyticsDate}</span>
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                          analyticsData?.isToday 
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          {analyticsData?.isToday
                            ? (lang === "ar" ? "اليوم الحالي (مباشر)" : "Current Day (Live)")
                            : (lang === "ar" ? "أرشيف تاريخي" : "Historical Record")}
                        </span>
                      </div>

                      {/* 4 Detailed Day Metric Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {/* 1. Day Visitors */}
                        <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                            <span>{lang === "ar" ? "زوار اليوم" : "Day Visitors"}</span>
                            <Users className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <p className="text-lg font-black text-white font-mono">
                            {(analyticsData?.dayVisits || 0).toLocaleString()}
                          </p>
                          <p className="text-[9px] text-zinc-500">
                            {lang === "ar" ? "إجمالي زيارات اليوم" : "Day visits count"}
                          </p>
                        </div>

                        {/* 2. Day Stream Views */}
                        <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                            <span>{lang === "ar" ? "مشاهدات البث" : "Stream Plays"}</span>
                            <Tv className="w-3.5 h-3.5 text-red-400" />
                          </div>
                          <p className="text-lg font-black text-white font-mono">
                            {(analyticsData?.dayStreamViews || 0).toLocaleString()}
                          </p>
                          <p className="text-[9px] text-zinc-500">
                            {lang === "ar" ? "تشغيل البث باليوم" : "Video plays during day"}
                          </p>
                        </div>

                        {/* 3. Day Peak Concurrent */}
                        <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                            <span>{lang === "ar" ? "أعلى تزامن" : "Peak Concurrent"}</span>
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <p className="text-lg font-black text-white font-mono">
                            {(analyticsData?.dayPeakConcurrent || 0).toLocaleString()}
                          </p>
                          <p className="text-[9px] text-zinc-500">
                            {lang === "ar" ? "أقصى تواجد بلحظة" : "Peak simultaneous"}
                          </p>
                        </div>

                        {/* 4. Avg Session Duration */}
                        <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                            <span>{lang === "ar" ? "معدل البقاء" : "Avg Duration"}</span>
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                          </div>
                          <p className="text-lg font-black text-white font-mono">
                            {analyticsData?.avgWatchDuration || 38} {lang === "ar" ? "دقيقة" : "min"}
                          </p>
                          <p className="text-[9px] text-zinc-500">
                            {lang === "ar" ? "معدل المكوث بالموقع" : "Average time on site"}
                          </p>
                        </div>
                      </div>

                      {/* Hourly Breakdown Timeline for Selected Day */}
                      <div className="pt-2 border-t border-zinc-800/60 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-zinc-300">
                          <span className="flex items-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                            {lang === "ar" ? "التوزيع الساعي لنشاط اليوم المحدد (24 ساعة)" : "24-Hour Day Activity Distribution"}
                          </span>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="flex items-center gap-1 text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {lang === "ar" ? "زوار" : "Visitors"}
                            </span>
                            <span className="flex items-center gap-1 text-red-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              {lang === "ar" ? "بث" : "Stream"}
                            </span>
                          </div>
                        </div>

                        <div className="h-24 flex items-end gap-1 pt-3 pb-1">
                          {(analyticsData?.hourlyTrend || []).map((item, i) => {
                            const maxV = Math.max(...(analyticsData?.hourlyTrend || []).map(t => t.visitors), 1);
                            const heightPct = Math.round((item.visitors / maxV) * 100);
                            const streamPct = Math.round((item.liveViewers / maxV) * 100);

                            return (
                              <div key={`hourly-trend-${item.time || i}-${i}`} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                                <div className="absolute -top-9 bg-black/95 text-white text-[9px] px-2 py-1 rounded shadow-xl border border-zinc-700 opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-20">
                                  {item.time}: {item.visitors} {lang === "ar" ? "زائر" : "visitors"} | {item.liveViewers} {lang === "ar" ? "بث" : "streamers"}
                                </div>
                                <div className="w-full flex items-end gap-0.5 h-full">
                                  <div 
                                    className="w-1/2 bg-emerald-500/80 group-hover:bg-emerald-400 rounded-t transition-all"
                                    style={{ height: `${Math.max(12, heightPct)}%` }}
                                  />
                                  <div 
                                    className="w-1/2 bg-red-500/80 group-hover:bg-red-400 rounded-t transition-all"
                                    style={{ height: `${Math.max(6, streamPct)}%` }}
                                  />
                                </div>
                                <span className="text-[8px] font-mono text-zinc-500 mt-1">{item.time}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : adminModalTab === "channels" ? (
                  /* CHANNELS MANAGEMENT VIEW */
                  <div className="space-y-6">
                    {/* Success/Error Message */}
                    {adminMessage && (
                      <div className={`p-3 rounded-xl text-xs font-bold border ${
                        adminMessage.type === "success"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {adminMessage.text}
                      </div>
                    )}

                    {isCreatingChannel || adminEditingChannel ? (
                      /* CHANNEL CREATE / EDIT FORM */
                      <div className="p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 via-zinc-900/90 to-zinc-950 space-y-5 shadow-lg">
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                              <Tv className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                                {adminEditingChannel 
                                  ? (lang === "ar" ? `تعديل القناة: ${channelFormData.nameAr || channelFormData.nameEn}` : `Edit Channel: ${channelFormData.nameEn || channelFormData.nameAr}`)
                                  : (lang === "ar" ? "إضافة قناة تلفزيونية جديدة" : "Add New TV Channel")
                                }
                              </h4>
                              <p className="text-[10px] text-zinc-400">
                                {lang === "ar" ? "أدخل بيانات القناة وشعارها وسيرفرات البث المباشر" : "Enter channel details, logo, and streaming servers"}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => resetChannelForm()}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "إلغاء والعودة" : "Cancel"}</span>
                          </button>
                        </div>

                        {/* Channel Names (AR & EN) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "اسم القناة (بالعربية) *" : "Channel Name (Arabic) *"}
                            </label>
                            <input
                              type="text"
                              placeholder="مثال: بي إن سبورت 1 HD"
                              value={channelFormData.nameAr}
                              onChange={(e) => setChannelFormData({ ...channelFormData, nameAr: e.target.value })}
                              className="w-full text-xs font-medium rounded-xl p-2.5 bg-zinc-900 border border-zinc-800 focus:border-cyan-500 text-white placeholder-zinc-500 outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "اسم القناة (بالإنجليزية)" : "Channel Name (English)"}
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. beIN Sports 1 HD"
                              value={channelFormData.nameEn}
                              onChange={(e) => setChannelFormData({ ...channelFormData, nameEn: e.target.value })}
                              className="w-full text-xs font-medium rounded-xl p-2.5 bg-zinc-900 border border-zinc-800 focus:border-cyan-500 text-white placeholder-zinc-500 outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Category & Quality */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "تصنيف القناة" : "Channel Category"}
                            </label>
                            <select
                              value={channelFormData.category}
                              onChange={(e) => {
                                const cat = e.target.value as any;
                                const catMap: Record<string, { ar: string; en: string }> = {
                                  sports: { ar: "رياضية", en: "Sports" },
                                  cinema: { ar: "أفلام وسينما", en: "Movies & Cinema" },
                                  news: { ar: "إخبارية", en: "News" },
                                  general: { ar: "منوعة وترفيه", en: "Entertainment & TV" },
                                  documentary: { ar: "وثائقية", en: "Documentary" },
                                  kids: { ar: "أطفال", en: "Kids" },
                                };
                                const mapped = catMap[cat] || { ar: "عامة", en: "General" };
                                setChannelFormData({
                                  ...channelFormData,
                                  category: cat,
                                  categoryNameAr: mapped.ar,
                                  categoryNameEn: mapped.en
                                });
                              }}
                              className="w-full text-xs font-bold rounded-xl p-2.5 bg-zinc-900 border border-zinc-800 focus:border-cyan-500 text-white outline-none transition cursor-pointer"
                            >
                              <option value="sports">{lang === "ar" ? "⚽ قنوات رياضية" : "⚽ Sports"}</option>
                              <option value="cinema">{lang === "ar" ? "🎬 أفلام وسينما" : "🎬 Cinema & Movies"}</option>
                              <option value="news">{lang === "ar" ? "📰 قنوات إخبارية" : "📰 News"}</option>
                              <option value="general">{lang === "ar" ? "📺 قنوات منوعة وترفيه" : "📺 General & Entertainment"}</option>
                              <option value="documentary">{lang === "ar" ? "🌍 قنوات وثائقية" : "🌍 Documentary"}</option>
                              <option value="kids">{lang === "ar" ? "🎨 قنوات أطفال" : "🎨 Kids"}</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "جودة البث الافتراضية" : "Default Quality"}
                            </label>
                            <select
                              value={channelFormData.quality}
                              onChange={(e) => setChannelFormData({ ...channelFormData, quality: e.target.value as any })}
                              className="w-full text-xs font-bold rounded-xl p-2.5 bg-zinc-900 border border-zinc-800 focus:border-cyan-500 text-white outline-none transition cursor-pointer"
                            >
                              <option value="4K">4K Ultra HD</option>
                              <option value="FHD">Full HD (1080p)</option>
                              <option value="HD">HD (720p)</option>
                              <option value="SD">SD (480p)</option>
                            </select>
                          </div>
                        </div>

                        {/* Country / Region */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "دولة / منطقة القناة (بالعربية)" : "Country/Region (Arabic)"}
                            </label>
                            <input
                              type="text"
                              placeholder="مثال: قطر / الشرق الأوسط"
                              value={channelFormData.countryAr}
                              onChange={(e) => setChannelFormData({ ...channelFormData, countryAr: e.target.value })}
                              className="w-full text-xs font-medium rounded-xl p-2.5 bg-zinc-900 border border-zinc-800 focus:border-cyan-500 text-white placeholder-zinc-500 outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "دولة القناة (بالإنجليزية)" : "Country/Region (English)"}
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Qatar / MENA"
                              value={channelFormData.countryEn}
                              onChange={(e) => setChannelFormData({ ...channelFormData, countryEn: e.target.value })}
                              className="w-full text-xs font-medium rounded-xl p-2.5 bg-zinc-900 border border-zinc-800 focus:border-cyan-500 text-white placeholder-zinc-500 outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Channel Logo Section */}
                        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
                          <label className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider block">
                            {lang === "ar" ? "شعار القناة (Logo)" : "Channel Logo"}
                          </label>

                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                              {channelFormData.logo ? (
                                <img
                                  src={channelFormData.logo}
                                  alt="Channel Logo"
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <Tv className="w-6 h-6 text-zinc-600" />
                              )}
                            </div>

                            <div className="flex-1 space-y-2">
                              {/* Direct URL input */}
                              <input
                                type="text"
                                placeholder={lang === "ar" ? "رابط صورة الشعار (URL)..." : "Logo Image URL..."}
                                value={channelFormData.logo}
                                onChange={(e) => setChannelFormData({ ...channelFormData, logo: e.target.value })}
                                className="w-full text-xs font-medium rounded-xl p-2 bg-zinc-900 border border-zinc-800 focus:border-cyan-500 text-white placeholder-zinc-500 outline-none transition"
                              />

                              {/* Upload from device */}
                              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold cursor-pointer transition">
                                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                                <span>{lang === "ar" ? "رفع الشعار من جهازك" : "Upload logo from device"}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        const result = ev.target?.result as string;
                                        if (result) {
                                          setChannelFormData({ ...channelFormData, logo: result });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Current Program (Optional) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "البرنامج أو الحدث المذاع حالياً (اختياري)" : "Currently Airing Show (Optional)"}
                            </label>
                            <input
                              type="text"
                              placeholder="مثال: استوديو دوري أبطال أوروبا"
                              value={channelFormData.currentProgramAr}
                              onChange={(e) => setChannelFormData({ ...channelFormData, currentProgramAr: e.target.value })}
                              className="w-full text-xs font-medium rounded-xl p-2.5 bg-zinc-900 border border-zinc-800 focus:border-cyan-500 text-white placeholder-zinc-500 outline-none transition"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "البرنامج الحالي (بالإنجليزية)" : "Current Show (English)"}
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Champions League Studio"
                              value={channelFormData.currentProgramEn}
                              onChange={(e) => setChannelFormData({ ...channelFormData, currentProgramEn: e.target.value })}
                              className="w-full text-xs font-medium rounded-xl p-2.5 bg-zinc-900 border border-zinc-800 focus:border-cyan-500 text-white placeholder-zinc-500 outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Streaming Servers List */}
                        <div className="space-y-3 pt-2 border-t border-zinc-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-[11px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Radio className="w-3.5 h-3.5" />
                                <span>{lang === "ar" ? "سيرفرات وروابط البث المباشر للقناة" : "Channel Live Streaming Servers"}</span>
                              </label>
                              <p className="text-[10px] text-zinc-400">
                                {lang === "ar" ? "يدعم روابط M3U8, MP4, روابط اليوتيوب, أو كود Iframe التضمين" : "Supports M3U8, MP4, YouTube embeds, or Iframe tags"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const nextNum = channelFormData.streams.length + 1;
                                setChannelFormData({
                                  ...channelFormData,
                                  streams: [
                                    ...channelFormData.streams,
                                    {
                                      nameAr: `سيرفر ${nextNum}`,
                                      nameEn: `Server ${nextNum}`,
                                      url: "",
                                      type: "video",
                                      quality: "1080p"
                                    }
                                  ]
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{lang === "ar" ? "إضافة سيرفر" : "Add Server"}</span>
                            </button>
                          </div>

                          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {channelFormData.streams.map((stream, idx) => (
                              <div key={idx} className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/90 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-black text-zinc-300">
                                    {lang === "ar" ? `سيرفر البث #${idx + 1}` : `Stream Server #${idx + 1}`}
                                  </span>

                                  {channelFormData.streams.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = channelFormData.streams.filter((_, i) => i !== idx);
                                        setChannelFormData({ ...channelFormData, streams: updated });
                                      }}
                                      className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                      title={lang === "ar" ? "حذف هذا السيرفر" : "Remove server"}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-[9px] font-bold text-zinc-400 block mb-0.5">
                                      {lang === "ar" ? "اسم السيرفر بالعربية" : "Server Name (Arabic)"}
                                    </label>
                                    <input
                                      type="text"
                                      value={stream.nameAr}
                                      onChange={(e) => {
                                        const updated = [...channelFormData.streams];
                                        updated[idx].nameAr = e.target.value;
                                        setChannelFormData({ ...channelFormData, streams: updated });
                                      }}
                                      className="w-full text-xs font-medium rounded-lg p-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 text-white outline-none"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[9px] font-bold text-zinc-400 block mb-0.5">
                                      {lang === "ar" ? "نوع المشغل" : "Stream Type"}
                                    </label>
                                    <select
                                      value={stream.type}
                                      onChange={(e) => {
                                        const updated = [...channelFormData.streams];
                                        updated[idx].type = e.target.value as any;
                                        setChannelFormData({ ...channelFormData, streams: updated });
                                      }}
                                      className="w-full text-xs font-bold rounded-lg p-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 text-white outline-none cursor-pointer"
                                    >
                                      <option value="video">{lang === "ar" ? "🎬 فيديو HLS / MP4" : "🎬 Video (HLS/MP4)"}</option>
                                      <option value="iframe">{lang === "ar" ? "🌐 تضمين Iframe / صفحة" : "🌐 Iframe Embed"}</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[9px] font-bold text-zinc-400 block mb-0.5">
                                      {lang === "ar" ? "الجودة" : "Quality"}
                                    </label>
                                    <select
                                      value={stream.quality}
                                      onChange={(e) => {
                                        const updated = [...channelFormData.streams];
                                        updated[idx].quality = e.target.value;
                                        setChannelFormData({ ...channelFormData, streams: updated });
                                      }}
                                      className="w-full text-xs font-bold rounded-lg p-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 text-white outline-none cursor-pointer"
                                    >
                                      <option value="4K">4K</option>
                                      <option value="1080p">1080p (FHD)</option>
                                      <option value="720p">720p (HD)</option>
                                      <option value="480p">480p (SD)</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[9px] font-bold text-zinc-400 block mb-0.5">
                                    {lang === "ar" ? "رابط البث أو كود التضمين *" : "Stream URL or Embed Code *"}
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="https://.../stream.m3u8 أو كود <iframe>"
                                    value={stream.url}
                                    onChange={(e) => {
                                      const updated = [...channelFormData.streams];
                                      updated[idx].url = e.target.value;
                                      setChannelFormData({ ...channelFormData, streams: updated });
                                    }}
                                    className="w-full text-xs font-mono rounded-lg p-2 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 text-cyan-300 placeholder-zinc-600 outline-none"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Save / Submit Channel Button */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                          <button
                            type="button"
                            onClick={() => resetChannelForm()}
                            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition cursor-pointer"
                          >
                            {lang === "ar" ? "إلغاء" : "Cancel"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveChannelForm()}
                            disabled={isSavingChannels}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs transition shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {isSavingChannels ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span>
                              {isSavingChannels
                                ? (lang === "ar" ? "جاري الحفظ..." : "Saving...")
                                : (lang === "ar" ? "حفظ القناة ونشرها في البوابة" : "Save & Publish Channel")}
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* CHANNELS LIST DASHBOARD */
                      <div className="space-y-4">
                        {/* Action Top Bar */}
                        <div className="p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-zinc-900 to-zinc-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
                          <div>
                            <div className="flex items-center gap-2">
                              <Tv className="w-5 h-5 text-cyan-400" />
                              <h4 className="text-sm font-black text-white">
                                {lang === "ar" ? "قائمة جميع القنوات التلفزيونية" : "All TV Channels Management"}
                              </h4>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {lang === "ar" 
                                ? `لديك حالياً ${customChannels.length} قناة مضافة. يمكنك إضافة قنوات جديدة وتعديل الروابط فوراً.`
                                : `You currently have ${customChannels.length} channels. You can add or modify streams instantly.`}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenAddChannel()}
                            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black transition shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{lang === "ar" ? "إضافة قناة جديدة +" : "Add New Channel +"}</span>
                          </button>
                        </div>

                        {/* Channels Grid / List */}
                        {customChannels.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                            {customChannels.map((channel) => {
                              const channelName = channel.name[lang] || channel.name.en || channel.name.ar;
                              const catName = channel.categoryName?.[lang] || channel.categoryName?.en || channel.categoryName?.ar || channel.category;
                              return (
                                <div
                                  key={channel.id}
                                  className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-cyan-500/40 transition flex items-center justify-between gap-3 group"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                      {channel.logo ? (
                                        <img
                                          src={channel.logo}
                                          alt={channelName}
                                          className="w-full h-full object-cover"
                                          referrerPolicy="no-referrer"
                                        />
                                      ) : (
                                        <Tv className="w-5 h-5 text-zinc-600" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="text-xs font-black text-white truncate group-hover:text-cyan-400 transition">
                                        {channelName}
                                      </h5>
                                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                                          {catName}
                                        </span>
                                        <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                          {channel.quality || "HD"}
                                        </span>
                                        <span className="text-[9px] font-bold text-zinc-400">
                                          {channel.streams?.length || 0} {lang === "ar" ? "سيرفرات" : "servers"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditChannel(channel)}
                                      className="p-2 rounded-xl bg-zinc-800 hover:bg-cyan-500/20 hover:text-cyan-400 text-zinc-300 transition cursor-pointer"
                                      title={lang === "ar" ? "تعديل بيانات القناة وسيرفراتها" : "Edit Channel"}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteChannel(channel.id)}
                                      className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition cursor-pointer"
                                      title={lang === "ar" ? "حذف القناة نهائياً" : "Delete Channel"}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
                              <Tv className="w-6 h-6" />
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-white">
                                {lang === "ar" ? "لا توجد أي قنوات مضافة حالياً" : "No channels added yet"}
                              </h5>
                              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                                {lang === "ar" 
                                  ? "قائمة القنوات فارغة. يمكنك الضغط على الزر أدناه لإضافة قنوات وسيرفرات البث للبوابة."
                                  : "Your channels list is empty. Click below to add your first channel."}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenAddChannel()}
                              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black transition inline-flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
                            >
                              <Plus className="w-4 h-4" />
                              <span>{lang === "ar" ? "إضافة أول قناة الآن" : "Add First Channel Now"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : adminModalTab === "subscriptions" ? (
                  /* SUBSCRIPTION CODES & GATE MANAGEMENT TAB */
                  <div className="space-y-6">
                    {/* Master Gate Setting Switch */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 shadow-lg space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white flex items-center gap-2">
                              <span>{lang === "ar" ? "نظام قفل القنوات التلفزيونية واشتراكات VIP" : "VIP TV Channels Subscription Gate"}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                subscriptionSettings?.gateEnabled
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}>
                                {subscriptionSettings?.gateEnabled
                                  ? (lang === "ar" ? "القفل مفعل" : "Gate Enabled")
                                  : (lang === "ar" ? "القفل معطل" : "Gate Disabled")}
                              </span>
                            </h4>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {lang === "ar"
                                ? "عند تفعيل هذا الخيار، سيُطلب من أي زائر إدخال كود تفعيل نشط للوصول إلى قائمة جميع القنوات والبث المباشر."
                                : "When active, viewers must enter a valid subscription code to view all TV channels & live streams."}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleGate()}
                          disabled={isSavingGateSetting}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md ${
                            subscriptionSettings?.gateEnabled
                              ? "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
                              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                          }`}
                        >
                          {subscriptionSettings?.gateEnabled ? (
                            <>
                              <Lock className="w-4 h-4" />
                              <span>{lang === "ar" ? "تعطيل القفل (مفتوح للجميع)" : "Disable Gate (Public Access)"}</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4" />
                              <span>{lang === "ar" ? "تفعيل القفل (يتطلب كود)" : "Enable Gate (Require Code)"}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* WhatsApp / Support Contact config */}
                      <div className="pt-3 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                            {lang === "ar" ? "رابط طلب الأكواد / الدعم (واتساب أو تيليجرام):" : "Support / Order Link (WhatsApp):"}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={supportContactEdit}
                              onChange={(e) => setSupportContactEdit(e.target.value)}
                              placeholder="https://wa.me/966500000000"
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveSupportContact()}
                              className="px-3 py-2 rounded-xl bg-amber-500 text-black font-black text-xs shrink-0 cursor-pointer hover:bg-amber-400 transition"
                            >
                              {lang === "ar" ? "حفظ" : "Save"}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                            {lang === "ar" ? "عنوان شاشة التفعيل:" : "Gate Screen Title:"}
                          </label>
                          <input
                            type="text"
                            value={subscriptionSettings?.title?.[lang] || (lang === "ar" ? "تفعيل اشتراك المباريات VIP" : "VIP Matches Activation")}
                            readOnly
                            className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-300 text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                        <span className="text-xl font-black font-mono text-white block">{adminSubscriptionCodes.length}</span>
                        <span className="text-[10px] font-extrabold text-zinc-400 uppercase">{lang === "ar" ? "إجمالي الأكواد" : "Total Codes"}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                        <span className="text-xl font-black font-mono text-emerald-400 block">
                          {adminSubscriptionCodes.filter(c => c.status === "active").length}
                        </span>
                        <span className="text-[10px] font-extrabold text-zinc-400 uppercase">{lang === "ar" ? "أكواد نشطة" : "Active"}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                        <span className="text-xl font-black font-mono text-cyan-400 block">
                          {adminSubscriptionCodes.filter(c => c.isLifetime || c.planType === "lifetime").length}
                        </span>
                        <span className="text-[10px] font-extrabold text-zinc-400 uppercase">{lang === "ar" ? "اشتراكات دائمة" : "Lifetime"}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                        <span className="text-xl font-black font-mono text-amber-400 block">
                          {adminSubscriptionCodes.reduce((sum, c) => sum + (c.timesUsed || (c.usedDevices?.length || 0)), 0)}
                        </span>
                        <span className="text-[10px] font-extrabold text-zinc-400 uppercase">{lang === "ar" ? "مرات الاستخدام" : "Times Used"}</span>
                      </div>
                    </div>

                    {/* Generate Codes Tool Form */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-900/70 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            {lang === "ar" ? "توليد وإنشاء أكواد اشتراك جديدة" : "Generate New Subscription Codes"}
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Plan Type */}
                        <div>
                          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                            {lang === "ar" ? "باقة الاشتراك:" : "Subscription Plan:"}
                          </label>
                          <select
                            value={codeGenForm.planType}
                            onChange={(e) => {
                              const p = e.target.value as any;
                              let days = 30;
                              if (p === "24h") days = 1;
                              if (p === "7d") days = 7;
                              if (p === "30d") days = 30;
                              if (p === "90d") days = 90;
                              if (p === "365d") days = 365;
                              if (p === "lifetime") days = 9999;
                              setCodeGenForm({ ...codeGenForm, planType: p, durationDays: days });
                            }}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                          >
                            <option value="24h">24 {lang === "ar" ? "ساعة (تجربة)" : "Hours (Trial)"}</option>
                            <option value="7d">7 {lang === "ar" ? "أيام (أسبوع)" : "Days (1 Week)"}</option>
                            <option value="30d">30 {lang === "ar" ? "يوم (شهر كامل)" : "Days (1 Month)"}</option>
                            <option value="90d">90 {lang === "ar" ? "يوم (3 أشهر)" : "Days (3 Months)"}</option>
                            <option value="365d">365 {lang === "ar" ? "يوم (سنة كاملة)" : "Days (1 Year)"}</option>
                            <option value="lifetime">🌟 {lang === "ar" ? "دائم مدى الحياة (Lifetime VIP)" : "Lifetime VIP"}</option>
                          </select>
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                            {lang === "ar" ? "عدد الأكواد المراد توليدها:" : "Quantity to Generate:"}
                          </label>
                          <select
                            value={codeGenForm.count}
                            onChange={(e) => setCodeGenForm({ ...codeGenForm, count: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs font-bold font-mono focus:outline-none focus:border-amber-500"
                          >
                            <option value="1">1 {lang === "ar" ? "كود فقط" : "code"}</option>
                            <option value="5">5 {lang === "ar" ? "أكواد دفعة واحدة" : "codes"}</option>
                            <option value="10">10 {lang === "ar" ? "أكواد دفعة واحدة" : "codes"}</option>
                            <option value="25">25 {lang === "ar" ? "كود دفعة واحدة" : "codes"}</option>
                          </select>
                        </div>

                        {/* Custom Prefix */}
                        <div>
                          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                            {lang === "ar" ? "بادئة الكود (اختياري):" : "Code Prefix (Optional):"}
                          </label>
                          <input
                            type="text"
                            value={codeGenForm.prefix}
                            onChange={(e) => setCodeGenForm({ ...codeGenForm, prefix: e.target.value.toUpperCase() })}
                            placeholder="VIP"
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Custom Code Specific */}
                        <div>
                          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                            {lang === "ar" ? "كود مخصص معين (اختياري، يترك فارغاً للتوليد العشوائي):" : "Specific Custom Code (Optional):"}
                          </label>
                          <input
                            type="text"
                            value={codeGenForm.customCode}
                            onChange={(e) => setCodeGenForm({ ...codeGenForm, customCode: e.target.value.toUpperCase() })}
                            placeholder={lang === "ar" ? "مثال: GOLDEN2025" : "e.g. GOLDEN2025"}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Note / Client Name */}
                        <div>
                          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                            {lang === "ar" ? "ملاحظة / اسم العميل (اختياري):" : "Note / Client Name:"}
                          </label>
                          <input
                            type="text"
                            value={codeGenForm.note}
                            onChange={(e) => setCodeGenForm({ ...codeGenForm, note: e.target.value })}
                            placeholder={lang === "ar" ? "مثال: اشتراك عميل واتساب 05xxxx" : "e.g. VIP Member #1"}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleGenerateCodes()}
                        disabled={isGeneratingCodes}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
                      >
                        {isGeneratingCodes ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{lang === "ar" ? "جاري توليد الأكواد..." : "Generating Codes..."}</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-4 h-4" />
                            <span>
                              {lang === "ar"
                                ? `توليد ${codeGenForm.count} كود (${codeGenForm.planType === "lifetime" ? "مدى الحياة" : `${codeGenForm.durationDays} يوم`}) الآن`
                                : `Generate ${codeGenForm.count} Code(s) Now`}
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Subscription Codes List & Search */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            {lang === "ar" ? "قائمة جميع الأكواد المحفوظة" : "All Generated Codes"}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-bold">
                            {adminSubscriptionCodes.length}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Search */}
                          <div className="relative">
                            <input
                              type="text"
                              value={adminCodeSearch}
                              onChange={(e) => setAdminCodeSearch(e.target.value)}
                              placeholder={lang === "ar" ? "بحث عن كود أو عميل..." : "Search code or note..."}
                              className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 w-44 sm:w-52"
                            />
                          </div>

                          {/* Copy All Filtered Codes */}
                          {filteredAdminSubscriptionCodes.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleCopyAllFilteredCodes(filteredAdminSubscriptionCodes)}
                              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-zinc-700 shrink-0"
                              title={lang === "ar" ? "نسخ جميع الأكواد المعروضة" : "Copy All Visible Codes"}
                            >
                              <Copy className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden sm:inline">{lang === "ar" ? "نسخ الكل" : "Copy All"}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => fetchSubscriptionCodes()}
                            className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                            title={lang === "ar" ? "تحديث القائمة" : "Refresh List"}
                          >
                            <RefreshCw className={`w-4 h-4 ${isLoadingCodes ? "animate-spin" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Filter pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {[
                          { id: "all", label: lang === "ar" ? "الكل" : "All" },
                          { id: "active", label: lang === "ar" ? "النشطة فقط" : "Active Only" },
                          { id: "expired", label: lang === "ar" ? "المنتهية" : "Expired" },
                          { id: "disabled", label: lang === "ar" ? "المعطلة" : "Disabled" }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setAdminCodeFilter(tab.id as any)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                              adminCodeFilter === tab.id
                                ? "bg-amber-500 text-black font-black"
                                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Codes Grid / List */}
                      {filteredAdminSubscriptionCodes.length > 0 ? (
                        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                          {filteredAdminSubscriptionCodes.map((codeItem) => {
                            const isCopied = copiedCodeId === codeItem.id;
                            const isActive = codeItem.status === "active";

                            return (
                              <div
                                key={codeItem.id}
                                className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                  isActive
                                    ? "bg-zinc-900/90 border-zinc-800 hover:border-amber-500/40"
                                    : "bg-zinc-950/80 border-zinc-900 opacity-65"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    isActive
                                      ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                                      : "bg-zinc-800 border border-zinc-700 text-zinc-500"
                                  }`}>
                                    <KeyRound className="w-5 h-5" />
                                  </div>

                                  <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono font-black text-sm text-white tracking-wider bg-zinc-950 px-2.5 py-0.5 rounded-lg border border-zinc-800">
                                        {codeItem.code}
                                      </span>

                                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                        codeItem.isLifetime || codeItem.planType === "lifetime"
                                          ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                      }`}>
                                        {codeItem.isLifetime || codeItem.planType === "lifetime"
                                          ? (lang === "ar" ? "دائم مدى الحياة" : "Lifetime VIP")
                                          : (lang === "ar" ? `${codeItem.durationDays} يوم` : `${codeItem.durationDays} Days`)}
                                      </span>

                                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                                        isActive
                                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                          : codeItem.status === "expired"
                                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                            : "bg-red-500/15 text-red-400 border border-red-500/30"
                                      }`}>
                                        {isActive
                                          ? (lang === "ar" ? "جاهز للتفعيل" : "Active")
                                          : codeItem.status === "expired"
                                            ? (lang === "ar" ? "منتهي الصلاحية" : "Expired")
                                            : (lang === "ar" ? "معطل" : "Disabled")}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 flex-wrap">
                                      {codeItem.note && (
                                        <span className="text-zinc-300 font-bold bg-zinc-800/80 px-2 py-0.5 rounded">
                                          {codeItem.note}
                                        </span>
                                      )}
                                      <span>
                                        {lang === "ar" ? `الاستخدام: ${codeItem.timesUsed || (codeItem.usedDevices?.length || 0)} / ${codeItem.maxDevices || 1}` : `Used: ${codeItem.timesUsed || (codeItem.usedDevices?.length || 0)} / ${codeItem.maxDevices || 1}`}
                                      </span>
                                      {codeItem.createdAt && (
                                        <span className="text-zinc-500">
                                          {new Date(codeItem.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                  {/* Copy Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCode(codeItem.code, codeItem.id)}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                      isCopied
                                        ? "bg-emerald-500 text-black font-black"
                                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                                    }`}
                                    title={lang === "ar" ? "نسخ الكود" : "Copy Code"}
                                  >
                                    {isCopied ? (
                                      <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>{lang === "ar" ? "تم النسخ" : "Copied"}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>{lang === "ar" ? "نسخ" : "Copy"}</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Toggle Active / Inactive */}
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateCode(codeItem.id, { status: isActive ? "disabled" : "active" })}
                                    className={`p-1.5 rounded-xl border transition cursor-pointer ${
                                      isActive
                                        ? "bg-zinc-800 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 border-zinc-700"
                                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    }`}
                                    title={isActive ? (lang === "ar" ? "تعطيل الكود" : "Disable Code") : (lang === "ar" ? "تفعيل الكود" : "Enable Code")}
                                  >
                                    {isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                  </button>

                                   {/* Delete Code */}
                                  {deletingCodeId === codeItem.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCode(codeItem.id)}
                                        className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-black cursor-pointer shadow-sm"
                                        title={lang === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
                                      >
                                        {lang === "ar" ? "تأكيد" : "Delete"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeletingCodeId(null)}
                                        className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold cursor-pointer"
                                      >
                                        {lang === "ar" ? "إلغاء" : "Cancel"}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setDeletingCodeId(codeItem.id)}
                                      className="p-1.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition cursor-pointer border border-zinc-700"
                                      title={lang === "ar" ? "حذف الكود نهائياً" : "Delete Code"}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 text-center space-y-2">
                          <KeyRound className="w-8 h-8 mx-auto text-zinc-600" />
                          <h5 className="text-xs font-bold text-zinc-300">
                            {lang === "ar" ? "لا توجد أكواد مطابقة لخيارات البحث" : "No matching codes found"}
                          </h5>
                          <p className="text-[11px] text-zinc-500">
                            {lang === "ar" ? "يمكنك توليد أكواد جديدة بالضغط على زر التوليد في الأعلى." : "Generate new codes using the generator tool above."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : adminModalTab === "backup" ? (
                  /* BACKUP & RESTORE VIEW FOR ADMIN */
                  <div className="space-y-6">
                    {/* Feedback Message */}
                    {adminMessage && (
                      <div className={`p-3.5 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                        adminMessage.type === "success"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}>
                        {adminMessage.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        )}
                        <span>{adminMessage.text}</span>
                      </div>
                    )}

                    {quickSnapshotStatus && (
                      <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-400" />
                        <span>{quickSnapshotStatus}</span>
                      </div>
                    )}

                    {/* Hero Card: Backup Overview */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-950 shadow-xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                            <HardDrive className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white flex items-center gap-2">
                              <span>{lang === "ar" ? "سحب نسخة احتياطية واستعادة جميع تفاصيل الموقع" : "Full Site Backup & Data Restore"}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                JSON v2.0
                              </span>
                            </h4>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {lang === "ar"
                                ? "تصدير وحفظ واسترجاع كافة القنوات، أكواد الاشتراكات، إعدادات البوابة، شعار الموقع، وتعديلات المباريات بنقرة واحدة."
                                : "Export, backup, and restore all channels, subscription codes, site settings, and match streams in one click."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Live Items Grid included in backup */}
                      <div>
                        <div className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-purple-400" />
                          <span>{lang === "ar" ? "محتويات النسخة الاحتياطية الحالية:" : "Included in Current Live Snapshot:"}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
                            <span className="text-[10px] font-extrabold text-cyan-400 flex items-center gap-1">
                              <Tv className="w-3.5 h-3.5" />
                              {lang === "ar" ? "القنوات التلفزيونية" : "TV Channels"}
                            </span>
                            <p className="text-lg font-black text-white mt-1">
                              {customChannels.length} <span className="text-[10px] font-normal text-zinc-400">{lang === "ar" ? "قناة" : "channels"}</span>
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
                            <span className="text-[10px] font-extrabold text-amber-400 flex items-center gap-1">
                              <KeyRound className="w-3.5 h-3.5" />
                              {lang === "ar" ? "أكواد الاشتراكات" : "Sub Codes"}
                            </span>
                            <p className="text-lg font-black text-white mt-1">
                              {adminSubscriptionCodes.length} <span className="text-[10px] font-normal text-zinc-400">{lang === "ar" ? "كود" : "codes"}</span>
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
                            <span className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1">
                              <Trophy className="w-3.5 h-3.5" />
                              {lang === "ar" ? "المباريات وسيرفراتها" : "Matches & Streams"}
                            </span>
                            <p className="text-lg font-black text-white mt-1">
                              {adminMatchIds.length} <span className="text-[10px] font-normal text-zinc-400">{lang === "ar" ? "مباراة" : "matches"}</span>
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
                            <span className="text-[10px] font-extrabold text-purple-400 flex items-center gap-1">
                              <Settings className="w-3.5 h-3.5" />
                              {lang === "ar" ? "إعدادات البوابة والموقع" : "Site Settings"}
                            </span>
                            <p className="text-xs font-black text-white mt-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                              {siteLogo ? (lang === "ar" ? "شعار مخصص" : "Custom Logo") : (lang === "ar" ? "كاملة ومفعلة" : "Active")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 1: Export Actions */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowDownToLine className="w-4 h-4 text-purple-400" />
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            {lang === "ar" ? "١. سحب وتصدير النسخة الاحتياطية" : "1. Export & Download Backup"}
                          </h4>
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {lang === "ar" ? "تصدير فوري بصيغة JSON" : "Direct JSON Export"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Primary Download Button */}
                        <button
                          type="button"
                          onClick={handleDownloadFullBackup}
                          disabled={isExportingBackup}
                          className="w-full p-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition cursor-pointer"
                        >
                          {isExportingBackup ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            <Download className="w-4 h-4 text-white" />
                          )}
                          <span>{lang === "ar" ? "تحميل ملف النسخة الاحتياطية (.JSON)" : "Download Backup File (.JSON)"}</span>
                        </button>

                        {/* Copy JSON Button */}
                        <button
                          type="button"
                          onClick={handleCopyBackupToClipboard}
                          disabled={isExportingBackup}
                          className="w-full p-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          {isCopiedBackupJson ? (
                            <CheckCheck className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-purple-400" />
                          )}
                          <span>
                            {isCopiedBackupJson 
                              ? (lang === "ar" ? "تم نسخ كود الـ JSON بنجاح!" : "JSON Copied to Clipboard!")
                              : (lang === "ar" ? "نسخ نص النسخة الاحتياطية (Copy JSON)" : "Copy Backup JSON Text")}
                          </span>
                        </button>
                      </div>

                      {/* Quick Secondary Actions & Preview Toggle */}
                      <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleQuickLocalSnapshot}
                            className="px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-[11px] font-bold text-zinc-300 flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5 text-amber-400" />
                            <span>{lang === "ar" ? "حفظ لقطة سريعة في المتصفح" : "Save Quick Browser Snapshot"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleRestoreQuickLocalSnapshot}
                            className="px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-[11px] font-bold text-zinc-300 flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{lang === "ar" ? "استعادة آخر لقطة سريعة" : "Restore Quick Snapshot"}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            if (!isBackupJsonPreviewOpen && !liveBackupJsonStr) {
                              await fetchLiveBackupData();
                            }
                            setIsBackupJsonPreviewOpen(!isBackupJsonPreviewOpen);
                          }}
                          className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition cursor-pointer"
                        >
                          <FileJson className="w-3.5 h-3.5" />
                          <span>
                            {isBackupJsonPreviewOpen 
                              ? (lang === "ar" ? "إخفاء معاينة الكود" : "Hide JSON Preview")
                              : (lang === "ar" ? "معاينة كود النسخة الحالية" : "Preview Live JSON")}
                          </span>
                        </button>
                      </div>

                      {/* Expandable Live JSON Box */}
                      {isBackupJsonPreviewOpen && (
                        <div className="mt-3 p-3.5 rounded-xl bg-black border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-zinc-900">
                            <span className="font-mono">{lang === "ar" ? "معاينة ملف النسخة الاحتياطية الخام:" : "Raw Backup JSON Payload:"}</span>
                            <button
                              type="button"
                              onClick={handleCopyBackupToClipboard}
                              className="text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{lang === "ar" ? "نسخ" : "Copy"}</span>
                            </button>
                          </div>
                          <pre className="text-[10px] font-mono text-purple-300/90 overflow-x-auto max-h-[160px] p-2 bg-zinc-950 rounded-lg scrollbar-thin">
                            {liveBackupJsonStr || JSON.stringify(backupSummaryData || {}, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Section 2: Restore Backup */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowUpFromLine className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            {lang === "ar" ? "٢. استعادة وتطبيق نسخة احتياطية" : "2. Restore Site Backup"}
                          </h4>
                        </div>
                        {/* Mode switch */}
                        <div className="flex p-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setBackupRestoreMode("file")}
                            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                              backupRestoreMode === "file" ? "bg-purple-600 text-white shadow" : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {lang === "ar" ? "رفع ملف JSON" : "Upload File"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setBackupRestoreMode("paste")}
                            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                              backupRestoreMode === "paste" ? "bg-purple-600 text-white shadow" : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            {lang === "ar" ? "لصق نص JSON" : "Paste JSON"}
                          </button>
                        </div>
                      </div>

                      {/* File Upload Dropzone */}
                      {backupRestoreMode === "file" ? (
                        <div>
                          <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-purple-500/80 bg-zinc-950/60 hover:bg-zinc-900/50 cursor-pointer transition text-center group">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
                              <FileUp className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-black text-zinc-200">
                                {lang === "ar" ? "اضغط لاختيار ملف النسخة الاحتياطية (.json) من جهازك" : "Click or drag & drop backup (.json) file"}
                              </p>
                              <p className="text-[10px] text-zinc-500">
                                {lang === "ar" ? "الملفات المدعومة: JSON فقط" : "Supported formats: .json"}
                              </p>
                            </div>
                            <input
                              type="file"
                              accept=".json,application/json"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileSelectForRestore(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      ) : (
                        /* Paste JSON Box */
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-zinc-300 block">
                            {lang === "ar" ? "الصق كود الـ JSON هنا للتحقق والاستعادة:" : "Paste JSON Backup Code:"}
                          </label>
                          <textarea
                            value={backupPasteText}
                            onChange={(e) => handleParsePastedJson(e.target.value)}
                            placeholder='{"channels": [...], "subscriptionCodes": [...], ...}'
                            rows={4}
                            className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/80 scrollbar-thin"
                          />
                        </div>
                      )}

                      {/* Parse Error Display */}
                      {backupParseError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{backupParseError}</span>
                        </div>
                      )}

                      {/* Verified Preview & Confirmation Box */}
                      {parsedBackupData && (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-zinc-900 to-zinc-950 border border-emerald-500/30 space-y-3.5">
                          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{lang === "ar" ? "تم التحقق من صحة ملف النسخة الاحتياطية بنجاح!" : "Backup File Validated Successfully!"}</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {parsedBackupData.meta?.exportDate ? new Date(parsedBackupData.meta.exportDate).toLocaleString() : ""}
                            </span>
                          </div>

                          {/* Discovered Contents Summary */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800">
                              <span className="text-[10px] text-zinc-400 block">{lang === "ar" ? "القنوات المكتشفة" : "Channels"}</span>
                              <span className="font-black text-cyan-400 text-sm">
                                {Array.isArray(parsedBackupData.channels) ? parsedBackupData.channels.length : 0} {lang === "ar" ? "قناة" : "items"}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800">
                              <span className="text-[10px] text-zinc-400 block">{lang === "ar" ? "أكواد الاشتراكات" : "Sub Codes"}</span>
                              <span className="font-black text-amber-400 text-sm">
                                {Array.isArray(parsedBackupData.subscriptionCodes) ? parsedBackupData.subscriptionCodes.length : 0} {lang === "ar" ? "كود" : "codes"}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800">
                              <span className="text-[10px] text-zinc-400 block">{lang === "ar" ? "تعديلات المباريات" : "Match Overrides"}</span>
                              <span className="font-black text-emerald-400 text-sm">
                                {parsedBackupData.matchOverrides ? Object.keys(parsedBackupData.matchOverrides).length : 0} {lang === "ar" ? "مباراة" : "matches"}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800">
                              <span className="text-[10px] text-zinc-400 block">{lang === "ar" ? "إعدادات البوابة" : "Site Settings"}</span>
                              <span className="font-black text-purple-400 text-sm">
                                {parsedBackupData.siteSettings || parsedBackupData.subscriptionSettings ? (lang === "ar" ? "متوفرة ✓" : "Present ✓") : (lang === "ar" ? "بدون" : "None")}
                              </span>
                            </div>
                          </div>

                          {/* Warning text */}
                          <p className="text-[11px] text-amber-400/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                            ⚠️ {lang === "ar"
                              ? "تنبيه: استعادة النسخة الاحتياطية ستحدّث وتستبدل البيانات الحالية بالبيانات المكتشفة في هذا الملف وتطبيقها فوراً على السيرفر."
                              : "Notice: Restoring will overwrite existing data on the server with the contents of this backup."}
                          </p>

                          {/* Confirm Restore Button */}
                          <button
                            type="button"
                            onClick={() => handleExecuteRestore()}
                            disabled={isRestoringBackup}
                            className="w-full p-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                          >
                            {isRestoringBackup ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-black" />
                            ) : (
                              <CheckCheck className="w-4 h-4 text-black" />
                            )}
                            <span>{lang === "ar" ? "تأكيد واستعادة جميع تفاصيل الموقع الآن" : "Confirm & Restore All Site Details Now"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* CONTROLS VIEW */
                  <div className="space-y-6">
                    {/* Success/Error Message */}
                    {adminMessage && (
                      <div className={`p-3 rounded-xl text-xs font-bold border ${
                        adminMessage.type === "success"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {adminMessage.text}
                      </div>
                    )}

                    {/* Site Logo Manager Section for Admin */}
                    <div className="p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-zinc-900/90 to-zinc-950 space-y-4 shadow-md">
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                            <Image className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                              {lang === "ar" ? "تغيير شعار الموقع (للمسؤول)" : "Change Site Logo (Admin)"}
                            </h4>
                            <p className="text-[10px] text-zinc-400">
                              {lang === "ar" ? "الشعار المظهر أعلى الصفحة الرئيسية وفي الهيدر لجميع الزوار" : "Header logo displayed to all portal visitors"}
                            </p>
                          </div>
                        </div>

                        {/* Current Logo Badge */}
                        <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 shrink-0">
                          <span className="text-[10px] font-extrabold text-zinc-400">{lang === "ar" ? "الشعار الحالي:" : "Current:"}</span>
                          <div className="w-8 h-8 rounded-lg bg-black border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                            {siteLogo ? (
                              <img src={siteLogo} alt="Logo Preview" className="w-full h-full object-cover" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Upload & Logo Options */}
                      <div className="space-y-3">
                        {/* Upload from Device Gallery / Studio */}
                        <div>
                          <label className="text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider block mb-1.5">
                            {lang === "ar" ? "رفع صورة شعار جديدة من جهازك" : "Upload new logo photo from device"}
                          </label>
                          <label className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border border-dashed border-amber-500/40 bg-zinc-900/60 hover:bg-zinc-850 cursor-pointer transition">
                            <Upload className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold text-zinc-200">
                              {lang === "ar" ? "اضغط لاختيار صورة الشعار من الاستوديو" : "Click to select logo from gallery"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const newLogo = reader.result as string;
                                    setSiteLogo(newLogo);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>

                        {/* Save Logo Action */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80">
                          <button
                            type="button"
                            onClick={handleSaveSiteLogo}
                            disabled={isSavingLogo}
                            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
                          >
                            {isSavingLogo ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span>{lang === "ar" ? "حفظ وتطبيق شعار الموقع" : "Save & Apply Site Logo"}</span>
                          </button>

                          {siteLogo && (
                            <button
                              type="button"
                              onClick={async () => {
                                setSiteLogo("");
                                setIsSavingLogo(true);
                                try {
                                  await fetch("/api/admin/site-settings", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ logo: "" })
                                  });
                                  localStorage.removeItem("el_portal_site_logo");
                                  setAdminMessage({
                                    text: lang === "ar" ? "تم إعادة الشعار الافتراضي للموقع." : "Reset to default logo.",
                                    type: "success"
                                  });
                                } catch (e) {
                                  // ignore
                                } finally {
                                  setIsSavingLogo(false);
                                }
                              }}
                              className="text-xs font-bold text-zinc-400 hover:text-red-400 transition cursor-pointer"
                            >
                              {lang === "ar" ? "إعادة للشعار الافتراضي" : "Reset to default logo"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                {/* Custom Match Addition */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                    {lang === "ar" ? "١. إضافة مباراة جديدة" : "1. Add New Match"}
                  </h4>
                  <button
                    type="button"
                    onClick={async () => {
                      const customId = `custom_${Date.now()}`;
                      const success = await saveMatchListOnServer([...adminMatchIds, customId]);
                      if (success) {
                        setEditingMatch({
                          id: customId,
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
                        });
                        setEditTab("basic");
                      }
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 transition whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === "ar" ? "إنشاء مباراة مخصصة جديدة" : "Create New Custom Match"}</span>
                  </button>
                </div>

                {/* Current Saved Matches list with IDs */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                    {lang === "ar" ? "٢. قائمة المباريات النشطة المحددة" : "2. Active Match Selection"}
                  </h4>
                  <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-900 bg-zinc-900/30">
                    {adminMatchIds.length > 0 ? (
                      adminMatchIds.map((id, index) => {
                        const foundMatch = matches.find(m => String(m.id) === String(id));
                        const label = foundMatch
                          ? `${foundMatch.teamA[lang] || foundMatch.teamA.en} vs ${foundMatch.teamB[lang] || foundMatch.teamB.en}`
                          : (lang === "ar" ? `مباراة قوقل رقم: ${id}` : `Google Match ID: ${id}`);

                        return (
                          <div key={`${id}-${index}`} className="p-2.5 flex items-center justify-between gap-4 text-xs">
                            <div>
                              <p className="font-bold">{label}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">ID: {id}</p>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  const fm = matches.find(m => String(m.id) === String(id)) || {
                                    id,
                                    sport: "football",
                                    teamA: { ar: "فريق أ", en: "Team A" },
                                    teamB: { ar: "فريق ب", en: "Team B" },
                                    scoreA: 0,
                                    scoreB: 0,
                                    status: "upcoming",
                                    statusText: { ar: "لم تبدأ", en: "Upcoming" },
                                    time: { ar: "٢٠:٠٠", en: "20:00" },
                                    venue: { ar: "ملعب", en: "Stadium" },
                                    leagueName: "La Liga",
                                    scorers: { home: [], away: [] },
                                    stats: [],
                                    lineups: null
                                  };
                                  setEditingMatch(fm);
                                  setEditTab("basic");
                                }}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-zinc-800 transition"
                                title={lang === "ar" ? "تعديل المباراة" : "Edit match"}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveMatchId(id)}
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 border border-zinc-800 transition"
                                title={lang === "ar" ? "حذف من القائمة" : "Delete match"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-zinc-500 text-xs italic">
                        {lang === "ar" ? "قائمتك فارغة تماماً. لن يتم عرض مباريات في البوابة!" : "Your list is empty. No matches will be displayed!"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

              {/* Admin Footer */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {lang === "ar" ? "يتم حفظ وإلغاء المباريات تلقائياً في الصفحة الرئيسية فوراً." : "Matches are automatically saved & updated on the homepage instantly."}
                </span>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setIsAdminOpen(false)}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{lang === "ar" ? "موافق (إغلاق)" : "Done (Close)"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* EDIT MATCH DETAILS MODAL */}
        {editingMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingMatch(null)}
            className="fixed inset-0 bg-black/85 md:backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl flex flex-col ${
                theme === "black" ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h3 className="text-base font-bold tracking-tight">
                    {lang === "ar" ? "تعديل تفاصيل لوحة المباراة" : "Edit Match Card Details"}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingMatch(null)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-zinc-800/80 bg-zinc-900/10 p-1">
                {(["basic", "details", "streams", "scorers", "stats"] as const).map((tab) => {
                  const labels = {
                    basic: lang === "ar" ? "الأساسي" : "Basic",
                    details: lang === "ar" ? "التفاصيل" : "Details",
                    streams: lang === "ar" ? "روابط البث 📡" : "Streams 📡",
                    scorers: lang === "ar" ? "الهدافين" : "Scorers",
                    stats: lang === "ar" ? "الإحصائيات" : "Stats"
                  };
                  return (
                    <button
                      key={`edit-tab-${tab}`}
                      onClick={() => setEditTab(tab)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                        editTab === tab
                          ? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                      }`}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>



              {/* Form Scrollable Body */}
              <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
                {adminMessage && (
                  <div className={`p-3 text-xs rounded-xl font-bold flex items-center justify-between border ${
                    adminMessage.type === "success" 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    <span>{adminMessage.text}</span>
                    <button onClick={() => setAdminMessage(null)} className="text-[10px] underline hover:text-white ml-2 cursor-pointer">
                      {lang === "ar" ? "إغلاق" : "Dismiss"}
                    </button>
                  </div>
                )}
                {editTab === "basic" && (
                  <div className="space-y-4">
                    {/* Team A (Home) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "الفريق أ (عربي)" : "Team A (AR)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.teamA?.ar || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            teamA: { ...(editingMatch.teamA || {}), ar: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "الفريق أ (إنجليزي)" : "Team A (EN)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.teamA?.en || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            teamA: { ...(editingMatch.teamA || {}), en: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Team A Logo Selector (Studio) */}
                    <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                            {editingMatch.logoA ? (
                              <img src={editingMatch.logoA} alt="Team A Logo" className="w-6.5 h-6.5 object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <Image className="w-4 h-4 text-zinc-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                              {lang === "ar" ? "شعار الفريق أ" : "Team A Logo"}
                            </span>
                            <span className="text-[9px] text-zinc-500 truncate block max-w-[150px]" title={editingMatch.logoA || ""}>
                              {editingMatch.logoA ? (editingMatch.logoA.startsWith("data:") ? (lang === "ar" ? "صورة مرفوعة (الاستوديو)" : "Uploaded (Studio)") : (lang === "ar" ? "رابط مخصص" : "Custom Link")) : (lang === "ar" ? "الشعار الافتراضي" : "Default Logo")}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setLogoSelectorFor(logoSelectorFor === "A" ? null : "A")}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ${
                              logoSelectorFor === "A" 
                                ? "bg-amber-500 text-black shadow-md shadow-amber-500/15" 
                                : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "تعديل الشعار" : "Edit Logo"}</span>
                          </button>
                          {editingMatch.logoA && (
                            <button
                              type="button"
                              onClick={() => setEditingMatch({ ...editingMatch, logoA: "" })}
                              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 transition"
                              title={lang === "ar" ? "حذف الشعار" : "Delete Logo"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {logoSelectorFor === "A" && (
                        <div className="pt-2.5 border-t border-zinc-800/60 space-y-3">
                          {/* File Uploader */}
                          <div>
                            <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "١. الرفع من استوديو الجهاز" : "1. Upload from Device Gallery/Studio"}
                            </label>
                            <label className="flex flex-col items-center justify-center w-full h-16 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 cursor-pointer transition">
                              <div className="flex flex-col items-center justify-center text-center px-4">
                                <Upload className="w-4 h-4 text-amber-500 mb-1" />
                                <p className="text-[9px] font-bold text-zinc-300">
                                  {lang === "ar" ? "اضغط لاختيار صورة من الاستوديو" : "Click to choose photo from Studio"}
                                </p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setEditingMatch({
                                        ...editingMatch,
                                        logoA: reader.result as string
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          {/* Quick Club Logo Selector */}
                          <div>
                            <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "٢. اختيار من استوديو الأندية الشهيرة" : "2. Choose from Popular Clubs Gallery"}
                            </label>
                            <div className="grid grid-cols-5 gap-1.5 max-h-[85px] overflow-y-auto p-1.5 border border-zinc-800/40 rounded-xl bg-zinc-900/20">
                              {PRESET_LOGOS.map((club, idx) => (
                                <button
                                  key={`preset-logoA-${idx}`}
                                  type="button"
                                  onClick={() => {
                                    setEditingMatch({
                                      ...editingMatch,
                                      logoA: club.logo
                                    });
                                  }}
                                  className={`p-1 rounded-lg border flex flex-col items-center justify-center gap-1 transition ${
                                    editingMatch.logoA === club.logo
                                      ? "bg-amber-500/10 border-amber-500"
                                      : "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-900"
                                  }`}
                                  title={club.name[lang] || club.name.en}
                                >
                                  <img src={club.logo} alt={club.name.en} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                                  <span className="text-[8px] text-zinc-400 truncate max-w-full font-medium">
                                    {club.name[lang] || club.name.en}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Manual URL Input */}
                          <div>
                            <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "٣. رابط مباشر للشعار" : "3. Direct Logo URL"}
                            </label>
                            <input
                              type="text"
                              value={editingMatch.logoA && !editingMatch.logoA.startsWith("data:") ? editingMatch.logoA : ""}
                              onChange={(e) => setEditingMatch({ ...editingMatch, logoA: e.target.value })}
                              placeholder="https://example.com/logo.png"
                              className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Team B (Away) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "الفريق ب (عربي)" : "Team B (AR)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.teamB?.ar || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            teamB: { ...(editingMatch.teamB || {}), ar: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "الفريق ب (إنجليزي)" : "Team B (EN)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.teamB?.en || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            teamB: { ...(editingMatch.teamB || {}), en: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Team B Logo Selector (Studio) */}
                    <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                            {editingMatch.logoB ? (
                              <img src={editingMatch.logoB} alt="Team B Logo" className="w-6.5 h-6.5 object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <Image className="w-4 h-4 text-zinc-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                              {lang === "ar" ? "شعار الفريق ب" : "Team B Logo"}
                            </span>
                            <span className="text-[9px] text-zinc-500 truncate block max-w-[150px]" title={editingMatch.logoB || ""}>
                              {editingMatch.logoB ? (editingMatch.logoB.startsWith("data:") ? (lang === "ar" ? "صورة مرفوعة (الاستوديو)" : "Uploaded (Studio)") : (lang === "ar" ? "رابط مخصص" : "Custom Link")) : (lang === "ar" ? "الشعار الافتراضي" : "Default Logo")}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setLogoSelectorFor(logoSelectorFor === "B" ? null : "B")}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 ${
                              logoSelectorFor === "B" 
                                ? "bg-amber-500 text-black shadow-md shadow-amber-500/15" 
                                : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "تعديل الشعار" : "Edit Logo"}</span>
                          </button>
                          {editingMatch.logoB && (
                            <button
                              type="button"
                              onClick={() => setEditingMatch({ ...editingMatch, logoB: "" })}
                              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 transition"
                              title={lang === "ar" ? "حذف الشعار" : "Delete Logo"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {logoSelectorFor === "B" && (
                        <div className="pt-2.5 border-t border-zinc-800/60 space-y-3">
                          {/* File Uploader */}
                          <div>
                            <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "١. الرفع من استوديو الجهاز" : "1. Upload from Device Gallery/Studio"}
                            </label>
                            <label className="flex flex-col items-center justify-center w-full h-16 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 cursor-pointer transition">
                              <div className="flex flex-col items-center justify-center text-center px-4">
                                <Upload className="w-4 h-4 text-amber-500 mb-1" />
                                <p className="text-[9px] font-bold text-zinc-300">
                                  {lang === "ar" ? "اضغط لاختيار صورة من الاستوديو" : "Click to choose photo from Studio"}
                                </p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setEditingMatch({
                                        ...editingMatch,
                                        logoB: reader.result as string
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          {/* Quick Club Logo Selector */}
                          <div>
                            <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "٢. اختيار من استوديو الأندية الشهيرة" : "2. Choose from Popular Clubs Gallery"}
                            </label>
                            <div className="grid grid-cols-5 gap-1.5 max-h-[85px] overflow-y-auto p-1.5 border border-zinc-800/40 rounded-xl bg-zinc-900/20">
                              {PRESET_LOGOS.map((club, idx) => (
                                <button
                                  key={`preset-logoB-${idx}`}
                                  type="button"
                                  onClick={() => {
                                    setEditingMatch({
                                      ...editingMatch,
                                      logoB: club.logo
                                    });
                                  }}
                                  className={`p-1 rounded-lg border flex flex-col items-center justify-center gap-1 transition ${
                                    editingMatch.logoB === club.logo
                                      ? "bg-amber-500/10 border-amber-500"
                                      : "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-900"
                                  }`}
                                  title={club.name[lang] || club.name.en}
                                >
                                  <img src={club.logo} alt={club.name.en} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                                  <span className="text-[8px] text-zinc-400 truncate max-w-full font-medium">
                                    {club.name[lang] || club.name.en}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Manual URL Input */}
                          <div>
                            <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                              {lang === "ar" ? "٣. رابط مباشر للشعار" : "3. Direct Logo URL"}
                            </label>
                            <input
                              type="text"
                              value={editingMatch.logoB && !editingMatch.logoB.startsWith("data:") ? editingMatch.logoB : ""}
                              onChange={(e) => setEditingMatch({ ...editingMatch, logoB: e.target.value })}
                              placeholder="https://example.com/logo.png"
                              className="w-full px-2.5 py-1.5 text-[11px] rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scores */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "أهداف الفريق أ" : "Team A Score"}
                        </label>
                        <input
                          type="number"
                          value={editingMatch.scoreA !== undefined ? editingMatch.scoreA : ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            scoreA: e.target.value === "" ? 0 : Number(e.target.value)
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "أهداف الفريق ب" : "Team B Score"}
                        </label>
                        <input
                          type="number"
                          value={editingMatch.scoreB !== undefined ? editingMatch.scoreB : ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            scoreB: e.target.value === "" ? 0 : Number(e.target.value)
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                        {lang === "ar" ? "حالة المباراة" : "Match Status"}
                      </label>
                      <select
                        value={editingMatch.status || "upcoming"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingMatch({
                            ...editingMatch,
                            status: val,
                            statusText: {
                              ar: val === "live" ? "مباشر" : val === "ended" ? "انتهت" : "لم تبدأ",
                              en: val === "live" ? "Live" : val === "ended" ? "FT" : "Upcoming"
                            }
                          });
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="upcoming">{lang === "ar" ? "لم تبدأ (Upcoming)" : "Upcoming"}</option>
                        <option value="live">{lang === "ar" ? "مباشر (Live)" : "Live"}</option>
                        <option value="ended">{lang === "ar" ? "انتهت (Ended)" : "Ended"}</option>
                      </select>
                    </div>

                    {/* League Name */}
                    <div>
                      <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                        {lang === "ar" ? "اسم الدوري" : "League Name"}
                      </label>
                      <input
                        type="text"
                        value={typeof editingMatch.leagueName === "object" ? (editingMatch.leagueName.en || "") : (editingMatch.leagueName || "")}
                        onChange={(e) => setEditingMatch({
                          ...editingMatch,
                          leagueName: e.target.value
                        })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        placeholder={lang === "ar" ? "أدخل اسم الدوري بالإنجليزي ليترجم تلقائياً" : "Enter League Name in English to auto-translate"}
                      />
                    </div>
                  </div>
                )}

                {editTab === "details" && (
                  <div className="space-y-4">
                    {/* Time formatted */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "توقيت المباراة (عربي)" : "Match Time (AR)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.time?.ar || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            time: { ...(editingMatch.time || {}), ar: e.target.value }
                          })}
                          placeholder="اليوم، ٢٠:٠٠"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "توقيت المباراة (إنجليزي)" : "Match Time (EN)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.time?.en || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            time: { ...(editingMatch.time || {}), en: e.target.value }
                          })}
                          placeholder="Today, 20:00"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Venue / Stadium */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "الملعب (عربي)" : "Venue (AR)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.venue?.ar || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            venue: { ...(editingMatch.venue || {}), ar: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "الملعب (إنجليزي)" : "Venue (EN)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.venue?.en || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            venue: { ...(editingMatch.venue || {}), en: e.target.value }
                          })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Status Text (e.g. 90', FT, Live, Upcoming) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "نص الحالة (عربي)" : "Status Text (AR)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.statusText?.ar || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            statusText: { ...(editingMatch.statusText || {}), ar: e.target.value }
                          })}
                          placeholder="مباشر '٤٥"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                          {lang === "ar" ? "نص الحالة (إنجليزي)" : "Status Text (EN)"}
                        </label>
                        <input
                          type="text"
                          value={editingMatch.statusText?.en || ""}
                          onChange={(e) => setEditingMatch({
                            ...editingMatch,
                            statusText: { ...(editingMatch.statusText || {}), en: e.target.value }
                          })}
                          placeholder="Live 45'"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editTab === "streams" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 font-medium">
                      {lang === "ar"
                        ? "يمكنك إضافة روابط البث المباشر (Iframe / M3U8 / MP4) لهذه المباراة حتى لو لم تبدأ بعد. سيتم تفعيل زر البث وتوفيره للمشاهدين فور الإضافة."
                        : "You can add live stream links (Iframe / M3U8 / MP4) for this match even if it has not started yet. The watch button will be enabled for viewers as soon as a link is added."}
                    </div>

                    {/* Main Stream URL */}
                    <div>
                      <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                        {lang === "ar" ? "رابط البث الرئيسي (Iframe أو video/m3u8)" : "Main Stream URL"}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={editingMatch.streamUrl || ""}
                        onChange={(e) => setEditingMatch({ ...editingMatch, streamUrl: e.target.value })}
                        placeholder="https://... or <iframe src='...'></iframe>"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Stream Type */}
                    <div>
                      <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1">
                        {lang === "ar" ? "نوع المشغل" : "Player Type"}
                      </label>
                      <select
                        value={editingMatch.streamType || "iframe"}
                        onChange={(e) => setEditingMatch({ ...editingMatch, streamType: e.target.value as "iframe" | "video" })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="iframe">Iframe Embed (تضمين)</option>
                        <option value="video">Direct Video / HLS Stream (M3U8 / MP4)</option>
                      </select>
                    </div>

                    {/* Multiple Servers Config */}
                    <div className="space-y-3 pt-2 border-t border-zinc-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wider">
                          {lang === "ar" ? "سيرفرات البث الإضافية" : "Additional Stream Servers"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const current = editingMatch.streams || [];
                            const nextNum = current.length + 1;
                            setEditingMatch({
                              ...editingMatch,
                              streams: [
                                ...current,
                                { name: lang === "ar" ? `سيرفر ${nextNum}` : `Server ${nextNum}`, url: "", type: "iframe" }
                              ]
                            });
                          }}
                          className="p-1.5 text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-amber-500 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {lang === "ar" ? "إضافة سيرفر" : "Add Server"}
                        </button>
                      </div>

                      {(editingMatch.streams || []).map((srv: any, idx: number) => (
                        <div key={`edit-match-stream-${idx}`} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={srv.name || ""}
                              onChange={(e) => {
                                const updated = [...(editingMatch.streams || [])];
                                updated[idx] = { ...updated[idx], name: e.target.value };
                                setEditingMatch({ ...editingMatch, streams: updated });
                              }}
                              placeholder={`Server ${idx + 1}`}
                              className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-amber-400 font-bold text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (editingMatch.streams || []).filter((_: any, i: number) => i !== idx);
                                setEditingMatch({ ...editingMatch, streams: updated });
                              }}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded cursor-pointer"
                              title={lang === "ar" ? "حذف السيرفر" : "Remove server"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            dir="ltr"
                            value={srv.url || ""}
                            onChange={(e) => {
                              const updated = [...(editingMatch.streams || [])];
                              updated[idx] = { ...updated[idx], url: e.target.value };
                              setEditingMatch({ ...editingMatch, streams: updated });
                            }}
                            placeholder="Stream URL / Iframe"
                            className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-white font-mono text-[11px]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editTab === "scorers" && (
                  <div className="space-y-4">
                    {/* Home Goals (Team A) */}
                    <div className="border border-zinc-900 p-3 rounded-2xl bg-zinc-900/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wider">
                          {lang === "ar" ? `أهداف ${editingMatch.teamA?.[lang] || "الفريق أ"}` : `${editingMatch.teamA?.en || "Team A"} Goals`}
                        </span>
                        <button
                          onClick={() => {
                            const current = editingMatch.scorers?.home || [];
                            const updated = [...current, { name: "Player", time: "45'", type: "Goal" }];
                            setEditingMatch({
                              ...editingMatch,
                              scorers: { ...(editingMatch.scorers || {}), home: updated }
                            });
                          }}
                          className="p-1 text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          {lang === "ar" ? "إضافة هدف" : "Add Goal"}
                        </button>
                      </div>
                      
                      {(editingMatch.scorers?.home || []).map((goal: any, index: number) => (
                        <div key={`edit-scorer-home-${index}`} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={typeof goal.name === "object" ? (goal.name.en || "") : (goal.name || "")}
                            onChange={(e) => {
                              const updated = [...(editingMatch.scorers?.home || [])];
                              updated[index] = { ...updated[index], name: e.target.value };
                              setEditingMatch({
                                ...editingMatch,
                                scorers: { ...(editingMatch.scorers || {}), home: updated }
                              });
                            }}
                            placeholder={lang === "ar" ? "اسم اللاعب" : "Player Name"}
                            className="flex-1 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white"
                          />
                          <input
                            type="text"
                            value={goal.time || ""}
                            onChange={(e) => {
                              const updated = [...(editingMatch.scorers?.home || [])];
                              updated[index] = { ...updated[index], time: e.target.value };
                              setEditingMatch({
                                ...editingMatch,
                                scorers: { ...(editingMatch.scorers || {}), home: updated }
                              });
                            }}
                            placeholder="45'"
                            className="w-12 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white text-center"
                          />
                          <button
                            onClick={() => {
                              const updated = (editingMatch.scorers?.home || []).filter((_: any, i: number) => i !== index);
                              setEditingMatch({
                                ...editingMatch,
                                scorers: { ...(editingMatch.scorers || {}), home: updated }
                              });
                            }}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Away Goals (Team B) */}
                    <div className="border border-zinc-900 p-3 rounded-2xl bg-zinc-900/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wider">
                          {lang === "ar" ? `أهداف ${editingMatch.teamB?.[lang] || "الفريق ب"}` : `${editingMatch.teamB?.en || "Team B"} Goals`}
                        </span>
                        <button
                          onClick={() => {
                            const current = editingMatch.scorers?.away || [];
                            const updated = [...current, { name: "Player", time: "45'", type: "Goal" }];
                            setEditingMatch({
                              ...editingMatch,
                              scorers: { ...(editingMatch.scorers || {}), away: updated }
                            });
                          }}
                          className="p-1 text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          {lang === "ar" ? "إضافة هدف" : "Add Goal"}
                        </button>
                      </div>
                      
                      {(editingMatch.scorers?.away || []).map((goal: any, index: number) => (
                        <div key={`edit-scorer-away-${index}`} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={typeof goal.name === "object" ? (goal.name.en || "") : (goal.name || "")}
                            onChange={(e) => {
                              const updated = [...(editingMatch.scorers?.away || [])];
                              updated[index] = { ...updated[index], name: e.target.value };
                              setEditingMatch({
                                ...editingMatch,
                                scorers: { ...(editingMatch.scorers || {}), away: updated }
                              });
                            }}
                            placeholder={lang === "ar" ? "اسم اللاعب" : "Player Name"}
                            className="flex-1 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white"
                          />
                          <input
                            type="text"
                            value={goal.time || ""}
                            onChange={(e) => {
                              const updated = [...(editingMatch.scorers?.away || [])];
                              updated[index] = { ...updated[index], time: e.target.value };
                              setEditingMatch({
                                ...editingMatch,
                                scorers: { ...(editingMatch.scorers || {}), away: updated }
                              });
                            }}
                            placeholder="45'"
                            className="w-12 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white text-center"
                          />
                          <button
                            onClick={() => {
                              const updated = (editingMatch.scorers?.away || []).filter((_: any, i: number) => i !== index);
                              setEditingMatch({
                                ...editingMatch,
                                scorers: { ...(editingMatch.scorers || {}), away: updated }
                              });
                            }}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editTab === "stats" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                        {lang === "ar" ? "إحصائيات المباراة الرئيسية" : "Main Match Statistics"}
                      </span>
                      <button
                        onClick={() => {
                          const current = editingMatch.stats || [];
                          const updated = [...current, { title: "Possession", home: "50%", away: "50%" }];
                          setEditingMatch({
                            ...editingMatch,
                            stats: updated
                          });
                        }}
                        className="p-1 text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        {lang === "ar" ? "إضافة إحصائية" : "Add Stat Row"}
                      </button>
                    </div>

                    {(editingMatch.stats || []).map((stat: any, index: number) => (
                      <div key={`edit-stat-${index}`} className="flex gap-2 items-center p-2 border border-zinc-900 rounded-xl bg-zinc-900/5">
                        <input
                          type="text"
                          value={typeof stat.title === "object" ? (stat.title.en || "") : (stat.title || "")}
                          onChange={(e) => {
                            const updated = [...(editingMatch.stats || [])];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setEditingMatch({
                              ...editingMatch,
                              stats: updated
                            });
                          }}
                          placeholder="Stat Title (e.g. Shots)"
                          className="flex-1 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white"
                        />
                        <input
                          type="text"
                          value={stat.home !== undefined ? stat.home : ""}
                          onChange={(e) => {
                            const updated = [...(editingMatch.stats || [])];
                            updated[index] = { ...updated[index], home: e.target.value };
                            setEditingMatch({
                              ...editingMatch,
                              stats: updated
                            });
                          }}
                          placeholder="Home"
                          className="w-14 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white text-center font-mono"
                        />
                        <span className="text-zinc-500 font-bold text-xs">:</span>
                        <input
                          type="text"
                          value={stat.away !== undefined ? stat.away : ""}
                          onChange={(e) => {
                            const updated = [...(editingMatch.stats || [])];
                            updated[index] = { ...updated[index], away: e.target.value };
                            setEditingMatch({
                              ...editingMatch,
                              stats: updated
                            });
                          }}
                          placeholder="Away"
                          className="w-14 px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-800 text-white text-center font-mono"
                        />
                        <button
                          onClick={() => {
                            const updated = (editingMatch.stats || []).filter((_: any, i: number) => i !== index);
                            setEditingMatch({
                              ...editingMatch,
                              stats: updated
                            });
                          }}
                          className="p-1 rounded text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-2.5">
                <button
                  onClick={() => setEditingMatch(null)}
                  className="px-4 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={() => handleSaveMatchOverride(editingMatch.id, editingMatch)}
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{lang === "ar" ? "حفظ التعديلات" : "Save Changes"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Subscription Details Modal */}
      <AnimatePresence>
        {isSubscriptionDetailsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsSubscriptionDetailsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`w-full max-w-md rounded-3xl border p-6 space-y-5 shadow-2xl relative overflow-hidden ${
                theme === "black"
                  ? "border-amber-500/30 bg-zinc-950 text-white"
                  : "border-amber-400/50 bg-white text-zinc-900 shadow-2xl"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-base font-black ${theme === "black" ? "text-white" : "text-zinc-900"}`}>
                      {lang === "ar" ? "تفاصيل اشتراك القنوات VIP" : "VIP TV Channels Subscription Details"}
                    </h3>
                    <p className={`text-[11px] ${theme === "black" ? "text-zinc-400" : "text-zinc-500"}`}>
                      {lang === "ar" ? "حالة الكود وتاريخ الصلاحية لجهازك" : "Current device activation status"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSubscriptionDetailsOpen(false)}
                  className={`p-1.5 rounded-xl cursor-pointer border ${
                    theme === "black"
                      ? "text-zinc-400 hover:text-white bg-zinc-900 border-zinc-800"
                      : "text-zinc-600 hover:text-black bg-zinc-100 border-zinc-200"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {subscriptionData ? (
                <div className="space-y-4">
                  {/* Active Badge Card */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    theme === "black"
                      ? "bg-zinc-900/90 border-amber-500/30"
                      : "bg-amber-50/40 border-amber-200/80"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${theme === "black" ? "text-zinc-400" : "text-zinc-600"}`}>{lang === "ar" ? "كود التفعيل:" : "Activation Code:"}</span>
                      <span className={`font-mono font-black text-sm px-3 py-1 rounded-xl border tracking-wider ${
                        theme === "black"
                          ? "text-amber-400 bg-zinc-950 border-amber-500/20"
                          : "text-amber-700 bg-white border-amber-300 shadow-sm"
                      }`}>
                        {subscriptionData.code}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold ${theme === "black" ? "text-zinc-400" : "text-zinc-600"}`}>{lang === "ar" ? "نوع الاشتراك:" : "Type:"}</span>
                      <span className={`font-black ${theme === "black" ? "text-white" : "text-zinc-900"}`}>
                        {subscriptionData.isLifetime
                          ? (lang === "ar" ? "🌟 دائم مدى الحياة (VIP)" : "🌟 Lifetime VIP")
                          : (lang === "ar" ? `محدد بالأيام (${subscriptionData.durationDays || 30} يوم)` : `${subscriptionData.durationDays || 30} Days`)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold ${theme === "black" ? "text-zinc-400" : "text-zinc-600"}`}>{lang === "ar" ? "حالة الصلاحية:" : "Remaining:"}</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        {subscriptionData.isLifetime
                          ? (lang === "ar" ? "غير منتهي الصلاحية" : "Never Expires")
                          : (lang === "ar" ? `متبقي ${subscriptionData.remainingDays || 0} يوم` : `${subscriptionData.remainingDays || 0} days remaining`)}
                      </span>
                    </div>

                    {subscriptionData.expiresAt && !subscriptionData.isLifetime && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`font-bold ${theme === "black" ? "text-zinc-500" : "text-zinc-500"}`}>{lang === "ar" ? "تاريخ الانتهاء:" : "Expires on:"}</span>
                        <span className={`font-mono ${theme === "black" ? "text-zinc-300" : "text-zinc-700"}`}>
                          {new Date(subscriptionData.expiresAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Reset / Change Code button & Confirmation in-UI */}
                  <div className="space-y-3 pt-2">
                    {isConfirmingLogoutSubscription ? (
                      <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2.5">
                        <p className="text-xs font-bold text-red-500 text-center">
                          {lang === "ar" 
                            ? "هل ترغب بالتأكيد في تسجيل الخروج من كود الاشتراك الحالي؟" 
                            : "Are you sure you want to log out of this subscription code?"}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleLogoutSubscription}
                            className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "نعم، تسجيل الخروج" : "Yes, Log out"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsConfirmingLogoutSubscription(false)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer border ${
                              theme === "black"
                                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300"
                            }`}
                          >
                            <span>{lang === "ar" ? "إلغاء" : "Cancel"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setIsConfirmingLogoutSubscription(true)}
                          className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-red-500/30 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{lang === "ar" ? "تسجيل الخروج من الكود" : "Log out / Change Code"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsSubscriptionDetailsOpen(false)}
                          className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === "ar" ? "متابعة المشاهدة" : "Done"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-zinc-400 text-xs">
                  {lang === "ar" ? "لا يوجد اشتراك مفعل حالياً." : "No active subscription found."}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
