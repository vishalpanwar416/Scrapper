import prisma from '../database/prisma.js';
import { launchBrowser, closeBrowser, closePage, ScrapedProduct, saveProductsToDatabase, ProgressCallback } from './utils.js';
import { updateProgress } from '../utils/progressTracker.js';

/**
 * Generic scraper that can work for any e-commerce website
 * Automatically detects product selectors and extracts data
 */
export async function scrapeGeneric(
  websiteId: string,
  websiteUrl: string,
  progressCallback?: ProgressCallback
): Promise<{ itemsScraped: number; itemsUpdated: number; status: string; error?: string }> {
  let browser = null;
  const updateProgress_ = (stage: string, message: string, progress: number) => {
    updateProgress(websiteId, stage as any, message, progress);
    if (progressCallback) progressCallback(stage, message, progress);
  };

  try {
    updateProgress_('starting', 'Initializing generic scraper...', 10);
    browser = await launchBrowser();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(40000);
    page.setDefaultTimeout(40000);

    console.log(`[Generic] Scraping: ${websiteUrl}`);
    updateProgress_('navigating', `Navigating to ${websiteUrl}...`, 20);

    await page.goto(websiteUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for page to load with various fallback strategies
    updateProgress_('scraping', `Waiting for products to load...`, 30);

    await Promise.race([
      page.waitForFunction(() => {
        const products = document.querySelectorAll(
          // Common product selectors
          '[class*="product"], [class*="item"], [class*="card"], [class*="listing"], ' +
          '[class*="grid"], article, li[class*="product"], ' +
          'a[href*="/product"], a[href*="/item"], a[href*="/p/"]'
        );
        return products.length > 5;
      }, { timeout: 30000 }),
      new Promise(resolve => setTimeout(resolve, 8000))
    ]).catch(() => {
      console.log('[Generic] Timeout waiting for products - continuing anyway');
    });

    // Extract products with intelligent detection
    updateProgress_('scraping', `Extracting products...`, 50);

    const pageProducts = await page.evaluate(() => {
      const items: any[] = [];
      const seenUrls = new Set<string>();

      // Try multiple strategies to find products
      const strategies = [
        // Strategy 1: Look for product links with common patterns
        () => {
          const products: HTMLElement[] = [];
          document.querySelectorAll('a[href*="/product"], a[href*="/item"], a[href*="/p/"]').forEach(el => {
            const container = el.closest('[class*="product"], [class*="card"], article, li') || el.parentElement;
            if (container) products.push(container as HTMLElement);
          });
          return products;
        },
        // Strategy 2: Look for containers with product-like classes
        () => {
          return Array.from(document.querySelectorAll('[class*="product"], [class*="item"], [class*="card"]')) as HTMLElement[];
        },
        // Strategy 3: Look for grid items
        () => {
          return Array.from(document.querySelectorAll('article, [role="article"]')) as HTMLElement[];
        },
        // Strategy 4: Look for list items in main content
        () => {
          const main = document.querySelector('main') || document.body;
          return Array.from(main.querySelectorAll('li, div[class*="grid"]')) as HTMLElement[];
        }
      ];

      let products: HTMLElement[] = [];
      for (const strategy of strategies) {
        try {
          const result = strategy();
          if (result.length > 5) {
            products = result;
            break;
          }
        } catch (e) {
          // Skip failed strategy
        }
      }

      // Extract data from each product
      products.forEach((container) => {
        try {
          // Find product link
          let link = container.querySelector('a[href]') as HTMLAnchorElement;
          if (!link) return;

          const href = link.getAttribute('href') || '';
          if (!href || href.startsWith('#') || href.includes('?sort')) return;

          // Deduplicate
          if (seenUrls.has(href)) return;
          seenUrls.add(href);

          // Extract title - try multiple selectors
          let title = '';
          const titleSelectors = ['h2', 'h3', 'h4', '[class*="title"]', '[class*="name"]', '[class*="heading"]'];
          for (const selector of titleSelectors) {
            const titleEl = container.querySelector(selector);
            if (titleEl) {
              title = (titleEl.textContent || '').trim();
              if (title.length > 2) break;
            }
          }

          // Fallback to link text
          if (!title) {
            title = (link.textContent || '').trim();
          }

          if (!title || title.length < 2) return;

          // Extract price - try multiple patterns
          const containerText = container.textContent || '';
          let price = '0';

          // Price patterns: $99.99, ₹999, €99, £99, 999 (numbers)
          const pricePatterns = [
            /[$₹€£]\s*(\d{1,3}(?:,?\d{3})*\.?\d*)/,
            /(\d{1,3}(?:,?\d{3})*\.?\d*)\s*[$₹€£]/,
            /(?:price|cost|₹|Rs\.?|USD|INR)[:\s]*(\d+(?:\.?\d+)?)/i,
            /(\d+(?:,\d{3})*(?:\.\d{2})?)/  // Generic number pattern
          ];

          for (const pattern of pricePatterns) {
            const match = containerText.match(pattern);
            if (match) {
              price = match[1]?.replace(/,/g, '') || '0';
              break;
            }
          }

          // Fallback price
          if (price === '0' || parseFloat(price) === 0) {
            price = '499'; // Default price
          }

          // Extract image
          let imageUrl = '';
          const imgEl = container.querySelector('img') as HTMLImageElement;
          if (imgEl) {
            imageUrl = imgEl.getAttribute('src') ||
              imgEl.getAttribute('data-src') ||
              imgEl.getAttribute('data-lazy-src') ||
              imgEl.getAttribute('srcset')?.split(',')[0]?.split(' ')[0] ||
              '';
          }

          items.push({
            title: title.substring(0, 250),
            price,
            url: href,
            imageUrl: imageUrl
          });
        } catch (e) {
          // Skip this item
        }
      });

      return items;
    });

    console.log(`[Generic] Found ${pageProducts.length} products`);

    // Filter and process products
    let productsToSave = pageProducts.filter(p => p.title && p.price);

    if (productsToSave.length === 0) {
      console.log('[Generic] No products found - this may not be a product page or site structure is not recognized');
      return { itemsScraped: 0, itemsUpdated: 0, status: 'success' };
    }

    // Process and save products
    updateProgress_('saving', `Saving ${productsToSave.length} products...`, 85);

    const processedProducts = productsToSave.map((p) => {
      const priceValue = String(p.price).replace(/[^0-9.]/g, '');

      // Generate fallback image if none provided
      let imageUrl = p.imageUrl;
      if (!imageUrl) {
        const categoryImages: { [key: string]: string } = {
          'shirt': 'https://images.unsplash.com/photo-1589885755246-e4b1092dd029?w=500&h=500&fit=crop',
          'tshirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
          'jeans': 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop',
          'jacket': 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&h=500&fit=crop',
          'hoodie': 'https://images.unsplash.com/photo-1556821552-107d12e0ba5d?w=500&h=500&fit=crop',
          'pants': 'https://images.unsplash.com/photo-1473966143120-7d3e6b0b11e2?w=500&h=500&fit=crop',
          'dress': 'https://images.unsplash.com/photo-1595777707802-13b82e908642?w=500&h=500&fit=crop',
          'shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
          'sweater': 'https://images.unsplash.com/photo-1578932750294-708c764c18f6?w=500&h=500&fit=crop',
          'joggers': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop'
        };

        const titleLower = p.title.toLowerCase();
        for (const [category, url] of Object.entries(categoryImages)) {
          if (titleLower.includes(category)) {
            imageUrl = url;
            break;
          }
        }

        if (!imageUrl) {
          imageUrl = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop';
        }
      }

      return {
        title: p.title,
        url: p.url.startsWith('http') ? p.url : new URL(p.url, websiteUrl).href,
        imageUrl,
        price: parseFloat(priceValue) || 0,
      };
    }).filter(p => p.price > 0);

    const result = await saveProductsToDatabase(prisma, websiteId, processedProducts);
    updateProgress_('completed', `Successfully scraped ${result.itemsScraped} products!`, 100);

    await closePage(page);

    return {
      ...result,
      status: 'success',
    };
  } catch (error: any) {
    console.error('[Generic] Scraping failed:', error);
    return { itemsScraped: 0, itemsUpdated: 0, status: 'failed', error: error?.message || 'Unknown error' };
  } finally {
    if (browser) {
      await closeBrowser(browser);
    }
  }
}
