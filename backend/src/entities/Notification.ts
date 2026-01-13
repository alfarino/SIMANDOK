import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import DocumentApproval from './DocumentApproval';
import { NotificationType } from '../types/enums';

export interface NotificationAttributes {
    id?: number;
    recipient_user_id: number;
    document_id?: number;
    notification_type: NotificationType;
    title: string;
    message?: string;
    is_read?: boolean;
    read_at?: Date;
    created_at?: Date;
}

class Notification extends Model<NotificationAttributes> implements NotificationAttributes {
    public id!: number;
    public recipient_user_id!: number;
    public document_id?: number;
    public notification_type!: NotificationType;
    public title!: string;
    public message?: string;
    public is_read!: boolean;
    public read_at?: Date;
    public readonly created_at!: Date;

    // Associations
    public recipient?: User;
    public document?: DocumentApproval;
}

Notification.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        recipient_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        document_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'document_approvals', key: 'id' }
        },
        notification_type: {
            type: DataTypes.ENUM(...Object.values(NotificationType)),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        read_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'notifications',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    }
);

// Associations
Notification.belongsTo(User, { foreignKey: 'recipient_user_id', as: 'recipient' });
Notification.belongsTo(DocumentApproval, { foreignKey: 'document_id', as: 'document' });

export default Notification;
