/**
 * CORS (Cross-Origin Resource Sharing) Middleware
 * Handles cross-origin requests and preflight OPTIONS requests
 */
/**
 * Default CORS configuration
 */
const defaultCorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'X-Request-ID'],
    credentials: false,
    maxAge: 86400, // 24 hours
};
/**
 * Check if origin is allowed
 */
const isOriginAllowed = (origin, allowedOrigins) => {
    if (allowedOrigins === '*') {
        return true;
    }
    if (typeof allowedOrigins === 'function') {
        return allowedOrigins(origin);
    }
    if (Array.isArray(allowedOrigins)) {
        return allowedOrigins.includes(origin);
    }
    return origin === allowedOrigins;
};
/**
 * Create CORS middleware
 */
export const createCorsMiddleware = (options = {}) => {
    const corsOptions = { ...defaultCorsOptions, ...options };
    return (req, res, next) => {
        const origin = req.get('Origin') || '*';
        // Check if origin is allowed
        if (isOriginAllowed(origin, corsOptions.origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
        // Set allowed methods
        res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
        // Set allowed headers
        res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
        // Set exposed headers
        if (corsOptions.exposedHeaders.length > 0) {
            res.setHeader('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
        }
        // Set credentials
        if (corsOptions.credentials) {
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        // Set max age for preflight cache
        res.setHeader('Access-Control-Max-Age', corsOptions.maxAge);
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            return res.sendStatus(204);
        }
        next();
    };
};
/**
 * CORS middleware for development (allows all origins)
 */
export const corsDevMiddleware = createCorsMiddleware({
    origin: '*',
    credentials: false,
});
/**
 * CORS middleware for production (restricted origins)
 */
export const corsProdMiddleware = createCorsMiddleware({
    origin: (origin) => {
        const allowedOrigins = [
            'https://yourdomain.com',
            'https://www.yourdomain.com',
            'https://admin.yourdomain.com',
        ];
        return allowedOrigins.includes(origin);
    },
    credentials: true,
});
/**
 * CORS middleware for API only (specific origins)
 */
export const corsApiMiddleware = createCorsMiddleware({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5000',
        'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
    exposedHeaders: ['X-Total-Count', 'RateLimit-Limit', 'RateLimit-Remaining'],
    credentials: true,
    maxAge: 86400,
});
/**
 * Strict CORS for sensitive endpoints
 */
export const corsStrictMiddleware = createCorsMiddleware({
    origin: (origin) => {
        // Only allow requests from same origin
        return origin === process.env.FRONTEND_URL;
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600,
});
/**
 * CORS error handler
 * Handles CORS-related errors
 */
export const corsErrorHandler = (err, req, res, next) => {
    if (err.message && err.message.includes('CORS')) {
        res.status(403).json({
            success: false,
            error: {
                code: 'CORS_ERROR',
                message: 'Cross-origin request is not allowed',
            },
        });
    }
    else {
        next(err);
    }
};
/**
 * Disable CORS for specific routes
 */
export const disableCors = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'null');
    res.setHeader('Access-Control-Allow-Methods', '');
    res.setHeader('Access-Control-Allow-Headers', '');
    next();
};
/**
 * Allow any origin middleware
 * Use only in development
 */
export const allowAnyOrigin = (req, res, next) => {
    const origin = req.get('Origin') || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', req.get('Access-Control-Request-Headers') || '*');
    res.setHeader('Access-Control-Max-Age', '86400');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
};
