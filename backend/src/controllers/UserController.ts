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

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password, fullName, roleId, team, phone } = req.body;

            const user = await UserService.create({
                username,
                email,
                password,
                fullName,
                roleId,
                team,
                phone
            });

            res.status(201).json({
                success: true,
                data: user
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

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await UserService.delete(parseInt(id));
            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    async getRoles(req: Request, res: Response, next: NextFunction) {
        try {
            const roles = await UserService.getRoles();
            res.json({
                success: true,
                data: roles
            });
        } catch (error) {
            next(error);
        }
    }

    async getApprovers(req: Request, res: Response, next: NextFunction) {
        try {
            const approvers = await UserService.getApprovers();

            res.json({
                success: true,
                data: approvers.map(u => ({
                    id: u.id,
                    full_name: u.full_name,
                    email: u.email,
                    team: u.team,
                    role: u.role ? {
                        id: u.role.id,
                        role_name: u.role.role_name,
                        role_code: u.role.role_code,
                        hierarchy_level: u.role.hierarchy_level
                    } : null
                }))
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
