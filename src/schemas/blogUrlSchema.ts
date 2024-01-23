import { z } from 'zod';

export const BlogUrlSchema = z.object({
  blogUrl: z.string().url(),
});
