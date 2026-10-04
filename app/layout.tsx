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
      <head>
        {/* Runs before first paint: arms the scroll-reveal gate in
            app/globals.css so no section is readable before its own
            ScrollTrigger fires. Deliberately inline and tiny — a deferred
            script would paint the ungated page first.

            The timeout is the failsafe: if the client bundle never boots,
            SmoothScrollProvider never sets data-motion-ready and the gate is
            stripped, so the page degrades to plain visible content instead of
            staying blank. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("dh-motion");setTimeout(function(){if(!d.hasAttribute("data-motion-ready"))d.classList.remove("dh-motion")},4000)}catch(e){}})()`,
          }}
        />
      </head>
      <body suppressHydrationWarning className="flex min-h-full flex-col font-sans">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
