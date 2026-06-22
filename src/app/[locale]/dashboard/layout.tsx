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
  const authResult = await requireRole([UserRole.USER, UserRole.OFFICER, UserRole.ADMIN, UserRole.SUPERADMIN])

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
  
  let items: SidebarNavigationItem[] = []
  let navLabel = t('dashboardNavigation')

  if (authResult.profile.role === UserRole.SUPERADMIN || authResult.profile.role === UserRole.ADMIN) {
    navLabel = t('adminNavigation')
    const baseItems: SidebarNavigationItem[] = [
      { href: '/admin', label: t('overview'), icon: 'overview' },
      { href: '/admin/reports/verification', label: t('verification'), icon: 'verification' },
      { href: '/admin/reports', label: t('reports'), icon: 'reports' },
      { href: '/admin/categories', label: t('categories'), icon: 'categories' },
      { href: '/admin/officers', label: t('officers'), icon: 'officers' }
    ]
    const superadminItems: SidebarNavigationItem[] = [
      { href: '/admin/users', label: t('users'), icon: 'users' },
      { href: '/admin/audit-logs', label: t('auditLogs'), icon: 'auditLogs' }
    ]
    items = authResult.profile.role === UserRole.SUPERADMIN ? [...baseItems, ...superadminItems] : baseItems
  } else if (authResult.profile.role === UserRole.OFFICER) {
    navLabel = t('officerNavigation')
    items = [
      { href: '/officer/tasks', label: t('myTasks'), icon: 'myTasks' },
      { href: '/officer/history', label: t('history'), icon: 'history' }
    ]
  } else {
    items = [
      { href: '/dashboard', label: t('dashboard'), icon: 'dashboard' },
      { href: '/dashboard/reports/create', label: t('createReport'), icon: 'createReport' },
      { href: '/dashboard/reports', label: t('myReports'), icon: 'myReports' },
      { href: '/dashboard/profile', label: t('profile'), icon: 'profile' }
    ]
  }

  return (
    <DashboardLayout navigationLabel={navLabel} items={items} role={authResult.profile.role} profile={authResult.profile}>
      {children}
    </DashboardLayout>
  )
}
