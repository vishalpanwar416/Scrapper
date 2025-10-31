# Frontend Source Code Analysis - Scrapper Application

## 1. PAGES & STRUCTURE

### Page Overview
The application has a Next.js (v14) frontend with the following pages:

1. **Home Page** (`/src/pages/index.jsx`)
   - Landing page with navigation cards
   - Links to Websites, Products, and Scrape Logs sections
   - Title: "Scraper Admin"

2. **Websites Page** (`/src/pages/websites.jsx`)
   - Manage websites configuration
   - Add new websites (requires name and URL)
   - Enable/Disable toggles
   - Trigger scraping for individual websites
   - Display product count per website

3. **Products Page** (`/src/pages/products.jsx`)
   - Table view of scraped products
   - Filterable by: website, search term, price range, color, size
   - Pagination (10, 20, or 50 items per page)
   - Display: Image, Title, Price, Website, URL link

4. **Shop Page** (`/src/pages/shop.jsx`)
   - Grid view of products (card-based layout)
   - Same filters as Products page
   - Pagination (12, 24, or 48 items per page)
   - Shows product images, title, price, website badge
   - Links to product detail page

5. **Product Detail Page** (`/src/pages/product/[id].jsx`)
   - Detailed view of a single product
   - Shows: Image, title, price, original price
   - Lists available colors
   - Lists available sizes with availability status
   - Display description
   - Link to external product URL

6. **Scrape Logs Page** (`/src/pages/logs.jsx`)
   - View scraping history
   - Shows: Website, items scraped, items updated, status, timestamp, error message
   - Pagination (10, 20, or 50 logs per page)

7. **App Layout** (`/src/pages/_app.jsx`)
   - Global header with navigation
   - Dark/Light theme toggle
   - Search functionality (redirects to /shop with search query)
   - Mobile menu for navigation

---

## 2. HOW WEBSITES ARE DISPLAYED

### Websites Page Features
```
Website Table Columns:
- Name: Lowercase identifier used as scraper key
- URL: Direct link to website
- Enabled: Status badge (green=enabled, red=disabled)
- Products: Count of scraped products
- Actions: Enable/Disable button, Scrape Now button

Add Website Form:
- Input: name (scraper key - converted to lowercase)
- Input: url (full website URL)
- Validation: Both fields required
```

### API Endpoints Used
- `GET /api/websites` - Fetch all websites with product count
- `POST /api/websites` - Create new website
- `PUT /api/websites/{id}` - Update website (enable/disable)
- `POST /api/scrape/start/{siteName}` - Trigger scraping

---

## 3. DATA STRUCTURE NEEDED FOR WEBSITES

### Website Object Structure
```javascript
{
  id: string,                 // CUID identifier
  name: string,              // Unique, lowercase identifier (used as scraper key)
  url: string,               // Website URL
  enabled: boolean,          // Whether scraping is active
  productCount: number,      // Count of products from this website
  createdAt: Date,           // Timestamp
  updatedAt: Date,           // Timestamp
  lastScrapedAt?: Date       // Last scraping timestamp (optional)
}
```

### Scraper Key Requirements
- The `name` field is used as the scraper identifier
- Must be lowercase and unique
- Used in route: `/api/scrape/start/{name}`
- Examples: "zara", "snitch", "rarerabit", "offduety"

---

## 4. API CALLS BEING MADE

### Websites API
```
GET /api/websites
Response: Array<Website>

POST /api/websites
Body: { name: string, url: string }
Response: Website

PUT /api/websites/{id}
Body: { enabled?: boolean }
Response: Website
```

### Products API
```
GET /api/products?page=1&limit=20&websiteId=...&search=...&minPrice=...&maxPrice=...&color=...&size=...
Response: {
  data: Array<Product>,
  pagination: {
    page: number,
    pages: number,
    total: number,
    limit: number
  }
}

GET /api/products/{id}
Response: Product (with colors and sizes)

POST /api/products
Body: {
  title: string,
  url: string,
  websiteId: string,
  price?: number,
  originalPrice?: number,
  description?: string,
  imageUrl?: string,
  colors?: Array<{ name: string, code?: string }>,
  sizes?: Array<{ size: string, available?: boolean, stock?: number }>
}
Response: Product
```

### Scraping API
```
POST /api/scrape/start/{websiteName}
Response: {
  success: boolean,
  message: string,
  data: ScrapeLog
}

GET /api/scrape/logs?page=1&limit=20
Response: {
  data: Array<ScrapeLog>,
  pagination: {...}
}
```

---

## 5. PRODUCT DATA STRUCTURE

### Product Object (Full)
```javascript
{
  id: string,                      // CUID
  title: string,                   // Product name
  url: string,                     // Product URL (unique constraint)
  price: number | null,            // Current price in rupees
  originalPrice: number | null,    // MRP/original price
  description: string | null,      // Product description
  imageUrl: string | null,         // Image URL
  createdAt: Date,
  updatedAt: Date,
  websiteId: string,               // Foreign key to Website
  website: Website,                // Nested website object
  colors: Array<{
    id: string,
    name: string,
    code: string | null            // Hex color code (optional)
  }>,
  sizes: Array<{
    id: string,
    size: string,                  // Size identifier (e.g., "M", "XL", "32")
    available: boolean,            // Whether size is in stock
    stock: number                  // Stock quantity
  }>
}
```

### Filtering Capabilities
- **Search**: Searches in title and description (case-insensitive)
- **Price Range**: minPrice and maxPrice filters
- **Website**: Filter by websiteId
- **Color**: Filter by color name (case-insensitive)
- **Size**: Filter by size and availability

---

## 6. SAMPLE DATA / FIXTURES

### Current State
- No seed/fixture files found in the repository
- SQLite database exists at: `/home/vishal/Development/Scrapper/backend/prisma/prisma/dev.db`
- Scrapers are placeholder implementations returning zero items

### Scraper Functions
All scrapers follow this signature:
```typescript
async function scrapeXXX(websiteId: string): Promise<{
  itemsScraped: number;
  itemsUpdated: number;
  status: string;
  error?: string;
}>
```

Available scrapers (in routes/scrape.ts):
- snitch (returns 0 items)
- rarerabit (returns 0 items)
- offduety (returns 0 items)
- zara (returns 0 items)

---

## 7. API BASE CONFIGURATION

### API Configuration
- Configured in: `/src/lib/api.js`
- Base URL: `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'`
- Backend runs on port 5000 by default
- Frontend runs on port 3001 (dev) or 3000 (production)

### API Utility Functions
```javascript
apiGet(path)       // GET request, returns JSON
apiPost(path, body) // POST request with JSON body
apiPut(path, body)  // PUT request with JSON body
apiDelete(path)     // DELETE request
```

---

## 8. COMPONENT STRUCTURE

### Key Patterns
- Uses React hooks: useState, useEffect, useMemo
- Pagination handled client-side with state management
- Real-time filtering with debounce via URL search params
- Responsive design using Tailwind CSS
- Dark/Light theme toggle

### UI Dependencies
- **Next.js 14.2.4** - Framework
- **React 18.3.1** - Core library
- **Tailwind CSS 3.4.3** - Styling
- **Lucide React** - Icons (Menu, X, Search icons)

---

## 9. KEY INSIGHTS FOR WEBSITE DATA

### What's Required for a Website Entry
1. **Name** - Used as scraper identifier (must be lowercase, unique)
2. **URL** - The website to scrape
3. **Enabled flag** - Controls if scraping is active
4. **Scraper function** - Must exist in backend at `src/scrapers/{name}.ts`

### Website Registration Flow
1. User enters name (converted to lowercase) and URL on Websites page
2. POST to `/api/websites` creates the website
3. Backend expects a scraper function matching the name key
4. When "Scrape now" is clicked, POST to `/api/scrape/start/{name}` runs the scraper
5. Scraper returns metrics which are saved to ScrapeLog

### Display Logic
- Websites page shows enabled status badge and product count
- Products can be filtered by websiteId
- Shop page shows website name as badge on each product card
- Product detail page shows website in breadcrumb

---

## 10. NOTES ON CURRENT IMPLEMENTATION

### Database
- SQLite at `/backend/prisma/prisma/dev.db`
- Uses Prisma ORM for migrations and data access
- All scrapers are placeholder implementations

### Frontend Features
- Fully functional UI for managing websites and viewing products
- Responsive design with mobile navigation
- Search and filtering on multiple fields
- Product detail view with color/size selection display
- Scrape log history viewer

### What's Missing
- Actual web scraping implementations (all return 0 items)
- No real product data in database yet
- No API authentication/authorization
- Limited error handling on frontend

