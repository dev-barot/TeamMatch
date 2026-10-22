import { InvalidConversationParticipantsError, UnauthorizedConversationActionError } from './errors.js';

/**
 * Conversation Aggregate Root
 * Enforces: A Conversation has exactly two distinct Students, stored in canonical sorted order.
 */
export class Conversation {
  constructor({
    id = null,
    participantIds,
    lastMessageAt = new Date(),
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    if (!Array.isArray(participantIds) || participantIds.length !== 2) {
      throw new InvalidConversationParticipantsError('A Conversation must have exactly two distinct Students.');
    }

    const [p1, p2] = participantIds.map(p => String(p).trim());
    if (!p1 || !p2 || p1 === p2) {
      throw new InvalidConversationParticipantsError('Conversation participants must be two distinct non-empty Student IDs.');
    }

    this.id = id || `conv_${Math.random().toString(36).substring(2, 9)}`;
    // Always store sorted so get-or-create is deterministic and idempotent
    this.participantIds = [p1, p2].sort();
    this.lastMessageAt = lastMessageAt instanceof Date ? lastMessageAt : new Date(lastMessageAt);
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }

  isParticipant(studentId) {
    if (!studentId) return false;
    return this.participantIds.includes(String(studentId));
  }

  assertParticipant(studentId) {
    if (!this.isParticipant(studentId)) {
      throw new UnauthorizedConversationActionError('Only Conversation participants can read or send messages.');
    }
  }

  getOtherParticipant(studentId) {
    this.assertParticipant(studentId);
    return this.participantIds.find(p => p !== String(studentId));
  }

  updateLastMessage(date = new Date()) {
    this.lastMessageAt = date instanceof Date ? date : new Date(date);
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      participantIds: [...this.participantIds],
      lastMessageAt: this.lastMessageAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
