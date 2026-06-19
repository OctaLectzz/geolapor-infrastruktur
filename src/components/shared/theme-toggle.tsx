'use client'

import type { ReactNode } from 'react'

import { MoonIcon, SunIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function ThemeToggle(): ReactNode {
  const { setTheme } = useTheme()
  const t = useTranslations('common.theme')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={t('toggle')}>
          <SunIcon data-icon="inline-start" className="scale-100 transition-transform dark:scale-0" />
          <MoonIcon data-icon="inline-start" className="absolute scale-0 transition-transform dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => setTheme('light')}>{t('light')}</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTheme('dark')}>{t('dark')}</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setTheme('system')}>{t('system')}</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
