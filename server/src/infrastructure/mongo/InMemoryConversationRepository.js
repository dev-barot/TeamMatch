import { ConversationRepository } from '../../ports/ConversationRepository.js';

export class InMemoryConversationRepository extends ConversationRepository {
  constructor() {
    super();
    this.conversations = new Map();
  }

  async save(conversation) {
    this.conversations.set(String(conversation.id), conversation);
  }

  async findById(id) {
    return this.conversations.get(String(id)) || null;
  }

  async findByParticipants(studentId1, studentId2) {
    const sorted = [String(studentId1), String(studentId2)].sort();
    for (const conv of this.conversations.values()) {
      if (
        conv.participantIds.length === 2 &&
        conv.participantIds[0] === sorted[0] &&
        conv.participantIds[1] === sorted[1]
      ) {
        return conv;
      }
    }
    return null;
  }

  async findByStudentId(studentId) {
    const sId = String(studentId);
    const results = [];
    for (const conv of this.conversations.values()) {
      if (conv.isParticipant(sId)) {
        results.push(conv);
      }
    }
    // Sort newest lastMessageAt first
    return results.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  clear() {
    this.conversations.clear();
  }
}
