# System Architecture - AI Career Copilot

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                             │
│                    (React + TypeScript + Tailwind)                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         ROUTING LAYER                                │
│                      (React Router v6)                               │
│                                                                       │
│  / (Index) → Landing Page                                           │
│  /auth → Authentication                                              │
│  /onboarding → 4-Step Wizard                                        │
│  /skills → Skill Input                                              │
│  /dashboard → Main Dashboard                                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        STATE MANAGEMENT                              │
│                    (React Query + Context)                           │
│                                                                       │
│  • useAuth() → Authentication state                                 │
│  • useProfile() → User profile & target role                       │
│  • useSkills() → Skills library                                    │
│  • useUserSkills() → User's skills                                 │
│  • useRoadmap() → Roadmap & projects                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SUPABASE CLIENT                               │
│                   (PostgreSQL + Auth + Edge)                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
          ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
          │   DATABASE   │  │ EDGE FUNCTIONS│  │     AUTH     │
          │  (Postgres)  │  │    (Deno)     │  │  (Supabase)  │
          └─────────────┘  └──────────────┘  └──────────────┘
                  │                │                  │
                  │                │                  │
          ┌───────┴────────┐      │          ┌───────┴────────┐
          │                 │      │          │                 │
    ┌─────▼──────┐   ┌─────▼──────┐  │    ┌──▼───┐   ┌──────▼────┐
    │  profiles  │   │target_roles│  │    │Users │   │ Sessions  │
    └────────────┘   └────────────┘  │    └──────┘   └───────────┘
    ┌────────────┐   ┌────────────┐  │
    │   skills   │   │user_skills │  │    ┌──────────────────────┐
    └────────────┘   └────────────┘  │    │  analyze-skills      │
    ┌────────────┐   ┌────────────┐  └───▶│  • Skill extraction  │
    │  roadmaps  │   │  projects  │       │  • Gap analysis      │
    └────────────┘   └────────────┘       │  • Roadmap gen       │
                                           │  • Project ideas     │
                                           └──────────────────────┘
                                           ┌──────────────────────┐
                                           │  github-profile      │
                                           │  • Fetch repos       │
                                           │  • Extract languages │
                                           │  • Parse topics      │
                                           └──────────────────────┘
```

## Data Flow

### 1. User Authentication Flow
```
User → Auth Page → Supabase Auth → Profile Creation → Onboarding
```

### 2. Onboarding Flow
```
Step 1: Name → Step 2: Education → Step 3: Career Goal → Step 4: Target Role
     ↓
Profile Updated → Redirect to Skill Input
```

### 3. Skill Analysis Flow
```
Resume Text / GitHub / Manual Selection
     ↓
Edge Function (analyze-skills)
     ↓
AI Extraction & Normalization
     ↓
Save to user_skills table
     ↓
Gap Analysis
     ↓
Generate Roadmap & Projects
     ↓
Save to roadmaps & project_recommendations
     ↓
Display Dashboard
```

### 4. Dashboard Data Flow
```
Dashboard Component
     ↓
useProfile() → Fetch profile & target role
     ↓
useUserSkills() → Fetch user's skills
     ↓
useRoadmap() → Fetch roadmap & projects
     ↓
Render UI with all data
```

## Component Hierarchy

```
App
├── BrowserRouter
│   └── Routes
│       ├── Index (Landing Page)
│       ├── Auth (Login/Signup)
│       ├── Protected Routes
│       │   ├── Onboarding
│       │   ├── SkillInput
│       │   └── Dashboard
│       └── NotFound
└── Providers
    ├── AuthProvider (useAuth context)
    ├── QueryClientProvider (React Query)
    └── TooltipProvider (UI)
```

## Database Schema Relationships

```
auth.users (Supabase Auth)
     │
     ├─1:1─▶ profiles
     │           └──▶ target_roles (FK)
     │
     ├─1:N─▶ user_skills
     │           └──▶ skills (FK)
     │
     ├─1:1─▶ roadmaps
     │           └──▶ target_roles (FK)
     │
     └─1:N─▶ project_recommendations
```

## Security Layers

```
┌─────────────────────────────────────────┐
│         CLIENT-SIDE                      │
│  • Input validation                      │
│  • Type checking (TypeScript)            │
│  • Protected routes                      │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         API LAYER                        │
│  • Authentication required               │
│  • Rate limiting                         │
│  • CORS policies                         │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         DATABASE                         │
│  • Row Level Security (RLS)             │
│  • User-scoped access                   │
│  • Foreign key constraints              │
│  • Data validation                      │
└─────────────────────────────────────────┘
```

## Technology Stack Layers

```
┌─────────────────────────────────────────┐
│         PRESENTATION                     │
│  React 18 + TypeScript + Tailwind CSS   │
│  shadcn/ui Components                   │
│  Lucide Icons                           │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         APPLICATION                      │
│  React Router (Routing)                 │
│  React Query (Data Fetching)            │
│  Custom Hooks (Business Logic)          │
│  Context API (Global State)             │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         DATA                             │
│  Supabase Client (API)                  │
│  PostgreSQL (Database)                  │
│  RLS Policies (Security)                │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         INFRASTRUCTURE                   │
│  Supabase (Backend Platform)            │
│  Edge Functions (Deno Runtime)          │
│  GROQ AI (AI Processing)                │
│  GitHub API (Data Source)               │
└─────────────────────────────────────────┘
```

## Request Flow Example

### Skill Extraction Request

```
1. User pastes resume → SkillInput Component

2. Component calls Edge Function:
   POST /functions/v1/analyze-skills
   Body: { type: 'extract', resumeText: '...' }

3. Edge Function:
   • Validates request
   • Calls GROQ AI API
   • Processes AI response
   • Returns normalized skills

4. Component receives response:
   { skills: [...], experience_level: '...' }

5. Component saves to database:
   INSERT INTO user_skills (user_id, skill_id, proficiency, source)

6. Triggers gap analysis:
   POST /functions/v1/analyze-skills
   Body: { type: 'gap-analysis', ... }

7. Generates roadmap:
   POST /functions/v1/analyze-skills
   Body: { type: 'roadmap', ... }

8. Generates projects:
   POST /functions/v1/analyze-skills
   Body: { type: 'projects', ... }

9. Redirects to Dashboard

10. Dashboard fetches all data and displays
```

## Performance Optimizations

```
┌─────────────────────────────────────────┐
│         FRONTEND                         │
│  • Code splitting (React.lazy)          │
│  • Memoization (useMemo, useCallback)   │
│  • React Query caching                  │
│  • Optimistic updates                   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         DATABASE                         │
│  • Indexed foreign keys                 │
│  • Optimized queries                    │
│  • Connection pooling                   │
│  • Efficient RLS policies               │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         EDGE FUNCTIONS                   │
│  • Minimal dependencies                 │
│  • Parallel processing                  │
│  • Response streaming                   │
│  • Error handling                       │
└─────────────────────────────────────────┘
```

## Deployment Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Netlify/   │────▶│   Supabase   │────▶│   GROQ AI   │
│   Vercel     │     │   Platform   │     │  (AI Model) │
│  (Frontend)  │     │  (Backend)   │     │            │
└──────────────┘     └──────────────┘     └──────────────┘
       │                     │
       │                     │
       ▼                     ▼
┌──────────────┐     ┌──────────────┐
│     CDN      │     │  PostgreSQL  │
│  (Assets)    │     │  (Database)  │
└──────────────┘     └──────────────┘
```

---

This architecture provides:
- ✅ Scalability (serverless functions, static frontend)
- ✅ Security (RLS, authentication, input validation)
- ✅ Performance (caching, indexes, code splitting)
- ✅ Maintainability (clean separation, typed code)
- ✅ Extensibility (modular design, clear interfaces)
