/**
 * Authentication & Authorization Middleware
 * Handles JWT token verification and user authentication
 */
import { CustomError } from './errorHandler.js';
/**
 * Mock JWT verification (replace with actual JWT library in production)
 * In production, use 'jsonwebtoken' package
 */
const verifyToken = (token) => {
    try {
        // For development, we'll use a simple token format
        // In production, use jwt.verify() with your secret key
        const base64Payload = token.split('.')[1];
        if (!base64Payload)
            return null;
        const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
        return payload;
    }
    catch {
        return null;
    }
};
/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 * Required for protected routes
 */
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            throw new CustomError('Authorization header is missing', 401, 'MISSING_AUTH_HEADER');
        }
        // Extract token from "Bearer <token>"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
            throw new CustomError('Invalid authorization header format. Use "Bearer <token>"', 401, 'INVALID_AUTH_FORMAT');
        }
        const token = parts[1];
        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            throw new CustomError('Invalid or expired token', 401, 'INVALID_TOKEN');
        }
        // Attach user info to request
        req.userId = decoded.id;
        req.token = token;
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof CustomError) {
            next(error);
        }
        else {
            next(new CustomError('Authentication failed', 401, 'AUTH_FAILED', error instanceof Error ? error.message : undefined));
        }
    }
};
/**
 * Optional authentication middleware
 * Verifies token if present, but doesn't fail if missing
 */
export const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
                const token = parts[1];
                const decoded = verifyToken(token);
                if (decoded) {
                    req.userId = decoded.id;
                    req.token = token;
                    req.user = decoded;
                }
            }
        }
        next();
    }
    catch (error) {
        // Don't fail, just continue without auth
        next();
    }
};
/**
 * Authorization middleware
 * Checks if user has required role(s)
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // First ensure user is authenticated
        if (!req.user) {
            return next(new CustomError('Authentication required', 401, 'NOT_AUTHENTICATED'));
        }
        // Check if user has required role
        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role || '')) {
            return next(new CustomError(`Access denied. Required roles: ${allowedRoles.join(', ')}`, 403, 'INSUFFICIENT_PERMISSIONS'));
        }
        next();
    };
};
/**
 * API Key authentication middleware
 * Simple API key validation from header or query parameter
 */
export const apiKeyAuth = (req, res, next) => {
    const apiKey = req.get('X-API-Key') || req.query['api_key'];
    if (!apiKey) {
        return next(new CustomError('API Key is required', 401, 'MISSING_API_KEY'));
    }
    // Validate API key (in production, check against database)
    const validApiKey = process.env.API_KEY || 'default-api-key';
    if (apiKey !== validApiKey) {
        return next(new CustomError('Invalid API Key', 401, 'INVALID_API_KEY'));
    }
    // Mark as authenticated
    req.user = {
        id: 'api-client',
        role: 'api',
    };
    next();
};
/**
 * Role-based authorization middleware
 * More flexible authorization with multiple checks
 */
export const rbac = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new CustomError('Authentication required', 401, 'NOT_AUTHENTICATED'));
        }
        // Simple permission check
        // In production, implement proper permission system
        const userPermissions = {
            'admin': ['read', 'write', 'delete', 'manage_users', 'manage_scrapers'],
            'scraper': ['read', 'write', 'manage_scrapers'],
            'viewer': ['read'],
            'api': ['read', 'write'],
        };
        const role = req.user.role || 'viewer';
        const permissions = userPermissions[role] || [];
        if (!permissions.includes(requiredPermission)) {
            return next(new CustomError(`Permission denied. Required: ${requiredPermission}`, 403, 'PERMISSION_DENIED'));
        }
        next();
    };
};
/**
 * Rate limit per user/API key
 * Useful for per-user rate limiting instead of per-IP
 */
export const perUserRateLimit = (maxRequests = 100, windowMs = 60000) => {
    const userRequestMap = new Map();
    return (req, res, next) => {
        const userId = req.user?.id || req.ip || 'anonymous';
        const now = Date.now();
        let userRecord = userRequestMap.get(userId);
        // Reset if window expired
        if (!userRecord || userRecord.resetTime < now) {
            userRecord = {
                count: 0,
                resetTime: now + windowMs,
            };
        }
        userRecord.count++;
        userRequestMap.set(userId, userRecord);
        // Set headers
        res.setHeader('RateLimit-Limit', maxRequests);
        res.setHeader('RateLimit-Remaining', Math.max(0, maxRequests - userRecord.count));
        res.setHeader('RateLimit-Reset', userRecord.resetTime - now);
        if (userRecord.count > maxRequests) {
            return next(new CustomError('Rate limit exceeded for your account', 429, 'RATE_LIMIT_EXCEEDED'));
        }
        next();
    };
};
/**
 * Generate test JWT token (for development only)
 */
export const generateTestToken = (userId, role = 'user') => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({
        id: userId,
        role,
        email: `${userId}@example.com`,
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    })).toString('base64');
    // Note: This is not a real JWT signature, just for testing
    const signature = Buffer.from('test-signature').toString('base64');
    return `${header}.${payload}.${signature}`;
};
