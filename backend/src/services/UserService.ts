import User from '../entities/User';
import Role from '../entities/Role';
import { AppError } from '../middleware/error.middleware';
import bcrypt from 'bcryptjs';

interface CreateUserDTO {
    username: string;
    email: string;
    password: string;
    fullName: string;
    roleId: number;
    team?: string;
    phone?: string;
}

class UserService {
    async findAll() {
        return User.findAll({
            include: [{ model: Role, as: 'role' }],
            attributes: { exclude: ['password_hash'] },
            order: [['id', 'ASC']],
        });
    }

    async findById(id: number) {
        const user = await User.findByPk(id, {
            include: [{ model: Role, as: 'role' }],
            attributes: { exclude: ['password_hash'] },
        });

        if (!user) {
            throw new AppError('User tidak ditemukan', 404, 'USER_NOT_FOUND');
        }

        return user;
    }

    async findByEmail(email: string) {
        return User.findOne({
            where: { email },
            include: [{ model: Role, as: 'role' }],
        });
    }

    async create(data: CreateUserDTO) {
        // Check for duplicate email
        const existing = await User.findOne({ where: { email: data.email } });
        if (existing) {
            throw new AppError('Email sudah digunakan', 400, 'DUPLICATE_EMAIL');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 10);

        const user = await User.create({
            username: data.username,
            email: data.email,
            password_hash: passwordHash,
            full_name: data.fullName,
            role_id: data.roleId,
            team: data.team,
            phone: data.phone,
            is_active: true,
        });

        return this.findById(user.id);
    }

    async delete(id: number) {
        const user = await this.findById(id);

        // Soft delete - just deactivate
        await user.update({ is_active: false });

        return { message: 'User berhasil dinonaktifkan' };
    }

    async getRoles() {
        return Role.findAll({
            order: [['hierarchy_level', 'ASC']],
        });
    }

    // Get users that can be approvers (level > 1, i.e., not Staff)
    async getApprovers() {
        return User.findAll({
            include: [
                {
                    model: Role,
                    as: 'role',
                    where: {
                        hierarchy_level: { [require('sequelize').Op.gt]: 1 },
                    },
                },
            ],
            attributes: { exclude: ['password_hash'] },
            where: { is_active: true },
            order: [[{ model: Role, as: 'role' }, 'hierarchy_level', 'ASC']],
        });
    }

    // Get approvers above a specific user's level
    async getApproversAboveUser(userId: number) {
        const user = await this.findById(userId);
        const userLevel = user.role?.hierarchy_level || 1;

        return User.findAll({
            include: [
                {
                    model: Role,
                    as: 'role',
                    where: {
                        hierarchy_level: { [require('sequelize').Op.gt]: userLevel },
                    },
                },
            ],
            attributes: { exclude: ['password_hash'] },
            where: { is_active: true },
            order: [[{ model: Role, as: 'role' }, 'hierarchy_level', 'ASC']],
        });
    }

    async update(id: number, data: Partial<User> & { password?: string }) {
        const user = await this.findById(id);

        // If password is being updated, hash it
        if (data.password) {
            (data as any).password_hash = await bcrypt.hash(data.password, 10);
            delete data.password;
        }

        await user.update(data);
        return this.findById(id);
    }
}

export default new UserService();
