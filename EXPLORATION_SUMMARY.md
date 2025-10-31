# Frontend Exploration Summary

## Overview

This is a Next.js-based web scraper admin application with a Flask/Express backend. It manages multiple websites for scraping and displays the scraped products in both admin and consumer-facing interfaces.

## What I Found

### 1. Pages & Structure

Seven main pages:

- **Home** (`/`) - Dashboard with navigation cards
- **Websites** (`/websites`) - Manage website configurations and trigger scrapes  
- **Products** (`/products`) - Table view of all products with filtering
- **Shop** (`/shop`) - Consumer-facing grid view of products
- **Product Detail** (`/product/[id]`) - Detailed product page with colors/sizes
- **Logs** (`/logs`) - Scraping history and statistics
- **Global Layout** (`_app.jsx`) - Header with navigation and theme toggle

### 2. Website Display System

Websites are displayed in a table with:
- **Name**: Lowercase unique identifier (also used as scraper key)
- **URL**: Direct link to website
- **Enabled Status**: Green/Red badge
- **Product Count**: Number of products scraped
- **Actions**: Toggle enable/disable and trigger scraping

The critical insight: Website names must match scraper function names in the backend at `/backend/src/scrapers/{name}.ts`.

### 3. Website Data Structure

**Minimal Required:**
```
{ name: string, url: string }
```

**Full Structure from API:**
```
{
  id: string,              // Auto-generated CUID
  name: string,            // Lowercase unique identifier  
  url: string,             // Website URL
  enabled: boolean,        // Scraping enabled flag
  productCount: number,    // Count of products
  createdAt: Date,
  updatedAt: Date,
  lastScrapedAt?: Date
}
```

### 4. API Calls Made

**Websites:**
- GET `/api/websites` - List all with product counts
- POST `/api/websites` - Create new website
- PUT `/api/websites/{id}` - Update (enable/disable)

**Products:**
- GET `/api/products?page=1&limit=20&...filters` - Search/filter products
- GET `/api/products/{id}` - Get single product with colors/sizes
- POST `/api/products` - Create product (manual entry)

**Scraping:**
- POST `/api/scrape/start/{siteName}` - Trigger scraping
- GET `/api/scrape/logs?page=1&limit=20` - Scraping history

### 5. Product Data Structure

Products have extensive fields:
- Basic: title, url (unique), price, originalPrice
- Content: description, imageUrl
- Relations: websiteId (required), website (nested object)
- Variants: colors array and sizes array (both optional)

**Filtering works on:**
- Text search (title/description, case-insensitive)
- Price range (minPrice/maxPrice)
- Website selection
- Color name (case-insensitive)
- Size availability

### 6. Sample Data

- No seed files found
- SQLite database exists at `/backend/prisma/prisma/dev.db`
- All scrapers are placeholder implementations (return 0 items)
- Four configured scrapers: snitch, rarerabit, offduety, zara

### 7. Key Technical Details

**Frontend Stack:**
- Next.js 14.2.4
- React 18.3.1
- Tailwind CSS 3.4.3
- Lucide React (icons)

**Backend Stack:**
- Express.js (from package.json and imports)
- Prisma ORM
- SQLite database
- TypeScript
- Puppeteer (for potential web scraping)

**API Base URL:**
- Default: `http://localhost:5000`
- Configurable via `NEXT_PUBLIC_API_URL` env var

## Critical Implementation Details

### Website Name Conversion
```javascript
// Frontend does this:
name: name.toLowerCase()

// Backend does this:
name: String(name).toLowerCase()

// And sanitizes:
key = String(websiteName).toLowerCase().replace(/[^a-z0-9]/g, '')
```

This matters because the website name becomes the scraper function key.

### Scraper Registration
For a website to work:
1. Create website entry via API (name must be lowercase, unique)
2. Must have matching scraper at `/backend/src/scrapers/{name}.ts`
3. Scraper function must export with signature:
   ```typescript
   async function scrapeXXX(websiteId: string): Promise<{
     itemsScraped: number;
     itemsUpdated: number;
     status: string;
     error?: string;
   }>
   ```

### Product Filtering Flow
- **Search & Price**: Server-side in database query
- **Color & Size**: Client-side filtering on results
- This is important for understanding filter behavior

## What's Missing

1. **No actual scraping implementations** - All scrapers return 0 items
2. **No seed data** - Database is empty by default
3. **No authentication** - All endpoints are public
4. **Limited error handling** - Basic try/catch patterns
5. **No pagination on scrapers** - Single page scraping expected

## Important Constraints

- Website names: lowercase, alphanumeric only, unique
- Product URLs: must be unique
- At least one website needed before creating products
- Colors and sizes are nested arrays on products (optional)
- Database uses SQLite with Prisma migrations

## File Locations Reference

```
Frontend Source: /home/vishal/Development/Scrapper/frontend/src/
Backend Source:  /home/vishal/Development/Scrapper/backend/src/
Database Schema: /home/vishal/Development/Scrapper/backend/prisma/schema.prisma
Database File:   /home/vishal/Development/Scrapper/backend/prisma/prisma/dev.db
```

## Analysis Files Created

Three documentation files have been saved to the repository root:

1. **FRONTEND_ANALYSIS.md** - Comprehensive analysis of all pages, data structures, and API calls
2. **WEBSITE_DATA_GUIDE.md** - Quick reference for website data structure and requirements
3. **CODEBASE_REFERENCE.md** - Key code snippets and patterns from the actual codebase

All three files are saved in `/home/vishal/Development/Scrapper/` for easy reference.

