import { InMemoryStudentRepository } from '../../src/infrastructure/mongo/InMemoryStudentRepository.js';
import { InMemoryProjectRepository } from '../../src/infrastructure/mongo/InMemoryProjectRepository.js';
import { InMemoryApplicationRepository } from '../../src/infrastructure/mongo/InMemoryApplicationRepository.js';
import { Student } from '../../src/domain/identity/Student.js';
import { Account } from '../../src/domain/identity/Account.js';
import { Profile } from '../../src/domain/identity/Profile.js';
import { Project } from '../../src/domain/projects/Project.js';
import { Position } from '../../src/domain/projects/Position.js';
import { Application } from '../../src/domain/applications/Application.js';
import { ApplicationStatus } from '../../src/domain/applications/ApplicationStatus.js';
import { Origin } from '../../src/domain/applications/Origin.js';
import { UnauthorizedProjectActionError } from '../../src/domain/projects/errors.js';
import { FindMatchedProjectsForStudent } from '../../src/application/matching/FindMatchedProjectsForStudent.js';
import { FindMatchedStudentsForProject } from '../../src/application/matching/FindMatchedStudentsForProject.js';

describe('Integration: AI Matching Engine Use Cases (M4)', () => {
  let studentRepo;
  let projectRepo;
  let appRepo;

  let findMatchedProjects;
  let findMatchedStudents;

  let creator;
  let candidate1;
  let candidate2;
  let project1;
  let project2;

  beforeEach(async () => {
    studentRepo = new InMemoryStudentRepository();
    projectRepo = new InMemoryProjectRepository();
    appRepo = new InMemoryApplicationRepository();

    findMatchedProjects = new FindMatchedProjectsForStudent({
      studentRepository: studentRepo,
      projectRepository: projectRepo,
      applicationRepository: appRepo,
    });

    findMatchedStudents = new FindMatchedStudentsForProject({
      projectRepository: projectRepo,
      studentRepository: studentRepo,
      applicationRepository: appRepo,
    });

    // Seed students
    creator = new Student({
      id: 'creator-1',
      name: 'Creator Student',
      account: new Account({ email: 'creator@university.edu', passwordHash: 'hash_secret', isEmailVerified: true }),
      profile: new Profile({ skills: ['Python'], specialty: 'ML', timezone: 'UTC' }),
    });

    candidate1 = new Student({
      id: 'candidate-1',
      name: 'Alice Candidate',
      account: new Account({ email: 'alice@university.edu', passwordHash: 'hash_secret', isEmailVerified: true }),
      profile: new Profile({
        skills: ['React', 'Node.js', 'PostgreSQL'],
        specialty: 'Backend',
        weeklyAvailability: 12,
        timezone: 'UTC',
        workingStyle: 'collaborative',
      }),
    });

    candidate2 = new Student({
      id: 'candidate-2',
      name: 'Bob Candidate',
      account: new Account({ email: 'bob@university.edu', passwordHash: 'hash_secret', isEmailVerified: true }),
      profile: new Profile({
        skills: ['Figma', 'UI/UX'],
        specialty: 'UI/UX',
        weeklyAvailability: 10,
        timezone: 'UTC',
        workingStyle: 'collaborative',
      }),
    });

    await studentRepo.save(creator);
    await studentRepo.save(candidate1);
    await studentRepo.save(candidate2);

    // Seed projects
    project1 = new Project({
      id: 'proj-1',
      title: 'Fullstack Web App',
      description: 'Building student collaboration platform',
      creatorId: creator.id,
      requiredSkills: ['React', 'Node.js'],
      commitmentLevel: 'medium',
      positions: [
        new Position({ specialty: 'Backend', headcount: 1, filledCount: 0 }),
      ],
      timezone: 'UTC',
    });

    project2 = new Project({
      id: 'proj-2',
      title: 'UI Design System',
      description: 'Designing accessible student components',
      creatorId: creator.id,
      requiredSkills: ['Figma', 'UI/UX'],
      commitmentLevel: 'medium',
      positions: [
        new Position({ specialty: 'UI/UX', headcount: 1, filledCount: 0 }),
      ],
      timezone: 'UTC',
    });

    await projectRepo.save(project1);
    await projectRepo.save(project2);
  });

  describe('FindMatchedProjectsForStudent', () => {
    it('ranks relevant projects for student with top explainable reasons (Rule R4)', async () => {
      const results = await findMatchedProjects.execute({
        studentId: candidate1.id,
        limit: 10,
      });

      expect(results.length).toBe(2);
      // Project 1 requires React and Node.js with open Backend position -> perfect match for candidate 1
      expect(results[0].project.id).toBe(project1.id);
      expect(results[0].match.totalScore).toBeGreaterThan(results[1].match.totalScore);
      expect(results[0].match.reasons.length).toBeGreaterThan(0);
      expect(results[0].match.reasons.length).toBeLessThanOrEqual(5);
    });

    it('excludes projects created by the student themselves', async () => {
      const results = await findMatchedProjects.execute({
        studentId: creator.id,
        limit: 10,
      });

      expect(results).toEqual([]);
    });

    it('excludes projects where student already has an active application (Rule R1)', async () => {
      // Alice applies to project 1
      const app = new Application({
        id: 'app-1',
        projectId: project1.id,
        studentId: candidate1.id,
        specialty: 'Backend',
        origin: Origin.APPLIED,
        status: ApplicationStatus.PENDING,
      });
      await appRepo.save(app);

      const results = await findMatchedProjects.execute({
        studentId: candidate1.id,
        limit: 10,
      });

      // Project 1 is filtered out; only project 2 remains
      expect(results.map(r => r.project.id)).toEqual([project2.id]);
    });
  });

  describe('FindMatchedStudentsForProject', () => {
    it('ranks student candidates for creator with explainable breakdown', async () => {
      const results = await findMatchedStudents.execute({
        projectId: project1.id,
        requesterId: creator.id,
        limit: 20,
      });

      expect(results.length).toBe(2);
      // Alice matches required skills and backend specialty -> ranked #1
      expect(results[0].student.id).toBe(candidate1.id);
      expect(results[0].match.totalScore).toBeGreaterThan(results[1].match.totalScore);
    });

    it('R2: non-creator cannot access matched candidate list', async () => {
      await expect(findMatchedStudents.execute({
        projectId: project1.id,
        requesterId: candidate1.id,
        limit: 20,
      })).rejects.toThrow(UnauthorizedProjectActionError);
    });

    it('excludes students who already applied to the project', async () => {
      // Alice applies
      const app = new Application({
        id: 'app-alice',
        projectId: project1.id,
        studentId: candidate1.id,
        specialty: 'Backend',
        origin: Origin.APPLIED,
        status: ApplicationStatus.PENDING,
      });
      await appRepo.save(app);

      const results = await findMatchedStudents.execute({
        projectId: project1.id,
        requesterId: creator.id,
      });

      // Only Bob remains as a fresh candidate
      expect(results.map(r => r.student.id)).toEqual([candidate2.id]);
    });
  });
});
