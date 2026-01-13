import { Router } from 'express';

const router = Router();

// GET /api/dashboard/summary
router.get('/summary', (req, res) => {
    res.json({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
});

// GET /api/dashboard/pending
router.get('/pending', (req, res) => {
    res.json({ data: [] });
});

// GET /api/dashboard/recent
router.get('/recent', (req, res) => {
    res.json({ data: [] });
});

export default router;
