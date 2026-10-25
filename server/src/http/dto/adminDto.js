import { z } from 'zod';
import { REPORT_TARGET_TYPE } from '../../domain/moderation/Report.js';

/**
 * Zod DTOs for Admin & Moderation (M6) HTTP routes.
 */

export const DeactivateAccountDto = z.object({
  reason: z.string().max(300, 'Reason must not exceed 300 characters').optional(),
});

export const AdminCloseProjectDto = z.object({
  reason: z.string().max(300, 'Reason must not exceed 300 characters').optional(),
});

export const ReportStudentDto = z.object({
  targetStudentId: z.string().min(1, 'targetStudentId is required'),
  reason: z
    .string()
    .min(1, 'Reason is required')
    .max(500, 'Reason must not exceed 500 characters'),
});

export const ReportConversationDto = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
  reason: z
    .string()
    .min(1, 'Reason is required')
    .max(500, 'Reason must not exceed 500 characters'),
});

export const MarkReportReviewedDto = z.object({
  // Optional admin note; no message content ever stored in Report
  note: z.string().max(300).optional(),
});
