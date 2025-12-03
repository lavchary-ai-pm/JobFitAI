# Distance Matching Test Cases

Test the new 50-mile proximity rule with these scenarios.

---

## Test 1: Within 50 Miles (Whitehouse Station to New York)

### Resume
```
John Smith
Whitehouse Station, New Jersey

Senior Software Engineer
Experience: 5 years
Skills: Java, Spring, REST APIs, SQL
```

### Job Description
```
Senior Backend Engineer
New York, New York - On-site 5 days/week

Location: New York, NY office
On-site requirement: Full-time in office

Requirements:
- 5+ years backend development
- Java/Spring experience
- REST API design
```

### Distance Calculation
```
Whitehouse Station, NJ: (40.5576°, -74.5285°)
New York, NY:         (40.7128°, -74.0060°)
Distance: ~30 miles
```

### Expected Result
- ✅ Location Score: **100%**
- ✅ Display: **1 / 1** (matched)
- ✅ Reason: "Your location (Whitehouse Station, NJ) is within 50 miles of job location (New York, NY). Commutable distance: Perfect match."

### Why
Rule 2B: Distance <= 50 miles → 100%

---

## Test 2: Beyond 50 Miles (San Diego to Los Angeles)

### Resume
```
Jane Doe
San Diego, California

Senior Frontend Developer
Experience: 4 years
Skills: React, JavaScript, CSS
```

### Job Description
```
Senior Frontend Developer
Los Angeles, California - On-site Required

Location: Los Angeles, CA office
On-site requirement: 5 days/week

Requirements:
- 4+ years React experience
```

### Distance Calculation
```
San Diego, CA:  (32.7157°, -117.1611°)
Los Angeles, CA: (34.0522°, -118.2437°)
Distance: ~120 miles
```

### Expected Result
- ✅ Location Score: **40%**
- ✅ Display: **0 / 1** (not matched)
- ✅ Reason: "Your location (San Diego, CA) differs from job location (Los Angeles, CA). No relocation signal found. Score: 40%."

### Why
Rule 5: Different location, beyond 50 miles, no relocation → 40%

---

## Test 3: Exact Match (Dallas to Dallas)

### Resume
```
Mike Brown
Dallas, Texas

Full Stack Engineer
Experience: 6 years
```

### Job Description
```
Full Stack Engineer
Dallas, Texas - On-site

Location: Dallas, TX office
On-site requirement: 5 days/week
```

### Distance Calculation
```
Same city, same state → Exact match (no distance calculation needed)
```

### Expected Result
- ✅ Location Score: **100%**
- ✅ Display: **1 / 1** (matched)
- ✅ Reason: "Your location (Dallas, TX) matches job location (Dallas, TX). Perfect match."

### Why
Rule 2: Exact match (same city AND state) → 100%

---

## Test 4: Close Proximity - Dallas to Fort Worth

### Resume
```
Sarah Johnson
Dallas, Texas

DevOps Engineer
Experience: 5 years
```

### Job Description
```
Senior DevOps Engineer
Fort Worth, Texas - Hybrid (3 days on-site)

Location: Fort Worth, TX
Hybrid arrangement: 3 days on-site, 2 days remote
```

### Distance Calculation
```
Dallas, TX:      (32.7767°, -96.7970°)
Fort Worth, TX:  (32.7555°, -97.3308°)
Distance: ~35 miles
```

### Expected Result
- ✅ Location Score: **100%**
- ✅ Display: **1 / 1** (matched)
- ✅ Reason: "Your location (Dallas, TX) is within 50 miles of job location (Fort Worth, TX). Commutable distance: Perfect match."

### Why
Rule 2B: Distance <= 50 miles → 100%

---

## Test 5: Cross-Country + Open to Relocation (San Francisco to New York)

### Resume
```
Alex Chen
San Francisco, California

Senior Software Engineer
Experience: 7 years
Open to relocation for the right opportunity
```

### Job Description
```
Senior Software Engineer
New York, New York - On-site Required

Location: New York, NY office
On-site requirement: Full-time

Requirements:
- 7+ years experience
```

### Distance Calculation
```
San Francisco, CA: (37.7749°, -122.4194°)
New York, NY:      (40.7128°, -74.0060°)
Distance: ~2,500 miles
```

### Expected Result
- ✅ Location Score: **85%**
- ✅ Display: **1 / 1** (matched)
- ✅ Reason: "Your location (San Francisco, CA) differs from job location (New York, NY), but you're open to relocation. Score: 85%."

### Why
Rule 4: Resume states "open to relocation" → 85% (takes priority over distance)

---

## Test 6: Nearby City - Oakland to San Francisco

### Resume
```
Emma Wilson
Oakland, California

Senior Engineer
Experience: 4 years
```

### Job Description
```
Senior Backend Engineer
San Francisco, California - On-site 5 days/week

Location: San Francisco, CA office
```

### Distance Calculation
```
Oakland, CA:      (37.8044°, -122.2712°)
San Francisco, CA: (37.7749°, -122.4194°)
Distance: ~12 miles
```

### Expected Result
- ✅ Location Score: **100%**
- ✅ Display: **1 / 1** (matched)
- ✅ Reason: "Your location (Oakland, CA) is within 50 miles of job location (San Francisco, CA). Commutable distance: Perfect match."

### Why
Rule 2B: Distance <= 50 miles → 100%

---

## Test 7: Hybrid with Distance Beyond 50 Miles

### Resume
```
David Park
Phoenix, Arizona

Software Engineer
Experience: 3 years
```

### Job Description
```
Software Engineer - Hybrid
Las Vegas, Nevada - 2 days on-site

Work Arrangement: Hybrid (2 days on-site, 3 days remote)
Location: Las Vegas, NV office
```

### Distance Calculation
```
Phoenix, AZ:  (33.4484°, -112.0742°)
Las Vegas, NV: (36.1699°, -115.1398°)
Distance: ~300 miles
```

### Expected Result
- ✅ Location Score: **85%**
- ✅ Display: **1 / 1** (matched)
- ✅ Reason: "Job is hybrid. Your location: Phoenix, AZ. Job location: Las Vegas, NV. Hybrid positions offer flexibility."

### Why
Rule 3: Job is hybrid → 85% (hybrid rule takes priority - recognizes flexibility)

---

## Test 8: Same State, Different Cities (Los Angeles to San Jose)

### Resume
```
Lisa Martinez
Los Angeles, California

Quality Assurance Engineer
Experience: 2 years
```

### Job Description
```
QA Engineer
San Jose, California - On-site Required

Location: San Jose, CA office
On-site requirement: 5 days/week
```

### Distance Calculation
```
Los Angeles, CA: (34.0522°, -118.2437°)
San Jose, CA:    (37.3382°, -121.8863°)
Distance: ~300 miles
```

### Expected Result
- ✅ Location Score: **40%**
- ✅ Display: **0 / 1** (not matched)
- ✅ Reason: "Your location (Los Angeles, CA) differs from job location (San Jose, CA). No relocation signal found. Score: 40%."

### Why
Rule 5: Same state but cities beyond 50 miles apart → 40%

---

## Test 9: Remote Job (Distance Irrelevant)

### Resume
```
Tom Davis
Denver, Colorado

Full Stack Developer
Experience: 5 years
```

### Job Description
```
Full Stack Developer - Remote
Location: Remote - Work from anywhere

Fully remote position. No office location required.
```

### Distance Calculation
```
No distance calculation needed - job is remote
```

### Expected Result
- ✅ Location Score: **100%**
- ✅ Display: **1 / 1** (matched)
- ✅ Reason: "Job is remote position. Your location: Denver, CO. Match: Perfect fit."

### Why
Rule 1: Job is remote → 100% (distance doesn't matter)

---

## Test 10: Missing City in Database (Portland to Seattle)

### Resume
```
Kelly Brown
Portland, Oregon

Software Engineer
Experience: 4 years
```

### Job Description
```
Software Engineer
Seattle, Washington - On-site

Location: Seattle, WA office
On-site requirement: 5 days/week
```

### Distance Calculation
```
Portland, OR:   (45.5152°, -122.6784°) - IN DATABASE
Seattle, WA:    (47.6062°, -122.3321°) - IN DATABASE
Distance: ~170 miles
```

### Expected Result
- ✅ Location Score: **40%**
- ✅ Display: **0 / 1** (not matched)
- ✅ Reason: "Your location (Portland, OR) differs from job location (Seattle, WA). No relocation signal found. Score: 40%."

### Why
Rule 5: Distance > 50 miles → 40%

---

## Distance Validation Table

| Test | From | To | Distance | Score | Rule |
|------|------|-----|----------|-------|------|
| 1 | Whitehouse Station, NJ | New York, NY | ~30 mi | 100% | 2B |
| 2 | San Diego, CA | Los Angeles, CA | ~120 mi | 40% | 5 |
| 3 | Dallas, TX | Dallas, TX | 0 mi | 100% | 2 |
| 4 | Dallas, TX | Fort Worth, TX | ~35 mi | 100% | 2B |
| 5 | San Francisco, CA | New York, NY | ~2500 mi | 85% | 4 |
| 6 | Oakland, CA | San Francisco, CA | ~12 mi | 100% | 2B |
| 7 | Phoenix, AZ | Las Vegas, NV | ~300 mi | 85% | 3 |
| 8 | Los Angeles, CA | San Jose, CA | ~300 mi | 40% | 5 |
| 9 | Denver, CO | Remote | N/A | 100% | 1 |
| 10 | Portland, OR | Seattle, WA | ~170 mi | 40% | 5 |

---

## How to Test

1. **Pick a test scenario** (Tests 1-10 above)
2. **Copy the resume** text into the app
3. **Copy the job description** text into the app
4. **Click "Analyze"**
5. **Check Location Match factor**:
   - Verify score matches expected
   - Verify matched/total display (1/1 or 0/1)
   - Verify reason mentions distance (if applicable)

---

## Validation Checklist

- [ ] Test 1: Within 50 miles shows 100%
- [ ] Test 2: Beyond 50 miles shows 40%
- [ ] Test 3: Exact match shows 100%
- [ ] Test 4: Close proximity shows 100%
- [ ] Test 5: Cross-country with relocation shows 85%
- [ ] Test 6: Nearby city shows 100%
- [ ] Test 7: Hybrid job shows 85% (despite distance)
- [ ] Test 8: Same state, far apart shows 40%
- [ ] Test 9: Remote job shows 100%
- [ ] Test 10: Distance not in database handled correctly

---

## Success Criteria

✅ All 10 tests produce expected scores
✅ Distance matching works for cities in database
✅ Fallback to exact match for cities not in database
✅ Hybrid/Remote/Relocation rules still work
✅ Reason text mentions "commutable distance" when applicable

---

## Edge Cases Covered

✅ Cities within database (calculations work)
✅ Cities not in database (fallback to exact match)
✅ Exact same city match (no distance calculation)
✅ Remote jobs (distance irrelevant)
✅ Hybrid jobs (distance less critical)
✅ Relocatable candidates (distance less critical)
✅ Cross-country distances (correctly scores as 40%)
✅ Regional distances (correctly calculates)

