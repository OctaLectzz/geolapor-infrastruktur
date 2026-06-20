import type {
  FieldUpdateDto,
  OfficerTaskDetailDto,
  OfficerTaskListItemDto,
  PhotoType,
  ReportCategoryDto,
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

interface OfficerTaskReportRecord {
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
  histories?: ReportStatusHistoryRecord[]
}

export interface OfficerTaskListRecord {
  id: string
  note: string | null
  dueDate: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  report: OfficerTaskReportRecord
}

export interface OfficerTaskDetailRecord extends OfficerTaskListRecord {
  fieldUpdates: FieldUpdateRecord[]
  report: OfficerTaskReportRecord & {
    histories: ReportStatusHistoryRecord[]
  }
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

export function toFieldUpdateDto(update: FieldUpdateRecord): FieldUpdateDto {
  return {
    id: update.id,
    note: update.note,
    progress: update.progress,
    photoUrl: update.photoUrl,
    photoPath: update.photoPath,
    createdAt: update.createdAt.toISOString()
  }
}

export function toOfficerTaskListItemDto(task: OfficerTaskListRecord): OfficerTaskListItemDto {
  return {
    id: task.id,
    reportId: task.report.id,
    reportCode: task.report.reportCode,
    title: task.report.title,
    description: task.report.description,
    address: task.report.address,
    latitude: task.report.latitude.toString(),
    longitude: task.report.longitude.toString(),
    status: task.report.status,
    category: toCategoryDto(task.report.category),
    photo: task.report.photos[0] ? toPhotoDto(task.report.photos[0]) : null,
    note: task.note,
    dueDate: task.dueDate?.toISOString() ?? null,
    isActive: task.isActive,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  }
}

export function toOfficerTaskDetailDto(task: OfficerTaskDetailRecord): OfficerTaskDetailDto {
  return {
    ...toOfficerTaskListItemDto(task),
    photos: task.report.photos.map(toPhotoDto),
    histories: task.report.histories.map(toStatusHistoryDto),
    fieldUpdates: task.fieldUpdates.map(toFieldUpdateDto)
  }
}
