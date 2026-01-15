import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/users/roles - Get all roles (admin only)
router.get('/roles', requireAdmin, UserController.getRoles);

// GET /api/users/approvers - Get users who can be approvers
router.get('/approvers', UserController.getApprovers);

// GET /api/users - Get all users (admin only)
router.get('/', requireAdmin, UserController.getAll);

// POST /api/users - Create new user (admin only)
router.post('/', requireAdmin, UserController.create);

// GET /api/users/:id - Get user by ID
router.get('/:id', UserController.getById);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', requireAdmin, UserController.update);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', requireAdmin, UserController.delete);

export default router;
