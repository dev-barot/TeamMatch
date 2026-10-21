/**
 * Port: NotificationPublisher
 * Publishes events (e.g. application submitted, accepted, rejected, project closed).
 */
export class NotificationPublisher {
  /**
   * @param {object} _event
   * @returns {Promise<void>}
   */
  async publish(_event) {
    throw new Error('Not implemented: NotificationPublisher.publish');
  }
}
