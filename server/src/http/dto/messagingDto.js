import { z } from 'zod';

export const CreateConversationDto = z.object({
  counterpartyId: z.string().min(1, 'counterpartyId is required'),
});

export const SendMessageDto = z.object({
  content: z.string().min(1, 'Message content cannot be empty').max(2000, 'Message content cannot exceed 2000 characters').optional(),
  body: z.string().min(1, 'Message body cannot be empty').max(2000, 'Message body cannot exceed 2000 characters').optional(),
}).refine(data => data.content || data.body, {
  message: 'Message content cannot be empty',
});

