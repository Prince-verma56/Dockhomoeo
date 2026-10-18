import { Plus_Jakarta_Sans, Caveat } from "next/font/google";

/**
 * Universal primary font family for DocHomoeo.
 * Plus Jakarta Sans provides crisp, bold, modern, cohesive typography
 * across hero headlines, section headings, navigation, and body copy.
 */
export const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans-main",
  subsets: ["latin"],
  display: "swap",
});

export const caveat = Caveat({
  variable: "--font-signature",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});

export const warmSerif = plusJakartaSans;
export const playfairDisplay = plusJakartaSans;
