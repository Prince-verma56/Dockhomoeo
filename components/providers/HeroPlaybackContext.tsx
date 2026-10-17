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
 * The hero video plays at normal 1× speed from start to end without trimming.
 * Timing is measured in seconds so the copy reveal stays in step with playback.
 */
export const HERO_PLAYBACK_RATE = 1;
export const HERO_TRIM_SECONDS: number | null = null;

/**
 * How long before the video's end the hero copy starts revealing if not already revealed.
 * The headline transitions run ~1.0–1.2 s, so it lands as the footage settles.
 */
const REVEAL_LEAD_SECONDS = 1;

/** Delay before the hero text, leaves, and navbar reveal after video playback starts */
const REVEAL_DELAY_MS = 2400;

/** Playback never started (slow network, autoplay refused): show the copy anyway. */
const START_TIMEOUT_MS = 3800;

/** Playback stalled mid-way while buffering: show the copy rather than wait on the network. */
const STALL_TIMEOUT_MS = 2500;

/**
 * Whether this visit skips the intro: prefers reduced motion.
 */
const getIntroSkipped = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
  }, []);

  const skipIntro = useCallback(() => {
    setSkippedByVisitor(true);
    reveal();
    const video = videoRef.current;
    if (video) showLastFrame(video);
  }, [reveal]);

  useEffect(() => {
    const video = videoRef.current;
    const skip = getIntroSkipped();
    if (skip) {
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
      if (skip) showLastFrame(video);
    };
    const onPlaying = () => {
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

      if (revealedRef.current) return;
      const remaining = (video.duration - video.currentTime) / (video.playbackRate || 1);
      if (remaining <= REVEAL_LEAD_SECONDS) reveal();
    };
    const onEnded = () => {
      setIsCompleted(true);
      setIsPlaying(false);
      reveal();
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
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
      startTimer = setTimeout(reveal, START_TIMEOUT_MS);
      video.play().catch(reveal);
    }

    return () => {
      clearTimeout(startTimer);
      clearTimeout(stallTimer);
      clearTimeout(revealTimer);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", reveal);
    };
  }, [reveal]);

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
      video.currentTime = 0;
      setIsCompleted(false);
      video.play().catch(() => {});
      return;
    }

    if (video.paused) {
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
    applyRate(video);
    video.currentTime = 0;
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
