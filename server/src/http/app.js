import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { createAuthRouter } from './routes/authRoutes.js';
import { createStudentRouter } from './routes/studentRoutes.js';
import { createProjectRouter } from './routes/projectRoutes.js';
import { createRequireAuth } from './middleware/requireAuth.js';
import { requireVerified } from './middleware/requireVerified.js';

import { BcryptPasswordHasher } from '../infrastructure/crypto/BcryptPasswordHasher.js';
import { JwtTokenSigner } from '../infrastructure/crypto/JwtTokenSigner.js';
import { ConsoleMailer } from '../infrastructure/mail/ConsoleMailer.js';
import { InMemoryStudentRepository } from '../infrastructure/mongo/InMemoryStudentRepository.js';
import { InMemoryProjectRepository } from '../infrastructure/mongo/InMemoryProjectRepository.js';
import { Clock } from '../ports/Clock.js';

import { SignUp } from '../application/identity/SignUp.js';
import { VerifyEmail } from '../application/identity/VerifyEmail.js';
import { LogIn } from '../application/identity/LogIn.js';
import { RefreshAccessToken } from '../application/identity/RefreshAccessToken.js';
import { RequestPasswordReset } from '../application/identity/RequestPasswordReset.js';
import { ResetPassword } from '../application/identity/ResetPassword.js';
import { UpdateProfile } from '../application/identity/UpdateProfile.js';
import { GetOwnProfile } from '../application/identity/GetOwnProfile.js';
import { GetStudentPublicView } from '../application/identity/GetStudentPublicView.js';

import { CreateProject } from '../application/projects/CreateProject.js';
import { UpdateProject } from '../application/projects/UpdateProject.js';
import { CloseProject } from '../application/projects/CloseProject.js';
import { GetProject } from '../application/projects/GetProject.js';
import { BrowseProjects } from '../application/projects/BrowseProjects.js';

export function createApp(customDeps = {}) {
  const app = express();

  app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());

  // Composition root defaults (can be injected for tests)
  const studentRepo = customDeps.studentRepository || new InMemoryStudentRepository();
  const projectRepo = customDeps.projectRepository || new InMemoryProjectRepository();
  const passwordHasher = customDeps.passwordHasher || new BcryptPasswordHasher();
  const tokenSigner = customDeps.tokenSigner || new JwtTokenSigner({
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret_test',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_test',
  });
  const mailer = customDeps.mailer || new ConsoleMailer();
  const clock = customDeps.clock || new Clock();

  // Application use cases: Identity
  const signUpUseCase = new SignUp({
    studentRepository: studentRepo,
    passwordHasher,
    mailer,
    clock,
  });

  const verifyEmailUseCase = new VerifyEmail({
    studentRepository: studentRepo,
    clock,
  });

  const logInUseCase = new LogIn({
    studentRepository: studentRepo,
    passwordHasher,
    tokenSigner,
  });

  const refreshAccessTokenUseCase = new RefreshAccessToken({
    studentRepository: studentRepo,
    tokenSigner,
  });

  const requestPasswordResetUseCase = new RequestPasswordReset({
    studentRepository: studentRepo,
    mailer,
    clock,
  });

  const resetPasswordUseCase = new ResetPassword({
    studentRepository: studentRepo,
    passwordHasher,
    clock,
  });

  const updateProfileUseCase = new UpdateProfile({
    studentRepository: studentRepo,
  });

  const getOwnProfileUseCase = new GetOwnProfile({
    studentRepository: studentRepo,
  });

  const getStudentPublicViewUseCase = new GetStudentPublicView({
    studentRepository: studentRepo,
  });

  // Application use cases: Projects (M2)
  const createProjectUseCase = new CreateProject({
    studentRepository: studentRepo,
    projectRepository: projectRepo,
  });

  const updateProjectUseCase = new UpdateProject({
    projectRepository: projectRepo,
  });

  const closeProjectUseCase = new CloseProject({
    projectRepository: projectRepo,
  });

  const getProjectUseCase = new GetProject({
    projectRepository: projectRepo,
  });

  const browseProjectsUseCase = new BrowseProjects({
    projectRepository: projectRepo,
  });

  // Middlewares
  const requireAuth = createRequireAuth(tokenSigner);

  // Base routes
  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'TeamMatch API Server',
      status: 'active',
      healthEndpoint: '/health',
      frontendUrl: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    });
  });

  app.use('/health', healthRouter);
  app.use('/auth', createAuthRouter({
    signUpUseCase,
    verifyEmailUseCase,
    logInUseCase,
    refreshAccessTokenUseCase,
    requestPasswordResetUseCase,
    resetPasswordUseCase,
  }));
  app.use('/students', createStudentRouter({
    getOwnProfileUseCase,
    updateProfileUseCase,
    getStudentPublicViewUseCase,
    requireAuth,
  }));
  app.use('/projects', createProjectRouter({
    createProjectUseCase,
    updateProjectUseCase,
    closeProjectUseCase,
    getProjectUseCase,
    browseProjectsUseCase,
    requireAuth,
    requireVerified,
  }));

  // 404 fallback
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
}
