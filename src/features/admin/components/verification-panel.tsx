'use client'

import { useCallback, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

import { rejectReport, verifyReport } from '@/features/admin/services/admin-report-service'

import type { ReportDetailDto } from '@/types/report'

interface VerificationPanelProps {
  report: ReportDetailDto
  onActionComplete?: (updatedReport: ReportDetailDto) => void
}

export function VerificationPanel({ report, onActionComplete }: VerificationPanelProps): React.ReactElement {
  const t = useTranslations('dashboard.admin')
  const tReports = useTranslations('reports.admin')
  const tFields = useTranslations('reports.admin.fields')
  const tValidation = useTranslations('reports.validation')

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionNote, setRejectionNote] = useState('')
  const [rejectionError, setRejectionError] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const invalidateAdminReports = useCallback((): void => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
  }, [queryClient])

  const verifyMutation = useMutation({
    mutationFn: () => verifyReport(report.id),
    onSuccess: (updatedReport) => {
      toast.success(tReports('messages.verifySuccess'))
      invalidateAdminReports()
      onActionComplete?.(updatedReport)
    },
    onError: () => {
      toast.error(tReports('messages.verifySuccess'))
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (note: string) => rejectReport(report.id, note),
    onSuccess: (updatedReport) => {
      toast.success(tReports('messages.rejectSuccess'))
      setRejectDialogOpen(false)
      setRejectionNote('')
      setRejectionError(null)
      invalidateAdminReports()
      onActionComplete?.(updatedReport)
    },
    onError: () => {
      toast.error(tReports('messages.rejectSuccess'))
    }
  })

  const handleReject = useCallback((): void => {
    const trimmedNote = rejectionNote.trim()

    if (trimmedNote.length === 0) {
      setRejectionError(tValidation('rejectionNoteRequired'))

      return
    }

    if (trimmedNote.length < 5) {
      setRejectionError(tValidation('rejectionNoteMinLength'))

      return
    }

    setRejectionError(null)
    rejectMutation.mutate(trimmedNote)
  }, [rejectionNote, rejectMutation, tValidation])

  const isPending = report.status === 'PENDING_VERIFICATION'

  if (!isPending) {
    return <></>
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-base">{t('pendingReports')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => verifyMutation.mutate()} disabled={verifyMutation.isPending || rejectMutation.isPending} className="flex-1">
          {verifyMutation.isPending ? '...' : t('actions.verify')}
        </Button>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" disabled={verifyMutation.isPending || rejectMutation.isPending} className="flex-1">
              {t('actions.reject')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('actions.reject')}</DialogTitle>
              <DialogDescription>
                {report.reportCode} — {report.title}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <label htmlFor="rejection-note" className="text-sm font-medium">
                {tFields('rejectionNote')}
              </label>
              <Textarea
                id="rejection-note"
                value={rejectionNote}
                onChange={(event) => {
                  setRejectionNote(event.target.value)
                  setRejectionError(null)
                }}
                placeholder={tFields('rejectionNote')}
                rows={4}
                maxLength={500}
              />
              {rejectionError ? <p className="text-destructive text-sm">{rejectionError}</p> : null}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={rejectMutation.isPending}>
                {t('actions.cancel')}
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
                {rejectMutation.isPending ? '...' : t('actions.reject')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
