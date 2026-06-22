'use client'

import type { ComponentType, ReactNode } from 'react'

import {
  ClipboardCheckIcon,
  ClipboardListIcon,
  FilePlusIcon,
  FolderKanbanIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  MapIcon,
  ScrollTextIcon,
  TagsIcon,
  UserCogIcon,
  UserIcon,
  UsersIcon
} from 'lucide-react'

import { AppLogo } from '@/components/shared/app-logo'
import { LanguageSwitcher } from '@/components/shared/language-switcher'
import { ProfileDropdown, type UserProfileDto } from '@/components/shared/profile-dropdown'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { Link, usePathname } from '@/i18n/navigation'

export type SidebarIconName =
  | 'dashboard'
  | 'createReport'
  | 'myReports'
  | 'profile'
  | 'overview'
  | 'verification'
  | 'reports'
  | 'categories'
  | 'officers'
  | 'users'
  | 'auditLogs'
  | 'myTasks'
  | 'history'
  | 'map'

export interface SidebarNavigationItem {
  href: string
  label: string
  icon: SidebarIconName
}

interface SidebarNavigationProps {
  children: ReactNode
  navigationLabel: string
  items: SidebarNavigationItem[]
  profile?: UserProfileDto
}

const ICONS: Record<SidebarIconName, ComponentType> = {
  dashboard: LayoutDashboardIcon,
  createReport: FilePlusIcon,
  myReports: ClipboardListIcon,
  profile: UserIcon,
  overview: LayoutDashboardIcon,
  verification: ClipboardCheckIcon,
  reports: FolderKanbanIcon,
  categories: TagsIcon,
  officers: UserCogIcon,
  users: UsersIcon,
  auditLogs: ScrollTextIcon,
  myTasks: ListChecksIcon,
  history: HistoryIcon,
  map: MapIcon
}

export function SidebarNavigation({ children, navigationLabel, items, profile }: SidebarNavigationProps): ReactNode {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <AppLogo showTagline />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{navigationLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const Icon = ICONS[item.icon]
                  const isActive = item.href === '/dashboard' || item.href === '/admin' || item.href === '/officer'
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex min-h-14 items-center justify-between gap-3 border-b px-4 md:px-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <SidebarTrigger />
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground truncate text-sm font-medium">{navigationLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            {profile ? <ProfileDropdown profile={profile} /> : null}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 min-w-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
