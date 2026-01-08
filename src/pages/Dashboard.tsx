import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useUserSkills } from '@/hooks/useSkills';
import { useRoadmap } from '@/hooks/useRoadmap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AchievementsDisplay } from '@/components/AchievementsDisplay';

import {
  Target,
  TrendingUp,
  Calendar,
  Briefcase,
  ChevronRight,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Lightbulb,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, targetRole, loading: profileLoading } = useProfile();
  const { userSkills, loading: skillsLoading } = useUserSkills();
  const { roadmap, projects, loading: roadmapLoading } = useRoadmap();

  const loading = profileLoading || skillsLoading || roadmapLoading;

  useEffect(() => {
    if (!profileLoading && profile && !profile.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [profile, profileLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Calculate skill stats
  const strongSkills = userSkills.filter((s) => s.proficiency === 'strong').length;
  const weakSkills = userSkills.filter((s) => s.proficiency === 'weak').length;
  const totalSkills = userSkills.length;

  const matchPercentage = roadmap?.skill_match_percentage || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border-border">
          <CardHeader>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-foreground">Let's analyze your skills!</CardTitle>
            <CardDescription>
              Complete the skill input to get your personalized dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/skills')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Skill Analysis
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Clean header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">AI Career Copilot</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Welcome, {profile?.full_name || 'User'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Button variant="outline" size="sm" onClick={() => navigate('/skills')} className="border-border hidden sm:flex">
                Update Skills
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/skills')} className="border-border sm:hidden px-2">
                Update
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="px-2 sm:px-3">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
        {/* Stats Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-border">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Skill Match</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{matchPercentage}%</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
              <Progress value={matchPercentage} className="mt-3 sm:mt-4 h-2" />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Skills</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{totalSkills}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm">
                <span className="text-green-600 dark:text-green-400">{strongSkills} strong</span>
                <span className="text-orange-600 dark:text-orange-400">{weakSkills} weak</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Target Role</p>
                  <p className="text-base sm:text-xl font-bold text-foreground mt-1 sm:mt-2 truncate">{targetRole?.name || 'Not set'}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Career Goal</p>
                  <p className="text-base sm:text-lg font-semibold text-foreground mt-1 sm:mt-2">
                    {profile?.career_goal === 'internship' ? 'Internship' : 'Full-time'}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions Grid */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="border-border hover:shadow-lg transition-all group cursor-pointer" onClick={() => navigate('/ats-optimizer')}>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">📄</span>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Resume Optimizer</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Get your resume past ATS systems with AI-powered analysis
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-all group cursor-pointer" onClick={() => navigate('/mock-interview')}>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">🎤</span>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Mock Interview</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Practice with AI-generated questions tailored to your role
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-all group cursor-pointer" onClick={() => navigate('/job-matches')}>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-sky-500/10 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">🔍</span>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Job Matches</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Discover opportunities matched to your skills from real job boards
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Achievements */}
        <AchievementsDisplay />

        {/* Learning Roadmap */}
        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">30-60-90 Day Roadmap</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Your personalized learning path</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { phase: roadmap.phase_1, label: 'Days 1-30', color: 'bg-green-500 dark:bg-green-600' },
              { phase: roadmap.phase_2, label: 'Days 31-60', color: 'bg-amber-500 dark:bg-amber-600' },
              { phase: roadmap.phase_3, label: 'Days 61-90', color: 'bg-purple-500 dark:bg-purple-600' },
            ].map(({ phase, label, color }, index) => (
              <Card key={index} className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  </div>
                  <CardTitle className="text-lg">{phase?.title || `Phase ${index + 1}`}</CardTitle>
                </CardHeader>
                <CardContent>
                  {phase?.skills && phase.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Skills to Learn</p>
                      <div className="flex flex-wrap gap-2">
                        {phase.skills.slice(0, 4).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {phase.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{phase.skills.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {phase?.project && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Featured Project</p>
                      <p className="font-semibold text-foreground text-sm">{phase.project.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {phase.project.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Project Ideas */}
        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Portfolio Projects</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Build these to showcase your skills</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="border-border hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    {project.difficulty && (
                      <Badge
                        variant="secondary"
                        className={
                          project.difficulty === 'beginner'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : project.difficulty === 'intermediate'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }
                      >
                        {project.difficulty}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                  
                  {project.skills_covered && project.skills_covered.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.skills_covered.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {project.estimated_time && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {project.estimated_time}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
