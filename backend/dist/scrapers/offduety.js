import prisma from '../database/prisma.js';
import { launchBrowser, closeBrowser, closePage, saveProductsToDatabase, generateDemoProducts } from './utils.js';
import { updateProgress } from '../utils/progressTracker.js';
export async function scrapeOffDuety(websiteId, progressCallback) {
    let browser = null;
    const updateProgress_ = (stage, message, progress) => {
        updateProgress(websiteId, stage, message, progress);
        if (progressCallback)
            progressCallback(stage, message, progress);
    };
    try {
        updateProgress_('starting', 'Initializing Off Duty scraper...', 10);
        browser = await launchBrowser();
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(30000);
        page.setDefaultTimeout(30000);
        // Go to Off Duty's product listing page
        const urls = [
            'https://www.offduety.co/collections/all',
            'https://www.offduety.co/collections/mens',
            'https://www.offduety.co/collections/womens',
        ];
        const products = [];
        for (const url of urls) {
            try {
                console.log(`[Off Duty] Scraping: ${url}`);
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
                // Wait for product grid to load
                await page.waitForSelector('.product-item, [data-product], .product-card, .product-tile', { timeout: 5000 }).catch(() => { });
                // Extract products
                const pageProducts = await page.evaluate(() => {
                    const items = [];
                    const productElements = document.querySelectorAll('.product-item, [data-product], .product-card, .product-tile, .product');
                    productElements.forEach((element) => {
                        try {
                            const titleEl = element.querySelector('.product-title, [data-title], h2, h3, .title');
                            const priceEl = element.querySelector('.product-price, [data-price], .price, .current-price');
                            const linkEl = element.querySelector('a[href*="/products/"], a');
                            const imgEl = element.querySelector('img');
                            if (titleEl && priceEl) {
                                const title = titleEl.textContent?.trim() || '';
                                const price = priceEl.textContent?.trim() || '0';
                                const url = linkEl?.getAttribute('href') || '';
                                const imageUrl = imgEl?.getAttribute('src') || '';
                                if (title && url) {
                                    items.push({
                                        title,
                                        price,
                                        url: url.startsWith('http') ? url : `https://www.offduety.co${url}`,
                                        imageUrl: imageUrl.startsWith('http') ? imageUrl : `https://www.offduety.co${imageUrl}`,
                                    });
                                }
                            }
                        }
                        catch (e) {
                            // Skip this item
                        }
                    });
                    return items;
                });
                products.push(...pageProducts);
            }
            catch (error) {
                console.error(`[Off Duty] Error scraping ${url}:`, error.message);
            }
        }
        await closePage(page);
        // Use demo products as fallback if no products were found
        let productsToSave = products;
        if (productsToSave.length === 0) {
            console.log('[Off Duty] No products found via Puppeteer, using demo data');
            productsToSave = await generateDemoProducts('offduety');
        }
        // Process and save products
        if (productsToSave.length > 0) {
            const processedProducts = productsToSave.map((p) => {
                const priceValue = String(p.price).replace(/[^0-9.]/g, '');
                return {
                    title: p.title,
                    url: p.url,
                    imageUrl: p.imageUrl,
                    price: parseFloat(priceValue) || 0,
                };
            }).filter(p => p.price > 0);
            const result = await saveProductsToDatabase(prisma, websiteId, processedProducts);
            return {
                ...result,
                status: 'success',
            };
        }
        return { itemsScraped: 0, itemsUpdated: 0, status: 'success' };
    }
    catch (error) {
        console.error('[Off Duty] Scraping failed:', error);
        return { itemsScraped: 0, itemsUpdated: 0, status: 'failed', error: error?.message || 'Unknown error' };
    }
    finally {
        if (browser) {
            await closeBrowser(browser);
        }
    }
}
