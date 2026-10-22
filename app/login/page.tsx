"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { AuthHeading, AuthShell } from "@/components/auth/AuthShell";
import { OtpStep } from "@/components/auth/OtpStep";
import { FormNotice } from "@/components/shared/FormField";
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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{
    phone?: string;
    identifier?: string;
    password?: string;
    form?: string;
  }>({});
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  // Already signed in (or just signed in): go where they were heading.
  useEffect(() => {
    if (auth.status === "authenticated") router.replace(callbackUrl);
  }, [auth.status, callbackUrl, router]);

  const finish = (user: Parameters<typeof auth.login>[0]) => auth.login(user);

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busyRef.current) return;
    const number = normaliseMobile(phone);
    if (!isMobile(number)) {
      setErrors({ phone: "Enter a valid 10-digit Indian mobile number." });
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
      setErrors({
        form: describeError(err, "We could not send a code. Please try again."),
      });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const signInWithPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busyRef.current) return;
    const next: typeof errors = {};
    if (identifier.trim().length < 3)
      next.identifier = "Enter your mobile number or registered email.";
    if (!password) next.password = "Enter your account password.";
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
      setErrors({
        form: describeError(err, "Invalid credentials. Please verify and try again."),
      });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  if (auth.status !== "unauthenticated") {
    return (
      <RedirectingNotice
        label={auth.status === "loading" ? "Loading…" : "Signing you in…"}
      />
    );
  }

  const registerHref = `/register${
    callbackUrl !== "/account"
      ? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : ""
  }`;

  if (step === "otp") {
    return (
      <AuthShell>
        <OtpStep
          phone={phone}
          testMode={testMode}
          submitLabel="Verify and sign in"
          onVerify={async (code) =>
            finish(await repositories.auth.verifyOtp(phone, code))
          }
          onResend={async () => (await repositories.auth.requestOtp(phone)).testMode}
          onBack={() => setStep("phone")}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      footer={
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          New to DocHomoeo?{" "}
          <Link
            href={registerHref}
            className="font-bold text-[#0d5a43] dark:text-emerald-400 hover:underline"
          >
            Create an account
          </Link>
        </p>
      }
    >
      {/* Header (Inspired by Reference Images) */}
      <div className="mb-6 space-y-1 text-center lg:text-left">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Welcome back
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Login to access your account &amp; prescriptions.{" "}
          <Link
            href={registerHref}
            className="font-bold text-[#0d5a43] dark:text-emerald-400 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>

      {expired ? (
        <FormNotice tone="info" className="mb-5">
          Your session has ended. Please sign in again.
        </FormNotice>
      ) : null}


      {/* Segmented Mode Switcher */}
      <div
        role="tablist"
        aria-label="How to sign in"
        className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-neutral-100 dark:bg-white/5 p-1 border border-black/[0.04] dark:border-white/5"
      >
        <button
          type="button"
          role="tab"
          id="login-tab-code"
          aria-selected={mode === "code"}
          aria-controls="login-panel-code"
          onClick={() => {
            setMode("code");
            setErrors({});
          }}
          className={cn(
            "h-10 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
            mode === "code"
              ? "bg-white dark:bg-[#0c1e17] text-[#0d5a43] dark:text-emerald-300 shadow-xs font-bold border border-black/[0.04]"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          )}
        >
          <Smartphone className="size-3.5" />
          <span>Mobile OTP</span>
        </button>

        <button
          type="button"
          role="tab"
          id="login-tab-password"
          aria-selected={mode === "password"}
          aria-controls="login-panel-password"
          onClick={() => {
            setMode("password");
            setErrors({});
          }}
          className={cn(
            "h-10 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
            mode === "password"
              ? "bg-white dark:bg-[#0c1e17] text-[#0d5a43] dark:text-emerald-300 shadow-xs font-bold border border-black/[0.04]"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          )}
        >
          <KeyRound className="size-3.5" />
          <span>Password</span>
        </button>
      </div>

      {errors.form ? (
        <div className="mb-5 space-y-2">
          <FormNotice tone="error">
            {errors.form}
          </FormNotice>
          {errors.form.toLowerCase().includes("mobile otp") ? (
            <button
              type="button"
              onClick={() => {
                setMode("code");
                const digits = identifier.replace(/[\s+-]/g, "").replace(/^91(?=\d{10}$)/, "");
                if (/^[6-9]\d{9}$/.test(digits)) setPhone(digits);
                setErrors({});
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0d5a43] dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <Smartphone className="size-3.5" />
              <span>Switch to Mobile OTP sign-in</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {mode === "code" ? (
        /* ============================================================ */
        /* MODE: Mobile OTP Sign-in                                    */
        /* ============================================================ */
        <form
          id="login-panel-code"
          role="tabpanel"
          aria-labelledby="login-tab-code"
          onSubmit={requestCode}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400 select-none">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({});
                }}
                disabled={busy}
                className={cn(
                  "w-full h-12 pl-12 pr-4 rounded-2xl border text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-all",
                  errors.phone
                    ? "border-red-500/80 bg-red-50/20 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                    : "border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/5 focus:bg-white focus:border-[#0d5a43] focus:ring-4 focus:ring-[#0d5a43]/10"
                )}
              />
            </div>
            {errors.phone ? (
              <p className="text-[11.5px] text-red-600 dark:text-red-400 font-medium pt-0.5">
                {errors.phone}
              </p>
            ) : (
              <p className="text-[11px] text-neutral-400 leading-tight">
                We&apos;ll text you a 6-digit verification code. Fast &amp; passwordless sign-in.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 rounded-2xl bg-[#0d5a43] hover:bg-[#074231] active:scale-[0.99] text-white font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Sending code…</span>
              </>
            ) : (
              <>
                <span>Send Verification Code</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>

          {/* Divider & Alternate Switch */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100 dark:border-white/10" />
            </div>
            <span className="relative bg-white dark:bg-[#0c1e17] px-3 text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
              or
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMode("password")}
            className="w-full h-11 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/60 dark:bg-white/5 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound className="size-3.5 text-neutral-400" />
            <span>Sign in using Password (if created)</span>
          </button>
        </form>
      ) : (
        /* ============================================================ */
        /* MODE: Password Sign-in (Matching Dribbble Reference)        */
        /* ============================================================ */
        <form
          id="login-panel-password"
          role="tabpanel"
          aria-labelledby="login-tab-password"
          onSubmit={signInWithPassword}
          noValidate
          className="space-y-4"
        >
          {/* Helpful context for mobile OTP users */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50/70 dark:bg-white/5 p-3.5 text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-2.5">
            <span className="text-base select-none leading-none pt-0.5">💡</span>
            <div className="space-y-1">
              <p className="font-semibold text-neutral-900 dark:text-white text-xs">
                First time or signed up via Mobile OTP?
              </p>
              <p className="text-[11.5px] text-neutral-500 dark:text-neutral-400 leading-snug">
                You do not need a password. Switch to{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("code");
                    setErrors({});
                  }}
                  className="font-bold text-[#0d5a43] dark:text-emerald-400 underline hover:no-underline cursor-pointer"
                >
                  Mobile OTP
                </button>{" "}
                to sign in with an instant SMS code. You can set a password in your Profile anytime.
              </p>
            </div>
          </div>

          {/* Email / Mobile Identifier */}
          <div className="space-y-1.5">
            <label
              htmlFor="identifier"
              className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >
              Email or Mobile Number
            </label>
            <div className="relative">
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                placeholder="name@example.com or mobile"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) setErrors({});
                }}
                disabled={busy}
                className={cn(
                  "w-full h-12 pl-3.5 pr-10 rounded-2xl border text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-all",
                  errors.identifier
                    ? "border-red-500/80 bg-red-50/20 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                    : "border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/5 focus:bg-white focus:border-[#0d5a43] focus:ring-4 focus:ring-[#0d5a43]/10"
                )}
              />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
            </div>
            {errors.identifier ? (
              <p className="text-[11.5px] text-red-600 dark:text-red-400 font-medium pt-0.5">
                {errors.identifier}
              </p>
            ) : null}
          </div>

          {/* Password with Eye Toggle */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({});
                }}
                disabled={busy}
                className={cn(
                  "w-full h-12 pl-3.5 pr-11 rounded-2xl border text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-all",
                  errors.password
                    ? "border-red-500/80 bg-red-50/20 focus:ring-4 focus:ring-red-500/10 focus:border-red-500"
                    : "border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/5 focus:bg-white focus:border-[#0d5a43] focus:ring-4 focus:ring-[#0d5a43]/10"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="text-[11.5px] text-red-600 dark:text-red-400 font-medium pt-0.5">
                {errors.password}
              </p>
            ) : null}
          </div>

          {/* Remember Me & Forgot Password Row (Reference Image Feature) */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-600 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded-md border-neutral-300 dark:border-white/20 text-[#0d5a43] focus:ring-[#0d5a43]/20 accent-[#0d5a43] cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => setMode("code")}
              className="text-[#0d5a43] dark:text-emerald-400 hover:underline font-semibold"
            >
              Sign in with OTP?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 rounded-2xl bg-[#0d5a43] hover:bg-[#074231] active:scale-[0.99] text-white font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>Sign in to Account</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>

          {/* Divider & Alternate Switch */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100 dark:border-white/10" />
            </div>
            <span className="relative bg-white dark:bg-[#0c1e17] px-3 text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
              or
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMode("code")}
            className="w-full h-11 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/60 dark:bg-white/5 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Smartphone className="size-3.5 text-neutral-400" />
            <span>Sign in with One-Time Mobile Code</span>
          </button>
        </form>
      )}
    </AuthShell>
  );
}

function RedirectingNotice({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex min-h-screen items-center justify-center bg-[#f7f5f0] dark:bg-[#07130e]"
    >
      <Loader2 aria-hidden className="size-7 animate-spin text-[#0d5a43]" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<RedirectingNotice label="Loading sign-in options…" />}
    >
      <LoginContent />
    </Suspense>
  );
}
