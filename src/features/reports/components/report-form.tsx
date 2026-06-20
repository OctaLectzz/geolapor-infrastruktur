'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from '@/i18n/navigation'
import { createReportSchema } from '@/schemas/report-schema'
import type { EvidencePhotoMetadata, ReportCreationInput } from '@/types/report'

import { createReport, fetchCategories, uploadReportPhoto } from '../services/report-service'
import { LocationPicker, type SelectedCoordinates } from './location-picker'
import { PhotoUploader, type EvidencePhotoSelection } from './photo-uploader'

const reportFormSchema = createReportSchema.omit({ evidencePhotos: true })

type ReportFormValues = z.infer<typeof reportFormSchema>

function getFieldErrorMessage(message: string | undefined, t: ReturnType<typeof useTranslations>): string | undefined {
  if (!message) {
    return undefined
  }

  return t(message)
}

function createPhotoPayload(photo: EvidencePhotoSelection, uploadedPhoto: { path: string; url: string }): EvidencePhotoMetadata {
  return {
    path: uploadedPhoto.path,
    url: uploadedPhoto.url,
    mimeType: photo.metadata.mimeType,
    size: photo.metadata.size,
    type: photo.metadata.type
  }
}

export function ReportForm(): ReactNode {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [selectedPhotos, setSelectedPhotos] = useState<EvidencePhotoSelection[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: ({ signal }) => fetchCategories(signal)
  })

  const uploadMutation = useMutation({
    mutationFn: uploadReportPhoto
  })

  const createReportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['reports', 'my'] })
      toast.success(t('reports.form.messages.createSuccess'))
      router.push(`/reports/${data.report.id}`)
    }
  })

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      latitude: undefined,
      longitude: undefined,
      address: ''
    }
  })

  const categoryId = useWatch({ control: form.control, name: 'categoryId' })
  const latitude = useWatch({ control: form.control, name: 'latitude' })
  const longitude = useWatch({ control: form.control, name: 'longitude' })

  const isSubmitting = uploadMutation.isPending || createReportMutation.isPending || form.formState.isSubmitting
  const categories = categoriesQuery.data?.items ?? []

  function handleLocationChange(coordinates: SelectedCoordinates): void {
    form.setValue('latitude', coordinates.latitude, { shouldDirty: true, shouldValidate: true })
    form.setValue('longitude', coordinates.longitude, { shouldDirty: true, shouldValidate: true })
  }

  function handlePhotoChange(photos: EvidencePhotoSelection[]): void {
    setSelectedPhotos(photos)

    if (photos.length > 0) {
      setPhotoError(null)
    }
  }

  async function handleSubmit(values: ReportFormValues): Promise<void> {
    setFormError(null)

    if (selectedPhotos.length === 0) {
      setPhotoError(t('reports.form.validation.photoRequired'))
      return
    }

    setPhotoError(null)

    try {
      const uploadedPhotos = await Promise.all(selectedPhotos.map((photo) => uploadMutation.mutateAsync(photo.file)))
      const evidencePhotos = selectedPhotos.map((photo, index) => createPhotoPayload(photo, uploadedPhotos[index]))
      const payload: ReportCreationInput = {
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        latitude: values.latitude,
        longitude: values.longitude,
        address: values.address,
        evidencePhotos
      }

      await createReportMutation.mutateAsync(payload)
    } catch {
      setFormError(t('reports.form.messages.createError'))
      toast.error(t('reports.form.messages.createError'))
    }
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.7fr)]" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="flex flex-col gap-6">
        <Card className="border-primary/10 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>{t('reports.form.sections.basicInfo')}</CardTitle>
            <CardDescription>{t('reports.form.helpers.basicInfo')}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(form.formState.errors.title)}>
                <FieldLabel htmlFor="report-title">{t('reports.form.fields.title')}</FieldLabel>
                <Input
                  id="report-title"
                  type="text"
                  placeholder={t('reports.form.placeholders.title')}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(form.formState.errors.title)}
                  {...form.register('title')}
                />
                <FieldError>{getFieldErrorMessage(form.formState.errors.title?.message, t)}</FieldError>
              </Field>

              <Field data-invalid={Boolean(form.formState.errors.categoryId)}>
                <FieldLabel htmlFor="report-category">{t('reports.form.fields.category')}</FieldLabel>
                {categoriesQuery.isPending ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Select
                    value={categoryId}
                    disabled={isSubmitting || categoriesQuery.isError || categories.length === 0}
                    onValueChange={(value) => form.setValue('categoryId', value, { shouldDirty: true, shouldValidate: true })}
                  >
                    <SelectTrigger id="report-category" className="w-full" aria-invalid={Boolean(form.formState.errors.categoryId)}>
                      <SelectValue placeholder={t('reports.form.placeholders.category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
                {categoriesQuery.isError ? <FieldDescription>{t('reports.form.messages.categoryLoadError')}</FieldDescription> : null}
                {!categoriesQuery.isPending && !categoriesQuery.isError && categories.length === 0 ? (
                  <FieldDescription>{t('reports.form.messages.categoryEmpty')}</FieldDescription>
                ) : null}
                <FieldError>{getFieldErrorMessage(form.formState.errors.categoryId?.message, t)}</FieldError>
              </Field>

              <Field data-invalid={Boolean(form.formState.errors.description)}>
                <FieldLabel htmlFor="report-description">{t('reports.form.fields.description')}</FieldLabel>
                <Textarea
                  id="report-description"
                  placeholder={t('reports.form.placeholders.description')}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(form.formState.errors.description)}
                  rows={6}
                  {...form.register('description')}
                />
                <FieldError>{getFieldErrorMessage(form.formState.errors.description?.message, t)}</FieldError>
              </Field>

              <Field data-invalid={Boolean(form.formState.errors.address)}>
                <FieldLabel htmlFor="report-address">{t('reports.form.fields.address')}</FieldLabel>
                <Input
                  id="report-address"
                  type="text"
                  placeholder={t('reports.form.placeholders.address')}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(form.formState.errors.address)}
                  {...form.register('address')}
                />
                <FieldDescription>{t('reports.form.helpers.address')}</FieldDescription>
                <FieldError>{getFieldErrorMessage(form.formState.errors.address?.message, t)}</FieldError>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <PhotoUploader onChange={handlePhotoChange} disabled={isSubmitting} />
        {photoError ? (
          <Alert variant="destructive">
            <AlertTitle>{t('reports.form.messages.photoRequiredTitle')}</AlertTitle>
            <AlertDescription>{photoError}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="flex flex-col gap-6">
        <LocationPicker
          value={latitude !== undefined && longitude !== undefined ? { latitude, longitude } : null}
          disabled={isSubmitting}
          onChange={handleLocationChange}
        />
        {form.formState.errors.latitude || form.formState.errors.longitude ? (
          <Alert variant="destructive">
            <AlertTitle>{t('reports.form.messages.locationRequiredTitle')}</AlertTitle>
            <AlertDescription>
              {getFieldErrorMessage(form.formState.errors.latitude?.message ?? form.formState.errors.longitude?.message, t)}
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="border-primary/15 bg-primary/5 shadow-sm">
          <CardHeader>
            <CardTitle>{t('reports.form.summary.title')}</CardTitle>
            <CardDescription>{t('reports.form.summary.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {formError ? (
              <Alert variant="destructive">
                <AlertTitle>{t('reports.form.messages.createErrorTitle')}</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ) : null}
            <div className="text-muted-foreground flex flex-col gap-2 text-sm">
              <p>{t('reports.form.summary.categoryCount', { count: categories.length })}</p>
              <p>{t('reports.form.summary.photoCount', { count: selectedPhotos.length })}</p>
            </div>
            <Button id="report-create-submit" type="submit" className="w-full" disabled={isSubmitting || categoriesQuery.isPending}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              {isSubmitting ? t('reports.form.actions.submitting') : t('reports.form.actions.submit')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
