'use client'

import { useCallback, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

import { useTranslations } from 'next-intl'
import { Menu, X, Map, HelpCircle, LogIn, LayoutDashboard, Home } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

interface MobileNavProps {
  dashboardPath: string | null
}

export function MobileNav({ dashboardPath }: MobileNavProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const t = useTranslations('common.navigation')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const handleToggle = useCallback((): void => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleClose = useCallback((): void => {
    setIsOpen(false)
  }, [])

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        className="relative z-[1120] rounded-xl hover:bg-muted/80"
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {mounted &&
        createPortal(
          <>
            {/* Overlay */}
            {isOpen && (
              <div
                className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
                aria-hidden="true"
              />
            )}

            {/* Slide-in Panel */}
            <div
              className={`fixed top-0 right-0 z-[1110] h-full w-72 bg-card border-l border-border shadow-2xl transform transition-transform duration-300 ease-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="flex flex-col h-full pt-20 px-6 pb-8">
                <nav className="flex flex-col gap-1" aria-label={t('publicNavigation')}>
                  <Link
                    href="/"
                    onClick={handleClose}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Home className="size-4 text-muted-foreground" />
                    {t('home')}
                  </Link>
                  <Link
                    href="/map"
                    onClick={handleClose}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Map className="size-4 text-muted-foreground" />
                    {t('map')}
                  </Link>
                  <Link
                    href="/help"
                    onClick={handleClose}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <HelpCircle className="size-4 text-muted-foreground" />
                    {t('help')}
                  </Link>
                </nav>

                <div className="mt-auto pt-6 border-t border-border">
                  {dashboardPath ? (
                    <Button asChild className="w-full rounded-xl" onClick={handleClose}>
                      <Link href={dashboardPath} className="flex items-center gap-2">
                        <LayoutDashboard className="size-4" />
                        {t('dashboard')}
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full rounded-xl" onClick={handleClose}>
                      <Link href="/login" className="flex items-center gap-2">
                        <LogIn className="size-4" />
                        {t('login')}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  )
}
