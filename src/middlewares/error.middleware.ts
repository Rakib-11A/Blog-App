import { Request, Response, NextFunction } from "express";
import { Prisma } from "../../generated/prisma/client";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = err.message || 'Internal server error';

    // 1. Prisma Client Known Request Errors (P20xx)
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2025':
                statusCode = 404;
                message = "Record not found";
                break;
            case 'P2002':
                statusCode = 409;
                message = "Unique constraint failed on: " + (err.meta?.target || '');
                break;
            case 'P2003':
                statusCode = 400;
                message = "Foreign key constraint failed on: " + (err.meta?.field_name || '');
                break;
            default:
                statusCode = 500;
                message = "Database operation failed";
        }
    } 
    // 2. Validation Errors (Wrong data types)
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Incorrect field type or missing fields";
    }
    // 3. Unknown Request Errors
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = 400;
        message = "Operation failed due to unknown database response";
    }
    // 4. Initialization Errors (P10xx - Connection issues)
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        switch (err.errorCode) {
            case 'P1000':
                statusCode = 401;
                message = "Invalid Database Credentials";
                break;
            case 'P1001':
                statusCode = 503;
                message = "Database Server is Down";
                break;
            case 'P1017':
                statusCode = 500;
                message = "Database Connection Closed unexpectedly";
                break;
            default:
                statusCode = 500;
                message = "Database initialization error";
        }
    }
    else if(err instanceof Prisma.PrismaClientRustPanicError) {
        statusCode = 500;
        message = "Prisma engine crashed (Rust Panic). Please restart the server.";
        console.log("CRITICAL ENGINE ERROR: ", err.message);
    }

    // Logging for debugging
    if (statusCode === 500) {
        console.error('CRITICAL ERROR:', err);
    }

    // Final Response sending (This is mandatory)
    res.status(statusCode).json({
        success: false,
        message: message
    });
};