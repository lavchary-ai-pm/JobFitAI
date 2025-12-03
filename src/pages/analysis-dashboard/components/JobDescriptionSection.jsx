import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JobDescriptionSection = ({ jobDescription, onJobDescriptionChange, onAutoFill }) => {
  const handleChange = (e) => {
    onJobDescriptionChange(e?.target?.value);
  };

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

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Briefcase" size={20} color="var(--color-primary)" />
          Job Description
        </h2>
        <Button
          variant="outline"
          size="sm"
          iconName="Sparkles"
          iconPosition="left"
          onClick={onAutoFill}
        >
          Use Sample
        </Button>
      </div>
      <textarea
        value={jobDescription}
        onChange={handleChange}
        placeholder={`Paste the job description here...

Include:
• Job title and company
• Required skills and qualifications
• Experience requirements
• Location
• Responsibilities`}
        className="w-full h-96 px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none custom-scrollbar"
      />
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-muted-foreground">
          {jobDescription?.length} characters
        </p>
        {jobDescription?.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={() => onJobDescriptionChange('')}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default JobDescriptionSection;