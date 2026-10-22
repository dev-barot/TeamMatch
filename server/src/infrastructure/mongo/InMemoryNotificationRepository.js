import { NotificationRepository } from '../../ports/NotificationRepository.js';

export class InMemoryNotificationRepository extends NotificationRepository {
  constructor() {
    super();
    this.notifications = new Map();
  }

  async save(notification) {
    this.notifications.set(String(notification.id), notification);
  }

  async findById(id) {
    return this.notifications.get(String(id)) || null;
  }

  async findByStudentId(studentId, options = {}) {
    const sId = String(studentId);
    const limit = options.limit || 30;
    const unreadOnly = Boolean(options.unreadOnly);
    const results = [];

    for (const notif of this.notifications.values()) {
      if (notif.recipientId === sId) {
        if (unreadOnly && notif.isRead()) {
          continue;
        }
        results.push(notif);
      }
    }

    // Sort newest first
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return results.slice(0, limit);
  }

  async markRead(id, studentId) {
    const notif = await this.findById(id);
    if (!notif || notif.recipientId !== String(studentId)) {
      return null;
    }
    notif.markAsRead();
    return notif;
  }

  async markAllRead(studentId) {
    const sId = String(studentId);
    let count = 0;
    const now = new Date();

    for (const notif of this.notifications.values()) {
      if (notif.recipientId === sId && !notif.isRead()) {
        notif.markAsRead(now);
        count += 1;
      }
    }

    return count;
  }

  clear() {
    this.notifications.clear();
  }
}
