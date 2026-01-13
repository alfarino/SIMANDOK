import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import DocumentApproval from './DocumentApproval';
import User from './User';
import { ApproverStatus } from '../types/enums';

export interface DocumentApproverAttributes {
    id?: number;
    document_id: number;
    approver_user_id: number;
    sequence_order: number;
    status?: ApproverStatus;
    approved_at?: Date;
    remarks?: string;
    created_at?: Date;
    updated_at?: Date;
}

class DocumentApprover extends Model<DocumentApproverAttributes> implements DocumentApproverAttributes {
    public id!: number;
    public document_id!: number;
    public approver_user_id!: number;
    public sequence_order!: number;
    public status!: ApproverStatus;
    public approved_at?: Date;
    public remarks?: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Associations
    public document?: DocumentApproval;
    public approver?: User;
}

DocumentApprover.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        document_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'document_approvals', key: 'id' }
        },
        approver_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        sequence_order: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM(...Object.values(ApproverStatus)),
            defaultValue: ApproverStatus.PENDING
        },
        approved_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'document_approvers',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

// Associations
DocumentApprover.belongsTo(DocumentApproval, { foreignKey: 'document_id', as: 'document' });
DocumentApprover.belongsTo(User, { foreignKey: 'approver_user_id', as: 'approver' });

export default DocumentApprover;
