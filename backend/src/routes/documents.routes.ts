import { Router } from 'express';
import DocumentController from '../controllers/DocumentController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/documents
router.get('/', DocumentController.getAll);

// GET /api/documents/my
router.get('/my', DocumentController.getMyDocuments);

// GET /api/documents/pending
router.get('/pending', DocumentController.getPendingApprovals);

// POST /api/documents
router.post('/', DocumentController.create);

// GET /api/documents/:id
router.get('/:id', DocumentController.getById);

// PUT /api/documents/:id
router.put('/:id', DocumentController.update);

// POST /api/documents/:id/submit
router.post('/:id/submit', DocumentController.submit);

export default router;
