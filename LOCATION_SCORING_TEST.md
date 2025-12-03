# Location Scoring Test Guide

Test the 5 rule-based location scoring rules with these ready-made scenarios.

---

## Test 1: Rule 1 - Remote Job → 100%

### Resume
```
John Smith
San Francisco, CA

Senior Software Engineer
Experience: 5 years
```

### Job Description
```
Senior Backend Engineer - Remote
Location: Remote - Work from anywhere
Employment: Full-time

We're hiring a Senior Backend Engineer for our fully remote team...
```

### Expected Result
- ✅ Location Score: **100%**
- ✅ Display: **1 / 1** (matched)
- ✅ Reason: "Job is remote position..."

### Why
Rule 1: Job is remote → 100% (regardless of candidate location)

---

## Test 2: Rule 2 - Exact Location Match → 100%

### Resume
```
Sarah Johnson
San Francisco, California

Senior Frontend Developer
3 years experience
```

### Job Description
```
Senior Frontend Developer
San Francisco, CA

Requirements:
- 3+ years experience
- React expertise
- Location: San Francisco, CA office
```

### Expected Result
- ✅ Location Score: **100%**
- ✅ Display: **1 / 1** (matched)
- ✅ Reason: "Your location (San Francisco, CA) matches job location..."

### Why
Rule 2: Candidate location == Job location → 100%

---

## Test 3: Rule 3 - Hybrid Job → 85%

### Resume
```
Mike Davis
Chicago, Illinois

Full Stack Engineer
Experience: 4 years
```

### Job Description
```
Senior Full Stack Engineer
San Francisco, California - Hybrid

Work Arrangement: Hybrid (2 days on-site, 3 days remote)
Location: San Francisco, CA office (2 days/week)

Requirements:
- 4+ years full stack experience
```

### Expected Result
- ✅ Location Score: **85%**
- ✅ Display: **1 / 1** (matched)
- ✅ Reason: "Job is hybrid. Your location: Chicago, Illinois..."

### Why
Rule 3: Job is hybrid → 85% (flexibility acknowledged)

---

## Test 4: Rule 4 - Open to Relocation → 85%

### Resume
```
Lisa Wang
New York, New York

Software Engineer
6 years experience
Open to relocation for the right opportunity
```

### Job Description
```
Senior Software Engineer
San Francisco, California

Requirements:
- 5+ years experience
- Location: San Francisco, CA (on-site)
- Must be in office daily
```

### Expected Result
- ✅ Location Score: **85%**
- ✅ Display: **1 / 1** (matched)
- ✅ Reason: "Your location differs from job location, but you're open to relocation..."

### Why
Rule 4: Resume explicitly states "open to relocation" → 85%

**Keywords that trigger this rule:**
- "open to relocation"
- "willing to relocate"
- "willing to move"
- "open to move"

---

## Test 5: Rule 5 - Different Location (No Relocation) → 40%

### Resume
```
Tom Brown
Whitehouse Station, New Jersey

Senior Developer
5 years experience
```

### Job Description
```
Senior Developer
San Francisco, California - On-site Required

Work Location: San Francisco, CA office
This is a full on-site position with no remote options.

Requirements:
- 5+ years development experience
```

### Expected Result
- ✅ Location Score: **40%**
- ✅ Display: **0 / 1** (NOT matched)
- ✅ Reason: "Your location (Whitehouse Station, NJ) differs from job location (San Francisco, CA). No relocation signal found..."

### Why
Rule 5: Different locations + no relocation mention → 40%

---

## Test 6: Fallback - Missing Location Info → 50%

### Resume
```
Alex Rivera
Senior Backend Engineer
5 years experience
Education: BS Computer Science
```

### Job Description
```
Senior Backend Engineer
Location: San Francisco, California

Requirements:
- 5+ years backend development
```

### Expected Result
- ✅ Location Score: **50%**
- ✅ Display: **0 / 1** (NOT matched)
- ✅ Reason: "Location information incomplete. Your location: Not specified..."

### Why
Fallback: Resume has no location info → 50%

---

## Test 7: State Match (No City) → 100%

### Resume
```
Emma Wilson
Los Angeles, California

Product Manager
3 years experience
```

### Job Description
```
Senior Product Manager
California - Flexible location within state

Work Location: California (flexible - can be LA, SF, or San Diego)
Remote Options: Available

Requirements:
- 3+ years product management
```

### Expected Result
- ✅ Location Score: **100%**
- ✅ Display: **1 / 1** (matched)
- ✅ Reason: "Your location (Los Angeles, CA) matches job location (California)..."

### Why
Rule 2: State match + job only requires state (no specific city) → 100%

---

## Test 8: Same State, Different City → 40%

### Resume
```
David Chen
Los Angeles, California

Senior Developer
5 years experience
```

### Job Description
```
Senior Developer
San Francisco, California - On-site Required

Location: San Francisco, CA office
Must be in SF office daily.

Requirements:
- 5+ years development experience
```

### Expected Result
- ✅ Location Score: **40%**
- ✅ Display: **0 / 1** (NOT matched)
- ✅ Reason: "Your location (Los Angeles, CA) differs from job location (San Francisco, CA)..."

### Why
Rule 5: Cities don't match (LA vs SF) → different location → 40%

---

## Test 9: "Willing to Relocate" → 85%

### Resume
```
Rachel Green
Boston, Massachusetts

Marketing Manager
4 years experience

Career Goals: Seeking opportunities in tech hubs.
Willing to relocate to California or New York.
```

### Job Description
```
Senior Marketing Manager
San Francisco, California - On-site

Location: San Francisco, CA office
On-site required 5 days/week

Requirements:
- 4+ years marketing experience
```

### Expected Result
- ✅ Location Score: **85%**
- ✅ Display: **1 / 1** (matched)
- ✅ Reason: "Your location differs from job location, but you're open to relocation..."

### Why
Rule 4: Resume contains "willing to relocate" → 85%

---

## Test 10: Remote Resume + On-site Job → 40%

### Resume
```
Kevin Park
Currently Working Remote

Remote-First Software Engineer
5 years experience
Prefer: Remote or hybrid roles
```

### Job Description
```
Senior On-Site Developer
Los Angeles, California

Location: Los Angeles, CA - On-site required
This is a full on-site position.
We do not support remote work.

Requirements:
- 5+ years development
```

### Expected Result
- ✅ Location Score: **40%**
- ✅ Display: **0 / 1** (NOT matched)
- ✅ Reason: "Your location differs from job location. No relocation signal found..."

### Why
Rule 5: Candidate is remote, job requires on-site, no relocation mention → 40%

---

## Validation Checklist

After running all tests, verify:

### Rule 1 (Remote Job)
- [ ] Test 1: Remote job shows 100%
- [ ] Remote indicator shows 1/1 matched

### Rule 2 (Exact Match)
- [ ] Test 2: Exact location match shows 100%
- [ ] Test 7: State match shows 100%
- [ ] Matched indicator shows 1/1

### Rule 3 (Hybrid)
- [ ] Test 3: Hybrid job shows 85%
- [ ] Matched indicator shows 1/1

### Rule 4 (Open to Relocation)
- [ ] Test 4: Explicit relocation statement shows 85%
- [ ] Test 9: "Willing to relocate" shows 85%
- [ ] Matched indicator shows 1/1

### Rule 5 (Different Location)
- [ ] Test 5: Different location (no relocation) shows 40%
- [ ] Test 8: Same state, different city shows 40%
- [ ] Test 10: Remote vs on-site shows 40%
- [ ] Matched indicator shows 0/1 (NOT matched)

### Fallback
- [ ] Test 6: Missing location info shows 50%
- [ ] Matched indicator shows 0/1

---

## Score Summary Table

| Test | Scenario | Expected Score | Rule |
|------|----------|-----------------|------|
| 1 | Remote job | 100% | 1 |
| 2 | Exact match | 100% | 2 |
| 3 | Hybrid | 85% | 3 |
| 4 | Open to relocation | 85% | 4 |
| 5 | Different location | 40% | 5 |
| 6 | Missing location | 50% | Fallback |
| 7 | State match | 100% | 2 |
| 8 | Same state, diff city | 40% | 5 |
| 9 | Willing to relocate | 85% | 4 |
| 10 | Remote vs on-site | 40% | 5 |

---

## How to Test

1. **Pick a test scenario** (Tests 1-10 above)
2. **Copy the resume** text into the app
3. **Copy the job description** text into the app
4. **Click "Analyze"**
5. **Look at Location Match factor**:
   - Check the score matches expected
   - Check the matched/total display (1/1 or 0/1)
   - Check the reason explains the rule

---

## What You Should See

### Location Match Factor Card Should Show:

```
Location Match
[score]%  |  [matched/total]
[reason sentence]
```

**Example 1 (Matched - 100%):**
```
Location Match
100%  |  1 / 1
Your location (San Francisco, CA) matches job location (San Francisco, CA). Perfect match.
```

**Example 2 (Not Matched - 40%):**
```
Location Match
40%  |  0 / 1
Your location (Whitehouse Station, NJ) differs from job location (San Francisco, CA). No relocation signal found.
```

---

## If Score Doesn't Match

### Score is higher than expected
- Check if job is remote (Rule 1)
- Check if candidate location matches (Rule 2)
- Check if job is hybrid (Rule 3)
- Check if resume mentions relocation (Rule 4)

### Score is lower than expected
- Check if locations actually match (exact match needed)
- Check spelling/abbreviations of cities and states
- Make sure relocation keywords are present in resume

### Reason text is unclear
- Location extraction may have failed
- Check if locations are explicitly stated in resume/job
- Add city and state abbreviations for clarity

---

## Success Criteria

✅ All 10 tests produce expected scores
✅ All matched/not-matched indicators are correct
✅ Reason text is clear and explains the rule
✅ No AI involvement - purely rule-based
✅ Consistent results between runs

---

## Notes

- All rules are case-insensitive
- Location extraction looks for city names and state abbreviations
- Relocation keywords: "open to relocation", "willing to relocate", "willing to move", "open to move"
- Remote keywords: "remote", "work from home", "wfh", "anywhere"
- Hybrid keywords: "hybrid", "flexible", "some remote", "part remote"

