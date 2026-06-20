import { z } from 'zod'

const CATEGORY_VALIDATION_KEYS = {
  nameRequired: 'categories.validation.nameRequired',
  nameMinLength: 'categories.validation.nameMinLength',
  slugInvalid: 'categories.validation.slugInvalid',
  payloadEmpty: 'categories.validation.payloadEmpty'
} as const

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: CATEGORY_VALIDATION_KEYS.slugInvalid })

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, { message: CATEGORY_VALIDATION_KEYS.nameRequired }).min(2, { message: CATEGORY_VALIDATION_KEYS.nameMinLength }),
  slug: slugSchema.optional(),
  description: z.string().trim().nullable().optional(),
  icon: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional()
})

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2, { message: CATEGORY_VALIDATION_KEYS.nameMinLength }).optional(),
    slug: slugSchema.optional(),
    description: z.string().trim().nullable().optional(),
    icon: z.string().trim().nullable().optional(),
    isActive: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: CATEGORY_VALIDATION_KEYS.payloadEmpty
  })

export type CreateCategorySchema = z.infer<typeof createCategorySchema>
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>
