"use client";

/**
 * @author: @dorianbaffier
 * @description: Morph Popover
 * @version: 1.0.0
 * @date: 2026-10-15
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  type Transition,
} from "motion/react";
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export interface MorphPopoverProps {
  /** The button's label, which slides up to become the panel's title. */
  label?: string;
  icon?: ReactNode;
  placeholder?: string;
  /** Shown in the small pill after sending. */
  sentLabel?: string;
  /** Optional quick categories that the user can toggle. */
  categories?: string[];
  defaultCategory?: string;
  /** Button style variant when idle. */
  variant?: "default" | "forest";
  /** Called with the text and category. A promise keeps the panel in its sending state. */
  onSubmit?: (value: string, category?: string) => void | Promise<void>;
  /** Which edge the panel grows from. */
  align?: "start" | "end" | "center";
  /** Panel width in px. */
  width?: number;
  /** Button height in px when idle. Defaults to 46px. */
  height?: number;
  className?: string;
}

type Phase = "idle" | "open" | "sending" | "sent";

const MORPH: Transition = { type: "spring", duration: 0.42, bounce: 0.14 };
const FADE: Transition = { duration: 0.2, ease: [0.23, 1, 0.32, 1] };
const SENT_FOR = 2200;

/** Real submission to our /api/feedback endpoint with graceful fallback */
const sendFeedbackApi = async (text: string, category?: string) => {
  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: text,
      category: category || "general",
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to submit feedback");
  }
};

const BUTTON_HEIGHT = 38;
const APPLE_PLATFORM = /Mac|iPhone|iPad/;
const isMac = () =>
  typeof navigator !== "undefined" && APPLE_PLATFORM.test(navigator.platform);

function ChatIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M2.75 4.25a1.5 1.5 0 0 1 1.5-1.5h7.5a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H7l-2.75 2.5v-2.5a1.5 1.5 0 0 1-1.5-1.5v-5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5 animate-spin motion-reduce:animate-none"
      fill="none"
      viewBox="0 0 16 16"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * A button that grows into the small form it opens, and shrinks into a
 * confirmation once sent. The label travels with it and becomes the title.
 */
export default function MorphPopover({
  label = "Give feedback",
  icon = <ChatIcon />,
  placeholder = "How can we make your care or shopping experience better?",
  sentLabel = "Thank you! Your feedback was received.",
  categories,
  defaultCategory,
  variant = "default",
  onSubmit = sendFeedbackApi,
  align = "start",
  width = 360,
  height = 46,
  className,
}: MorphPopoverProps) {
  const id = useId();
  const [phase, setPhase] = useState<Phase>("idle");
  const [value, setValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(defaultCategory);
  const [shortcut, setShortcut] = useState("Ctrl");
  const [size, setSize] = useState<{ idle: number; sent: number } | null>(null);
  const [availableWidth, setAvailableWidth] = useState(width);
  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const idleSizer = useRef<HTMLSpanElement>(null);
  const sentSizer = useRef<HTMLSpanElement>(null);
  const wasOpen = useRef(false);
  const expanded = phase === "open" || phase === "sending";

  useEffect(() => {
    if (isMac()) {
      setShortcut("⌘");
    }
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== "undefined") {
        const rect = rootRef.current?.getBoundingClientRect();
        const left = rect ? Math.max(0, rect.left) : 16;
        // Calculate safe maximum width so the popover never goes outside viewport right edge
        const maxAvailable = Math.max(280, window.innerWidth - left - 20);
        setAvailableWidth(Math.min(width, maxAvailable, window.innerWidth - 24));
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [width]);

  // The closed shapes are as wide as their content, measured off-screen.
  useLayoutEffect(() => {
    const measure = () =>
      setSize({
        idle: idleSizer.current?.offsetWidth ?? 120,
        sent: sentSizer.current?.offsetWidth ?? 100,
      });
    measure();
    const observer = new ResizeObserver(measure);
    if (idleSizer.current) {
      observer.observe(idleSizer.current);
    }
    if (sentSizer.current) {
      observer.observe(sentSizer.current);
    }
    return () => observer.disconnect();
  }, []);

  // Focus follows the shape: into the field on open, back to the button after.
  useEffect(() => {
    if (phase === "open") {
      textareaRef.current?.focus({ preventScroll: true });
      wasOpen.current = true;
      // Ensure the opened popover with submit button is completely visible in the viewport
      const timer = window.setTimeout(() => {
        const el = rootRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top + 370 > window.innerHeight) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }, 100);
      return () => window.clearTimeout(timer);
    } else if (phase === "idle" && wasOpen.current) {
      wasOpen.current = false;
      // Found by query: refs on AnimatePresence children trip React 19 warnings.
      rootRef.current
        ?.querySelector<HTMLButtonElement>("button[aria-haspopup]")
        ?.focus({ preventScroll: true });
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "sent") {
      return;
    }
    const timer = window.setTimeout(() => setPhase("idle"), SENT_FOR);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "open") {
      return;
    }
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPhase("idle");
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [phase]);

  const submit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      const text = value.trim();
      if (!text || phase !== "open") {
        return;
      }
      setPhase("sending");
      try {
        await onSubmit(text, selectedCategory);
        setValue("");
        setPhase("sent");
      } catch {
        setPhase("open");
      }
    },
    [onSubmit, phase, value, selectedCategory]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && phase === "open") {
        event.stopPropagation();
        setPhase("idle");
      }
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        submit();
      }
    },
    [phase, submit]
  );

  const buttonHeight = height ?? 46;

  let target: { width: number | string; height: number | string };
  if (expanded) {
    target = { width: availableWidth, height: "auto" };
  } else if (phase === "sent") {
    target = { width: size?.sent ?? "auto", height: buttonHeight };
  } else {
    target = { width: size?.idle ?? "auto", height: buttonHeight };
  }

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id={id}>
        <div
          className={cn("relative inline-block align-top", className)}
          ref={rootRef}
          style={{ height: buttonHeight }}
        >
          {/* Off-screen copies that give the closed shapes their widths. */}
          <span
            aria-hidden="true"
            className="pointer-events-none invisible absolute flex items-center gap-2.5 whitespace-nowrap px-6 font-semibold text-[14.5px]"
            ref={idleSizer}
          >
            <span className="size-4" />
            {label}
            <span className="size-6 ml-1.5" />
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none invisible absolute flex items-center gap-2.5 whitespace-nowrap px-6 font-semibold text-[14.5px]"
            ref={sentSizer}
          >
            <span className="size-4" />
            {sentLabel}
          </span>
          {/* Keeps the inline box button-sized while the panel floats over the page. */}
          <span
            aria-hidden="true"
            className="invisible block"
            style={{ width: size?.idle ?? 160 }}
          />
          <motion.div
            animate={{
              ...target,
              borderRadius: expanded ? 20 : buttonHeight / 2,
            }}
            className={cn(
              "absolute top-0 overflow-hidden text-ink transition-colors duration-200",
              align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2",
              expanded
                ? "z-[70] border border-[#d9ddd3] bg-[#fffdf8] shadow-[0_24px_50px_-12px_rgba(13,90,67,0.22),0_12px_28px_-6px_rgba(0,0,0,0.12)] ring-1 ring-forest/15"
                : variant === "forest"
                ? "z-30 border border-forest bg-[#0d5a43] text-white shadow-md shadow-forest/20 hover:bg-[#094231] hover:shadow-lg active:scale-[0.98]"
                : "z-30 border border-[#d9ddd3] bg-[#fffdf8] text-ink shadow-xs"
            )}
            initial={false}
            onKeyDown={handleKeyDown}
            transition={MORPH}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {phase === "idle" ? (
                <motion.button
                  animate={{ opacity: 1 }}
                  aria-expanded={false}
                  aria-haspopup="dialog"
                  className={cn(
                    "flex items-center gap-2.5 whitespace-nowrap px-6 font-semibold text-[14.5px] transition-colors duration-200 focus-visible:outline-none",
                    variant === "forest"
                      ? "text-white"
                      : "text-ink hover:bg-forest/8 hover:text-forest"
                  )}
                  style={{ height: buttonHeight }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  initial={{ opacity: 0 }}
                  key="idle"
                  onClick={() => setPhase("open")}
                  transition={FADE}
                  type="button"
                >
                  <motion.span
                    className={variant === "forest" ? "text-cream" : "text-forest"}
                    layoutId="icon"
                  >
                    {icon}
                  </motion.span>
                  <motion.span layoutId="label">{label}</motion.span>
                  <span
                    className={cn(
                      "ml-1.5 flex size-6 items-center justify-center rounded-full text-xs transition-transform duration-200",
                      variant === "forest"
                        ? "bg-white/20 text-white"
                        : "bg-black/5 text-ink"
                    )}
                  >
                    →
                  </span>
                </motion.button>
              ) : null}

              {expanded ? (
                <motion.form
                  animate={{ opacity: 1 }}
                  aria-label={label}
                  className="flex flex-col"
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  initial={{ opacity: 0 }}
                  key="open"
                  onSubmit={submit}
                  style={{ width: availableWidth - 2 }}
                  transition={FADE}
                >
                  <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-[#f0ece4]">
                    <div className="flex items-center gap-2 font-display font-semibold text-[15px] text-ink">
                      <motion.span
                        className="text-forest"
                        layoutId="icon"
                      >
                        {icon}
                      </motion.span>
                      <motion.span layoutId="label">{label}</motion.span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPhase("idle")}
                      className="size-6 flex items-center justify-center rounded-full text-muted-ink/60 hover:text-ink hover:bg-black/5 transition-colors text-xs"
                      aria-label="Close feedback panel"
                    >
                      ✕
                    </button>
                  </div>

                  {categories && categories.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 px-5 pt-3 pb-1">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory((prev) => (prev === cat ? undefined : cat))}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 cursor-pointer",
                            selectedCategory === cat
                              ? "bg-[#0d5a43] text-white shadow-2xs"
                              : "bg-[#f4f0e8] text-[#4a5550] hover:bg-[#e9e3d7]"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <motion.div
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    className="flex flex-col"
                    initial={{ opacity: 0, y: 4, filter: "blur(4px)" }}
                    transition={{ ...FADE, delay: 0.08 }}
                  >
                    <label className="sr-only" htmlFor={`${id}-text`}>
                      {placeholder}
                    </label>
                    <textarea
                      className="h-32 w-full resize-none bg-transparent px-5 pt-2.5 text-sm text-ink leading-relaxed outline-none placeholder:text-[#66716c]/65 focus:placeholder:text-[#66716c]/35 disabled:opacity-60"
                      disabled={phase === "sending"}
                      id={`${id}-text`}
                      onChange={(event) => setValue(event.target.value)}
                      placeholder={placeholder}
                      ref={textareaRef}
                      value={value}
                    />
                    <div className="flex items-center justify-between gap-3 border-[#e8eee3] border-t bg-[#f7f3ea]/90 px-5 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-[#66716c]">
                        <kbd className="rounded border border-[#d9ddd3] bg-white px-1.5 py-0.5 font-sans text-[11px] font-semibold text-forest shadow-2xs">
                          {shortcut}
                        </kbd>
                        <kbd className="rounded border border-[#d9ddd3] bg-white px-1.5 py-0.5 font-sans text-[11px] font-semibold text-forest shadow-2xs">
                          ↵
                        </kbd>
                        <span className="ml-1 text-[11.5px]">to submit</span>
                      </span>
                      <button
                        className="flex h-8.5 items-center gap-1.5 rounded-lg bg-[#0d5a43] px-4 font-semibold text-white text-xs shadow-xs transition-all duration-150 hover:bg-[#063b2d] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-forest/30 disabled:text-white/70 cursor-pointer"
                        disabled={!value.trim() || phase === "sending"}
                        type="submit"
                      >
                        {phase === "sending" ? <Spinner /> : null}
                        {phase === "sending" ? "Submitting" : "Submit Note"}
                      </button>
                    </div>
                  </motion.div>
                </motion.form>
              ) : null}

              {phase === "sent" ? (
                <motion.div
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  className="flex items-center gap-2.5 whitespace-nowrap px-5 font-semibold text-sm text-[#0d5a43]"
                  style={{ height: buttonHeight }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  key="sent"
                  role="status"
                  transition={{ ...FADE, delay: 0.1 }}
                >
                  <svg
                    aria-hidden="true"
                    className="size-4 text-[#0d5a43]"
                    fill="none"
                    viewBox="0 0 16 16"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      fill="currentColor"
                      opacity="0.15"
                      r="8"
                    />
                    <motion.path
                      animate={{ pathLength: 1 }}
                      d="M4.75 8.25 7 10.5l4.25-4.75"
                      initial={{ pathLength: 0 }}
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.75"
                      transition={{
                        duration: 0.3,
                        ease: [0.23, 1, 0.32, 1],
                        delay: 0.2,
                      }}
                    />
                  </svg>
                  {sentLabel}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
