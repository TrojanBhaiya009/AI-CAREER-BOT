# Deployment Guide - AI Career Copilot

## Prerequisites

Before deploying, ensure you have:

1. A Supabase account and project
2. GROQ API key (for AI features)
3. Node.js 18+ or Bun installed
4. Git installed

## Step 1: Set Up Supabase

### Create a New Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Enter project details:
   - Name: `ai-career-copilot`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)

### Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push database migrations
supabase db push
```

Your database is now set up with:
- All tables (profiles, target_roles, skills, user_skills, roadmaps, project_recommendations)
- Row Level Security policies
- Seed data (23 roles, 85+ skills)

### Deploy Edge Functions

```bash
# Deploy analyze-skills function
supabase functions deploy analyze-skills

# Deploy github-profile function
supabase functions deploy github-profile

# Set environment secrets for edge functions
supabase secrets set GROQ_API_KEY=your_groq_api_key
supabase secrets set GITHUB_TOKEN=your_github_token
```

## Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=your-groq-api-key
GITHUB_TOKEN=your-github-token  # Optional
```

Get your Supabase credentials from:
- Project Settings → API → Project URL
- Project Settings → API → `anon` `public` key

## Step 3: Build and Deploy Frontend

### Option A: Deploy with Netlify

```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod

# Or link to existing site
netlify link
netlify deploy --prod
```

Add environment variables in Netlify:
1. Site settings → Build & deploy → Environment
2. Add all variables from `.env`

### Option C: Deploy with Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Add environment variables:
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add GROQ_API_KEY
```

### Option D: Deploy with Custom Server

```bash
# Build the project
npm run build

# The build output is in the `dist` folder
# Serve it with any static file server

# Example with nginx
sudo cp -r dist/* /var/www/html/

# Example with serve
npm install -g serve
serve -s dist -p 3000
```

## Step 4: Verify Deployment

1. **Test Authentication:**
   - Sign up with a new account
   - Verify email confirmation (if enabled)
   - Sign in

2. **Test Onboarding:**
   - Complete all 4 steps
   - Verify profile is saved

3. **Test Skill Input:**
   - Try pasting resume text
   - Try GitHub integration
   - Try manual skill selection

4. **Test AI Features:**
   - Verify skill extraction works
   - Check gap analysis generates
   - Confirm roadmap is created
   - Verify projects are generated

## Step 5: Configure Authentication (Optional)

### Email Settings

In Supabase Dashboard:
1. Go to Authentication → Email Templates
2. Customize confirmation, reset password emails
3. Set your app URL as the redirect URL

### Enable OAuth Providers (Optional)

1. Go to Authentication → Providers
2. Enable Google, GitHub, etc.
3. Add OAuth credentials
4. Update redirect URLs

## Step 6: Monitoring and Maintenance

### Set Up Monitoring

1. **Supabase Dashboard:**
   - Monitor database usage
   - Check API requests
   - View edge function logs

2. **Error Tracking:**
   - Integrate Sentry or similar
   - Monitor client-side errors
   - Track edge function errors

### Database Backups

Supabase automatically backs up your database daily. For additional backups:

```bash
# Manual backup
supabase db dump > backup.sql

# Restore from backup
psql -h your-db-host -U postgres -d postgres < backup.sql
```

## Troubleshooting

### Issue: "Invalid API key"
- Verify your Supabase URL and anon key in `.env`
- Check that environment variables are properly loaded
- Ensure edge functions have secrets set

### Issue: "Skill extraction not working"
- Verify GROQ_API_KEY is set in edge function secrets
- Check edge function logs: `supabase functions logs analyze-skills`
- Test the edge function directly in Supabase dashboard

### Issue: "GitHub integration failing"
- Check GITHUB_TOKEN is valid
- Verify username is correct
- Check rate limits (60/hour without token, 5000/hour with token)

### Issue: "Database errors"
- Verify migrations ran successfully
- Check RLS policies are enabled
- Ensure user has proper permissions

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Environment variables not committed to git
- [ ] ANON key is public, SERVICE key is secret
- [ ] CORS configured properly in Supabase
- [ ] Rate limiting configured on edge functions
- [ ] Input validation on all user inputs
- [ ] SQL injection protection (using parameterized queries)

## Performance Optimization

1. **Database Indexes:**
   - Already created in migrations
   - Monitor slow queries in Supabase dashboard

2. **Caching:**
   - React Query automatically caches API responses
   - Configure staleTime for optimal performance

3. **CDN:**
   - Static assets served via CDN (Netlify/Vercel handle this)
   - Consider Cloudflare for additional caching

4. **Edge Functions:**
   - Keep functions small and focused
   - Use connection pooling for database queries
   - Monitor execution time and optimize as needed

## Scaling Considerations

- **Database:** Supabase handles scaling automatically
- **Edge Functions:** Auto-scale based on requests
- **Frontend:** Static files scale infinitely on CDN
- **Rate Limits:** Consider implementing user-based rate limiting

## Cost Estimation

### Supabase Free Tier Includes:
- 500MB database
- 2GB file storage
- 2 million edge function invocations/month
- Unlimited API requests

### GROQ AI:
- Free tier available
- Check pricing at groq.com
- Typically per-request billing

### Hosting (Netlify/Vercel Free Tier):
- 100GB bandwidth/month
- Unlimited sites
- Automatic HTTPS

## Support

- Supabase Docs: https://supabase.com/docs
- GROQ Docs: https://console.groq.com/docs
- Project Issues: [GitHub Issues Link]

---

**Congratulations!** 🎉 Your AI Career Copilot is now deployed and ready to help users achieve their career goals!
