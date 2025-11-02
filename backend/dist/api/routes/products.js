import { Router } from 'express';
import prisma from '../../database/prisma.js';
const router = Router();
// Get all products with filters
router.get('/', async (req, res) => {
    try {
        const { websiteId, search, color, size, minPrice, maxPrice, page = '1', limit = '20' } = req.query;
        // Validate pagination parameters
        let pageNum = parseInt(page);
        let limitNum = parseInt(limit);
        if (isNaN(pageNum) || pageNum < 1)
            pageNum = 1;
        if (isNaN(limitNum) || limitNum < 1)
            limitNum = 20;
        if (limitNum > 100)
            limitNum = 100; // Cap max limit at 100
        const skip = (pageNum - 1) * limitNum;
        // Build where clause for database filtering
        const where = {};
        if (websiteId)
            where.websiteId = websiteId;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) {
                const min = parseFloat(minPrice);
                if (!isNaN(min))
                    where.price.gte = min;
            }
            if (maxPrice) {
                const max = parseFloat(maxPrice);
                if (!isNaN(max))
                    where.price.lte = max;
            }
        }
        // Note: Color and Size filtering must happen after pagination because
        // these are relationships and Prisma doesn't support filtering by nested relations
        // with pagination in a single query. For production, consider using raw SQL or
        // denormalizing the data structure.
        const products = await prisma.product.findMany({
            where,
            include: { colors: true, sizes: true, website: true },
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
        });
        // Apply color and size filtering after fetching
        let filteredProducts = products;
        if (color || size) {
            filteredProducts = products.filter((p) => {
                const colorMatch = !color || p.colors.some((c) => c.name.toLowerCase() === String(color).toLowerCase());
                const sizeMatch = !size || p.sizes.some((s) => s.size === size && s.available);
                return colorMatch && sizeMatch;
            });
        }
        const total = await prisma.product.count({ where });
        res.json({
            data: filteredProducts,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products', details: String(error) });
    }
});
// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { colors: true, sizes: true, website: true },
        });
        if (!product)
            return res.status(404).json({ error: 'Product not found' });
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
        const { title, url, websiteId, price, originalPrice, description, imageUrl, colors, sizes } = req.body || {};
        if (!title || !url || !websiteId)
            return res.status(400).json({ error: 'Title, URL, and websiteId are required' });
        const product = await prisma.product.create({
            data: {
                title,
                url,
                websiteId,
                price: price !== undefined && price !== null ? parseFloat(String(price)) : null,
                originalPrice: originalPrice !== undefined && originalPrice !== null ? parseFloat(String(originalPrice)) : null,
                description,
                imageUrl,
                colors: colors ? { create: colors.map((c) => ({ name: c.name, code: c.code || null })) } : undefined,
                sizes: sizes ? { create: sizes.map((s) => ({ size: s.size, available: s.available !== false, stock: s.stock || 0 })) } : undefined,
            },
            include: { colors: true, sizes: true, website: true },
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
        const { title, price, originalPrice, description, imageUrl } = req.body || {};
        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: {
                ...(title ? { title } : {}),
                ...(price !== undefined ? { price: price ? parseFloat(String(price)) : null } : {}),
                ...(originalPrice !== undefined ? { originalPrice: originalPrice ? parseFloat(String(originalPrice)) : null } : {}),
                ...(description ? { description } : {}),
                ...(imageUrl ? { imageUrl } : {}),
            },
            include: { colors: true, sizes: true, website: true },
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
        await prisma.product.delete({ where: { id: req.params.id } });
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
        const result = await prisma.product.deleteMany({ where: { websiteId: req.params.websiteId } });
        res.json({ message: `Deleted ${result.count} products` });
    }
    catch (error) {
        console.error('Error deleting products:', error);
        res.status(500).json({ error: 'Failed to delete products' });
    }
});
export default router;
