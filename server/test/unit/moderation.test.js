import { Report, REPORT_STATUS, REPORT_TARGET_TYPE } from '../../src/domain/moderation/Report.js';
import {
  ReportNotFoundError,
  ReportAlreadyReviewedError,
  UnauthorizedAdminActionError,
  AccountNotFoundError,
  AccountAlreadyDeactivatedError,
} from '../../src/domain/moderation/errors.js';
import { Account, ACCOUNT_TYPES } from '../../src/domain/identity/Account.js';
import { Student } from '../../src/domain/identity/Student.js';
import { Profile } from '../../src/domain/identity/Profile.js';
import { InMemoryStudentRepository } from '../../src/infrastructure/mongo/InMemoryStudentRepository.js';
import { InMemoryReportRepository } from '../../src/infrastructure/mongo/InMemoryReportRepository.js';
import { ListAccounts } from '../../src/application/moderation/ListAccounts.js';
import { DeactivateAccount } from '../../src/application/moderation/DeactivateAccount.js';
import { ListReports } from '../../src/application/moderation/ListReports.js';
import { MarkReportReviewed } from '../../src/application/moderation/MarkReportReviewed.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeStudent(id, overrides = {}) {
  return new Student({
    id,
    name: overrides.name || `Student ${id}`,
    account: new Account({
      email: overrides.email || `student_${id}@test.com`,
      passwordHash: 'hashed',
      accountType: overrides.accountType || ACCOUNT_TYPES.STUDENT,
      isEmailVerified: overrides.isEmailVerified !== undefined ? overrides.isEmailVerified : true,
      isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    }),
    profile: new Profile({ specialty: 'Backend' }),
  });
}

function makeAdmin(id = 'admin_001') {
  return makeStudent(id, {
    name: 'Platform Admin',
    email: 'admin@test.com',
    accountType: ACCOUNT_TYPES.ADMIN,
  });
}

function makeReport(overrides = {}) {
  return new Report({
    id: overrides.id || `report_${Math.random().toString(36).slice(2)}`,
    reporterId: overrides.reporterId || 'student_001',
    targetType: overrides.targetType || REPORT_TARGET_TYPE.STUDENT,
    targetId: overrides.targetId || 'student_002',
    reason: overrides.reason !== undefined ? overrides.reason : 'Harassment and inappropriate messaging.',
    status: overrides.status || REPORT_STATUS.PENDING,
  });
}

// ─── Domain: Report aggregate ────────────────────────────────────────────────
describe('Domain: Report aggregate', () => {
  it('creates a Report with PENDING status and valid fields', () => {
    const report = makeReport();
    expect(report.status).toBe(REPORT_STATUS.PENDING);
    expect(report.isPending()).toBe(true);
    expect(report.isReviewed()).toBe(false);
  });

  it('rejects a Report with an empty reason', () => {
    expect(() => makeReport({ reason: '' })).toThrow('reason is required');
  });

  it('rejects a Report reason longer than 500 characters', () => {
    expect(() => makeReport({ reason: 'x'.repeat(501) })).toThrow('at most 500 characters');
  });

  it('rejects an invalid targetType', () => {
    expect(() => makeReport({ targetType: 'message' })).toThrow('Invalid Report targetType');
  });

  it('markReviewed transitions Report status to REVIEWED', () => {
    const report = makeReport();
    report.markReviewed('admin_001');
    expect(report.status).toBe(REPORT_STATUS.REVIEWED);
    expect(report.isReviewed()).toBe(true);
    expect(report.reviewedByAdminId).toBe('admin_001');
    expect(report.reviewedAt).toBeInstanceOf(Date);
  });

  it('markReviewed requires an adminId', () => {
    const report = makeReport();
    expect(() => report.markReviewed('')).toThrow('Admin ID is required');
  });

  it('toJSON never exposes sensitive fields beyond the spec', () => {
    const report = makeReport();
    const json = report.toJSON();
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('targetType');
    expect(json).toHaveProperty('targetId');
    expect(json).toHaveProperty('reason');
    expect(json).toHaveProperty('status');
    // Admin cannot read message content — no messageContent field
    expect(json).not.toHaveProperty('messageContent');
  });
});

// ─── Use Case: ListAccounts ───────────────────────────────────────────────────
describe('Use Case: ListAccounts', () => {
  let studentRepo, listAccounts;

  beforeEach(() => {
    studentRepo = new InMemoryStudentRepository();
    listAccounts = new ListAccounts({ studentRepository: studentRepo });
  });

  it('R2: a Student gets UnauthorizedAdminActionError when calling ListAccounts', async () => {
    await expect(
      listAccounts.execute({ requesterId: 's1', requesterAccountType: ACCOUNT_TYPES.STUDENT }),
    ).rejects.toThrow(UnauthorizedAdminActionError);
  });

  it('Admin can list all accounts including unverified and inactive', async () => {
    await studentRepo.save(makeStudent('s1', { isEmailVerified: false }));
    await studentRepo.save(makeStudent('s2', { isActive: false }));
    await studentRepo.save(makeAdmin());

    const accounts = await listAccounts.execute({
      requesterId: 'admin_001',
      requesterAccountType: ACCOUNT_TYPES.ADMIN,
    });

    expect(accounts).toHaveLength(3);
    // Privacy: no passwordHash in output
    accounts.forEach((a) => expect(a).not.toHaveProperty('passwordHash'));
  });
});

// ─── Use Case: DeactivateAccount ─────────────────────────────────────────────
describe('Use Case: DeactivateAccount', () => {
  let studentRepo, deactivateAccount;

  beforeEach(() => {
    studentRepo = new InMemoryStudentRepository();
    deactivateAccount = new DeactivateAccount({ studentRepository: studentRepo });
  });

  it('R2: Student cannot deactivate an Account', async () => {
    await expect(
      deactivateAccount.execute({
        targetStudentId: 's2',
        adminId: 's1',
        requesterAccountType: ACCOUNT_TYPES.STUDENT,
      }),
    ).rejects.toThrow(UnauthorizedAdminActionError);
  });

  it('throws AccountNotFoundError when target does not exist', async () => {
    await expect(
      deactivateAccount.execute({
        targetStudentId: 'nonexistent',
        adminId: 'admin_001',
        requesterAccountType: ACCOUNT_TYPES.ADMIN,
      }),
    ).rejects.toThrow(AccountNotFoundError);
  });

  it('Deactivate blocks login — Account.assertCanLogin() throws after deactivation', async () => {
    const student = makeStudent('s2');
    await studentRepo.save(student);

    await deactivateAccount.execute({
      targetStudentId: 's2',
      adminId: 'admin_001',
      requesterAccountType: ACCOUNT_TYPES.ADMIN,
    });

    const saved = await studentRepo.findById('s2');
    expect(saved.account.isActive).toBe(false);
    // assertCanLogin throws — this is what LogIn use case calls
    expect(() => saved.account.assertCanLogin()).toThrow('deactivated');
  });

  it('throws AccountAlreadyDeactivatedError on double deactivation', async () => {
    const student = makeStudent('s3', { isActive: false });
    await studentRepo.save(student);

    await expect(
      deactivateAccount.execute({
        targetStudentId: 's3',
        adminId: 'admin_001',
        requesterAccountType: ACCOUNT_TYPES.ADMIN,
      }),
    ).rejects.toThrow(AccountAlreadyDeactivatedError);
  });

  it('DeactivateAccount only touches isActive — profile is unchanged', async () => {
    const student = makeStudent('s4');
    const originalBio = student.profile?.bio;
    await studentRepo.save(student);

    await deactivateAccount.execute({
      targetStudentId: 's4',
      adminId: 'admin_001',
      requesterAccountType: ACCOUNT_TYPES.ADMIN,
    });

    const saved = await studentRepo.findById('s4');
    expect(saved.account.isActive).toBe(false);
    expect(saved.profile?.bio).toBe(originalBio);
    // Profile specialty is unchanged
    expect(saved.profile?.specialty).toBe('Backend');
  });
});

// ─── Use Case: ListReports ───────────────────────────────────────────────────
describe('Use Case: ListReports', () => {
  let reportRepo, listReports;

  beforeEach(() => {
    reportRepo = new InMemoryReportRepository();
    listReports = new ListReports({ reportRepository: reportRepo });
  });

  it('R2: Student cannot list Reports', async () => {
    await expect(
      listReports.execute({ requesterAccountType: ACCOUNT_TYPES.STUDENT }),
    ).rejects.toThrow(UnauthorizedAdminActionError);
  });

  it('Admin can list all Reports', async () => {
    await reportRepo.save(makeReport({ id: 'r1' }));
    await reportRepo.save(makeReport({ id: 'r2', status: REPORT_STATUS.REVIEWED }));

    const reports = await listReports.execute({ requesterAccountType: ACCOUNT_TYPES.ADMIN });
    expect(reports).toHaveLength(2);
  });

  it('Admin can filter Reports by status=pending', async () => {
    await reportRepo.save(makeReport({ id: 'r1' }));
    await reportRepo.save(makeReport({ id: 'r2', status: REPORT_STATUS.REVIEWED }));

    const reports = await listReports.execute({
      requesterAccountType: ACCOUNT_TYPES.ADMIN,
      filters: { status: REPORT_STATUS.PENDING },
    });
    expect(reports).toHaveLength(1);
    expect(reports[0].status).toBe(REPORT_STATUS.PENDING);
  });
});

// ─── Use Case: MarkReportReviewed ────────────────────────────────────────────
describe('Use Case: MarkReportReviewed', () => {
  let reportRepo, markReportReviewed;

  beforeEach(() => {
    reportRepo = new InMemoryReportRepository();
    markReportReviewed = new MarkReportReviewed({ reportRepository: reportRepo });
  });

  it('R2: Student cannot mark a Report as reviewed', async () => {
    await expect(
      markReportReviewed.execute({
        reportId: 'r1',
        adminId: 's1',
        requesterAccountType: ACCOUNT_TYPES.STUDENT,
      }),
    ).rejects.toThrow(UnauthorizedAdminActionError);
  });

  it('throws ReportNotFoundError for unknown reportId', async () => {
    await expect(
      markReportReviewed.execute({
        reportId: 'nonexistent',
        adminId: 'admin_001',
        requesterAccountType: ACCOUNT_TYPES.ADMIN,
      }),
    ).rejects.toThrow(ReportNotFoundError);
  });

  it('Admin marks a pending Report as reviewed', async () => {
    const report = makeReport({ id: 'r1' });
    await reportRepo.save(report);

    const result = await markReportReviewed.execute({
      reportId: 'r1',
      adminId: 'admin_001',
      requesterAccountType: ACCOUNT_TYPES.ADMIN,
    });

    expect(result.status).toBe(REPORT_STATUS.REVIEWED);
    expect(result.reviewedByAdminId).toBe('admin_001');
  });

  it('throws ReportAlreadyReviewedError on double review', async () => {
    const report = makeReport({ id: 'r1', status: REPORT_STATUS.REVIEWED });
    await reportRepo.save(report);

    await expect(
      markReportReviewed.execute({
        reportId: 'r1',
        adminId: 'admin_001',
        requesterAccountType: ACCOUNT_TYPES.ADMIN,
      }),
    ).rejects.toThrow(ReportAlreadyReviewedError);
  });
});
