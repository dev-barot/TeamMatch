/**
 * Port: ReportRepository
 * Abstract contract for storing and querying Report aggregates.
 * Named in code at: server/src/ports/ReportRepository.js
 */
export class ReportRepository {
  /**
   * @param {import('../domain/moderation/Report.js').Report} _report
   * @returns {Promise<void>}
   */
  async save(_report) {
    throw new Error('Not implemented: ReportRepository.save');
  }

  /**
   * @param {string} _id
   * @returns {Promise<import('../domain/moderation/Report.js').Report|null>}
   */
  async findById(_id) {
    throw new Error('Not implemented: ReportRepository.findById');
  }

  /**
   * Lists all Reports, optionally filtered by status.
   * @param {{ status?: string, limit?: number, offset?: number }} [_filters]
   * @returns {Promise<import('../domain/moderation/Report.js').Report[]>}
   */
  async findAll(_filters) {
    throw new Error('Not implemented: ReportRepository.findAll');
  }

  /**
   * Lists all Reports filed against a specific target (student or conversation).
   * @param {string} _targetId
   * @returns {Promise<import('../domain/moderation/Report.js').Report[]>}
   */
  async findByTargetId(_targetId) {
    throw new Error('Not implemented: ReportRepository.findByTargetId');
  }
}
