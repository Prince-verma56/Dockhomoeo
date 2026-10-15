"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export interface MotionAccordionItem {
  question: React.ReactNode;
  answer: React.ReactNode;
}

export interface MotionAccordionProps {
  items: MotionAccordionItem[];
  /** Gap between items, in pixels. @default 10 */
  gap?: number;
  /** Item open on first render; null for all closed. @default null */
  defaultOpenIndex?: number | null;
  className?: string;
}

const SPRING = { type: "spring", stiffness: 340, damping: 34, mass: 0.9 } as const;

/** A plus that turns into a minus: the vertical stroke folds away. */
function ToggleIcon({ open, instant }: { open: boolean; instant: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-300",
        open ? "border-forest bg-forest text-cream" : "border-line text-ink group-hover:border-forest/40 group-hover:text-forest",
      )}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <motion.path
          d="M6 1v10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={false}
          animate={{ scaleY: open ? 0 : 1, opacity: open ? 0 : 1 }}
          transition={instant ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
          style={{ originX: "50%", originY: "50%" }}
        />
      </svg>
    </span>
  );
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
  itemId,
  panelId,
}: {
  item: MotionAccordionItem;
  isOpen: boolean;
  onToggle: () => void;
  itemId: string;
  panelId: string;
}) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.25rem] border bg-paper transition-[border-color,box-shadow] duration-300",
        isOpen ? "border-forest/20 shadow-soft" : "border-line-soft hover:border-forest/25",
      )}
    >
      <h3>
        <button
          id={itemId}
          type="button"
          aria-controls={panelId}
          aria-expanded={isOpen}
          onClick={onToggle}
          className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
        >
          <span
            className={cn(
              "text-[1rem] leading-snug font-semibold tracking-tight transition-colors sm:text-[1.0625rem]",
              isOpen ? "text-forest-deep" : "text-ink",
            )}
          >
            {item.question}
          </span>
          <ToggleIcon open={isOpen} instant={reducedMotion} />
        </button>
      </h3>

      {/* Height animates to and from "auto": no measuring, so content can
          reflow (resize, font swap) while open. Closed panels are inert, so
          links inside an answer are not tab stops while hidden. */}
      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={itemId}
        inert={!isOpen}
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={reducedMotion ? { duration: 0 } : { height: SPRING, opacity: { duration: 0.2, ease: "easeOut" } }}
        className="overflow-hidden"
      >
        <motion.div
          initial={false}
          animate={{ y: isOpen ? 0 : -6 }}
          transition={reducedMotion ? { duration: 0 } : SPRING}
          className="dh-body max-w-[62ch] px-5 pb-5 sm:px-6 sm:pb-6 [&_a]:font-semibold [&_a]:text-forest [&_a]:underline-offset-4 hover:[&_a]:underline"
        >
          {item.answer}
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Questions and answers, one open at a time. Each question is a heading
 * holding its toggle button (WAI-ARIA accordion pattern); answers expand on a
 * spring and are inert while closed. Reduced motion opens them instantly.
 */
export function MotionAccordion({ items, gap = 10, defaultOpenIndex = null, className }: MotionAccordionProps) {
  const baseId = `accordion-${React.useId().replace(/:/g, "")}`;
  const [openIndex, setOpenIndex] = React.useState<number | null>(defaultOpenIndex);

  return (
    <div className={cn("flex w-full flex-col", className)} style={{ gap }}>
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          item={item}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex((prev) => (prev === i ? null : i))}
          itemId={`${baseId}-trigger-${i}`}
          panelId={`${baseId}-panel-${i}`}
        />
      ))}
    </div>
  );
}
