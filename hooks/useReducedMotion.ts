"use client";

import { useCallback, useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Reactive `prefers-reduced-motion` state, for components that need to change
 * what they *do* rather than only how they animate — for example whether a
 * programmatic scroll is smooth or instant.
 *
 * The media query is an external store, so it is read with
 * `useSyncExternalStore`: correct on the first client render, no state mirrored
 * out of an effect, and a server snapshot of `false` that matches the
 * motion-enabled markup the server produces.
 *
 * Animation setup code should call `prefersReducedMotion()` from
 * lib/animation/motion instead, which reads the value synchronously outside of
 * React's render cycle.
 */
export function useReducedMotion(): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const query = window.matchMedia(QUERY);
    query.addEventListener("change", onStoreChange);
    return () => query.removeEventListener("change", onStoreChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
