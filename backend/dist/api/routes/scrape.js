import { Router } from 'express';
import prisma from '../../database/prisma.js';
import { scrapeSnitch } from '../../scrapers/snitch.js';
import { scrapeRareRabit } from '../../scrapers/rarerabit.js';
import { scrapeOffDuety } from '../../scrapers/offduety.js';
import { scrapeZara } from '../../scrapers/zara.js';
const router = Router();
const scrapers = {
    snitch: scrapeSnitch,
    rarerabit: scrapeRareRabit,
    offduety: scrapeOffDuety,
    zara: scrapeZara,
};
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
router.post('/start/:websiteName', async (req, res) => {
    try {
        const { websiteName } = req.params;
        const key = String(websiteName).toLowerCase().replace(/[^a-z0-9]/g, '');
        const website = await prisma.website.findUnique({ where: { name: key } });
        if (!website)
            return res.status(404).json({ error: 'Website not found' });
        if (!website.enabled)
            return res.status(400).json({ error: 'Website is disabled' });
        const fn = scrapers[key];
        if (!fn)
            return res.status(400).json({ error: 'No scraper available for this website' });
        const result = await fn(website.id);
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
        res.json({ success: true, message: `Scraping completed for ${websiteName}`, data: scrapeLog });
    }
    catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).json({ error: 'Scraping failed', details: error?.message || 'Unknown error' });
    }
});
export default router;
