import { Router } from 'express';
import { UpdateProfileDto } from '../dto/identityDto.js';
import {
  UnauthorizedProfileEditError,
  InvalidProfileDataError,
  InvalidTokenError,
} from '../../domain/identity/errors.js';

export function createStudentRouter({
  getOwnProfileUseCase,
  updateProfileUseCase,
  getStudentPublicViewUseCase,
  requireAuth,
}) {
  const router = Router();

  // GET /students/me - authenticated own profile
  router.get('/me', requireAuth, async (req, res) => {
    try {
      const student = await getOwnProfileUseCase.execute({ studentId: req.user.id });
      res.status(200).json(student);
    } catch {
      res.status(404).json({ error: 'Student not found.' });
    }
  });

  // PATCH /students/:id/profile - Rule R2: Only owner acts
  router.patch('/:id/profile', requireAuth, async (req, res) => {
    const parse = UpdateProfileDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const updated = await updateProfileUseCase.execute({
        studentId: req.params.id,
        requesterId: req.user.id,
        profileData: parse.data,
      });
      res.status(200).json(updated);
    } catch (err) {
      if (err instanceof UnauthorizedProfileEditError) {
        // Enforces Rule R2 in HTTP layer
        return res.status(403).json({ error: err.message, rule: 'R2' });
      }
      if (err instanceof InvalidProfileDataError) {
        return res.status(400).json({ error: err.message });
      }
      if (err instanceof InvalidTokenError) {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: 'Failed to update profile.' });
    }
  });

  // GET /students/:id - public candidate view
  router.get('/:id', async (req, res) => {
    try {
      const student = await getStudentPublicViewUseCase.execute({ targetStudentId: req.params.id });
      res.status(200).json(student);
    } catch {
      res.status(404).json({ error: 'Student not found.' });
    }
  });

  return router;
}
