import User from '../entities/User';
import Role from '../entities/Role';
import { Op } from 'sequelize';

class HierarchyService {
    /**
     * Get all users that can approve for a specific user (users with higher hierarchy level)
     */
    async getApproversAboveUser(userId: number): Promise<User[]> {
        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: 'role' }]
        });

        if (!user || !user.role) {
            return [];
        }

        const userLevel = user.role.hierarchy_level;

        return User.findAll({
            include: [{
                model: Role,
                as: 'role',
                where: {
                    hierarchy_level: { [Op.gt]: userLevel }
                }
            }],
            attributes: { exclude: ['password_hash'] },
            where: { is_active: true },
            order: [[{ model: Role, as: 'role' }, 'hierarchy_level', 'ASC']]
        });
    }

    /**
     * Get direct supervisor (next level up) for a user
     */
    async getSupervisor(userId: number): Promise<User | null> {
        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: 'role' }]
        });

        if (!user || !user.role) {
            return null;
        }

        const userLevel = user.role.hierarchy_level;
        const nextLevel = userLevel + 1;

        const supervisor = await User.findOne({
            include: [{
                model: Role,
                as: 'role',
                where: { hierarchy_level: nextLevel }
            }],
            attributes: { exclude: ['password_hash'] },
            where: { is_active: true }
        });

        return supervisor;
    }

    /**
     * Sort user IDs by their hierarchy level (lowest to highest)
     * This is used to automatically order approvers
     */
    async sortUsersByHierarchy(userIds: number[]): Promise<number[]> {
        if (userIds.length === 0) return [];

        const users = await User.findAll({
            where: { id: userIds },
            include: [{ model: Role, as: 'role' }]
        });

        // Sort by hierarchy level (ascending: A=1, B=2, C=3, D=4)
        const sorted = users.sort(
            (a, b) => (a.role?.hierarchy_level || 0) - (b.role?.hierarchy_level || 0)
        );

        return sorted.map(u => u.id);
    }

    /**
     * Check if an approver can approve for a specific uploader
     * Approver must have higher hierarchy level than uploader
     */
    async canApprove(approverId: number, uploaderId: number): Promise<boolean> {
        const [approver, uploader] = await Promise.all([
            User.findByPk(approverId, { include: [{ model: Role, as: 'role' }] }),
            User.findByPk(uploaderId, { include: [{ model: Role, as: 'role' }] })
        ]);

        if (!approver?.role || !uploader?.role) {
            return false;
        }

        return approver.role.hierarchy_level > uploader.role.hierarchy_level;
    }

    /**
     * Get hierarchy level for a user
     */
    async getHierarchyLevel(userId: number): Promise<number> {
        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: 'role' }]
        });

        return user?.role?.hierarchy_level || 0;
    }

    /**
     * Get all users grouped by role level
     */
    async getUsersByLevel(): Promise<Record<string, User[]>> {
        const users = await User.findAll({
            include: [{ model: Role, as: 'role' }],
            attributes: { exclude: ['password_hash'] },
            where: { is_active: true },
            order: [[{ model: Role, as: 'role' }, 'hierarchy_level', 'ASC']]
        });

        const grouped: Record<string, User[]> = {};

        users.forEach(user => {
            const roleCode = user.role?.role_code || 'A';
            if (!grouped[roleCode]) {
                grouped[roleCode] = [];
            }
            grouped[roleCode].push(user);
        });

        return grouped;
    }
}

export default new HierarchyService();
