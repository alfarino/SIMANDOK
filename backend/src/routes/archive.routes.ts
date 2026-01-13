import { Router } from 'express';

const router = Router();

// GET /api/archive
router.get('/', (req, res) => {
    res.json({ message: 'List archived documents - TODO' });
});

// GET /api/archive/:id
router.get('/:id', (req, res) => {
    res.json({ message: 'Get archived document - TODO' });
});

// GET /api/archive/:id/audit
router.get('/:id/audit', (req, res) => {
    res.json({ message: 'Get audit trail - TODO' });
});

// POST /api/archive/:id/restore
router.post('/:id/restore', (req, res) => {
    res.json({ message: 'Restore document - TODO' });
});

export default router;
