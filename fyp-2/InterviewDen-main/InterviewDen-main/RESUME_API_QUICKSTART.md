# Resume Screening API - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
1. ✅ Database schema updated (candidates table with resumes column)
2. ✅ Applications table created
3. ✅ Backend API running on `http://127.0.0.1:8000`

---

## 📋 Step-by-Step Setup

### 1. Configure Environment Variables

Create or update `.env.local` in your project root:

```bash
# Resume Parsing API URL
NEXT_PUBLIC_RESUME_API_URL=http://127.0.0.1:8000

# Your existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
```

### 2. Start Your Backend API

Make sure your Python FastAPI backend is running:

```bash
# Navigate to your API directory
cd path/to/your/api

# Start the API
python main.py
# or
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Verify it's running by visiting: `http://127.0.0.1:8000/docs`

### 3. Start Your Next.js App

```bash
# In your project root
npm run dev
```

---

## 🧪 Testing the Integration

### Test 1: Upload & Parse Resume

1. **Navigate to CV page:**
   ```
   http://localhost:3000/candidate/cv
   ```

2. **Upload a PDF resume:**
   - Click "Upload Resume" button
   - Select a PDF file (max 5MB)
   - Wait for parsing to complete

3. **Verify:**
   - ✅ Toast notification: "Resume uploaded and parsed successfully"
   - ✅ Resume appears in the list
   - ✅ Shows parsed name, skills, and experience
   - ✅ Check browser console for API call to `/parse/resume`

4. **Check Database:**
   ```sql
   SELECT resumes FROM candidates WHERE id = 'your-user-id';
   ```
   Should return a JSONB array with your parsed resume.

---

### Test 2: Apply for Job & Resume Screening

1. **Navigate to Jobs page:**
   ```
   http://localhost:3000/candidate/jobs
   ```

2. **Click "Apply Now" on any job**

3. **On Resume Screening page:**
   - Your default resume should be auto-selected
   - You should see the job title at the top
   - Click "Analyze Resume"

4. **Wait for matching (may take 10-30 seconds):**
   - API will:
     1. Parse the job description
     2. Match your resume against the job
     3. Return scores and feedback

5. **Verify Match Results:**
   - ✅ Overall match score displayed (0-100%)
   - ✅ Skill match score
   - ✅ Experience match score
   - ✅ Missing skills listed
   - ✅ Feedback message shown
   - ✅ Pass/Fail status

6. **If PASSED:**
   - Button changes to "Continue to Quiz"
   - Click it to proceed to quiz

7. **Check Database:**
   ```sql
   SELECT * FROM applications WHERE candidate_id = 'your-user-id' AND job_id = 'job-id';
   ```
   Should contain:
   - `resume_parsed_data`: Your parsed resume
   - `ats_score`: Match score
   - `resume_screening`: Detailed match results

---

## 🔍 Debugging

### Check API Connectivity

Open browser console and run:

```javascript
fetch('http://127.0.0.1:8000/docs')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error)
```

If this fails, your API is not running or has CORS issues.

### Check Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Upload a resume
4. Look for:
   - `parse/resume` request (should return 200)
   - Response should contain parsed resume data

### Check Console Logs

Look for:
- "✅ Resume parsed: [Name]"
- "Analyzing your resume against the job requirements..."
- "Resume screening completed!"

### Common Errors

#### "Failed to load resumes"
- Check if you're logged in
- Verify candidates table has resumes column
- Check Supabase connection

#### "API Error: Failed to fetch"
- API is not running
- Check API URL in .env.local
- Verify CORS settings on backend

#### "Resume appears fraudulent"
- API detected suspicious content
- Check resume content
- May be a false positive - review red_flags in response

#### "Resume did not meet minimum requirements"
- Match score too low
- Missing critical skills
- Experience mismatch
- Review feedback message for details

---

## 📊 Monitoring API Calls

### View API Logs

In your API terminal, you should see:

```
INFO:     127.0.0.1:xxxx - "POST /parse/resume HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxx - "POST /parse/job HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxx - "POST /match HTTP/1.1" 200 OK
```

### View Request/Response

In browser DevTools → Network:

1. Click on `parse/resume` request
2. Go to "Response" tab
3. Verify structure matches:
   ```json
   {
     "Name": "...",
     "Contact": {...},
     "Experience": {...},
     "Skills": [...],
     "is_fraudulent": false
   }
   ```

---

## 🎯 Quick Test Checklist

- [ ] API is running on port 8000
- [ ] .env.local has correct API URL
- [ ] Can upload PDF on /candidate/cv
- [ ] Resume is parsed and stored
- [ ] Can see resume details in UI
- [ ] Can apply for job from /candidate/jobs
- [ ] Resume screening page loads
- [ ] Can select resume
- [ ] "Analyze Resume" button works
- [ ] Match results appear after analysis
- [ ] Application record created in database
- [ ] Can proceed to quiz if passed

---

## 📞 Need Help?

### Check Implementation Details
See `RESUME_SCREENING_IMPLEMENTATION.md` for:
- Complete flow diagrams
- Database schema
- Code structure
- API endpoint details

### Verify Database Schema

```sql
-- Check candidates table
\d candidates;

-- Check applications table
\d applications;

-- View your data
SELECT * FROM candidates WHERE id = 'your-user-id';
SELECT * FROM applications WHERE candidate_id = 'your-user-id';
```

### Test API Endpoints Directly

Using curl or Postman:

```bash
# Test parse resume
curl -X POST http://127.0.0.1:8000/parse/resume \
  -F "file=@/path/to/resume.pdf"

# Test parse job
curl -X POST http://127.0.0.1:8000/parse/job \
  -F "file=@/path/to/job.txt"
```

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ You can upload a PDF resume
2. ✅ Resume is automatically parsed
3. ✅ Parsed data appears in the UI
4. ✅ You can apply for a job
5. ✅ Resume matching works
6. ✅ Match scores are displayed
7. ✅ Application is saved in database
8. ✅ You can proceed to quiz after passing

---

## 🎉 You're Ready!

If all tests pass, your resume screening system is fully operational!

**Next Steps:**
1. Test with multiple resumes
2. Test with different job descriptions
3. Test edge cases (low scores, missing skills)
4. Deploy API to production
5. Update .env.local with production API URL

---

**Happy Screening! 🚀**

