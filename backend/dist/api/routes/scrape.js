import { Router } from 'express';
import prisma from '../../database/prisma.js';
import { scraperFactory } from '../../utils/scraperFactory.js';
import { AutoScraper } from '../../utils/autoScraper.js';
import { getProgress, initializeProgress, clearProgress } from '../../utils/progressTracker.js';
const router = Router();
router.get('/logs/:websiteId', async (req, res) => {
    try {
        const { websiteId } = req.params;
        const limit = parseInt(String(req.query.limit || '20')) || 20;
        const page = parseInt(String(req.query.page || '1')) || 1;
        const skip = (page - 1) * limit;
        const logs = await prisma.scrapeLog.findMany({ where: { websiteId }, skip, take: limit, orderBy: { scrapedAt: 'desc' } });
        const total = await prisma.scrapeLog.count({ where: { websiteId } });
        res.json({ data: logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (error) {
        console.error('Error fetching scrape logs:', error);
        res.status(500).json({ error: 'Failed to fetch scrape logs' });
    }
});
router.get('/logs', async (req, res) => {
    try {
        const limit = parseInt(String(req.query.limit || '20')) || 20;
        const page = parseInt(String(req.query.page || '1')) || 1;
        const skip = (page - 1) * limit;
        const logs = await prisma.scrapeLog.findMany({ skip, take: limit, include: { website: true }, orderBy: { scrapedAt: 'desc' } });
        const total = await prisma.scrapeLog.count();
        res.json({ data: logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (error) {
        console.error('Error fetching scrape logs:', error);
        res.status(500).json({ error: 'Failed to fetch scrape logs' });
    }
});
router.get('/progress/:websiteId', async (req, res) => {
    try {
        const { websiteId } = req.params;
        const progress = getProgress(websiteId);
        if (!progress) {
            return res.json({
                websiteId,
                stage: 'idle',
                message: 'No active scraping',
                progress: 0
            });
        }
        res.json(progress);
    }
    catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});
// Get list of registered scrapers
router.get('/scrapers/list', (req, res) => {
    try {
        const scrapers = scraperFactory.getRegisteredWebsites();
        res.json({ registered: scrapers, total: scrapers.length });
    }
    catch (error) {
        console.error('Error fetching scrapers:', error);
        res.status(500).json({ error: 'Failed to fetch scrapers' });
    }
});
// Check if website has a specific scraper
router.get('/scrapers/check/:websiteName', (req, res) => {
    try {
        const { websiteName } = req.params;
        const hasSpecific = scraperFactory.hasSpecificScraper(websiteName);
        res.json({
            website: websiteName,
            hasSpecificScraper: hasSpecific,
            scraperType: hasSpecific ? 'specific' : 'generic'
        });
    }
    catch (error) {
        console.error('Error checking scraper:', error);
        res.status(500).json({ error: 'Failed to check scraper' });
    }
});
// Start scraping for a single website
router.post('/start/:websiteName', async (req, res) => {
    try {
        const { websiteName } = req.params;
        const key = String(websiteName).toLowerCase().replace(/[^a-z0-9]/g, '');
        const website = await prisma.website.findUnique({ where: { name: key } });
        if (!website)
            return res.status(404).json({ error: 'Website not found' });
        if (!website.enabled)
            return res.status(400).json({ error: 'Website is disabled' });
        // Initialize progress tracking
        initializeProgress(website.id);
        // Get scraper from factory (specific or generic)
        const { type, scraper } = scraperFactory.getScraper(websiteName);
        let result;
        if (type === 'specific') {
            result = await scraper(website.id);
        }
        else {
            result = await scraper(website.id, website.url);
        }
        const scrapeLog = await prisma.scrapeLog.create({
            data: {
                websiteId: website.id,
                itemsScraped: result.itemsScraped || 0,
                itemsUpdated: result.itemsUpdated || 0,
                status: result.status || 'failed',
                errorMessage: result.error || null,
            },
        });
        await prisma.website.update({ where: { id: website.id }, data: { lastScrapedAt: new Date() } });
        // Clear progress after completion
        clearProgress(website.id);
        res.json({ success: true, message: `Scraping completed for ${websiteName}`, data: scrapeLog });
    }
    catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).json({ error: 'Scraping failed', details: error?.message || 'Unknown error' });
    }
});
// Scrape all enabled websites
router.post('/start-all', async (req, res) => {
    try {
        console.log('[API] Starting batch scrape of all enabled websites');
        const results = await AutoScraper.scrapeAll();
        res.json({ success: true, message: 'Batch scraping started', results });
    }
    catch (error) {
        console.error('Error during batch scraping:', error);
        res.status(500).json({ error: 'Batch scraping failed', details: error?.message || 'Unknown error' });
    }
});
export default router;
