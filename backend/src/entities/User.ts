import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import Role from './Role';

export interface UserAttributes {
    id?: number;
    username: string;
    email: string;
    password_hash: string;
    full_name: string;
    role_id: number;
    team?: string;
    phone?: string;
    is_active?: boolean;
    last_login_at?: Date;
    created_at?: Date;
    updated_at?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public email!: string;
    public password_hash!: string;
    public full_name!: string;
    public role_id!: number;
    public team?: string;
    public phone?: string;
    public is_active!: boolean;
    public last_login_at?: Date;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Associations
    public role?: Role;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        full_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'roles',
                key: 'id'
            }
        },
        team: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        last_login_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

// Associations
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

export default User;
