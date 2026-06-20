import { UserRole, type UserRole as PrismaUserRole } from '@generated/prisma/enums'

const ROLE_REDIRECTS = {
  [UserRole.SUPERADMIN]: '/admin',
  [UserRole.ADMIN]: '/admin',
  [UserRole.OFFICER]: '/officer/tasks',
  [UserRole.USER]: '/dashboard'
} as const satisfies Record<PrismaUserRole, string>

export function getRoleRedirectPath(role: PrismaUserRole): string {
  return ROLE_REDIRECTS[role]
}
