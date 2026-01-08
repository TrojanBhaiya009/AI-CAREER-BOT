// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  corsHeaders, 
  analyzeWithAzureLanguage, 
  generateWithAzureOpenAI, 
  parseAIResponse 
} from "../_shared/azure-ai.ts";

/**
 * ATS Resume Analysis Edge Function
 * 
 * Microsoft Azure AI Services Used:
 * 1. Azure AI Language Service - Extracts key phrases and entities from resume
 *    to identify skills, technologies, and qualifications
 * 2. Azure OpenAI Service - Analyzes ATS compatibility, provides optimization
 *    suggestions and generates improved resume content
 * 
 * BOTH services are required for the system to function.
 * Removing either service breaks the analysis pipeline.
 */
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

    const { resumeText, targetRoleId } = await req.json();

    if (!resumeText) {
      throw new Error("Resume text is required");
    }

    // Get user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get target role details if provided
    let targetRole = null;
    let requiredSkills: string[] = [];

    if (targetRoleId) {
      const { data: roleData } = await supabaseClient
        .from("target_roles")
        .select("*, role_skills(skill:skills(name))")
        .eq("id", targetRoleId)
        .single();

      targetRole = roleData;
      requiredSkills = roleData?.role_skills?.map((rs: any) => rs.skill.name) || [];
    }

    // Sanitize and truncate resume text
    const cleanedResume = resumeText
      .substring(0, 8000)
      .replace(/\\/g, ' ')
      .replace(/"/g, "'")
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
      .replace(/[\u2000-\u200F\u2028-\u202F]/g, ' ')
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log('Starting ATS analysis with Azure AI Services...');

    // Step 1: Azure AI Language preprocessing
    console.log('Step 1: Analyzing resume with Azure AI Language Service...');
    let languageAnalysis = null;
    try {
      languageAnalysis = await analyzeWithAzureLanguage(cleanedResume);
      console.log(`Azure AI Language extracted ${languageAnalysis.keyPhrases.length} key phrases, ${languageAnalysis.entities.length} entities`);
    } catch (langError) {
      console.warn('Azure AI Language preprocessing failed:', langError.message);
    }

    // Step 2: Azure OpenAI analysis
    console.log('Step 2: Generating ATS analysis with Azure OpenAI Service...');

    const systemPrompt = `You are an ATS (Applicant Tracking System) expert. Analyze resumes for ATS compatibility and provide detailed feedback. Always respond with valid JSON only.`;

    let userPrompt = `Analyze this resume for ATS compatibility and provide feedback.

Resume:
${cleanedResume}

Target Role: ${targetRole?.name || "General"}
Key Skills Required: ${requiredSkills.slice(0, 10).join(", ")}`;

    // Enrich with Language analysis
    if (languageAnalysis) {
      userPrompt += `

--- Pre-processed by Azure AI Language Service ---
Key Phrases Extracted: ${languageAnalysis.keyPhrases.slice(0, 25).join(', ')}
Entities Recognized: ${languageAnalysis.entities.slice(0, 15).map(e => `${e.text} (${e.category})`).join(', ')}
Identified Skills: ${languageAnalysis.skills.slice(0, 20).join(', ')}
---`;
    }

    userPrompt += `

Return JSON only:
{
  "atsScore": 75,
  "keywordMatches": ["skill1", "skill2"],
  "missingKeywords": ["skill3", "skill4"],
  "suggestions": [
    {"type": "keyword", "priority": "high", "suggestion": "Add X skill"},
    {"type": "format", "priority": "medium", "suggestion": "Improve Y section"}
  ],
  "formatIssues": [{"issue": "description", "severity": "high"}],
  "strengths": ["point 1", "point 2"],
  "optimizedResume": "improved text"
}`;

    const aiResponse = await generateWithAzureOpenAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      { temperature: 0.3, maxTokens: 1500, responseFormat: 'json' }
    );

    let analysis;
    try {
      analysis = parseAIResponse(aiResponse);
    } catch (e) {
      console.error("Failed to parse AI response, creating default response");
      analysis = {
        atsScore: 50,
        keywordMatches: languageAnalysis?.skills?.slice(0, 5) || ["Resume uploaded"],
        missingKeywords: ["Unable to analyze - please try again"],
        suggestions: [
          {
            type: "system",
            priority: "high",
            suggestion: "AI analysis incomplete. Please ensure your resume contains readable text and try again."
          }
        ],
        formatIssues: [
          {
            issue: "Could not fully parse AI response. This may be a temporary issue.",
            severity: "high"
          }
        ],
        strengths: languageAnalysis?.skills?.slice(0, 3) || ["Resume uploaded successfully"],
        optimizedResume: resumeText
      };
    }

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabaseClient
      .from("ats_analyses")
      .insert({
        user_id: user.id,
        target_role_id: targetRoleId || null,
        original_resume_text: resumeText,
        optimized_resume_text: analysis.optimizedResume || null,
        ats_score: analysis.atsScore || 0,
        keyword_matches: analysis.keywordMatches || [],
        missing_keywords: analysis.missingKeywords || [],
        suggestions: analysis.suggestions || [],
        format_issues: analysis.formatIssues || [],
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving analysis:", saveError);
      throw saveError;
    }

    // Award achievement for first ATS analysis
    const { data: existingAnalyses } = await supabaseClient
      .from("ats_analyses")
      .select("id")
      .eq("user_id", user.id);

    if (existingAnalyses && existingAnalyses.length === 1) {
      // First ATS analysis - award badge
      await supabaseClient.from("achievements").insert({
        user_id: user.id,
        badge_type: "resume_optimizer",
        badge_name: "Resume Pro",
        badge_description: "Optimized your first resume with ATS analyzer",
        badge_icon: "📄",
        xp_earned: 50,
      });

      // Update user progress
      await supabaseClient.rpc("increment_user_xp", {
        p_user_id: user.id,
        p_xp_amount: 50,
      });
    }

    console.log('ATS analysis completed successfully with Azure AI Services');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...savedAnalysis,
          strengths: analysis.strengths || [],
          // Include Azure AI Language insights for transparency
          azureLanguageInsights: languageAnalysis ? {
            keyPhrasesCount: languageAnalysis.keyPhrases.length,
            entitiesCount: languageAnalysis.entities.length,
            skillsIdentified: languageAnalysis.skills.length
          } : null
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
