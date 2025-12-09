import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';


const AnalysisResultsPanel = ({ results, onOpenScoringSettings, resumeText, jobDescription }) => {
  const [expandedFactor, setExpandedFactor] = useState(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animated score reveal effect
  useEffect(() => {
    if (results?.overallScore && !isAnimating) {
      setIsAnimating(true);
      setDisplayScore(0);
      
      const targetScore = results?.overallScore;
      const duration = 2000; // 2 seconds animation
      const steps = 60; // Number of animation steps
      const increment = targetScore / steps;
      const intervalDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const newScore = Math.min(Math.round(increment * currentStep), targetScore);
        setDisplayScore(newScore);
        
        if (currentStep >= steps || newScore >= targetScore) {
          clearInterval(interval);
          setDisplayScore(targetScore);
          setIsAnimating(false);
        }
      }, intervalDuration);
      
      return () => clearInterval(interval);
    }
  }, [results?.overallScore]);

  // Helper function to render explanation text with color coding
  const renderExplanation = (text) => {
    if (!text) return text;

    const parts = text.split(/(\[YOURS\].*?\[\/YOURS\]|\[JOB\].*?\[\/JOB\]|\[WHY\].*?\[\/WHY\])/g);

    return parts.map((part, idx) => {
      if (part?.startsWith('[YOURS]')) {
        const content = part.replace('[YOURS]', '').replace('[/YOURS]', '');
        return <span key={idx} style={{ color: 'var(--color-primary)' }} className="font-bold">{content}</span>;
      }
      if (part?.startsWith('[JOB]')) {
        const content = part.replace('[JOB]', '').replace('[/JOB]', '');
        return <span key={idx} style={{ color: 'var(--color-accent)' }} className="font-bold">{content}</span>;
      }
      if (part?.startsWith('[WHY]')) {
        const content = part.replace('[WHY]', '').replace('[/WHY]', '');
        // Extract the label and content - format is "Label: content"
        const [label, ...contentParts] = content.split(':');
        const contentText = contentParts.join(':').trim();
        return (
          <span key={idx}>
            <span style={{ color: '#ff6b35' }} className="font-bold">{label}:</span>
            {' '}{contentText}
          </span>
        );
      }
      return part;
    });
  };

  if (!results) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center min-h-[600px] shadow-sm">
        <div className="w-28 h-28 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 border border-border">
          <Icon name="BarChart3" size={48} className="text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
          No Analysis Yet
        </h3>
        <p className="text-muted-foreground text-center max-w-md leading-relaxed">
          Upload your resume and paste a job description, then click "Analyze Match" to see your compatibility score and detailed breakdown.
        </p>
      </div>
    );
  }

  const getScoreClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#16A34A'; // Green-600 (like PageSpeed)
    if (score >= 60) return '#EAB308'; // Yellow-500
    return '#DC2626'; // Red-600
  };

  const getScoreGlow = (score) => {
    if (score >= 80) return 'rgba(22, 163, 74, 0.2)';
    if (score >= 60) return 'rgba(234, 179, 8, 0.2)'; // Yellow glow
    return 'rgba(220, 38, 38, 0.2)';
  };


  // Generate top matched skills for badges - using actual matched keywords
  const getTopMatchedSkills = () => {
    if (!results?.factors) return [];
    
    const skillFactor = results?.factors?.find(f => f?.name === 'Skills Match');
    if (!skillFactor || !skillFactor?.matchedKeywords) return [];

    // Extract actual skills from the explanations and context
    const skillsFromExplanation = skillFactor?.explanation?.match(/\b(react|vue|angular|javascript|typescript|python|java|c\+\+|c#|ruby|go|rust|swift|kotlin|php|node\.?js|express|django|flask|spring|\.net|html5?|css3?|sass|less|tailwind|bootstrap|redux|mobx|graphql|rest|api|sql|nosql|mongodb|postgresql|mysql|redis|elasticsearch|docker|kubernetes|aws|azure|gcp|git|ci\/cd|jenkins|terraform|webpack|vite|jest|mocha|cypress|selenium)\b/gi) || [];
    
    // Return unique matched skills
    const uniqueSkills = [...new Set(skillsFromExplanation?.map(s => {
      // Capitalize appropriately
      const skillMap = {
        'react': 'React', 'vue': 'Vue', 'angular': 'Angular',
        'javascript': 'JavaScript', 'typescript': 'TypeScript',
        'python': 'Python', 'java': 'Java', 'node.js': 'Node.js', 'nodejs': 'Node.js',
        'redux': 'Redux', 'graphql': 'GraphQL', 'rest': 'REST API',
        'mongodb': 'MongoDB', 'postgresql': 'PostgreSQL', 'mysql': 'MySQL',
        'docker': 'Docker', 'kubernetes': 'Kubernetes',
        'aws': 'AWS', 'azure': 'Azure', 'gcp': 'Google Cloud',
        'git': 'Git', 'html': 'HTML/CSS', 'css': 'HTML/CSS'
      };
      return skillMap[s?.toLowerCase()] || s?.charAt(0)?.toUpperCase() + s?.slice(1)?.toLowerCase();
    }))];
    
    return uniqueSkills?.slice(0, Math.min(6, Math.max(3, skillFactor?.matchedKeywords || 3)));
  };

  // COMPLETELY REWRITTEN: Extract specific achievements from resume that match job requirements
  const extractRelevantAchievements = () => {
    if (!resumeText || !jobDescription) return null;
    
    const achievements = {
      technical: [],
      metrics: [],
      leadership: [],
      research: [],
      testing: []
    };
    
    // ========================================
    // STEP 1: Extract ALL job requirements with keywords
    // ========================================
    const jobLower = jobDescription?.toLowerCase();
    const resumeLower = resumeText?.toLowerCase();
    
    // Map job requirements to resume achievement patterns
    const requirementPatterns = {
      'a/b testing': {
        keywords: ['a/b test', 'ab test', 'experiment', 'testing framework', 'conversion'],
        resumePatterns: [
          /(?:owned|led|built|managed|implemented)\s+(?:a\/b|ab)?\s*test(?:ing)?[^.]*?(?:\d+%|improvement|increase|conversion|lift)/gi,
          /(?:a\/b|ab)\s*test(?:ing)?\s+framework[^.]*?(?:\d+%|resulting|impact)/gi,
          /(?:experiment|testing)\s+(?:framework|platform|system)[^.]*?(?:\d+%|conversion|improvement)/gi
        ]
      },
      'data analysis': {
        keywords: ['sql', 'python', 'dashboard', 'analytics', 'data'],
        resumePatterns: [
          /(?:built|created|developed|designed)\s+(?:data\s+analysis\s+)?dashboard(?:s)?[^.]*?(?:using|with)\s+(?:sql|python)/gi,
          /(?:sql|python)[^.]*?(?:dashboard|analysis|analytics|pipeline)/gi,
          /(?:analyzed|processed|queried)[^.]*?(?:\d+[MKB]?\+?|million|thousand)\s+(?:records|rows|data)/gi
        ]
      },
      'cross-functional': {
        keywords: ['cross-functional', 'cross function', 'leadership', 'managed teams', 'led teams'],
        resumePatterns: [
          /(?:managed|led|coordinated)\s+cross[- ]?functional\s+teams?[^.]*?(?:\((?:design|engineering|data|product|marketing)[^)]*\))?/gi,
          /(?:led|managed|coordinated)[^.]*?teams?[^.]*?(?:design|engineering|data|product|marketing)/gi,
          /cross[- ]?functional[^.]*?(?:leadership|collaboration|coordination)/gi
        ]
      },
      'user research': {
        keywords: ['user research', 'customer research', 'interviews', 'surveys', 'usability'],
        resumePatterns: [
          /(?:conducted|performed|led)\s+user\s+research[^.]*?(?:with\s+)?(?:\d+\+?)\s+(?:customers|users|participants)/gi,
          /(?:user|customer)\s+(?:interviews|surveys|research)[^.]*?(?:\d+\+?)\s+(?:customers|users|participants)/gi,
          /(?:usability|user)\s+(?:testing|research|studies)[^.]*?(?:\d+|participants)/gi
        ]
      },
      'product management': {
        keywords: ['product', 'roadmap', 'strategy', 'feature', 'launch'],
        resumePatterns: [
          /(?:launched|shipped|delivered)\s+(?:\d+\+?)\s+(?:features?|products?)[^.]*?(?:\d+[MKB]?\+?|million|thousand)?\s+(?:users|customers)/gi,
          /(?:defined|built|created)\s+product\s+(?:roadmap|strategy)[^.]*?/gi,
          /(?:product\s+)?(?:launch|release|delivery)[^.]*?(?:\d+%|improvement|growth|adoption)/gi
        ]
      },
      'technical': {
        keywords: ['react', 'python', 'sql', 'javascript', 'api', 'system', 'architecture'],
        resumePatterns: [
          /(?:built|developed|engineered|created)\s+(?:\d+\+?)\s+(?:pipelines?|systems?|applications?|services?|features?)[^.]*?(?:using|with)\s+(?:react|python|sql|javascript|node\.js)/gi,
          /(?:architected|designed)\s+(?:scalable|distributed|enterprise)[^.]*?(?:system|platform|infrastructure)/gi,
          /(?:react|python|sql|javascript|api)[^.]*?(?:\d+[MKB]?\+?|million|thousand)\s+(?:users|records|requests)/gi
        ]
      }
    };
    
    // ========================================
    // STEP 2: Check which requirements exist in job description
    // ========================================
    const relevantRequirements = [];
    
    Object.keys(requirementPatterns)?.forEach(requirement => {
      const pattern = requirementPatterns?.[requirement];
      const hasRequirement = pattern?.keywords?.some(keyword => 
        jobLower?.includes(keyword?.toLowerCase())
      );
      
      if (hasRequirement) {
        relevantRequirements?.push(requirement);
      }
    });
    
    // ========================================
    // STEP 3: Extract matching achievements from resume
    // ========================================
    const extractedAchievements = [];
    
    relevantRequirements?.forEach(requirement => {
      const patterns = requirementPatterns?.[requirement]?.resumePatterns || [];
      
      patterns?.forEach(pattern => {
        const matches = resumeText?.match(pattern) || [];
        
        matches?.forEach(match => {
          // Clean up the match
          let achievement = match?.trim();
          
          // Remove trailing incomplete text
          if (!achievement?.endsWith('.') && !achievement?.endsWith('%')) {
            const lastSentenceEnd = Math.max(
              achievement?.lastIndexOf('.'),
              achievement?.lastIndexOf('%'),
              achievement?.lastIndexOf(')')
            );
            if (lastSentenceEnd > 0) {
              achievement = achievement?.substring(0, lastSentenceEnd + 1);
            }
          }
          
          // Only keep achievements with metrics or clear impact
          const hasMetrics = /\d+%|\d+[MKB]?\+?\s+(?:users|customers|records|features|projects|teams|people|improvement|increase|growth|conversion|lift)/i?.test(achievement);
          
          if (hasMetrics && achievement?.length > 20 && achievement?.length < 200) {
            extractedAchievements?.push({
              text: achievement,
              requirement: requirement,
              category: requirement === 'technical' ? 'technical' : 
                       requirement === 'cross-functional' ? 'leadership' :
                       requirement === 'user research' ? 'research' :
                       requirement === 'a/b testing'? 'testing' : 'general'
            });
          }
        });
      });
    });
    
    // Remove duplicates and sort by length (prefer detailed achievements)
    const uniqueAchievements = [];
    const seenAchievements = new Set();
    
    extractedAchievements?.forEach(achievement => {
      const normalized = achievement?.text?.toLowerCase()?.trim();
      if (!seenAchievements?.has(normalized)) {
        seenAchievements?.add(normalized);
        uniqueAchievements?.push(achievement);
      }
    });
    
    uniqueAchievements?.sort((a, b) => b?.text?.length - a?.text?.length);
    
    return uniqueAchievements?.slice(0, 5); // Return top 5 achievements
  };

  // Generate pitch using the three-tier system: 80%+ pitch, 60-79% gaps, <60% guidance
  const generateApplicationPitch = () => {
    if (!results) return null;

    const overallScore = results?.overallScore || 0;
    const skillsScore = results?.factors?.find(f => f?.name === 'Skills Match')?.score || 0;
    const factors = results?.factors || [];

    // ===== TIER 1: STRONG FIT (80%+) - GENERATE COMPELLING PITCH =====
    if (overallScore >= 80) {
      // Extract matched skills from Skills Match factor
      const skillsFactor = factors?.find(f => f?.name === 'Skills Match');
      const matchedSkills = skillsFactor?.explanation?.match(/✓ MATCHED SKILLS[^:]*:\s*([^✗]+)/)?.[1]?.trim()?.split(',')?.slice(0, 2)?.map(s => s?.trim()) || [];

      // Extract years of experience
      const experienceFactor = factors?.find(f => f?.name === 'Experience Level');
      const yearsExp = experienceFactor?.explanation?.match(/(\d+)\s*year/)?.[1] || null;

      // Extract meaningful metrics from resume - look for specific achievement patterns
      // Pattern 1: Dollar amounts with context (e.g., "$10M revenue", "$5M saved")
      const dollarMatches = resumeText?.match(/\$([0-9]+(?:[MK])?)\s+(?:revenue|arr|saved|generated|managed|budget)/gi) || [];
      // Pattern 2: Percentages with context (e.g., "50% increase", "40% improvement")
      const percentMatches = resumeText?.match(/([0-9]+)%\s+(?:increase|improvement|growth|boost|reduction|decrease|efficiency)/gi) || [];
      // Pattern 3: User/customer metrics (e.g., "1M+ users", "100K customers")
      const userMatches = resumeText?.match(/([0-9]+[MK]?)\+?\s+(?:users?|customers?|transactions?|requests?)/gi) || [];

      // Get the best metric (prefer dollars, then percentages, then users)
      let metricPhrase = null;
      if (dollarMatches?.length > 0) {
        metricPhrase = dollarMatches[0];
      } else if (percentMatches?.length > 0) {
        metricPhrase = percentMatches[0];
      } else if (userMatches?.length > 0) {
        metricPhrase = userMatches[0];
      } else if (yearsExp) {
        metricPhrase = `${yearsExp} years of experience`;
      }

      // Build compelling pitch with achievement + metrics + job relevance + confidence
      const skillsText = matchedSkills?.length > 0 ? matchedSkills?.join(' and ') : 'proven expertise';
      let pitch;

      if (metricPhrase) {
        pitch = `I've delivered results with ${skillsText}, with a track record of ${metricPhrase}. I'm ready to bring that same impact to your team.`;
      } else if (yearsExp) {
        pitch = `I have ${yearsExp} years of experience with ${skillsText}. I'm excited to apply my expertise to help your team succeed.`;
      } else {
        pitch = `I bring strong expertise with ${skillsText}. I'm ready to contribute meaningful value to your team.`;
      }

      return {
        show: true,
        pitch: pitch,
        note: "Customize this pitch with specific examples from your background."
      };
    }

    // ===== TIER 2: MEDIUM FIT (60-79%) - SHOW GAPS =====
    if (overallScore >= 60) {
      const gaps = [];

      // Identify specific gaps
      if (skillsScore < 70) {
        gaps?.push(`Skills: You have ${Math.round(skillsScore)}% match`);
      }

      const experienceFactor = factors?.find(f => f?.name === 'Experience Level');
      if (experienceFactor?.score < 70) {
        const yearsExp = experienceFactor?.explanation?.match(/(\d+)\s*year/)?.[1];
        if (yearsExp) {
          gaps?.push(`Experience: ${yearsExp} years provided`);
        }
      }

      const locationFactor = factors?.find(f => f?.name === 'Location Match');
      if (locationFactor?.score < 80) {
        gaps?.push(`Location: Different location specified`);
      }

      return {
        show: false,
        reason: `You're ${overallScore}% fit. Gaps:`,
        gaps: gaps?.length > 0 ? gaps : ["Review your profile vs role requirements"],
        advice: "Close gaps, reanalyze to unlock pitch."
      };
    }

    // ===== TIER 3: POOR FIT (<60%) - CHECK FOR MISSING DATA =====
    // Detect which factors have 0% score (indicating missing data)
    const missingDataFactors = factors?.filter(f => f?.score === 0)?.map(f => f?.name) || [];
    const hasMissingData = missingDataFactors?.length > 0;

    if (hasMissingData) {
      // Determine whether RESUME or JOB DESCRIPTION is missing the data
      const resumeLower = resumeText?.toLowerCase();
      const jobLower = jobDescription?.toLowerCase();

      const missingFromResume = [];
      const missingFromJob = [];

      missingDataFactors?.forEach(name => {
        if (name === 'Experience Level') {
          // Check if RESUME lacks years OR if JOB lacks requirement
          const resumeHasYears = resumeLower?.match(/\b\d+\+?\s*years?\b/i);
          const jobHasYears = jobLower?.match(/\b\d+\+?\s*years?\b/i);

          if (!resumeHasYears && jobHasYears) {
            // Resume missing but job has requirement
            missingFromResume.push('experience years');
          } else if (!jobHasYears) {
            // Job missing requirement
            missingFromJob.push('experience requirement');
          }
        } else if (name === 'Education Match') {
          // Check if RESUME lacks education OR if JOB lacks requirement
          const resumeHasEducation = resumeLower?.match(/\b(bachelor|master|phd|associate|degree|diploma)\b/i);
          const jobHasEducation = jobLower?.match(/\b(bachelor|master|phd|associate|degree|diploma)\b/i);

          if (!resumeHasEducation && jobHasEducation) {
            // Resume missing but job has requirement
            missingFromResume.push('education');
          } else if (!jobHasEducation) {
            // Job missing requirement
            missingFromJob.push('education requirement');
          }
        } else if (name === 'Location Match') {
          // Check if RESUME lacks location OR if JOB lacks location info
          const resumeHasLocation = resumeLower?.match(/\b[a-z]{2}\b|city|location/i);
          const jobHasLocation = jobLower?.match(/\b[a-z]{2}\b|city|location|remote/i);

          if (!resumeHasLocation && jobHasLocation) {
            // Resume missing but job has location
            missingFromResume.push('location');
          } else if (!jobHasLocation) {
            // Job missing location info
            missingFromJob.push('location information');
          }
        }
      });

      // Build appropriate message based on what's missing
      if (missingFromResume.length > 0) {
        const missingList = missingFromResume.join(', ');
        return {
          show: false,
          reason: `Incomplete Analysis (${overallScore}% - Missing Resume Information)`,
          gaps: [`Your resume is missing: ${missingList}`],
          advice: `Add your ${missingList} details to your resume, then re-analyze for accurate matching.`
        };
      } else if (missingFromJob.length > 0) {
        const missingList = missingFromJob.join(', ');
        return {
          show: false,
          reason: `Incomplete Analysis (${overallScore}% - Incomplete Job Description)`,
          gaps: [`The job description is missing: ${missingList}`],
          advice: `The job description doesn't have enough detail for accurate analysis. Try adding more details to the job posting or analyze a more detailed job description.`
        };
      }
    }

    // Low score due to actual mismatch (not missing data)
    return {
      show: false,
      reason: `Not a strong fit (${overallScore}%). This appears to be a different career path.`,
      gaps: ["This role requires a different background"],
      advice: "Find roles matching 70%+ for better success rate."
    };
  };
  
  // Helper function to extract matched skills from explanation text
  const extractMatchedSkillsFromExplanation = (explanation) => {
    if (!explanation) return [];
    
    const skillPatterns = /\b(react|vue|angular|javascript|typescript|python|java|node\.?js|express|django|spring|sql|mongodb|docker|kubernetes|aws|azure|git|rest|graphql|api)\b/gi;
    const matches = explanation?.match(skillPatterns) || [];
    
    // Deduplicate and capitalize
    const uniqueSkills = [...new Set(matches?.map(s => {
      const skillMap = {
        'react': 'React', 'vue': 'Vue', 'angular': 'Angular',
        'javascript': 'JavaScript', 'typescript': 'TypeScript',
        'python': 'Python', 'java': 'Java', 'nodejs': 'Node.js', 'node.js': 'Node.js',
        'express': 'Express', 'django': 'Django', 'spring': 'Spring',
        'sql': 'SQL', 'mongodb': 'MongoDB', 'docker': 'Docker',
        'kubernetes': 'Kubernetes', 'aws': 'AWS', 'azure': 'Azure',
        'git': 'Git', 'rest': 'REST', 'graphql': 'GraphQL', 'api': 'API'
      };
      return skillMap[s?.toLowerCase()] || s?.charAt(0)?.toUpperCase() + s?.slice(1)?.toLowerCase();
    }))];
    
    return uniqueSkills;
  };

  const topSkills = getTopMatchedSkills();
  const pitchData = generateApplicationPitch();

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="BarChart3" size={22} color="var(--color-primary)" />
            </div>
            Analysis Results
          </h2>
        </div>

        {/* Enhanced Visual Score Gauge */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
          <div className="relative w-52 h-52">
            {/* Outer glow effect */}
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-50 transition-all duration-500"
              style={{ backgroundColor: getScoreGlow(displayScore) }}
            />
            <svg className="w-full h-full transform -rotate-90 relative z-10">
              {/* Background track */}
              <circle
                cx="104"
                cy="104"
                r="92"
                stroke="var(--color-muted)"
                strokeWidth="10"
                fill="none"
              />
              {/* Progress arc */}
              <circle
                cx="104"
                cy="104"
                r="92"
                stroke={getScoreColor(displayScore)}
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${(displayScore / 100) * 578} 578`}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
                style={{
                  filter: `drop-shadow(0 0 8px ${getScoreGlow(displayScore)})`
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <div
                className="text-6xl font-bold tabular-nums tracking-tight transition-colors duration-300"
                style={{ color: getScoreColor(displayScore) }}
              >
                {displayScore}
              </div>
              <div className="text-sm text-muted-foreground font-medium mt-1">
                Overall Score
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-center md:items-start">
            <div className={`score-badge ${getScoreClass(displayScore)} text-xl px-6 py-3`}>
              {displayScore}% Match
            </div>
            <div className="flex items-center gap-2 text-sm text-primary">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon name="Check" size={12} />
              </div>
              <span className="font-medium">AI-powered analysis complete</span>
            </div>
          </div>
        </div>

        {/* Missing Data Alerts */}
        {results?.missingDataAlerts && results?.missingDataAlerts?.length > 0 && (
          <div className="bg-info/5 border border-info/20 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                <Icon name="AlertCircle" size={18} color="var(--color-info)" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Improve Your Analysis
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2.5">
                  {results?.missingDataAlerts?.map((alert, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <span className="text-info mt-0.5 font-medium">→</span>
                      <span className="leading-relaxed">{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Assessment Sections - Always Show */}
        <div className="space-y-4 mb-6">
            {/* Detect if this is missing data scenario */}
            {pitchData?.reason?.includes('Incomplete Analysis') ? (
              <>
                {/* MISSING DATA SCENARIO */}
                {/* SECTION 1: FIT ASSESSMENT - Missing Data */}
                <div className={`border rounded-xl p-6 ${
                  pitchData?.reason?.includes('Resume')
                    ? 'bg-info/5 border-info/20'
                    : 'bg-primary/5 border-primary/20'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      pitchData?.reason?.includes('Resume') ? 'bg-info/10 text-info' : 'bg-primary/10 text-primary'
                    }`}>
                      <Icon name="AlertCircle" size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-2">
                        {pitchData?.reason}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {pitchData?.reason?.includes('Resume')
                          ? `Your analysis score is low because your resume is missing important information, not because of a skill mismatch. Once you add the missing details, we can give you an accurate assessment.`
                          : `Your analysis score is low because the job description is missing important details, not because of a poor fit. Try analyzing a more detailed job posting for accurate results.`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: RECOMMENDATION - Missing Data */}
                <div className={`border rounded-xl p-5 ${
                  pitchData?.reason?.includes('Resume')
                    ? 'bg-info/5 border-info/20'
                    : 'bg-primary/5 border-primary/20'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      pitchData?.reason?.includes('Resume') ? 'bg-info/10 text-info' : 'bg-primary/10 text-primary'
                    }`}>
                      <Icon name="ArrowRight" size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        {pitchData?.reason?.includes('Resume') ? 'What to Do' : 'Next Steps'}
                      </h3>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {pitchData?.gaps?.[0] && (
                          <>
                            <strong className="text-foreground">{pitchData?.gaps?.[0]}</strong>
                            <br />
                            <br />
                          </>
                        )}
                        {pitchData?.advice}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* STANDARD FIT ASSESSMENT (not missing data) */}
                {/* SECTION 1: FIT ASSESSMENT - Dark Mode Card */}
                <div className={`border rounded-xl p-6 ${
                  displayScore >= 70
                    ? 'bg-success/5 border-success/20'
                    : displayScore >= 50
                    ? 'bg-warning/5 border-warning/20'
                    : 'bg-error/5 border-error/20'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      displayScore >= 70
                        ? 'bg-success/10 text-success'
                        : displayScore >= 50
                        ? 'bg-warning/10 text-warning'
                        : 'bg-error/10 text-error'
                    }`}>
                      <Icon
                        name={displayScore >= 70 ? 'CheckCircle' : displayScore >= 50 ? 'ArrowRight' : 'XCircle'}
                        size={24}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-foreground mb-2">
                        {displayScore >= 70
                          ? `Good Fit (${displayScore}% Match)`
                          : displayScore >= 50
                          ? `Moderate Fit (${displayScore}% Match)`
                          : `Not a Fit (${displayScore}% Match)`
                        }
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {displayScore >= 70
                          ? `You have most of the skills and experience this role requires. You're a competitive candidate and have a strong chance of success.`
                          : displayScore >= 50
                          ? `This role requires some skills and experience you don't currently have. While you share some common ground, there are meaningful gaps to bridge.`
                          : `This role requires a fundamentally different background and skill set than what you have. The alignment is minimal.`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: RECOMMENDATION & NEXT STEPS - COMBINED */}
                <div className={`border rounded-xl p-6 ${
                  displayScore >= 70
                    ? 'bg-success/5 border-success/20'
                    : displayScore >= 50
                    ? 'bg-warning/5 border-warning/20'
                    : 'bg-error/5 border-error/20'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      displayScore >= 70
                        ? 'bg-success/10 text-success'
                        : displayScore >= 50
                        ? 'bg-warning/10 text-warning'
                        : 'bg-error/10 text-error'
                    }`}>
                      <Icon name="Lightbulb" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground mb-3">
                        Here's our recommendation
                      </h3>
                      {pitchData?.reason?.includes('Resume') ? (
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span><span className="font-semibold text-foreground">Update your resume:</span> Add your {pitchData?.gaps?.[0]?.split('missing: ')?.[1] || 'missing information'}</span>
                          </li>
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span>Paste the same job description back and click "Analyze Match" again</span>
                          </li>
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span>You'll see your real compatibility score once the missing information is added</span>
                          </li>
                        </ul>
                      ) : pitchData?.reason?.includes('Job Description') ? (
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span><span className="font-semibold text-foreground">Get a better job description:</span> Copy the full details from the job posting</span>
                          </li>
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span>Make sure it includes {pitchData?.gaps?.[0]?.split('missing: ')?.[1] || 'all key requirements'}</span>
                          </li>
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span>Paste it back and re-analyze for an accurate match score</span>
                          </li>
                        </ul>
                      ) : displayScore >= 70 ? (
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span><span className="font-semibold text-foreground">You should apply</span> - Your background aligns well with their requirements</span>
                          </li>
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span>Review the <span className="text-foreground font-medium">Detailed Score Breakdown</span> below to understand your strengths</span>
                          </li>
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span>Prepare your application highlighting skills that match their requirements</span>
                          </li>
                        </ul>
                      ) : displayScore >= 50 ? (
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span><span className="font-semibold text-foreground">You could apply</span> if willing to invest time learning on the job</span>
                          </li>
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span>Check the <span className="text-foreground font-medium">Skills Match</span> section to see which skills are missing</span>
                          </li>
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span>Better strategy: improve your skills in the gaps, then apply</span>
                          </li>
                        </ul>
                      ) : (
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span><span className="font-semibold text-foreground">Don't apply</span> for this role - your skill set is too different</span>
                          </li>
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span>Review the <span className="text-foreground font-medium">Skills Match</span> section to see what's missing</span>
                          </li>
                          <li className="flex gap-2 leading-relaxed">
                            <span className="text-foreground flex-shrink-0">•</span>
                            <span>Focus on finding positions that match 70%+ where you'll be competitive</span>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              Detailed Score Breakdown
            </h3>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#16A34A' }} />
                  <span>80%+</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#EAB308' }} />
                  <span>60-79%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#DC2626' }} />
                  <span>&lt;60%</span>
                </div>
              </div>
              <button
                onClick={onOpenScoringSettings}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-all duration-200"
              >
                <Icon name="Settings" size={14} />
                Adjust Weights
              </button>
            </div>
          </div>
          {results?.factors?.map((factor, index) => (
            <div key={factor?.name} className="factor-card">
              <button
                onClick={() => setExpandedFactor(expandedFactor === index ? null : index)}
                className="factor-card-header"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${getScoreColor(factor?.score)}15` }}
                    >
                      <Icon name={factor?.icon} size={16} color={getScoreColor(factor?.score)} />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {factor?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="text-sm font-mono font-semibold"
                      style={{ color: getScoreColor(factor?.score) }}
                    >
                      {factor?.score}%
                    </span>
                    <Icon
                      name={expandedFactor === index ? 'ChevronUp' : 'ChevronDown'}
                      size={16}
                      className="text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="factor-progress">
                  <div
                    className="factor-progress-bar"
                    style={{
                      width: `${factor?.score}%`,
                      backgroundColor: getScoreColor(factor?.score),
                      boxShadow: `0 0 8px ${getScoreColor(factor?.score)}40`
                    }}
                  />
                </div>
              </button>

              {expandedFactor === index && (
                <div className="factor-card-content">
                  <div className="space-y-4">
                    {factor?.matchedKeywords !== undefined && !['Location Match', 'Experience Level', 'Education'].includes(factor?.name) && (
                      <div className="flex items-start gap-3 text-sm">
                        <Icon name="CheckCircle" size={16} color={getScoreColor(factor?.score)} className="mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-foreground">
                            {factor?.name === 'Skills Match' ? 'Matched Skills: ' : 'Matched Keywords: '}
                          </span>
                          <span className="text-muted-foreground">
                            {factor?.matchedKeywords} of {factor?.totalKeywords} {factor?.name === 'Skills Match' ? 'key skills' : 'key terms'} found
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3 text-sm">
                      <Icon name="Info" size={16} color={getScoreColor(factor?.score)} className="mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {renderExplanation(factor?.explanation)}
                      </p>
                    </div>

                    {results?.weights && (
                      <div className="flex items-start gap-3 text-sm pt-3 border-t border-border">
                        <Icon name="Scale" size={16} color="var(--color-muted-foreground)" className="mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-foreground">Weight in Overall Score: </span>
                          <span className="text-muted-foreground">
                            {results?.weights?.[factor?.name?.toLowerCase()?.replace(' ', '_')?.replace('_match', '')?.replace('_level', '')?.replace('_alignment', '') || 'skills']}%
                            {' '}(contributes {Math.round((factor?.score * (results?.weights?.[factor?.name?.toLowerCase()?.replace(' ', '_')?.replace('_match', '')?.replace('_level', '')?.replace('_alignment', '') || 'skills'] || 0)) / 100)} points to total score)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Lightbulb" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2 text-sm">Pro Tip</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Click on any factor above to see detailed explanations about how your score was calculated.
                You can adjust the importance of each factor by clicking "Adjust Weights" to match your priorities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultsPanel;