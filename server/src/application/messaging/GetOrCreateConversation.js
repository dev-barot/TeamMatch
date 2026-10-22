import { Conversation } from '../../domain/messaging/Conversation.js';
import { StudentNotFoundError } from '../../domain/identity/errors.js';
import { InvalidConversationParticipantsError } from '../../domain/messaging/errors.js';

export class GetOrCreateConversation {
  constructor({ conversationRepository, studentRepository }) {
    this.conversationRepo = conversationRepository;
    this.studentRepo = studentRepository;
  }

  async execute({ studentId, recipientId }) {
    if (!studentId || !recipientId || String(studentId) === String(recipientId)) {
      throw new InvalidConversationParticipantsError('A Conversation must have exactly two distinct Students.');
    }

    // Verify recipient exists
    const recipient = await this.studentRepo.findById(recipientId);
    if (!recipient) {
      throw new StudentNotFoundError(recipientId);
    }

    // Check if conversation already exists (idempotent lookup)
    const existing = await this.conversationRepo.findByParticipants(studentId, recipientId);
    if (existing) {
      return existing;
    }

    // Create new conversation
    const conversation = new Conversation({
      participantIds: [studentId, recipientId],
    });

    await this.conversationRepo.save(conversation);
    return conversation;
  }
}
