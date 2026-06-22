import type { UserRole } from '@generated/prisma/enums'

export interface UserDto {
  id: string
  supabaseUserId: string
  email: string
  fullName: string
  phoneNumber: string | null
  avatarUrl: string | null
  role: UserRole
  agencyId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserListResponse {
  items: UserDto[]
}
