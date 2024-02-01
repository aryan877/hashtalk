import { z } from 'zod';

export const CommentSchema = z.object({
  comment: z.string().min(1, 'Comment is required'),
});
