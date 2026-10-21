export class GetProjectApplications {
  constructor({ applicationRepository, projectRepository }) {
    this.appRepo = applicationRepository;
    this.projectRepo = projectRepository;
  }

  async execute({ projectId, requesterId, filters = {} }) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new Error('Project not found.');
    }

    // Rule R2: Only Creator can view incoming applications
    project.assertCreator(requesterId);

    const apps = await this.appRepo.findByProjectId(projectId, filters);
    return apps.map(app => app.toJSON());
  }
}
