"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { Eyebrow } from "@/components/shared/Eyebrow";
import { MotionAccordion } from "@/components/unlumen-ui/primitives/motion-faqs-accordion";
import type { FaqGroup } from "@/data/faqs";

/**
 * "Common questions" on /contact: topics on the left (a tab list — arrow keys
 * move between topics), the topic's questions on the right. The first answer
 * starts open so the section reads as answers, not a wall of headings.
 */
export function ContactFaqs({ groups }: { groups: FaqGroup[] }) {
  const baseId = useId();
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(groups[0]?.id ?? "");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = Math.max(0, groups.findIndex((group) => group.id === activeId));
  const active = groups[activeIndex];
  if (!active) return null;

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = `${baseId}-panel`;

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const last = groups.length - 1;
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? activeIndex === last ? 0 : activeIndex + 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? activeIndex === 0 ? last : activeIndex - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setActiveId(groups[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section aria-labelledby={`${baseId}-heading`} className="dh-section">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
            <Eyebrow rule>Before you write</Eyebrow>
            <h2 id={`${baseId}-heading`} className="dh-title-section mt-3 text-ink">
              Common questions
            </h2>
            <p className="dh-body mt-3">Quick answers about delivery, orders and the remedies we stock.</p>

            <div
              role="tablist"
              aria-label="Question topics"
              aria-orientation="vertical"
              className="dh-no-scrollbar -mx-5 mt-7 flex gap-2 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0"
            >
              {groups.map((group, index) => {
                const selected = group.id === active.id;
                return (
                  <button
                    key={group.id}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    id={tabId(group.id)}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={panelId}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveId(group.id)}
                    onKeyDown={onTabKeyDown}
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center justify-between gap-3 rounded-full px-4 text-sm font-medium transition-colors lg:h-11 lg:rounded-xl",
                      selected ? "bg-forest-deep text-cream" : "border border-line-soft bg-paper text-ink hover:border-forest/30 hover:text-forest lg:border-transparent lg:bg-transparent lg:hover:bg-paper",
                    )}
                  >
                    {group.label}
                    <span className={cn("text-xs tabular-nums", selected ? "text-cream/70" : "text-muted-ink")}>
                      {group.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 hidden rounded-[1.25rem] bg-sage-wash p-5 lg:block">
              <p className="text-sm font-semibold text-ink">Still need help?</p>
              <a
                href="mailto:hello@dochomoeo.com"
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-forest-deep"
              >
                <Mail aria-hidden className="size-4" />
                hello@dochomoeo.com
              </a>
              <p className="dh-meta mt-1">We aim to respond within 24–48 hours.</p>
            </div>
          </div>

          <motion.div
            key={active.id}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId(active.id)}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8"
          >
            <MotionAccordion
              defaultOpenIndex={0}
              items={active.items.map((faq) => ({
                question: faq.question,
                answer: (
                  <>
                    <p>{faq.answer}</p>
                    {faq.link ? (
                      <Link href={faq.link.href} className="mt-3 inline-flex items-center gap-1.5 text-sm">
                        {faq.link.label}
                        <ArrowRight aria-hidden className="size-3.5" />
                      </Link>
                    ) : null}
                  </>
                ),
              }))}
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
