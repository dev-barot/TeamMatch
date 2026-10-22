/**
 * Notification Entity
 * Represents an in-app event notification for a student (e.g. applications, decisions, messages).
 */
export class Notification {
  constructor({
    id = null,
    recipientId,
    type,
    title,
    body,
    link = null,
    readAt = null,
    createdAt = new Date(),
  }) {
    if (!recipientId) {
      throw new Error('Notification recipientId is required.');
    }
    if (!type) {
      throw new Error('Notification type is required.');
    }
    if (!title || !title.trim()) {
      throw new Error('Notification title cannot be empty.');
    }

    this.id = id || `notif_${Math.random().toString(36).substring(2, 9)}`;
    this.recipientId = String(recipientId);
    this.type = String(type).trim();
    this.title = title.trim();
    this.body = body ? String(body).trim() : '';
    this.link = link ? String(link).trim() : null;
    this.readAt = readAt ? (readAt instanceof Date ? readAt : new Date(readAt)) : null;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
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
      recipientId: this.recipientId,
      type: this.type,
      title: this.title,
      body: this.body,
      link: this.link,
      readAt: this.readAt ? this.readAt.toISOString() : null,
      isRead: this.isRead(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}
