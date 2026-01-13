import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import DocumentApproval from '../entities/DocumentApproval';
import ApprovalHistory from '../entities/ApprovalHistory';
import User from '../entities/User';
import { AppError } from '../middleware/error.middleware';
import { ApprovalStatus, ActionType } from '../types/enums';

interface ArchiveFilters {
    uploadedBy?: number;
    archivedBy?: number;
    fromDate?: Date;
    toDate?: Date;
}

class ArchiveService {
    /**
     * Get archived documents
     */
    async getArchivedDocuments(filters?: ArchiveFilters): Promise<DocumentApproval[]> {
        const where: any = { is_archived: true };

        if (filters?.uploadedBy) {
            where.uploaded_by_user_id = filters.uploadedBy;
        }
        if (filters?.archivedBy) {
            where.archived_by_user_id = filters.archivedBy;
        }
        if (filters?.fromDate) {
            where.archived_at = { [Op.gte]: filters.fromDate };
        }
        if (filters?.toDate) {
            where.archived_at = { ...where.archived_at, [Op.lte]: filters.toDate };
        }

        return DocumentApproval.findAll({
            where,
            include: [
                { model: User, as: 'uploadedBy', attributes: ['id', 'full_name', 'email'] }
            ],
            order: [['archived_at', 'DESC']]
        });
    }

    /**
     * Archive a document (only completed or rejected documents)
     */
    async archiveDocument(documentId: number, userId: number, reason?: string): Promise<void> {
        const document = await DocumentApproval.findByPk(documentId);

        if (!document) {
            throw new AppError('Dokumen tidak ditemukan', 404, 'DOCUMENT_NOT_FOUND');
        }

        const archivableStatuses = [ApprovalStatus.SIAP_CETAK, ApprovalStatus.DITOLAK];
        if (!archivableStatuses.includes(document.approval_status)) {
            throw new AppError('Hanya dokumen yang sudah selesai atau ditolak yang dapat diarsipkan', 400, 'CANNOT_ARCHIVE');
        }

        const t = await sequelize.transaction();
        try {
            await document.update({
                is_archived: true,
                archived_at: new Date(),
                archived_by_user_id: userId
            }, { transaction: t });

            // Log to history
            await ApprovalHistory.create({
                document_id: documentId,
                action_by_user_id: userId,
                action_type: ActionType.ARCHIVED,
                from_status: document.approval_status,
                to_status: ApprovalStatus.ARCHIVED,
                remarks: reason
            }, { transaction: t });

            await t.commit();
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * Restore an archived document
     */
    async restoreDocument(documentId: number, userId: number): Promise<void> {
        const document = await DocumentApproval.findByPk(documentId);

        if (!document) {
            throw new AppError('Dokumen tidak ditemukan', 404, 'DOCUMENT_NOT_FOUND');
        }

        if (!document.is_archived) {
            throw new AppError('Dokumen tidak dalam arsip', 400, 'NOT_ARCHIVED');
        }

        const t = await sequelize.transaction();
        try {
            // Get the previous status from history
            const lastHistory = await ApprovalHistory.findOne({
                where: {
                    document_id: documentId,
                    action_type: ActionType.ARCHIVED
                },
                order: [['created_at', 'DESC']]
            });

            const previousStatus = lastHistory?.from_status as ApprovalStatus || ApprovalStatus.SIAP_CETAK;

            await document.update({
                is_archived: false,
                archived_at: undefined,
                archived_by_user_id: undefined,
                approval_status: previousStatus
            }, { transaction: t });

            // Log to history
            await ApprovalHistory.create({
                document_id: documentId,
                action_by_user_id: userId,
                action_type: ActionType.RESTORED,
                from_status: ApprovalStatus.ARCHIVED,
                to_status: previousStatus
            }, { transaction: t });

            await t.commit();
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * Get full audit trail for a document
     */
    async getAuditTrail(documentId: number): Promise<ApprovalHistory[]> {
        return ApprovalHistory.findAll({
            where: { document_id: documentId },
            include: [
                { model: User, as: 'actionBy', attributes: ['id', 'full_name'] }
            ],
            order: [['created_at', 'ASC']]
        });
    }
}

export default new ArchiveService();
