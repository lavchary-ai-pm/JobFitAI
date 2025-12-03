# JobFitAI Test Data - Ready to Use

Use these ready-made resume and job description pairs to test the scoring fixes. Just copy and paste them into the app.

---

## Test 1: Keywords Score Bug Reproduction (9/15 Keywords)

### Resume Text
```
John Smith
Senior Software Engineer
Whitehouse Station, NJ

SKILLS:
Python, JavaScript, React, Node.js, Express, MongoDB, REST API, Git, Docker

EXPERIENCE:
Senior Software Engineer at Tech Company (3 years)
- Developed REST APIs using Node.js and Express
- Built React frontends with Redux state management
- Designed MongoDB database schemas
- Managed Docker containers and deployment
- Used Git for version control
- Proficient in Python for data processing

EDUCATION:
Bachelor of Science in Computer Science
```

### Job Description
```
Senior Full Stack Developer
Location: Whitehouse Station, NJ
Employment Type: Full-Time

We are looking for a Senior Full Stack Developer with expertise in:

Required Skills:
- Python - for backend services and data processing
- JavaScript - for frontend development
- React - for building user interfaces
- Node.js - for server-side JavaScript
- Express - for REST API development
- MongoDB - for NoSQL database design
- REST API - for API architecture
- Git - for version control
- Docker - for containerization
- AWS - for cloud infrastructure
- GCP - for cloud services
- Kubernetes - for orchestration
- CI/CD - for continuous integration
- Terraform - for infrastructure as code
- Agile - for project management

Experience: 3+ years of full stack development

Education: Bachelor's degree in Computer Science or related field
```

**Expected Results**:
- Keywords Match: 9 / 15 = **60%**
- Location Match: 100% (exact match, on-site)
- Skills Match: ~80% (has 9 out of 15 tech skills)
- Overall Score: Should be lower than before due to corrected keyword scoring

---

## Test 2: Location Mismatch Display (Shows 0/1)

### Resume Text
```
Sarah Johnson
Full Stack Developer
Whitehouse Station, NJ

EXPERIENCE:
Full Stack Developer at Web Agency (4 years)
- Built responsive React applications
- Developed Node.js backend services
- Worked with MongoDB and PostgreSQL
- Implemented REST APIs
- Deployed using Docker and Kubernetes

SKILLS:
React, Node.js, Express, MongoDB, PostgreSQL, Docker, Kubernetes, AWS, Python

EDUCATION:
Master's Degree in Computer Science
```

### Job Description
```
Senior Frontend Engineer - San Francisco, CA
Location: San Francisco, California (On-site Required)
Employment Type: Full-Time

About the Role:
We need a Senior Frontend Engineer to lead our React development team.

Required Skills:
- React - expert level
- JavaScript/TypeScript
- CSS/SCSS
- Webpack or other module bundlers
- Testing frameworks
- Performance optimization
- Accessibility standards

Experience Required: 4+ years frontend development

Education: Bachelor's degree

Note: Must be able to work on-site in our San Francisco office. Remote work is not available.
```

**Expected Results**:
- Keywords Match: Should be reasonable (some skills match)
- **Location Match: 0 / 1 = LOW SCORE** (different states, on-site required)
- The location factor should visually show as "0 / 1" (not matched), NOT "1 / 1"
- Overall Score: Reduced due to location mismatch

---

## Test 3: Perfect Location Match (Shows 1/1)

### Resume Text
```
Emily Davis
Product Engineer
San Francisco, CA

EXPERIENCE:
Product Engineer at Tech Startup (5 years)
- Led React development across multiple projects
- Optimized web performance and accessibility
- Mentored junior developers
- Implemented modern CSS and responsive design
- Used TypeScript for type-safe code
- Proficient in performance monitoring and testing

TECHNICAL SKILLS:
React, JavaScript, TypeScript, CSS/SCSS, Webpack, Jest, Lighthouse, Accessibility (WCAG)

EDUCATION:
Bachelor's Degree in Computer Science from UC Berkeley
```

### Job Description
```
Senior Frontend Engineer - San Francisco, CA
Location: San Francisco, California (On-site)
Employment Type: Full-Time

About the Role:
We need a Senior Frontend Engineer to lead our React development team.

Required Skills:
- React - expert level
- JavaScript/TypeScript
- CSS/SCSS
- Webpack or other module bundlers
- Testing frameworks (Jest, React Testing Library)
- Performance optimization
- Accessibility standards (WCAG)

Experience Required: 4+ years frontend development

Education: Bachelor's degree in Computer Science

Perfect if you're based in San Francisco!
```

**Expected Results**:
- Keywords Match: ~90% (9-10 of 11 skills match)
- **Location Match: 1 / 1 = 100%** (same city and state, on-site)
- Overall Score: High (70%+)

---

## Test 4: Zero Keywords Match

### Resume Text
```
Michael Chen
Sales Manager
Remote (Currently Work from Home)

EXPERIENCE:
Sales Director at Sales Company (8 years)
- Led sales team of 12 people
- Managed $5M annual revenue pipeline
- Conducted client presentations and negotiations
- Developed sales strategies and processes
- Used CRM software for pipeline management

SKILLS:
Sales Leadership, CRM, Strategic Planning, Negotiation, Team Management, Public Speaking

EDUCATION:
Bachelor's Degree in Business Administration
```

### Job Description
```
Senior DevOps Engineer
Location: Remote
Employment Type: Full-Time

Required Technical Skills:
- Python - for scripting and automation
- Kubernetes - for container orchestration
- Docker - for containerization
- AWS - for cloud infrastructure
- Terraform - for infrastructure as code
- Jenkins - for CI/CD pipelines
- Git - for version control
- Linux - for server management
- Monitoring tools (Prometheus, Grafana)
- PostgreSQL - database administration

Experience: 5+ years DevOps experience

Education: Bachelor's degree in Computer Science or related field
```

**Expected Results**:
- Keywords Match: 0 / 10 = **0%** (completely different field)
- Location Match: 100% (both remote)
- Skills Match: ~10% (totally mismatched)
- Overall Score: Very Low (~20-30%)

---

## Test 5: All Keywords Match (Perfect)

### Resume Text
```
Alex Rodriguez
DevOps Engineer
Remote

EXPERIENCE:
Senior DevOps Engineer at Cloud Company (6 years)
- Orchestrated microservices using Kubernetes
- Containerized applications with Docker
- Automated infrastructure using Terraform
- Managed AWS cloud resources across multiple regions
- Implemented CI/CD pipelines with Jenkins
- Wrote Python automation scripts
- Managed PostgreSQL databases and backups
- Configured monitoring with Prometheus and Grafana
- Linux server administration and optimization
- Git version control and branching strategies

TECHNICAL SKILLS:
Python, Kubernetes, Docker, AWS, Terraform, Jenkins, Git, Linux, Prometheus, Grafana, PostgreSQL, Infrastructure as Code, CI/CD, Automation, Cloud Architecture

CERTIFICATIONS:
AWS Certified Solutions Architect
Kubernetes Certified Administrator

EDUCATION:
Bachelor's Degree in Computer Science
```

### Job Description
```
Senior DevOps Engineer
Location: Remote
Employment Type: Full-Time

Required Technical Skills:
- Python - for scripting and automation
- Kubernetes - for container orchestration
- Docker - for containerization
- AWS - for cloud infrastructure
- Terraform - for infrastructure as code
- Jenkins - for CI/CD pipelines
- Git - for version control
- Linux - for server management
- Monitoring tools (Prometheus, Grafana)
- PostgreSQL - database administration

Experience: 5+ years DevOps experience

Education: Bachelor's degree in Computer Science or related field

This is a perfect opportunity for someone with expertise in all these technologies.
```

**Expected Results**:
- Keywords Match: 10 / 10 = **100%** (all required skills present)
- Location Match: 100% (both remote)
- Skills Match: 100% (all match)
- Overall Score: Very High (90%+)

---

## Test 6: Partial Match (50%)

### Resume Text
```
Lisa Wang
Full Stack Developer
Chicago, IL

EXPERIENCE:
Full Stack Developer at Web Company (4 years)
- Developed React frontends with TypeScript
- Built Node.js backend services with Express
- Worked with MongoDB for data persistence
- Used Docker for containerization
- Implemented automated tests with Jest
- Managed projects with Git and GitHub

TECHNICAL SKILLS:
React, Node.js, Express, JavaScript, TypeScript, MongoDB, Docker, Jest, Git, GitHub, CSS3, HTML5

EDUCATION:
Bachelor's Degree in Software Engineering
```

### Job Description
```
Full Stack Developer - Chicago, IL
Location: Chicago, Illinois (Hybrid: 3 days on-site)
Employment Type: Full-Time

Required Technical Skills:
- React - for frontend UI development
- Node.js - for backend development
- Express - for REST API development
- JavaScript/TypeScript - language proficiency
- MongoDB - NoSQL database design
- PostgreSQL - SQL database design
- Docker - containerization
- Kubernetes - orchestration
- REST API - architecture and design
- GraphQL - API query language
- Jest - testing framework
- Testing Library - component testing
- AWS - cloud deployment
- Continuous Integration - build pipelines
- Agile methodology - software development

Experience Required: 3+ years full stack development

Education: Bachelor's degree in Computer Science or related field
```

**Expected Results**:
- Keywords Match: 8 / 15 = **53%** (about half the skills)
- Location Match: 100% (same city, hybrid acceptable)
- Skills Match: ~60%
- Overall Score: ~60-65% (moderate fit)

---

## Quick Testing Instructions

### For Keywords Score Fix (Test 1):
1. Copy Resume from Test 1
2. Copy Job Description from Test 1
3. Click "Analyze"
4. **Verify**: Keywords score shows **60%** (not 100%)
5. **Verify**: Keywords count shows **9 / 15** (matched/total)

### For Location Mismatch Fix (Test 2):
1. Copy Resume from Test 2
2. Copy Job Description from Test 2
3. Click "Analyze"
4. **Verify**: Location factor shows **0 / 1** (not matched indicator)
5. **Verify**: Location score is LOW (not 100%)

### For Location Perfect Match (Test 3):
1. Copy Resume from Test 3
2. Copy Job Description from Test 3
3. Click "Analyze"
4. **Verify**: Location factor shows **1 / 1** (matched)
5. **Verify**: Location score is **100%**

### For Edge Case: Zero Match (Test 4):
1. Copy Resume from Test 4
2. Copy Job Description from Test 4
3. Click "Analyze"
4. **Verify**: Keywords score shows **0%** (no matches)
5. **Verify**: Overall score is LOW

### For Edge Case: Perfect Match (Test 5):
1. Copy Resume from Test 5
2. Copy Job Description from Test 5
3. Click "Analyze"
4. **Verify**: Keywords score shows **100%** (all match)
5. **Verify**: Overall score is HIGH (90%+)

### For Partial Match (Test 6):
1. Copy Resume from Test 6
2. Copy Job Description from Test 6
3. Click "Analyze"
4. **Verify**: Keywords score shows **~53%** (8 of 15)
5. **Verify**: Keywords count shows **8 / 15**

---

## Validation Checklist

After running all tests:

- [ ] Test 1: Keywords shows 60% (not 100%)
- [ ] Test 1: Keywords shows 9/15 (not "perfect")
- [ ] Test 2: Location shows 0/1 (mismatch is visible)
- [ ] Test 2: Location score is LOW
- [ ] Test 3: Location shows 1/1 (match is visible)
- [ ] Test 3: Location score is 100%
- [ ] Test 4: Keywords shows 0%
- [ ] Test 5: Keywords shows 100%
- [ ] Test 6: Keywords shows ~53% (not 100%)
- [ ] All tests show mathematically correct overall scores

If all checkboxes pass, the scoring fixes are working correctly!

