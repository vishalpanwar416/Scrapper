/**
 * Middleware Index
 * Central export point for all middleware functions
 */

// Error Handling
export {
  errorHandler,
  CustomError,
  asyncHandler,
  notFoundHandler,
  type ApiError,
} from './errorHandler.js';

// Logging
export {
  logger,
  requestLogger,
  apiUsageLogger,
  performanceLogger,
  type LogContext,
} from './logger.js';

// Rate Limiting
export {
  createRateLimiter,
  apiRateLimiter,
  scrapeRateLimiter,
  authRateLimiter,
  strictRateLimiter,
  type RateLimitConfig,
  type RequestRecord,
} from './rateLimiter.js';

// Authentication & Authorization
export {
  authenticate,
  optionalAuth,
  authorize,
  apiKeyAuth,
  rbac,
  perUserRateLimit,
  generateTestToken,
  type AuthRequest,
} from './auth.js';

// Input Validation
export {
  validateBody,
  validateQuery,
  validateParams,
  validate,
  sanitizeBody,
  trimStrings,
  validateScraperInput,
  validateWebsiteCreation,
  validateProductFilter,
  type ValidationRule,
  type ValidationSchema,
} from './validation.js';

// CORS
export {
  createCorsMiddleware,
  corsDevMiddleware,
  corsProdMiddleware,
  corsApiMiddleware,
  corsStrictMiddleware,
  corsErrorHandler,
  disableCors,
  allowAnyOrigin,
  type CorsOptions,
} from './cors.js';
