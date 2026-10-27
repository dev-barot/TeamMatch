import { Router } from 'express';
import {
  DeactivateAccountDto,
  AdminCloseProjectDto,
  MarkReportReviewedDto,
} from '../dto/adminDto.js';
import {
  UnauthorizedAdminActionError,
  ReportNotFoundError,
  ReportAlreadyReviewedError,
  AccountNotFoundError,
  AccountAlreadyDeactivatedError,
} from '../../domain/moderation/errors.js';
import { ProjectNotFoundError } from '../../domain/projects/errors.js';

/**
 * Admin & Moderation Routes (M6)
 * All routes are protected by requireAuth + requireAdmin middleware.
 *
 * Rule R2: Only an Admin can reach any /admin/* endpoint.
 * Admin cannot read message content; Reports expose only target + reason.
 */
export function createAdminRouter({
  listAccountsUseCase,
  deactivateAccountUseCase,
  adminCloseProjectUseCase,
  listReportsUseCase,
  markReportReviewedUseCase,
  studentRepository,
  requireAuth,
  requireAdmin,
}) {
  const router = Router();

  // All routes require authentication + admin account type (Rule R2)
  router.use(requireAuth, requireAdmin);

  // GET /admin/accounts — list all Accounts (paginated)
  router.get('/accounts', async (req, res) => {
    try {
      const accounts = await listAccountsUseCase.execute({
        requesterId: req.user.id,
        requesterAccountType: req.user.accountType,
        filters: {
          limit: req.query.limit,
          offset: req.query.offset,
        },
      });
      res.status(200).json({ accounts, count: accounts.length });
    } catch (err) {
      if (err instanceof UnauthorizedAdminActionError) {
        return res.status(403).json({ error: err.message, rule: 'R2' });
      }
      res.status(500).json({ error: err.message || 'Failed to list accounts.' });
    }
  });

  // PATCH /admin/accounts/:id/deactivate — deactivate a Student Account
  router.patch('/accounts/:id/deactivate', async (req, res) => {
    const parse = DeactivateAccountDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const result = await deactivateAccountUseCase.execute({
        targetStudentId: req.params.id,
        adminId: req.user.id,
        requesterAccountType: req.user.accountType,
      });
      res.status(200).json({
        message: 'Account deactivated successfully.',
        ...result,
      });
    } catch (err) {
      if (err instanceof UnauthorizedAdminActionError) {
        return res.status(403).json({ error: err.message, rule: 'R2' });
      }
      if (err instanceof AccountNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      if (err instanceof AccountAlreadyDeactivatedError) {
        return res.status(409).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Failed to deactivate account.' });
    }
  });

  // PATCH /admin/accounts/:id/verify — Admin manually verifies a student profile (Rule R5)
  router.patch('/accounts/:id/verify', async (req, res) => {
    try {
      if (!studentRepository) {
        return res.status(500).json({ error: 'Student repository not available.' });
      }
      const student = await studentRepository.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ error: 'Student account not found.' });
      }
      student.account.markVerified();
      await studentRepository.save(student);
      res.status(200).json({
        message: `Account for "${student.name}" has been verified.`,
        student: student.toPrivateView(),
      });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to verify account.' });
    }
  });

  // POST /admin/projects/:id/close — Admin forcibly closes a Project (Rule R2, R3)
  router.post('/projects/:id/close', async (req, res) => {
    const parse = AdminCloseProjectDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const result = await adminCloseProjectUseCase.execute({
        projectId: req.params.id,
        adminId: req.user.id,
        requesterAccountType: req.user.accountType,
      });
      res.status(200).json({
        message: 'Project closed by Admin. All Pending Applications rejected with reason "project_closed".',
        ...result,
      });
    } catch (err) {
      if (err instanceof UnauthorizedAdminActionError) {
        return res.status(403).json({ error: err.message, rule: 'R2' });
      }
      if (err instanceof ProjectNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Failed to close project.' });
    }
  });

  // GET /admin/reports — list all Reports (optionally filter by status)
  router.get('/reports', async (req, res) => {
    try {
      const reports = await listReportsUseCase.execute({
        requesterAccountType: req.user.accountType,
        filters: {
          status: req.query.status,
          limit: req.query.limit,
          offset: req.query.offset,
        },
      });
      res.status(200).json({ reports, count: reports.length });
    } catch (err) {
      if (err instanceof UnauthorizedAdminActionError) {
        return res.status(403).json({ error: err.message, rule: 'R2' });
      }
      res.status(500).json({ error: err.message || 'Failed to list reports.' });
    }
  });

  // PATCH /admin/reports/:id/review — Admin marks a Report as reviewed
  router.patch('/reports/:id/review', async (req, res) => {
    const parse = MarkReportReviewedDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const report = await markReportReviewedUseCase.execute({
        reportId: req.params.id,
        adminId: req.user.id,
        requesterAccountType: req.user.accountType,
      });
      res.status(200).json({
        message: 'Report marked as reviewed.',
        report,
      });
    } catch (err) {
      if (err instanceof UnauthorizedAdminActionError) {
        return res.status(403).json({ error: err.message, rule: 'R2' });
      }
      if (err instanceof ReportNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      if (err instanceof ReportAlreadyReviewedError) {
        return res.status(409).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Failed to mark report as reviewed.' });
    }
  });

  return router;
}
