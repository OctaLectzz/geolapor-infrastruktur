import type { ReactNode } from 'react'

import { getTranslations } from 'next-intl/server'

import { AppLogo } from '@/components/shared/app-logo'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'
import { getRoleRedirectPath } from '@/features/auth/utils/role-redirect'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

interface PublicLayoutProps {
  children: ReactNode
}

export async function PublicLayout({ children }: PublicLayoutProps): Promise<ReactNode> {
  const t = await getTranslations('common.navigation')

  let dashboardPath: string | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const profile = await prisma.userProfile.findUnique({
        where: { supabaseUserId: user.id }
      })

      if (profile) {
        dashboardPath = getRoleRedirectPath(profile.role)
      }
    }
  } catch (err) {
    console.error('Failed to resolve auth session in PublicLayout:', err)
  }

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="bg-background/90 supports-backdrop-filter:bg-background/70 sticky top-0 border-b backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label={t('home')}>
            <AppLogo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label={t('publicNavigation')}>
            <Button variant="ghost" asChild>
              <Link href="/">{t('home')}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/map">{t('map')}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/help">{t('help')}</Link>
            </Button>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            {dashboardPath ? (
              <Button size="sm" asChild variant="outline">
                <Link href={dashboardPath}>{t('dashboard')}</Link>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href="/login">{t('login')}</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  )
}
