import { StudentNotFoundError } from '../../domain/identity/errors.js';
import { ProjectStatus } from '../../domain/projects/ProjectStatus.js';
import { ApplicationStatus } from '../../domain/applications/ApplicationStatus.js';
import { MatchingEngine } from '../../domain/matching/MatchingEngine.js';
import { rankProjectsForStudent } from '../../domain/matching/ranker.js';

export class FindMatchedProjectsForStudent {
  constructor({
    studentRepository,
    projectRepository,
    applicationRepository,
    matchingEngine = new MatchingEngine(),
  }) {
    this.studentRepo = studentRepository;
    this.projectRepo = projectRepository;
    this.applicationRepo = applicationRepository;
    this.matchingEngine = matchingEngine;
  }

  async execute({ studentId, limit = 10 }) {
    const student = await this.studentRepo.findById(studentId);
    if (!student) {
      throw new StudentNotFoundError(studentId);
    }

    // Fetch open projects
    const { projects } = await this.projectRepo.search({
      status: ProjectStatus.OPEN,
      limit: 100,
    });

    // Fetch student's existing applications to filter out projects with active applications
    const studentApplications = await this.applicationRepo.findByStudentId(studentId);
    const activeProjectIds = new Set(
      studentApplications
        .filter(a => a.isActive())
        .map(a => a.projectId)
    );

    // Filter project candidates
    const eligibleProjects = projects.filter(p => {
      // Exclude own projects
      if (p.creatorId === student.id) return false;
      // Exclude non-open projects
      if (p.status !== ProjectStatus.OPEN) return false;
      // Exclude projects where student already has active application (Rule R1)
      if (activeProjectIds.has(p.id)) return false;
      return true;
    });

    // Build context for each candidate with accepted members (Rule R4)
    const candidatesWithContext = await Promise.all(
      eligibleProjects.map(async (project) => {
        const acceptedApps = await this.applicationRepo.findByProjectId(project.id, {
          status: ApplicationStatus.ACCEPTED,
        });

        const teamMembers = (
          await Promise.all(
            acceptedApps.map(app => this.studentRepo.findById(app.studentId))
          )
        ).filter(Boolean);

        return { project, teamMembers };
      })
    );

    return rankProjectsForStudent(student, candidatesWithContext, limit, this.matchingEngine);
  }
}
