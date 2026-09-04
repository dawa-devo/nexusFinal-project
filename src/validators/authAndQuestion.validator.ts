import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const createQuestionSchema = z.object({
  body: z.object({
    title: z.string().min(10, 'Title must be at least 10 characters').max(200),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    tags: z.array(z.string().min(1)).min(1, 'Provide at least one tag'),
  }),
});

export const updateQuestionSchema = z.object({
  body: z.object({
    title: z.string().min(10).max(200).optional(),
    description: z.string().min(20).optional(),
    tags: z.array(z.string().min(1)).optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    bio: z.string().max(500).optional(),
  }),
});