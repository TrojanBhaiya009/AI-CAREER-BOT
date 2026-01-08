import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useTargetRoles } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, ArrowLeft, User, GraduationCap, Target, Briefcase, Sparkles } from 'lucide-react';

const EDUCATION_LEVELS = [
  'High School',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD',
  'Self-taught',
  'Bootcamp Graduate',
];

const CATEGORY_LABELS: Record<string, string> = {
  tech: '💻 Technology',
  marketing: '📢 Marketing',
  sales: '💼 Sales & Business Development',
  hr: '👥 HR & People Operations',
  finance: '📊 Finance',
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, updateProfile } = useProfile();
  const { roles, loading: rolesLoading } = useTargetRoles();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    educationLevel: profile?.education_level || '',
    careerGoal: profile?.career_goal || '',
    targetRoleId: profile?.target_role_id || '',
  });

  const rolesByCategory = roles.reduce((acc, role) => {
    if (!acc[role.category]) {
      acc[role.category] = [];
    }
    acc[role.category].push(role);
    return acc;
  }, {} as Record<string, typeof roles>);

  const handleNext = async () => {
    if (step === 1 && !formData.fullName.trim()) {
      toast({ title: 'Please enter your name', variant: 'destructive' });
      return;
    }
    if (step === 2 && !formData.educationLevel) {
      toast({ title: 'Please select your education level', variant: 'destructive' });
      return;
    }
    if (step === 3 && !formData.careerGoal) {
      toast({ title: 'Please select your career goal', variant: 'destructive' });
      return;
    }
    if (step === 4 && !formData.targetRoleId) {
      toast({ title: 'Please select your target role', variant: 'destructive' });
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      setLoading(true);
      try {
        const { error } = await updateProfile({
          full_name: formData.fullName.trim(),
          education_level: formData.educationLevel,
          career_goal: formData.careerGoal as 'internship' | 'full_time',
          target_role_id: formData.targetRoleId,
          onboarding_completed: true,
        });

        if (error) throw error;

        toast({
          title: 'Welcome aboard! 🎉',
          description: "Let's analyze your skills and create your roadmap.",
        });
        navigate('/skills');
      } catch (error) {
        console.error('Error saving profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to save your profile. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const stepIcons = [User, GraduationCap, Briefcase, Target];
  const StepIcon = stepIcons[step - 1];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-6 sm:mb-8 gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-10 sm:w-12 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-4">
              <StepIcon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">
              {step === 1 && "Let's get to know you"}
              {step === 2 && 'Your educational background'}
              {step === 3 && 'What are you looking for?'}
              {step === 4 && 'Choose your target role'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'We\'ll personalize your experience'}
              {step === 2 && 'This helps us understand your starting point'}
              {step === 3 && 'Internship or full-time opportunity?'}
              {step === 4 && 'Select the role you want to prepare for'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-2">
                <Label htmlFor="fullName">What's your name?</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  autoFocus
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <Label>What's your education level?</Label>
                <Select
                  value={formData.educationLevel}
                  onValueChange={(value) => setFormData({ ...formData, educationLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 3 && (
              <RadioGroup
                value={formData.careerGoal}
                onValueChange={(value) => setFormData({ ...formData, careerGoal: value })}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="internship" id="internship" />
                  <Label htmlFor="internship" className="flex-1 cursor-pointer">
                    <div className="font-medium">Looking for an Internship</div>
                    <div className="text-sm text-muted-foreground">
                      I'm a student or early in my career
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="full_time" id="full_time" />
                  <Label htmlFor="full_time" className="flex-1 cursor-pointer">
                    <div className="font-medium">Looking for a Full-time Job</div>
                    <div className="text-sm text-muted-foreground">
                      I'm ready for a permanent position
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            )}

            {step === 4 && (
              <div className="space-y-2">
                <Label>Select your target role</Label>
                {rolesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Select
                    value={formData.targetRoleId}
                    onValueChange={(value) => setFormData({ ...formData, targetRoleId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Object.entries(rolesByCategory).map(([category, categoryRoles]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                            {CATEGORY_LABELS[category] || category}
                          </div>
                          {categoryRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : step === 4 ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Analysis
                  </>
                ) : (
                  <>
                    Continue
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
