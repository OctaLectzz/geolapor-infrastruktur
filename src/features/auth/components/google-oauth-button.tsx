'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { signInWithGoogle } from '@/features/auth/services/auth-service'

interface GoogleOauthButtonProps {
  className?: string
}

export function GoogleOauthButton({ className }: GoogleOauthButtonProps): React.ReactElement {
  const t = useTranslations('auth')
  const [isPending, setIsPending] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function handleSignIn(): Promise<void> {
    setIsPending(true)
    setHasError(false)

    const { error } = await signInWithGoogle()

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
        {isPending ? <Spinner data-icon="inline-start" aria-hidden="true" /> : null}
        {isPending ? t('login.googleSubmitting') : t('login.google')}
      </Button>
    </div>
  )
}
