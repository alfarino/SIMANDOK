import { Request, Response, NextFunction } from 'express';
import UserService from '../services/UserService';

class UserController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await UserService.findAll();
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await UserService.findById(parseInt(id));
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async getApprovers(req: Request, res: Response, next: NextFunction) {
        try {
            const approvers = await UserService.getApprovers();

            // Group by role level
            const grouped = approvers.reduce((acc, user) => {
                const roleCode = user.role?.role_code || 'A';
                if (!acc[roleCode]) acc[roleCode] = [];
                acc[roleCode].push({
                    id: user.id,
                    fullName: user.full_name,
                    email: user.email,
                    team: user.team,
                    role: user.role ? {
                        id: user.role.id,
                        name: user.role.role_name,
                        code: user.role.role_code,
                        hierarchyLevel: user.role.hierarchy_level
                    } : null
                });
                return acc;
            }, {} as Record<string, any[]>);

            res.json({
                success: true,
                data: {
                    grouped,
                    list: approvers.map(u => ({
                        id: u.id,
                        fullName: u.full_name,
                        roleCode: u.role?.role_code,
                        hierarchyLevel: u.role?.hierarchy_level
                    }))
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await UserService.update(parseInt(id), req.body);
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
