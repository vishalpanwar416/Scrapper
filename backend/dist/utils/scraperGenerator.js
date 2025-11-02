import fs from 'fs/promises';
import path from 'path';
/**
 * Generate a new scraper file dynamically when a website is added
 */
export class ScraperGenerator {
    constructor() {
        this.scrapersDir = path.join(process.cwd(), 'src', 'scrapers');
    }
    /**
     * Generate a scraper file for a new website
     */
    async generateScraperFile(websiteName, websiteUrl) {
        // Sanitize website name for use as file name and function name
        const sanitizedName = String(websiteName)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .trim();
        if (!sanitizedName) {
            throw new Error('Website name must contain at least one alphanumeric character');
        }
        const fileName = `${sanitizedName}.ts`;
        const filePath = path.join(this.scrapersDir, fileName);
        const functionName = `scrape${sanitizedName.charAt(0).toUpperCase() + sanitizedName.slice(1)}`;
        // Check if file already exists
        try {
            await fs.access(filePath);
            console.log(`[ScraperGenerator] Scraper file already exists: ${filePath}`);
            return { filePath, functionName };
        }
        catch {
            // File doesn't exist, create it
        }
        // Generate the scraper template
        const scraperTemplate = this.generateScraperTemplate(sanitizedName, functionName, websiteUrl);
        // Write the file
        await fs.writeFile(filePath, scraperTemplate, 'utf-8');
        console.log(`[ScraperGenerator] Created scraper file: ${filePath}`);
        return { filePath, functionName };
    }
    /**
     * Generate scraper template based on website
     */
    generateScraperTemplate(websiteName, functionName, websiteUrl) {
        const currentDate = new Date().toISOString().split('T')[0];
        return `/**
 * Auto-generated scraper for ${websiteName}
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

/**
 * Scraper for ${websiteName}
 * Customize the selectors and logic below based on the website structure
 */
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
    updateProgress_('starting', 'Initializing scraper for ${websiteName}...', 10);

    // Launch browser
    browser = await launchBrowser();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(40000);
    page.setDefaultTimeout(40000);

    console.log(\`[${websiteName}] Scraping website...\`);
    updateProgress_('navigating', 'Navigating to website...', 20);

    // Navigate to the website
    await page.goto('${websiteUrl}', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // TODO: Customize the CSS selectors below based on the actual website structure
    // You can inspect the website and find the correct selectors

    updateProgress_('scraping', 'Waiting for products to load...', 30);

    // Wait for products to load (customize selector as needed)
    await Promise.race([
      page.waitForSelector('[class*="product"], [class*="item"]', {
        timeout: 30000,
      }),
      new Promise(resolve => setTimeout(resolve, 8000)),
    ]).catch(() => {
      console.log('[${websiteName}] Timeout waiting for products - continuing anyway');
    });

    updateProgress_('scraping', 'Extracting product data...', 50);

    // Extract products from the page
    const products = await page.evaluate(() => {
      const items: any[] = [];
      const seenUrls = new Set<string>();

      // TODO: Customize these selectors for the actual website
      // Example: change 'div.product' to the actual product container selector
      const productElements = document.querySelectorAll(
        '[class*="product"], [class*="item"], article'
      );

      productElements.forEach(el => {
        try {
          // Extract product details - customize these selectors
          const titleElement = el.querySelector('[class*="title"], [class*="name"], h1, h2, h3');
          const title = titleElement?.textContent?.trim() || '';

          const priceElement = el.querySelector('[class*="price"], .price, [data-price]');
          const priceText = priceElement?.textContent?.trim() || '';
          const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

          const linkElement = el.querySelector('a[href]') as HTMLAnchorElement;
          const productUrl = linkElement?.href || '';

          const imageElement = el.querySelector('img');
          const imageUrl = imageElement?.src || imageElement?.getAttribute('data-src') || '';

          // Only add if we have at least title and URL
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

    // Save products to database
    const { newCount, updatedCount } = await saveProductsToDatabase(
      products as ScrapedProduct[],
      websiteId
    );

    updateProgress_('completed', 'Scraping completed successfully', 100);

    console.log(
      \`[${websiteName}] Scraping complete: \${newCount} new, \${updatedCount} updated\`
    );

    return {
      itemsScraped: newCount,
      itemsUpdated: updatedCount,
      status: 'completed',
    };
  } catch (error: any) {
    console.error(\`[${websiteName}] Scraping error:\`, error.message);
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
}
export const scraperGenerator = new ScraperGenerator();
