# Deployment Guide: Vercel + Render

This guide will help you deploy the Scrapper application to Vercel (Frontend) and Render (Backend) for free.

## Prerequisites

1. **GitHub Account** - Code must be on GitHub
2. **Vercel Account** - Sign up at https://vercel.com
3. **Render Account** - Sign up at https://render.com

## Part 1: Deploy Backend on Render

### Step 1: Prepare the Backend for Render

Render uses PostgreSQL instead of SQLite. We need to update the environment:

1. Go to https://render.com and sign in
2. Click "New +" → "PostgreSQL"
3. Fill in:
   - **Name**: `scrapper-db`
   - **Database**: `scrapper`
   - **User**: `scrapper_user`
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click "Create Database"
5. Copy the **Internal Database URL** (you'll need this)

### Step 2: Deploy Backend Service

1. Go to https://render.com and click "New +" → "Web Service"
2. Connect your GitHub repository
3. Fill in:
   - **Name**: `scrapper-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free
4. Click "Advanced" and add these Environment Variables:
   ```
   NODE_ENV = production
   DATABASE_URL = <paste the PostgreSQL Internal URL from step 1>
   DB_PROVIDER = postgresql
   API_KEY = <generate a random secure key>
   ```
5. Click "Create Web Service"

### Step 3: Wait for Deployment

- Render will build and deploy your backend
- Once live, you'll get a URL like: `https://scrapper-backend.onrender.com`
- **Save this URL** - you'll need it for the frontend

### Important Notes for Render Free Tier:

- Services spin down after 15 minutes of inactivity
- First request after spindown takes ~30 seconds
- Render deletes databases after 90 days of inactivity
- Keep your service active by accessing it regularly

## Part 2: Deploy Frontend on Vercel

### Step 1: Create Vercel Project

1. Go to https://vercel.com and sign in
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Click "Import"

### Step 2: Configure Project

1. **Root Directory**: `frontend`
2. **Build Command**: `npm run build`
3. **Output Directory**: `.next`
4. **Install Command**: `npm install`

### Step 3: Add Environment Variables

Click "Environment Variables" and add:
```
NEXT_PUBLIC_API_URL = https://scrapper-backend.onrender.com
```

Replace with your actual Render backend URL from Part 1, Step 3.

### Step 4: Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. You'll get a URL like: `https://scrapper.vercel.app`

## Part 3: Verify Everything Works

1. Visit your Vercel URL
2. Try adding a website
3. Try scraping a website
4. Check if data appears correctly

## Troubleshooting

### Backend Returns 500 Errors
- Check Render logs: Dashboard → scrapper-backend → Logs
- Verify DATABASE_URL is correct
- Ensure NODE_ENV is set to `production`

### Frontend Shows "Cannot Connect to Server"
- Verify NEXT_PUBLIC_API_URL is correct in Vercel
- Check if backend is running: Visit the backend URL directly
- Backend might be spun down - make a request to wake it up

### Database Connection Issues
- Verify PostgreSQL database is created in Render
- Check DATABASE_URL format is correct
- Ensure you used the Internal URL, not External URL

### Scrapers Not Working
- Check Render logs for scraper errors
- Verify Puppeteer can launch (might need additional dependencies)
- Free tier has limited resources - large sites might timeout

## Custom Domain (Optional)

### Add Domain to Vercel
1. Go to Vercel Project Settings
2. Domains → Add
3. Follow instructions to update DNS

### Add Domain to Render
1. Go to Render Backend Settings
2. Custom Domain → Add
3. Update DNS records

## Keeping Services Alive

Since Render spins down free services:
- Visit your frontend regularly
- Set up a cron job to ping your backend every 10 minutes

Example cron job (using external service like cron-job.org):
```
https://scrapper-backend.onrender.com/api/health
```

## Environment Variables Reference

**Backend (.env)**
```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host/dbname
DB_PROVIDER=postgresql
PORT=10000
API_KEY=your-secret-key-here
```

**Frontend (.env.local in Vercel)**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

## Next Steps

1. Monitor logs for errors
2. Keep your GitHub repository updated
3. Redeploy when you make changes (automatic with GitHub integration)
4. Consider upgrading plans if needed:
   - Vercel: $20/month for Pro
   - Render: $7/month for Starter

## Support

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Prisma PostgreSQL: https://www.prisma.io/docs/guides/database/postgresql

---

**Status**: Your app should now be live at your Vercel URL! 🚀
