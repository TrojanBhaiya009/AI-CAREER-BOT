import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Zap, Target, BookOpen, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import confetti from "canvas-confetti";

export function AchievementToast({ achievement }: { achievement: any }) {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <Card className="border-2 border-primary animate-in slide-in-from-right">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="text-4xl">{achievement.badge_icon}</div>
          <div>
            <CardTitle className="text-base">Achievement Unlocked!</CardTitle>
            <CardDescription className="text-sm font-semibold text-primary">
              {achievement.badge_name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{achievement.badge_description}</p>
        <div className="flex items-center gap-2 mt-3">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-semibold">+{achievement.xp_earned} XP</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function AchievementsDisplay() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    try {
      // Load achievements
      const { data: achData } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user?.id)
        .order("earned_at", { ascending: false });

      setAchievements(achData || []);

      // Load or create progress
      let { data: progData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (!progData) {
        // Create initial progress
        const { data: newProg } = await supabase
          .from("user_progress")
          .insert({ user_id: user?.id })
          .select()
          .single();
        progData = newProg;
      }

      setProgress(progData);
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getXPForNextLevel = (level: number) => {
    // XP needed for next level = (level * 100)^2
    return Math.pow((level + 1) * 10, 2);
  };

  const xpForNext = progress ? getXPForNextLevel(progress.level) : 100;
  const xpProgress = progress ? (progress.total_xp % xpForNext) : 0;
  const xpProgressPercent = (xpProgress / xpForNext) * 100;

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Your Progress
            </CardTitle>
            <CardDescription>
              Level {progress?.level || 1} • {achievements.length} achievements unlocked
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {progress?.total_xp || 0} XP
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {(progress?.level || 1) + 1}</span>
            <span className="font-medium">{xpProgress} / {xpForNext} XP</span>
          </div>
          <Progress value={xpProgressPercent} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <BookOpen className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-2xl font-bold">{progress?.skills_mastered || 0}</div>
            <div className="text-xs text-muted-foreground">Skills Mastered</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Target className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <div className="text-2xl font-bold">{progress?.interviews_completed || 0}</div>
            <div className="text-xs text-muted-foreground">Interviews Done</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <div className="text-2xl font-bold">{progress?.current_streak || 0}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Recent Achievements
            </h4>
            <div className="space-y-2">
              {achievements.slice(0, 5).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="text-2xl">{achievement.badge_icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{achievement.badge_name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {achievement.badge_description}
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    +{achievement.xp_earned} XP
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {achievements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Start using features to earn achievements!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
