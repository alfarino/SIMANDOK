import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code: string = 'INTERNAL_ERROR'
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            code: err.code
        });
    }

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            code: 'VALIDATION_ERROR'
        });
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token',
            code: 'INVALID_TOKEN'
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
    });
};
