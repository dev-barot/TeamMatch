import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    commit: process.env.GIT_COMMIT || 'local',
    timestamp: new Date().toISOString(),
  });
});
