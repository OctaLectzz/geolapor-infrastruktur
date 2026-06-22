import 'server-only'

import type { UserProfile } from '@generated/prisma/client'
import { UserRole } from '@generated/prisma/enums'

import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type ProfileSyncErrorCode = 'UNAUTHENTICATED' | 'EMAIL_MISSING' | 'ACCOUNT_DISABLED' | 'SYNC_FAILED'

interface ProfileSyncSuccessResult {
  success: true
  profile: UserProfile
  errorCode: null
}

interface ProfileSyncErrorResult {
  success: false
  profile: UserProfile | null
  errorCode: ProfileSyncErrorCode
}

export type ProfileSyncResult = ProfileSyncSuccessResult | ProfileSyncErrorResult

const FALLBACK_FULL_NAME = 'GeoLapor User'

function getStringMetadataValue(metadata: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = metadata[key]

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }

  return null
}

function getFullNameFromMetadata(metadata: Record<string, unknown>): string {
  return getStringMetadataValue(metadata, ['full_name', 'name', 'display_name']) ?? FALLBACK_FULL_NAME
}

function getAvatarUrlFromMetadata(metadata: Record<string, unknown>): string | null {
  return getStringMetadataValue(metadata, ['avatar_url', 'picture'])
}

export async function syncCurrentUserProfile(): Promise<ProfileSyncResult> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      return {
        success: false,
        profile: null,
        errorCode: 'UNAUTHENTICATED'
      }
    }

    const email = data.user.email?.trim()

    if (!email) {
      return {
        success: false,
        profile: null,
        errorCode: 'EMAIL_MISSING'
      }
    }

    const metadata = data.user.user_metadata as Record<string, unknown>
    const profileData = {
      email,
      fullName: getFullNameFromMetadata(metadata),
      avatarUrl: getAvatarUrlFromMetadata(metadata)
    }

    const existingProfile = await prisma.userProfile.findUnique({
      where: {
        supabaseUserId: data.user.id
      }
    })

    if (!existingProfile) {
      const profile = await prisma.userProfile.create({
        data: {
          supabaseUserId: data.user.id,
          email: profileData.email,
          fullName: profileData.fullName,
          avatarUrl: profileData.avatarUrl,
          role: UserRole.USER,
          isActive: true
        }
      })

      return {
        success: true,
        profile,
        errorCode: null
      }
    }

    const shouldUpdateProfile =
      existingProfile.email !== profileData.email ||
      existingProfile.fullName !== profileData.fullName ||
      existingProfile.avatarUrl !== profileData.avatarUrl

    const profile = shouldUpdateProfile
      ? await prisma.userProfile.update({
          where: {
            id: existingProfile.id
          },
          data: profileData
        })
      : existingProfile

    // Sync app_metadata to Supabase Auth
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = createAdminClient()
        await adminClient.auth.admin.updateUserById(data.user.id, {
          app_metadata: { role: profile.role, isActive: profile.isActive }
        })
      }
    } catch (adminError) {
      console.error('Failed to sync app_metadata to Supabase Auth:', adminError)
    }

    if (!profile.isActive) {
      return {
        success: false,
        profile,
        errorCode: 'ACCOUNT_DISABLED'
      }
    }

    return {
      success: true,
      profile,
      errorCode: null
    }
  } catch {
    return {
      success: false,
      profile: null,
      errorCode: 'SYNC_FAILED'
    }
  }
}
