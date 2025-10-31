# Scrapper Application - How to Use

## 🎯 Overview

The Scrapper application consists of two main parts:
- **Frontend**: User interface at http://localhost:3001
- **Backend**: API server at http://localhost:5000

Both must be running for the application to work correctly.

---

## ✅ Verify Everything is Running

### Check 1: Run the Diagnostic Script

```bash
cd /home/vishal/Development/Scrapper
bash diagnose.sh
```

Expected output:
```
✓ Backend is running
✓ Frontend is running
✓ Websites API is responding  (Found 6 websites)
✓ Products API is responding  (Total products: 417+)
✓ Websites have been scraped
```

If anything shows as ✗, follow the fixes in that section.

---

## 🚀 Starting the Application

### Terminal 1 - Start Backend

```bash
cd /home/vishal/Development/Scrapper/backend
npm run dev
```

Expected output:
```
Server running on port 5000
```

### Terminal 2 - Start Frontend

```bash
cd /home/vishal/Development/Scrapper/frontend
npm run dev
```

Expected output:
```
✓ Ready in 1920ms
- Local: http://localhost:3001
```

### Open in Browser

Visit: **http://localhost:3001**

---

## 📖 Using the Application

### Page 1: Dashboard (/)

**What it shows**:
- Total websites configured
- Total products scraped
- Total scraping logs
- Quick action buttons

**What you can do**:
- View statistics
- Click "Manage Websites" to go to websites page
- Click "Browse Products" to see products
- Click "View Logs" to see scraping history

---

### Page 2: Websites Management (/websites)

**What it shows**:
- List of all configured websites (currently 6)
- Last scraped timestamp for each
- Enable/disable toggle for each website

**What you can do**:

#### Add a New Website
1. Click "+ Add Website" button
2. Enter website name (e.g., "MyStore")
3. Enter website URL (e.g., "https://mystore.com")
4. Click "Add Website"

#### Scrape a Website
1. Click the green "Play" button next to any website
2. The system will start scraping products from that website
3. Wait for the toast notification showing "✅ Scraped X items"
4. Go to Products page to see the new products

#### Edit a Website
1. Click the pencil icon next to a website
2. Update the name or URL
3. Click "Save Changes"

#### Delete a Website
1. Click the trash icon next to a website
2. Confirm deletion
3. All products from that website will also be deleted

#### Enable/Disable a Website
1. Click the eye icon next to a website
2. It will toggle between enabled (green eye) and disabled (crossed-out eye)
3. Only enabled websites can be scraped

---

### Page 3: Browse Products (/products)

**What it shows**:
- Grid of all scraped products (4 columns on desktop)
- Product image, title, price
- Available colors and sizes

**What you can do**:

#### Search for Products
1. Click the search icon in the header
2. Type product name or keywords
3. Results update in real-time

#### Filter Products

Use the "Filters" button to:
1. **Filter by Website**: Select which website to show products from
2. **Filter by Price**: Set minimum and maximum price
3. **Filter by Color**: Type a color (e.g., "red", "blue")
4. **Filter by Size**: Type a size (e.g., "M", "L", "XL")

#### View Product Details
1. Click any product card
2. You'll see the full product details page

#### Reset Filters
1. Click "Filters" to expand filter panel
2. Click the "Reset" button (with X icon)
3. All filters will be cleared

#### Pagination
1. Use "Previous" and "Next" buttons at the bottom
2. Shows current page and total number of pages
3. Each page shows 20 products by default

---

### Page 4: Product Detail (/product/[id])

**What it shows**:
- Large product image with discount badge
- Product title and price
- Original price (if on sale)
- Available colors with color picker
- Available sizes with availability status
- Full product description

**What you can do**:

#### Select Product Options
1. Click on a color to select it
2. Click on a size to select it
3. Unavailable sizes are grayed out

#### Navigate
1. Click "Back to Products" to return to product list
2. Click website name link to filter by that website

#### Share (Not yet implemented)
- Heart icon: For wishlist (placeholder)
- Share icon: To share product (placeholder)
- External link button: Would open original product page

---

### Page 5: Scraping Logs (/logs)

**What it shows**:
- History of all scraping operations
- Website name
- Number of items scraped and updated
- Status (success, failed, in-progress)
- When the scrape happened
- Any error messages

**What you can do**:

#### View Scrape History
- Scroll through all scraping logs
- See which websites were scraped
- Check if scraping was successful

#### Change Items Per Page
1. Use the dropdown "Items per page" (shows 10, 20, 50)
2. Page will reload with new count

#### Navigate Pages
1. Use "Previous" and "Next" buttons
2. Go to specific pages of log history

#### Check for Errors
1. Look for red error messages
2. Click the log entry to see full error details

---

## 🎨 Theme Support

### Switch Between Dark and Light Mode
1. Look at the sidebar (left side)
2. Click the moon icon at the bottom
3. Theme will toggle between dark (gray-900) and light (white)
4. Your preference is saved automatically

---

## 🔍 Current Data Status

### Available Websites (6)
1. **Amazon** - 110 products
2. **Flipkart** - 7 products
3. **TestShop** - 169 products
4. **BeYoung** - 52 products
5. **Snitch** - 79 products
6. **Zara** - 0 products

### Total Products in Database
- **417 products** scraped from these websites

### How Products Got There
- Products were scraped from each website when the scrape button was clicked
- Each product has title, price, image, colors, sizes from the scraped website

---

## 🔄 Workflow: Complete User Flow

### Step 1: Start Application
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Browser
Open http://localhost:3001
```

### Step 2: Browse Products
1. Click "Browse Products" from dashboard
2. See all 417 products in grid
3. Use filters to narrow down results
4. Click a product to see details

### Step 3: Scrape New Products
1. Go to Websites page
2. Click green "Play" button on a website
3. Wait for toast notification
4. Go back to Products to see new items

### Step 4: Manage Websites
1. Add new websites with "+ Add Website"
2. Scrape from new websites
3. View scraping history in Logs page

---

## ⚠️ Troubleshooting

### Problem: Products Not Showing

**Solution**:
1. Check if backend is running: `curl http://localhost:5000/api/health`
2. If not, start backend: `cd backend && npm run dev`
3. Refresh frontend page (Ctrl+R)
4. Check browser console (F12) for errors

### Problem: Scraping Not Working

**Solution**:
1. Make sure website is enabled (green eye icon)
2. Click the Play button
3. Wait for the notification (should take 5-10 seconds)
4. If it fails, check the Logs page for error message
5. The website selector might need updating (see TROUBLESHOOTING_GUIDE.md)

### Problem: Pages Not Loading

**Solution**:
1. Check if frontend is running: `curl http://localhost:3001`
2. If not, restart: `cd frontend && npm run dev`
3. Clear browser cache: Ctrl+Shift+Delete
4. Try in incognito/private mode

### Problem: Slow Loading

**Solution**:
1. Products page loads 20 products per page
2. If slow, try clicking a filter first
3. Try going to page 2 or 3 instead of loading all products
4. Check your internet connection

---

## 📊 Example Workflows

### Workflow 1: Search for a Specific Product

```
1. Go to Products page (/products)
2. Type "shirt" in the search box
3. See all products with "shirt" in name
4. Click a result to see details
5. Done!
```

### Workflow 2: Find Products in a Price Range

```
1. Go to Products page (/products)
2. Click "Filters"
3. Set Min Price: 500
4. Set Max Price: 2000
5. See filtered results
6. Clear filters to reset
```

### Workflow 3: Scrape New Products from a Website

```
1. Go to Websites page (/websites)
2. Find "Amazon" website
3. Click green Play button
4. Wait for "Scraped X items, Updated Y" message
5. Go to Products page
6. See newly scraped products mixed with existing ones
```

### Workflow 4: Monitor Scraping Progress

```
1. Go to Logs page (/logs)
2. See all past scraping operations
3. Each row shows items scraped and updated
4. If failed, see error message
5. Understand when websites were last scraped
```

---

## 🎯 Quick Reference

| Task | Location | Action |
|------|----------|--------|
| View Products | /products | Browse grid |
| Search Products | /products | Use search header |
| Filter Products | /products | Click "Filters" button |
| Add Website | /websites | Click "+ Add Website" |
| Scrape Website | /websites | Click green Play button |
| View Details | /product/[id] | Click any product |
| Check Logs | /logs | View scraping history |
| Change Theme | Sidebar | Click moon icon |

---

## 🔧 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| No products showing | Refresh page, restart frontend |
| Scraping not starting | Check backend is running |
| Products page slow | Use filters to reduce results |
| Can't add website | Check all fields are filled |
| Dark mode not saving | Clear cookies, restart app |
| Page won't load | Check both servers are running |

---

## 📞 Getting Help

1. **Check if servers are running**:
   ```bash
   bash diagnose.sh
   ```

2. **See detailed troubleshooting**:
   ```bash
   cat TROUBLESHOOTING_GUIDE.md
   ```

3. **Understand the code**:
   ```bash
   cat FRONTEND_COMPLETION_SUMMARY.md
   ```

4. **Check API endpoints**:
   ```bash
   cat API_QUICK_REFERENCE.md
   ```

---

## 📝 Tips & Tricks

✅ **Dark mode is saved** - Your theme choice persists
✅ **Filters work together** - Combine multiple filters
✅ **Search is real-time** - Results update as you type
✅ **Pagination helps** - Use pages instead of scrolling
✅ **Products refresh automatically** - After scraping, refresh page

---

## 🎓 Learning the Code

- **Components**: `/frontend/src/components/ui/`
- **Pages**: `/frontend/src/pages/`
- **API calls**: `/frontend/src/lib/api.js`
- **Scraper**: `/backend/src/scrapers/snitch.ts`
- **Database**: `/backend/prisma/schema.prisma`

---

**Version**: 2.0
**Last Updated**: 2025-10-31
**Status**: ✅ Fully Functional

---

## Next Steps

After getting comfortable with using the application:

1. **Try scraping different websites** - Click Play on different websites
2. **Experiment with filters** - Combine multiple filters
3. **Check the logs** - See what was scraped when
4. **Add custom websites** - Create your own scraping targets
5. **Monitor performance** - See how long scrapes take

Enjoy using the Scrapper application! 🚀
