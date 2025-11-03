/**
 * Scraper Management Routes
 * Allows viewing, editing, and managing scraper files
 */

import { Router, Request, Response } from 'express';
import prisma from '../../database/prisma.js';
import { scraperFileManager } from '../../utils/scraperFileManager.js';
import { asyncHandler, CustomError } from '../middleware/errorHandler.js';

const router = Router();

/**
 * Get list of all scrapers (built-in + custom)
 */
router.get('/list', asyncHandler(async (req: Request, res: Response) => {
  const scrapers = await scraperFileManager.listScrapers();

  res.json({
    success: true,
    scrapers,
    total: scrapers.length,
  });
}));

/**
 * Get scraper content by website name
 */
router.get('/:websiteName', asyncHandler(async (req: Request, res: Response) => {
  const { websiteName } = req.params;

  const scraper = await scraperFileManager.getScraperContent(websiteName);

  if (!scraper) {
    throw new CustomError(
      `Scraper not found for website: ${websiteName}`,
      404,
      'SCRAPER_NOT_FOUND'
    );
  }

  res.json({
    success: true,
    websiteName,
    ...scraper,
  });
}));

/**
 * Update scraper file content
 */
router.put('/:websiteName', asyncHandler(async (req: Request, res: Response) => {
  const { websiteName } = req.params;
  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    throw new CustomError(
      'Content is required and must be a string',
      400,
      'INVALID_CONTENT'
    );
  }

  if (content.length > 100000) {
    throw new CustomError(
      'Scraper file too large (max 100KB)',
      413,
      'FILE_TOO_LARGE'
    );
  }

  try {
    const result = await scraperFileManager.updateScraperContent(websiteName, content);

    if (!result.success) {
      throw new Error(result.error);
    }

    res.json({
      success: true,
      message: 'Scraper updated successfully',
      websiteName,
      filePath: result.filePath,
      needsBuild: true,
      buildCommand: 'npm run build',
    });
  } catch (error: any) {
    throw new CustomError(
      `Failed to update scraper: ${error.message}`,
      500,
      'SCRAPER_UPDATE_ERROR'
    );
  }
}));

/**
 * Get scraper syntax with examples
 */
router.get('/:websiteName/syntax', asyncHandler(async (req: Request, res: Response) => {
  const { websiteName } = req.params;

  const syntax = scraperFileManager.getScraperSyntax(websiteName);

  res.json({
    success: true,
    websiteName,
    syntax,
    tips: [
      'Use common CSS selectors: [class*="product"], a[href*="/product"]',
      'Test selectors in browser console: document.querySelectorAll(selector)',
      'Price extraction: remove non-numeric characters with regex',
      'Handle missing data: use || fallback_value',
      'Log debug info: console.log() in page.evaluate()',
    ],
  });
}));

/**
 * Validate scraper syntax
 */
router.post('/:websiteName/validate', asyncHandler(async (req: Request, res: Response) => {
  const { websiteName } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new CustomError('Content is required', 400, 'MISSING_CONTENT');
  }

  const validation = scraperFileManager.validateScraperSyntax(content);

  res.json({
    success: true,
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings,
  });
}));

/**
 * Get scraper test result
 */
router.post('/:websiteName/test', asyncHandler(async (req: Request, res: Response) => {
  const { websiteName } = req.params;
  const { url } = req.body;

  if (!url) {
    throw new CustomError('URL is required for testing', 400, 'MISSING_URL');
  }

  try {
    new URL(url);
  } catch {
    throw new CustomError('Invalid URL format', 400, 'INVALID_URL');
  }

  // This would require actually running the scraper
  // For now, return a placeholder
  res.json({
    success: true,
    message: 'Scraper test would run here (requires full build)',
    needsBuild: true,
    note: 'After editing, run npm run build, then test on production',
  });
}));

/**
 * Get scraper template for a new website
 */
router.post('/template/:websiteName', asyncHandler(async (req: Request, res: Response) => {
  const { websiteName } = req.params;
  const { url } = req.body;

  if (!url) {
    throw new CustomError('URL is required', 400, 'MISSING_URL');
  }

  const template = scraperFileManager.getScraperTemplate(websiteName, url);

  res.json({
    success: true,
    websiteName,
    template,
    note: 'Customize this template with actual CSS selectors from the website',
  });
}));

export default router;
