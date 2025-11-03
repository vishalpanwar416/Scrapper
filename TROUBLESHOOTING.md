# 🔧 Troubleshooting Guide

**Last Updated:** November 3, 2025

Common issues and solutions for the Scrapper application.

---

## 🚀 Development Issues

### Problem: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**

1. **Kill the process using the port**
   ```bash
   # Linux/Mac
   lsof -i :5000
   kill -9 <PID>

   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Change the port in .env**
   ```bash
   PORT=5001
   ```

3. **Restart your system** (if above doesn't work)

---

### Problem: Database Connection Error

**Error:** `PrismaClientInitializationError: Can't reach database server`

**Solutions:**

1. **Reset the database**
   ```bash
   cd backend
   rm prisma/dev.db
   npm run db:setup
   ```

2. **Check DATABASE_URL in .env**
   ```bash
   # Should be:
   DATABASE_URL="file:./prisma/dev.db"
   ```

3. **Verify Prisma is installed**
   ```bash
   npm install @prisma/client prisma
   npm run db:setup
   ```

---

### Problem: Node Modules Missing

**Error:** `Error: Cannot find module '@prisma/client'`

**Solution:**

```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

# Same for frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

### Problem: TypeScript Compilation Error

**Error:** `error TS2307: Cannot find module`

**Solutions:**

1. **Check import paths are correct**
   ```typescript
   // Wrong
   import { apiGet } from '../lib/api'

   // Correct (with .ts extension or index.ts)
   import { apiGet } from '../lib/api.ts'
   ```

2. **Rebuild the project**
   ```bash
   cd backend
   npm run build
   ```

3. **Clear build cache**
   ```bash
   cd backend
   rm -rf dist/
   npm run build
   ```

---

## 🌐 Frontend Issues

### Problem: Blank Page on http://localhost:3001

**Possible Causes:**

1. **Backend is not running**
   ```bash
   # Check if backend is running
   curl http://localhost:5000/api/health

   # If not, start it
   cd backend && npm run dev
   ```

2. **Wrong API URL in .env.local**
   ```bash
   # Check frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

3. **Next.js build issue**
   ```bash
   cd frontend
   npm run dev  # Should start dev server
   ```

---

### Problem: "Failed to load..." Toast Notifications

**Error:** `Failed to fetch websites` or similar API errors

**Solutions:**

1. **Check backend is running**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Check CORS configuration**
   - Backend .env should have: `CORS_ORIGIN=http://localhost:3001`
   - Verify frontend is actually at http://localhost:3001

3. **Check browser console (F12)**
   - Look for actual error message
   - Check Network tab to see request/response

---

### Problem: Dark Mode Not Working

**Solution:**

1. **Check if useTheme hook is imported**
   ```jsx
   import { useTheme } from '@/hooks/useTheme'
   ```

2. **Check localStorage**
   - Open DevTools (F12)
   - Application → Local Storage
   - Should have `theme: dark` or `theme: light`

3. **Clear cache and restart**
   ```bash
   # Delete .next directory
   rm -rf frontend/.next
   npm run dev
   ```

---

## 🔗 API Issues

### Problem: 404 Not Found

**Error:** `GET /api/websites 404`

**Solutions:**

1. **Check route is registered in backend/src/index.ts**
   ```typescript
   app.use('/api/websites', websitesRouter);
   ```

2. **Verify the route exists in the router file**
   ```typescript
   // backend/src/api/routes/websites.ts
   router.get('/', asyncHandler(async (req, res) => {
     // ...
   }));
   ```

3. **Check URL spelling** - URLs are case-sensitive

---

### Problem: 500 Internal Server Error

**Error:** `GET /api/products 500`

**Solutions:**

1. **Check backend logs**
   - Look at terminal where `npm run dev` is running
   - Error should be printed there

2. **Check database connection**
   ```bash
   cd backend
   npm run db:setup
   ```

3. **Check for syntax errors**
   ```bash
   npm run build
   # Will show TypeScript errors if any
   ```

---

### Problem: CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**

1. **Check backend CORS configuration**
   ```javascript
   // backend/src/api/middleware/cors.ts
   const allowedOrigins = process.env.CORS_ORIGIN
     ? [process.env.CORS_ORIGIN]
     : ['http://localhost:3001'];
   ```

2. **Update .env if needed**
   ```bash
   CORS_ORIGIN=http://localhost:3001
   ```

3. **Restart backend**
   ```bash
   npm run dev
   ```

---

### Problem: Rate Limit Error

**Error:** `429 Too Many Requests`

**Causes:**

- Too many requests in short time
- Refresh rate limiting window: 900,000ms (15 minutes)

**Solutions:**

1. **Wait 15 minutes**
   - Rate limiter resets after window

2. **Change rate limit in .env**
   ```bash
   RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
   RATE_LIMIT_MAX_REQUESTS=100  # 100 requests per window
   ```

3. **Adjust for scraper-specific limits**
   - Scraper rate limit: 10 requests/hour

---

## 🕷️ Scraping Issues

### Problem: "Found 0 products"

**Causes:**
- CSS selector is incorrect
- Website has JavaScript rendering
- Website structure changed
- Page didn't fully load

**Solutions:**

1. **Verify selector in browser (F12)**
   ```javascript
   // Open DevTools on the website
   document.querySelectorAll('YOUR_SELECTOR').length
   // Should return > 0
   ```

2. **Update the selector in Scraper Editor**
   - Go to `/scraper-editor`
   - Select the website
   - Update the CSS selector
   - Click "Validate"
   - Click "Save Changes"
   - Run: `npm run build`

3. **Wait longer for page to load**
   ```typescript
   // In scraper, increase timeout
   await page.waitForSelector('YOUR_SELECTOR', { timeout: 60000 });
   ```

4. **Scroll the page** (for lazy-loaded content)
   ```typescript
   await page.evaluate(() => {
     window.scrollBy(0, window.innerHeight);
   });
   ```

---

### Problem: Prices are 0 or null

**Causes:**
- Price selector is wrong
- Price format includes non-numeric characters
- Currency symbol mismatch

**Solutions:**

1. **Debug the selector**
   ```javascript
   // In browser DevTools
   document.querySelector('YOUR_PRICE_SELECTOR')?.textContent
   // Check what you get
   ```

2. **Fix regex pattern**
   ```typescript
   // Remove non-numeric characters
   const price = parseFloat(
     priceText.replace(/[^0-9.]/g, '')
   ) || 0;
   ```

3. **Try different selector**
   - Check HTML in DevTools
   - Look for patterns: `.price`, `[data-price]`, `span.amount`, etc.

---

### Problem: Images are broken

**Causes:**
- Images use `data-src` (lazy loading)
- Image URL is relative, not absolute
- Website blocks Puppeteer user agent

**Solutions:**

1. **Use data-src for lazy-loaded images**
   ```typescript
   const imageUrl = el.querySelector('img')?.getAttribute('data-src')
                 || el.querySelector('img')?.src;
   ```

2. **Fix relative URLs**
   ```typescript
   const imageUrl = el.querySelector('img')?.src;
   if (!imageUrl?.startsWith('http')) {
     fullImageUrl = new URL(imageUrl, websiteUrl).href;
   }
   ```

3. **Update User Agent**
   ```bash
   # In .env
   SCRAPER_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
   ```

---

### Problem: Scraper Validation Fails

**Error:** `Cannot save: [error message]`

**Solutions:**

1. **Click "Validate"** to see exact error
   - Errors shown in red

2. **Common errors:**
   - Missing closing bracket `}`
   - Missing semicolon `;`
   - Wrong import statements
   - Typo in function name

3. **Check syntax in editor**
   - Use VS Code locally for better error checking
   - Copy code to VS Code, check for red squiggles
   - Fix errors, paste back to editor

---

### Problem: Scraper Doesn't Update After Save

**Solution:**

You **must** rebuild the project:

```bash
npm run build
```

Without building:
- Changes are saved to file
- But compiled JavaScript isn't updated
- Old scraper still runs

**Steps after editing:**
1. Edit scraper in editor
2. Click "Save Changes" ✓
3. Run in terminal: `npm run build` ← **Important!**
4. Next scrape uses new scraper

---

## 📊 Database Issues

### Problem: Can't Add Website - "Name Already Exists"

**Cause:** Website name is already in database

**Solutions:**

1. **Check existing websites**
   - Go to Websites page
   - Look for the name

2. **Use different name**
   - Names must be unique
   - Names are converted to lowercase

3. **Delete the existing website**
   - Click delete on the website
   - Products and scrapers will be cleaned up

---

### Problem: Database Locked

**Error:** `Error: SQLITE_BUSY: database is locked`

**Solutions:**

1. **Stop other processes**
   - Check if multiple instances running
   - Kill all `npm run dev` processes
   - Start only one

2. **Delete lock file**
   ```bash
   cd backend
   rm prisma/dev.db-wal
   rm prisma/dev.db-shm
   npm run db:setup
   ```

3. **Use fresh database**
   ```bash
   cd backend
   rm prisma/dev.db*
   npm run db:setup
   npm run dev
   ```

---

### Problem: Prisma Errors After Schema Change

**Error:** `Error: Unknown column in where clause`

**Solution:**

```bash
# Run migrations
cd backend
npm run db:migrate

# Or reset database
rm prisma/dev.db
npm run db:setup
```

---

## 🌍 Deployment Issues

### Problem: Vercel Deployment Failed

**Common Causes:**

1. **Build command error**
   - Check build logs on Vercel
   - Usually TypeScript error

2. **Missing environment variables**
   - Check Vercel project Settings → Environment Variables
   - Should have: `NEXT_PUBLIC_API_URL`

3. **Wrong API URL**
   ```bash
   # Should point to your Render backend
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

---

### Problem: Render Deployment Failed

**Common Causes:**

1. **Database URL error**
   - Check Render dashboard
   - PostgreSQL should be running
   - DATABASE_URL must be set correctly

2. **Node version mismatch**
   - Render uses Node 16+ by default
   - Check package.json "engines" field

3. **Missing dependencies**
   ```bash
   npm install
   npm run build
   git push
   ```

---

### Problem: Can't Scrape in Production

**Error:** `Error: Error: net::ERR_INVALID_URL`

**Causes:**
- Puppeteer can't launch on Render
- Memory limit exceeded
- Website blocks automated requests

**Solutions:**

1. **Check Render logs**
   - Go to Render dashboard
   - Select service → Logs
   - Search for error messages

2. **Increase timeout**
   ```typescript
   page.setDefaultNavigationTimeout(60000);
   ```

3. **Add delays between requests**
   ```typescript
   await new Promise(resolve => setTimeout(resolve, 1000));
   ```

---

## 🐛 Debugging Tips

### Enable Detailed Logging

```bash
# In .env
LOG_LEVEL=debug
NODE_ENV=development
```

### Check Logs in Different Places

**Local Development:**
```bash
# Terminal where npm run dev is running
# Shows all console.log and errors
```

**Vercel Deployment:**
- Vercel Dashboard → Project → Deployments
- Click deployment → View Logs

**Render Deployment:**
- Render Dashboard → Select service
- Logs tab shows all console output

### Use Browser DevTools

```javascript
// Press F12 while on website
// Go to Console tab

// Test API calls
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(data => console.log(data))

// Test CSS selectors
document.querySelectorAll('.product').length

// Test price extraction
const price = '$19.99'
parseFloat(price.replace(/[^0-9.]/g, ''))
```

---

## 📝 Asking for Help

When reporting an issue, include:

1. **What you were doing**
   - Step-by-step to reproduce

2. **What went wrong**
   - Error message (exact text)
   - Where you saw it (page, terminal, logs)

3. **Environment info**
   - Windows/Mac/Linux
   - Node version: `node --version`
   - npm version: `npm --version`

4. **Relevant logs**
   - Terminal output
   - Browser console (F12)
   - Render/Vercel logs

Example:
```
I tried to scrape Amazon but got "Found 0 products"

Steps:
1. Added amazon.com as website
2. Clicked "Scrape"
3. Saw error toast

Terminal shows no errors
Browser console shows: XHR failed with status 500

Node v18.0.0, npm 9.0.0
```

---

## ✅ Verification Checklist

Use this to verify everything is working:

- [ ] Backend runs without errors: `npm run dev` in /backend
- [ ] Frontend runs: http://localhost:3001
- [ ] Health check: `curl http://localhost:5000/api/health`
- [ ] Can add a website
- [ ] Can view websites list
- [ ] Can trigger scrape
- [ ] Scrape shows progress
- [ ] Products appear after scrape
- [ ] Can view products
- [ ] Can edit a product
- [ ] Can delete a product
- [ ] Can view scrape logs
- [ ] Can open Scraper Editor
- [ ] Can select a scraper
- [ ] Can see scraper code
- [ ] Validate button works
- [ ] Dark mode toggle works
- [ ] Responsive on mobile (F12, toggle device)

If all pass: ✅ **System is working correctly!**

---

## 🎯 Still Stuck?

1. **Check the documentation**
   - `PROJECT_STATUS.md` - overall status
   - `EDIT_WEBSITE_FLOW.md` - how editing works
   - `SCRAPER_EDITOR_GUIDE.md` - scraper editing
   - `DEPLOYMENT.md` - deployment help

2. **Review recent commits**
   - `git log --oneline` shows what changed
   - `git diff HEAD~1` shows changes

3. **Test in isolation**
   - Test API with curl
   - Test scraper with browser DevTools
   - Test database with Prisma Studio

4. **Check backend logs carefully**
   - Error messages often explain the issue
   - Search for "error" or "failed" in logs

---

**Last Resort:** Create a minimal reproduction and review the code carefully. Most issues are in:

- Incorrect CSS selectors
- Wrong environment variables
- Missing `npm run build` after scraper changes
- Port already in use
- Database connection issues

Good luck! 🚀
