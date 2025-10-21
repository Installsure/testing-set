'use client';

import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <html lang="en">
      <head>
        <title>InstallSure v3.0 - BIM Integration Platform</title>
        <meta name="description" content="Industry-grade BIM visualization and construction plan management" />
        <script src="/shared/lib/universal-plan-viewer.js" defer></script>
        <script src="/plan-viewer-fix.js" defer></script>
        <script src="/test-all-fixes.js" defer></script>
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
