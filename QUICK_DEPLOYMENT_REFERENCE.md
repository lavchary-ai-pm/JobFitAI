# Quick Deployment Reference - Copy & Paste Commands

This is for quick reference after reading the full DEPLOYMENT_GUIDE.md

---

## Step 1: Initialize Git (One Time)

```bash
cd /Users/lavvubala/projects/JobFitAI

# Create .gitignore
cat > .gitignore << 'EOF'
.env.local
.env
node_modules/
dist/
build/
npm-debug.log
.DS_Store
.vscode/
.idea/
EOF

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: JobFitAI application"
```

---

## Step 2: Push to GitHub (One Time)

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/jobfitai.git

git branch -M main

git push -u origin main
```

---

## Step 3: Build Frontend

```bash
cd /Users/lavvubala/projects/JobFitAI

npm run build
```

Look for `dist/` folder to be created.

---

## Step 4: Deploy Frontend to Cloudflare Pages (UI-Based)

1. Go to https://dash.cloudflare.com/
2. Click **Pages** > **Create a project**
3. Connect to GitHub (select your `jobfitai` repo)
4. Framework preset: **Vite**
5. Build command: `npm run build`
6. Build output directory: `dist`
7. Click **Environment variables**
8. Add: `VITE_API_URL` = `https://your-backend-url`
9. Click **Save and Deploy**

Wait 2-5 minutes. Your URL: `https://your-project-xxx.pages.dev`

---

## Step 5: Deploy Backend - Option A: Cloudflare Workers

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Go to backend
cd /Users/lavvubala/projects/JobFitAI/backend

# Initialize worker
wrangler init

# Update wrangler.toml
cat > wrangler.toml << 'EOF'
name = "jobfitai-api"
main = "server.js"
compatibility_date = "2024-01-01"

[env.production]
vars = { ANTHROPIC_API_KEY = "sk-ant-..." }
EOF

# Deploy
wrangler deploy
```

Your backend URL: `https://jobfitai-api.YOUR_ACCOUNT.workers.dev`

---

## Step 5: Deploy Backend - Option B: Heroku

```bash
# Install Heroku CLI (if not already installed)
brew install heroku/brew/heroku

# Login
heroku login

# Go to backend
cd /Users/lavvubala/projects/JobFitAI/backend

# Create app
heroku create jobfitai-api

# Set environment variable
heroku config:set ANTHROPIC_API_KEY=sk-ant-YOUR_KEY

# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
git push heroku main
```

Your backend URL: `https://jobfitai-api.herokuapp.com`

---

## Step 5: Deploy Backend - Option C: Railway

1. Go to https://railway.app/
2. Click **New Project**
3. Select **Deploy from GitHub**
4. Select your `jobfitai` repository
5. Add environment variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-YOUR_KEY`
6. Set start command: `node backend/server.js`
7. Deploy (automatically)

Your backend URL shown on Railway dashboard.

---

## Step 6: Update Frontend API Endpoint

Edit `src/services/analysisApi.js` line 7:

**Before:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

**After: (Keep as is - it reads from environment variable)**

The variable `VITE_API_URL` is already set in Cloudflare Pages environment.

---

## Step 7: Redeploy Frontend

```bash
# Make sure you're in project root
cd /Users/lavvubala/projects/JobFitAI

# Commit changes
git add .
git commit -m "Update: Configure production API endpoint"

# Push to GitHub (Cloudflare auto-deploys)
git push origin main
```

Wait 2-5 minutes for Cloudflare to redeploy.

---

## Step 8: Test Everything

1. Visit your Cloudflare Pages URL
2. Upload a resume file
3. Paste a job description
4. Click "Analyze Match"
5. See results

If it works → **You're deployed!** 🎉

---

## If Something Breaks

### "API Analysis unavailable"
```bash
# 1. Check backend is running
curl https://your-backend-url/health

# 2. Check API key is set in backend hosting
# (Cloudflare Workers / Heroku / Railway environment)

# 3. Rebuild frontend
npm run build
git add .
git commit -m "Rebuild frontend"
git push origin main
```

### ".env.local accidentally pushed to GitHub"
```bash
# DANGER: Create new API key immediately!
# Your old key is compromised.

# Then:
git rm --cached .env.local
git commit -m "Remove .env.local"
git push
```

### Build fails
```bash
# Check locally
npm run build

# If errors, fix and commit:
git add .
git commit -m "Fix build errors"
git push origin main
```

---

## Environment Variables Reference

### Cloudflare Pages (Frontend)
- `VITE_API_URL` = `https://your-backend-url`

### Cloudflare Workers (Backend)
- `ANTHROPIC_API_KEY` = `sk-ant-...`

### Heroku (Backend)
```bash
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
```

### Railway (Backend)
- UI: Add variable in project settings
- `ANTHROPIC_API_KEY` = `sk-ant-...`

---

## Useful Commands

```bash
# Check git status
git status

# See all commits
git log --oneline

# View Cloudflare Pages build logs
# Go to https://dash.cloudflare.com/ > Your Project > Deployments

# View Heroku logs (if using Heroku)
heroku logs --tail

# View Railway logs (if using Railway)
# Go to https://railway.app/ > Your Project > Logs

# Test backend health locally
curl http://localhost:3001/health

# Test backend health in production
curl https://your-backend-url/health
```

---

## Architecture Summary

```
Your Computer
      ↓
   GitHub ← You push code here
      ↓
┌─────────────────────────┐
│  Frontend (React/Vite)  │ → Cloudflare Pages
│  (dist/ folder)         │
└─────────────────────────┘
         ↓ (API calls to)
┌─────────────────────────┐
│  Backend (Express)      │ → Cloudflare Workers / Heroku / Railway
│  (server.js)            │
└─────────────────────────┘
         ↓ (uses)
┌─────────────────────────┐
│  Anthropic API          │
│  (Claude AI)            │
└─────────────────────────┘
```

---

## Timeline

- **First deployment:** 30-60 minutes (first time only)
- **Future deployments:** 5-10 minutes (just `git push`)
- **Cloudflare deployment:** 2-5 minutes after push
- **API response time:** 5-15 seconds per analysis

---

## Support Links

- Cloudflare Pages docs: https://developers.cloudflare.com/pages/
- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- Heroku docs: https://devcenter.heroku.com/
- Railway docs: https://docs.railway.app/
- GitHub docs: https://docs.github.com/

---

## Final Checklist Before Going Live

- [ ] `.env.local` is in `.gitignore`
- [ ] API key NOT in GitHub
- [ ] Frontend builds: `npm run build`
- [ ] Backend runs locally: `node backend/server.js`
- [ ] GitHub repository created
- [ ] Cloudflare Pages deployed
- [ ] Backend service deployed
- [ ] End-to-end test works
- [ ] Privacy notice displays
- [ ] No console errors
- [ ] API response reasonable (< 30 sec)

---

## You're Ready! 🚀

Follow these steps and you'll have your app live on the internet.

Any questions? Re-read the full DEPLOYMENT_GUIDE.md for detailed explanations.

