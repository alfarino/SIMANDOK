import { Router } from 'express';

const router = Router();

// GET /api/approvals/pending
router.get('/pending', (req, res) => {
    res.json({ message: 'List pending approvals - TODO' });
});

// POST /api/approvals/:docId/approve
router.post('/:docId/approve', (req, res) => {
    res.json({ message: 'Approve document - TODO' });
});

// POST /api/approvals/:docId/reject
router.post('/:docId/reject', (req, res) => {
    res.json({ message: 'Reject document - TODO' });
});

// GET /api/approvals/:docId/approvers
router.get('/:docId/approvers', (req, res) => {
    res.json({ message: 'Get document approvers - TODO' });
});

export default router;
