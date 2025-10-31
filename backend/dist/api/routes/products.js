"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../database/prisma"));
const router = (0, express_1.Router)();
// Get all products with filters
router.get('/', async (req, res) => {
    try {
        const { websiteId, search, color, size, minPrice, maxPrice, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (websiteId) {
            where.websiteId = websiteId;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = parseFloat(minPrice);
            if (maxPrice)
                where.price.lte = parseFloat(maxPrice);
        }
        let products = await prisma_1.default.product.findMany({
            where,
            include: {
                colors: true,
                sizes: true,
                website: true
            },
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' }
        });
        // Filter by color and size
        if (color || size) {
            products = products.filter(product => {
                const colorMatch = !color || product.colors.some(c => c.name.toLowerCase() === color.toLowerCase());
                const sizeMatch = !size || product.sizes.some(s => s.size === size && s.available);
                return colorMatch && sizeMatch;
            });
        }
        const total = await prisma_1.default.product.count({ where });
        res.json({
            data: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
// Get single product
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma_1.default.product.findUnique({
            where: { id },
            include: {
                colors: true,
                sizes: true,
                website: true
            }
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});
// Create product (manual entry)
router.post('/', async (req, res) => {
    try {
        const { title, url, websiteId, price, originalPrice, description, imageUrl, colors, sizes } = req.body;
        if (!title || !url || !websiteId) {
            return res.status(400).json({ error: 'Title, URL, and websiteId are required' });
        }
        const product = await prisma_1.default.product.create({
            data: {
                title,
                url,
                websiteId,
                price: price ? parseFloat(price) : null,
                originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                description,
                imageUrl,
                colors: colors ? {
                    create: colors.map((c) => ({
                        name: c.name,
                        code: c.code || null
                    }))
                } : undefined,
                sizes: sizes ? {
                    create: sizes.map((s) => ({
                        size: s.size,
                        available: s.available !== false,
                        stock: s.stock || 0
                    }))
                } : undefined
            },
            include: { colors: true, sizes: true, website: true }
        });
        res.status(201).json(product);
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});
// Update product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, price, originalPrice, description, imageUrl } = req.body;
        const product = await prisma_1.default.product.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(price !== undefined && { price: price ? parseFloat(price) : null }),
                ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
                ...(description && { description }),
                ...(imageUrl && { imageUrl })
            },
            include: { colors: true, sizes: true, website: true }
        });
        res.json(product);
    }
    catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});
// Delete product
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.product.delete({
            where: { id }
        });
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
// Delete all products from a website
router.delete('/website/:websiteId', async (req, res) => {
    try {
        const { websiteId } = req.params;
        const result = await prisma_1.default.product.deleteMany({
            where: { websiteId }
        });
        res.json({ message: `Deleted ${result.count} products` });
    }
    catch (error) {
        console.error('Error deleting products:', error);
        res.status(500).json({ error: 'Failed to delete products' });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map