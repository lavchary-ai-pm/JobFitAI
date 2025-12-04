const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Anthropic client (server-side only)
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

    console.log('📥 Received analysis request:');
    console.log('  Resume length:', resumeText?.length || 0);
    console.log('  Job description length:', jobDescription?.length || 0);
    console.log('  Job first 100 chars:', jobDescription?.substring(0, 100) || 'N/A');

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

    console.log('📋 After truncation:');
    console.log('  Resume length:', truncatedResume.length);
    console.log('  Job length:', truncatedJob.length);

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
    "yourExperience": "12 years as Product Manager",
    "requiredExperience": "Not specified",
    "explanation": "Candidate has 12 years experience but as Product Manager, not as Frontend Developer role required.",
    "score": 100
  },
  "locationMatch": {
    "score": 100,
    "candidateLocation": "Full location from resume",
    "jobLocation": "Full location from job",
    "explanation": "Candidate is in location from resume. Job requires location from job. Match or mismatch details."
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
      system: `You are a recruitment expert. Extract data precisely from resume and job description.

CRITICAL - Your fields MUST be populated:
1. For "yourExperience" (REQUIRED FIELD):
   - ALWAYS extract and populate this field from the resume text
   - Format: "X+ years as [Role]" or "[Years] years as [Role] (dates)"
   - Examples: "10+ years as Product Manager", "8 years as Senior Developer (2016-2024)"
   - Do NOT set to "Not mentioned" unless the resume has ZERO mention of any job title or experience
   - Include years, role name, and dates if available
   - If years number appears in resume, use it: "10+ years as Product Manager (2013-2025)"

2. For location: Extract EXACT location from resume (e.g., "Whitehouse Station, NJ" not just "NJ")

3. For skills: List ALL matched and ALL missing skills separately

4. For keywords: List ALL matched and ALL missing keywords separately

5. For experience matching:
   - candidateYears: Extract years as a number from resume
   - requiredYears: Extract years as a number from job description
   - If years not specified in job description, set requiredExperience to "Not specified"

6. For education:
   - Extract from resume (e.g., "Bachelor's in Computer Science")
   - Extract requirement from job (e.g., "Bachelor's required")
   - Set to "Not mentioned" ONLY if not in document

7. For explanations: Include specific examples of matches and gaps

Return ONLY valid JSON (no markdown, no extra text).`,
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

    // Fallback logic: Populate missing experience and education fields
    // If Claude didn't populate yourExperience, extract it from resume text directly
    if (!parsed.experienceMatch.yourExperience || parsed.experienceMatch.yourExperience === 'Not mentioned') {
      let extractedExperience = null;

      console.log('📋 Attempting experience extraction from resume text...');
      console.log('Resume excerpt:', truncatedResume.substring(0, 300));

      // Pattern 1: Look for "X+ years as [Role]" or "X years of [Role]"
      const yearsRoleMatch = truncatedResume.match(/(\d+)\+?\s*years?\s*(?:as|of|in|serving\s+as)\s*([a-zA-Z\s]+?)(?:\(|,|;|-|$)/i);
      if (yearsRoleMatch) {
        const years = yearsRoleMatch[1];
        const role = yearsRoleMatch[2].trim();
        extractedExperience = `${years}+ years as ${role}`;
        console.log('✓ Pattern 1 matched:', extractedExperience);
      }

      // Pattern 2: Look for date ranges like "Product Manager (2013-2025)" with parentheses
      if (!extractedExperience) {
        const dateRangeMatch = truncatedResume.match(/([A-Za-z\s]+?)\s*\((\d{4})\s*[-–—]\s*(\d{4}|present|current)\)/i);
        if (dateRangeMatch) {
          const role = dateRangeMatch[1].trim();
          const startYear = parseInt(dateRangeMatch[2]);
          const endYear = dateRangeMatch[3].toLowerCase() === 'present' || dateRangeMatch[3].toLowerCase() === 'current'
            ? new Date().getFullYear()
            : parseInt(dateRangeMatch[3]);
          const years = Math.max(1, endYear - startYear);
          // Extract years from text if available (e.g., "10+ years")
          const yearsFromText = truncatedResume.match(/(\d+)\+?\s*years?/i);
          const yearsSuffix = yearsFromText ? yearsFromText[1] + '+ ' : years + ' ';
          extractedExperience = `${yearsSuffix}years as ${role} (${startYear}-${dateRangeMatch[3]})`;
          console.log('✓ Pattern 2 matched:', extractedExperience);
        }
      }

      // Pattern 3: Look for "Role (Years-Present)" without explicit years prefix
      if (!extractedExperience) {
        const simpleRoleMatch = truncatedResume.match(/([A-Z][a-zA-Z\s]+?)\s*,\s*(\d{4})\s*[-–—]\s*(\d{4}|present|current)/i);
        if (simpleRoleMatch) {
          const role = simpleRoleMatch[1].trim();
          const startYear = parseInt(simpleRoleMatch[2]);
          const endYear = simpleRoleMatch[3].toLowerCase() === 'present' || simpleRoleMatch[3].toLowerCase() === 'current'
            ? new Date().getFullYear()
            : parseInt(simpleRoleMatch[3]);
          const years = Math.max(1, endYear - startYear);
          extractedExperience = `${years}+ years as ${role} (${startYear}-${simpleRoleMatch[3]})`;
          console.log('✓ Pattern 3 matched:', extractedExperience);
        }
      }

      // Use extracted experience if found
      if (extractedExperience) {
        parsed.experienceMatch.yourExperience = extractedExperience;
        console.log('✓ Using extracted experience:', extractedExperience);
      }
      // Final fallback: use Claude's parsed yearsExperience and mainRole
      else if (parsed.resumeParsed.yearsExperience || parsed.resumeParsed.mainRole) {
        if (parsed.resumeParsed.yearsExperience && parsed.resumeParsed.mainRole) {
          parsed.experienceMatch.yourExperience = `${parsed.resumeParsed.yearsExperience} years as ${parsed.resumeParsed.mainRole}`;
        } else if (parsed.resumeParsed.yearsExperience) {
          parsed.experienceMatch.yourExperience = `${parsed.resumeParsed.yearsExperience} years experience`;
        }
        console.log('✓ Using Claude parsed data:', parsed.experienceMatch.yourExperience);
      } else {
        console.log('✗ No experience extraction succeeded');
      }
    }

    // If Claude didn't populate resumeParsed.education, use placeholder
    if (!parsed.resumeParsed.education || parsed.resumeParsed.education === 'Not mentioned') {
      parsed.resumeParsed.education = 'Not mentioned';
    }

    // If Claude didn't populate requiredEducation in jobAnalysis, use placeholder
    // Handle both empty and "Not mentioned" as equivalent to missing
    if (!parsed.jobAnalysis.requiredEducation || parsed.jobAnalysis.requiredEducation === 'Not mentioned') {
      parsed.jobAnalysis.requiredEducation = 'Not specified';
    }

    console.log('✓ Processed experience data:', parsed.experienceMatch.yourExperience);
    console.log('✓ Processed education data:', parsed.resumeParsed.education);

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

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         JobFitAI Backend Server                            ║
║         Running on http://localhost:${PORT}                 ║
╚════════════════════════════════════════════════════════════╝
  `);

  // Check for API key on startup
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('⚠️  WARNING: ANTHROPIC_API_KEY not set in environment!');
    console.error('Set it in backend/.env.local before making API calls.');
  } else {
    console.log('✓ ANTHROPIC_API_KEY is configured');
  }
});
