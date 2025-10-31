# Quick Start - 2 Minutes to Working App

## 🎯 Goal
Get the Scrapper application running and viewing 417 products from 6 websites.

---

## ⏱️ 2-Minute Setup

### Step 1: Open Two Terminals

**Terminal 1 - Backend Server**
```bash
cd /home/vishal/Development/Scrapper/backend
npm run dev
```
Wait for: `Server running on port 5000`

**Terminal 2 - Frontend Server**
```bash
cd /home/vishal/Development/Scrapper/frontend
npm run dev
```
Wait for: `✓ Ready in XXXX ms`

### Step 2: Open Browser

```
http://localhost:3001
```

### Step 3: Click "Browse Products"

You should see **417 products** in a 4-column grid.

✅ **Done!** Application is working.

---

## 🎮 What You Can Do Now

### View Products
- Click "Browse Products" from dashboard
- Scroll through product grid
- Click any product for details

### Search Products
- Click search icon in header
- Type product name
- See results instantly

### Filter Products
- Click "Filters" button
- Set price range, website, color, size
- See filtered results

### Scrape New Products
- Go to "Websites" page
- Click green Play button
- Wait for "Scraped X items" message
- Products appear on Products page

### View Activity
- Click "View Logs" on dashboard
- See scraping history
- Check when each website was last scraped

---

## ⚙️ Troubleshooting (If Something's Wrong)

### Products not showing?
```bash
curl http://localhost:5000/api/products | head -20
```
Should show JSON with product data.

### Backend not running?
```bash
pkill -f "node"
cd /home/vishal/Development/Scrapper/backend
npm run dev
```

### Frontend not running?
```bash
cd /home/vishal/Development/Scrapper/frontend
npm run dev
```

### Check everything with diagnostic:
```bash
bash /home/vishal/Development/Scrapper/diagnose.sh
```

---

## 📱 Features Overview

| Feature | Location | How |
|---------|----------|-----|
| 🏠 Dashboard | `/` | View stats, click quick actions |
| 🌐 Websites | `/websites` | Manage websites, click Play to scrape |
| 📦 Products | `/products` | Browse grid, use filters & search |
| 🔍 Details | `/product/[id]` | Click any product card |
| 📊 Logs | `/logs` | See scraping history |
| 🌙 Dark Mode | Sidebar | Click moon icon at bottom |

---

## 💾 What's in the Database

- **417 products** from 6 websites
- **Amazon**: 110 products
- **Flipkart**: 7 products
- **TestShop**: 169 products
- **BeYoung**: 52 products
- **Snitch**: 79 products
- **Zara**: 0 products (pending)

---

## 📚 Need More Help?

- **How to use**: `cat HOW_TO_USE.md`
- **Troubleshooting**: `cat TROUBLESHOOTING_GUIDE.md`
- **API reference**: `cat API_QUICK_REFERENCE.md`
- **Full documentation**: `cat DOCUMENTATION_INDEX.md`

---

## ✅ Verification Checklist

Before declaring success:

- [ ] Backend running (`curl http://localhost:5000/api/health`)
- [ ] Frontend running (`curl http://localhost:3001`)
- [ ] Can access http://localhost:3001 in browser
- [ ] Products page shows product grid
- [ ] Can see ~417 products
- [ ] Can search for products
- [ ] Can use filters
- [ ] Can toggle dark mode
- [ ] Can navigate all 5 pages

All checked? **🎉 You're all set!**

---

**Version**: 2.0
**Status**: ✅ Ready to Use
**Products Available**: 417 from 6 websites

