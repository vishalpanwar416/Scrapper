/**
 * Request/Response Logging Middleware
 * Logs incoming requests and outgoing responses
 */

import { Request, Response, NextFunction } from 'express';

export interface LogContext {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  requestBody?: any;
  responseBody?: any;
}

/**
 * Logger middleware
 * Logs HTTP request/response details
 */
export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Capture the original send function
  const originalSend = res.send;

  // Override res.send to capture response body
  let responseBody: any = null;
  res.send = function (data: any) {
    responseBody = data;
    return originalSend.call(this, data);
  };

  // Listen for response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logContext: LogContext = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: duration,
      timestamp,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    };

    // Log request body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      logContext.requestBody = req.body;
    }

    // Log response body in development mode for debugging
    if (process.env.NODE_ENV === 'development' && responseBody) {
      try {
        logContext.responseBody = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
      } catch {
        // If not JSON, skip response body logging
      }
    }

    // Format log message with color codes for terminal
    const statusColor =
      res.statusCode >= 500 ? '\x1b[31m' : // Red
      res.statusCode >= 400 ? '\x1b[33m' : // Yellow
      res.statusCode >= 300 ? '\x1b[36m' : // Cyan
      '\x1b[32m'; // Green
    const resetColor = '\x1b[0m';

    const logMessage = `${statusColor}[${res.statusCode}]${resetColor} ${req.method} ${req.originalUrl} - ${duration}ms`;

    console.log(logMessage);

    // Log detailed info in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`  IP: ${logContext.ip}, User-Agent: ${logContext.userAgent?.substring(0, 50)}...`);
      if (logContext.requestBody && Object.keys(logContext.requestBody).length > 0) {
        console.log(`  Request:`, logContext.requestBody);
      }
    }
  });

  next();
};

/**
 * Request validator and logger
 * Validates incoming requests and logs access attempts
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Attach request ID to response for tracing
  res.setHeader('X-Request-ID', requestId);

  // Log request details
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`[${timestamp}] Request ID: ${requestId}`);
    console.log(`Method: ${req.method} | URL: ${req.originalUrl}`);
    console.log(`Headers:`, {
      'content-type': req.get('content-type'),
      'user-agent': req.get('user-agent')?.substring(0, 50),
    });
    if (Object.keys(req.body).length > 0) {
      console.log(`Body:`, req.body);
    }
  }

  next();
};

/**
 * API usage logger
 * Logs all API endpoint usage for analytics
 */
export const apiUsageLogger = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    // Only log API routes
    if (req.originalUrl.startsWith('/api/')) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };

      // In production, you might want to send this to a logging service
      // For now, just log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Usage]', logEntry);
      }
    }
  });

  next();
};

/**
 * Performance monitoring logger
 * Logs slow requests for performance monitoring
 */
export const performanceLogger = (slowThreshold: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;

      // Log slow requests
      if (duration > slowThreshold) {
        console.warn(`[Slow Request] ${req.method} ${req.originalUrl} took ${duration}ms`);
      }
    });

    next();
  };
};
