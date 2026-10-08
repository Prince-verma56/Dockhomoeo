"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { ApiBanner } from "@/types/api/home";

interface HomeHeroProps {
  banner?: ApiBanner;
}

export function HomeHero({ banner }: HomeHeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-[#eff3f0] pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Abstract Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[120%] bg-gradient-to-bl from-[#d5e5db] to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[80%] bg-gradient-to-tr from-[#e2ece6] to-transparent rounded-full blur-3xl opacity-50" />
      </div>

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <div className="flex flex-col items-start max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-black/5 text-[0.8rem] font-medium text-[#2d4739] mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#1b7a54] animate-pulse" />
              Trusted Homoeopathic Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0a2015] leading-[1.1] mb-6">
              {banner?.title || "Healing Naturally, Sourced Authentically"}
            </h1>
            
            <p className="text-lg text-[#3d5c4d] mb-10 max-w-xl leading-relaxed">
              Discover a curated selection of premium homoeopathic remedies from world-renowned manufacturers. Guaranteed authentic, delivered fast.
            </p>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link 
                href={banner?.linkUrl || "/products"}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#0a2015] px-8 text-sm font-medium text-white shadow-lg shadow-[#0a2015]/20 hover:bg-[#153a27] transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto gap-2"
              >
                Shop All Remedies
                <ArrowRight className="size-4" />
              </Link>
              <Link 
                href="/categories"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-medium text-[#0a2015] border border-black/10 hover:bg-black/5 transition-all w-full sm:w-auto"
              >
                Browse Categories
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex items-center gap-8 pt-8 border-t border-black/10">
              <div className="flex items-center gap-3 text-[#2d4739]">
                <ShieldCheck className="size-5 text-[#1b7a54]" />
                <span className="text-sm font-medium">100% Authentic</span>
              </div>
              <div className="flex items-center gap-3 text-[#2d4739]">
                <Truck className="size-5 text-[#1b7a54]" />
                <span className="text-sm font-medium">Fast Pan-India Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative w-full max-w-lg mx-auto lg:ml-auto lg:mr-0 aspect-square">
            <div className="absolute inset-0 bg-white/40 rounded-[2.5rem] rotate-3 border border-white/60 shadow-xl backdrop-blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1b7a54]/5 to-transparent rounded-[2.5rem] -rotate-3 border border-white shadow-sm" />
            
            <div className="absolute inset-4 rounded-[2rem] overflow-hidden bg-[#f4f7f5] shadow-inner border border-black/5">
              {banner?.imageUrl ? (
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#2d4739]/50">
                  <div className="text-center font-serif text-2xl mb-2">DocHomo</div>
                  <div className="text-sm tracking-widest uppercase">Pure Homoeopathy</div>
                </div>
              )}
            </div>
            
            {/* Floating Element */}
            <div className="absolute -right-6 top-1/4 bg-white p-4 rounded-2xl shadow-xl shadow-black/5 border border-black/5 flex items-center gap-3 backdrop-blur-md animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="size-10 rounded-full bg-[#e7f0ec] flex items-center justify-center text-[#1b7a54] font-bold">
                4.8
              </div>
              <div className="text-xs">
                <div className="font-bold text-[#0a2015]">Trusted by</div>
                <div className="text-[#3d5c4d]">10k+ Patients</div>
              </div>
            </div>
          </div>
          
        </div>
      </Container>
    </section>
  );
}
