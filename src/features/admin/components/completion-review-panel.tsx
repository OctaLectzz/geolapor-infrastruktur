'use client'

import { useCallback, useMemo, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Clock3 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

import { completeReport, requestReportRevision } from '@/features/admin/services/admin-report-service'

import type { FieldUpdateDto, ReportDetailDto } from '@/types/report'

interface CompletionReviewPanelProps {
  report: ReportDetailDto
  onActionComplete?: (updatedReport: ReportDetailDto) => void
}

interface ReviewFormErrors {
  completeNote?: string
  revisionNote?: string
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

export function CompletionReviewPanel({ report, onActionComplete }: CompletionReviewPanelProps): React.ReactElement {
  const t = useTranslations('reports.admin')
  const tCommon = useTranslations('common.actions')
  const tValidation = useTranslations('reports.validation')
  const locale = useLocale()
  const queryClient = useQueryClient()

  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false)
  const [completeNote, setCompleteNote] = useState('')
  const [revisionNote, setRevisionNote] = useState('')
  const [errors, setErrors] = useState<ReviewFormErrors>({})

  const isReviewable = report.status === 'NEED_REVIEW'
  const hasProgressPhoto = useMemo((): boolean => report.fieldUpdates.some((update) => Boolean(update.photoUrl)), [report.fieldUpdates])

  const invalidateAdminReports = useCallback((): void => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
  }, [queryClient])

  const completeMutation = useMutation({
    mutationFn: () => {
      const trimmedNote = completeNote.trim()

      return completeReport(report.id, {
        note: trimmedNote.length > 0 ? trimmedNote : undefined
      })
    },
    onSuccess: (updatedReport) => {
      toast.success(t('messages.completeSuccess'))
      setCompleteDialogOpen(false)
      setCompleteNote('')
      setErrors((currentErrors) => ({ ...currentErrors, completeNote: undefined }))
      invalidateAdminReports()
      onActionComplete?.(updatedReport)
    },
    onError: () => {
      toast.error(t('messages.completeError'))
    }
  })

  const revisionMutation = useMutation({
    mutationFn: (note: string) => requestReportRevision(report.id, { note }),
    onSuccess: (updatedReport) => {
      toast.success(t('messages.revisionSuccess'))
      setRevisionDialogOpen(false)
      setRevisionNote('')
      setErrors((currentErrors) => ({ ...currentErrors, revisionNote: undefined }))
      invalidateAdminReports()
      onActionComplete?.(updatedReport)
    },
    onError: () => {
      toast.error(t('messages.revisionError'))
    }
  })

  const validateCompleteNote = useCallback((): boolean => {
    const trimmedNote = completeNote.trim()
    const nextErrors: ReviewFormErrors = {}

    if (!hasProgressPhoto && trimmedNote.length < 5) {
      nextErrors.completeNote = tValidation('completionOverrideNoteRequired')
    }

    if (trimmedNote.length > 500) {
      nextErrors.completeNote = tValidation('noteMaxLength')
    }

    setErrors((currentErrors) => ({ ...currentErrors, ...nextErrors, completeNote: nextErrors.completeNote }))

    return !nextErrors.completeNote
  }, [completeNote, hasProgressPhoto, tValidation])

  const validateRevisionNote = useCallback((): string | null => {
    const trimmedNote = revisionNote.trim()
    let error: string | undefined

    if (trimmedNote.length === 0) {
      error = tValidation('revisionNoteRequired')
    } else if (trimmedNote.length < 5) {
      error = tValidation('revisionNoteMinLength')
    } else if (trimmedNote.length > 500) {
      error = tValidation('noteMaxLength')
    }

    setErrors((currentErrors) => ({ ...currentErrors, revisionNote: error }))

    return error ? null : trimmedNote
  }, [revisionNote, tValidation])

  const handleComplete = useCallback((): void => {
    if (!validateCompleteNote()) {
      return
    }

    completeMutation.mutate()
  }, [completeMutation, validateCompleteNote])

  const handleRequestRevision = useCallback((): void => {
    const validatedNote = validateRevisionNote()

    if (!validatedNote) {
      return
    }

    revisionMutation.mutate(validatedNote)
  }, [revisionMutation, validateRevisionNote])

  if (!isReviewable && report.fieldUpdates.length === 0) {
    return <></>
  }

  return (
    <Card className="border-primary/20 bg-card/95">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">{t('review.title')}</CardTitle>
            <CardDescription>{t('review.description')}</CardDescription>
          </div>
          {isReviewable ? <Badge variant="secondary">{t('review.readyBadge')}</Badge> : null}
        </div>
      </CardHeader>

      <CardContent>
        {report.fieldUpdates.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('review.emptyFieldUpdates')}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {report.fieldUpdates.map((update) => (
              <FieldUpdateReviewItem key={update.id} update={update} locale={locale} />
            ))}
          </div>
        )}
      </CardContent>

      {isReviewable ? (
        <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
          <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={completeMutation.isPending || revisionMutation.isPending}>
                {t('actions.requestRevision')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('review.revisionDialogTitle')}</DialogTitle>
                <DialogDescription>{t('review.revisionDialogDescription')}</DialogDescription>
              </DialogHeader>
              <Field data-invalid={Boolean(errors.revisionNote)}>
                <FieldLabel htmlFor="revision-note">{t('fields.revisionNote')}</FieldLabel>
                <Textarea
                  id="revision-note"
                  value={revisionNote}
                  onChange={(event) => {
                    setRevisionNote(event.target.value)
                    setErrors((currentErrors) => ({ ...currentErrors, revisionNote: undefined }))
                  }}
                  placeholder={t('review.revisionNotePlaceholder')}
                  maxLength={500}
                  rows={4}
                  disabled={revisionMutation.isPending}
                  aria-invalid={Boolean(errors.revisionNote)}
                />
                <FieldDescription>{t('review.revisionNoteHelper')}</FieldDescription>
                <FieldError>{errors.revisionNote}</FieldError>
              </Field>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRevisionDialogOpen(false)} disabled={revisionMutation.isPending}>
                  {tCommon('cancel')}
                </Button>
                <Button variant="secondary" onClick={handleRequestRevision} disabled={revisionMutation.isPending}>
                  {revisionMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
                  {revisionMutation.isPending ? t('actions.requestingRevision') : t('actions.requestRevision')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={completeMutation.isPending || revisionMutation.isPending || report.fieldUpdates.length === 0}>
                {t('actions.complete')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('review.completeDialogTitle')}</DialogTitle>
                <DialogDescription>{t('review.completeDialogDescription')}</DialogDescription>
              </DialogHeader>
              <Field data-invalid={Boolean(errors.completeNote)}>
                <FieldLabel htmlFor="complete-note">{t('fields.completionNote')}</FieldLabel>
                <Textarea
                  id="complete-note"
                  value={completeNote}
                  onChange={(event) => {
                    setCompleteNote(event.target.value)
                    setErrors((currentErrors) => ({ ...currentErrors, completeNote: undefined }))
                  }}
                  placeholder={t('review.completeNotePlaceholder')}
                  maxLength={500}
                  rows={4}
                  disabled={completeMutation.isPending}
                  aria-invalid={Boolean(errors.completeNote)}
                />
                <FieldDescription>{hasProgressPhoto ? t('review.completeNoteHelper') : t('review.completeOverrideHelper')}</FieldDescription>
                <FieldError>{errors.completeNote}</FieldError>
              </Field>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCompleteDialogOpen(false)} disabled={completeMutation.isPending}>
                  {tCommon('cancel')}
                </Button>
                <Button onClick={handleComplete} disabled={completeMutation.isPending}>
                  {completeMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
                  {completeMutation.isPending ? t('actions.completing') : t('actions.complete')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      ) : null}
    </Card>
  )
}

function FieldUpdateReviewItem({ update, locale }: { update: FieldUpdateDto; locale: string }): React.ReactElement {
  const t = useTranslations('reports.admin.review')

  return (
    <article className="from-muted/50 to-card grid gap-4 rounded-xl border bg-linear-to-br p-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Clock3 className="size-4" aria-hidden="true" />
            {formatDate(update.createdAt, locale)}
          </div>
          <Badge variant="outline" className="w-fit font-mono">
            {t('progressValue', { value: update.progress })}
          </Badge>
        </div>
        <Progress value={update.progress} className="h-2" />
        <p className="text-foreground text-sm leading-relaxed">{update.note}</p>
      </div>

      <div className="flex flex-col gap-2">
        {update.photoUrl ? (
          <>
            <a
              href={update.photoUrl}
              target="_blank"
              rel="noreferrer"
              className="group bg-muted relative aspect-video overflow-hidden rounded-lg border"
            >
              <Image
                src={update.photoUrl}
                alt={t('progressPhotoAlt')}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="12rem"
              />
            </a>
            <Button variant="outline" size="sm" asChild>
              <a href={update.photoUrl} target="_blank" rel="noreferrer">
                <Camera className="size-4" aria-hidden="true" />
                {t('viewProgressPhoto')}
              </a>
            </Button>
          </>
        ) : (
          <div className="text-muted-foreground bg-muted/30 flex aspect-video items-center justify-center rounded-lg border border-dashed px-3 text-center text-xs">
            {t('noProgressPhoto')}
          </div>
        )}
      </div>
    </article>
  )
}
