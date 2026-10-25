import { ACCOUNT_TYPES } from '../../domain/identity/Account.js';
import { UnauthorizedAdminActionError, AccountNotFoundError } from '../../domain/moderation/errors.js';
import { ProjectNotFoundError } from '../../domain/projects/errors.js';
import { ApplicationStatus } from '../../domain/applications/ApplicationStatus.js';

/**
 * Use Case: AdminCloseProject
 * Admin forcibly closes a Project regardless of who the Creator is.
 * Rejects all Pending Applications with reason 'project_closed' and notifies applicants.
 *
 * Rule R2: Only Admin may call this (domain-level check, not just middleware).
 * Rule R3: Closing rejects all Pending Applications with reason 'project_closed'.
 */
export class AdminCloseProject {
  constructor({ projectRepository, applicationRepository, notificationPublisher }) {
    this.projectRepo = projectRepository;
    this.appRepo = applicationRepository;
    this.notifier = notificationPublisher;
  }

  async execute({ projectId, adminId, requesterAccountType }) {
    // Domain-level R2 check
    if (requesterAccountType !== ACCOUNT_TYPES.ADMIN) {
      throw new UnauthorizedAdminActionError('Only an Admin can forcibly close a Project (R2).');
    }

    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    // Fetch all pending applications for this project
    const allApplications = await this.appRepo.findByProjectId(projectId, {});
    const pendingApplications = allApplications.filter(
      (app) => app.status === ApplicationStatus.PENDING,
    );

    // Admin-specific domain close — bypasses assertCreator
    project.forceClose();
    await this.projectRepo.save(project);

    // Reject all Pending Applications with reason 'project_closed' (Rule R3)
    const rejectedApplicationIds = [];
    for (const app of pendingApplications) {
      app.reject('project_closed');
      await this.appRepo.save(app);
      rejectedApplicationIds.push(app.id);

      if (this.notifier) {
        await this.notifier.publish({
          type: 'APPLICATION_REJECTED',
          projectId: project.id,
          studentId: app.studentId,
          applicationId: app.id,
          reason: 'project_closed',
        });
      }
    }

    return {
      project: project.toJSON(),
      rejectedApplicationIds,
      rejectedCount: rejectedApplicationIds.length,
    };
  }
}
