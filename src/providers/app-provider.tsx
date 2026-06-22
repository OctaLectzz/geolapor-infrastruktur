'use client'

import type { ReactNode } from 'react'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps): ReactNode {
  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange enableSystem>
        <TooltipProvider>
          {children}
          <Toaster closeButton richColors />
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
