import type { ReactNode } from 'react'

import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

interface AppLogoProps {
  showTagline?: boolean
  className?: string
}

export function AppLogo({ showTagline = false, className }: AppLogoProps): ReactNode {
  const t = useTranslations('common.app')

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm"
        aria-hidden="true"
      >
        GI
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-foreground truncate text-sm leading-none font-semibold">{t('name')}</span>
        {showTagline ? <span className="text-muted-foreground mt-1 line-clamp-1 text-xs">{t('tagline')}</span> : null}
      </div>
    </div>
  )
}
