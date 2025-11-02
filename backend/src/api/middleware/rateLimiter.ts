/**
 * Rate Limiting Middleware
 * Limits the number of requests from a client within a time window
 */

import { Request, Response, NextFunction } from 'express';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

export interface RequestRecord {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limiter store
 * For production, consider using Redis
 */
class RateLimiterStore {
  private store: Map<string, RequestRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(windowMs: number) {
    // Cleanup old entries every window interval
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (record.resetTime < now) {
          this.store.delete(key);
        }
      }
    }, windowMs);
  }

  /**
   * Increment request count for a key
   */
  increment(key: string, windowMs: number): { count: number; remaining: number } {
    const now = Date.now();
    let record = this.store.get(key);

    if (!record || record.resetTime < now) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
    } else {
      record.count++;
    }

    this.store.set(key, record);
    return {
      count: record.count,
      remaining: record.resetTime - now,
    };
  }

  /**
   * Get request count for a key
   */
  get(key: string): RequestRecord | undefined {
    const record = this.store.get(key);
    if (record && record.resetTime < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return record;
  }

  /**
   * Reset count for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

/**
 * Create rate limiter middleware
 */
export const createRateLimiter = (config: RateLimitConfig) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config;

  const store = new RateLimiterStore(windowMs);

  return (req: Request, res: Response, next: NextFunction) => {
    // Get client IP address
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate-limit:${clientIp}`;

    // Store original send method to intercept response
    const originalSend = res.json.bind(res);

    // Override send to handle skip logic after response status is known
    res.json = function(data: any) {
      // Check if we should skip counting this request based on response status
      const skipCheck = (skipSuccessfulRequests && res.statusCode < 400) ||
                        (skipFailedRequests && res.statusCode >= 400);

      if (!skipCheck) {
        // Only decrement if we're skipping (we increment before, now we undo)
        const record = store.get(key);
        if (record) {
          record.count = Math.max(0, record.count - 1);
        }
      }

      return originalSend(data);
    };

    // Increment request count
    const { count, remaining } = store.increment(key, windowMs);

    // Set rate limit headers
    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', Math.max(0, maxRequests - count));
    res.setHeader('RateLimit-Reset', remaining);

    // Check if limit exceeded
    if (count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfter: Math.ceil(Math.max(0, remaining) / 1000),
        },
      });
    }

    next();
  };
};

/**
 * Rate limiter for general API routes
 * 100 requests per 15 minutes per IP
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later.',
});

/**
 * Rate limiter for scraping routes
 * 10 requests per hour per IP (scraping is resource intensive)
 */
export const scrapeRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Too many scraping requests. Please try again after 1 hour.',
});

/**
 * Rate limiter for authentication routes
 * 5 attempts per 15 minutes (for login/signup)
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts. Please try again later.',
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Rate limiter for strict endpoints
 * 1 request per minute (for sensitive operations)
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 1,
  message: 'Too many requests. Please wait before trying again.',
});
