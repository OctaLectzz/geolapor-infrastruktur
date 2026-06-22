'use client'

import type { ReactNode } from 'react'

import { LogOutIcon, UserIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { ConfirmationDialog } from '@/components/shared/confirmation-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { logout } from '@/features/auth/services/auth-service'
import { Link, useRouter } from '@/i18n/navigation'

export interface UserProfileDto {
  fullName: string
  email: string
  avatarUrl?: string | null
}

interface ProfileDropdownProps {
  profile: UserProfileDto
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function ProfileDropdown({ profile }: ProfileDropdownProps): ReactNode {
  const t = useTranslations('common.navigation')
  const locale = useLocale()
  const router = useRouter()

  async function handleLogout(): Promise<void> {
    try {
      const { error } = await logout()
      if (!error) {
        router.replace('/login')
        window.location.reload()
      }
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="cursor-pointer border transition hover:opacity-80 h-9 w-9">
          {profile.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {getInitials(profile.fullName)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-foreground text-sm font-medium leading-none truncate">{profile.fullName}</p>
            <p className="text-muted-foreground text-xs leading-none truncate">{profile.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile" className="cursor-pointer flex w-full items-center">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>{t('profile')}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <ConfirmationDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>{t('logout')}</span>
            </DropdownMenuItem>
          }
          title={t('logoutConfirmTitle')}
          description={t('logoutConfirmDescription')}
          destructive
          onConfirm={handleLogout}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
