import puppeteer from 'puppeteer';
import ValidationPipeline from '../validators/validationPipeline.js';
export async function launchBrowser() {
    return puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
        ],
    });
}
export async function closePage(page) {
    try {
        await page.close();
    }
    catch (error) {
        // Page already closed
    }
}
export async function closeBrowser(browser) {
    try {
        await browser.close();
    }
    catch (error) {
        // Browser already closed
    }
}
export async function waitForElement(page, selector, timeout = 5000) {
    try {
        await page.waitForSelector(selector, { timeout });
        return true;
    }
    catch (error) {
        return false;
    }
}
export async function extractPrice(priceStr) {
    const match = priceStr.match(/[\d,]+\.?\d*/);
    if (match) {
        return parseFloat(match[0].replace(/,/g, ''));
    }
    return 0;
}
export async function generateDemoProducts(websiteName, count = 8) {
    // Demo products removed - returns empty array
    // In production, this should throw an error instead of returning empty
    console.warn(`[DemoProducts] No demo products available for ${websiteName}. Returning empty array.`);
    return [];
}
/**
 * Saves products to database with optimized batch operations.
 * Uses Prisma transactions to ensure consistency.
 * Reduces N+1 queries by batching related operations.
 */
export async function saveProductsToDatabase(prisma, websiteId, products) {
    let itemsScraped = 0;
    let itemsUpdated = 0;
    let validated = 0;
    let rejected = 0;
    if (!products || products.length === 0) {
        return { itemsScraped: 0, itemsUpdated: 0, validated: 0, rejected: 0, validationReport: 'No products to save' };
    }
    // Convert products to raw format for validation
    const rawProducts = products.map(p => {
        const sizes = (p.sizes || []).map(s => typeof s === 'string' ? { size: s, available: true, stock: 0 } : s);
        return {
            title: p.title,
            url: p.url,
            price: p.price,
            originalPrice: p.originalPrice,
            description: p.description,
            imageUrl: p.imageUrl,
            colors: p.colors || [],
            sizes,
        };
    });
    // Run validation pipeline
    const batchResult = ValidationPipeline.processBatch(rawProducts);
    const validationReport = ValidationPipeline.generateReport(batchResult);
    console.log('\n' + validationReport + '\n');
    // Group products by action (create/update) for batch processing
    const productsToCreate = [];
    const productsToUpdate = [];
    // Check which products exist (optimized single query)
    const existingProducts = await prisma.product.findMany({
        where: {
            websiteId,
            url: { in: batchResult.results.map((r) => r.data?.url).filter(Boolean) },
        },
    });
    const existingMap = new Map(existingProducts.map(p => [p.url, p]));
    // Separate products by action
    for (const result of batchResult.results) {
        const productData = result.data;
        if (!productData?.url)
            continue;
        const existing = existingMap.get(productData.url);
        if (existing) {
            productsToUpdate.push({ existing, data: productData });
        }
        else {
            productsToCreate.push(productData);
        }
        validated++;
    }
    // Process creates in transaction
    if (productsToCreate.length > 0) {
        try {
            await prisma.$transaction(async (tx) => {
                for (const productData of productsToCreate) {
                    // Ensure required fields have valid values
                    if (!productData.url)
                        continue;
                    const newProduct = await tx.product.create({
                        data: {
                            title: productData.title || 'Untitled Product',
                            url: productData.url,
                            price: typeof productData.price === 'number' ? productData.price : 0,
                            originalPrice: typeof productData.originalPrice === 'number' ? productData.originalPrice : undefined,
                            description: productData.description || undefined,
                            imageUrl: productData.imageUrl || undefined,
                            websiteId,
                        },
                    });
                    // Add colors in batch
                    if (productData.colors && Array.isArray(productData.colors) && productData.colors.length > 0) {
                        await tx.color.createMany({
                            data: productData.colors.map((color) => ({
                                name: typeof color === 'string' ? color : (color?.name || 'Unknown'),
                                productId: newProduct.id,
                            })),
                        });
                    }
                    // Add sizes in batch
                    if (productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0) {
                        await tx.size.createMany({
                            data: productData.sizes.map((size) => ({
                                size: typeof size === 'string' ? size : (size?.size || 'Unknown'),
                                available: typeof size === 'string' ? true : (size?.available !== false),
                                stock: typeof size === 'string' ? 0 : (size?.stock || 0),
                                productId: newProduct.id,
                            })),
                        });
                    }
                    itemsScraped++;
                }
            });
        }
        catch (error) {
            console.error(`[SaveProducts] Error creating products:`, error);
        }
    }
    // Process updates in transaction
    if (productsToUpdate.length > 0) {
        try {
            await prisma.$transaction(async (tx) => {
                for (const { existing, data } of productsToUpdate) {
                    // Update product
                    await tx.product.update({
                        where: { id: existing.id },
                        data: {
                            title: data.title || existing.title,
                            price: data.price ?? existing.price,
                            originalPrice: data.originalPrice ?? existing.originalPrice,
                            description: data.description ?? existing.description,
                            imageUrl: data.imageUrl ?? existing.imageUrl,
                        },
                    });
                    // Update colors (delete and recreate)
                    if (data.colors && Array.isArray(data.colors) && data.colors.length > 0) {
                        await tx.color.deleteMany({ where: { productId: existing.id } });
                        await tx.color.createMany({
                            data: data.colors.map((colorName) => ({
                                name: typeof colorName === 'string' ? colorName : (colorName?.name || 'Unknown'),
                                productId: existing.id,
                            })),
                        });
                    }
                    // Update sizes (delete and recreate)
                    if (data.sizes && Array.isArray(data.sizes) && data.sizes.length > 0) {
                        await tx.size.deleteMany({ where: { productId: existing.id } });
                        await tx.size.createMany({
                            data: data.sizes.map((size) => ({
                                size: typeof size === 'string' ? size : (size?.size || 'Unknown'),
                                available: typeof size === 'string' ? true : (size?.available !== false),
                                stock: typeof size === 'string' ? 0 : (size?.stock || 0),
                                productId: existing.id,
                            })),
                        });
                    }
                    itemsUpdated++;
                }
            });
        }
        catch (error) {
            console.error(`[SaveProducts] Error updating products:`, error);
        }
    }
    rejected = batchResult.failed;
    if (rejected > 0) {
        console.warn(`[Validation] ${rejected} products were rejected during validation`);
    }
    return { itemsScraped, itemsUpdated, validated, rejected, validationReport };
}
