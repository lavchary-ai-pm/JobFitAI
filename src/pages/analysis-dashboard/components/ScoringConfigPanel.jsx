import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

// Default scoring weights (40% Skills, 25% Experience, 15% Location, 10% Keywords, 10% Education)
const DEFAULT_WEIGHTS = {
  skills: 40,
  experience: 25,
  location: 15,
  education: 10,
  keywords: 10
};

const ScoringConfigPanel = ({ weights, onWeightsChange, onSaveConfig, onLoadConfig }) => {
  const [selectedPreset, setSelectedPreset] = useState('balanced');

  const presets = {
    balanced: {
      name: 'Balanced',
      description: 'Equal consideration of all factors',
      weights: { skills: 40, experience: 25, location: 15, education: 10, keywords: 10 }
    },
    skillsFocused: {
      name: 'Skills Focused',
      description: 'Prioritizes technical skills match',
      weights: { skills: 50, experience: 20, location: 10, education: 10, keywords: 10 }
    },
    experienceFocused: {
      name: 'Experience Focused',
      description: 'Emphasizes work experience',
      weights: { skills: 30, experience: 40, location: 10, education: 10, keywords: 10 }
    },
    comprehensive: {
      name: 'Comprehensive',
      description: 'Thorough evaluation of all aspects',
      weights: { skills: 35, experience: 25, location: 20, education: 10, keywords: 10 }
    }
  };

  const handleWeightChange = (factor, value) => {
    const newWeights = { ...weights, [factor]: parseInt(value) || 0 };
    onWeightsChange(newWeights);
    setSelectedPreset('custom');
  };

  const handlePresetSelect = (presetKey) => {
    setSelectedPreset(presetKey);
    onWeightsChange(presets?.[presetKey]?.weights);
  };

  const handleReset = () => {
    onWeightsChange(DEFAULT_WEIGHTS);
    setSelectedPreset('balanced');
  };

  const totalWeight = Object.values(weights)?.reduce((sum, val) => sum + val, 0);
  const isValidWeight = totalWeight === 100;

  const factors = [
    { key: 'skills', label: 'Skills Match', icon: 'Code', color: 'var(--color-primary)' },
    { key: 'experience', label: 'Experience Level', icon: 'Briefcase', color: 'var(--color-accent)' },
    { key: 'location', label: 'Location Match', icon: 'MapPin', color: 'var(--color-warning)' },
    { key: 'education', label: 'Education', icon: 'GraduationCap', color: 'var(--color-success)' },
    { key: 'keywords', label: 'Keywords', icon: 'Hash', color: 'var(--color-muted-foreground)' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          Configuration Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(presets)?.map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetSelect(key)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                selectedPreset === key
                  ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-medium text-foreground mb-1">{preset?.name}</div>
              <div className="text-xs text-muted-foreground">{preset?.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">
            Custom Weights
          </label>
          {!isValidWeight && (
            <div className="flex items-center gap-2 text-warning">
              <Icon name="AlertTriangle" size={16} />
              <span className="text-xs">Total must equal 100% (currently {totalWeight}%)</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {factors?.map((factor) => (
            <div key={factor?.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon name={factor?.icon} size={16} color={factor?.color} />
                  <span className="text-sm font-medium text-foreground">{factor?.label}</span>
                </div>
                <span className="text-sm font-mono text-muted-foreground">
                  {weights?.[factor?.key]}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={weights?.[factor?.key]}
                onChange={(e) => handleWeightChange(factor?.key, e?.target?.value)}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${factor?.color} 0%, ${factor?.color} ${weights?.[factor?.key]}%, var(--color-muted) ${weights?.[factor?.key]}%, var(--color-muted) 100%)`
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          variant="ghost"
          iconName="RotateCcw"
          iconPosition="left"
          onClick={handleReset}
          fullWidth
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default ScoringConfigPanel;