// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  corsHeaders, 
  generateWithAzureOpenAI, 
  parseAIResponse 
} from "../_shared/azure-ai.ts";

/**
 * Interview Question Generation Edge Function
 * 
 * Microsoft Azure AI Services Used:
 * 1. Azure OpenAI Service - Generates tailored interview questions based on
 *    target role, user skills, and interview configuration
 * 
 * This function relies on Azure OpenAI for intelligent question generation.
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

    const { targetRoleId, interviewType, difficultyLevel, numberOfQuestions = 5 } = await req.json();

    // Get user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get target role and user skills
    const { data: roleData } = await supabaseClient
      .from("target_roles")
      .select("*, role_skills(skill:skills(name))")
      .eq("id", targetRoleId)
      .single();

    const { data: userSkills } = await supabaseClient
      .from("user_skills")
      .select("skill:skills(name), proficiency_level")
      .eq("user_id", user.id);

    const requiredSkills = roleData?.role_skills?.map((rs: any) => rs.skill.name) || [];
    const currentSkills = userSkills?.map((us: any) => us.skill.name) || [];

    console.log('Generating interview questions with Azure OpenAI Service...');

    // Generate interview questions with Azure OpenAI
    const systemPrompt = `You are an expert technical interviewer. Always respond with valid JSON only.`;
    
    const userPrompt = `Generate ${numberOfQuestions} interview questions for a candidate.

Target Role: ${roleData?.name}
Interview Type: ${interviewType}
Difficulty: ${difficultyLevel}
Required Skills: ${requiredSkills.join(", ")}
Candidate's Current Skills: ${currentSkills.join(", ")}

Generate questions in this JSON format:
{
  "questions": [
    {
      "questionText": "Describe a time when...",
      "questionType": "behavioral",
      "difficulty": "medium",
      "expectedPoints": [
        "Should mention STAR method",
        "Should show problem-solving skills"
      ],
      "evaluationCriteria": {
        "clarity": "Is the answer well-structured?",
        "technical": "Shows technical understanding?",
        "relevance": "Addresses the question?"
      }
    }
  ]
}

Guidelines:
- ${interviewType === 'technical' ? 'Focus on coding, algorithms, system design' : ''}
- ${interviewType === 'behavioral' ? 'Focus on STAR method, soft skills, past experiences' : ''}
- ${interviewType === 'mixed' ? 'Mix technical and behavioral questions' : ''}
- ${difficultyLevel === 'easy' ? 'Beginner-friendly questions' : ''}
- ${difficultyLevel === 'medium' ? 'Intermediate level questions' : ''}
- ${difficultyLevel === 'hard' ? 'Advanced, challenging questions' : ''}
- Make questions realistic and relevant to ${roleData?.name}
- Include specific technical concepts from required skills`;

    const aiResponse = await generateWithAzureOpenAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      { temperature: 0.7, maxTokens: 2000, responseFormat: 'json' }
    );

    console.log("Azure OpenAI response received");

    const questionsData = parseAIResponse(aiResponse);
    
    // Validate the parsed data
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      console.error("Invalid questions data structure:", questionsData);
      throw new Error("AI response missing 'questions' array. Response structure invalid.");
    }
    
    console.log(`Successfully generated ${questionsData.questions.length} questions with Azure OpenAI`);

    // Create interview session
    const { data: interview, error: interviewError } = await supabaseClient
      .from("mock_interviews")
      .insert({
        user_id: user.id,
        target_role_id: targetRoleId,
        interview_type: interviewType,
        difficulty_level: difficultyLevel,
        status: "in_progress",
      })
      .select()
      .single();

    if (interviewError) {
      throw interviewError;
    }

    // Save questions
    const questions = questionsData.questions.map((q: any, index: number) => ({
      interview_id: interview.id,
      question_text: q.questionText,
      question_type: q.questionType,
      difficulty: q.difficulty,
      expected_points: q.expectedPoints || [],
      question_order: index + 1,
    }));

    const { data: savedQuestions, error: questionsError } = await supabaseClient
      .from("interview_questions")
      .insert(questions)
      .select();

    if (questionsError) {
      throw questionsError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          interview,
          questions: savedQuestions,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating interview:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: error.stack 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
