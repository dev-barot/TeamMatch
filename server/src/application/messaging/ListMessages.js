import { ConversationNotFoundError } from '../../domain/messaging/errors.js';

export class ListMessages {
  constructor({ conversationRepository, messageRepository }) {
    this.conversationRepo = conversationRepository;
    this.messageRepo = messageRepository;
  }

  async execute({ conversationId, studentId, limit = 50 }) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new ConversationNotFoundError(conversationId);
    }

    // Authorization: Only participants can read messages
    conversation.assertParticipant(studentId);

    const messages = await this.messageRepo.findByConversationId(conversationId, { limit });

    // Mark unread incoming messages as read
    await this.messageRepo.markConversationRead(conversationId, studentId);

    return messages;
  }
}
