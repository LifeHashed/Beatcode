'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </NextThemesProvider>
    </SessionProvider>
  );
}
