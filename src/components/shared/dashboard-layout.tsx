import type { ReactNode } from 'react'

import type { UserRole } from '@generated/prisma/enums'

import { SidebarNavigation, type SidebarNavigationItem } from '@/components/shared/sidebar-navigation'
import type { UserProfileDto } from '@/components/shared/profile-dropdown'

interface DashboardLayoutProps {
  children: ReactNode
  navigationLabel: string
  items: SidebarNavigationItem[]
  role: UserRole
  profile?: UserProfileDto
}

export function DashboardLayout({ children, navigationLabel, items, profile }: DashboardLayoutProps): ReactNode {
  return (
    <SidebarNavigation navigationLabel={navigationLabel} items={items} profile={profile}>
      {children}
    </SidebarNavigation>
  )
}
