/**
 * 🔄 PRODUCTION-GRADE LOADING SYSTEM
 * 
 * Comprehensive loading states with skeleton screens,
 * progress indicators, and timeout handling.
 * 
 * Features:
 * - Skeleton loading screens
 * - Progress indicators
 * - Timeout handling
 * - Loading state management
 * - Smooth transitions
 */

import React from 'react';

// 🎨 Loading Skeleton Components
export const SkeletonLoader = ({ className = "", lines = 3, animated = true }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <div
        key={i}
        className={`h-4 bg-gray-200 rounded ${animated ? 'animate-pulse' : ''}`}
        style={{ width: `${100 - (i * 10)}%` }}
      />
    ))}
  </div>
);

export const CardSkeleton = ({ animated = true }) => (
  <div className={`border border-gray-200 rounded-lg p-4 ${animated ? 'animate-pulse' : ''}`}>
    <div className="flex space-x-4">
      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4, animated = true }) => (
  <div className={`space-y-2 ${animated ? 'animate-pulse' : ''}`}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }, (_, i) => (
        <div key={i} className="h-6 bg-gray-300 rounded"></div>
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowI) => (
      <div key={rowI} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, colI) => (
          <div key={colI} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    ))}
  </div>
);

// 🔄 Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colors = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    gray: 'border-gray-600'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-200 ${colors[color]} border-t-transparent ${sizes[size]}`}></div>
    </div>
  );
};

// 📊 Progress Bar Component
export const ProgressBar = ({ progress = 0, className = '', showLabel = true, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Loading...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colors[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};

// 🎯 Loading States Component
export const LoadingState = ({ 
  type = 'spinner', 
  message = 'Loading...', 
  progress = null,
  className = '',
  size = 'md'
}) => {
  const renderLoader = () => {
    switch (type) {
      case 'skeleton':
        return <SkeletonLoader lines={3} />;
      case 'card':
        return <CardSkeleton />;
      case 'table':
        return <TableSkeleton />;
      case 'progress':
        return <ProgressBar progress={progress} showLabel={true} />;
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        );
      default:
        return <LoadingSpinner size={size} />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      {renderLoader()}
      {message && (
        <p className="mt-4 text-sm text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
};

// 🖼️ Full Page Loading Component
export const FullPageLoader = ({ message = 'Loading MarketGenie...', progress = null }) => (
  <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
    <div className="text-center">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">MG</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">MarketGenie</h2>
      </div>

      {/* Loading Animation */}
      <div className="mb-6">
        {progress !== null ? (
          <ProgressBar progress={progress} className="w-64" />
        ) : (
          <LoadingSpinner size="lg" />
        )}
      </div>

      {/* Message */}
      <p className="text-sm text-gray-600 max-w-md">{message}</p>
    </div>
  </div>
);

// 🔧 Loading Hook for Components
export const useLoadingState = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState);
  const [progress, setProgress] = React.useState(0);
  const [message, setMessage] = React.useState('');

  const startLoading = (msg = 'Loading...') => {
    setLoading(true);
    setMessage(msg);
    setProgress(0);
  };

  const updateProgress = (newProgress, msg = null) => {
    setProgress(newProgress);
    if (msg) setMessage(msg);
  };

  const stopLoading = () => {
    setLoading(false);
    setProgress(100);
    setTimeout(() => {
      setProgress(0);
      setMessage('');
    }, 500);
  };

  return {
    loading,
    progress,
    message,
    startLoading,
    updateProgress,
    stopLoading,
    setMessage
  };
};

// 🎭 Loading Overlay Component
export const LoadingOverlay = ({ 
  show, 
  message = 'Loading...', 
  progress = null, 
  className = '' 
}) => {
  if (!show) return null;

  return (
    <div className={`absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-40 ${className}`}>
      <div className="text-center">
        {progress !== null ? (
          <ProgressBar progress={progress} className="w-48 mb-4" />
        ) : (
          <LoadingSpinner size="lg" className="mb-4" />
        )}
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// 🚀 Smart Loading Component with Timeout
export const SmartLoader = ({ 
  children, 
  loading, 
  error = null, 
  timeout = 30000,
  onTimeout = null,
  fallback = null 
}) => {
  const [hasTimedOut, setHasTimedOut] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      setHasTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setHasTimedOut(true);
      if (onTimeout) onTimeout();
    }, timeout);

    return () => clearTimeout(timer);
  }, [loading, timeout, onTimeout]);

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-2">⚠️ Error</div>
        <p className="text-sm text-gray-600">{error.message || 'Something went wrong'}</p>
      </div>
    );
  }

  if (hasTimedOut) {
    return (
      <div className="text-center p-8">
        <div className="text-yellow-500 mb-2">⏰ Timeout</div>
        <p className="text-sm text-gray-600">This is taking longer than expected...</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (loading) {
    return fallback || <LoadingState />;
  }

  return children;
};

export default {
  SkeletonLoader,
  CardSkeleton,
  TableSkeleton,
  LoadingSpinner,
  ProgressBar,
  LoadingState,
  FullPageLoader,
  LoadingOverlay,
  SmartLoader,
  useLoadingState
};