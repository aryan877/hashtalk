import { z } from 'zod'

export const MessageSchema = z.object({
  userMessage: z.string().min(1, 'Message is required'),
});