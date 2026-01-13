import { Op } from 'sequelize';
import DocumentApproval from '../entities/DocumentApproval';
import User from '../entities/User';
import Role from '../entities/Role';
import { AppError } from '../middleware/error.middleware';
import { ApprovalStatus } from '../types/enums';

interface CreateDocumentDTO {
    documentName: string;
    description?: string;
    documentLink: string;  // Link ke draft dokumen
    uploadedByUserId: number;
    approverIds: number[];
}

class DocumentService {
    async create(data: CreateDocumentDTO) {
        // Validate approvers exist and sort by hierarchy
        const approvers = await User.findAll({
            where: { id: data.approverIds },
            include: [{ model: Role, as: 'role' }]
        });

        if (approvers.length !== data.approverIds.length) {
            throw new AppError('Beberapa approver tidak ditemukan', 400, 'INVALID_APPROVERS');
        }

        // Sort approvers by hierarchy level
        const sortedApprovers = approvers.sort(
            (a, b) => (a.role?.hierarchy_level || 0) - (b.role?.hierarchy_level || 0)
        );

        // Create document
        const document = await DocumentApproval.create({
            document_name: data.documentName,
            document_description: data.description,
            document_link: data.documentLink,
            uploaded_by_user_id: data.uploadedByUserId,
            approval_status: ApprovalStatus.DRAFT,
            total_approvers: sortedApprovers.length,
            current_sequence: 0
        });

        return {
            document,
            approvers: sortedApprovers.map((a, idx) => ({
                userId: a.id,
                fullName: a.full_name,
                sequence: idx + 1,
                roleCode: a.role?.role_code
            }))
        };
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
                { model: User, as: 'currentApprover', attributes: ['id', 'full_name', 'email'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async findById(id: number) {
        const document = await DocumentApproval.findByPk(id, {
            include: [
                { model: User, as: 'uploadedBy', attributes: ['id', 'full_name', 'email'] },
                { model: User, as: 'currentApprover', attributes: ['id', 'full_name', 'email'] }
            ]
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
            current_sequence: 1
        });

        return this.findById(id);
    }

    async getPendingForApprover(approverId: number) {
        return DocumentApproval.findAll({
            where: {
                current_approver_id: approverId,
                approval_status: {
                    [Op.in]: [ApprovalStatus.DIAJUKAN, ApprovalStatus.DIBUKA, ApprovalStatus.DIPERIKSA]
                },
                is_archived: false
            },
            include: [
                { model: User, as: 'uploadedBy', attributes: ['id', 'full_name', 'email'] }
            ],
            order: [['created_at', 'ASC']]
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
                    approval_status: { [Op.in]: [ApprovalStatus.DIAJUKAN, ApprovalStatus.DIBUKA, ApprovalStatus.DIPERIKSA] }
                }
            }),
            DocumentApproval.count({
                where: { ...baseWhere, approval_status: ApprovalStatus.SIAP_CETAK }
            }),
            DocumentApproval.count({
                where: { ...baseWhere, approval_status: ApprovalStatus.DITOLAK }
            })
        ]);

        return { total, pending, approved, rejected };
    }
}

export default new DocumentService();
