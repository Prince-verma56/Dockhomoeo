"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(
    typeof process !== "undefined" && process.env.NODE_ENV !== "production"
      ? (process.env.NEXT_PUBLIC_DEV_LOGIN_EMAIL ?? "")
      : "",
  );
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your staff email and password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      // Cookie is automatically set by the backend through Next.js proxy
      router.replace("/admin");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to connect to the backend API. Please verify that port 4000 is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] flex flex-col justify-center items-center p-4 sm:p-6 select-none font-sans">
      <div className="max-w-md w-full bg-white border border-neutral-200/90 rounded-2xl shadow-sm p-8 sm:p-10">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="size-12 rounded-xl bg-[#0d5a43] flex items-center justify-center text-white font-bold text-lg mb-3 shadow-md">
            DH
          </div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Staff Administration</h1>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs">
            Sign in with authorized staff credentials to manage orders, catalog, doctors, and logistics.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Staff Email
            </label>
            <div className="relative">
              <Mail className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 text-sm bg-neutral-50/50 border-neutral-200 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11 text-sm bg-neutral-50/50 border-neutral-200 focus:bg-white"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#0d5a43] hover:bg-[#093e2e] text-white text-sm font-semibold rounded-xl shadow-sm transition-all mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Sign In to Admin</span>
                <ArrowRight className="size-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Security badge and storefront link */}
        <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>Secure 7-day HTTP-only session cookie (dh_session)</span>
          </div>
          <Link
            href="/"
            className="text-xs font-medium text-neutral-600 hover:text-[#0d5a43] transition-colors"
          >
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
