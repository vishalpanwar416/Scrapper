/**
 * Global Error Handler Middleware
 * Handles all errors thrown by route handlers and other middleware
 */
/**
 * Custom error class for API errors
 */
export class CustomError extends Error {
    constructor(message, status = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
/**
 * Error handler middleware
 * Should be used as the last middleware in the Express app
 */
export const errorHandler = (err, _req, res, _next) => {
    // Default error response
    let status = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal Server Error';
    let details = null;
    // Handle custom errors
    if (err instanceof CustomError) {
        status = err.status || 500;
        code = err.code || 'INTERNAL_ERROR';
        message = err.message;
        details = err.details;
    }
    // Handle validation errors
    else if (err.name === 'ValidationError') {
        status = 400;
        code = 'VALIDATION_ERROR';
        message = err.message;
    }
    // Handle syntax errors (JSON parsing)
    else if (err instanceof SyntaxError && 'body' in err) {
        status = 400;
        code = 'INVALID_JSON';
        message = 'Invalid JSON in request body';
    }
    // Handle standard errors
    else if (err instanceof Error) {
        message = err.message;
    }
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('[Error Handler]', {
            status,
            code,
            message,
            stack: err instanceof Error ? err.stack : undefined,
            details,
        });
    }
    else {
        console.error(`[${new Date().toISOString()}] Error:`, message);
    }
    // Send error response
    res.status(status).json({
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
        },
        timestamp: new Date().toISOString(),
    });
};
/**
 * Async error wrapper for route handlers
 * Wraps async functions to catch errors and pass to error handler
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
/**
 * 404 Not Found handler
 * Should be used before the error handler
 */
export const notFoundHandler = (_req, _res, next) => {
    const error = new CustomError(`Route not found`, 404, 'NOT_FOUND');
    next(error);
};
