/**
 * Frontend API client for job fit analysis
 * Calls the backend API instead of making direct Anthropic calls
 * This is the proper architecture for browser-based apps
 */

// For production: use Cloudflare Workers backend
// For development: fall back to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://jobfitai-api.lavchary.workers.dev';

/**
 * Call the backend API to analyze resume + job with Claude
 * @param {string} resumeText - Resume content
 * @param {string} jobDescription - Job description content
 * @returns {Promise<object>} Analysis results from Claude
 */
export const analyzeWithClaude = async (resumeText, jobDescription) => {
  if (!resumeText || !jobDescription) {
    throw new Error('Resume and job description are required');
  }

  try {
    // Log request details for debugging cache issues
    console.log('📤 Sending analysis request:');
    console.log('  Resume length:', resumeText.length);
    console.log('  Job description length:', jobDescription.length);
    console.log('  First 100 chars of job:', jobDescription.substring(0, 100));

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        jobDescription,
      }),
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error ||
        errorData.details ||
        `Backend error: ${response.status} ${response.statusText}`;

      if (response.status === 401) {
        throw new Error(
          'Backend API key error: Check server configuration'
        );
      }

      if (response.status === 429) {
        throw new Error(
          'Rate limited: Too many requests. Please wait a moment.'
        );
      }

      if (response.status === 500) {
        throw new Error(
          `Backend error: ${errorMessage}. Please check server logs.`
        );
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error from backend');
    }

    console.log(
      `✓ Analysis complete: ${result.tokens} tokens used`
    );

    // DEBUG: Log the actual data being returned to verify experience is present
    console.log('📥 Backend returned data:', {
      hasExperienceMatch: !!result.data.experienceMatch,
      yourExperience: result.data.experienceMatch?.yourExperience,
      requiredExperience: result.data.experienceMatch?.requiredExperience,
      fullExperienceMatch: result.data.experienceMatch
    });

    // COMPATIBILITY FIX: Handle missing 'yourExperience' field from older backends
    // Older Cloudflare Workers endpoint doesn't return 'yourExperience', only candidateYears/requiredYears
    if (result.data.experienceMatch && !result.data.experienceMatch.yourExperience) {
      const exp = result.data.experienceMatch;
      const mainRole = result.data.resumeParsed?.mainRole || 'Professional';
      const years = exp.candidateYears || exp.candidateYears;

      // Construct yourExperience from available data
      if (years) {
        exp.yourExperience = `${years}+ years as ${mainRole}`;
        console.log('⚠️ Constructed missing yourExperience field:', exp.yourExperience);
      } else {
        exp.yourExperience = 'Not mentioned';
        console.log('⚠️ No years data available, using fallback');
      }
    }

    // Same compatibility fix for requiredExperience
    if (result.data.experienceMatch && !result.data.experienceMatch.requiredExperience) {
      const exp = result.data.experienceMatch;
      const years = exp.requiredYears || 3;
      exp.requiredExperience = `${years}+ years of experience`;
      console.log('⚠️ Constructed missing requiredExperience field:', exp.requiredExperience);
    }

    return result.data;
  } catch (error) {
    console.error('Analysis API error:', error);
    throw error;
  }
};

/**
 * Check if backend is available
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

/**
 * Get API base URL (for debugging)
 */
export const getApiBaseUrl = () => API_BASE_URL;
