import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Rocket, Target, TrendingUp, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: 'Google sign-in failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (!isLogin && !fullName)) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login failed',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: 'Sign up failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          setShowEmailVerification(true);
          toast({
            title: 'Account created!',
            description: 'Please check your email to verify your account.',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex flex-1 flex-col space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-14 h-14 bg-primary rounded-2xl">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                AI Career Copilot
              </h1>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your intelligent partner for career readiness. Get personalized skill analysis, learning roadmaps, and portfolio projects tailored to your dream role.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Smart Skill Gap Analysis</h3>
                <p className="text-sm text-muted-foreground">Identify exactly what skills you need for your target role</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">30-60-90 Day Roadmap</h3>
                <p className="text-sm text-muted-foreground">Get a structured learning plan with clear milestones</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg shrink-0">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Portfolio Projects</h3>
                <p className="text-sm text-muted-foreground">Build real projects that showcase your abilities to employers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-[440px] lg:shrink-0">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">AI Career Copilot</h1>
            <p className="text-muted-foreground mt-1">Your path to career readiness</p>
          </div>

          {showEmailVerification ? (
            <Card className="border-border shadow-xl">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl text-center">Check your email</CardTitle>
                <CardDescription className="text-center">
                  We've sent a verification link to <strong>{email}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertTitle>Verification Required</AlertTitle>
                  <AlertDescription>
                    Please check your inbox and click the verification link to activate your account. 
                    Don't forget to check your spam folder if you don't see it.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowEmailVerification(false);
                    setIsLogin(true);
                  }}
                >
                  Back to Sign In
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-border shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? 'Enter your credentials to access your dashboard'
                  : 'Start your journey to becoming job-ready'}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-base"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      className="h-11"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-11"
                  />
                  {!isLogin && (
                    <p className="text-xs text-muted-foreground">At least 6 characters</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    disabled={loading}
                    className="text-primary hover:underline font-medium"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </div>
              </CardFooter>
            </form>
          </Card>
          )}
        </div>
      </div>
    </div>
  );
}
