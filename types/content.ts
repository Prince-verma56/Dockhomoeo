import type { IconName, Rating } from "./common";

export type Brand = {
  id: string;
  name: string;
  /** Short monogram shown until a real logo asset is supplied. */
  monogram: string;
  /** Country of origin or a short descriptor line. */
  origin: string;
  href: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorLocation: string;
  initials: string;
  rating: Rating["value"];
  /** Only true when the order behind the review has been verified. */
  verifiedBuyer: boolean;
};

export type Article = {
  id: string;
  title: string;
  category: string;
  readingMinutes: number;
  href: string;
  mediaLabel: string;
};

export type TrustBenefit = {
  id: string;
  title: string;
  detail: string;
  icon: IconName;
};

/** A link group in the footer. */
export type FooterGroup = {
  id: string;
  title: string;
  links: { label: string; href: string }[];
};
