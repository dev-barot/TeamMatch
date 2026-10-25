import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { createAuthRouter } from './routes/authRoutes.js';
import { createStudentRouter } from './routes/studentRoutes.js';
import { createProjectRouter } from './routes/projectRoutes.js';
import { createApplicationRouter } from './routes/applicationRoutes.js';
import { createMatchingRouter } from './routes/matchingRoutes.js';
import { createMessagingRouter } from './routes/messagingRoutes.js';
import { createNotificationRouter } from './routes/notificationRoutes.js';
import { createAdminRouter } from './routes/adminRoutes.js';
import { createModerationRouter } from './routes/moderationRoutes.js';
import { createRequireAuth } from './middleware/requireAuth.js';
import { requireVerified } from './middleware/requireVerified.js';
import { requireAdmin } from './middleware/requireAdmin.js';

import { BcryptPasswordHasher } from '../infrastructure/crypto/BcryptPasswordHasher.js';
import { JwtTokenSigner } from '../infrastructure/crypto/JwtTokenSigner.js';
import { ConsoleMailer } from '../infrastructure/mail/ConsoleMailer.js';
import { InMemoryStudentRepository } from '../infrastructure/mongo/InMemoryStudentRepository.js';
import { InMemoryProjectRepository } from '../infrastructure/mongo/InMemoryProjectRepository.js';
import { InMemoryApplicationRepository } from '../infrastructure/mongo/InMemoryApplicationRepository.js';
import { InMemoryConversationRepository } from '../infrastructure/mongo/InMemoryConversationRepository.js';
import { InMemoryMessageRepository } from '../infrastructure/mongo/InMemoryMessageRepository.js';
import { InMemoryNotificationRepository } from '../infrastructure/mongo/InMemoryNotificationRepository.js';
import { InMemoryReportRepository } from '../infrastructure/mongo/InMemoryReportRepository.js';
import { RealtimeNotificationPublisher } from '../infrastructure/notifications/RealtimeNotificationPublisher.js';
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

import { ApplyToProject } from '../application/applications/ApplyToProject.js';
import { InviteStudent } from '../application/applications/InviteStudent.js';
import { DecideApplication } from '../application/applications/DecideApplication.js';
import { RespondToInvitation } from '../application/applications/RespondToInvitation.js';
import { WithdrawApplication } from '../application/applications/WithdrawApplication.js';
import { GetProjectApplications } from '../application/applications/GetProjectApplications.js';
import { GetStudentApplications } from '../application/applications/GetStudentApplications.js';

import { FindMatchedProjectsForStudent } from '../application/matching/FindMatchedProjectsForStudent.js';
import { FindMatchedStudentsForProject } from '../application/matching/FindMatchedStudentsForProject.js';

import { ListAccounts } from '../application/moderation/ListAccounts.js';
import { DeactivateAccount } from '../application/moderation/DeactivateAccount.js';
import { AdminCloseProject } from '../application/moderation/AdminCloseProject.js';
import { ListReports } from '../application/moderation/ListReports.js';
import { MarkReportReviewed } from '../application/moderation/MarkReportReviewed.js';
import { ReportStudent } from '../application/moderation/ReportStudent.js';
import { ReportConversation } from '../application/moderation/ReportConversation.js';

import { GetOrCreateConversation } from '../application/messaging/GetOrCreateConversation.js';
import { SendMessage } from '../application/messaging/SendMessage.js';
import { ListConversations } from '../application/messaging/ListConversations.js';
import { ListMessages } from '../application/messaging/ListMessages.js';
import { ListNotifications } from '../application/messaging/ListNotifications.js';
import { MarkNotificationRead } from '../application/messaging/MarkNotificationRead.js';
import { MarkAllNotificationsRead } from '../application/messaging/MarkAllNotificationsRead.js';

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
  const applicationRepo = customDeps.applicationRepository || new InMemoryApplicationRepository();
  const conversationRepo = customDeps.conversationRepository || new InMemoryConversationRepository();
  const messageRepo = customDeps.messageRepository || new InMemoryMessageRepository();
  const notificationRepo = customDeps.notificationRepository || new InMemoryNotificationRepository();
  const reportRepo = customDeps.reportRepository || new InMemoryReportRepository();
  const realtimePublisher = customDeps.realtimePublisher || null;
  const notificationPublisher = customDeps.notificationPublisher || new RealtimeNotificationPublisher({
    notificationRepository: notificationRepo,
    realtimePublisher,
  });
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

  // Application use cases: Applications & Team Formation (M3)
  const applyToProjectUseCase = new ApplyToProject({
    applicationRepository: applicationRepo,
    projectRepository: projectRepo,
    studentRepository: studentRepo,
    notificationPublisher,
  });

  const inviteStudentUseCase = new InviteStudent({
    applicationRepository: applicationRepo,
    projectRepository: projectRepo,
    studentRepository: studentRepo,
    notificationPublisher,
  });

  const decideApplicationUseCase = new DecideApplication({
    applicationRepository: applicationRepo,
    projectRepository: projectRepo,
    notificationPublisher,
  });

  const respondToInvitationUseCase = new RespondToInvitation({
    applicationRepository: applicationRepo,
    projectRepository: projectRepo,
    notificationPublisher,
  });

  const withdrawApplicationUseCase = new WithdrawApplication({
    applicationRepository: applicationRepo,
    projectRepository: projectRepo,
    notificationPublisher,
  });

  const getProjectApplicationsUseCase = new GetProjectApplications({
    applicationRepository: applicationRepo,
    projectRepository: projectRepo,
  });

  const getStudentApplicationsUseCase = new GetStudentApplications({
    applicationRepository: applicationRepo,
  });

  // Application use cases: Matching Engine (M4)
  const findMatchedProjectsUseCase = new FindMatchedProjectsForStudent({
    studentRepository: studentRepo,
    projectRepository: projectRepo,
    applicationRepository: applicationRepo,
  });

  const findMatchedStudentsUseCase = new FindMatchedStudentsForProject({
    projectRepository: projectRepo,
    studentRepository: studentRepo,
    applicationRepository: applicationRepo,
  });

  // Application use cases: Messaging & Notifications (M5)
  const getOrCreateConversationUseCase = new GetOrCreateConversation({
    conversationRepository: conversationRepo,
    studentRepository: studentRepo,
  });

  const sendMessageUseCase = new SendMessage({
    conversationRepository: conversationRepo,
    messageRepository: messageRepo,
    realtimePublisher,
    notificationPublisher,
    clock,
  });

  const listConversationsUseCase = new ListConversations({
    conversationRepository: conversationRepo,
    studentRepository: studentRepo,
  });

  const listMessagesUseCase = new ListMessages({
    conversationRepository: conversationRepo,
    messageRepository: messageRepo,
    clock,
  });

  const listNotificationsUseCase = new ListNotifications({
    notificationRepository: notificationRepo,
  });

  const markNotificationReadUseCase = new MarkNotificationRead({
    notificationRepository: notificationRepo,
    clock,
  });

  const markAllNotificationsReadUseCase = new MarkAllNotificationsRead({
    notificationRepository: notificationRepo,
    clock,
  });

  // Application use cases: Admin & Moderation (M6)
  const listAccountsUseCase = new ListAccounts({
    studentRepository: studentRepo,
  });

  const deactivateAccountUseCase = new DeactivateAccount({
    studentRepository: studentRepo,
  });

  const adminCloseProjectUseCase = new AdminCloseProject({
    projectRepository: projectRepo,
    applicationRepository: applicationRepo,
    notificationPublisher,
  });

  const listReportsUseCase = new ListReports({
    reportRepository: reportRepo,
  });

  const markReportReviewedUseCase = new MarkReportReviewed({
    reportRepository: reportRepo,
  });

  const reportStudentUseCase = new ReportStudent({
    studentRepository: studentRepo,
    reportRepository: reportRepo,
  });

  const reportConversationUseCase = new ReportConversation({
    conversationRepository: conversationRepo,
    reportRepository: reportRepo,
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
  app.use('/applications', createApplicationRouter({
    applyToProjectUseCase,
    inviteStudentUseCase,
    decideApplicationUseCase,
    respondToInvitationUseCase,
    withdrawApplicationUseCase,
    getProjectApplicationsUseCase,
    getStudentApplicationsUseCase,
    requireAuth,
    requireVerified,
  }));
  app.use('/matching', createMatchingRouter({
    findMatchedProjectsUseCase,
    findMatchedStudentsUseCase,
    requireAuth,
  }));
  app.use('/conversations', createMessagingRouter({
    getOrCreateConversationUseCase,
    sendMessageUseCase,
    listConversationsUseCase,
    listMessagesUseCase,
    requireAuth,
  }));
  app.use('/notifications', createNotificationRouter({
    listNotificationsUseCase,
    markNotificationReadUseCase,
    markAllNotificationsReadUseCase,
    requireAuth,
  }));
  // M6: Admin moderation portal (protected by requireAdmin)
  app.use('/admin', createAdminRouter({
    listAccountsUseCase,
    deactivateAccountUseCase,
    adminCloseProjectUseCase,
    listReportsUseCase,
    markReportReviewedUseCase,
    requireAuth,
    requireAdmin,
  }));
  // M6: Student-facing report filing
  app.use('/moderation', createModerationRouter({
    reportStudentUseCase,
    reportConversationUseCase,
    requireAuth,
    requireVerified,
  }));

  // 404 fallback
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
}
