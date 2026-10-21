/**
 * Port: ProjectRepository
 * Abstract interface for Project persistence and querying.
 */
export class ProjectRepository {
  /**
   * Persists a Project aggregate (insert or update).
   * @param {import('../domain/projects/Project.js').Project} _project
   * @returns {Promise<void>}
   */
  async save(_project) {
    throw new Error('Not implemented: ProjectRepository.save');
  }

  /**
   * Retrieves a Project by its ID.
   * @param {string} _id
   * @returns {Promise<import('../domain/projects/Project.js').Project|null>}
   */
  async findById(_id) {
    throw new Error('Not implemented: ProjectRepository.findById');
  }

  /**
   * Searches and filters projects.
   * @param {Object} _params
   * @param {string} [_params.query] - text search in title, description, skills
   * @param {string[]} [_params.skills] - filter by required skills
   * @param {string} [_params.specialty] - filter by position specialty
   * @param {string} [_params.category] - filter by category
   * @param {string} [_params.commitment] - filter by commitment level
   * @param {string} [_params.status] - filter by status (defaults to excluding closed/filled in browsing)
   * @param {string} [_params.cursor] - pagination cursor (e.g. ISO date or ID)
   * @param {number} [_params.limit] - max results (default 20, max 50)
   * @returns {Promise<{ projects: import('../domain/projects/Project.js').Project[], nextCursor: string|null, total: number }>}
   */
  async search(_params = {}) {
    throw new Error('Not implemented: ProjectRepository.search');
  }

  /**
   * Retrieves all projects created by a specific Student.
   * @param {string} _creatorId
   * @returns {Promise<import('../domain/projects/Project.js').Project[]>}
   */
  async findByCreator(_creatorId) {
    throw new Error('Not implemented: ProjectRepository.findByCreator');
  }
}
