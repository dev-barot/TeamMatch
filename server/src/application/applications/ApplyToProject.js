import crypto from 'node:crypto';
import { Application } from '../../domain/applications/Application.js';
import { Origin } from '../../domain/applications/Origin.js';
import { ApplicationStatus } from '../../domain/applications/ApplicationStatus.js';
import {
  CreatorCannotApplyError,
  DuplicateApplicationError,
  PositionNotFoundError,
  PositionAlreadyFilledError,
} from '../../domain/applications/errors.js';
import { ProjectStatus } from '../../domain/projects/ProjectStatus.js';

export class ApplyToProject {
  constructor({ applicationRepository, projectRepository, studentRepository, notificationPublisher }) {
    this.appRepo = applicationRepository;
    this.projectRepo = projectRepository;
    this.studentRepo = studentRepository;
    this.notifier = notificationPublisher;
  }

  async execute({ projectId, studentId, specialty, notes = '' }) {
    // 1. Fetch student and enforce Rule R5 (Verify before acting)
    const student = await this.studentRepo.findById(studentId);
    if (!student) {
      throw new Error('Student not found.');
    }
    student.assertEmailVerified();

    // 2. Fetch project and validate existence & status
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new Error('Project not found.');
    }

    if (project.status === ProjectStatus.CLOSED) {
      throw new Error('Cannot apply to a closed Project.');
    }

    // 3. Creator cannot apply to their own Project
    if (project.creatorId === studentId) {
      throw new CreatorCannotApplyError();
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

    // 6. Create Application
    const applicationId = crypto.randomUUID();
    const application = new Application({
      id: applicationId,
      projectId,
      studentId,
      specialty,
      origin: Origin.APPLIED,
      status: ApplicationStatus.PENDING,
      notes,
    });

    await this.appRepo.save(application);

    // 7. Publish notification
    if (this.notifier) {
      await this.notifier.publish({
        type: 'APPLICATION_SUBMITTED',
        projectId,
        creatorId: project.creatorId,
        studentId,
        applicationId,
      });
    }

    return application.toJSON();
  }
}
