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
import { connectDb } from './infrastructure/mongo/connectDb.js';
import { InMemoryStudentRepository } from './infrastructure/mongo/InMemoryStudentRepository.js';
import { InMemoryProjectRepository } from './infrastructure/mongo/InMemoryProjectRepository.js';
import { InMemoryApplicationRepository } from './infrastructure/mongo/InMemoryApplicationRepository.js';
import { InMemoryConversationRepository } from './infrastructure/mongo/InMemoryConversationRepository.js';
import { InMemoryMessageRepository } from './infrastructure/mongo/InMemoryMessageRepository.js';
import { InMemoryNotificationRepository } from './infrastructure/mongo/InMemoryNotificationRepository.js';
import { InMemoryReportRepository } from './infrastructure/mongo/InMemoryReportRepository.js';
import { MongooseStudentRepository } from './infrastructure/mongo/MongooseStudentRepository.js';
import { MongooseProjectRepository } from './infrastructure/mongo/MongooseProjectRepository.js';
import { MongooseApplicationRepository } from './infrastructure/mongo/MongooseApplicationRepository.js';
import { MongooseConversationRepository } from './infrastructure/mongo/MongooseConversationRepository.js';
import { MongooseMessageRepository } from './infrastructure/mongo/MongooseMessageRepository.js';
import { MongooseNotificationRepository } from './infrastructure/mongo/MongooseNotificationRepository.js';
import { MongooseReportRepository } from './infrastructure/mongo/MongooseReportRepository.js';
import { JwtTokenSigner } from './infrastructure/crypto/JwtTokenSigner.js';
import { SocketGateway } from './infrastructure/socket/SocketGateway.js';
import { Student } from './domain/identity/Student.js';
import { Account, ACCOUNT_TYPES } from './domain/identity/Account.js';
import { Profile } from './domain/identity/Profile.js';

dotenv.config();

const port = process.env.PORT || 4000;

// Database & Repository Initialization (Cloud MongoDB Atlas / Local MongoDB with In-Memory Fallback)
let studentRepository;
let projectRepository;
let applicationRepository;
let conversationRepository;
let messageRepository;
let notificationRepository;
let reportRepository;

const mongoUri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '';
const isCloudOrLocalMongo = Boolean(mongoUri && (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://')));

if (isCloudOrLocalMongo) {
  try {
    const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
    console.log(`[Database] Connecting to MongoDB (${maskedUri})...`);
    await connectDb(mongoUri, { maxRetries: 2, timeoutMs: 6000 });
    console.log('[Database] Connected to MongoDB Atlas / Cloud database successfully.');

    studentRepository = new MongooseStudentRepository();
    projectRepository = new MongooseProjectRepository();
    applicationRepository = new MongooseApplicationRepository();
    conversationRepository = new MongooseConversationRepository();
    messageRepository = new MongooseMessageRepository();
    notificationRepository = new MongooseNotificationRepository();
    reportRepository = new MongooseReportRepository();
  } catch (err) {
    console.warn(`[Database] MongoDB connection could not be established (${err.message}).`);
    console.warn('[Database] Falling back to In-Memory repositories for local development.');
    studentRepository = new InMemoryStudentRepository();
    projectRepository = new InMemoryProjectRepository();
    applicationRepository = new InMemoryApplicationRepository();
    conversationRepository = new InMemoryConversationRepository();
    messageRepository = new InMemoryMessageRepository();
    notificationRepository = new InMemoryNotificationRepository();
    reportRepository = new InMemoryReportRepository();
  }
} else {
  console.log('[Database] No MONGODB_URI configured. Running with In-Memory repositories.');
  studentRepository = new InMemoryStudentRepository();
  projectRepository = new InMemoryProjectRepository();
  applicationRepository = new InMemoryApplicationRepository();
  conversationRepository = new InMemoryConversationRepository();
  messageRepository = new InMemoryMessageRepository();
  notificationRepository = new InMemoryNotificationRepository();
  reportRepository = new InMemoryReportRepository();
}

const tokenSigner = new JwtTokenSigner({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret_test',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_test',
});

// Standard bcrypt hash for admin credentials
const adminPasswordHash = bcrypt.hashSync('AdminPass123!', 10);

// Platform Admin Accounts (Idempotent seed: ensures admin exists without duplicate key errors)
const adminEmails = Array.from(new Set([process.env.ADMIN_EMAIL, 'admin@teammatch.edu', 'admin@teammatch.app'].filter(Boolean)));
for (let i = 0; i < adminEmails.length; i++) {
  const email = adminEmails[i];
  const existing = await studentRepository.findByEmail(email);
  if (!existing) {
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
  } else {
    console.log(`[Seed] Admin account already present: ${email}`);
  }
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
