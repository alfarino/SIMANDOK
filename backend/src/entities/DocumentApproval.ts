import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import { ApprovalStatus } from '../types/enums';

export interface DocumentApprovalAttributes {
    id?: number;
    document_name: string;
    document_description?: string;
    uploaded_by_user_id: number;
    document_link: string;  // Link ke draft dokumen (Google Docs, OneDrive, dll)
    approval_status?: ApprovalStatus;
    current_approver_id?: number;
    current_sequence?: number;
    total_approvers?: number;
    rejection_reason?: string;
    rejection_by_user_id?: number;
    rejection_count?: number;
    is_archived?: boolean;
    archived_at?: Date;
    archived_by_user_id?: number;
    printed_at?: Date;
    printed_by_user_id?: number;
    version?: number;
    created_at?: Date;
    updated_at?: Date;
}

class DocumentApproval extends Model<DocumentApprovalAttributes> implements DocumentApprovalAttributes {
    public id!: number;
    public document_name!: string;
    public document_description?: string;
    public uploaded_by_user_id!: number;
    public document_link!: string;
    public approval_status!: ApprovalStatus;
    public current_approver_id?: number;
    public current_sequence!: number;
    public total_approvers!: number;
    public rejection_reason?: string;
    public rejection_by_user_id?: number;
    public rejection_count!: number;
    public is_archived!: boolean;
    public archived_at?: Date;
    public archived_by_user_id?: number;
    public printed_at?: Date;
    public printed_by_user_id?: number;
    public version!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Associations
    public uploadedBy?: User;
    public currentApprover?: User;
}

DocumentApproval.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        document_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        document_description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        uploaded_by_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        document_link: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        approval_status: {
            type: DataTypes.ENUM(...Object.values(ApprovalStatus)),
            defaultValue: ApprovalStatus.DRAFT
        },
        current_approver_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users', key: 'id' }
        },
        current_sequence: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_approvers: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        rejection_reason: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        rejection_by_user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users', key: 'id' }
        },
        rejection_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_archived: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        archived_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        archived_by_user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users', key: 'id' }
        },
        printed_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        printed_by_user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users', key: 'id' }
        },
        version: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }
    },
    {
        sequelize,
        tableName: 'document_approvals',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

// Associations
DocumentApproval.belongsTo(User, { foreignKey: 'uploaded_by_user_id', as: 'uploadedBy' });
DocumentApproval.belongsTo(User, { foreignKey: 'current_approver_id', as: 'currentApprover' });

export default DocumentApproval;
