import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/shared/Container";
import { Wordmark } from "@/components/navigation/Wordmark";
import {
  FacebookMark,
  InstagramMark,
  XMark,
  YoutubeMark,
} from "@/components/shared/SocialIcons";
import { footerGroups, paymentMarks } from "@/data/mock/home";

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookMark },
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramMark },
  { label: "YouTube", href: "https://youtube.com", Icon: YoutubeMark },
  { label: "X", href: "https://x.com", Icon: XMark },
] as const;

/**
 * The footer: dense information architecture, visually calm.
 *
 * Desktop lays the link groups out as columns. Below `md` the same groups
 * become an accordion so the footer stays scannable instead of running to four
 * screens of links (brain/21_RESPONSIVE_SPEC.md). Both treatments render the
 * same markup source, so there is no duplicated link list to drift.
 */
export function SiteFooter() {
  return (
    <footer className="bg-forest-abyss text-cream">
      <Container width="wide" className="py-14 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)_minmax(0,1.1fr)] lg:gap-14">
          {/* --------------------------------------------------- brand area */}
          <div>
            <Wordmark tone="dark" />

            <p className="mt-5 max-w-[34ch] text-[0.875rem] leading-relaxed text-cream/60">
              India&rsquo;s trusted platform for homoeopathic medicines and
              expert care — for a healthier, happier you.
            </p>

            <ul className="mt-7 flex items-center gap-2.5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`DocHomeo on ${label}`}
                    className="grid size-10 place-items-center rounded-full border border-white/12 text-cream/70 transition-colors duration-200 hover:border-white/30 hover:text-cream"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* --------------------------------------------------- link groups */}
          <nav aria-label="Footer">
            {/* Desktop: columns. */}
            <div className="hidden gap-10 md:grid md:grid-cols-3">
              {footerGroups.map((group) => (
                <div key={group.id}>
                  <h2 className="dh-eyebrow text-cream/50">{group.title}</h2>
                  <ul className="mt-5 flex flex-col gap-3">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-[0.875rem] text-cream/70 transition-colors hover:text-cream"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Mobile: the same groups, collapsed. */}
            <Accordion
              type="multiple"
              className="border-t border-white/10 md:hidden"
            >
              {footerGroups.map((group) => (
                <AccordionItem
                  key={group.id}
                  value={group.id}
                  className="border-b border-white/10"
                >
                  <AccordionTrigger className="py-4 text-[0.9375rem] text-cream hover:no-underline">
                    {group.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col gap-3 pb-4">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="text-[0.875rem] text-cream/70 transition-colors hover:text-cream"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </nav>

          {/* ---------------------------------------------------- newsletter */}
          <div>
            <h2 className="dh-eyebrow text-cream/50">
              Subscribe to our newsletter
            </h2>
            <p className="mt-4 text-[0.875rem] leading-relaxed text-cream/60">
              Health tips, new arrivals and exclusive offers.
            </p>

            <form className="mt-5 flex items-center gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                className="h-12 flex-1 rounded-xl border-white/15 bg-white/6 text-sm text-cream placeholder:text-cream/40"
              />
              <Button
                type="submit"
                size="icon-xl"
                aria-label="Subscribe to the newsletter"
                className="size-12 shrink-0 rounded-xl bg-cream text-forest-deep hover:bg-white"
              >
                <ArrowRight className="size-[18px]" strokeWidth={1.8} />
              </Button>
            </form>

            <div className="mt-8">
              <h3 className="dh-eyebrow text-cream/50">We accept</h3>
              <ul className="mt-4 flex flex-wrap items-center gap-2">
                {paymentMarks.map((mark) => (
                  <li
                    key={mark}
                    className="rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-[0.6875rem] font-medium tracking-wide text-cream/70"
                  >
                    {mark}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-white/10" />

        {/* Build credit. Sits above the legal line, quiet enough that it reads
            as a signature rather than a second footer row. */}
        <p className="flex items-center justify-center gap-1.5 text-[0.6875rem] tracking-[0.18em] text-cream/35 uppercase">
          <span>Made with</span>
          <span aria-hidden className="text-[0.8125rem] leading-none">&#128293;</span>
          <span className="sr-only">fire</span>
          <span>by</span>
          <a
            href="https://labs.theangaarbatch.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm text-cream/60 underline decoration-cream/20 decoration-from-font underline-offset-4 transition-colors duration-300 hover:text-cream hover:decoration-cream/50 focus-visible:ring-2 focus-visible:ring-cream/60 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-abyss focus-visible:outline-none"
          >
            The Angaar Labs
          </a>
        </p>

        <div className="mt-8 flex flex-col gap-3 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} DocHomeo. All rights reserved.
          </p>
          <p>Designed for a healthier tomorrow.</p>
        </div>
      </Container>
    </footer>
  );
}
