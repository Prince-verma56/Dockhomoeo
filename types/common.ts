/** Money is carried as minor units plus a currency so formatting stays in one place. */
export type Price = {
  amount: number;
  currency: "INR";
};

export type Rating = {
  /** 0–5, one decimal. */
  value: number;
  count: number;
};

/** Lucide icon names, resolved through lib/icons so data stays serialisable. */
export type IconName =
  | "shield-check"
  | "truck"
  | "credit-card"
  | "rotate-ccw"
  | "stethoscope"
  | "video"
  | "file-text"
  | "calendar-check"
  | "package-check"
  | "search"
  | "heart-pulse"
  | "sparkles"
  | "leaf"
  | "baby"
  | "bone"
  | "wind"
  | "moon"
  | "flower-2"
  | "droplets"
  | "pill"
  | "flask-conical"
  | "hand"
  | "badge-check"
  | "headset";
