import type { Metadata } from "next";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { FavouritesView } from "@/sections/favourites/FavouritesView";

export const metadata: Metadata = {
  title: "Your favourites",
  description: "Products you have saved on this device.",
  // Personal and device-local: nothing here belongs in a search index.
  robots: { index: false, follow: true },
};

export default function FavouritesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas">
        <FavouritesView />
      </main>
      <SiteFooter />
    </>
  );
}
