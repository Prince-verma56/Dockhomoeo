import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { repositories } from "@/lib/repositories";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { Container } from "@/components/shared/Container";
import { InsightCard } from "@/components/content/InsightCard";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Heart,
  Info,
  Leaf,
  MessageSquare,
  Quote,
  Share2,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { SafeRichText } from "@/components/shared/SafeRichText";
import { Button } from "@/components/ui/button";
import { RisePanel } from "@/components/shared/RisePanel";
import { cn } from "@/lib/utils";
import { getDetailedInsightBySlug, type DetailedInsightArticle } from "@/data/mock/insightsData";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const detailed = getDetailedInsightBySlug(params.slug);
  const insight = detailed ? null : await repositories.insight.getBySlug(params.slug);

  if (!detailed && !insight) {
    return { title: "Topic not found", robots: { index: false, follow: true } };
  }

  const title = detailed?.title || insight?.seoTitle || insight?.title || "Health Insights";
  const description = detailed?.excerpt || insight?.seoDescription || insight?.excerpt || undefined;
  const cover = detailed?.coverImageUrl || insight?.coverImageUrl || null;
  const url = `/insights/${params.slug}`;

  return {
    title: `${title} | Health Insights | DocHomoeo`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      ...(cover ? { images: [cover] } : {}),
    },
  };
}

export default async function InsightDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const detailed = getDetailedInsightBySlug(params.slug);
  const insight = detailed ? null : await repositories.insight.getBySlug(params.slug);

  if (!detailed && !insight) {
    notFound();
  }

  const activeData: {
    title: string;
    excerpt: string;
    slug: string;
    coverImageUrl: string | null;
    authorName: string;
    authorRole: string;
    authorImageUrl: string | null;
    publishedAt: string | null;
    readingMinutes: number;
    category: { name: string; slug: string };
    tag: string;
    keyTakeaways: string[];
    safetyNotes: string;
  } = detailed
    ? {
        title: detailed.title,
        excerpt: detailed.excerpt,
        slug: detailed.slug,
        coverImageUrl: detailed.coverImageUrl,
        authorName: detailed.authorName,
        authorRole: detailed.authorRole,
        authorImageUrl: detailed.authorImageUrl,
        publishedAt: detailed.publishedAt,
        readingMinutes: detailed.readingMinutes,
        category: detailed.category,
        tag: detailed.tag,
        keyTakeaways: detailed.keyTakeaways,
        safetyNotes: detailed.safetyNotes,
      }
    : {
        title: insight!.title,
        excerpt: insight!.excerpt ?? "",
        slug: insight!.slug,
        coverImageUrl: insight!.coverImageUrl,
        authorName: insight!.authorName ?? "DocHomoeo Medical Board",
        authorRole: "Integrative Health Contributor",
        authorImageUrl: "/Images/doctors/step-video-call.jpg",
        publishedAt: insight!.publishedAt,
        readingMinutes: 5,
        category: insight!.category ?? { name: "Wellness", slug: "wellness" },
        tag: "INSIGHT",
        keyTakeaways: [
          "Understanding individual constitutional modalities and physiological resonance.",
          "Homeopathic dilutions are prepared according to standard pharmacopeia protocols.",
          "Always speak to a licensed homeopathic doctor before altering therapeutic routines."
        ],
        safetyNotes:
          "Homeopathic guidance provides complementary health education. Consult a verified practitioner for persistent symptoms."
      };

  const [related, remedies] = await Promise.all([
    repositories.insight.getRelated(params.slug),
    activeData.category ? repositories.search.search({ category: activeData.category.slug, pageSize: 3 }) : null,
  ]);

  const formattedDate = activeData.publishedAt
    ? new Intl.DateTimeFormat("en-IN", { month: "long", day: "numeric", year: "numeric" }).format(
        new Date(activeData.publishedAt)
      )
    : "March 2026";

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1 overflow-x-hidden bg-canvas text-ink">
        {/* ============================================================== */}
        {/* HERO SECTION: Editorial Header with Clinical Verification Bar  */}
        {/* ============================================================== */}
        <section className="relative overflow-hidden pt-28 sm:pt-32 md:pt-36 pb-10 sm:pb-14 bg-gradient-to-b from-[#f9f7f2] via-[#f7f4ee] to-canvas border-b border-line-soft/80">
          {/* Subtle Ambient Glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 size-[450px] rounded-full bg-forest/8 blur-3xl select-none"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 -right-24 size-[450px] rounded-full bg-amber-500/8 blur-3xl select-none"
          />

          <Container width="narrow" className="relative z-10 space-y-6">
            {/* Breadcrumb Navigation */}
            <PageBreadcrumb
              items={[
                { name: "Health insights", href: "/insights" },
                { name: activeData.category.name, href: `/insights?category=${encodeURIComponent(activeData.category.slug)}` },
                { name: activeData.title, href: `/insights/${activeData.slug}` },
              ]}
              className="text-xs font-medium text-muted-ink"
            />

            {/* Verification Pill & Tag */}
            <div className="flex flex-wrap items-center gap-2.5 select-none">
              <span className="rounded-full bg-forest text-cream px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-2xs">
                {activeData.tag}
              </span>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-sage-wash/60 px-3 py-1 text-[11px] font-semibold text-forest shadow-2xs">
                <span className="size-2 rounded-full bg-forest animate-pulse" />
                <span>Verified Clinical Guide · Peer-Reviewed</span>
              </div>
            </div>

            {/* Main Article Title */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-ink leading-[1.12]">
              {activeData.title}
            </h1>

            {/* Lede Summary */}
            {activeData.excerpt ? (
              <p className="text-base sm:text-lg lg:text-[1.1rem] text-muted-ink leading-relaxed max-w-3xl">
                {activeData.excerpt}
              </p>
            ) : null}

            {/* Author Meta Strip with Clinical Credentials */}
            <div className="pt-4 border-t border-line-soft/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative size-12 rounded-full overflow-hidden border-2 border-forest/30 bg-cream-sunk shadow-xs shrink-0">
                  <img
                    src={activeData.authorImageUrl || "/Images/doctors/step-video-call.jpg"}
                    alt={activeData.authorName}
                    className="size-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-ink leading-tight">
                    {activeData.authorName}
                  </p>
                  <p className="text-xs text-muted-ink mt-0.5">
                    {activeData.authorRole}
                  </p>
                </div>
              </div>

              {/* Meta indicators: Date & Read Time */}
              <div className="flex items-center gap-4 text-xs font-semibold text-muted-ink">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-forest" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-forest" />
                  <span>{activeData.readingMinutes} min read</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-forest font-bold">
                  <CheckCircle2 className="size-3.5" />
                  <span>Materia Medica Backed</span>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ============================================================== */}
        {/* PRIMARY HERO VISUAL CONTAINER (Large Organic Image Container)  */}
        {/* ============================================================== */}
        {activeData.coverImageUrl ? (
          <section className="relative -mt-6 sm:-mt-8 mb-12 sm:mb-16 z-20">
            <Container width="narrow">
              <div className="relative aspect-[16/9] sm:aspect-[21/10] w-full rounded-3xl sm:rounded-[2.5rem] overflow-hidden border border-line-soft bg-paper shadow-lift group">
                <img
                  src={activeData.coverImageUrl}
                  alt={activeData.title}
                  className="size-full object-cover object-center pointer-events-none select-none transition-transform duration-700 ease-premium group-hover:scale-103"
                  draggable={false}
                />
                
                {/* Soft Gradient Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />

                {/* Floating Glass Pill: Clinical Takeaway */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 rounded-2xl border border-white/85 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md max-w-[260px] hidden sm:flex items-center gap-3 select-none">
                  <span className="grid size-8 place-items-center rounded-xl bg-forest-abyss text-emerald-300 shrink-0 shadow-2xs">
                    <Stethoscope className="size-4 text-emerald-300" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-ink leading-tight">
                      Clinical Perspective
                    </p>
                    <p className="text-[10.5px] text-muted-ink leading-snug">
                      Classical holistic doctrine &amp; practical advice.
                    </p>
                  </div>
                </div>

                {/* Bottom Photo Caption Strip */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between text-white text-xs font-medium drop-shadow-xs">
                  <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
                    <Leaf className="size-3.5 text-emerald-300" />
                    DocHomoeo Pharmacopeia Archives · {activeData.category.name}
                  </span>
                  <span className="hidden sm:inline-block text-[11px] text-white/80">
                    High-Potency Herbal Formulations
                  </span>
                </div>
              </div>
            </Container>
          </section>
        ) : null}

        {/* ============================================================== */}
        {/* KEY TAKEAWAYS & CLINICAL PEARLS (At-A-Glance Container)         */}
        {/* ============================================================== */}
        <section className="pb-12 sm:pb-16">
          <Container width="narrow">
            <div className="rounded-3xl sm:rounded-[2rem] border border-forest/20 bg-sage-wash/45 p-6 sm:p-8 md:p-10 shadow-soft relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-5 select-none">
                <span className="grid size-8 place-items-center rounded-xl bg-forest text-cream shadow-2xs">
                  <Award className="size-4" />
                </span>
                <h2 className="font-display font-bold text-lg sm:text-xl text-ink tracking-tight">
                  Key Takeaways &amp; Clinical Pearls
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {activeData.keyTakeaways.map((takeaway, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-2xl bg-white/90 border border-forest/10 p-4 shadow-2xs"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-forest font-bold text-xs mt-0.5">
                      <Check className="size-3.5" />
                    </span>
                    <p className="text-xs sm:text-sm text-ink/90 leading-relaxed font-medium">
                      {takeaway}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ============================================================== */}
        {/* SMARTER EDITORIAL SECTIONS WITH VISUAL IMAGE CONTAINERS        */}
        {/* ============================================================== */}
        <section className="pb-16 sm:pb-20">
          <Container width="narrow" className="space-y-14 sm:space-y-20">
            {detailed && detailed.visualSections.length > 0 ? (
              detailed.visualSections.map((sec, idx) => {
                const isEven = idx % 2 === 1;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-8 border-t border-line-soft/80 first:border-0 first:pt-0",
                      isEven ? "lg:flex-row-reverse" : ""
                    )}
                  >
                    {/* Visual Image Container */}
                    <div
                      className={cn(
                        "lg:col-span-5 relative",
                        isEven ? "lg:order-2" : "lg:order-1"
                      )}
                    >
                      <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-line-soft bg-paper shadow-lift group">
                        <img
                          src={sec.image}
                          alt={sec.heading}
                          className="size-full object-cover object-center pointer-events-none select-none transition-transform duration-700 ease-premium group-hover:scale-105"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                        {sec.badge ? (
                          <span className="absolute top-3 left-3 rounded-full bg-forest text-cream px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-2xs select-none">
                            {sec.badge}
                          </span>
                        ) : null}

                        <p className="absolute bottom-3 left-3 right-3 text-[11px] text-white/95 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-xl font-medium leading-snug">
                          {sec.imageCaption}
                        </p>
                      </div>
                    </div>

                    {/* Editorial Content Container */}
                    <div
                      className={cn(
                        "lg:col-span-7 space-y-4",
                        isEven ? "lg:order-1" : "lg:order-2"
                      )}
                    >
                      {sec.subheading ? (
                        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-forest block">
                          {sec.subheading}
                        </span>
                      ) : null}

                      <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink leading-snug">
                        {sec.heading}
                      </h2>

                      <div className="space-y-3.5 text-sm sm:text-base text-ink/80 leading-relaxed font-normal">
                        {sec.content.map((p, pIdx) => (
                          <p key={pIdx}>{p}</p>
                        ))}
                      </div>

                      {sec.bullets && sec.bullets.length > 0 ? (
                        <div className="pt-2 space-y-2">
                          {sec.bullets.map((b, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-forest">
                              <span className="size-1.5 rounded-full bg-forest" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              /* Fallback for basic markdown insights */
              <div className="mx-auto max-w-3xl">
                <SafeRichText
                  content={insight?.content || ""}
                  className="space-y-6 text-base leading-relaxed text-ink/85 [&_h2]:pt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:font-display [&_h3]:text-lg"
                />
              </div>
            )}

            {/* Doctor Perspective Quote Card */}
            {detailed?.doctorQuote ? (
              <div className="rounded-3xl sm:rounded-[2.25rem] bg-forest-abyss text-cream p-7 sm:p-10 shadow-lift border border-forest/30 relative overflow-hidden select-none">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-emerald-500/10 blur-3xl select-none"
                />

                <div className="relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-center justify-between">
                  <div className="space-y-4 max-w-2xl">
                    <Quote className="size-8 text-emerald-400 opacity-60" />
                    <blockquote className="font-serif italic text-lg sm:text-xl lg:text-[1.35rem] leading-relaxed text-cream/95">
                      &ldquo;{detailed.doctorQuote.quote}&rdquo;
                    </blockquote>
                    <div>
                      <p className="font-display font-bold text-sm sm:text-base text-cream">
                        {detailed.doctorQuote.doctorName}
                      </p>
                      <p className="text-xs text-cream/70">
                        {detailed.doctorQuote.doctorTitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                    <div className="relative size-16 rounded-full overflow-hidden border-2 border-white/20 shadow-md">
                      <img
                        src={detailed.doctorQuote.avatarUrl}
                        alt={detailed.doctorQuote.doctorName}
                        className="size-full object-cover"
                      />
                    </div>
                    <Link
                      href="/doctors"
                      className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-xs font-bold text-forest hover:bg-white transition-all shadow-xs"
                    >
                      <Stethoscope className="size-3.5" />
                      <span>Book Consultation</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Potency & Dosage Guide Matrix (If present) */}
            {detailed?.potencyGuide && detailed.potencyGuide.length > 0 ? (
              <div className="rounded-3xl border border-line-soft bg-paper p-6 sm:p-8 shadow-soft space-y-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-xl bg-sage-wash text-forest shadow-2xs">
                    <BookOpen className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-lg text-ink">
                      Pharmacopeial Potency &amp; Application Guide
                    </h3>
                    <p className="text-xs text-muted-ink">
                      Standard clinical dilutions and recommended administration cadence
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {detailed.potencyGuide.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-line-soft/80 bg-canvas/60 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm text-ink">
                          {item.remedy}
                        </span>
                        <span className="text-[10px] font-bold text-forest bg-sage-wash px-2 py-0.5 rounded-full">
                          {item.dilution}
                        </span>
                      </div>
                      <p className="text-xs text-muted-ink leading-snug">
                        <strong className="text-ink font-semibold">Indication:</strong> {item.indication}
                      </p>
                      <p className="text-[11px] text-ink/80 pt-1 border-t border-line-soft/60">
                        {item.guidance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Recommended Remedies Row */}
            {detailed?.recommendedRemedies && detailed.recommendedRemedies.length > 0 ? (
              <div className="space-y-5 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-forest block">
                      MATERIA MEDICA PRESCRIBED
                    </span>
                    <h3 className="font-display font-bold text-xl text-ink mt-0.5">
                      Related Remedies in Our Dispensary
                    </h3>
                  </div>
                  <Link
                    href="/products"
                    className="text-xs sm:text-sm font-semibold text-forest hover:underline"
                  >
                    View all remedies →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {detailed.recommendedRemedies.map((remedy, idx) => (
                    <div
                      key={idx}
                      className="group rounded-3xl border border-line-soft bg-paper p-4 shadow-soft hover:shadow-lift hover:border-forest/40 transition-all flex items-center gap-4"
                    >
                      <div className="relative size-16 rounded-2xl overflow-hidden border border-line-soft/80 bg-cream-sunk shrink-0">
                        <img
                          src={remedy.image}
                          alt={remedy.name}
                          className="size-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-forest bg-sage-wash px-2 py-0.5 rounded-full">
                            {remedy.potency}
                          </span>
                          <span className="text-[10px] text-muted-ink truncate">
                            {remedy.form}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-ink truncate group-hover:text-forest transition-colors">
                          {remedy.name}
                        </h4>
                        <p className="text-[11px] text-muted-ink truncate">
                          {remedy.indication}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Safety & Compliance Box */}
            <div className="rounded-2xl border border-line-soft bg-paper p-5 sm:p-6 text-xs sm:text-sm leading-relaxed text-muted-ink flex items-start gap-3.5 select-none">
              <Info className="size-4.5 text-forest shrink-0 mt-0.5" />
              <div>
                <strong className="text-ink font-semibold block mb-0.5">
                  Clinical Safety &amp; Usage Guidance
                </strong>
                {activeData.safetyNotes}
              </div>
            </div>

            {/* Bottom Navigation & Consult CTA Bar */}
            <div className="pt-8 border-t border-line-soft/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/insights"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-forest hover:text-forest-deep transition-colors"
              >
                <ArrowLeft className="size-4" />
                <span>Return to all health insights</span>
              </Link>

              <div className="flex items-center gap-3">
                <Button asChild variant="brand" size="lg" className="rounded-full">
                  <Link href="/doctors">
                    <Stethoscope className="size-4 mr-2" />
                    <span>Consult a Doctor Online</span>
                  </Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* ============================================================== */}
        {/* KEEP READING: 3 Related Curated Cards                           */}
        {/* ============================================================== */}
        {related.items.length > 0 ? (
          <RisePanel aria-labelledby="keep-reading" settle className="pt-14 pb-16 lg:pt-20 lg:pb-24 border-t border-line-soft/70">
            <Container width="narrow">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-forest block">
                    EXPLORE MORE TOPICS
                  </span>
                  <h2 id="keep-reading" className="dh-title-section text-ink mt-0.5">
                    Continue your wellness journey
                  </h2>
                </div>
                <Link href="/insights" className="text-sm font-semibold text-forest hover:underline">
                  View all articles →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.items.map((item) => (
                  <InsightCard key={item.id} insight={item} />
                ))}
              </div>
            </Container>
          </RisePanel>
        ) : null}
      </main>

      <SiteFooter />
    </>
  );
}
