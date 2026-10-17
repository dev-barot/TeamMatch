import request from 'supertest';
import { createApp } from '../../src/http/app.js';
import { ConsoleMailer } from '../../src/infrastructure/mail/ConsoleMailer.js';
import { InMemoryStudentRepository } from '../../src/infrastructure/mongo/InMemoryStudentRepository.js';

describe('Integration: Identity API (M1)', () => {
  let app;
  let mailer;
  let studentRepo;

  beforeEach(() => {
    mailer = new ConsoleMailer();
    studentRepo = new InMemoryStudentRepository();
    app = createApp({
      studentRepository: studentRepo,
      mailer,
    });
  });

  it('completes the full student lifecycle: signup -> verify -> login -> refresh', async () => {
    // 1. Sign up
    const signupRes = await request(app)
      .post('/auth/signup')
      .send({
        name: 'Bob Builder',
        email: 'bob@university.edu',
        password: 'password123',
        specialty: 'Backend',
        skills: ['Node.js', 'Docker'],
      });

    expect(signupRes.status).toBe(201);
    expect(signupRes.body).toHaveProperty('student');
    expect(signupRes.body.student.email).toBe('bob@university.edu');
    expect(signupRes.body.student.isEmailVerified).toBe(false);

    // Verify verification email was dispatched
    expect(mailer.sentEmails.length).toBe(1);
    const verificationToken = mailer.sentEmails[0].token;
    expect(verificationToken).toBeDefined();

    // 2. Verify Email
    const verifyRes = await request(app)
      .post('/auth/verify-email')
      .send({ token: verificationToken });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.student.isEmailVerified).toBe(true);

    // 3. Log In
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'bob@university.edu',
        password: 'password123',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('accessToken');
    expect(loginRes.body).toHaveProperty('refreshToken');
    const { accessToken, refreshToken } = loginRes.body;

    // 4. Refresh token
    const refreshRes = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body).toHaveProperty('accessToken');

    // 5. Access authenticated own profile
    const meRes = await request(app)
      .get('/students/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.name).toBe('Bob Builder');
    expect(meRes.body.email).toBe('bob@university.edu');
    expect(meRes.body).not.toHaveProperty('passwordHash');
  });

  it('rejects login with wrong password (401)', async () => {
    await request(app)
      .post('/auth/signup')
      .send({
        name: 'Alice',
        email: 'alice@uni.edu',
        password: 'correct_password',
      });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'alice@uni.edu',
        password: 'wrong_password',
      });

    expect(loginRes.status).toBe(401);
    expect(loginRes.body).toHaveProperty('error', 'Invalid email or password.');
  });

  it('R2: a Student cannot PATCH another Student profile (403)', async () => {
    // Create Student 1
    const res1 = await request(app)
      .post('/auth/signup')
      .send({ name: 'Student 1', email: 's1@uni.edu', password: 'password123' });
    const student1Id = res1.body.student.id;

    // Create Student 2
    const res2 = await request(app)
      .post('/auth/signup')
      .send({ name: 'Student 2', email: 's2@uni.edu', password: 'password123' });
    const student2Id = res2.body.student.id;

    // Log in as Student 1
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 's1@uni.edu', password: 'password123' });
    const token1 = loginRes.body.accessToken;

    // Student 1 attempts to PATCH Student 2's profile
    const patchRes = await request(app)
      .patch(`/students/${student2Id}/profile`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ specialty: 'ML' });

    // Must be rejected with 403 Forbidden under Rule R2
    expect(patchRes.status).toBe(403);
    expect(patchRes.body).toHaveProperty('rule', 'R2');

    // Student 1 updating their own profile succeeds
    const ownPatchRes = await request(app)
      .patch(`/students/${student1Id}/profile`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ specialty: 'Frontend' });

    expect(ownPatchRes.status).toBe(200);
    expect(ownPatchRes.body.profile.specialty).toBe('Frontend');
  });

  it('Privacy: public view GET /students/:id returns profile without sensitive credentials', async () => {
    const signupRes = await request(app)
      .post('/auth/signup')
      .send({
        name: 'Carol Candidate',
        email: 'carol@uni.edu',
        password: 'password123',
        specialty: 'UI/UX',
        skills: ['Figma'],
      });
    const studentId = signupRes.body.student.id;

    const publicRes = await request(app).get(`/students/${studentId}`);

    expect(publicRes.status).toBe(200);
    expect(publicRes.body.name).toBe('Carol Candidate');
    expect(publicRes.body.profile.specialty).toBe('UI/UX');
    expect(publicRes.body).not.toHaveProperty('email');
    expect(publicRes.body).not.toHaveProperty('passwordHash');
  });

  it('rejects unauthenticated requests to protected profile routes with 401', async () => {
    const res = await request(app).get('/students/me');
    expect(res.status).toBe(401);
  });
});
