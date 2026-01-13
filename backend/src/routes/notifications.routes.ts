import { Router } from 'express';

const router = Router();

// GET /api/notifications
router.get('/', (req, res) => {
    res.json({ message: 'List notifications - TODO' });
});

// GET /api/notifications/unread-count
router.get('/unread-count', (req, res) => {
    res.json({ unreadCount: 0 });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', (req, res) => {
    res.json({ message: 'Mark as read - TODO' });
});

// PUT /api/notifications/read-all
router.put('/read-all', (req, res) => {
    res.json({ message: 'Mark all as read - TODO' });
});

export default router;
