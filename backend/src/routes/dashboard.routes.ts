import { Router } from 'express';
import DashboardController from '../controllers/DashboardController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/dashboard/summary
router.get('/summary', DashboardController.getSummary);

// GET /api/dashboard/global-stats
router.get('/global-stats', DashboardController.getGlobalStats);

// GET /api/dashboard/backlog-by-approver
router.get('/backlog-by-approver', DashboardController.getBacklogByApprover);

// GET /api/dashboard/personal-stats
router.get('/personal-stats', DashboardController.getPersonalStats);

// GET /api/dashboard/pending
router.get('/pending', DashboardController.getPending);

// GET /api/dashboard/recent
router.get('/recent', DashboardController.getRecent);

// GET /api/dashboard/workflow-distribution
router.get('/workflow-distribution', DashboardController.getWorkflowDistribution);

// GET /api/dashboard/status-distribution
router.get('/status-distribution', DashboardController.getStatusDistribution);

export default router;
