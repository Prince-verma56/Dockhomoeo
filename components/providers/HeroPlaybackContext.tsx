"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

interface HeroPlaybackContextValue {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isMuted: boolean;
  isCompleted: boolean;
  navVisible: boolean;
  contentVisible: boolean;
  hasSkipped: boolean;
  isMounted: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  skipIntro: () => void;
  replay: () => void;
}

const HeroPlaybackContext = createContext<HeroPlaybackContextValue | null>(null);

export function HeroPlaybackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  // Nav is always visible now as per user request
  const [navVisible, setNavVisible] = useState(true);
  
  // Initialize with false for SSR, then update on mount to avoid hydration mismatch
  const [hasSkipped, setHasSkipped] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const seen = sessionStorage.getItem("dochomoeo_hero_seen") === "true";
      if (seen) {
        setHasSkipped(true);
        setContentVisible(true);
      }
    }
  }, []);

  // Skip function to immediately trigger content
  const skipIntro = useCallback(() => {
    setHasSkipped(true);
    setContentVisible(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dochomoeo_hero_seen", "true");
    }
  }, []);

  // Time trigger for sequential appearance closer to the end of the video
  useEffect(() => {
    if (contentVisible || hasSkipped) return;

    // Trigger after 8.5 seconds to give the video time to play out
    // (If the user meant the video is 5 seconds long, we also use a fallback of duration - 0.5)
    const triggerTime = (duration > 0 && duration < 9) ? duration - 0.5 : 8.5;

    if (currentTime >= triggerTime || isCompleted) {
      setContentVisible(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("dochomoeo_hero_seen", "true");
      }
    }
  }, [currentTime, contentVisible, hasSkipped, duration, isCompleted]);

  // Fallback: if video fails to play or user scrolls down, reveal after 9s or on scroll
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setContentVisible(true);
    }, 9000);

    const onScroll = () => {
      if (window.scrollY > 80 && !contentVisible) {
        setContentVisible(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [contentVisible]);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.ended || isCompleted) {
      video.currentTime = 0;
      video.play().then(() => {
        setIsPlaying(true);
        setIsCompleted(false);
      }).catch(() => {});
      return;
    }

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isCompleted]);

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
    video.currentTime = 0;
    video.play().then(() => {
      setIsPlaying(true);
      setIsCompleted(false);
    }).catch(() => {});
  }, []);

  return (
    <HeroPlaybackContext.Provider
      value={{
        videoRef,
        currentTime,
        duration,
        isPlaying,
        isMuted,
        isCompleted,
        navVisible,
        contentVisible,
        hasSkipped,
        isMounted,
        togglePlay,
        toggleMute,
        skipIntro,
        replay,
      }}
    >
      {/* Expose setters via video element handlers in HomeHero */}
      <HeroPlaybackInternalRegister
        setCurrentTime={setCurrentTime}
        setDuration={setDuration}
        setIsPlaying={setIsPlaying}
        setIsCompleted={setIsCompleted}
      />
      {children}
    </HeroPlaybackContext.Provider>
  );
}

// Internal listener attached to video events
const InternalContext = createContext<{
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setIsPlaying: (p: boolean) => void;
  setIsCompleted: (c: boolean) => void;
} | null>(null);

function HeroPlaybackInternalRegister({
  setCurrentTime,
  setDuration,
  setIsPlaying,
  setIsCompleted,
}: {
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setIsPlaying: (p: boolean) => void;
  setIsCompleted: (c: boolean) => void;
}) {
  return (
    <InternalContext.Provider
      value={{ setCurrentTime, setDuration, setIsPlaying, setIsCompleted }}
    >
      <span className="sr-only" aria-hidden />
    </InternalContext.Provider>
  );
}

export function useHeroPlayback() {
  const ctx = useContext(HeroPlaybackContext);
  return ctx;
}
