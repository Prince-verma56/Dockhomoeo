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
 * How long before the video's end the hero copy starts revealing if not already revealed.
 * The headline transitions run ~1.0–1.2 s, so it lands as the footage settles.
 */
const REVEAL_LEAD_SECONDS = 1;

/** Delay before the hero text, leaves, and navbar reveal after video playback starts */
const REVEAL_DELAY_MS = 600;

/** Playback never started (slow network, autoplay refused): show the copy anyway. */
const START_TIMEOUT_MS = 1200;

/** Playback stalled mid-way while buffering: show the copy rather than wait on the network. */
const STALL_TIMEOUT_MS = 1000;

const HERO_COMPLETED_KEY = "dochomoeo_hero_completed";

const checkBuildSession = () => {
  if (typeof window === "undefined") return;
  try {
    const currentBuild = process.env.NEXT_PUBLIC_BUILD_TIME;
    if (currentBuild) {
      const storedBuild = sessionStorage.getItem("dochomoeo_build_time");
      if (storedBuild !== currentBuild) {
        // Dev server was restarted: clear completed flags so video and animations play from the start!
        sessionStorage.removeItem(HERO_COMPLETED_KEY);
        sessionStorage.setItem("dochomoeo_build_time", currentBuild);
      }
    }
  } catch {}
};

/**
 * Whether this visit skips the intro: prefers reduced motion or completed within this specific session.
 */
const getIntroSkipped = () => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  try {
    checkBuildSession();
    return sessionStorage.getItem(HERO_COMPLETED_KEY) === "true";
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

const showLastFrame = (video: HTMLVideoElement) => {
  const target =
    Number.isFinite(video.duration) && video.duration > 0
      ? Math.max(0, video.duration - 0.05)
      : 0;
  video.currentTime = target;
  video.pause();
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

  const markCompleted = useCallback(() => {
    setIsCompleted(true);
    try {
      sessionStorage.setItem(HERO_COMPLETED_KEY, "true");
    } catch {}
  }, []);

  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
    markCompleted();
  }, [markCompleted]);

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
      revealedRef.current = true;
      setIsCompleted(true);
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
      if (!skip && video.currentTime < HERO_START_TIME) {
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

    if (skip) {
      if (video.readyState >= 1) showLastFrame(video);
    } else {
      applyRate(video);
      if (video.readyState >= 1) {
        seekToStartTime(video);
      }
      startTimer = setTimeout(reveal, START_TIMEOUT_MS);
      video.play().catch(reveal);
    }

    return () => {
      clearTimeout(startTimer);
      clearTimeout(stallTimer);
      clearTimeout(revealTimer);
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
      sessionStorage.removeItem(HERO_COMPLETED_KEY);
      localStorage.removeItem(HERO_COMPLETED_KEY);
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
        isCompleted,
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
