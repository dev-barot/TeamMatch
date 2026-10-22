import { NotificationNotFoundError } from '../../domain/messaging/errors.js';

export class MarkNotificationRead {
  constructor({ notificationRepository }) {
    this.notificationRepo = notificationRepository;
  }

  async execute({ notificationId, studentId }) {
    const updated = await this.notificationRepo.markRead(notificationId, studentId);
    if (!updated) {
      throw new NotificationNotFoundError(notificationId);
    }
    return updated;
  }
}
