import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect on the client, useEffect on the server.
 *
 * Animation setup must run before paint so GSAP's "from" state never flashes,
 * but useLayoutEffect warns during SSR. Everything that uses this hook renders
 * its content visible by default, so skipping setup on the server is safe.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
