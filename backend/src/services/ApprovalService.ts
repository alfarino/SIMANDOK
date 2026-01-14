import { Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import DocumentApproval from '../entities/DocumentApproval';
import DocumentApprover from '../entities/DocumentApprover';
import ApprovalHistory from '../entities/ApprovalHistory';
import User from '../entities/User';
import Role from '../entities/Role';
import { AppError } from '../middleware/error.middleware';
import { ApprovalStatus, ApproverStatus, ActionType } from '../types/enums';
import NotificationService from './NotificationService';
import HierarchyService from './HierarchyService';

class ApprovalService {
    /**
     * Set approvers for a document (auto-sorted by hierarchy)
     */
    async setApprovers(documentId: number, approverIds: number[], transaction?: Transaction): Promise<DocumentApprover[]> {
        // Sort approvers by hierarchy
        const sortedIds = await HierarchyService.sortUsersByHierarchy(approverIds);

        const approvers: DocumentApprover[] = [];
        for (let i = 0; i < sortedIds.length; i++) {
            const approver = await DocumentApprover.create({
                document_id: documentId,
                approver_user_id: sortedIds[i],
                sequence_order: i + 1,
                status: ApproverStatus.PENDING
            }, { transaction });
            approvers.push(approver);
        }

        // Update document total approvers
        await DocumentApproval.update(
            { total_approvers: sortedIds.length },
            { where: { id: documentId }, transaction }
        );

        return approvers;
    }

    /**
     * Submit document for approval (start the workflow)
     */
    async submitForApproval(documentId: number, userId: number): Promise<DocumentApproval> {
        const document = await DocumentApproval.findByPk(documentId, {
            include: [{ model: User, as: 'uploadedBy' }]
        });

        if (!document) {
            throw new AppError('Dokumen tidak ditemukan', 404, 'DOCUMENT_NOT_FOUND');
        }

        if (document.approval_status !== ApprovalStatus.DRAFT) {
            throw new AppError('Dokumen sudah disubmit', 400, 'ALREADY_SUBMITTED');
        }

        // Get first approver
        const firstApprover = await DocumentApprover.findOne({
            where: { document_id: documentId, sequence_order: 1 },
            include: [{ model: User, as: 'approver' }]
        });

        if (!firstApprover) {
            throw new AppError('Tidak ada approver yang dipilih', 400, 'NO_APPROVERS');
        }

        const t = await sequelize.transaction();
        try {
            // Update document status
            await document.update({
                approval_status: ApprovalStatus.DIAJUKAN,
                current_approver_id: firstApprover.approver_user_id,
                current_sequence: 1
            }, { transaction: t });

            // Log history
            await ApprovalHistory.create({
                document_id: documentId,
                action_by_user_id: userId,
                action_type: ActionType.SUBMITTED,
                from_status: ApprovalStatus.DRAFT,
                to_status: ApprovalStatus.DIAJUKAN
            }, { transaction: t });

            await t.commit();

            // Send notification to first approver
            await NotificationService.notifyNewDocument(
                documentId,
                document.document_name,
                firstApprover.approver_user_id
            );

            return document;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * Approve document
     */
    async approve(documentId: number, approverId: number, remarks?: string): Promise<DocumentApproval> {
        const document = await this.validateApproval(documentId, approverId);
        const approverRecord = await this.getApproverRecord(documentId, approverId);
        const approverUser = await User.findByPk(approverId);

        const t = await sequelize.transaction();
        try {
            // Update approver status
            await approverRecord.update({
                status: ApproverStatus.APPROVED,
                approved_at: new Date(),
                remarks
            }, { transaction: t });

            // Log history
            await ApprovalHistory.create({
                document_id: documentId,
                action_by_user_id: approverId,
                action_type: ActionType.APPROVED,
                from_status: document.approval_status,
                to_status: document.approval_status,
                remarks
            }, { transaction: t });

            // Check if there's a next approver
            const nextApprover = await DocumentApprover.findOne({
                where: {
                    document_id: documentId,
                    sequence_order: document.current_sequence + 1
                }
            });

            if (nextApprover) {
                // Move to next approver
                await document.update({
                    approval_status: ApprovalStatus.DIPERIKSA,
                    current_approver_id: nextApprover.approver_user_id,
                    current_sequence: document.current_sequence + 1
                }, { transaction: t });

                await t.commit();

                // Notify next approver
                await NotificationService.notifyNewDocument(
                    documentId,
                    document.document_name,
                    nextApprover.approver_user_id
                );

                // Notify uploader of progress
                await NotificationService.notifyApproved(
                    documentId,
                    document.document_name,
                    document.uploaded_by_user_id,
                    approverUser?.full_name || 'Approver'
                );
            } else {
                // All approved - document is ready
                await document.update({
                    approval_status: ApprovalStatus.SIAP_CETAK,
                    current_approver_id: undefined
                }, { transaction: t });

                await t.commit();

                // Notify uploader that document is ready
                await NotificationService.notifyReadyToPrint(
                    documentId,
                    document.document_name,
                    document.uploaded_by_user_id
                );
            }

            return await DocumentApproval.findByPk(documentId) as DocumentApproval;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * Reject document
     */
    async reject(documentId: number, approverId: number, reason: string): Promise<DocumentApproval> {
        const document = await this.validateApproval(documentId, approverId);
        const approverRecord = await this.getApproverRecord(documentId, approverId);
        const approverUser = await User.findByPk(approverId);

        if (!reason || reason.trim() === '') {
            throw new AppError('Alasan penolakan wajib diisi', 400, 'REASON_REQUIRED');
        }

        const t = await sequelize.transaction();
        try {
            // Update approver status
            await approverRecord.update({
                status: ApproverStatus.REJECTED,
                approved_at: new Date(),
                remarks: reason
            }, { transaction: t });

            // Update document status
            await document.update({
                approval_status: ApprovalStatus.DITOLAK,
                rejection_reason: reason,
                rejection_by_user_id: approverId,
                rejection_count: document.rejection_count + 1,
                current_approver_id: undefined
            }, { transaction: t });

            // Log history
            await ApprovalHistory.create({
                document_id: documentId,
                action_by_user_id: approverId,
                action_type: ActionType.REJECTED,
                from_status: document.approval_status,
                to_status: ApprovalStatus.DITOLAK,
                remarks: reason
            }, { transaction: t });

            await t.commit();

            // Notify uploader
            await NotificationService.notifyRejected(
                documentId,
                document.document_name,
                document.uploaded_by_user_id,
                approverUser?.full_name || 'Approver',
                reason
            );

            return await DocumentApproval.findByPk(documentId) as DocumentApproval;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * Get document history
     */
    async getHistory(documentId: number): Promise<ApprovalHistory[]> {
        return ApprovalHistory.findAll({
            where: { document_id: documentId },
            include: [
                { model: User, as: 'actionBy', attributes: ['id', 'full_name'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Get approvers for a document
     */
    async getApprovers(documentId: number): Promise<DocumentApprover[]> {
        return DocumentApprover.findAll({
            where: { document_id: documentId },
            include: [
                { model: User, as: 'approver', attributes: ['id', 'full_name', 'email'], include: [{ model: Role, as: 'role' }] }
            ],
            order: [['sequence_order', 'ASC']]
        });
    }

    // ========== Private Helpers ==========

    private async validateApproval(documentId: number, approverId: number): Promise<DocumentApproval> {
        const document = await DocumentApproval.findByPk(documentId);

        if (!document) {
            throw new AppError('Dokumen tidak ditemukan', 404, 'DOCUMENT_NOT_FOUND');
        }

        if (document.current_approver_id !== approverId) {
            throw new AppError('Anda bukan approver saat ini', 403, 'NOT_CURRENT_APPROVER');
        }

        const validStatuses = [ApprovalStatus.DIAJUKAN, ApprovalStatus.DIBUKA, ApprovalStatus.DIPERIKSA];
        if (!validStatuses.includes(document.approval_status)) {
            throw new AppError('Dokumen tidak dalam status yang dapat diapprove', 400, 'INVALID_STATUS');
        }

        return document;
    }

    private async getApproverRecord(documentId: number, approverId: number): Promise<DocumentApprover> {
        const record = await DocumentApprover.findOne({
            where: { document_id: documentId, approver_user_id: approverId }
        });

        if (!record) {
            throw new AppError('Anda bukan approver dokumen ini', 403, 'NOT_APPROVER');
        }

        return record;
    }
    /**
     * Mark document as viewed by approver (changes "Belum Dilihat" to "Sedang Direview")
     */
    async markAsViewed(documentId: number, approverId: number): Promise<DocumentApprover | null> {
        const approverRecord = await DocumentApprover.findOne({
            where: { document_id: documentId, approver_user_id: approverId }
        });

        if (!approverRecord) {
            return null;
        }

        // Only update if not already viewed
        if (!approverRecord.viewed_at) {
            await approverRecord.update({ viewed_at: new Date() });

            // Also update document status to DIBUKA if it was just submitted
            const document = await DocumentApproval.findByPk(documentId);
            if (document && document.approval_status === ApprovalStatus.DIAJUKAN) {
                await document.update({ approval_status: ApprovalStatus.DIBUKA });
            }
        }

        return approverRecord;
    }

    /**
     * Mark document as printed by Staff (SIAP_CETAK -> SUDAH_DICETAK)
     */
    async markAsPrinted(documentId: number, userId: number): Promise<DocumentApproval> {
        const document = await DocumentApproval.findByPk(documentId);

        if (!document) {
            throw new AppError('Dokumen tidak ditemukan', 404, 'DOCUMENT_NOT_FOUND');
        }

        if (document.approval_status !== ApprovalStatus.SIAP_CETAK) {
            throw new AppError('Dokumen belum siap cetak', 400, 'NOT_READY_TO_PRINT');
        }

        // Verify user is the uploader (Staff)
        if (document.uploaded_by_user_id !== userId) {
            throw new AppError('Hanya Staff yang mengupload yang dapat menandai sudah dicetak', 403, 'UNAUTHORIZED');
        }

        await document.update({
            approval_status: ApprovalStatus.SUDAH_DICETAK,
            printed_at: new Date(),
            printed_by_user_id: userId
        });

        // Log history
        await ApprovalHistory.create({
            document_id: documentId,
            action_by_user_id: userId,
            action_type: ActionType.PRINTED,
            from_status: ApprovalStatus.SIAP_CETAK,
            to_status: ApprovalStatus.SUDAH_DICETAK
        });

        return document;
    }

    /**
     * Resubmit a rejected document (Staff only)
     */
    async resubmitDocument(documentId: number, userId: number, remarks?: string): Promise<DocumentApproval> {
        const document = await DocumentApproval.findByPk(documentId);

        if (!document) {
            throw new AppError('Dokumen tidak ditemukan', 404, 'DOCUMENT_NOT_FOUND');
        }

        if (document.approval_status !== ApprovalStatus.DITOLAK) {
            throw new AppError('Hanya dokumen yang ditolak yang dapat diajukan ulang', 400, 'NOT_REJECTED');
        }

        // Verify user is the uploader (Staff)
        if (document.uploaded_by_user_id !== userId) {
            throw new AppError('Hanya Staff yang mengupload yang dapat mengajukan ulang', 403, 'UNAUTHORIZED');
        }

        const t = await sequelize.transaction();
        try {
            // Get first approver
            const firstApprover = await DocumentApprover.findOne({
                where: { document_id: documentId, sequence_order: 1 }
            });

            // Reset all approvers to PENDING
            await DocumentApprover.update(
                { status: ApproverStatus.PENDING, approved_at: undefined, remarks: undefined, viewed_at: undefined },
                { where: { document_id: documentId }, transaction: t }
            );

            // Update document status back to DIAJUKAN
            await document.update({
                approval_status: ApprovalStatus.DIAJUKAN,
                current_approver_id: firstApprover?.approver_user_id || undefined,
                current_sequence: 1,
                rejection_reason: undefined,
                rejection_by_user_id: undefined
            }, { transaction: t });

            // Log history with RESUBMITTED action
            await ApprovalHistory.create({
                document_id: documentId,
                action_by_user_id: userId,
                action_type: ActionType.RESUBMITTED,
                from_status: ApprovalStatus.DITOLAK,
                to_status: ApprovalStatus.DIAJUKAN,
                remarks: remarks
            }, { transaction: t });

            await t.commit();

            // Notify first approver
            if (firstApprover) {
                await NotificationService.notifyNewDocument(documentId, document.document_name, firstApprover.approver_user_id);
            }

            return document;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}

export default new ApprovalService();
