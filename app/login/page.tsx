"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthHeading, AuthShell } from "@/components/auth/AuthShell";
import { OtpStep } from "@/components/auth/OtpStep";
import { FormNotice, TextField } from "@/components/shared/FormField";
import { useAuth } from "@/components/providers/AuthProvider";
import { repositories } from "@/lib/repositories";
import { describeError } from "@/lib/api";
import { isMobile, normaliseMobile, safeCallbackUrl } from "@/lib/auth/navigation";
import { cn } from "@/lib/utils";

type Mode = "code" | "password";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));
  const expired = params.get("reason") === "expired";
  const auth = useAuth();

  const [mode, setMode] = useState<Mode>("code");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ phone?: string; identifier?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  // Already signed in (or just signed in): go where they were heading.
  useEffect(() => {
    if (auth.status === "authenticated") router.replace(callbackUrl);
  }, [auth.status, callbackUrl, router]);

  // The effect above then leaves for callbackUrl.
  const finish = (user: Parameters<typeof auth.login>[0]) => auth.login(user);

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busyRef.current) return;
    const number = normaliseMobile(phone);
    if (!isMobile(number)) {
      setErrors({ phone: "Enter a 10-digit Indian mobile number." });
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setErrors({});
    try {
      const result = await repositories.auth.requestOtp(number);
      setPhone(number);
      setTestMode(result.testMode);
      setStep("otp");
    } catch (err) {
      setErrors({ form: describeError(err, "We could not send a code. Please try again.") });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const signInWithPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busyRef.current) return;
    const next: typeof errors = {};
    if (identifier.trim().length < 3) next.identifier = "Enter your mobile number or email.";
    if (!password) next.password = "Enter your password.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setErrors({});
    try {
      finish(await repositories.auth.passwordLogin(identifier.trim(), password));
    } catch (err) {
      setPassword("");
      setErrors({ form: describeError(err, "We could not sign you in. Please try again.") });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  if (auth.status !== "unauthenticated") {
    return <RedirectingNotice label={auth.status === "loading" ? "Loading…" : "Signing you in…"} />;
  }

  const registerHref = `/register${callbackUrl !== "/account" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`;

  if (step === "otp") {
    return (
      <AuthShell>
        <OtpStep
          phone={phone}
          testMode={testMode}
          submitLabel="Verify and sign in"
          onVerify={async (code) => finish(await repositories.auth.verifyOtp(phone, code))}
          onResend={async () => (await repositories.auth.requestOtp(phone)).testMode}
          onBack={() => setStep("phone")}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      footer={
        <>
          New to DocHomoeo?{" "}
          <Link href={registerHref} className="font-semibold text-forest underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <AuthHeading title="Welcome back">Sign in to see your orders, addresses and prescriptions.</AuthHeading>

      {expired ? (
        <FormNotice tone="info" className="mb-6">
          Your session has ended. Please sign in again.
        </FormNotice>
      ) : null}

      <div role="tablist" aria-label="How to sign in" className="mb-7 grid grid-cols-2 gap-1 rounded-xl bg-cream-sunk p-1">
        {(
          [
            ["code", "Mobile code"],
            ["password", "Password"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            id={`login-tab-${value}`}
            aria-selected={mode === value}
            aria-controls={`login-panel-${value}`}
            onClick={() => {
              setMode(value);
              setErrors({});
            }}
            className={cn(
              "h-10 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:outline-none",
              mode === value ? "bg-paper text-ink shadow-xs" : "text-muted-ink hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {errors.form ? (
        <FormNotice tone="error" className="mb-6">
          {errors.form}
        </FormNotice>
      ) : null}

      {mode === "code" ? (
        <form
          id="login-panel-code"
          role="tabpanel"
          aria-labelledby="login-tab-code"
          onSubmit={requestCode}
          noValidate
          className="space-y-6"
        >
          <TextField
            id="phone"
            label="Mobile number"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="98765 43210"
            prefix="+91"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({});
            }}
            disabled={busy}
            error={errors.phone}
            hint="We’ll text you a one-time code. New here? This creates your account."
          />
          <Button type="submit" variant="brand" size="xl" className="w-full" disabled={busy} aria-busy={busy}>
            {busy ? <Loader2 aria-hidden className="animate-spin" /> : null}
            {busy ? "Sending code…" : "Send code"}
            {busy ? null : <ArrowRight aria-hidden />}
          </Button>
        </form>
      ) : (
        <form
          id="login-panel-password"
          role="tabpanel"
          aria-labelledby="login-tab-password"
          onSubmit={signInWithPassword}
          noValidate
          className="space-y-5"
        >
          <TextField
            id="identifier"
            label="Mobile number or email"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={busy}
            error={errors.identifier}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            error={errors.password}
            hint={
              <>
                Forgot it? Sign in with a{" "}
                <button type="button" className="font-medium text-forest underline-offset-4 hover:underline" onClick={() => setMode("code")}>
                  mobile code
                </button>
                , then set a new one in your profile.
              </>
            }
          />
          <Button type="submit" variant="brand" size="xl" className="w-full" disabled={busy} aria-busy={busy}>
            {busy ? <Loader2 aria-hidden className="animate-spin" /> : null}
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

function RedirectingNotice({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-dvh items-center justify-center bg-canvas">
      <Loader2 aria-hidden className="size-7 animate-spin text-forest" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<RedirectingNotice />}>
      <LoginContent />
    </Suspense>
  );
}
