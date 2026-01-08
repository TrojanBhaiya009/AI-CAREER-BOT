import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useSkills, useUserSkills } from '@/hooks/useSkills';
import { useRoadmap } from '@/hooks/useRoadmap';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Github, ListChecks, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CATEGORY_LABELS: Record<string, string> = {
  programming_languages: 'Programming Languages',
  frameworks_libraries: 'Frameworks & Libraries',
  tools_platforms: 'Tools & Platforms',
  soft_skills: 'Soft Skills',
  concepts: 'Concepts & Domain Skills',
  domain_specific: 'Domain Specific',
};

export default function SkillInput() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, targetRole, updateProfile } = useProfile();
  const { skills, getSkillsByCategory } = useSkills();
  const { addUserSkills, clearUserSkills } = useUserSkills();
  const { saveRoadmap, saveProjects } = useRoadmap();

  const [resumeText, setResumeText] = useState(profile?.resume_text || '');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [githubUsername, setGithubUsername] = useState(profile?.github_username || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [githubData, setGithubData] = useState<{ languages: string[]; topics: string[] } | null>(null);

  const skillsByCategory = getSkillsByCategory();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF, DOC, DOCX, or TXT file',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setLoadingFile(true);
    setResumeFile(file);

    try {
      // For PDF and DOC files, we'll just store the file and show a message
      // For TXT files, we can read and display the content
      if (file.type === 'text/plain') {
        const text = await file.text();
        setResumeText(text);
        toast({
          title: 'Resume uploaded!',
          description: 'Text content extracted successfully',
        });
      } else {
        // For PDF/DOC files, we'll send the file to the backend for processing
        toast({
          title: 'Resume uploaded!',
          description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        });
        // Note: In a production app, you'd want to use a service like pdf-parse or mammoth
        // to extract text from PDF/DOC files. For now, we'll just notify the user.
        toast({
          title: 'Note',
          description: 'For PDF/DOC files, please paste the text content in the text area below for now.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('File read error:', error);
      toast({
        title: 'Failed to read file',
        description: 'Please try again or paste the content manually',
        variant: 'destructive',
      });
    } finally {
      setLoadingFile(false);
    }
  };

  const handleGithubFetch = async () => {
    if (!githubUsername.trim()) {
      toast({ title: 'Please enter a GitHub username', variant: 'destructive' });
      return;
    }

    setLoadingGithub(true);
    try {
      console.log('Invoking github-profile function with username:', githubUsername.trim());
      
      // Get the current session to pass auth token
      const { data: { session } } = await supabase.auth.getSession();
      console.log('User session exists:', !!session);
      
      const { data, error } = await supabase.functions.invoke('github-profile', {
        body: { username: githubUsername.trim() },
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
      });

      console.log('Function response - data:', data, 'error:', error);

      if (error) {
        console.error('Supabase function error details:', {
          message: error.message,
          status: error.status,
          context: error.context
        });
        
        if (error.message?.includes('not found') || error.message?.includes('FunctionsRelayError')) {
          throw new Error('GitHub profile function not deployed. Please check Supabase dashboard.');
        }
        
        if (error.message?.includes('GITHUB_TOKEN')) {
          throw new Error('GitHub token not configured in Supabase secrets.');
        }
        
        throw new Error(error.message || 'Failed to invoke function');
      }
      
      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.languages) {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response from function');
      }

      setGithubData({ languages: data.languages || [], topics: data.topics || [] });
      toast({
        title: 'GitHub profile fetched!',
        description: `Found ${data.languages.length} languages and ${data.topics.length} topics`,
      });
    } catch (error) {
      console.error('GitHub fetch error:', error);
      toast({
        title: 'Failed to fetch GitHub profile',
        description: error instanceof Error ? error.message : 'Please check the username and try again',
        variant: 'destructive',
      });
    } finally {
      setLoadingGithub(false);
    }
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !githubData && selectedSkills.length === 0) {
      toast({
        title: 'Please provide some skill data',
        description: 'Paste your resume, connect GitHub, or select skills manually',
        variant: 'destructive',
      });
      return;
    }

    if (!targetRole) {
      toast({ title: 'Please complete onboarding first', variant: 'destructive' });
      navigate('/onboarding');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Extract skills from all inputs
      toast({ title: 'Extracting your skills...', description: 'This may take a moment' });

      const manualSkillNames = selectedSkills
        .map((id) => skills.find((s) => s.id === id)?.name)
        .filter(Boolean) as string[];

      const { data: extractData, error: extractError } = await supabase.functions.invoke('analyze-skills', {
        body: {
          type: 'extract',
          resumeText: resumeText.trim() || undefined,
          githubData: githubData || undefined,
          manualSkills: manualSkillNames.length > 0 ? manualSkillNames : undefined,
        },
      });

      if (extractError) throw extractError;
      if (extractData.error) throw new Error(extractData.error);

      const extractedSkills = extractData.skills as { name: string; category: string; confidence: string }[];
      const userSkillNames = extractedSkills.map((s) => s.name);

      // Map extracted skills to skill IDs and add to user_skills
      const skillsToAdd = extractedSkills
        .map((extracted) => {
          const matchingSkill = skills.find(
            (s) =>
              s.name.toLowerCase() === extracted.name.toLowerCase() ||
              s.aliases.some((a) => a.toLowerCase() === extracted.name.toLowerCase())
          );
          if (matchingSkill) {
            return {
              skill_id: matchingSkill.id,
              proficiency: (extracted.confidence === 'high' ? 'strong' : 'weak') as 'strong' | 'weak',
              source: 'ai_extracted',
            };
          }
          return null;
        })
        .filter(Boolean) as { skill_id: string; proficiency: 'strong' | 'weak'; source: string }[];

      // Add manually selected skills
      selectedSkills.forEach((skillId) => {
        if (!skillsToAdd.find((s) => s.skill_id === skillId)) {
          skillsToAdd.push({ skill_id: skillId, proficiency: 'weak', source: 'manual' });
        }
      });

      await clearUserSkills();
      if (skillsToAdd.length > 0) {
        await addUserSkills(skillsToAdd);
      }

      // Step 2: Gap analysis
      toast({ title: 'Analyzing skill gaps...', description: 'Comparing against target role' });

      const { data: gapData, error: gapError } = await supabase.functions.invoke('analyze-skills', {
        body: {
          type: 'gap-analysis',
          userSkills: userSkillNames,
          targetRole: targetRole.name,
          requiredSkills: targetRole.required_skills,
        },
      });

      if (gapError) throw gapError;
      if (gapData.error) throw new Error(gapData.error);

      const gapAnalysis = gapData.analysis as { skill: string; status: string; priority: string; reason: string }[];
      const matchPercentage = gapData.overall_match_percentage as number;

      const missingSkills = gapAnalysis.filter((a) => a.status === 'missing').map((a) => a.skill);
      const weakSkills = gapAnalysis.filter((a) => a.status === 'weak').map((a) => a.skill);

      // Step 3: Generate roadmap
      toast({ title: 'Creating your roadmap...', description: 'Personalizing your learning path' });

      const { data: roadmapData, error: roadmapError } = await supabase.functions.invoke('analyze-skills', {
        body: {
          type: 'roadmap',
          targetRole: targetRole.name,
          skillGaps: { missing: missingSkills, weak: weakSkills },
        },
      });

      if (roadmapError) throw roadmapError;
      if (roadmapData.error) throw new Error(roadmapData.error);

      // Step 4: Generate project recommendations
      toast({ title: 'Generating project ideas...', description: 'Finding portfolio-worthy projects' });

      const { data: projectsData, error: projectsError } = await supabase.functions.invoke('analyze-skills', {
        body: {
          type: 'projects',
          targetRole: targetRole.name,
          skillGaps: { missing: missingSkills, weak: weakSkills },
        },
      });

      if (projectsError) throw projectsError;
      if (projectsData.error) throw new Error(projectsData.error);

      console.log('Roadmap data to save:', {
        target_role_id: targetRole.id,
        skill_match_percentage: matchPercentage,
        phase_1: roadmapData.phase_1,
        phase_2: roadmapData.phase_2,
        phase_3: roadmapData.phase_3,
      });

      // Save roadmap
      const savedRoadmap = await saveRoadmap({
        target_role_id: targetRole.id,
        skill_match_percentage: matchPercentage,
        phase_1: roadmapData.phase_1,
        phase_2: roadmapData.phase_2,
        phase_3: roadmapData.phase_3,
      });

      console.log('Roadmap saved successfully:', savedRoadmap);

      // Save projects
      console.log('Projects to save:', projectsData.projects);
      const savedProjects = await saveProjects(projectsData.projects);
      console.log('Projects saved successfully:', savedProjects);

      // Update profile with resume text and github username
      await updateProfile({
        resume_text: resumeText.trim() || null,
        github_username: githubUsername.trim() || null,
      });

      toast({
        title: 'Analysis complete! 🎉',
        description: `Your skill match is ${matchPercentage}%. Check your dashboard!`,
      });

      // Add a small delay before navigation to ensure data is saved
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Tell us about your skills</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Provide your skill data through any of these methods
          </p>
          {targetRole && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-sm text-muted-foreground">Target Role:</span>
              <span className="text-sm font-medium text-primary">{targetRole.name}</span>
            </div>
          )}
        </div>

        <Tabs defaultValue="resume" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="resume" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5">
              <FileText className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Resume</span>
            </TabsTrigger>
            <TabsTrigger value="github" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5">
              <Github className="h-4 w-4" />
              <span className="text-xs sm:text-sm">GitHub</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5">
              <ListChecks className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Manual</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resume">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Upload or Paste Your Resume
                </CardTitle>
                <CardDescription>
                  Upload a resume file or paste the content. We'll extract your skills automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="resume-file" className="text-sm font-medium mb-2 block">
                    Upload Resume File
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="resume-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      disabled={loadingFile}
                      className="cursor-pointer"
                    />
                    {loadingFile && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  {resumeFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploaded: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: PDF, DOC, DOCX, TXT (max 5MB)
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or paste content</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="resume-text" className="text-sm font-medium mb-2 block">
                    Paste Resume Content
                  </Label>
                  <Textarea
                    id="resume-text"
                    placeholder="Paste your resume content here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="min-h-[250px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {resumeText.length > 0 ? `${resumeText.length} characters` : 'No content yet'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="github">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Connect GitHub Profile
                </CardTitle>
                <CardDescription>
                  We'll analyze your public repositories to identify programming languages and technologies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter GitHub username or profile URL"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleGithubFetch} disabled={loadingGithub}>
                    {loadingGithub ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Fetch'
                    )}
                  </Button>
                </div>

                {githubData && (
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Languages Found</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {githubData.languages.slice(0, 10).map((lang) => (
                          <span
                            key={lang}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                    {githubData.topics.length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Topics Found</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {githubData.topics.slice(0, 10).map((topic) => (
                            <span
                              key={topic}
                              className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-md"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Select Your Skills
                </CardTitle>
                <CardDescription>
                  Check the skills you have experience with. You can select multiple.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <div key={category}>
                    <Label className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 block">
                      {CATEGORY_LABELS[category] || category}
                    </Label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {categorySkills.map((skill) => (
                        <div
                          key={skill.id}
                          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg cursor-pointer transition-colors active:scale-95 ${
                            selectedSkills.includes(skill.id)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted border-border'
                          }`}
                          onClick={() => toggleSkill(skill.id)}
                        >
                          <Checkbox
                            checked={selectedSkills.includes(skill.id)}
                            className={selectedSkills.includes(skill.id) ? 'border-primary-foreground' : ''}
                          />
                          <span className="text-xs sm:text-sm">{skill.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  {selectedSkills.length} skills selected
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary and analyze button */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-medium">Ready to analyze?</p>
                <p className="text-sm text-muted-foreground">
                  {resumeText.trim() ? '✓ Resume provided' : '○ No resume'} •{' '}
                  {githubData ? '✓ GitHub connected' : '○ No GitHub'} •{' '}
                  {selectedSkills.length > 0 ? `✓ ${selectedSkills.length} skills` : '○ No manual skills'}
                </p>
              </div>
              <Button onClick={handleAnalyze} disabled={loading} size="lg" className="w-full sm:w-auto">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze My Skills
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
