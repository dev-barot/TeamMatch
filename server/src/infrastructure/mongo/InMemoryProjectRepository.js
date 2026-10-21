import { ProjectRepository } from '../../ports/ProjectRepository.js';

export class InMemoryProjectRepository extends ProjectRepository {
  constructor() {
    super();
    this.projects = new Map();
  }

  async save(project) {
    this.projects.set(project.id, project);
  }

  async findById(id) {
    return this.projects.get(String(id)) || null;
  }

  async search({
    query = '',
    skills = [],
    specialty = null,
    category = null,
    commitment = null,
    status = 'open',
    _sort = 'newest',
    limit = 20,
    cursor = null,
  } = {}) {
    let results = Array.from(this.projects.values());

    if (status && status !== 'all') {
      results = results.filter(p => p.status === status);
    }

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.requiredSkills.some(s => s.toLowerCase().includes(q))
      );
    }

    if (Array.isArray(skills) && skills.length > 0) {
      const lowerSkills = skills.map(s => s.toLowerCase());
      results = results.filter(p =>
        p.requiredSkills.some(s => lowerSkills.includes(s.toLowerCase()))
      );
    }

    if (specialty) {
      results = results.filter(p =>
        p.positions.some(pos => pos.specialty === specialty)
      );
    }

    if (category) {
      results = results.filter(p => p.category === category);
    }

    if (commitment) {
      results = results.filter(p => p.commitmentLevel === commitment);
    }

    // Sort newest first
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (cursor) {
      const cursorTime = new Date(cursor).getTime();
      results = results.filter(p => p.createdAt.getTime() < cursorTime);
    }

    const total = results.length;
    const paginated = results.slice(0, limit);
    const nextCursor = paginated.length === limit ? paginated[paginated.length - 1].createdAt.toISOString() : null;

    return {
      projects: paginated,
      nextCursor,
      total,
    };
  }

  async findByCreator(creatorId) {
    return Array.from(this.projects.values())
      .filter(p => p.creatorId === creatorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  clear() {
    this.projects.clear();
  }
}
