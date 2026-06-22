'use client'

import { useCallback, useState } from 'react'

import dynamic from 'next/dynamic'

import { Skeleton } from '@/components/ui/skeleton'
import { ReportPreviewPanel } from '@/features/map/components/report-preview-panel'

import type { PublicReportListItemDto } from '@/types/report'

const LeafletMap = dynamic(
  () => import('@/features/map/components/leaflet-map').then((mod) => ({ default: mod.LeafletMap })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted/30 flex h-[400px] w-full items-center justify-center rounded-2xl border border-border/50">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    )
  }
)

interface MapPreviewClientProps {
  reports: PublicReportListItemDto[]
}

export function MapPreviewClient({ reports }: MapPreviewClientProps): React.ReactElement {
  const [selectedReport, setSelectedReport] = useState<PublicReportListItemDto | null>(null)

  const handleMarkerClick = useCallback((report: PublicReportListItemDto): void => {
    setSelectedReport(report)
  }, [])

  const handleClosePreview = useCallback((): void => {
    setSelectedReport(null)
  }, [])

  return (
    <div className="relative h-[450px] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl md:h-[500px]">
      <LeafletMap
        reports={reports}
        selectedReport={selectedReport}
        onMarkerClick={handleMarkerClick}
      />
      {selectedReport && (
        <ReportPreviewPanel report={selectedReport} onClose={handleClosePreview} />
      )}
    </div>
  )
}
