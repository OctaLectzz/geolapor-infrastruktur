import { prisma } from '@/lib/prisma'

import { AdminUserListClient } from '@/features/admin/components/admin-user-list-client'

import type { UserDto } from '@/types/user'

export default async function AdminUsersPage(): Promise<React.ReactElement> {
  const users = await prisma.userProfile.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const initialUsers: UserDto[] = users.map((user) => ({
    id: user.id,
    supabaseUserId: user.supabaseUserId,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    role: user.role,
    agencyId: user.agencyId,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  }))

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col">
        <AdminUserListClient initialUsers={initialUsers} />
      </div>
    </main>
  )
}
