import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import { Checkbox } from './Checkbox';

const SettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('scoring');
  const [settings, setSettings] = useState({
    scoring: {
      skillsWeight: 40,
      experienceWeight: 30,
      educationWeight: 20,
      keywordsWeight: 10
    },
    notifications: {
      emailAlerts: true,
      scoreThreshold: 70,
      dailyDigest: false
    },
    preferences: {
      autoSave: true,
      darkMode: false,
      compactView: false
    }
  });

  useEffect(() => {
    const handleOpen = () => {
      if (!isOpen) {
        onClose();
      }
    };

    window.addEventListener('openSettingsModal', handleOpen);
    return () => window.removeEventListener('openSettingsModal', handleOpen);
  }, [isOpen, onClose]);

  const handleScoringChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      scoring: {
        ...prev?.scoring,
        [field]: parseInt(value) || 0
      }
    }));
  };

  const handleNotificationChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev?.notifications,
        [field]: value
      }
    }));
  };

  const handlePreferenceChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev?.preferences,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    onClose();
  };

  const handleReset = () => {
    setSettings({
      scoring: {
        skillsWeight: 40,
        experienceWeight: 30,
        educationWeight: 20,
        keywordsWeight: 10
      },
      notifications: {
        emailAlerts: true,
        scoreThreshold: 70,
        dailyDigest: false
      },
      preferences: {
        autoSave: true,
        darkMode: false,
        compactView: false
      }
    });
  };

  if (!isOpen) return null;

  const totalWeight = Object.values(settings?.scoring)?.reduce((sum, val) => sum + val, 0);
  const isValidWeight = totalWeight === 100;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e?.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Settings</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close modal"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('scoring')}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
                activeTab === 'scoring' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Scoring Weights
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
                activeTab === 'notifications'
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
                activeTab === 'preferences' ?'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Preferences
            </button>
          </div>

          <div className="modal-content">
            {activeTab === 'scoring' && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Customize how different factors contribute to the overall match score. Total must equal 100%.
                  </p>
                  {!isValidWeight && (
                    <div className="flex items-center gap-2 p-3 bg-warning/10 text-warning rounded-lg mb-4">
                      <Icon name="AlertTriangle" size={16} />
                      <span className="text-sm">Total weight must equal 100% (currently {totalWeight}%)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Skills Match</span>
                      <span className="text-sm font-mono text-muted-foreground">{settings?.scoring?.skillsWeight}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings?.scoring?.skillsWeight}
                      onChange={(e) => handleScoringChange('skillsWeight', e?.target?.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Experience Level</span>
                      <span className="text-sm font-mono text-muted-foreground">{settings?.scoring?.experienceWeight}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings?.scoring?.experienceWeight}
                      onChange={(e) => handleScoringChange('experienceWeight', e?.target?.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Education</span>
                      <span className="text-sm font-mono text-muted-foreground">{settings?.scoring?.educationWeight}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings?.scoring?.educationWeight}
                      onChange={(e) => handleScoringChange('educationWeight', e?.target?.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Keywords</span>
                      <span className="text-sm font-mono text-muted-foreground">{settings?.scoring?.keywordsWeight}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings?.scoring?.keywordsWeight}
                      onChange={(e) => handleScoringChange('keywordsWeight', e?.target?.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <Checkbox
                  label="Email Alerts"
                  description="Receive email notifications for new analysis results"
                  checked={settings?.notifications?.emailAlerts}
                  onChange={(e) => handleNotificationChange('emailAlerts', e?.target?.checked)}
                />

                <div>
                  <Input
                    type="number"
                    label="Score Threshold"
                    description="Only notify for scores above this percentage"
                    value={settings?.notifications?.scoreThreshold}
                    onChange={(e) => handleNotificationChange('scoreThreshold', parseInt(e?.target?.value))}
                    min="0"
                    max="100"
                  />
                </div>

                <Checkbox
                  label="Daily Digest"
                  description="Receive a daily summary of all analyses"
                  checked={settings?.notifications?.dailyDigest}
                  onChange={(e) => handleNotificationChange('dailyDigest', e?.target?.checked)}
                />
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <Checkbox
                  label="Auto-save Results"
                  description="Automatically save analysis results to history"
                  checked={settings?.preferences?.autoSave}
                  onChange={(e) => handlePreferenceChange('autoSave', e?.target?.checked)}
                />

                <Checkbox
                  label="Dark Mode"
                  description="Use dark color scheme"
                  checked={settings?.preferences?.darkMode}
                  onChange={(e) => handlePreferenceChange('darkMode', e?.target?.checked)}
                />

                <Checkbox
                  label="Compact View"
                  description="Show more information in less space"
                  checked={settings?.preferences?.compactView}
                  onChange={(e) => handlePreferenceChange('compactView', e?.target?.checked)}
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                disabled={activeTab === 'scoring' && !isValidWeight}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;