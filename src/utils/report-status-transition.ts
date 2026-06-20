import type { ReportStatus } from '@/types/report'

const ALLOWED_REPORT_STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  PENDING_VERIFICATION: ['VERIFIED', 'REJECTED'],
  VERIFIED: ['ASSIGNED'],
  REJECTED: [],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['NEED_REVIEW', 'CANCELLED'],
  NEED_REVIEW: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: []
}

export function getAllowedNextReportStatuses(status: ReportStatus): ReportStatus[] {
  return [...ALLOWED_REPORT_STATUS_TRANSITIONS[status]]
}

export function canTransitionReportStatus(from: ReportStatus, to: ReportStatus): boolean {
  return ALLOWED_REPORT_STATUS_TRANSITIONS[from].includes(to)
}

export function assertValidReportStatusTransition(from: ReportStatus, to: ReportStatus): void {
  if (!canTransitionReportStatus(from, to)) {
    throw new Error(`Invalid report status transition: ${from} -> ${to}`)
  }
}
