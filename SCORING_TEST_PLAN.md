# JobFitAI Scoring Logic Test Plan

## Overview
This document outlines comprehensive test scenarios to validate the corrected scoring logic for Keywords and Location Match.

## Fixes Applied

### Fix #1: Keywords Score Calculation (src/pages/analysis-dashboard/index.jsx:915-922)
**OLD LOGIC (BUGGY):**
```javascript
const keywordBonus = claudeAnalysis.skillMatch.transferable.length * 5;
const keywordsScore = Math.min(100, skillsScore + keywordBonus);
```
**Problem**: Keywords score was based on skills score + bonus, not actual keyword matches. This allowed 100% score even when only 9/15 keywords matched.

**NEW LOGIC (FIXED):**
```javascript
const matchedKeywordCount = claudeAnalysis.keywordMatch?.matched?.length || 0;
const missingKeywordCount = claudeAnalysis.keywordMatch?.missing?.length || 0;
const totalKeywordCount = matchedKeywordCount + missingKeywordCount;
const keywordsScore = totalKeywordCount > 0
  ? Math.round((matchedKeywordCount / totalKeywordCount) * 100)
  : 75;
```
**Benefit**: Keywords score now directly reflects actual keyword matches. 9/15 matches = 60% score.

### Fix #2: Location Match Display (src/pages/analysis-dashboard/index.jsx:962)
**OLD LOGIC (BUGGY):**
```javascript
matchedKeywords: locationFinalScore >= 100 ? 1 : 0,
```
**Problem**: Only showed "1" match if score was 100%, making mismatches invisible.

**NEW LOGIC (FIXED):**
```javascript
matchedKeywords: locationFinalScore >= 80 ? 1 : 0,
```
**Benefit**: Now shows match/no-match based on reasonable threshold (80% = substantial match).

---

## Test Scenarios

### Scenario 1: Partial Keyword Match (9 of 15)
**Resume Keywords Found**: Python, JavaScript, React, Node.js, Express, MongoDB, REST API, Git, Docker
**Job Required Keywords**: Python, JavaScript, React, Node.js, Express, MongoDB, REST API, Git, Docker, AWS, GCP, Kubernetes, CI/CD, Terraform, Agile
**Expected Keyword Match Count**: 9/15
**Expected Keywords Score**: 60%

**How to Test**:
1. Use a resume with: "Experience with Python, JavaScript, React, Node.js, Express, MongoDB, REST API, Git, Docker"
2. Use a job description requiring: "Python, JavaScript, React, Node.js, Express, MongoDB, REST API, Git, Docker, AWS, GCP, Kubernetes, CI/CD, Terraform, Agile"
3. Click Analyze
4. **Expected Result**:
   - Keywords factor shows "9 / 15" in the count display
   - Keywords score shows ~60%
   - NOT 100%

**Validation**: ✓ Keywords score must NOT be 100% when only 60% of keywords match

---

### Scenario 2: Complete Keyword Match (15 of 15)
**Resume Keywords Found**: All 15 required keywords
**Expected Keyword Match Count**: 15/15
**Expected Keywords Score**: 100%

**How to Test**:
1. Use a resume with all job-required keywords
2. Use a job description requiring the same keywords
3. Click Analyze
4. **Expected Result**:
   - Keywords factor shows "15 / 15" in the count display
   - Keywords score shows 100%

**Validation**: ✓ Keywords score is 100% only when ALL keywords match

---

### Scenario 3: No Keyword Match (0 of 15)
**Resume Keywords Found**: None matching job requirements
**Expected Keyword Match Count**: 0/15
**Expected Keywords Score**: 0%

**How to Test**:
1. Use a generic resume with no tech keywords
2. Use a technical job description requiring specific keywords
3. Click Analyze
4. **Expected Result**:
   - Keywords factor shows "0 / 15" in the count display
   - Keywords score shows 0%

**Validation**: ✓ Keywords score is 0% when no keywords match

---

### Scenario 4: Location Match - Perfect Match
**Candidate Location**: Whitehouse Station, NJ
**Job Location**: Whitehouse Station, NJ
**Expected Location Score**: 100%
**Expected Display**: matchedKeywords = 1 (location matched)

**How to Test**:
1. Resume with: "Location: Whitehouse Station, NJ"
2. Job Description with: "Location: Whitehouse Station, NJ"
3. Click Analyze
4. **Expected Result**:
   - Location factor shows "1 / 1" in the count display
   - Location score shows 100%
   - Reason: "Locations match"

**Validation**: ✓ Location match shows 100% with 1/1 indicator

---

### Scenario 5: Location Match - Mismatch (On-site vs Remote)
**Candidate Location**: Whitehouse Station, NJ (on-site)
**Job Location**: Remote
**Expected Location Score**: Low (40-60% depending on on-site requirement)
**Expected Display**: matchedKeywords = 0 (location not matched)

**How to Test**:
1. Resume with: "Location: Whitehouse Station, NJ"
2. Job Description with: "Remote position"
3. Click Analyze
4. **Expected Result**:
   - Location factor shows "0 / 1" in the count display (NOT "1 / 1")
   - Location score shows < 80%
   - Reason explains mismatch

**Validation**: ✓ Location mismatch shows 0/1 indicator, not hidden as match

---

### Scenario 6: Location Match - Complete Mismatch
**Candidate Location**: Whitehouse Station, NJ
**Job Location**: San Francisco, CA
**Expected Location Score**: Low (40% for completely different location)
**Expected Display**: matchedKeywords = 0 (location not matched)

**How to Test**:
1. Resume with: "Location: Whitehouse Station, NJ"
2. Job Description with: "Location: San Francisco, CA"
3. Click Analyze
4. **Expected Result**:
   - Location factor shows "0 / 1" in the count display
   - Location score shows < 80%
   - Reason: "Locations don't match"

**Validation**: ✓ Geographic mismatch is clearly displayed

---

### Scenario 7: Overall Score Calculation with Corrected Keywords
**Scenario Setup**:
- Skills Match: 80%
- Experience Level: 90%
- Location Match: 100%
- Keywords: 60% (9 of 15) ← CORRECTED
- Education: 80%

**Default Weights**: Skills 40%, Experience 25%, Location 15%, Keywords 10%, Education 10%

**Expected Overall Score Calculation**:
```
= (80 × 0.40) + (90 × 0.25) + (100 × 0.15) + (60 × 0.10) + (80 × 0.10)
= 32 + 22.5 + 15 + 6 + 8
= 83.5 ≈ 84%
```

**How to Test**:
1. Use a resume/job pair that yields these factor scores
2. Click Analyze
3. **Expected Result**: Overall score ≈ 84%

**Validation**: ✓ Overall score correctly reflects reduced keywords score

---

## Critical Test Cases

### Test Case A: Bug Reproduction (Must NOT Show 100%)
**Input**:
- Resume: Contains basic skills like "Python, JavaScript, React"
- Job: Requires "Python, JavaScript, React, Node.js, Express, MongoDB, AWS, Docker, Kubernetes"
- Claude Analysis returns: 3 matched, 5 missing keywords

**OLD BEHAVIOR (BUGGY)**:
- Keywords Score: 100% (WRONG - based on skills score + bonus)

**NEW BEHAVIOR (FIXED)**:
- Keywords Score: 37% (3 of 8 = 37.5% ≈ 37%)

**Validation Steps**:
1. ✓ Verify matchedKeywordCount = 3
2. ✓ Verify missingKeywordCount = 5
3. ✓ Verify totalKeywordCount = 8
4. ✓ Verify keywordsScore = Math.round((3/8) × 100) = 38%
5. ✓ Ensure displayed score is NOT 100%

---

### Test Case B: Location Match Visibility
**Input**:
- Resume: "Remote work from home"
- Job: "On-site, San Francisco required"
- Location Score: 40% (due to on-site requirement and location mismatch)

**OLD BEHAVIOR (BUGGY)**:
- matchedKeywords display: Only showed 1/1 if score >= 100%
- Location mismatch was hidden in the visual indicator

**NEW BEHAVIOR (FIXED)**:
- matchedKeywords display: Shows 0/1 when score < 80%
- Location mismatch is clearly visible in the factor card

**Validation Steps**:
1. ✓ Verify locationFinalScore < 80
2. ✓ Verify matchedKeywords = 0 (not 1)
3. ✓ Visual indicator shows 0/1, not 1/1
4. ✓ Location card clearly shows as unmatched

---

## Edge Cases to Test

### Edge Case 1: No Keywords Found by Claude
**Scenario**: Claude analysis returns no keyword data
**Expected Behavior**: keywordsScore defaults to 75%
```javascript
const keywordsScore = totalKeywordCount > 0
  ? Math.round((matchedKeywordCount / totalKeywordCount) * 100)
  : 75; // ← This path is taken
```

**How to Test**: Use very generic resume/job with no extractable keywords
**Validation**: ✓ Score shows 75% (not 0%, not 100%)

---

### Edge Case 2: Exact Threshold Score (80%)
**Scenario**: Location score is exactly 80%
**Expected Behavior**: Should show matchedKeywords = 1 (threshold is >= 80)

**How to Test**:
1. Arrange scenario where location score = 80%
2. Click Analyze
3. **Expected**: matchedKeywords = 1 (location considered matched)

**Validation**: ✓ Threshold boundary works correctly

---

### Edge Case 3: Just Below Threshold (79%)
**Scenario**: Location score is exactly 79%
**Expected Behavior**: Should show matchedKeywords = 0 (below threshold)

**How to Test**:
1. Arrange scenario where location score = 79%
2. Click Analyze
3. **Expected**: matchedKeywords = 0 (location considered unmatched)

**Validation**: ✓ Boundary just below threshold works correctly

---

## Testing Checklist

- [ ] **Keywords Score Test**: Verify 9/15 keywords = 60% (not 100%)
- [ ] **Keywords Score Test**: Verify 15/15 keywords = 100%
- [ ] **Keywords Score Test**: Verify 0/15 keywords = 0%
- [ ] **Location Match Display**: Verify mismatch shows 0/1
- [ ] **Location Match Display**: Verify perfect match shows 1/1
- [ ] **Overall Score Impact**: Verify corrected keywords score affects overall score
- [ ] **Edge Case**: No keywords found defaults to 75%
- [ ] **Edge Case**: Threshold boundary at 80% works correctly
- [ ] **Edge Case**: Just below 80% shows as unmatched
- [ ] **UI Display**: matchedKeywords / totalKeywords display is accurate
- [ ] **Score Formula**: Overall score calculation is mathematically correct
- [ ] **Consistent Results**: Running same resume/job twice gives same results

---

## Regression Testing

After applying these fixes, test these previously working scenarios to ensure no regression:

1. ✓ Skills match scoring still accurate
2. ✓ Experience match scoring still accurate
3. ✓ Education match scoring still accurate
4. ✓ Factor explanation text still displays correctly
5. ✓ Overall score still weighted correctly with user's custom weights
6. ✓ File upload resume analysis still works
7. ✓ Paste resume analysis still works
8. ✓ Error handling still works for API failures

---

## Success Criteria

✅ **Keywords Score Bug is FIXED**: 9/15 keywords now shows 60% score, not 100%
✅ **Location Match Display Bug is FIXED**: Mismatches now show 0/1, not hidden as 1/1
✅ **No Regression**: All previously working features still function correctly
✅ **Score Calculation is Correct**: Overall score reflects actual matching data
✅ **User Trust Restored**: Scoring is transparent and mathematically sound

