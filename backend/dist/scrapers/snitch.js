import prisma from '../database/prisma.js';
import { launchBrowser, closeBrowser, closePage, saveProductsToDatabase } from './utils.js';
import { updateProgress } from '../utils/progressTracker.js';
// Stage enum for type-safe progress updates
var ScrapeStage;
(function (ScrapeStage) {
    ScrapeStage["STARTING"] = "starting";
    ScrapeStage["NAVIGATING"] = "navigating";
    ScrapeStage["SCRAPING"] = "scraping";
    ScrapeStage["SAVING"] = "saving";
    ScrapeStage["COMPLETED"] = "completed";
    ScrapeStage["FAILED"] = "failed";
})(ScrapeStage || (ScrapeStage = {}));
export async function scrapeSnitch(websiteId, progressCallback) {
    let browser = null;
    let page = null;
    // Type-safe progress update helper
    const updateProgress_ = (stage, message, progress) => {
        updateProgress(websiteId, stage, message, progress);
        if (progressCallback)
            progressCallback(stage, message, progress);
    };
    try {
        updateProgress_(ScrapeStage.STARTING, 'Initializing Snitch scraper...', 10);
        browser = await launchBrowser();
        page = await browser.newPage();
        // Set reasonable timeouts
        page.setDefaultNavigationTimeout(45000);
        page.setDefaultTimeout(45000);
        // Snitch website collections to scrape
        const collections = [
            'https://www.snitch.com/collections',
            'https://www.snitch.com/collections/t-shirts',
            'https://www.snitch.com/collections/shirts',
            'https://www.snitch.com/collections/bottomwear',
            'https://www.snitch.com/collections/outerwear',
        ];
        const products = [];
        const seenUrls = new Set();
        // Scrape each collection
        for (let i = 0; i < collections.length; i++) {
            const url = collections[i];
            try {
                console.log(`[Snitch] Scraping collection ${i + 1}/${collections.length}: ${url}`);
                updateProgress_(ScrapeStage.NAVIGATING, `Loading collection (${i + 1}/${collections.length})...`, 15 + i * 12);
                // Navigate with timeout
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(err => {
                    console.warn(`[Snitch] Navigation timeout for ${url}:`, err.message);
                });
                // Wait for products to load
                updateProgress_(ScrapeStage.SCRAPING, `Waiting for products to load...`, 20 + i * 12);
                await Promise.race([
                    page.waitForFunction(() => {
                        const count = document.querySelectorAll('a[href*="/products/"], [data-testid*="product"], [class*="product-card"]').length;
                        return count > 3;
                    }, { timeout: 20000 }),
                    new Promise(resolve => setTimeout(resolve, 5000))
                ]).catch(() => {
                    console.log('[Snitch] Timeout waiting for product elements');
                });
                // Extract products from page
                updateProgress_(ScrapeStage.SCRAPING, `Extracting products...`, 25 + i * 12);
                const pageProducts = await extractProductsFromPage(page);
                // Deduplicate and add to collection
                let newCount = 0;
                for (const product of pageProducts) {
                    if (!seenUrls.has(product.url)) {
                        products.push(product);
                        seenUrls.add(product.url);
                        newCount++;
                    }
                }
                console.log(`[Snitch] Found ${newCount} new products on collection ${i + 1}, total unique: ${products.length}`);
            }
            catch (error) {
                console.error(`[Snitch] Error scraping collection ${i + 1}:`, error?.message || String(error));
                // Continue with next collection instead of failing entirely
            }
        }
        // Close page to free resources
        if (page) {
            await closePage(page);
            page = null;
        }
        if (products.length === 0) {
            console.warn('[Snitch] No products were scraped from any collection');
            return { itemsScraped: 0, itemsUpdated: 0, status: 'completed', error: 'No products found' };
        }
        // Process and save products
        updateProgress_(ScrapeStage.SAVING, `Saving ${products.length} products to database...`, 85);
        const processedProducts = normalizeProducts(products);
        const result = await saveProductsToDatabase(prisma, websiteId, processedProducts);
        updateProgress_(ScrapeStage.COMPLETED, `Successfully scraped ${result.itemsScraped} new products and updated ${result.itemsUpdated} existing products!`, 100);
        return {
            itemsScraped: result.itemsScraped,
            itemsUpdated: result.itemsUpdated,
            status: 'success',
        };
    }
    catch (error) {
        const errorMessage = error?.message || 'Unknown error occurred';
        console.error('[Snitch] Scraper failed:', errorMessage, error?.stack);
        updateProgress_(ScrapeStage.FAILED, `Scraping failed: ${errorMessage}`, 0);
        return {
            itemsScraped: 0,
            itemsUpdated: 0,
            status: 'failed',
            error: errorMessage,
        };
    }
    finally {
        // Ensure all resources are cleaned up
        if (page) {
            await closePage(page).catch(err => console.warn('[Snitch] Error closing page:', err));
        }
        if (browser) {
            await closeBrowser(browser).catch(err => console.error('[Snitch] Error closing browser:', err));
        }
    }
}
/**
 * Extract products from current page
 * Returns array of products found on the page
 */
async function extractProductsFromPage(page) {
    try {
        return await page.evaluate(() => {
            const items = [];
            const nonProductKeywords = ['sitemap', 'contact', 'terms', 'privacy', 'about', 'faq', 'shipping', 'returns', 'help', 'careers'];
            // Find all potential product links
            let selectors = [
                'a[href*="/products/"]',
                'a[href*="/product/"]',
                '[data-testid*="product"] a',
                '.product-card a[href]',
            ];
            let productElements = [];
            for (const selector of selectors) {
                const found = Array.from(document.querySelectorAll(selector));
                if (found.length > 0) {
                    productElements = found;
                    break;
                }
            }
            productElements.forEach((el) => {
                try {
                    const href = el.getAttribute('href') || '';
                    // Validate URL
                    if (!href || !href.includes('/products'))
                        return;
                    if (href.includes('?') && !href.includes('product'))
                        return;
                    // Filter non-product pages
                    const lowerHref = href.toLowerCase();
                    if (nonProductKeywords.some(k => lowerHref.includes(k)))
                        return;
                    // Extract title
                    let title = el.textContent?.trim() || '';
                    if (!title) {
                        const img = el.querySelector('img');
                        title = img?.getAttribute('alt') || '';
                    }
                    if (!title || title.length < 3 || title.length > 250)
                        return;
                    // Filter non-product titles
                    const titleLower = title.toLowerCase();
                    if (nonProductKeywords.some(k => titleLower.includes(k)))
                        return;
                    // Extract price
                    let price = 0;
                    const container = el.closest('[class*="price"], [class*="card"], [class*="product"], article, li') || el.parentElement;
                    if (container) {
                        const priceText = container.textContent || '';
                        const matches = priceText.match(/[\$₹€]\s*(\d+\.?\d*)|(\d+\.?\d*)/g);
                        if (matches && matches.length > 0) {
                            const priceStr = matches[0].replace(/[^\d.]/g, '');
                            price = parseFloat(priceStr) || 0;
                        }
                    }
                    // Skip if no price found
                    if (price <= 0)
                        return;
                    // Extract image
                    let imageUrl = '';
                    const imgEl = el.querySelector('img');
                    if (imgEl) {
                        imageUrl = imgEl.getAttribute('src') ||
                            imgEl.getAttribute('data-src') ||
                            imgEl.getAttribute('data-lazy-src') || '';
                    }
                    // Normalize URL
                    const fullUrl = href.startsWith('http') ? href : `https://www.snitch.com${href}`;
                    items.push({
                        title: title.trim(),
                        price,
                        url: fullUrl,
                        imageUrl: imageUrl || '',
                    });
                }
                catch (e) {
                    // Skip individual items with errors
                }
            });
            return items;
        });
    }
    catch (error) {
        console.error('[Snitch] Error extracting products from page:', error);
        return [];
    }
}
/**
 * Normalize and validate scraped products
 * Adds fallback images and ensures data quality
 */
function normalizeProducts(rawProducts) {
    const categoryImages = {
        't-shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
        'shirt': 'https://images.unsplash.com/photo-1589885755246-e4b1092dd029?w=500&h=500&fit=crop',
        'jeans': 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop',
        'jacket': 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&h=500&fit=crop',
        'hoodie': 'https://images.unsplash.com/photo-1556821552-107d12e0ba5d?w=500&h=500&fit=crop',
        'pants': 'https://images.unsplash.com/photo-1473966143120-7d3e6b0b11e2?w=500&h=500&fit=crop',
        'dress': 'https://images.unsplash.com/photo-1595777707802-13b82e908642?w=500&h=500&fit=crop',
        'shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
        'sweater': 'https://images.unsplash.com/photo-1578932750294-708c764c18f6?w=500&h=500&fit=crop',
    };
    const defaultImage = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop';
    return rawProducts
        .filter(p => p.title && p.url && p.price > 0) // Only keep valid products
        .map(p => {
        let imageUrl = p.imageUrl;
        // Add fallback image if missing
        if (!imageUrl || !imageUrl.startsWith('http')) {
            const titleLower = p.title.toLowerCase();
            for (const [category, url] of Object.entries(categoryImages)) {
                if (titleLower.includes(category)) {
                    imageUrl = url;
                    break;
                }
            }
            if (!imageUrl)
                imageUrl = defaultImage;
        }
        return {
            title: p.title.substring(0, 255), // Ensure title doesn't exceed DB limit
            url: p.url.substring(0, 2048), // Ensure URL doesn't exceed DB limit
            price: Math.max(0, p.price), // Ensure price is non-negative
            imageUrl,
            originalPrice: p.originalPrice,
            description: p.description,
            colors: p.colors,
            sizes: p.sizes,
        };
    });
}
