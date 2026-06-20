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
  fileName?: string
  path: string
  url: string
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

export interface ReportCategoryDto {
  id: string
  name: string
  slug: string
  icon: string | null
}

export interface ReportPhotoDto {
  id: string
  url: string
  type: PhotoType
  caption: string | null
  createdAt: string
}

export interface ReportStatusHistoryDto {
  id: string
  status: ReportStatus
  note: string | null
  createdAt: string
}

export interface ReportListItemDto {
  id: string
  reportCode: string
  title: string
  description: string
  address: string | null
  latitude: string
  longitude: string
  status: ReportStatus
  category: ReportCategoryDto
  photo: ReportPhotoDto | null
  createdAt: string
  updatedAt: string
}

export interface ReportDetailDto extends Omit<ReportListItemDto, 'photo'> {
  photos: ReportPhotoDto[]
  histories: ReportStatusHistoryDto[]
}

export interface PaginationDto {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ReportListResponse {
  items: ReportListItemDto[]
  pagination: PaginationDto
}

export interface ReportCreateResponse {
  report: ReportDetailDto
}

export interface OfficerDto {
  id: string
  fullName: string
  email: string
  phoneNumber: string | null
  avatarUrl: string | null
  agencyId: string | null
}

export interface OfficerListResponse {
  items: OfficerDto[]
}

export interface FieldUpdateDto {
  id: string
  note: string
  progress: number
  photoUrl: string | null
  photoPath: string | null
  createdAt: string
}

export interface OfficerTaskListItemDto {
  id: string
  reportId: string
  reportCode: string
  title: string
  description: string
  address: string | null
  latitude: string
  longitude: string
  status: ReportStatus
  category: ReportCategoryDto
  photo: ReportPhotoDto | null
  note: string | null
  dueDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface OfficerTaskDetailDto extends OfficerTaskListItemDto {
  photos: ReportPhotoDto[]
  histories: ReportStatusHistoryDto[]
  fieldUpdates: FieldUpdateDto[]
}

export interface OfficerTaskListResponse {
  items: OfficerTaskListItemDto[]
  pagination: PaginationDto
}
