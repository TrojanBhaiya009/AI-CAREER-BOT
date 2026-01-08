# Deployment Instructions

Since the Supabase CLI is not available, follow these steps to deploy your Edge Functions:

## Option 1: Using Supabase Dashboard (Recommended)

### 1. Deploy `github-profile` Function

1. Go to: https://supabase.com/dashboard/project/cartaqqegfrqfqeoirhz/functions
2. Click **"Create a new function"**
3. Name: `github-profile`
4. Copy the code from `supabase/functions/github-profile/index.ts` and paste it
5. Click **"Deploy"**

### 2. Deploy `analyze-skills` Function

1. Go to: https://supabase.com/dashboard/project/cartaqqegfrqfqeoirhz/functions
2. Click **"Create a new function"**
3. Name: `analyze-skills`
4. Copy the code from `supabase/functions/analyze-skills/index.ts` and paste it
5. Click **"Deploy"**

### 3. Set Environment Variables

Go to: https://supabase.com/dashboard/project/cartaqqegfrqfqeoirhz/settings/functions

Add these secrets:
- `GITHUB_TOKEN` = `your_github_personal_access_token`
- `GROQ_API_KEY` = (Get your API key from GROQ Console)

## Option 2: Using Supabase CLI with Scoop (Windows)

1. Install Scoop (if not installed):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

2. Install Supabase CLI:
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

3. Login to Supabase:
```powershell
supabase login
```

4. Link your project:
```powershell
supabase link --project-ref cartaqqegfrqfqeoirhz
```

5. Deploy functions:
```powershell
supabase functions deploy github-profile
supabase functions deploy analyze-skills
```

6. Set secrets:
```powershell
supabase secrets set GITHUB_TOKEN=your_github_personal_access_token
supabase secrets set GROQ_API_KEY=your_groq_api_key
```

## What Each Function Does

### `github-profile`
- Fetches GitHub user's public repositories
- Extracts programming languages and topics
- Returns structured data for skill analysis

### `analyze-skills`
- Extracts skills from resume text, GitHub data, and manual selections
- Performs gap analysis comparing user skills to target role requirements
- Generates personalized 30-60-90 day learning roadmaps
- Creates portfolio project recommendations

## Testing After Deployment

1. Start your dev server: `npm run dev`
2. Go to: http://localhost:8080
3. Sign up/Login
4. Complete onboarding
5. Test resume upload and GitHub profile fetch on the Skills page

## Troubleshooting

- If GitHub fetch fails: Check that `GITHUB_TOKEN` secret is set correctly
- If skill analysis fails: Verify `GROQ_API_KEY` is valid
- Check function logs: https://supabase.com/dashboard/project/cartaqqegfrqfqeoirhz/logs/edge-functions
