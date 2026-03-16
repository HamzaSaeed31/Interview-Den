# Dynamic Data Implementation

This document describes the changes made to connect the candidate and company portals to Supabase backend.

## Changes Made

### 1. Candidate Dashboard (`app/(candidate)/candidate/dashboard/page.tsx`)

**Status:** ✅ Fully converted from static to dynamic

**Data Sources:**
- `profiles` table: name, email, avatar_url
- `candidates` table: experience, skills, resume_url
- `jobs` table: active job listings for recommendations
- `companies` table: company names for job listings

**What's Dynamic:**
- ✅ User profile information (name, email)
- ✅ Welcome message (personalized with user's first name)
- ✅ **Profile completion percentage** (calculated from filled fields)
- ✅ **Profile completion indicators** (Resume, Personal Info, Skills status)
- ✅ **Recommended jobs** (fetched from active jobs in database)
- ✅ **Available jobs count** (real-time count of active jobs)
- ✅ **Profile completion stat** (dynamic percentage)

**Efficiency Features:**
- Uses `Promise.all()` to fetch profile, candidate, and jobs data in parallel
- Fetches company names in a single query for all jobs
- Calculates profile completion on the client side
- Minimal database queries for maximum efficiency

**What's Still Placeholder (Pending Database Tables):**
- ⏳ Applications list (shows "No applications yet" message)
- ⏳ Interviews schedule (shows "No interviews scheduled" message)
- ⏳ Applications count stat

**Future Requirements:**
To make these dynamic, you'll need to create:
- `applications` table - to track job applications
- `interviews` table - to track scheduled interviews

### 2. Candidate Jobs Page (`app/(candidate)/candidate/jobs/page.tsx`)

**Status:** ✅ Fully converted from static to dynamic

**Data Sources:**
- `jobs` table: All job postings with status 'active' or 'published'
- `companies` table: Company names for job listings

**What's Dynamic:**
- ✅ **Job listings** (fetched from database)
- ✅ **Company names** (linked from companies table)
- ✅ **Salary ranges** (formatted from min/max values)
- ✅ **Posted dates** (calculated from created_at timestamp)
- ✅ **Job locations** and types
- ✅ **Real-time filtering** by search, type, and experience
- ✅ **Loading states** with spinner
- ✅ **Empty states** with helpful messages

**Efficiency Features:**
- Fetches only active/published jobs
- Single batch query for company names
- Client-side filtering for instant results
- Proper date calculations for "posted X days ago"

**Smart Features:**
- Shows "Today" for jobs posted today
- Shows "X days ago" for older jobs
- Formats salary with proper currency symbols
- Handles missing/optional fields gracefully
- Working search across title, company, and description

### 3. Candidate Portal Page (`app/(candidate)/candidate/page.tsx`)

**Status:** ✅ Converted from static to dynamic

**Data Sources:**
- `profiles` table: name, email, avatar_url
- `candidates` table: experience, skills, resume_url

**What's Dynamic:**
- ✅ User profile information (name, email, avatar)
- ✅ Professional details (experience, skills)
- ✅ Welcome message (personalized with user's first name)

**What's Still Static (Pending Database Tables):**
- ⏳ Applications count and list
- ⏳ Interviews count and schedule
- ⏳ Tests count and list
- ⏳ Recommended jobs

---

### 4. Company Portal (`app/(company)/company/page.tsx`)

**Status:** ✅ Enhanced from basic profile to full dashboard

**Data Sources:**
- `profiles` table: email
- `companies` table: company_name, industry, size, location, website, description
- `jobs` table: title, status, created_at, description

**What's Dynamic:**
- ✅ Company profile information
- ✅ Active jobs count (status: 'active' or 'published')
- ✅ Draft jobs count
- ✅ Total jobs count
- ✅ Recent job postings list
- ✅ Job performance section
- ✅ Recent activities (based on job creation)

**What's Still Static (Pending Database Tables):**
- ⏳ Total applicants count
- ⏳ Interviews scheduled count
- ⏳ Applicant lists
- ⏳ Interview schedules
- ⏳ Application notifications

**Future Requirements:**
To make these dynamic, you'll need to create:
- `applications` table - to track candidates who applied
- `interviews` table - to track scheduled interviews
- `notifications` or `activities` table - to track real-time activities

---

## Database Schema Currently Used

### profiles
- `id` (uuid, primary key)
- `email` (text)
- `name` (text)
- `user_type` (text)
- `avatar_url` (text)
- `created_at` (timestamp)

### candidates
- `id` (uuid, primary key, references profiles.id)
- `resume_url` (text)
- `skills` (text[])
- `experience` (text)
- `created_at` (timestamp)

### companies
- `id` (uuid, primary key, references profiles.id)
- `company_name` (text)
- `industry` (text)
- `size` (text)
- `website` (text)
- `location` (text)
- `description` (text)
- `created_at` (timestamp)

### jobs
- `id` (uuid, primary key)
- `company_id` (uuid, references companies.id)
- `title` (text)
- `description` (text)
- `status` (text: 'draft', 'active', 'published', etc.)
- `created_at` (timestamp)
- Other fields: location, type, requirements, benefits, salary, etc.

---

## How Data Fetching Works

Both pages use the same pattern:

```typescript
// 1. Create Supabase client
const supabase = createSupabaseBrowserClient();

// 2. Use state to store data
const [loading, setLoading] = useState(true);
const [profileData, setProfileData] = useState({...});

// 3. Fetch data on component mount
useEffect(() => {
  const fetchData = async () => {
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch from tables
    const { data: profile } = await supabase
      .from("profiles")
      .select("...")
      .eq("id", userId)
      .single();
    
    // Update state
    setProfileData({...});
    setLoading(false);
  };
  
  fetchData();
}, []);
```

---

## Testing Your Changes

1. **Start your local Supabase** (if not already running):
   ```bash
   npx supabase start
   ```

2. **Run your Next.js app**:
   ```bash
   npm run dev
   ```

3. **Test as Candidate**:
   - Sign up/login as a candidate
   - Navigate to `/candidate` dashboard
   - Verify your profile information loads correctly
   - Update your profile in `/candidate/profile` to see changes reflect

4. **Test as Company**:
   - Sign up/login as a company
   - Navigate to `/company` dashboard
   - Create a job in `/company/jobs/create`
   - Return to dashboard to see job statistics update
   - Verify job counts and recent jobs list

---

## Next Steps

To make the portals fully dynamic, you should:

1. **Create missing database tables**:
   ```sql
   -- applications table
   CREATE TABLE applications (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     candidate_id uuid REFERENCES candidates(id),
     job_id uuid REFERENCES jobs(id),
     status text DEFAULT 'pending',
     applied_at timestamp DEFAULT now(),
     ...
   );
   
   -- interviews table
   CREATE TABLE interviews (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     application_id uuid REFERENCES applications(id),
     scheduled_at timestamp,
     duration integer,
     type text,
     ...
   );
   
   -- assessments table
   CREATE TABLE assessments (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     application_id uuid REFERENCES applications(id),
     type text,
     status text,
     score numeric,
     ...
   );
   ```

2. **Update the pages to fetch from these tables**:
   - Follow the same pattern used for jobs
   - Add state variables for the new data
   - Update useEffect to fetch the data
   - Replace static sections with dynamic data

3. **Add real-time subscriptions** (optional):
   ```typescript
   // Listen for new applications
   const subscription = supabase
     .channel('applications')
     .on('postgres_changes', {
       event: 'INSERT',
       schema: 'public',
       table: 'applications'
     }, payload => {
       // Update state with new application
     })
     .subscribe();
   ```

---

## Troubleshooting

**Data not loading?**
1. Check browser console for errors
2. Verify Supabase is running: `npx supabase status`
3. Check if user is authenticated
4. Verify database tables have data

**Profile data empty?**
1. Make sure you've created a profile after signup
2. Check if profile and candidate/company records exist in database
3. Use Supabase Studio (http://127.0.0.1:54323) to view data

**Job statistics not updating?**
1. Create a job from `/company/jobs/create`
2. Make sure job has proper `company_id`
3. Check job `status` field (should be 'active' or 'published')

