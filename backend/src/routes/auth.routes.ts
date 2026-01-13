import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/login
router.post('/login', AuthController.login);

// POST /api/auth/logout
router.post('/logout', AuthController.logout);

// GET /api/auth/me (protected)
router.get('/me', authMiddleware, AuthController.me);

export default router;
