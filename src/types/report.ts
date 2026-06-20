export const REPORT_STATUSES = [
  'PENDING_VERIFICATION',
  'VERIFIED',
  'REJECTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'NEED_REVIEW',
  'COMPLETED',
  'CANCELLED'
] as const

export const PHOTO_TYPES = ['BEFORE', 'PROGRESS', 'AFTER'] as const

export type ReportStatus = (typeof REPORT_STATUSES)[number]
export type PhotoType = (typeof PHOTO_TYPES)[number]

export interface EvidencePhotoMetadata {
  fileName: string
  mimeType: string
  size: number
  type: PhotoType
  caption?: string
}

export interface ReportLocation {
  latitude: number
  longitude: number
  address?: string
}

export interface ReportCreationInput extends ReportLocation {
  title: string
  description: string
  categoryId: string
  evidencePhotos: EvidencePhotoMetadata[]
}

export interface ReportStatusTransition {
  from: ReportStatus
  to: ReportStatus
}
