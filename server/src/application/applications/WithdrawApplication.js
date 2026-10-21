import { TeamFormation } from '../../domain/applications/TeamFormation.js';

export class WithdrawApplication {
  constructor({ applicationRepository, projectRepository, notificationPublisher }) {
    this.appRepo = applicationRepository;
    this.projectRepo = projectRepository;
    this.notifier = notificationPublisher;
  }

  async execute({ applicationId, studentId }) {
    const application = await this.appRepo.findById(applicationId);
    if (!application) {
      throw new Error('Application not found.');
    }

    const project = await this.projectRepo.findById(application.projectId);
    if (!project) {
      throw new Error('Project not found.');
    }

    // Only the student can withdraw their application/membership
    application.assertCanWithdraw(studentId);

    const wasAccepted = application.isAccepted();

    // Withdraw transitions status and reopens seat/project if was accepted
    TeamFormation.withdraw(project, application);

    await this.appRepo.save(application);
    if (wasAccepted) {
      await this.projectRepo.save(project);
    }

    if (this.notifier) {
      await this.notifier.publish({
        type: 'APPLICATION_WITHDRAWN',
        projectId: project.id,
        creatorId: project.creatorId,
        studentId,
        wasAccepted,
      });
    }

    return {
      application: application.toJSON(),
      project: project.toJSON(),
    };
  }
}
