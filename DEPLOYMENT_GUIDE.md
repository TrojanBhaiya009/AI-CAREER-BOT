# Edge Functions Deployment Guide

Since the Supabase Management API requires additional authentication, please deploy the functions manually through the dashboard.

## Quick Deployment Steps

### 1. Deploy `github-profile` Function

1. Go to: https://supabase.com/dashboard/project/cartaqqegfrqfqeoirhz/functions
2. Click **"Create a new function"** or **"Deploy new version"**
3. Name: `github-profile`
4. Copy **ALL** the code below:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();

    if (!username) {
      throw new Error('GitHub username is required');
    }

    // Clean username (remove @ or URL prefix if provided)
    const cleanUsername = username
      .replace('https://github.com/', '')
      .replace('http://github.com/', '')
      .replace('@', '')
      .trim();

    console.log(`Fetching GitHub data for: ${cleanUsername}`);

    // Get GitHub token if available (optional, for higher rate limits)
    const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
    
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AI-Career-Copilot',
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    // Fetch user repos (public API)
    const reposResponse = await fetch(
      `https://api.github.com/users/${cleanUsername}/repos?per_page=100&sort=updated`,
      { headers }
    );

    if (!reposResponse.ok) {
      const errorBody = await reposResponse.text();
      console.error(`GitHub API error (${reposResponse.status}):`, errorBody);
      
      if (reposResponse.status === 404) {
        throw new Error('GitHub user not found. Please check the username.');
      }
      if (reposResponse.status === 403) {
        throw new Error('GitHub API rate limit reached. Please try again later.');
      }
      throw new Error(`Failed to fetch GitHub data: ${reposResponse.statusText}`);
    }

    const repos = await reposResponse.json();

    // Extract languages from repos
    const languageCount: Record<string, number> = {};
    const allTopics: Set<string> = new Set();

    for (const repo of repos) {
      // Count languages
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }

      // Collect topics
      if (repo.topics && Array.isArray(repo.topics)) {
        repo.topics.forEach((topic: string) => allTopics.add(topic));
      }
    }

    // Sort languages by frequency
    const languages = Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    const topics = Array.from(allTopics);

    console.log(`Found ${languages.length} languages and ${topics.length} topics for ${cleanUsername}`);

    return new Response(JSON.stringify({
      username: cleanUsername,
      languages,
      topics,
      repoCount: repos.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching GitHub profile:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to fetch GitHub data' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

5. Click **"Deploy"**

---

### 2. Set Environment Secrets

Go to: https://supabase.com/dashboard/project/cartaqqegfrqfqeoirhz/settings/functions

Add these secrets:

| Secret Name | Secret Value |
|------------|--------------|
| `GITHUB_TOKEN` | `your_github_personal_access_token` |
| `GROQ_API_KEY` | `your_groq_api_key` |

---

### 3. Deploy `analyze-skills` Function

The `analyze-skills` function code is available in `supabase/functions/analyze-skills/index.ts` (already updated to use Groq API).

1. Go to: https://supabase.com/dashboard/project/cartaqqegfrqfqeoirhz/functions
2. Click **"Create a new function"**
3. Name: `analyze-skills`
4. Copy the entire content from: `supabase/functions/analyze-skills/index.ts`
5. Click **"Deploy"**

---

## Testing

Once deployed, test your application:

1. Go to: http://localhost:8080
2. Sign up / Login
3. Complete onboarding
4. Go to Skills page
5. Try:
   - Uploading a resume file
   - Pasting resume text
   - Fetching GitHub profile
   - Selecting manual skills
6. Click "Analyze My Skills"

## Troubleshooting

- **GitHub fetch fails**: Verify `GITHUB_TOKEN` secret is set correctly
- **Skill analysis fails**: Check `GROQ_API_KEY` is valid
- **View function logs**: https://supabase.com/dashboard/project/cartaqqegfrqfqeoirhz/logs/edge-functions

---

## Done! 🎉

Your application should now be fully functional with:
- ✅ Resume file upload
- ✅ GitHub profile integration  
- ✅ AI-powered skill extraction (Groq)
- ✅ Gap analysis
- ✅ Personalized roadmaps
- ✅ Project recommendations
