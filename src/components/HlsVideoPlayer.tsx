import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Volume2, VolumeX, Play, Pause, Maximize, RotateCcw } from "lucide-react";

interface HlsVideoPlayerProps {
  src: string;
  className?: string;
  lang?: "ar" | "en";
}

export default function HlsVideoPlayer({ src, className = "", lang = "ar" }: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0); // Controllable volume level (0 to 1)
  const [showUnmuteToast, setShowUnmuteToast] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  // Control icons visibility & 10 seconds auto-hide timer
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 10000); // 10 seconds auto-hide
  };

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handleContainerClick = () => {
    resetControlsTimer();
  };

  const handlePlayerInteraction = () => {
    resetControlsTimer();
  };

  // Sync volume state to video element
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted, retryKey]);

  // Clean and prepare the stream URL
  const processedUrl = (() => {
    if (!src) return "";
    const trimmed = src.trim();

    // Check if the protocol is HTTPS and device is Safari or iOS
    const isHttps = trimmed.toLowerCase().startsWith("https://");
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // On iOS or Safari, always prefer direct HTTPS URL to avoid proxy range request decoding failures
    if (isHttps && (isIOS || isSafari)) {
      return trimmed;
    }

    // Proxy all HTTP and HTTPS external links to bypass CORS & Mixed Content
    if (trimmed.toLowerCase().startsWith("http://") || trimmed.toLowerCase().startsWith("https://")) {
      return `/api/stream-proxy?url=${encodeURIComponent(trimmed)}`;
    }
    return trimmed;
  })();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !processedUrl) return;

    let hls: Hls | null = null;
    let playAttempted = false;
    let hlsRetryCount = 0;
    const maxHlsRetries = 3;
    let retryTimeoutId: any = null;

    setIsBuffering(true);
    setHasError(false);
    setErrorMessage("");

    const handleLoadStart = () => setIsBuffering(true);
    
    const attemptPlay = () => {
      if (playAttempted) return;
      playAttempted = true;

      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              if (video.muted) {
                setIsMuted(true);
                setShowUnmuteToast(true);
              } else {
                setIsMuted(false);
                setShowUnmuteToast(false);
              }
            })
            .catch((err) => {
              if (err.name === "AbortError") {
                console.log("[HlsVideoPlayer] Play request interrupted.");
                return;
              }
              console.warn("Autoplay blocked. Attempting muted play...", err);
              video.muted = true;
              setIsMuted(true);
              
              const mutedPlayPromise = video.play();
              if (mutedPlayPromise !== undefined) {
                mutedPlayPromise
                  .then(() => {
                    setIsPlaying(true);
                    setShowUnmuteToast(true);
                  })
                  .catch((e) => {
                    if (e.name === "AbortError") return;
                    console.error("Muted autoplay failed:", e);
                    setIsPlaying(false);
                    setIsBuffering(false);
                  });
              }
            });
        }
      } catch (err) {
        console.error("Error initiating playback:", err);
      }
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
      attemptPlay();
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      if (!hls) {
        setHasError(true);
        setErrorMessage(lang === "ar" ? "تعذر تحميل الفيديو أو انقطع الاتصال بالبث" : "Unable to load stream video.");
      }
    };

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadedmetadata", handleCanPlay);
    video.addEventListener("loadeddata", handleCanPlay);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);

    const lowerSrc = src.toLowerCase();
    const isHls = lowerSrc.includes(".m3u8") || 
                  lowerSrc.includes("/live/") || 
                  lowerSrc.includes("hls") || 
                  lowerSrc.includes("stream") || 
                  (!lowerSrc.includes(".mp4") && !lowerSrc.includes(".webm") && !lowerSrc.includes(".mkv") && !lowerSrc.includes(".mp3"));

    if (isHls) {
      if (Hls.isSupported()) {
        hls = new Hls({
          startFragPrefetch: true,
          startLevel: -1,
          liveSyncDurationCount: 5,
          liveMaxLatencyDurationCount: 10,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1024 * 1024,
          progressive: true,
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 30,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetryTimeout: 3000,
          levelLoadingTimeOut: 10000,
          levelLoadingMaxRetryTimeout: 3000,
          fragLoadingTimeOut: 10000,
          fragLoadingMaxRetryTimeout: 3000,
          capLevelToPlayerSize: true,
          testBandwidth: true,
          abrEwmaDefaultEstimate: 2000000,
          abrBandWidthFactor: 0.85,
          abrBandWidthUpFactor: 0.7
        });

        hlsRef.current = hls;

        hls.loadSource(processedUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false);
          attemptPlay();
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (hlsRetryCount < maxHlsRetries) {
                  hlsRetryCount++;
                  console.warn(`[HlsVideoPlayer] Fatal network error. Retrying (${hlsRetryCount}/${maxHlsRetries})...`);
                  setIsBuffering(true);
                  if (retryTimeoutId) clearTimeout(retryTimeoutId);
                  retryTimeoutId = setTimeout(() => {
                    hls?.startLoad();
                  }, 1500);
                } else {
                  setHasError(true);
                  setErrorMessage(lang === "ar" ? "خطأ في الاتصال بالشبكة للبث المباشر. يرجى محاولة التحديث." : "Network connection error.");
                  hls?.destroy();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn("[HlsVideoPlayer] Media error encountered. Recovering...");
                hls?.recoverMediaError();
                break;
              default:
                setHasError(true);
                setErrorMessage(lang === "ar" ? "خطأ في تشغيل البث المباشر." : "Playback error.");
                hls?.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS (Safari / iOS)
        video.src = processedUrl;
        video.load();
      } else {
        video.src = processedUrl;
        video.load();
      }
    } else {
      video.src = processedUrl;
      video.load();
    }

    return () => {
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadedmetadata", handleCanPlay);
      video.removeEventListener("loadeddata", handleCanPlay);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);

      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
    };
  }, [processedUrl, src, retryKey]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error(err));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted) {
      setShowUnmuteToast(false);
    }
  };

  const handleUnmuteClick = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setIsMuted(false);
    setShowUnmuteToast(false);
  };

  const fallbackNativeFullscreen = (video: HTMLVideoElement | null) => {
    if (video) {
      if ((video as any).webkitEnterFullscreen) {
        try {
          (video as any).webkitEnterFullscreen();
        } catch (e) {
          console.error("[HlsVideoPlayer] webkitEnterFullscreen failed:", e);
        }
      } else if (video.requestFullscreen) {
        video.requestFullscreen().catch(err => console.error(err));
      }
    }
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;

    const doc = document as any;
    const isFullscreen = doc.fullscreenElement || 
                          doc.webkitFullscreenElement || 
                          doc.mozFullScreenElement ||
                          doc.msFullscreenElement;

    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.error(err));
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    } else {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(err => {
          fallbackNativeFullscreen(video);
        });
      } else if ((container as any).webkitRequestFullscreen) {
        try {
          (container as any).webkitRequestFullscreen();
        } catch (err) {
          fallbackNativeFullscreen(video);
        }
      } else {
        fallbackNativeFullscreen(video);
      }
    }
  };

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden bg-black select-none group ${className}`}
      onClick={handleContainerClick}
      onMouseMove={handlePlayerInteraction}
      onTouchStart={handlePlayerInteraction}
    >
      {/* HTML5 Video Component with mobile video attributes */}
      <video
        ref={videoRef}
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        autoPlay
        muted={isMuted}
        preload="auto"
        style={{ transform: "translateZ(0)", willChange: "transform" }}
        className="w-full h-full object-contain absolute inset-0 bg-black cursor-pointer"
      />

      {/* Loading & Buffering Overlay */}
      {isBuffering && !hasError && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-zinc-300">
              {lang === "ar" ? "جاري فتح البث بأعلى سرعة..." : "Opening live stream..."}
            </span>
          </div>
        </div>
      )}

      {/* Error State Overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 z-20 p-6 text-center">
          <div className="p-3.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
            <VolumeX className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h4 className="text-sm font-bold text-zinc-200">
              {lang === "ar" ? "فشل تحميل البث" : "Failed to load stream"}
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">{errorMessage}</p>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-bold text-zinc-300 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "إعادة المحاولة" : "Retry"}</span>
          </button>
        </div>
      )}

      {/* Unmute Guide Overlay */}
      {showUnmuteToast && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleUnmuteClick();
            resetControlsTimer();
          }}
          className={`absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black shadow-xl flex items-center gap-2 text-xs font-black animate-bounce transition-all border border-amber-600/25 ${
            showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <VolumeX className="w-4 h-4" />
          <span>{lang === "ar" ? "انقر لتشغيل الصوت 🔊" : "Click to Unmute 🔊"}</span>
        </button>
      )}

      {/* Custom Controls Bar (Bottom) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex items-center justify-between px-3 sm:px-4 pb-2 pt-3 transition-opacity duration-300 z-20 ${
          showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Play / Pause Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
              resetControlsTimer();
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/25 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Volume Control - Hidden on Mobile & Tablet, Visible on Desktop (lg:) */}
          <div className="hidden lg:flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
                resetControlsTimer();
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center cursor-pointer"
              title={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                e.stopPropagation();
                const val = parseFloat(e.target.value);
                setVolume(val);
                const video = videoRef.current;
                if (video) {
                  video.volume = val;
                  if (val > 0 && isMuted) {
                    video.muted = false;
                    setIsMuted(false);
                  } else if (val === 0) {
                    video.muted = true;
                    setIsMuted(true);
                  }
                }
                resetControlsTimer();
              }}
              className="w-12 sm:w-20 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500 transition-all hover:bg-white/35"
              style={{ accentColor: "#f59e0b" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Badge */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-red-600/90 border border-red-500/40 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-black tracking-wide text-white shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>{lang === "ar" ? "مباشر" : "LIVE"}</span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFullscreen();
              resetControlsTimer();
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="ملء الشاشة"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
