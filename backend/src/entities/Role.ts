import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export interface RoleAttributes {
    id?: number;
    role_name: string;
    role_code: string;
    description?: string;
    hierarchy_level: number;
    department?: string;
    created_at?: Date;
    updated_at?: Date;
}

class Role extends Model<RoleAttributes> implements RoleAttributes {
    public id!: number;
    public role_name!: string;
    public role_code!: string;
    public description?: string;
    public hierarchy_level!: number;
    public department?: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Role.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        role_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        role_code: {
            type: DataTypes.CHAR(1),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        hierarchy_level: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        department: {
            type: DataTypes.STRING(100),
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'roles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

export default Role;
