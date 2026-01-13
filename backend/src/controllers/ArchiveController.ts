import { Request, Response, NextFunction } from 'express';
import ArchiveService from '../services/ArchiveService';

class ArchiveController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const documents = await ArchiveService.getArchivedDocuments();

            res.json({
                success: true,
                data: documents
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            // For archived docs, we can reuse DocumentService
            const documents = await ArchiveService.getArchivedDocuments();
            const document = documents.find(d => d.id === parseInt(id));

            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Dokumen arsip tidak ditemukan'
                });
            }

            res.json({
                success: true,
                data: document
            });
        } catch (error) {
            next(error);
        }
    }

    async archive(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const userId = req.user!.userId;

            await ArchiveService.archiveDocument(parseInt(id), userId, reason);

            res.json({
                success: true,
                message: 'Dokumen berhasil diarsipkan'
            });
        } catch (error) {
            next(error);
        }
    }

    async restore(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            await ArchiveService.restoreDocument(parseInt(id), userId);

            res.json({
                success: true,
                message: 'Dokumen berhasil dipulihkan dari arsip'
            });
        } catch (error) {
            next(error);
        }
    }

    async getAuditTrail(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const history = await ArchiveService.getAuditTrail(parseInt(id));

            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ArchiveController();
