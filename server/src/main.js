import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './http/app.js';
import { InMemoryStudentRepository } from './infrastructure/mongo/InMemoryStudentRepository.js';
import { InMemoryProjectRepository } from './infrastructure/mongo/InMemoryProjectRepository.js';
import { InMemoryApplicationRepository } from './infrastructure/mongo/InMemoryApplicationRepository.js';
import { InMemoryConversationRepository } from './infrastructure/mongo/InMemoryConversationRepository.js';
import { InMemoryMessageRepository } from './infrastructure/mongo/InMemoryMessageRepository.js';
import { InMemoryNotificationRepository } from './infrastructure/mongo/InMemoryNotificationRepository.js';
import { InMemoryReportRepository } from './infrastructure/mongo/InMemoryReportRepository.js';
import { JwtTokenSigner } from './infrastructure/crypto/JwtTokenSigner.js';
import { SocketGateway } from './infrastructure/socket/SocketGateway.js';
import { createHandcraftedProjects } from './infrastructure/mongo/seedM02.js';
import { Student } from './domain/identity/Student.js';
import { Account, ACCOUNT_TYPES } from './domain/identity/Account.js';
import { Profile } from './domain/identity/Profile.js';

dotenv.config();

const port = process.env.PORT || 4000;

// Initialize default development repositories with seeds
const studentRepository = new InMemoryStudentRepository();
const projectRepository = new InMemoryProjectRepository();
const applicationRepository = new InMemoryApplicationRepository();
const conversationRepository = new InMemoryConversationRepository();
const messageRepository = new InMemoryMessageRepository();
const notificationRepository = new InMemoryNotificationRepository();
const reportRepository = new InMemoryReportRepository();

const tokenSigner = new JwtTokenSigner({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret_test',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_test',
});

// Seed verified student creator for local demo
const demoCreator = new Student({
  id: 'student_seed_creator',
  name: 'Sarah Connor',
  account: new Account({
    email: 'sarah.creator@university.edu',
    passwordHash: 'seeded_hash',
    isEmailVerified: true,
  }),
  profile: new Profile({
    specialty: 'Backend',
    skills: ['python', 'node.js', 'docker'],
    weeklyAvailability: 20,
    bio: 'CS Senior passionate about robotics, distributed systems, and team leadership.',
  }),
});
await studentRepository.save(demoCreator);

// Seed Admin account from env vars (M6 step 1 — no public signup path to admin)
// Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH in .env to enable the admin account.
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) {
  const adminAccount = new Account({
    email: process.env.ADMIN_EMAIL,
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
    accountType: ACCOUNT_TYPES.ADMIN,
    isEmailVerified: true,
    isActive: true,
  });
  const adminStudent = new Student({
    id: 'admin_seed_001',
    name: process.env.ADMIN_NAME || 'Platform Admin',
    account: adminAccount,
    profile: new Profile({ specialty: 'Other' }),
  });
  await studentRepository.save(adminStudent);
  console.log(`Admin account seeded for: ${process.env.ADMIN_EMAIL}`);
} else {
  console.log('No ADMIN_EMAIL/ADMIN_PASSWORD_HASH set — admin seeding skipped (dev mode).');
}

// Seed 3 handcrafted projects for eyeball inspection (Step 8 of M02)
for (const project of createHandcraftedProjects(demoCreator.id)) {
  await projectRepository.save(project);
}

// We prepare HTTP server and Socket.io gateway
const socketGateway = new SocketGateway(null, tokenSigner);

const app = createApp({
  studentRepository,
  projectRepository,
  applicationRepository,
  conversationRepository,
  messageRepository,
  notificationRepository,
  reportRepository,
  realtimePublisher: socketGateway,
  tokenSigner,
});

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

socketGateway.io = io;
socketGateway._setupAuthAndHandlers();

server.listen(port, () => {
  console.log(`TeamMatch server running on port ${port} (env: ${process.env.NODE_ENV || 'development'})`);
  console.log('Seeded 3 handcrafted projects for eyeball inspection in live app.');
  console.log('Realtime messaging & notifications Socket.IO gateway initialized.');
});
