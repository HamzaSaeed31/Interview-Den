# AI Interview Module - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install three @react-three/fiber @react-three/drei microsoft-cognitiveservices-speech-sdk
```

### Step 2: Get Azure Credentials (FREE)

1. Go to https://portal.azure.com
2. Create a free account (if you don't have one)
3. Click "Create a resource"
4. Search for "Speech Services"
5. Click "Create"
6. Fill in:
   - **Subscription:** Your subscription
   - **Resource Group:** Create new (e.g., "interview-resources")
   - **Region:** East US (or closest to you)
   - **Name:** interview-speech-service
   - **Pricing Tier:** Free F0 (500K characters/month)
7. Click "Review + Create" → "Create"
8. Wait 1-2 minutes for deployment
9. Click "Go to resource"
10. Click "Keys and Endpoint" in left sidebar
11. Copy:
    - **KEY 1** (your subscription key)
    - **REGION** (e.g., "eastus")

### Step 3: Configure Environment Variables

Create or edit `.env.local` in your project root:

```env
# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Azure Speech (NEW - copy from Azure Portal)
NEXT_PUBLIC_AZURE_SPEECH_KEY=paste-your-key-here
NEXT_PUBLIC_AZURE_SPEECH_REGION=eastus

# Interview API (Python Backend)
NEXT_PUBLIC_INTERVIEW_API_URL=http://127.0.0.1:8000
```

**⚠️ IMPORTANT:** 
- Replace `paste-your-key-here` with your actual Azure key
- Never commit `.env.local` to git (it's already in `.gitignore`)

### Step 4: Start Your Backend API

In your Python backend directory:

```bash
python -m uvicorn main:app --reload --port 8000
```

Verify it's running by opening: http://127.0.0.1:8000/docs

### Step 5: Start Your Frontend

```bash
npm run dev
```

### Step 6: Test the Interview

1. Open http://localhost:3000
2. Login as a **candidate**
3. Go to "Jobs" → Apply to any job
4. Complete **Resume Screening**
5. Complete **Quiz Assessment**
6. Click **"Continue to Interview"**
7. Allow microphone access when prompted
8. Have a conversation!

---

## 🎤 Browser Requirements

### ✅ Supported Browsers:
- **Chrome** 25+ (Recommended)
- **Edge** 79+

### ❌ Not Supported:
- Firefox (no Web Speech API)
- Safari (limited support)

**Use Chrome for best experience!**

---

## 🔧 Troubleshooting

### Issue 1: "Speech recognition not supported"
**Cause:** Using unsupported browser  
**Fix:** Switch to Chrome or Edge

---

### Issue 2: "Text-to-speech not initialized"
**Possible Causes:**
1. Missing Azure credentials
2. Wrong region
3. Invalid key
4. Expired free trial

**Fixes:**
```bash
# 1. Check your .env.local exists and has the correct values
cat .env.local

# 2. Verify your Azure key is active in Azure Portal
# Go to: Speech Service → Keys and Endpoint → Regenerate keys if needed

# 3. Restart your dev server
npm run dev
```

---

### Issue 3: "Microphone permission denied"
**Fix:**
1. Click the 🔒 icon in the address bar
2. Allow microphone access
3. Refresh the page

**Chrome Settings:**
- Go to `chrome://settings/content/microphone`
- Make sure localhost is allowed

---

### Issue 4: "Interview session not found"
**Cause:** Backend restarted (sessions are in-memory)  
**Fix:** Start a new interview

---

### Issue 5: Backend API not responding
**Check:**
```bash
# 1. Is the backend running?
curl http://127.0.0.1:8000/

# 2. Check CORS settings in your backend
# Make sure localhost:3000 is allowed

# 3. Check backend logs for errors
```

---

### Issue 6: "Network error"
**Possible Causes:**
1. No internet connection (Azure TTS needs internet)
2. Backend not running
3. Wrong API URL in .env.local

**Fixes:**
```bash
# Verify backend is accessible
curl http://127.0.0.1:8000/interview/start

# Check your .env.local
echo $NEXT_PUBLIC_INTERVIEW_API_URL
```

---

## 📊 Azure Free Tier Limits

### Speech Services (Free F0)
- **Limit:** 500,000 characters per month
- **Resets:** Monthly
- **Cost after limit:** $1 per 1,000 characters

### Estimations:
- **Average interview:** 2,000-3,000 characters
- **Free tier capacity:** ~150-250 interviews/month

### Monitor Usage:
1. Go to Azure Portal
2. Click your Speech Service
3. Click "Metrics"
4. View "Characters Translated"

---

## 🎯 Testing Your Setup

### Quick Test Checklist:

```bash
# 1. Dependencies installed?
npm list three @react-three/fiber microsoft-cognitiveservices-speech-sdk

# 2. Environment variables set?
cat .env.local | grep AZURE

# 3. Backend running?
curl http://127.0.0.1:8000/docs

# 4. Frontend running?
curl http://localhost:3000

# 5. Browser supported?
# Open Chrome and check: chrome://version
```

### Manual Test Flow:

1. **Login as Candidate**
   - Email: candidate@test.com
   - Password: (your test password)

2. **Apply to Job**
   - Navigate to "Jobs"
   - Click "Apply Now"
   - Select resume

3. **Complete Screening**
   - Resume: Auto-evaluated
   - Quiz: Answer all questions
   - Interview: Click "Start Interview"

4. **Verify Features:**
   - [ ] AI greeting is spoken (TTS working)
   - [ ] Avatar mouth moves (visemes working)
   - [ ] Can hear yourself speak (mic working)
   - [ ] Transcript updates (STT working)
   - [ ] AI responds to your answers (API working)
   - [ ] Interview completes (full flow working)
   - [ ] Results displayed (grading working)

5. **Check Database:**
   - Go to Supabase Dashboard
   - Open "applications" table
   - Find your application
   - Check `interview_results` field has data

---

## 🔑 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | - | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | - | Your Supabase anon/public key |
| `NEXT_PUBLIC_AZURE_SPEECH_KEY` | **Yes** | - | Azure Speech Services subscription key |
| `NEXT_PUBLIC_AZURE_SPEECH_REGION` | **Yes** | - | Azure region (e.g., eastus, westus) |
| `NEXT_PUBLIC_INTERVIEW_API_URL` | Yes | http://127.0.0.1:8000 | Your Python backend URL |

**Bold = New for interview module**

---

## 📱 Alternative: Web Speech API Only (No Azure)

If you don't want to use Azure (no TTS), you can use browser-native TTS:

**Pros:**
- ❌ No API keys needed
- ❌ Completely free
- ❌ Works offline

**Cons:**
- ❌ Robot-like voice quality
- ❌ No viseme data (can't sync lips)
- ❌ Limited voice options

**To enable:**
1. Comment out Azure TTS in the interview page
2. Use Web Speech API's `SpeechSynthesis` instead
3. Avatar will use basic "speaking" animation without lip sync

**Not recommended** for production, but good for testing without Azure.

---

## 🎓 Development Tips

### Hot Reload Issues?
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### TypeScript Errors?
```bash
# Regenerate types
npm run build
```

### Module Not Found?
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues?
```bash
# Verify Supabase is running (if local)
npx supabase status

# Or check online dashboard
# https://app.supabase.com
```

---

## 🚀 Production Deployment

### Before Deploying:

1. **Update API URLs:**
   ```env
   NEXT_PUBLIC_INTERVIEW_API_URL=https://your-api-domain.com
   ```

2. **HTTPS Required:**
   - Web Speech API requires HTTPS in production
   - Deploy backend with SSL certificate

3. **Environment Variables:**
   - Add to Vercel/Netlify environment variables
   - Never commit `.env.local` to git

4. **CORS Settings:**
   - Update backend CORS to allow your production domain
   - Remove localhost from CORS in production

5. **Test in Production:**
   - Verify microphone works over HTTPS
   - Test on different devices/browsers
   - Monitor Azure usage

---

## 📞 Need Help?

### Check These First:
1. Console errors (F12 → Console tab)
2. Network tab (F12 → Network tab)
3. Backend logs
4. Azure Portal metrics

### Common Error Messages:

| Error | Solution |
|-------|----------|
| "Speech recognition not supported" | Use Chrome/Edge |
| "Microphone permission denied" | Allow in browser settings |
| "TTS not initialized" | Check Azure credentials |
| "Session not found" | Start new interview |
| "Network error" | Check backend is running |

---

## ✅ Setup Complete!

Once you can complete a full interview end-to-end, you're all set! 🎉

**Next Steps:**
1. Customize avatar appearance
2. Adjust voice settings
3. Test on different browsers
4. Monitor Azure usage
5. Deploy to production

---

**Happy Interviewing! 🚀**

