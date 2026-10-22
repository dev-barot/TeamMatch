/**
 * Port: ConversationRepository
 * Abstract contract for storing and querying Conversation aggregates.
 */
export class ConversationRepository {
  /**
   * @param {import('../domain/messaging/Conversation.js').Conversation} _conversation
   * @returns {Promise<void>}
   */
  async save(_conversation) {
    throw new Error('Not implemented: ConversationRepository.save');
  }

  /**
   * @param {string} _id
   * @returns {Promise<import('../domain/messaging/Conversation.js').Conversation|null>}
   */
  async findById(_id) {
    throw new Error('Not implemented: ConversationRepository.findById');
  }

  /**
   * Finds existing conversation between two students (order-independent).
   * @param {string} _studentId1
   * @param {string} _studentId2
   * @returns {Promise<import('../domain/messaging/Conversation.js').Conversation|null>}
   */
  async findByParticipants(_studentId1, _studentId2) {
    throw new Error('Not implemented: ConversationRepository.findByParticipants');
  }

  /**
   * Finds all conversations a student is participant in, ordered by lastMessageAt desc.
   * @param {string} _studentId
   * @returns {Promise<import('../domain/messaging/Conversation.js').Conversation[]>}
   */
  async findByStudentId(_studentId) {
    throw new Error('Not implemented: ConversationRepository.findByStudentId');
  }
}
