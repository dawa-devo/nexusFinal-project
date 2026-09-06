import { z } from 'zod';

export const createAnswerSchema = z.object({
  body: z.object({
    questionId: z.string().uuid('Invalid question ID format'),
    content: z
      .string({ required_error: 'Answer content is required' })
      .min(5, 'Answer must be at least 5 characters long'),
  }),
});

export const voteAnswerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid answer ID format'),
  }),
  body: z.object({
    value: z.union([z.literal(1), z.literal(-1)], {
      errorMap: () => ({ message: 'Vote value must be 1 or -1' }),
    }),
  }),
});

export type CreateAnswerInput = z.infer<typeof createAnswerSchema>['body'];
export type VoteAnswerInput = z.infer<typeof voteAnswerSchema>['body'];