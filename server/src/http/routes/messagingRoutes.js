import { Router } from 'express';
import { CreateConversationDto, SendMessageDto } from '../dto/messagingDto.js';
import {
  InvalidConversationParticipantsError,
  UnauthorizedConversationActionError,
  InvalidMessageContentError,
  ConversationNotFoundError,
} from '../../domain/messaging/errors.js';

export function createMessagingRouter({
  getOrCreateConversationUseCase,
  sendMessageUseCase,
  listConversationsUseCase,
  listMessagesUseCase,
  requireAuth,
}) {
  const router = Router();

  // GET /conversations - List conversations for the logged in student
  router.get('/', requireAuth, async (req, res) => {
    try {
      const conversations = await listConversationsUseCase.execute({
        studentId: req.user.id,
      });
      res.status(200).json(conversations);
    } catch (err) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // POST /conversations - Get or start a conversation with another student
  router.post('/', requireAuth, async (req, res) => {
    const parse = CreateConversationDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const conversation = await getOrCreateConversationUseCase.execute({
        studentId: req.user.id,
        recipientId: parse.data.counterpartyId,
      });
      res.status(201).json(conversation.toJSON());
    } catch (err) {
      if (err instanceof InvalidConversationParticipantsError) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // GET /conversations/:id/messages - Retrieve messages for a conversation
  router.get('/:id/messages', requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      const messages = await listMessagesUseCase.execute({
        conversationId: req.params.id,
        studentId: req.user.id,
        limit,
      });
      res.status(200).json(messages);
    } catch (err) {
      if (err instanceof ConversationNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      if (err instanceof UnauthorizedConversationActionError) {
        return res.status(403).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // POST /conversations/:id/messages - Send a message in a conversation
  router.post('/:id/messages', requireAuth, async (req, res) => {
    const parse = SendMessageDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const content = parse.data.content || parse.data.body;
      const message = await sendMessageUseCase.execute({
        conversationId: req.params.id,
        senderId: req.user.id,
        content,
      });
      res.status(201).json(message.toJSON());
    } catch (err) {
      if (err instanceof ConversationNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      if (err instanceof UnauthorizedConversationActionError) {
        return res.status(403).json({ error: err.message });
      }
      if (err instanceof InvalidMessageContentError) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  return router;
}
