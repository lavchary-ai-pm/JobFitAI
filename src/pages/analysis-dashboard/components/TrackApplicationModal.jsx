import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const TrackApplicationModal = ({ isOpen, onClose, onSave, analysisData }) => {
  const [formData, setFormData] = useState({
    roleName: analysisData?.extractedRole || '',
    applicationLink: '',
    applicationDate: new Date()?.toISOString()?.split('T')?.[0],
    fitScore: analysisData?.overallScore || 0,
    status: 'Applied',
    notes: '',
    confirmed: false
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container max-w-2xl" onClick={(e) => e?.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Track Application</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close modal"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-content space-y-6">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Compatibility Score</div>
                    <div className="text-3xl font-bold text-foreground">
                      {formData?.fitScore}%
                    </div>
                  </div>
                  <div className={`score-badge ${formData?.fitScore >= 80 ? 'high' : formData?.fitScore >= 60 ? 'medium' : 'low'}`}>
                    {formData?.fitScore >= 80 ? 'Strong Match' : formData?.fitScore >= 60 ? 'Good Match' : 'Moderate Match'}
                  </div>
                </div>
              </div>

              <Input
                label="Job Role"
                type="text"
                value={formData?.roleName}
                onChange={(e) => handleChange('roleName', e?.target?.value)}
                placeholder="e.g., Senior Frontend Developer"
                required
                description="Auto-extracted from job description"
              />

              <Input
                label="Application Link"
                type="url"
                value={formData?.applicationLink}
                onChange={(e) => handleChange('applicationLink', e?.target?.value)}
                placeholder="https://company.com/careers/job-id"
                description="Link to the job posting or application portal"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Application Date"
                  type="date"
                  value={formData?.applicationDate}
                  onChange={(e) => handleChange('applicationDate', e?.target?.value)}
                  required
                />

                <Select
                  label="Status"
                  value={formData?.status}
                  onChange={(value) => handleChange('status', value)}
                  options={[
                    { label: 'Applied', value: 'Applied' },
                    { label: 'Not Applied', value: 'Not Applied' }
                  ]}
                  placeholder="Select status"
                  required
                  description="Current application status"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData?.notes}
                  onChange={(e) => handleChange('notes', e?.target?.value)}
                  placeholder="Add any additional notes about this application..."
                  className="w-full h-24 px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <Checkbox
                label="I confirm I have applied to this position"
                description="This will add the application to your tracking history"
                checked={formData?.confirmed}
                onChange={(e) => handleChange('confirmed', e?.target?.checked)}
                required
              />
            </div>

            <div className="modal-footer">
              <Button variant="ghost" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="default" type="submit" iconName="Check" iconPosition="left">
                Save Application
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TrackApplicationModal;