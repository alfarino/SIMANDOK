import { Request, Response, NextFunction } from 'express';
import EmailReminderService from '../services/EmailReminderService';
import { triggerReminderManually } from '../jobs/reminderCron';

class ReminderController {
    async sendBatch(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const logs = await triggerReminderManually(userId);

            res.json({
                success: true,
                message: `Reminder terkirim ke ${logs.length} approver`,
                data: logs
            });
        } catch (error) {
            next(error);
        }
    }

    async getPendingSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const summary = await EmailReminderService.getPendingDocumentsSummary();

            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            next(error);
        }
    }

    async getLogs(req: Request, res: Response, next: NextFunction) {
        try {
            const logs = await EmailReminderService.getLogs();

            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ReminderController();
