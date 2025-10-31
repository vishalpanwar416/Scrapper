# Website Data Structure - Quick Reference Guide

## Website Object Requirements

### Minimal Website Entry
```javascript
{
  name: "zara",                          // REQUIRED: Lowercase unique identifier
  url: "https://www.zara.com"            // REQUIRED: Full website URL
}
```

### Full Website Object (from API response)
```javascript
{
  id: "clj2x8q4j0000jz8w8q8q8q8q",     // Auto-generated CUID
  name: "zara",                          // Lowercase unique identifier (scraper key)
  url: "https://www.zara.com",           // Website URL
  enabled: true,                         // Boolean: whether scraping is active
  productCount: 42,                      // Number: count of products from this website
  createdAt: "2024-01-15T10:30:00Z",    // ISO timestamp
  updatedAt: "2024-01-15T10:30:00Z",    // ISO timestamp
  lastScrapedAt: "2024-01-20T14:22:00Z" // ISO timestamp (nullable)
}
```

## Critical Rules

1. **Name Field**
   - Must be lowercase
   - Must be unique in the database
   - Used as scraper key in route: `/api/scrape/start/{name}`
   - Cannot contain special characters (only a-z, 0-9)
   - Frontend automatically converts to lowercase

2. **Scraper Function Requirement**
   - For each website, a scraper function must exist
   - Location: `/backend/src/scrapers/{name}.ts`
   - Signature: `async function scrapeXXX(websiteId: string): Promise<{itemsScraped, itemsUpdated, status, error?}>`
   - Without a matching scraper, the API returns error: "No scraper available for this website"

3. **Enable/Disable Logic**
   - Only enabled websites can be scraped
   - API returns error if trying to scrape a disabled website
   - Can toggle via PUT `/api/websites/{id}` with `{enabled: boolean}`

## API Interactions

### Creating a Website
```javascript
// Frontend sends:
POST /api/websites
{
  name: "snitch",
  url: "https://www.snitchofficial.com"
}

// Backend returns:
{
  id: "clj2x8q4j0000jz8w8q8q8q8q",
  name: "snitch",
  url: "https://www.snitchofficial.com",
  enabled: true,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

### Fetching All Websites
```javascript
// Frontend sends:
GET /api/websites

// Backend returns:
[
  {
    id: "clj2x8q4j0000jz8w8q8q8q8q",
    name: "zara",
    url: "https://www.zara.com",
    enabled: true,
    productCount: 15,  // This is added by backend
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "clj2x8q4j0000jz8w8q8q8q8r",
    name: "snitch",
    url: "https://www.snitchofficial.com",
    enabled: true,
    productCount: 8,
    createdAt: "2024-01-15T10:35:00Z",
    updatedAt: "2024-01-15T10:35:00Z"
  }
]
```

### Triggering a Scrape
```javascript
// Frontend sends:
POST /api/scrape/start/zara

// Backend processes:
// 1. Finds website where name = "zara"
// 2. Checks if enabled = true
// 3. Looks for scraper function at src/scrapers/zara.ts
// 4. Runs the scraper with websiteId parameter
// 5. Stores result in ScrapeLog table
// 6. Updates website.lastScrapedAt

// Returns:
{
  success: true,
  message: "Scraping completed for zara",
  data: {
    id: "clj2x8q4j0000jz8w8q8q8q8s",
    websiteId: "clj2x8q4j0000jz8w8q8q8q8q",
    itemsScraped: 42,
    itemsUpdated: 3,
    status: "success",
    errorMessage: null,
    scrapedAt: "2024-01-20T14:22:00Z"
  }
}
```

## Example Websites Currently Configured

The system has 4 placeholder scrapers:
1. **snitch** - https://www.snitchofficial.com
2. **rarerabit** - https://www.rarerabbit.com
3. **offduety** - https://www.offduty.com
4. **zara** - https://www.zara.com

All return 0 items currently (placeholder implementations).

## Database Schema (Prisma)

```prisma
model Website {
  id            String     @id @default(cuid())
  name          String     @unique
  url           String
  enabled       Boolean    @default(true)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  lastScrapedAt DateTime?

  products  Product[]
  scrapeLog ScrapeLog[]
}
```

## Frontend Display

### Websites Page Table
| Name | URL | Enabled | Products | Actions |
|------|-----|---------|----------|---------|
| zara | https://www.zara.com | Enabled | 15 | [Disable] [Scrape now] |
| snitch | https://www.snitchofficial.com | Enabled | 8 | [Disable] [Scrape now] |

### Shop Page Product Card
Each product displays:
- Product image
- Title
- Price (in rupees)
- Website badge (shows website name)

### Filters
Products can be filtered by:
- Website (dropdown of all websites)
- Search term
- Price range
- Color
- Size

## Important Constraints

1. Website names must be unique and lowercase
2. Product URLs must be unique
3. At least one website must exist to create products
4. Products require: title, url, websiteId, (price/originalPrice/description/imageUrl optional)
5. Colors and sizes are optional nested arrays on products

