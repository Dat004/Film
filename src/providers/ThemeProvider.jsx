import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import ThemeContext from "../context/ThemeContext";
import { useLocalStorage } from "../hooks";
import configs from "../configs";

const THEME_MODES = ["system", "light", "dark"];

function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function normalizeMode(value) {
  return THEME_MODES.includes(value) ? value : "system";
}

function readStoredThemeMode(themeKey) {
  try {
    const raw = localStorage.getItem(themeKey);
    if (raw == null) return "system";
    return normalizeMode(JSON.parse(raw));
  } catch {
    return "system";
  }
}

function ThemeProvider({ children }) {
  const { keyConfig } = configs;
  const themeKey = keyConfig?.localStorageKey?.theme || "theme";
  const { setItem } = useLocalStorage();

  const [mode, setMode] = useState(() => readStoredThemeMode(themeKey));
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme());

  const resolvedTheme = mode === "system" ? systemTheme : mode;

  useEffect(() => {
    if (mode !== "system" || !window.matchMedia) return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setSystemTheme(e.matches ? "dark" : "light");

    onChange(mql);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [mode]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setThemeMode = (nextMode) => {
    const normalized = normalizeMode(nextMode);
    setMode(normalized);
    setItem(themeKey, normalized);
  };

  const value = useMemo(
    () => ({
      themeMode: mode,
      resolvedTheme,
      setThemeMode,
      modes: THEME_MODES,
    }),
    [mode, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;

