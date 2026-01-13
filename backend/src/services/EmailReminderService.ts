import { Op } from 'sequelize';
import DocumentApproval from '../entities/DocumentApproval';
import User from '../entities/User';
import Role from '../entities/Role';
import EmailReminderLog from '../entities/EmailReminderLog';
import { createTransporter, getEmailFrom } from '../config/email';
import { ApprovalStatus } from '../types/enums';

interface PendingDocsSummary {
    approverUserId: number;
    approverName: string;
    approverEmail: string;
    documentCount: number;
    documentIds: number[];
    documentNames: string[];
}

class EmailReminderService {
    /**
     * Get summary of pending documents grouped by approver
     */
    async getPendingDocumentsSummary(): Promise<PendingDocsSummary[]> {
        const pendingDocs = await DocumentApproval.findAll({
            where: {
                approval_status: {
                    [Op.in]: [ApprovalStatus.DIAJUKAN, ApprovalStatus.DIBUKA, ApprovalStatus.DIPERIKSA]
                },
                is_archived: false
            },
            include: [
                { model: User, as: 'currentApprover', attributes: ['id', 'full_name', 'email'] }
            ]
        });

        // Group by approver
        const grouped: Map<number, PendingDocsSummary> = new Map();

        for (const doc of pendingDocs) {
            if (!doc.current_approver_id || !doc.currentApprover) continue;

            const approverId = doc.current_approver_id;

            if (!grouped.has(approverId)) {
                grouped.set(approverId, {
                    approverUserId: approverId,
                    approverName: doc.currentApprover.full_name,
                    approverEmail: doc.currentApprover.email,
                    documentCount: 0,
                    documentIds: [],
                    documentNames: []
                });
            }

            const summary = grouped.get(approverId)!;
            summary.documentCount++;
            summary.documentIds.push(doc.id);
            summary.documentNames.push(doc.document_name);
        }

        return Array.from(grouped.values());
    }

    /**
     * Send batch reminder emails to all approvers with pending documents
     */
    async sendBatchReminder(sentByUserId?: number): Promise<EmailReminderLog[]> {
        const transporter = createTransporter();
        if (!transporter) {
            console.warn('Email not configured, skipping batch reminder');
            return [];
        }

        const summaries = await this.getPendingDocumentsSummary();
        const logs: EmailReminderLog[] = [];

        for (const summary of summaries) {
            try {
                const subject = `[SIMANDOK] Anda memiliki ${summary.documentCount} dokumen menunggu persetujuan`;
                const html = this.generateEmailContent(summary);

                await transporter.sendMail({
                    from: getEmailFrom(),
                    to: summary.approverEmail,
                    subject,
                    html
                });

                // Log the reminder
                const log = await EmailReminderLog.create({
                    sent_to_user_id: summary.approverUserId,
                    sent_by_user_id: sentByUserId,
                    reminder_type: sentByUserId ? 'MANUAL' : 'AUTO',
                    total_documents: summary.documentCount,
                    document_ids: summary.documentIds,
                    email_subject: subject,
                    email_sent_at: new Date()
                });

                logs.push(log);
                console.log(`✉️ Reminder sent to ${summary.approverName} (${summary.documentCount} docs)`);
            } catch (error) {
                console.error(`Failed to send reminder to ${summary.approverEmail}:`, error);
            }
        }

        return logs;
    }

    /**
     * Get reminder logs
     */
    async getLogs(limit: number = 50): Promise<EmailReminderLog[]> {
        return EmailReminderLog.findAll({
            include: [
                { model: User, as: 'sentTo', attributes: ['id', 'full_name', 'email'] },
                { model: User, as: 'sentBy', attributes: ['id', 'full_name'] }
            ],
            order: [['created_at', 'DESC']],
            limit
        });
    }

    /**
     * Generate email HTML content
     */
    private generateEmailContent(summary: PendingDocsSummary): string {
        const docList = summary.documentNames
            .map((name, i) => `<li>${name}</li>`)
            .join('');

        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1565c0;">📋 Pengingat Dokumen SIMANDOK</h2>
        
        <p>Yth. <strong>${summary.approverName}</strong>,</p>
        
        <p>Anda memiliki <strong>${summary.documentCount} dokumen</strong> yang menunggu persetujuan:</p>
        
        <ul style="background: #f5f5f5; padding: 20px 40px; border-radius: 8px;">
          ${docList}
        </ul>
        
        <p>Silakan login ke SIMANDOK untuk meninjau dan menyetujui dokumen tersebut.</p>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
           style="display: inline-block; background: #1565c0; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Buka SIMANDOK
        </a>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">
        
        <p style="color: #666; font-size: 12px;">
          Email ini dikirim otomatis oleh sistem SIMANDOK.<br>
          Jangan balas email ini.
        </p>
      </div>
    `;
    }
}

export default new EmailReminderService();
