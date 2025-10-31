"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../database/prisma"));
const router = (0, express_1.Router)();
// Get all websites
router.get('/', async (req, res) => {
    try {
        const websites = await prisma_1.default.website.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const websitesWithCount = websites.map(site => ({
            ...site,
            productCount: site._count.products
        }));
        res.json(websitesWithCount);
    }
    catch (error) {
        console.error('Error fetching websites:', error);
        res.status(500).json({ error: 'Failed to fetch websites' });
    }
});
// Get single website with products
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const website = await prisma_1.default.website.findUnique({
            where: { id },
            include: { products: true }
        });
        if (!website) {
            return res.status(404).json({ error: 'Website not found' });
        }
        res.json(website);
    }
    catch (error) {
        console.error('Error fetching website:', error);
        res.status(500).json({ error: 'Failed to fetch website' });
    }
});
// Create new website
router.post('/', async (req, res) => {
    try {
        const { name, url } = req.body;
        if (!name || !url) {
            return res.status(400).json({ error: 'Name and URL are required' });
        }
        // Check if website already exists
        const existing = await prisma_1.default.website.findUnique({
            where: { name }
        });
        if (existing) {
            return res.status(400).json({ error: 'Website already exists' });
        }
        const website = await prisma_1.default.website.create({
            data: { name, url }
        });
        res.status(201).json(website);
    }
    catch (error) {
        console.error('Error creating website:', error);
        res.status(500).json({ error: 'Failed to create website' });
    }
});
// Update website
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url, enabled } = req.body;
        const website = await prisma_1.default.website.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(url && { url }),
                ...(enabled !== undefined && { enabled })
            }
        });
        res.json(website);
    }
    catch (error) {
        console.error('Error updating website:', error);
        res.status(500).json({ error: 'Failed to update website' });
    }
});
// Delete website
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Delete will cascade to products, sizes, colors, and scrape logs
        await prisma_1.default.website.delete({
            where: { id }
        });
        res.json({ message: 'Website deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting website:', error);
        res.status(500).json({ error: 'Failed to delete website' });
    }
});
exports.default = router;
//# sourceMappingURL=websites.js.map