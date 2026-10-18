import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/shared/Container";
import { Wordmark } from "@/components/navigation/Wordmark";
import { Reveal } from "@/components/shared/Reveal";
import { Link000 } from "@/components/ui/skiper-ui/skiper40";
import { BellButton } from "@/components/kokonutui/bell-button";
import {
  FacebookMark,
  InstagramMark,
  XMark,
  YoutubeMark,
} from "@/components/shared/SocialIcons";
import { PaymentMethodsRow } from "@/components/shared/PaymentBadges";

const footerGroups = [
  {
    id: "shop",
    label: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "Brands", href: "/brands" },
      { label: "Categories", href: "/categories" },
      { label: "Health Insights", href: "/insights" },
    ],
  },
  {
    id: "care",
    label: "Care",
    links: [
      { label: "Find a Doctor", href: "/doctors" },
      { label: "My Prescriptions", href: "/account/prescriptions" },
    ],
  },
  {
    id: "about",
    label: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Quality Standards", href: "/quality" },
    ],
  },
  {
    id: "support",
    label: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Track Order", href: "/account/orders" },
    ],
  },
];

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookMark },
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramMark },
  { label: "YouTube", href: "https://youtube.com", Icon: YoutubeMark },
  { label: "X", href: "https://x.com", Icon: XMark },
] as const;

const FOCUS_RING =
  "focus-visible:ring-2 focus-visible:ring-cream/60 focus-visible:outline-none";

/**
 * The footer: dense information architecture, visually calm.
 *
 * Desktop lays brand, link groups and newsletter out in one row; tablet puts
 * brand beside the newsletter with the link columns beneath. Below `md` the
 * same groups become an accordion so the footer stays scannable instead of
 * running to four screens of links (brain/21_RESPONSIVE_SPEC.md). Every
 * treatment renders the same link source, so there is no duplicated list to
 * drift. Copyright, build credit and tagline share a single closing bar.
 */
export function SiteFooter() {
  return (
    // The top hairline separates the footer from pages that end on a dark section.
    <footer className="border-t border-white/10 bg-forest-abyss text-cream">
      <Container width="wide" className="pt-12 pb-7 md:pt-14 md:pb-8">
        <Reveal y={18}>
          <div className="grid gap-10 md:grid-cols-2 md:gap-x-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)_minmax(0,1.2fr)] lg:gap-x-14">
          {/* --------------------------------------------------- brand area */}
          <div>
            <Wordmark tone="dark" />

            <p className="mt-4 max-w-[36ch] text-[0.875rem] leading-relaxed text-cream/60">
              India&rsquo;s trusted platform for homoeopathic medicines and
              expert care — for a healthier, happier you.
            </p>

            <ul className="mt-6 flex items-center gap-2.5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`DocHomoeo on ${label}`}
                    className={`grid size-10 place-items-center rounded-full border border-white/12 text-cream/70 transition-colors duration-200 hover:border-white/30 hover:text-cream ${FOCUS_RING}`}
                  >
                    <Icon className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* --------------------------------------------------- link groups */}
          <nav
            aria-label="Footer"
            className="md:order-last md:col-span-2 lg:order-0 lg:col-span-1"
          >
            {/* Tablet and up: columns. */}
            <div className="hidden gap-8 md:grid md:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4">
              {footerGroups.map((group) => (
                <div key={group.id}>
                  <h2 className="dh-eyebrow text-cream/50">{group.label}</h2>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link000
                          href={link.href}
                          tone="cream"
                          className={`w-fit rounded-sm text-[0.875rem] ${FOCUS_RING}`}
                        >
                          {link.label}
                        </Link000>
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
                  <AccordionTrigger className="py-3.5 text-[0.9375rem] text-cream hover:no-underline">
                    {group.label}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col gap-3 pb-3">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <Link000
                            href={link.href}
                            tone="cream"
                            className="w-fit text-[0.875rem]"
                          >
                            {link.label}
                          </Link000>
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
            <p className="mt-3 text-[0.875rem] leading-relaxed text-cream/60">
              Health tips, new arrivals and exclusive offers.
            </p>

            <div className="mt-3.5 mb-2">
              <BellButton
                tone="dark"
                count={4820}
                label="Join wellness alerts"
                subscribedLabel="Alerts active"
                className="text-xs h-9 px-3.5"
              />
            </div>

            <form className="mt-2 flex max-w-md items-center gap-2" suppressHydrationWarning>
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
                className="h-11 flex-1 rounded-xl border-white/15 bg-white/6 text-sm text-cream placeholder:text-cream/40"
                suppressHydrationWarning
              />
              <Button
                type="submit"
                size="icon-xl"
                aria-label="Subscribe to the newsletter"
                className="size-11 shrink-0 rounded-xl bg-cream text-forest-deep hover:bg-white"
              >
                <ArrowRight className="size-[18px]" strokeWidth={1.8} />
              </Button>
            </form>

            <div className="mt-6">
              <h3 className="dh-eyebrow text-cream/50">We accept</h3>
              <div className="mt-3">
                <PaymentMethodsRow />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

        {/* --------------------------------------------------- brand signature watermark */}
        <div
          aria-hidden="true"
          className="relative mt-8 sm:mt-12 md:mt-16 mb-2 sm:mb-4 w-full select-none pointer-events-none overflow-hidden text-center"
        >
          <span className="inline-block font-display font-black tracking-tight text-transparent bg-linear-to-b from-white/40 via-cream/24 to-white/[0.05] bg-clip-text text-[clamp(2.5rem,8.8vw,11.5rem)] leading-[0.95] whitespace-nowrap pr-8 sm:pr-12 md:pr-16 pl-3 sm:pl-4 py-2 sm:py-3 drop-shadow-[0_2px_16px_rgba(255,255,255,0.06)]">
            DOCHOMOEO
          </span>
        </div>

        {/* Closing bar: copyright left, build credit centred, tagline right on
            desktop; stacked and centred below lg, where three columns cramp. */}
        <div className="flex flex-col items-center gap-3 border-t border-white/10 pt-6 text-center text-xs text-cream/50 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6 lg:text-left">
          <p className="lg:justify-self-start">
            &copy; {new Date().getFullYear()} DocHomoeo. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5 text-[0.6875rem] tracking-[0.16em] uppercase lg:justify-self-center">
            <span>Made with</span>
            <span aria-hidden className="text-[0.8125rem] leading-none">&#128293;</span>
            <span className="sr-only">fire</span>
            <span>by</span>
            <a
              href="https://labs.theangaarbatch.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm text-cream/75 underline decoration-cream/25 decoration-from-font underline-offset-4 transition-colors duration-300 hover:text-cream hover:decoration-cream/60 focus-visible:ring-2 focus-visible:ring-cream/60 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-abyss focus-visible:outline-none"
            >
              The Angaar Labs
            </a>
          </p>

          <p className="lg:justify-self-end">Designed for a healthier tomorrow.</p>
        </div>
      </Container>
    </footer>
  );
}
