import { z } from 'zod'

const AUTH_VALIDATION_KEYS = {
  nameRequired: 'auth.validation.nameRequired',
  emailRequired: 'auth.validation.emailRequired',
  emailInvalid: 'auth.validation.emailInvalid',
  passwordRequired: 'auth.validation.passwordRequired',
  passwordMinLength: 'auth.validation.passwordMinLength',
  passwordMismatch: 'auth.validation.passwordMismatch'
} as const

export const loginSchema = z.object({
  email: z.string().trim().min(1, { message: AUTH_VALIDATION_KEYS.emailRequired }).email({ message: AUTH_VALIDATION_KEYS.emailInvalid }),
  password: z.string().min(1, { message: AUTH_VALIDATION_KEYS.passwordRequired })
})

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, { message: AUTH_VALIDATION_KEYS.nameRequired }),
    email: z.string().trim().min(1, { message: AUTH_VALIDATION_KEYS.emailRequired }).email({ message: AUTH_VALIDATION_KEYS.emailInvalid }),
    password: z.string().min(1, { message: AUTH_VALIDATION_KEYS.passwordRequired }).min(8, { message: AUTH_VALIDATION_KEYS.passwordMinLength }),
    confirmPassword: z.string().min(1, { message: AUTH_VALIDATION_KEYS.passwordRequired })
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: AUTH_VALIDATION_KEYS.passwordMismatch,
    path: ['confirmPassword']
  })

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, { message: AUTH_VALIDATION_KEYS.emailRequired }).email({ message: AUTH_VALIDATION_KEYS.emailInvalid })
})

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
