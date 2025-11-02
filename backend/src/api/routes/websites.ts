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

    // Validate required fields
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    // Validate name format
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format. Must be a valid HTTP(S) URL' });
    }

    const nameLower = String(name).trim().toLowerCase();

    // Check if website already exists
    const existing = await prisma.website.findUnique({ where: { name: nameLower } });
    if (existing) {
      return res.status(409).json({ error: 'A website with this name already exists' });
    }

    const website = await prisma.website.create({
      data: { name: nameLower, url, enabled: true },
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
    const websiteId = req.params.id;

    // Validate ID
    if (!websiteId || typeof websiteId !== 'string') {
      return res.status(400).json({ error: 'Valid website ID is required' });
    }

    // Build update data with validation
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name must be a non-empty string' });
      }
      updateData.name = String(name).trim().toLowerCase();
    }

    if (url !== undefined) {
      if (typeof url !== 'string' || url.trim().length === 0) {
        return res.status(400).json({ error: 'URL must be a non-empty string' });
      }
      try {
        new URL(url);
        updateData.url = url;
      } catch {
        return res.status(400).json({ error: 'Invalid URL format. Must be a valid HTTP(S) URL' });
      }
    }

    if (enabled !== undefined) {
      updateData.enabled = !!enabled;
    }

    const website = await prisma.website.update({
      where: { id: websiteId },
      data: updateData,
    });

    res.json(website);
  } catch (error: any) {
    console.error('Error updating website:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Website not found' });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A website with this name already exists' });
    }

    res.status(500).json({ error: 'Failed to update website' });
  }
});

// Delete website (cascades to delete related products and their data, but preserves scrape logs for audit trail)
router.delete('/:id', async (req, res) => {
  try {
    const websiteId = req.params.id;

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`🗑️  DELETING WEBSITE: ${websiteId}`);
    console.log('═'.repeat(60));

    // Find the website first to get information for logging
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        products: { include: { colors: true, sizes: true } },
        scrapeLog: true,
      },
    });

    if (!website) {
      console.error('❌ Website not found:', websiteId);
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Website not found',
        },
      });
    }

    const productCount = website.products.length;
    const colorCount = website.products.reduce((sum, p) => sum + p.colors.length, 0);
    const sizeCount = website.products.reduce((sum, p) => sum + p.sizes.length, 0);
    const logCount = website.scrapeLog.length;

    console.log(`📋 Items to be deleted:`);
    console.log(`   - Website: ${website.name}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Colors: ${colorCount}`);
    console.log(`   - Sizes: ${sizeCount}`);
    console.log(`\n📋 Items to be preserved (audit trail):`);
    console.log(`   - Scrape Logs: ${logCount}`);

    // Use a transaction to ensure atomic deletion (all or nothing)
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Delete colors and sizes (products' relations)
      console.log(`\n📍 Step 1: Deleting colors and sizes...`);
      const colorsDeleted = await tx.color.deleteMany({
        where: { product: { websiteId } },
      });
      const sizesDeleted = await tx.size.deleteMany({
        where: { product: { websiteId } },
      });
      console.log(`   ✓ Deleted ${colorsDeleted.count} colors`);
      console.log(`   ✓ Deleted ${sizesDeleted.count} sizes`);

      // Step 2: Delete products
      console.log(`\n📍 Step 2: Deleting products...`);
      const productsDeleted = await tx.product.deleteMany({
        where: { websiteId },
      });
      console.log(`   ✓ Deleted ${productsDeleted.count} products`);

      // Step 3: Delete website (scrape logs are preserved)
      console.log(`\n📍 Step 3: Deleting website...`);
      const deletedWebsite = await tx.website.delete({
        where: { id: websiteId },
      });
      console.log(`   ✓ Deleted website: ${deletedWebsite.name}`);
      console.log(`   ℹ️  Preserved ${logCount} scrape logs for audit trail`);

      return {
        website: deletedWebsite,
        statistics: {
          colorsDeleted: colorCount,
          sizesDeleted: sizeCount,
          productsDeleted: productCount,
          logsPreserved: logCount,
        },
      };
    });

    console.log(`\n✅ SUCCESS: Website and products deleted successfully (scrape logs preserved for audit trail)`);
    console.log(`${'═'.repeat(60)}\n`);

    res.json({
      success: true,
      message: 'Website and products deleted successfully (scrape logs preserved for audit trail)',
      deleted: {
        website: result.website.name,
        statistics: result.statistics,
      },
    });
  } catch (error: any) {
    console.error(`\n❌ ERROR deleting website: ${req.params.id}`);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);

    // Handle specific errors
    if (error.code === 'P2025') {
      // Prisma unique constraint violation
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Cannot delete website due to constraint violation',
          details: error.message,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete website',
        details: error.message,
      },
    });
  }
});

export default router;
