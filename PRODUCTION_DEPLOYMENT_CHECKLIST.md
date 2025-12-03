# Production Deployment Checklist - JobFitAI

## 🔐 Critical Security Items (CHECK THESE FIRST!)

### API Key Security
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.local` file exists with `ANTHROPIC_API_KEY=sk-ant-...`
- [ ] You have NOT committed `.env.local` to GitHub
- [ ] API key is stored in Cloudflare Pages environment variables
- [ ] API key is stored in backend hosting environment variables
- [ ] Keep a backup of your API key in a safe location (password manager)

### Code Security
- [ ] No hardcoded API keys in source code
- [ ] No `localhost:` URLs in production code
- [ ] No console.log() with sensitive data
- [ ] No test/debug code left in production

---

## 🏗️ Architecture Verification

### Frontend (React/Vite)
- [ ] Runs with `npm start` locally
- [ ] Builds successfully: `npm run build`
- [ ] `dist/` folder created with HTML/CSS/JS files
- [ ] No build warnings or errors
- [ ] Uses environment variables for API URL (`VITE_API_URL`)

### Backend (Express/Node.js)
- [ ] Runs locally: `node server.js`
- [ ] Responds at `http://localhost:3001`
- [ ] `/health` endpoint returns `{status: 'ok'}`
- [ ] `/api/analyze` endpoint accepts POST requests
- [ ] Has all required dependencies in `package.json`
- [ ] Uses environment variables for API key (`ANTHROPIC_API_KEY`)

---

## 📦 Deployment Hosting Plans

### Frontend Deployment - Cloudflare Pages (PRIMARY)
- [ ] Cloudflare account created
- [ ] Project connected to GitHub repository
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable added: `VITE_API_URL=https://your-backend-url`

### Backend Deployment - Choose ONE Option

#### Option 1: Cloudflare Workers ✅ (Recommended)
- [ ] Wrangler installed: `npm install -g wrangler`
- [ ] `wrangler.toml` configured correctly
- [ ] Environment variable set: `ANTHROPIC_API_KEY`
- [ ] Deployed and accessible at `https://your-worker.workers.dev`
- [ ] CORS configured for your Cloudflare Pages domain

#### Option 2: Heroku
- [ ] Heroku account created
- [ ] Heroku CLI installed: `brew install heroku/brew/heroku`
- [ ] App created: `heroku create jobfitai-api`
- [ ] Environment variable set: `heroku config:set ANTHROPIC_API_KEY=...`
- [ ] `Procfile` created with start command
- [ ] Deployed: `git push heroku main`
- [ ] Accessible at `https://jobfitai-api.herokuapp.com`

#### Option 3: Railway
- [ ] Railway account created (GitHub login)
- [ ] Project connected to GitHub
- [ ] Environment variable set: `ANTHROPIC_API_KEY`
- [ ] Start command configured: `node backend/server.js`
- [ ] Deployed and accessible at your Railway URL

---

## 🔄 GitHub Configuration

### Repository Setup
- [ ] GitHub account created
- [ ] Repository created at `github.com/YOUR_USERNAME/jobfitai`
- [ ] `.gitignore` includes `.env.local`
- [ ] Initial commit pushed: `git commit -m "Initial commit"` + `git push`
- [ ] Main branch is default branch

### Secrets Management (DO NOT DO - Use Environment Variables Instead)
- ❌ Do NOT use GitHub Secrets for API keys
- ✅ DO use hosting platform's environment variables (Cloudflare, Heroku, Railway)

---

## 🌐 Deployment Steps Checklist

### Before Pushing to GitHub
- [ ] Run local build: `npm run build`
- [ ] Verify no errors in build output
- [ ] Test locally: `npm start` (frontend) + `node backend/server.js` (backend)
- [ ] Test file upload functionality
- [ ] Test job description input
- [ ] Test "Analyze Match" button
- [ ] Verify resume/job data is NOT stored anywhere

### GitHub & Cloudflare Pages
- [ ] Initialize git: `git init`
- [ ] Add remote: `git remote add origin https://github.com/YOUR_USERNAME/jobfitai.git`
- [ ] First push: `git push -u origin main`
- [ ] Cloudflare Pages connected to GitHub
- [ ] Build deployed and showing on Cloudflare Pages URL
- [ ] Frontend loads without errors

### Backend Deployment
- [ ] Backend deployed to your chosen platform
- [ ] Backend accessible at production URL
- [ ] Environment variables set with API key
- [ ] CORS enabled for your Cloudflare Pages domain
- [ ] Health check passes: `curl https://your-backend/health`

### Connection Testing
- [ ] Update `src/services/analysisApi.js` with production backend URL
- [ ] Rebuild frontend: `npm run build`
- [ ] Push changes: `git add . && git commit -m "..." && git push`
- [ ] Wait for Cloudflare Pages to redeploy (2-5 minutes)
- [ ] Test end-to-end:
  - [ ] Upload a resume file
  - [ ] Paste a job description
  - [ ] Click "Analyze Match"
  - [ ] Verify results display
  - [ ] Check no errors in browser console

---

## ⚠️ Common Issues to Prevent

### API Key Issues
- **Problem:** "Backend API key error"
- **Prevent by:** Setting `ANTHROPIC_API_KEY` in backend environment variables
- **Check:** Backend logs show API key is configured

### CORS Errors
- **Problem:** "Access to XMLHttpRequest blocked by CORS policy"
- **Prevent by:** Ensuring backend has CORS headers configured
- **Check:** Backend includes `app.use(cors())`

### 404 Errors on API Endpoint
- **Problem:** "Cannot POST /api/analyze"
- **Prevent by:** Ensuring backend API routes are correctly defined
- **Check:** Backend has `app.post('/api/analyze', ...)`

### Environment Variable Not Found
- **Problem:** "Environment variable VITE_API_URL not found"
- **Prevent by:** Setting variables in hosting platform, not in code
- **Check:** Variables set in Cloudflare Pages / Heroku / Railway dashboard

### File Upload Not Working
- **Problem:** "Only .txt, .pdf, and .docx files are supported"
- **Prevent by:** Verifying file format is actually supported
- **Check:** File extension is exactly .pdf, .docx, or .txt

---

## 🧪 Post-Deployment Testing

### Test Case 1: File Upload
1. Visit your live Cloudflare Pages URL
2. Click "Upload File"
3. Select a .pdf or .docx resume
4. Verify success message appears: "Resume uploaded successfully"
5. Verify filename is shown

### Test Case 2: Paste Resume
1. Click "Paste Text"
2. Paste sample resume text
3. Verify textarea shows content
4. Count characters displayed

### Test Case 3: Job Description Input
1. Paste job description in "Job Description" textarea
2. Verify text appears correctly
3. Verify no character limit issues

### Test Case 4: Analysis
1. Fill in both resume and job description
2. Click "Analyze Match"
3. Loading indicator appears
4. Results display after 5-15 seconds
5. Score breakdown shows correctly
6. Pitch section displays (Tier 1/2/3 based on score)

### Test Case 5: Data Privacy
1. Complete a full analysis
2. Close browser tab
3. Open DevTools > Application > LocalStorage
4. Verify NO resume data is stored
5. Verify NO job description data is stored
6. Only scoring weights should be stored

### Test Case 6: Resume Upload with File
- [ ] Test with .pdf file (100-page resume)
- [ ] Test with .docx file
- [ ] Test with .txt file
- [ ] Verify all formats extract text correctly

---

## 📊 Monitoring After Launch

### First Week
- [ ] Monitor for errors in backend logs
- [ ] Check Cloudflare Pages deployment logs
- [ ] Monitor API usage/costs
- [ ] Get user feedback if sharing with others

### Ongoing
- [ ] Monitor API costs (Anthropic token usage)
- [ ] Check for security issues
- [ ] Update dependencies monthly
- [ ] Keep API key secure

---

## 🚀 Post-Launch Improvements

### Add Custom Domain (Optional)
- [ ] Purchase domain (namecheap.com, godaddy.com, etc.)
- [ ] Point domain to Cloudflare
- [ ] Add domain to Cloudflare Pages
- [ ] Enable SSL/TLS

### Add Analytics (Optional)
- [ ] Add Google Analytics to `index.html`
- [ ] Track user interactions
- [ ] Monitor traffic and usage

### Add Error Tracking (Optional)
- [ ] Set up Sentry for error monitoring
- [ ] Get alerts for backend errors
- [ ] Track frontend exceptions

---

## 📝 Final Verification

Before considering deployment complete:

- [ ] Frontend is live and accessible
- [ ] Backend is live and responding
- [ ] End-to-end flow works (upload → analyze → results)
- [ ] Privacy promise is honored (no data stored)
- [ ] API key is secure (not in GitHub)
- [ ] No console errors in browser
- [ ] No errors in backend logs
- [ ] Resume upload works (all formats)
- [ ] Pitch generation works (all tiers)
- [ ] Privacy notice is displayed
- [ ] Can handle 5-10 requests per minute
- [ ] Performance is acceptable (< 15 sec response time)

---

## 🎉 Success Indicators

Your deployment is successful when:

1. ✅ You can visit your URL and see the app
2. ✅ You can upload a resume
3. ✅ You can paste a job description
4. ✅ You can click "Analyze Match"
5. ✅ You see results with scores
6. ✅ You see a pitch recommendation
7. ✅ No errors in browser console
8. ✅ Privacy notice is visible
9. ✅ API key is NOT visible in GitHub
10. ✅ App works smoothly (no lag)

---

## 📞 Quick Troubleshooting Links

- Cloudflare Pages: https://dash.cloudflare.com/
- GitHub: https://github.com/
- Heroku: https://dashboard.heroku.com/ (if using)
- Railway: https://railway.app/ (if using)
- Cloudflare Workers: https://dash.cloudflare.com/?to=/:account/workers (if using)

---

## 🔗 Key Files to Know

- Frontend code: `/src/` folder
- Backend code: `/backend/server.js`
- Build output: `/dist/` folder (generated)
- Git config: `.git/config`
- Git ignore: `.gitignore`
- Environment vars: `.env.local` (NOT committed)
- Package deps: `package.json`

---

Good luck! Your deployment should be straightforward if you follow this checklist. 🚀

