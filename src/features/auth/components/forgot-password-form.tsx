'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordSchema } from '@/schemas/auth-schema'

function translateValidationMessage(t: ReturnType<typeof useTranslations>, message?: string): string | undefined {
  if (!message) {
    return undefined
  }

  return t(message.replace('auth.', ''))
}

export function ForgotPasswordForm(): React.ReactElement {
  const locale = useLocale()
  const t = useTranslations('auth')
  const [safeError, setSafeError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  async function handleSubmit(values: ForgotPasswordSchema): Promise<void> {
    setSafeError(null)
    setSuccessMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: new URL(`/${locale}/auth/callback`, window.location.origin).toString()
    })

    if (error) {
      setSafeError(t('messages.forgotPasswordFailed'))
      return
    }

    form.reset()
    setSuccessMessage(t('forgotPassword.success'))
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      {safeError ? (
        <Alert variant="destructive">
          <AlertTitle>{t('messages.safeErrorTitle')}</AlertTitle>
          <AlertDescription>{safeError}</AlertDescription>
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert>
          <AlertTitle>{t('forgotPassword.success')}</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.email)}>
          <FieldLabel htmlFor="forgot-password-email">{t('forgotPassword.emailLabel')}</FieldLabel>
          <Input
            id="forgot-password-email"
            type="email"
            autoComplete="email"
            placeholder={t('forgotPassword.emailPlaceholder')}
            aria-invalid={Boolean(form.formState.errors.email)}
            disabled={isSubmitting}
            {...form.register('email')}
          />
          <FieldError>{translateValidationMessage(t, form.formState.errors.email?.message)}</FieldError>
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-4">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : null}
          {isSubmitting ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
        </Button>

        <Link className="text-primary text-center text-sm font-medium underline-offset-4 hover:underline" href="/login">
          {t('forgotPassword.backToLogin')}
        </Link>
      </div>
    </form>
  )
}
