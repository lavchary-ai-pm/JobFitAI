import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import StarRating from './StarRating';
import { submitFeedback } from '../../utils/feedback';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setRating(0);
    setMessage('');
    setEmail('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (message.trim().length < 10) {
      setError('Please enter at least 10 characters');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await submitFeedback({
        rating,
        message: message.trim(),
        email: email.trim(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-container max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Share Feedback</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <Icon name="Check" size={32} className="text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Thank you!
            </h3>
            <p className="text-muted-foreground">
              Your feedback helps us improve.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-content space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  How's your experience?
                </label>
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  disabled={loading}
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="feedback-message"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Tell us more <span className="text-error">*</span>
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  maxLength={500}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-muted-foreground text-right">
                  {message.length}/500
                </p>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="feedback-email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Only if you'd like a response
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-error/10 text-error rounded-lg">
                  <Icon name="AlertCircle" size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <Button variant="ghost" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Submit Feedback
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
