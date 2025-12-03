# Location Scoring: Pure Rule-Based Logic

## Overview

Location scoring has been changed from AI-dependent logic to **explicit, transparent rule-based matching**. This ensures consistent, predictable, and user-understandable scoring with zero AI involvement.

---

## The 5 Rules (in order)

### Rule 1: Job is Remote → 100%
```
IF job description contains "remote" OR "work from home" OR "anywhere"
THEN score = 100%
      matchedKeywords = 1/1
REASON: "Job is remote position. Your location: [candidate location]. Match: Perfect fit."
```

**Examples**:
- Job: "Remote position" + Candidate: "San Francisco, CA" → 100% ✓
- Job: "Work from home" + Candidate: "Chicago, IL" → 100% ✓
- Job: "Position available anywhere" + Candidate: "Not specified" → 100% ✓

---

### Rule 2: Candidate Location Matches Job Location → 100%
```
IF (candidate_city == job_city AND candidate_state == job_state)
   OR (candidate_state == job_state AND job has no specific city)
THEN score = 100%
      matchedKeywords = 1/1
REASON: "Your location ([candidate]) matches job location ([job]). Perfect match."
```

**Examples**:
- Candidate: "San Francisco, CA" + Job: "San Francisco, CA" → 100% ✓
- Candidate: "Los Angeles, CA" + Job: "California" (no city) → 100% ✓
- Candidate: "San Francisco, CA" + Job: "Los Angeles, CA" → Does NOT match ✗

**How Matching Works**:
1. Extract city from resume (e.g., "San Francisco")
2. Extract state from resume (e.g., "CA")
3. Extract city from job (e.g., "San Francisco")
4. Extract state from job (e.g., "CA")
5. Compare: city == city AND state == state

---

### Rule 3: Job is Hybrid → 85%
```
IF job description contains "hybrid" OR "flexible" OR "some remote"
THEN score = 85%
      matchedKeywords = 1/1
REASON: "Job is hybrid. Your location: [candidate]. Job location: [job]. Hybrid positions offer flexibility."
```

**Examples**:
- Job: "Hybrid (3 days on-site)" + Candidate: "Different state" → 85% ✓
- Job: "Flexible location" + Candidate: "San Francisco" → 85% ✓

**Note**: This rule assumes hybrid roles are flexible about location since the candidate won't be on-site daily.

---

### Rule 4: Candidate Explicitly States "Open to Relocation" → 85%
```
IF resume contains "open to relocation" OR "willing to relocate"
                  OR "willing to move" OR "open to move"
THEN score = 85%
      matchedKeywords = 1/1
REASON: "Your location differs from job location, but you're open to relocation. Score: 85%."
```

**Examples**:
- Resume: "Location: Chicago, IL. Open to relocation" + Job: "San Francisco, CA" → 85% ✓
- Resume: "Willing to relocate for the right opportunity" + Job: "New York, NY" → 85% ✓
- Resume: "Chicago, IL" (no relocation mention) + Job: "San Francisco, CA" → 40% ✗

**Keywords Detected**:
- "open to relocation"
- "willing to relocate"
- "willing to move"
- "open to move"
- "relocation"

(Case-insensitive)

---

### Rule 5: Different Location with NO Relocation Signal → 40%
```
IF candidate_location != job_location
   AND candidate has NO relocation signal
   AND both have location information
THEN score = 40%
      matchedKeywords = 0/1
REASON: "Your location differs from job location. No relocation signal found. Score: 40%."
```

**Examples**:
- Candidate: "Whitehouse Station, NJ" + Job: "San Francisco, CA" (on-site) → 40% ✓
- Candidate: "Chicago, IL" + Job: "Los Angeles, CA" (on-site) → 40% ✓
- Candidate: "Remote work" + Job: "New York, NY" (on-site required) → 40% ✓

---

## Fallback Rules

### Fallback 1: Missing Location Information → 50%
```
IF (candidate location is NOT specified) OR (job location is NOT specified)
THEN score = 50%
      matchedKeywords = 0/1
REASON: "Location information incomplete. Your location: [candidate]. Job location: [job]. Score: 50%."
```

**Examples**:
- Resume: "Not specified" + Job: "San Francisco, CA" → 50%
- Resume: "San Francisco, CA" + Job: "Not specified" → 50%
- Resume: "Not specified" + Job: "Not specified" → 50%

---

## Location Extraction Process

### Step 1: Extract Candidate Location from Resume
```
Look for: City, State format (e.g., "San Francisco, CA")

Detection methods:
1. Check for common city names (San Francisco, Los Angeles, New York, etc.)
2. Check for state abbreviations (CA, TX, NY, NJ, etc.)
3. Check for full state names (California, Texas, New York, etc.)

Result: formattedLocation = "City, State" (e.g., "San Francisco, CA")
```

**Example Resume Location Extraction**:
```
Resume text:
"John Smith
San Francisco, CA
Senior Engineer
..."

Extracted:
- city: "San Francisco"
- states: ["CA"]
- formattedLocation: "San Francisco, CA"
```

### Step 2: Extract Job Location from Job Description
```
Look for: Location requirements anywhere in job description

Detection methods:
1. Check for city/state combinations
2. Check for work arrangement (remote, hybrid, on-site)
3. Check for explicit location keywords (Location:, Based in:, etc.)

Result: formattedLocation = "City, State" OR work arrangement type
```

**Example Job Location Extraction**:
```
Job text:
"Senior Software Engineer
San Francisco, California
On-site required
..."

Extracted:
- city: "San Francisco"
- states: ["CA"]
- isOnsite: true
- formattedLocation: "San Francisco, CA"
```

### Step 3: Check for Relocation Willingness
```
Search resume for keywords:
- "open to relocation"
- "willing to relocate"
- "willing to move"
- "open to move"
- "relocation"

If found: isRelocatable = true
If not found: isRelocatable = false
```

---

## Special Cases

### Case 1: Remote Job + Any Candidate Location
```
Rule 1 applies immediately → 100%
Candidate location doesn't matter
```

**Example**:
```
Job: "Remote position, work from anywhere"
Candidate: "No location specified"
Result: 100% (Rule 1)
```

### Case 2: Hybrid Job + Different Locations
```
Hybrid rule applies → 85%
Even if locations don't match, flexibility granted
```

**Example**:
```
Job: "Hybrid (2 days on-site in NYC)"
Candidate: "San Francisco, CA"
Result: 85% (Rule 3 - hybrid flexibility)
```

### Case 3: Same State, Different City
```
Does NOT match Rule 2 (requires both city AND state)
Goes to Rule 5 (different location) → 40%
```

**Example**:
```
Job: "San Francisco, CA"
Candidate: "Los Angeles, CA"
Result: 40% (Rule 5 - different cities, same state)
```

### Case 4: Only State Specified
```
If job only lists state (no city) and candidate is in that state → Rule 2 applies → 100%
```

**Example**:
```
Job: "California - location flexible within state"
Candidate: "San Francisco, CA"
Result: 100% (Rule 2 - state match)
```

---

## Why This Approach Works

### Transparent
✓ Every rule is explicit and understandable
✓ Users can see exactly why they got their location score
✓ No hidden AI logic

### Consistent
✓ Same resume + job always produces same score
✓ No variation between runs
✓ Predictable for users

### Fair
✓ Remote jobs don't penalize location mismatches
✓ Hybrid jobs acknowledge flexibility
✓ Candidates willing to relocate are rewarded
✓ Mismatches for on-site roles are realistic (40%)

### Accurate
✓ No false positives (100% for mismatches)
✓ No AI hallucination
✓ Based on explicit text matching

---

## Implementation Details

### File: src/pages/analysis-dashboard/index.jsx

**Function**: `calculateLocationScore(resumeLocation, jobLocation)`

**Location**: Lines 615-690

**Inputs**:
- `resumeLocation` - Object with extracted location info from resume
  - `.formattedLocation` - "City, State" format
  - `.city` - Extracted city name
  - `.states` - Array of detected states
  - `.hasLocationInfo` - Boolean: has location data
  - `.isRemote` - Boolean: contains "remote"
  - `.isHybrid` - Boolean: contains "hybrid"
  - `.originalText` - Original resume text (for relocation keywords)

- `jobLocation` - Object with extracted location info from job
  - `.formattedLocation` - "City, State" format
  - `.city` - Extracted city name
  - `.states` - Array of detected states
  - `.hasLocationInfo` - Boolean: has location data
  - `.isRemote` - Boolean: contains "remote"
  - `.isHybrid` - Boolean: contains "hybrid"

**Output**:
```javascript
{
  score: 0-100,           // Location match score
  matchedKeywords: 0 or 1, // For display: matched or not
  totalKeywords: 1,       // Always 1 for location
  reason: "string"        // 1-sentence explanation
}
```

---

## Score Distribution

| Scenario | Score | Rule | Displayed as |
|----------|-------|------|--------------|
| Remote job | 100% | 1 | 1/1 matched |
| Exact location match | 100% | 2 | 1/1 matched |
| Hybrid job | 85% | 3 | 1/1 matched |
| Open to relocation | 85% | 4 | 1/1 matched |
| Different location (no relocation) | 40% | 5 | 0/1 not matched |
| Missing location info | 50% | Fallback | 0/1 not matched |

---

## Testing the Rules

### Test Rule 1 (Remote Job)
```
Resume: "John Smith, San Francisco, CA"
Job: "Senior Engineer - Remote position"
Expected: 100% (Rule 1)
Reason: "Job is remote position..."
```

### Test Rule 2 (Exact Match)
```
Resume: "Sarah Johnson, San Francisco, CA"
Job: "Senior Engineer, San Francisco, California"
Expected: 100% (Rule 2)
Reason: "Your location matches job location..."
```

### Test Rule 3 (Hybrid)
```
Resume: "Mike Davis, Chicago, IL"
Job: "Senior Engineer - Hybrid (3 days on-site in SF)"
Expected: 85% (Rule 3)
Reason: "Job is hybrid. Hybrid positions offer flexibility..."
```

### Test Rule 4 (Relocatable)
```
Resume: "Lisa Wang, Chicago, IL. Open to relocation."
Job: "Senior Engineer, San Francisco, CA - On-site"
Expected: 85% (Rule 4)
Reason: "Your location differs from job location, but you're open to relocation..."
```

### Test Rule 5 (Different Location)
```
Resume: "Tom Brown, Whitehouse Station, NJ"
Job: "Senior Engineer, San Francisco, CA - On-site required"
Expected: 40% (Rule 5)
Reason: "Your location differs from job location. No relocation signal found..."
```

---

## Code Quality

✅ **Pure Rule-Based**: No AI involved
✅ **Explicit**: Every rule is numbered and documented
✅ **Testable**: Each rule can be tested independently
✅ **Maintainable**: Easy to understand and modify
✅ **Transparent**: Clear explanations for every score
✅ **Consistent**: Same input always produces same output

---

## Migration from AI-Based Logic

### What Changed
- ❌ Removed: Complex hybrid/on-site/flexible logic
- ❌ Removed: AI scoring from Claude
- ✅ Added: 5 explicit, rule-based rules
- ✅ Added: Relocation willingness detection
- ✅ Added: Clear, one-sentence explanations

### Why
- AI logic was complex and hard to explain
- Users couldn't understand how score was calculated
- Rules are transparent and user-friendly
- Consistent results without AI hallucination

---

## Summary

Location scoring is now **completely rule-based with zero AI involvement**. The 5 rules are:

1. Remote job → 100%
2. Location match → 100%
3. Hybrid job → 85%
4. Open to relocation → 85%
5. Different location (no relocation) → 40%

Plus fallbacks for missing location info (50%).

Every rule is explicit, transparent, and easy to understand. Users can always see exactly why they received their location score.

