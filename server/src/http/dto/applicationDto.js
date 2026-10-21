import { z } from 'zod';
import { Specialty } from '../../domain/identity/Specialty.js';

export const ApplyToProjectDto = z.object({
  projectId: z.string().min(1, 'projectId is required'),
  specialty: z.enum(Specialty.VALUES, {
    errorMap: () => ({ message: `Specialty must be one of: ${Specialty.VALUES.join(', ')}` }),
  }),
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional().default(''),
});

export const InviteStudentDto = z.object({
  studentId: z.string().min(1, 'studentId is required'),
  specialty: z.enum(Specialty.VALUES, {
    errorMap: () => ({ message: `Specialty must be one of: ${Specialty.VALUES.join(', ')}` }),
  }),
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional().default(''),
});

export const DecideApplicationDto = z.object({
  decision: z.enum(['accept', 'reject'], {
    errorMap: () => ({ message: "Decision must be 'accept' or 'reject'" }),
  }),
  rejectionReason: z.string().max(200).optional(),
});

export const RespondToInvitationDto = z.object({
  decision: z.enum(['accept', 'reject'], {
    errorMap: () => ({ message: "Decision must be 'accept' or 'reject'" }),
  }),
});
