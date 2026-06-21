import type {
  FieldUpdateDto,
  PhotoType,
  ReportCategoryDto,
  ReportDetailDto,
  ReportListItemDto,
  ReportPhotoDto,
  ReportStatus,
  ReportStatusHistoryDto
} from '@/types/report'

interface DecimalLike {
  toString: () => string
}

interface ReportCategoryRecord {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface ReportPhotoRecord {
  id: string
  url: string
  type: PhotoType
  caption: string | null
  createdAt: Date
}

interface ReportStatusHistoryRecord {
  id: string
  status: ReportStatus
  note: string | null
  createdAt: Date
}

interface FieldUpdateRecord {
  id: string
  note: string
  progress: number
  photoUrl: string | null
  photoPath: string | null
  createdAt: Date
}

interface AssignmentRecord {
  officerId?: string
  isActive?: boolean
  fieldUpdates?: FieldUpdateRecord[]
}

export interface ReportListRecord {
  id: string
  reportCode: string
  title: string
  description: string
  address: string | null
  latitude: DecimalLike
  longitude: DecimalLike
  status: ReportStatus
  category: ReportCategoryRecord
  photos: ReportPhotoRecord[]
  createdAt: Date
  updatedAt: Date
}

export interface ReportDetailRecord extends ReportListRecord {
  histories: ReportStatusHistoryRecord[]
  assignments?: AssignmentRecord[]
}

function toCategoryDto(category: ReportCategoryRecord): ReportCategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon
  }
}

function toPhotoDto(photo: ReportPhotoRecord): ReportPhotoDto {
  return {
    id: photo.id,
    url: photo.url,
    type: photo.type,
    caption: photo.caption,
    createdAt: photo.createdAt.toISOString()
  }
}

function toStatusHistoryDto(history: ReportStatusHistoryRecord): ReportStatusHistoryDto {
  return {
    id: history.id,
    status: history.status,
    note: history.note,
    createdAt: history.createdAt.toISOString()
  }
}

function toFieldUpdateDto(update: FieldUpdateRecord): FieldUpdateDto {
  return {
    id: update.id,
    note: update.note,
    progress: update.progress,
    photoUrl: update.photoUrl,
    photoPath: update.photoPath,
    createdAt: update.createdAt.toISOString()
  }
}

export function toReportListItemDto(report: ReportListRecord): ReportListItemDto {
  return {
    id: report.id,
    reportCode: report.reportCode,
    title: report.title,
    description: report.description,
    address: report.address,
    latitude: report.latitude.toString(),
    longitude: report.longitude.toString(),
    status: report.status,
    category: toCategoryDto(report.category),
    photo: report.photos[0] ? toPhotoDto(report.photos[0]) : null,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString()
  }
}

export function toReportDetailDto(report: ReportDetailRecord): ReportDetailDto {
  return {
    id: report.id,
    reportCode: report.reportCode,
    title: report.title,
    description: report.description,
    address: report.address,
    latitude: report.latitude.toString(),
    longitude: report.longitude.toString(),
    status: report.status,
    category: toCategoryDto(report.category),
    photos: report.photos.map(toPhotoDto),
    histories: report.histories.map(toStatusHistoryDto),
    fieldUpdates: report.assignments?.flatMap((assignment) => assignment.fieldUpdates?.map(toFieldUpdateDto) ?? []) ?? [],
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString()
  }
}
