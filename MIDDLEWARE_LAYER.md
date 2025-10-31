# Express.js Middleware Layer Documentation

## Overview

A comprehensive middleware layer has been implemented in the Express.js application to handle cross-cutting concerns like error handling, logging, authentication, validation, rate limiting, and CORS. These middleware functions are loaded in a specific order to ensure proper request/response processing.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Incoming Request                      │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────────────┐
│ 1. CORS Middleware (corsApiMiddleware)                      │
│    • Handles cross-origin requests                          │
│    • Sets CORS headers                                      │
│    • Handles preflight OPTIONS requests                     │
└──────────────────────┬───────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. Body Parser (express.json & urlencoded)                  │
│    • Parse JSON request bodies                              │
│    • Parse form-urlencoded bodies                           │
│    • Make data available in req.body                        │
└──────────────────────┬───────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. Logging Middleware (logger, requestLogger, etc.)         │
│    • requestLogger: Detailed request logging (dev mode)    │
│    • logger: Standard HTTP logging with colors              │
│    • apiUsageLogger: Track API endpoint usage               │
│    • performanceLogger: Log slow requests (>1000ms)         │
└──────────────────────┬───────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. Rate Limiting Middleware                                  │
│    • apiRateLimiter: 100 req/15min per IP (general API)    │
│    • scrapeRateLimiter: 10 req/hour per IP (scraping)      │
│    • Prevents abuse and DoS attacks                         │
└──────────────────────┬───────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. Route Handlers (API endpoints)                            │
│    • /api/health                                            │
│    • /api/websites                                          │
│    • /api/products                                          │
│    • /api/scrape                                            │
└──────────────────────┬───────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────────────┐
│ 6. Error Handling (errorHandler)                             │
│    • Catches all errors from routes & middleware            │
│    • Formats error responses                                │
│    • Returns JSON with error details                        │
│    • MUST be last middleware                                │
└──────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                    Response Sent to Client                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Middleware Components

### 1. Error Handler Middleware (`errorHandler.ts`)

Handles all errors thrown by route handlers and other middleware.

**Features:**
- Global error catching with try-catch wrapper (`asyncHandler`)
- Custom error class (`CustomError`) for API errors
- 404 Not Found handler (`notFoundHandler`)
- Structured error responses
- Error logging in development mode
- HTTP status code mapping

**Usage:**

```typescript
import { errorHandler, asyncHandler, CustomError } from './api/middleware';

// Wrap async route handlers
app.get('/api/data', asyncHandler(async (req, res) => {
  const data = await fetchData();
  res.json(data);
}));

// Throw custom errors
throw new CustomError(
  'Invalid request',
  400,
  'INVALID_INPUT',
  { field: 'email', reason: 'Invalid format' }
);
```

**Response Format:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": { "field": "email" }
  },
  "timestamp": "2025-10-31T10:30:00.000Z"
}
```

---

### 2. Logging Middleware (`logger.ts`)

Provides comprehensive request/response logging with multiple levels.

**Components:**

| Middleware | Purpose | Level |
|------------|---------|-------|
| `requestLogger` | Detailed request logging | Dev only |
| `logger` | Standard HTTP logging with colors | All |
| `apiUsageLogger` | Track API usage analytics | All |
| `performanceLogger` | Log slow requests | All |

**Features:**
- Colored console output (green/yellow/red based on status)
- Request/response body logging (dev mode)
- Performance tracking (response time)
- Slow request detection (>1000ms)
- User-Agent and IP tracking
- Request ID generation

**Usage:**

```typescript
import {
  logger,
  performanceLogger,
  apiUsageLogger
} from './api/middleware';

app.use(logger);
app.use(performanceLogger(1000)); // Log requests > 1 second
app.use(apiUsageLogger);
```

**Console Output Examples:**

```
═══════════════════════════════════════════════════════════
[2025-10-31T10:30:00.000Z] Request ID: 1730364600000-a1b2c3d
Method: POST | URL: /api/websites
Headers: { 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0...' }
Body: { name: "Example", url: "https://example.com" }
═══════════════════════════════════════════════════════════

[200] POST /api/websites - 45ms
  IP: ::1, User-Agent: Mozilla/5.0...
  Request: { name: "Example", url: "https://example.com" }

[API Usage] { timestamp: '2025-10-31T...', method: 'POST', endpoint: '/api/websites', ... }
```

---

### 3. Rate Limiting Middleware (`rateLimiter.ts`)

Prevents abuse by limiting requests from a single IP address.

**Pre-configured Limiters:**

| Limiter | Limit | Window | Purpose |
|---------|-------|--------|---------|
| `apiRateLimiter` | 100 | 15 minutes | General API protection |
| `scrapeRateLimiter` | 10 | 1 hour | Scraper protection (resource intensive) |
| `authRateLimiter` | 5 | 15 minutes | Authentication attempts |
| `strictRateLimiter` | 1 | 1 minute | Sensitive operations |

**Features:**
- In-memory store (for production, use Redis)
- Automatic cleanup of expired entries
- Rate limit headers in response
- Custom configuration support
- Skip successful/failed requests option

**Usage:**

```typescript
import {
  apiRateLimiter,
  scrapeRateLimiter,
  createRateLimiter
} from './api/middleware';

// Apply general rate limiter
app.use('/api/', apiRateLimiter);

// Apply stricter limit to scraping endpoint
app.use('/api/scrape/', scrapeRateLimiter);

// Create custom limiter
const customLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,    // 1 minute
  maxRequests: 5,              // 5 requests
  message: 'Too many requests'
});
app.use('/api/custom/', customLimiter);
```

**Response When Limit Exceeded:**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests from this IP, please try again later.",
    "retryAfter": 300
  }
}
```

**Response Headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 45
RateLimit-Reset: 300000
```

---

### 4. Authentication Middleware (`auth.ts`)

Handles user authentication and authorization.

**Components:**

| Middleware | Purpose |
|------------|---------|
| `authenticate` | Verify JWT token (required) |
| `optionalAuth` | Verify JWT token if present (optional) |
| `authorize(...roles)` | Check user role permissions |
| `apiKeyAuth` | API key authentication |
| `rbac(permission)` | Role-based access control |
| `perUserRateLimit` | Rate limit per user |

**Features:**
- JWT token parsing from "Bearer <token>" header
- Custom error class for auth failures
- Role-based authorization
- API key validation
- RBAC with permission matrix
- Per-user rate limiting
- Test token generation for development

**Usage:**

```typescript
import {
  authenticate,
  authorize,
  apiKeyAuth,
  rbac,
  generateTestToken
} from './api/middleware';

// Protected route (requires auth)
app.get('/api/admin',
  authenticate,           // Verify token
  authorize('admin'),     // Must be admin role
  (req, res) => {
    res.json({ message: 'Admin data' });
  }
);

// Optional auth route
app.get('/api/profile',
  optionalAuth,  // Auth if provided, but not required
  (req, res) => {
    if (req.user) {
      res.json({ user: req.user });
    } else {
      res.json({ message: 'Public data' });
    }
  }
);

// API key protected endpoint
app.post('/api/scrape',
  apiKeyAuth,
  (req, res) => {
    res.json({ message: 'Scraping started' });
  }
);

// RBAC example
app.delete('/api/users/:id',
  authenticate,
  rbac('delete_users'),
  (req, res) => {
    res.json({ message: 'User deleted' });
  }
);

// Generate test token (dev only)
const token = generateTestToken('user123', 'admin');
// Use: Authorization: Bearer <token>
```

**Authorization Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 5. Input Validation Middleware (`validation.ts`)

Validates request data before processing.

**Features:**
- Schema-based validation
- Type checking (string, number, boolean, array, object)
- Min/max length and value constraints
- Pattern matching (regex)
- Enum validation
- Custom validation functions
- Input sanitization (XSS prevention)
- String trimming

**Validation Rules:**

```typescript
interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  min?: number;           // Min length (string) or value (number)
  max?: number;           // Max length (string) or value (number)
  pattern?: RegExp;       // Regex pattern (string only)
  enum?: (string | number)[];  // Allowed values
  custom?: (value: any) => boolean | string;  // Custom validator
}
```

**Usage:**

```typescript
import {
  validateBody,
  validateQuery,
  validateParams,
  sanitizeBody,
  trimStrings
} from './api/middleware';

// Validate request body
app.post('/api/websites',
  validateBody({
    name: {
      type: 'string',
      required: true,
      min: 3,
      max: 255
    },
    url: {
      type: 'string',
      required: true,
      pattern: /^https?:\/\/.+/
    },
    active: {
      type: 'boolean',
      required: false
    }
  }),
  (req, res) => {
    // req.body is validated
    res.json({ success: true });
  }
);

// Validate query parameters
app.get('/api/products',
  validateQuery({
    limit: {
      type: 'number',
      required: false,
      min: 1,
      max: 100
    },
    offset: {
      type: 'number',
      required: false,
      min: 0
    }
  }),
  (req, res) => {
    res.json({ limit: req.query.limit || 10 });
  }
);

// Validate URL parameters
app.get('/api/products/:id',
  validateParams({
    id: {
      type: 'string',
      required: true,
      pattern: /^[a-z0-9]+$/i
    }
  }),
  (req, res) => {
    res.json({ productId: req.params.id });
  }
);

// Sanitize and trim
app.post('/api/data',
  sanitizeBody,  // Remove XSS
  trimStrings,   // Trim all strings
  (req, res) => {
    // req.body is clean and trimmed
    res.json({ success: true });
  }
);
```

**Pre-built Validators:**

```typescript
// Validate scraper input
app.post('/api/scrape/start/:website',
  validateScraperInput,
  (req, res) => { ... }
);

// Validate website creation
app.post('/api/websites',
  validateWebsiteCreation,
  (req, res) => { ... }
);

// Validate product filtering
app.get('/api/products',
  validateProductFilter,
  (req, res) => { ... }
);
```

**Validation Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "name": "name must be at least 3 characters",
      "url": "url format is invalid"
    }
  }
}
```

---

### 6. CORS Middleware (`cors.ts`)

Handles Cross-Origin Resource Sharing for browser requests.

**Pre-configured CORS Settings:**

| Middleware | Origins | Methods | Use Case |
|------------|---------|---------|----------|
| `corsDevMiddleware` | * | All | Development (all origins) |
| `corsApiMiddleware` | localhost:* | Standard | API testing |
| `corsProdMiddleware` | Restricted | Standard | Production (specific domains) |
| `corsStrictMiddleware` | Single origin | GET, POST | Sensitive endpoints |

**Features:**
- Origin validation
- Method restrictions
- Header whitelisting
- Credentials support
- Preflight caching
- Expose custom headers

**Current Configuration (`corsApiMiddleware`):**

```typescript
{
  origin: [
    'http://localhost:3000',      // Frontend dev
    'http://localhost:5000',      // Backend dev
    'http://localhost:5173'       // Vite dev
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
  exposedHeaders: ['X-Total-Count', 'RateLimit-Limit', 'RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400  // 24 hours preflight cache
}
```

**Usage:**

```typescript
import {
  corsApiMiddleware,
  corsProdMiddleware,
  allowAnyOrigin
} from './api/middleware';

// Use in development
if (process.env.NODE_ENV === 'development') {
  app.use(allowAnyOrigin);
} else {
  app.use(corsProdMiddleware);
}

// Or use specific configuration
app.use(corsApiMiddleware);
```

**Response Headers:**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key
Access-Control-Max-Age: 86400
```

---

## Middleware Loading Order

The order of middleware is critical:

```typescript
// 1. CORS (first)
app.use(corsApiMiddleware);

// 2. Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Logging
app.use(requestLogger);
app.use(logger);
app.use(apiUsageLogger);
app.use(performanceLogger(1000));

// 4. Rate Limiting
app.use('/api/', apiRateLimiter);
app.use('/api/scrape/', scrapeRateLimiter);

// 5. Routes
app.get('/api/health', ...);
app.use('/api/websites', websitesRouter);
app.use('/api/products', productsRouter);
app.use('/api/scrape', scrapeRouter);

// 6. Error Handling (last)
app.use(notFoundHandler);
app.use(errorHandler);  // MUST be last
```

**Why Order Matters:**
- CORS first: Handle cross-origin issues before body parsing
- Body Parser early: Populate req.body for later middleware
- Logging before routes: Capture all requests
- Rate limiting before routes: Protect endpoints
- Error handling last: Catch errors from all previous layers

---

## File Structure

```
backend/src/api/middleware/
├── errorHandler.ts       (150+ lines)
│   ├─ CustomError class
│   ├─ errorHandler middleware
│   ├─ asyncHandler wrapper
│   └─ notFoundHandler
│
├── logger.ts            (200+ lines)
│   ├─ logger middleware
│   ├─ requestLogger
│   ├─ apiUsageLogger
│   └─ performanceLogger
│
├── rateLimiter.ts       (250+ lines)
│   ├─ RateLimiterStore class
│   ├─ createRateLimiter factory
│   ├─ apiRateLimiter
│   ├─ scrapeRateLimiter
│   ├─ authRateLimiter
│   └─ strictRateLimiter
│
├── auth.ts              (300+ lines)
│   ├─ authenticate middleware
│   ├─ optionalAuth
│   ├─ authorize
│   ├─ apiKeyAuth
│   ├─ rbac
│   ├─ perUserRateLimit
│   └─ generateTestToken
│
├── validation.ts        (350+ lines)
│   ├─ ValidationRule interface
│   ├─ validateField function
│   ├─ validateBody
│   ├─ validateQuery
│   ├─ validateParams
│   ├─ validate (combined)
│   ├─ sanitizeBody
│   ├─ trimStrings
│   └─ Pre-built validators
│
├── cors.ts              (200+ lines)
│   ├─ createCorsMiddleware factory
│   ├─ corsDevMiddleware
│   ├─ corsApiMiddleware
│   ├─ corsProdMiddleware
│   ├─ corsStrictMiddleware
│   └─ corsErrorHandler
│
└── index.ts             (Export central point)
    └─ Re-exports all middleware
```

---

## Integration in Main App (`src/index.ts`)

```typescript
import {
  corsApiMiddleware,
  logger,
  apiRateLimiter,
  scrapeRateLimiter,
  errorHandler,
  notFoundHandler,
  performanceLogger,
  requestLogger,
  apiUsageLogger,
} from './api/middleware';

// Load middleware in order
app.use(corsApiMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(logger);
app.use(apiUsageLogger);
app.use(performanceLogger(1000));
app.use('/api/', apiRateLimiter);
app.use('/api/scrape/', scrapeRateLimiter);

// Routes
app.use('/api/websites', websitesRouter);
app.use('/api/products', productsRouter);
app.use('/api/scrape', scrapeRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);
```

---

## Testing Middleware

### Test Error Handler

```typescript
app.get('/test/error', (req, res) => {
  throw new CustomError('Test error', 400, 'TEST_ERROR', { test: true });
});
```

### Test Logging

```bash
curl http://localhost:5000/api/health
# Check console for colored output
```

### Test Rate Limiting

```bash
# Make 101 requests quickly
for i in {1..101}; do
  curl http://localhost:5000/api/health
done
# 101st request should return 429
```

### Test Validation

```bash
curl -X POST http://localhost:5000/api/websites \
  -H "Content-Type: application/json" \
  -d '{"name": "x"}'  # Too short
# Should return validation error
```

### Test CORS

```javascript
// From browser at http://localhost:3000
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log);
// Should work if origin is whitelisted
```

---

## Best Practices

1. **Order Matters**: Load middleware in the correct order
2. **Error Handling**: Always use `asyncHandler` for async routes
3. **Validation**: Validate early, reject invalid requests
4. **Rate Limiting**: Adjust limits based on endpoint sensitivity
5. **Logging**: Use in production for debugging
6. **CORS**: Restrict to specific origins in production
7. **Authentication**: Use for protected routes
8. **Sanitization**: Always sanitize user input
9. **Custom Errors**: Use `CustomError` for API consistency
10. **Testing**: Test middleware with invalid inputs

---

## Configuration Examples

### Development Environment

```typescript
// More permissive for testing
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  app.use(allowAnyOrigin);           // Allow all origins
  app.use(createRateLimiter({
    maxRequests: 1000,                // High limit
    windowMs: 15 * 60 * 1000
  }));
} else {
  app.use(corsProdMiddleware);
  app.use(apiRateLimiter);            // Strict limit
}
```

### Production Environment

```typescript
// Restrictive for security
app.use(corsProdMiddleware);          // Only specific origins
app.use(apiRateLimiter);              // 100 req/15min
app.use(scrapeRateLimiter);           // 10 req/hour
app.use(logger);                      // Log all requests
app.use(errorHandler);                // Handle errors safely
```

---

## Performance Considerations

- **Rate Limiting**: In-memory store fine for single server; use Redis for multi-server
- **Logging**: Console logging has minimal overhead; can be optimized with file logging
- **Validation**: Schema validation is fast; custom validators should be optimized
- **CORS**: Preflight caching reduces OPTIONS requests
- **Error Handling**: Try-catch overhead is minimal (~1-2ms per request)

---

## Summary

The middleware layer provides:
- ✅ **Error Handling**: Centralized, consistent error responses
- ✅ **Logging**: Comprehensive request/response tracking
- ✅ **Rate Limiting**: API protection against abuse
- ✅ **Authentication**: JWT token and API key validation
- ✅ **Authorization**: Role-based access control
- ✅ **Validation**: Input validation and sanitization
- ✅ **CORS**: Cross-origin request handling

All middleware is properly typed with TypeScript and follows Express.js best practices.

---

**Status:** Production Ready ✅
**Version:** 1.0.0
**Last Updated:** 2025-10-31

