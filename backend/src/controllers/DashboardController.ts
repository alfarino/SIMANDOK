import { Request, Response, NextFunction } from 'express';
import DocumentService from '../services/DocumentService';

class DashboardController {
    async getSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            const summary = await DocumentService.getDashboardSummary(userId);

            res.json({
                success: true,
                data: summary,
            });
        } catch (error) {
            next(error);
        }
    }

    async getGlobalStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await DocumentService.getGlobalStats();

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    async getBacklogByApprover(req: Request, res: Response, next: NextFunction) {
        try {
            const backlog = await DocumentService.getBacklogByApprover();

            res.json({
                success: true,
                data: backlog,
            });
        } catch (error) {
            next(error);
        }
    }

    async getPersonalStats(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const stats = await DocumentService.getPersonalStats(userId);

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    async getPending(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const documents = await DocumentService.getPendingForApprover(userId);

            res.json({
                success: true,
                data: documents,
            });
        } catch (error) {
            next(error);
        }
    }

    async getRecent(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const documents = await DocumentService.findAll({ uploadedBy: userId });

            // Get only 10 most recent
            const recent = documents.slice(0, 10);

            res.json({
                success: true,
                data: recent,
            });
        } catch (error) {
            next(error);
        }
    }

    async getWorkflowDistribution(req: Request, res: Response, next: NextFunction) {
        try {
            const distribution = await DocumentService.getWorkflowDistribution();

            res.json({
                success: true,
                data: distribution,
            });
        } catch (error) {
            next(error);
        }
    }

    async getStatusDistribution(req: Request, res: Response, next: NextFunction) {
        try {
            const distribution = await DocumentService.getStatusDistribution();

            res.json({
                success: true,
                data: distribution,
            });
        } catch (error) {
            next(error);
        }
    }

    async getApprovedByMe(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const documents = await DocumentService.getApprovedByUser(userId);

            res.json({
                success: true,
                data: documents
            });
        } catch (error) {
            next(error);
        }
    }

    async getRejectedByMe(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const documents = await DocumentService.getRejectedByUser(userId);

            res.json({
                success: true,
                data: documents
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new DashboardController();
