import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import websitesRouter from './api/routes/websites.js';
import productsRouter from './api/routes/products.js';
import scrapeRouter from './api/routes/scrape.js';
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
} from './api/middleware/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE SETUP (Order matters!)
// ============================================================================

// 1. CORS - Handle cross-origin requests first
app.use(corsApiMiddleware);

// 2. Body Parser - Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Logging & Monitoring - Log all incoming requests
app.use(requestLogger); // Detailed request logging in dev mode
app.use(logger); // Standard HTTP logging
app.use(apiUsageLogger); // Track API usage
app.use(performanceLogger(1000)); // Log slow requests (>1000ms)

// 4. Rate Limiting - Apply rate limiting to protect API
app.use('/api/', apiRateLimiter); // General API rate limit: 100 req/15min per IP
app.use('/api/scrape/', scrapeRateLimiter); // Scraper-specific: 10 req/hour per IP

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint (no auth required)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/websites', websitesRouter);
app.use('/api/products', productsRouter);
app.use('/api/scrape', scrapeRouter);

// ============================================================================
// ERROR HANDLING (Order matters! Should be last)
// ============================================================================

// 404 Not Found handler
app.use(notFoundHandler);

// Global error handler (MUST be last middleware)
app.use(errorHandler);

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Middleware loaded:`);
  console.log(`  • CORS - ✓`);
  console.log(`  • Body Parser - ✓`);
  console.log(`  • Request Logger - ✓`);
  console.log(`  • Rate Limiter - ✓`);
  console.log(`  • Error Handler - ✓`);
  console.log(`${'═'.repeat(60)}\n`);
});
