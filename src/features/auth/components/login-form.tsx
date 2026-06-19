'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { GoogleOauthButton } from '@/features/auth/components/google-oauth-button'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginSchema } from '@/schemas/auth-schema'

function translateValidationMessage(t: ReturnType<typeof useTranslations>, message?: string): string | undefined {
  if (!message) {
    return undefined
  }

  return t(message.replace('auth.', ''))
}

export function LoginForm(): React.ReactElement {
  const t = useTranslations('auth')
  const [safeError, setSafeError] = useState<string | null>(null)
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  async function handleSubmit(values: LoginSchema): Promise<void> {
    setSafeError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    })

    if (error) {
      setSafeError(t('messages.loginFailed'))
      return
    }

    window.location.assign('/auth/callback')
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <GoogleOauthButton className="w-full" />

      <FieldSeparator>{t('login.divider')}</FieldSeparator>

      {safeError ? (
        <Alert variant="destructive">
          <AlertTitle>{t('messages.safeErrorTitle')}</AlertTitle>
          <AlertDescription>{safeError}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.email)}>
          <FieldLabel htmlFor="login-email">{t('login.emailLabel')}</FieldLabel>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder={t('login.emailPlaceholder')}
            aria-invalid={Boolean(form.formState.errors.email)}
            disabled={isSubmitting}
            {...form.register('email')}
          />
          <FieldError>{translateValidationMessage(t, form.formState.errors.email?.message)}</FieldError>
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.password)}>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel htmlFor="login-password">{t('login.passwordLabel')}</FieldLabel>
            <Button asChild type="button" variant="link" size="sm" className="h-auto px-0">
              <Link href="/forgot-password">{t('login.forgotPassword')}</Link>
            </Button>
          </div>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder={t('login.passwordPlaceholder')}
            aria-invalid={Boolean(form.formState.errors.password)}
            disabled={isSubmitting}
            {...form.register('password')}
          />
          <FieldError>{translateValidationMessage(t, form.formState.errors.password?.message)}</FieldError>
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-4">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : null}
          {isSubmitting ? t('login.submitting') : t('login.submit')}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          {t('login.noAccount')}{' '}
          <Link className="text-primary font-medium underline-offset-4 hover:underline" href="/register">
            {t('login.registerLink')}
          </Link>
        </p>
      </div>
    </form>
  )
}
