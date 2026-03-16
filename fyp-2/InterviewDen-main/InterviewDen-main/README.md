# 🎯 InterviewDen

**AI-Powered Recruitment Platform** - Streamline your hiring process with AI-driven interviews, automated assessments, and unbiased candidate evaluation.

## ✨ Features

### For Companies
- 📋 **Job Management** - Create and manage job postings
- 👥 **Candidate Tracking** - Review applications and track candidates
- 🤖 **AI Assessments** - Automated technical and personality tests
- 📊 **Analytics Dashboard** - Data-driven hiring insights
- 📅 **Interview Scheduling** - Manage interview schedules
- 🎯 **AI-Ranked Candidates** - Get AI-powered candidate rankings

### For Candidates
- 💼 **Job Discovery** - Browse and apply to matching jobs
- 📝 **Resume Builder** - Create and manage your CV
- 🎓 **Skills Assessment** - Take technical and personality tests
- 🎥 **Video Interviews** - Complete AI-powered video interviews
- 📈 **Application Tracking** - Monitor application status
- 💬 **Feedback** - Receive detailed interview feedback

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Docker Desktop** (for local Supabase)
- **Git**

### Option 1: Automated Setup (Windows)

Simply run the setup script:

```bash
setup.bat
```

This will:
1. ✅ Check Docker is running
2. ✅ Create environment variables
3. ✅ Install dependencies
4. ✅ Start Supabase locally

### Option 2: Manual Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd interviewden
   ```

2. **Start Docker Desktop**
   - Make sure Docker Desktop is running

3. **Create `.env.local` file**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start Supabase**
   ```bash
   npx supabase start
   ```

6. **Restore database (if you have a backup)**
   - See [DATABASE_RESTORE.md](./DATABASE_RESTORE.md) for detailed instructions

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   - Navigate to http://localhost:3000

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Supabase
npx supabase start   # Start local Supabase
npx supabase stop    # Stop local Supabase
npx supabase status  # Check Supabase status
npx supabase db reset # Reset database
```

## 🌐 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Application** | http://localhost:3000 | Main app |
| **Supabase Studio** | http://127.0.0.1:54323 | Database UI |
| **Email Testing** | http://127.0.0.1:54324 | Inbucket email viewer |
| **API Gateway** | http://127.0.0.1:54321 | Supabase API |

## 📁 Project Structure

```
interviewden/
├── app/
│   ├── (candidate)/          # Candidate portal routes
│   │   └── candidate/
│   │       ├── dashboard/
│   │       ├── jobs/
│   │       ├── screening/
│   │       └── ...
│   ├── (company)/            # Company portal routes
│   │   └── company/
│   │       ├── dashboard/
│   │       ├── jobs/
│   │       ├── candidates/
│   │       └── ...
│   ├── login/                # Authentication
│   ├── signup/
│   ├── page.tsx              # Landing page
│   └── layout.tsx
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── header.tsx
│   └── logo.tsx
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── utils.ts
├── supabase/
│   └── config.toml           # Supabase configuration
├── middleware.ts             # Route protection
└── ...
```

## 🔐 Authentication & Routing

The app uses role-based access control:

- **Public Routes**: `/`, `/login`, `/signup`
- **Candidate Routes**: `/candidate/*`
- **Company Routes**: `/company/*`

Middleware automatically:
- ✅ Redirects unauthenticated users to landing page
- ✅ Redirects authenticated users to their dashboard
- ✅ Prevents cross-portal access (candidates can't access company routes)

## 🗄️ Database

The application uses Supabase (PostgreSQL) with the following main tables:

- `profiles` - User profiles (both candidates and companies)
- `companies` - Company information
- `jobs` - Job postings
- `applications` - Job applications
- `interviews` - Interview schedules
- `assessments` - Test and assessment data

### Database Backup & Restore

If you have a database backup, see [DATABASE_RESTORE.md](./DATABASE_RESTORE.md) for restoration instructions.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State**: React Context API

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup guide
- [DATABASE_RESTORE.md](./DATABASE_RESTORE.md) - Database restoration guide

## 🐛 Troubleshooting

### Docker not running
```
Error: The system cannot find the file specified
```
**Solution**: Start Docker Desktop and wait for it to fully initialize

### Port already in use
**Solution**: Change ports in `supabase/config.toml` or stop services using those ports

### Database connection failed
**Solution**: 
1. Check if Supabase is running: `npx supabase status`
2. Verify `.env.local` has correct values
3. Restart: `npx supabase stop` then `npx supabase start`

See [SETUP.md](./SETUP.md) for more troubleshooting tips.

## 🚀 Deployment

### Production Deployment

1. Create a Supabase project at https://supabase.com
2. Update environment variables with production credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Deploy to Vercel/Netlify:
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For help and support:
- Check the `/help` section in the app
- Review documentation files
- Visit [Supabase Docs](https://supabase.com/docs)
- Visit [Next.js Docs](https://nextjs.org/docs)
