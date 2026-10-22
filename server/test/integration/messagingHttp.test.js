import request from 'supertest';
import { createApp } from '../../src/http/app.js';
import { InMemoryStudentRepository } from '../../src/infrastructure/mongo/InMemoryStudentRepository.js';
import { InMemoryConversationRepository } from '../../src/infrastructure/mongo/InMemoryConversationRepository.js';
import { InMemoryMessageRepository } from '../../src/infrastructure/mongo/InMemoryMessageRepository.js';
import { InMemoryNotificationRepository } from '../../src/infrastructure/mongo/InMemoryNotificationRepository.js';
import { JwtTokenSigner } from '../../src/infrastructure/crypto/JwtTokenSigner.js';
import { Student } from '../../src/domain/identity/Student.js';
import { Account } from '../../src/domain/identity/Account.js';
import { Profile } from '../../src/domain/identity/Profile.js';

describe('Integration: Messaging & Notifications HTTP Endpoints (M5)', () => {
  let app;
  let tokenSigner;
  let studentRepo;
  let conversationRepo;
  let messageRepo;
  let notificationRepo;

  let studentA;
  let studentB;
  let studentC;
  let tokenA;
  let tokenB;
  let tokenC;

  beforeEach(async () => {
    tokenSigner = new JwtTokenSigner({
      accessSecret: 'test_access_secret_m5',
      refreshSecret: 'test_refresh_secret_m5',
    });
    studentRepo = new InMemoryStudentRepository();
    conversationRepo = new InMemoryConversationRepository();
    messageRepo = new InMemoryMessageRepository();
    notificationRepo = new InMemoryNotificationRepository();

    app = createApp({
      studentRepository: studentRepo,
      conversationRepository: conversationRepo,
      messageRepository: messageRepo,
      notificationRepository: notificationRepo,
      tokenSigner,
    });

    studentA = new Student({
      id: 'student_a',
      name: 'Alice A',
      account: new Account({ email: 'alice@uni.edu', passwordHash: 'seeded_hash_a', isEmailVerified: true }),
      profile: new Profile({ specialty: 'Frontend', skills: ['react'] }),
    });
    studentB = new Student({
      id: 'student_b',
      name: 'Bob B',
      account: new Account({ email: 'bob@uni.edu', passwordHash: 'seeded_hash_b', isEmailVerified: true }),
      profile: new Profile({ specialty: 'Backend', skills: ['node'] }),
    });
    studentC = new Student({
      id: 'student_c',
      name: 'Charlie C',
      account: new Account({ email: 'charlie@uni.edu', passwordHash: 'seeded_hash_c', isEmailVerified: true }),
      profile: new Profile({ specialty: 'UI/UX', skills: ['figma'] }),
    });

    await studentRepo.save(studentA);
    await studentRepo.save(studentB);
    await studentRepo.save(studentC);

    tokenA = await tokenSigner.signAccessToken({ sub: studentA.id, email: studentA.account.email, isEmailVerified: true });
    tokenB = await tokenSigner.signAccessToken({ sub: studentB.id, email: studentB.account.email, isEmailVerified: true });
    tokenC = await tokenSigner.signAccessToken({ sub: studentC.id, email: studentC.account.email, isEmailVerified: true });
  });

  describe('Conversations API', () => {
    it('returns 401 when accessing /conversations without token', async () => {
      const res = await request(app).get('/conversations');
      expect(res.status).toBe(401);
    });

    it('creates or retrieves a conversation between two students', async () => {
      // POST /conversations
      const createRes = await request(app)
        .post('/conversations')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ counterpartyId: studentB.id });

      expect(createRes.status).toBe(201);
      expect(createRes.body.id).toBeDefined();
      expect(createRes.body.participantIds).toContain(studentA.id);
      expect(createRes.body.participantIds).toContain(studentB.id);

      const convId = createRes.body.id;

      // Idempotency: Bob starts conversation with Alice -> same ID
      const secondRes = await request(app)
        .post('/conversations')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ counterpartyId: studentA.id });

      expect(secondRes.status).toBe(201);
      expect(secondRes.body.id).toBe(convId);
    });

    it('rejects creating a conversation with oneself (400)', async () => {
      const res = await request(app)
        .post('/conversations')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ counterpartyId: studentA.id });

      expect(res.status).toBe(400);
    });

    it('lists conversations for authenticated student with counterparty info', async () => {
      await request(app)
        .post('/conversations')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ counterpartyId: studentB.id });

      const listRes = await request(app)
        .get('/conversations')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body).toHaveLength(1);
      expect(listRes.body[0].otherParticipant.id).toBe(studentB.id);
      expect(listRes.body[0].otherParticipant.name).toBe(studentB.name);
    });
  });

  describe('Messages API', () => {
    let convId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/conversations')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ counterpartyId: studentB.id });
      convId = res.body.id;
    });

    it('allows participant to send message and lists it', async () => {
      const sendRes = await request(app)
        .post(`/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ body: 'Hello Bob! Would love to collaborate on the project.' });

      expect(sendRes.status).toBe(201);
      expect(sendRes.body.content).toBe('Hello Bob! Would love to collaborate on the project.');
      expect(sendRes.body.senderId).toBe(studentA.id);

      const listRes = await request(app)
        .get(`/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body).toHaveLength(1);
      expect(listRes.body[0].content).toBe('Hello Bob! Would love to collaborate on the project.');
    });

    it('rejects message exceeding 2000 characters with 400', async () => {
      const sendRes = await request(app)
        .post(`/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ body: 'A'.repeat(2001) });

      expect(sendRes.status).toBe(400);
    });

    it('prevents non-participant from reading or sending messages (403)', async () => {
      // Charlie tries to send
      const sendRes = await request(app)
        .post(`/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${tokenC}`)
        .send({ body: 'Intruder message' });

      expect(sendRes.status).toBe(403);

      // Charlie tries to list
      const listRes = await request(app)
        .get(`/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${tokenC}`);

      expect(listRes.status).toBe(403);
    });
  });

  describe('Notifications API', () => {
    it('lists notifications and marks them as read', async () => {
      // Trigger notification via message from Alice to Bob
      const convRes = await request(app)
        .post('/conversations')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ counterpartyId: studentB.id });

      await request(app)
        .post(`/conversations/${convRes.body.id}/messages`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ body: 'Hey Bob check this out!' });

      // Bob checks notifications
      const notifRes = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(notifRes.status).toBe(200);
      expect(notifRes.body.notifications).toHaveLength(1);
      expect(notifRes.body.unreadCount).toBe(1);

      const notifId = notifRes.body.notifications[0].id;

      // Bob marks as read
      const markRes = await request(app)
        .patch(`/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(markRes.status).toBe(200);
      expect(markRes.body.isRead).toBe(true);

      // Re-check unread count
      const updatedRes = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(updatedRes.body.unreadCount).toBe(0);
    });

    it('marks all notifications as read', async () => {
      const convRes = await request(app)
        .post('/conversations')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ counterpartyId: studentB.id });

      await request(app)
        .post(`/conversations/${convRes.body.id}/messages`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ body: 'Msg 1' });

      await request(app)
        .post(`/conversations/${convRes.body.id}/messages`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ body: 'Msg 2' });

      const readAllRes = await request(app)
        .patch('/notifications/read-all')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(readAllRes.status).toBe(200);
      expect(readAllRes.body.count).toBe(2);

      const checkRes = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(checkRes.body.unreadCount).toBe(0);
    });
  });
});
