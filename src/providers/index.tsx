'use client';

import { NuqsAdapter } from 'nuqs/adapters/next/app';
import React from 'react';

import { AuthProvider } from '@/features/auth';

import QueryProvider from './query-provider';
import ThemeProvider from './theme-provider';

export interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <NuqsAdapter>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </NuqsAdapter>
  );
}
