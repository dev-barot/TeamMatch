import { ProjectNotFoundError } from '../../domain/projects/errors.js';
import { ApplicationStatus } from '../../domain/applications/ApplicationStatus.js';
import { MatchingEngine } from '../../domain/matching/MatchingEngine.js';
import { rankStudentsForProject } from '../../domain/matching/ranker.js';

export class FindMatchedStudentsForProject {
  constructor({
    projectRepository,
    studentRepository,
    applicationRepository,
    matchingEngine = new MatchingEngine(),
  }) {
    this.projectRepo = projectRepository;
    this.studentRepo = studentRepository;
    this.applicationRepo = applicationRepository;
    this.matchingEngine = matchingEngine;
  }

  async execute({ projectId, requesterId, limit = 20 }) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    // Rule R2: Only Creator can view matched candidates for their project
    project.assertCreator(requesterId);

    // Fetch existing accepted team members (Rule R4)
    const acceptedApps = await this.applicationRepo.findByProjectId(projectId, {
      status: ApplicationStatus.ACCEPTED,
    });

    const teamMembers = (
      await Promise.all(
        acceptedApps.map(app => this.studentRepo.findById(app.studentId))
      )
    ).filter(Boolean);

    // Fetch all active applications to exclude current applicants/members
    const activeApps = (await this.applicationRepo.findByProjectId(projectId)).filter(a => a.isActive());
    const excludedStudentIds = new Set([
      requesterId, // Creator
      ...activeApps.map(a => a.studentId),
    ]);

    // Query candidate verified students (Rule R5)
    const candidates = await this.studentRepo.findAllVerified({
      excludeIds: Array.from(excludedStudentIds),
      limit: 100,
    });

    return rankStudentsForProject(project, teamMembers, candidates, limit, this.matchingEngine);
  }
}
