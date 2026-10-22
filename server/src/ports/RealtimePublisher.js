/**
 * Port: RealtimePublisher
 * Decouples use cases from Socket.IO or WebSocket implementation.
 */
export class RealtimePublisher {
  /**
   * Emits a real-time event directly to a specific student's authenticated room.
   * @param {string} _studentId
   * @param {string} _event
   * @param {object} _data
   * @returns {void}
   */
  emitToStudent(_studentId, _event, _data) {
    throw new Error('Not implemented: RealtimePublisher.emitToStudent');
  }

  /**
   * Emits a broadcast event to all connected sockets.
   * @param {string} _event
   * @param {object} _data
   * @returns {void}
   */
  broadcast(_event, _data) {
    throw new Error('Not implemented: RealtimePublisher.broadcast');
  }
}
