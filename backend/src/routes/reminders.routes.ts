import { Router } from 'express';
import ReminderController from '../controllers/ReminderController';
import { authMiddleware, requireMinLevel } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/reminders/send-batch (admin only - level 3+)
router.post('/send-batch', requireMinLevel(3), ReminderController.sendBatch);

// GET /api/reminders/pending-summary
router.get('/pending-summary', requireMinLevel(2), ReminderController.getPendingSummary);

// GET /api/reminders/logs
router.get('/logs', requireMinLevel(2), ReminderController.getLogs);

export default router;
