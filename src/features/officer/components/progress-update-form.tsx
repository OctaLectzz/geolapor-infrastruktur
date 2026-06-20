'use client'

import { useCallback, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, UploadCloud } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { createFieldUpdate, submitTaskReview } from '@/features/officer/services/officer-task-service'

import type { OfficerTaskDetailDto } from '@/types/report'

interface ProgressUpdateFormProps {
  task: OfficerTaskDetailDto
  onTaskUpdated?: (task: OfficerTaskDetailDto) => void
}

interface ProgressFormErrors {
  note?: string
  progress?: string
  photoUrl?: string
  photoPath?: string
  reviewNote?: string
}

function isValidOptionalUrl(value: string): boolean {
  if (!value) {
    return true
  }

  try {
    const url = new URL(value)

    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function ProgressUpdateForm({ task, onTaskUpdated }: ProgressUpdateFormProps): React.ReactElement {
  const t = useTranslations('reports.officer')
  const tValidation = useTranslations('reports.validation')
  const queryClient = useQueryClient()

  const [note, setNote] = useState('')
  const [progress, setProgress] = useState(task.fieldUpdates[0]?.progress ?? 0)
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoPath, setPhotoPath] = useState('')
  const [reviewNote, setReviewNote] = useState('')
  const [errors, setErrors] = useState<ProgressFormErrors>({})

  const invalidateTaskQueries = useCallback((): void => {
    void queryClient.invalidateQueries({ queryKey: ['officer', 'tasks'] })
    void queryClient.invalidateQueries({ queryKey: ['officer', 'tasks', task.id] })
  }, [queryClient, task.id])

  const updateMutation = useMutation({
    mutationFn: () => {
      const trimmedPhotoUrl = photoUrl.trim()
      const trimmedPhotoPath = photoPath.trim()

      return createFieldUpdate(task.id, {
        note: note.trim(),
        progress,
        photoUrl: trimmedPhotoUrl.length > 0 ? trimmedPhotoUrl : undefined,
        photoPath: trimmedPhotoPath.length > 0 ? trimmedPhotoPath : undefined
      })
    },
    onSuccess: (updatedTask) => {
      toast.success(t('messages.progressUpdateSuccess'))
      setNote('')
      setPhotoUrl('')
      setPhotoPath('')
      setErrors({})
      invalidateTaskQueries()
      onTaskUpdated?.(updatedTask)
    },
    onError: () => {
      toast.error(t('messages.progressUpdateError'))
    }
  })

  const reviewMutation = useMutation({
    mutationFn: () => {
      const trimmedNote = reviewNote.trim()

      return submitTaskReview(task.id, {
        note: trimmedNote.length > 0 ? trimmedNote : undefined
      })
    },
    onSuccess: (updatedTask) => {
      toast.success(t('messages.reviewSubmitSuccess'))
      setReviewNote('')
      setErrors({})
      invalidateTaskQueries()
      onTaskUpdated?.(updatedTask)
    },
    onError: () => {
      toast.error(t('messages.reviewSubmitError'))
    }
  })

  const validateUpdate = useCallback((): boolean => {
    const nextErrors: ProgressFormErrors = {}
    const trimmedNote = note.trim()
    const trimmedPhotoUrl = photoUrl.trim()
    const trimmedPhotoPath = photoPath.trim()

    if (trimmedNote.length === 0) {
      nextErrors.note = tValidation('noteRequired')
    } else if (trimmedNote.length < 5) {
      nextErrors.note = tValidation('noteMinLength')
    } else if (trimmedNote.length > 500) {
      nextErrors.note = tValidation('noteMaxLength')
    }

    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      nextErrors.progress = tValidation('progressRange')
    }

    if (!isValidOptionalUrl(trimmedPhotoUrl)) {
      nextErrors.photoUrl = tValidation('photoUrlInvalid')
    }

    if (trimmedPhotoPath.length > 0 && trimmedPhotoUrl.length === 0) {
      nextErrors.photoUrl = tValidation('photoUrlRequired')
    }

    if (trimmedPhotoUrl.length > 0 && trimmedPhotoPath.length === 0) {
      nextErrors.photoPath = tValidation('photoPathRequired')
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }, [note, photoPath, photoUrl, progress, tValidation])

  const validateReview = useCallback((): boolean => {
    const nextErrors: ProgressFormErrors = {}

    if (reviewNote.trim().length > 500) {
      nextErrors.reviewNote = tValidation('noteMaxLength')
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }, [reviewNote, tValidation])

  const handleUpdateSubmit = useCallback((): void => {
    if (!validateUpdate()) {
      return
    }

    updateMutation.mutate()
  }, [updateMutation, validateUpdate])

  const handleReviewSubmit = useCallback((): void => {
    if (!validateReview()) {
      return
    }

    reviewMutation.mutate()
  }, [reviewMutation, validateReview])

  const isBusy = updateMutation.isPending || reviewMutation.isPending
  const canSubmitReview = task.status === 'IN_PROGRESS'

  return (
    <Card className="border-primary/20 bg-card/95 shadow-primary/5 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UploadCloud className="text-primary size-4" aria-hidden="true" />
          {t('progressForm.title')}
        </CardTitle>
        <CardDescription>{t('progressForm.description')}</CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup className="gap-5">
          <Field data-invalid={Boolean(errors.progress)}>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="task-progress">{t('progressValue')}</FieldLabel>
              <span className="text-foreground font-mono text-sm font-semibold">{progress}%</span>
            </div>
            <Input
              id="task-progress"
              type="range"
              min={0}
              max={100}
              step={1}
              value={progress}
              onChange={(event) => {
                setProgress(Number(event.target.value))
                setErrors((currentErrors) => ({ ...currentErrors, progress: undefined }))
              }}
              disabled={isBusy}
              aria-invalid={Boolean(errors.progress)}
            />
            <Progress value={progress} className="h-2" />
            <FieldError>{errors.progress}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.note)}>
            <FieldLabel htmlFor="progress-note">{t('progressNote')}</FieldLabel>
            <Textarea
              id="progress-note"
              value={note}
              onChange={(event) => {
                setNote(event.target.value)
                setErrors((currentErrors) => ({ ...currentErrors, note: undefined }))
              }}
              placeholder={t('progressForm.notePlaceholder')}
              maxLength={500}
              rows={4}
              disabled={isBusy}
              aria-invalid={Boolean(errors.note)}
            />
            <FieldDescription>{t('progressForm.noteHelper')}</FieldDescription>
            <FieldError>{errors.note}</FieldError>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.photoUrl)}>
              <FieldLabel htmlFor="progress-photo-url">{t('progressPhotoUrl')}</FieldLabel>
              <Input
                id="progress-photo-url"
                value={photoUrl}
                onChange={(event) => {
                  setPhotoUrl(event.target.value)
                  setErrors((currentErrors) => ({ ...currentErrors, photoUrl: undefined }))
                }}
                placeholder={t('progressForm.photoUrlPlaceholder')}
                disabled={isBusy}
                aria-invalid={Boolean(errors.photoUrl)}
              />
              <FieldError>{errors.photoUrl}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.photoPath)}>
              <FieldLabel htmlFor="progress-photo-path">{t('progressPhotoPath')}</FieldLabel>
              <Input
                id="progress-photo-path"
                value={photoPath}
                onChange={(event) => {
                  setPhotoPath(event.target.value)
                  setErrors((currentErrors) => ({ ...currentErrors, photoPath: undefined }))
                }}
                placeholder={t('progressForm.photoPathPlaceholder')}
                disabled={isBusy}
                aria-invalid={Boolean(errors.photoPath)}
              />
              <FieldDescription>{t('progressForm.photoHelper')}</FieldDescription>
              <FieldError>{errors.photoPath}</FieldError>
            </Field>
          </div>
        </FieldGroup>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-4">
        <Button onClick={handleUpdateSubmit} disabled={isBusy}>
          {updateMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
          {updateMutation.isPending ? t('actions.submittingProgress') : t('submitProgress')}
        </Button>

        <div className="bg-muted/30 rounded-xl border p-4">
          <Field data-invalid={Boolean(errors.reviewNote)}>
            <FieldLabel htmlFor="review-note">{t('reviewNote')}</FieldLabel>
            <Textarea
              id="review-note"
              value={reviewNote}
              onChange={(event) => {
                setReviewNote(event.target.value)
                setErrors((currentErrors) => ({ ...currentErrors, reviewNote: undefined }))
              }}
              placeholder={t('progressForm.reviewNotePlaceholder')}
              maxLength={500}
              rows={3}
              disabled={isBusy || !canSubmitReview}
              aria-invalid={Boolean(errors.reviewNote)}
            />
            <FieldDescription>{canSubmitReview ? t('progressForm.reviewHelper') : t('progressForm.reviewDisabledHelper')}</FieldDescription>
            <FieldError>{errors.reviewNote}</FieldError>
          </Field>

          <Button className="mt-4 w-full" variant="secondary" onClick={handleReviewSubmit} disabled={isBusy || !canSubmitReview}>
            {reviewMutation.isPending ? <Spinner data-icon="inline-start" /> : <Send className="size-4" aria-hidden="true" />}
            {reviewMutation.isPending ? t('actions.submittingReview') : t('submitReview')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
