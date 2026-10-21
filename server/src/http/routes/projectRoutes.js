import { Router } from 'express';
import {
  CreateProjectDto,
  UpdateProjectDto,
  BrowseProjectsQueryDto,
} from '../dto/projectDto.js';
import {
  UnauthorizedProjectActionError,
  InvalidProjectDataError,
  InvalidPositionError,
  InvalidProjectStatusTransitionError,
  ProjectNotFoundError,
  PositionOverfilledError,
} from '../../domain/projects/errors.js';
import { EmailNotVerifiedError, InvalidTokenError } from '../../domain/identity/errors.js';

export function createProjectRouter({
  createProjectUseCase,
  updateProjectUseCase,
  closeProjectUseCase,
  getProjectUseCase,
  browseProjectsUseCase,
  requireAuth,
  requireVerified,
}) {
  const router = Router();

  // POST /projects - Create Project (Rule R5: verified student only)
  router.post('/', requireAuth, requireVerified, async (req, res) => {
    const parse = CreateProjectDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const project = await createProjectUseCase.execute({
        creatorId: req.user.id,
        ...parse.data,
      });
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof EmailNotVerifiedError) {
        return res.status(403).json({ error: err.message, rule: 'R5' });
      }
      if (err instanceof InvalidProjectDataError || err instanceof InvalidPositionError || err instanceof PositionOverfilledError) {
        return res.status(400).json({ error: err.message });
      }
      if (err instanceof InvalidTokenError) {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: 'Failed to create project.' });
    }
  });

  // GET /projects - Browse & filter projects
  router.get('/', async (req, res) => {
    const parse = BrowseProjectsQueryDto.safeParse(req.query);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const result = await browseProjectsUseCase.execute(parse.data);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to browse projects: ' + err.message });
    }
  });

  // GET /projects/:id - Project details
  router.get('/:id', async (req, res) => {
    try {
      const project = await getProjectUseCase.execute({ projectId: req.params.id });
      res.status(200).json(project);
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: 'Failed to fetch project.' });
    }
  });

  // PATCH /projects/:id - Update project (Rule R2: creator only)
  router.patch('/:id', requireAuth, async (req, res) => {
    const parse = UpdateProjectDto.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    try {
      const project = await updateProjectUseCase.execute({
        projectId: req.params.id,
        updaterId: req.user.id,
        projectData: parse.data,
      });
      res.status(200).json(project);
    } catch (err) {
      if (err instanceof UnauthorizedProjectActionError) {
        return res.status(403).json({ error: err.message, rule: 'R2' });
      }
      if (err instanceof ProjectNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      if (err instanceof InvalidProjectDataError || err instanceof InvalidPositionError || err instanceof PositionOverfilledError) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: 'Failed to update project.' });
    }
  });

  // POST /projects/:id/close - Close project (Rule R2: creator only)
  router.post('/:id/close', requireAuth, async (req, res) => {
    try {
      const project = await closeProjectUseCase.execute({
        projectId: req.params.id,
        closerId: req.user.id,
      });
      res.status(200).json(project);
    } catch (err) {
      if (err instanceof UnauthorizedProjectActionError) {
        return res.status(403).json({ error: err.message, rule: 'R2' });
      }
      if (err instanceof ProjectNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      if (err instanceof InvalidProjectStatusTransitionError) {
        return res.status(400).json({ error: err.message, rule: 'R3' });
      }
      res.status(500).json({ error: 'Failed to close project.' });
    }
  });

  // DELETE /projects/:id - alias for closing project (Rule R2: creator only)
  router.delete('/:id', requireAuth, async (req, res) => {
    try {
      const project = await closeProjectUseCase.execute({
        projectId: req.params.id,
        closerId: req.user.id,
      });
      res.status(200).json(project);
    } catch (err) {
      if (err instanceof UnauthorizedProjectActionError) {
        return res.status(403).json({ error: err.message, rule: 'R2' });
      }
      if (err instanceof ProjectNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      if (err instanceof InvalidProjectStatusTransitionError) {
        return res.status(400).json({ error: err.message, rule: 'R3' });
      }
      res.status(500).json({ error: 'Failed to delete/close project.' });
    }
  });

  return router;
}
