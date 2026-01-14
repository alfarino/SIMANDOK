import { Request, Response, NextFunction } from 'express';
import DocumentService from '../services/DocumentService';
import ApprovalService from '../services/ApprovalService';

class DocumentController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, uploadedBy } = req.query;
            const documents = await DocumentService.findAll({
                uploadedBy: uploadedBy ? parseInt(uploadedBy as string) : undefined,
                status: status as any
            });

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
            const document = await DocumentService.findById(parseInt(id));

            res.json({
                success: true,
                data: document
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { documentName, documentDescription, description, documentLink, approverIds } = req.body;
            const uploadedByUserId = req.user!.userId;

            // Support both 'description' and 'documentDescription'
            const desc = documentDescription || description;

            if (!documentName) {
                return res.status(400).json({
                    success: false,
                    error: 'Nama dokumen wajib diisi'
                });
            }

            if (!documentLink) {
                return res.status(400).json({
                    success: false,
                    error: 'Link dokumen wajib diisi'
                });
            }

            const result = await DocumentService.create({
                documentName,
                description: desc,
                documentLink,
                uploadedByUserId,
                approverIds: approverIds || []
            }, true); // autoSubmit = true

            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const document = await DocumentService.update(parseInt(id), req.body);

            res.json({
                success: true,
                data: document
            });
        } catch (error) {
            next(error);
        }
    }

    async submit(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { firstApproverId } = req.body;

            const document = await DocumentService.submit(parseInt(id), firstApproverId);

            res.json({
                success: true,
                message: 'Dokumen berhasil disubmit untuk approval',
                data: document
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyDocuments(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const documents = await DocumentService.findAll({ uploadedBy: userId });

            res.json({
                success: true,
                data: documents
            });
        } catch (error) {
            next(error);
        }
    }

    async getPendingApprovals(req: Request, res: Response, next: NextFunction) {
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

    async getReadyToPrint(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const documents = await DocumentService.getReadyToPrint(userId);

            res.json({
                success: true,
                data: documents
            });
        } catch (error) {
            next(error);
        }
    }

    async markAsViewed(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            await ApprovalService.markAsViewed(parseInt(id), userId);

            res.json({
                success: true,
                message: 'Dokumen ditandai sudah dilihat'
            });
        } catch (error) {
            next(error);
        }
    }

    async markAsPrinted(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user!.userId;

            const document = await ApprovalService.markAsPrinted(parseInt(id), userId);

            res.json({
                success: true,
                message: 'Dokumen ditandai sudah dicetak',
                data: document
            });
        } catch (error) {
            next(error);
        }
    }

    async resubmit(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { remarks } = req.body;
            const userId = req.user!.userId;

            const document = await ApprovalService.resubmitDocument(parseInt(id), userId, remarks);

            res.json({
                success: true,
                message: 'Dokumen berhasil diajukan ulang',
                data: document
            });
        } catch (error) {
            next(error);
        }
    }

    async getHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const history = await DocumentService.getDocumentHistory(parseInt(id));

            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new DocumentController();
