import prisma from '../database/prisma.js';
import { scraperFactory } from './scraperFactory.js';
import { initializeProgress, clearProgress } from './progressTracker.js';
/**
 * AutoScraper handles automatic scraping of websites
 * Can be triggered on website creation or on demand
 */
export class AutoScraper {
    /**
     * Auto-trigger scraping for a newly added website
     * Runs asynchronously without blocking the API response
     */
    static async triggerScrapeAsync(websiteId) {
        // Run asynchronously in the background with proper error handling
        return new Promise((resolve) => {
            setImmediate(async () => {
                try {
                    await this.scrapeWebsite(websiteId);
                }
                catch (error) {
                    console.error(`[AutoScraper] Error during async scrape for website ${websiteId}:`, error);
                    // Log error but don't throw to prevent uncaught promise rejections
                }
                finally {
                    resolve();
                }
            });
        });
    }
    /**
     * Synchronous trigger for scraping (waits for completion)
     */
    static async triggerScrapSync(websiteId) {
        try {
            return await this.scrapeWebsite(websiteId);
        }
        catch (error) {
            console.error(`[AutoScraper] Error during sync scrape for website ${websiteId}:`, error);
            throw error;
        }
    }
    /**
     * Internal method that performs the actual scraping
     */
    static async scrapeWebsite(websiteId) {
        try {
            // Get website details
            const website = await prisma.website.findUnique({
                where: { id: websiteId },
            });
            if (!website) {
                console.error(`[AutoScraper] Website not found: ${websiteId}`);
                return { success: false, error: 'Website not found' };
            }
            if (!website.enabled) {
                console.log(`[AutoScraper] Website is disabled: ${website.name}`);
                return { success: false, error: 'Website is disabled' };
            }
            console.log(`[AutoScraper] Starting scrape for: ${website.name} (${website.url})`);
            // Initialize progress tracking
            initializeProgress(websiteId);
            // Get the appropriate scraper
            const { type, scraper } = scraperFactory.getScraper(website.name);
            // Execute scraper based on type
            let result;
            if (type === 'specific') {
                result = await scraper(websiteId);
            }
            else {
                result = await scraper(websiteId, website.url);
            }
            // Log the scrape result
            const scrapeLog = await prisma.scrapeLog.create({
                data: {
                    websiteId: websiteId,
                    itemsScraped: result.itemsScraped || 0,
                    itemsUpdated: result.itemsUpdated || 0,
                    status: result.status || 'failed',
                    errorMessage: result.error || null,
                },
            });
            // Update website last scraped timestamp
            await prisma.website.update({
                where: { id: websiteId },
                data: { lastScrapedAt: new Date() },
            });
            // Clear progress
            clearProgress(websiteId);
            console.log(`[AutoScraper] Scrape completed for ${website.name}: ${result.itemsScraped} items scraped`);
            return { success: true, data: scrapeLog };
        }
        catch (error) {
            console.error(`[AutoScraper] Scraping failed for website ${websiteId}:`, error);
            clearProgress(websiteId);
            return { success: false, error: error?.message || 'Unknown error' };
        }
    }
    /**
     * Scrape multiple websites in sequence
     */
    static async scrapeMultiple(websiteIds) {
        const results = [];
        for (const websiteId of websiteIds) {
            const result = await this.scrapeWebsite(websiteId);
            results.push(result);
            // Add small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        return results;
    }
    /**
     * Scrape all enabled websites
     */
    static async scrapeAll() {
        try {
            const websites = await prisma.website.findMany({
                where: { enabled: true },
            });
            console.log(`[AutoScraper] Starting batch scrape for ${websites.length} websites`);
            const results = await this.scrapeMultiple(websites.map(w => w.id));
            console.log(`[AutoScraper] Batch scrape completed`);
            return results;
        }
        catch (error) {
            console.error('[AutoScraper] Error during batch scrape:', error);
            throw error;
        }
    }
}
export default AutoScraper;
