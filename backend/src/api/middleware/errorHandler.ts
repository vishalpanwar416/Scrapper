/**
 * Global Error Handler Middleware
 * Handles all errors thrown by route handlers and other middleware
 */

import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

/**
 * Custom error class for API errors
 */
export class CustomError extends Error implements ApiError {
  status: number;
  code: string;
  details: any;

  constructor(message: string, status: number = 500, code: string = 'INTERNAL_ERROR', details: any = null) {
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
export const errorHandler = (
  err: ApiError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
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
  } else {
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
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 * Should be used before the error handler
 */
export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  const error = new CustomError(
    `Route not found`,
    404,
    'NOT_FOUND'
  );
  next(error);
};
