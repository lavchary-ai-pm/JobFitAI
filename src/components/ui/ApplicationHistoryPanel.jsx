import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';

const ApplicationHistoryPanel = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState([
    {
      id: 1,
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      score: 87,
      status: 'applied',
      date: '2025-11-28',
      location: 'San Francisco, CA'
    },
    {
      id: 2,
      jobTitle: 'Full Stack Engineer',
      company: 'StartupXYZ',
      score: 72,
      status: 'reviewed',
      date: '2025-11-25',
      location: 'Remote'
    },
    {
      id: 3,
      jobTitle: 'React Developer',
      company: 'Digital Solutions',
      score: 65,
      status: 'pending',
      date: '2025-11-22',
      location: 'New York, NY'
    },
    {
      id: 4,
      jobTitle: 'UI/UX Engineer',
      company: 'Design Studio',
      score: 91,
      status: 'applied',
      date: '2025-11-20',
      location: 'Austin, TX'
    }
  ]);

  useEffect(() => {
    const handleOpen = () => {
      if (!isOpen) {
        onClose();
      }
    };

    window.addEventListener('openHistoryPanel', handleOpen);
    return () => window.removeEventListener('openHistoryPanel', handleOpen);
  }, [isOpen, onClose]);

  const filteredApplications = applications?.filter(app =>
    app?.jobTitle?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    app?.company?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const getScoreClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending Review',
      reviewed: 'Reviewed',
      applied: 'Applied'
    };
    return labels?.[status] || status;
  };

  const handleStatusChange = (id, newStatus) => {
    setApplications(apps =>
      apps?.map(app =>
        app?.id === id ? { ...app, status: newStatus } : app
      )
    );
  };

  const handleDelete = (id) => {
    setApplications(apps => apps?.filter(app => app?.id !== id));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="panel-container custom-scrollbar">
        <div className="panel-header">
          <h2 className="panel-title">Application History</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close panel"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="panel-content">
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Search by job title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            {filteredApplications?.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No applications found</p>
              </div>
            ) : (
              filteredApplications?.map((app) => (
                <div key={app?.id} className="application-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {app?.jobTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {app?.company}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon name="MapPin" size={14} />
                        {app?.location}
                      </div>
                    </div>
                    <div className={`score-badge ${getScoreClass(app?.score)}`}>
                      {app?.score}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-3">
                      <span className={`application-status ${app?.status}`}>
                        {getStatusLabel(app?.status)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(app.date)?.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {app?.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(app?.id, 'reviewed')}
                        >
                          Mark Reviewed
                        </Button>
                      )}
                      {app?.status === 'reviewed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(app?.id, 'applied')}
                        >
                          Mark Applied
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(app?.id)}
                        aria-label="Delete application"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationHistoryPanel;