import { Router } from 'express';
import DashboardController from '../controllers/DashboardController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/dashboard/summary
router.get('/summary', DashboardController.getSummary);

// GET /api/dashboard/pending
router.get('/pending', DashboardController.getPending);

// GET /api/dashboard/recent
router.get('/recent', DashboardController.getRecent);

export default router;
