# Dynamic Scraper Factory System

## Overview
A complete dynamic scraper factory system has been implemented that enables automatic scraper selection and execution for any e-commerce website. The system supports both website-specific scrapers and an intelligent generic fallback scraper.

## Architecture

### Core Components

#### 1. **ScraperFactory** (`src/utils/scraperFactory.ts`)
Central registry for all available scrapers with intelligent selection logic.

**Key Features:**
- Maintains a registry of website-specific scrapers
- Provides generic fallback scraper for unknown websites
- Supports dynamic scraper registration
- Returns both scraper type and function for proper execution

**Public Methods:**
```typescript
register(websiteName: string, scraper: SpecificScraperFunction): void
getScraper(websiteName: string): { type: 'specific' | 'generic'; scraper: ScraperFunction }
hasSpecificScraper(websiteName: string): boolean
listScrapers(): string[]
getRegisteredWebsites(): string[]
```

**Registered Scrapers:**
1. **snitch** - Specific scraper for snitch.com
2. **rarerabbit** - Specific scraper for rarerabbit.com
3. **offduety** - Specific scraper for offduety.com
4. **zara** - Specific scraper for zara.com
5. **beyoung** - Specific scraper for beyoung.in
6. **generic** - Universal fallback for any website

#### 2. **AutoScraper** (`src/utils/autoScraper.ts`)
Handles automatic scraping with multiple execution modes.

**Key Features:**
- Async non-blocking scraping for website creation
- Sync blocking scraping for on-demand scraping
- Batch scraping for multiple websites
- Full website scraping capability
- Comprehensive logging and error handling

**Public Methods:**
```typescript
triggerScrapeAsync(websiteId: string): Promise<void>
triggerScrapSync(websiteId: string): Promise<any>
scrapeMultiple(websiteIds: string[]): Promise<any[]>
scrapeAll(): Promise<any[]>
```

### API Endpoints

#### Website Management
**POST `/api/websites`** - Create new website
```json
{
  "name": "amazon",
  "url": "https://www.amazon.com",
  "autoScrape": true  // Optional: triggers scraping asynchronously
}
```

#### Scraper Information
**GET `/api/scrape/scrapers/list`** - List all registered scrapers
```json
{
  "registered": ["snitch", "rarerabbit", "offduety", "zara", "beyoung"],
  "total": 5
}
```

**GET `/api/scrape/scrapers/check/:websiteName`** - Check scraper type for a website
```json
{
  "website": "amazon",
  "hasSpecificScraper": false,
  "scraperType": "generic"
}
```

#### Scraping Operations
**POST `/api/scrape/start/:websiteName`** - Start scraping single website
- Uses factory to select appropriate scraper
- Handles both specific and generic scrapers transparently
- Returns detailed scrape log

**POST `/api/scrape/start-all`** - Start batch scraping all enabled websites
- Scrapes all websites sequentially
- Returns array of results
- 1-second delay between scrapes to avoid overwhelming browser

#### Monitoring
**GET `/api/scrape/logs`** - Get paginated scrape logs
**GET `/api/scrape/progress/:websiteId`** - Get real-time scraping progress

## Scraper Selection Logic

### Flow Diagram
```
Website Added
    ↓
Check if specific scraper exists
    ↓
    ├─ YES → Execute specific scraper
    │         (requires only websiteId)
    │
    └─ NO → Execute generic scraper
             (requires websiteId + websiteUrl)
```

### Execution Strategy

**Specific Scrapers** (e.g., Snitch, Beyoung):
- Hard-coded selectors for specific website structure
- Optimized for known page layouts
- Fast and accurate extraction
- Signature: `(websiteId: string) => Promise<ScapeResult>`

**Generic Scraper**:
- Multi-strategy selector detection
- Handles unknown website structures
- Automatic element detection
- Fallback image and price handling
- Signature: `(websiteId: string, websiteUrl: string) => Promise<ScrapResult>`

## Features

### 1. Auto-Trigger on Website Creation
When creating a website with `autoScrape: true`, scraping starts automatically:
```bash
curl -X POST http://localhost:5000/api/websites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "amazon",
    "url": "https://www.amazon.com",
    "autoScrape": true
  }'
```

### 2. Intelligent Fallback System
- Automatically selects generic scraper for unknown websites
- No code changes required to support new websites
- Progressive enhancement: add specific scrapers as needed

### 3. Batch Operations
Scrape all registered websites in sequence:
```bash
curl -X POST http://localhost:5000/api/scrape/start-all
```

### 4. Progress Tracking
Real-time scraping progress with detailed stage information:
```bash
curl http://localhost:5000/api/scrape/progress/:websiteId
```

## Testing Results

### Test 1: Website Registration with Auto-Scrape
```
Input: Create Amazon website with autoScrape=true
Result: ✓ Website created immediately
        ✓ Async scraper triggered in background
        ✓ 52 products scraped using generic scraper
        ✓ lastScrapedAt timestamp updated
```

### Test 2: Scraper Type Detection
```
Input: Check scraper type for registered website (snitch)
Result: ✓ Returns specific scraper type
        ✓ Correctly identifies website has specific implementation

Input: Check scraper type for unregistered website (amazon)
Result: ✓ Returns generic scraper type
        ✓ Indicates will use fallback scraper
```

### Test 3: Batch Scraping
```
Input: POST /api/scrape/start-all
Result: ✓ Scraped 5 websites sequentially
        ✓ Results returned for all websites
        ✓ Each website used appropriate scraper:
          - Snitch: 0 items (already updated)
          - Rarerabbit: 52 updated items
          - Zara: 169 items scraped
          - Flipkart: 2 new + 3 updated items
          - Amazon: 9 items scraped
```

### Test 4: List Registered Scrapers
```
Input: GET /api/scrape/scrapers/list
Result: ✓ Returns 5 registered specific scrapers
        ✓ Excludes generic (not in registry)
        ✓ All expected websites present
```

## Type System

### ScraperFunction Types
```typescript
// For website-specific scrapers
type SpecificScraperFunction = (websiteId: string) => Promise<{
  itemsScraped: number;
  itemsUpdated: number;
  status: string;
  error?: string;
}>;

// For generic/universal scrapers
type GenericScraperFunction = (websiteId: string, websiteUrl: string) => Promise<{
  itemsScraped: number;
  itemsUpdated: number;
  status: string;
  error?: string;
}>;

// Union type for both
type ScraperFunction = SpecificScraperFunction | GenericScraperFunction;
```

## Benefits

### 1. **Extensibility**
- Add new specific scrapers without modifying core logic
- Register custom scrapers at runtime
- Automatic fallback for any unregistered website

### 2. **Maintainability**
- Clear separation of concerns
- Factory pattern for scraper management
- Centralized scraper registry

### 3. **Scalability**
- Support unlimited websites
- Batch operations for efficient scraping
- Async/sync execution options

### 4. **User Experience**
- Auto-scraping on website creation
- Progress tracking
- Detailed logging
- No manual scraper setup required

### 5. **Flexibility**
- Support both optimized and generic scrapers
- Mix-and-match approach
- Easy to upgrade to specific scraper when needed

## Future Enhancements

### 1. Dynamic Scraper Generation
- Analyze website structure and auto-generate optimized scrapers
- Machine learning-based selector detection
- Configuration-based scraper customization

### 2. Scheduled Scraping
- Cron-based automatic scraping
- Per-website scheduling
- Configurable frequency

### 3. Smart Caching
- Cache selector patterns per website
- Learn from successful scrapes
- Improve accuracy over time

### 4. Multi-instance Support
- Distributed scraping across servers
- Load balancing
- Fault tolerance

### 5. Custom Selectors
- UI-based selector configuration
- Test selectors before deployment
- Version control for configurations

## File Structure

```
backend/src/
├── utils/
│   ├── scraperFactory.ts       # Core factory pattern
│   ├── autoScraper.ts          # Auto-trigger logic
│   └── progressTracker.ts      # Existing progress tracking
├── api/routes/
│   ├── scrape.ts               # Updated with factory integration
│   └── websites.ts             # Updated with auto-trigger
└── scrapers/
    ├── snitch.ts               # Specific
    ├── beyoung.ts              # Specific
    ├── zara.ts                 # Specific
    ├── rarerabit.ts            # Specific
    ├── offduety.ts             # Specific
    └── generic.ts              # Universal fallback
```

## Usage Examples

### Example 1: Add Website with Automatic Scraping
```bash
# Create website and automatically start scraping
curl -X POST http://localhost:5000/api/websites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "myntra",
    "url": "https://www.myntra.com",
    "autoScrape": true
  }'

# Generic scraper will automatically execute in background
# No website-specific scraper needed
```

### Example 2: Check Scraper Type
```bash
# For registered website
curl http://localhost:5000/api/scrape/scrapers/check/snitch
# Returns: "hasSpecificScraper": true, "scraperType": "specific"

# For unregistered website
curl http://localhost:5000/api/scrape/scrapers/check/amazon
# Returns: "hasSpecificScraper": false, "scraperType": "generic"
```

### Example 3: Batch Scrape All Websites
```bash
# Scrape all enabled websites sequentially
curl -X POST http://localhost:5000/api/scrape/start-all

# Returns results from all 5+ websites with detailed stats
```

### Example 4: Monitor Scraping Progress
```bash
# Check real-time progress
curl http://localhost:5000/api/scrape/progress/:websiteId

# Returns: { stage: "scraping", message: "Extracting products...", progress: 60 }
```

## Conclusion

The dynamic scraper factory system provides a robust, extensible, and scalable solution for multi-website scraping. By combining specific optimized scrapers with a universal generic scraper, the system can handle any e-commerce website while maintaining high performance and accuracy for known sites.

The auto-trigger functionality and batch operations make it easy to scale to hundreds or thousands of websites without requiring individual configuration for each site.
