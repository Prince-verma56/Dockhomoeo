"use client";

import { useSyncExternalStore } from "react";

/**
 * Saved products, kept on this device.
 *
 * The shop API has no wishlist or favourites contract (checked in
 * docohomo-prince, read-only), so nothing is synced to an account. Only
 * product slugs are stored; the favourites page asks the catalogue for
 * current details, so a saved item never shows a stale price.
 *
 * Same pattern as the cart: an external store read through
 * useSyncExternalStore, empty on the server and until the browser copy is
 * read, and kept in step across tabs.
 */
const STORAGE_KEY = "dochomo_favourites";

type Snapshot = { slugs: string[]; hydrated: boolean };
const SERVER_SNAPSHOT: Snapshot = { slugs: [], hydrated: false };

let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? [...new Set(parsed.filter((s): s is string => typeof s === "string" && s.length > 0))] : [];
  } catch {
    return [];
  }
}

function commit(slugs: string[]) {
  snapshot = { slugs, hydrated: true };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Still works for this visit without persistence.
  }
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  snapshot = { slugs: read(), hydrated: true };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Snapshot {
  snapshot ??= { slugs: read(), hydrated: true };
  return snapshot;
}

const getServerSnapshot = () => SERVER_SNAPSHOT;

export const favouritesStore = {
  toggle(slug: string) {
    const slugs = getSnapshot().slugs;
    // Newest first, so the page lists what was saved most recently at the top.
    commit(slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [slug, ...slugs]);
  },
  remove(slugsToRemove: string[]) {
    if (slugsToRemove.length === 0) return;
    commit(getSnapshot().slugs.filter((s) => !slugsToRemove.includes(s)));
  },
};

export function useFavourites() {
  const { slugs, hydrated } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    slugs,
    hydrated,
    count: slugs.length,
    isFavourite: (slug: string) => slugs.includes(slug),
    toggle: favouritesStore.toggle,
  };
}
