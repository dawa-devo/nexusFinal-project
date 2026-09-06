import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    age: z.number().int().positive('Age must be a positive integer'),
    course: z.string().min(2, 'Course name is required'),
    gpa: z.number().min(0).max(4.0, 'GPA must be between 0 and 4.0'),
    status: z.enum(['Active', 'Inactive', 'Graduated']),
  }),
});

export const updateStudentSchema = z.object({
  body: createStudentSchema.shape.body.partial(),
});