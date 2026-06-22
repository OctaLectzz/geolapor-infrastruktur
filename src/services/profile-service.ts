import type { ApiResponse } from '@/types/api-response'
import type { UserDto } from '@/types/user'
import type { UpdateProfileInput } from '@/schemas/profile-schema'
import type { UploadedPhotoResult } from '@/types/upload'

export async function updateUserProfile(payload: UpdateProfileInput): Promise<ApiResponse<UserDto>> {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const body = (await response.json()) as ApiResponse<UserDto>

  if (!response.ok || !body.success) {
    throw new Error(body.message || 'profile.messages.updateError')
  }

  return body
}

export async function uploadAvatarPhoto(file: File): Promise<UploadedPhotoResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/avatar', {
    method: 'POST',
    body: formData
  })

  const body = (await response.json()) as ApiResponse<UploadedPhotoResult>

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || 'profile.messages.uploadError')
  }

  return body.data
}

