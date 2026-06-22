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
  const tPagination = useTranslations('dashboard.tables.pagination')

  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<PublicReportListItemDto | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)

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
    setCurrentPage(1)
  }, [])

  const handleCategoryChange = useCallback((value: string): void => {
    setSelectedCategory(value)
    setSelectedReport(null)
    setCurrentPage(1)
  }, [])

  const handleReset = useCallback((): void => {
    setSelectedStatus('all')
    setSelectedCategory('all')
    setSelectedReport(null)
    setCurrentPage(1)
  }, [])

  const ITEMS_PER_PAGE = 5
  const totalPages = Math.max(1, Math.ceil(reports.length / ITEMS_PER_PAGE))
  const activePage = currentPage > totalPages ? totalPages : currentPage

  const paginatedReports = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE
    return reports.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [reports, activePage])

  return (
    <div className="flex flex-1 min-h-0 flex-col-reverse lg:flex-row gap-0">
      {/* Sidebar — filters + report list */}
      <aside className="flex w-full flex-col gap-3 p-4 border-b overflow-y-auto flex-1 min-h-0 lg:w-80 lg:shrink-0 lg:h-full lg:border-r lg:border-b-0 lg:overflow-hidden">
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

        <div className="flex flex-col gap-2 flex-none lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={`skeleton-${i.toString()}`} className="h-20 rounded-lg" />)
          ) : isError ? (
            <p className="text-muted-foreground py-8 text-center text-sm">{t('list.loadError')}</p>
          ) : reports.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">{t('list.empty')}</p>
          ) : (
            paginatedReports.map((report) => (
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

        {/* Pagination UI */}
        {!isLoading && !isError && totalPages > 1 ? (
          <div className="flex items-center justify-between border-t pt-3 mt-1 shrink-0">
            <p className="text-muted-foreground text-xs font-medium">
              {tPagination('page')} {activePage} / {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                disabled={activePage <= 1}
                onClick={() => setCurrentPage(activePage - 1)}
              >
                {tPagination('previous')}
              </Button>
              <Button
                variant="outline"
                size="xs"
                disabled={activePage >= totalPages}
                onClick={() => setCurrentPage(activePage + 1)}
              >
                {tPagination('next')}
              </Button>
            </div>
          </div>
        ) : null}
      </aside>

      {/* Map area */}
      <div className="relative h-[350px] shrink-0 lg:h-full lg:flex-1">
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
      className={`shrink-0 cursor-pointer transition hover:shadow-md ${isSelected ? 'ring-primary ring-2' : ''}`}
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
