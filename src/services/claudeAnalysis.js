import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

/**
 * OPTIMIZED: Single Claude call to analyze resume + job in one go
 * Uses a concise prompt format to minimize tokens
 * Returns structured data for scoring
 *
 * Estimated tokens per call: ~800-1200 (vs 2000+ if done separately)
 */
export const analyzeWithClaude = async (resumeText, jobDescription) => {
  // Truncate if too long to save tokens (most critical info is in first/last sections)
  const truncatedResume = truncateText(resumeText, 2000);
  const truncatedJob = truncateText(jobDescription, 1500);

  const systemPrompt = `You are a recruitment expert. Analyze the resume and job description and return ONLY valid JSON (no markdown, no explanation).`;

  const userPrompt = `RESUME:
${truncatedResume}

---

JOB DESCRIPTION:
${truncatedJob}

---

Return ONLY this JSON structure (no other text):
{
  "resumeParsed": {
    "yearsExperience": number,
    "mainRole": "string",
    "keySkills": ["string"],
    "location": "string or null",
    "isRemote": boolean,
    "education": "string or null"
  },
  "jobAnalysis": {
    "requiredYears": number,
    "requiredSkills": ["string"],
    "location": "string or null",
    "isRemote": boolean,
    "requiredEducation": "string or null"
  },
  "skillMatch": {
    "matched": ["string"],
    "missing": ["string"],
    "transferable": ["string"],
    "matchScore": number
  },
  "experienceMatch": {
    "candidateYears": number,
    "requiredYears": number,
    "roleAlignment": "perfect" | "good" | "moderate" | "poor",
    "explanation": "string (1-2 sentences)",
    "score": number
  },
  "locationMatch": {
    "score": number,
    "explanation": "string (1 sentence)"
  },
  "overallInsight": "string (1-2 sentences about fit)"
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      system: systemPrompt,
    });

    // Extract JSON from response
    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Claude');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Log token usage for optimization tracking
    console.log(`✓ Claude API: ${response.usage.input_tokens} input + ${response.usage.output_tokens} output = ${response.usage.input_tokens + response.usage.output_tokens} tokens`);

    return parsed;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
};

/**
 * Generate personalized recommendations with minimal tokens
 * Called ONLY if user wants to see recommendations
 */
export const generateRecommendations = async (resumeText, jobDescription, gaps) => {
  const truncatedResume = truncateText(resumeText, 1000);
  const truncatedJob = truncateText(jobDescription, 1000);

  const userPrompt = `RESUME: ${truncatedResume}

JOB: ${truncatedJob}

GAPS: ${JSON.stringify(gaps)}

Provide 3 specific, actionable recommendations to improve fit. Return ONLY this JSON:
{
  "recommendations": [
    { "area": "string", "action": "string" }
  ]
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 400,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    console.log(`✓ Recommendations: ${response.usage.input_tokens + response.usage.output_tokens} tokens`);
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return { recommendations: [] };
  }
};

/**
 * UTILITY: Truncate text smartly to save tokens
 * Keeps beginning (contact info) and end (recent experience) which are most important
 */
const truncateText = (text, maxChars) => {
  if (text.length <= maxChars) return text;

  // Keep first 40% (header/contact info) + last 60% (recent experience)
  const firstPart = text.substring(0, Math.floor(maxChars * 0.4));
  const lastPart = text.substring(text.length - Math.floor(maxChars * 0.6));

  return firstPart + '\n\n[... middle content abbreviated ...]\n\n' + lastPart;
};

/**
 * UTILITY: Estimate tokens before making API call
 * Rule of thumb: ~4 characters = 1 token
 */
export const estimateTokens = (text) => {
  return Math.ceil(text.length / 4);
};
