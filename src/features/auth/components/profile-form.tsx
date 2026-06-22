'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { CameraIcon, MailIcon, ShieldCheckIcon, UserIcon, PhoneIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, useRef, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useRouter } from '@/i18n/navigation'
import { updateProfileSchema } from '@/schemas/profile-schema'
import { updateUserProfile, uploadAvatarPhoto } from '@/services/profile-service'
import type { UserDto } from '@/types/user'

type ProfileFormValues = z.infer<typeof updateProfileSchema>

interface ProfileFormProps {
  profile: UserDto
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function ProfileForm({ profile }: ProfileFormProps): ReactNode {
  const t = useTranslations()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl)

  const uploadMutation = useMutation({
    mutationFn: uploadAvatarPhoto,
    onSuccess: (data) => {
      form.setValue('avatarUrl', data.url, { shouldDirty: true })
      setAvatarPreview(data.url)
      toast.success(t('profile.messages.uploadSuccess'))
    },
    onError: (error) => {
      toast.error(error.message || t('profile.messages.uploadError'))
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      toast.success(t('profile.messages.updateSuccess'))
      router.refresh()
      form.reset(form.getValues(), { keepValues: true, keepDirty: false })
    },
    onError: (error) => {
      toast.error(error.message || t('profile.messages.updateError'))
    }
  })

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber || '',
      avatarUrl: profile.avatarUrl
    }
  })

  const isSubmitting = uploadMutation.isPending || updateMutation.isPending || form.formState.isSubmitting

  const handleAvatarClick = (): void => {
    if (isSubmitting) return
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    // Simple validation
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!validMimes.includes(file.type)) {
      toast.error(t('profile.messages.invalidFile'))
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error(t('profile.messages.invalidFile'))
      return
    }

    // Try local preview first
    const objectUrl = URL.createObjectURL(file)
    setAvatarPreview(objectUrl)

    try {
      await uploadMutation.mutateAsync(file)
    } catch {
      // Revert if upload fails
      setAvatarPreview(profile.avatarUrl)
    } finally {
      // Cleanup object URL
      URL.revokeObjectURL(objectUrl)
    }
  }

  const handleSubmit = async (values: ProfileFormValues): Promise<void> => {
    try {
      await updateMutation.mutateAsync(values)
    } catch (err) {
      console.error('Submit error:', err)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      {/* Profile summary card */}
      <Card className="border-primary/10 bg-card/90 shadow-sm flex flex-col items-center p-6 text-center h-fit">
        <div className="relative group cursor-pointer mb-4" onClick={handleAvatarClick}>
          <Avatar className="h-28 w-28 border-4 border-background shadow-md transition-all group-hover:opacity-80">
            {avatarPreview ? (
              <AvatarImage src={avatarPreview} alt={profile.fullName} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-primary/5 text-primary text-3xl font-semibold">
              {getInitials(profile.fullName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <CameraIcon className="h-8 w-8 text-white" />
          </div>
          
          {uploadMutation.isPending && (
            <div className="absolute inset-0 bg-background/70 rounded-full flex items-center justify-center">
              <Spinner className="h-6 w-6" />
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isSubmitting}
        />

        <h3 className="text-lg font-semibold text-foreground truncate max-w-full mb-1">
          {profile.fullName}
        </h3>
        
        <p className="text-muted-foreground text-xs truncate max-w-full mb-3 flex items-center gap-1">
          <MailIcon className="h-3 w-3 inline" /> {profile.email}
        </p>

        <Badge variant="secondary" className="px-3 py-1 text-xs capitalize">
          <ShieldCheckIcon className="h-3 w-3 mr-1" />
          {t(`roles.${profile.role.toLowerCase()}`)}
        </Badge>
      </Card>

      {/* Main edit form card */}
      <Card className="border-primary/10 bg-card/90 shadow-sm h-fit">
        <CardHeader>
          <CardTitle>{t('profile.title')}</CardTitle>
          <CardDescription>{t('profile.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
              {/* Full Name */}
              <Field data-invalid={Boolean(form.formState.errors.fullName)}>
                <FieldLabel htmlFor="profile-fullName" className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  {t('profile.fields.fullName')}
                </FieldLabel>
                <Input
                  id="profile-fullName"
                  type="text"
                  placeholder="John Doe"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(form.formState.errors.fullName)}
                  {...form.register('fullName')}
                />
                <FieldError>
                  {form.formState.errors.fullName?.message && t(form.formState.errors.fullName.message)}
                </FieldError>
              </Field>

              {/* Email (Read Only) */}
              <Field>
                <FieldLabel htmlFor="profile-email" className="flex items-center gap-1.5">
                  <MailIcon className="h-4 w-4 text-muted-foreground" />
                  {t('profile.fields.email')}
                </FieldLabel>
                <Input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
                <FieldDescription>{t('profile.helpers.emailReadOnly')}</FieldDescription>
              </Field>

              {/* Phone Number */}
              <Field data-invalid={Boolean(form.formState.errors.phoneNumber)}>
                <FieldLabel htmlFor="profile-phone" className="flex items-center gap-1.5">
                  <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                  {t('profile.fields.phoneNumber')}
                </FieldLabel>
                <Input
                  id="profile-phone"
                  type="text"
                  placeholder="08123456789"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(form.formState.errors.phoneNumber)}
                  {...form.register('phoneNumber')}
                />
                <FieldError>
                  {form.formState.errors.phoneNumber?.message && t(form.formState.errors.phoneNumber.message)}
                </FieldError>
              </Field>

              {/* Role (Read Only) */}
              <Field>
                <FieldLabel htmlFor="profile-role" className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
                  {t('profile.fields.role')}
                </FieldLabel>
                <Input
                  id="profile-role"
                  type="text"
                  value={t(`roles.${profile.role.toLowerCase()}`)}
                  disabled
                  className="bg-muted text-muted-foreground capitalize"
                />
                <FieldDescription>{t('profile.helpers.roleReadOnly')}</FieldDescription>
              </Field>
            </FieldGroup>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary/5">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || !form.formState.isDirty}
                onClick={() => {
                  form.reset()
                  setAvatarPreview(profile.avatarUrl)
                }}
              >
                {t('profile.actions.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isDirty}
              >
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                {isSubmitting ? t('actions.submitting') : t('profile.actions.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
