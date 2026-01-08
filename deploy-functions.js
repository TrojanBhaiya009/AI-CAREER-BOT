import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_REF = 'cartaqqegfrqfqeoirhz';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcnRhcXFlZ2ZycWZxZW9pcmh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzUyMjM4NCwiZXhwIjoyMDgzMDk4Mzg0fQ.GJmrmhkrPSXLLsWXAsRk5mmZrwGmlQmLMvro68kQmoI';

// Read function files
const githubProfileCode = fs.readFileSync(
  path.join(__dirname, 'supabase', 'functions', 'github-profile', 'index.ts'),
  'utf-8'
);

const analyzeSkillsCode = fs.readFileSync(
  path.join(__dirname, 'supabase', 'functions', 'analyze-skills', 'index.ts'),
  'utf-8'
);

const functions = [
  {
    name: 'github-profile',
    code: githubProfileCode,
  },
  {
    name: 'analyze-skills',
    code: analyzeSkillsCode,
  }
];

const secrets = [
  {
    name: 'GITHUB_TOKEN',
    value: 'your_github_personal_access_token',
  },
  {
    name: 'GROQ_API_KEY',
    value: 'your_groq_api_key',
  }
];

async function deployFunctions() {
  console.log('🚀 Starting deployment to Supabase Edge Functions...\n');

  // Deploy each function
  for (const func of functions) {
    try {
      console.log(`📦 Deploying ${func.name}...`);

      const response = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/${func.name}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug: func.name,
            name: func.name,
            body: func.code,
            verify_jwt: false,
          }),
        }
      );

      if (response.ok) {
        console.log(`✅ ${func.name} deployed successfully!`);
      } else {
        const error = await response.text();
        console.error(`❌ Failed to deploy ${func.name}:`, error);
      }
    } catch (error) {
      console.error(`❌ Error deploying ${func.name}:`, error.message);
    }
  }

  // Set secrets
  console.log('\n🔐 Setting secrets...');
  for (const secret of secrets) {
    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/secrets`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([{
            name: secret.name,
            value: secret.value,
          }]),
        }
      );

      if (response.ok) {
        console.log(`✅ Secret ${secret.name} set successfully!`);
      } else {
        const error = await response.text();
        console.error(`❌ Failed to set secret ${secret.name}:`, error);
      }
    } catch (error) {
      console.error(`❌ Error setting secret ${secret.name}:`, error.message);
    }
  }

  console.log('\n✨ Deployment complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Verify functions at: https://supabase.com/dashboard/project/cartaqqegfrqfqeoirhz/functions');
  console.log('2. Test the application at: http://localhost:8080');
  console.log('3. Check function logs if any issues occur');
}

deployFunctions().catch(console.error);
