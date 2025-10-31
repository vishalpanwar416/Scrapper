# Codebase Reference - Key Code Snippets

## File Structure

```
/home/vishal/Development/Scrapper/
├── backend/
│   ├── src/
│   │   ├── api/routes/
│   │   │   ├── websites.ts      (Website CRUD endpoints)
│   │   │   ├── products.ts      (Product CRUD & filtering)
│   │   │   └── scrape.ts        (Scraping trigger & logs)
│   │   ├── scrapers/
│   │   │   ├── snitch.ts
│   │   │   ├── rarerabit.ts
│   │   │   ├── offduety.ts
│   │   │   └── zara.ts
│   │   ├── database/
│   │   │   └── prisma.ts        (Prisma client)
│   │   └── index.ts             (Express app setup)
│   ├── prisma/
│   │   ├── schema.prisma        (Database schema)
│   │   └── prisma/dev.db        (SQLite database)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── index.jsx         (Home/dashboard)
    │   │   ├── websites.jsx      (Manage websites)
    │   │   ├── products.jsx      (Products table)
    │   │   ├── shop.jsx          (Shop grid view)
    │   │   ├── logs.jsx          (Scrape logs)
    │   │   ├── product/[id].jsx  (Product detail)
    │   │   └── _app.jsx          (Global layout)
    │   ├── lib/
    │   │   └── api.js            (API utility functions)
    │   └── styles/
    │       └── globals.css
    └── package.json
```

## Frontend - API Layer

### File: `/frontend/src/lib/api.js`

```javascript
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.json();
}
```

## Frontend - Websites Page

### File: `/frontend/src/pages/websites.jsx` (Key excerpt)

```javascript
async function addWebsite(e) {
  e.preventDefault();
  if (!name || !url) return;
  try {
    // Creates website with name converted to lowercase
    await apiPost('/api/websites', { name: name.toLowerCase(), url });
    setName('');
    setUrl('');
    await load();
  } catch (e) {
    setError(e.message || 'Failed to add');
  }
}

async function toggleEnabled(site) {
  try {
    await apiPut(`/api/websites/${site.id}`, { enabled: !site.enabled });
    await load();
  } catch (e) {
    setError(e.message || 'Failed to update');
  }
}

async function scrape(site) {
  try {
    // Triggers scraping using the website name as key
    await apiPost(`/api/scrape/start/${site.name}`);
    await load();
  } catch (e) {
    setError(e.message || 'Failed to start scrape');
  }
}
```

## Frontend - Products Page

### File: `/frontend/src/pages/products.jsx` (Key excerpt)

```javascript
const query = useMemo(() => {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (websiteId) params.set('websiteId', websiteId);
  if (search) params.set('search', search);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  if (color) params.set('color', color);
  if (size) params.set('size', size);
  return `/api/products?${params.toString()}`;
}, [page, limit, websiteId, search, minPrice, maxPrice, color, size]);

async function load() {
  try {
    const [products, sites] = await Promise.all([
      apiGet(query),
      apiGet('/api/websites')
    ]);
    setItems(products.data || []);
    setPagination(products.pagination || { page: 1, pages: 1, total: 0, limit });
    setWebsites(sites);
  } catch (e) {
    setError(e.message || 'Failed to load');
  }
}
```

## Backend - Websites Routes

### File: `/backend/src/api/routes/websites.ts` (Key endpoints)

```typescript
// Get all websites with product count
router.get('/', async (_req, res) => {
  const websites = await prisma.website.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const data = websites.map((w) => ({ ...w, productCount: w._count.products }));
  res.json(data);
});

// Create new website
router.post('/', async (req, res) => {
  const { name, url } = req.body || {};
  if (!name || !url) return res.status(400).json({ error: 'Name and URL are required' });
  const existing = await prisma.website.findUnique({ 
    where: { name: String(name).toLowerCase() } 
  });
  if (existing) return res.status(400).json({ error: 'Website already exists' });
  const website = await prisma.website.create({
    data: { name: String(name).toLowerCase(), url, enabled: true },
  });
  res.status(201).json(website);
});

// Update website
router.put('/:id', async (req, res) => {
  const { name, url, enabled } = req.body || {};
  const website = await prisma.website.update({
    where: { id: req.params.id },
    data: {
      ...(name ? { name: String(name).toLowerCase() } : {}),
      ...(url ? { url } : {}),
      ...(enabled !== undefined ? { enabled: !!enabled } : {}),
    },
  });
  res.json(website);
});
```

## Backend - Products Routes

### File: `/backend/src/api/routes/products.ts` (Get with filtering)

```typescript
router.get('/', async (req, res) => {
  const { websiteId, search, color, size, minPrice, maxPrice, page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (websiteId) where.websiteId = websiteId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (minPrice || maxPrice) {
    where.price = {} as any;
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  let products = await prisma.product.findMany({
    where,
    include: { colors: true, sizes: true, website: true },
    skip,
    take: limitNum,
    orderBy: { createdAt: 'desc' },
  });

  // Client-side filtering for color and size
  if (color || size) {
    products = products.filter((p) => {
      const colorMatch = !color || p.colors.some((c) => c.name.toLowerCase() === color.toLowerCase());
      const sizeMatch = !size || p.sizes.some((s) => s.size === size && s.available);
      return colorMatch && sizeMatch;
    });
  }

  const total = await prisma.product.count({ where });
  res.json({ 
    data: products, 
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } 
  });
});
```

## Backend - Scrape Routes

### File: `/backend/src/api/routes/scrape.ts` (Start scraping)

```typescript
const scrapers: Record<string, (websiteId: string) => Promise<...>> = {
  snitch: scrapeSnitch,
  rarerabit: scrapeRareRabit,
  offduety: scrapeOffDuety,
  zara: scrapeZara,
};

router.post('/start/:websiteName', async (req, res) => {
  const { websiteName } = req.params;
  const key = String(websiteName).toLowerCase().replace(/[^a-z0-9]/g, '');

  const website = await prisma.website.findUnique({ where: { name: key } });
  if (!website) return res.status(404).json({ error: 'Website not found' });
  if (!website.enabled) return res.status(400).json({ error: 'Website is disabled' });

  const fn = scrapers[key];
  if (!fn) return res.status(400).json({ error: 'No scraper available for this website' });

  const result = await fn(website.id);

  const scrapeLog = await prisma.scrapeLog.create({
    data: {
      websiteId: website.id,
      itemsScraped: result.itemsScraped || 0,
      itemsUpdated: result.itemsUpdated || 0,
      status: result.status || 'failed',
      errorMessage: result.error || null,
    },
  });

  await prisma.website.update({ where: { id: website.id }, data: { lastScrapedAt: new Date() } });

  res.json({ success: true, message: `Scraping completed for ${websiteName}`, data: scrapeLog });
});
```

## Backend - Database Schema

### File: `/backend/prisma/schema.prisma`

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

model Product {
  id           String    @id @default(cuid())
  title        String
  url          String    @unique
  price        Float?
  originalPrice Float?
  description  String?
  imageUrl     String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  website   Website  @relation(fields: [websiteId], references: [id])
  websiteId String

  colors Color[]
  sizes  Size[]
}

model Color {
  id        String   @id @default(cuid())
  name      String
  code      String?
  product   Product  @relation(fields: [productId], references: [id])
  productId String
}

model Size {
  id        String   @id @default(cuid())
  size      String
  available Boolean  @default(true)
  stock     Int      @default(0)
  product   Product  @relation(fields: [productId], references: [id])
  productId String
}

model ScrapeLog {
  id           String   @id @default(cuid())
  scrapedAt    DateTime @default(now())
  itemsScraped Int      @default(0)
  itemsUpdated Int      @default(0)
  status       String
  errorMessage String?

  website   Website @relation(fields: [websiteId], references: [id])
  websiteId String
}
```

## Scraper Implementation Template

### File: `/backend/src/scrapers/zara.ts`

```typescript
import prisma from '../database/prisma';

export async function scrapeZara(websiteId: string): Promise<{
  itemsScraped: number;
  itemsUpdated: number;
  status: string;
  error?: string;
}> {
  try {
    // TODO: Implement actual scraping logic
    // Return metrics about items scraped and updated
    
    return { itemsScraped: 0, itemsUpdated: 0, status: 'success' };
  } catch (error: any) {
    return { itemsScraped: 0, itemsUpdated: 0, status: 'failed', error: error?.message || 'Unknown error' };
  }
}
```

## Key Code Patterns

### Frontend Pattern: React Hook Usage
```javascript
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

useEffect(() => { 
  load(); 
}, [dependencies]);

async function load() {
  setLoading(true);
  setError('');
  try {
    const data = await apiGet('/api/endpoint');
    setItems(data);
  } catch (e) {
    setError(e.message || 'Failed to load');
  } finally {
    setLoading(false);
  }
}
```

### Backend Pattern: Prisma CRUD
```typescript
// Create
await prisma.model.create({ data: {...} });

// Read
await prisma.model.findUnique({ where: {...}, include: {...} });
await prisma.model.findMany({ where: {...}, skip, take });

// Update
await prisma.model.update({ where: {...}, data: {...} });

// Delete
await prisma.model.delete({ where: {...} });

// Count
await prisma.model.count({ where: {...} });
```

