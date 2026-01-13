import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/users
router.get('/', UserController.getAll);

// GET /api/users/approvers
router.get('/approvers', UserController.getApprovers);

// GET /api/users/:id
router.get('/:id', UserController.getById);

// PUT /api/users/:id
router.put('/:id', UserController.update);

export default router;
