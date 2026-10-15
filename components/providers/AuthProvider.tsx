"use client";

import React, { createContext, useContext, useCallback, useSyncExternalStore } from "react";
import { ApiUser, ApiAuthState, ApiSession } from "@/types/api/auth";
import { repositories } from "@/lib/repositories";

interface AuthContextType extends ApiAuthState {
  login: (session: ApiSession) => void;
  logout: () => Promise<void>;
  updateUser: (user: ApiUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "dochomoeo_session";

const LOADING: ApiAuthState = { isAuthenticated: false, user: null, status: "loading" };
const SIGNED_OUT: ApiAuthState = { isAuthenticated: false, user: null, status: "unauthenticated" };

/**
 * The local session, kept on this device while IAuthRepository is the local
 * mock (the API keeps its session in an HTTP-only cookie instead).
 *
 * Same pattern as favourites and the cart: an external store read through
 * useSyncExternalStore — "loading" on the server and during hydration, then
 * the browser copy — and kept in step across tabs.
 */
let snapshot: ApiAuthState | null = null;
const listeners = new Set<() => void>();

function readSession(): ApiAuthState {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return SIGNED_OUT;
    const session: ApiSession = JSON.parse(stored);
    if (new Date(session.expiresAt) > new Date()) {
      return { isAuthenticated: true, user: session.user, status: "authenticated" };
    }
  } catch {
    // Unreadable or unparseable: treated like an expired session.
  }
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Storage unavailable; nothing to clear.
  }
  return SIGNED_OUT;
}

function emit(next: ApiAuthState) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== AUTH_STORAGE_KEY) return;
  emit(readSession());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => (snapshot ??= readSession());
const getServerSnapshot = () => LOADING;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = useCallback((session: ApiSession) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Signed in for this visit without persistence.
    }
    emit({ isAuthenticated: true, user: session.user, status: "authenticated" });
  }, []);

  const logout = useCallback(async () => {
    try {
      await repositories.auth.logout();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {
        // Storage unavailable; the in-memory session is still cleared below.
      }
      emit(SIGNED_OUT);
    }
  }, []);

  const updateUser = useCallback((user: ApiUser) => {
    emit({ ...getSnapshot(), user });
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        session.user = user;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      }
    } catch {
      // The update holds for this visit even if it cannot be persisted.
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
