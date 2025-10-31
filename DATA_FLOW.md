# Data Flow Diagram - Scrapper Application

## Frontend-Backend Communication Flow

```
FRONTEND (Next.js)                    BACKEND (Express + Prisma)          DATABASE (SQLite)
===============                       =======================             =================

User Actions                          API Routes                          Tables
-----------                           ----------                          ------

[Websites Page]
    |
    +-- Load websites ----GET /api/websites----> [websites.ts:get("/")]
    |                                            |
    |                                            +-> Query Website table
    |                                            |
    |<--- Array<Website> + productCount<--------+
    |
    +-- Add website ---POST /api/websites----> [websites.ts:post("/")]
    |   {name, url}                            |
    |                                          +-> Create Website record
    |                                          |
    |<--- Website object<--------------------+
    |
    +-- Enable/Disable --PUT /api/websites/:id--> [websites.ts:put("/:id")]
    |   {enabled: bool}                         |
    |                                           +-> Update Website.enabled
    |                                           |
    |<--- Updated Website<--------------------+
    |
    +-- Scrape Now ----POST /api/scrape/start/:name----> [scrape.ts:post("/start/:websiteName")]
                           (name as key)                |
                                                       +-> Find Website by name
                                                       |
                                                       +-> Get scraper function (src/scrapers/:name.ts)
                                                       |
                                                       +-> Run scraper(websiteId)
                                                       |
                                                       +-> Create ScrapeLog record
                                                       |
                                                       +-> Update Website.lastScrapedAt
                                                       |
        <--- {success, data: ScrapeLog}<-------------+


[Products Page]
    |
    +-- Load products --GET /api/products?filters...----> [products.ts:get("/")]
    |   (filters: search,                                 |
    |    websiteId,                                       +-> Build WHERE clause
    |    minPrice, maxPrice,                              |
    |    color, size)                                     +-> Query Product table
    |                                                     |   (with pagination)
    |<--- {data: [], pagination}<---------------------+
    |                                                     
    |
    +-- Each product includes:
    |   - Basic fields: id, title, url, price, originalPrice
    |   - Image: imageUrl
    |   - Description
    |   - Relations: website object, colors array, sizes array


[Shop Page] (same as Products but grid layout)
    |
    +-- Load products --GET /api/products?filters...----> (same flow)
    |
    +-- Click product ----> [Product Detail Page]


[Product Detail Page]
    |
    +-- Load product detail --GET /api/products/:id----> [products.ts:get("/:id")]
                                                        |
                                                        +-> Query Product by id
                                                        |   include: {colors, sizes, website}
                                                        |
        <--- Full Product object<--------------------+


[Scrape Logs Page]
    |
    +-- Load logs ----GET /api/scrape/logs?page...----> [scrape.ts:get("/logs")]
                                                        |
                                                        +-> Query ScrapeLog table
                                                        |   (with pagination)
                                                        |
        <--- {data: [], pagination}<-----------------+


[Global App Layout]
    |
    +-- Search --------> [Shop Page with search param]
                        GET /api/products?search=term
```

## Website Scraping Flow (Most Important Path)

```
1. USER CREATES WEBSITE
   Frontend: POST /api/websites {name: "zara", url: "https://zara.com"}
   Backend:  Create Website record (name stored as lowercase unique key)

2. USER CLICKS "SCRAPE NOW"
   Frontend: POST /api/scrape/start/zara
   Backend:  
      a) Find Website where name = "zara"
      b) Check Website.enabled == true
      c) Import scraper from /backend/src/scrapers/zara.ts
      d) Call scraper function (websiteId)
         => Returns {itemsScraped, itemsUpdated, status, error?}
      e) Create ScrapeLog record with results
      f) Update Website.lastScrapedAt = now()

3. SCRAPER FUNCTION EXECUTION
   Signature: async function scrapeZara(websiteId: string): Promise<{...}>
   
   (Current: Placeholder - returns {itemsScraped: 0, itemsUpdated: 0, status: 'success'})
   
   (Expected: Scrape website, create/update Product records with)
      - title, url (unique), price, originalPrice
      - description, imageUrl
      - colors array: [{name, code?}]
      - sizes array: [{size, available, stock}]

4. FRONTEND UPDATES
   After scrape completes:
   - Reload websites list
   - Show new ScrapeLog entry in logs page
   - Display updated product count

```

## Data Relationships

```
WEBSITE (1) <-----> (Many) PRODUCT
   |
   +-- id: CUID
   +-- name: String (lowercase unique) <- SCRAPER KEY
   +-- url: String
   +-- enabled: Boolean
   +-- createdAt: DateTime
   +-- updatedAt: DateTime
   +-- lastScrapedAt: DateTime (nullable)
   |
   +-- Relations:
       +-- products: Product[]
       +-- scrapeLog: ScrapeLog[]


PRODUCT (1) <-----> (Many) COLOR
PRODUCT (1) <-----> (Many) SIZE
PRODUCT (Many) <---> (1) WEBSITE
   |
   +-- id: CUID
   +-- title: String
   +-- url: String (unique)
   +-- price: Float (nullable)
   +-- originalPrice: Float (nullable)
   +-- description: String (nullable)
   +-- imageUrl: String (nullable)
   +-- websiteId: String (FK to Website)
   +-- createdAt: DateTime
   +-- updatedAt: DateTime
   |
   +-- Relations:
       +-- website: Website
       +-- colors: Color[]
       +-- sizes: Size[]


COLOR
   |
   +-- id: CUID
   +-- name: String
   +-- code: String (nullable - hex color code)
   +-- productId: String (FK to Product)


SIZE
   |
   +-- id: CUID
   +-- size: String
   +-- available: Boolean
   +-- stock: Int
   +-- productId: String (FK to Product)


SCRAPE_LOG
   |
   +-- id: CUID
   +-- websiteId: String (FK to Website)
   +-- itemsScraped: Int
   +-- itemsUpdated: Int
   +-- status: String
   +-- errorMessage: String (nullable)
   +-- scrapedAt: DateTime
   |
   +-- Relations:
       +-- website: Website
```

## API Endpoint Summary

### Websites
```
GET    /api/websites                    -> Array<Website>
GET    /api/websites/:id                -> Website
POST   /api/websites                    -> Website
PUT    /api/websites/:id                -> Website
DELETE /api/websites/:id                -> {message}
```

### Products
```
GET    /api/products                    -> {data: Array<Product>, pagination}
GET    /api/products/:id                -> Product
POST   /api/products                    -> Product
PUT    /api/products/:id                -> Product
DELETE /api/products/:id                -> {message}
DELETE /api/products/website/:websiteId -> {message}
```

### Scraping
```
GET    /api/scrape/logs                 -> {data: Array<ScrapeLog>, pagination}
GET    /api/scrape/logs/:websiteId      -> {data: Array<ScrapeLog>, pagination}
POST   /api/scrape/start/:websiteName   -> {success: bool, data: ScrapeLog}
```

## Frontend State Management Pattern

```javascript
Component State:
  - [items, setItems]              // Data from API
  - [loading, setLoading]          // Loading state
  - [error, setError]              // Error messages
  - [page, setPage]                // Pagination
  - [limit, setLimit]              // Items per page
  - [filters, setFilters]          // Search/filter values

useEffect Hook:
  - Triggers when: dependencies change
  - Calls: async load() function
  - Updates: setLoading, setError, setItems

Error Handling:
  - Try-catch in async functions
  - Error displayed to user
  - Loading state reset in finally

API Call Pattern:
  const data = await apiGet(path)  // throws on non-200
  // or
  const data = await apiPost(path, body)
  // or  
  const data = await apiPut(path, body)
```

## Important Assumptions

1. **Website names are scraper keys**: Website.name MUST match the filename at `/backend/src/scrapers/{name}.ts`

2. **Scraper functions are imported dynamically**: Backend imports scraper based on website.name

3. **All data flows through API**: Frontend has NO direct database access

4. **Timestamps are ISO format**: createdAt, updatedAt, scrapedAt are ISO 8601

5. **CUIDs are generated**: All IDs are generated server-side using Prisma @default(cuid())

6. **Colors and sizes are nested**: Included in Product queries when specified

7. **Pagination is handled client-side**: Frontend manages page state, backend returns total count

8. **Filtering is mixed**: Database filters search/price, client-side filters color/size

