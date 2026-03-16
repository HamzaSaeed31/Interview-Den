#!/bin/bash

# InterviewDen Setup Script
echo "🚀 InterviewDen Setup Script"
echo "=============================="
echo ""

# Check if Docker is running
echo "📦 Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Supabase Local Development
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EOF
    echo "✅ Created .env.local"
else
    echo "ℹ️  .env.local already exists"
fi
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Start Supabase
echo "🔧 Starting Supabase..."
npx supabase start
echo "✅ Supabase started"
echo ""

# Show status
echo "📊 Supabase Status:"
npx supabase status
echo ""

echo "✨ Setup complete!"
echo ""
echo "🌐 Important URLs:"
echo "   Application:     http://localhost:3000"
echo "   Supabase Studio: http://127.0.0.1:54323"
echo "   Email Testing:   http://127.0.0.1:54324"
echo ""
echo "📝 Next steps:"
echo "   1. If you have a database backup, restore it now"
echo "   2. Run 'npm run dev' to start the development server"
echo "   3. Visit http://localhost:3000"
echo ""

