"use client";
import { useCallback, useEffect, useState } from "react";
import { toApiError } from "@/services/api";

interface State<T> {
  key: string;
  data?: T;
  error?: string;
}

/**
 * Runs an async loader whenever `deps` change. Previous data is kept while reloading,
 * so lists don't flash. `deps` must be serialisable (primitives / plain objects).
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<State<T>>({ key: "" });
  const key = `${JSON.stringify(deps)}:${tick}`;

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((data) => !cancelled && setState({ key, data }))
      .catch((err) => !cancelled && setState((s) => ({ key, data: s.data, error: toApiError(err).message })));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const setData = useCallback((updater: (prev: T | undefined) => T | undefined) => setState((s) => ({ ...s, data: updater(s.data) })), []);

  const loading = state.key !== key;
  return {
    data: state.data,
    error: !loading ? state.error : undefined,
    loading,
    /** True only before the very first response arrives */
    initialLoading: loading && state.data === undefined,
    reload,
    setData,
  };
}
