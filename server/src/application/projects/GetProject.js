import { ProjectNotFoundError } from '../../domain/projects/errors.js';

/**
 * Use Case: GetProject
 * Retrieves a single project by its ID.
 */
export class GetProject {
  constructor({ projectRepository }) {
    this.projectRepo = projectRepository;
  }

  async execute({ projectId }) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }
    return project.toJSON();
  }
}
