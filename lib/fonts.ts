import { Plus_Jakarta_Sans } from "next/font/google";

/**
 * Universal primary font family for DocHomoeo.
 * Plus Jakarta Sans provides crisp, bold, modern, cohesive typography
 * across hero headlines, section headings, navigation, and body copy.
 */
export const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans-main",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const warmSerif = plusJakartaSans;
export const playfairDisplay = plusJakartaSans;
