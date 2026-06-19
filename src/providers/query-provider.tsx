'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps): ReactNode {
  const [queryClient] = useState(
    (): QueryClient =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60
          }
        }
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
