// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, Sparkles, CheckCircle2, AlertCircle, 
  ArrowLeft, Download, TrendingUp, Target, Zap, Upload, X, Award, Shield
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ATSOptimizer() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [resumeText, setResumeText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF, DOC, DOCX, or TXT file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setError("");

    // Extract text from file
    try {
      if (file.type === 'text/plain') {
        const text = await file.text();
        setResumeText(text);
      } else {
        // For PDF/DOC files, we'll read as text (simplified approach)
        const reader = new FileReader();
        reader.onload = (e) => setResumeText(e.target?.result as string);
        reader.readAsText(file);
      }
    } catch (err) {
      setError("Failed to read file");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setResumeText("");
    setError("");
    setAnalysis(null);
  };

  const analyzeResume = async () => {
    if (!selectedFile && !resumeText.trim()) {
      setError("Please upload a resume file");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      let textToAnalyze = resumeText;

      // If it's a text file, we already have the text
      if (selectedFile && !resumeText) {
        if (selectedFile.type === 'text/plain') {
          textToAnalyze = await selectedFile.text();
        } else {
          // For PDF/DOC files, read as text
          const reader = new FileReader();
          textToAnalyze = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsText(selectedFile);
          });
        }
      }
      
      // Sanitize text before sending to avoid Unicode escape errors
      textToAnalyze = textToAnalyze
        .replace(/\\/g, ' ')  // Remove all backslashes
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')  // Remove control characters
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .trim();
      
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/analyze-resume-ats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            resumeText: textToAnalyze,
            targetRoleId: profile?.target_role_id,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setAnalysis(result.data);
        
        // Celebration if score > 80
        if (result.data.ats_score >= 80) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } else {
        setError(result.error || "Failed to analyze resume");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadOptimized = () => {
    if (!analysis?.optimized_resume_text) return;
    
    const blob = new Blob([analysis.optimized_resume_text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent - Ready to apply!";
    if (score >= 80) return "Great - Strong ATS compatibility";
    if (score >= 70) return "Good - Minor improvements needed";
    if (score >= 60) return "Fair - Some optimization required";
    return "Needs Work - Significant improvements needed";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure & Private</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  ATS Resume Optimizer
                </h1>
                <p className="text-muted-foreground">
                  AI-powered analysis to beat applicant tracking systems
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Upload Section - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="border-b bg-gradient-to-br from-muted/50 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Resume
                </CardTitle>
                <CardDescription>
                  Support for PDF, DOC, DOCX, and TXT formats
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* File Upload Area */}
                {!selectedFile ? (
                  <div className="relative group">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer block"
                    >
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all group-hover:scale-[1.02]">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm font-semibold mb-2">Click to upload your resume</p>
                        <p className="text-xs text-muted-foreground">
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 opacity-75">
                          Maximum file size: 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-primary/50 rounded-xl p-4 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Analyze Button */}
                <Button
                  onClick={analyzeResume}
                  disabled={isAnalyzing || (!selectedFile && !resumeText.trim())}
                  className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/80"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </Button>

                {error && (
                  <Alert variant="destructive" className="border-2">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Features List */}
                <div className="pt-4 space-y-3 border-t">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    What You Get
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-muted-foreground">ATS compatibility score</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-muted-foreground">Keyword analysis & gaps</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-muted-foreground">AI-powered suggestions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-muted-foreground">Secure & confidential</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {analysis ? (
              <>
                {/* ATS Score - Premium Card */}
                <Card className="border-2 shadow-xl overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${getScoreColor(analysis.ats_score)}`} />
                  <CardHeader className="bg-gradient-to-br from-muted/30 to-transparent">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">ATS Compatibility Score</CardTitle>
                        <CardDescription className="text-base mt-1">
                          {getScoreLabel(analysis.ats_score)}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className={`text-5xl font-bold bg-gradient-to-br ${getScoreColor(analysis.ats_score)} bg-clip-text text-transparent`}>
                          {analysis.ats_score}
                        </div>
                        <p className="text-sm text-muted-foreground">out of 100</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Progress value={analysis.ats_score} className="h-4 mb-4" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>
                        {analysis.ats_score >= 80
                          ? "Your resume is optimized and ready for applications!"
                          : analysis.ats_score >= 60
                          ? "Your resume is on track. Follow suggestions below to improve."
                          : "Significant improvements needed. Review suggestions carefully."}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Keyword Analysis */}
                <Card className="border-2 shadow-lg">
                  <CardHeader className="border-b bg-gradient-to-br from-muted/30 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Keyword Analysis
                    </CardTitle>
                    <CardDescription>
                      Keywords matched vs. missing from target role
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Matched Keywords
                        </span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {analysis.keyword_matches?.length || 0} found
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keyword_matches?.map((keyword: string, i: number) => (
                          <Badge key={i} className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          Missing Keywords
                        </span>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {analysis.missing_keywords?.length || 0} to add
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missing_keywords?.map((keyword: string, i: number) => (
                          <Badge key={i} variant="outline" className="border-orange-300 text-orange-700 bg-orange-50/50 hover:bg-orange-100">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Optimization Suggestions */}
                <Card className="border-2 shadow-lg">
                  <CardHeader className="border-b bg-gradient-to-br from-muted/30 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      AI Recommendations
                    </CardTitle>
                    <CardDescription>
                      Actionable steps to improve your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {analysis.suggestions?.slice(0, 6).map((suggestion: any, i: number) => (
                        <div key={i} className="flex gap-3 p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-lg border hover:border-primary/50 transition-colors">
                          <div className="shrink-0">
                            <Badge 
                              variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-sm flex-1 leading-relaxed">{suggestion.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Download Button */}
                {analysis.optimized_resume_text && (
                  <Button 
                    onClick={downloadOptimized} 
                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/80"
                    size="lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Optimized Resume
                  </Button>
                )}
              </>
            ) : (
              <Card className="border-2 border-dashed h-full flex items-center justify-center min-h-[600px] shadow-inner">
                <CardContent className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Optimize?</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Upload your resume to receive an instant ATS compatibility analysis with actionable recommendations
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Powered by Llama 3.3 AI</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
