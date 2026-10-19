"use client";

import { useEffect, useState } from "react";
import { Clock, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function FastDeliveryTimer({
  className,
  variant = "bar",
  showDiscountUrgency = true,
}: {
  className?: string;
  variant?: "bar" | "compact" | "card";
  showDiscountUrgency?: boolean;
}) {
  // Target an upcoming daily dispatch cutoff (e.g. 3 hours 14 mins from initial mount or relative to 6 PM)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 3,
    minutes: 14,
    seconds: 45,
  });

  useEffect(() => {
    // Generate a consistent target time for the session (stored in sessionStorage or defaulting to now + 3h 14m)
    const STORAGE_KEY = "dochomoeo_fast_delivery_cutoff";
    let targetMs: number;
    const stored = typeof window !== "undefined" ? window.sessionStorage.getItem(STORAGE_KEY) : null;

    if (stored && !isNaN(Number(stored)) && Number(stored) > Date.now()) {
      targetMs = Number(stored);
    } else {
      // Set to 3 hours, 14 minutes and 30 seconds from now
      targetMs = Date.now() + (3 * 3600 + 14 * 60 + 30) * 1000;
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(STORAGE_KEY, String(targetMs));
      }
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, targetMs - now);

      if (diff <= 0) {
        // Reset a new cycle so timer is never zero
        const newTarget = Date.now() + 4 * 3600 * 1000;
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(STORAGE_KEY, String(newTarget));
        }
        targetMs = newTarget;
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUnit = (val: number) => String(val).padStart(2, "0");

  if (variant === "compact") {
    return (
      <div className={cn("inline-flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 font-medium", className)}>
        <Zap className="size-3 text-amber-600 animate-pulse fill-amber-500" />
        <span>
          Order within <strong className="font-bold">{timeLeft.hours}h {timeLeft.minutes}m {formatUnit(timeLeft.seconds)}s</strong> for same-day dispatch
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={`Order within ${timeLeft.hours} hours and ${timeLeft.minutes} minutes for fast delivery`}
      className={cn(
        "rounded-2xl border border-orange-200/80 dark:border-orange-900/30 bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-rose-50/80 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-rose-950/20 px-3.5 py-2.5 text-center text-xs text-orange-950 dark:text-orange-200 shadow-2xs transition-all",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 font-bold text-orange-800 dark:text-orange-400">
          <Zap className="size-3.5 fill-orange-500 text-orange-600 animate-pulse" />
          <span>For fastest delivery{showDiscountUrgency ? " & special discount" : ""}, order within</span>
        </span>
        <span className="inline-flex items-center gap-1 font-extrabold text-orange-900 dark:text-orange-100 tabular-nums bg-white/80 dark:bg-black/40 border border-orange-300/40 dark:border-orange-800/40 px-2 py-0.5 rounded-lg shadow-2xs">
          <span>{timeLeft.hours} hrs</span>
          <span>{timeLeft.minutes} mins</span>
          <span className="text-[11px] text-orange-600 dark:text-orange-400">{formatUnit(timeLeft.seconds)}s</span>
        </span>
      </div>
    </div>
  );
}
