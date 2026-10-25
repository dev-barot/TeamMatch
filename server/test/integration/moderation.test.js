import supertest from 'supertest';
import { createApp } from '../../src/http/app.js';
import { InMemoryStudentRepository } from '../../src/infrastructure/mongo/InMemoryStudentRepository.js';
import { InMemoryProjectRepository } from '../../src/infrastructure/mongo/InMemoryProjectRepository.js';
import { InMemoryApplicationRepository } from '../../src/infrastructure/mongo/InMemoryApplicationRepository.js';
import { InMemoryReportRepository } from '../../src/infrastructure/mongo/InMemoryReportRepository.js';
import { InMemoryConversationRepository } from '../../src/infrastructure/mongo/InMemoryConversationRepository.js';
import { InMemoryMessageRepository } from '../../src/infrastructure/mongo/InMemoryMessageRepository.js';
import { InMemoryNotificationRepository } from '../../src/infrastructure/mongo/InMemoryNotificationRepository.js';
import { JwtTokenSigner } from '../../src/infrastructure/crypto/JwtTokenSigner.js';
import { BcryptPasswordHasher } from '../../src/infrastructure/crypto/BcryptPasswordHasher.js';
import { Student } from '../../src/domain/identity/Student.js';
import { Account, ACCOUNT_TYPES } from '../../src/domain/identity/Account.js';
import { Profile } from '../../src/domain/identity/Profile.js';
import { Project } from '../../src/domain/projects/Project.js';
import { Position } from '../../src/domain/projects/Position.js';
import { ApplicationStatus } from '../../src/domain/applications/ApplicationStatus.js';
import { Application } from '../../src/domain/applications/Application.js';
import { Origin } from '../../src/domain/applications/Origin.js';

// ─── Test setup ──────────────────────────────────────────────────────────────
const TEST_SECRETS = {
  accessSecret: 'test_access_secret',
  refreshSecret: 'test_refresh_secret',
};

function makeStudentEntity(id, overrides = {}) {
  return new Student({
    id,
    name: overrides.name || `Student ${id}`,
    account: new Account({
      email: overrides.email || `${id}@test.com`,
      passwordHash: 'hashed',
      accountType: overrides.accountType || ACCOUNT_TYPES.STUDENT,
      isEmailVerified: overrides.isEmailVerified !== undefined ? overrides.isEmailVerified : true,
      isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    }),
    profile: new Profile({ specialty: 'Backend' }),
  });
}

function makeProjectEntity(id, creatorId) {
  return new Project({
    id,
    title: 'Test Project',
    description: 'A project for testing admin close feature.',
    creatorId,
    requiredSkills: ['node.js'],
    positions: [new Position({ specialty: 'Backend', headcount: 1 })],
    commitmentLevel: 'medium',
  });
}

describe('Integration: Admin & Moderation HTTP (M6)', () => {
  let app;
  let studentRepo;
  let projectRepo;
  let applicationRepo;
  let reportRepo;
  let tokenSigner;
  let adminToken;
  let studentToken;
  let adminStudent;
  let regularStudent;
  let creatorStudent;

  beforeEach(async () => {
    studentRepo = new InMemoryStudentRepository();
    projectRepo = new InMemoryProjectRepository();
    applicationRepo = new InMemoryApplicationRepository();
    reportRepo = new InMemoryReportRepository();
    const conversationRepo = new InMemoryConversationRepository();
    const messageRepo = new InMemoryMessageRepository();
    const notificationRepo = new InMemoryNotificationRepository();

    tokenSigner = new JwtTokenSigner(TEST_SECRETS);
    const passwordHasher = new BcryptPasswordHasher();

    // Create admin account
    adminStudent = makeStudentEntity('admin_001', {
      name: 'Platform Admin',
      email: 'admin@test.com',
      accountType: ACCOUNT_TYPES.ADMIN,
    });
    await studentRepo.save(adminStudent);

    // Create regular student
    regularStudent = makeStudentEntity('student_001', { email: 'student@test.com' });
    await studentRepo.save(regularStudent);

    // Create another student (will be creator)
    creatorStudent = makeStudentEntity('creator_001', { email: 'creator@test.com' });
    await studentRepo.save(creatorStudent);

    app = createApp({
      studentRepository: studentRepo,
      projectRepository: projectRepo,
      applicationRepository: applicationRepo,
      reportRepository: reportRepo,
      conversationRepository: conversationRepo,
      messageRepository: messageRepo,
      notificationRepository: notificationRepo,
      tokenSigner,
      passwordHasher,
    });

    // Generate tokens
    adminToken = tokenSigner.signAccessToken({
      sub: adminStudent.id,
      email: adminStudent.account.email,
      accountType: ACCOUNT_TYPES.ADMIN,
      isEmailVerified: true,
    });

    studentToken = tokenSigner.signAccessToken({
      sub: regularStudent.id,
      email: regularStudent.account.email,
      accountType: ACCOUNT_TYPES.STUDENT,
      isEmailVerified: true,
    });
  });

  // ─── R2: Student gets 403 on ALL /admin/* routes ──────────────────────────
  describe('R2: Student gets 403 on every /admin/* route', () => {
    it('R2: GET /admin/accounts returns 403 for Student', async () => {
      const res = await supertest(app)
        .get('/admin/accounts')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
      expect(res.body.rule).toBe('R2');
    });

    it('R2: PATCH /admin/accounts/:id/deactivate returns 403 for Student', async () => {
      const res = await supertest(app)
        .patch('/admin/accounts/student_001/deactivate')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});
      expect(res.status).toBe(403);
      expect(res.body.rule).toBe('R2');
    });

    it('R2: POST /admin/projects/:id/close returns 403 for Student', async () => {
      const res = await supertest(app)
        .post('/admin/projects/proj_001/close')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});
      expect(res.status).toBe(403);
      expect(res.body.rule).toBe('R2');
    });

    it('R2: GET /admin/reports returns 403 for Student', async () => {
      const res = await supertest(app)
        .get('/admin/reports')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
      expect(res.body.rule).toBe('R2');
    });

    it('R2: PATCH /admin/reports/:id/review returns 403 for Student', async () => {
      const res = await supertest(app)
        .patch('/admin/reports/r1/review')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});
      expect(res.status).toBe(403);
      expect(res.body.rule).toBe('R2');
    });

    it('R2: /admin/* requires authentication — returns 401 without token', async () => {
      const res = await supertest(app).get('/admin/accounts');
      expect(res.status).toBe(401);
    });
  });

  // ─── Admin: List Accounts ─────────────────────────────────────────────────
  describe('Admin: GET /admin/accounts', () => {
    it('Admin can list all accounts including unverified', async () => {
      const unverified = makeStudentEntity('unverified_001', { isEmailVerified: false });
      await studentRepo.save(unverified);

      const res = await supertest(app)
        .get('/admin/accounts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.accounts).toBeInstanceOf(Array);
      // privacy: no passwordHash anywhere in response
      res.body.accounts.forEach((a) => {
        expect(a).not.toHaveProperty('passwordHash');
      });
    });
  });

  // ─── Admin: Deactivate blocks login ──────────────────────────────────────
  describe('Admin: PATCH /admin/accounts/:id/deactivate', () => {
    it('Deactivate blocks login — deactivated Account cannot log in', async () => {
      // Deactivate the student
      const deactivateRes = await supertest(app)
        .patch(`/admin/accounts/${regularStudent.id}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(deactivateRes.status).toBe(200);
      expect(deactivateRes.body.isActive).toBe(false);

      // Verify the account is now inactive in the repo
      const saved = await studentRepo.findById(regularStudent.id);
      expect(saved.account.isActive).toBe(false);
      // Login would fail via assertCanLogin
      expect(() => saved.account.assertCanLogin()).toThrow('deactivated');
    });

    it('returns 404 for a non-existent account', async () => {
      const res = await supertest(app)
        .patch('/admin/accounts/nonexistent_id/deactivate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(404);
    });

    it('returns 409 for already-deactivated account', async () => {
      // First deactivation
      await supertest(app)
        .patch(`/admin/accounts/${regularStudent.id}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      // Second deactivation attempt
      const res = await supertest(app)
        .patch(`/admin/accounts/${regularStudent.id}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(409);
    });
  });

  // ─── Admin: Close Project — rejects Pending with 'project_closed' ─────────
  describe('Admin: POST /admin/projects/:id/close', () => {
    it('Admin close rejects all Pending Applications with reason project_closed', async () => {
      // Create a project by creator
      const project = makeProjectEntity('proj_test_001', creatorStudent.id);
      await projectRepo.save(project);

      // Create a pending application
      const app1 = new Application({
        id: 'app_001',
        projectId: 'proj_test_001',
        studentId: regularStudent.id,
        specialty: 'Backend',
        origin: Origin.APPLIED,
        status: ApplicationStatus.PENDING,
      });
      await applicationRepo.save(app1);

      const res = await supertest(app)
        .post('/admin/projects/proj_test_001/close')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.rejectedCount).toBe(1);
      expect(res.body.rejectedApplicationIds).toContain('app_001');

      // Verify project is now Closed
      const closedProject = await projectRepo.findById('proj_test_001');
      expect(closedProject.status).toBe('closed');

      // Verify application is now Rejected with reason project_closed
      const rejectedApp = await applicationRepo.findById('app_001');
      expect(rejectedApp.status).toBe(ApplicationStatus.REJECTED);
      expect(rejectedApp.rejectionReason).toBe('project_closed');
    });

    it('returns 404 for non-existent project', async () => {
      const res = await supertest(app)
        .post('/admin/projects/nonexistent_proj/close')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(404);
    });
  });

  // ─── Admin: Reports queue ─────────────────────────────────────────────────
  describe('Admin: Reports queue', () => {
    it('GET /admin/reports returns empty array when no reports', async () => {
      const res = await supertest(app)
        .get('/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.reports).toEqual([]);
    });

    it('Student can file a report via POST /moderation/reports/students', async () => {
      const res = await supertest(app)
        .post('/moderation/reports/students')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ targetStudentId: creatorStudent.id, reason: 'Harassment in messages.' });
      expect(res.status).toBe(201);
      expect(res.body.report.targetType).toBe('student');
      expect(res.body.report.status).toBe('pending');
    });

    it('Admin can see and review a filed report', async () => {
      // Student files a report
      const fileRes = await supertest(app)
        .post('/moderation/reports/students')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ targetStudentId: creatorStudent.id, reason: 'Spam.' });
      expect(fileRes.status).toBe(201);
      const reportId = fileRes.body.report.id;

      // Admin lists reports
      const listRes = await supertest(app)
        .get('/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.reports).toHaveLength(1);

      // Admin reviews the report
      const reviewRes = await supertest(app)
        .patch(`/admin/reports/${reportId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(reviewRes.status).toBe(200);
      expect(reviewRes.body.report.status).toBe('reviewed');
      expect(reviewRes.body.report.reviewedByAdminId).toBe(adminStudent.id);
    });

    it('returns 409 when reviewing an already-reviewed report', async () => {
      // File and immediately review
      const fileRes = await supertest(app)
        .post('/moderation/reports/students')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ targetStudentId: creatorStudent.id, reason: 'Test.' });
      const reportId = fileRes.body.report.id;

      await supertest(app)
        .patch(`/admin/reports/${reportId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      // Second review attempt
      const secondRes = await supertest(app)
        .patch(`/admin/reports/${reportId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(secondRes.status).toBe(409);
    });
  });
});
