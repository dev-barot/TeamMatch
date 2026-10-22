/**
 * Port: NotificationRepository
 * Abstract contract for storing and querying in-app Notifications.
 */
export class NotificationRepository {
  /**
   * @param {import('../domain/messaging/Notification.js').Notification} _notification
   * @returns {Promise<void>}
   */
  async save(_notification) {
    throw new Error('Not implemented: NotificationRepository.save');
  }

  /**
   * @param {string} _id
   * @returns {Promise<import('../domain/messaging/Notification.js').Notification|null>}
   */
  async findById(_id) {
    throw new Error('Not implemented: NotificationRepository.findById');
  }

  /**
   * Finds notifications for a student, newest first.
   * @param {string} _studentId
   * @param {object} [_options]
   * @param {number} [_options.limit=30]
   * @param {boolean} [_options.unreadOnly=false]
   * @returns {Promise<import('../domain/messaging/Notification.js').Notification[]>}
   */
  async findByStudentId(_studentId, _options = {}) {
    throw new Error('Not implemented: NotificationRepository.findByStudentId');
  }

  /**
   * Marks a specific notification as read.
   * @param {string} _id
   * @param {string} _studentId
   * @returns {Promise<import('../domain/messaging/Notification.js').Notification|null>}
   */
  async markRead(_id, _studentId) {
    throw new Error('Not implemented: NotificationRepository.markRead');
  }

  /**
   * Marks all unread notifications for a student as read.
   * @param {string} _studentId
   * @returns {Promise<number>}
   */
  async markAllRead(_studentId) {
    throw new Error('Not implemented: NotificationRepository.markAllRead');
  }
}
