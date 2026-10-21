import crypto from 'node:crypto';
import { Application } from '../../domain/applications/Application.js';
import { Origin } from '../../domain/applications/Origin.js';
import { ApplicationStatus } from '../../domain/applications/ApplicationStatus.js';
import {
  DuplicateApplicationError,
  PositionNotFoundError,
  PositionAlreadyFilledError,
} from '../../domain/applications/errors.js';
import { ProjectStatus } from '../../domain/projects/ProjectStatus.js';

export class InviteStudent {
  constructor({ applicationRepository, projectRepository, studentRepository, notificationPublisher }) {
    this.appRepo = applicationRepository;
    this.projectRepo = projectRepository;
    this.studentRepo = studentRepository;
    this.notifier = notificationPublisher;
  }

  async execute({ projectId, creatorId, studentId, specialty, notes = '' }) {
    // 1. Fetch project and verify Creator authority (Rule R2)
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new Error('Project not found.');
    }
    project.assertCreator(creatorId);

    if (project.status === ProjectStatus.CLOSED) {
      throw new Error('Cannot invite to a closed Project.');
    }

    // 2. Cannot invite yourself
    if (studentId === creatorId) {
      throw new Error('Project Creator cannot invite themselves.');
    }

    // 3. Verify target student exists
    const student = await this.studentRepo.findById(studentId);
    if (!student) {
      throw new Error('Target student not found.');
    }

    // 4. Validate Position exists and has capacity (R3)
    const position = project.positions.find(p => p.specialty === specialty);
    if (!position) {
      throw new PositionNotFoundError(specialty);
    }
    if (position.isFull()) {
      throw new PositionAlreadyFilledError(specialty);
    }

    // 5. Enforce Rule R1: At most one Pending or Accepted Application per (Project, Student)
    const existing = await this.appRepo.findActiveByProjectAndStudent(projectId, studentId);
    if (existing) {
      throw new DuplicateApplicationError(projectId, studentId);
    }

    // 6. Create Invitation Application
    const applicationId = crypto.randomUUID();
    const application = new Application({
      id: applicationId,
      projectId,
      studentId,
      specialty,
      origin: Origin.INVITED,
      status: ApplicationStatus.PENDING,
      notes,
    });

    await this.appRepo.save(application);

    // 7. Publish notification
    if (this.notifier) {
      await this.notifier.publish({
        type: 'INVITATION_RECEIVED',
        projectId,
        studentId,
        applicationId,
      });
    }

    return application.toJSON();
  }
}
