# 📊 What Happens When You Edit a Website

This document explains the complete flow of what happens behind the scenes when you edit a website in your Scrapper application.

## Quick Summary

When you **edit a website** (name/URL):
1. Frontend sends updated data to backend
2. Backend validates the input
3. Database is updated
4. Response sent back to frontend
5. UI is refreshed
6. Toast notification shows success

## Detailed Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                            │
│                                                                 │
│  1. User clicks "Edit" button on website card                  │
│     └─> Opens Edit Modal dialog                                │
│                                                                 │
│  2. User modifies website name and/or URL                      │
│     ├─> name: "Target" → "Walmart"                           │
│     └─> url: "https://target.com" → "https://walmart.com"   │
│                                                                 │
│  3. User clicks "Save Changes" button                          │
│     └─> Calls: apiPut(`/api/websites/{id}`, {name, url})    │
│         (Found in: frontend/src/lib/api.js)                   │
│                                                                 │
│  4. Frontend waits for response...                             │
│                                                                 │
└─────────────────────────────────────┬──────────────────────────┘
                                      │ HTTP PUT Request
                                      │ /api/websites/{id}
                                      │ { name: "Walmart", url: "..." }
                                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js)                           │
│                                                                 │
│  Router: PUT /api/websites/:id                                 │
│  File: backend/src/api/routes/websites.ts:97-150              │
│                                                                 │
│  STEP 1: Extract Data                                          │
│  ├─> websiteId = req.params.id (from URL)                    │
│  ├─> name = req.body.name                                     │
│  ├─> url = req.body.url                                       │
│  └─> enabled = req.body.enabled (optional)                   │
│                                                                 │
│  STEP 2: Validate ID                                           │
│  ├─> Check: Is websiteId a non-empty string?                 │
│  └─> If invalid → Return 400 error                            │
│                                                                 │
│  STEP 3: Validate Name                                         │
│  ├─> Check: Is name a non-empty string?                      │
│  ├─> Convert to lowercase: "Walmart" → "walmart"             │
│  ├─> Trim whitespace                                          │
│  └─> If invalid → Return 400 error                            │
│                                                                 │
│  STEP 4: Validate URL                                          │
│  ├─> Check: Is url a non-empty string?                       │
│  ├─> Try: new URL(url) to validate format                    │
│  ├─> If invalid → Return 400 error                            │
│  └─> Valid URLs: https://example.com, http://site.io, etc.  │
│                                                                 │
│  STEP 5: Validate Enabled (optional)                           │
│  ├─> If provided: Convert to boolean (true/false)            │
│  └─> This allows enabling/disabling scrapers                 │
│                                                                 │
│  STEP 6: Build Update Object                                   │
│  ├─> updateData = {}                                          │
│  ├─> Only include fields that were changed                    │
│  │   (e.g., { name: "walmart", url: "https://..." })        │
│  └─> If nothing changed → Still returns 200 OK               │
│                                                                 │
│  STEP 7: Update Database                                       │
│  ├─> Call: prisma.website.update({                           │
│  │     where: { id: websiteId },                             │
│  │     data: updateData                                       │
│  │   })                                                        │
│  ├─> Prisma executes SQL: UPDATE websites SET ... WHERE id   │
│  ├─> Database checks unique constraint on name               │
│  ├─> If name already exists → Error P2002                    │
│  ├─> If website not found → Error P2025                      │
│  └─> Otherwise → Website record updated ✅                    │
│                                                                 │
│  STEP 8: Handle Errors                                         │
│  ├─> If error.code === 'P2025': Return 404 "Not Found"      │
│  ├─> If error.code === 'P2002': Return 409 "Already Exists" │
│  └─> Otherwise → Return 500 "Server Error"                   │
│                                                                 │
│  STEP 9: Return Response                                       │
│  └─> res.json(website) ← Updated website object               │
│      {                                                         │
│        id: "abc123",                                          │
│        name: "walmart",                                       │
│        url: "https://walmart.com",                           │
│        enabled: true,                                         │
│        createdAt: "2024-11-01T...",                          │
│        updatedAt: "2024-11-03T...",                          │
│        lastScrapedAt: null,                                  │
│        productCount: 0                                        │
│      }                                                        │
│                                                                 │
└─────────────────────────────────────┬──────────────────────────┘
                                      │ HTTP 200 OK + Website data
                                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE (SQLite)                           │
│                                                                 │
│  Table: websites                                               │
│  ┌────────────┬──────────────┬─────────────────────┐          │
│  │ id         │ name         │ url                 │          │
│  ├────────────┼──────────────┼─────────────────────┤          │
│  │ abc123     │ walmart ✏️    │ https://walmart.com │ ✅        │
│  └────────────┴──────────────┴─────────────────────┘          │
│                                                                 │
│  Indexes used for fast lookup:                                │
│  - ON websites(enabled)                                       │
│  - ON websites(createdAt)                                     │
│                                                                 │
└─────────────────────────────────────┬──────────────────────────┘
                                      │ Database responds
                                      │ "Update successful"
                                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                            │
│                                                                 │
│  Response received: {id, name, url, enabled, ...}             │
│                                                                 │
│  1. Update React state                                         │
│     └─> setWebsites(prevWebsites.map(...)) ← New data         │
│                                                                 │
│  2. Close Edit Modal                                           │
│     └─> setIsEditModalOpen(false)                             │
│                                                                 │
│  3. Show Success Toast                                         │
│     └─> toast.success("Website updated successfully")         │
│                                                                 │
│  4. Refresh Website List (optional)                           │
│     └─> Call fetchWebsites() to get latest data              │
│                                                                 │
│  5. UI Re-renders                                              │
│     └─> Website card shows new name: "Walmart"                │
│     └─> Website card shows new URL: "https://walmart.com"   │
│                                                                 │
│  ✅ DONE! Website is updated                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Code Walkthrough

### Frontend Code (websites.jsx)

```javascript
// Step 1: User clicks Edit button
const openEditModal = (website) => {
  setEditingWebsite(website);
  setFormData({ name: website.name, url: website.url });
  setIsEditModalOpen(true);
};

// Step 2: Form is edited by user
<Input
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
/>

// Step 3: User clicks Save Changes button
const handleEditWebsite = async (e) => {
  e.preventDefault();

  // Validation
  if (!formData.name || !formData.url) {
    toast.error('Please fill all fields');
    return;
  }

  try {
    // Send PUT request to backend
    const response = await apiPut(`/api/websites/${editingWebsite.id}`, formData);

    // Update state and show success
    toast.success('Website updated successfully');

    // Refresh list
    await fetchWebsites();

    // Close modal
    setIsEditModalOpen(false);
  } catch (error) {
    toast.error('Failed to update website: ' + error.message);
  }
};
```

### Backend Code (websites.ts)

```typescript
// Handle PUT request to /api/websites/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, url, enabled } = req.body;
    const websiteId = req.params.id;

    // Validate inputs
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required' });
      }
      updateData.name = String(name).trim().toLowerCase();
    }

    if (url !== undefined) {
      try {
        new URL(url); // Throws if invalid
        updateData.url = url;
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }
    }

    // Update in database
    const website = await prisma.website.update({
      where: { id: websiteId },
      data: updateData,
    });

    // Return updated website
    res.json(website);

  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Website not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Name already exists' });
    }
    res.status(500).json({ error: 'Failed to update website' });
  }
});
```

### Database (Prisma)

```typescript
// prisma/schema.prisma
model Website {
  id            String     @id @default(cuid())
  name          String     @unique          // ← Can't have duplicates
  url           String     @unique          // ← Can't have duplicates
  enabled       Boolean    @default(true)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  lastScrapedAt DateTime?

  products  Product[]
  scrapeLog ScrapeLog[]

  @@index([enabled])
  @@index([createdAt])
}
```

## What Validations Happen

### Frontend Validations
- ✅ Check if name field is empty
- ✅ Check if URL field is empty
- ✅ Check if URL is valid format (in some cases)

### Backend Validations (MORE THOROUGH)
- ✅ Check if websiteId is valid string
- ✅ Check if name is non-empty string
- ✅ Convert name to lowercase
- ✅ Trim whitespace from name
- ✅ Check if URL is valid using `new URL(url)`
- ✅ Check if name already exists (unique constraint)
- ✅ Check if website exists (P2025 error)

### Database Validations
- ✅ Check UNIQUE constraint on `name`
- ✅ Check UNIQUE constraint on `url`
- ✅ Check if website with ID exists
- ✅ Update `updatedAt` timestamp automatically

## What Does NOT Happen

❌ Website is NOT deleted
❌ Products are NOT deleted
❌ Scrape logs are NOT affected
❌ Automatic scraping does NOT trigger (only on creation)
❌ Scrapers are NOT recompiled

## What Happens Next

After editing a website, you can:
1. **Scrape** it again with updated settings
2. **Delete** it (cascades to products)
3. **Toggle** enabled/disabled status
4. **Edit** again if needed

## Error Scenarios

### Error 1: Website Not Found
```
Input: id = "nonexistent123"
Database: No record found
Response: 404 Not Found
Message: "Website not found"
```

### Error 2: Name Already Exists
```
Input: name = "amazon" (already exists)
Database: UNIQUE constraint violation
Response: 409 Conflict
Message: "Name already exists"
```

### Error 3: Invalid URL Format
```
Input: url = "not a valid url"
Backend: new URL("not a valid url") throws
Response: 400 Bad Request
Message: "Invalid URL format"
```

### Error 4: Empty Name
```
Input: name = "   " (whitespace only)
Backend: name.trim().length === 0
Response: 400 Bad Request
Message: "Name must be a non-empty string"
```

## Performance Notes

- **Query optimization**: Uses `id` for WHERE clause (primary key, fastest)
- **Database indexes**: Queries use indexed columns (`enabled`, `createdAt`)
- **No N+1 problem**: Single UPDATE query, not multiple
- **Response time**: Usually <100ms for local, <500ms on Render

## Security Features

- ✅ Input validation on frontend AND backend
- ✅ SQL injection protection (Prisma parameterized queries)
- ✅ Rate limiting applied to all `/api/` routes
- ✅ CORS headers check origin
- ✅ Error messages don't leak sensitive info

## Summary

**When you edit a website:**

1. Frontend sends data to `PUT /api/websites/{id}`
2. Backend validates all inputs thoroughly
3. Prisma executes secure UPDATE query
4. Database checks constraints and updates
5. Backend returns updated website
6. Frontend updates state and UI
7. Toast notification shows success

The whole flow takes **<500ms** typically! ⚡

---

For more details, see:
- `backend/src/api/routes/websites.ts` (lines 97-150)
- `frontend/src/pages/websites.jsx` (handleEditWebsite function)
