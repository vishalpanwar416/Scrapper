import puppeteer from 'puppeteer';
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
    return [];
}
export async function saveProductsToDatabase(prisma, websiteId, products) {
    let itemsScraped = 0;
    let itemsUpdated = 0;
    for (const product of products) {
        try {
            // Check if product already exists
            const existing = await prisma.product.findFirst({
                where: {
                    websiteId,
                    url: product.url,
                },
            });
            if (existing) {
                // Update existing product
                await prisma.product.update({
                    where: { id: existing.id },
                    data: {
                        title: product.title,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        description: product.description,
                        imageUrl: product.imageUrl,
                    },
                });
                itemsUpdated++;
            }
            else {
                // Create new product
                await prisma.product.create({
                    data: {
                        title: product.title,
                        url: product.url,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        description: product.description,
                        imageUrl: product.imageUrl,
                        websiteId,
                    },
                });
                itemsScraped++;
            }
        }
        catch (error) {
            console.error(`Error saving product "${product.title}":`, error);
            // Continue with next product
        }
    }
    return { itemsScraped, itemsUpdated };
}
