/**
 * Port: ApplicationRepository
 * Abstract contract for storing and querying Application aggregates.
 */
export class ApplicationRepository {
  /**
   * @param {import('../domain/applications/Application.js').Application} _application
   * @returns {Promise<void>}
   */
  async save(_application) {
    throw new Error('Not implemented: ApplicationRepository.save');
  }

  /**
   * @param {string} _id
   * @returns {Promise<import('../domain/applications/Application.js').Application|null>}
   */
  async findById(_id) {
    throw new Error('Not implemented: ApplicationRepository.findById');
  }

  /**
   * Finds active application (status Pending or Accepted) for Rule R1 enforcement.
   * @param {string} _projectId
   * @param {string} _studentId
   * @returns {Promise<import('../domain/applications/Application.js').Application|null>}
   */
  async findActiveByProjectAndStudent(_projectId, _studentId) {
    throw new Error('Not implemented: ApplicationRepository.findActiveByProjectAndStudent');
  }

  /**
   * Finds all applications for a project (for Creator dashboard).
   * @param {string} _projectId
   * @param {object} [_filters]
   * @returns {Promise<import('../domain/applications/Application.js').Application[]>}
   */
  async findByProjectId(_projectId, _filters) {
    throw new Error('Not implemented: ApplicationRepository.findByProjectId');
  }

  /**
   * Finds all applications initiated by or invited to a student (for Student dashboard).
   * @param {string} _studentId
   * @returns {Promise<import('../domain/applications/Application.js').Application[]>}
   */
  async findByStudentId(_studentId) {
    throw new Error('Not implemented: ApplicationRepository.findByStudentId');
  }
}
