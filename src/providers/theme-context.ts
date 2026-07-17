'use client';

import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const { theme, setTheme, resolvedTheme, themes } = useNextTheme();

  return {
    themeMode: theme,
    resolvedTheme: resolvedTheme || 'dark',
    setThemeMode: setTheme,
    modes: themes || ['system', 'light', 'dark'],
  };
}
