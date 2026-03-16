# 🚀 Quick Start - What to Do Next

## Step 1: Start Docker Desktop

1. **Open Docker Desktop** on your Windows machine
2. **Wait** for it to fully start (green icon in system tray)
3. **Verify** it's running:
   ```bash
   docker ps
   ```
   You should see a list of containers (might be empty, that's OK)

## Step 2: Create Environment File

Create a file named `.env.local` in the project root with this content:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**Quick way (Windows PowerShell):**
```powershell
@"
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
"@ | Out-File -FilePath .env.local -Encoding utf8
```

## Step 3: Start Supabase

```bash
npx supabase start
```

⏱️ **This takes 2-5 minutes the first time** (downloading Docker images)

You'll see output like:
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:[PASSWORD]@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGc...
service_role key: eyJhbGc...
```

✅ **Success!** Supabase is now running locally.

## Step 4: Restore Your Database Backup

### Find your backup file
Where is your `.backup` file located? Let's say it's at:
```
C:\Users\hp\Downloads\backup.backup
```

### Method A: Using Command Line (if you have PostgreSQL installed)

1. **Get the database password** from Step 3 output (the [PASSWORD] part)

2. **Run the restore command:**
   ```bash
   pg_restore -h 127.0.0.1 -p 54322 -U postgres -d postgres -v "C:\Users\hp\Downloads\backup.backup"
   ```

3. **Enter password** when prompted

### Method B: Using Docker (if pg_restore is not installed)

```bash
# Copy backup into Docker container
docker cp "C:\Users\hp\Downloads\backup.backup" supabase_db_interviewden:/tmp/backup.backup

# Restore from inside container
docker exec -it supabase_db_interviewden pg_restore -U postgres -d postgres -v /tmp/backup.backup
```

### Method C: Using Supabase Studio (easiest for .sql files)

1. **Open** http://127.0.0.1:54323 in your browser
2. **Go to** SQL Editor
3. **Open** your backup.sql file in a text editor
4. **Copy & Paste** the SQL into the editor
5. **Click** Run

## Step 5: Start the Development Server

```bash
npm run dev
```

## Step 6: Open Your App

🎉 **Your app is now running!**

Visit: **http://localhost:3000**

You should see:
- ✅ Landing page with "InterviewDen" branding
- ✅ Login/Signup buttons
- ✅ Features section
- ✅ Pricing information

## 🎯 Test the Flow

### Test Company Login
1. Go to http://localhost:3000
2. Click **"Login"** (or **"I'm a Company"**)
3. Switch to **"Company"** tab
4. Enter company credentials from your backup
5. Should redirect to `/company/dashboard`

### Test Candidate Login
1. Go to http://localhost:3000
2. Click **"Login"**
3. Switch to **"Candidate"** tab
4. Enter candidate credentials
5. Should redirect to `/candidate/dashboard`

## 📊 Useful URLs

| What | URL | Use |
|------|-----|-----|
| Your App | http://localhost:3000 | Main application |
| Database UI | http://127.0.0.1:54323 | View/edit database |
| Email Testing | http://127.0.0.1:54324 | See test emails |

## ⚡ Quick Commands

```bash
# Check Supabase status
npx supabase status

# Stop Supabase (when done)
npx supabase stop

# Restart everything
npx supabase stop
npx supabase start

# View logs
npx supabase logs

# Reset database (⚠️ DANGER: Deletes all data)
npx supabase db reset
```

## 🐛 Something Not Working?

### "Docker not running" error
➡️ Make sure Docker Desktop is fully started (green icon)

### Can't access http://localhost:3000
➡️ Make sure you ran `npm run dev`

### Database connection error
➡️ Check `.env.local` file exists with correct values

### "Port already in use"
➡️ Stop Supabase and start again:
```bash
npx supabase stop
npx supabase start
```

### Tables are empty
➡️ You need to restore your database backup (see Step 4)

## 🎓 Next Steps

Once everything is running:

1. **Explore the landing page** at http://localhost:3000
2. **Check the database** at http://127.0.0.1:54323
3. **Login** as a company or candidate
4. **Test the features** in both portals

## 📖 Full Documentation

- [README.md](./README.md) - Complete project overview
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [DATABASE_RESTORE.md](./DATABASE_RESTORE.md) - Database restoration details

---

**Need immediate help?** Share the error message and I can assist! 🚀

