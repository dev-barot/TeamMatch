/**
 * Port: MessageRepository
 * Abstract contract for storing and querying Messages.
 */
export class MessageRepository {
  /**
   * @param {import('../domain/messaging/Message.js').Message} _message
   * @returns {Promise<void>}
   */
  async save(_message) {
    throw new Error('Not implemented: MessageRepository.save');
  }

  /**
   * Finds messages in a conversation sorted chronologically.
   * @param {string} _conversationId
   * @param {object} [_options]
   * @param {number} [_options.limit=50]
   * @returns {Promise<import('../domain/messaging/Message.js').Message[]>}
   */
  async findByConversationId(_conversationId, _options = {}) {
    throw new Error('Not implemented: MessageRepository.findByConversationId');
  }

  /**
   * Marks unread messages in a conversation as read by the reader student.
   * @param {string} _conversationId
   * @param {string} _readerStudentId
   * @returns {Promise<number>} count of messages updated
   */
  async markConversationRead(_conversationId, _readerStudentId) {
    throw new Error('Not implemented: MessageRepository.markConversationRead');
  }
}
