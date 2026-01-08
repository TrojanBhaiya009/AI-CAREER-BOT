import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mic, MicOff, Play, ArrowLeft, ArrowRight, CheckCircle, 
  Timer, Trophy, Target, Sparkles, Brain, Zap, AlertCircle, Award, TrendingUp
} from "lucide-react";
import confetti from "canvas-confetti";

export default function MockInterview() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [step, setStep] = useState<"setup" | "interview" | "results">("setup");
  const [interviewType, setInterviewType] = useState("mixed");
  const [difficulty, setDifficulty] = useState("medium");
  const [interview, setInterview] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [error, setError] = useState("");

  const startInterview = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("Please log in to start the interview");
        setIsGenerating(false);
        return;
      }

      if (!profile?.target_role_id) {
        setError("Please complete your profile and set a target role first");
        setIsGenerating(false);
        return;
      }
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-interview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            targetRoleId: profile?.target_role_id,
            interviewType,
            difficultyLevel: difficulty,
            numberOfQuestions: 5,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Failed to generate interview: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setInterview(result.data.interview);
        setQuestions(result.data.questions);
        setStep("interview");
        setStartTime(Date.now());
      } else {
        setError(result.error || "Failed to generate interview questions");
      }
    } catch (error: any) {
      console.error("Error starting interview:", error);
      setError(error.message || "An error occurred while starting the interview");
    } finally {
      setIsGenerating(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setIsEvaluating(true);
    setError("");
    const duration = Math.floor((Date.now() - startTime) / 1000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/evaluate-interview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            questionId: questions[currentQuestionIndex].id,
            userAnswer,
            answerDuration: duration,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setEvaluation(result.data);
        
        // Move to next question or results
        setTimeout(() => {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setUserAnswer("");
            setEvaluation(null);
            setStartTime(Date.now());
          } else {
            // Interview complete
            setStep("results");
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 }
            });
          }
        }, 3000);
      } else {
        setError(result.error || "Failed to evaluate answer");
      }
    } catch (error: any) {
      console.error("Error evaluating answer:", error);
      setError(error.message || "An error occurred while evaluating your answer");
    } finally {
      setIsEvaluating(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'technical': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'behavioral': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default: return 'bg-green-500/10 text-green-700 border-green-200';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'easy': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-500/10 text-red-700 border-red-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="hover:bg-primary/10 px-2 sm:px-3"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shrink-0">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate">
                    AI Mock Interview
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Practice with AI-powered interview questions
                  </p>
                </div>
              </div>
            </div>
            {step === "interview" && (
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <Badge variant="secondary" className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
                  {currentQuestionIndex + 1} / {questions.length}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Setup Step */}
        {step === "setup" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Configuration - 2 columns */}
            <div className="lg:col-span-2">
              <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardHeader className="border-b bg-gradient-to-br from-muted/50 to-transparent p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Interview Configuration
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Customize your practice session
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-xs sm:text-sm font-semibold">Interview Type</label>
                    <Select value={interviewType} onValueChange={setInterviewType}>
                      <SelectTrigger className="h-10 sm:h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-sm">Technical Questions</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="behavioral">
                          <div className="flex items-center gap-2">
                            <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-sm">Behavioral Questions</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="mixed">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-sm">Mixed (Recommended)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {interviewType === 'technical' && 'Focus on technical skills and problem-solving'}
                      {interviewType === 'behavioral' && 'Focus on soft skills and past experiences'}
                      {interviewType === 'mixed' && 'Balanced mix of technical and behavioral questions'}
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-xs sm:text-sm font-semibold">Difficulty Level</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="h-10 sm:h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy - Entry Level</SelectItem>
                        <SelectItem value="medium">Medium - Intermediate</SelectItem>
                        <SelectItem value="hard">Hard - Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {difficulty === 'easy' && 'Great for beginners and first-time interview practice'}
                      {difficulty === 'medium' && 'Suitable for experienced candidates'}
                      {difficulty === 'hard' && 'Challenging questions for senior positions'}
                    </p>
                  </div>

                  <Button
                    onClick={startInterview}
                    disabled={isGenerating}
                    className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/80"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Generating Questions...</span>
                        <span className="sm:hidden">Generating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Start Interview
                      </>
                    )}
                  </Button>

                  {error && (
                    <Alert variant="destructive" className="border-2">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Info Section */}
                  <div className="pt-4 space-y-3 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      What to Expect
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-muted-foreground">5 AI-generated questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-muted-foreground">Real-time AI evaluation</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-muted-foreground">Detailed feedback & tips</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-muted-foreground">Instant score & insights</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview - 3 columns */}
            <div className="lg:col-span-3">
              <Card className="border-2 border-dashed h-full flex items-center justify-center min-h-[600px] shadow-inner">
                <CardContent className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Ready to Practice?</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Configure your interview settings and click "Start Interview" to begin your AI-powered practice session
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Powered by Llama 3.3 AI</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Interview Step */}
        {step === "interview" && currentQuestion && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <Card className="border-2 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Interview Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                  </span>
                </div>
                <Progress 
                  value={((currentQuestionIndex + 1) / questions.length) * 100} 
                  className="h-3"
                />
              </CardContent>
            </Card>

            {/* Question Card */}
            <Card className="border-2 shadow-xl">
              <div className="h-2 bg-gradient-to-r from-primary via-primary/70 to-primary/50" />
              <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`${getTypeColor(currentQuestion.question_type)} border`}>
                    {currentQuestion.question_type}
                  </Badge>
                  <Badge className={`${getDifficultyColor(currentQuestion.difficulty)} border`}>
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-2xl leading-relaxed">
                  {currentQuestion.question_text}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Your Answer</label>
                  <Textarea
                    placeholder="Type your answer here... Be specific and provide examples where possible."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="min-h-[250px] text-base"
                    disabled={isEvaluating || !!evaluation}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Use the STAR method (Situation, Task, Action, Result) for behavioral questions
                  </p>
                </div>

                {evaluation ? (
                  <div className="space-y-4 p-6 bg-gradient-to-br from-muted/50 to-transparent rounded-xl border-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Your Score</span>
                      <div className="flex items-center gap-3">
                        <div className={`text-4xl font-bold ${evaluation.score >= 80 ? 'text-green-600' : evaluation.score >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}>
                          {evaluation.score}
                        </div>
                        <span className="text-2xl text-muted-foreground">/100</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-background rounded-lg border">
                      <p className="text-sm leading-relaxed">{evaluation.feedback}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold mb-3 text-green-700 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Strengths
                        </p>
                        <ul className="space-y-2">
                          {evaluation.strengths?.map((s: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2 text-green-900">
                              <span className="text-green-600 mt-1">✓</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm font-semibold mb-3 text-orange-700 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Areas to Improve
                        </p>
                        <ul className="space-y-2">
                          {evaluation.improvements?.map((imp: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2 text-orange-900">
                              <span className="text-orange-600 mt-1">→</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="text-center pt-4">
                      <p className="text-sm text-muted-foreground">
                        {currentQuestionIndex < questions.length - 1 
                          ? "Moving to next question..." 
                          : "Preparing your final results..."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={submitAnswer}
                    disabled={isEvaluating || !userAnswer.trim()}
                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/80"
                    size="lg"
                  >
                    {isEvaluating ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Evaluating with AI...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Submit Answer
                      </>
                    )}
                  </Button>
                )}

                {error && (
                  <Alert variant="destructive" className="border-2">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Step */}
        {step === "results" && (
          <Card className="max-w-3xl mx-auto border-2 shadow-xl">
            <div className="h-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500" />
            <CardHeader className="text-center bg-gradient-to-br from-muted/30 to-transparent pb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Trophy className="w-14 h-14 text-white" />
              </div>
              <CardTitle className="text-4xl mb-3">Interview Complete!</CardTitle>
              <CardDescription className="text-lg">
                Excellent work! You've completed your AI mock interview.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-transparent rounded-xl border-2">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{questions.length}</div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-transparent rounded-xl border-2">
                  <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-transparent rounded-xl border-2">
                  <div className="text-3xl font-bold text-purple-600 mb-2"><Award className="w-8 h-8 mx-auto" /></div>
                  <p className="text-sm text-muted-foreground">Achievement</p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-muted/50 to-transparent rounded-xl border-2">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Next Steps
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>Review your answers and feedback to identify improvement areas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>Practice more interviews to build confidence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                    <span>Update your skills based on the feedback received</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    setStep("setup");
                    setInterview(null);
                    setQuestions([]);
                    setCurrentQuestionIndex(0);
                    setUserAnswer("");
                    setEvaluation(null);
                  }}
                  variant="outline"
                  className="h-12"
                  size="lg"
                >
                  Practice Again
                </Button>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="h-12 bg-gradient-to-r from-primary to-primary/80"
                  size="lg"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
