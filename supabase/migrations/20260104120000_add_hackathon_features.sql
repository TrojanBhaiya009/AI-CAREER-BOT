-- Add new tables for hackathon features
-- Run: supabase db push

-- ============================================
-- ACHIEVEMENTS SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_type TEXT NOT NULL, -- 'skill_master', 'roadmap_complete', 'interview_ace', etc.
    badge_name TEXT NOT NULL,
    badge_description TEXT,
    badge_icon TEXT, -- emoji or icon name
    xp_earned INTEGER DEFAULT 0,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    skills_mastered INTEGER DEFAULT 0,
    interviews_completed INTEGER DEFAULT 0,
    roadmap_progress INTEGER DEFAULT 0, -- percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- MOCK INTERVIEW SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS public.mock_interviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    target_role_id UUID REFERENCES public.target_roles(id),
    interview_type TEXT NOT NULL, -- 'technical', 'behavioral', 'mixed'
    difficulty_level TEXT NOT NULL, -- 'easy', 'medium', 'hard'
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    overall_score NUMERIC(5,2),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    interview_id UUID REFERENCES public.mock_interviews(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- 'technical', 'behavioral', 'situational'
    difficulty TEXT NOT NULL,
    expected_points JSONB, -- key points expected in answer
    user_answer TEXT,
    user_answer_audio_url TEXT, -- if voice recording
    answer_duration_seconds INTEGER,
    score NUMERIC(5,2),
    feedback TEXT,
    strengths JSONB, -- array of strength points
    improvements JSONB, -- array of improvement suggestions
    answered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    question_order INTEGER DEFAULT 0
);

-- ============================================
-- ATS RESUME OPTIMIZER
-- ============================================
CREATE TABLE IF NOT EXISTS public.ats_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    target_role_id UUID REFERENCES public.target_roles(id),
    original_resume_text TEXT NOT NULL,
    optimized_resume_text TEXT,
    ats_score INTEGER, -- 0-100
    keyword_matches JSONB, -- matched keywords
    missing_keywords JSONB, -- keywords to add
    suggestions JSONB, -- optimization suggestions
    format_issues JSONB, -- formatting problems
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- JOB MATCHING SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    location TEXT,
    job_type TEXT, -- 'full-time', 'part-time', 'contract', 'internship'
    salary_range TEXT,
    job_url TEXT,
    job_description TEXT,
    required_skills JSONB,
    match_score INTEGER, -- 0-100
    skill_gaps JSONB,
    source TEXT, -- 'github', 'remotive', 'manual'
    is_saved BOOLEAN DEFAULT false,
    application_status TEXT, -- 'not_applied', 'applied', 'interview', 'offer', 'rejected'
    applied_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- LEARNING ANALYTICS
-- ============================================
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    skill_id UUID REFERENCES public.skills(id),
    session_duration_minutes INTEGER,
    session_type TEXT, -- 'practice', 'project', 'course', 'reading'
    notes TEXT,
    session_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mock Interviews
ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own interviews" ON public.mock_interviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own interviews" ON public.mock_interviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interviews" ON public.mock_interviews FOR UPDATE USING (auth.uid() = user_id);

-- Interview Questions
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their interview questions" ON public.interview_questions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.mock_interviews WHERE id = interview_questions.interview_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert interview questions" ON public.interview_questions FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.mock_interviews WHERE id = interview_questions.interview_id AND user_id = auth.uid()));
CREATE POLICY "Users can update interview questions" ON public.interview_questions FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM public.mock_interviews WHERE id = interview_questions.interview_id AND user_id = auth.uid()));

-- ATS Analyses
ALTER TABLE public.ats_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own ATS analyses" ON public.ats_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own ATS analyses" ON public.ats_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ATS analyses" ON public.ats_analyses FOR UPDATE USING (auth.uid() = user_id);

-- Job Matches
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own job matches" ON public.job_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own job matches" ON public.job_matches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own job matches" ON public.job_matches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own job matches" ON public.job_matches FOR DELETE USING (auth.uid() = user_id);

-- Learning Sessions
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sessions" ON public.learning_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sessions" ON public.learning_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_achievements_earned_at ON public.achievements(earned_at DESC);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_mock_interviews_user_id ON public.mock_interviews(user_id);
CREATE INDEX idx_mock_interviews_status ON public.mock_interviews(status);
CREATE INDEX idx_interview_questions_interview_id ON public.interview_questions(interview_id);
CREATE INDEX idx_ats_analyses_user_id ON public.ats_analyses(user_id);
CREATE INDEX idx_job_matches_user_id ON public.job_matches(user_id);
CREATE INDEX idx_job_matches_match_score ON public.job_matches(match_score DESC);
CREATE INDEX idx_learning_sessions_user_id ON public.learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_date ON public.learning_sessions(session_date DESC);

-- ============================================
-- SEED DATA: Badge Types
-- ============================================
COMMENT ON TABLE public.achievements IS 'Badge types: first_login, skill_master, roadmap_complete, interview_ace, job_hunter, streak_warrior, level_up, resume_optimizer';

-- ============================================
-- FUNCTIONS FOR XP AND LEVELING
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Level formula: level = floor(sqrt(xp / 100)) + 1
    -- Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
    RETURN FLOOR(SQRT(xp::NUMERIC / 100)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update level based on total XP
    NEW.level := public.calculate_level(NEW.total_xp);
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_level
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    WHEN (OLD.total_xp IS DISTINCT FROM NEW.total_xp)
    EXECUTE FUNCTION public.update_user_progress();

-- ============================================
-- FUNCTION TO INCREMENT USER XP
-- ============================================
CREATE OR REPLACE FUNCTION public.increment_user_xp(
    p_user_id UUID,
    p_xp_amount INTEGER
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_progress (user_id, total_xp)
    VALUES (p_user_id, p_xp_amount)
    ON CONFLICT (user_id)
    DO UPDATE SET 
        total_xp = user_progress.total_xp + p_xp_amount,
        updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
