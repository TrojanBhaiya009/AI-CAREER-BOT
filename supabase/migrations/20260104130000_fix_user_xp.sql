-- Fix existing users' XP by summing their achievements
UPDATE public.user_progress
SET total_xp = (
    SELECT COALESCE(SUM(xp_earned), 0)
    FROM public.achievements
    WHERE achievements.user_id = user_progress.user_id
)
WHERE EXISTS (
    SELECT 1 FROM public.achievements
    WHERE achievements.user_id = user_progress.user_id
);
