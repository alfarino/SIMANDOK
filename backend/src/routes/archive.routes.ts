import { Router } from 'express';
import ArchiveController from '../controllers/ArchiveController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/archive
router.get('/', ArchiveController.getAll);

// GET /api/archive/:id
router.get('/:id', ArchiveController.getById);

// GET /api/archive/:id/audit
router.get('/:id/audit', ArchiveController.getAuditTrail);

// POST /api/archive/:id/archive (archive a document)
router.post('/:id/archive', ArchiveController.archive);

// POST /api/archive/:id/restore
router.post('/:id/restore', ArchiveController.restore);

export default router;
