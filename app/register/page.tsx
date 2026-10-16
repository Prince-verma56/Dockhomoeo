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
import { MIN_PASSWORD, isEmail, isMobile, normaliseMobile, safeCallbackUrl } from "@/lib/auth/navigation";
import type { ApiUser } from "@/types/api/auth";

type Details = { firstName: string; lastName: string; phone: string; email: string; password: string };
type Errors = Partial<Record<keyof Details | "form", string>>;

const EMPTY: Details = { firstName: "", lastName: "", phone: "", email: "", password: "" };

function validate(details: Details): Errors {
  const errors: Errors = {};
  if (!details.firstName.trim()) errors.firstName = "Enter your first name.";
  else if (details.firstName.trim().length > 80) errors.firstName = "Keep the name under 80 characters.";
  if (details.lastName.trim().length > 80) errors.lastName = "Keep the name under 80 characters.";
  if (!isMobile(normaliseMobile(details.phone))) errors.phone = "Enter a 10-digit Indian mobile number.";
  if (!isEmail(details.email)) errors.email = "Enter a valid email address.";
  if (details.password && details.password.length < MIN_PASSWORD) errors.password = `Use at least ${MIN_PASSWORD} characters.`;
  if (details.password.length > 100) errors.password = "Keep the password under 100 characters.";
  return errors;
}

/**
 * Creating an account (POST /api/auth/signup): mobile and email confirmed with
 * one code, then the name is saved to the profile and, if chosen, a password.
 * A number the shop already knows keeps its order history.
 */
function RegisterContent() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));
  const auth = useAuth();

  const [details, setDetails] = useState<Details>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState<"details" | "otp">("details");
  const [testMode, setTestMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  // Where to go once signed in; a profile that could not be saved sends them to finish it.
  const [destination, setDestination] = useState(callbackUrl);

  useEffect(() => {
    if (auth.status === "authenticated") router.replace(destination);
  }, [auth.status, destination, router]);

  const update = (field: keyof Details, value: string) => {
    setDetails((current) => ({ ...current, [field]: value }));
    if (errors[field] || errors.form) setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const phone = normaliseMobile(details.phone);
  const email = details.email.trim().toLowerCase();

  const sendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busyRef.current) return;
    const found = validate(details);
    if (Object.keys(found).length) {
      setErrors(found);
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setErrors({});
    try {
      const result = await repositories.auth.requestOtp(phone, { email });
      setTestMode(result.testMode);
      setStep("otp");
    } catch (err) {
      setErrors({ form: describeError(err, "We could not send a code. Please try again.") });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const verify = async (code: string) => {
    // Refusals here (wrong code, a doctor's number) are shown by OtpStep.
    const created = await repositories.auth.signUp({ phone, email, code });
    // The account exists and the cookie is set from here on: a later failure must not look like a wrong code.
    let user: ApiUser = created;
    try {
      user = await repositories.account.updateProfile({
        firstName: details.firstName,
        lastName: details.lastName,
        email,
        gender: created.gender ?? "",
        dateOfBirth: created.dateOfBirth ?? "",
      });
      if (details.password) {
        await repositories.auth.setPassword(details.password);
        user = { ...user, hasPassword: true };
      }
    } catch {
      setDestination("/account/profile?incomplete=1");
    }
    auth.login(user);
  };

  if (auth.status !== "unauthenticated") {
    return (
      <div role="status" className="flex min-h-dvh items-center justify-center bg-canvas">
        <Loader2 aria-hidden className="size-7 animate-spin text-forest" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <AuthShell>
        <OtpStep
          phone={phone}
          email={email}
          testMode={testMode}
          submitLabel="Verify and create account"
          onVerify={verify}
          onResend={async () => (await repositories.auth.requestOtp(phone, { email })).testMode}
          onBack={() => setStep("details")}
        />
      </AuthShell>
    );
  }

  const loginHref = `/login${callbackUrl !== "/account" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`;

  return (
    <AuthShell
      footer={
        <>
          Already have an account?{" "}
          <Link href={loginHref} className="font-semibold text-forest underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <AuthHeading title="Create your account">One code confirms your mobile number and email.</AuthHeading>

      {errors.form ? (
        <FormNotice tone="error" className="mb-6">
          {errors.form}
        </FormNotice>
      ) : null}

      <form onSubmit={sendCode} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="firstName"
            label="First name"
            autoComplete="given-name"
            value={details.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            disabled={busy}
            error={errors.firstName}
          />
          <TextField
            id="lastName"
            label="Last name"
            optional
            autoComplete="family-name"
            value={details.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            disabled={busy}
            error={errors.lastName}
          />
        </div>
        <TextField
          id="phone"
          label="Mobile number"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="98765 43210"
          prefix="+91"
          value={details.phone}
          onChange={(e) => update("phone", e.target.value)}
          disabled={busy}
          error={errors.phone}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={details.email}
          onChange={(e) => update("email", e.target.value)}
          disabled={busy}
          error={errors.email}
          hint="For order updates and receipts."
        />
        <TextField
          id="password"
          label="Password"
          optional
          type="password"
          autoComplete="new-password"
          value={details.password}
          onChange={(e) => update("password", e.target.value)}
          disabled={busy}
          error={errors.password}
          hint={`At least ${MIN_PASSWORD} characters. Skip it to always sign in with a code.`}
        />
        <Button type="submit" variant="brand" size="xl" className="w-full" disabled={busy} aria-busy={busy}>
          {busy ? <Loader2 aria-hidden className="animate-spin" /> : null}
          {busy ? "Sending code…" : "Continue"}
          {busy ? null : <ArrowRight aria-hidden />}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div role="status" className="flex min-h-dvh items-center justify-center bg-canvas">
          <Loader2 aria-hidden className="size-7 animate-spin text-forest" />
          <span className="sr-only">Loading…</span>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
