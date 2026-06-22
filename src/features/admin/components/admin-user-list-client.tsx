'use client'

import { useCallback, useState } from 'react'

import { type UserRole as PrismaUserRole } from '@generated/prisma/enums'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserRole } from '@generated/prisma/enums'

import type { UserDto } from '@/types/user'

const ROLE_OPTIONS: { value: PrismaUserRole; label: string }[] = [
  { value: UserRole.USER, label: 'USER' },
  { value: UserRole.OFFICER, label: 'OFFICER' },
  { value: UserRole.ADMIN, label: 'ADMIN' },
  { value: UserRole.SUPERADMIN, label: 'SUPERADMIN' }
]

const ROLE_BADGE_STYLES: Record<PrismaUserRole, string> = {
  SUPERADMIN: 'bg-destructive text-white',
  ADMIN: 'bg-primary text-primary-foreground',
  OFFICER: 'bg-warning text-warning-foreground',
  USER: 'bg-secondary text-secondary-foreground'
}

interface AdminUserListClientProps {
  initialUsers: UserDto[]
}

export function AdminUserListClient({ initialUsers }: AdminUserListClientProps): React.ReactElement {
  const t = useTranslations('common.admin.users')
  const tRoles = useTranslations('common.roles')
  const tStatus = useTranslations('common.statusLabels')

  const [users, setUsers] = useState<UserDto[]>(initialUsers)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleRoleChange = useCallback(
    async (userId: string, newRole: PrismaUserRole): Promise<void> => {
      setUpdatingId(userId)

      try {
        const response = await fetch(`/api/admin/users/${userId}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole })
        })

        const result = await response.json()

        if (result.success && result.data) {
          setUsers((prev) => prev.map((user) => (user.id === userId ? result.data : user)))
          toast.success(t('roleUpdated'))
        } else {
          toast.error(result.message)
        }
      } catch {
        toast.error(t('messages.unexpectedError'))
      } finally {
        setUpdatingId(null)
      }
    },
    [t]
  )

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('description')}</p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.name')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('columns.email')}</TableHead>
                <TableHead>{t('columns.role')}</TableHead>
                <TableHead>{t('columns.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground py-8 text-center">
                    {t('empty.title')}
                    <p className="text-muted-foreground mt-1 text-xs">{t('empty.description')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value as PrismaUserRole)}
                        disabled={updatingId === user.id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {tRoles(option.value.toLowerCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="default" className="bg-success text-success-foreground">
                          {tStatus('active')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{tStatus('inactive')}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  )
}
