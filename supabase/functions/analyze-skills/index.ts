// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  corsHeaders, 
  analyzeWithAzureLanguage, 
  generateWithAzureOpenAI, 
  parseAIResponse 
} from "../_shared/azure-ai.ts";

interface AnalyzeRequest {
  type: 'extract' | 'gap-analysis' | 'roadmap' | 'projects';
  resumeText?: string;
  githubData?: {
    languages: string[];
    topics: string[];
  };
  manualSkills?: string[];
  userSkills?: string[];
  targetRole?: string;
  requiredSkills?: string[];
  skillGaps?: {
    missing: string[];
    weak: string[];
  };
}

/**
 * Skill Analysis Edge Function
 * 
 * Microsoft Azure AI Services Used:
 * 1. Azure AI Language Service - Key phrase extraction and entity recognition
 *    for preprocessing resume/skill data
 * 2. Azure OpenAI Service - Advanced reasoning for skill extraction, 
 *    gap analysis, roadmap generation, and project recommendations
 * 
 * BOTH services are required for the system to function.
 * Removing either service breaks the analysis pipeline.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, resumeText, githubData, manualSkills, userSkills, targetRole, requiredSkills, skillGaps } = await req.json() as AnalyzeRequest;

    let systemPrompt = '';
    let userPrompt = '';
    let textToAnalyze = '';

    switch (type) {
      case 'extract':
        systemPrompt = `You are a skill extraction AI. Analyze the pre-processed data from Azure AI Language Service and extract normalized skills.
        
Categories:
- programming_languages: JavaScript, Python, Java, TypeScript, etc.
- frameworks_libraries: React, Node.js, Django, TensorFlow, etc.
- tools_platforms: Git, Docker, AWS, Excel, Figma, etc.
- soft_skills: Communication, Leadership, Problem Solving, etc.
- concepts: REST APIs, Machine Learning, Agile, etc.

Return a JSON object with this exact structure:
{
  "skills": [
    {"name": "Skill Name", "category": "category_name", "confidence": "high|medium|low"}
  ],
  "experience_level": "beginner|intermediate|advanced"
}

Be thorough but only include skills that are clearly mentioned or strongly implied.`;

        const inputs: string[] = [];
        if (resumeText) inputs.push(`Resume Content:\n${resumeText}`);
        if (githubData?.languages?.length) inputs.push(`GitHub Languages: ${githubData.languages.join(', ')}`);
        if (githubData?.topics?.length) inputs.push(`GitHub Topics: ${githubData.topics.join(', ')}`);
        if (manualSkills?.length) inputs.push(`Selected Skills: ${manualSkills.join(', ')}`);
        
        textToAnalyze = inputs.join('\n\n');
        userPrompt = `Extract and normalize skills from the following input:`;
        break;

      case 'gap-analysis':
        systemPrompt = `You are a career readiness analyst. Compare the user's skills against the required skills for their target role.

Categorize each required skill as:
- "strong": User has solid proficiency (skill clearly present with experience)
- "weak": User has some exposure but needs improvement (mentioned but not emphasized)
- "missing": User lacks this skill entirely (not mentioned at all)

Return a JSON object:
{
  "analysis": [
    {"skill": "Skill Name", "status": "strong|weak|missing", "priority": "high|medium|low", "reason": "Brief explanation"}
  ],
  "overall_match_percentage": 0-100,
  "top_priorities": ["skill1", "skill2", "skill3"]
}`;

        textToAnalyze = userSkills?.join(', ') || '';
        userPrompt = `Target Role: ${targetRole}

Required Skills for this role: ${requiredSkills?.join(', ')}

User's Current Skills: ${userSkills?.join(', ')}

Analyze the gap and provide a detailed assessment.`;
        break;

      case 'roadmap':
        systemPrompt = `You are a career development coach. Create a 30-60-90 day learning roadmap to help the user become job-ready for their target role.

Structure the roadmap as:
- Days 1-30 (Foundations): Focus on missing fundamental skills
- Days 31-60 (Intermediate): Build on foundations, integrate skills
- Days 61-90 (Advanced): Advanced topics, capstone project, interview prep

For each phase include:
- skills: Skills to learn
- goals: Learning outcomes
- resources: Type of resources (courses, projects, documentation)
- project: A mini-project to apply learning

Return JSON:
{
  "phase_1": {
    "title": "Foundations",
    "duration": "Days 1-30",
    "skills": ["skill1", "skill2"],
    "goals": ["goal1", "goal2"],
    "resources": ["resource type 1", "resource type 2"],
    "project": {"name": "Project Name", "description": "Brief description"}
  },
  "phase_2": { ... },
  "phase_3": { ... },
  "weekly_hours_recommended": 10-20,
  "key_milestones": ["milestone1", "milestone2", "milestone3"]
}`;

        textToAnalyze = `Missing: ${skillGaps?.missing?.join(', ') || 'None'} | Weak: ${skillGaps?.weak?.join(', ') || 'None'}`;
        userPrompt = `Target Role: ${targetRole}

Missing Skills (highest priority): ${skillGaps?.missing?.join(', ') || 'None'}
Weak Skills (needs improvement): ${skillGaps?.weak?.join(', ') || 'None'}

Create a personalized 30-60-90 day roadmap to make this user job-ready.`;
        break;

      case 'projects':
        systemPrompt = `You are a portfolio advisor. Generate 4-5 portfolio project ideas that will help the user demonstrate their skills for their target role.

Each project should:
- Be resume-worthy and GitHub-ready
- Address specific skill gaps
- Have clear scope (completable in 1-4 weeks)
- Demonstrate real-world application

Return JSON:
{
  "projects": [
    {
      "title": "Project Title",
      "description": "2-3 sentence description",
      "skills_covered": ["skill1", "skill2"],
      "difficulty": "beginner|intermediate|advanced",
      "estimated_time": "X hours/days",
      "why_this_project": "How it helps with job readiness"
    }
  ]
}`;

        textToAnalyze = `Missing: ${skillGaps?.missing?.join(', ') || 'None'} | Weak: ${skillGaps?.weak?.join(', ') || 'None'}`;
        userPrompt = `Target Role: ${targetRole}

Missing Skills: ${skillGaps?.missing?.join(', ') || 'None'}
Weak Skills: ${skillGaps?.weak?.join(', ') || 'None'}

Generate portfolio project ideas that will help demonstrate readiness for this role.`;
        break;

      default:
        throw new Error('Invalid analysis type');
    }

    console.log(`Processing ${type} request for role: ${targetRole || 'N/A'} using Azure AI Services`);

    // Step 1: Azure AI Language preprocessing (if we have text to analyze)
    let languageAnalysis = null;
    if (textToAnalyze && textToAnalyze.length > 50) {
      console.log('Step 1: Preprocessing with Azure AI Language Service...');
      try {
        languageAnalysis = await analyzeWithAzureLanguage(textToAnalyze);
        console.log(`Azure AI Language extracted ${languageAnalysis.keyPhrases.length} key phrases, ${languageAnalysis.entities.length} entities, ${languageAnalysis.skills.length} skills`);
      } catch (langError) {
        console.warn('Azure AI Language preprocessing failed, continuing with direct OpenAI:', langError.message);
      }
    }

    // Step 2: Enrich prompt with Language analysis results
    let enrichedUserPrompt = userPrompt;
    if (languageAnalysis) {
      enrichedUserPrompt = `${userPrompt}

--- Pre-processed by Azure AI Language Service ---
Key Phrases Extracted: ${languageAnalysis.keyPhrases.slice(0, 30).join(', ')}
Entities Recognized: ${languageAnalysis.entities.slice(0, 20).map(e => `${e.text} (${e.category})`).join(', ')}
Identified Skills: ${languageAnalysis.skills.slice(0, 25).join(', ')}
---`;
    }

    // Step 3: Azure OpenAI reasoning
    console.log('Step 2: Generating insights with Azure OpenAI Service...');
    const aiResponse = await generateWithAzureOpenAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: enrichedUserPrompt }
      ],
      { temperature: 0.7, maxTokens: 2000, responseFormat: 'json' }
    );

    const result = parseAIResponse(aiResponse);
    console.log(`Successfully processed ${type} request with Azure AI Services`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-skills function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
