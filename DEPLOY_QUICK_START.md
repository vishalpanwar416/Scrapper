# 🚀 Deploy in 5 Minutes - Quick Start

This is the fastest way to get your app live on Vercel + Render (FREE).

## Prerequisites (2 minutes)

1. ✅ Make sure code is pushed to GitHub
2. Create free accounts:
   - https://vercel.com (click "Sign Up")
   - https://render.com (click "Get Started")

## Step 1: Deploy Backend on Render (2 minutes)

### 1.1 Create PostgreSQL Database
```
1. Go to https://render.com/dashboard
2. Click "New +" → "PostgreSQL"
3. Name: scrapper-db
4. Plan: Free
5. Click "Create"
6. Wait 30 seconds, then copy the "Internal Database URL"
   (Save this somewhere - you need it next)
```

### 1.2 Deploy Backend Service
```
1. Click "New +" → "Web Service"
2. Connect GitHub (authorize and select your repo)
3. Fill in:
   Name: scrapper-backend
   Runtime: Node
   Build: cd backend && npm install && npm run build
   Start: cd backend && npm start
   Plan: Free
4. Click "Advanced" and add Environment Variables:
   NODE_ENV = production
   DATABASE_URL = <PASTE_THE_INTERNAL_URL_FROM_STEP_1.1>
   DB_PROVIDER = postgresql
   API_KEY = my-secret-api-key-123
5. Click "Create Web Service"
6. Wait for deployment (3-5 minutes)
7. Copy your backend URL: https://scrapper-backend.onrender.com
```

**Done!** Your backend is live. You should see a green checkmark ✅

---

## Step 2: Deploy Frontend on Vercel (2 minutes)

### 2.1 Create Vercel Project
```
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your GitHub repo
4. Click "Import"
```

### 2.2 Configure Project
```
1. Root Directory: frontend
2. Framework: Next.js
3. Build Command: npm run build (pre-filled)
4. Output Directory: .next (pre-filled)
5. Click "Continue"
```

### 2.3 Add Environment Variable
```
1. Click "Environment Variables"
2. Add:
   NEXT_PUBLIC_API_URL = https://scrapper-backend.onrender.com
   (Replace with YOUR backend URL from Step 1.2)
3. Click "Deploy"
4. Wait for deployment (2-3 minutes)
5. Copy your frontend URL: https://your-app.vercel.app
```

**Done!** Your frontend is live! 🎉

---

## Step 3: Test Your App (1 minute)

```
1. Visit: https://your-app.vercel.app
2. Click "Websites" → "Add Website"
3. Enter: name = "Test", url = "https://example.com"
4. Try to scrape
5. Check if data appears
```

If everything works → **You're done!** 🚀

---

## Troubleshooting

### "Cannot connect to server"
- Check NEXT_PUBLIC_API_URL is correct in Vercel settings
- Wait a minute (backend might be spinning up)
- Refresh page

### "500 Error from backend"
- Check Render logs: Dashboard → scrapper-backend → Logs tab
- Make sure DATABASE_URL and DB_PROVIDER are set correctly

### "Database connection failed"
- Go to Render dashboard → scrapper-db
- Copy the Internal URL again (make sure it's Internal, not External)
- Update in scrapper-backend environment variables

---

## Important Notes

⚠️ **Free Tier Limits:**
- Backend spins down after 15 minutes of inactivity
- First request takes ~30 seconds (auto-wakes up)
- Database may delete after 90 days of inactivity
- Keep your app active by visiting regularly

💡 **Keep It Alive:**
- Visit your app at least once a week
- Or set up a free monitoring service to ping it regularly

---

## Next Steps

After deployment:
1. ✅ Go through the troubleshooting if issues occur
2. ✅ Customize your scrapers for each website
3. ✅ Add more websites and test scraping
4. ✅ Consider upgrading to paid plans when you need more resources

**Need help?** Check DEPLOYMENT.md for detailed guides

---

**Your app should now be LIVE!** 🎉

Frontend: https://your-app.vercel.app
Backend: https://scrapper-backend.onrender.com
