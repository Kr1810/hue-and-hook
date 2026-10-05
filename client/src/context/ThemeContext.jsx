import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_THEME, THEMES } from "../config/site.js";

/**
 * Active color theme. The inline script in index.html already set
 * <html data-theme> before React mounted, so we start from that value
 * (no flash). Changes are written to the attribute + localStorage.
 */
const STORAGE_KEY = "theme";
const isTheme = (id) => THEMES.some((t) => t.id === id);

const ThemeContext = createContext(null);

function readInitialTheme() {
  const current = document.documentElement.dataset.theme;
  return isTheme(current) ? current : DEFAULT_THEME;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme);

  const setTheme = useCallback((next) => {
    if (!isTheme(next)) return;
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage blocked (private mode etc.) — theme still works this visit */
    }
    setThemeState(next);
  }, []);

  // Keep the browser UI color (mobile address bar) in step.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    if (meta && bg) meta.setAttribute("content", bg);
  }, [theme]);

  // Sync between open tabs.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY && isTheme(event.newValue)) {
        document.documentElement.dataset.theme = event.newValue;
        setThemeState(event.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(() => ({ theme, setTheme, themes: THEMES }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
