import AuditLog from '../entities/AuditLog';
import User from '../entities/User';

interface AuditLogDTO {
    userId?: number;
    action: string;
    resourceType: string;
    resourceId?: number;
    oldValue?: object;
    newValue?: object;
    ipAddress?: string;
    userAgent?: string;
}

class AuditService {
    /**
     * Log an action
     */
    async log(data: AuditLogDTO): Promise<AuditLog> {
        return AuditLog.create({
            user_id: data.userId,
            action: data.action,
            resource_type: data.resourceType,
            resource_id: data.resourceId,
            old_value: data.oldValue,
            new_value: data.newValue,
            ip_address: data.ipAddress,
            user_agent: data.userAgent
        });
    }

    /**
     * Get logs by resource
     */
    async getByResource(resourceType: string, resourceId: number): Promise<AuditLog[]> {
        return AuditLog.findAll({
            where: { resource_type: resourceType, resource_id: resourceId },
            include: [
                { model: User, as: 'user', attributes: ['id', 'full_name'] }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Get logs by user
     */
    async getByUser(userId: number, limit: number = 50): Promise<AuditLog[]> {
        return AuditLog.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit
        });
    }

    /**
     * Get recent logs
     */
    async getRecent(limit: number = 100): Promise<AuditLog[]> {
        return AuditLog.findAll({
            include: [
                { model: User, as: 'user', attributes: ['id', 'full_name'] }
            ],
            order: [['created_at', 'DESC']],
            limit
        });
    }
}

export default new AuditService();
