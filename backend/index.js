const Anthropic = require('@anthropic-ai/sdk');

/**
 * Truncate text smartly
 */
function truncateText(text, maxChars) {
  if (text.length <= maxChars) return text;
  const firstPart = text.substring(0, Math.floor(maxChars * 0.4));
  const lastPart = text.substring(text.length - Math.floor(maxChars * 0.6));
  return (
    firstPart +
    '\n\n[... middle content abbreviated ...]\n\n' +
    lastPart
  );
}

/**
 * Main Cloudflare Workers handler
 */
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check endpoint
    if (path === '/health' && request.method === 'GET') {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Backend is running' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Analysis endpoint
    if (path === '/api/analyze' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { resumeText, jobDescription } = body;

        if (!resumeText || !jobDescription) {
          return new Response(
            JSON.stringify({ error: 'Missing resumeText or jobDescription' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            }
          );
        }

        // Check API key
        if (!env.ANTHROPIC_API_KEY) {
          return new Response(
            JSON.stringify({ error: 'Server configuration error: API key not set' }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            }
          );
        }

        // Truncate texts
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

        // Create Anthropic client with env API key
        const client = new Anthropic({
          apiKey: env.ANTHROPIC_API_KEY,
        });

        const response = await client.messages.create({
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
          return new Response(
            JSON.stringify({ error: 'Invalid response format from Claude' }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            }
          );
        }

        const parsed = JSON.parse(jsonMatch[0]);
        const totalTokens = response.usage.input_tokens + response.usage.output_tokens;

        return new Response(
          JSON.stringify({
            success: true,
            data: parsed,
            tokens: totalTokens,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      } catch (error) {
        console.error('Analysis error:', error);
        return new Response(
          JSON.stringify({
            error: 'Claude API error',
            details: error.message,
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  },
};
