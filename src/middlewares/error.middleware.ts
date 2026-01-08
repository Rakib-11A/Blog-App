import { Request, Response, NextFunction } from "express";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('X Error:', err);
    
    let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    let message = err.message || 'Internal server error';
    
    // Handle Prisma errors
    if (err.code === 'P2025') {
        // Record not found
        statusCode = 404;
        message = 'Resource not found';
    } else if (err.code === 'P2002') {
        // Unique constraint violation
        statusCode = 400;
        message = 'This record already exists';
    } else if (err.code?.startsWith('P')) {
        // Other Prisma errors
        statusCode = 400;
        message = 'Database error occurred';
    }
    
    res.status(statusCode).json({
        success: false,
        message: message, 
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};