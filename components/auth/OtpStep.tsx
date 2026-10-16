"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormNotice, TextField } from "@/components/shared/FormField";
import { isOtp } from "@/lib/auth/navigation";
import { describeError } from "@/lib/api";

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
 * Entering a one-time code: the code field, verify, resend after a short
 * wait, and going back to change the number. Codes last 10 minutes and allow
 * 5 wrong tries (otp-auth.routes.ts); the backend's own messages say which.
 */
export function OtpStep({ phone, email, testMode: initialTestMode, submitLabel, onVerify, onResend, onBack }: OtpStepProps) {
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
      setError(describeError(err, "We could not check that code. Please try again."));
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
      setNotice("A new code is on its way. The earlier one no longer works.");
      inputRef.current?.focus();
    } catch (err) {
      setError(describeError(err, "We could not send a new code. Please try again."));
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  return (
    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 motion-safe:duration-300">
      <button
        type="button"
        onClick={onBack}
        disabled={busy !== null}
        className="mb-6 inline-flex items-center gap-2 rounded-md text-sm font-medium text-muted-ink transition-colors hover:text-forest focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none disabled:opacity-50"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Change number
      </button>

      <div className="mb-8">
        <h1 className="font-display text-[2rem] leading-tight text-ink sm:text-4xl">Enter your code</h1>
        <p className="mt-2 text-[0.9375rem] text-muted-ink">
          We sent a code to <strong className="font-semibold text-ink">+91 {phone}</strong>
          {email ? (
            <>
              {" "}and <strong className="font-semibold text-ink break-all">{email}</strong>
            </>
          ) : null}
          . It works for 10 minutes.
        </p>
      </div>

      {testMode ? (
        <FormNotice tone="info" className="mb-6">
          Development mode: the server is not sending messages. Use the test code set on the server.
        </FormNotice>
      ) : null}

      <form onSubmit={verify} noValidate className="space-y-6">
        <TextField
          ref={inputRef}
          id="otp"
          label="One-time code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit code"
          maxLength={6}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
            if (error) setError(null);
          }}
          disabled={busy !== null}
          error={error}
          className="font-mono text-lg tracking-[0.4em] placeholder:tracking-normal"
        />

        {notice ? <FormNotice tone="success">{notice}</FormNotice> : null}

        <Button type="submit" variant="brand" size="xl" className="w-full" disabled={busy !== null} aria-busy={busy === "verify"}>
          {busy === "verify" ? <Loader2 aria-hidden className="animate-spin" /> : null}
          {busy === "verify" ? "Checking…" : submitLabel}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-ink" aria-live="polite">
        Didn&rsquo;t get it?{" "}
        {wait > 0 ? (
          <span>Resend in {wait}s</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={busy !== null}
            className="rounded-md font-semibold text-forest underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none disabled:opacity-50"
          >
            {busy === "resend" ? "Sending…" : "Send a new code"}
          </button>
        )}
      </p>
    </div>
  );
}
