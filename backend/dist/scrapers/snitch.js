"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeSnitch = scrapeSnitch;
const prisma_1 = __importDefault(require("../database/prisma"));
const puppeteer_1 = __importDefault(require("puppeteer"));
async function scrapeSnitch(websiteId) {
    const products = [];
    let itemsScraped = 0;
    let itemsUpdated = 0;
    let browser = null;
    try {
        const baseUrl = 'https://www.snitch.com';
        console.log(`Starting scrape for Snitch (${websiteId})`);
        // Launch headless browser
        browser = await puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const categoryUrls = [
            `${baseUrl}/collections/new-arrivals`,
            `${baseUrl}/collections/mens`,
            `${baseUrl}/collections/womens`,
            `${baseUrl}/collections/basics`
        ];
        for (const categoryUrl of categoryUrls) {
            try {
                console.log(`Scraping category: ${categoryUrl}`);
                const page = await browser.newPage();
                // Set viewport and user agent
                await page.setViewport({ width: 1280, height: 720 });
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                // Navigate to page with timeout
                await page.goto(categoryUrl, {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });
                // Wait for products to load
                await page.waitForSelector('a[href*="/products/"]', {
                    timeout: 5000
                }).catch(() => {
                    console.log(`No products found on ${categoryUrl}`);
                });
                // Extract product data
                const pageProducts = await page.evaluate(() => {
                    const products = [];
                    const productElements = document.querySelectorAll('a[href*="/products/"], .product-item, [data-product]');
                    productElements.forEach((el) => {
                        try {
                            // Get href from link or parent link
                            let url = el.getAttribute('href') || '';
                            if (!url && el.tagName !== 'A') {
                                const link = el.querySelector('a[href*="/products/"]');
                                url = link?.getAttribute('href') || '';
                            }
                            // Get title from text content or data attributes
                            const titleEl = el.querySelector('h2, h3, .product-title, [data-product-title]');
                            const title = titleEl?.textContent?.trim() || el.textContent?.trim()?.split('\n')[0] || '';
                            // Get price
                            const priceEl = el.querySelector('.price, [data-price], .product-price');
                            const priceText = priceEl?.textContent?.trim() || '';
                            // Get image
                            const imgEl = el.querySelector('img');
                            const imageUrl = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || '';
                            if (url && title && url.includes('/products/')) {
                                products.push({
                                    title,
                                    url,
                                    price: parseFloat(priceText.replace(/[^\d.]/g, '')) || null,
                                    imageUrl
                                });
                            }
                        }
                        catch (e) {
                            // Skip invalid elements
                        }
                    });
                    return products;
                });
                // Deduplicate and add to main products array
                for (const product of pageProducts) {
                    if (product.url && product.title) {
                        const isDuplicate = products.some(p => p.url === product.url);
                        if (!isDuplicate) {
                            products.push(product);
                            itemsScraped++;
                        }
                    }
                }
                await page.close();
            }
            catch (categoryError) {
                console.error(`Error scraping category ${categoryUrl}:`, categoryError);
            }
        }
        // Store products in database
        for (const product of products) {
            try {
                const fullUrl = product.url.startsWith('http')
                    ? product.url
                    : `${baseUrl}${product.url}`;
                await prisma_1.default.product.upsert({
                    where: { url: fullUrl },
                    update: {
                        price: product.price,
                        imageUrl: product.imageUrl
                    },
                    create: {
                        title: product.title,
                        url: fullUrl,
                        websiteId,
                        price: product.price,
                        imageUrl: product.imageUrl
                    }
                });
                itemsUpdated++;
            }
            catch (dbError) {
                console.error(`Error storing product:`, dbError);
            }
        }
        return { itemsScraped, itemsUpdated, status: 'success' };
    }
    catch (error) {
        console.error('Error scraping Snitch:', error);
        return {
            itemsScraped,
            itemsUpdated,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
    finally {
        if (browser) {
            await browser.close();
        }
    }
}
//# sourceMappingURL=snitch.js.map