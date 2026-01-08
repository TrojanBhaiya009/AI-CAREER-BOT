-- Create enum for experience levels
CREATE TYPE public.experience_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create enum for career goals
CREATE TYPE public.career_goal AS ENUM ('internship', 'full_time');

-- Create enum for skill proficiency
CREATE TYPE public.skill_proficiency AS ENUM ('missing', 'weak', 'strong');

-- Create enum for skill categories
CREATE TYPE public.skill_category AS ENUM (
  'programming_languages',
  'frameworks_libraries',
  'tools_platforms',
  'soft_skills',
  'domain_specific',
  'concepts'
);

-- Create enum for role categories
CREATE TYPE public.role_category AS ENUM (
  'tech',
  'marketing',
  'sales',
  'hr',
  'finance'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  education_level TEXT,
  career_goal public.career_goal,
  target_role_id UUID,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  github_username TEXT,
  resume_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create target_roles table with required skills mapping
CREATE TABLE public.target_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category public.role_category NOT NULL,
  description TEXT,
  required_skills JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create master skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category public.skill_category NOT NULL,
  aliases TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_skills table to track user's skills
CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
  proficiency public.skill_proficiency DEFAULT 'weak',
  source TEXT, -- 'resume', 'github', 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Create roadmaps table
CREATE TABLE public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  target_role_id UUID REFERENCES public.target_roles(id),
  skill_match_percentage INTEGER DEFAULT 0,
  phase_1 JSONB DEFAULT '{}'::jsonb,
  phase_2 JSONB DEFAULT '{}'::jsonb,
  phase_3 JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_recommendations table
CREATE TABLE public.project_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  skills_covered TEXT[] DEFAULT '{}',
  difficulty TEXT,
  estimated_time TEXT,
  why_this_project TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for target_role_id in profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_target_role 
FOREIGN KEY (target_role_id) REFERENCES public.target_roles(id);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_recommendations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Target roles are public readable
CREATE POLICY "Anyone can view target roles"
ON public.target_roles FOR SELECT
TO authenticated
USING (true);

-- Skills are public readable
CREATE POLICY "Anyone can view skills"
ON public.skills FOR SELECT
TO authenticated
USING (true);

-- User skills policies
CREATE POLICY "Users can view their own skills"
ON public.user_skills FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills"
ON public.user_skills FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
ON public.user_skills FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
ON public.user_skills FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Roadmaps policies
CREATE POLICY "Users can view their own roadmap"
ON public.roadmaps FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmap"
ON public.roadmaps FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmap"
ON public.roadmaps FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Project recommendations policies
CREATE POLICY "Users can view their own projects"
ON public.project_recommendations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
ON public.project_recommendations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.project_recommendations FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at
BEFORE UPDATE ON public.roadmaps
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert seed data for target roles
INSERT INTO public.target_roles (name, category, description, required_skills) VALUES
-- Tech roles
('Frontend Developer', 'tech', 'Build user interfaces and web applications', '["JavaScript", "React", "HTML", "CSS", "TypeScript", "Git", "Responsive Design", "REST APIs"]'),
('Backend Developer', 'tech', 'Build server-side applications and APIs', '["Python", "Node.js", "SQL", "REST APIs", "Git", "Docker", "Database Design", "Authentication"]'),
('Full Stack Developer', 'tech', 'Build complete web applications end-to-end', '["JavaScript", "React", "Node.js", "SQL", "Git", "REST APIs", "HTML", "CSS", "Docker"]'),
('Data Analyst', 'tech', 'Analyze data to drive business decisions', '["Python", "SQL", "Excel", "Data Visualization", "Statistics", "Pandas", "Power BI", "Critical Thinking"]'),
('ML Engineer', 'tech', 'Build and deploy machine learning models', '["Python", "Machine Learning", "TensorFlow", "PyTorch", "SQL", "Statistics", "Docker", "Git"]'),
('DevOps Engineer', 'tech', 'Manage infrastructure and deployment pipelines', '["Docker", "Kubernetes", "AWS", "Linux", "CI/CD", "Git", "Terraform", "Python"]'),
('QA Engineer', 'tech', 'Ensure software quality through testing', '["Test Automation", "Selenium", "Python", "SQL", "API Testing", "Git", "Agile", "Critical Thinking"]'),
('UI/UX Designer', 'tech', 'Design user experiences and interfaces', '["Figma", "User Research", "Prototyping", "Visual Design", "Wireframing", "Design Systems", "HTML", "CSS"]'),
('Product Manager', 'tech', 'Lead product development and strategy', '["Product Strategy", "User Research", "Agile", "Data Analysis", "Communication", "Roadmapping", "SQL", "A/B Testing"]'),
-- Marketing roles
('Content Marketer', 'marketing', 'Create and distribute valuable content', '["Content Writing", "SEO", "Social Media", "Analytics", "Content Strategy", "Copywriting", "Email Marketing", "CMS"]'),
('SEO Specialist', 'marketing', 'Optimize content for search engines', '["SEO", "Google Analytics", "Keyword Research", "Content Strategy", "HTML", "Link Building", "Technical SEO", "Data Analysis"]'),
('Social Media Manager', 'marketing', 'Manage brand presence on social platforms', '["Social Media", "Content Creation", "Analytics", "Community Management", "Copywriting", "Paid Social", "Video Editing", "Brand Strategy"]'),
('Growth Marketer', 'marketing', 'Drive user acquisition and retention', '["Growth Strategy", "A/B Testing", "Analytics", "Paid Advertising", "Email Marketing", "SQL", "Conversion Optimization", "Marketing Automation"]'),
-- Sales roles
('Sales Development Rep', 'sales', 'Generate and qualify sales leads', '["Cold Outreach", "CRM", "Communication", "Lead Generation", "Sales Process", "Email Writing", "Research", "Objection Handling"]'),
('Account Executive', 'sales', 'Close deals and manage client relationships', '["Sales", "Negotiation", "CRM", "Presentation Skills", "Relationship Building", "Solution Selling", "Contract Management", "Industry Knowledge"]'),
('Business Development', 'sales', 'Identify and develop new business opportunities', '["Business Strategy", "Networking", "Market Research", "Partnership Development", "Negotiation", "CRM", "Presentation Skills", "Financial Analysis"]'),
-- HR roles
('Recruiter', 'hr', 'Source and hire talent for the organization', '["Talent Sourcing", "Interviewing", "ATS", "Employer Branding", "Negotiation", "LinkedIn Recruiting", "Communication", "Candidate Assessment"]'),
('HR Generalist', 'hr', 'Handle various HR functions and operations', '["HR Operations", "Employee Relations", "HRIS", "Compliance", "Onboarding", "Performance Management", "Benefits Administration", "Communication"]'),
('People Operations', 'hr', 'Build and optimize people processes', '["People Analytics", "Process Improvement", "HRIS", "Employee Experience", "Data Analysis", "Project Management", "Communication", "Change Management"]'),
-- Finance roles
('Financial Analyst', 'finance', 'Analyze financial data and create reports', '["Financial Modeling", "Excel", "Financial Analysis", "SQL", "Data Visualization", "Forecasting", "Accounting", "Presentation Skills"]'),
('Accountant', 'finance', 'Manage financial records and reporting', '["Accounting", "Excel", "Financial Reporting", "Bookkeeping", "Tax Preparation", "QuickBooks", "Compliance", "Attention to Detail"]'),
('FP&A Analyst', 'finance', 'Support financial planning and analysis', '["Financial Planning", "Budgeting", "Excel", "Financial Modeling", "Forecasting", "SQL", "Variance Analysis", "Business Acumen"]');

-- Insert seed data for skills
INSERT INTO public.skills (name, category, aliases) VALUES
-- Programming Languages
('JavaScript', 'programming_languages', ARRAY['JS', 'ECMAScript']),
('TypeScript', 'programming_languages', ARRAY['TS']),
('Python', 'programming_languages', ARRAY['Python3']),
('Java', 'programming_languages', ARRAY[]::TEXT[]),
('C++', 'programming_languages', ARRAY['CPP']),
('C#', 'programming_languages', ARRAY['CSharp']),
('Go', 'programming_languages', ARRAY['Golang']),
('Rust', 'programming_languages', ARRAY[]::TEXT[]),
('Ruby', 'programming_languages', ARRAY[]::TEXT[]),
('PHP', 'programming_languages', ARRAY[]::TEXT[]),
('Swift', 'programming_languages', ARRAY[]::TEXT[]),
('Kotlin', 'programming_languages', ARRAY[]::TEXT[]),
('SQL', 'programming_languages', ARRAY['MySQL', 'PostgreSQL', 'SQLite']),
('R', 'programming_languages', ARRAY[]::TEXT[]),
('HTML', 'programming_languages', ARRAY['HTML5']),
('CSS', 'programming_languages', ARRAY['CSS3', 'SCSS', 'Sass']),
-- Frameworks & Libraries
('React', 'frameworks_libraries', ARRAY['ReactJS', 'React.js']),
('Vue.js', 'frameworks_libraries', ARRAY['Vue', 'VueJS']),
('Angular', 'frameworks_libraries', ARRAY['AngularJS']),
('Node.js', 'frameworks_libraries', ARRAY['Node', 'NodeJS']),
('Express.js', 'frameworks_libraries', ARRAY['Express']),
('Django', 'frameworks_libraries', ARRAY[]::TEXT[]),
('Flask', 'frameworks_libraries', ARRAY[]::TEXT[]),
('Spring Boot', 'frameworks_libraries', ARRAY['Spring']),
('TensorFlow', 'frameworks_libraries', ARRAY['TF']),
('PyTorch', 'frameworks_libraries', ARRAY[]::TEXT[]),
('Pandas', 'frameworks_libraries', ARRAY[]::TEXT[]),
('Next.js', 'frameworks_libraries', ARRAY['NextJS']),
('Tailwind CSS', 'frameworks_libraries', ARRAY['Tailwind']),
-- Tools & Platforms
('Git', 'tools_platforms', ARRAY['GitHub', 'GitLab', 'Bitbucket']),
('Docker', 'tools_platforms', ARRAY[]::TEXT[]),
('Kubernetes', 'tools_platforms', ARRAY['K8s']),
('AWS', 'tools_platforms', ARRAY['Amazon Web Services']),
('Azure', 'tools_platforms', ARRAY['Microsoft Azure']),
('GCP', 'tools_platforms', ARRAY['Google Cloud Platform']),
('Linux', 'tools_platforms', ARRAY['Ubuntu', 'CentOS']),
('Figma', 'tools_platforms', ARRAY[]::TEXT[]),
('Jira', 'tools_platforms', ARRAY[]::TEXT[]),
('Excel', 'tools_platforms', ARRAY['Microsoft Excel', 'Google Sheets']),
('Power BI', 'tools_platforms', ARRAY[]::TEXT[]),
('Tableau', 'tools_platforms', ARRAY[]::TEXT[]),
('Selenium', 'tools_platforms', ARRAY[]::TEXT[]),
('Terraform', 'tools_platforms', ARRAY[]::TEXT[]),
('CI/CD', 'tools_platforms', ARRAY['Jenkins', 'GitHub Actions']),
('CRM', 'tools_platforms', ARRAY['Salesforce', 'HubSpot']),
('ATS', 'tools_platforms', ARRAY['Applicant Tracking System']),
('HRIS', 'tools_platforms', ARRAY['Human Resource Information System']),
('QuickBooks', 'tools_platforms', ARRAY[]::TEXT[]),
('Google Analytics', 'tools_platforms', ARRAY['GA4']),
-- Soft Skills
('Communication', 'soft_skills', ARRAY[]::TEXT[]),
('Problem Solving', 'soft_skills', ARRAY[]::TEXT[]),
('Critical Thinking', 'soft_skills', ARRAY[]::TEXT[]),
('Teamwork', 'soft_skills', ARRAY['Collaboration']),
('Leadership', 'soft_skills', ARRAY[]::TEXT[]),
('Time Management', 'soft_skills', ARRAY[]::TEXT[]),
('Adaptability', 'soft_skills', ARRAY[]::TEXT[]),
('Creativity', 'soft_skills', ARRAY[]::TEXT[]),
('Negotiation', 'soft_skills', ARRAY[]::TEXT[]),
('Presentation Skills', 'soft_skills', ARRAY['Public Speaking']),
('Attention to Detail', 'soft_skills', ARRAY[]::TEXT[]),
-- Concepts & Domain Skills
('REST APIs', 'concepts', ARRAY['RESTful APIs', 'API Design']),
('Database Design', 'concepts', ARRAY[]::TEXT[]),
('Authentication', 'concepts', ARRAY['OAuth', 'JWT']),
('Responsive Design', 'concepts', ARRAY['Mobile-First']),
('Machine Learning', 'concepts', ARRAY['ML']),
('Data Visualization', 'concepts', ARRAY[]::TEXT[]),
('Statistics', 'concepts', ARRAY[]::TEXT[]),
('Agile', 'concepts', ARRAY['Scrum', 'Kanban']),
('Test Automation', 'concepts', ARRAY[]::TEXT[]),
('API Testing', 'concepts', ARRAY[]::TEXT[]),
('User Research', 'concepts', ARRAY['UX Research']),
('Prototyping', 'concepts', ARRAY[]::TEXT[]),
('Visual Design', 'concepts', ARRAY[]::TEXT[]),
('Wireframing', 'concepts', ARRAY[]::TEXT[]),
('Design Systems', 'concepts', ARRAY[]::TEXT[]),
('Product Strategy', 'concepts', ARRAY[]::TEXT[]),
('A/B Testing', 'concepts', ARRAY['Split Testing']),
('SEO', 'concepts', ARRAY['Search Engine Optimization']),
('Content Writing', 'concepts', ARRAY['Copywriting']),
('Email Marketing', 'concepts', ARRAY[]::TEXT[]),
('Growth Strategy', 'concepts', ARRAY[]::TEXT[]),
('Financial Modeling', 'concepts', ARRAY[]::TEXT[]),
('Financial Analysis', 'concepts', ARRAY[]::TEXT[]),
('Accounting', 'concepts', ARRAY[]::TEXT[]),
('Forecasting', 'concepts', ARRAY[]::TEXT[]),
('Budgeting', 'concepts', ARRAY[]::TEXT[]);
