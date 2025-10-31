import puppeteer, { Browser, Page } from 'puppeteer';
import ValidationPipeline from '../validators/validationPipeline.js';
import { RawProduct } from '../validators/productValidator.js';

export interface ScrapedProduct {
  title: string;
  url: string;
  price: number;
  originalPrice?: number;
  description?: string;
  imageUrl?: string;
  colors?: string[];
  sizes?: string[];
}

export interface ValidationMetadata {
  sanitized: boolean;
  validationWarnings: number;
  validationErrors: number;
}

export type ProgressCallback = (stage: string, message: string, progress: number) => void;

export async function launchBrowser(): Promise<Browser> {
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

export async function closePage(page: Page): Promise<void> {
  try {
    await page.close();
  } catch (error) {
    // Page already closed
  }
}

export async function closeBrowser(browser: Browser): Promise<void> {
  try {
    await browser.close();
  } catch (error) {
    // Browser already closed
  }
}

export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    return false;
  }
}

export async function extractPrice(priceStr: string): Promise<number> {
  const match = priceStr.match(/[\d,]+\.?\d*/);
  if (match) {
    return parseFloat(match[0].replace(/,/g, ''));
  }
  return 0;
}

export async function generateDemoProducts(websiteName: string, count: number = 8): Promise<ScrapedProduct[]> {
  // Demo products removed - returns empty array
  return [];
}

export async function saveProductsToDatabase(
  prisma: any,
  websiteId: string,
  products: ScrapedProduct[]
): Promise<{ itemsScraped: number; itemsUpdated: number; validated: number; rejected: number; validationReport: string }> {
  let itemsScraped = 0;
  let itemsUpdated = 0;
  let validated = 0;
  let rejected = 0;

  // Run validation pipeline on all products
  const rawProducts: RawProduct[] = products.map(p => {
    const sizes = (p.sizes || []).map(s =>
      typeof s === 'string' ? { size: s, available: true, stock: 0 } : s
    );
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

  const batchResult = ValidationPipeline.processBatch(rawProducts);
  const validationReport = ValidationPipeline.generateReport(batchResult);

  console.log('\n' + validationReport + '\n');

  // Save validated products
  for (const result of batchResult.results) {
    try {
      const cleanedData = result.data;
      validated++;

      // Check if product already exists
      const existing = await prisma.product.findFirst({
        where: {
          websiteId,
          url: cleanedData.url,
        },
      });

      if (existing) {
        // Update existing product
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            title: cleanedData.title,
            price: cleanedData.price,
            originalPrice: cleanedData.originalPrice,
            description: cleanedData.description,
            imageUrl: cleanedData.imageUrl,
          },
        });

        // Update colors if provided
        if (cleanedData.colors.length > 0) {
          await prisma.color.deleteMany({ where: { productId: existing.id } });
          for (const colorName of cleanedData.colors) {
            await prisma.color.create({
              data: {
                name: colorName,
                productId: existing.id,
              },
            });
          }
        }

        // Update sizes if provided
        if (cleanedData.sizes.length > 0) {
          await prisma.size.deleteMany({ where: { productId: existing.id } });
          for (const sizeName of cleanedData.sizes) {
            await prisma.size.create({
              data: {
                size: sizeName,
                productId: existing.id,
              },
            });
          }
        }

        itemsUpdated++;
      } else {
        // Create new product
        const newProduct = await prisma.product.create({
          data: {
            title: cleanedData.title,
            url: cleanedData.url,
            price: cleanedData.price,
            originalPrice: cleanedData.originalPrice,
            description: cleanedData.description,
            imageUrl: cleanedData.imageUrl,
            websiteId,
          },
        });

        // Add colors
        if (cleanedData.colors.length > 0) {
          for (const colorName of cleanedData.colors) {
            await prisma.color.create({
              data: {
                name: colorName,
                productId: newProduct.id,
              },
            });
          }
        }

        // Add sizes
        if (cleanedData.sizes.length > 0) {
          for (const sizeName of cleanedData.sizes) {
            await prisma.size.create({
              data: {
                size: sizeName,
                productId: newProduct.id,
              },
            });
          }
        }

        itemsScraped++;
      }
    } catch (error) {
      console.error(`Error saving validated product "${result.data.title}":`, error);
      // Continue with next product
    }
  }

  rejected = batchResult.failed;

  if (rejected > 0) {
    console.warn(`[Validation] ${rejected} products were rejected during validation`);
  }

  return { itemsScraped, itemsUpdated, validated, rejected, validationReport };
}
