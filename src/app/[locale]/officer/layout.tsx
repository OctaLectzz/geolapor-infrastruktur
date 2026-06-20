import type { ReactNode } from 'react'

import { getTranslations } from 'next-intl/server'
import { notFound, redirect } from 'next/navigation'

import { DashboardLayout } from '@/components/shared/dashboard-layout'
import type { SidebarNavigationItem } from '@/components/shared/sidebar-navigation'
import { requireRole } from '@/lib/auth'
import { UserRole } from '../../../../generated/prisma/enums'

interface OfficerLayoutProps {
  children: ReactNode
  params: Promise<{
    locale: string
  }>
}

export default async function OfficerLayout({ children, params }: OfficerLayoutProps): Promise<ReactNode> {
  const { locale } = await params
  const authResult = await requireRole([UserRole.OFFICER])

  if (!authResult.success) {
    if (authResult.errorCode === 'UNAUTHENTICATED') {
      redirect(`/${locale}/login`)
    }

    if (authResult.errorCode === 'ACCOUNT_DISABLED') {
      redirect(`/${locale}/login?error=inactive`)
    }

    notFound()
  }

  const t = await getTranslations('common.navigation')
  const items: SidebarNavigationItem[] = [
    { href: '/officer/tasks', label: t('myTasks'), icon: 'myTasks' },
    { href: '/officer/history', label: t('history'), icon: 'history' }
  ]

  return (
    <DashboardLayout navigationLabel={t('officerNavigation')} items={items} role={authResult.profile.role}>
      {children}
    </DashboardLayout>
  )
}
