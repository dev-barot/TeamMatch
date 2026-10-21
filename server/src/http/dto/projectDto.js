import { z } from 'zod';
import { Specialty } from '../../domain/identity/Specialty.js';
import { CommitmentLevel } from '../../domain/projects/CommitmentLevel.js';

export const PositionInputDto = z.object({
  id: z.string().optional(),
  specialty: z.enum(Specialty.VALUES),
  headcount: z.coerce.number().int().min(1, 'Headcount must be at least 1'),
  filledCount: z.coerce.number().int().min(0).optional().default(0),
});

export const CourseTagInputDto = z.object({
  courseCode: z.string().optional().default(''),
  term: z.string().optional().default(''),
});

export const CreateProjectDto = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120, 'Title cannot exceed 120 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  requiredSkills: z.array(z.string()).optional().default([]),
  positions: z.array(PositionInputDto).min(1, 'At least one Position is required'),
  commitmentLevel: z.enum(CommitmentLevel.VALUES).optional().default(CommitmentLevel.MEDIUM),
  category: z.string().optional().default('Class Project'),
  courseTag: CourseTagInputDto.optional().nullable(),
});

export const UpdateProjectDto = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  requiredSkills: z.array(z.string()).optional(),
  positions: z.array(PositionInputDto).min(1).optional(),
  commitmentLevel: z.enum(CommitmentLevel.VALUES).optional(),
  category: z.string().optional(),
  courseTag: CourseTagInputDto.optional().nullable(),
});

export const BrowseProjectsQueryDto = z.object({
  query: z.string().optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  specialty: z.string().optional(),
  category: z.string().optional(),
  commitment: z.string().optional(),
  status: z.string().optional(),
  sort: z.enum(['newest', 'most-matched']).optional().default('newest'),
  limit: z.coerce.number().int().min(1).optional().default(20).transform(val => Math.min(val, 50)),
  cursor: z.string().optional(),
});
