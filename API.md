# API Documentation - AI Career Copilot

## Table of Contents
- [Authentication](#authentication)
- [Database Tables](#database-tables)
- [Edge Functions](#edge-functions)
- [Client Hooks](#client-hooks)

---

## Authentication

### Sign Up
```typescript
const { user, error } = await signUp(email, password, fullName);
```

### Sign In
```typescript
const { user, error } = await signIn(email, password);
```

### Sign Out
```typescript
await signOut();
```

---

## Database Tables

### Profiles
User profile information and settings.

**Schema:**
```typescript
{
  id: UUID (PK)
  user_id: UUID (FK to auth.users) UNIQUE
  full_name: TEXT
  education_level: TEXT
  career_goal: 'internship' | 'full_time'
  target_role_id: UUID (FK to target_roles)
  onboarding_completed: BOOLEAN
  github_username: TEXT
  resume_text: TEXT
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

**Access:**
- Users can view/update their own profile
- Auto-created on signup

**Example Query:**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('*, target_role:target_roles(*)')
  .eq('user_id', user.id)
  .single();
```

### Target Roles
Predefined career roles with required skills.

**Schema:**
```typescript
{
  id: UUID (PK)
  name: TEXT UNIQUE
  category: 'tech' | 'marketing' | 'sales' | 'hr' | 'finance'
  description: TEXT
  required_skills: JSONB (array of skill names)
  created_at: TIMESTAMP
}
```

**Access:**
- Public read for authenticated users

**Example Query:**
```typescript
const { data: roles } = await supabase
  .from('target_roles')
  .select('*')
  .order('name');
```

### Skills
Master skill library organized by category.

**Schema:**
```typescript
{
  id: UUID (PK)
  name: TEXT UNIQUE
  category: 'programming_languages' | 'frameworks_libraries' | 'tools_platforms' | 'soft_skills' | 'domain_specific' | 'concepts'
  aliases: TEXT[] (alternate names)
  created_at: TIMESTAMP
}
```

**Access:**
- Public read for authenticated users

**Example Query:**
```typescript
const { data: skills } = await supabase
  .from('skills')
  .select('*')
  .eq('category', 'programming_languages')
  .order('name');
```

### User Skills
User's extracted/selected skills with proficiency levels.

**Schema:**
```typescript
{
  id: UUID (PK)
  user_id: UUID (FK to auth.users)
  skill_id: UUID (FK to skills)
  proficiency: 'missing' | 'weak' | 'strong'
  source: TEXT ('resume' | 'github' | 'manual')
  created_at: TIMESTAMP
}
```

**Access:**
- Users can CRUD their own skills

**Example Query:**
```typescript
const { data: userSkills } = await supabase
  .from('user_skills')
  .select('*, skill:skills(*)')
  .eq('user_id', user.id);
```

### Roadmaps
Generated learning plans stored per user.

**Schema:**
```typescript
{
  id: UUID (PK)
  user_id: UUID (FK to auth.users) UNIQUE
  target_role_id: UUID (FK to target_roles)
  skill_match_percentage: INTEGER (0-100)
  phase_1: JSONB (30-day plan)
  phase_2: JSONB (60-day plan)
  phase_3: JSONB (90-day plan)
  generated_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

**Phase Structure:**
```typescript
{
  title: string;
  duration: string;
  skills: string[];
  goals: string[];
  resources: string[];
  project: {
    name: string;
    description: string;
  };
}
```

**Access:**
- Users can view/update their own roadmap

**Example Query:**
```typescript
const { data: roadmap } = await supabase
  .from('roadmaps')
  .select('*')
  .eq('user_id', user.id)
  .single();
```

### Project Recommendations
AI-generated portfolio project ideas.

**Schema:**
```typescript
{
  id: UUID (PK)
  user_id: UUID (FK to auth.users)
  title: TEXT
  description: TEXT
  skills_covered: TEXT[] (array of skill names)
  difficulty: TEXT ('beginner' | 'intermediate' | 'advanced')
  estimated_time: TEXT (e.g., "2-3 weeks")
  why_this_project: TEXT
  created_at: TIMESTAMP
}
```

**Access:**
- Users can view/delete their own projects

**Example Query:**
```typescript
const { data: projects } = await supabase
  .from('project_recommendations')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

---

## Edge Functions

### analyze-skills

AI-powered skill analysis and roadmap generation.

**Endpoint:** `https://your-project.supabase.co/functions/v1/analyze-skills`

**Request Types:**

#### 1. Skill Extraction
Extract skills from resume text, GitHub data, or manual selection.

```typescript
POST /functions/v1/analyze-skills
{
  type: 'extract',
  resumeText?: string,
  githubData?: {
    languages: string[],
    topics: string[]
  },
  manualSkills?: string[]
}
```

**Response:**
```typescript
{
  skills: [
    {
      name: string,
      category: string,
      confidence: 'high' | 'medium' | 'low'
    }
  ],
  experience_level: 'beginner' | 'intermediate' | 'advanced'
}
```

#### 2. Gap Analysis
Compare user skills against target role requirements.

```typescript
POST /functions/v1/analyze-skills
{
  type: 'gap-analysis',
  targetRole: string,
  requiredSkills: string[],
  userSkills: string[]
}
```

**Response:**
```typescript
{
  analysis: [
    {
      skill: string,
      status: 'strong' | 'weak' | 'missing',
      priority: 'high' | 'medium' | 'low',
      reason: string
    }
  ],
  overall_match_percentage: number,
  top_priorities: string[]
}
```

#### 3. Roadmap Generation
Create 30-60-90 day learning roadmap.

```typescript
POST /functions/v1/analyze-skills
{
  type: 'roadmap',
  targetRole: string,
  skillGaps: {
    missing: string[],
    weak: string[]
  }
}
```

**Response:**
```typescript
{
  phase_1: RoadmapPhase,
  phase_2: RoadmapPhase,
  phase_3: RoadmapPhase
}
```

#### 4. Project Recommendations
Generate portfolio project ideas.

```typescript
POST /functions/v1/analyze-skills
{
  type: 'projects',
  targetRole: string,
  skillGaps: {
    missing: string[],
    weak: string[]
  },
  userSkills: string[]
}
```

**Response:**
```typescript
{
  projects: [
    {
      title: string,
      description: string,
      skills_covered: string[],
      difficulty: 'beginner' | 'intermediate' | 'advanced',
      estimated_time: string,
      why_this_project: string
    }
  ]
}
```

**Error Response:**
```typescript
{
  error: string,
  details?: any
}
```

### github-profile

Fetch GitHub profile and repository data.

**Endpoint:** `https://your-project.supabase.co/functions/v1/github-profile`

**Request:**
```typescript
POST /functions/v1/github-profile
{
  username: string
}
```

**Response:**
```typescript
{
  languages: string[],      // Programming languages from repos
  topics: string[],          // Repository topics
  totalRepos: number,
  totalContributions: number
}
```

**Error Response:**
```typescript
{
  error: string,
  message?: string
}
```

---

## Client Hooks

### useAuth()
Authentication state and methods.

```typescript
const { 
  user,           // Current user object
  loading,        // Authentication loading state
  signIn,         // (email, password) => Promise
  signUp,         // (email, password, fullName) => Promise
  signOut         // () => Promise
} = useAuth();
```

### useProfile()
User profile data and methods.

```typescript
const { 
  profile,        // User profile object
  targetRole,     // Populated target role
  loading,        // Profile loading state
  updateProfile   // (updates) => Promise
} = useProfile();
```

### useSkills()
Master skill library.

```typescript
const { 
  skills,               // All skills array
  loading,              // Skills loading state
  getSkillsByCategory   // () => Record<category, Skill[]>
} = useSkills();
```

### useUserSkills()
User's skill management.

```typescript
const { 
  userSkills,     // User's skills with proficiency
  loading,        // Loading state
  addUserSkills,  // (skillData[]) => Promise
  clearUserSkills // () => Promise
} = useUserSkills();
```

### useRoadmap()
Roadmap and project management.

```typescript
const { 
  roadmap,        // User's roadmap
  projects,       // User's project recommendations
  loading,        // Loading state
  saveRoadmap,    // (roadmapData) => Promise
  saveProjects    // (projectsData) => Promise
} = useRoadmap();
```

---

## Rate Limits

### Supabase
- **Database queries:** Unlimited on free tier
- **Auth operations:** 60 requests/minute
- **Edge functions:** 2M invocations/month (free tier)

### GitHub API
- **Without token:** 60 requests/hour
- **With token:** 5,000 requests/hour

### GROQ AI
- Check current limits at console.groq.com
- Typically based on subscription tier

---

## Error Handling

### Standard Error Response
```typescript
{
  error: {
    message: string,
    status: number,
    details?: any
  }
}
```

### Common Errors

**401 Unauthorized**
- User not authenticated
- Session expired
- Invalid credentials

**403 Forbidden**
- RLS policy violation
- Insufficient permissions

**404 Not Found**
- Resource doesn't exist
- Invalid ID

**429 Too Many Requests**
- Rate limit exceeded
- Retry after cooldown

**500 Internal Server Error**
- Database error
- Edge function error
- AI service error

---

## Best Practices

### Query Optimization
```typescript
// ✅ Good: Select only needed fields
.select('id, name, category')

// ❌ Bad: Select all with complex relations
.select('*')
```

### Error Handling
```typescript
// ✅ Good: Handle errors gracefully
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  return data;
} catch (error) {
  toast({ title: 'Error', description: error.message });
}
```

### Type Safety
```typescript
// ✅ Good: Use generated types
import { Database } from '@/integrations/supabase/types';
type Profile = Database['public']['Tables']['profiles']['Row'];
```

---

## Testing

### Test User Creation
```bash
# Create test users via Supabase dashboard
# Or use API
curl -X POST https://your-project.supabase.co/auth/v1/signup \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Test Edge Functions Locally
```bash
supabase functions serve analyze-skills

# Test with curl
curl -X POST http://localhost:54321/functions/v1/analyze-skills \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "extract", "resumeText": "Software engineer with Python and React experience"}'
```

---

For more information, see the main [README.md](./README.md) and [IMPLEMENTATION.md](./IMPLEMENTATION.md).
