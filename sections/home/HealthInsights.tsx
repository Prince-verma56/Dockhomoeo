import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Container } from "@/components/shared/Container";

export function HealthInsights() {
  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-bold text-[#0a2015] tracking-tight mb-2">
              Health Insights
            </h2>
            <p className="text-[#4b6b5a]">
              Knowledge and understanding for your wellness journey.
            </p>
          </div>
          
          <Link 
            href="/insights" 
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-[#1b7a54] hover:text-[#115539] transition-colors"
          >
            Read all articles
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Main Featured Article */}
          <Link 
            href="/insights/understanding-potency" 
            className="group relative rounded-3xl overflow-hidden bg-[#f4f7f5] aspect-square sm:aspect-[4/3] lg:aspect-auto lg:h-[480px]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a2015]/90 via-[#0a2015]/40 to-transparent z-10" />
            
            {/* Minimal aesthetic placeholder for article image */}
            <div className="absolute inset-0 bg-[#e7f0ec] group-hover:scale-105 transition-transform duration-700">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 via-white/0 to-transparent opacity-60" />
            </div>

            <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 sm:p-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-medium text-white mb-4 w-fit">
                <BookOpen className="size-3" />
                Guide
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-[#a7c5b6] transition-colors">
                Understanding Homoeopathic Potencies: 30C vs 200C
              </h3>
              <p className="text-white/80 line-clamp-2 text-sm sm:text-base max-w-md">
                A definitive guide to understanding dilution scales and selecting the right potency for acute and chronic conditions.
              </p>
            </div>
          </Link>

          {/* Secondary Articles Stack */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {[
              {
                title: "Building a First Aid Kit",
                category: "Wellness",
                desc: "The top 5 essential homoeopathic remedies every family should have on hand for minor emergencies.",
                slug: "first-aid-kit"
              },
              {
                title: "How to Store Your Medicines",
                category: "Care",
                desc: "Learn why strong odors and direct sunlight can affect the efficacy of your homoeopathic dilutions.",
                slug: "storage-guide"
              },
              {
                title: "Navigating Combination Remedies",
                category: "Education",
                desc: "When to choose a complex combination formula versus a single classical remedy.",
                slug: "combination-remedies"
              }
            ].map((article, i) => (
              <Link 
                key={i} 
                href={`/insights/${article.slug}`}
                className="group flex flex-col sm:flex-row gap-6 p-6 rounded-3xl bg-white border border-black/5 hover:border-[#1b7a54]/30 hover:shadow-lg hover:shadow-[#1b7a54]/5 transition-all flex-1"
              >
                <div className="w-full sm:w-32 lg:w-40 h-32 rounded-2xl bg-[#f4f7f5] shrink-0 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#e7f0ec] to-[#d5e5db] group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                <div className="flex flex-col justify-center flex-1">
                  <div className="text-xs font-semibold text-[#1b7a54] mb-2 uppercase tracking-wider">
                    {article.category}
                  </div>
                  <h3 className="text-xl font-bold text-[#0a2015] mb-2 group-hover:text-[#1b7a54] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-[#4b6b5a] text-sm line-clamp-2">
                    {article.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link 
            href="/insights" 
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#f4f7f5] text-sm font-semibold text-[#0a2015] hover:bg-[#e7f0ec] transition-colors"
          >
            View all articles
          </Link>
        </div>
      </Container>
    </section>
  );
}
