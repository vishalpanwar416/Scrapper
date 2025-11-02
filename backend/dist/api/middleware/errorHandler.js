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
    // Log error in development with more details
    if (process.env.NODE_ENV === 'development') {
        console.error('\n════════════════════════════════════════════════════════');
        console.error(`❌ ERROR HANDLER [${status}]`);
        console.error('════════════════════════════════════════════════════════');
        console.error('Code:', code);
        console.error('Message:', message);
        console.error('Status Code:', status);
        if (err instanceof Error && err.stack) {
            console.error('\nStack Trace:');
            console.error(err.stack);
        }
        if (details) {
            console.error('\nDetails:', details);
        }
        // Provide diagnosis based on error code
        console.error('\n📋 ERROR DIAGNOSIS:');
        switch (code) {
            case 'VALIDATION_ERROR':
                console.error('- Invalid request data');
                console.error('- Check required fields and data types');
                console.error('- Verify input constraints (length, format, etc.)');
                break;
            case 'NOT_FOUND':
                console.error('- Resource does not exist');
                console.error('- Check if the ID is correct');
                console.error('- Verify the resource was not deleted');
                break;
            case 'DUPLICATE_ERROR':
                console.error('- A resource with this identifier already exists');
                console.error('- Try using a different identifier');
                break;
            case 'UNAUTHORIZED':
                console.error('- Authentication failed');
                console.error('- Check credentials');
                console.error('- Ensure valid authentication token is provided');
                break;
            case 'FORBIDDEN':
                console.error('- Access denied');
                console.error('- User does not have required permissions');
                break;
            case 'RATE_LIMIT_EXCEEDED':
                console.error('- Too many requests');
                console.error('- Wait before making another request');
                console.error('- Check rate limit configuration');
                break;
            case 'DATABASE_ERROR':
                console.error('- Database operation failed');
                console.error('- Check database connectivity');
                console.error('- Verify database schema');
                break;
            case 'SERVICE_UNAVAILABLE':
                console.error('- A required service is not available');
                console.error('- Check service status');
                console.error('- Verify service configuration');
                break;
            case 'INTERNAL_ERROR':
            default:
                console.error('- Unexpected error occurred');
                console.error('- Check application logs for details');
                break;
        }
        console.error('════════════════════════════════════════════════════════\n');
    }
    else {
        console.error(`[${new Date().toISOString()}] [${code}] ${status} - ${message}`);
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
