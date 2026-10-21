import { ProjectNotFoundError } from '../../domain/projects/errors.js';

/**
 * Use Case: CloseProject
 * Enforces Rule R2: Only the Project's Creator can close it.
 * Transitions Project to Closed status.
 */
export class CloseProject {
  constructor({ projectRepository }) {
    this.projectRepo = projectRepository;
  }

  async execute({ projectId, closerId }) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    // Enforces Rule R2 & R3 inside the domain aggregate
    project.close(closerId);
    await this.projectRepo.save(project);

    return project.toJSON();
  }
}
