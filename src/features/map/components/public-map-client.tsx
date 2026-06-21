'use client'

import { useCallback, useMemo, useState } from 'react'

import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import Image from 'next/image'

import { useQuery } from '@tanstack/react-query'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MapFilterPanel } from '@/features/map/components/map-filter-panel'
import { ReportPreviewPanel } from '@/features/map/components/report-preview-panel'
import { fetchCategories, fetchPublicReports } from '@/features/map/services/public-map-service'
import { Link } from '@/i18n/navigation'

import type { CategoryDto } from '@/types/category'
import type { PublicReportListItemDto } from '@/types/report'

const LeafletMap = dynamic(() => import('@/features/map/components/leaflet-map').then((mod) => ({ default: mod.LeafletMap })), {
  ssr: false,
  loading: () => (
    <div className="bg-muted flex size-full items-center justify-center">
      <Skeleton className="size-full" />
    </div>
  )
})

interface PublicMapClientProps {
  initialCategories: CategoryDto[]
}

export function PublicMapClient({ initialCategories }: PublicMapClientProps): React.ReactElement {
  const t = useTranslations('common.publicMap')
  const statusT = useTranslations('common.publicMap.status')

  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<PublicReportListItemDto | null>(null)

  const queryParams = useMemo(
    () => ({
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
      limit: 200
    }),
    [selectedStatus, selectedCategory]
  )

  const {
    data: reports = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['publicReports', queryParams],
    queryFn: () => fetchPublicReports(queryParams),
    staleTime: 60_000
  })

  const { data: categories = initialCategories } = useQuery({
    queryKey: ['publicCategories'],
    queryFn: fetchCategories,
    initialData: initialCategories,
    staleTime: 300_000
  })

  const handleMarkerClick = useCallback((report: PublicReportListItemDto): void => {
    setSelectedReport(report)
  }, [])

  const handleClosePreview = useCallback((): void => {
    setSelectedReport(null)
  }, [])

  const handleStatusChange = useCallback((value: string): void => {
    setSelectedStatus(value)
    setSelectedReport(null)
  }, [])

  const handleCategoryChange = useCallback((value: string): void => {
    setSelectedCategory(value)
    setSelectedReport(null)
  }, [])

  const handleReset = useCallback((): void => {
    setSelectedStatus('all')
    setSelectedCategory('all')
    setSelectedReport(null)
  }, [])

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-0 lg:flex-row">
      {/* Sidebar — filters + report list */}
      <aside className="flex w-full shrink-0 flex-col gap-3 overflow-y-auto border-b p-4 lg:w-80 lg:border-r lg:border-b-0">
        <MapFilterPanel
          categories={categories}
          selectedStatus={selectedStatus}
          selectedCategory={selectedCategory}
          onStatusChange={handleStatusChange}
          onCategoryChange={handleCategoryChange}
          onReset={handleReset}
          isLoading={isLoading}
        />

        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-sm font-semibold">{t('list.title')}</h2>
          <Badge variant="secondary" className="text-xs">
            {reports.length}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={`skeleton-${i.toString()}`} className="h-20 rounded-lg" />)
          ) : isError ? (
            <p className="text-muted-foreground py-8 text-center text-sm">{t('list.loadError')}</p>
          ) : reports.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">{t('list.empty')}</p>
          ) : (
            reports.map((report) => (
              <ReportListItem
                key={report.id}
                report={report}
                isSelected={selectedReport?.id === report.id}
                onSelect={handleMarkerClick}
                statusLabel={statusT(report.status as 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'NEED_REVIEW' | 'COMPLETED')}
              />
            ))
          )}
        </div>
      </aside>

      {/* Map area */}
      <div className="relative flex-1">
        <LeafletMap reports={reports} selectedReport={selectedReport} onMarkerClick={handleMarkerClick} />
        <ReportPreviewPanel report={selectedReport} onClose={handleClosePreview} />
      </div>
    </div>
  )
}

interface ReportListItemProps {
  report: PublicReportListItemDto
  isSelected: boolean
  onSelect: (report: PublicReportListItemDto) => void
  statusLabel: string
}

function ReportListItem({ report, isSelected, onSelect, statusLabel }: ReportListItemProps): React.ReactElement {
  const t = useTranslations('common.publicMap.preview')

  return (
    <Card
      className={`cursor-pointer transition hover:shadow-md ${isSelected ? 'ring-primary ring-2' : ''}`}
      onClick={() => onSelect(report)}
      size="sm"
    >
      <CardContent className="flex gap-3 p-3">
        {report.photo ? (
          <div className="bg-muted size-14 shrink-0 overflow-hidden rounded-md">
            <Image
              src={report.photo.url}
              alt={report.photo.caption ?? report.title}
              className="size-full object-cover"
              width={56}
              height={56}
              unoptimized
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-xs font-medium">{report.title}</p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">{report.address ?? t('noAddress')}</p>
          <div className="mt-1 flex items-center justify-between">
            <Badge variant="secondary" className="text-[10px]">
              {statusLabel}
            </Badge>
            <Button variant="link" size="xs" asChild className="h-auto p-0 text-[10px]">
              <Link href={`/reports/${report.id}`}>{t('viewDetail')}</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
