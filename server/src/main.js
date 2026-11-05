import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load .env whether running from workspace root or server folder
const candidateEnvPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env'),
];
for (const p of candidateEnvPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
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

// Standard bcrypt hash for admin credentials
const adminPasswordHash = bcrypt.hashSync('AdminPass123!', 10);

// Platform Admin Accounts (Rule R2: No public signup path to admin)
const adminEmails = Array.from(new Set([process.env.ADMIN_EMAIL, 'admin@teammatch.edu', 'admin@teammatch.app'].filter(Boolean)));
for (let i = 0; i < adminEmails.length; i++) {
  const email = adminEmails[i];
  const adminAccount = new Account({
    email,
    passwordHash: adminPasswordHash,
    accountType: ACCOUNT_TYPES.ADMIN,
    isEmailVerified: true,
    isActive: true,
  });
  const adminStudent = new Student({
    id: `admin_seed_00${i + 1}`,
    name: 'Platform Admin',
    account: adminAccount,
    profile: new Profile({ specialty: 'Other' }),
  });
  await studentRepository.save(adminStudent);
  console.log(`[Seed] Admin account ready: ${email} (password: AdminPass123!)`);
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
  // Live repository clean - ready for manual testing
  console.log('Realtime messaging & notifications Socket.IO gateway initialized.');
});
