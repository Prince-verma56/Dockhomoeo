"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ApiAuthState, ApiUser } from "@/types/api/auth";
import { repositories } from "@/lib/repositories";
import { SESSION_EXPIRED_EVENT } from "@/lib/api";

interface AuthContextType extends ApiAuthState {
  /** After a successful sign-in: the backend has already set the cookie. */
  login: (user: ApiUser) => void;
  logout: () => Promise<void>;
  /** After a profile change, with the user the backend returned. */
  updateUser: (user: ApiUser) => void;
  /** Reads the session again (GET /api/auth/session). */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOADING: ApiAuthState = { isAuthenticated: false, user: null, status: "loading", reason: null };
const signedIn = (user: ApiUser): ApiAuthState => ({ isAuthenticated: true, user, status: "authenticated", reason: null });
const signedOut = (reason: ApiAuthState["reason"] = null): ApiAuthState => ({
  isAuthenticated: false,
  user: null,
  status: "unauthenticated",
  reason,
});

/** Tells the shop's other open tabs that the session changed, so they read it again. Carries no data. */
const CHANNEL = "dochomoeo-auth";

/**
 * The customer's session. The backend keeps it in an HTTP-only cookie
 * (`dh_user`, 7 days) that this code never sees; the only source of truth is
 * GET /api/auth/session. The state is "loading" on the server and until the
 * first answer, then follows the backend:
 *   - read again when the tab becomes visible and when another tab signs in or out;
 *   - signed out with reason "expired" when any /api/me request comes back 401.
 * Nothing about the session is written to localStorage.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ApiAuthState>(LOADING);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const announce = useCallback(() => {
    try {
      channelRef.current?.postMessage("changed");
    } catch {
      // Another tab will catch up when it is next focused.
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const user = await repositories.auth.getCurrentUser();
      setState((current) => {
        if (user) return signedIn(user);
        // A session that disappeared while this page thought it was signed in has expired.
        return signedOut(current.status === "authenticated" ? "expired" : current.reason);
      });
    } catch {
      // The backend could not be reached. Keep a known session as it is; otherwise stop waiting.
      setState((current) => (current.status === "loading" ? signedOut() : current));
    }
  }, []);

  useEffect(() => {
    // The first read happens once, after hydration; the server always renders "loading".
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the session is the external sync this effect exists for
    void refresh();

    const onVisible = () => {
      if (document.visibilityState === "visible" && stateRef.current.status !== "loading") void refresh();
    };
    const onExpired = () => {
      if (stateRef.current.status === "authenticated") setState(signedOut("expired"));
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = () => void refresh();
      channelRef.current = channel;
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
      channel?.close();
      channelRef.current = null;
    };
  }, [refresh]);

  const login = useCallback(
    (user: ApiUser) => {
      setState(signedIn(user));
      announce();
    },
    [announce],
  );

  const logout = useCallback(async () => {
    try {
      await repositories.auth.logout();
    } catch (e) {
      // The cookie may outlive a failed request; the page still signs out, and the next session read tells the truth.
      console.error("Logout request failed", e);
    } finally {
      setState(signedOut("logout"));
      announce();
    }
  }, [announce]);

  const updateUser = useCallback((user: ApiUser) => setState(signedIn(user)), []);

  const value = useMemo(
    () => ({ ...state, login, logout, updateUser, refresh }),
    [state, login, logout, updateUser, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/** First name, or the full name, or a friendly fallback, for greetings and menus. */
export function displayName(user: ApiUser | null): string {
  if (!user) return "";
  return user.firstName?.trim() || user.name?.trim() || "there";
}
