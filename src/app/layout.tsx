import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'

import { cn } from '@/lib/utils'
import { AppProvider } from '@/providers/app-provider'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Roostvasum',
  description: 'Platform pelaporan kerusakan infrastruktur berbasis geolokasi untuk warga, petugas, dan administrator.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>): React.ReactElement {
  return (
    <html lang="id" suppressHydrationWarning className={cn('h-full font-sans antialiased', geistSans.variable, geistMono.variable, inter.variable)}>
      <body className="flex min-h-full flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
