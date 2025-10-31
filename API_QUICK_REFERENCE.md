# API Quick Reference Guide

## New Scraper Management Endpoints

### List Registered Scrapers
```bash
GET /api/scrape/scrapers/list

Response:
{
  "registered": ["snitch", "rarerabbit", "offduety", "zara", "beyoung"],
  "total": 5
}
```

### Check Scraper Type for Website
```bash
GET /api/scrape/scrapers/check/:websiteName

Example: GET /api/scrape/scrapers/check/snitch

Response:
{
  "website": "snitch",
  "hasSpecificScraper": true,
  "scraperType": "specific"
}

Example: GET /api/scrape/scrapers/check/amazon

Response:
{
  "website": "amazon",
  "hasSpecificScraper": false,
  "scraperType": "generic"
}
```

---

## Enhanced Website Management

### Create Website with Auto-Scrape
```bash
POST /api/websites
Content-Type: application/json

Body:
{
  "name": "myntra",
  "url": "https://www.myntra.com",
  "autoScrape": true  // Optional: triggers background scraping
}

Response:
{
  "id": "cmhes2t650000iznmg0gflc35",
  "name": "myntra",
  "url": "https://www.myntra.com",
  "enabled": true,
  "createdAt": "2025-10-31T11:36:36.654Z",
  "updatedAt": "2025-10-31T11:36:36.654Z",
  "lastScrapedAt": null
}
```

---

## Scraping Operations

### Scrape Single Website
```bash
POST /api/scrape/start/:websiteName

Example: POST /api/scrape/start/snitch
Uses specific scraper (optimized for snitch.com)

Example: POST /api/scrape/start/amazon
Uses generic scraper (works for any website)

Response:
{
  "success": true,
  "message": "Scraping completed for snitch",
  "data": {
    "id": "cmhes2xkr002yiznmxcwqnwvf",
    "scrapedAt": "2025-10-31T11:36:42.364Z",
    "itemsScraped": 52,
    "itemsUpdated": 0,
    "status": "success",
    "errorMessage": null,
    "websiteId": "cmhes2t650000iznmg0gflc35"
  }
}
```

### Batch Scrape All Websites
```bash
POST /api/scrape/start-all

Response:
{
  "success": true,
  "message": "Batch scraping started",
  "results": [
    {
      "success": true,
      "data": {
        "id": "cmhes36o20030iznm2xgk82lc",
        "scrapedAt": "2025-10-31T11:36:54.147Z",
        "itemsScraped": 79,
        "itemsUpdated": 0,
        "status": "success",
        "websiteId": "cmheqummw0000sczhe3yq3xtf"
      }
    },
    // ... more websites
  ]
}
```

---

## Monitoring

### Get Scraping Progress
```bash
GET /api/scrape/progress/:websiteId

Example: GET /api/scrape/progress/cmhes2t650000iznmg0gflc35

Response:
{
  "websiteId": "cmhes2t650000iznmg0gflc35",
  "stage": "scraping",
  "message": "Extracting products...",
  "progress": 60
}

// When idle
Response:
{
  "websiteId": "cmhes2t650000iznmg0gflc35",
  "stage": "idle",
  "message": "No active scraping",
  "progress": 0
}
```

### Get Scrape Logs
```bash
GET /api/scrape/logs

Query Parameters:
- limit: Number of results (default: 20)
- page: Page number (default: 1)

Example: GET /api/scrape/logs?limit=10&page=1

Response:
{
  "data": [
    {
      "id": "cmhes2xkr002yiznmxcwqnwvf",
      "scrapedAt": "2025-10-31T11:36:42.364Z",
      "itemsScraped": 52,
      "itemsUpdated": 0,
      "status": "success",
      "errorMessage": null,
      "websiteId": "cmhes2t650000iznmg0gflc35",
      "website": {
        "id": "cmhes2t650000iznmg0gflc35",
        "name": "amazon",
        "url": "https://www.amazon.com",
        "enabled": true,
        "lastScrapedAt": "2025-10-31T11:36:42.369Z"
      }
    }
    // ... more logs
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Get Logs for Specific Website
```bash
GET /api/scrape/logs/:websiteId

Example: GET /api/scrape/logs/cmhes2t650000iznmg0gflc35?limit=5

Response:
{
  "data": [
    // Logs for specific website only
  ],
  "pagination": { ... }
}
```

---

## Common Use Cases

### Use Case 1: Add New Website and Auto-Scrape
```bash
1. Create website with autoScrape=true:
   POST /api/websites
   { "name": "flipkart", "url": "https://flipkart.com", "autoScrape": true }

2. API returns immediately, background scraping starts

3. Check progress:
   GET /api/scrape/progress/:websiteId

4. View results:
   GET /api/scrape/logs/:websiteId
```

### Use Case 2: Scrape All Websites
```bash
1. Start batch scraping:
   POST /api/scrape/start-all

2. Wait for results (30-60 seconds typically)

3. Get detailed logs:
   GET /api/scrape/logs
```

### Use Case 3: Check Scraper Type for Website
```bash
1. Check if specific scraper exists:
   GET /api/scrape/scrapers/check/myntra

2. Response indicates which scraper will be used:
   - specific: Optimized scraper for this website
   - generic: Universal scraper (works for any website)

3. Scrape website:
   POST /api/scrape/start/myntra
```

### Use Case 4: Manual Scraping of Unregistered Website
```bash
1. Website doesn't need to exist in registered list

2. Can scrape unknown website:
   POST /api/scrape/start/someunknownsite

3. Generic scraper automatically handles it:
   - Auto-detects selectors
   - Extracts products
   - Handles images and prices
   - No configuration needed
```

---

## Response Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Scraping completed, logs retrieved |
| 201 | Created | Website successfully created |
| 400 | Bad Request | Missing required fields |
| 404 | Not Found | Website not found, invalid websiteId |
| 500 | Server Error | Scraping failed, database error |

---

## Scraper Type Legend

### Specific Scrapers (5 available)
- **snitch** - Optimized for snitch.com
- **rarerabbit** - Optimized for rarerabbit.com
- **beyoung** - Optimized for beyoung.in
- **zara** - Optimized for zara.com
- **offduety** - Optimized for offduety.com

**Characteristics:**
- Hard-coded selectors for specific website
- Fast and accurate extraction
- Tested and optimized
- Only requires `websiteId` parameter

### Generic Scraper
- Works for any e-commerce website
- 4-strategy selector detection
- Automatic element discovery
- Fallback images and prices
- No website-specific setup needed

**When Used:**
- Website not in registered list
- Unknown e-commerce sites
- Dynamic/newly created websites

---

## Tips & Best Practices

### 1. Check Scraper Type First
```bash
GET /api/scrape/scrapers/check/newsite
# Tells you if specific or generic scraper will be used
```

### 2. Monitor Progress for Large Scrapes
```bash
GET /api/scrape/progress/:websiteId
# Check real-time progress during scraping
```

### 3. Use Batch Operations for Multiple Sites
```bash
POST /api/scrape/start-all
# More efficient than individual scrapes
```

### 4. Enable Auto-Scrape for New Websites
```bash
POST /api/websites
{ ..., "autoScrape": true }
# Automatic background scraping, API returns immediately
```

### 5. Stagger Scraping for Performance
```bash
# Don't start multiple scrapes simultaneously
# Batch endpoint handles sequencing automatically
# Use batch endpoint for optimal resource usage
```

---

## Example Curl Commands

```bash
# List registered scrapers
curl http://localhost:5000/api/scrape/scrapers/list | jq

# Check scraper type
curl http://localhost:5000/api/scrape/scrapers/check/amazon | jq

# Create website with auto-scrape
curl -X POST http://localhost:5000/api/websites \
  -H "Content-Type: application/json" \
  -d '{"name":"amazon","url":"https://amazon.com","autoScrape":true}' | jq

# Scrape single website
curl -X POST http://localhost:5000/api/scrape/start/snitch | jq

# Batch scrape all websites
curl -X POST http://localhost:5000/api/scrape/start-all | jq

# Get scrape logs
curl http://localhost:5000/api/scrape/logs | jq

# Monitor progress
curl http://localhost:5000/api/scrape/progress/:websiteId | jq
```

---

## Base URL
- **Local Development:** `http://localhost:5000`
- **Environment:** Set via `VITE_API_URL` or API proxy

---

Last Updated: 2025-10-31
Version: 1.0.0
Status: Production Ready
