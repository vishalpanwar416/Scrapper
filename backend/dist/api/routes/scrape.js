import { Router } from 'express';
import prisma from '../../database/prisma.js';
import { scraperFactory } from '../../utils/scraperFactory.js';
import { getProgress, initializeProgress, clearProgress } from '../../utils/progressTracker.js';
import { asyncHandler, CustomError } from '../middleware/errorHandler.js';
const router = Router();
/**
 * Get scrape logs for a specific website
 */
router.get('/logs/:websiteId', asyncHandler(async (req, res) => {
    const { websiteId } = req.params;
    const limit = parseInt(String(req.query.limit || '20')) || 20;
    const page = parseInt(String(req.query.page || '1')) || 1;
    const skip = (page - 1) * limit;
    const logs = await prisma.scrapeLog.findMany({
        where: { websiteId },
        skip,
        take: limit,
        orderBy: { scrapedAt: 'desc' }
    });
    const total = await prisma.scrapeLog.count({ where: { websiteId } });
    res.json({
        success: true,
        data: logs,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
}));
/**
 * Get all scrape logs
 */
router.get('/logs', asyncHandler(async (req, res) => {
    const limit = parseInt(String(req.query.limit || '20')) || 20;
    const page = parseInt(String(req.query.page || '1')) || 1;
    const skip = (page - 1) * limit;
    const logs = await prisma.scrapeLog.findMany({
        skip,
        take: limit,
        include: { website: true },
        orderBy: { scrapedAt: 'desc' }
    });
    const total = await prisma.scrapeLog.count();
    res.json({
        success: true,
        data: logs,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
}));
/**
 * Get scraping progress for a website
 */
router.get('/progress/:websiteId', asyncHandler(async (req, res) => {
    const { websiteId } = req.params;
    const progress = getProgress(websiteId);
    if (!progress) {
        return res.json({
            success: true,
            websiteId,
            stage: 'idle',
            message: 'No active scraping',
            progress: 0
        });
    }
    res.json({ success: true, ...progress });
}));
/**
 * Get list of registered scrapers
 */
router.get('/scrapers/list', (req, res) => {
    try {
        const scrapers = scraperFactory.getRegisteredWebsites();
        res.json({
            success: true,
            registered: scrapers,
            total: scrapers.length
        });
    }
    catch (error) {
        console.error('Error fetching scrapers:', error);
        throw new CustomError('Failed to fetch scrapers', 500, 'SCRAPER_LIST_ERROR');
    }
});
/**
 * Check if website has a specific scraper
 */
router.get('/scrapers/check/:websiteName', (req, res) => {
    try {
        const { websiteName } = req.params;
        const hasSpecific = scraperFactory.hasSpecificScraper(websiteName);
        res.json({
            success: true,
            website: websiteName,
            hasSpecificScraper: hasSpecific,
            scraperType: hasSpecific ? 'specific' : 'generic'
        });
    }
    catch (error) {
        console.error('Error checking scraper:', error);
        throw new CustomError('Failed to check scraper', 500, 'SCRAPER_CHECK_ERROR');
    }
});
/**
 * Start scraping for a single website
 */
router.post('/start/:websiteName', asyncHandler(async (req, res) => {
    const { websiteName } = req.params;
    const key = String(websiteName).toLowerCase().replace(/[^a-z0-9]/g, '');
    console.log(`[Scrape] Starting scrape for website: ${websiteName}`);
    const website = await prisma.website.findUnique({ where: { name: key } });
    if (!website) {
        throw new CustomError('Website not found', 404, 'WEBSITE_NOT_FOUND');
    }
    if (!website.enabled) {
        throw new CustomError('Website is disabled', 400, 'WEBSITE_DISABLED');
    }
    // Initialize progress tracking
    initializeProgress(website.id);
    try {
        // Get scraper from factory (specific or generic)
        const { type, scraper } = scraperFactory.getScraper(websiteName);
        let result;
        console.log(`[Scrape] Using ${type} scraper for ${websiteName}`);
        if (type === 'specific') {
            result = await scraper(website.id);
        }
        else {
            result = await scraper(website.id, website.url);
        }
        // Create scrape log
        const scrapeLog = await prisma.scrapeLog.create({
            data: {
                websiteId: website.id,
                itemsScraped: result.itemsScraped || 0,
                itemsUpdated: result.itemsUpdated || 0,
                status: result.success ? 'success' : 'failed',
                errorMessage: result.error || null,
            },
        });
        // Update website last scraped time
        await prisma.website.update({
            where: { id: website.id },
            data: { lastScrapedAt: new Date() }
        });
        console.log(`[Scrape] Completed for ${websiteName}. Scraped: ${result.itemsScraped}, Updated: ${result.itemsUpdated}`);
        res.json({
            success: true,
            message: `Scraping completed for ${websiteName}`,
            data: scrapeLog
        });
    }
    catch (error) {
        console.error(`[Scrape] Error scraping ${websiteName}:`, error?.message || error);
        throw new CustomError('Scraping failed', 500, 'SCRAPE_ERROR', { website: websiteName, error: error?.message || 'Unknown error' });
    }
    finally {
        // Clear progress after completion
        clearProgress(website.id);
    }
}));
/**
 * Scrape all enabled websites
 */
router.post('/start-all', asyncHandler(async (req, res) => {
    console.log('[Scrape] Starting batch scrape of all enabled websites');
    const websites = await prisma.website.findMany({ where: { enabled: true } });
    if (websites.length === 0) {
        throw new CustomError('No enabled websites found', 404, 'NO_WEBSITES');
    }
    const results = await Promise.all(websites.map(async (website) => {
        try {
            initializeProgress(website.id);
            const { type, scraper } = scraperFactory.getScraper(website.name);
            let result;
            if (type === 'specific') {
                result = await scraper(website.id);
            }
            else {
                result = await scraper(website.id, website.url);
            }
            await prisma.scrapeLog.create({
                data: {
                    websiteId: website.id,
                    itemsScraped: result.itemsScraped || 0,
                    itemsUpdated: result.itemsUpdated || 0,
                    status: result.success ? 'success' : 'failed',
                    errorMessage: result.error || null,
                },
            });
            await prisma.website.update({
                where: { id: website.id },
                data: { lastScrapedAt: new Date() }
            });
            return {
                website: website.name,
                success: result.success,
                itemsScraped: result.itemsScraped,
                itemsUpdated: result.itemsUpdated,
                error: result.error || null
            };
        }
        catch (error) {
            console.error(`[Scrape] Error scraping ${website.name}:`, error?.message);
            return {
                website: website.name,
                success: false,
                error: error?.message || 'Unknown error'
            };
        }
        finally {
            clearProgress(website.id);
        }
    }));
    res.json({
        success: true,
        message: 'Batch scraping completed',
        results,
        summary: {
            total: results.length,
            successful: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length
        }
    });
}));
export default router;
