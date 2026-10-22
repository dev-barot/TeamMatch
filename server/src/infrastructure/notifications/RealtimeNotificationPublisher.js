import { NotificationPublisher } from '../../ports/NotificationPublisher.js';
import { Notification } from '../../domain/messaging/Notification.js';

/**
 * RealtimeNotificationPublisher
 * Implements NotificationPublisher port:
 * 1. Creates and persists an in-app Notification aggregate
 * 2. Emits a real-time event to the student's socket room via RealtimePublisher port
 */
export class RealtimeNotificationPublisher extends NotificationPublisher {
  constructor({ notificationRepository, realtimePublisher }) {
    super();
    this.notificationRepo = notificationRepository;
    this.realtimePublisher = realtimePublisher;
  }

  async publish(event) {
    if (!event || !event.recipientId) return;

    const notification = new Notification({
      recipientId: event.recipientId,
      type: event.type || 'info',
      title: event.title || 'Notification',
      body: event.body || '',
      link: event.link || null,
    });

    if (this.notificationRepo) {
      await this.notificationRepo.save(notification);
    }

    if (this.realtimePublisher) {
      this.realtimePublisher.emitToStudent(
        event.recipientId,
        'notification:new',
        notification.toJSON()
      );
    }
  }
}
