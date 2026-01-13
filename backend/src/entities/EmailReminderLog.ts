import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

export interface EmailReminderLogAttributes {
    id?: number;
    sent_to_user_id: number;
    sent_by_user_id?: number;
    reminder_type: 'MANUAL' | 'AUTO';
    total_documents: number;
    document_ids?: number[];
    email_subject?: string;
    email_sent_at?: Date;
    created_at?: Date;
}

class EmailReminderLog extends Model<EmailReminderLogAttributes> implements EmailReminderLogAttributes {
    public id!: number;
    public sent_to_user_id!: number;
    public sent_by_user_id?: number;
    public reminder_type!: 'MANUAL' | 'AUTO';
    public total_documents!: number;
    public document_ids?: number[];
    public email_subject?: string;
    public email_sent_at?: Date;
    public readonly created_at!: Date;

    // Associations
    public sentTo?: User;
    public sentBy?: User;
}

EmailReminderLog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        sent_to_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        sent_by_user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users', key: 'id' }
        },
        reminder_type: {
            type: DataTypes.ENUM('MANUAL', 'AUTO'),
            allowNull: false
        },
        total_documents: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        document_ids: {
            type: DataTypes.JSON,
            allowNull: true
        },
        email_subject: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        email_sent_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'email_reminder_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    }
);

// Associations
EmailReminderLog.belongsTo(User, { foreignKey: 'sent_to_user_id', as: 'sentTo' });
EmailReminderLog.belongsTo(User, { foreignKey: 'sent_by_user_id', as: 'sentBy' });

export default EmailReminderLog;
