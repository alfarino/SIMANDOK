import { Router } from 'express';

const router = Router();

// POST /api/reminders/send-batch
router.post('/send-batch', (req, res) => {
    res.json({ message: 'Send batch reminder - TODO' });
});

// GET /api/reminders/pending-summary
router.get('/pending-summary', (req, res) => {
    res.json({ message: 'Get pending summary - TODO' });
});

// GET /api/reminders/logs
router.get('/logs', (req, res) => {
    res.json({ message: 'Get reminder logs - TODO' });
});

export default router;
