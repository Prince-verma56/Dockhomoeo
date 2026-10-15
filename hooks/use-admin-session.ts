"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { SessionStaffUser } from "@/types/admin";

interface AdminSessionState {
  user: SessionStaffUser | null;
  loading: boolean;
  error: string | null;
}

export function useAdminSession() {
  const router = useRouter();
  const [state, setState] = useState<AdminSessionState>({
    user: null,
    loading: true,
    error: null,
  });

  const checkSession = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api<{ user: SessionStaffUser }>("/auth/me");
      setState({ user: res.user, loading: false, error: null });
      return res.user;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Not authenticated";
      setState({ user: null, loading: false, error: message });
      return null;
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const signOut = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // Ignored
    } finally {
      setState({ user: null, loading: false, error: null });
      router.replace("/admin/login");
    }
  }, [router]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    refresh: checkSession,
    signOut,
  };
}
