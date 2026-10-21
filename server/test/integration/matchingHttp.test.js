import request from 'supertest';
import { createApp } from '../../src/http/app.js';
import { InMemoryStudentRepository } from '../../src/infrastructure/mongo/InMemoryStudentRepository.js';
import { InMemoryProjectRepository } from '../../src/infrastructure/mongo/InMemoryProjectRepository.js';
import { InMemoryApplicationRepository } from '../../src/infrastructure/mongo/InMemoryApplicationRepository.js';
import { JwtTokenSigner } from '../../src/infrastructure/crypto/JwtTokenSigner.js';
import { Student } from '../../src/domain/identity/Student.js';
import { Account } from '../../src/domain/identity/Account.js';
import { Profile } from '../../src/domain/identity/Profile.js';
import { Project } from '../../src/domain/projects/Project.js';
import { Position } from '../../src/domain/projects/Position.js';

describe('Integration: Matching HTTP Endpoints (M4)', () => {
  let app;
  let studentRepo;
  let projectRepo;
  let tokenSigner;

  let creator;
  let student;
  let creatorToken;
  let studentToken;
  let project;

  beforeEach(async () => {
    studentRepo = new InMemoryStudentRepository();
    projectRepo = new InMemoryProjectRepository();
    const appRepo = new InMemoryApplicationRepository();
    tokenSigner = new JwtTokenSigner('test-secret');

    app = createApp({
      studentRepository: studentRepo,
      projectRepository: projectRepo,
      applicationRepository: appRepo,
      tokenSigner,
    });

    creator = new Student({
      id: 'creator-1',
      name: 'Project Creator',
      account: new Account({ email: 'creator@uni.edu', passwordHash: 'hash', isEmailVerified: true }),
      profile: new Profile({ skills: ['Python'], specialty: 'ML' }),
    });

    student = new Student({
      id: 'student-1',
      name: 'Candidate Student',
      account: new Account({ email: 'student@uni.edu', passwordHash: 'hash', isEmailVerified: true }),
      profile: new Profile({ skills: ['React', 'Node.js'], specialty: 'Backend', weeklyAvailability: 15 }),
    });

    await studentRepo.save(creator);
    await studentRepo.save(student);

    creatorToken = await tokenSigner.signAccessToken({ sub: creator.id });
    studentToken = await tokenSigner.signAccessToken({ sub: student.id });

    project = new Project({
      id: 'proj-1',
      title: 'Fullstack App',
      description: 'Building student platform',
      creatorId: creator.id,
      requiredSkills: ['React', 'Node.js'],
      positions: [new Position({ specialty: 'Backend', headcount: 1, filledCount: 0 })],
    });

    await projectRepo.save(project);
  });

  describe('GET /matching/projects', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/matching/projects');
      expect(res.status).toBe(401);
    });

    it('returns 200 with ranked project matches for authenticated student (Rule R4)', async () => {
      const res = await request(app)
        .get('/matching/projects')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('matches');
      expect(Array.isArray(res.body.matches)).toBe(true);
      expect(res.body.matches.length).toBeGreaterThan(0);
      expect(res.body.matches[0].project.id).toBe(project.id);
      expect(res.body.matches[0].match.totalScore).toBeGreaterThan(0);
      expect(res.body.matches[0].match.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('GET /matching/candidates/:projectId', () => {
    it('returns 403 when non-creator attempts to view candidates (Rule R2)', async () => {
      const res = await request(app)
        .get(`/matching/candidates/${project.id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('rule', 'R2');
    });

    it('returns 200 with ranked candidates for creator', async () => {
      const res = await request(app)
        .get(`/matching/candidates/${project.id}`)
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('candidates');
      expect(Array.isArray(res.body.candidates)).toBe(true);
      expect(res.body.candidates.length).toBeGreaterThan(0);
      expect(res.body.candidates[0].student.id).toBe(student.id);
      expect(res.body.candidates[0].match.totalScore).toBeGreaterThan(0);
    });
  });
});
