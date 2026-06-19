import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export type ReportStatusValue =
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'NEED_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'

interface StatusBadgeProps {
  status: ReportStatusValue
  className?: string
}

const STATUS_LABEL_KEYS: Record<ReportStatusValue, string> = {
  PENDING_VERIFICATION: 'pendingVerification',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'inProgress',
  NEED_REVIEW: 'needReview',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

const STATUS_STYLES: Record<ReportStatusValue, string> = {
  PENDING_VERIFICATION: 'bg-warning text-warning-foreground',
  VERIFIED: 'bg-info text-info-foreground',
  REJECTED: 'bg-destructive text-white',
  ASSIGNED: 'bg-secondary text-secondary-foreground',
  IN_PROGRESS: 'bg-warning text-warning-foreground',
  NEED_REVIEW: 'bg-info text-info-foreground',
  COMPLETED: 'bg-success text-success-foreground',
  CANCELLED: 'bg-muted text-muted-foreground'
}

const STATUS_DOT_STYLES: Record<ReportStatusValue, string> = {
  PENDING_VERIFICATION: 'bg-warning-foreground',
  VERIFIED: 'bg-info-foreground',
  REJECTED: 'bg-white',
  ASSIGNED: 'bg-secondary-foreground',
  IN_PROGRESS: 'bg-warning-foreground',
  NEED_REVIEW: 'bg-info-foreground',
  COMPLETED: 'bg-success-foreground',
  CANCELLED: 'bg-muted-foreground'
}

export function StatusBadge({ status, className }: StatusBadgeProps): React.ReactNode {
  const t = useTranslations('common.status')

  return (
    <Badge className={cn(STATUS_STYLES[status], className)}>
      <span className={cn('size-1.5 rounded-full', STATUS_DOT_STYLES[status])} aria-hidden="true" />
      {t(STATUS_LABEL_KEYS[status])}
    </Badge>
  )
}
