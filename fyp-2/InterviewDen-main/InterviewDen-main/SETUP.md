# InterviewDen - Local Development Setup Guide

## Prerequisites
- Docker Desktop (installed and running)
- Node.js (v18 or higher)
- Supabase CLI

## Step-by-Step Setup

### 1. Start Docker Desktop
Make sure Docker Desktop is running on your machine. You can verify by running:
```bash
docker ps
```

### 2. Create Environment File
Create a file named `.env.local` in the root directory with the following content:

```env
# Supabase Local Development
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**Note:** These are the default local development credentials. When deploying to production, replace with your actual Supabase project credentials.

### 3. Start Supabase Local
```bash
npx supabase start
```

This will start all Supabase services locally:
- PostgreSQL Database (port 54322)
- API Gateway (port 54321)
- Studio (port 54323) - Web interface at http://127.0.0.1:54323
- Inbucket (port 54324) - Email testing

### 4. Restore Database Backup

#### Option A: Using .backup file (PostgreSQL custom format)
```bash
# First, get the database password
npx supabase status

# Then restore the backup
pg_restore -h 127.0.0.1 -p 54322 -U postgres -d postgres -v path/to/your/backup.backup
```

#### Option B: Using .sql file
```bash
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f path/to/your/backup.sql
```

#### Option C: Using Supabase CLI (recommended)
```bash
# If you have a dump file
npx supabase db reset

# Then manually import via Studio
# 1. Go to http://127.0.0.1:54323
# 2. Go to SQL Editor
# 3. Upload and run your SQL backup
```

### 5. Install Dependencies
```bash
npm install
```

### 6. Run the Development Server
```bash
npm run dev
```

Your app will be available at http://localhost:3000

## Important URLs

- **Application:** http://localhost:3000
- **Supabase Studio:** http://127.0.0.1:54323
- **Email Testing (Inbucket):** http://127.0.0.1:54324
- **API Gateway:** http://127.0.0.1:54321

## Database Schema

The application uses the following main tables:
- `profiles` - User profiles (both candidates and companies)
- `companies` - Company-specific information
- `jobs` - Job postings
- `applications` - Job applications
- `interviews` - Interview schedules
- `assessments` - Test and assessment data

## Useful Commands

```bash
# Check Supabase status
npx supabase status

# Stop Supabase
npx supabase stop

# Reset database (WARNING: This deletes all data)
npx supabase db reset

# Generate TypeScript types from database
npx supabase gen types typescript --local > types/supabase.ts

# View logs
npx supabase logs
```

## Troubleshooting

### Docker not running
**Error:** `The system cannot find the file specified`
**Solution:** Start Docker Desktop and wait for it to fully initialize

### Port already in use
**Solution:** Stop other services using the same ports or change ports in `supabase/config.toml`

### Database connection failed
**Solution:** 
1. Check if Supabase is running: `npx supabase status`
2. Verify .env.local has correct values
3. Restart Supabase: `npx supabase stop` then `npx supabase start`

### Migrations not applied
**Solution:**
```bash
npx supabase db reset
```

## Production Deployment

When deploying to production:

1. Create a Supabase project at https://supabase.com
2. Update `.env.local` (or your hosting provider's environment variables) with production credentials
3. Run migrations on production database
4. Deploy your Next.js app to Vercel/Netlify/your hosting provider

## Need Help?

- Check `/company/help` or `/candidate/help` in the app
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs

