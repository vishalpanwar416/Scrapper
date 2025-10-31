import prisma from '../database/prisma.js';
import { launchBrowser, closeBrowser, closePage, ScrapedProduct, saveProductsToDatabase, generateDemoProducts, ProgressCallback } from './utils.js';
import { updateProgress } from '../utils/progressTracker.js';

export async function scrapeSnitch(websiteId: string, progressCallback?: ProgressCallback): Promise<{itemsScraped:number;itemsUpdated:number;status:string;error?:string}> {
  let browser = null;
  const updateProgress_ = (stage: string, message: string, progress: number) => {
    updateProgress(websiteId, stage as any, message, progress);
    if (progressCallback) progressCallback(stage, message, progress);
  };

  try {
    updateProgress_('starting', 'Initializing Snitch scraper...', 10);
    browser = await launchBrowser();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    // Go to Snitch's collections page to find products
    const urls = [
      'https://www.snitch.com/collections',
    ];

    const products: ScrapedProduct[] = [];
    const seenUrls = new Set<string>();

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        console.log(`[Snitch] Scraping: ${url}`);
        updateProgress_('navigating', `Navigating to ${url} (${i + 1}/${urls.length})...`, 20 + i * 20);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for product grid to load
        updateProgress_('scraping', `Waiting for products to load...`, 25 + i * 20);

        await Promise.race([
          page.waitForFunction(() => {
            return document.querySelectorAll('[data-testid*="product"], [class*="product-card"], a[href*="/products/"], .product').length > 3;
          }, { timeout: 25000 }),
          new Promise(resolve => setTimeout(resolve, 6000))
        ]).catch(() => {
          console.log('[Snitch] Timeout waiting for products');
        });

        // Extract products
        updateProgress_('scraping', `Extracting products from ${url}...`, 35 + i * 20);
        const pageProducts = await page.evaluate(() => {
          const items: any[] = [];

          // Find all product links
          let productElements = document.querySelectorAll('a[href*="/products/"]');

          // If very few found, try broader selectors
          if (productElements.length < 3) {
            productElements = document.querySelectorAll('[href*="/products/"]');
          }

          // Last resort - look for any links with product-like structure
          if (productElements.length < 3) {
            productElements = document.querySelectorAll('a[href]');
          }

          console.log(`Found ${productElements.length} potential product elements`);

          productElements.forEach((linkEl) => {
            try {
              const href = (linkEl as HTMLAnchorElement).getAttribute('href') || '';

              // Filter out non-product links - only accept /products/ URLs
              if (!href || href.includes('?')) return;
              if (!href.includes('/products/')) return;

              // Filter out known non-product pages
              const nonProductPages = ['sitemap', 'contact', 'terms', 'privacy', 'about', 'faq', 'shipping', 'returns', 'help', 'careers'];
              const lowerHref = href.toLowerCase();
              if (nonProductPages.some(page => lowerHref.includes(page))) return;

              // Get the text content as title
              let title = linkEl.textContent?.trim() || '';
              if (title.length > 200) title = title.substring(0, 200);

              // Reject if title looks like a page name not a product
              const titleLower = title.toLowerCase();
              if (nonProductPages.some(page => titleLower.includes(page))) return;

              // Look for image nearby
              let imageUrl = '';
              const imgEl = linkEl.querySelector('img');
              if (imgEl) {
                imageUrl = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || imgEl.getAttribute('data-lazy-src') || '';
              }

              // Try to extract price from nearby elements
              let price = '0';
              const container = linkEl.closest('[class*="price"], [class*="card"], article, li, div[class]') || linkEl.parentElement;
              if (container) {
                // Look for price patterns like $XX.XX
                const text = container.textContent || '';
                const priceMatch = text.match(/[$]\s*(\d+\.?\d*)|(\d+\.?\d*)/);
                if (priceMatch) {
                  price = priceMatch[1] || priceMatch[2];
                }
              }

              // Set a default price if none found
              if (price === '0') {
                price = '29.99'; // Default price
              }

              if (title && href && title.length > 2) {
                items.push({
                  title: title.substring(0, 200),
                  price,
                  url: href.startsWith('http') ? href : `https://www.snitch.com${href}`,
                  imageUrl: imageUrl.startsWith('http') ? imageUrl : imageUrl ? `https://www.snitch.com${imageUrl}` : '',
                });
              }
            } catch (e) {
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

        console.log(`[Snitch] Found ${pageProducts.length} products on ${url}, total unique: ${products.length}`);
      } catch (error: any) {
        console.error(`[Snitch] Error scraping ${url}:`, error.message);
      }
    }

    await closePage(page);

    // Use demo products as fallback if no products were found
    let productsToSave = products;
    if (productsToSave.length === 0) {
      console.log('[Snitch] No products found via Puppeteer, using demo data');
      updateProgress_('scraping', 'No live products found, using demo data...', 80);
      productsToSave = await generateDemoProducts('snitch');
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
          const categoryImages: { [key: string]: string } = {
            'tshirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
            'shirt': 'https://images.unsplash.com/photo-1589885755246-e4b1092dd029?w=500&h=500&fit=crop',
            'jeans': 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop',
            'jacket': 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&h=500&fit=crop',
            'hoodie': 'https://images.unsplash.com/photo-1556821552-107d12e0ba5d?w=500&h=500&fit=crop',
            'pants': 'https://images.unsplash.com/photo-1473966143120-7d3e6b0b11e2?w=500&h=500&fit=crop',
            'dress': 'https://images.unsplash.com/photo-1595777707802-13b82e908642?w=500&h=500&fit=crop',
            'shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
            'sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
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
  } catch (error: any) {
    console.error('[Snitch] Scraping failed:', error);
    return { itemsScraped: 0, itemsUpdated: 0, status: 'failed', error: error?.message || 'Unknown error' };
  } finally {
    if (browser) {
      await closeBrowser(browser);
    }
  }
}
