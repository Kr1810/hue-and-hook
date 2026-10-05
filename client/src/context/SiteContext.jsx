import { createContext, useContext, useMemo } from "react";
import { useFetch } from "../hooks/useFetch.js";
import { siteFallback } from "../config/site.js";

/**
 * Site-wide config from GET /api/site, merged over the local fallback so
 * the name/role render instantly and never go blank if the API is down.
 */
const SiteContext = createContext({ site: siteFallback, loading: true, error: null });

export function SiteProvider({ children }) {
  const { data, loading, error } = useFetch("/site");
  const value = useMemo(
    () => ({ site: { ...siteFallback, ...data }, loading, error }),
    [data, loading, error]
  );
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
