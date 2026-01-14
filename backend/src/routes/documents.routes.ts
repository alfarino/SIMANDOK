import { Router } from 'express';
import DocumentController from '../controllers/DocumentController';
import { authMiddleware, requireStaffOnly } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/documents
router.get('/', DocumentController.getAll);

// GET /api/documents/my
router.get('/my', DocumentController.getMyDocuments);

// GET /api/documents/pending
router.get('/pending', DocumentController.getPendingApprovals);

// GET /api/documents/ready-to-print (Staff's docs ready to print)
router.get('/ready-to-print', DocumentController.getReadyToPrint);

// POST /api/documents - Staff only
router.post('/', requireStaffOnly, DocumentController.create);

// GET /api/documents/:id
router.get('/:id', DocumentController.getById);

// PUT /api/documents/:id - Staff only
router.put('/:id', requireStaffOnly, DocumentController.update);

// POST /api/documents/:id/submit - Staff only
router.post('/:id/submit', requireStaffOnly, DocumentController.submit);

// POST /api/documents/:id/view - Mark as viewed by current approver
router.post('/:id/view', DocumentController.markAsViewed);

// POST /api/documents/:id/printed - Mark as printed by Staff
router.post('/:id/printed', requireStaffOnly, DocumentController.markAsPrinted);

// GET /api/documents/:id/history - Get approval history for journey display
router.get('/:id/history', DocumentController.getHistory);

// POST /api/documents/:id/resubmit - Resubmit rejected document (Staff only)
router.post('/:id/resubmit', requireStaffOnly, DocumentController.resubmit);

export default router;
