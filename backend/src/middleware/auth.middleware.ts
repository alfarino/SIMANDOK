import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';
import { AppError } from './error.middleware';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                roleId: number;
            };
        }
    }
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Token tidak ditemukan', 401, 'NO_TOKEN');
        }

        const token = authHeader.split(' ')[1];
        const decoded = await AuthService.verifyToken(token);

        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

// Role-based access control middleware
export const requireRole = (...allowedRoleCodes: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            const user = await AuthService.getUserById(req.user.userId);

            if (!user.role || !allowedRoleCodes.includes(user.role.role_code)) {
                throw new AppError('Akses ditolak', 403, 'FORBIDDEN');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Require minimum hierarchy level
export const requireMinLevel = (minLevel: number) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
            }

            const user = await AuthService.getUserById(req.user.userId);

            if (!user.role || user.role.hierarchy_level < minLevel) {
                throw new AppError('Akses ditolak', 403, 'FORBIDDEN');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Staff only (role level 1) - for upload documents
export const requireStaffOnly = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const user = await AuthService.getUserById(req.user.userId);

        if (!user.role || user.role.hierarchy_level !== 1) {
            throw new AppError('Hanya Staff yang dapat mengupload dokumen', 403, 'STAFF_ONLY');
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Approvers only (role level > 1) - for reviewing documents
export const requireApprover = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const user = await AuthService.getUserById(req.user.userId);

        if (!user.role || user.role.hierarchy_level < 2) {
            throw new AppError('Hanya Approver yang dapat mereview dokumen', 403, 'APPROVER_ONLY');
        }

        next();
    } catch (error) {
        next(error);
    }
};
