import { Router } from 'express';
import {
  ApplyToProjectDto,
  InviteStudentDto,
  DecideApplicationDto,
  RespondToInvitationDto,
} from '../dto/applicationDto.js';
import {
  DuplicateApplicationError,
  CreatorCannotApplyError,
  PositionNotFoundError,
  PositionAlreadyFilledError,
  UnauthorizedApplicationActionError,
  InvalidApplicationStatusTransitionError,
} from '../../domain/applications/errors.js';
import { EmailNotVerifiedError } from '../../domain/identity/errors.js';
import { UnauthorizedProjectActionError } from '../../domain/projects/errors.js';

export function createApplicationRouter({
  applyToProjectUseCase,
  inviteStudentUseCase,
  decideApplicationUseCase,
  respondToInvitationUseCase,
  withdrawApplicationUseCase,
  getProjectApplicationsUseCase,
  getStudentApplicationsUseCase,
  requireAuth,
  requireVerified,
}) {
  const router = Router();

  // POST /applications - Student applies to a Project (Rule R1, R5)
  router.post('/', requireAuth, requireVerified, async (req, res) => {
    const parse = ApplyToProjectDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const application = await applyToProjectUseCase.execute({
        projectId: parse.data.projectId,
        studentId: req.user.id,
        specialty: parse.data.specialty,
        notes: parse.data.notes,
      });

      res.status(201).json({
        message: 'Application submitted successfully.',
        application,
      });
    } catch (err) {
      if (err instanceof DuplicateApplicationError) {
        return res.status(409).json({ error: err.message, rule: 'R1' });
      }
      if (err instanceof CreatorCannotApplyError) {
        return res.status(400).json({ error: err.message });
      }
      if (err instanceof PositionNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      if (err instanceof PositionAlreadyFilledError) {
        return res.status(409).json({ error: err.message, rule: 'R3' });
      }
      if (err instanceof EmailNotVerifiedError) {
        return res.status(403).json({ error: err.message, rule: 'R5' });
      }
      res.status(500).json({ error: err.message || 'Failed to submit application.' });
    }
  });

  // POST /projects/:id/invitations - Creator invites a Student to a Project (Rule R2, R1)
  router.post('/projects/:id/invitations', requireAuth, requireVerified, async (req, res) => {
    const parse = InviteStudentDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const invitation = await inviteStudentUseCase.execute({
        projectId: req.params.id,
        creatorId: req.user.id,
        studentId: parse.data.studentId,
        specialty: parse.data.specialty,
        notes: parse.data.notes,
      });

      res.status(201).json({
        message: 'Invitation sent successfully.',
        invitation,
      });
    } catch (err) {
      if (err instanceof UnauthorizedProjectActionError) {
        return res.status(403).json({ error: 'Only the Project Creator can invite students (R2).', rule: 'R2' });
      }
      if (err instanceof DuplicateApplicationError) {
        return res.status(409).json({ error: err.message, rule: 'R1' });
      }
      if (err instanceof PositionAlreadyFilledError) {
        return res.status(409).json({ error: err.message, rule: 'R3' });
      }
      res.status(500).json({ error: err.message || 'Failed to send invitation.' });
    }
  });

  // PATCH /applications/:id/decide - Creator decides (Accept / Reject) an application (Rule R2, R3)
  router.patch('/:id/decide', requireAuth, async (req, res) => {
    const parse = DecideApplicationDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const result = await decideApplicationUseCase.execute({
        applicationId: req.params.id,
        creatorId: req.user.id,
        decision: parse.data.decision,
        rejectionReason: parse.data.rejectionReason,
      });

      res.status(200).json({
        message: `Application ${parse.data.decision}ed successfully.`,
        ...result,
      });
    } catch (err) {
      if (err instanceof UnauthorizedApplicationActionError) {
        return res.status(403).json({ error: err.message, rule: 'R2' });
      }
      if (err instanceof PositionAlreadyFilledError) {
        return res.status(409).json({ error: err.message, rule: 'R3' });
      }
      if (err instanceof InvalidApplicationStatusTransitionError) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Failed to decide on application.' });
    }
  });

  // PATCH /applications/:id/respond - Invited Student responds (Accept / Reject)
  router.patch('/:id/respond', requireAuth, async (req, res) => {
    const parse = RespondToInvitationDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const result = await respondToInvitationUseCase.execute({
        applicationId: req.params.id,
        studentId: req.user.id,
        decision: parse.data.decision,
      });

      res.status(200).json({
        message: `Invitation ${parse.data.decision}ed successfully.`,
        ...result,
      });
    } catch (err) {
      if (err instanceof UnauthorizedApplicationActionError) {
        return res.status(403).json({ error: err.message });
      }
      if (err instanceof PositionAlreadyFilledError) {
        return res.status(409).json({ error: err.message, rule: 'R3' });
      }
      if (err instanceof InvalidApplicationStatusTransitionError) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Failed to respond to invitation.' });
    }
  });

  // POST /applications/:id/withdraw - Student withdraws application or leaves team
  router.post('/:id/withdraw', requireAuth, async (req, res) => {
    try {
      const result = await withdrawApplicationUseCase.execute({
        applicationId: req.params.id,
        studentId: req.user.id,
      });

      res.status(200).json({
        message: 'Application withdrawn successfully.',
        ...result,
      });
    } catch (err) {
      if (err instanceof UnauthorizedApplicationActionError) {
        return res.status(403).json({ error: err.message });
      }
      if (err instanceof InvalidApplicationStatusTransitionError) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Failed to withdraw application.' });
    }
  });

  // GET /applications/projects/:id - Creator views all incoming applications for a project (Rule R2)
  router.get('/projects/:id', requireAuth, async (req, res) => {
    try {
      const applications = await getProjectApplicationsUseCase.execute({
        projectId: req.params.id,
        requesterId: req.user.id,
        filters: {
          status: req.query.status,
          specialty: req.query.specialty,
        },
      });

      res.status(200).json({ applications });
    } catch (err) {
      if (err instanceof UnauthorizedProjectActionError) {
        return res.status(403).json({ error: 'Only the Project Creator can view incoming applications (R2).', rule: 'R2' });
      }
      res.status(500).json({ error: err.message || 'Failed to fetch project applications.' });
    }
  });

  // GET /applications/me - Student views their own submitted/invited applications
  router.get('/me', requireAuth, async (req, res) => {
    try {
      const applications = await getStudentApplicationsUseCase.execute({
        studentId: req.user.id,
      });

      res.status(200).json({ applications });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to fetch your applications.' });
    }
  });

  return router;
}
