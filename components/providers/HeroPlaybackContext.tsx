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
  
  // Initialize synchronously from localStorage to prevent flicker on client render
  const [hasSkipped, setHasSkipped] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dochomoeo_hero_seen") === "true";
    }
    return false;
  });
  const [contentVisible, setContentVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dochomoeo_hero_seen") === "true";
    }
    return false;
  });

  // Skip function to immediately trigger content
  const skipIntro = useCallback(() => {
    setHasSkipped(true);
    setContentVisible(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("dochomoeo_hero_seen", "true");
    }
  }, []);

  // Time trigger for sequential appearance at 5 seconds
  useEffect(() => {
    if (contentVisible || hasSkipped) return;

    if (currentTime >= 5.0) {
      setContentVisible(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("dochomoeo_hero_seen", "true");
      }
    }
  }, [currentTime, contentVisible, hasSkipped]);

  // Fallback: if video fails to play or user scrolls down, reveal after 5s or on scroll
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setContentVisible(true);
    }, 5500);

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
