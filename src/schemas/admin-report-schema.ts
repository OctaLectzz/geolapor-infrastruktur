import { z } from 'zod'

const ADMIN_REPORT_VALIDATION_KEYS = {
  verifyNoteMaxLength: 'reports.validation.noteMaxLength',
  rejectionNoteRequired: 'reports.validation.rejectionNoteRequired',
  rejectionNoteMinLength: 'reports.validation.rejectionNoteMinLength'
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

export type VerifyReportSchema = z.infer<typeof verifyReportSchema>
export type RejectReportSchema = z.infer<typeof rejectReportSchema>
