import { z } from 'zod'

const ADMIN_REPORT_VALIDATION_KEYS = {
  verifyNoteMaxLength: 'reports.validation.noteMaxLength',
  rejectionNoteRequired: 'reports.validation.rejectionNoteRequired',
  rejectionNoteMinLength: 'reports.validation.rejectionNoteMinLength',
  officerRequired: 'reports.validation.officerRequired',
  noteMaxLength: 'reports.validation.noteMaxLength'
} as const

export const verifyReportSchema = z.object({
  note: z.string().trim().max(500, { message: ADMIN_REPORT_VALIDATION_KEYS.verifyNoteMaxLength }).optional()
})

export const rejectReportSchema = z.object({
  rejectionNote: z
    .string()
    .trim()
    .min(1, { message: ADMIN_REPORT_VALIDATION_KEYS.rejectionNoteRequired })
    .min(5, { message: ADMIN_REPORT_VALIDATION_KEYS.rejectionNoteMinLength })
})

export const assignReportSchema = z.object({
  officerId: z.string().trim().min(1, { message: ADMIN_REPORT_VALIDATION_KEYS.officerRequired }),
  dueDate: z.string().datetime().optional(),
  note: z.string().trim().max(500, { message: ADMIN_REPORT_VALIDATION_KEYS.noteMaxLength }).optional()
})

export type VerifyReportSchema = z.infer<typeof verifyReportSchema>
export type RejectReportSchema = z.infer<typeof rejectReportSchema>
export type AssignReportSchema = z.infer<typeof assignReportSchema>
