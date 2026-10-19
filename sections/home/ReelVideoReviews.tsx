"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Eye,
  Heart,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  UserCheck,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { useCart } from "@/components/providers/CartProvider";

export interface VideoReelItem {
  id: string;
  title: string;
  creatorName: string;
  creatorHandle: string;
  creatorRole: string;
  creatorAvatar?: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  views: string;
  likes: number;
  rating: number;
  story: string;
  taggedProduct: {
    name: string;
    slug: string;
    price: number;
    mrp: number;
    discountPercent: number;
    packSize: string;
    imageUrl: string;
  };
}

export const REEL_VIDEO_REVIEWS: VideoReelItem[] = [
  {
    id: "reel-1",
    title: "Found natural relief from weekly migraines with Arnica 30C! 🌿✨",
    creatorName: "Priyanka Nair",
    creatorHandle: "@Priya_Wellness",
    creatorRole: "Verified Patient • Bengaluru",
    creatorAvatar: "/Images/reels/reel-patient-recovery.webp",
    thumbnailUrl: "/Images/reels/reel-patient-recovery.webp",
    videoUrl: "/Videos/HeroVideo2.mp4",
    duration: "0:42",
    views: "34.8K",
    likes: 2840,
    rating: 5,
    story:
      "I suffered from throbbing migraine attacks every Monday. My homoeopathic doctor prescribed German Dilution 30C, and within 3 weeks the intensity dropped noticeably. Authentic medicines delivered right to my door in temperature-safe packaging!",
    taggedProduct: {
      name: "German Dilution 30C",
      slug: "german-dilution-30c",
      price: 115,
      mrp: 145,
      discountPercent: 21,
      packSize: "30 ml",
      imageUrl: "/Images/Products/gallery-packaging.jpg",
    },
  },
  {
    id: "reel-2",
    title: "Clinical Rule: How to take Homeopathic Dilutions correctly 🩺",
    creatorName: "Dr. Aditya Sharma",
    creatorHandle: "@Dr.Aditya_MD",
    creatorRole: "Senior Homoeopathic Physician (MD Hom)",
    creatorAvatar: "/Images/reels/reel-doctor-advice.webp",
    thumbnailUrl: "/Images/reels/reel-doctor-advice.webp",
    videoUrl: "/Videos/HeroVideo2.mp4",
    duration: "0:56",
    views: "58.2K",
    likes: 4520,
    rating: 5,
    story:
      "Avoid strong coffee, mint, or raw garlic 30 minutes before and after your dosage. Let the medicinal drops absorb sublingually under the tongue for maximum bioavailability.",
    taggedProduct: {
      name: "Adel 85 Neu-Regen",
      slug: "adel-85-neu-regen",
      price: 315,
      mrp: 385,
      discountPercent: 18,
      packSize: "100 ml",
      imageUrl: "/Images/Editorial/eucalyptus-dropper-bottle.webp",
    },
  },
  {
    id: "reel-3",
    title: "Unboxing my DocHomoeo monthly care parcel! 100% genuine sealed bottles 📦",
    creatorName: "Aura Botanicals",
    creatorHandle: "@aura.botanicals",
    creatorRole: "Verified Buyer • Mumbai",
    creatorAvatar: "/Images/reels/reel-unboxing-review.webp",
    thumbnailUrl: "/Images/reels/reel-unboxing-review.webp",
    videoUrl: "/Videos/HeroVideo2.mp4",
    duration: "0:38",
    views: "24.6K",
    likes: 2140,
    rating: 5,
    story:
      "The parcel arrived in completely recyclable cardboard packaging with natural cotton cushion padding. Original holographic seals on both Arnica and Ignatia bottles were flawless!",
    taggedProduct: {
      name: "Arnica Montana 30C",
      slug: "arnica-montana-30c",
      price: 115,
      mrp: 145,
      discountPercent: 21,
      packSize: "30 ml",
      imageUrl: "/Images/Products/boiron-arnica.jpg",
    },
  },
  {
    id: "reel-4",
    title: "Gentle colicky pain & teething relief for babies and toddlers 👶🍼",
    creatorName: "Dr. Sunita Kulkarni",
    creatorHandle: "@DrSunita_ChildCare",
    creatorRole: "Pediatric Homoeopath (BHMS)",
    creatorAvatar: "/Images/doctors/dr-sunita-kulkarni.jpg",
    thumbnailUrl: "/Images/doctors/step-video-call.jpg",
    videoUrl: "/Videos/HeroVideo2.mp4",
    duration: "0:48",
    views: "41.9K",
    likes: 3870,
    rating: 5,
    story:
      "Teething irritability and restless nights can be soothed gently. Sweet sugar globules dissolve in the mouth effortlessly without any choking hazard or artificial chemicals.",
    taggedProduct: {
      name: "Chamomilla 30C Pellets",
      slug: "chamomilla-30c-pellets",
      price: 125,
      mrp: 155,
      discountPercent: 19,
      packSize: "25 gm",
      imageUrl: "/Images/Editorial/chamomilla-pellet-bottle.webp",
    },
  },
  {
    id: "reel-5",
    title: "My 3-month chronic acidity & GERD recovery journey with Dr. Verma 🌿",
    creatorName: "Rajesh Malhotra",
    creatorHandle: "@Rajesh_Health",
    creatorRole: "Verified Patient • New Delhi",
    creatorAvatar: "/Images/doctors/dr-rajesh-sharma.jpg",
    thumbnailUrl: "/Images/doctors/journey-laptop-consult.jpg",
    videoUrl: "/Videos/HeroVideo2.mp4",
    duration: "0:51",
    views: "19.3K",
    likes: 1650,
    rating: 5,
    story:
      "I was relying on antacids every single night. A 15-minute online video consult through DocHomoeo and individualized dilution remedies completely balanced my digestion.",
    taggedProduct: {
      name: "Reckeweg R41 Fortivirone",
      slug: "reckeweg-r41",
      price: 270,
      mrp: 330,
      discountPercent: 18,
      packSize: "22 ml",
      imageUrl: "/Images/Products/reckeweg-r41.jpg",
    },
  },
];

export function ReelVideoReviews({
  reels = REEL_VIDEO_REVIEWS,
  title = "Real Patient Stories & Video Reviews",
  subtitle = "Watch certified homoeopaths & verified patients share genuine recovery experiences, unboxing, and wellness tips.",
}: {
  reels?: VideoReelItem[];
  title?: string;
  subtitle?: string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});
  const [showShareToast, setShowShareToast] = useState(false);
  const [addedProductToast, setAddedProductToast] = useState(false);

  // Mouse drag-to-scroll & touch swipe states
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const videoModalRef = useRef<HTMLVideoElement | null>(null);
  const cart = useCart();

  const activeReel = activeReelIndex !== null ? reels[activeReelIndex] : null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -340 : 340;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isMouseDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.35; // smooth drag velocity
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
      if (!isDragging) setIsDragging(true);
    }
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      setIsDragging(false);
      hasMovedRef.current = false;
    }, 60);
  };

  // Keyboard navigation inside modal
  useEffect(() => {
    if (activeReelIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveReelIndex(null);
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        setActiveReelIndex((prev) => (prev !== null && prev < reels.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        setActiveReelIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : reels.length - 1));
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeReelIndex, reels.length]);

  // Handle Play/Pause in modal
  useEffect(() => {
    if (!videoModalRef.current) return;
    if (isPlaying) {
      videoModalRef.current.play().catch(() => {});
    } else {
      videoModalRef.current.pause();
    }
  }, [isPlaying, activeReelIndex]);

  const handleToggleLike = (reelId: string, initialLikes: number) => {
    const isLiked = likedMap[reelId];
    setLikedMap((prev) => ({ ...prev, [reelId]: !isLiked }));
    setLikeCountMap((prev) => ({
      ...prev,
      [reelId]: (prev[reelId] ?? initialLikes) + (isLiked ? -1 : 1),
    }));
  };

  const handleShare = (reel: VideoReelItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `#reel-${reel.id}`);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  const handleAddTaggedProduct = (reel: VideoReelItem) => {
    cart.addItem({
      variantId: 9999 + parseInt(reel.id.replace(/\D/g, "") || "1", 10),
      title: `${reel.taggedProduct.name} (${reel.taggedProduct.packSize})`,
      price: reel.taggedProduct.price,
      quantity: 1,
      imageUrl: reel.taggedProduct.imageUrl,
    });
    setAddedProductToast(true);
    setTimeout(() => setAddedProductToast(false), 2000);
  };

  return (
    <section id="video-reviews" aria-labelledby="reels-section-heading" className="py-14 sm:py-20 bg-canvas/70 dark:bg-black/30 border-t border-line-soft scroll-mt-20">
      <Container>
        {/* Section Header */}
        <Reveal y={20}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 dark:bg-red-950/30 border border-red-500/20 px-3.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 mb-3 shadow-2xs">
                <span className="size-2 rounded-full bg-red-600 animate-ping" />
                <span>VIDEO REELS & REVIEWS</span>
              </div>
              <h2 id="reels-section-heading" className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-ink dark:text-white">
                {title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-ink max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Carousel navigation controls */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Scroll video reels left"
                className="grid size-10 place-items-center rounded-full border border-line-soft bg-paper dark:bg-[#0c1e17] text-ink dark:text-white shadow-xs hover:border-[#0d5a43] hover:text-[#0d5a43] transition-all cursor-pointer"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Scroll video reels right"
                className="grid size-10 place-items-center rounded-full border border-line-soft bg-paper dark:bg-[#0c1e17] text-ink dark:text-white shadow-xs hover:border-[#0d5a43] hover:text-[#0d5a43] transition-all cursor-pointer"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </Reveal>

        {/* -------------------------------------------------------------- */}
        {/* HORIZONTAL REELS TRACK (9:16 Vertical Cards)                   */}
        {/* Supports cursor click-and-drag, touch swipe & arrow navigation */}
        {/* -------------------------------------------------------------- */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={cn(
            "flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-none",
            "touch-pan-x overscroll-x-contain -mx-4 px-4 sm:mx-0 sm:px-0 select-none",
            isDragging ? "cursor-grabbing snap-none" : "cursor-grab snap-x snap-mandatory"
          )}
        >
          {reels.map((reel, index) => {
            const isLiked = likedMap[reel.id];
            const currentLikes = likeCountMap[reel.id] ?? reel.likes;

            return (
              <div
                key={reel.id}
                id={`reel-${reel.id}`}
                onClick={(e) => {
                  if (hasMovedRef.current) {
                    e.preventDefault();
                    return;
                  }
                  setActiveReelIndex(index);
                  setIsPlaying(true);
                }}
                className="group relative flex-none w-[260px] sm:w-[280px] aspect-[9/16] rounded-3xl overflow-hidden border border-line-soft bg-black shadow-soft hover:shadow-lift transition-all duration-300 hover:-translate-y-1.5 cursor-pointer snap-start select-none"
              >
                {/* 9:16 Video Thumbnail Poster */}
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  draggable={false}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 pointer-events-none select-none"
                />

                {/* Dark Vignette Gradients for Text Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/60 pointer-events-none" />

                {/* Top Badge: Views & Rating */}
                <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between text-[11px] font-bold text-white z-10">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/15 shadow-2xs">
                    <Eye className="size-3 text-red-500 fill-current" />
                    <span>{reel.views}</span>
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-1 border border-white/15">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span>5.0</span>
                  </div>
                </div>

                {/* Central Play Button Overlay */}
                <div className="absolute inset-0 grid place-items-center z-10 pointer-events-none">
                  <span className="grid size-14 place-items-center rounded-full bg-white/25 text-white backdrop-blur-md border border-white/40 shadow-lift transition-all duration-300 group-hover:scale-115 group-hover:bg-[#0d5a43] group-hover:text-white">
                    <Play className="size-6 ml-0.5 fill-current" />
                  </span>
                </div>

                {/* Bottom Content: Creator Info, Title & Tagged Product */}
                <div className="absolute bottom-0 inset-x-0 p-4 z-10 text-white flex flex-col justify-end space-y-2.5">
                  {/* Creator */}
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full overflow-hidden border border-white/40 bg-white/20 shrink-0">
                      <img
                        src={reel.creatorAvatar || reel.thumbnailUrl}
                        alt={reel.creatorName}
                        draggable={false}
                        className="size-full object-cover pointer-events-none select-none"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                        <span>{reel.creatorName}</span>
                        <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                      </p>
                      <p className="text-[10px] text-white/70 truncate">{reel.creatorRole}</p>
                    </div>
                  </div>

                  {/* Reel Caption */}
                  <p className="text-xs font-semibold text-white/95 line-clamp-2 leading-snug drop-shadow-xs">
                    {reel.title}
                  </p>

                  {/* Tagged Product Pill (with RED % OFF badge!) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasMovedRef.current) return;
                      handleAddTaggedProduct(reel);
                    }}
                    className="flex items-center justify-between gap-2 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 p-2 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={reel.taggedProduct.imageUrl}
                        alt={reel.taggedProduct.name}
                        draggable={false}
                        className="size-8 rounded-lg object-cover bg-white shrink-0 pointer-events-none select-none"
                      />
                      <div className="min-w-0 leading-tight">
                        <p className="text-[11px] font-bold text-white truncate">
                          {reel.taggedProduct.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-extrabold text-white">
                            ₹{reel.taggedProduct.price}
                          </span>
                          {reel.taggedProduct.discountPercent > 0 ? (
                            <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] font-black text-white">
                              {reel.taggedProduct.discountPercent}% OFF
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Add to cart"
                      className="grid size-7 place-items-center rounded-xl bg-[#0d5a43] text-white shadow-xs shrink-0 hover:scale-105 active:scale-95"
                    >
                      <ShoppingBag className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>

      {/* ------------------------------------------------------------------ */}
      {/* FULL-SCREEN VERTICAL REEL VIDEO PLAYER MODAL                       */}
      {/* ------------------------------------------------------------------ */}
      {activeReel !== null && activeReelIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setActiveReelIndex(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setActiveReelIndex(null)}
            aria-label="Close video reel"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 grid size-11 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md cursor-pointer shadow-float transition-transform hover:scale-110"
          >
            <X className="size-6" />
          </button>

          {/* Up & Down Carousel Stepper Buttons (desktop) */}
          <div className="hidden md:flex flex-col gap-3 absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 z-50">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveReelIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : reels.length - 1));
              }}
              aria-label="Previous reel"
              className="grid size-11 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md cursor-pointer transition-transform hover:scale-110"
            >
              <ChevronUp className="size-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveReelIndex((prev) => (prev !== null && prev < reels.length - 1 ? prev + 1 : 0));
              }}
              aria-label="Next reel"
              className="grid size-11 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md cursor-pointer transition-transform hover:scale-110"
            >
              <ChevronDown className="size-6" />
            </button>
          </div>

          {/* Reel Container (Strict 9:16 Vertical Smartphone Ratio) */}
          <div
            className="relative h-[92vh] max-h-[820px] aspect-[9/16] w-auto max-w-[95vw] rounded-3xl overflow-hidden bg-black shadow-lift border border-white/10 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HTML5 Video Element */}
            <video
              ref={videoModalRef}
              src={activeReel.videoUrl}
              poster={activeReel.thumbnailUrl}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              onClick={() => setIsPlaying((p) => !p)}
              className="absolute inset-0 size-full object-cover cursor-pointer"
            />

            {/* Gradient Overlay for Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/60 pointer-events-none" />

            {/* Top Bar inside Player */}
            <div className="relative z-20 flex items-center justify-between p-4 text-white">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  DocHomoeo Reel
                </span>
                <span className="text-xs font-semibold text-white/80">{activeReel.duration}</span>
              </div>

              {/* Sound & Play Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  className="grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 cursor-pointer"
                >
                  {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Right Action Icons (Like, Share, Views) */}
            <div className="absolute right-3.5 bottom-28 z-20 flex flex-col items-center gap-4 text-white">
              {/* Like Button */}
              <button
                type="button"
                onClick={() => handleToggleLike(activeReel.id, activeReel.likes)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div
                  className={cn(
                    "grid size-11 place-items-center rounded-full backdrop-blur-md transition-all duration-200 group-hover:scale-110",
                    likedMap[activeReel.id]
                      ? "bg-red-600 text-white"
                      : "bg-black/50 text-white hover:bg-black/70"
                  )}
                >
                  <Heart className={cn("size-5", likedMap[activeReel.id] && "fill-current")} />
                </div>
                <span className="text-[11px] font-bold">
                  {likeCountMap[activeReel.id] ?? activeReel.likes}
                </span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={() => handleShare(activeReel)}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="grid size-11 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-all duration-200 group-hover:scale-110">
                  <Share2 className="size-5" />
                </div>
                <span className="text-[11px] font-bold">Share</span>
              </button>

              {/* Views */}
              <div className="flex flex-col items-center gap-1">
                <div className="grid size-11 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md">
                  <Eye className="size-5" />
                </div>
                <span className="text-[11px] font-bold">{activeReel.views}</span>
              </div>
            </div>

            {/* Bottom Section: Creator Info, Full Story & Tagged Product Card */}
            <div className="relative z-20 p-4 sm:p-5 pr-16 space-y-3 text-white">
              {/* Creator details */}
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full overflow-hidden border-2 border-[#0d5a43] bg-white shrink-0">
                  <img
                    src={activeReel.creatorAvatar || activeReel.thumbnailUrl}
                    alt={activeReel.creatorName}
                    className="size-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                    <span>{activeReel.creatorName}</span>
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                  </p>
                  <p className="text-[11px] text-white/75 truncate">{activeReel.creatorRole}</p>
                </div>
              </div>

              {/* Reel Story / Review Body */}
              <p className="text-xs text-white/90 leading-relaxed max-h-20 overflow-y-auto pr-2 scrollbar-none">
                {activeReel.story}
              </p>

              {/* Tagged Product Box inside Modal */}
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 p-2.5 shadow-lg">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={activeReel.taggedProduct.imageUrl}
                    alt={activeReel.taggedProduct.name}
                    className="size-11 rounded-xl object-cover bg-white shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {activeReel.taggedProduct.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-extrabold text-white">
                        ₹{activeReel.taggedProduct.price}
                      </span>
                      <span className="text-[11px] text-white/60 line-through">
                        ₹{activeReel.taggedProduct.mrp}
                      </span>
                      <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] font-black text-white">
                        {activeReel.taggedProduct.discountPercent}% OFF
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAddTaggedProduct(activeReel)}
                    className="h-8 px-3 rounded-full bg-[#0d5a43] hover:bg-[#074231] active:scale-95 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="size-3.5" />
                    <span>Add</span>
                  </button>
                  <Link
                    href={`/product/${activeReel.taggedProduct.slug}`}
                    className="h-8 px-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Toast feedback */}
          {showShareToast ? (
            <div className="fixed bottom-8 z-50 rounded-full bg-black/90 text-white border border-white/20 px-5 py-2 text-xs font-bold shadow-lift animate-in fade-in slide-in-from-bottom-3 duration-200">
              Link copied to clipboard!
            </div>
          ) : null}

          {addedProductToast ? (
            <div className="fixed bottom-8 z-50 rounded-full bg-[#0d5a43] text-white px-5 py-2 text-xs font-bold shadow-lift animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              <span>Added to your Cart!</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
