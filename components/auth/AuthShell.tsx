import { type ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Package, Stethoscope } from "lucide-react";
import { Wordmark } from "@/components/navigation/Wordmark";

const PROMISES = [
  { icon: Package, text: "Track every order and reorder in a tap" },
  { icon: Stethoscope, text: "Prescriptions from your consultations, in one place" },
  { icon: ShieldCheck, text: "Signed in securely with your mobile number" },
];

/**
 * The frame for /login and /register: the brand panel on wide screens, the
 * form on the right. On phones only the form shows, under the wordmark.
 */
export function AuthShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas lg:flex-row">
      <aside className="relative hidden w-full max-w-[34rem] flex-col justify-between overflow-hidden bg-forest-abyss p-12 text-cream lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-40 size-[28rem] rounded-full bg-forest/40 blur-3xl"
        />
        <Wordmark tone="dark" className="relative w-fit" />
        <div className="relative max-w-sm">
          <p className="font-display text-5xl leading-[1.05] text-cream">Heal naturally, with care you can trust.</p>
          <ul className="mt-10 space-y-4">
            {PROMISES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[0.9375rem] text-cream/75">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream/10 text-cream">
                  <Icon aria-hidden className="size-4" strokeWidth={1.7} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-cream/50">&copy; {new Date().getFullYear()} DocHomoeo</p>
      </aside>

      <main id="main" className="flex flex-1 flex-col px-4 py-8 sm:px-8 lg:items-center lg:justify-center lg:py-16">
        <div className="mx-auto w-full max-w-[26rem]">
          <div className="mb-10 block w-fit lg:hidden">
            <Wordmark tone="light" />
          </div>
          {children}
          {footer ? <div className="mt-8 border-t border-line/70 pt-6 text-sm text-muted-ink">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}

/** Heading and one line of context at the top of an auth step. */
export function AuthHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-[2rem] leading-tight text-ink sm:text-4xl">{title}</h1>
      {children ? <p className="mt-2 text-[0.9375rem] text-muted-ink">{children}</p> : null}
    </div>
  );
}
