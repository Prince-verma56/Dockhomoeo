import type { Price, Rating } from "./common";

export type Doctor = {
  id: string;
  name: string;
  /** Post-nominals exactly as supplied by verification; never inferred. */
  qualifications: string;
  specialty: string;
  experienceYears: number;
  rating?: Rating;
  /** Pre-formatted for display; scheduling logic belongs to the booking route. */
  nextAvailable: string;
  consultationFee: Price;
  /** Two-letter fallback for the avatar while the portrait is a placeholder. */
  initials: string;
  mediaLabel: string;
};

/** A capability offered by the consultation service. */
export type ConsultationCapability = {
  id: string;
  label: string;
  icon: import("./common").IconName;
};

/** One step of the consultation journey. */
export type JourneyStep = {
  id: string;
  /** Display ordinal, e.g. "01". */
  step: string;
  title: string;
  description: string;
  icon: import("./common").IconName;
};
