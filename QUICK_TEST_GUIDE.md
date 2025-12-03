# Quick Test Guide - 5 Minute Start

## What Was Fixed?

Two bugs in scoring logic:
1. **Keywords Score Bug**: Showed 100% even when only 9/15 keywords matched
2. **Location Match Display Bug**: Didn't clearly show location mismatches

## Code Changes

### File: `src/pages/analysis-dashboard/index.jsx`

**Fix #1 - Keywords Calculation (lines 915-922)**
```javascript
// BEFORE (BUGGY):
const keywordBonus = claudeAnalysis.skillMatch.transferable.length * 5;
const keywordsScore = Math.min(100, skillsScore + keywordBonus); // WRONG!

// AFTER (FIXED):
const matchedKeywordCount = claudeAnalysis.keywordMatch?.matched?.length || 0;
const missingKeywordCount = claudeAnalysis.keywordMatch?.missing?.length || 0;
const totalKeywordCount = matchedKeywordCount + missingKeywordCount;
const keywordsScore = totalKeywordCount > 0
  ? Math.round((matchedKeywordCount / totalKeywordCount) * 100)
  : 75;
```

**Fix #2 - Location Display (line 962)**
```javascript
// BEFORE: Only showed match if score >= 100
matchedKeywords: locationFinalScore >= 100 ? 1 : 0,

// AFTER: Shows match if score >= 80 (reasonable threshold)
matchedKeywords: locationFinalScore >= 80 ? 1 : 0,
```

---

## The Simplest Test

**Copy this resume:**
```
John Smith
Skills: Python, JavaScript, React, Node.js, Express, MongoDB, REST API, Git, Docker
Location: Whitehouse Station, NJ
Experience: 3 years
Education: BS Computer Science
```

**Copy this job:**
```
Required Skills: Python, JavaScript, React, Node.js, Express, MongoDB, REST API, Git, Docker, AWS, GCP, Kubernetes, CI/CD, Terraform, Agile
Location: Whitehouse Station, NJ
Required Experience: 3+ years
Required Education: BS Computer Science
```

**Paste into app and click Analyze**

**Check these results:**
- ✅ Keywords score shows **~60%** (NOT 100%)
- ✅ Keywords count shows **9 / 15** (matched / total)
- ✅ Everything else looks reasonable

**If you see 100% for keywords → The bug is NOT fixed**
**If you see 60% for keywords → The bug IS fixed** ✓

---

## Test Location Mismatch (Scenario 2)

**Copy this resume:**
```
Sarah Johnson
Skills: React, Node.js, Express, MongoDB, Docker
Location: Whitehouse Station, NJ
```

**Copy this job:**
```
Required Skills: React, JavaScript, TypeScript, CSS, Webpack
Location: San Francisco, California (On-site Required)
```

**Expected Results:**
- ✅ Location factor shows **0 / 1** (not matched)
- ✅ Location score is LOW (not 100%)
- ✅ You can clearly see it's a location mismatch

---

## Test Perfect Location Match (Scenario 3)

**Copy this resume:**
```
Emily Davis
Skills: React, JavaScript, TypeScript, CSS
Location: San Francisco, California
```

**Copy this job:**
```
Required Skills: React, JavaScript, TypeScript, CSS
Location: San Francisco, California (On-site)
```

**Expected Results:**
- ✅ Location factor shows **1 / 1** (matched)
- ✅ Location score is **100%**
- ✅ Overall score is high (70%+)

---

## What to Look For

### Keywords Score Should Show:
- 60% for 9 of 15 keywords ✓
- 100% for 15 of 15 keywords ✓
- 0% for 0 of 15 keywords ✓
- NOT 100% when only partial keywords match ❌

### Location Match Should Show:
- **1 / 1** when locations match ✓
- **0 / 1** when locations don't match ✓
- NOT hidden or confusing display ❌

### Overall Score Should:
- Be mathematically correct (weighted sum of factors)
- Reflect actual keyword matches (not inflated)
- Be lower when keywords don't match ✓

---

## If Something Looks Wrong

### Scenario: Keywords still shows 100%
- The fix wasn't applied correctly
- Check line 920 in index.jsx has `Math.round((matchedKeywordCount / totalKeywordCount) * 100)`

### Scenario: Location match is confusing
- Check line 962 in index.jsx has `>= 80` (not `>= 100`)

### Scenario: Overall score seems wrong
- Use SCORING_MATH_VALIDATION.md to verify calculation
- Test scenarios from TEST_DATA.md to compare

---

## Success Criteria

When the fixes work correctly, you should see:

| Test | Old Behavior | New Behavior | Status |
|------|-------------|--------------|--------|
| 9/15 Keywords | 100% ❌ | 60% ✓ | FIXED |
| Location Mismatch | Unclear | 0/1 shown ✓ | FIXED |
| Perfect Match | OK | 100% ✓ | STILL OK |
| Overall Score | Inflated | Accurate ✓ | IMPROVED |

---

## Full Test Documents

For more detailed testing:
- **TEST_DATA.md** - 6 ready-to-use test scenarios
- **SCORING_TEST_PLAN.md** - Comprehensive test plan with all edge cases
- **SCORING_MATH_VALIDATION.md** - Mathematical proofs of correctness

---

## Need Help?

1. Run the simplest test above
2. Check if keywords shows 60% (not 100%)
3. If it does → Fix is working ✓
4. If it doesn't → Check the code changes

That's it! The fixes are either working or they're not.

