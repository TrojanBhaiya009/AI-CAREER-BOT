// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  corsHeaders, 
  generateWithAzureOpenAI, 
  parseAIResponse 
} from "../_shared/azure-ai.ts";

/**
 * Job Matching Edge Function
 * 
 * Microsoft Azure AI Services Used:
 * 1. Azure OpenAI Service - Generates AI-matched job recommendations when
 *    real job APIs don't return enough results, ensuring intelligent matching
 *    based on user skills and target role
 * 
 * This function uses Azure OpenAI for AI-powered job generation.
 */

// Helper function to strip HTML tags and clean text
function stripHtml(html: string): string {
  if (!html) return "";
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, " ");
  
  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"');
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, " ").trim();
  
  return text;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user profile and skills
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*, target_role:target_roles(*)")
      .eq("user_id", user.id)
      .single();

    const { data: userSkills } = await supabaseClient
      .from("user_skills")
      .select("skill:skills(name), proficiency_level")
      .eq("user_id", user.id);

    const skillNames = userSkills?.map((us: any) => us.skill.name) || [];
    const targetRole = profile?.target_role?.name || "Software Developer";

    // Fetch jobs from multiple sources
    const jobs: any[] = [];

    console.log(`Fetching jobs for role: ${targetRole}, skills: ${skillNames.join(", ")}`);

    // 1. Remotive API - Real remote jobs
    try {
      console.log("Fetching from Remotive API...");
      const remotiveResponse = await fetch(
        `https://remotive.com/api/remote-jobs?category=software-dev&limit=30`
      );
      
      if (remotiveResponse.ok) {
        const remotiveData = await remotiveResponse.json();
        
        for (const job of remotiveData.jobs || []) {
          jobs.push({
            title: job.title,
            company: job.company_name,
            location: "Remote",
            jobType: job.job_type || "full-time",
            salary: job.salary || "Competitive",
            url: job.url,
            description: stripHtml(job.description || "").substring(0, 500),
            source: "remotive",
            tags: job.tags || [],
            publishedAt: job.publication_date,
          });
        }
        console.log(`Fetched ${remotiveData.jobs?.length || 0} jobs from Remotive`);
      }
    } catch (e) {
      console.log("Remotive API error:", e.message);
    }

    // 2. Adzuna API - Real job listings (free tier: 1000 calls/month)
    const adzunaAppId = Deno.env.get("ADZUNA_APP_ID");
    const adzunaApiKey = Deno.env.get("ADZUNA_API_KEY");
    
    if (adzunaAppId && adzunaApiKey) {
      try {
        console.log("Fetching from Adzuna API...");
        const country = "us";
        const adzunaQuery = encodeURIComponent(targetRole);
        const adzunaResponse = await fetch(
          `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${adzunaAppId}&app_key=${adzunaApiKey}&results_per_page=20&what=${adzunaQuery}&content-type=application/json`
        );
        
        if (adzunaResponse.ok) {
          const adzunaData = await adzunaResponse.json();
          
          for (const job of adzunaData.results || []) {
            jobs.push({
              title: job.title,
              company: job.company?.display_name || "Company",
              location: job.location?.display_name || "Remote",
              jobType: job.contract_type || "full-time",
              salary: job.salary_min && job.salary_max 
                ? `$${Math.round(job.salary_min)}-$${Math.round(job.salary_max)}` 
                : "Competitive",
              url: job.redirect_url,
              description: stripHtml(job.description || "").substring(0, 500),
              source: "adzuna",
              tags: job.category?.label ? [job.category.label] : [],
              publishedAt: job.created,
            });
          }
          console.log(`Fetched ${adzunaData.results?.length || 0} jobs from Adzuna`);
        }
      } catch (e) {
        console.log("Adzuna API error:", e.message);
      }
    }

    // 3. The Muse API - Real job listings
    try {
      console.log("Fetching from The Muse API...");
      const museResponse = await fetch(
        `https://www.themuse.com/api/public/jobs?category=Engineering&page=0&descending=true&api_key=public`
      );
      
      if (museResponse.ok) {
        const museData = await museResponse.json();
        
        for (const job of museData.results?.slice(0, 15) || []) {
          jobs.push({
            title: job.name,
            company: job.company?.name || "Company",
            location: job.locations?.map((l: any) => l.name).join(", ") || "Remote",
            jobType: job.type || "full-time",
            salary: "Competitive",
            url: job.refs?.landing_page || `https://www.themuse.com/jobs/${job.id}`,
            description: stripHtml(job.contents || "").substring(0, 500),
            source: "themuse",
            tags: job.categories?.map((c: any) => c.name) || [],
            publishedAt: job.publication_date,
          });
        }
        console.log(`Fetched ${museData.results?.length || 0} jobs from The Muse`);
      }
    } catch (e) {
      console.log("The Muse API error:", e.message);
    }

    // 4. JSearch API (via RapidAPI) - Aggregates from Indeed, LinkedIn, Glassdoor
    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
    
    if (rapidApiKey) {
      try {
        console.log("Fetching from JSearch API...");
        const jsearchQuery = encodeURIComponent(targetRole);
        const jsearchResponse = await fetch(
          `https://jsearch.p.rapidapi.com/search?query=${jsearchQuery}&page=1&num_pages=1`,
          {
            headers: {
              "X-RapidAPI-Key": rapidApiKey,
              "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
            }
          }
        );
        
        if (jsearchResponse.ok) {
          const jsearchData = await jsearchResponse.json();
          
          for (const job of jsearchData.data?.slice(0, 20) || []) {
            jobs.push({
              title: job.job_title,
              company: job.employer_name,
              location: job.job_city && job.job_state 
                ? `${job.job_city}, ${job.job_state}` 
                : job.job_country || "Remote",
              jobType: job.job_employment_type?.toLowerCase() || "full-time",
              salary: job.job_salary || "Competitive",
              url: job.job_apply_link || job.job_google_link,
              description: stripHtml(job.job_description || "").substring(0, 500),
              source: "jsearch",
              tags: job.job_required_skills || [],
              publishedAt: job.job_posted_at_datetime_utc,
            });
          }
          console.log(`Fetched ${jsearchData.data?.length || 0} jobs from JSearch`);
        }
      } catch (e) {
        console.log("JSearch API error:", e.message);
      }
    }

    // 5. Generate additional AI-matched jobs if we don't have enough
    if (jobs.length < 15) {
      console.log(`Only ${jobs.length} jobs found, generating AI jobs with Azure OpenAI...`);
      
      const systemPrompt = `You are a job board expert. Always respond with valid JSON only.`;
      
      const userPrompt = `Generate ${20 - jobs.length} realistic job listings for a candidate with these skills: ${skillNames.join(", ")}
Target Role: ${targetRole}

Return JSON array:
[
  {
    "title": "Senior Frontend Developer",
    "company": "TechCorp Inc",
    "location": "Remote / San Francisco",
    "jobType": "full-time",
    "salary": "$120k - $160k",
    "description": "Brief job description...",
    "requiredSkills": ["React", "TypeScript", "Node.js"]
  }
]

Make jobs realistic and varied.`;

      try {
        const aiResponse = await generateWithAzureOpenAI(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          { temperature: 0.8, maxTokens: 2000, responseFormat: 'json' }
        );

        let aiJobs: any[] = [];
        try {
          const parsed = parseAIResponse(aiResponse);
          aiJobs = Array.isArray(parsed) ? parsed : parsed.jobs || [];
        } catch (e) {
          console.log("Failed to parse AI jobs:", e.message);
        }

        // Add AI-generated jobs
        for (const job of aiJobs) {
          jobs.push({
            title: job.title,
            company: job.company,
            location: job.location,
            jobType: job.jobType,
            salary: job.salary,
            url: `https://example.com/jobs/${job.title.toLowerCase().replace(/\s+/g, "-")}`,
            description: job.description,
            tags: job.requiredSkills || [],
            source: "ai-generated",
            publishedAt: new Date().toISOString(),
          });
        }
        console.log(`Generated ${aiJobs.length} AI jobs with Azure OpenAI`);
      } catch (e) {
        console.log("Azure OpenAI job generation error:", e.message);
      }
    }

    console.log(`Total jobs collected: ${jobs.length}`);

    // Calculate match score for each job
    const matchedJobs = jobs.map((job) => {
      const jobSkills = job.tags || [];
      const matchingSkills = jobSkills.filter((skill: string) =>
        skillNames.some((userSkill: string) =>
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );

      const matchScore = jobSkills.length > 0
        ? Math.round((matchingSkills.length / jobSkills.length) * 100)
        : 65; // Default score if no skills listed

      const skillGaps = jobSkills.filter(
        (skill: string) =>
          !matchingSkills.some((ms: string) =>
            ms.toLowerCase() === skill.toLowerCase()
          )
      );

      return {
        ...job,
        matchScore,
        matchingSkills,
        skillGaps,
      };
    });

    // Sort by match score
    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`Match scores calculated. Top match: ${matchedJobs[0]?.matchScore}%`);

    // Save top matches to database
    const jobsToSave = matchedJobs.slice(0, 30).map((job) => ({
      user_id: user.id,
      job_title: job.title,
      company_name: job.company,
      location: job.location,
      job_type: job.jobType,
      salary_range: job.salary,
      job_url: job.url,
      job_description: job.description,
      required_skills: job.tags || [],
      match_score: job.matchScore,
      skill_gaps: job.skillGaps,
      source: job.source,
      is_saved: false,
      application_status: "not_applied",
    }));

    // Delete old job matches for this user
    await supabaseClient
      .from("job_matches")
      .delete()
      .eq("user_id", user.id);

    // Insert new matches
    const { data: savedJobs, error: saveError } = await supabaseClient
      .from("job_matches")
      .insert(jobsToSave)
      .select();

    if (saveError) {
      console.error("Error saving jobs:", saveError);
    }

    // Award achievement for first job search
    const { data: existingMatches } = await supabaseClient
      .from("achievements")
      .select("id")
      .eq("user_id", user.id)
      .eq("badge_type", "job_hunter");

    if (!existingMatches || existingMatches.length === 0) {
      await supabaseClient.from("achievements").insert({
        user_id: user.id,
        badge_type: "job_hunter",
        badge_name: "Job Hunter",
        badge_description: "Found your first job matches",
        badge_icon: "🔍",
        xp_earned: 50,
      });
      
      // Update user progress with XP
      await supabaseClient.rpc("increment_user_xp", {
        p_user_id: user.id,
        p_xp_amount: 50,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          jobs: savedJobs || matchedJobs,
          totalMatches: matchedJobs.length,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error matching jobs:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
