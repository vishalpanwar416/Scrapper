"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../database/prisma"));
const snitch_1 = require("../../scrapers/snitch");
const rarerabit_1 = require("../../scrapers/rarerabit");
const offduety_1 = require("../../scrapers/offduety");
const router = (0, express_1.Router)();
// Map of scraper functions
const scrapers = {
    snitch: snitch_1.scrapeSnitch,
    rarerabit: rarerabit_1.scrapeRareRabit,
    offduety: offduety_1.scrapeOffDuety
};
// Get scraping history for a website
router.get('/logs/:websiteId', async (req, res) => {
    try {
        const { websiteId } = req.params;
        const { limit = '20', page = '1' } = req.query;
        const limitNum = parseInt(limit) || 20;
        const pageNum = parseInt(page) || 1;
        const skip = (pageNum - 1) * limitNum;
        const logs = await prisma_1.default.scrapeLog.findMany({
            where: { websiteId },
            skip,
            take: limitNum,
            orderBy: { scrapedAt: 'desc' }
        });
        const total = await prisma_1.default.scrapeLog.count({ where: { websiteId } });
        res.json({
            data: logs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching scrape logs:', error);
        res.status(500).json({ error: 'Failed to fetch scrape logs' });
    }
});
// Trigger scraping for a website
router.post('/start/:websiteName', async (req, res) => {
    try {
        const { websiteName } = req.params;
        // Get website from database
        const website = await prisma_1.default.website.findUnique({
            where: { name: websiteName.toLowerCase() }
        });
        if (!website) {
            return res.status(404).json({ error: 'Website not found' });
        }
        if (!website.enabled) {
            return res.status(400).json({ error: 'Website is disabled' });
        }
        // Get scraper function
        const scraperKey = websiteName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const scraperFunction = scrapers[scraperKey];
        if (!scraperFunction) {
            return res.status(400).json({ error: 'No scraper available for this website' });
        }
        // Run scraper (in production, you'd want to use a queue system)
        const result = await scraperFunction(website.id);
        // Log the scraping attempt
        const scrapeLog = await prisma_1.default.scrapeLog.create({
            data: {
                websiteId: website.id,
                itemsScraped: result.itemsScraped || 0,
                itemsUpdated: result.itemsUpdated || 0,
                status: result.status || 'failed',
                errorMessage: result.error || null
            }
        });
        // Update website's last scraped time
        await prisma_1.default.website.update({
            where: { id: website.id },
            data: { lastScrapedAt: new Date() }
        });
        res.json({
            success: true,
            message: `Scraping completed for ${websiteName}`,
            data: scrapeLog
        });
    }
    catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).json({ error: 'Scraping failed', details: error instanceof Error ? error.message : 'Unknown error' });
    }
});
// Get all scrape logs
router.get('/logs', async (req, res) => {
    try {
        const { limit = '20', page = '1' } = req.query;
        const limitNum = parseInt(limit) || 20;
        const pageNum = parseInt(page) || 1;
        const skip = (pageNum - 1) * limitNum;
        const logs = await prisma_1.default.scrapeLog.findMany({
            skip,
            take: limitNum,
            include: { website: true },
            orderBy: { scrapedAt: 'desc' }
        });
        const total = await prisma_1.default.scrapeLog.count();
        res.json({
            data: logs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching scrape logs:', error);
        res.status(500).json({ error: 'Failed to fetch scrape logs' });
    }
});
exports.default = router;
//# sourceMappingURL=scrape.js.map