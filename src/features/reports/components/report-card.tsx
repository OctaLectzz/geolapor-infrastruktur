import { useLocale, useTranslations } from 'next-intl'

import { StatusBadge, type ReportStatusValue } from '@/components/shared/status-badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { ReportListItemDto } from '@/types/report'

interface ReportCardProps {
  report: ReportListItemDto
  className?: string
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}…`
}

function formatDate(isoDate: string, locale: string): string {
  const date = new Date(isoDate)

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function ReportCard({ report, className }: ReportCardProps): React.ReactNode {
  const tDashboard = useTranslations('dashboard.tables.columns')
  const locale = useLocale()

  return (
    <Link href={`/dashboard/reports/${report.id}`} className="group block">
      <Card className={cn('hover:border-primary/30 transition-colors hover:shadow-md', className)}>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
          <div className="flex flex-col gap-1.5 overflow-hidden">
            <CardTitle className="truncate text-base font-semibold">{report.title}</CardTitle>
            <CardDescription className="text-xs font-medium">
              {report.reportCode} · {report.category.name}
            </CardDescription>
          </div>
          <StatusBadge status={report.status as ReportStatusValue} className="shrink-0" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm leading-relaxed">{truncateText(report.description, 120)}</p>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {report.address ? (
              <span className="truncate" title={report.address}>
                {truncateText(report.address, 40)}
              </span>
            ) : null}
            <span>
              {tDashboard('createdAt')}: {formatDate(report.createdAt, locale)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
