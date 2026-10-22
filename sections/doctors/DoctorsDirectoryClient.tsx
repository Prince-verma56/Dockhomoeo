"use client";

import { useRef, useState } from "react";
import {
  ArrowRight,
  Baby,
  Brain,
  ChevronLeft,
  ChevronRight,
  Heart,
  LayoutGrid,
  Search,
  Sparkles,
  Sprout,
} from "lucide-react";
import { DoctorCard } from "@/sections/doctors/DoctorCard";
import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";
import type { ApiDoctorCard, ApiNextSlot } from "@/types/api/care";

const SPECIALITY_FILTERS = [
  { id: "all", label: "All Specialisations", icon: LayoutGrid },
  { id: "chronic", label: "Chronic Diseases", icon: Sprout },
  { id: "skin", label: "Skin, Hair & Hormonal Health", icon: Sparkles },
  { id: "pediatrics", label: "Pediatrics & Respiratory Care", icon: Baby },
  { id: "womens", label: "Women's Wellness", icon: Heart },
  { id: "mental", label: "Mental Health", icon: Brain },
];

interface DoctorsDirectoryClientProps {
  doctors: ApiDoctorCard[];
  nextSlots: Record<number, ApiNextSlot | null>;
  initialQuery?: string;
}

export function DoctorsDirectoryClient({
  doctors,
  nextSlots,
  initialQuery = "",
}: DoctorsDirectoryClientProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 360;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Filter doctors based on search & active filter
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      !searchTerm.trim() ||
      doc.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.specialization?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (doc.clinicCity?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      doc.languages.some((l) => l.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === "all") return true;
    if (activeFilter === "chronic")
      return doc.specialization?.toLowerCase().includes("chronic") || doc.specialization?.toLowerCase().includes("immunity");
    if (activeFilter === "skin")
      return doc.specialization?.toLowerCase().includes("skin") || doc.specialization?.toLowerCase().includes("hair");
    if (activeFilter === "pediatrics")
      return doc.specialization?.toLowerCase().includes("pediatric") || doc.specialization?.toLowerCase().includes("respiratory");
    if (activeFilter === "womens")
      return doc.specialization?.toLowerCase().includes("women") || doc.specialization?.toLowerCase().includes("lifestyle");
    if (activeFilter === "mental")
      return doc.specialization?.toLowerCase().includes("mental") || doc.specialization?.toLowerCase().includes("stress");

    return true;
  });

  return (
    <>
      {/* ============================================================== */}
      {/* 1. SEARCH SECTION: Find Your Doctor Search Bar & Filter Chips   */}
      {/* ============================================================== */}
      <section aria-label="Search and filter doctors" className="pt-4 sm:pt-6 pb-10">
        <Reveal y={16}>
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
              <div>
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#0d5a43]">
                  FIND YOUR DOCTOR
                </span>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl lg:text-[2rem] font-bold text-ink leading-tight">
                  Search by speciality or health concern
                </h2>
              </div>

              {/* Pill Search Input */}
              <div className="relative w-full lg:max-w-md">
                <div className="relative flex items-center rounded-full border border-black/10 bg-white shadow-xs focus-within:border-forest/50 focus-within:ring-2 focus-within:ring-forest/20 transition-all p-1.5">
                  <Search className="size-4.5 text-muted-ink ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search doctors, specialisations or conditions..."
                    className="w-full bg-transparent px-3 text-xs sm:text-sm text-ink placeholder:text-muted-ink/70 focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Submit search"
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0d5a43] hover:bg-[#074231] text-white transition-colors cursor-pointer"
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Speciality Filter Chips */}
            <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {SPECIALITY_FILTERS.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3.5 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-2xs border",
                      isActive
                        ? "bg-[#0d5a43] text-white border-[#0d5a43] shadow-sm"
                        : "bg-white/85 hover:bg-white text-ink/80 hover:text-forest border-black/8 hover:border-forest/30"
                    )}
                  >
                    <Icon className={cn("size-3.5", isActive ? "text-cream" : "text-[#0d5a43]")} />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============================================================== */}
      {/* 2. OUR DOCTORS SECTION: Verified Homeopathic Doctors Grid      */}
      {/* ============================================================== */}
      <section id="directory" aria-labelledby="doctors-list-heading" className="py-8 sm:py-12 border-t border-line/40">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Row: Title & Subtitle + Carousel Nav Buttons */}
          <Reveal y={16}>
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#0d5a43]">
                  OUR DOCTORS
                </span>
                <h2
                  id="doctors-list-heading"
                  className="mt-1 font-display text-2xl sm:text-3xl lg:text-[2.25rem] font-bold text-ink leading-tight"
                >
                  Verified homeopathic doctors
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-muted-ink">
                  Consult experienced doctors for personalised care
                </p>
              </div>

              {/* Carousel Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  aria-label="Previous doctors"
                  className="grid size-9 sm:size-10 place-items-center rounded-full border border-black/10 bg-white hover:bg-[#0d5a43] hover:text-white text-ink shadow-xs transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-4.5" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  aria-label="Next doctors"
                  className="grid size-9 sm:size-10 place-items-center rounded-full border border-black/10 bg-white hover:bg-[#0d5a43] hover:text-white text-ink shadow-xs transition-colors cursor-pointer"
                >
                  <ChevronRight className="size-4.5" />
                </button>
              </div>
            </div>
          </Reveal>

          {/* Doctors Grid / Carousel Container */}
          {filteredDoctors.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-dashed border-line-soft bg-paper/50">
              <p className="text-base font-semibold text-ink">No doctors match your criteria</p>
              <p className="text-xs text-muted-ink mt-1">Try clearing your search query or selecting &quot;All Specialisations&quot;.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("all");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-forest text-white px-4 py-2 text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <Reveal y={24} stagger={0.06}>
              <div
                ref={scrollContainerRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch"
              >
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="min-w-0 h-full">
                    <DoctorCard
                      doctor={doctor}
                      nextSlot={nextSlots[doctor.id] ?? null}
                    />
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
