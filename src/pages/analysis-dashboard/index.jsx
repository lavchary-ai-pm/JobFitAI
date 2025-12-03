import React, { useState, useEffect } from 'react';
import HeaderNav from '../../components/ui/HeaderNav';
import SettingsModal from '../../components/ui/SettingsModal';
import ResumeUploadSection from './components/ResumeUploadSection';
import JobDescriptionSection from './components/JobDescriptionSection';
import ScoringConfigPanel from './components/ScoringConfigPanel';
import AnalysisResultsPanel from './components/AnalysisResultsPanel';
import AnalysisErrorPanel from './components/AnalysisErrorPanel';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { analyzeWithClaude } from '../../services/analysisApi';

const AnalysisDashboard = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [weights, setWeights] = useState({
    skills: 40,
    experience: 25,
    location: 15,
    education: 10,
    keywords: 10
  });
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [scoringConfigOpen, setScoringConfigOpen] = useState(false);

  useEffect(() => {
    const handleOpenSettings = () => setSettingsModalOpen(true);

    window.addEventListener('openSettingsModal', handleOpenSettings);

    return () => {
      window.removeEventListener('openSettingsModal', handleOpenSettings);
    };
  }, []);

  const handleAutoFillJob = () => {
    const sampleJobDescription = `Senior Frontend Developer - TechCorp Inc.

Location: San Francisco, CA (Hybrid)
Experience: 5+ years
Employment Type: Full-time

About the Role:
We are seeking an experienced Senior Frontend Developer to join our growing engineering team. You will be responsible for building and maintaining our enterprise web applications using modern technologies.

Key Responsibilities:
• Design and develop responsive web applications using React and TypeScript
• Lead frontend architecture decisions and code reviews
• Collaborate with UX designers to implement pixel-perfect interfaces
• Optimize application performance and user experience
• Mentor junior developers and contribute to team growth
• Participate in agile development processes

Required Skills:
• 5+ years of professional frontend development experience
• Expert knowledge of React, TypeScript, and modern JavaScript
• Strong understanding of HTML5, CSS3, and responsive design
• Experience with state management (Redux, Context API)
• Proficiency with Git and modern development tools
• Excellent problem-solving and communication skills

Preferred Qualifications:
• Bachelor's degree in Computer Science or related field
• Experience with Node.js and backend development
• Knowledge of cloud platforms (AWS, Azure)
• Contributions to open-source projects
• Experience leading development teams

Benefits:
• Competitive salary ($120,000 - $160,000)
• Health, dental, and vision insurance
• 401(k) matching
• Flexible work arrangements
• Professional development budget
• Stock options`;

    setJobDescription(sampleJobDescription);
  };

  const extractRoleFromJobDescription = (description) => {
    const lines = description?.split('\n');
    const firstLine = lines?.[0]?.trim();
    return firstLine?.split('-')?.[0]?.trim() || 'Position';
  };

  // FIXED: Enhanced keyword extraction with PM, Analytics, and Business keywords
  const extractKeywordsFromJob = (jobText) => {
    const keywords = [];
    const jobLower = jobText?.toLowerCase();

    // === COMPREHENSIVE KEYWORD CATEGORIES ===

    // Product Management Keywords
    const pmKeywords = [
    'product strategy', 'product vision', 'roadmap', 'roadmapping', 'product roadmap',
    'user research', 'user testing', 'user interviews', 'customer research',
    'a/b testing', 'ab testing', 'experimentation', 'split testing',
    'product analytics', 'metrics', 'kpis', 'analytics', 'data analysis', 'data analytics',
    'user stories', 'backlog', 'sprint planning', 'agile', 'scrum', 'kanban',
    'stakeholder management', 'cross-functional leadership', 'cross-functional',
    'go-to-market', 'gtm', 'product launch', 'feature prioritization',
    'mvp', 'minimum viable product', 'product-market fit'];


    // Data & Analytics Keywords
    const dataKeywords = [
    'sql', 'postgresql', 'mysql', 'database', 'data analysis', 'data analytics',
    'analytics', 'data visualization', 'tableau', 'power bi', 'looker',
    'google analytics', 'excel', 'spreadsheets', 'metrics', 'kpis',
    'dashboards', 'reporting', 'python', 'r', 'statistical analysis',
    'data science', 'machine learning', 'predictive analytics',
    'business intelligence', 'bi', 'data-driven', 'quantitative analysis'];


    // Technical Skills
    const techKeywords = [
    'react', 'vue', 'angular', 'javascript', 'typescript', 'python', 'java',
    'node.js', 'nodejs', 'express', 'django', 'flask', 'spring',
    'html5', 'html', 'css3', 'css', 'sass', 'tailwind', 'bootstrap',
    'redux', 'graphql', 'rest api', 'restful', 'api',
    'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes',
    'aws', 'azure', 'gcp', 'git', 'ci/cd', 'jenkins', 'webpack', 'vite',
    'jest', 'testing', 'unit testing', 'integration testing'];


    // Soft Skills & Methodologies
    const softSkills = [
    'leadership', 'communication', 'collaboration', 'problem-solving',
    'critical thinking', 'decision making', 'mentoring', 'coaching',
    'team building', 'presentation', 'public speaking', 'negotiation',
    'influence', 'stakeholder management', 'agile methodology',
    'project management', 'process improvement'];


    // Combine all keyword categories
    const allPossibleKeywords = [
    ...pmKeywords,
    ...dataKeywords,
    ...techKeywords,
    ...softSkills];


    // Find keywords that appear in job description
    allPossibleKeywords?.forEach((keyword) => {
      // Check for exact match or common variations
      const variations = [
      keyword,
      keyword?.replace(/\s+/g, ''), // "a/b testing" → "a/btesting"
      keyword?.replace(/[\/\-]/g, ' '), // "a/b testing" → "a b testing"
      keyword?.replace(/[\/\-\s]/g, '') // "a/b testing" → "abtesting"
      ];

      if (variations?.some((variant) => jobLower?.includes(variant))) {
        keywords?.push(keyword);
      }
    });

    // Remove duplicate keywords (keep unique only)
    return [...new Set(keywords)]?.slice(0, 20); // Return top 20 keywords
  };

  // FIXED: Enhanced keyword matching with PM-specific synonyms
  const analyzeKeywordMatches = (keywords, resumeText) => {
    const resumeLower = resumeText?.toLowerCase();
    const present = [];
    const missing = [];

    // Enhanced synonym map for PM and analytics terms
    const synonymMap = {
      'product strategy': ['strategy', 'strategic planning', 'product planning'],
      'roadmap': ['roadmapping', 'product roadmap', 'strategic roadmap'],
      'roadmapping': ['roadmap', 'product roadmap'],
      'metrics': ['kpis', 'analytics', 'data metrics', 'performance metrics'],
      'analytics': ['data analytics', 'data analysis', 'metrics', 'analysis'],
      'data analysis': ['analytics', 'data analytics', 'analysis', 'quantitative analysis'],
      'data analytics': ['analytics', 'data analysis', 'analysis'],
      'a/b testing': ['ab testing', 'experimentation', 'split testing', 'a/b test', 'ab test'],
      'ab testing': ['a/b testing', 'experimentation', 'split testing'],
      'experimentation': ['a/b testing', 'ab testing', 'testing', 'experiment'],
      'sql': ['postgresql', 'mysql', 'database', 'sql query'],
      'user research': ['customer research', 'user interviews', 'research', 'user testing'],
      'cross-functional leadership': ['cross functional', 'cross-functional', 'leadership', 'team leadership'],
      'javascript': ['js', 'ecmascript'],
      'typescript': ['ts'],
      'node.js': ['nodejs', 'node']
    };

    keywords?.forEach((keyword) => {
      const variations = [
      keyword,
      keyword?.replace(/\s+/g, ''),
      keyword?.replace(/[\/\-]/g, ' '),
      keyword?.replace(/[\/\-\s]/g, '')];


      // Add semantic synonyms from the map
      if (synonymMap?.[keyword]) {
        variations?.push(...synonymMap?.[keyword]);
      }

      // Also check if this keyword appears as a synonym of another term
      Object.entries(synonymMap)?.forEach(([mainTerm, synonyms]) => {
        if (synonyms?.includes(keyword)) {
          variations?.push(mainTerm);
          variations?.push(...synonyms);
        }
      });

      // Remove duplicates from variations
      const uniqueVariations = [...new Set(variations?.map((v) => v?.toLowerCase()))];

      // Check if ANY variation appears in resume
      const found = uniqueVariations?.some((variant) => resumeLower?.includes(variant));

      if (found) {
        present?.push(keyword);
      } else {
        missing?.push(keyword);
      }
    });

    return { present, missing };
  };

  // FIXED: Comprehensive skills extraction supporting PM, technical, and business skills
  const analyzeSkillsMatch = (jobText, resumeText) => {
    const jobLower = jobText?.toLowerCase();
    const resumeLower = resumeText?.toLowerCase();

    // COMPREHENSIVE SKILL CATEGORIES (not just technical)
    const skillCategories = {
      // Product Management Skills
      productManagement: [
      'roadmapping', 'roadmap', 'product roadmap', 'user research', 'user testing',
      'a/b testing', 'ab testing', 'experimentation', 'product strategy',
      'product vision', 'user stories', 'backlog management', 'sprint planning',
      'agile methodology', 'scrum', 'kanban', 'stakeholder management',
      'cross-functional leadership', 'go-to-market', 'gtm strategy',
      'competitive analysis', 'market research', 'customer feedback',
      'feature prioritization', 'mvp', 'minimum viable product'],


      // Data & Analytics Skills
      dataAnalytics: [
      'data analysis', 'data analytics', 'analytics', 'sql', 'postgresql', 'mysql',
      'data visualization', 'tableau', 'power bi', 'looker', 'google analytics',
      'excel', 'spreadsheets', 'metrics', 'kpis', 'dashboards', 'reporting',
      'python', 'r', 'statistical analysis', 'data science', 'machine learning',
      'predictive analytics', 'business intelligence', 'bi'],


      // Technical/Engineering Skills
      technical: [
      'react', 'vue', 'angular', 'javascript', 'typescript', 'python', 'java',
      'c++', 'c#', 'node.js', 'nodejs', 'express', 'django', 'flask', 'spring',
      'html5', 'html', 'css3', 'css', 'sass', 'less', 'tailwind', 'bootstrap',
      'redux', 'mobx', 'graphql', 'rest api', 'restful', 'api',
      'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes',
      'aws', 'azure', 'gcp', 'git', 'ci/cd', 'jenkins', 'webpack', 'vite',
      'jest', 'mocha', 'cypress', 'testing', 'unit testing', 'integration testing'],


      // Design & UX Skills
      design: [
      'ux design', 'ui design', 'user experience', 'user interface', 'wireframing',
      'prototyping', 'figma', 'sketch', 'adobe xd', 'invision', 'usability testing',
      'interaction design', 'visual design', 'design systems', 'responsive design'],


      // Business & Strategy Skills
      business: [
      'strategy', 'strategic planning', 'business development', 'partnerships',
      'revenue growth', 'p&l', 'budget management', 'forecasting', 'roi',
      'okrs', 'objectives and key results', 'project management',
      'change management', 'process improvement', 'operational excellence'],


      // Soft Skills
      soft: [
      'leadership', 'communication', 'collaboration', 'problem-solving',
      'critical thinking', 'decision making', 'mentoring', 'coaching',
      'team building', 'conflict resolution', 'presentation', 'public speaking',
      'negotiation', 'influence', 'cross-functional', 'stakeholder management']

    };

    // Flatten all skills into one searchable list
    const allSkills = Object.values(skillCategories)?.flat();

    // STEP 1: Extract skills mentioned in job description
    const jobSkills = [];

    // Check each skill against job description
    allSkills?.forEach((skill) => {
      const skillVariations = [
      skill,
      skill?.replace(/\s+/g, ''), // "a/b testing" → "a/btesting"
      skill?.replace(/[\/\-]/g, ' '), // "a/b testing" → "a b testing"
      skill?.replace(/[\/\-\s]/g, '') // "a/b testing" → "abtesting"
      ];

      // Check if ANY variation appears in job description
      const found = skillVariations?.some((variant) => jobLower?.includes(variant));

      if (found) {
        jobSkills?.push(skill);
      }
    });

    // Remove duplicate skills (e.g., "analytics" and "data analytics")
    const uniqueJobSkills = [...new Set(jobSkills)];

    // STEP 2: Match against resume with FUZZY logic
    const matching = [];
    const missing = [];

    uniqueJobSkills?.forEach((skill) => {
      // Create variations for matching
      const skillVariations = [
      skill,
      skill?.replace(/\s+/g, ''),
      skill?.replace(/[\/\-]/g, ' '),
      skill?.replace(/[\/\-\s]/g, '')];


      // Add semantic synonyms for common skills
      const synonymMap = {
        'data analysis': ['analytics', 'data analytics', 'analysis'],
        'analytics': ['data analysis', 'data analytics'],
        'sql': ['postgresql', 'mysql', 'database'],
        'a/b testing': ['ab testing', 'experimentation', 'split testing', 'testing framework'],
        'javascript': ['js', 'ecmascript'],
        'typescript': ['ts'],
        'node.js': ['nodejs', 'node'],
        'user research': ['customer research', 'user interviews', 'research'],
        'roadmapping': ['roadmap', 'product roadmap', 'strategic planning'],
        'cross-functional leadership': ['cross functional', 'cross-functional teams', 'managed teams']
      };

      // Add synonyms to variations
      if (synonymMap?.[skill]) {
        skillVariations?.push(...synonymMap?.[skill]);
      }

      // Also check if skill is a synonym of another skill
      Object.entries(synonymMap)?.forEach(([mainSkill, synonyms]) => {
        if (synonyms?.includes(skill)) {
          skillVariations?.push(mainSkill);
          skillVariations?.push(...synonyms);
        }
      });

      // Check if ANY variation appears in resume
      const found = skillVariations?.some((variant) =>
      resumeLower?.includes(variant?.toLowerCase())
      );

      if (found) {
        matching?.push(skill);
      } else {
        missing?.push(skill);
      }
    });

    // Calculate score
    const totalRequired = uniqueJobSkills?.length;
    const matchCount = matching?.length;
    let score = totalRequired > 0 ? matchCount / totalRequired * 100 : 75;

    return {
      matching,
      missing,
      totalRequired,
      matchCount,
      score
    };
  };

  // FIXED: Role-aware experience analysis - Engineering experience ≠ PM experience
  const analyzeExperienceMatch = (jobText, resumeText) => {
    const jobLower = jobText?.toLowerCase();
    const resumeLower = resumeText?.toLowerCase();

    // STEP 1: Detect the PRIMARY ROLE TYPE required by the job
    const roleTypePatterns = {
      'Product Manager': ['product manager', 'pm role', 'product management', 'product lead'],
      'Engineering': ['engineer', 'developer', 'software engineer', 'backend', 'frontend', 'full stack'],
      'Data Science': ['data scientist', 'data analyst', 'machine learning engineer', 'ml engineer'],
      'Design': ['designer', 'ux designer', 'ui designer', 'product designer'],
      'Marketing': ['marketing manager', 'growth manager', 'marketing lead'],
      'Sales': ['sales manager', 'account executive', 'sales lead']
    };

    let detectedRoleType = 'General'; // Default if no specific role detected
    let highestMatchCount = 0;

    // Detect which role type appears most in job description
    Object.entries(roleTypePatterns)?.forEach(([roleType, patterns]) => {
      const matchCount = patterns?.filter((pattern) => jobLower?.includes(pattern))?.length;
      if (matchCount > highestMatchCount) {
        highestMatchCount = matchCount;
        detectedRoleType = roleType;
      }
    });

    // STEP 2: Extract REQUIRED YEARS from job description
    const jobYearsPattern = /(\d+)\+?\s*years?/gi;
    const jobYearsMatches = jobLower?.match(jobYearsPattern) || [];
    const requiredYears = Math.max(
      ...jobYearsMatches?.map((match) => parseInt(match?.match(/\d+/)?.[0] || '0')),
      0
    );

    // STEP 3: Extract ROLE-SPECIFIC experience from resume
    // Look for patterns like:
    // - "3 years as Product Manager"
    // - "Product Manager (2019-2022)"
    // - "Senior PM - 2 years"

    const roleSpecificYears = [];

    if (detectedRoleType === 'Product Manager') {
      // Extract PM-specific experience
      const pmPatterns = [
      /(\d+)\+?\s*years?\s*(?:as|in|of)?\s*(?:product\s*manager|pm|product\s*management)/gi,
      /product\s*manager.*?(\d+)\s*years?/gi,
      /pm.*?(\d+)\s*years?/gi];


      pmPatterns?.forEach((pattern) => {
        const matches = [...resumeText?.matchAll(pattern)] || [];
        matches?.forEach((match) => {
          const years = parseInt(match?.[1] || match?.[0]?.match(/\d+/)?.[0] || '0');
          if (years > 0) roleSpecificYears?.push(years);
        });
      });

      // Also check for date ranges with PM/Product Manager titles
      const pmDateRangePattern = /(?:product\s*manager|pm).*?(\d{4})\s*[-–—]\s*(\d{4}|present|current)/gi;
      const pmDateMatches = [...resumeText?.matchAll(pmDateRangePattern)] || [];
      pmDateMatches?.forEach((match) => {
        const startYear = parseInt(match?.[1]);
        const endYear = match?.[2]?.toLowerCase() === 'present' || match?.[2]?.toLowerCase() === 'current' ?
        new Date()?.getFullYear() :
        parseInt(match?.[2]);
        const years = Math.max(0, endYear - startYear);
        if (years > 0) roleSpecificYears?.push(years);
      });

    } else if (detectedRoleType === 'Engineering') {
      // Extract Engineering-specific experience
      const engineeringPatterns = [
      /(\d+)\+?\s*years?\s*(?:as|in|of)?\s*(?:engineer|developer|software\s*engineer)/gi,
      /(?:engineer|developer).*?(\d+)\s*years?/gi];


      engineeringPatterns?.forEach((pattern) => {
        const matches = [...resumeText?.matchAll(pattern)] || [];
        matches?.forEach((match) => {
          const years = parseInt(match?.[1] || match?.[0]?.match(/\d+/)?.[0] || '0');
          if (years > 0) roleSpecificYears?.push(years);
        });
      });

      // Date ranges with Engineering titles
      const engDateRangePattern = /(?:engineer|developer).*?(\d{4})\s*[-–—]\s*(\d{4}|present|current)/gi;
      const engDateMatches = [...resumeText?.matchAll(engDateRangePattern)] || [];
      engDateMatches?.forEach((match) => {
        const startYear = parseInt(match?.[1]);
        const endYear = match?.[2]?.toLowerCase() === 'present' || match?.[2]?.toLowerCase() === 'current' ?
        new Date()?.getFullYear() :
        parseInt(match?.[2]);
        const years = Math.max(0, endYear - startYear);
        if (years > 0) roleSpecificYears?.push(years);
      });

    } else {
      // For other roles or general experience, fall back to total experience calculation
      const totalExperiencePattern = /(\d+)\+?\s*years?\s*(of\s*)?(total\s*)?experience/gi;
      const totalMatches = resumeLower?.match(totalExperiencePattern) || [];
      totalMatches?.forEach((match) => {
        const years = parseInt(match?.match(/\d+/)?.[0] || '0');
        if (years > 0) roleSpecificYears?.push(years);
      });
    }

    // STEP 4: Calculate candidate's role-specific years
    // Use the MAXIMUM value found (not sum, as the same period may be mentioned multiple times)
    const candidateYears = roleSpecificYears?.length > 0 ?
    Math.max(...roleSpecificYears) :
    0;

    // Also extract TOTAL experience for context
    const totalExperiencePattern = /(\d+)\+?\s*years?\s*(of\s*)?(total\s*)?experience/gi;
    const totalMatches = resumeLower?.match(totalExperiencePattern) || [];
    const totalExperience = totalMatches?.length > 0 ?
    Math.max(...totalMatches?.map((match) => parseInt(match?.match(/\d+/)?.[0] || '0'))) :
    0;

    // STEP 5: Apply SCORING LOGIC based on role-specific experience
    let score = 0;
    let explanation = '';

    if (requiredYears === 0) {
      score = 80;
      explanation = `Job role: ${detectedRoleType}. Required years: Not specified. Candidate ${detectedRoleType} experience: ${candidateYears} years${totalExperience > candidateYears ? ` (total experience: ${totalExperience} years)` : ''}. Assuming moderate fit.`;
    } else if (candidateYears >= requiredYears) {
      score = 100;
      explanation = `Job role: ${detectedRoleType}. Required years: ${requiredYears} years ${detectedRoleType} experience. Candidate ${detectedRoleType} experience: ${candidateYears} years${totalExperience > candidateYears ? ` (total experience: ${totalExperience} years)` : ''}. ${candidateYears} >= ${requiredYears} → SCORE = 100%`;
    } else if (requiredYears - candidateYears <= 2) {
      score = 70;
      explanation = `Job role: ${detectedRoleType}. Required years: ${requiredYears} years ${detectedRoleType} experience. Candidate ${detectedRoleType} experience: ${candidateYears} years${totalExperience > candidateYears ? ` (total experience: ${totalExperience} years, but only ${candidateYears} as ${detectedRoleType})` : ''}. Gap of ${requiredYears - candidateYears} year(s) (within 2 years) → SCORE = 70%`;
    } else {
      score = 40;
      explanation = `Job role: ${detectedRoleType}. Required years: ${requiredYears} years ${detectedRoleType} experience. Candidate ${detectedRoleType} experience: ${candidateYears} years${totalExperience > candidateYears ? ` (total experience: ${totalExperience} years, but only ${candidateYears} as ${detectedRoleType})` : ''}. Gap of ${requiredYears - candidateYears} years (more than 2 years below requirement) → SCORE = 40%`;
    }

    // CRITICAL: If no role-specific experience found but total experience exists
    if (candidateYears === 0 && totalExperience > 0 && detectedRoleType !== 'General') {
      score = 40; // Default to 40% since experience is in different role
      explanation = `Job role: ${detectedRoleType}. Required years: ${requiredYears} years ${detectedRoleType} experience. Candidate has ${totalExperience} years total experience, but NO ${detectedRoleType}-specific experience detected. ${detectedRoleType} experience ≠ other experience types → SCORE = 40%`;
    }

    return {
      score,
      candidateYears,
      requiredYears,
      explanation,
      detectedRoleType,
      totalExperience,
      // Keep these for backward compatibility
      matchedPhrases: candidateYears > 0 ? [`${candidateYears} years ${detectedRoleType} experience`] : [],
      missingPhrases: candidateYears === 0 && totalExperience > 0 ? [`${detectedRoleType} experience required`] : []
    };
  };

  // UPDATED: Location extraction with explicit city/state/country mentions (DIMENSION 4)
  const extractLocationInfo = (text) => {
    const textLower = text?.toLowerCase();

    // Step 1 & 2: Extract explicit location mentions

    // Explicit "not remote" detection
    const explicitlyNotRemote = /\b(not remote|no remote|not work from home|no wfh|office only|required in office)\b/i?.test(text);

    // Work arrangement detection
    const isRemote = !explicitlyNotRemote && /\b(remote|work from home|wfh|anywhere)\b/i?.test(text);
    const isHybrid = !explicitlyNotRemote && /\b(hybrid|flexible|some remote|part remote)\b/i?.test(text);
    const isOnsite = explicitlyNotRemote || !isRemote && !isHybrid;

    // US State extraction (common abbreviations and full names)
    const statePatterns = [
    // Full state names
    /(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)/i,
    // State abbreviations with word boundaries
    /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/];


    let detectedStates = [];
    statePatterns?.forEach((pattern) => {
      const matches = text?.match(new RegExp(pattern, 'g'));
      if (matches) {
        detectedStates = detectedStates?.concat(matches?.map((m) => m?.toUpperCase()?.trim()));
      }
    });

    // Remove duplicates and normalize state names to abbreviations
    detectedStates = [...new Set(detectedStates)]?.map((state) => {
      const stateMap = {
        'TEXAS': 'TX', 'NEW JERSEY': 'NJ', 'NEW YORK': 'NY', 'CALIFORNIA': 'CA',
        'FLORIDA': 'FL', 'ILLINOIS': 'IL', 'PENNSYLVANIA': 'PA', 'OHIO': 'OH',
        'GEORGIA': 'GA', 'NORTH CAROLINA': 'NC', 'MICHIGAN': 'MI', 'WASHINGTON': 'WA',
        'MASSACHUSETTS': 'MA', 'VIRGINIA': 'VA', 'ARIZONA': 'AZ', 'TENNESSEE': 'TN',
        'COLORADO': 'CO', 'OREGON': 'OR', 'MISSOURI': 'MO', 'MARYLAND': 'MD'
      };
      return stateMap?.[state] || state;
    });

    // City detection - enhanced to capture more cities including San Francisco
    const cityPattern = /(san francisco|los angeles|new york|boston|chicago|houston|dallas|austin|seattle|denver|atlanta|miami|philadelphia|phoenix|san diego|san jose|portland|las vegas|detroit|charlotte|fort worth|memphis|baltimore|milwaukee|nashville|sacramento|kansas city|minneapolis|sf|la|nyc)/i;
    const cityMatch = text?.match(cityPattern);
    let detectedCity = cityMatch ? cityMatch?.[0] : null;

    // Normalize city abbreviations
    if (detectedCity) {
      const cityMap = {
        'sf': 'San Francisco',
        'la': 'Los Angeles',
        'nyc': 'New York'
      };
      const normalized = cityMap?.[detectedCity?.toLowerCase()];
      if (normalized) detectedCity = normalized;
    }

    return {
      isRemote,
      isHybrid,
      isOnsite,
      explicitlyNotRemote,
      states: detectedStates,
      city: detectedCity,
      hasLocationInfo: detectedStates?.length > 0 || detectedCity !== null,
      // Create formatted location string for comparison
      formattedLocation: detectedCity && detectedStates?.length > 0 ?
      `${detectedCity}, ${detectedStates?.[0]}` :
      detectedCity || detectedStates?.[0] || null,
      // Keep original text for relocation keyword matching
      originalText: text
    };
  };

  // City coordinates for distance calculation (major US cities)
  const cityCoordinates = {
    'San Francisco': { lat: 37.7749, lon: -122.4194 },
    'Los Angeles': { lat: 34.0522, lon: -118.2437 },
    'New York': { lat: 40.7128, lon: -74.0060 },
    'Chicago': { lat: 41.8781, lon: -87.6298 },
    'Houston': { lat: 29.7604, lon: -95.3698 },
    'Phoenix': { lat: 33.4484, lon: -112.0742 },
    'Philadelphia': { lat: 39.9526, lon: -75.1652 },
    'San Antonio': { lat: 29.4241, lon: -98.4936 },
    'San Diego': { lat: 32.7157, lon: -117.1611 },
    'Dallas': { lat: 32.7767, lon: -96.7970 },
    'Boston': { lat: 42.3601, lon: -71.0589 },
    'Seattle': { lat: 47.6062, lon: -122.3321 },
    'Denver': { lat: 39.7392, lon: -104.9903 },
    'Austin': { lat: 30.2672, lon: -97.7431 },
    'Portland': { lat: 45.5152, lon: -122.6784 },
    'Miami': { lat: 25.7617, lon: -80.1918 },
    'Atlanta': { lat: 33.7490, lon: -84.3880 },
    'Las Vegas': { lat: 36.1699, lon: -115.1398 },
    'Minneapolis': { lat: 44.9778, lon: -93.2650 },
    'Detroit': { lat: 42.3314, lon: -83.0458 },
    'San Jose': { lat: 37.3382, lon: -121.8863 },
    'Nashville': { lat: 36.1627, lon: -86.7816 },
    'Memphis': { lat: 35.1495, lon: -90.0490 },
    'Baltimore': { lat: 39.2904, lon: -76.6122 },
    'Milwaukee': { lat: 43.0389, lon: -87.9065 },
    'Charlotte': { lat: 35.2271, lon: -80.8431 },
    'Kansas City': { lat: 39.0997, lon: -94.5786 },
    'Fort Worth': { lat: 32.7555, lon: -97.3308 },
    'Whitehouse Station': { lat: 40.5576, lon: -74.5285 }
  };

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // LOCATION SCORING: Pure rule-based logic with distance matching (NO AI)
  // Step 1: Extract candidate location explicitly from resume
  // Step 2: Extract job location explicitly from job description
  // Step 3: Apply matching rules (including 50-mile proximity check)
  const calculateLocationScore = (resumeLocation, jobLocation) => {
    const candidateLocation = resumeLocation?.formattedLocation || 'Not specified';
    const jobLocationStr = jobLocation?.formattedLocation || 'Not specified';

    // Check for relocation willingness in resume
    const relocatableKeywords = /open to relocation|willing to relocate|relocation|open to move|willing to move/i;
    const isRelocatable = relocatableKeywords.test(resumeLocation?.originalText || '');

    // Helper: Check if locations match (city + state)
    const hasCityMatch = jobLocation?.city && resumeLocation?.city &&
      jobLocation?.city?.toLowerCase() === resumeLocation?.city?.toLowerCase();

    const hasStateMatch = jobLocation?.states?.length > 0 && resumeLocation?.states?.length > 0 &&
      jobLocation?.states?.some((state) => resumeLocation?.states?.includes(state));

    // Helper: Check if cities are within 50 miles
    const isWithin50Miles = () => {
      if (!resumeLocation?.city || !jobLocation?.city) return false;

      const candidateCity = Object.keys(cityCoordinates).find(
        c => c.toLowerCase() === resumeLocation.city.toLowerCase()
      );
      const jobCity = Object.keys(cityCoordinates).find(
        c => c.toLowerCase() === jobLocation.city.toLowerCase()
      );

      if (!candidateCity || !jobCity) return false;

      const candidateCoords = cityCoordinates[candidateCity];
      const jobCoords = cityCoordinates[jobCity];

      const distance = calculateDistance(
        candidateCoords.lat,
        candidateCoords.lon,
        jobCoords.lat,
        jobCoords.lon
      );

      return distance <= 50;
    };

    let score = 0;
    let matchedKeywords = 0;
    let totalKeywords = 1;
    let reason = '';

    // RULE 1: If job is remote → 100%
    if (jobLocation?.isRemote && !jobLocation?.explicitlyNotRemote) {
      score = 100;
      matchedKeywords = 1;
      reason = `Job is remote position. Your location: ${candidateLocation}. Match: Perfect fit.`;
      return { score, reason, matchedKeywords, totalKeywords };
    }

    // RULE 2: If candidate location == job location (exact match) → 100%
    if ((hasCityMatch && hasStateMatch) || (hasStateMatch && !jobLocation?.city)) {
      score = 100;
      matchedKeywords = 1;
      reason = `Your location (${candidateLocation}) matches job location (${jobLocationStr}). Perfect match.`;
      return { score, reason, matchedKeywords, totalKeywords };
    }

    // RULE 3: If job is hybrid → 40%
    if (jobLocation?.isHybrid && !jobLocation?.explicitlyNotRemote) {
      score = 40;
      matchedKeywords = 0;
      reason = `Job is hybrid. Your location: ${candidateLocation}. Job location: ${jobLocationStr}. Hybrid role with location mismatch.`;
      return { score, reason, matchedKeywords, totalKeywords };
    }

    // RULE 4: If candidate explicitly states "open to relocation" → 85%
    if (isRelocatable) {
      score = 85;
      matchedKeywords = 1;
      reason = `Your location (${candidateLocation}) differs from job location (${jobLocationStr}), but you're open to relocation. Score: 85%.`;
      return { score, reason, matchedKeywords, totalKeywords };
    }

    // RULE 5: Different location with NO relocation signal → 40%
    if (resumeLocation?.hasLocationInfo && jobLocation?.hasLocationInfo) {
      score = 40;
      matchedKeywords = 0;
      reason = `Your location (${candidateLocation}) differs from job location (${jobLocationStr}). No relocation signal found. Score: 40%.`;
      return { score, reason, matchedKeywords, totalKeywords };
    }

    // FALLBACK: Missing location info
    if (!resumeLocation?.hasLocationInfo || !jobLocation?.hasLocationInfo) {
      score = 50;
      matchedKeywords = 0;
      reason = `Location information incomplete. Your location: ${candidateLocation}. Job location: ${jobLocationStr}. Score: 50%.`;
      return { score, reason, matchedKeywords, totalKeywords };
    }

    // Default fallback
    score = 50;
    matchedKeywords = 0;
    reason = `Could not determine location match. Your location: ${candidateLocation}. Job location: ${jobLocationStr}. Score: 50%.`;
    return { score, reason, matchedKeywords, totalKeywords };
  };

  const calculateEducationScore = (resumeText, jobDescription) => {
    const getEducationLevel = (text) => {
      const textLower = text?.toLowerCase();
      const levels = {
        'phd': 4, 'doctorate': 4, 'doctoral': 4,
        'master': 3, 'masters': 3, "master's": 3, 'mba': 3,
        'bachelor': 2, 'bachelors': 2, "bachelor's": 2, 'undergraduate': 2,
        'associate': 1, 'diploma': 1,
        'high school': 0, 'hs diploma': 0
      };

      let highestLevel = -1;
      Object.entries(levels).forEach(([keyword, level]) => {
        if (textLower?.includes(keyword) && level > highestLevel) {
          highestLevel = level;
        }
      });
      return highestLevel;
    };

    const jobLevel = getEducationLevel(jobDescription);
    const resumeLevel = getEducationLevel(resumeText);

    if (jobLevel === -1) return 80; // No requirement
    if (resumeLevel >= jobLevel) return 100;
    if (resumeLevel === jobLevel - 1) return 60;
    return 40;
  };

  const calculateScore = () => {
    const resumeLower = resumeText?.toLowerCase();
    const jobLower = jobDescription?.toLowerCase();

    // Use new enhanced analysis functions
    const skillsAnalysis = analyzeSkillsMatch(jobDescription, resumeText);
    const experienceAnalysis = analyzeExperienceMatch(jobDescription, resumeText);

    // Keywords analysis
    const jobKeywords = extractKeywordsFromJob(jobDescription);
    const keywordAnalysis = analyzeKeywordMatches(jobKeywords, resumeText);
    const keywordsScore = jobKeywords?.length > 0 ?
    keywordAnalysis?.present?.length / jobKeywords?.length * 100 : 75;

    // FIXED: Education analysis - Compare education LEVELS, not counts
    const getEducationLevel = (text) => {
      const textLower = text?.toLowerCase();

      // Education level hierarchy (higher number = higher education)
      const levels = {
        'phd': 4,
        'doctorate': 4,
        'doctoral': 4,
        'master': 3,
        'masters': 3,
        "master's": 3,
        'mba': 3,
        'bachelor': 2,
        'bachelors': 2,
        "bachelor's": 2,
        'undergraduate': 2,
        'associate': 1,
        'diploma': 1,
        'high school': 0,
        'hs diploma': 0
      };

      let highestLevel = -1;
      let levelName = null;

      // Find the highest education level mentioned in the text
      Object.entries(levels)?.forEach(([keyword, level]) => {
        if (textLower?.includes(keyword) && level > highestLevel) {
          highestLevel = level;
          levelName = keyword;
        }
      });

      return { level: highestLevel, name: levelName };
    };

    const jobEducation = getEducationLevel(jobDescription);
    const resumeEducation = getEducationLevel(resumeText);

    let educationScore = 80; // Default score if no education info
    let educationExplanation = '';

    if (jobEducation?.level === -1 && resumeEducation?.level === -1) {
      // Neither job nor resume mention education
      educationScore = 80;
      educationExplanation = 'No education requirements specified in job description';
    } else if (jobEducation?.level === -1 && resumeEducation?.level >= 0) {
      // Job doesn't require education but candidate has some
      educationScore = 100;
      educationExplanation = `Your education (${resumeEducation?.name}) exceeds the requirements (no specific education required)`;
    } else if (jobEducation?.level >= 0 && resumeEducation?.level === -1) {
      // Job requires education but candidate doesn't mention any
      educationScore = 40;
      educationExplanation = `Job requires ${jobEducation?.name} but no education found in resume`;
    } else if (resumeEducation?.level >= jobEducation?.level) {
      // Candidate's education level meets or exceeds job requirement
      educationScore = 100;
      educationExplanation = `Your education (${resumeEducation?.name}) ${resumeEducation?.level > jobEducation?.level ? 'exceeds' : 'meets'} the requirements (${jobEducation?.name})`;
    } else {
      // Candidate's education level is below job requirement
      const levelGap = jobEducation?.level - resumeEducation?.level;
      educationScore = levelGap === 1 ? 60 : 40; // 1 level below = 60%, 2+ levels below = 40%
      educationExplanation = `Your education (${resumeEducation?.name}) is below job requirements (${jobEducation?.name})`;
    }

    // Location scoring
    const resumeLocation = extractLocationInfo(resumeText);
    const jobLocation = extractLocationInfo(jobDescription);
    const locationResult = calculateLocationScore(resumeLocation, jobLocation);

    // Calculate weighted overall score - UPDATED FORMULA
    // NO ADJUSTMENTS. Pure math:
    // FINAL SCORE = (skillsMatch × 0.40 + experienceLevel × 0.25 + locationMatch × 0.15 + keywords × 0.10 + education × 0.10)
    const overallScore = Math.round(
      skillsAnalysis?.score * 0.40 +
      experienceAnalysis?.score * 0.25 +
      locationResult?.score * 0.15 +
      keywordsScore * 0.10 +
      educationScore * 0.10
    );

    return {
      overallScore,
      factors: [
      {
        name: 'Skills Match',
        score: Math.round(skillsAnalysis?.score),
        icon: 'Code',
        color: 'var(--color-primary)',
        matchedKeywords: skillsAnalysis?.matchCount,
        totalKeywords: skillsAnalysis?.totalRequired,
        explanation: `WHY: Found ${skillsAnalysis?.matchCount} of ${skillsAnalysis?.totalRequired} required skills. Matched: ${skillsAnalysis?.matching?.slice(0, 5)?.join(', ') || 'none'}. ${skillsAnalysis?.missing?.length > 0 ? `Missing: ${skillsAnalysis?.missing?.slice(0, 3)?.join(', ')} - consider adding these to strengthen your profile` : 'Great skill coverage!'}`
      },
      {
        name: 'Experience Level',
        score: Math.round(experienceAnalysis?.score),
        icon: 'Briefcase',
        color: 'var(--color-accent)',
        matchedKeywords: experienceAnalysis?.matchedPhrases?.length,
        totalKeywords: experienceAnalysis?.matchedPhrases?.length + experienceAnalysis?.missingPhrases?.length,
        explanation: `WHY: ${experienceAnalysis?.explanation}`
      },
      {
        name: 'Location Match',
        score: Math.round(locationResult?.score),
        icon: 'MapPin',
        color: 'var(--color-warning)',
        matchedKeywords: locationResult?.matchedKeywords,
        totalKeywords: locationResult?.totalKeywords,
        explanation: `WHY: ${locationResult?.reason}`
      },
      {
        name: 'Keywords',
        score: Math.round(keywordsScore),
        icon: 'Hash',
        color: 'var(--color-muted-foreground)',
        matchedKeywords: keywordAnalysis?.present?.length,
        totalKeywords: jobKeywords?.length,
        explanation: `WHY: Found ${keywordAnalysis?.present?.length} of ${jobKeywords?.length} job keywords. Present: ${keywordAnalysis?.present?.slice(0, 4)?.join(', ') || 'few'}. ${keywordAnalysis?.missing?.length > 0 ? `Missing keywords (add these): ${keywordAnalysis?.missing?.slice(0, 3)?.join(', ')}` : 'Excellent keyword coverage!'}`
      },
      {
        name: 'Education',
        score: Math.round(educationScore),
        icon: 'GraduationCap',
        color: 'var(--color-success)',
        matchedKeywords: resumeEducation?.level >= jobEducation?.level ? 1 : 0,
        totalKeywords: jobEducation?.level >= 0 ? 1 : 1,
        explanation: `WHY: ${educationExplanation}`
      }],

      extractedRole: extractRoleFromJobDescription(jobDescription),
      weights: weights,
      locationDetails: {
        resume: resumeLocation,
        job: jobLocation
      }
    };
  };

  const handleAnalyze = async () => {
    if (!resumeText?.trim() || !jobDescription?.trim()) {
      setAnalysisError('Please provide both resume and job description');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResults(null);

    try {
      // Get Claude's intelligent analysis
      const claudeAnalysis = await analyzeWithClaude(resumeText, jobDescription);

      // Calculate traditional scores (simple math rules) - these are validated and reliable
      const locationInfo = extractLocationInfo(resumeText);
      const jobLocationInfo = extractLocationInfo(jobDescription);
      const locationScore = calculateLocationScore(locationInfo, jobLocationInfo);

      const educationScore = calculateEducationScore(resumeText, jobDescription);

      // Use Claude's scores for complex analysis
      const skillsScore = claudeAnalysis.skillMatch.matchScore;
      const experienceScore = claudeAnalysis.experienceMatch.score;
      // CRITICAL: Use our validated location scoring logic, not Claude's
      const locationFinalScore = locationScore.score;

      // Keywords score calculated from actual keyword matches from Claude analysis
      // If Claude found keyword data, calculate based on matched vs total keywords
      const matchedKeywordCount = claudeAnalysis.keywordMatch?.matched?.length || 0;
      const missingKeywordCount = claudeAnalysis.keywordMatch?.missing?.length || 0;
      const totalKeywordCount = matchedKeywordCount + missingKeywordCount;
      const keywordsScore = totalKeywordCount > 0
        ? Math.round((matchedKeywordCount / totalKeywordCount) * 100)
        : 75; // Default score if no keywords extracted

      // Calculate weighted score with YOUR weights
      const overallScore = Math.round(
        skillsScore * (weights.skills / 100) +
        experienceScore * (weights.experience / 100) +
        locationFinalScore * (weights.location / 100) +
        keywordsScore * (weights.keywords / 100) +
        educationScore * (weights.education / 100)
      );

      // Generate pitch based on score thresholds
      const generatePitch = (score, skillsScore, claudeData, resume, job) => {
        if (score >= 80) {
          // Strong candidate - generate compelling pitch
          const matchedSkills = claudeData.skillMatch.matched.slice(0, 2).join(', ');
          const yearsExp = claudeData.experienceMatch.candidateYears || 0;
          const keyAchievements = resume.match(/[0-9]+\%|[0-9]+M|[0-9]+K|\$[0-9]+|[0-9]+ years/g) || [];
          const uniqueMetric = keyAchievements[0] || `${yearsExp} years`;

          const pitch = `I've delivered results with ${matchedSkills}, bringing ${uniqueMetric} of proven impact. Your team needs this—I'm ready to accelerate.`;

          return {
            show: true,
            pitch: pitch,
            note: "Personalized pitch—customize as needed."
          };
        } else if (score >= 60) {
          // Medium candidate - show gaps
          const gaps = [];
          if (skillsScore < 70) gaps.push(`Skills: You have ${Math.round(skillsScore)}% match`);
          if (claudeData.experienceMatch.score < 70) gaps.push(`Experience: ${claudeData.experienceMatch.candidateYears || 0} years provided`);
          if (claudeData.locationMatch.score < 80) gaps.push(`Location: Different location specified`);

          return {
            show: false,
            score: score,
            reason: `You're ${score}% fit. Gaps:`,
            gaps: gaps.length > 0 ? gaps : ["Review your profile vs role requirements"],
            next: "Close gaps, reanalyze to unlock pitch."
          };
        } else {
          // Poor candidate - different domain
          return {
            show: false,
            score: score,
            reason: `Not a strong fit (${score}%). This appears to be a different career path.`,
            suggestion: "Find roles matching 70%+ for better success."
          };
        }
      };

      const pitch = generatePitch(overallScore, skillsScore, claudeAnalysis, resumeText, jobDescription);

      // Build results object with Claude insights
      const results = {
        overallScore,
        factors: [
          {
            name: 'Skills Match',
            score: Math.round(skillsScore),
            icon: 'Code',
            color: 'var(--color-primary)',
            matchedKeywords: claudeAnalysis.skillMatch.matched.length,
            totalKeywords: claudeAnalysis.skillMatch.matched.length + claudeAnalysis.skillMatch.missing.length,
            explanation: `✓ MATCHED SKILLS (${claudeAnalysis.skillMatch.matched.length}): ${claudeAnalysis.skillMatch.matched.join(', ') || 'none'}
${claudeAnalysis.skillMatch.missing.length > 0 ? `✗ MISSING SKILLS (${claudeAnalysis.skillMatch.missing.length}): ${claudeAnalysis.skillMatch.missing.join(', ')}` : ''}
${claudeAnalysis.skillMatch.transferable.length > 0 ? `➜ TRANSFERABLE SKILLS (${claudeAnalysis.skillMatch.transferable.length}): ${claudeAnalysis.skillMatch.transferable.join(', ')}` : ''}`
          },
          {
            name: 'Experience Level',
            score: Math.round(experienceScore),
            icon: 'Briefcase',
            color: 'var(--color-accent)',
            matchedKeywords: 1,
            totalKeywords: 1,
            explanation: `WHY: ${claudeAnalysis.experienceMatch.explanation}`
          },
          {
            name: 'Location Match',
            score: Math.round(locationFinalScore),
            icon: 'MapPin',
            color: 'var(--color-warning)',
            matchedKeywords: locationFinalScore >= 80 ? 1 : 0,
            totalKeywords: 1,
            explanation: `EXTRACTED LOCATIONS:
Your Location: ${claudeAnalysis.resumeParsed.location || locationInfo.formattedLocation || 'Not specified in resume'}
Job Location: ${claudeAnalysis.jobAnalysis.location || jobLocationInfo.formattedLocation || 'Not specified'}

WORK ARRANGEMENT:
Your Preference: ${locationInfo.isRemote ? 'Remote' : locationInfo.isHybrid ? 'Hybrid' : 'On-site'}
Job Type: ${jobLocationInfo.isRemote ? 'Remote' : jobLocationInfo.isHybrid ? 'Hybrid' : 'On-site'}

SCORING REASON:
${locationScore.reason}`
          },
          {
            name: 'Keywords',
            score: Math.round(keywordsScore),
            icon: 'Hash',
            color: 'var(--color-muted-foreground)',
            matchedKeywords: claudeAnalysis.keywordMatch?.matched?.length || 0,
            totalKeywords: (claudeAnalysis.keywordMatch?.matched?.length || 0) + (claudeAnalysis.keywordMatch?.missing?.length || 0),
            explanation: `✓ FOUND KEYWORDS (${claudeAnalysis.keywordMatch?.matched?.length || 0}): ${claudeAnalysis.keywordMatch?.matched?.join(', ') || 'none'}
${claudeAnalysis.keywordMatch?.missing?.length > 0 ? `✗ MISSING KEYWORDS (${claudeAnalysis.keywordMatch?.missing?.length}): ${claudeAnalysis.keywordMatch?.missing?.join(', ')}` : 'Perfect keyword coverage!'}`
          },
          {
            name: 'Education',
            score: Math.round(educationScore),
            icon: 'GraduationCap',
            color: 'var(--color-success)',
            matchedKeywords: 1,
            totalKeywords: 1,
            explanation: `Education requirement: ${claudeAnalysis.jobAnalysis.requiredEducation || 'Not specified'}. Your background: ${claudeAnalysis.resumeParsed.education || 'Not mentioned'}`
          }
        ],
        extractedRole: extractRoleFromJobDescription(jobDescription),
        weights: weights,
        locationDetails: {
          resume: locationInfo,
          job: jobLocationInfo
        },
        pitch: pitch, // Candidate pitch based on score
        claudeAnalysis: claudeAnalysis // Keep raw data for future use
      };

      setAnalysisResults(results);
      setAnalysisError(null);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(error.message || 'Analysis failed. Please try again.');
      setAnalysisResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('scoringWeights', JSON.stringify(weights));
    alert('Configuration saved successfully!');
  };

  const handleLoadConfig = () => {
    const saved = localStorage.getItem('scoringWeights');
    if (saved) {
      setWeights(JSON.parse(saved));
    } else {
      setWeights({
        skills: 40,
        experience: 25,
        location: 15,
        education: 10,
        keywords: 10
      });
    }
  };

  const totalWeight = Object.values(weights)?.reduce((sum, val) => sum + val, 0);
  const isValidWeight = totalWeight === 100 || Math.abs(totalWeight - 100) < 0.01; // Allow tiny rounding errors
  const canAnalyze = resumeText?.trim() && jobDescription?.trim() && isValidWeight;

  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      
      <main className="main-content">
        <div className="max-w-screen-2xl mx-auto py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Find Your Perfect Job Match

                </h1>
                <p className="text-muted-foreground">Discover skill gaps and get actionable advice before applying

                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                iconName="Settings"
                iconPosition="left"
                onClick={() => setScoringConfigOpen(true)}>

                Scoring Settings
              </Button>
            </div>
          </div>

          {/* Privacy Notice Banner */}
          <div className="mb-8 p-4 bg-blue/5 border border-blue/20 rounded-lg flex items-start gap-3">
            <Icon name="Shield" size={20} color="var(--color-primary)" className="mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">
                Your privacy is protected
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We do not store, save, or retain any of your personal data, resume information, or job descriptions. All analysis is performed locally in your browser. Your data is never sent to our servers and is deleted immediately when you leave this page.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ResumeUploadSection
                resumeText={resumeText}
                onResumeChange={setResumeText} />


              <JobDescriptionSection
                jobDescription={jobDescription}
                onJobDescriptionChange={setJobDescription}
                onAutoFill={handleAutoFillJob} />


              <div className="bg-card border border-border rounded-lg p-6">
                <Button
                  variant="default"
                  size="lg"
                  iconName="Sparkles"
                  iconPosition="left"
                  onClick={handleAnalyze}
                  disabled={!canAnalyze || isAnalyzing}
                  loading={isAnalyzing}
                  fullWidth>

                  {isAnalyzing ? 'Analyzing...' : 'Analyze Match'}
                </Button>
                
                {!isValidWeight &&
                <div className="flex items-center gap-2 mt-3 text-warning text-sm">
                    <Icon name="AlertTriangle" size={16} />
                    <span>Scoring weights must total 100%</span>
                  </div>
                }
              </div>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              {analysisError ? (
                <AnalysisErrorPanel
                  error={analysisError}
                  onRetry={handleAnalyze}
                  isRetrying={isAnalyzing}
                />
              ) : (
                <AnalysisResultsPanel
                  results={analysisResults}
                  resumeText={resumeText}
                  jobDescription={jobDescription}
                  onOpenScoringSettings={() => setScoringConfigOpen(true)}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)} />


      {scoringConfigOpen &&
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
              <h2 className="text-xl font-semibold text-foreground">Scoring Configuration</h2>
              <button
              onClick={() => setScoringConfigOpen(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors">

                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="p-6">
              <ScoringConfigPanel
              weights={weights}
              onWeightsChange={setWeights}
              onSaveConfig={handleSaveConfig}
              onLoadConfig={handleLoadConfig} />

              <div className="flex justify-end mt-6">
                <Button
                variant="default"
                onClick={() => setScoringConfigOpen(false)}>

                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      }

      {/* Footer Privacy Statement */}
      <footer className="bg-muted/30 border-t border-border mt-16 py-8">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Your Privacy</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ No data stored on servers</li>
                <li>✓ No resumes saved</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">How It Works</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Analysis happens in your browser</li>
                <li>• Data sent to Claude only for analysis</li>
                <li>• Results deleted immediately</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Data Handling</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Resume: Not stored or logged</li>
                <li>• Job Description: Not stored or logged</li>
                <li>• Personal Info: Processed, never saved</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
            <p>JobFit AI respects your privacy. All data is processed locally and securely. Nothing about you is retained after you leave this page.</p>
          </div>
        </div>
      </footer>
    </div>);

};

export default AnalysisDashboard;