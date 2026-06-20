'use client'

import type { ChangeEvent, ReactNode } from 'react'
import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface SelectedCoordinates {
  latitude: number
  longitude: number
  accuracy?: number
}

interface LocationPickerProps {
  value?: SelectedCoordinates | null
  onChange: (coordinates: SelectedCoordinates) => void
  className?: string
  disabled?: boolean
}

type LocationStatus = 'idle' | 'locating' | 'permission-denied' | 'unsupported' | 'unavailable'

function formatCoordinate(value: number): string {
  return value.toFixed(6)
}

function parseCoordinate(value: string): number | null {
  if (!value.trim()) {
    return null
  }

  const parsedValue = Number(value)

  if (!Number.isFinite(parsedValue)) {
    return null
  }

  return parsedValue
}

function isValidLatitude(value: number): boolean {
  return value >= -90 && value <= 90
}

function isValidLongitude(value: number): boolean {
  return value >= -180 && value <= 180
}

function getInitialInputValue(value: number | undefined): string {
  return value === undefined ? '' : formatCoordinate(value)
}

export function LocationPicker({ value, onChange, className, disabled = false }: LocationPickerProps): ReactNode {
  const t = useTranslations('reports.form.locationPicker')
  const [latitudeInput, setLatitudeInput] = useState<string>(getInitialInputValue(value?.latitude))
  const [longitudeInput, setLongitudeInput] = useState<string>(getInitialInputValue(value?.longitude))
  const [status, setStatus] = useState<LocationStatus>('idle')
  const [latitudeError, setLatitudeError] = useState<string | null>(null)
  const [longitudeError, setLongitudeError] = useState<string | null>(null)
  const selectedCoordinates = value ?? null
  const isLocating = status === 'locating'

  function emitCoordinates(latitude: number, longitude: number, accuracy?: number): void {
    setLatitudeError(null)
    setLongitudeError(null)
    onChange({ latitude, longitude, accuracy })
  }

  function validateAndEmit(nextLatitudeInput: string, nextLongitudeInput: string): void {
    const latitude = parseCoordinate(nextLatitudeInput)
    const longitude = parseCoordinate(nextLongitudeInput)
    const nextLatitudeError = latitude === null || !isValidLatitude(latitude) ? t('latitudeInvalid') : null
    const nextLongitudeError = longitude === null || !isValidLongitude(longitude) ? t('longitudeInvalid') : null

    setLatitudeError(nextLatitudeError)
    setLongitudeError(nextLongitudeError)

    if (latitude !== null && longitude !== null && !nextLatitudeError && !nextLongitudeError) {
      emitCoordinates(latitude, longitude)
    }
  }

  function handleLatitudeChange(event: ChangeEvent<HTMLInputElement>): void {
    const nextLatitudeInput = event.target.value

    setLatitudeInput(nextLatitudeInput)
    validateAndEmit(nextLatitudeInput, longitudeInput)
  }

  function handleLongitudeChange(event: ChangeEvent<HTMLInputElement>): void {
    const nextLongitudeInput = event.target.value

    setLongitudeInput(nextLongitudeInput)
    validateAndEmit(latitudeInput, nextLongitudeInput)
  }

  function handleUseCurrentLocation(): void {
    if (!navigator.geolocation) {
      setStatus('unsupported')
      return
    }

    setStatus('locating')
    setLatitudeError(null)
    setLongitudeError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        const accuracy = Math.round(position.coords.accuracy)

        setLatitudeInput(formatCoordinate(latitude))
        setLongitudeInput(formatCoordinate(longitude))
        setStatus('idle')
        emitCoordinates(latitude, longitude, accuracy)
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('permission-denied')
          return
        }

        setStatus('unavailable')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    )
  }

  return (
    <Card className={cn('border-primary/15 bg-card/95 shadow-sm', className)}>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {status === 'permission-denied' ? (
          <Alert variant="destructive">
            <AlertTitle>{t('permissionDeniedTitle')}</AlertTitle>
            <AlertDescription>{t('permissionDeniedDescription')}</AlertDescription>
          </Alert>
        ) : null}

        {status === 'unsupported' ? (
          <Alert>
            <AlertTitle>{t('unsupportedTitle')}</AlertTitle>
            <AlertDescription>{t('unsupportedDescription')}</AlertDescription>
          </Alert>
        ) : null}

        {status === 'unavailable' ? (
          <Alert>
            <AlertTitle>{t('locationUnavailableTitle')}</AlertTitle>
            <AlertDescription>{t('locationUnavailableDescription')}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          id="report-location-use-current"
          type="button"
          className="w-full sm:w-auto"
          disabled={disabled || isLocating}
          onClick={handleUseCurrentLocation}
        >
          {isLocating ? t('locating') : t('useCurrentLocation')}
        </Button>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="report-location-latitude">{t('latitude')}</Label>
            <Input
              id="report-location-latitude"
              type="number"
              inputMode="decimal"
              step="any"
              min={-90}
              max={90}
              value={latitudeInput}
              placeholder={t('latitudePlaceholder')}
              disabled={disabled}
              aria-invalid={Boolean(latitudeError)}
              aria-describedby={latitudeError ? 'report-location-latitude-error' : undefined}
              onChange={handleLatitudeChange}
            />
            {latitudeError ? (
              <p id="report-location-latitude-error" className="text-destructive text-sm">
                {latitudeError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-location-longitude">{t('longitude')}</Label>
            <Input
              id="report-location-longitude"
              type="number"
              inputMode="decimal"
              step="any"
              min={-180}
              max={180}
              value={longitudeInput}
              placeholder={t('longitudePlaceholder')}
              disabled={disabled}
              aria-invalid={Boolean(longitudeError)}
              aria-describedby={longitudeError ? 'report-location-longitude-error' : undefined}
              onChange={handleLongitudeChange}
            />
            {longitudeError ? (
              <p id="report-location-longitude-error" className="text-destructive text-sm">
                {longitudeError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="border-primary/25 bg-primary/5 rounded-lg border border-dashed p-4">
          <p className="text-foreground text-sm font-medium">{t('selectedTitle')}</p>
          {selectedCoordinates ? (
            <div className="text-muted-foreground mt-1 space-y-1 text-sm">
              <p>
                {t('selectedCoordinates', {
                  latitude: formatCoordinate(selectedCoordinates.latitude),
                  longitude: formatCoordinate(selectedCoordinates.longitude)
                })}
              </p>
              {selectedCoordinates.accuracy !== undefined ? <p>{t('accuracy', { accuracy: selectedCoordinates.accuracy })}</p> : null}
            </div>
          ) : (
            <p className="text-muted-foreground mt-1 text-sm">{t('emptyCoordinates')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
