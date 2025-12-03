import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';


const AnalysisResultsPanel = ({ results, onOpenScoringSettings, resumeText, jobDescription }) => {
  const [expandedFactor, setExpandedFactor] = useState(null);
  const [copiedPitch, setCopiedPitch] = useState(false);
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

  if (!results) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center min-h-[600px]">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <Icon name="BarChart3" size={48} className="text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No Analysis Yet
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
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
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--color-warning)';
    return 'var(--color-error)';
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

    // ===== TIER 3: POOR FIT (<60%) - CAREER GUIDANCE =====
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

  const handleCopyPitch = () => {
    const pitchData = generateApplicationPitch();
    if (pitchData?.show && pitchData?.pitch) {
      navigator.clipboard?.writeText(pitchData?.pitch)?.then(() => {
        setCopiedPitch(true);
        setTimeout(() => setCopiedPitch(false), 2000);
      });
    }
  };

  const topSkills = getTopMatchedSkills();
  const pitchData = generateApplicationPitch();

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Icon name="BarChart3" size={20} color="var(--color-primary)" />
            Analysis Results
          </h2>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative w-48 h-48 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="var(--color-muted)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke={getScoreColor(displayScore)}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(displayScore / 100) * 553} 553`}
                strokeLinecap="round"
                className="transition-all duration-200 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-foreground tabular-nums">
                {displayScore}
              </div>
              <div className="text-sm text-muted-foreground">
                Overall Score
              </div>
            </div>
          </div>
          
          <div className={`score-badge ${getScoreClass(displayScore)} text-2xl px-6 py-3`}>
            {displayScore}% Match
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-success">
            <Icon name="Check" size={16} />
            <span>AI-powered analysis complete</span>
          </div>
        </div>

        {/* Your Pitch Section - Now at top */}
        {pitchData?.show ? (
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Icon name="MessageSquare" size={18} color="var(--color-accent)" />
                <h4 className="text-sm font-semibold text-foreground">
                  Your Pitch
                </h4>
              </div>
              <button
                onClick={handleCopyPitch}
                className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-xs font-medium text-accent transition-colors"
              >
                <Icon name={copiedPitch ? "Check" : "Copy"} size={14} />
                {copiedPitch ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-card border border-border rounded-lg p-3">
              <p className="text-sm text-foreground leading-relaxed">
                {pitchData?.pitch}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Icon name="Info" size={12} />
              {pitchData?.note}
            </p>
          </div>
        ) : (
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" size={18} color="var(--color-warning)" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  {pitchData?.reason}
                </h4>
                {pitchData?.gaps && pitchData?.gaps?.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                    {pitchData?.gaps?.map((gap, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-warning mt-0.5">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-muted-foreground italic">
                  💡 {pitchData?.advice}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Skill Highlight Badges */}
        {topSkills?.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Award" size={18} color="var(--color-primary)" />
              <h4 className="text-sm font-semibold text-foreground">
                These skills make you stand out for this role
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {topSkills?.map((skill, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-sm font-medium text-primary"
                >
                  <Icon name="CheckCircle2" size={14} />
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              Detailed Score Breakdown
            </h3>
            <button
              onClick={onOpenScoringSettings}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Icon name="Settings" size={14} />
              Adjust Weights
            </button>
          </div>
          {results?.factors?.map((factor, index) => (
            <div key={factor?.name} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedFactor(expandedFactor === index ? null : index)}
                className="w-full p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name={factor?.icon} size={16} color={factor?.color} />
                    <span className="text-sm font-medium text-foreground">
                      {factor?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-muted-foreground">
                      {factor?.score}%
                    </span>
                    <Icon 
                      name={expandedFactor === index ? 'ChevronUp' : 'ChevronDown'} 
                      size={16} 
                      className="text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${factor?.score}%`,
                      backgroundColor: factor?.color
                    }}
                  />
                </div>
              </button>
              
              {expandedFactor === index && (
                <div className="px-4 pb-4 pt-2 bg-muted/30 border-t border-border">
                  <div className="space-y-3">
                    {factor?.matchedKeywords !== undefined && (
                      <div className="flex items-start gap-2 text-xs">
                        <Icon name="CheckCircle" size={14} color={factor?.color} className="mt-0.5" />
                        <div>
                          <span className="font-medium text-foreground">Matched Keywords: </span>
                          <span className="text-muted-foreground">
                            {factor?.matchedKeywords} of {factor?.totalKeywords} key terms found
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2 text-xs">
                      <Icon name="Info" size={14} color={factor?.color} className="mt-0.5" />
                      <p className="text-muted-foreground leading-relaxed">
                        {factor?.explanation}
                      </p>
                    </div>

                    {results?.weights && (
                      <div className="flex items-start gap-2 text-xs pt-2 border-t border-border">
                        <Icon name="Scale" size={14} color="var(--color-muted-foreground)" className="mt-0.5" />
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

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon name="Lightbulb" size={20} color="var(--color-primary)" />
            <div>
              <h4 className="font-semibold text-foreground mb-2 text-sm">Pro Tip</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
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