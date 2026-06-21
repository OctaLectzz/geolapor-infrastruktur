'use client'

import { useCallback, useState } from 'react'

import { useRouter } from '@/i18n/navigation'

import { AssignmentPanel } from '@/features/admin/components/assignment-panel'
import { CompletionReviewPanel } from '@/features/admin/components/completion-review-panel'
import { VerificationPanel } from '@/features/admin/components/verification-panel'

import type { ReportDetailDto } from '@/types/report'

interface AdminReportDetailClientProps {
  report: ReportDetailDto
}

export function AdminReportDetailClient({ report: initialReport }: AdminReportDetailClientProps): React.ReactElement {
  const [report, setReport] = useState<ReportDetailDto>(initialReport)
  const router = useRouter()

  const handleActionComplete = useCallback(
    (updatedReport: ReportDetailDto): void => {
      setReport(updatedReport)
      router.refresh()
    },
    [router]
  )

  return (
    <div className="flex flex-col gap-6">
      <VerificationPanel report={report} onActionComplete={handleActionComplete} />
      <AssignmentPanel report={report} onActionComplete={handleActionComplete} />
      <CompletionReviewPanel report={report} onActionComplete={handleActionComplete} />
    </div>
  )
}
