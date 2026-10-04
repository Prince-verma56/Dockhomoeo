import Link from "next/link";
import { Headset, PackageCheck, ShieldCheck, Stethoscope, Truck } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { utilityMessages } from "@/data/mock/home";

const MESSAGE_ICONS = [Truck, ShieldCheck, Stethoscope] as const;

/**
 * The 40px utility strip above the header.
 *
 * On desktop the benefits sit left and the service links right. On mobile the
 * links are dropped and the benefits become a single swipeable row, which
 * keeps the strip to one line instead of wrapping into a block
 * (brain/21_RESPONSIVE_SPEC.md).
 */
export function UtilityBar() {
  return (
    <div className="relative z-50 h-10 bg-forest-deep text-cream">
      <Container width="wide" className="h-full">
        <div className="flex h-full items-center justify-between gap-6">
          <ul className="dh-no-scrollbar flex h-full min-w-0 flex-1 items-center gap-6 overflow-x-auto whitespace-nowrap">
            {utilityMessages.map((message, index) => {
              const Icon = MESSAGE_ICONS[index] ?? ShieldCheck;
              return (
                <li
                  key={message.id}
                  className="flex shrink-0 items-center gap-2 text-[0.75rem] text-cream/80"
                >
                  <Icon aria-hidden className="size-3.5" strokeWidth={1.6} />
                  {message.label}
                </li>
              );
            })}
          </ul>

          <nav aria-label="Service links" className="hidden shrink-0 lg:block">
            <ul className="flex items-center gap-6 text-[0.75rem]">
              <li>
                <Link
                  href="/inquiry"
                  className="flex items-center gap-2 text-cream/80 transition-colors hover:text-cream"
                >
                  <Headset aria-hidden className="size-3.5" strokeWidth={1.6} />
                  Help &amp; Support
                </Link>
              </li>
              <li>
                <Link
                  href="/user/orders"
                  className="flex items-center gap-2 text-cream/80 transition-colors hover:text-cream"
                >
                  <PackageCheck aria-hidden className="size-3.5" strokeWidth={1.6} />
                  Track Order
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </div>
  );
}
