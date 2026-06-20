'use client'

import type { ChangeEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ACCEPTED_EVIDENCE_PHOTO_MIME_TYPES, MAX_EVIDENCE_PHOTO_SIZE_BYTES } from '@/schemas/report-schema'

interface PhotoUploaderProps {
  onChange: (photos: EvidencePhotoSelection[]) => void
  className?: string
  disabled?: boolean
  maxFiles?: number
}

export interface EvidencePhotoMetadata {
  id: string
  mimeType: string
  size: number
  type: 'BEFORE'
}

export interface EvidencePhotoSelection {
  file: File
  metadata: EvidencePhotoMetadata
  previewUrl: string
}

type PhotoUploaderError = 'invalid-type' | 'invalid-size' | null

const ACCEPTED_MIME_TYPES = new Set<string>(ACCEPTED_EVIDENCE_PHOTO_MIME_TYPES)
const MAX_SIZE_MEGABYTES = Math.round(MAX_EVIDENCE_PHOTO_SIZE_BYTES / 1024 / 1024)

function createSafeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function formatFileSize(size: number): string {
  return (size / 1024 / 1024).toFixed(2)
}

function getSelectedCountLabel(count: number, t: ReturnType<typeof useTranslations>): string {
  if (count === 1) {
    return t('selectedCount', { count })
  }

  return t('selectedCountPlural', { count })
}

export function PhotoUploader({ onChange, className, disabled = false, maxFiles }: PhotoUploaderProps): ReactNode {
  const t = useTranslations('reports.form.photoUploader')
  const [photos, setPhotos] = useState<EvidencePhotoSelection[]>([])
  const [error, setError] = useState<PhotoUploaderError>(null)
  const objectUrlsRef = useRef<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement | null>(null)
  const canAddMore = maxFiles === undefined || photos.length < maxFiles

  useEffect(() => {
    const objectUrls = objectUrlsRef.current

    return () => {
      objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl))
      objectUrls.clear()
    }
  }, [])

  function updatePhotos(nextPhotos: EvidencePhotoSelection[]): void {
    setPhotos(nextPhotos)
    onChange(nextPhotos)
  }

  function createPhotoSelection(file: File): EvidencePhotoSelection | null {
    if (!ACCEPTED_MIME_TYPES.has(file.type)) {
      setError('invalid-type')
      return null
    }

    if (file.size > MAX_EVIDENCE_PHOTO_SIZE_BYTES) {
      setError('invalid-size')
      return null
    }

    const previewUrl = URL.createObjectURL(file)
    const id = createSafeId()

    objectUrlsRef.current.add(previewUrl)

    return {
      file,
      previewUrl,
      metadata: {
        id,
        mimeType: file.type,
        size: file.size,
        type: 'BEFORE'
      }
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const fileList = event.target.files

    if (!fileList) {
      return
    }

    setError(null)

    const availableSlots = maxFiles === undefined ? fileList.length : Math.max(maxFiles - photos.length, 0)
    const selectedFiles = Array.from(fileList).slice(0, availableSlots)
    const nextSelections = selectedFiles
      .map((file) => createPhotoSelection(file))
      .filter((selection): selection is EvidencePhotoSelection => selection !== null)

    if (nextSelections.length > 0) {
      updatePhotos([...photos, ...nextSelections])
    }

    event.target.value = ''
  }

  function handleRemovePhoto(photoId: string): void {
    const photoToRemove = photos.find((photo) => photo.metadata.id === photoId)

    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.previewUrl)
      objectUrlsRef.current.delete(photoToRemove.previewUrl)
    }

    updatePhotos(photos.filter((photo) => photo.metadata.id !== photoId))
  }

  function handleChoosePhotos(): void {
    inputRef.current?.click()
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {error === 'invalid-type' ? (
          <Alert variant="destructive">
            <AlertTitle>{t('invalidTypeTitle')}</AlertTitle>
            <AlertDescription>{t('invalidTypeDescription')}</AlertDescription>
          </Alert>
        ) : null}

        {error === 'invalid-size' ? (
          <Alert variant="destructive">
            <AlertTitle>{t('invalidSizeTitle')}</AlertTitle>
            <AlertDescription>{t('invalidSizeDescription', { maxSize: MAX_SIZE_MEGABYTES })}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="report-evidence-photos">{t('label')}</Label>
          <Input
            ref={inputRef}
            id="report-evidence-photos"
            type="file"
            accept={ACCEPTED_EVIDENCE_PHOTO_MIME_TYPES.join(',')}
            multiple
            className="sr-only"
            disabled={disabled || !canAddMore}
            onChange={handleFileChange}
          />
          <div className="border-primary/25 bg-primary/5 rounded-xl border border-dashed p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-foreground text-sm font-medium">{photos.length > 0 ? getSelectedCountLabel(photos.length, t) : t('empty')}</p>
                <p className="text-muted-foreground text-sm">{t('helper', { maxSize: MAX_SIZE_MEGABYTES })}</p>
              </div>
              <Button
                id="report-evidence-choose-photos"
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={disabled || !canAddMore}
                onClick={handleChoosePhotos}
              >
                {t('button')}
              </Button>
            </div>
          </div>
          {photos.length === 0 ? <p className="text-destructive text-sm">{t('selectionRequired')}</p> : null}
        </div>

        {photos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.metadata.id} className="bg-card overflow-hidden rounded-xl border shadow-xs">
                <div className="bg-muted relative aspect-4/3">
                  <Image
                    src={photo.previewUrl}
                    alt={t('previewAlt')}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="space-y-3 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{photo.metadata.mimeType}</Badge>
                    <Badge variant="outline">{t('fileSize', { size: formatFileSize(photo.metadata.size) })}</Badge>
                  </div>
                  <Button
                    id={`report-evidence-remove-${photo.metadata.id}`}
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    disabled={disabled}
                    onClick={() => handleRemovePhoto(photo.metadata.id)}
                  >
                    {t('remove')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
