import type { ReactNode } from 'react'

import type { UserRole } from '../../../generated/prisma/enums'

import { SidebarNavigation, type SidebarNavigationItem } from '@/components/shared/sidebar-navigation'

interface DashboardLayoutProps {
  children: ReactNode
  navigationLabel: string
  items: SidebarNavigationItem[]
  role: UserRole
}

export function DashboardLayout({ children, navigationLabel, items }: DashboardLayoutProps): ReactNode {
  return (
    <SidebarNavigation navigationLabel={navigationLabel} items={items}>
      {children}
    </SidebarNavigation>
  )
}
