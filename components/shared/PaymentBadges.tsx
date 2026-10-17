import { cn } from "@/lib/utils";

/**
 * Pixel-perfect, officially proportioned payment method logo badges
 * (Visa, Mastercard, American Express, UPI, RuPay)
 * Designed with generous viewBox margins so no logo edges are clipped.
 */

export function VisaBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-7.5 w-[52px] rounded-lg bg-white border border-white/20 flex items-center justify-center shadow-xs transition-transform hover:scale-105 shrink-0 px-1",
        className,
      )}
      title="Visa"
    >
      <svg
        viewBox="0 0 54 18"
        className="h-3.5 w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Visa"
      >
        <path
          d="M20.5 1.5L14.2 16.5H10L6.8 4.2C6.6 3.4 6.4 3.1 5.8 2.8C4.8 2.3 3.3 1.8 1.8 1.5L1.9 1.1H8.8C9.7 1.1 10.5 1.7 10.7 2.8L12.3 11.9L16.4 1.5H20.5ZM37.4 11.4C37.4 7.4 31.8 7.2 31.8 5.4C31.8 4.7 32.5 3.9 33.9 3.7C34.6 3.6 36.5 3.5 38.4 4.4L39.2 1.6C38.1 1.2 36.6 0.9 34.8 0.9C30.7 0.9 27.8 3.1 27.7 6.2C27.7 8.5 29.8 9.8 31.4 10.6C33 11.4 33.6 11.9 33.6 12.6C33.6 13.7 32.2 14.2 30.9 14.2C28.8 14.2 27.6 13.9 26.2 13.2L25.4 16.1C26.8 16.7 28.7 17 30.6 17C35 17 37.4 14.7 37.4 11.4ZM48.5 16.5H52.3L48.9 1.5H45.4C44.6 1.5 43.9 1.9 43.6 2.7L37.4 16.5H41.6L42.4 14.3H47.5L48.5 16.5ZM43.6 11.2L45.7 5.4L46.9 11.2H43.6ZM26.8 1.5L23.5 16.5H19.5L22.8 1.5H26.8Z"
          fill="#1A1F71"
        />
        <path
          d="M8.8 1.1H1.9L1.8 1.5C5.5 2.4 8.2 4.6 9.2 7.3L10.3 2.8C10.5 1.9 9.9 1.1 8.8 1.1Z"
          fill="#F7B600"
        />
      </svg>
    </div>
  );
}

export function MastercardBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-7.5 w-[52px] rounded-lg bg-white border border-white/20 flex items-center justify-center shadow-xs transition-transform hover:scale-105 shrink-0 px-1",
        className,
      )}
      title="Mastercard"
    >
      <svg
        viewBox="0 0 40 24"
        className="h-4.5 w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Mastercard"
      >
        <circle cx="14" cy="12" r="10" fill="#EB001B" />
        <circle cx="26" cy="12" r="10" fill="#F79E1B" fillOpacity="0.95" />
        <path
          d="M20 5.2C22 6.8 23.3 9.3 23.3 12C23.3 14.7 22 17.2 20 18.8C18 17.2 16.7 14.7 16.7 12C16.7 9.3 18 6.8 20 5.2Z"
          fill="#FF5F00"
        />
      </svg>
    </div>
  );
}

export function AmexBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-7.5 w-[52px] rounded-lg bg-[#006FCF] border border-white/20 flex items-center justify-center shadow-xs transition-transform hover:scale-105 shrink-0 px-1",
        className,
      )}
      title="American Express"
    >
      <span className="font-sans font-black text-[10px] tracking-wider text-white">
        AMEX
      </span>
    </div>
  );
}

export function UpiBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-7.5 w-[52px] rounded-lg bg-white border border-white/20 flex items-center justify-center shadow-xs transition-transform hover:scale-105 shrink-0 px-1",
        className,
      )}
      title="UPI - Unified Payments Interface"
    >
      <svg
        viewBox="0 0 42 18"
        className="h-3.5 w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="UPI"
      >
        {/* Left Green Arrow */}
        <path d="M4 1L12 9L4 17L7.5 9L4 1Z" fill="#097939" />
        {/* Right Orange Arrow */}
        <path d="M11 1L19 9L11 17L14.5 9L11 1Z" fill="#ED752E" />
        {/* UPI Text */}
        <text
          x="22"
          y="13"
          fill="#1C2B39"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="11"
          letterSpacing="-0.3"
        >
          UPI
        </text>
      </svg>
    </div>
  );
}

export function RuPayBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-7.5 w-[52px] rounded-lg bg-white border border-white/20 flex items-center justify-center shadow-xs transition-transform hover:scale-105 shrink-0 px-1",
        className,
      )}
      title="RuPay"
    >
      <span className="font-sans font-black text-[10px] italic tracking-tight text-[#004C8F]">
        Ru<span className="text-[#F37021]">Pay</span>
      </span>
    </div>
  );
}

export function PaymentMethodsRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <VisaBadge />
      <MastercardBadge />
      <AmexBadge />
      <UpiBadge />
      <RuPayBadge />
    </div>
  );
}
