'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale, useTranslations } from 'next-intl'
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
import { registerSchema, type RegisterSchema } from '@/schemas/auth-schema'

function translateValidationMessage(t: ReturnType<typeof useTranslations>, message?: string): string | undefined {
  if (!message) {
    return undefined
  }

  return t(message.replace('auth.', ''))
}

export function RegisterForm(): React.ReactElement {
  const locale = useLocale()
  const t = useTranslations('auth')
  const [safeError, setSafeError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  async function handleSubmit(values: RegisterSchema): Promise<void> {
    setSafeError(null)
    setSuccessMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName
        },
        emailRedirectTo: new URL(`/${locale}/auth/callback`, window.location.origin).toString()
      }
    })

    if (error) {
      setSafeError(t('messages.registerFailed'))
      return
    }

    form.reset()
    setSuccessMessage(t('register.success'))
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

      {successMessage ? (
        <Alert>
          <AlertTitle>{t('messages.registerSuccess')}</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.fullName)}>
          <FieldLabel htmlFor="register-full-name">{t('register.nameLabel')}</FieldLabel>
          <Input
            id="register-full-name"
            type="text"
            autoComplete="name"
            placeholder={t('register.namePlaceholder')}
            aria-invalid={Boolean(form.formState.errors.fullName)}
            disabled={isSubmitting}
            {...form.register('fullName')}
          />
          <FieldError>{translateValidationMessage(t, form.formState.errors.fullName?.message)}</FieldError>
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.email)}>
          <FieldLabel htmlFor="register-email">{t('register.emailLabel')}</FieldLabel>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder={t('register.emailPlaceholder')}
            aria-invalid={Boolean(form.formState.errors.email)}
            disabled={isSubmitting}
            {...form.register('email')}
          />
          <FieldError>{translateValidationMessage(t, form.formState.errors.email?.message)}</FieldError>
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.password)}>
          <FieldLabel htmlFor="register-password">{t('register.passwordLabel')}</FieldLabel>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder={t('register.passwordPlaceholder')}
            aria-invalid={Boolean(form.formState.errors.password)}
            disabled={isSubmitting}
            {...form.register('password')}
          />
          <FieldError>{translateValidationMessage(t, form.formState.errors.password?.message)}</FieldError>
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.confirmPassword)}>
          <FieldLabel htmlFor="register-confirm-password">{t('register.confirmPasswordLabel')}</FieldLabel>
          <Input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder={t('register.confirmPasswordPlaceholder')}
            aria-invalid={Boolean(form.formState.errors.confirmPassword)}
            disabled={isSubmitting}
            {...form.register('confirmPassword')}
          />
          <FieldError>{translateValidationMessage(t, form.formState.errors.confirmPassword?.message)}</FieldError>
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-4">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : null}
          {isSubmitting ? t('register.submitting') : t('register.submit')}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          {t('register.hasAccount')}{' '}
          <Link className="text-primary font-medium underline-offset-4 hover:underline" href="/login">
            {t('register.loginLink')}
          </Link>
        </p>
      </div>
    </form>
  )
}
