import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().trim().min(1, 'Course title is required').max(200, 'Title too long'),
  description: z.string().trim().max(2000, 'Description too long').optional().nullable(),
  instructor: z.string().trim().min(1, 'Instructor name is required').max(100, 'Instructor name too long'),
});

export const updateCourseSchema = z.object({
  title: z.string().trim().min(1, 'Course title cannot be empty').max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  instructor: z.string().trim().min(1, 'Instructor name cannot be empty').max(100).optional(),
});

export const createResourceBodySchema = z.object({
  course_id: z.string().trim().min(1, 'Course ID is required'),
  title: z.string().trim().min(1, 'Resource title is required').max(255),
  description: z.string().trim().max(2000).optional().nullable(),
  resource_type: z.enum(['pdf', 'video', 'notes', 'document', 'other']).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query parameter "q" is required').max(100),
  include_content: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'),
});

export const aiAskSchema = z.object({
  question: z.string().trim().min(1, 'Question cannot be empty').max(2000),
  course_id: z.string().trim().optional(),
  resource_id: z.string().trim().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1),
      })
    )
    .optional(),
});

export const aiStudyPlanSchema = z.object({
  goal: z.string().trim().min(1, 'Study goal is required').max(500),
  title: z.string().trim().max(200).optional(),
  course_id: z.string().trim().optional(),
  duration_weeks: z.coerce.number().int().min(1).max(52).optional().default(4),
  preferences: z.record(z.string(), z.unknown()).optional(),
  save: z.boolean().optional().default(true),
});
