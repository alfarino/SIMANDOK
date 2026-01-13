import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';

class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email dan password wajib diisi'
                });
            }

            const result = await AuthService.login(email, password);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async me(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized'
                });
            }

            const user = await AuthService.getUserById(req.user.userId);

            res.json({
                success: true,
                data: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role ? {
                        id: user.role.id,
                        name: user.role.role_name,
                        code: user.role.role_code,
                        hierarchyLevel: user.role.hierarchy_level
                    } : null
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response) {
        // JWT is stateless, so logout is client-side
        res.json({
            success: true,
            message: 'Logout berhasil'
        });
    }
}

export default new AuthController();
