# Pitch Feature Testing Guide

Test the pitch generation feature with these three scenarios covering all thresholds.

---

## Test 1: Strong Fit (80%+ Score) - Generate Pitch

### Resume
```
Sarah Chen
San Francisco, California
Senior Software Engineer

PROFESSIONAL SUMMARY
Full-stack engineer with 7 years building scalable web applications.
Built product from 0-$25M ARR. Led team of 5 engineers.

EXPERIENCE
Senior Software Engineer at TechCo (3 years)
- Architected microservices handling 1M+ daily users
- Increased system performance by 40% through optimization
- Led 5-engineer team to deliver 20+ features annually

Software Engineer at StartupXYZ (4 years)
- Built React frontend managing $10M+ revenue
- Designed REST APIs serving 100K+ users
- Reduced page load time by 50%

SKILLS
React, Node.js, Python, AWS, PostgreSQL, Docker, Kubernetes

EDUCATION
BS Computer Science, State University
```

### Job Description
```
Senior Full Stack Engineer
San Francisco, California - On-site 3 days/week

About the Role:
We're looking for a Senior Full Stack Engineer to lead our product team.
You'll architect scalable systems and mentor junior engineers.

Requirements:
- 5+ years full-stack development experience
- Expert in React and Node.js
- Experience with AWS and containerization
- Strong system design skills
- Leadership experience a plus

Responsibilities:
- Design and implement new features
- Mentor junior engineers
- Improve system performance and reliability
```

### Expected Results

**Scores** (estimated):
- Skills Match: 95%
- Experience Level: 95%
- Overall: 90%+

**Pitch Output** (show = true):
```json
{
  "show": true,
  "pitch": "I've delivered results with React and Node.js, bringing $25M of proven impact. Your team needs this—I'm ready to accelerate.",
  "note": "Personalized pitch—customize as needed."
}
```

**What to Look For**:
- ✅ show = true (strong candidate)
- ✅ Pitch mentions matched skills (React, Node.js)
- ✅ Pitch includes metric ($25M)
- ✅ Pitch uses confident tone (delivered, impact, ready)
- ✅ Note offers customization option

---

## Test 2: Medium Fit (60-79% Score) - Show Gaps

### Resume
```
Michael Johnson
Austin, Texas
Software Engineer (3 years experience)

EXPERIENCE
Software Engineer at WebCo (3 years)
- Built React interfaces for customer dashboard
- Worked with REST APIs
- Fixed bugs and improved UI components

SKILLS
React, JavaScript, CSS, HTML, Git

EDUCATION
BS Computer Science, Tech University
```

### Job Description
```
Senior Full Stack Engineer
Austin, Texas - On-site 4 days/week

About the Role:
Senior Full Stack Engineer to lead technical initiatives.

Requirements:
- 5+ years full-stack development (required)
- Expert in React and Node.js
- Backend experience with Python or Java required
- AWS or cloud platform experience required
- System design and architecture skills

We're building the next generation of cloud infrastructure.
```

### Expected Results

**Scores** (estimated):
- Skills Match: 60% (missing backend, Python, cloud)
- Experience Level: 65% (3 years vs 5+ needed)
- Overall: 68%

**Gap Output** (show = false):
```json
{
  "show": false,
  "score": 68,
  "reason": "You're 68% fit. Gaps:",
  "gaps": [
    "Skills: You have 60% match",
    "Experience: 3 years provided, 5+ needed"
  ],
  "next": "Close gaps, reanalyze to unlock pitch."
}
```

**What to Look For**:
- ✅ show = false (not strong enough for pitch)
- ✅ Score displayed (68%)
- ✅ Specific gaps listed:
  - Skills gap (60% vs needed higher)
  - Experience gap (3 vs 5+ years)
- ✅ Actionable next step (close gaps, reanalyze)

---

## Test 3: Poor Fit (<60% Score) - Suggest Better Roles

### Resume
```
Emily Rodriguez
New York, New York
Sales Manager

EXPERIENCE
Sales Director at Sales Inc (5 years)
- Led sales team of 10 people
- Managed $5M annual budget
- Achieved 120% of sales quota 3 years running
- Grew team from 3 to 10 people

SKILLS
Sales, Customer relationship management, Team leadership, Negotiation

EDUCATION
MBA - Business Administration
```

### Job Description
```
Senior Full Stack Engineer
San Francisco, California - On-site 5 days/week

About the Role:
Senior Full Stack Engineer to design and build our platform.

Technical Requirements:
- 5+ years software engineering experience
- Expert in React, Node.js, Python
- AWS/GCP cloud platform experience required
- Database design and SQL expertise
- Microservices architecture knowledge
```

### Expected Results

**Scores** (estimated):
- Skills Match: 5% (no technical skills)
- Experience Level: 20% (sales vs engineering)
- Location Match: 40% (different coasts)
- Overall: 25%

**Poor Fit Output** (show = false):
```json
{
  "show": false,
  "score": 25,
  "reason": "Not a strong fit (25%). This appears to be a different career path.",
  "suggestion": "Find roles matching 70%+ for better success."
}
```

**What to Look For**:
- ✅ show = false (not a fit)
- ✅ Score clearly low (25%)
- ✅ Recognition of career path difference
- ✅ Guidance to find better-fit roles (70%+)

---

## How to Test

### Step-by-Step:

1. **Copy resume** from test above
2. **Copy job description** from test above
3. **Paste into the app**
4. **Click "Analyze"**
5. **Look for pitch section** in results
6. **Verify output matches expected** format and content

---

## Validation Checklist

### Test 1: Strong Fit (80%+)
- [ ] Pitch shows = true
- [ ] Score is 80%+
- [ ] Pitch includes matched skills
- [ ] Pitch includes numeric metric ($, years, %)
- [ ] Pitch uses confident tone
- [ ] Note suggests customization

### Test 2: Medium Fit (60-79%)
- [ ] Pitch shows = false
- [ ] Score displayed (60-79% range)
- [ ] Gaps clearly listed
- [ ] Gaps are specific and actionable
- [ ] Next step suggests improvement path

### Test 3: Poor Fit (<60%)
- [ ] Pitch shows = false
- [ ] Score displayed (<60%)
- [ ] Reason acknowledges career path difference
- [ ] Suggestion directs to better-fit roles

---

## Success Criteria

✅ **Test 1**: Pitch generates with metrics and confidence
✅ **Test 2**: Gaps clearly identified with actionable next steps
✅ **Test 3**: Poor fit properly identified with guidance
✅ **All tests**: JSON format correct and readable
✅ **All tests**: Data extraction accurate (skills, metrics, years)

---

## Pitch Examples

### Example Strong Pitch (80%+)
```
"I've delivered results with React and Node.js, bringing $25M of proven
impact. Your team needs this—I'm ready to accelerate."
```

Key elements:
- ✅ Specific achievement (React, Node.js)
- ✅ Quantified metric ($25M)
- ✅ Job relevance (your team needs)
- ✅ Confident tone (delivered, impact, ready)

### Example Gap Analysis (60-79%)
```
Gaps:
- Skills: You have 60% match
- Experience: 3 years provided, 5+ needed

Next: Close gaps, reanalyze to unlock pitch.
```

Key elements:
- ✅ Specific gap areas
- ✅ Clear numbers (60%, 3 vs 5)
- ✅ Actionable path forward

### Example Career Guidance (<60%)
```
Not a strong fit (25%). This appears to be a different career path.
Find roles matching 70%+ for better success.
```

Key elements:
- ✅ Clear score
- ✅ Career path acknowledgement
- ✅ Target percentage guidance

---

## Edge Cases

### Edge Case 1: Resume with no metrics
```
Resume: "Software Engineer with 7 years experience"
(No $M, no %, no specific numbers)

Expected Pitch:
"I've delivered results with React and Node.js, bringing 7 years of proven
impact. Your team needs this—I'm ready to accelerate."

Fallback: Uses years of experience instead of extracted metric
```

### Edge Case 2: Exactly 80% score
```
Score: 80%
Threshold: >= 80%

Expected: Generate pitch (threshold is inclusive)
```

### Edge Case 3: Exactly 60% score
```
Score: 60%
Threshold: >= 60% and < 80%

Expected: Show gaps (medium fit threshold)
```

---

## Customization Test

After pitch generates, verify users can customize:

**Original Pitch**:
"I've delivered results with React and Node.js, bringing 7 years of proven impact. Your team needs this—I'm ready to accelerate."

**User Can Customize To**:
- Add specific product/company knowledge
- Adjust confidence level
- Include relevant achievements
- Personalize for hiring manager
- Adapt to industry/role

**Expected**: Note says "customize as needed" to prompt user action

---

## Notes

- Pitch uses Claude analysis data (no additional API calls)
- Regex extracts metrics from resume text
- Pitch generation is instant (no delay)
- All three thresholds should be represented in testing
- Verify JSON format is valid for frontend display

