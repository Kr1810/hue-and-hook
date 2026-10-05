import { useCallback, useEffect, useState } from "react";
import { request } from "../lib/api.js";

/**
 * GET an API path and track { data, error, loading }.
 * - Cancels the request on unmount / path change (AbortController).
 * - Caches responses in memory so navigating back is instant. Pass
 *   { cache: false } for data that changes often.
 * - `reload()` refetches, bypassing the cache. `setData` allows optimistic updates.
 */
const cache = new Map();

export function useFetch(path, { cache: useCache = true } = {}) {
  const cached = useCache && path ? cache.get(path) : undefined;
  const [state, setState] = useState({
    data: cached,
    error: null,
    loading: cached === undefined && Boolean(path),
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!path) return undefined;

    const hit = useCache && nonce === 0 ? cache.get(path) : undefined;
    if (hit !== undefined) {
      setState({ data: hit, error: null, loading: false });
      return undefined;
    }

    const controller = new AbortController();
    setState((prev) => ({ data: prev.data, error: null, loading: true }));

    request(path, { signal: controller.signal })
      .then((data) => {
        if (useCache) cache.set(path, data);
        setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ data: undefined, error, loading: false });
      });

    return () => controller.abort();
  }, [path, useCache, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const setData = useCallback(
    (updater) =>
      setState((prev) => ({
        ...prev,
        data: typeof updater === "function" ? updater(prev.data) : updater,
      })),
    []
  );

  return { ...state, reload, setData };
}
