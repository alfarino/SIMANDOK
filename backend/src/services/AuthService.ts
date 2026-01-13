import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../entities/User';
import Role from '../entities/Role';
import { AppError } from '../middleware/error.middleware';

interface LoginResponse {
    token: string;
    user: {
        id: number;
        email: string;
        fullName: string;
        role: {
            id: number;
            name: string;
            code: string;
            hierarchyLevel: number;
        };
    };
}

class AuthService {
    private jwtSecret: string;
    private jwtExpiry: string;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
        this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        // Find user with role
        const user = await User.findOne({
            where: { email, is_active: true },
            include: [{ model: Role, as: 'role' }]
        });

        if (!user) {
            throw new AppError('Email atau password salah', 401, 'INVALID_CREDENTIALS');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new AppError('Email atau password salah', 401, 'INVALID_CREDENTIALS');
        }

        // Update last login
        await user.update({ last_login_at: new Date() });

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, roleId: user.role_id },
            this.jwtSecret,
            { expiresIn: this.jwtExpiry } as jwt.SignOptions
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: {
                    id: user.role!.id,
                    name: user.role!.role_name,
                    code: user.role!.role_code,
                    hierarchyLevel: user.role!.hierarchy_level
                }
            }
        };
    }

    async verifyToken(token: string): Promise<{ userId: number; roleId: number }> {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as { userId: number; roleId: number };
            return decoded;
        } catch {
            throw new AppError('Token tidak valid', 401, 'INVALID_TOKEN');
        }
    }

    async getUserById(userId: number) {
        const user = await User.findByPk(userId, {
            include: [{ model: Role, as: 'role' }],
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            throw new AppError('User tidak ditemukan', 404, 'USER_NOT_FOUND');
        }

        return user;
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
}

export default new AuthService();
