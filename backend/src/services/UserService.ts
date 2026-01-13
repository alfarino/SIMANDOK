import User from '../entities/User';
import Role from '../entities/Role';
import { AppError } from '../middleware/error.middleware';

class UserService {
    async findAll() {
        return User.findAll({
            include: [{ model: Role, as: 'role' }],
            attributes: { exclude: ['password_hash'] }
        });
    }

    async findById(id: number) {
        const user = await User.findByPk(id, {
            include: [{ model: Role, as: 'role' }],
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            throw new AppError('User tidak ditemukan', 404, 'USER_NOT_FOUND');
        }

        return user;
    }

    async findByEmail(email: string) {
        return User.findOne({
            where: { email },
            include: [{ model: Role, as: 'role' }]
        });
    }

    // Get users that can be approvers (level > 1, i.e., not Staff)
    async getApprovers() {
        return User.findAll({
            include: [{
                model: Role,
                as: 'role',
                where: {
                    hierarchy_level: { [require('sequelize').Op.gt]: 1 }
                }
            }],
            attributes: { exclude: ['password_hash'] },
            where: { is_active: true }
        });
    }

    // Get approvers above a specific user's level
    async getApproversAboveUser(userId: number) {
        const user = await this.findById(userId);
        const userLevel = user.role?.hierarchy_level || 1;

        return User.findAll({
            include: [{
                model: Role,
                as: 'role',
                where: {
                    hierarchy_level: { [require('sequelize').Op.gt]: userLevel }
                }
            }],
            attributes: { exclude: ['password_hash'] },
            where: { is_active: true },
            order: [[{ model: Role, as: 'role' }, 'hierarchy_level', 'ASC']]
        });
    }

    async update(id: number, data: Partial<User>) {
        const user = await this.findById(id);
        await user.update(data);
        return this.findById(id);
    }
}

export default new UserService();
