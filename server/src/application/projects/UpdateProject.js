import { ProjectNotFoundError } from '../../domain/projects/errors.js';

/**
 * Use Case: UpdateProject
 * Enforces Rule R2: Only the Project's Creator can edit it.
 */
export class UpdateProject {
  constructor({ projectRepository }) {
    this.projectRepo = projectRepository;
  }

  async execute({ projectId, updaterId, projectData }) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    // Enforces Rule R2 inside the domain aggregate
    project.update(projectData, updaterId);
    await this.projectRepo.save(project);

    return project.toJSON();
  }
}
