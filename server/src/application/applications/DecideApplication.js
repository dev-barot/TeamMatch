import { TeamFormation } from '../../domain/applications/TeamFormation.js';

export class DecideApplication {
  constructor({ applicationRepository, projectRepository, notificationPublisher }) {
    this.appRepo = applicationRepository;
    this.projectRepo = projectRepository;
    this.notifier = notificationPublisher;
  }

  async execute({ applicationId, creatorId, decision, rejectionReason = 'rejected_by_creator' }) {
    const application = await this.appRepo.findById(applicationId);
    if (!application) {
      throw new Error('Application not found.');
    }

    const project = await this.projectRepo.findById(application.projectId);
    if (!project) {
      throw new Error('Project not found.');
    }

    // Rule R2: Only Creator can decide
    application.assertCanDecide(creatorId, project.creatorId);

    if (decision === 'accept') {
      // Domain service handles capacity increment and project status transition (R3)
      TeamFormation.accept(project, application);

      await this.projectRepo.save(project);
      await this.appRepo.save(application);

      if (this.notifier) {
        await this.notifier.publish({
          type: 'APPLICATION_ACCEPTED',
          projectId: project.id,
          studentId: application.studentId,
          applicationId: application.id,
        });
      }
    } else if (decision === 'reject') {
      application.reject(rejectionReason);
      await this.appRepo.save(application);

      if (this.notifier) {
        await this.notifier.publish({
          type: 'APPLICATION_REJECTED',
          projectId: project.id,
          studentId: application.studentId,
          applicationId: application.id,
          reason: rejectionReason,
        });
      }
    } else {
      throw new Error(`Invalid decision "${decision}". Must be 'accept' or 'reject'.`);
    }

    return {
      application: application.toJSON(),
      project: project.toJSON(),
    };
  }
}
