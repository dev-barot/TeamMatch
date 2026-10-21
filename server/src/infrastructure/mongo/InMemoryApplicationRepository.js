import { ApplicationRepository } from '../../ports/ApplicationRepository.js';
import { DuplicateApplicationError } from '../../domain/applications/errors.js';

export class InMemoryApplicationRepository extends ApplicationRepository {
  constructor() {
    super();
    this.applications = new Map();
  }

  async save(application) {
    // Enforce Rule R1: At most one Pending or Accepted Application per (Project, Student)
    if (application.isActive()) {
      for (const existing of this.applications.values()) {
        if (
          existing.id !== application.id &&
          existing.projectId === application.projectId &&
          existing.studentId === application.studentId &&
          existing.isActive()
        ) {
          throw new DuplicateApplicationError(application.projectId, application.studentId);
        }
      }
    }

    this.applications.set(application.id, application);
  }

  async findById(id) {
    return this.applications.get(String(id)) || null;
  }

  async findActiveByProjectAndStudent(projectId, studentId) {
    const pId = String(projectId);
    const sId = String(studentId);

    for (const app of this.applications.values()) {
      if (app.projectId === pId && app.studentId === sId && app.isActive()) {
        return app;
      }
    }
    return null;
  }

  async findByProjectId(projectId, filters = {}) {
    const pId = String(projectId);
    const results = [];

    for (const app of this.applications.values()) {
      if (app.projectId === pId) {
        if (filters.status && app.status !== filters.status) {
          continue;
        }
        if (filters.specialty && app.specialty !== filters.specialty) {
          continue;
        }
        results.push(app);
      }
    }

    // Sort newest first
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findByStudentId(studentId) {
    const sId = String(studentId);
    const results = [];

    for (const app of this.applications.values()) {
      if (app.studentId === sId) {
        results.push(app);
      }
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  clear() {
    this.applications.clear();
  }
}
