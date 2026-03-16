@echo off
REM InterviewDen Setup Script for Windows
echo 🚀 InterviewDen Setup Script
echo ==============================
echo.

REM Check if Docker is running
echo 📦 Checking Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker is not running!
    echo    Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✅ Docker is running
echo.

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo 📝 Creating .env.local file...
    (
        echo # Supabase Local Development
        echo NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
    ) > .env.local
    echo ✅ Created .env.local
) else (
    echo ℹ️  .env.local already exists
)
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
echo ✅ Dependencies installed
echo.

REM Start Supabase
echo 🔧 Starting Supabase...
call npx supabase start
echo ✅ Supabase started
echo.

REM Show status
echo 📊 Supabase Status:
call npx supabase status
echo.

echo ✨ Setup complete!
echo.
echo 🌐 Important URLs:
echo    Application:     http://localhost:3000
echo    Supabase Studio: http://127.0.0.1:54323
echo    Email Testing:   http://127.0.0.1:54324
echo.
echo 📝 Next steps:
echo    1. If you have a database backup, restore it now
echo    2. Run 'npm run dev' to start the development server
echo    3. Visit http://localhost:3000
echo.
pause

