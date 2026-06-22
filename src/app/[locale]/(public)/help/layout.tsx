import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

interface HelpLayoutProps {
  children: ReactNode
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: HelpLayoutProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common.helpPage' })
  const navT = await getTranslations({ locale, namespace: 'common.navigation' })
  return {
    title: navT('help'),
    description: t('subtitle')
  }
}

export default function HelpLayout({ children }: { children: ReactNode }): ReactNode {
  return <>{children}</>
}
