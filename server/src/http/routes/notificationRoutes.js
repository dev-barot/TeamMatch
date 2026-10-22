import { Router } from 'express';
import { NotificationNotFoundError } from '../../domain/messaging/errors.js';

export function createNotificationRouter({
  listNotificationsUseCase,
  markNotificationReadUseCase,
  markAllNotificationsReadUseCase,
  requireAuth,
}) {
  const router = Router();

  // GET /notifications - List notifications and unread count for current student
  router.get('/', requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const result = await listNotificationsUseCase.execute({
        studentId: req.user.id,
        limit,
      });
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // PATCH /notifications/read-all - Mark all notifications as read for current student
  router.patch('/read-all', requireAuth, async (req, res) => {
    try {
      const result = await markAllNotificationsReadUseCase.execute({
        studentId: req.user.id,
      });
      res.status(200).json({
        message: 'All notifications marked as read.',
        ...result,
      });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // PATCH /notifications/:id/read - Mark single notification as read
  router.patch('/:id/read', requireAuth, async (req, res) => {
    try {
      const notification = await markNotificationReadUseCase.execute({
        notificationId: req.params.id,
        studentId: req.user.id,
      });
      res.status(200).json(notification.toJSON());
    } catch (err) {
      if (err instanceof NotificationNotFoundError) {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  return router;
}
