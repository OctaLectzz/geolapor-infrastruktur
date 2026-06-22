import type { ReactNode } from 'react'

import { useTranslations } from 'next-intl'

import { AppLogo } from '@/components/shared/app-logo'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  actions?: ReactNode
  className?: string
}

export function AppHeader({ actions, className }: AppHeaderProps): ReactNode {
  const t = useTranslations('common.navigation')

  return (
    <header className={cn('bg-background/90 supports-backdrop-filter:bg-background/70 sticky top-0 z-40 border-b backdrop-blur', className)}>
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={t('home')}>
          <AppLogo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label={t('home')}>
          <Button variant="ghost" asChild>
            <Link href="/">{t('home')}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/map">{t('map')}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/reports">{t('reports')}</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {actions}
        </div>
      </div>
    </header>
  )
}
