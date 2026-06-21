import type {
  PhotoType,
  PublicRegionDto,
  PublicReportDetailDto,
  PublicReportListItemDto,
  PublicReportStatusHistoryDto,
  ReportCategoryDto,
  ReportPhotoDto,
  ReportStatus
} from '@/types/report'

interface DecimalLike {
  toString: () => string
}

interface PublicCategoryRecord {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface PublicRegionRecord {
  id: string
  province: string
  city: string
  district: string | null
  village: string | null
}

interface PublicPhotoRecord {
  id: string
  url: string
  type: PhotoType
  caption: string | null
  createdAt: Date
}

interface PublicStatusHistoryRecord {
  id: string
  status: ReportStatus
  createdAt: Date
}

export interface PublicReportListRecord {
  id: string
  reportCode: string
  title: string
  description: string
  address: string | null
  latitude: DecimalLike
  longitude: DecimalLike
  status: ReportStatus
  category: PublicCategoryRecord
  region: PublicRegionRecord | null
  photos: PublicPhotoRecord[]
  createdAt: Date
  updatedAt: Date
}

export interface PublicReportDetailRecord extends PublicReportListRecord {
  histories: PublicStatusHistoryRecord[]
}

function toPublicCategoryDto(category: PublicCategoryRecord): ReportCategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon
  }
}

function toPublicRegionDto(region: PublicRegionRecord | null): PublicRegionDto | null {
  if (!region) {
    return null
  }

  return {
    id: region.id,
    province: region.province,
    city: region.city,
    district: region.district,
    village: region.village
  }
}

function toPublicPhotoDto(photo: PublicPhotoRecord): ReportPhotoDto {
  return {
    id: photo.id,
    url: photo.url,
    type: photo.type,
    caption: photo.caption,
    createdAt: photo.createdAt.toISOString()
  }
}

function toPublicStatusHistoryDto(history: PublicStatusHistoryRecord): PublicReportStatusHistoryDto {
  return {
    id: history.id,
    status: history.status,
    createdAt: history.createdAt.toISOString()
  }
}

export function toPublicReportListItemDto(report: PublicReportListRecord): PublicReportListItemDto {
  return {
    id: report.id,
    reportCode: report.reportCode,
    title: report.title,
    description: report.description,
    address: report.address,
    latitude: report.latitude.toString(),
    longitude: report.longitude.toString(),
    status: report.status,
    category: toPublicCategoryDto(report.category),
    region: toPublicRegionDto(report.region),
    photo: report.photos[0] ? toPublicPhotoDto(report.photos[0]) : null,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString()
  }
}

export function toPublicReportDetailDto(report: PublicReportDetailRecord): PublicReportDetailDto {
  return {
    id: report.id,
    reportCode: report.reportCode,
    title: report.title,
    description: report.description,
    address: report.address,
    latitude: report.latitude.toString(),
    longitude: report.longitude.toString(),
    status: report.status,
    category: toPublicCategoryDto(report.category),
    region: toPublicRegionDto(report.region),
    photos: report.photos.map(toPublicPhotoDto),
    histories: report.histories.map(toPublicStatusHistoryDto),
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString()
  }
}
