import type { Metadata, Viewport } from "next";
import { plusJakartaSans } from "@/lib/fonts";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DocHomeo — Natural care for a healthier you",
    template: "%s · DocHomeo",
  },
  description:
    "Homoeopathic medicines and online consultations with certified doctors, delivered to your home.",
};

export const viewport: Viewport = {
  themeColor: "#f6f2ea",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="flex min-h-full flex-col font-sans">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
