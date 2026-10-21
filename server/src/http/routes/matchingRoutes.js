import { Router } from 'express';
import { ProjectNotFoundError, UnauthorizedProjectActionError } from '../../domain/projects/errors.js';
import { StudentNotFoundError } from '../../domain/identity/errors.js';

export function createMatchingRouter({
  findMatchedProjectsUseCase,
  findMatchedStudentsUseCase,
  requireAuth,
}) {
  const router = Router();

  /**
   * GET /matching/projects
   * Recommends ranked Projects for the authenticated Student (Rule R4).
   */
  router.get('/projects', requireAuth, async (req, res) => {
    try {
      const limit = Math.min(Math.max(1, Number.parseInt(req.query.limit, 10) || 10), 30);
      const matches = await findMatchedProjectsUseCase.execute({
        studentId: req.user.id,
        limit,
      });

      res.status(200).json({
        total: matches.length,
        matches,
      });
    } catch (err) {
      if (err instanceof StudentNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: 'Internal server error while computing project matches.' });
    }
  });

  /**
   * GET /matching/candidates/:projectId
   * Recommends ranked Student candidates for a Project.
   * Enforces Rule R2: Creator only access.
   */
  router.get('/candidates/:projectId', requireAuth, async (req, res) => {
    try {
      const limit = Math.min(Math.max(1, Number.parseInt(req.query.limit, 10) || 20), 50);
      const candidates = await findMatchedStudentsUseCase.execute({
        projectId: req.params.projectId,
        requesterId: req.user.id,
        limit,
      });

      res.status(200).json({
        projectId: req.params.projectId,
        total: candidates.length,
        candidates,
      });
    } catch (err) {
      if (err instanceof UnauthorizedProjectActionError) {
        return res.status(403).json({ error: err.message, rule: 'R2' });
      }
      if (err instanceof ProjectNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: 'Internal server error while computing candidate recommendations.' });
    }
  });

  return router;
}
