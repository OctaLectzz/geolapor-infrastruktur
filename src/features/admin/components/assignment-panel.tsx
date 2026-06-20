'use client'

import { useCallback, useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

import { assignReport, fetchActiveOfficers } from '@/features/admin/services/admin-report-service'

import type { ReportDetailDto } from '@/types/report'

interface AssignmentPanelProps {
  report: ReportDetailDto
  onActionComplete?: (updatedReport: ReportDetailDto) => void
}

interface AssignmentFormErrors {
  officerId?: string
  dueDate?: string
  note?: string
}

export function AssignmentPanel({ report, onActionComplete }: AssignmentPanelProps): React.ReactElement {
  const t = useTranslations('reports.admin')
  const tFields = useTranslations('reports.admin.fields')
  const tValidation = useTranslations('reports.validation')

  const [officerId, setOfficerId] = useState('')
  const [note, setNote] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [errors, setErrors] = useState<AssignmentFormErrors>({})

  const queryClient = useQueryClient()
  const isVerified = report.status === 'VERIFIED'

  const officersQuery = useQuery({
    queryKey: ['admin', 'officers'],
    queryFn: fetchActiveOfficers,
    enabled: isVerified
  })

  const officers = useMemo(() => officersQuery.data?.items ?? [], [officersQuery.data?.items])

  const invalidateAdminQueries = useCallback((): void => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'officers'] })
  }, [queryClient])

  const assignMutation = useMutation({
    mutationFn: () => {
      const trimmedNote = note.trim()

      return assignReport(report.id, {
        officerId,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        note: trimmedNote.length > 0 ? trimmedNote : undefined
      })
    },
    onSuccess: (updatedReport) => {
      toast.success(t('messages.assignSuccess'))
      setOfficerId('')
      setNote('')
      setDueDate('')
      setErrors({})
      invalidateAdminQueries()
      onActionComplete?.(updatedReport)
    },
    onError: () => {
      toast.error(t('messages.assignError'))
    }
  })

  const selectedOfficerName = useMemo((): string => {
    return officers.find((officer) => officer.id === officerId)?.fullName ?? ''
  }, [officerId, officers])

  const validateForm = useCallback((): boolean => {
    const nextErrors: AssignmentFormErrors = {}
    const trimmedNote = note.trim()

    if (!officerId) {
      nextErrors.officerId = tValidation('officerRequired')
    }

    if (trimmedNote.length > 500) {
      nextErrors.note = tValidation('noteMaxLength')
    }

    if (dueDate && Number.isNaN(new Date(dueDate).getTime())) {
      nextErrors.dueDate = tValidation('dateInvalid')
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }, [dueDate, note, officerId, tValidation])

  const handleSubmit = useCallback((): void => {
    if (!validateForm()) {
      return
    }

    assignMutation.mutate()
  }, [assignMutation, validateForm])

  const submitDisabled = !officerId || officersQuery.isPending || officersQuery.isError || assignMutation.isPending || officers.length === 0

  if (!isVerified) {
    return <></>
  }

  return (
    <Card className="border-primary/20 bg-card/95">
      <CardHeader>
        <CardTitle className="text-base">{t('assignment.title')}</CardTitle>
        <CardDescription>{t('assignment.description')}</CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup className="gap-4">
          {officersQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>{t('assignment.officersLoadErrorTitle')}</AlertTitle>
              <AlertDescription>{t('assignment.officersLoadErrorDescription')}</AlertDescription>
            </Alert>
          ) : null}

          <Field data-invalid={Boolean(errors.officerId)}>
            <FieldLabel htmlFor="assignment-officer">{tFields('officer')}</FieldLabel>
            <Select
              value={officerId}
              onValueChange={(value) => {
                setOfficerId(value)
                setErrors((currentErrors) => ({ ...currentErrors, officerId: undefined }))
              }}
              disabled={officersQuery.isPending || assignMutation.isPending || officers.length === 0}
            >
              <SelectTrigger id="assignment-officer" className="w-full" aria-invalid={Boolean(errors.officerId)}>
                <SelectValue placeholder={officersQuery.isPending ? t('assignment.loadingOfficers') : t('assignment.officerPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {officers.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.fullName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {officersQuery.isSuccess && officers.length === 0 ? <FieldDescription>{t('assignment.emptyOfficers')}</FieldDescription> : null}
            <FieldError>{errors.officerId}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.dueDate)}>
            <FieldLabel htmlFor="assignment-due-date">{tFields('dueDate')}</FieldLabel>
            <Input
              id="assignment-due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(event) => {
                setDueDate(event.target.value)
                setErrors((currentErrors) => ({ ...currentErrors, dueDate: undefined }))
              }}
              disabled={assignMutation.isPending}
              aria-invalid={Boolean(errors.dueDate)}
            />
            <FieldDescription>{t('assignment.dueDateHelper')}</FieldDescription>
            <FieldError>{errors.dueDate}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.note)}>
            <FieldLabel htmlFor="assignment-note">{tFields('assignmentNote')}</FieldLabel>
            <Textarea
              id="assignment-note"
              value={note}
              onChange={(event) => {
                setNote(event.target.value)
                setErrors((currentErrors) => ({ ...currentErrors, note: undefined }))
              }}
              placeholder={t('assignment.notePlaceholder')}
              maxLength={500}
              rows={4}
              disabled={assignMutation.isPending}
              aria-invalid={Boolean(errors.note)}
            />
            <FieldDescription>{t('assignment.noteHelper')}</FieldDescription>
            <FieldError>{errors.note}</FieldError>
          </Field>
        </FieldGroup>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          {selectedOfficerName ? t('assignment.selectedOfficer', { name: selectedOfficerName }) : t('assignment.noOfficerSelected')}
        </p>
        <Button onClick={handleSubmit} disabled={submitDisabled}>
          {assignMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
          {assignMutation.isPending ? t('actions.assigning') : t('actions.assign')}
        </Button>
      </CardFooter>
    </Card>
  )
}
