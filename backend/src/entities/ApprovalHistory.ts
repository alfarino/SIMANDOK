import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import DocumentApproval from './DocumentApproval';
import User from './User';
import { ActionType } from '../types/enums';

export interface ApprovalHistoryAttributes {
    id?: number;
    document_id: number;
    action_by_user_id: number;
    action_type: ActionType;
    from_status?: string;
    to_status?: string;
    remarks?: string;
    created_at?: Date;
}

class ApprovalHistory extends Model<ApprovalHistoryAttributes> implements ApprovalHistoryAttributes {
    public id!: number;
    public document_id!: number;
    public action_by_user_id!: number;
    public action_type!: ActionType;
    public from_status?: string;
    public to_status?: string;
    public remarks?: string;
    public readonly created_at!: Date;

    // Associations
    public document?: DocumentApproval;
    public actionBy?: User;
}

ApprovalHistory.init(
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
        action_by_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        action_type: {
            type: DataTypes.ENUM(...Object.values(ActionType)),
            allowNull: false
        },
        from_status: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        to_status: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'approval_history',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    }
);

// Associations
ApprovalHistory.belongsTo(DocumentApproval, { foreignKey: 'document_id', as: 'document' });
ApprovalHistory.belongsTo(User, { foreignKey: 'action_by_user_id', as: 'actionBy' });

export default ApprovalHistory;
