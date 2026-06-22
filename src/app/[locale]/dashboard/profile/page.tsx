import type { ReactElement } from 'react'

import { requireAuth } from '@/lib/auth'
import { ProfileForm } from '@/features/auth/components/profile-form'
import type { UserDto } from '@/types/user'

export default async function ProfilePage(): Promise<ReactElement> {
  const authResult = await requireAuth()

  if (!authResult.success) {
    return <div />
  }

  const profile = authResult.profile
  const userDto: UserDto = {
    id: profile.id,
    supabaseUserId: profile.supabaseUserId,
    email: profile.email,
    fullName: profile.fullName,
    phoneNumber: profile.phoneNumber,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
    agencyId: profile.agencyId,
    isActive: profile.isActive,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString()
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <ProfileForm profile={userDto} />
      </div>
    </main>
  )
}
