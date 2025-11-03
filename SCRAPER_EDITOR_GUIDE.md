# 📝 Scraper Editor Guide

A complete guide to editing scrapers directly from the Scrapper application without touching the command line.

## Overview

The Scraper Editor is a built-in interface that allows you to:
- ✅ View all available scrapers
- ✅ Edit scraper code directly in the app
- ✅ Validate syntax in real-time
- ✅ Get syntax help and examples
- ✅ Save changes and rebuild

## Access the Scraper Editor

1. Open your Scrapper application
2. Look for **"Scraper Editor"** in the sidebar menu
3. Click on it (or navigate to `/scraper-editor`)

## UI Overview

### Left Sidebar - Scraper List
- Shows all available scrapers (built-in and custom)
- Green **"Custom"** badge for scrapers you created
- File size shown in KB
- Click any scraper to edit it

### Right Panel - Code Editor
- Large textarea for editing scraper code
- Shows current filename (e.g., `amazon.ts`)
- "Unsaved Changes" indicator when you modify code
- Syntax validation results below editor

### Action Buttons

| Button | Function |
|--------|----------|
| **Validate** | Check TypeScript syntax before saving |
| **Syntax Help** | Show CSS selector examples and tips |
| **Reset** | Discard changes and reload last saved version |
| **Save Changes** | Validate and save the scraper file |

## Editing a Scraper

### Step 1: Select a Scraper
1. Find the website in the left sidebar
2. Click on it to load the scraper code

### Step 2: Understand the Structure

Every scraper has this basic structure:

```typescript
export async function scrapeAmazon(
  websiteId: string,
  progressCallback?: ProgressCallback
): Promise<{ itemsScraped: number; itemsUpdated: number; status: string; error?: string }> {
  // 1. Launch browser
  // 2. Navigate to website
  // 3. Wait for products to load
  // 4. Extract products with CSS selectors
  // 5. Save to database
  // 6. Return results
}
```

### Step 3: Find CSS Selectors

To customize a scraper, you need to find the correct CSS selectors for the website:

1. **Open the website in your browser**
2. **Press F12** to open Developer Tools
3. **Right-click on a product** and select "Inspect"
4. Find the HTML structure for:
   - Product container (DIV, ARTICLE, LI, etc.)
   - Product title (H2, H3, SPAN, etc.)
   - Price (SPAN with currency, DIV.price, etc.)
   - Image (IMG with SRC)
   - Product link (A with HREF)

### Step 4: Update Selectors in the Scraper

Find these TODO comments in the template:

```typescript
// TODO: Update these selectors based on the actual website structure
const productElements = document.querySelectorAll('[class*="product"]');

productElements.forEach((el) => {
  try {
    const titleEl = el.querySelector('[class*="title"], h2, h3');
    const title = titleEl?.textContent?.trim() || '';

    const priceEl = el.querySelector('[class*="price"]');
    const priceText = priceEl?.textContent?.trim() || '';
    const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
```

Replace the selectors:
- `[class*="product"]` → Actual product container selector
- `[class*="title"]` → Actual title selector
- `[class*="price"]` → Actual price selector

### Step 5: Test Your Changes

1. Click **"Validate"** to check for syntax errors
2. Fix any errors shown in red
3. Click **"Save Changes"** to save the file

### Step 6: Build and Deploy

After saving:
1. Go to your terminal
2. Run: `npm run build`
3. The scraper is now compiled and ready
4. Next time you scrape, it will use your custom scraper

## CSS Selector Examples

### Common Selectors

```css
/* Find by class name (partial match) */
[class*="product"]

/* Find by attribute value (partial match) */
a[href*="/product"]

/* Find by tag name */
article, li, div

/* Find by exact class */
.product-card

/* Find by exact ID */
#main-products

/* Child combinator */
div.container > article

/* Descendant combinator */
.product h2
```

### Testing Selectors

Open browser DevTools (F12) and test:

```javascript
// Test if selector finds products
document.querySelectorAll('[class*="product"]')

// Test if title selector works
document.querySelector('[class*="product"] h2')?.textContent
```

## Extracting Data

### Get Text Content
```typescript
const title = el.querySelector('h2')?.textContent?.trim() || '';
```

### Get Attribute Values
```typescript
const url = el.querySelector('a')?.getAttribute('href') || '';
const imageUrl = el.querySelector('img')?.src || '';
```

### Parse Price (Remove Currency Symbols)
```typescript
const priceText = '$19.99';
const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
// Result: 19.99
```

### Fallback Values (Handle Missing Data)
```typescript
const price = parseFloat(text) || 0;  // Use 0 if parsing fails
const title = titleEl?.textContent || 'Unknown';  // Use fallback
```

## Real-World Examples

### Example 1: Amazon-like Website

```typescript
// Find all product cards
const productElements = document.querySelectorAll('[class*="card"]');

productElements.forEach((el) => {
  const title = el.querySelector('h3')?.textContent?.trim();
  const priceText = el.querySelector('[class*="price"]')?.textContent || '';
  const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
  const imageUrl = el.querySelector('img')?.src;
  const productUrl = el.querySelector('a')?.href;

  // Add to items array...
});
```

### Example 2: E-commerce with Grid Layout

```typescript
// Find articles in grid
const productElements = document.querySelectorAll('article.product');

productElements.forEach((el) => {
  const title = el.querySelector('.product-name')?.textContent?.trim();
  const price = parseFloat(
    el.querySelector('.price')?.textContent?.replace(/[^0-9.]/g, '')
  );
  const imageUrl = el.querySelector('img[data-src]')?.getAttribute('data-src');
  const productUrl = el.querySelector('a.product-link')?.href;

  // Add to items array...
});
```

### Example 3: List-based Layout

```typescript
// Find list items
const productElements = document.querySelectorAll('li[data-product-id]');

productElements.forEach((el) => {
  const title = el.dataset.productName;
  const price = parseFloat(el.dataset.price);
  const imageUrl = el.querySelector('img')?.src;
  const productUrl = el.getAttribute('data-product-url');

  // Add to items array...
});
```

## Debugging Tips

### Add Console Logs

Add `console.log()` to see what's happening:

```typescript
const products = await page.evaluate(() => {
  const items = [];
  const productElements = document.querySelectorAll('[class*="product"]');

  console.log('Found products:', productElements.length);  // ← Add this

  productElements.forEach((el, index) => {
    const title = el.querySelector('h2')?.textContent?.trim();
    console.log(`Product ${index}: ${title}`);  // ← Add this

    items.push({ title, ... });
  });

  return items;
});
```

Check Render logs to see output:
1. Go to Render dashboard
2. Click on `scrapper-backend`
3. View logs to see console.log output

### Check What Selectors Match

In browser DevTools:

```javascript
// Test if selector finds anything
document.querySelectorAll('YOUR_SELECTOR_HERE').length

// See first matching element
document.querySelector('YOUR_SELECTOR_HERE')

// See all matching elements
document.querySelectorAll('YOUR_SELECTOR_HERE')
```

## Common Issues

### Problem: "Found 0 products"

**Causes:**
- Selector is incorrect
- Page didn't fully load
- JavaScript renders the content after page load

**Solutions:**
1. Verify selector in browser DevTools
2. Increase wait time:
   ```typescript
   await page.waitForSelector('YOUR_SELECTOR', { timeout: 60000 });
   ```
3. Add page scrolling to trigger lazy loading:
   ```typescript
   await page.evaluate(() => {
     window.scrollBy(0, window.innerHeight);
   });
   ```

### Problem: Prices are 0 or null

**Causes:**
- Price selector is wrong
- Price format includes non-numeric characters
- Price text is in a different location

**Solutions:**
```typescript
// Debug: log what you're extracting
const priceText = el.querySelector('[class*="price"]')?.textContent || '';
console.log('Price text:', priceText);

// Try different regex patterns
const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
```

### Problem: "Failed to build" after saving

**Causes:**
- Syntax error in code
- Missing import or function
- Typo in variable name

**Solution:**
1. Click "Validate" to see exact error
2. Fix the error in the editor
3. Save again

## Advanced Tips

### Wait for Dynamic Content

If content loads with JavaScript:

```typescript
await page.evaluate(() => {
  return new Promise((resolve) => {
    // Wait until products appear
    const checkProducts = setInterval(() => {
      if (document.querySelectorAll('[class*="product"]').length > 5) {
        clearInterval(checkProducts);
        resolve(true);
      }
    }, 500);

    // Give up after 30 seconds
    setTimeout(() => {
      clearInterval(checkProducts);
      resolve(false);
    }, 30000);
  });
});
```

### Handle Pagination

Scrape multiple pages:

```typescript
const allProducts = [];

for (let page = 1; page <= 5; page++) {
  // Navigate to page
  await page.goto(`${url}?page=${page}`, { waitUntil: 'networkidle2' });

  // Extract products (see main template)
  const pageProducts = await page.evaluate(() => { ... });

  allProducts.push(...pageProducts);
}

// Save all products
const { newCount, updatedCount } = await saveProductsToDatabase(
  allProducts as ScrapedProduct[],
  websiteId
);
```

### Skip Already Scraped Products

```typescript
const seenUrls = new Set<string>();

productElements.forEach((el) => {
  const productUrl = el.querySelector('a')?.href || '';

  // Skip if already seen
  if (seenUrls.has(productUrl)) return;
  seenUrls.add(productUrl);

  // Extract and add...
});
```

## Validation Rules

The validator checks for:
- ✅ Required imports (prisma, launchBrowser, etc.)
- ✅ Function signature matches template
- ✅ Return object with required fields
- ✅ Browser cleanup in finally block
- ✅ Try-catch error handling
- ✅ Matching opening/closing brackets

See validation errors by clicking **"Validate"** before saving.

## Next Steps After Editing

### Deploy to Production

1. **Save** your scraper in the editor
2. **Build** locally: `npm run build`
3. **Test** by scraping a website
4. **Push** to GitHub: `git add . && git commit && git push`
5. **Monitor** Render logs to see it working

### Test Different Selectors

If your scraper doesn't find all products:
1. Go back to browser DevTools
2. Try different selectors
3. Update the scraper
4. Save and rebuild
5. Test again

### Share Improvements

If you find a better approach:
1. Document your changes in comments
2. Save the scraper
3. Push to GitHub
4. Other team members benefit!

## Need Help?

### Check Syntax Help
Click **"Syntax Help"** button in the editor for CSS selector examples.

### View Console Logs
1. Go to Render dashboard
2. Navigate to `scrapper-backend`
3. Click **"Logs"** tab
4. Search for your console.log outputs

### Test in Browser
Open the target website, press F12, and test selectors manually.

### Common Fixes

| Issue | Fix |
|-------|-----|
| Selector not found | Inspect in DevTools, update selector |
| Price is 0 | Check regex for price extraction |
| Missing images | Use data-src or lazy-loaded image sources |
| No products scraped | Wait longer, scroll page, check selector |
| Build fails | Click Validate to see error |

---

**Happy scraping!** 🚀

For more help, see `DEPLOYMENT.md` and `DEPLOYMENT_SUMMARY.md`.
