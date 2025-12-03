import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

/**
 * User-friendly error panel for analysis failures
 * Shows what went wrong and helpful next steps
 */
const AnalysisErrorPanel = ({ error, onRetry, isRetrying = false }) => {
  const getErrorDetails = (errorMessage) => {
    // Map common errors to user-friendly messages
    if (!errorMessage) {
      return {
        title: 'Analysis Failed',
        message:
          'Something went wrong during the analysis. Please try again.',
        icon: 'AlertCircle',
        suggestions: [
          'Make sure your resume has at least 50 characters',
          'Check that your job description has at least 100 characters',
          'Try with shorter content first to test if the service is working',
        ],
      };
    }

    if (
      errorMessage.includes('Backend error') ||
      errorMessage.includes('fetch')
    ) {
      return {
        title: 'Backend Service Unavailable',
        message:
          'The analysis service is not currently available. This usually happens when the backend server is not running.',
        icon: 'AlertTriangle',
        suggestions: [
          'Make sure the backend server is running (npm start in /backend folder)',
          'Check that port 3001 is not blocked',
          'Try refreshing the page in a few moments',
        ],
      };
    }

    if (errorMessage.includes('API key')) {
      return {
        title: 'API Configuration Issue',
        message:
          'The AI service is not properly configured on the backend. This is a server-side issue.',
        icon: 'Lock',
        suggestions: [
          'Verify the ANTHROPIC_API_KEY is set in backend/.env.local',
          'Restart the backend server after updating the key',
          'Check the backend server logs for more details',
        ],
      };
    }

    if (errorMessage.includes('Rate limited') || errorMessage.includes('429')) {
      return {
        title: 'Too Many Requests',
        message:
          'You have made too many analysis requests in a short time. Please wait a moment before trying again.',
        icon: 'Clock',
        suggestions: [
          'Wait 30-60 seconds before retrying',
          'The API has rate limits to ensure fair usage for all users',
        ],
      };
    }

    if (errorMessage.includes('JSON')) {
      return {
        title: 'Data Format Error',
        message:
          'The AI service returned unexpected data. This is usually temporary.',
        icon: 'AlertCircle',
        suggestions: [
          'Try again - this error is usually temporary',
          'Make sure your resume text is properly formatted',
        ],
      };
    }

    // Fallback for unknown errors
    return {
      title: 'Analysis Error',
      message: errorMessage || 'An unexpected error occurred',
      icon: 'AlertCircle',
      suggestions: [
        'Check the browser console (F12) for technical details',
        'Try refreshing the page',
        'Contact support if the problem persists',
      ],
    };
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Error card */}
      <div className="bg-error/10 border-2 border-error rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0 mt-1">
            <Icon name={errorDetails.icon} size={24} className="text-error" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-2">
              {errorDetails.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {errorDetails.message}
            </p>

            {/* Suggestions */}
            {errorDetails.suggestions && errorDetails.suggestions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-error/20">
                <p className="text-xs font-semibold text-foreground mb-3">
                  💡 What you can do:
                </p>
                <ul className="space-y-2">
                  {errorDetails.suggestions.map((suggestion, i) => (
                    <li
                      key={i}
                      className="text-xs text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-error mt-1 flex-shrink-0">→</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="default"
          size="lg"
          iconName="RotateCw"
          iconPosition="left"
          onClick={onRetry}
          disabled={isRetrying}
          fullWidth
        >
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </Button>
      </div>

      {/* Debug info - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 pt-6 border-t border-border">
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground font-medium hover:text-foreground">
              🔧 Technical Details (Development Only)
            </summary>
            <div className="mt-3 p-3 bg-muted rounded-lg font-mono text-xs text-muted-foreground overflow-auto max-h-32">
              {error}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default AnalysisErrorPanel;
