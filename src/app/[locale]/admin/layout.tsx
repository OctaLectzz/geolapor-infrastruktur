import type { ReactNode } from 'react'

import { getTranslations } from 'next-intl/server'
import { notFound, redirect } from 'next/navigation'

import { DashboardLayout } from '@/components/shared/dashboard-layout'
import type { SidebarNavigationItem } from '@/components/shared/sidebar-navigation'
import { requireRole } from '@/lib/auth'
import { UserRole } from '../../../../generated/prisma/enums'

interface AdminLayoutProps {
  children: ReactNode
  params: Promise<{
    locale: string
  }>
}

export default async function AdminLayout({ children, params }: AdminLayoutProps): Promise<ReactNode> {
  const { locale } = await params
  const authResult = await requireRole([UserRole.ADMIN, UserRole.SUPERADMIN])

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
  const items = authResult.profile.role === UserRole.SUPERADMIN ? [...baseItems, ...superadminItems] : baseItems

  return (
    <DashboardLayout navigationLabel={t('adminNavigation')} items={items} role={authResult.profile.role}>
      {children}
    </DashboardLayout>
  )
}
