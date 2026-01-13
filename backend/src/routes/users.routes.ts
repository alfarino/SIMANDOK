import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authMiddleware, requireMinLevel } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/users/roles - Get all roles (admin only)
router.get('/roles', requireMinLevel(4), UserController.getRoles);

// GET /api/users/approvers - Get users who can be approvers
router.get('/approvers', UserController.getApprovers);

// GET /api/users - Get all users (admin only)
router.get('/', requireMinLevel(4), UserController.getAll);

// POST /api/users - Create new user (admin only)
router.post('/', requireMinLevel(4), UserController.create);

// GET /api/users/:id - Get user by ID
router.get('/:id', UserController.getById);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', requireMinLevel(4), UserController.update);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', requireMinLevel(4), UserController.delete);

export default router;
