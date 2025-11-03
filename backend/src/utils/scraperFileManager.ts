/**
 * Scraper File Manager
 * Handles reading, writing, and validating scraper files
 */

import fs from 'fs/promises';
import path from 'path';

export interface ScraperInfo {
  name: string;
  filePath: string;
  fileName: string;
  isCustom: boolean;
  createdAt: Date;
  modifiedAt: Date;
  size: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class ScraperFileManager {
  private scrapersDir = path.join(process.cwd(), 'src', 'scrapers');
  private defaultScrapers = ['snitch', 'rarerabbit', 'offduety', 'zara', 'beyoung', 'generic'];

  /**
   * List all available scrapers
   */
  async listScrapers(): Promise<ScraperInfo[]> {
    try {
      const files = await fs.readdir(this.scrapersDir);
      const scrapers: ScraperInfo[] = [];

      for (const file of files) {
        if (file.endsWith('.ts') && !file.endsWith('.test.ts')) {
          const name = file.replace('.ts', '');
          const filePath = path.join(this.scrapersDir, file);
          const stats = await fs.stat(filePath);

          scrapers.push({
            name,
            filePath,
            fileName: file,
            isCustom: !this.defaultScrapers.includes(name),
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            size: stats.size,
          });
        }
      }

      return scrapers.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error listing scrapers:', error);
      return [];
    }
  }

  /**
   * Get scraper file content
   */
  async getScraperContent(websiteName: string): Promise<{ content: string; fileName: string } | null> {
    try {
      const sanitized = String(websiteName).toLowerCase().replace(/[^a-z0-9]/g, '');
      const filePath = path.join(this.scrapersDir, `${sanitized}.ts`);

      const content = await fs.readFile(filePath, 'utf-8');

      return {
        content,
        fileName: `${sanitized}.ts`,
      };
    } catch (error) {
      console.error(`Error reading scraper ${websiteName}:`, error);
      return null;
    }
  }

  /**
   * Update scraper file content
   */
  async updateScraperContent(
    websiteName: string,
    content: string
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // Validate content first
      const validation = this.validateScraperSyntax(content);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Syntax errors: ${validation.errors.join(', ')}`,
        };
      }

      const sanitized = String(websiteName).toLowerCase().replace(/[^a-z0-9]/g, '');
      const filePath = path.join(this.scrapersDir, `${sanitized}.ts`);

      await fs.writeFile(filePath, content, 'utf-8');

      console.log(`[ScraperFileManager] Updated scraper: ${sanitized}`);

      return {
        success: true,
        filePath,
      };
    } catch (error: any) {
      console.error('Error updating scraper:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate scraper TypeScript syntax
   */
  validateScraperSyntax(content: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required imports
    if (!content.includes('import prisma')) {
      errors.push('Missing: import prisma');
    }
    if (!content.includes('launchBrowser')) {
      errors.push('Missing: launchBrowser function call');
    }
    if (!content.includes('await page.goto')) {
      errors.push('Missing: page.goto() call');
    }
    if (!content.includes('saveProductsToDatabase')) {
      errors.push('Missing: saveProductsToDatabase function call');
    }

    // Check for export function
    if (!content.includes('export async function scrape')) {
      errors.push('Missing: export async function scrape*()');
    }

    // Check for return statement
    if (!content.includes('return {')) {
      errors.push('Missing: return statement with results object');
    }

    // Check for browser cleanup
    if (!content.includes('closeBrowser')) {
      warnings.push('Missing browser cleanup: closeBrowser() in finally block');
    }

    // Check for error handling
    if (!content.includes('try') || !content.includes('catch')) {
      warnings.push('Missing try-catch error handling');
    }

    // Check for basic syntax
    const bracketCount = (content.match(/{/g) || []).length;
    const closingCount = (content.match(/}/g) || []).length;
    if (bracketCount !== closingCount) {
      errors.push('Mismatched brackets');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Delete scraper file for a website
   *
   * @param websiteName - The name of the website whose scraper file should be deleted
   * @returns Promise with success status, file path (if deleted), and any error message
   *
   * @example
   * ```typescript
   * const result = await scraperFileManager.deleteScraperFile('amazon');
   * if (result.success) {
   *   console.log(`Deleted scraper: ${result.filePath}`);
   * }
   * ```
   *
   * @remarks
   * - This method is non-blocking and will not throw errors
   * - It handles edge cases like missing files, permission issues, and invalid names
   * - Default scrapers cannot be deleted
   * - The deletion is logged for audit purposes
   */
  async deleteScraperFile(
    websiteName: string
  ): Promise<{ success: boolean; filePath?: string; error?: string; isDefaultScraper?: boolean }> {
    try {
      // Validate input
      if (!websiteName || typeof websiteName !== 'string') {
        return {
          success: false,
          error: 'Invalid website name: must be a non-empty string',
        };
      }

      // Sanitize the name to match file naming conventions
      // This ensures we're looking for the correct file
      const sanitized = String(websiteName)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();

      // Check if the name is empty after sanitization
      if (!sanitized) {
        return {
          success: false,
          error: 'Invalid website name: no valid characters after sanitization',
        };
      }

      // Prevent deletion of default scrapers (these are built-in)
      if (this.defaultScrapers.includes(sanitized)) {
        console.log(`[ScraperFileManager] ⚠️  Cannot delete default scraper: ${sanitized}`);
        return {
          success: false,
          error: `Cannot delete default scraper: ${sanitized}`,
          isDefaultScraper: true,
        };
      }

      // Construct the file path
      const filePath = path.join(this.scrapersDir, `${sanitized}.ts`);

      // Check if file exists before attempting deletion
      try {
        await fs.access(filePath);
      } catch (error) {
        // File doesn't exist - this is not an error, just log it
        console.log(`[ScraperFileManager] ℹ️  Scraper file not found (already deleted or never created): ${sanitized}.ts`);
        return {
          success: true,
          filePath,
          error: undefined,
        };
      }

      // Delete the file
      await fs.unlink(filePath);

      console.log(`[ScraperFileManager] ✅ Deleted scraper file: ${sanitized}.ts`);
      console.log(`[ScraperFileManager] 📂 Path: ${filePath}`);

      return {
        success: true,
        filePath,
      };
    } catch (error: any) {
      // Handle specific errors
      const errorMessage = error.message || 'Unknown error';
      const errorCode = error.code;

      // Log the error for debugging
      console.error(`[ScraperFileManager] ❌ Error deleting scraper file:`, {
        websiteName,
        error: errorMessage,
        code: errorCode,
      });

      // Handle specific error codes
      if (errorCode === 'ENOENT') {
        // File not found - treat as success since the goal is to not have the file
        return {
          success: true,
          error: 'File not found (already deleted)',
        };
      } else if (errorCode === 'EACCES' || errorCode === 'EPERM') {
        // Permission denied
        return {
          success: false,
          error: `Permission denied: cannot delete scraper file. Check file permissions.`,
        };
      } else if (errorCode === 'EBUSY') {
        // File is busy/in use
        return {
          success: false,
          error: `File is currently in use and cannot be deleted. Try again later.`,
        };
      }

      // Generic error
      return {
        success: false,
        error: `Failed to delete scraper file: ${errorMessage}`,
      };
    }
  }

  /**
   * Get scraper template
   */
  getScraperTemplate(websiteName: string, websiteUrl: string): string {
    const sanitized = String(websiteName)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();

    const functionName = `scrape${sanitized.charAt(0).toUpperCase() + sanitized.slice(1)}`;
    const currentDate = new Date().toISOString().split('T')[0];

    return `/**
 * Scraper for ${websiteName}
 * Created: ${currentDate}
 * Website: ${websiteUrl}
 */

import prisma from '../database/prisma.js';
import {
  launchBrowser,
  closeBrowser,
  closePage,
  ScrapedProduct,
  saveProductsToDatabase,
  ProgressCallback,
} from './utils.js';
import { updateProgress } from '../utils/progressTracker.js';

export async function ${functionName}(
  websiteId: string,
  progressCallback?: ProgressCallback
): Promise<{ itemsScraped: number; itemsUpdated: number; status: string; error?: string }> {
  let browser = null;

  const updateProgress_ = (stage: string, message: string, progress: number) => {
    updateProgress(websiteId, stage as any, message, progress);
    if (progressCallback) progressCallback(stage, message, progress);
  };

  try {
    updateProgress_('starting', 'Initializing scraper...', 10);

    // Launch browser
    browser = await launchBrowser();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(40000);
    page.setDefaultTimeout(40000);

    console.log(\`[${websiteName}] Scraping: ${websiteUrl}\`);
    updateProgress_('navigating', 'Navigating to website...', 20);

    // Navigate to website
    await page.goto('${websiteUrl}', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    updateProgress_('scraping', 'Waiting for products to load...', 30);

    // Wait for products to load
    await Promise.race([
      page.waitForSelector('[class*="product"]', { timeout: 30000 }),
      new Promise(resolve => setTimeout(resolve, 8000)),
    ]).catch(() => {
      console.log('[${websiteName}] Timeout waiting for products');
    });

    updateProgress_('scraping', 'Extracting products...', 50);

    // Extract products
    const products = await page.evaluate(() => {
      const items: any[] = [];
      const seenUrls = new Set<string>();

      // TODO: Update these selectors based on the actual website structure
      // Inspect the website and find the correct CSS selectors
      const productElements = document.querySelectorAll('[class*="product"]');

      productElements.forEach((el) => {
        try {
          // TODO: Customize these selectors for the website
          const titleEl = el.querySelector('[class*="title"], h2, h3');
          const title = titleEl?.textContent?.trim() || '';

          const priceEl = el.querySelector('[class*="price"]');
          const priceText = priceEl?.textContent?.trim() || '';
          const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

          const linkEl = el.querySelector('a[href]') as HTMLAnchorElement;
          const productUrl = linkEl?.href || '';

          const imageEl = el.querySelector('img');
          const imageUrl = imageEl?.src || '';

          if (title && productUrl && !seenUrls.has(productUrl)) {
            seenUrls.add(productUrl);
            items.push({
              title: title.substring(0, 255),
              url: productUrl,
              price: price > 0 ? price : null,
              imageUrl: imageUrl.substring(0, 500),
              description: '',
            });
          }
        } catch (error) {
          console.error('Error extracting product:', error);
        }
      });

      return items;
    });

    console.log(\`[${websiteName}] Found \${products.length} products\`);
    updateProgress_('saving', 'Saving products to database...', 70);

    // Save to database
    const { newCount, updatedCount } = await saveProductsToDatabase(
      products as ScrapedProduct[],
      websiteId
    );

    updateProgress_('completed', 'Scraping completed', 100);

    console.log(
      \`[${websiteName}] Complete: \${newCount} new, \${updatedCount} updated\`
    );

    return {
      itemsScraped: newCount,
      itemsUpdated: updatedCount,
      status: 'completed',
    };
  } catch (error: any) {
    console.error(\`[${websiteName}] Error:\`, error.message);
    updateProgress_('failed', \`Error: \${error.message}\`, 0);

    return {
      itemsScraped: 0,
      itemsUpdated: 0,
      status: 'failed',
      error: error.message,
    };
  } finally {
    if (browser) {
      await closeBrowser(browser);
    }
  }
}
`;
  }

  /**
   * Get syntax help and tips
   */
  getScraperSyntax(websiteName: string): object {
    return {
      selectors: {
        product: 'CSS selector for product container',
        title: 'CSS selector for product title',
        price: 'CSS selector for price',
        image: 'CSS selector for image',
        link: 'CSS selector for product link',
      },
      examples: {
        basic: 'document.querySelectorAll(".product-item")',
        attributes: 'el.getAttribute("data-product-id")',
        text: 'el.textContent?.trim()',
        regex: 'priceText.replace(/[^0-9.]/g, "")',
        fallback: 'title || "Unknown Product"',
      },
      commonSelectors: {
        byClass: '[class*="product"]',
        byAttribute: 'a[href*="/product"]',
        byTag: 'article, li',
        combined: 'div.card > a.product-link',
      },
      helpers: {
        parsePrice: 'parseFloat(text.replace(/[^0-9.]/g, ""))',
        getText: 'el.textContent?.trim()',
        getAttr: 'el.getAttribute("data-url")',
        getSrc: 'img?.src || img?.getAttribute("data-src")',
      },
    };
  }
}

export const scraperFileManager = new ScraperFileManager();
