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
    console.log(`GitHub token ${GITHUB_TOKEN ? 'is' : 'is NOT'} configured`);
    
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AI-Career-Copilot',
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
      console.log('Using authenticated GitHub API request');
    } else {
      console.log('Using unauthenticated GitHub API request (rate limits apply)');
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
      status: 200,
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
