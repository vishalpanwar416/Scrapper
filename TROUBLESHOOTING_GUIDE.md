# Troubleshooting Guide - Scrapper Application

## Issue: Scraping Failing & Products Not Fetching

### Symptoms
- ❌ Scraping doesn't start
- ❌ Products not displaying in frontend
- ❌ "No products found" error in logs
- ❌ API calls failing from frontend

---

## Diagnostic Checks

### 1. Backend API Status

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check if websites are configured
curl http://localhost:5000/api/websites

# Check if products exist
curl http://localhost:5000/api/products?limit=5
```

**Expected Output**: JSON with websites and products data

**If Failing**:
- Make sure backend server is running
- Check backend logs for errors
- Verify database connection

---

### 2. Frontend API Connection

Open browser developer tools (F12):

```javascript
// Test API connection
fetch('http://localhost:5000/api/websites')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error('API Error:', e))
```

**If Getting CORS Error**:
- Backend CORS middleware might not be working
- Frontend should still connect (same localhost)
- Check browser console for specific error

---

### 3. Database Status

Check if Prisma is connected:

```bash
cd backend
npx prisma studio
```

This opens a visual database browser at http://localhost:5555

---

## Common Issues & Solutions

### Issue 1: "No products found" when scraping

**Cause**: Website selectors don't match the website's HTML structure

**Solution**:

1. Open the website in a browser
2. Open Developer Tools (F12)
3. Right-click on a product → Inspect Element
4. Find the CSS selector that wraps each product
5. Update `/backend/src/scrapers/snitch.ts` with correct selectors

**Example Fix**:
```javascript
// Current selectors in snitch.ts (line 158-163)
let selectors = [
  'a[href*="/products/"]',      // Products in URL
  'a[href*="/product/"]',        // Alternative product URL format
  '[data-testid*="product"] a',  // Data test ID
  '.product-card a[href]',       // CSS class
];

// Add specific Snitch.com selectors if needed:
// 'a[href*="snitch.com"]'       // Domain-specific
// '.product-item'               // Actual Snitch.com class
```

---

### Issue 2: Frontend Not Showing Products

**Cause 1**: API not configured correctly

```bash
# Check frontend .env.local
cat /frontend/.env.local

# Should show:
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Fix**:
```bash
# Update if needed
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > /frontend/.env.local

# Restart frontend server
npm run dev
```

**Cause 2**: Products page API call failing

Open browser console (F12) and go to /products:
- Look for errors in Console tab
- Check Network tab for failed requests
- Check what status code API returns

---

### Issue 3: Scraping Endpoint Failing

**Check endpoint directly**:
```bash
curl -X POST http://localhost:5000/api/scrape/start/snitch \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response should be**:
```json
{
  "success": true,
  "message": "Scraping completed",
  "data": {
    "itemsScraped": 10,  // Should be > 0
    "itemsUpdated": 5,
    "status": "completed"
  }
}
```

**If itemsScraped is 0**:
- Website selectors are wrong
- Website URL is inaccessible
- Website has changed structure
- Need to debug selectors

---

### Issue 4: CORS Errors

**Error**: "Access to fetch from localhost:5001 has been blocked by CORS policy"

**Solution**: This shouldn't happen on localhost, but if it does:

1. Check backend CORS middleware is enabled
2. Restart both frontend and backend
3. Clear browser cache (Ctrl+Shift+Delete)

**Verify CORS is enabled**:
```bash
curl -i http://localhost:5000/api/websites

# Look for these headers:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

---

## Step-by-Step Debugging

### Step 1: Verify Backend is Running

```bash
# Terminal 1: Start backend
cd /home/vishal/Development/Scrapper/backend
npm run dev

# Should show: Server running on port 5000
```

### Step 2: Verify Frontend is Running

```bash
# Terminal 2: Start frontend
cd /home/vishal/Development/Scrapper/frontend
npm run dev

# Should show: Ready in 1920ms
```

### Step 3: Test Websites API

```bash
curl http://localhost:5000/api/websites | jq '.[0]'

# Should show a website with name, url, enabled status
```

### Step 4: Test Products API

```bash
curl http://localhost:5000/api/products | jq '.data[0]'

# Should show a product with title, price, imageUrl
```

### Step 5: Test Scraping

```bash
curl -X POST http://localhost:5000/api/scrape/start/snitch -d '{}' | jq '.data'

# Should show itemsScraped > 0
```

### Step 6: Check Frontend Display

1. Open http://localhost:3001
2. Click "Browse Products" from Dashboard
3. Open browser Developer Tools (F12)
4. Check Console for errors
5. Check Network tab to see API requests

---

## Fixing Selector Issues

### Step 1: Inspect Target Website

```bash
# Open the website
open https://snitch.com

# Right-click product → Inspect Element
# Look for repeating HTML pattern for products
```

### Step 2: Identify Common Classes/IDs

```javascript
// Common patterns to look for:
- class="product*"
- class="item*"
- data-testid="product*"
- [href*="/products/"]
- article, li with product data
```

### Step 3: Update Scraper Selectors

Edit `/backend/src/scrapers/snitch.ts` around line 158:

```javascript
let selectors = [
  // Add found selectors first (most specific)
  '.snitch-product-card a',      // Most specific first
  '[data-product-id] a',          // Alternative
  'a[href*="/products/"]',        // Generic fallback
];
```

### Step 4: Test Scraping

```bash
npm run dev  # in backend directory

# In another terminal:
curl -X POST http://localhost:5000/api/scrape/start/snitch -d '{}'
```

---

## Browser Console Debugging

### Useful Console Commands

```javascript
// 1. Check API configuration
console.log('API Base:', fetch('http://localhost:5000').then(r => r.ok))

// 2. Test fetching products
fetch('http://localhost:5000/api/products?limit=5')
  .then(r => r.json())
  .then(d => {
    console.log('Total products:', d.pagination.total)
    console.log('Sample:', d.data[0])
  })

// 3. Test fetching a specific product
fetch('http://localhost:5000/api/products/cmhesmyze00g4iznmooesfcxq')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## Performance Tips

### If Scraping is Slow

```bash
# Check if database has indexes
npx prisma studio

# Look at Products table
# Should see indexes on: websiteId, createdAt
```

### If Frontend is Slow

1. Open DevTools → Performance tab
2. Record page load
3. Look for slow API calls
4. Check Network tab for large responses

---

## Reset & Start Fresh

### Option 1: Clear Cache Only

```bash
# Frontend
rm -rf /frontend/.next
npm run dev

# Backend
npm run dev
```

### Option 2: Full Reset

```bash
# Stop services
pkill -f "npm run dev"

# Clear frontend cache
rm -rf /frontend/.next
rm -rf /frontend/node_modules/.cache

# Restart
cd /frontend && npm run dev  # Terminal 1
cd /backend && npm run dev   # Terminal 2
```

### Option 3: Database Reset

```bash
# CAUTION: This clears all data!
cd /backend
npx prisma migrate reset  # Resets and re-runs migrations

# Answer "yes" when prompted
```

---

## Logs to Check

### Backend Logs
Look for lines like:
```
✓ GET /api/products 200
✓ POST /api/scrape/start/snitch 200
```

If you see `500` errors, check the terminal output.

### Frontend Logs
- Open browser DevTools (F12)
- Go to Console tab
- Look for red errors or warnings

---

## Quick Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3001
- [ ] Can fetch http://localhost:5000/api/websites
- [ ] Can fetch http://localhost:5000/api/products
- [ ] Scrape endpoint returns itemsScraped > 0
- [ ] Frontend Products page loads without console errors
- [ ] Dark mode toggle works
- [ ] Can navigate between pages

---

## Getting Help

### Check Error Message

Most errors will show:
```
GET /api/products failed: 500
POST /api/scrape/start/snitch failed: 400
```

Look for these patterns:
- **500**: Server error - check backend logs
- **404**: Endpoint not found - check route
- **400**: Bad request - check parameters
- **CORS**: Origin not allowed - check CORS config

### Check Backend Logs

```bash
# Look for specific error
grep -i "error\|failed\|exception" /backend/logs

# Or check terminal output while running npm run dev
```

---

## Common Solutions

| Problem | Solution |
|---------|----------|
| No products showing | Run scrape from Websites page |
| Scrape returns 0 items | Update selectors in scraper |
| CORS error | Restart both servers |
| API 404 error | Check backend is running |
| Blank pages | Check browser console for errors |
| Slow loading | Wait 30s, restart backend |
| Products missing | Products need to be scraped first |

---

## Manual Troubleshooting Workflow

```bash
# 1. Kill all servers
pkill -f "npm run dev"
sleep 2

# 2. Check database
cd backend && npx prisma studio  # Opens http://localhost:5555

# 3. Restart backend
cd backend && npm run dev

# 4. In new terminal - test API
sleep 3 && curl http://localhost:5000/api/websites

# 5. Test scraping
curl -X POST http://localhost:5000/api/scrape/start/snitch -d '{}'

# 6. Restart frontend
cd frontend && npm run dev

# 7. Open http://localhost:3001 in browser
# 8. Go to Products page and check if data loads
```

---

## Still Need Help?

1. Check if backend is actually running: `curl http://localhost:5000/api/health`
2. Check database connection: `cd backend && npx prisma studio`
3. Look at actual error messages in console
4. Restart both servers completely
5. Clear browser cache (Ctrl+Shift+Delete)

---

**Last Updated**: 2025-10-31
**Status**: Reference guide for troubleshooting
