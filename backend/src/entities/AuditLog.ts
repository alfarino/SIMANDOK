import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

export interface AuditLogAttributes {
    id?: number;
    user_id?: number;
    action: string;
    resource_type: string;
    resource_id?: number;
    old_value?: object;
    new_value?: object;
    ip_address?: string;
    user_agent?: string;
    created_at?: Date;
}

class AuditLog extends Model<AuditLogAttributes> implements AuditLogAttributes {
    public id!: number;
    public user_id?: number;
    public action!: string;
    public resource_type!: string;
    public resource_id?: number;
    public old_value?: object;
    public new_value?: object;
    public ip_address?: string;
    public user_agent?: string;
    public readonly created_at!: Date;

    // Associations
    public user?: User;
}

AuditLog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users', key: 'id' }
        },
        action: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        resource_type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        resource_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        old_value: {
            type: DataTypes.JSON,
            allowNull: true
        },
        new_value: {
            type: DataTypes.JSON,
            allowNull: true
        },
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'audit_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    }
);

// Associations
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default AuditLog;
