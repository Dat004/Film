'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import React from 'react';

export interface ThemeProviderProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
