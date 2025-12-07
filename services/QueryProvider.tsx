import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';

// Create a client with default options
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Retry failed requests 2 times
            retry: 2,
            // Consider data stale after 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache data for 30 minutes
            gcTime: 30 * 60 * 1000,
            // Don't refetch on window focus in mobile app
            refetchOnWindowFocus: false,
        },
        mutations: {
            // Retry mutations once on failure
            retry: 1,
        },
    },
});

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

export { queryClient };
