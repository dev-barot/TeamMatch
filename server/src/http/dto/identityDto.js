import { z } from 'zod';
import { Specialty } from '../../domain/identity/Specialty.js';
import { WorkingStyle } from '../../domain/identity/WorkingStyle.js';
import { EXPERIENCE_LEVELS } from '../../domain/identity/Profile.js';

export const SignUpDto = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  specialty: z.enum(Specialty.VALUES).optional().default(Specialty.OTHER),
  skills: z.array(z.string()).optional().default([]),
});

export const LogInDto = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const VerifyEmailDto = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const RequestPasswordResetDto = z.object({
  email: z.string().email('Invalid email address'),
});

export const ResetPasswordDto = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const UpdateProfileDto = z.object({
  skills: z.array(z.string()).optional(),
  specialty: z.enum(Specialty.VALUES).optional(),
  weeklyAvailability: z.number().min(0).optional(),
  timezone: z.string().optional(),
  workingStyle: z.enum(WorkingStyle.VALUES).optional(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
  bio: z.string().max(500).optional(),
});
