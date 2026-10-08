"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ApiUser, ApiAuthState, ApiSession } from "@/types/api/auth";
import { repositories } from "@/lib/repositories";

interface AuthContextType extends ApiAuthState {
  login: (session: ApiSession) => void;
  logout: () => Promise<void>;
  updateUser: (user: ApiUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "dochomoeo_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ApiAuthState>({
    isAuthenticated: false,
    user: null,
    status: "loading",
  });

  // Load session from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const session: ApiSession = JSON.parse(stored);
          if (new Date(session.expiresAt) > new Date()) {
            setState({
              isAuthenticated: true,
              user: session.user,
              status: "authenticated",
            });
          } else {
            // Expired
            localStorage.removeItem(AUTH_STORAGE_KEY);
            setState({ isAuthenticated: false, user: null, status: "unauthenticated" });
          }
        } catch (e) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setState({ isAuthenticated: false, user: null, status: "unauthenticated" });
        }
      } else {
        setState({ isAuthenticated: false, user: null, status: "unauthenticated" });
      }
    }
  }, []);

  const login = useCallback((session: ApiSession) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }
    setState({
      isAuthenticated: true,
      user: session.user,
      status: "authenticated",
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await repositories.auth.logout();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      setState({
        isAuthenticated: false,
        user: null,
        status: "unauthenticated",
      });
    }
  }, []);

  const updateUser = useCallback((user: ApiUser) => {
    setState((prev) => ({ ...prev, user }));
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        session.user = user;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      }
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
