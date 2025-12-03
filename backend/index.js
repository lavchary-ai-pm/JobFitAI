const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();

// Initialize Anthropic client with environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

/**
 * POST /api/analyze
 * Analyzes resume and job description with Claude
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        error: 'Missing resumeText or jobDescription',
      });
    }

    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not set in environment');
      return res.status(500).json({
        error: 'Server configuration error: API key not set',
      });
    }

    // Truncate texts to save tokens
    const truncatedResume = truncateText(resumeText, 2000);
    const truncatedJob = truncateText(jobDescription, 1500);

    const userPrompt = `RESUME:
${truncatedResume}

---

JOB DESCRIPTION:
${truncatedJob}

---

Return ONLY this JSON structure (no other text, no markdown):
{
  "resumeParsed": {
    "yearsExperience": 5,
    "mainRole": "string",
    "keySkills": ["skill1", "skill2"],
    "location": "City, State",
    "isRemote": false,
    "education": "string or null"
  },
  "jobAnalysis": {
    "requiredYears": 5,
    "requiredSkills": ["skill1", "skill2"],
    "location": "City, State",
    "isRemote": false,
    "requiredEducation": "string or null"
  },
  "skillMatch": {
    "matched": ["skill1"],
    "missing": ["skill2"],
    "transferable": ["skill3"],
    "matchScore": 80,
    "explanation": "Matched: skill1. Missing: skill2. Transferable: skill3."
  },
  "keywordMatch": {
    "matched": ["keyword1"],
    "missing": ["keyword2"],
    "matchScore": 75,
    "explanation": "Found these required keywords: keyword1. Missing: keyword2."
  },
  "experienceMatch": {
    "candidateYears": 5,
    "requiredYears": 5,
    "roleAlignment": "perfect",
    "explanation": "Candidate has exact 5 years experience as Senior Developer, meeting the 5+ years requirement.",
    "score": 100
  },
  "locationMatch": {
    "score": 100,
    "candidateLocation": "Full location from resume",
    "jobLocation": "Full location from job",
    "explanation": "Candidate is in Los Angeles, NJ. Job requires Los Angeles, NJ. Perfect match."
  },
  "overallInsight": "Strong fit for this role."
}`;

    console.log('Calling Claude API with Anthropic SDK...');

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: `You are a recruitment expert. Your job is to accurately extract and analyze resume and job description data.

CRITICAL REQUIREMENTS:
1. For location: Extract the EXACT location from the resume (e.g., "Whitehouse Station, NJ" not just "NJ")
2. For skills: List ALL matched skills and ALL missing skills separately
3. For keywords: List ALL matched keywords and ALL missing keywords separately
4. For explanations: Always include specific examples of what matched and what's missing

Return ONLY valid JSON (no markdown, no explanation, no extra text).`,
    });

    // Extract JSON from response
    const content = response.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('Failed to extract JSON from Claude response:', content);
      return res.status(500).json({
        error: 'Invalid response format from Claude',
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Log token usage
    const totalTokens =
      response.usage.input_tokens + response.usage.output_tokens;
    console.log(
      `✓ Claude API: ${response.usage.input_tokens} input + ${response.usage.output_tokens} output = ${totalTokens} tokens`
    );

    res.json({
      success: true,
      data: parsed,
      tokens: totalTokens,
    });
  } catch (error) {
    console.error('API Error:', error);

    // Provide specific error messages
    if (error.status === 401) {
      return res.status(401).json({
        error: 'Authentication failed: Invalid API key',
        details: error.message,
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limited: Too many requests',
        details: error.message,
      });
    }

    res.status(500).json({
      error: 'Claude API error',
      details: error.message,
    });
  }
});

/**
 * UTILITY: Truncate text smartly
 */
function truncateText(text, maxChars) {
  if (text.length <= maxChars) return text;

  // Keep first 40% (header/contact info) + last 60% (recent experience)
  const firstPart = text.substring(0, Math.floor(maxChars * 0.4));
  const lastPart = text.substring(text.length - Math.floor(maxChars * 0.6));

  return (
    firstPart +
    '\n\n[... middle content abbreviated ...]\n\n' +
    lastPart
  );
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Export for Cloudflare Workers
export default {
  fetch: app,
};
