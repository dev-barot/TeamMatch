import { ProjectStatus } from '../../domain/projects/ProjectStatus.js';

/**
 * Use Case: BrowseProjects
 * Filters by skill, category, commitment, and specialty.
 * Pagination: default limit 20, max 50.
 * Default excludes Filled and Closed projects.
 * Sorting: newest | most-matched (most-matched stubbed until M4).
 */
export class BrowseProjects {
  constructor({ projectRepository }) {
    this.projectRepo = projectRepository;
  }

  async execute({
    query = '',
    skills = [],
    specialty = null,
    category = null,
    commitment = null,
    status = null,
    sort = 'newest',
    limit = 20,
    cursor = null,
  } = {}) {
    // Clamp limit: default 20, max 50
    let parsedLimit = Number.parseInt(limit, 10);
    if (Number.isNaN(parsedLimit) || parsedLimit < 1) {
      parsedLimit = 20;
    }
    const clampedLimit = Math.min(parsedLimit, 50);

    // Default status: open only (excludes filled/closed)
    const effectiveStatus = status || ProjectStatus.OPEN;

    const normalizedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string' && skills.trim()
        ? skills.split(',').map(s => s.trim())
        : [];

    const searchResult = await this.projectRepo.search({
      query: typeof query === 'string' ? query.trim() : '',
      skills: normalizedSkills,
      specialty,
      category,
      commitment,
      status: effectiveStatus,
      sort,
      limit: clampedLimit,
      cursor,
    });

    return {
      projects: searchResult.projects.map(p => p.toJSON()),
      nextCursor: searchResult.nextCursor || null,
      total: searchResult.total,
      limit: clampedLimit,
    };
  }
}
