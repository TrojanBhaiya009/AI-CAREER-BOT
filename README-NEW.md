# AI Career Copilot 🚀

> Your intelligent partner for career readiness. Get personalized skill analysis, learning roadmaps, and portfolio projects tailored to your dream role.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)

## 🌟 Features

- **🎯 Smart Skill Gap Analysis** - Identify exactly what skills you need for your target role
- **📈 30-60-90 Day Roadmap** - Get a structured learning plan with clear milestones
- **💡 Portfolio Projects** - Build real projects that showcase your abilities to employers
- **🤖 AI-Powered Insights** - Leverages AI for skill extraction and personalized recommendations
- **📊 Progress Tracking** - Monitor your skill development journey

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Supabase account
- GROQ API key (for AI features)

### Installation

```bash
# Install dependencies
npm install
# or
bun install

# Set up environment variables (see .env.example)
cp .env.example .env

# Run development server
npm run dev
# or
bun run dev
```

Visit `http://localhost:5173` to see the app in action.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui
- **State Management:** React Query
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **AI:** GROQ AI for skill analysis and recommendations

## 📋 User Journey

1. **Sign Up** - Create your account
2. **Onboard** - Complete 4-step wizard (name, education, goal, role)
3. **Input Skills** - Paste resume, connect GitHub, or select manually
4. **Get Analysis** - View skill gaps and match percentage
5. **Explore Roadmap** - See your 30-60-90 day plan
6. **Build Projects** - Start portfolio projects
7. **Track Progress** - Monitor growth on dashboard

## 🎯 Target Roles (23 across 5 categories)

- 💻 **Technology** (9): Frontend, Backend, Full Stack, Data Analyst, ML Engineer, DevOps, QA, UI/UX, Product Manager
- 📢 **Marketing** (4): Content, SEO, Social Media, Growth
- 💼 **Sales** (3): SDR, Account Executive, Business Development
- 👥 **HR** (3): Recruiter, HR Generalist, People Ops
- 📊 **Finance** (3): Financial Analyst, Accountant, FP&A

## 📂 Project Structure

```
skill-compass/
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks (useAuth, useProfile, useSkills, useRoadmap)
│   ├── pages/           # Page components (Auth, Onboarding, SkillInput, Dashboard)
│   ├── integrations/    # Supabase integration
│   └── lib/             # Utility functions
├── supabase/
│   ├── functions/       # Edge functions (analyze-skills, github-profile)
│   └── migrations/      # Database migrations
└── public/              # Static assets
```

## 🔐 Security

- Row Level Security (RLS) on all database tables
- Secure authentication with Supabase Auth
- Environment variables for sensitive data
- Input validation and sanitization

## 📖 Documentation

For detailed implementation notes, see [IMPLEMENTATION.md](./IMPLEMENTATION.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Backend powered by [Supabase](https://supabase.com/)
- AI powered by [GROQ](https://groq.com/)

---

Made with ❤️ for aspiring professionals everywhere
