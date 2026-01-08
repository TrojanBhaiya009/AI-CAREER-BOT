# Contributing to AI Career Copilot

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites
- Node.js 18+ or Bun
- Git
- Supabase CLI
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone and install:**
```bash
git clone <repository-url>
cd skill-compass
npm install  # or bun install
```

2. **Set up Supabase locally (optional):**
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Start development server:**
```bash
npm run dev  # or bun run dev
```

## Project Architecture

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── NavLink.tsx     # Custom navigation component
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication
│   ├── useProfile.tsx  # User profile management
│   ├── useSkills.tsx   # Skills CRUD
│   └── useRoadmap.tsx  # Roadmap and projects
├── integrations/       # External services
│   └── supabase/       # Supabase client and types
├── lib/                # Utilities
│   └── utils.ts        # Helper functions
└── pages/              # Route pages
    ├── Index.tsx       # Landing page
    ├── Auth.tsx        # Authentication
    ├── Onboarding.tsx  # User onboarding
    ├── SkillInput.tsx  # Skill collection
    └── Dashboard.tsx   # Main dashboard
```

### Key Technologies

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- React Router for routing
- React Query for data fetching
- Tailwind CSS for styling
- shadcn/ui for components

**Backend:**
- Supabase PostgreSQL database
- Supabase Auth for authentication
- Supabase Edge Functions (Deno)
- Row Level Security (RLS)

## Code Style

### TypeScript
```typescript
// ✅ Use explicit types
interface Profile {
  id: string;
  full_name: string;
  education_level: string;
}

// ✅ Use const for immutable values
const MAX_SKILLS = 100;

// ✅ Use meaningful variable names
const userSkillsWithProficiency = ...;

// ❌ Avoid
var x = ...;
let data: any = ...;
```

### React Components
```typescript
// ✅ Functional components with TypeScript
interface Props {
  title: string;
  onClick: () => void;
}

export function MyComponent({ title, onClick }: Props) {
  return <button onClick={onClick}>{title}</button>;
}

// ✅ Use hooks at the top
export function MyComponent() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  
  // Component logic...
}

// ✅ Extract complex logic to custom hooks
function useComplexLogic() {
  // Logic here
  return { data, loading, error };
}
```

### Styling
```typescript
// ✅ Use Tailwind classes
<div className="flex items-center gap-4 p-6 rounded-lg bg-card">

// ✅ Use shadcn/ui variants
<Button variant="outline" size="lg">Click me</Button>

// ✅ Use cn() for conditional classes
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)}>
```

## Adding New Features

### 1. New Page
```typescript
// src/pages/MyNewPage.tsx
export default function MyNewPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Page content */}
    </div>
  );
}

// Add route in App.tsx
<Route path="/new-page" element={
  <ProtectedRoute>
    <MyNewPage />
  </ProtectedRoute>
} />
```

### 2. New Hook
```typescript
// src/hooks/useMyFeature.tsx
export function useMyFeature() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    // Implementation
  };
  
  return { data, loading };
}
```

### 3. New Database Table
```sql
-- supabase/migrations/new_migration.sql
CREATE TABLE public.my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their own data"
ON public.my_table FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

### 4. New Edge Function
```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { param } = await req.json();
    
    // Function logic
    
    return new Response(
      JSON.stringify({ result: 'success' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## Testing

### Manual Testing Checklist
- [ ] Authentication (sign up, sign in, sign out)
- [ ] Onboarding flow (all 4 steps)
- [ ] Skill input (all 3 methods)
- [ ] AI features (extraction, analysis, roadmap)
- [ ] Dashboard (all cards render correctly)
- [ ] Mobile responsiveness
- [ ] Error handling (network errors, invalid inputs)

### Testing Edge Functions
```bash
# Start functions locally
supabase functions serve

# Test with curl
curl -X POST http://localhost:54321/functions/v1/analyze-skills \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "extract", "resumeText": "Test resume"}'
```

## Common Tasks

### Update Database Schema
```bash
# Create new migration
supabase migration new my_changes

# Edit the .sql file
# Then push changes
supabase db push
```

### Add New UI Component
```bash
# Using shadcn/ui CLI
npx shadcn-ui@latest add component-name
```

### Update Types
```bash
# Regenerate Supabase types after schema changes
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## Debugging

### Database Issues
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- View table structure
\d+ your_table

-- Check current user
SELECT auth.uid();
```

### Edge Function Logs
```bash
# View real-time logs
supabase functions logs analyze-skills --follow

# View specific invocation
supabase functions logs analyze-skills --limit 1
```

### React Query DevTools
```typescript
// Add to App.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

## Git Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit Messages
```
feat: Add skill category filter
fix: Resolve authentication redirect loop
docs: Update API documentation
refactor: Extract roadmap logic to hook
style: Format code with Prettier
test: Add unit tests for useProfile hook
```

### Pull Request Process
1. Create feature branch from `main`
2. Make changes and commit
3. Push to remote and create PR
4. Wait for review and tests
5. Merge after approval

## Performance Optimization

### Database Queries
```typescript
// ✅ Good: Select specific fields
.select('id, name, category')

// ✅ Good: Use indexes (already in migrations)
.eq('user_id', userId)  // Indexed field

// ❌ Avoid: Nested queries without limits
.select('*, skills(*)')  // Can be slow
```

### React Performance
```typescript
// ✅ Use memo for expensive calculations
const expensiveValue = useMemo(() => 
  computeExpensive(data), 
  [data]
);

// ✅ Use callback for stable functions
const handleClick = useCallback(() => {
  // Handler logic
}, [deps]);

// ✅ Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

## Security Best Practices

### Input Validation
```typescript
// ✅ Validate all user inputs
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const result = schema.safeParse(data);
```

### Environment Variables
```typescript
// ✅ Never commit secrets
// ✅ Use VITE_ prefix for client-side vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// ❌ Never expose service role key in client
```

### RLS Policies
```sql
-- ✅ Always use auth.uid() for user checks
CREATE POLICY "name" ON table
USING (auth.uid() = user_id);

-- ✅ Test policies thoroughly
-- ❌ Never disable RLS on production tables
```

## Resources

### Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [VS Code Extensions](https://code.visualstudio.com/)
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

## Getting Help

- Check existing [Issues](link-to-issues)
- Read [API Documentation](./API.md)
- Review [Implementation Guide](./IMPLEMENTATION.md)
- Ask in [Discussions](link-to-discussions)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Report issues professionally

---

Happy coding! 🚀
