# 🚀 Quick Start Guide - AI Career Copilot

Get up and running in 5 minutes!

## ⚡ Prerequisites

- Node.js 18+ or Bun installed
- Supabase account ([sign up here](https://supabase.com))
- Code editor (VS Code recommended)

## 📦 Step 1: Install Dependencies

```bash
# Using npm
npm install

# OR using bun (faster)
bun install
```

## 🔧 Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in details and wait for setup to complete

### Get Your Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the **Project URL**
3. Copy the **anon public** key

### Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations (this creates all tables and seed data)
supabase db push
```

✅ Your database is now set up with:
- All 6 tables
- RLS security policies
- 23 target roles
- 85+ skills

## 🔐 Step 3: Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🎯 Step 4: Deploy Edge Functions (Optional for AI features)

```bash
# Deploy the AI processing function
supabase functions deploy analyze-skills

# Deploy the GitHub integration function
supabase functions deploy github-profile

# Set your AI API key (get from GROQ Console)
supabase secrets set GROQ_API_KEY=your-api-key
```

## ▶️ Step 5: Start Development Server

```bash
# Using npm
npm run dev

# OR using bun
bun run dev
```

Visit **http://localhost:5173** 🎉

## ✅ Test the Application

### 1. Create an Account
- Click "Get Started Free"
- Sign up with email and password
- You'll be redirected to onboarding

### 2. Complete Onboarding
- Enter your name
- Select education level
- Choose career goal (internship or full-time)
- Pick a target role (e.g., "Frontend Developer")

### 3. Input Your Skills
- **Option A:** Paste your resume text
- **Option B:** Enter GitHub username
- **Option C:** Select skills manually

### 4. View Your Results
- See your skill match percentage
- Review your 30-60-90 day roadmap
- Explore portfolio project ideas

## 🎨 What You'll See

### Landing Page
Modern hero section with feature highlights

### Auth Page
Clean split-screen design for login/signup

### Onboarding
4-step wizard with progress bar

### Skill Input
Three tabs: Resume, GitHub, Manual selection

### Dashboard
- Skill match overview
- Your skills breakdown
- Target role info
- 30-60-90 day roadmap
- Portfolio project cards

## 🐛 Troubleshooting

### "Invalid API key" error
✅ Check your `.env` file has correct Supabase credentials
✅ Make sure you're using `VITE_` prefix for client-side variables

### Database connection errors
✅ Verify migrations ran successfully: `supabase db push`
✅ Check your project is linked: `supabase link --project-ref YOUR_REF`

### AI features not working
✅ Verify edge functions are deployed: `supabase functions list`
✅ Check secrets are set: `supabase secrets list`
✅ View function logs: `supabase functions logs analyze-skills`

### Styles not loading
✅ Clear cache and restart dev server
✅ Verify Tailwind config is correct

## 📚 Next Steps

Once everything is working:

1. **Read the docs:**
   - [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Full feature details
   - [API.md](./API.md) - API documentation
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment

2. **Customize the app:**
   - Add more target roles
   - Adjust skill categories
   - Customize the UI theme

3. **Deploy to production:**
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Deploy to Netlify or Vercel

## 🆘 Need Help?

- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for development guide
- Review [API.md](./API.md) for API reference
- See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for overview

## 🎉 You're All Set!

Your AI Career Copilot is ready to help users:
- ✅ Analyze their skills
- ✅ Identify gaps for their target role
- ✅ Get personalized learning roadmaps
- ✅ Build portfolio projects

Happy coding! 🚀

---

**Estimated setup time:** 5-10 minutes
**Difficulty:** Beginner-friendly
**Tech stack:** React + TypeScript + Supabase + AI
