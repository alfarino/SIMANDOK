import { Router } from 'express';

// Import route modules
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import documentsRoutes from './documents.routes';
import approvalsRoutes from './approvals.routes';
import notificationsRoutes from './notifications.routes';
import remindersRoutes from './reminders.routes';
import archiveRoutes from './archive.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/documents', documentsRoutes);
router.use('/approvals', approvalsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/reminders', remindersRoutes);
router.use('/archive', archiveRoutes);
router.use('/dashboard', dashboardRoutes);

// API Info
router.get('/', (req, res) => {
    res.json({
        name: 'SIMANDOK API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            documents: '/api/documents',
            approvals: '/api/approvals',
            notifications: '/api/notifications',
            reminders: '/api/reminders',
            archive: '/api/archive',
            dashboard: '/api/dashboard'
        }
    });
});

export default router;
