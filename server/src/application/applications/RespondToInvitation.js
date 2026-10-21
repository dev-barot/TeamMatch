import { TeamFormation } from '../../domain/applications/TeamFormation.js';

export class RespondToInvitation {
  constructor({ applicationRepository, projectRepository, notificationPublisher }) {
    this.appRepo = applicationRepository;
    this.projectRepo = projectRepository;
    this.notifier = notificationPublisher;
  }

  async execute({ applicationId, studentId, decision }) {
    const application = await this.appRepo.findById(applicationId);
    if (!application) {
      throw new Error('Application not found.');
    }

    const project = await this.projectRepo.findById(application.projectId);
    if (!project) {
      throw new Error('Project not found.');
    }

    // Enforce only invited student can respond
    application.assertCanRespond(studentId);

    if (decision === 'accept') {
      TeamFormation.accept(project, application);

      await this.projectRepo.save(project);
      await this.appRepo.save(application);

      if (this.notifier) {
        await this.notifier.publish({
          type: 'INVITATION_ACCEPTED',
          projectId: project.id,
          creatorId: project.creatorId,
          studentId: application.studentId,
          applicationId: application.id,
        });
      }
    } else if (decision === 'reject') {
      application.reject('declined_by_student');
      await this.appRepo.save(application);

      if (this.notifier) {
        await this.notifier.publish({
          type: 'INVITATION_DECLINED',
          projectId: project.id,
          creatorId: project.creatorId,
          studentId: application.studentId,
          applicationId: application.id,
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
