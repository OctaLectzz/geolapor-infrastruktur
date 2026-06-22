import { requireAuth } from '@/lib/auth'
import { errorResponse, successResponse } from '@/lib/response'
import { createClient } from '@/lib/supabase/server'
import { ACCEPTED_EVIDENCE_PHOTO_MIME_TYPES, MAX_EVIDENCE_PHOTO_SIZE_BYTES } from '@/schemas/report-schema'

import type { UploadedPhotoResult } from '@/types/upload'

const REPORT_PHOTOS_BUCKET = 'report-photos'
const SIGNED_URL_EXPIRY_SECONDS = 3600

const ACCEPTED_MIME_SET = new Set<string>(ACCEPTED_EVIDENCE_PHOTO_MIME_TYPES)

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif'
}

function generateSafeFileName(mimeType: string): string {
  const extension = MIME_TO_EXTENSION[mimeType] ?? 'bin'
  const timestamp = Date.now()
  const randomSegment = crypto.randomUUID().replace(/-/g, '')

  return `${timestamp}-${randomSegment}.${extension}`
}

function generateStoragePath(userId: string, fileName: string): string {
  return `${userId}/${fileName}`
}

function getAuthErrorResponse(errorCode: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'ACCOUNT_DISABLED'): Response {
  if (errorCode === 'UNAUTHENTICATED') {
    return errorResponse('auth.errors.unauthenticated', 401)
  }

  if (errorCode === 'ACCOUNT_DISABLED') {
    return errorResponse('auth.errors.accountDisabled', 403)
  }

  return errorResponse('auth.errors.forbidden', 403)
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authResult = await requireAuth()

    if (!authResult.success) {
      return getAuthErrorResponse(authResult.errorCode)
    }

    const formData = await request.formData()
    const fileEntry = formData.get('file')

    if (!fileEntry || !(fileEntry instanceof File)) {
      return errorResponse('upload.errors.fileRequired', 400)
    }

    if (!ACCEPTED_MIME_SET.has(fileEntry.type)) {
      return errorResponse('upload.errors.invalidMimeType', 400)
    }

    if (fileEntry.size > MAX_EVIDENCE_PHOTO_SIZE_BYTES) {
      return errorResponse('upload.errors.fileTooLarge', 400)
    }

    if (fileEntry.size === 0) {
      return errorResponse('upload.errors.fileEmpty', 400)
    }

    const safeFileName = generateSafeFileName(fileEntry.type)
    const storagePath = generateStoragePath(authResult.profile.id, safeFileName)

    const supabase = await createClient()

    const fileBuffer = await fileEntry.arrayBuffer()

    const { error: uploadError } = await supabase.storage.from(REPORT_PHOTOS_BUCKET).upload(storagePath, fileBuffer, {
      contentType: fileEntry.type,
      upsert: false
    })

    if (uploadError) {
      return errorResponse('upload.errors.uploadFailed', 500)
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(REPORT_PHOTOS_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return errorResponse('upload.errors.signedUrlFailed', 500)
    }

    const result: UploadedPhotoResult = {
      path: storagePath,
      url: signedUrlData.signedUrl
    }

    return successResponse(result, 'upload.success', 201)
  } catch {
    return errorResponse('common.errors.internalServer', 500)
  }
}
