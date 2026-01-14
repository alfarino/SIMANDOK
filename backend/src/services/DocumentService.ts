import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import DocumentApproval from '../entities/DocumentApproval';
import DocumentApprover from '../entities/DocumentApprover';
import User from '../entities/User';
import Role from '../entities/Role';
import { AppError } from '../middleware/error.middleware';
import { ApprovalStatus, ApproverStatus } from '../types/enums';

interface CreateDocumentDTO {
    documentName: string;
    description?: string;
    documentLink: string; // Link ke draft dokumen
    uploadedByUserId: number;
    approverIds: number[];
}

class DocumentService {
    async create(data: CreateDocumentDTO, autoSubmit: boolean = false) {
        const t = await sequelize.transaction();

        try {
            // Validate approvers exist and sort by hierarchy
            const approvers = await User.findAll({
                where: { id: data.approverIds },
                include: [{ model: Role, as: 'role' }],
            });

            if (data.approverIds.length > 0 && approvers.length !== data.approverIds.length) {
                throw new AppError('Beberapa approver tidak ditemukan', 400, 'INVALID_APPROVERS');
            }

            // Sort approvers by hierarchy level
            const sortedApprovers = approvers.sort((a, b) => (a.role?.hierarchy_level || 0) - (b.role?.hierarchy_level || 0));

            // Create document
            const document = await DocumentApproval.create(
                {
                    document_name: data.documentName,
                    document_description: data.description,
                    document_link: data.documentLink,
                    uploaded_by_user_id: data.uploadedByUserId,
                    approval_status: ApprovalStatus.DRAFT,
                    total_approvers: sortedApprovers.length,
                    current_sequence: 0,
                },
                { transaction: t }
            );

            // Create document_approvers entries with sequence
            for (let i = 0; i < sortedApprovers.length; i++) {
                await DocumentApprover.create(
                    {
                        document_id: document.id,
                        approver_user_id: sortedApprovers[i].id,
                        sequence_order: i + 1,
                        status: ApproverStatus.PENDING,
                    },
                    { transaction: t }
                );
            }

            // Auto-submit logic
            if (autoSubmit && sortedApprovers.length > 0) {
                const firstApprover = sortedApprovers[0];

                await document.update(
                    {
                        approval_status: ApprovalStatus.DIAJUKAN,
                        current_approver_id: firstApprover.id,
                        current_sequence: 1,
                    },
                    { transaction: t }
                );

                // We could also call NotificationService here if needed,
                // but usually ApprovalService.submitForApproval does more.
                // For simplicity and robustness, we do basic updates here
                // matching submit logic, or we could create an ApprovalHistory entry.
            }

            await t.commit();

            return {
                document: await document.reload(), // Reload to get updated status
                approvers: sortedApprovers.map((a, idx) => ({
                    userId: a.id,
                    fullName: a.full_name,
                    sequence: idx + 1,
                    roleCode: a.role?.role_code,
                })),
            };
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async findAll(filters?: { uploadedBy?: number; status?: ApprovalStatus }) {
        const where: any = { is_archived: false };

        if (filters?.uploadedBy) {
            where.uploaded_by_user_id = filters.uploadedBy;
        }
        if (filters?.status) {
            where.approval_status = filters.status;
        }

        return DocumentApproval.findAll({
            where,
            include: [
                { model: User, as: 'uploadedBy', attributes: ['id', 'full_name', 'email'] },
                { model: User, as: 'currentApprover', attributes: ['id', 'full_name', 'email'] },
            ],
            order: [['created_at', 'DESC']],
        });
    }

    async findById(id: number) {
        const document = await DocumentApproval.findByPk(id, {
            include: [
                { model: User, as: 'uploadedBy', attributes: ['id', 'full_name', 'email'] },
                { model: User, as: 'currentApprover', attributes: ['id', 'full_name', 'email'] },
            ],
        });

        if (!document) {
            throw new AppError('Dokumen tidak ditemukan', 404, 'DOCUMENT_NOT_FOUND');
        }

        return document;
    }

    async update(id: number, data: Partial<DocumentApproval>) {
        const document = await this.findById(id);
        await document.update(data);
        return this.findById(id);
    }

    async submit(id: number, firstApproverId: number) {
        const document = await this.findById(id);

        if (document.approval_status !== ApprovalStatus.DRAFT) {
            throw new AppError('Dokumen sudah disubmit', 400, 'ALREADY_SUBMITTED');
        }

        await document.update({
            approval_status: ApprovalStatus.DIAJUKAN,
            current_approver_id: firstApproverId,
            current_sequence: 1,
        });

        return this.findById(id);
    }

    async getPendingForApprover(approverId: number) {
        return DocumentApproval.findAll({
            where: {
                current_approver_id: approverId,
                approval_status: {
                    [Op.in]: [ApprovalStatus.DIAJUKAN, ApprovalStatus.DIBUKA, ApprovalStatus.DIPERIKSA],
                },
                is_archived: false,
            },
            include: [{ model: User, as: 'uploadedBy', attributes: ['id', 'full_name', 'email'] }],
            order: [['created_at', 'ASC']],
        });
    }

    async getDashboardSummary(userId?: number) {
        const baseWhere: any = { is_archived: false };
        if (userId) {
            baseWhere.uploaded_by_user_id = userId;
        }

        const [total, pending, approved, rejected] = await Promise.all([
            DocumentApproval.count({ where: baseWhere }),
            DocumentApproval.count({
                where: {
                    ...baseWhere,
                    approval_status: { [Op.in]: [ApprovalStatus.DIAJUKAN, ApprovalStatus.DIBUKA, ApprovalStatus.DIPERIKSA] },
                },
            }),
            DocumentApproval.count({
                where: { ...baseWhere, approval_status: ApprovalStatus.SIAP_CETAK },
            }),
            DocumentApproval.count({
                where: { ...baseWhere, approval_status: ApprovalStatus.DITOLAK },
            }),
        ]);

        return { total, pending, approved, rejected };
    }

    /**
     * Get global stats for all documents (admin view)
     */
    async getGlobalStats() {
        const [total, pending, approved, rejected] = await Promise.all([
            DocumentApproval.count({ where: { is_archived: false } }),
            DocumentApproval.count({
                where: {
                    is_archived: false,
                    approval_status: { [Op.in]: [ApprovalStatus.DIAJUKAN, ApprovalStatus.DIBUKA, ApprovalStatus.DIPERIKSA] },
                },
            }),
            DocumentApproval.count({
                where: {
                    is_archived: false,
                    approval_status: { [Op.in]: [ApprovalStatus.SIAP_CETAK, ApprovalStatus.SUDAH_DICETAK] },
                },
            }),
            DocumentApproval.count({
                where: {
                    is_archived: false,
                    approval_status: ApprovalStatus.DITOLAK,
                },
            }),
        ]);

        return { total, pending, approved, rejected };
    }

    /**
     * Get backlog grouped by approver (for chart)
     */
    async getBacklogByApprover() {
        const pendingDocs = await DocumentApproval.findAll({
            where: {
                is_archived: false,
                approval_status: { [Op.in]: [ApprovalStatus.DIAJUKAN, ApprovalStatus.DIBUKA, ApprovalStatus.DIPERIKSA] },
            },
            include: [{ model: User, as: 'currentApprover', attributes: ['id', 'full_name'] }],
        });

        // Group by approver
        const grouped: Map<number, { name: string; count: number }> = new Map();
        for (const doc of pendingDocs) {
            if (doc.current_approver_id && doc.currentApprover) {
                const id = doc.current_approver_id;
                if (!grouped.has(id)) {
                    grouped.set(id, { name: doc.currentApprover.full_name, count: 0 });
                }
                grouped.get(id)!.count++;
            }
        }

        return Array.from(grouped.entries())
            .map(([id, data]) => ({ approverId: id, name: data.name, pendingCount: data.count }))
            .sort((a, b) => b.pendingCount - a.pendingCount);
    }

    /**
     * Get personal stats for approver
     */
    async getPersonalStats(userId: number) {
        const [pendingForMe, approvedByMe, rejectedByMeActive] = await Promise.all([
            // Dokumen yang pending untuk user ini
            DocumentApproval.count({
                where: {
                    current_approver_id: userId,
                    is_archived: false,
                    approval_status: { [Op.in]: [ApprovalStatus.DIAJUKAN, ApprovalStatus.DIBUKA, ApprovalStatus.DIPERIKSA] },
                },
            }),
            // Dokumen yang sudah di-approve oleh user (via DocumentApprover)
            // For now, count via history would be more accurate but complex
            // Using DocumentApprover table
            0, // Will be updated via ApprovalHistory
            // Dokumen yang masih dalam status DITOLAK dan ditolak oleh user ini
            DocumentApproval.count({
                where: {
                    rejection_by_user_id: userId,
                    approval_status: ApprovalStatus.DITOLAK,
                    is_archived: false,
                },
            }),
        ]);

        return {
            pendingForMe,
            approvedByMe,
            rejectedByMeActive, // Only count docs still in DITOLAK status
        };
    }
    /**
     * Get documents ready to print for Staff (their own uploads)
     */
    async getReadyToPrint(userId: number) {
        return DocumentApproval.findAll({
            where: {
                uploaded_by_user_id: userId,
                approval_status: { [Op.in]: [ApprovalStatus.SIAP_CETAK, ApprovalStatus.SUDAH_DICETAK] },
                is_archived: false,
            },
            include: [{ model: User, as: 'uploadedBy', attributes: ['id', 'full_name', 'email'] }],
            order: [['updated_at', 'DESC']],
        });
    }

    /**
     * Get documents by status (for archive page, all documents page etc)
     */
    async findByStatus(status: ApprovalStatus | ApprovalStatus[]) {
        const statusArr = Array.isArray(status) ? status : [status];
        return DocumentApproval.findAll({
            where: {
                approval_status: { [Op.in]: statusArr },
                is_archived: false,
            },
            include: [
                { model: User, as: 'uploadedBy', attributes: ['id', 'full_name', 'email'] },
                { model: User, as: 'currentApprover', attributes: ['id', 'full_name', 'email'] },
            ],
            order: [['updated_at', 'DESC']],
        });
    }

    /**
     * Get document approval history for journey display
     */
    async getDocumentHistory(documentId: number) {
        const ApprovalHistory = (await import('../entities/ApprovalHistory')).default;

        return ApprovalHistory.findAll({
            where: { document_id: documentId },
            include: [{ model: User, as: 'actionBy', attributes: ['id', 'full_name', 'email'] }],
            order: [['created_at', 'ASC']],
        });
    }

    /**
     * Get workflow distribution by hierarchy level (for chart)
     * Groups pending documents by approver's role hierarchy level
     */
    async getWorkflowDistribution() {
        const pendingDocs = await DocumentApproval.findAll({
            where: {
                is_archived: false,
                approval_status: { [Op.in]: [ApprovalStatus.DIAJUKAN, ApprovalStatus.DIBUKA, ApprovalStatus.DIPERIKSA] },
            },
            include: [
                {
                    model: User,
                    as: 'currentApprover',
                    attributes: ['id', 'full_name'],
                    include: [{ model: Role, as: 'role', attributes: ['role_name', 'hierarchy_level'] }],
                },
            ],
        });

        // Group by hierarchy level
        const levelCounts: Map<number, { roleName: string; count: number }> = new Map();

        for (const doc of pendingDocs) {
            if (doc.currentApprover?.role) {
                const level = doc.currentApprover.role.hierarchy_level;
                const roleName = doc.currentApprover.role.role_name;

                if (!levelCounts.has(level)) {
                    levelCounts.set(level, { roleName, count: 0 });
                }
                levelCounts.get(level)!.count++;
            }
        }

        // Sort by hierarchy level and return
        return Array.from(levelCounts.entries())
            .map(([level, data]) => ({
                hierarchyLevel: level,
                roleName: data.roleName,
                pendingCount: data.count,
            }))
            .sort((a, b) => a.hierarchyLevel - b.hierarchyLevel);
    }

    /**
     * Get status distribution for all documents (for doughnut chart)
     * Returns count per approval status grouped by approver level for in-review documents
     */
    async getStatusDistribution() {
        const result: Array<{ status: string; label: string; count: number; hierarchyLevel?: number }> = [];

        // Get documents in review grouped by approver level
        const pendingDocs = await DocumentApproval.findAll({
            where: {
                is_archived: false,
                approval_status: { [Op.in]: [ApprovalStatus.DIAJUKAN, ApprovalStatus.DIBUKA, ApprovalStatus.DIPERIKSA] },
            },
            include: [
                {
                    model: User,
                    as: 'currentApprover',
                    attributes: ['id', 'full_name'],
                    include: [{ model: Role, as: 'role', attributes: ['role_name', 'hierarchy_level'] }],
                },
            ],
        });

        // Group pending documents by hierarchy level
        const levelCounts: Map<number, { roleName: string; count: number }> = new Map();

        for (const doc of pendingDocs) {
            if (doc.currentApprover?.role) {
                const level = doc.currentApprover.role.hierarchy_level;
                const roleName = doc.currentApprover.role.role_name;

                if (!levelCounts.has(level)) {
                    levelCounts.set(level, { roleName, count: 0 });
                }
                levelCounts.get(level)!.count++;
            }
        }

        // Add grouped pending documents by level
        Array.from(levelCounts.entries())
            .sort((a, b) => a[0] - b[0])
            .forEach(([level, data]) => {
                result.push({
                    status: `IN_REVIEW_LEVEL_${level}`,
                    label: `Direview ${data.roleName}`,
                    count: data.count,
                    hierarchyLevel: level,
                });
            });

        // Count approved documents (SIAP_CETAK + SUDAH_DICETAK)
        const approvedCount = await DocumentApproval.count({
            where: {
                approval_status: { [Op.in]: [ApprovalStatus.SIAP_CETAK, ApprovalStatus.SUDAH_DICETAK] },
                is_archived: false,
            },
        });

        if (approvedCount > 0) {
            result.push({
                status: 'APPROVED',
                label: 'Selesai Disetujui',
                count: approvedCount,
            });
        }

        // Count rejected documents
        const rejectedCount = await DocumentApproval.count({
            where: {
                approval_status: ApprovalStatus.DITOLAK,
                is_archived: false,
            },
        });

        if (rejectedCount > 0) {
            result.push({
                status: 'REJECTED',
                label: 'Perlu Revisi',
                count: rejectedCount,
            });
        }

        // Count draft documents
        const draftCount = await DocumentApproval.count({
            where: {
                approval_status: ApprovalStatus.DRAFT,
                is_archived: false,
            },
        });

        if (draftCount > 0) {
            result.push({
                status: 'DRAFT',
                label: 'Draft',
                count: draftCount,
            });
        }

        return result.filter((item) => item.count > 0);
    }
}

export default new DocumentService();
