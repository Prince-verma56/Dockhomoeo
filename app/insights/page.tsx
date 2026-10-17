import type { Metadata } from "next";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { HealthInsightsView } from "@/sections/insights/HealthInsightsView";

type Props = PageProps<"/insights">;

export const metadata: Metadata = {
  title: "Health Insights | The Wellness Journal | DocHomoeo",
  description:
    "Knowledge for a healthier tomorrow. Practical guides, expert-backed insights and natural wellness knowledge from DocHomoeo.",
  alternates: { canonical: "/insights" },
  openGraph: {
    title: "Health Insights — The Wellness Journal · DocHomoeo",
    description:
      "Knowledge for a healthier tomorrow. Practical guides, expert-backed insights and natural wellness knowledge.",
    url: "/insights",
    type: "website",
  },
};

export default async function InsightsPage({ searchParams }: Props) {
  const listing = await repositories.insight.getInsights(1, 12).catch(() => ({ items: [], total: 0 }));

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 overflow-x-clip bg-canvas">
        <HealthInsightsView
          initialInsights={listing.items}
          totalArticles={listing.total}
        />
      </main>
      <SiteFooter />
    </>
  );
}
