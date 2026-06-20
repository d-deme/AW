import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Ensure background fetches happen continuously on access
      gcTime: 1000 * 60 * 60 * 24, // Keep cached data in garbage collection for 24 hours
      retry: 2,
      refetchOnMount: 'always', // Make server fetches upon every mount or view navigation
      refetchOnWindowFocus: true, // Refresh when user focuses the tab
    },
  },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
