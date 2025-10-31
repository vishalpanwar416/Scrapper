# Frontend Exploration - Complete Documentation

This directory contains comprehensive documentation of the frontend codebase analysis for the Scrapper application. All files are saved in the repository root at `/home/vishal/Development/Scrapper/`.

## Documentation Files

### 1. EXPLORATION_SUMMARY.md
**Start here!** High-level overview of the entire codebase.
- What pages exist
- How websites are displayed
- Key technical details
- Important constraints
- What's missing in the current implementation

### 2. FRONTEND_ANALYSIS.md
Detailed technical analysis with 10 sections:
1. Pages & Structure - All 7 pages detailed
2. How Websites Are Displayed - UI and API
3. Data Structure Needed For Websites - Full schema
4. API Calls Being Made - Complete endpoint documentation
5. Product Data Structure - Full schema with filtering
6. Sample Data / Fixtures - Current state of database
7. API Base Configuration - Environment setup
8. Component Structure - React patterns
9. Key Insights For Website Data - Registration flow
10. Notes On Current Implementation

### 3. WEBSITE_DATA_GUIDE.md
Quick reference guide specifically for website data:
- Minimal vs full website objects
- Critical rules and constraints
- Complete API interaction examples
- Frontend display tables
- Database schema excerpt
- Important constraints

### 4. CODEBASE_REFERENCE.md
Code snippets from actual implementation:
- File structure diagram
- Frontend API layer (api.js)
- Frontend pages (websites.jsx, products.jsx)
- Backend routes (websites.ts, products.ts, scrape.ts)
- Database schema (schema.prisma)
- Scraper implementation template
- Key code patterns

### 5. DATA_FLOW.md
Visual representation of system architecture:
- Frontend-Backend communication flow
- Website scraping flow (most important path)
- Data relationships (ERD style)
- API endpoint summary
- Frontend state management pattern
- Important assumptions

## Quick Start - Key Information

### Website Data Structure
```javascript
{
  name: "zara",              // REQUIRED: lowercase unique identifier
  url: "https://zara.com"    // REQUIRED: website URL
}
```

### How It Works
1. Create website entry (name becomes scraper key)
2. Frontend can immediately manage it (enable/disable)
3. When "Scrape now" is clicked, backend looks for `/backend/src/scrapers/{name}.ts`
4. Scraper function is executed and returns metrics
5. Results stored in ScrapeLog and products created

### API Base
- Default: `http://localhost:5000`
- Configurable: `NEXT_PUBLIC_API_URL` env var

### 4 Built-in Scrapers (Placeholders)
- snitch
- rarerabit  
- offduety
- zara

## Important Discoveries

### Critical Constraint
Website names MUST match scraper filenames. A website with name "zara" requires `/backend/src/scrapers/zara.ts` to exist and export a function.

### Mixed Filtering
- Database filters: search (title/description), price range, websiteId
- Client-side filters: color, size
This is important for understanding performance implications.

### Nested Relationships
Products include:
- website: object (with id, name, url, etc)
- colors: array of {id, name, code}
- sizes: array of {id, size, available, stock}

### Database
- SQLite at `/backend/prisma/prisma/dev.db`
- Uses Prisma ORM
- IDs are CUIDs (not UUIDs)
- Timestamps are ISO 8601

## File Locations Summary

```
Frontend Source:   /home/vishal/Development/Scrapper/frontend/src/
Backend Source:    /home/vishal/Development/Scrapper/backend/src/
Database Schema:   /home/vishal/Development/Scrapper/backend/prisma/schema.prisma
Database File:     /home/vishal/Development/Scrapper/backend/prisma/prisma/dev.db
API Utility:       /home/vishal/Development/Scrapper/frontend/src/lib/api.js
```

## Frontend Pages & Routes

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Dashboard with navigation |
| Websites | `/websites` | Manage website configs |
| Products | `/products` | Table view of products |
| Shop | `/shop` | Consumer-facing grid view |
| Product Detail | `/product/[id]` | Single product view |
| Logs | `/logs` | Scraping history |

## API Endpoints Quick Reference

### Websites
- `GET /api/websites` - List all
- `POST /api/websites` - Create
- `PUT /api/websites/{id}` - Update
- `DELETE /api/websites/{id}` - Delete

### Products  
- `GET /api/products` - List with filters
- `GET /api/products/{id}` - Get single
- `POST /api/products` - Create
- `PUT /api/products/{id}` - Update
- `DELETE /api/products/{id}` - Delete

### Scraping
- `POST /api/scrape/start/{siteName}` - Trigger scrape
- `GET /api/scrape/logs` - View scraping history

## Next Steps for Development

1. **Implement Scrapers** - All 4 scrapers are currently placeholders returning 0 items
2. **Add Sample Data** - Create seed script to populate test data
3. **Enhance Error Handling** - Add validation and better error messages
4. **Add Authentication** - Secure the API endpoints
5. **Implement Real Scraping** - Use Puppeteer to actually scrape websites

## Notes

- All documentation was generated by exploring the source code
- No test files or fixtures found in repository
- Database schema is well-designed with proper relationships
- Frontend UI is fully functional (just needs real data)
- Backend routes are implemented but scrapers are stubs

## Questions?

Refer to the specific documentation file:
- General overview? → EXPLORATION_SUMMARY.md
- Website data? → WEBSITE_DATA_GUIDE.md
- Complete API docs? → FRONTEND_ANALYSIS.md (section 4)
- Code examples? → CODEBASE_REFERENCE.md
- System architecture? → DATA_FLOW.md

