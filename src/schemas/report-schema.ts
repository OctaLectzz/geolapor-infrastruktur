import { z } from 'zod'

import { PHOTO_TYPES } from '@/types/report'

export const MAX_EVIDENCE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024

export const ACCEPTED_EVIDENCE_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'] as const

const REPORT_VALIDATION_KEYS = {
  titleRequired: 'reports.validation.titleRequired',
  titleMinLength: 'reports.validation.titleMinLength',
  descriptionRequired: 'reports.validation.descriptionRequired',
  descriptionMinLength: 'reports.validation.descriptionMinLength',
  categoryRequired: 'reports.validation.categoryRequired',
  latitudeRequired: 'reports.validation.latitudeRequired',
  latitudeInvalid: 'reports.validation.latitudeInvalid',
  longitudeRequired: 'reports.validation.longitudeRequired',
  longitudeInvalid: 'reports.validation.longitudeInvalid',
  evidencePhotoRequired: 'reports.validation.evidencePhotoRequired',
  fileNameRequired: 'reports.validation.fileNameRequired',
  mimeTypeInvalid: 'reports.validation.mimeTypeInvalid',
  fileSizeInvalid: 'reports.validation.fileSizeInvalid',
  photoTypeInvalid: 'reports.validation.photoTypeInvalid'
} as const

export const latitudeSchema = z.coerce
  .number({ message: REPORT_VALIDATION_KEYS.latitudeRequired })
  .min(-90, { message: REPORT_VALIDATION_KEYS.latitudeInvalid })
  .max(90, { message: REPORT_VALIDATION_KEYS.latitudeInvalid })

export const longitudeSchema = z.coerce
  .number({ message: REPORT_VALIDATION_KEYS.longitudeRequired })
  .min(-180, { message: REPORT_VALIDATION_KEYS.longitudeInvalid })
  .max(180, { message: REPORT_VALIDATION_KEYS.longitudeInvalid })

export const evidencePhotoMetadataSchema = z.object({
  fileName: z.string().trim().min(1, { message: REPORT_VALIDATION_KEYS.fileNameRequired }).optional(),
  path: z.string().trim().min(1, { message: REPORT_VALIDATION_KEYS.evidencePhotoRequired }),
  url: z.url({ message: REPORT_VALIDATION_KEYS.evidencePhotoRequired }),
  mimeType: z.enum(ACCEPTED_EVIDENCE_PHOTO_MIME_TYPES, {
    message: REPORT_VALIDATION_KEYS.mimeTypeInvalid
  }),
  size: z
    .number()
    .int({ message: REPORT_VALIDATION_KEYS.fileSizeInvalid })
    .positive({ message: REPORT_VALIDATION_KEYS.fileSizeInvalid })
    .max(MAX_EVIDENCE_PHOTO_SIZE_BYTES, {
      message: REPORT_VALIDATION_KEYS.fileSizeInvalid
    }),
  type: z.enum(PHOTO_TYPES, {
    message: REPORT_VALIDATION_KEYS.photoTypeInvalid
  }),
  caption: z.string().trim().optional()
})

export const createReportSchema = z.object({
  title: z.string().trim().min(1, { message: REPORT_VALIDATION_KEYS.titleRequired }).min(8, { message: REPORT_VALIDATION_KEYS.titleMinLength }),
  description: z
    .string()
    .trim()
    .min(1, { message: REPORT_VALIDATION_KEYS.descriptionRequired })
    .min(20, { message: REPORT_VALIDATION_KEYS.descriptionMinLength }),
  categoryId: z.string().trim().min(1, { message: REPORT_VALIDATION_KEYS.categoryRequired }),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  address: z.string().trim().optional(),
  evidencePhotos: z.array(evidencePhotoMetadataSchema).min(1, { message: REPORT_VALIDATION_KEYS.evidencePhotoRequired })
})

export type EvidencePhotoMetadataSchema = z.infer<typeof evidencePhotoMetadataSchema>
export type CreateReportSchema = z.infer<typeof createReportSchema>
