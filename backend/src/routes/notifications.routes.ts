import { Router } from 'express';
import NotificationController from '../controllers/NotificationController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/notifications
router.get('/', NotificationController.getAll);

// GET /api/notifications/unread-count
router.get('/unread-count', NotificationController.getUnreadCount);

// PUT /api/notifications/:id/read
router.put('/:id/read', NotificationController.markAsRead);

// PUT /api/notifications/read-all
router.put('/read-all', NotificationController.markAllAsRead);

export default router;
