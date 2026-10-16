import { useCallback, useEffect, useState } from "react";
import { describeError } from "@/lib/api";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

/**
 * Loads data for a client page and offers a retry. `load` should be stable
 * (a module function or a useCallback); `reload` shows the loading state again
 * (a retry); `refresh` re-reads quietly after a change the backend accepted.
 */
export function useAsyncData<T>(load: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    load().then(
      (data) => active && setState({ status: "ready", data }),
      (error: unknown) => active && setState({ status: "error", message: describeError(error, "We could not load this. Please try again.") }),
    );
    return () => {
      active = false;
    };
  }, [load, attempt]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  /**
   * Reads again without clearing what is on screen: for after a change the
   * backend has accepted. A failure leaves the current data showing.
   */
  const refresh = useCallback(async () => {
    try {
      const data = await load();
      setState({ status: "ready", data });
    } catch {
      // Keep what is shown; the next full load will report the problem.
    }
  }, [load]);

  return { state, reload, refresh };
}
