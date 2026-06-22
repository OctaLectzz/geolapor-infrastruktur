'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { signInWithGoogle } from '@/features/auth/services/auth-service'

interface GoogleOauthButtonProps {
  className?: string
}

export function GoogleOauthButton({ className }: GoogleOauthButtonProps): React.ReactElement {
  const locale = useLocale()
  const t = useTranslations('auth')
  const [isPending, setIsPending] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function handleSignIn(): Promise<void> {
    setIsPending(true)
    setHasError(false)

    const { error } = await signInWithGoogle(locale)

    if (error) {
      setHasError(true)
      setIsPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {hasError ? (
        <Alert variant="destructive">
          <AlertTitle>{t('messages.safeErrorTitle')}</AlertTitle>
          <AlertDescription>{t('messages.oauthFailed')}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="button" variant="outline" className={className} disabled={isPending} onClick={handleSignIn}>
        {isPending ? (
          <Spinner data-icon="inline-start" aria-hidden="true" />
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
            />
          </svg>
        )}
        {isPending ? t('login.googleSubmitting') : t('login.google')}
      </Button>
    </div>
  )
}
