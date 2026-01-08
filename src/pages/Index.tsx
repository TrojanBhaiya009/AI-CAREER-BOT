import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { 
  Sparkles, 
  ArrowRight, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle, 
  Zap,
  Users,
  BarChart3,
  Shield,
  Star,
  Github,
  Linkedin,
  Mail,
  Clock,
  Award,
  BookOpen
} from 'lucide-react';
import { useEffect } from 'react';

export default function Index() {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (!profileLoading && profile) {
        if (profile.onboarding_completed) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    }
  }, [user, loading, profile, profileLoading, navigate]);

  const features = [
    {
      icon: Target,
      title: 'AI-Powered Skill Analysis',
      description: 'Advanced algorithms analyze your resume, GitHub, and experience to identify precise skill gaps for your target role',
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      icon: TrendingUp,
      title: 'Personalized Roadmaps',
      description: 'Get custom 30-60-90 day learning plans with actionable milestones tailored to your career goals',
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      icon: Lightbulb,
      title: 'Portfolio Projects',
      description: 'Build real-world projects that showcase your skills and stand out to hiring managers',
      color: 'bg-orange-500/10 text-orange-500'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Visualize your skill development journey with detailed analytics and milestone tracking',
      color: 'bg-green-500/10 text-green-500'
    },
    {
      icon: Users,
      title: 'Industry Insights',
      description: 'Access curated resources and best practices from industry professionals',
      color: 'bg-pink-500/10 text-pink-500'
    },
    {
      icon: Award,
      title: 'Career Ready Certificate',
      description: 'Earn recognition for completing your roadmap and building portfolio projects',
      color: 'bg-indigo-500/10 text-indigo-500'
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Frontend Developer at Google',
      image: '👩‍💻',
      quote: 'This platform helped me identify the exact skills I was missing. Within 3 months, I landed my dream job!',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Full Stack Engineer at Amazon',
      image: '👨‍💼',
      quote: 'The personalized roadmap was a game-changer. I went from 0 interviews to 5 offers in 2 months.',
      rating: 5
    },
    {
      name: 'Priya Patel',
      role: 'Data Analyst at Microsoft',
      image: '👩‍🔬',
      quote: 'The portfolio projects gave me real experience to talk about in interviews. Highly recommend!',
      rating: 5
    },
  ];

  const stats = [
    { number: '10K+', label: 'Career Seekers' },
    { number: '85%', label: 'Job Success Rate' },
    { number: '2M+', label: 'Skills Analyzed' },
    { number: '4.9/5', label: 'User Rating' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-base sm:text-lg tracking-tight">AI Career Copilot</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="font-medium px-2 sm:px-4">
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/auth')} className="font-medium shadow-lg shadow-primary/20 px-3 sm:px-4">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-32 lg:pb-40">
          <div className="text-center">
            {/* Premium badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm mb-8 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI-Powered Career Intelligence
              </span>
            </div>
            
            {/* Hero headline with refined typography */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-5xl mx-auto leading-[1.1] animate-fade-in">
              <span className="text-foreground">Career readiness</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent inline-block mt-2">
                made simple.
              </span>
            </h1>
            
            {/* Subheadline with better spacing */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed font-light animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Stop wondering what's holding you back. Get AI-powered skill analysis, personalized learning roadmaps, 
              and portfolio projects that land interviews—all in one intelligent platform.
            </p>

            {/* CTA buttons with refined design */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')} 
                className="w-full sm:w-auto h-12 px-8 text-base font-medium shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all"
              >
                Start Free Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto h-12 px-8 text-base font-medium border-2 hover:bg-accent/5"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Watch Demo
              </Button>
            </div>

            {/* Trust indicators with refined design */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 group">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
                <span className="font-medium">No credit card</span>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <CheckCircle className="w-3 h-3 text-blue-600" />
                </div>
                <span className="font-medium">Free forever</span>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <CheckCircle className="w-3 h-3 text-purple-600" />
                </div>
                <span className="font-medium">5-min setup</span>
              </div>
            </div>
          </div>

          {/* Premium Dashboard Preview with glassmorphism */}
          <div className="mt-20 sm:mt-24 relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {/* Glow effect */}
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-3xl opacity-60" />
            
            <Card className="relative border-2 border-border/50 shadow-2xl overflow-hidden backdrop-blur-xl bg-background/80">
              <CardContent className="p-2 sm:p-3">
                <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-xl p-6 sm:p-10 md:p-14 border border-border/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                    <Card className="bg-background/90 backdrop-blur-xl border-2 border-border/50 hover:border-primary/30 transition-all duration-300 group">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-muted-foreground">Skill Match</span>
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Target className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        <div className="text-4xl font-bold mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">78%</div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[78%] bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-background/90 backdrop-blur-xl border-2 border-border/50 hover:border-purple-500/30 transition-all duration-300 group">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-muted-foreground">Skills Tracked</span>
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BarChart3 className="w-5 h-5 text-purple-500" />
                          </div>
                        </div>
                        <div className="text-4xl font-bold mb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">24</div>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            18 Strong
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            6 Weak
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-background/90 backdrop-blur-xl border-2 border-border/50 hover:border-orange-500/30 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-muted-foreground">Days to Ready</span>
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Clock className="w-5 h-5 text-orange-500" />
                          </div>
                        </div>
                        <div className="text-4xl font-bold mb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">47</div>
                        <div className="text-xs text-muted-foreground">On track for target role</div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Your personalized dashboard preview</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section - Refined with better spacing */}
      <div className="border-y bg-muted/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section - Enhanced cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powerful Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Everything you need to
            <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              land your dream job
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
            Our AI-powered platform provides comprehensive tools and insights to accelerate your career journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group relative border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-300" />
              
              <CardContent className="relative p-6 sm:p-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color.split(' ')[0]} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className={`w-7 h-7 ${feature.color.split(' ')[1]}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How it works - Premium Timeline */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              How it works
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Get job-ready in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { 
                step: 1, 
                title: 'Choose Your Path', 
                desc: 'Select your target role from 20+ career paths across tech, marketing, sales, and more',
                icon: Target,
                gradient: 'from-blue-500 to-cyan-500'
              },
              { 
                step: 2, 
                title: 'Share Your Profile', 
                desc: 'Upload your resume, connect GitHub, or manually input your current skills',
                icon: Users,
                gradient: 'from-purple-500 to-pink-500'
              },
              { 
                step: 3, 
                title: 'Get AI Analysis', 
                desc: 'Our AI identifies skill gaps, calculates match percentage, and creates your roadmap',
                icon: Sparkles,
                gradient: 'from-orange-500 to-red-500'
              },
              { 
                step: 4, 
                title: 'Build & Succeed', 
                desc: 'Follow your personalized plan, build portfolio projects, and land interviews',
                icon: Award,
                gradient: 'from-green-500 to-emerald-500'
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <Card className="h-full bg-background/80 backdrop-blur-xl border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl overflow-hidden">
                  {/* Gradient accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center font-bold text-lg shadow-lg`}>
                        {item.step}
                        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Connection line for desktop */}
                {item.step < 4 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5">
                    <div className={`h-full bg-gradient-to-r ${item.gradient} opacity-20`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section - Premium design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Success Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Loved by career seekers
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
            Join thousands who've transformed their careers with our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="group relative border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl overflow-hidden"
            >
              {/* Premium gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-300" />
              
              <CardContent className="relative p-6 sm:p-8">
                {/* 5-star rating */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <div key={i} className="relative">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                    </div>
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-base text-muted-foreground mb-6 leading-relaxed italic font-light">
                  "{testimonial.quote}"
                </p>
                
                {/* Author info */}
                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold text-base mb-0.5">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Final CTA Section - Premium gradient design */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center text-primary-foreground">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Ready to accelerate
            <span className="block mt-2">your career?</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl opacity-90 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
            Join 10,000+ professionals who are using AI to land their dream jobs faster
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')} 
              className="w-full sm:w-auto h-14 px-10 text-base font-medium shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
            >
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto h-14 px-10 text-base font-medium border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
            >
              Talk to Sales
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">Enterprise-grade security</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">GDPR compliant</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">99.9% uptime SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Clean and professional */}
      <footer className="border-t bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Roadmap</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-base">AI Career Copilot</span>
            </div>
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © 2024 AI Career Copilot. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Github className="w-4 h-4" />
                </div>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </div>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
