import { Request, Response, NextFunction } from 'express';
import NotificationService from '../services/NotificationService';

class NotificationController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const notifications = await NotificationService.getByUser(userId);

            res.json({
                success: true,
                data: notifications
            });
        } catch (error) {
            next(error);
        }
    }

    async getUnreadCount(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const count = await NotificationService.getUnreadCount(userId);

            res.json({
                success: true,
                unreadCount: count
            });
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            await NotificationService.markAsRead(parseInt(id), userId);

            res.json({
                success: true,
                message: 'Notifikasi ditandai sudah dibaca'
            });
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;

            await NotificationService.markAllAsRead(userId);

            res.json({
                success: true,
                message: 'Semua notifikasi ditandai sudah dibaca'
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new NotificationController();
