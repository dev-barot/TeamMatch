import request from 'supertest';
import { createApp } from '../../src/http/app.js';
import { ConsoleMailer } from '../../src/infrastructure/mail/ConsoleMailer.js';
import { InMemoryStudentRepository } from '../../src/infrastructure/mongo/InMemoryStudentRepository.js';
import { InMemoryProjectRepository } from '../../src/infrastructure/mongo/InMemoryProjectRepository.js';

describe('Integration: Projects API (M2)', () => {
  let app;
  let mailer;
  let studentRepo;
  let projectRepo;

  let verifiedToken;
  let verifiedStudentId;

  let unverifiedToken;

  let otherStudentToken;

  beforeEach(async () => {
    mailer = new ConsoleMailer();
    studentRepo = new InMemoryStudentRepository();
    projectRepo = new InMemoryProjectRepository();

    app = createApp({
      studentRepository: studentRepo,
      projectRepository: projectRepo,
      mailer,
    });

    // 1. Create a verified student
    const verifiedSignup = await request(app)
      .post('/auth/signup')
      .send({
        name: 'Alice Creator',
        email: 'alice@university.edu',
        password: 'password123',
        specialty: 'Backend',
        skills: ['Node.js', 'Express'],
      });
    verifiedStudentId = verifiedSignup.body.student.id;
    const vToken = mailer.sentEmails[0].token;
    await request(app).post('/auth/verify-email').send({ token: vToken });
    const verifiedLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'alice@university.edu', password: 'password123' });
    verifiedToken = verifiedLogin.body.accessToken;

    // 2. Create an unverified student
    await request(app)
      .post('/auth/signup')
      .send({
        name: 'Unverified Bob',
        email: 'bob.unverified@university.edu',
        password: 'password123',
        specialty: 'Frontend',
      });
    const unverifiedLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'bob.unverified@university.edu', password: 'password123' });
    unverifiedToken = unverifiedLogin.body.accessToken;

    // 3. Create another verified student (to test R2 intruder checks)
    await request(app)
      .post('/auth/signup')
      .send({
        name: 'Charlie Intruder',
        email: 'charlie@university.edu',
        password: 'password123',
        specialty: 'DevOps',
      });
    const oToken = mailer.sentEmails[mailer.sentEmails.length - 1].token;
    await request(app).post('/auth/verify-email').send({ token: oToken });
    const otherLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'charlie@university.edu', password: 'password123' });
    otherStudentToken = otherLogin.body.accessToken;
  });

  it('R5: unverified Student cannot create a Project (403)', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${unverifiedToken}`)
      .send({
        title: 'Unauthorized Project',
        description: 'Should not be created because student is not email verified.',
        requiredSkills: ['react'],
        positions: [{ specialty: 'Frontend', headcount: 1 }],
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Email verification is required');
  });

  it('verified Student can create a Project (201)', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({
        title: 'AI Team Formation Engine',
        description: 'State of the art project to pair students up automatically.',
        requiredSkills: ['Node.js', 'React', 'MongoDB'],
        positions: [
          { specialty: 'Backend', headcount: 2 },
          { specialty: 'Frontend', headcount: 1 },
        ],
        commitmentLevel: 'high',
        category: 'Capstone',
        courseTag: { courseCode: 'CS680', term: 'Fall 2026' },
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('AI Team Formation Engine');
    expect(res.body.creatorId).toBe(verifiedStudentId);
    expect(res.body.positions.length).toBe(2);
    expect(res.body.status).toBe('open');
    expect(res.body.requiredSkills).toEqual(['node.js', 'react', 'mongodb']);
  });

  it('R2: a Student cannot PATCH or DELETE another Student\'s Project', async () => {
    // 1. Alice creates a project
    const createRes = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({
        title: 'Alice Project',
        description: 'Building secure microservices for the university.',
        requiredSkills: ['docker'],
        positions: [{ specialty: 'DevOps', headcount: 1 }],
      });
    const projectId = createRes.body.id;

    // 2. Charlie tries to PATCH Alice's project (Rule R2 violation)
    const patchRes = await request(app)
      .patch(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${otherStudentToken}`)
      .send({ title: 'Charlie Hijacked This Title' });

    expect(patchRes.status).toBe(403);
    expect(patchRes.body.rule).toBe('R2');

    // 3. Charlie tries to close/DELETE Alice's project (Rule R2 violation)
    const deleteRes = await request(app)
      .delete(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${otherStudentToken}`);

    expect(deleteRes.status).toBe(403);
    expect(deleteRes.body.rule).toBe('R2');

    const closeRes = await request(app)
      .post(`/projects/${projectId}/close`)
      .set('Authorization', `Bearer ${otherStudentToken}`);

    expect(closeRes.status).toBe(403);
    expect(closeRes.body.rule).toBe('R2');
  });

  it('Creator can PATCH and close their own Project', async () => {
    const createRes = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({
        title: 'Original Title',
        description: 'Original description of the project posting.',
        requiredSkills: ['python'],
        positions: [{ specialty: 'ML', headcount: 2 }],
      });
    const projectId = createRes.body.id;

    // Creator patches project
    const patchRes = await request(app)
      .patch(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ title: 'Updated Project Title' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.title).toBe('Updated Project Title');

    // Creator closes project
    const closeRes = await request(app)
      .post(`/projects/${projectId}/close`)
      .set('Authorization', `Bearer ${verifiedToken}`);

    expect(closeRes.status).toBe(200);
    expect(closeRes.body.status).toBe('closed');
  });

  it('pagination max 50: clamps requested limit to 50', async () => {
    // Seed 60 projects in repository
    for (let i = 1; i <= 60; i++) {
      await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${verifiedToken}`)
        .send({
          title: `Batch Project Number ${i}`,
          description: `Description for bulk batch project number ${i}.`,
          requiredSkills: ['javascript'],
          positions: [{ specialty: 'Frontend', headcount: 1 }],
        });
    }

    // Request limit 100
    const res = await request(app)
      .get('/projects?limit=100');

    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(50);
    expect(res.body.projects.length).toBe(50);
    expect(res.body.total).toBe(60);
    expect(res.body.nextCursor).toBeDefined();
  });

  it('filters projects by skill and specialty', async () => {
    await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({
        title: 'React Web App',
        description: 'A frontend web application made with modern React.',
        requiredSkills: ['React', 'CSS'],
        positions: [{ specialty: 'Frontend', headcount: 2 }],
      });

    await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({
        title: 'Kubernetes Cluster Infra',
        description: 'Managing cloud infrastructure and deployments.',
        requiredSkills: ['Kubernetes', 'Go'],
        positions: [{ specialty: 'DevOps', headcount: 1 }],
      });

    // Filter by skill
    const skillRes = await request(app).get('/projects?skills=react');
    expect(skillRes.status).toBe(200);
    expect(skillRes.body.projects.length).toBe(1);
    expect(skillRes.body.projects[0].title).toBe('React Web App');

    // Filter by specialty
    const specRes = await request(app).get('/projects?specialty=DevOps');
    expect(specRes.status).toBe(200);
    expect(specRes.body.projects.length).toBe(1);
    expect(specRes.body.projects[0].title).toBe('Kubernetes Cluster Infra');
  });
});
