import { Router } from 'express';
import prisma from '../../database/prisma.js';
import { AutoScraper } from '../../utils/autoScraper.js';

const router = Router();

// Get all websites with product count
router.get('/', async (_req, res) => {
  try {
    const websites = await prisma.website.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const data = websites.map((w: any) => ({ ...w, productCount: w._count.products }));
    res.json(data);
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({ error: 'Failed to fetch websites' });
  }
});

// Get single website
router.get('/:id', async (req, res) => {
  try {
    const website = await prisma.website.findUnique({
      where: { id: req.params.id },
      include: { products: true },
    });
    if (!website) return res.status(404).json({ error: 'Website not found' });
    res.json(website);
  } catch (error) {
    console.error('Error fetching website:', error);
    res.status(500).json({ error: 'Failed to fetch website' });
  }
});

// Create new website
router.post('/', async (req, res) => {
  try {
    const { name, url, autoScrape } = req.body || {};
    if (!name || !url) return res.status(400).json({ error: 'Name and URL are required' });
    const existing = await prisma.website.findUnique({ where: { name: String(name).toLowerCase() } });
    if (existing) return res.status(400).json({ error: 'Website already exists' });

    const website = await prisma.website.create({
      data: { name: String(name).toLowerCase(), url, enabled: true },
    });

    // Auto-trigger scraping if requested
    if (autoScrape === true || autoScrape === 'true') {
      console.log(`[Website] Auto-triggering scrape for newly created website: ${website.name}`);
      AutoScraper.triggerScrapeAsync(website.id);
    }

    res.status(201).json(website);
  } catch (error) {
    console.error('Error creating website:', error);
    res.status(500).json({ error: 'Failed to create website' });
  }
});

// Update website
router.put('/:id', async (req, res) => {
  try {
    const { name, url, enabled } = req.body || {};
    const website = await prisma.website.update({
      where: { id: req.params.id },
      data: {
        ...(name ? { name: String(name).toLowerCase() } : {}),
        ...(url ? { url } : {}),
        ...(enabled !== undefined ? { enabled: !!enabled } : {}),
      },
    });
    res.json(website);
  } catch (error) {
    console.error('Error updating website:', error);
    res.status(500).json({ error: 'Failed to update website' });
  }
});

// Delete website
router.delete('/:id', async (req, res) => {
  try {
    await prisma.website.delete({ where: { id: req.params.id } });
    res.json({ message: 'Website deleted successfully' });
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json({ error: 'Failed to delete website' });
  }
});

export default router;
