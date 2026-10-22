import { MessageRepository } from '../../ports/MessageRepository.js';

export class InMemoryMessageRepository extends MessageRepository {
  constructor() {
    super();
    this.messages = new Map();
  }

  async save(message) {
    this.messages.set(String(message.id), message);
  }

  async findByConversationId(conversationId, options = {}) {
    const cId = String(conversationId);
    const limit = options.limit || 50;
    const results = [];

    for (const msg of this.messages.values()) {
      if (msg.conversationId === cId) {
        results.push(msg);
      }
    }

    // Sort chronologically (oldest first) for chat window
    results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return results.slice(-limit);
  }

  async markConversationRead(conversationId, readerStudentId) {
    const cId = String(conversationId);
    const readerId = String(readerStudentId);
    let count = 0;
    const now = new Date();

    for (const msg of this.messages.values()) {
      if (msg.conversationId === cId && msg.senderId !== readerId && !msg.isRead()) {
        msg.markAsRead(now);
        count += 1;
      }
    }

    return count;
  }

  clear() {
    this.messages.clear();
  }
}
