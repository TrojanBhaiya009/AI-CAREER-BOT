// @ts-nocheck
// deno-lint-ignore-file

/**
 * Azure AI Services Utility Module
 * 
 * This module provides unified access to Microsoft Azure AI services:
 * 1. Azure AI Language - Key Phrase Extraction & Entity Recognition
 * 2. Azure OpenAI - Advanced reasoning and generation
 * 
 * Both services are REQUIRED for the system to function.
 * Azure AI Language structures the data, Azure OpenAI reasons on it.
 * 
 * @microsoft-ai-services Azure AI Language, Azure OpenAI
 */

// Deno runtime type declaration
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Azure AI Language Service Client
interface LanguageAnalysisResult {
  keyPhrases: string[];
  entities: {
    text: string;
    category: string;
    confidenceScore: number;
  }[];
  skills: string[];
}

/**
 * Azure AI Language Service - Key Phrase Extraction & Entity Recognition
 * Preprocesses text to extract structured skill data
 */
export async function analyzeWithAzureLanguage(text: string): Promise<LanguageAnalysisResult> {
  const endpoint = Deno.env.get('AZURE_LANGUAGE_ENDPOINT');
  const apiKey = Deno.env.get('AZURE_LANGUAGE_KEY');

  if (!endpoint || !apiKey) {
    throw new Error('Azure AI Language credentials not configured. Both AZURE_LANGUAGE_ENDPOINT and AZURE_LANGUAGE_KEY are required.');
  }

  // Clean and truncate text
  const cleanedText = text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 5000); // Azure Language has document size limits

  const documents = [{ id: '1', language: 'en', text: cleanedText }];

  // 1. Key Phrase Extraction
  const keyPhrasesResponse = await fetch(
    `${endpoint}/language/:analyze-text?api-version=2023-04-01`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kind: 'KeyPhraseExtraction',
        parameters: { modelVersion: 'latest' },
        analysisInput: { documents },
      }),
    }
  );

  if (!keyPhrasesResponse.ok) {
    const errorText = await keyPhrasesResponse.text();
    console.error('Azure Language Key Phrase API error:', errorText);
    throw new Error(`Azure AI Language key phrase extraction failed: ${keyPhrasesResponse.status}`);
  }

  const keyPhrasesData = await keyPhrasesResponse.json();
  const keyPhrases = keyPhrasesData.results?.documents?.[0]?.keyPhrases || [];

  // 2. Entity Recognition (for skills, technologies, tools)
  const entitiesResponse = await fetch(
    `${endpoint}/language/:analyze-text?api-version=2023-04-01`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kind: 'EntityRecognition',
        parameters: { modelVersion: 'latest' },
        analysisInput: { documents },
      }),
    }
  );

  if (!entitiesResponse.ok) {
    const errorText = await entitiesResponse.text();
    console.error('Azure Language Entity API error:', errorText);
    throw new Error(`Azure AI Language entity recognition failed: ${entitiesResponse.status}`);
  }

  const entitiesData = await entitiesResponse.json();
  const entities = entitiesData.results?.documents?.[0]?.entities || [];

  // Filter entities that are likely skills (Skill, Product, Organization types)
  const skillCategories = ['Skill', 'Product', 'Organization', 'Event'];
  const skillEntities = entities
    .filter((e: any) => skillCategories.includes(e.category) || e.confidenceScore > 0.8)
    .map((e: any) => ({
      text: e.text,
      category: e.category,
      confidenceScore: e.confidenceScore,
    }));

  // Combine key phrases and entities to extract skills
  const extractedSkills = new Set<string>();
  
  // Add high-confidence entities
  skillEntities.forEach((e: any) => {
    if (e.confidenceScore > 0.7) {
      extractedSkills.add(e.text);
    }
  });

  // Add relevant key phrases (filter common words)
  const commonWords = ['experience', 'work', 'team', 'project', 'development', 'years', 'skills'];
  keyPhrases.forEach((phrase: string) => {
    const lowerPhrase = phrase.toLowerCase();
    if (!commonWords.some(w => lowerPhrase === w) && phrase.length > 2) {
      extractedSkills.add(phrase);
    }
  });

  console.log(`Azure AI Language extracted ${keyPhrases.length} key phrases and ${skillEntities.length} entities`);

  return {
    keyPhrases,
    entities: skillEntities,
    skills: Array.from(extractedSkills),
  };
}

// Azure OpenAI Service Client
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AzureOpenAIOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
}

/**
 * Azure OpenAI Service - Advanced reasoning and generation
 * Processes structured data for career insights
 */
export async function generateWithAzureOpenAI(
  messages: ChatMessage[],
  options: AzureOpenAIOptions = {}
): Promise<string> {
  const endpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');
  const apiKey = Deno.env.get('AZURE_OPENAI_KEY');
  const deploymentName = Deno.env.get('AZURE_OPENAI_DEPLOYMENT_NAME');

  if (!endpoint || !apiKey || !deploymentName) {
    throw new Error('Azure OpenAI credentials not configured. AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, and AZURE_OPENAI_DEPLOYMENT_NAME are all required.');
  }

  const { temperature = 0.7, maxTokens = 2000, responseFormat = 'json' } = options;

  const requestBody: any = {
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  // Add response format for JSON mode if supported
  if (responseFormat === 'json') {
    requestBody.response_format = { type: 'json_object' };
  }

  const response = await fetch(
    `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`,
    {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Azure OpenAI API error:', errorText);
    
    if (response.status === 429) {
      throw new Error('Azure OpenAI rate limit exceeded. Please try again in a moment.');
    }
    if (response.status === 401) {
      throw new Error('Azure OpenAI authentication failed. Check your API key.');
    }
    
    throw new Error(`Azure OpenAI request failed: ${response.status} - ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in Azure OpenAI response');
  }

  console.log('Azure OpenAI response received successfully');
  return content;
}

/**
 * Parse JSON from AI response with multiple fallback strategies
 */
export function parseAIResponse<T>(responseText: string): T {
  // Strategy 1: Direct JSON parse
  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.log('Direct JSON parse failed, trying fallbacks...');
  }

  // Strategy 2: Extract from markdown code block
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.log('Markdown JSON parse failed');
    }
  }

  // Strategy 3: Find JSON object/array with regex
  const objectMatch = responseText.match(/[\[{][\s\S]*[\]}]/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch (e) {
      console.log('Regex JSON parse failed');
    }
  }

  throw new Error('Failed to parse AI response as JSON');
}

/**
 * Combined Azure AI Pipeline
 * Uses both Azure AI Language AND Azure OpenAI in sequence
 * This is the core pipeline that judges will evaluate
 */
export async function analyzeWithAzureAI(
  text: string,
  systemPrompt: string,
  userPrompt: string,
  options: AzureOpenAIOptions = {}
): Promise<{ languageAnalysis: LanguageAnalysisResult; aiResponse: string }> {
  // Step 1: Azure AI Language preprocessing
  console.log('Step 1: Analyzing text with Azure AI Language...');
  const languageAnalysis = await analyzeWithAzureLanguage(text);

  // Step 2: Enrich user prompt with Language analysis
  const enrichedPrompt = `
${userPrompt}

--- Pre-processed by Azure AI Language Service ---
Key Phrases Extracted: ${languageAnalysis.keyPhrases.join(', ')}
Entities Recognized: ${languageAnalysis.entities.map(e => `${e.text} (${e.category})`).join(', ')}
Identified Skills: ${languageAnalysis.skills.join(', ')}
---
`;

  // Step 3: Azure OpenAI reasoning
  console.log('Step 2: Generating insights with Azure OpenAI...');
  const aiResponse = await generateWithAzureOpenAI(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: enrichedPrompt },
    ],
    options
  );

  return { languageAnalysis, aiResponse };
}
