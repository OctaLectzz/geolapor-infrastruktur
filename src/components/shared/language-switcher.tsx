'use client'

import type { ReactNode } from 'react'

import { LanguagesIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type AppLocale } from '@/i18n/routing'

export function LanguageSwitcher(): ReactNode {
  const locale = useLocale() as AppLocale
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('common.language')

  function handleLocaleChange(nextLocale: AppLocale): void {
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label={t('label')}>
          <LanguagesIcon data-icon="inline-start" />
          {t(locale)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {routing.locales.map((availableLocale) => (
            <DropdownMenuItem key={availableLocale} disabled={availableLocale === locale} onSelect={() => handleLocaleChange(availableLocale)}>
              {t(availableLocale)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
