import axios from 'axios';

interface HintRequest {
  question: string;
  attemptedQuery?: string;
  error?: string;
}

interface HintResponse {
  hint: string;
  guidance?: string;
}

// Local hint database for common SQL questions
const LOCAL_HINTS: Record<string, string> = {
  'count': 'Hint: To count items, use the COUNT() aggregate function. You might need GROUP BY to count per category.',
  'group': 'Hint: GROUP BY groups rows with the same values. Make sure to use aggregate functions like COUNT(), SUM(), AVG() for grouped columns.',
  'join': 'Hint: Joins combine rows from multiple tables. Use INNER JOIN for matching records, LEFT JOIN to include unmatched records from the left table.',
  'where': 'Hint: WHERE filters rows before grouping. Use HAVING to filter groups after aggregation.',
  'order': 'Hint: ORDER BY sorts results. Use ASC for ascending (default) or DESC for descending order.',
  'limit': 'Hint: LIMIT restricts the number of rows returned. OFFSET skips rows before returning results.',
  'distinct': 'Hint: DISTINCT removes duplicate rows from results. Be careful when combining with GROUP BY.',
  'having': 'Hint: HAVING filters groups after aggregation. WHERE filters rows before aggregation.',
  'subquery': 'Hint: Subqueries select data from another query. Useful for filtering or providing comparison values.',
  'aggregate': 'Hint: Aggregate functions like COUNT(), SUM(), AVG(), MIN(), MAX() process multiple rows. Often used with GROUP BY.',
};

// Simple in-memory cache for hints (key: question hash)
const hintCache = new Map<string, { hint: HintResponse; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

const generateHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

const getCachedHint = (question: string): HintResponse | null => {
  const cacheKey = generateHash(question);
  const cached = hintCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('💾 Using cached hint');
    return cached.hint;
  }
  
  // Clear expired cache
  if (cached) {
    hintCache.delete(cacheKey);
  }
  
  return null;
};

const setCachedHint = (question: string, hint: HintResponse): void => {
  const cacheKey = generateHash(question);
  hintCache.set(cacheKey, { hint, timestamp: Date.now() });
};

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Get local hint based on question keywords
const getLocalHint = (question: string): string => {
  const lowerQuestion = question.toLowerCase();
  
  // Check for keyword matches
  for (const [keyword, hint] of Object.entries(LOCAL_HINTS)) {
    if (lowerQuestion.includes(keyword)) {
      return hint;
    }
  }
  
  // Default hint
  return 'Hint: Break down the problem step by step. What columns do you need? Which tables? Do you need to filter or aggregate data?';
};

export const generateHint = async (request: HintRequest): Promise<HintResponse> => {
  const provider = process.env.LLM_PROVIDER || 'openai';
  
  // Check cache first
  const cached = getCachedHint(request.question);
  if (cached) {
    console.log('💾 Using cached hint');
    return cached;
  }
  
  console.log(`🔍 Generating hint using provider: ${provider}`);

  // Try primary provider
  try {
    if (provider === 'gemini') {
      console.log('📱 Attempting Gemini API...');
      const hint = await generateGeminiHint(request);
      console.log('✅ Gemini hint generated');
      return hint;
    } else {
      console.log('🤖 Attempting OpenAI API...');
      const hint = await generateOpenAIHint(request);
      console.log('✅ OpenAI hint generated');
      return hint;
    }
  } catch (primaryError) {
    console.error(`❌ ${provider} failed:`, primaryError instanceof Error ? primaryError.message : primaryError);
  }

  // Try fallback provider
  const fallbackProvider = provider === 'gemini' ? 'openai' : 'gemini';
  try {
    console.log(`🔄 Attempting fallback to ${fallbackProvider}...`);
    if (provider === 'gemini') {
      const hint = await generateOpenAIHint(request);
      console.log('✅ OpenAI (fallback) hint generated');
      return hint;
    } else {
      const hint = await generateGeminiHint(request);
      console.log('✅ Gemini (fallback) hint generated');
      return hint;
    }
  } catch (fallbackError) {
    console.error(`❌ Fallback ${fallbackProvider} also failed:`, fallbackError instanceof Error ? fallbackError.message : fallbackError);
  }

  // Use local hint database as final fallback
  console.log('⚠️ Both APIs failed, using local hint database');
  const localHint = getLocalHint(request.question);
  const result: HintResponse = {
    hint: localHint,
    guidance: 'This hint is from our local database.'
  };
  
  setCachedHint(request.question, result);
  return result;
};

const generateOpenAIHint = async (request: HintRequest): Promise<HintResponse> => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'sk-proj-YOUR_KEY_HERE') {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are a SQL learning assistant providing brief, clear hints (2-3 sentences max).
Never provide the complete solution. Guide the student towards the correct approach.`;

  const userMessage = request.error
    ? `Question: ${request.question}\nAttempted: ${request.attemptedQuery}\nError: ${request.error}\n\nBrief hint about what's wrong (2-3 sentences):`
    : `Question: ${request.question}\n\nBrief hint to guide them (2-3 sentences):`;

  try {
    const startTime = Date.now();
    console.log('📤 Sending request to OpenAI API...');
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const duration = Date.now() - startTime;
    console.log(`✅ OpenAI hint received (${duration}ms)`);

    const result: HintResponse = {
      hint: response.data.choices[0].message.content.trim(),
      guidance: '💡 Use this hint to improve your query'
    };
    
    setCachedHint(request.question, result);
    return result;
  } catch (error: any) {
    const status = error.response?.status;
    const message = error.response?.data?.error?.message || error.message;
    
    if (status === 429) {
      console.warn('⏳ OpenAI: Rate limited (quota exceeded or too many requests)');
    } else if (status === 401 || status === 403) {
      console.warn('🔑 OpenAI: Invalid API key');
    } else {
      console.warn(`❌ OpenAI (${status}): ${message}`);
    }
    
    throw error;
  }
};

const generateGeminiHint = async (request: HintRequest): Promise<HintResponse> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    throw new Error('Gemini API key not configured');
  }

  // Validate API key format (should start with specific prefix)
  if (!apiKey.startsWith('AIza')) {
    console.warn('⚠️ Gemini API key format may be invalid (should start with "AIza")');
  }

  const systemPrompt = `You are a SQL learning assistant providing brief, clear hints (2-3 sentences max).
Never provide the complete solution. Guide the student towards the correct approach.`;

  const userMessage = request.error
    ? `Question: ${request.question}\nAttempted: ${request.attemptedQuery}\nError: ${request.error}\n\nBrief hint about what's wrong (2-3 sentences):`
    : `Question: ${request.question}\n\nBrief hint to guide them (2-3 sentences):`;

  try {
    const startTime = Date.now();
    console.log('📤 Sending request to Gemini API...');
    
    // Use v1 endpoint with gemini-pro model for better compatibility
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              { text: systemPrompt + '\n\n' + userMessage }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.7
        }
      },
      {
        timeout: 15000
      }
    );

    if (!response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini');
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Gemini hint received (${duration}ms)`);

    const result: HintResponse = {
      hint: response.data.candidates[0].content.parts[0].text.trim(),
      guidance: '💡 Use this hint to improve your query'
    };
    
    setCachedHint(request.question, result);
    return result;
  } catch (error: any) {
    const status = error.response?.status;
    const message = error.response?.data?.error?.message || error.message;
    
    if (status === 404) {
      console.warn('🔗 Gemini: Endpoint not found - trying alternative endpoint...');
      // Try fallback endpoint
      return generateGeminiFallback(request, apiKey);
    } else if (status === 400) {
      console.warn(`🔑 Gemini: Invalid request (${message})`);
    } else if (status === 429) {
      console.warn('⏳ Gemini: Rate limited (quota exceeded)');
    } else if (status === 403) {
      console.warn('🔒 Gemini: Forbidden - API key may not have access to this model');
    } else {
      console.warn(`❌ Gemini (${status}): ${message}`);
    }
    
    throw error;
  }
};

// Fallback Gemini endpoint with gemini-1.5-flash
const generateGeminiFallback = async (request: HintRequest, apiKey: string): Promise<HintResponse> => {
  try {
    console.log('🔄 Trying Gemini 1.5-Flash endpoint...');
    
    const systemPrompt = `You are a SQL learning assistant providing brief, clear hints (2-3 sentences max).
Never provide the complete solution. Guide the student towards the correct approach.`;

    const userMessage = request.error
      ? `Question: ${request.question}\nAttempted: ${request.attemptedQuery}\nError: ${request.error}\n\nBrief hint about what's wrong (2-3 sentences):`
      : `Question: ${request.question}\n\nBrief hint to guide them (2-3 sentences):`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              { text: systemPrompt + '\n\n' + userMessage }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.7
        }
      },
      {
        timeout: 15000
      }
    );

    if (!response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini Fallback');
    }

    console.log(`✅ Gemini (v1beta) hint received`);

    const result: HintResponse = {
      hint: response.data.candidates[0].content.parts[0].text.trim(),
      guidance: '💡 Use this hint to improve your query'
    };
    
    setCachedHint(request.question, result);
    return result;
  } catch (error: any) {
    console.warn('❌ Gemini fallback also failed');
    throw error;
  }
};
