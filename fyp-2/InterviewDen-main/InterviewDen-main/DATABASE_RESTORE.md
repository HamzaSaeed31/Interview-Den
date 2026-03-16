# Database Backup Restoration Guide

This guide explains how to restore your InterviewDen database from a backup file.

## Prerequisites

1. Docker Desktop running
2. Supabase local instance started (`npx supabase start`)
3. Your backup file (`.backup`, `.sql`, or `.dump` format)

## Method 1: Using Supabase Studio (Easiest)

### For SQL Files (.sql)

1. **Start Supabase:**
   ```bash
   npx supabase start
   ```

2. **Open Supabase Studio:**
   - Navigate to http://127.0.0.1:54323
   - Default password will be shown in the terminal

3. **Go to SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

4. **Paste and Execute:**
   - Open your `.sql` backup file in a text editor
   - Copy all the SQL content
   - Paste it into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`

## Method 2: Using Command Line (For .backup files)

### Get Database Credentials

First, get your local database password:
```bash
npx supabase status
```

Look for the `DB URL` which will be something like:
```
postgresql://postgres:[YOUR-PASSWORD]@127.0.0.1:54322/postgres
```

### Option A: PostgreSQL .backup File (Custom Format)

```bash
# Windows (Command Prompt)
pg_restore -h 127.0.0.1 -p 54322 -U postgres -d postgres -v "C:\path\to\your\backup.backup"

# Windows (PowerShell)
pg_restore -h 127.0.0.1 -p 54322 -U postgres -d postgres -v "C:/path/to/your/backup.backup"

# Linux/Mac
pg_restore -h 127.0.0.1 -p 54322 -U postgres -d postgres -v /path/to/your/backup.backup
```

When prompted, enter the password from `npx supabase status`.

### Option B: SQL File

```bash
# Windows (Command Prompt)
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f "C:\path\to\your\backup.sql"

# Windows (PowerShell)
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f "C:/path/to/your/backup.sql"

# Linux/Mac
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f /path/to/your/backup.sql
```

## Method 3: Using Docker (If pg_restore is not installed)

```bash
# Copy backup file into the Docker container
docker cp /path/to/backup.backup supabase_db_interviewden:/tmp/backup.backup

# Restore from within the container
docker exec -it supabase_db_interviewden pg_restore -U postgres -d postgres -v /tmp/backup.backup

# For SQL files
docker cp /path/to/backup.sql supabase_db_interviewden:/tmp/backup.sql
docker exec -it supabase_db_interviewden psql -U postgres -d postgres -f /tmp/backup.sql
```

## Method 4: Database Migration Files

If you have migration files instead of a backup:

1. **Place migration files:**
   ```
   supabase/migrations/
   ├── 20240101000000_initial_schema.sql
   └── 20240102000000_add_tables.sql
   ```

2. **Reset and apply migrations:**
   ```bash
   npx supabase db reset
   ```

## Verify the Restoration

After restoring, verify your data:

### Using Supabase Studio
1. Go to http://127.0.0.1:54323
2. Click "Table Editor" in the sidebar
3. Check if your tables are present:
   - `profiles`
   - `companies`
   - `jobs`
   - `applications`
   - etc.

### Using Command Line
```bash
# Connect to database
npx supabase db remote list

# Or use psql
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres

# Then run:
\dt  -- List all tables
SELECT COUNT(*) FROM profiles;  -- Check if data exists
```

## Common Issues

### 1. "pg_restore: command not found"

**Solution:** Install PostgreSQL client tools:
- **Windows:** Download from https://www.postgresql.org/download/windows/
- **Mac:** `brew install postgresql`
- **Linux:** `sudo apt-get install postgresql-client`

Or use the Docker method above.

### 2. "Password authentication failed"

**Solution:** 
1. Get the correct password: `npx supabase status`
2. Look for the DB URL line
3. Use the password shown there

### 3. "Database already contains tables"

**Solution:** Reset the database first:
```bash
npx supabase db reset
# Then restore your backup
```

### 4. "Permission denied"

**Solution:** 
- Make sure Supabase is running: `npx supabase status`
- Verify you're using the correct port (54322)
- Try restarting Supabase: `npx supabase stop` then `npx supabase start`

## Quick Restore Script (Windows)

Create a file named `restore-db.bat` in your project root:

```batch
@echo off
echo 🗄️  Database Restore Script
echo ========================
echo.

REM Get backup file path from user
set /p BACKUP_PATH="Enter full path to your backup file: "

REM Check if file exists
if not exist "%BACKUP_PATH%" (
    echo ❌ Error: File not found!
    pause
    exit /b 1
)

echo.
echo 📊 Getting database credentials...
call npx supabase status

echo.
echo 🔄 Restoring database...
echo    This may take a few minutes...
echo.

REM Detect file extension
if "%BACKUP_PATH:~-4%"==".sql" (
    psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f "%BACKUP_PATH%"
) else (
    pg_restore -h 127.0.0.1 -p 54322 -U postgres -d postgres -v "%BACKUP_PATH%"
)

echo.
echo ✅ Database restoration complete!
echo.
pause
```

Run it with: `restore-db.bat`

## Need Help?

If you encounter issues:
1. Check the Supabase logs: `npx supabase logs`
2. Verify Docker is running: `docker ps`
3. Check the main SETUP.md for troubleshooting tips
4. Visit Supabase docs: https://supabase.com/docs/guides/local-development

