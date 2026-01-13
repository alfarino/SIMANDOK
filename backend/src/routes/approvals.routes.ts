import { Router } from 'express';
import ApprovalController from '../controllers/ApprovalController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/approvals/pending
router.get('/pending', ApprovalController.getPending);

// POST /api/approvals/:docId/approve
router.post('/:docId/approve', ApprovalController.approve);

// POST /api/approvals/:docId/reject
router.post('/:docId/reject', ApprovalController.reject);

// GET /api/approvals/:docId/approvers
router.get('/:docId/approvers', ApprovalController.getApprovers);

// PUT /api/approvals/:docId/approvers (set approvers for draft)
router.put('/:docId/approvers', ApprovalController.setApprovers);

// GET /api/approvals/:docId/history
router.get('/:docId/history', ApprovalController.getHistory);

// POST /api/approvals/:docId/submit
router.post('/:docId/submit', ApprovalController.submit);

export default router;
