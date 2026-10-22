"use client";

import { Container } from "@/components/shared/Container";
import { PageBreadcrumb } from "@/components/shared/PageBreadcrumb";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { ApiDoctorDetail } from "@/types/api/care";

interface DoctorPageHeroProps {
  doctor: ApiDoctorDetail;
  onBookConsult?: () => void;
}

export function DoctorPageHero({ doctor }: DoctorPageHeroProps) {
  return (
    <section className="relative pt-32 sm:pt-36 pb-6 bg-[#fbfaf6] dark:bg-[#07130e] border-b border-black/[0.05] dark:border-white/10 overflow-hidden">
      {/* Ambient subtle glow background */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0d5a43]/[0.04] to-transparent pointer-events-none select-none" />

      <Container width="wide" className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageBreadcrumb
            items={[
              { name: "Doctors", href: "/doctors" },
              { name: doctor.displayName, href: `/doctors/${doctor.slug}` },
            ]}
          />

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d5a43]/10 dark:bg-emerald-500/15 border border-[#0d5a43]/20 px-3 py-1 text-[11px] font-bold text-[#0d5a43] dark:text-emerald-400">
              <ShieldCheck className="size-3.5 text-[#0d5a43] dark:text-emerald-400" />
              <span>Council Verified Telehealth</span>
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
