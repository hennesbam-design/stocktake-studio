# 🚀 Cloudflare Pages Deployment Guide for Stocktake Studio

## Overview
This guide will help you deploy your Stocktake Studio app to Cloudflare Pages (frontend) with options for the backend deployment.

## Prerequisites
- GitHub account
- Cloudflare account (free tier is sufficient)
- PostgreSQL database (we recommend Neon for free PostgreSQL)

---

## 📋 Step 1: Prepare Your Repository

### 1.1 Export Code from Replit
1. Click on your Replit project name at the top
2. Go to "Version control" → "Export as ZIP" 
3. Download and extract the ZIP file
4. Create a new GitHub repository and upload your code

### 1.2 Create Production Environment File
Create a `.env.production` file in your project root:

```env
NODE_ENV=production
VITE_API_BASE_URL=https://your-backend-url.com
```

---

## 🎯 Step 2: Deploy Frontend to Cloudflare Pages

### 2.1 Connect GitHub to Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on "Pages" in the sidebar
3. Click "Create a project"
4. Select "Connect to Git"
5. Choose GitHub and authorize Cloudflare
6. Select your stocktake-studio repository

### 2.2 Configure Build Settings
**Framework preset:** None (or Custom)
**Build command:** `npx vite build`
**Build output directory:** `dist/public`
**Root directory:** (leave empty)

> **Important:** Use `npx vite build` instead of `npm run build`. The npm script tries to build both frontend and backend, but Cloudflare Pages only needs the frontend.

### 2.3 Set Environment Variables
In the Cloudflare Pages project settings, add:
- `NODE_ENV` = `production`
- `VITE_API_BASE_URL` = `https://your-backend-url.com` (update this after backend deployment)

### 2.4 Deploy
Click "Save and Deploy" - your frontend will be live at `https://your-project-name.pages.dev`

---

## 🔧 Step 3: Deploy Backend (Choose One Option)

### Option A: Railway (Recommended - Easiest)
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Set environment variables in Railway dashboard
6. Deploy automatically

### Option B: Render (Free Tier Available)
1. Go to [Render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Set build command: `npm run build`
5. Set start command: `npm start`
6. Add environment variables

### Option C: Fly.io (Advanced)
1. Install flyctl CLI
2. Run `fly launch` in your project directory
3. Configure fly.toml as needed
4. Deploy with `fly deploy`

**Note:** Cloudflare Workers requires significant code changes to work with Express servers and is not covered in this guide.

---

## 🗄️ Step 4: Set Up Production Database

### 4.1 Create PostgreSQL Database (Recommended)
**Option 1: Neon (Free tier available)**
1. Go to [Neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

**Option 2: Railway PostgreSQL**
1. In your Railway dashboard, add a PostgreSQL service
2. Copy the connection string from the service

**Option 3: Render PostgreSQL**
1. Create a PostgreSQL database in Render
2. Copy the connection details

### 4.2 Configure Database Connection
Add the database URL to your backend environment variables as `DATABASE_URL`.

**Note:** This app currently uses in-memory storage for development. For production, you'll need to configure the PostgreSQL connection in your deployment environment.

---

## 🔐 Step 5: Configure Environment Variables

### Frontend (.env.production)
```env
NODE_ENV=production
VITE_API_BASE_URL=https://your-backend-url.com
```

### Backend (in your chosen platform)
```env
DATABASE_URL=postgresql://username:password@hostname:port/database
SESSION_SECRET=your-random-session-secret-here
NODE_ENV=production
PORT=5000
```

### 5.1 Important: Configure CORS for Cross-Origin Requests
Since your frontend (Cloudflare Pages) and backend (separate service) are on different domains, you need to configure CORS properly:

1. Set `Access-Control-Allow-Origin` to your exact Cloudflare Pages domain
2. Set `Access-Control-Allow-Credentials: true`
3. Configure cookies with `SameSite=None; Secure` for cross-origin sessions

Example CORS configuration:
```javascript
app.use(cors({
  origin: 'https://your-project-name.pages.dev',
  credentials: true
}));
```

---

## 🧪 Step 6: Test Your Deployment

1. Visit your Cloudflare Pages URL
2. Test CSV import functionality
3. Test barcode scanning (requires HTTPS and camera permissions)
4. Test department/area creation
5. Verify API connectivity between frontend and backend
6. Check browser console for any CORS errors

---

## 🎉 Your App is Now Live!

Your Stocktake Studio is now deployed with:
- ✅ Fast global CDN via Cloudflare Pages
- ✅ Production PostgreSQL database
- ✅ CSV import functionality
- ✅ Barcode scanning (camera access)
- ✅ Mobile-optimized touch interface

---

## 🔄 Updates and Maintenance

### To Update Your App:
1. Push changes to your GitHub repository
2. Cloudflare Pages will automatically rebuild and deploy
3. Backend updates require redeployment on your chosen platform

### Backup Your Data:
- Neon provides automatic backups
- You can export data via CSV from your app

---

## 🆘 Troubleshooting

### Common Issues:
1. **API calls failing**: Check `VITE_API_BASE_URL` is set correctly
2. **Database connection errors**: Verify `DATABASE_URL` format
3. **Build failures**: Ensure all dependencies are in `package.json`
4. **Camera not working**: Requires HTTPS (Cloudflare provides this automatically)

### Need Help?
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure backend is running and accessible

---

Your Stocktake Studio is production-ready! 🎊