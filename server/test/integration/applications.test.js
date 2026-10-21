import { InMemoryApplicationRepository } from '../../src/infrastructure/mongo/InMemoryApplicationRepository.js';
import { InMemoryProjectRepository } from '../../src/infrastructure/mongo/InMemoryProjectRepository.js';
import { InMemoryStudentRepository } from '../../src/infrastructure/mongo/InMemoryStudentRepository.js';

import { ApplyToProject } from '../../src/application/applications/ApplyToProject.js';
import { InviteStudent } from '../../src/application/applications/InviteStudent.js';
import { DecideApplication } from '../../src/application/applications/DecideApplication.js';
import { RespondToInvitation } from '../../src/application/applications/RespondToInvitation.js';
import { WithdrawApplication } from '../../src/application/applications/WithdrawApplication.js';

import { Student } from '../../src/domain/identity/Student.js';
import { Account } from '../../src/domain/identity/Account.js';
import { Project } from '../../src/domain/projects/Project.js';
import { Position } from '../../src/domain/projects/Position.js';
import { ProjectStatus } from '../../src/domain/projects/ProjectStatus.js';
import { ApplicationStatus } from '../../src/domain/applications/ApplicationStatus.js';
import {
  DuplicateApplicationError,
  UnauthorizedApplicationActionError,
  PositionAlreadyFilledError,
  CreatorCannotApplyError,
} from '../../src/domain/applications/errors.js';
import { EmailNotVerifiedError } from '../../src/domain/identity/errors.js';

describe('Integration: Team Formation & Applications Lifecycle (M3)', () => {
  let appRepo;
  let projectRepo;
  let studentRepo;

  let applyToProject;
  let inviteStudent;
  let decideApplication;
  let respondToInvitation;
  let withdrawApplication;

  let verifiedStudent1;
  let verifiedStudent2;
  let unverifiedStudent;
  let creatorStudent;
  let testProject;

  beforeEach(async () => {
    appRepo = new InMemoryApplicationRepository();
    projectRepo = new InMemoryProjectRepository();
    studentRepo = new InMemoryStudentRepository();

    applyToProject = new ApplyToProject({
      applicationRepository: appRepo,
      projectRepository: projectRepo,
      studentRepository: studentRepo,
    });

    inviteStudent = new InviteStudent({
      applicationRepository: appRepo,
      projectRepository: projectRepo,
      studentRepository: studentRepo,
    });

    decideApplication = new DecideApplication({
      applicationRepository: appRepo,
      projectRepository: projectRepo,
    });

    respondToInvitation = new RespondToInvitation({
      applicationRepository: appRepo,
      projectRepository: projectRepo,
    });

    withdrawApplication = new WithdrawApplication({
      applicationRepository: appRepo,
      projectRepository: projectRepo,
    });

    // Seed students
    creatorStudent = new Student({
      id: 'creator-1',
      name: 'Project Creator',
      account: new Account({ email: 'creator@uni.edu', passwordHash: 'hash', isEmailVerified: true }),
    });

    verifiedStudent1 = new Student({
      id: 'student-1',
      name: 'Alice Backend',
      account: new Account({ email: 'alice@uni.edu', passwordHash: 'hash', isEmailVerified: true }),
    });

    verifiedStudent2 = new Student({
      id: 'student-2',
      name: 'Bob Frontend',
      account: new Account({ email: 'bob@uni.edu', passwordHash: 'hash', isEmailVerified: true }),
    });

    unverifiedStudent = new Student({
      id: 'unverified-1',
      name: 'Unverified Dan',
      account: new Account({ email: 'dan@uni.edu', passwordHash: 'hash', isEmailVerified: false }),
    });

    await studentRepo.save(creatorStudent);
    await studentRepo.save(verifiedStudent1);
    await studentRepo.save(verifiedStudent2);
    await studentRepo.save(unverifiedStudent);

    // Seed project with 1 Backend position (headcount: 1)
    testProject = new Project({
      id: 'proj-1',
      title: 'AI Platform',
      description: 'Building team formation platform',
      creatorId: creatorStudent.id,
      requiredSkills: ['Node.js'],
      positions: [
        new Position({ specialty: 'Backend', headcount: 1, filledCount: 0 }),
      ],
    });

    await projectRepo.save(testProject);
  });

  // Rule R5 Test
  it('R5: unverified Student cannot apply to a Project', async () => {
    await expect(applyToProject.execute({
      projectId: testProject.id,
      studentId: unverifiedStudent.id,
      specialty: 'Backend',
    })).rejects.toThrow(EmailNotVerifiedError);
  });

  it('Creator cannot apply to their own Project', async () => {
    await expect(applyToProject.execute({
      projectId: testProject.id,
      studentId: creatorStudent.id,
      specialty: 'Backend',
    })).rejects.toThrow(CreatorCannotApplyError);
  });

  // Rule R1 Tests
  it('R1: a Student has at most one live (Pending or Accepted) Application per Project', async () => {
    // First application succeeds
    const app = await applyToProject.execute({
      projectId: testProject.id,
      studentId: verifiedStudent1.id,
      specialty: 'Backend',
    });
    expect(app.status).toBe(ApplicationStatus.PENDING);

    // Second application while first is Pending must be rejected under Rule R1
    await expect(applyToProject.execute({
      projectId: testProject.id,
      studentId: verifiedStudent1.id,
      specialty: 'Backend',
    })).rejects.toThrow(DuplicateApplicationError);
  });

  it('R1: Student can re-apply after Rejection, and that creates a new Application', async () => {
    const firstApp = await applyToProject.execute({
      projectId: testProject.id,
      studentId: verifiedStudent1.id,
      specialty: 'Backend',
    });

    // Creator rejects first application
    await decideApplication.execute({
      applicationId: firstApp.id,
      creatorId: creatorStudent.id,
      decision: 'reject',
      rejectionReason: 'skills_did_not_match',
    });

    // Applying again after Rejection must succeed under Rule R1
    const secondApp = await applyToProject.execute({
      projectId: testProject.id,
      studentId: verifiedStudent1.id,
      specialty: 'Backend',
      notes: 'Learned more Node.js!',
    });

    expect(secondApp.id).not.toBe(firstApp.id);
    expect(secondApp.status).toBe(ApplicationStatus.PENDING);

    // Old rejected application remains intact
    const original = await appRepo.findById(firstApp.id);
    expect(original.status).toBe(ApplicationStatus.REJECTED);
  });

  // Rule R2 Tests
  it('R2: non-Creator cannot decide on Applications', async () => {
    const app = await applyToProject.execute({
      projectId: testProject.id,
      studentId: verifiedStudent1.id,
      specialty: 'Backend',
    });

    // Impostor attempts to accept application
    await expect(decideApplication.execute({
      applicationId: app.id,
      creatorId: verifiedStudent2.id,
      decision: 'accept',
    })).rejects.toThrow(UnauthorizedApplicationActionError);
  });

  // Rule R3 Tests
  it('R3: accepting beyond headcount fails and transitions Project to Filled when full', async () => {
    const app1 = await applyToProject.execute({
      projectId: testProject.id,
      studentId: verifiedStudent1.id,
      specialty: 'Backend',
    });

    const app2 = await applyToProject.execute({
      projectId: testProject.id,
      studentId: verifiedStudent2.id,
      specialty: 'Backend',
    });

    // Accept first application (fills the 1 available backend seat)
    const res1 = await decideApplication.execute({
      applicationId: app1.id,
      creatorId: creatorStudent.id,
      decision: 'accept',
    });

    expect(res1.application.status).toBe(ApplicationStatus.ACCEPTED);
    expect(res1.project.status).toBe(ProjectStatus.FILLED);

    // Attempting to accept a second applicant beyond headcount fails under Rule R3
    await expect(decideApplication.execute({
      applicationId: app2.id,
      creatorId: creatorStudent.id,
      decision: 'accept',
    })).rejects.toThrow(PositionAlreadyFilledError);

    // Pending application stays Pending (no silent rejection)
    const pendingApp = await appRepo.findById(app2.id);
    expect(pendingApp.status).toBe(ApplicationStatus.PENDING);
  });

  it('R3: Member withdrawal decrements filledCount and reopens Project to Open', async () => {
    const app = await applyToProject.execute({
      projectId: testProject.id,
      studentId: verifiedStudent1.id,
      specialty: 'Backend',
    });

    await decideApplication.execute({
      applicationId: app.id,
      creatorId: creatorStudent.id,
      decision: 'accept',
    });

    let proj = await projectRepo.findById(testProject.id);
    expect(proj.status).toBe(ProjectStatus.FILLED);

    // Member withdraws
    const withdrawRes = await withdrawApplication.execute({
      applicationId: app.id,
      studentId: verifiedStudent1.id,
    });

    expect(withdrawRes.application.status).toBe(ApplicationStatus.WITHDRAWN);
    expect(withdrawRes.project.status).toBe(ProjectStatus.OPEN);
    expect(withdrawRes.project.positions[0].filledCount).toBe(0);
  });

  it('Invitation flow: Creator invites Student, Student accepts', async () => {
    const invitation = await inviteStudent.execute({
      projectId: testProject.id,
      creatorId: creatorStudent.id,
      studentId: verifiedStudent1.id,
      specialty: 'Backend',
    });

    expect(invitation.origin).toBe('invited');
    expect(invitation.status).toBe(ApplicationStatus.PENDING);

    // Non-invited student cannot accept
    await expect(respondToInvitation.execute({
      applicationId: invitation.id,
      studentId: verifiedStudent2.id,
      decision: 'accept',
    })).rejects.toThrow(UnauthorizedApplicationActionError);

    // Invited student accepts
    const accepted = await respondToInvitation.execute({
      applicationId: invitation.id,
      studentId: verifiedStudent1.id,
      decision: 'accept',
    });

    expect(accepted.application.status).toBe(ApplicationStatus.ACCEPTED);
    expect(accepted.project.status).toBe(ProjectStatus.FILLED);
  });

  // Concurrency Test
  it('Concurrency: two applications racing for the last seat via Promise.all', async () => {
    const app1 = await applyToProject.execute({
      projectId: testProject.id,
      studentId: verifiedStudent1.id,
      specialty: 'Backend',
    });

    const app2 = await applyToProject.execute({
      projectId: testProject.id,
      studentId: verifiedStudent2.id,
      specialty: 'Backend',
    });

    // Race two accepts simultaneously on the same 1-headcount seat
    const results = await Promise.allSettled([
      decideApplication.execute({ applicationId: app1.id, creatorId: creatorStudent.id, decision: 'accept' }),
      decideApplication.execute({ applicationId: app2.id, creatorId: creatorStudent.id, decision: 'accept' }),
    ]);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    // Exactly one must succeed, and one must fail
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const proj = await projectRepo.findById(testProject.id);
    expect(proj.positions[0].filledCount).toBe(1);
    expect(proj.status).toBe(ProjectStatus.FILLED);
  });
});
