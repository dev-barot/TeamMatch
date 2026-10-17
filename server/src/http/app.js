import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';

export function createApp() {
  const app = express();

  app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());

  // Base routes
  app.use('/health', healthRouter);

  // 404 fallback
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
}
