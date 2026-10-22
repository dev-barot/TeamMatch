import { InvalidMessageContentError } from './errors.js';

/**
 * Message Entity
 * Enforces: content is non-empty, trimmed, and at most 2000 characters.
 */
export class Message {
  static MAX_CONTENT_LENGTH = 2000;

  constructor({
    id = null,
    conversationId,
    senderId,
    content,
    createdAt = new Date(),
    readAt = null,
  }) {
    if (!conversationId) {
      throw new Error('Message conversationId is required.');
    }
    if (!senderId) {
      throw new Error('Message senderId is required.');
    }

    if (typeof content !== 'string') {
      throw new InvalidMessageContentError('Message content must be a string.');
    }

    const trimmed = content.trim();
    if (trimmed.length === 0 || trimmed.length > Message.MAX_CONTENT_LENGTH) {
      throw new InvalidMessageContentError(`Message content must be between 1 and ${Message.MAX_CONTENT_LENGTH} characters.`);
    }

    this.id = id || `msg_${Math.random().toString(36).substring(2, 9)}`;
    this.conversationId = String(conversationId);
    this.senderId = String(senderId);
    this.content = trimmed;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.readAt = readAt ? (readAt instanceof Date ? readAt : new Date(readAt)) : null;
  }

  isRead() {
    return this.readAt !== null;
  }

  markAsRead(date = new Date()) {
    if (!this.readAt) {
      this.readAt = date instanceof Date ? date : new Date(date);
    }
  }

  toJSON() {
    return {
      id: this.id,
      conversationId: this.conversationId,
      senderId: this.senderId,
      content: this.content,
      createdAt: this.createdAt.toISOString(),
      readAt: this.readAt ? this.readAt.toISOString() : null,
      isRead: this.isRead(),
    };
  }
}
