import { Router } from 'express';
import { ReportStudentDto, ReportConversationDto } from '../dto/adminDto.js';

/**
 * Moderation Routes — Student-facing report filing.
 * Students can report other Students or Conversations.
 * These are separate from /admin/* routes.
 */
export function createModerationRouter({
  reportStudentUseCase,
  reportConversationUseCase,
  requireAuth,
  requireVerified,
}) {
  const router = Router();

  // POST /moderation/reports/students — report a Student (requires auth + verified)
  router.post('/reports/students', requireAuth, requireVerified, async (req, res) => {
    const parse = ReportStudentDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const report = await reportStudentUseCase.execute({
        reporterId: req.user.id,
        targetStudentId: parse.data.targetStudentId,
        reason: parse.data.reason,
      });
      res.status(201).json({
        message: 'Report submitted successfully. An Admin will review it shortly.',
        report,
      });
    } catch (err) {
      if (err.message.includes('cannot report themselves')) {
        return res.status(400).json({ error: err.message });
      }
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Failed to submit report.' });
    }
  });

  // POST /moderation/reports/conversations — report a Conversation (requires auth)
  router.post('/reports/conversations', requireAuth, async (req, res) => {
    const parse = ReportConversationDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const report = await reportConversationUseCase.execute({
        reporterId: req.user.id,
        conversationId: parse.data.conversationId,
        reason: parse.data.reason,
      });
      res.status(201).json({
        message: 'Report submitted successfully. An Admin will review it shortly.',
        report,
      });
    } catch (err) {
      if (err.message.includes('not found') || err.message.includes('participant')) {
        return res.status(err.message.includes('participant') ? 403 : 404).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Failed to submit report.' });
    }
  });

  return router;
}
