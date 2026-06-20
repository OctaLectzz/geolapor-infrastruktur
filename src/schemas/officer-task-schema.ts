import { z } from 'zod'

const OFFICER_TASK_VALIDATION_KEYS = {
  noteRequired: 'reports.validation.noteRequired',
  noteMinLength: 'reports.validation.noteMinLength',
  noteMaxLength: 'reports.validation.noteMaxLength',
  progressRequired: 'reports.validation.progressRequired',
  progressRange: 'reports.validation.progressRange',
  photoUrlInvalid: 'reports.validation.photoUrlInvalid',
  photoPathRequired: 'reports.validation.photoPathRequired'
} as const

export const fieldUpdateSchema = z.object({
  note: z
    .string()
    .trim()
    .min(1, { message: OFFICER_TASK_VALIDATION_KEYS.noteRequired })
    .min(5, { message: OFFICER_TASK_VALIDATION_KEYS.noteMinLength })
    .max(500, { message: OFFICER_TASK_VALIDATION_KEYS.noteMaxLength }),
  progress: z
    .number({ error: OFFICER_TASK_VALIDATION_KEYS.progressRequired })
    .int({ message: OFFICER_TASK_VALIDATION_KEYS.progressRange })
    .min(0, { message: OFFICER_TASK_VALIDATION_KEYS.progressRange })
    .max(100, { message: OFFICER_TASK_VALIDATION_KEYS.progressRange }),
  photoUrl: z.url({ message: OFFICER_TASK_VALIDATION_KEYS.photoUrlInvalid }).optional(),
  photoPath: z.string().trim().min(1, { message: OFFICER_TASK_VALIDATION_KEYS.photoPathRequired }).optional()
})

export const submitReviewSchema = z.object({
  note: z.string().trim().max(500, { message: OFFICER_TASK_VALIDATION_KEYS.noteMaxLength }).optional()
})

export type FieldUpdateSchema = z.infer<typeof fieldUpdateSchema>
export type SubmitReviewSchema = z.infer<typeof submitReviewSchema>
