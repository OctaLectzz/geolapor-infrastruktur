import type { ReactNode } from 'react'

import { getTranslations } from 'next-intl/server'
import { notFound, redirect } from 'next/navigation'

import { DashboardLayout } from '@/components/shared/dashboard-layout'
import type { SidebarNavigationItem } from '@/components/shared/sidebar-navigation'
import { requireRole } from '@/lib/auth'
import { UserRole } from '@generated/prisma/enums'

interface UserDashboardLayoutProps {
  children: ReactNode
  params: Promise<{
    locale: string
  }>
}

export default async function UserDashboardLayout({ children, params }: UserDashboardLayoutProps): Promise<ReactNode> {
  const { locale } = await params
  const authResult = await requireRole([UserRole.USER])

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
    { href: '/dashboard', label: t('dashboard'), icon: 'dashboard' },
    { href: '/dashboard/reports/create', label: t('createReport'), icon: 'createReport' },
    { href: '/dashboard/reports', label: t('myReports'), icon: 'myReports' },
    { href: '/dashboard/profile', label: t('profile'), icon: 'profile' }
  ]

  return (
    <DashboardLayout navigationLabel={t('dashboardNavigation')} items={items} role={authResult.profile.role}>
      {children}
    </DashboardLayout>
  )
}
