import bcrypt from 'bcryptjs';
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

// Standard bcrypt hashes for testing credentials
const studentPasswordHash = bcrypt.hashSync('StudentPass123!', 10);
const adminPasswordHash = bcrypt.hashSync('AdminPass123!', 10);

// 1. Seed Verified Student Creator
const demoCreator = new Student({
  id: 'student_seed_creator',
  name: 'Sarah Connor',
  account: new Account({
    email: 'sarah.creator@university.edu',
    passwordHash: studentPasswordHash,
    isEmailVerified: true,
    accountType: ACCOUNT_TYPES.STUDENT,
  }),
  profile: new Profile({
    specialty: 'Backend',
    skills: ['Python', 'Node.js', 'Docker'],
    weeklyAvailability: 20,
    bio: 'CS Senior passionate about robotics, distributed systems, and team leadership.',
  }),
});
await studentRepository.save(demoCreator);

// 2. Seed Unverified Student (for testing Rule R5 email verification workflow)
const unverifiedStudent = new Student({
  id: 'student_seed_unverified',
  name: 'Alex Rivera',
  account: new Account({
    email: 'alex.unverified@university.edu',
    passwordHash: studentPasswordHash,
    isEmailVerified: false,
    accountType: ACCOUNT_TYPES.STUDENT,
  }),
  profile: new Profile({
    specialty: 'Frontend',
    skills: ['React', 'CSS', 'Figma'],
    weeklyAvailability: 15,
    bio: 'Junior studying interaction design and responsive frontend apps.',
  }),
});
await studentRepository.save(unverifiedStudent);

// 3. Seed Platform Admin (Rule R2: No public signup path to admin)
const adminEmail = process.env.ADMIN_EMAIL || 'admin@teammatch.edu';
const adminAccount = new Account({
  email: adminEmail,
  passwordHash: process.env.ADMIN_PASSWORD_HASH ? process.env.ADMIN_PASSWORD_HASH : adminPasswordHash,
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
console.log(`[Seed] Admin account ready: ${adminEmail} (password: AdminPass123!)`);
console.log(`[Seed] Verified student ready: sarah.creator@university.edu (password: StudentPass123!)`);
console.log(`[Seed] Unverified student ready: alex.unverified@university.edu (password: StudentPass123!)`);

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
