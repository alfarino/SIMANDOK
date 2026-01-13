import Notification from '../entities/Notification';
import User from '../entities/User';
import DocumentApproval from '../entities/DocumentApproval';
import { NotificationType } from '../types/enums';

class NotificationService {
    /**
     * Create a new notification
     */
    async create(
        recipientUserId: number,
        type: NotificationType,
        title: string,
        message?: string,
        documentId?: number
    ): Promise<Notification> {
        return Notification.create({
            recipient_user_id: recipientUserId,
            notification_type: type,
            title,
            message,
            document_id: documentId
        });
    }

    /**
     * Get all notifications for a user
     */
    async getByUser(userId: number, limit: number = 50): Promise<Notification[]> {
        return Notification.findAll({
            where: { recipient_user_id: userId },
            include: [
                { model: DocumentApproval, as: 'document', attributes: ['id', 'document_name'] }
            ],
            order: [['created_at', 'DESC']],
            limit
        });
    }

    /**
     * Get unread notifications for a user
     */
    async getUnreadByUser(userId: number): Promise<Notification[]> {
        return Notification.findAll({
            where: { recipient_user_id: userId, is_read: false },
            include: [
                { model: DocumentApproval, as: 'document', attributes: ['id', 'document_name'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Get unread count
     */
    async getUnreadCount(userId: number): Promise<number> {
        return Notification.count({
            where: { recipient_user_id: userId, is_read: false }
        });
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: number, userId: number): Promise<void> {
        await Notification.update(
            { is_read: true, read_at: new Date() },
            { where: { id: notificationId, recipient_user_id: userId } }
        );
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId: number): Promise<void> {
        await Notification.update(
            { is_read: true, read_at: new Date() },
            { where: { recipient_user_id: userId, is_read: false } }
        );
    }

    // ========== Notification Helpers ==========

    /**
     * Notify approver of new document to review
     */
    async notifyNewDocument(documentId: number, documentName: string, approverId: number): Promise<void> {
        await this.create(
            approverId,
            NotificationType.NEW_DOCUMENT,
            'Dokumen Baru untuk Disetujui',
            `Anda memiliki dokumen baru "${documentName}" yang perlu direview.`,
            documentId
        );
    }

    /**
     * Notify uploader that document was approved
     */
    async notifyApproved(documentId: number, documentName: string, uploaderId: number, approverName: string): Promise<void> {
        await this.create(
            uploaderId,
            NotificationType.APPROVED,
            'Dokumen Disetujui',
            `Dokumen "${documentName}" telah disetujui oleh ${approverName}.`,
            documentId
        );
    }

    /**
     * Notify uploader that document was rejected
     */
    async notifyRejected(documentId: number, documentName: string, uploaderId: number, approverName: string, reason: string): Promise<void> {
        await this.create(
            uploaderId,
            NotificationType.REJECTED,
            'Dokumen Ditolak',
            `Dokumen "${documentName}" ditolak oleh ${approverName}. Alasan: ${reason}`,
            documentId
        );
    }

    /**
     * Notify uploader that document is ready to print (all approved)
     */
    async notifyReadyToPrint(documentId: number, documentName: string, uploaderId: number): Promise<void> {
        await this.create(
            uploaderId,
            NotificationType.READY_TO_PRINT,
            'Dokumen Siap Cetak',
            `Dokumen "${documentName}" telah disetujui oleh semua approver dan siap untuk dicetak.`,
            documentId
        );
    }
}

export default new NotificationService();
