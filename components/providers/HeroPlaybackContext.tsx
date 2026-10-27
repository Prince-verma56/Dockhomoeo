"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";

/**
 * The hero video plays at normal 1× speed, trimmed to start from 4.0 seconds
 * (skipping the initial 4 seconds of footage entirely).
 * Timing is measured in seconds so the copy reveal stays in step with playback.
 */
export const HERO_PLAYBACK_RATE = 1;
export const HERO_START_TIME = 4;
export const HERO_TRIM_SECONDS: number | null = null;

/**
 * Still frames pulled from the footage itself (`ffmpeg`, committed under
 * public/Videos). A <video> paints nothing at all until it has decoded a
 * frame, and this hero both starts 4 s in and parks on its closing frame, so
 * without a poster each of those seeks showed the pale page background
 * instead of the footage.
 */
export const HERO_POSTER_SRC = "/Videos/HeroVideo2-poster.jpg";
export const HERO_END_POSTER_SRC = "/Videos/HeroVideo2-end.jpg";

/**
 * How long before the video's end the hero copy starts revealing if not already revealed.
 * The headline transitions run ~1.0–1.2 s, so it lands as the footage settles.
 */
const REVEAL_LEAD_SECONDS = 1;

/** Delay before the hero text, leaves, and navbar reveal after video playback starts (delayed +1s for cinematic pacing) */
const REVEAL_DELAY_MS = 1600;

/** Playback never started (slow network, autoplay refused): show the copy anyway. */
const START_TIMEOUT_MS = 2200;

/** Playback stalled mid-way while buffering: show the copy rather than wait on the network. */
const STALL_TIMEOUT_MS = 2000;

/**
 * Marks the intro as already seen *for this visit only*. Deliberately kept in
 * sessionStorage and never localStorage: a permanent flag meant the footage ran
 * once ever and every later visit opened on a paused, still-buffering frame —
 * a blank hero. Every fresh visit now plays the intro exactly once.
 */
const HERO_SEEN_KEY = "dochomoeo_hero_seen";

/** The old permanent flag. Cleared on sight so browsers carrying it recover. */
const LEGACY_COMPLETED_KEY = "dochomoeo_hero_completed";

const clearLegacyFlag = () => {
  try {
    if (localStorage.getItem(LEGACY_COMPLETED_KEY) !== null) {
      localStorage.removeItem(LEGACY_COMPLETED_KEY);
    }
    sessionStorage.removeItem(LEGACY_COMPLETED_KEY);
  } catch {}
};

const checkBuildSession = () => {
  if (typeof window === "undefined") return;
  try {
    const currentBuild = process.env.NEXT_PUBLIC_BUILD_TIME;
    if (currentBuild) {
      const storedBuild = sessionStorage.getItem("dochomoeo_build_time");
      if (storedBuild !== currentBuild) {
        // Dev server was restarted: clear the seen flag so video and animations play from the start!
        sessionStorage.removeItem(HERO_SEEN_KEY);
        sessionStorage.setItem("dochomoeo_build_time", currentBuild);
      }
    }
  } catch {}
};

/**
 * Whether this visit skips the intro: prefers reduced motion, or the footage
 * already ran to the end earlier in this same session.
 */
const getIntroSkipped = () => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  try {
    clearLegacyFlag();
    checkBuildSession();
    return sessionStorage.getItem(HERO_SEEN_KEY) === "true";
  } catch {
    return false;
  }
};
const getServerIntroSkipped = () => false;
const subscribeNever = () => () => {};

interface HeroPlaybackContextValue {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  isMuted: boolean;
  isCompleted: boolean;
  navVisible: boolean;
  contentVisible: boolean;
  hasSkipped: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  skipIntro: () => void;
  replay: () => void;
}

const HeroPlaybackContext = createContext<HeroPlaybackContextValue | null>(null);

const applyRate = (video: HTMLVideoElement) => {
  video.defaultPlaybackRate = HERO_PLAYBACK_RATE;
  video.playbackRate = HERO_PLAYBACK_RATE;
};

const seekToStartTime = (video: HTMLVideoElement) => {
  if (video.currentTime < HERO_START_TIME) {
    try {
      video.currentTime = HERO_START_TIME;
    } catch {
      // Ignored if media isn't ready; event listeners will retry
    }
  }
};

/**
 * Parks a skipped intro on its closing frame. While that seek is in flight the
 * element has no frame to paint, so the markup pairs this with the matching
 * end-frame poster — without one the hero renders as a blank pale panel.
 * Seeking is skipped entirely until the duration is known, because the old
 * `currentTime = 0` fallback fought the `#t=4` media fragment.
 */
const showLastFrame = (video: HTMLVideoElement) => {
  video.pause();
  if (!(Number.isFinite(video.duration) && video.duration > 0)) return;
  const target = Math.max(0, video.duration - 0.05);
  if (Math.abs(video.currentTime - target) < 0.02) return;
  try {
    video.currentTime = target;
  } catch {
    // Ignored if media isn't ready; event listeners will retry
  }
};

export function HeroPlaybackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const revealedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [skippedByVisitor, setSkippedByVisitor] = useState(false);

  // False on the server and during hydration, so the markup matches; React
  // re-renders with the browser's answer straight after.
  const skippedAtLoad = useSyncExternalStore(subscribeNever, getIntroSkipped, getServerIntroSkipped);
  const hasSkipped = skippedAtLoad || skippedByVisitor;
  const contentVisible = hasSkipped || revealed;
  const navVisible = hasSkipped || revealed;
  // A skipped intro is a finished one, derived rather than set from the effect.
  const completed = isCompleted || hasSkipped;

  /** The footage genuinely reached its end (or the visitor skipped past it). */
  const markCompleted = useCallback(() => {
    setIsCompleted(true);
    try {
      sessionStorage.setItem(HERO_SEEN_KEY, "true");
    } catch {}
  }, []);

  /**
   * Shows the hero copy. Deliberately does NOT record the intro as seen: a
   * reveal also comes from the start/stall timeouts, a media error and a
   * scroll, none of which mean a single frame ever played. Recording those
   * was what left later visits on a blank, paused hero.
   */
  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
  }, []);

  const skipIntro = useCallback(() => {
    setSkippedByVisitor(true);
    markCompleted();
    reveal();
    const video = videoRef.current;
    if (video) showLastFrame(video);
  }, [markCompleted, reveal]);

  useEffect(() => {
    const video = videoRef.current;
    const skip = getIntroSkipped();
    if (skip) {
      // `hasSkipped` already drives contentVisible and isCompleted for this
      // render, so only the ref needs arming — setting state here would just
      // cascade an extra render for a value that is already true.
      revealedRef.current = true;
    }

    if (!video) {
      const timer = setTimeout(reveal, 0);
      return () => clearTimeout(timer);
    }

    let startTimer: ReturnType<typeof setTimeout> | undefined;
    let stallTimer: ReturnType<typeof setTimeout> | undefined;
    let revealTimer: ReturnType<typeof setTimeout> | undefined;

    const onLoadedMetadata = () => {
      if (skip) {
        showLastFrame(video);
      } else {
        seekToStartTime(video);
      }
    };
    const onCanPlay = () => {
      if (skip) {
        showLastFrame(video);
      } else if (video.currentTime < HERO_START_TIME) {
        seekToStartTime(video);
      }
    };
    const onPlaying = () => {
      if (skip) {
        showLastFrame(video);
        return;
      }
      if (video.currentTime < HERO_START_TIME) {
        seekToStartTime(video);
      }
      setIsPlaying(true);
      clearTimeout(startTimer);
      clearTimeout(stallTimer);
      if (!revealedRef.current && !revealTimer) {
        revealTimer = setTimeout(reveal, REVEAL_DELAY_MS);
      }
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => {
      clearTimeout(stallTimer);
      stallTimer = setTimeout(reveal, STALL_TIMEOUT_MS);
    };
    const onTimeUpdate = () => {
      if (!(video.duration > 0)) return;

      // Prevent playing earlier than the starting 4 seconds trim point
      if (video.currentTime < HERO_START_TIME - 0.25) {
        seekToStartTime(video);
        return;
      }

      if (video.currentTime >= video.duration - 0.25) {
        markCompleted();
      }

      if (revealedRef.current) return;
      const remaining = (video.duration - video.currentTime) / (video.playbackRate || 1);
      if (remaining <= REVEAL_LEAD_SECONDS) reveal();
    };
    const onEnded = () => {
      markCompleted();
      setIsPlaying(false);
      reveal();
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", reveal);

    // Armed only if autoplay is refused, so the footage still gets its one run
    // the moment the visitor touches the page.
    const retryEvents = ["pointerdown", "keydown", "touchstart"] as const;
    const retryOnGesture = () => {
      video.muted = true;
      applyRate(video);
      seekToStartTime(video);
      void video.play().catch(() => {});
    };
    let retryArmed = false;
    const armRetry = () => {
      if (retryArmed) return;
      retryArmed = true;
      retryEvents.forEach((name) =>
        window.addEventListener(name, retryOnGesture, { once: true, passive: true })
      );
    };

    if (skip) {
      if (video.readyState >= 1) showLastFrame(video);
    } else {
      // `muted` is re-asserted here because every browser gates autoplay on it,
      // and a stale un-muted state from a previous mount would get play() refused.
      video.muted = true;
      applyRate(video);
      if (video.readyState >= 1) {
        seekToStartTime(video);
      }
      startTimer = setTimeout(reveal, START_TIMEOUT_MS);
      video.play().catch(() => {
        // Show the copy rather than hold it hostage to a refused autoplay, but
        // keep the poster frame up and wait for a gesture to run the footage.
        reveal();
        armRetry();
      });
    }

    return () => {
      clearTimeout(startTimer);
      clearTimeout(stallTimer);
      clearTimeout(revealTimer);
      retryEvents.forEach((name) => window.removeEventListener(name, retryOnGesture));
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", reveal);
    };
  }, [markCompleted, reveal]);

  // Scrolling past the top reveals the copy straight away.
  useEffect(() => {
    if (contentVisible) return;
    const onScroll = () => {
      if (window.scrollY > 80) reveal();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [contentVisible, reveal]);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    applyRate(video);
    if (video.ended) {
      video.currentTime = HERO_START_TIME;
      setIsCompleted(false);
      video.play().catch(() => {});
      return;
    }

    if (video.paused) {
      if (video.currentTime < HERO_START_TIME) {
        seekToStartTime(video);
      }
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  // Audio toggle
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  // Replay
  const replay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    try {
      sessionStorage.removeItem(HERO_SEEN_KEY);
    } catch {}
    applyRate(video);
    video.currentTime = HERO_START_TIME;
    setIsCompleted(false);
    video.play().catch(() => {});
  }, []);

  return (
    <HeroPlaybackContext.Provider
      value={{
        videoRef,
        isPlaying,
        isMuted,
        isCompleted: completed,
        navVisible,
        contentVisible,
        hasSkipped,
        togglePlay,
        toggleMute,
        skipIntro,
        replay,
      }}
    >
      {children}
    </HeroPlaybackContext.Provider>
  );
}

export function useHeroPlayback() {
  const ctx = useContext(HeroPlaybackContext);
  return ctx;
}
