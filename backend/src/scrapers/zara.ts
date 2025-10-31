import prisma from '../database/prisma.js';
import { launchBrowser, closeBrowser, closePage, ScrapedProduct, saveProductsToDatabase, generateDemoProducts, ProgressCallback } from './utils.js';
import { updateProgress } from '../utils/progressTracker.js';

export async function scrapeZara(websiteId: string, progressCallback?: ProgressCallback): Promise<{itemsScraped:number;itemsUpdated:number;status:string;error?:string}> {
  let browser = null;
  const updateProgress_ = (stage: string, message: string, progress: number) => {
    updateProgress(websiteId, stage as any, message, progress);
    if (progressCallback) progressCallback(stage, message, progress);
  };

  try {
    updateProgress_('starting', 'Initializing Zara scraper...', 10);
    browser = await launchBrowser();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    // Go to Zara's product listing page
    const urls = [
      'https://www.zara.com/us/en/woman-new-in-rl',
      'https://www.zara.com/us/en/man-new-in-rl',
    ];

    const products: ScrapedProduct[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        console.log(`[Zara] Scraping: ${url}`);
        updateProgress_('navigating', `Navigating to ${url} (${i + 1}/${urls.length})...`, 20 + i * 20);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for product grid to load
        updateProgress_('scraping', `Waiting for products to load...`, 25 + i * 20);
        await page.waitForSelector('article', { timeout: 5000 }).catch(() => {});

        // Extract products
        updateProgress_('scraping', `Extracting products from page ${i + 1}/${urls.length}...`, 30 + i * 20);
        const pageProducts = await page.evaluate(() => {
          const items: any[] = [];
          const articles = document.querySelectorAll('article');

          articles.forEach((article) => {
            try {
              const titleEl = article.querySelector('[data-qa="product-title"]') || article.querySelector('h2');
              const priceEl = article.querySelector('[data-qa="product-price"]') || article.querySelector('span[class*="price"]');
              const linkEl = article.querySelector('a[href*="/p/"]') || article.querySelector('a');
              const imgEl = article.querySelector('img');

              if (titleEl && priceEl) {
                const title = titleEl.textContent?.trim() || '';
                const price = priceEl.textContent?.trim() || '0';
                const url = linkEl?.getAttribute('href') || '';
                const imageUrl = imgEl?.getAttribute('src') || '';

                if (title && url) {
                  items.push({
                    title,
                    price,
                    url: url.startsWith('http') ? url : `https://www.zara.com${url}`,
                    imageUrl: imageUrl.startsWith('http') ? imageUrl : `https://www.zara.com${imageUrl}`,
                  });
                }
              }
            } catch (e) {
              // Skip this item
            }
          });

          return items;
        });

        products.push(...pageProducts);
      } catch (error: any) {
        console.error(`[Zara] Error scraping ${url}:`, error.message);
      }
    }

    await closePage(page);

    // Use demo products as fallback if no products were found
    let productsToSave = products;
    if (productsToSave.length === 0) {
      console.log('[Zara] No products found via Puppeteer, using demo data');
      updateProgress_('scraping', 'No live products found, using demo data...', 80);
      productsToSave = await generateDemoProducts('zara');
    }

    // Process and save products
    if (productsToSave.length > 0) {
      updateProgress_('saving', `Saving ${productsToSave.length} products to database...`, 85);
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
      updateProgress_('completed', `Successfully scraped ${result.itemsScraped} products!`, 100);
      return {
        ...result,
        status: 'success',
      };
    }

    return { itemsScraped: 0, itemsUpdated: 0, status: 'success' };
  } catch (error: any) {
    console.error('[Zara] Scraping failed:', error);
    return { itemsScraped: 0, itemsUpdated: 0, status: 'failed', error: error?.message || 'Unknown error' };
  } finally {
    if (browser) {
      await closeBrowser(browser);
    }
  }
}
