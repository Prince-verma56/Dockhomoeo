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
 * The hero video plays at double speed. Every timing below is measured in
 * wall-clock seconds against that effective length (10 s of footage → 5 s on
 * screen), so the copy reveal stays in step with what the visitor sees.
 */
export const HERO_PLAYBACK_RATE = 2;

/**
 * How long before the video's last frame the hero copy starts revealing. The
 * headline transitions run ~1.1–1.4 s, so it lands as the footage settles.
 */
const REVEAL_LEAD_SECONDS = 1;

/** Playback never started (slow network, autoplay refused): show the copy anyway. */
const START_TIMEOUT_MS = 4000;

/** Playback stalled mid-way while buffering: show the copy rather than wait on the network. */
const STALL_TIMEOUT_MS = 2500;

const SEEN_KEY = "dochomoeo_hero_seen";

/**
 * Whether this visit skips the intro: the tab has already watched it, or the
 * visitor prefers reduced motion. SEEN_KEY is only written when the page is
 * left (see below), so the answer cannot change while the hero is on screen.
 */
const getIntroSkipped = () => {
  try {
    if (sessionStorage.getItem(SEEN_KEY) === "true") return true;
  } catch {
    // Storage unavailable (private mode): treat as a first visit.
  }
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
  // defaultPlaybackRate survives a reload of the media; playbackRate is the live value.
  video.defaultPlaybackRate = HERO_PLAYBACK_RATE;
  video.playbackRate = HERO_PLAYBACK_RATE;
};

const showLastFrame = (video: HTMLVideoElement) => {
  if (Number.isFinite(video.duration) && video.duration > 0) {
    video.currentTime = Math.max(0, video.duration - 0.05);
  }
  video.pause();
};

/**
 * Owns the homepage hero video and the moment its copy appears.
 *
 * - First visit in a tab: the video plays once at 2×; the copy reveals
 *   REVEAL_LEAD_SECONDS before the last frame, on `ended`, on scroll, or via
 *   the start/stall fallbacks — whichever comes first. The video then rests
 *   on its final frame.
 * - Returning visit (sessionStorage) or reduced motion: no intro. The video
 *   is parked on its final frame and the copy is shown without transitions.
 *
 * Only state that consumers read is kept here; time updates are handled in
 * the event listener, so the hero does not re-render four times a second.
 */
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
  // Nav is always visible now as per user request
  const navVisible = true;

  // False on the server and during hydration, so the markup matches; React
  // re-renders with the browser's answer straight after.
  const skippedAtLoad = useSyncExternalStore(subscribeNever, getIntroSkipped, getServerIntroSkipped);
  const hasSkipped = skippedAtLoad || skippedByVisitor;
  const contentVisible = hasSkipped || revealed;

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
    // Read directly: on a returning visit the hook above still holds the
    // hydration value here, and the video must not start playing.
    const skip = getIntroSkipped();
    if (skip) revealedRef.current = true;

    // The intro counts as seen once its copy has been shown; it is recorded on
    // the way out so this visit's answer above stays fixed.
    const remember = () => {
      if (!revealedRef.current) return;
      try {
        sessionStorage.setItem(SEEN_KEY, "true");
      } catch {
        // Storage unavailable: the intro simply plays again next time.
      }
    };
    window.addEventListener("pagehide", remember);

    if (!video) {
      const timer = setTimeout(reveal, 0);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("pagehide", remember);
        remember();
      };
    }

    let startTimer: ReturnType<typeof setTimeout> | undefined;
    let stallTimer: ReturnType<typeof setTimeout> | undefined;

    const onLoadedMetadata = () => {
      if (skip) showLastFrame(video);
    };
    const onPlaying = () => {
      setIsPlaying(true);
      clearTimeout(startTimer);
      clearTimeout(stallTimer);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => {
      clearTimeout(stallTimer);
      stallTimer = setTimeout(reveal, STALL_TIMEOUT_MS);
    };
    const onTimeUpdate = () => {
      if (revealedRef.current || !(video.duration > 0)) return;
      const remaining = (video.duration - video.currentTime) / (video.playbackRate || 1);
      if (remaining <= REVEAL_LEAD_SECONDS) reveal();
    };
    const onEnded = () => {
      // The element rests on its final frame once ended; nothing to seek.
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
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", reveal);
      window.removeEventListener("pagehide", remember);
      // Client-side navigation away from the homepage.
      remember();
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
