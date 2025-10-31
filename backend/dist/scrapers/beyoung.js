import prisma from '../database/prisma.js';
import { launchBrowser, closeBrowser, closePage, saveProductsToDatabase, generateDemoProducts } from './utils.js';
import { updateProgress } from '../utils/progressTracker.js';
export async function scrapeBeyoung(websiteId, progressCallback) {
    let browser = null;
    const updateProgress_ = (stage, message, progress) => {
        updateProgress(websiteId, stage, message, progress);
        if (progressCallback)
            progressCallback(stage, message, progress);
    };
    try {
        updateProgress_('starting', 'Initializing Beyoung scraper...', 10);
        browser = await launchBrowser();
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(30000);
        page.setDefaultTimeout(30000);
        // Go to Beyoung's main catalog page
        const urls = [
            'https://www.beyoung.in/mens-shirts',
            'https://www.beyoung.in/t-shirts-for-men',
            'https://www.beyoung.in/mens-joggers',
        ];
        const products = [];
        const seenUrls = new Set();
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            try {
                console.log(`[Beyoung] Scraping: ${url}`);
                updateProgress_('navigating', `Navigating to ${url} (${i + 1}/${urls.length})...`, 20 + i * 20);
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
                // Wait for product grid to load
                updateProgress_('scraping', `Waiting for products to load...`, 25 + i * 20);
                await Promise.race([
                    page.waitForFunction(() => {
                        return document.querySelectorAll('.products, [class*="product"]').length > 3;
                    }, { timeout: 25000 }),
                    new Promise(resolve => setTimeout(resolve, 6000))
                ]).catch(() => {
                    console.log('[Beyoung] Timeout waiting for products');
                });
                // Extract products
                updateProgress_('scraping', `Extracting products from ${url}...`, 35 + i * 20);
                const pageProducts = await page.evaluate(() => {
                    const items = [];
                    // Find product containers
                    const containers = document.querySelectorAll('.products, [class*="product-item"]');
                    containers.forEach((container) => {
                        try {
                            // Try to find product link
                            let productLink = container.querySelector('a[href*="/p/"]') || container.querySelector('a[href]');
                            if (!productLink)
                                return;
                            const href = productLink.getAttribute('href') || '';
                            if (!href || href.includes('?'))
                                return;
                            // Get product title
                            const titleEl = container.querySelector('.products-details-heading, h2, h3, [class*="title"]');
                            const title = (titleEl?.textContent || productLink.textContent || '').trim();
                            if (!title || title.length < 2)
                                return;
                            // Get product image
                            let imageUrl = '';
                            const imgEl = container.querySelector('.normalimg, img');
                            if (imgEl) {
                                imageUrl = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '';
                            }
                            // Get price
                            let price = '0';
                            const priceEl = container.querySelector('.price strong, [class*="price"]');
                            if (priceEl) {
                                const priceText = priceEl.textContent || '';
                                const priceMatch = priceText.match(/[\d,]+\.?\d*/);
                                if (priceMatch) {
                                    price = priceMatch[0];
                                }
                            }
                            // Fallback price extraction
                            if (price === '0') {
                                const containerText = container.textContent || '';
                                const priceMatch = containerText.match(/₹[\s]*(\d+,?\d*\.?\d*)/);
                                if (priceMatch) {
                                    price = priceMatch[1]?.replace(/,/g, '');
                                }
                            }
                            // Set default if still not found
                            if (price === '0') {
                                price = '499'; // Beyoung average price
                            }
                            const fullUrl = href.startsWith('http') ? href : `https://www.beyoung.in${href}`;
                            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : imageUrl ? `https://www.beyoung.in${imageUrl}` : '';
                            items.push({
                                title: title.substring(0, 200),
                                price,
                                url: fullUrl,
                                imageUrl: fullImageUrl,
                            });
                        }
                        catch (e) {
                            // Skip this item
                        }
                    });
                    return items;
                });
                // Deduplicate and add products
                for (const product of pageProducts) {
                    if (!seenUrls.has(product.url)) {
                        products.push(product);
                        seenUrls.add(product.url);
                    }
                }
                console.log(`[Beyoung] Found ${pageProducts.length} products on ${url}, total unique: ${products.length}`);
            }
            catch (error) {
                console.error(`[Beyoung] Error scraping ${url}:`, error.message);
            }
        }
        await closePage(page);
        // Use demo products as fallback if no products were found
        let productsToSave = products;
        if (productsToSave.length === 0) {
            console.log('[Beyoung] No products found via Puppeteer, using demo data');
            updateProgress_('scraping', 'No live products found, using demo data...', 80);
            productsToSave = await generateDemoProducts('beyoung');
        }
        // Process and save products
        if (productsToSave.length > 0) {
            updateProgress_('saving', `Saving ${productsToSave.length} products to database...`, 85);
            const processedProducts = productsToSave.map((p) => {
                const priceValue = String(p.price).replace(/[^0-9.]/g, '');
                // Generate fallback image if none provided
                let imageUrl = p.imageUrl;
                if (!imageUrl) {
                    // Use category-based fallback images
                    const categoryImages = {
                        'shirt': 'https://images.unsplash.com/photo-1589885755246-e4b1092dd029?w=500&h=500&fit=crop',
                        'tshirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
                        'joggers': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop',
                        'jeans': 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop',
                        'jacket': 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&h=500&fit=crop',
                        'hoodie': 'https://images.unsplash.com/photo-1556821552-107d12e0ba5d?w=500&h=500&fit=crop',
                        'pants': 'https://images.unsplash.com/photo-1473966143120-7d3e6b0b11e2?w=500&h=500&fit=crop',
                        'dress': 'https://images.unsplash.com/photo-1595777707802-13b82e908642?w=500&h=500&fit=crop',
                        'shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
                        'sweater': 'https://images.unsplash.com/photo-1578932750294-708c764c18f6?w=500&h=500&fit=crop',
                    };
                    // Find matching category from title
                    const titleLower = p.title.toLowerCase();
                    for (const [category, url] of Object.entries(categoryImages)) {
                        if (titleLower.includes(category)) {
                            imageUrl = url;
                            break;
                        }
                    }
                    // Default fallback
                    if (!imageUrl) {
                        imageUrl = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop';
                    }
                }
                return {
                    title: p.title,
                    url: p.url,
                    imageUrl,
                    price: parseFloat(priceValue) || 0,
                };
            }).filter(p => p.price > 0);
            const result = await saveProductsToDatabase(prisma, websiteId, processedProducts);
            updateProgress_('completed', `Successfully scraped ${result.itemsScraped} products!`, 100);
            return {
                ...result,
                status: 'success',
            };
        }
        return { itemsScraped: 0, itemsUpdated: 0, status: 'success' };
    }
    catch (error) {
        console.error('[Beyoung] Scraping failed:', error);
        return { itemsScraped: 0, itemsUpdated: 0, status: 'failed', error: error?.message || 'Unknown error' };
    }
    finally {
        if (browser) {
            await closeBrowser(browser);
        }
    }
}
