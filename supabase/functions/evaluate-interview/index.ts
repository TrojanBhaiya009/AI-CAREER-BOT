// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  corsHeaders, 
  generateWithAzureOpenAI, 
  parseAIResponse 
} from "../_shared/azure-ai.ts";

/**
 * Interview Answer Evaluation Edge Function
 * 
 * Microsoft Azure AI Services Used:
 * 1. Azure OpenAI Service - Evaluates interview answers using advanced
 *    reasoning to provide scores, feedback, and improvement suggestions
 * 
 * This function relies on Azure OpenAI for intelligent evaluation.
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

    const { questionId, userAnswer, answerDuration } = await req.json();

    // Get user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get question details
    const { data: question } = await supabaseClient
      .from("interview_questions")
      .select("*, interview:mock_interviews(*)")
      .eq("id", questionId)
      .single();

    if (!question) {
      throw new Error("Question not found");
    }

    console.log('Evaluating interview answer with Azure OpenAI Service...');

    // Evaluate answer with Azure OpenAI
    const systemPrompt = `You are an expert interview evaluator. Always respond with valid JSON only.`;
    
    const userPrompt = `Evaluate this candidate's answer.

Question: ${question.question_text}
Question Type: ${question.question_type}
Expected Points: ${JSON.stringify(question.expected_points)}

Candidate's Answer:
${userAnswer}

Provide evaluation in this JSON format:
{
  "score": <number 0-100>,
  "feedback": "Detailed feedback on the answer...",
  "strengths": ["Strong point 1", "Strong point 2"],
  "improvements": ["Area to improve 1", "Area to improve 2"],
  "keyPointsCovered": ["Point 1", "Point 2"],
  "missedPoints": ["Missed point 1"],
  "confidence": <number 0-100>,
  "clarity": <number 0-100>,
  "relevance": <number 0-100>
}

Evaluate based on:
1. Technical accuracy (if technical question)
2. Structure and clarity (STAR method for behavioral)
3. Relevance to the question
4. Depth of answer
5. Communication skills`;

    const aiResponse = await generateWithAzureOpenAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      { temperature: 0.3, maxTokens: 1500, responseFormat: 'json' }
    );

    const evaluation = parseAIResponse(aiResponse);
    console.log('Azure OpenAI evaluation completed');

    // Update question with answer and evaluation
    const { error: updateError } = await supabaseClient
      .from("interview_questions")
      .update({
        user_answer: userAnswer,
        answer_duration_seconds: answerDuration,
        score: evaluation.score || 0,
        feedback: evaluation.feedback || "",
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        answered_at: new Date().toISOString(),
      })
      .eq("id", questionId);

    if (updateError) {
      throw updateError;
    }

    // Check if all questions are answered
    const { data: allQuestions } = await supabaseClient
      .from("interview_questions")
      .select("id, user_answer, score")
      .eq("interview_id", question.interview_id);

    const allAnswered = allQuestions?.every((q: any) => q.user_answer !== null);

    if (allAnswered) {
      // Calculate overall score
      const avgScore =
        allQuestions.reduce((sum: number, q: any) => sum + (q.score || 0), 0) /
        allQuestions.length;

      // Update interview status
      await supabaseClient
        .from("mock_interviews")
        .update({
          status: "completed",
          overall_score: avgScore,
          completed_at: new Date().toISOString(),
        })
        .eq("id", question.interview_id);

      // Award achievement
      const xpAmount = avgScore >= 80 ? 100 : 75;
      await supabaseClient.from("achievements").insert({
        user_id: user.id,
        badge_type: "interview_ace",
        badge_name: avgScore >= 80 ? "Interview Master" : "Interview Warrior",
        badge_description: `Completed mock interview with ${avgScore.toFixed(0)}% score`,
        badge_icon: avgScore >= 80 ? "🏆" : "🎯",
        xp_earned: xpAmount,
      });

      // Update progress
      await supabaseClient.rpc("increment_user_xp", {
        p_user_id: user.id,
        p_xp_amount: xpAmount,
      });
      
      await supabaseClient
        .from("user_progress")
        .update({
          interviews_completed: question.interview.interviews_completed + 1,
        })
        .eq("user_id", user.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...evaluation,
          allQuestionsAnswered: allAnswered,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
