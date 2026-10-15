import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";

/**
 * Search owns its shell so the header and footer stay mounted while the page
 * swaps between its loading, error and result states.
 */
export default function SearchLayout({ children }: LayoutProps<"/search">) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-canvas">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
