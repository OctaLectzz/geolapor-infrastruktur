import { z } from 'zod'

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, { message: 'profile.validation.nameRequired' }),
  phoneNumber: z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine((val) => !val || /^(\+62|62|0)[0-9]{8,15}$/.test(val), {
      message: 'profile.validation.phoneInvalid'
    }),
  avatarUrl: z.string().trim().nullable().optional()
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
