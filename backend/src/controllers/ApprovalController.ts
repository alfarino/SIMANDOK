import { Request, Response, NextFunction } from 'express';
import ApprovalService from '../services/ApprovalService';
import DocumentService from '../services/DocumentService';

class ApprovalController {
    async getPending(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const documents = await DocumentService.getPendingForApprover(userId);

            res.json({
                success: true,
                data: documents
            });
        } catch (error) {
            next(error);
        }
    }

    async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const { docId } = req.params;
            const { remarks } = req.body;
            const userId = req.user!.userId;

            const document = await ApprovalService.approve(parseInt(docId), userId, remarks);

            res.json({
                success: true,
                message: 'Dokumen berhasil disetujui',
                data: document
            });
        } catch (error) {
            next(error);
        }
    }

    async reject(req: Request, res: Response, next: NextFunction) {
        try {
            const { docId } = req.params;
            const { reason } = req.body;
            const userId = req.user!.userId;

            const document = await ApprovalService.reject(parseInt(docId), userId, reason);

            res.json({
                success: true,
                message: 'Dokumen ditolak',
                data: document
            });
        } catch (error) {
            next(error);
        }
    }

    async getApprovers(req: Request, res: Response, next: NextFunction) {
        try {
            const { docId } = req.params;
            const approvers = await ApprovalService.getApprovers(parseInt(docId));

            res.json({
                success: true,
                data: approvers
            });
        } catch (error) {
            next(error);
        }
    }

    async getHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { docId } = req.params;
            const history = await ApprovalService.getHistory(parseInt(docId));

            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            next(error);
        }
    }

    async setApprovers(req: Request, res: Response, next: NextFunction) {
        try {
            const { docId } = req.params;
            const { approverIds } = req.body;

            if (!approverIds || approverIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Minimal pilih 1 approver'
                });
            }

            const approvers = await ApprovalService.setApprovers(parseInt(docId), approverIds);

            res.json({
                success: true,
                data: approvers
            });
        } catch (error) {
            next(error);
        }
    }

    async submit(req: Request, res: Response, next: NextFunction) {
        try {
            const { docId } = req.params;
            const userId = req.user!.userId;

            const document = await ApprovalService.submitForApproval(parseInt(docId), userId);

            res.json({
                success: true,
                message: 'Dokumen berhasil disubmit untuk approval',
                data: document
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ApprovalController();
