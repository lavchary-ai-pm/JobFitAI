# JobFitAI - Complete Deployment Guide for Beginners

This guide walks you through deploying JobFitAI to GitHub and Cloudflare Pages step-by-step.

---

## 🚨 IMPORTANT THINGS TO CHECK BEFORE DEPLOYMENT

### 1. **Environment Variables - CRITICAL**
Your `.env.local` file contains your sensitive API key. **DO NOT commit this to GitHub!**

**Status Check:**
```bash
cat .env.local
# Should show: ANTHROPIC_API_KEY=sk-ant-...
```

**What you need to do:**
- ✅ Make sure `.gitignore` includes `.env.local`
- ✅ Create environment variables in Cloudflare Pages dashboard (NOT in GitHub)
- ✅ Never push your API key to GitHub

**Check .gitignore:**
```bash
cat .gitignore
```
Should contain `.env.local`

---

### 2. **Backend Server - Important Architecture Note**

Your app has **TWO parts**:
1. **Frontend**: React app (Vite) - Cloudflare Pages handles this
2. **Backend**: Node.js Express server - **Cloudflare Pages CANNOT run this**

**⚠️ PROBLEM:** Cloudflare Pages only hosts static frontend apps. Your backend server in `/backend/server.js` needs a different hosting solution.

**Solutions for Backend:**

#### Option A: Use Cloudflare Workers (Recommended for your use case)
- Free tier available
- Serverless functions
- Can run Node.js code
- Good for API endpoints

#### Option B: Use Other Services
- Heroku (has free tier but limited)
- Railway.app (free tier)
- Render (free tier)
- AWS Lambda
- Google Cloud Functions
- Digital Ocean

**For now:** We'll prepare instructions assuming you'll handle backend separately OR convert to Cloudflare Workers.

---

### 3. **Build Output Check**

Your frontend needs to build successfully:

```bash
cd /Users/lavvubala/projects/JobFitAI
npm run build
```

This creates a `dist/` folder that gets deployed to Cloudflare Pages.

---

### 4. **API Endpoint Configuration**

Your frontend currently calls: `http://localhost:5000/api/analyze`

**For production**, this needs to point to your deployed backend. Update this in:
- File: `src/services/analysisApi.js`
- Change `localhost:5000` to your production backend URL

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [ ] `.env.local` is in `.gitignore` (contains API key)
- [ ] Frontend builds without errors: `npm run build`
- [ ] `dist/` folder is created successfully
- [ ] No hardcoded `localhost` URLs in production code
- [ ] GitHub account created
- [ ] Cloudflare account created
- [ ] Anthropic API key is safe and backed up
- [ ] Backend solution decided (Cloudflare Workers, Heroku, etc.)

---

## 🚀 STEP-BY-STEP DEPLOYMENT INSTRUCTIONS

---

# PART 1: Initialize Git Repository Locally

### Step 1.1: Open Terminal
1. Press `Cmd + Space` on Mac
2. Type `terminal` and press Enter
3. You should see a command prompt

### Step 1.2: Navigate to Your Project
```bash
cd /Users/lavvubala/projects/JobFitAI
```

### Step 1.3: Check Git Status
```bash
git status
```

If you see "fatal: not a git repository", you need to initialize Git:
```bash
git init
```

### Step 1.4: Create .gitignore File (If Not Exists)
This file tells Git what files NOT to upload to GitHub (like your API key!)

```bash
cat > .gitignore << 'EOF'
# Environment variables
.env.local
.env
.env.*.local

# Dependencies
node_modules/
npm-debug.log
yarn-error.log

# Build output
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Temporary files
.claude/
temp/
EOF
```

### Step 1.5: Verify .gitignore
```bash
cat .gitignore
```
Should show `.env.local` at the top.

### Step 1.6: Check for Uncommitted Changes
```bash
git status
```

### Step 1.7: Add All Files to Git (Except .gitignore Files)
```bash
git add .
```

### Step 1.8: Create First Commit
```bash
git commit -m "Initial commit: JobFitAI with scoring, location matching, pitch generation, and privacy protection"
```

---

# PART 2: Create GitHub Repository

### Step 2.1: Go to GitHub
1. Open browser
2. Go to `https://github.com/new`
3. Sign in if needed

### Step 2.2: Create New Repository
Fill in these fields:
- **Repository name:** `jobfitai` (or `job-fit-ai`)
- **Description:** "AI-powered job fit analysis tool with resume scoring and pitch generation"
- **Public or Private:** Choose based on your preference
- **DO NOT** check "Add .gitignore" (you already have one)
- **DO NOT** check "Add a license" yet
- Click **Create repository**

### Step 2.3: Copy Repository URL
After creation, you'll see a page with:
```
https://github.com/YOUR_USERNAME/jobfitai.git
```
Copy this URL (click the copy button)

---

# PART 3: Push Code to GitHub

### Step 3.1: Add GitHub as Remote
```bash
git remote add origin https://github.com/YOUR_USERNAME/jobfitai.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3.2: Verify Remote Was Added
```bash
git remote -v
```
Should show:
```
origin  https://github.com/YOUR_USERNAME/jobfitai.git (fetch)
origin  https://github.com/YOUR_USERNAME/jobfitai.git (push)
```

### Step 3.3: Push Code to GitHub
```bash
git branch -M main
git push -u origin main
```

**What this does:**
- Renames your local branch to `main`
- Uploads all your code to GitHub
- `-u` sets it as the default branch for future pushes

### Step 3.4: Verify on GitHub
1. Go to `https://github.com/YOUR_USERNAME/jobfitai`
2. You should see all your files there
3. **Important:** Verify `.env.local` is NOT visible (it shouldn't be because of .gitignore)

---

# PART 4: Deploy Frontend to Cloudflare Pages

### Step 4.1: Build Your Frontend
```bash
cd /Users/lavvubala/projects/JobFitAI
npm run build
```

This creates a `dist/` folder with the production-ready code.

**Output should show:**
```
✓ 1234 modules transformed.
dist/index.html                   0.89 kB │ gzip: 0.34 kB
dist/assets/index-xxxxx.js        123 kB │ gzip: 34 kB
...
```

### Step 4.2: Go to Cloudflare Pages Dashboard
1. Open `https://dash.cloudflare.com/`
2. Sign in (create account if needed)
3. Click **Pages** in the left sidebar
4. Click **Create a project**

### Step 4.3: Connect GitHub
1. Click **Connect to Git**
2. Select **GitHub**
3. Sign in to GitHub (if prompted)
4. Click **Authorize Cloudflare**
5. Select your repository: `jobfitai`

### Step 4.4: Configure Build Settings
You'll see a form:

**Build settings:**
- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Build output directory:** `dist`

These should auto-fill correctly.

### Step 4.5: Set Environment Variables
**IMPORTANT:** This is where you add your API key securely.

1. Click **Environment variables**
2. Click **Add variable**
3. Add:
   - **Variable name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (your actual API key from `.env.local`)
4. **Scope:** Select "Production"
5. Click **Save**

### Step 4.6: Deploy
1. Click **Save and Deploy**
2. Wait for deployment to complete (2-5 minutes)
3. You'll see a success message with your live URL:
   ```
   https://your-project-xxx.pages.dev
   ```

### Step 4.7: Test Your Frontend
1. Visit `https://your-project-xxx.pages.dev`
2. You should see your JobFitAI app
3. The resume upload and job input should work

---

# PART 5: Deploy Backend (CRITICAL FOR API CALLS)

Your frontend won't work without the backend! Choose one option:

---

## Option A: Deploy Backend to Cloudflare Workers (Recommended)

### A.1: Install Wrangler (Cloudflare CLI)
```bash
npm install -g wrangler
```

### A.2: Login to Cloudflare
```bash
wrangler login
```
This opens a browser to authorize Cloudflare.

### A.3: Create Worker
```bash
cd /Users/lavvubala/projects/JobFitAI/backend
wrangler init
```

Answer the prompts:
- **What is the name of the project?** `jobfitai-api`
- **Typescript?** No
- **Create a new project?** Yes

### A.4: Update wrangler.toml
Edit the file `backend/wrangler.toml`:
```toml
name = "jobfitai-api"
main = "server.js"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

[build]
command = "npm install"
```

### A.5: Deploy to Workers
```bash
wrangler deploy
```

You'll get a URL: `https://jobfitai-api.YOUR_ACCOUNT.workers.dev`

### A.6: Update Frontend API Endpoint
Edit `src/services/analysisApi.js`:

**Before:**
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

**After:**
```javascript
const API_URL = 'https://jobfitai-api.YOUR_ACCOUNT.workers.dev';
```

---

## Option B: Deploy Backend to Heroku (Alternative)

### B.1: Create Heroku Account
Go to `https://www.heroku.com/` and create an account.

### B.2: Install Heroku CLI
```bash
brew install heroku/brew/heroku
```

### B.3: Login to Heroku
```bash
heroku login
```

### B.4: Create Heroku App
```bash
cd /Users/lavvubala/projects/JobFitAI/backend
heroku create jobfitai-api
```

### B.5: Set Environment Variables
```bash
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
```

### B.6: Deploy
```bash
git push heroku main
```

Your backend is now at: `https://jobfitai-api.herokuapp.com`

### B.7: Update Frontend API Endpoint
Edit `src/services/analysisApi.js`:
```javascript
const API_URL = 'https://jobfitai-api.herokuapp.com';
```

---

## Option C: Deploy Backend to Railway (Easy Alternative)

### C.1: Create Railway Account
Go to `https://railway.app/` and sign up with GitHub.

### C.2: Create New Project
1. Click **Create new project**
2. Select **Deploy from GitHub repo**
3. Select your `jobfitai` repository

### C.3: Set Environment Variables
1. Go to project settings
2. Add variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Your API key

### C.4: Configure Build
1. Go to **Deployments**
2. Click the active deployment
3. Set:
   - **Start command:** `node server.js`
   - **Install command:** `cd backend && npm install`
   - **Build command:** `cd backend && npm install`

### C.5: Get Production URL
Your backend is at: `https://your-railway-url.railway.app`

### C.6: Update Frontend
Edit `src/services/analysisApi.js`:
```javascript
const API_URL = 'https://your-railway-url.railway.app';
```

---

# PART 6: Redeploy Frontend with Updated API URL

### Step 6.1: Update API Endpoint
```bash
cd /Users/lavvubala/projects/JobFitAI
```

Edit `src/services/analysisApi.js` and change API_URL to your backend URL.

### Step 6.2: Commit Changes
```bash
git add .
git commit -m "Update API endpoint to production backend"
git push origin main
```

### Step 6.3: Cloudflare Pages Auto-Deploys
Cloudflare automatically redeploys when you push to GitHub. Wait 2-5 minutes.

### Step 6.4: Test End-to-End
1. Visit your Cloudflare Pages URL
2. Upload a resume
3. Paste a job description
4. Click "Analyze Match"
5. See results (if this works, your backend is connected!)

---

# PART 7: Final Verification Checklist

- [ ] Frontend deployed to Cloudflare Pages
- [ ] Frontend accessible at `https://your-project.pages.dev`
- [ ] Backend deployed (Cloudflare Workers / Heroku / Railway)
- [ ] Backend accessible at production URL
- [ ] API key is NOT in GitHub (check `.gitignore`)
- [ ] API key is set in Cloudflare Pages environment
- [ ] API key is set in backend hosting (Workers/Heroku/Railway)
- [ ] Frontend API endpoint points to production backend
- [ ] Resume upload works
- [ ] Job description paste works
- [ ] "Analyze Match" button works end-to-end
- [ ] Results display correctly
- [ ] Privacy notices show correctly

---

# PART 8: Troubleshooting

### Problem: "API Analysis unavailable" Error
**Cause:** Frontend can't reach backend
**Solution:**
1. Check backend is deployed and running
2. Verify API_URL in `src/services/analysisApi.js` is correct
3. Check API key is set in backend environment
4. Rebuild frontend: `npm run build && git push`

### Problem: ".env.local pushed to GitHub"
**Solution:**
```bash
git rm --cached .env.local
git commit -m "Remove .env.local from tracking"
git push
# Then create a new API key (your old one is compromised)
```

### Problem: Build fails on Cloudflare
**Check:**
1. Does `npm run build` work locally?
2. Are dependencies in `package.json`?
3. Check build logs in Cloudflare dashboard

### Problem: File uploads don't work
**Check:**
1. Is backend deployed?
2. Can frontend reach backend API?
3. Does backend have required npm packages?

---

# PART 9: Optional Enhancements

### Add Custom Domain
1. Go to Cloudflare Pages project
2. Click **Custom domains**
3. Add your domain (you need to own it)
4. Update DNS settings with Cloudflare

### Add Google Analytics
1. Get Google Analytics ID
2. Add to `public/index.html` before `</head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

---

# PART 10: Future Deployments

After initial deployment, deploying changes is simple:

1. Make code changes locally
2. Test locally: `npm start`
3. Push to GitHub:
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```
4. Cloudflare Pages auto-deploys within 2-5 minutes
5. Backend auto-deploys depending on your hosting

---

## Summary

**What you're deploying:**
- **Frontend** (React/Vite) → Cloudflare Pages (Free)
- **Backend** (Node.js/Express) → Cloudflare Workers / Heroku / Railway (Free tier available)
- **API Key** → Cloudflare Pages Environment Variables (Secure, never in GitHub)

**Result:**
- Your app is live on the internet
- Anyone can access it with a URL
- Your API key is safe and secure
- Easy to update: just `git push`

Good luck with your deployment! 🚀

