"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import { repositories } from "@/lib/repositories";
import { Wordmark } from "@/components/navigation/Wordmark";

function LoginContent() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await repositories.auth.requestOtp(phone);
      if (res.success) {
        setStep("OTP");
      } else {
        setError(res.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await repositories.auth.verifyOtp(phone, otp);
      if (res.success && res.session) {
        login(res.session);
        router.push(callbackUrl);
      } else {
        setError(res.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      {/* Visual / Branding Side */}
      <div className="hidden lg:flex w-full flex-1 flex-col justify-between bg-forest-abyss p-12 text-white/90">
        <Wordmark tone="dark" />
        <div className="max-w-md">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl text-cream">
            Heal Naturally
          </h1>
          <p className="mt-6 text-lg text-cream/70">
            Sign in to access your prescriptions, track orders, and connect with expert homoeopathic doctors.
          </p>
        </div>
        <p className="text-sm text-cream/50">
          &copy; {new Date().getFullYear()} DocHomoeo. All rights reserved.
        </p>
      </div>

      {/* Form Side */}
      <div className="flex w-full flex-1 flex-col items-center justify-center p-6 sm:p-12 lg:p-24 bg-[#f6f2ea]">
        <div className="lg:hidden w-full max-w-sm mb-12">
          <Wordmark tone="light" />
        </div>

        <div className="w-full max-w-sm">
          {step === "PHONE" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-display text-3xl font-bold text-ink">
                Welcome back
              </h2>
              <p className="mt-2 text-[0.9375rem] text-muted-ink">
                Enter your mobile number to sign in or create an account.
              </p>

              <form onSubmit={handlePhoneSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-ink">
                    Mobile Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className="h-12 rounded-xl bg-white text-base shadow-sm border-forest-abyss/10 focus-visible:ring-forest-deep"
                    required
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-forest-deep hover:bg-forest-abyss text-white shadow-md text-base"
                >
                  {loading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <>
                      Continue <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {step === "OTP" && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <button
                onClick={() => {
                  setStep("PHONE");
                  setOtp("");
                  setError(null);
                }}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-ink hover:text-forest-deep transition-colors"
              >
                <ArrowLeft className="size-4" />
                Change number
              </button>

              <h2 className="font-display text-3xl font-bold text-ink">
                Verify OTP
              </h2>
              <p className="mt-2 text-[0.9375rem] text-muted-ink">
                We've sent a code to <strong className="text-ink">{phone}</strong>
              </p>
              <p className="mt-1 text-xs text-muted-ink">
                (Demo: any code except "000000" will work)
              </p>

              <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium text-ink">
                    Verification Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={loading}
                    className="h-12 rounded-xl bg-white text-base shadow-sm border-forest-abyss/10 focus-visible:ring-forest-deep tracking-widest font-mono"
                    maxLength={6}
                    required
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-forest-deep hover:bg-forest-abyss text-white shadow-md text-base"
                >
                  {loading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm font-medium text-forest-deep hover:underline"
                    onClick={() => {
                      // Simulating resend
                      setOtp("");
                      setError("OTP resent successfully.");
                      setTimeout(() => setError(null), 3000);
                    }}
                  >
                    Resend code
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f6f2ea]">
        <Loader2 className="size-8 animate-spin text-forest-deep" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
