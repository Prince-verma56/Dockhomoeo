"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { FormNotice } from "@/components/shared/FormField";
import { isOtp } from "@/lib/auth/navigation";
import { describeError } from "@/lib/api";
import { cn } from "@/lib/utils";

/** How long before "Resend" is offered again. The backend allows 8 requests per 15 minutes. */
const RESEND_SECONDS = 30;

type OtpStepProps = {
  phone: string;
  /** Where else the code went (sign-up sends it to the email too). */
  email?: string;
  /** The backend said it is in development mode and sends no messages. */
  testMode: boolean;
  submitLabel: string;
  /** Checks the code; throws ApiError on refusal. */
  onVerify: (code: string) => Promise<void>;
  /** Asks for a new code; resolves to the new testMode flag. Throws ApiError on refusal. */
  onResend: () => Promise<boolean>;
  onBack: () => void;
};

/**
 * Entering a one-time code: luxury healthtech OTP verification step with
 * centered letter-spaced input, auto-focus, countdown timer, and test-mode callout.
 */
export function OtpStep({
  phone,
  email,
  testMode: initialTestMode,
  submitLabel,
  onVerify,
  onResend,
  onBack,
}: OtpStepProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"verify" | "resend" | null>(null);
  const [testMode, setTestMode] = useState(initialTestMode);
  const [wait, setWait] = useState(RESEND_SECONDS);
  const busyRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busyRef.current) return;
    if (!isOtp(code)) {
      setError("Enter the code from the message: 4 to 6 digits.");
      inputRef.current?.focus();
      return;
    }
    busyRef.current = true;
    setBusy("verify");
    setError(null);
    setNotice(null);
    try {
      await onVerify(code);
    } catch (err) {
      setError(describeError(err, "We could not verify that code. Please try again."));
      inputRef.current?.select();
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  const resend = async () => {
    if (busyRef.current || wait > 0) return;
    busyRef.current = true;
    setBusy("resend");
    setError(null);
    setNotice(null);
    try {
      setTestMode(await onResend());
      setCode("");
      setWait(RESEND_SECONDS);
      setNotice("A new verification code has been dispatched.");
      inputRef.current?.focus();
    } catch (err) {
      setError(describeError(err, "We could not send a new code. Please try again."));
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <button
        type="button"
        onClick={onBack}
        disabled={busy !== null}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#0d5a43] dark:text-neutral-400 dark:hover:text-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
      >
        <ArrowLeft className="size-3.5" />
        <span>Change mobile number</span>
      </button>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-[#0d5a43] dark:text-emerald-300 mb-1">
          <ShieldCheck className="size-3" />
          <span>Encrypted Mobile Verification</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Enter verification code
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
          We sent a one-time code to{" "}
          <strong className="text-neutral-900 dark:text-white font-semibold">
            +91 {phone}
          </strong>
          {email ? (
            <>
              {" "}and <strong className="text-neutral-900 dark:text-white font-semibold">{email}</strong>
            </>
          ) : null}
          . Valid for 10 minutes.
        </p>
      </div>

      {testMode ? (
        <FormNotice tone="info">
          Development Mode: Live SMS disabled. Use the server test code (e.g. 123456).
        </FormNotice>
      ) : null}

      {error ? <FormNotice tone="error">{error}</FormNotice> : null}
      {notice ? <FormNotice tone="success">{notice}</FormNotice> : null}

      <form onSubmit={verify} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="otp"
            className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
          >
            One-Time Code
          </label>
          <input
            ref={inputRef}
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="······"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              if (error) setError(null);
            }}
            disabled={busy !== null}
            className={cn(
              "w-full h-14 rounded-2xl border text-center font-mono text-2xl font-bold tracking-[0.45em] transition-all",
              error
                ? "border-red-500 bg-red-50/20 focus:ring-4 focus:ring-red-500/10"
                : "border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/5 focus:bg-white focus:border-[#0d5a43] focus:ring-4 focus:ring-[#0d5a43]/10"
            )}
          />
        </div>

        <button
          type="submit"
          disabled={busy !== null || code.length < 4}
          className="w-full h-12 rounded-2xl bg-[#0d5a43] hover:bg-[#074231] active:scale-[0.99] text-white font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {busy === "verify" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Verifying code…</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              <span>{submitLabel}</span>
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
        Didn&apos;t receive the code?{" "}
        {wait > 0 ? (
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            Resend in {wait}s
          </span>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={busy !== null}
            className="font-bold text-[#0d5a43] dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
          >
            {busy === "resend" ? "Dispatching…" : "Send a new code"}
          </button>
        )}
      </div>
    </div>
  );
}
