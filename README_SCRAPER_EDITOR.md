# 🎯 Scraper Editor - Quick Reference

Your Scrapper application now includes a **built-in Scraper Editor** for editing website scrapers without touching the command line!

## What You Can Do Now

✅ Edit scrapers directly in the app
✅ Validate syntax in real-time
✅ Save changes with one click
✅ Get help with CSS selectors
✅ See all available scrapers
✅ Test different selectors
✅ Add custom scrapers for new websites

## Getting Started

### 1. Open Scraper Editor
- Click "Scraper Editor" in the sidebar
- Or navigate to `/scraper-editor`

### 2. Select a Website
- Choose from the scraper list on the left
- Built-in scrapers marked with "(Built-in)"
- Custom scrapers marked with green "Custom" badge

### 3. Edit the Code
- Find the TODO comments in the code
- Update CSS selectors to match the actual website
- Use "Syntax Help" button for examples

### 4. Validate & Save
- Click "Validate" to check for errors
- Click "Save Changes" to save
- Remember to run: `npm run build`

## Simple Example: Update a Scraper

### Before (Template):
```typescript
const productElements = document.querySelectorAll('[class*="product"]');
const titleEl = el.querySelector('[class*="title"], h2, h3');
const priceEl = el.querySelector('[class*="price"]');
```

### After (Custom for Amazon):
```typescript
const productElements = document.querySelectorAll('div[data-component-type="s-search-result"]');
const titleEl = el.querySelector('h2 a span');
const priceEl = el.querySelector('.a-price-whole');
```

That's it! Now it'll find products on Amazon instead of generic sites.

## Key Features

### Scraper List
- Shows file size
- Badge for custom scrapers
- Click to load and edit

### Code Editor
- Full TypeScript support
- Line numbers
- Syntax highlighting
- Large text area for comfort

### Validation
- Real-time syntax checking
- Shows errors and warnings
- Prevents saving broken code
- Explains what's wrong

### Help System
- **Syntax Help** button shows CSS examples
- Common selectors for different websites
- Data extraction patterns
- Tips and tricks

### Action Buttons

| Button | What It Does |
|--------|-------------|
| **Validate** | Check if code is valid |
| **Syntax Help** | Show CSS selector examples |
| **Reset** | Discard changes |
| **Save Changes** | Save and validate |

## The Workflow

```
1. Open Scraper Editor
   ↓
2. Pick a website scraper
   ↓
3. Inspect the website (F12 in browser)
   ↓
4. Find CSS selectors
   ↓
5. Update selectors in editor
   ↓
6. Click Validate (fix any errors)
   ↓
7. Click Save Changes
   ↓
8. In terminal: npm run build
   ↓
9. Next scrape uses your custom scraper!
```

## Finding CSS Selectors

1. **Open website in browser**
2. **Press F12** to open DevTools
3. **Right-click on a product**
4. **Select "Inspect"**
5. **Look for the HTML pattern:**
   - Product container: `<div class="product">`
   - Title: `<h2>Product Name</h2>`
   - Price: `<span class="price">$99.99</span>`
6. **Update selectors in editor:**
   ```typescript
   document.querySelectorAll('div.product');
   el.querySelector('h2');
   el.querySelector('span.price');
   ```

## Common CSS Selector Patterns

```typescript
// By class name (exact)
document.querySelectorAll('.product-card')

// By class name (partial)
document.querySelectorAll('[class*="product"]')

// By attribute
document.querySelectorAll('a[href*="/product"]')

// By tag name
document.querySelectorAll('article')
document.querySelectorAll('li')

// Combined
document.querySelectorAll('div.container > article.product')
```

## Testing Selectors

Open DevTools (F12) and run:

```javascript
// Check if selector finds products
document.querySelectorAll('[class*="product"]').length

// Get first result text
document.querySelector('h2')?.textContent

// Get all prices
document.querySelectorAll('[class*="price"]').forEach(el =>
  console.log(el.textContent)
)
```

## Real Example: Nike.com

```typescript
// Find product tiles
document.querySelectorAll('[data-qa="product-card"]')

// Get title
el.querySelector('h3')?.textContent

// Get price (might have currency)
const priceText = el.querySelector('div[role="heading"]')?.textContent
const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))

// Get image
el.querySelector('img')?.src

// Get product URL
el.querySelector('a')?.href
```

## After Saving

1. **Open terminal**
2. **Run:** `npm run build`
3. **Wait for compilation**
4. **Done!** Next scrape will use your custom scraper

## Debugging

### Check if Scraper is Working
1. Go to Websites page
2. Click "Scrape" on your website
3. Check if products appear

### See Error Messages
1. Go to Render dashboard
2. Click `scrapper-backend`
3. View Logs tab
4. Search for error messages

### Test Selectors
1. Open target website
2. Press F12
3. Paste selector in console
4. See what it finds

## Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| "Found 0 products" | Check selector in DevTools, update selector |
| Prices are 0 or null | Verify price selector, check regex pattern |
| Missing images | Use `data-src` for lazy-loaded images |
| "Build failed" error | Click Validate to see exact error |
| Scraper won't save | Make sure there are actual changes |

## More Help

- **Detailed Guide**: See `SCRAPER_EDITOR_GUIDE.md`
- **Deployment**: See `DEPLOYMENT.md`
- **API Docs**: Check `/api/scrapers` endpoints

## Pro Tips

💡 **Tip 1: Copy-Paste Development**
- Edit in editor
- Validate
- Save
- Build
- Test
- Repeat (no file switching needed!)

💡 **Tip 2: Use Fallbacks**
```typescript
// If one selector fails, try another
const title = el.querySelector('h2')?.textContent
           || el.querySelector('h3')?.textContent
           || 'Unknown';
```

💡 **Tip 3: Debug with Console Logs**
```typescript
console.log('Found products:', items.length);
console.log('First product:', items[0]);
// View in Render logs
```

💡 **Tip 4: Test Before Saving**
Click "Validate" - it catches 90% of errors before you save!

## Next Steps

1. ✅ Go to Scraper Editor
2. ✅ Pick a built-in scraper
3. ✅ Inspect a website
4. ✅ Find CSS selectors
5. ✅ Update the scraper
6. ✅ Validate and save
7. ✅ Run `npm run build`
8. ✅ Test scraping

You're ready to go! 🚀

---

Questions? Check `SCRAPER_EDITOR_GUIDE.md` for detailed information.
