/**
 * 🛡️ PRODUCTION-GRADE ERROR BOUNDARY
 * 
 * Comprehensive error handling with recovery mechanisms,
 * user-friendly fallbacks, and automatic error reporting.
 * 
 * Features:
 * - Graceful error recovery
 * - User-friendly error messages
 * - Automatic retry mechanisms
 * - Error reporting to monitoring services
 * - Component-specific error handling
 */

import React, { Component } from 'react';
import { logger } from '../utils/ProductionLogger.js';

class ProductionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false
    };
    
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    logger.error('Component Error Boundary Triggered', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      hasError: true
    });

    // Report to monitoring service
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    // In production, report to error monitoring service
    if (import.meta.env.PROD) {
      try {
        // Could integrate with Sentry, LogRocket, etc.
        if (window.gtag) {
          window.gtag('event', 'exception', {
            description: error.message,
            fatal: false,
            custom_map: {
              component_stack: errorInfo.componentStack
            }
          });
        }
      } catch (e) {
        logger.error('Failed to report error to monitoring service', e);
      }
    }
  };

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({ 
        isRecovering: true,
        retryCount: this.state.retryCount + 1
      });

      // Wait a bit before retrying
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          isRecovering: false
        });
      }, this.retryDelay);

      logger.info(`Retrying component recovery (attempt ${this.state.retryCount + 1}/${this.maxRetries})`);
    }
  };

  handleReload = () => {
    logger.info('User requested page reload after error');
    window.location.reload();
  };

  getErrorSeverity = () => {
    const error = this.state.error;
    if (!error) return 'low';
    
    const criticalErrors = [
      'ChunkLoadError',
      'TypeError: Cannot read property',
      'Firebase',
      'Network Error'
    ];
    
    const errorMessage = error.message || error.toString();
    
    if (criticalErrors.some(critical => errorMessage.includes(critical))) {
      return 'high';
    }
    
    return 'medium';
  };

  getUserFriendlyMessage = () => {
    const severity = this.getErrorSeverity();
    const error = this.state.error;
    
    if (error?.message?.includes('ChunkLoadError')) {
      return {
        title: 'Loading Issue',
        message: 'There was a problem loading the application. This usually happens after an update.',
        suggestion: 'Please refresh the page to get the latest version.'
      };
    }
    
    if (error?.message?.includes('Firebase')) {
      return {
        title: 'Connection Issue',
        message: 'There was a problem connecting to our servers.',
        suggestion: 'Please check your internet connection and try again.'
      };
    }
    
    if (severity === 'high') {
      return {
        title: 'Something went wrong',
        message: 'We encountered an unexpected error that prevented the page from loading properly.',
        suggestion: 'Please refresh the page or contact support if the problem persists.'
      };
    }
    
    return {
      title: 'Minor Issue',
      message: 'We encountered a small hiccup, but you can continue using the application.',
      suggestion: 'You can try refreshing this section or continue with other features.'
    };
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.getUserFriendlyMessage();
      const severity = this.getErrorSeverity();
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                {severity === 'high' ? (
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              {/* Error Message */}
              <div className="text-center">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  {errorMessage.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {errorMessage.message}
                </p>
                <p className="text-xs text-gray-500 mb-6">
                  {errorMessage.suggestion}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {canRetry && !this.state.isRecovering && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                  </button>
                )}

                {this.state.isRecovering && (
                  <div className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Recovering...</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={this.handleReload}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Refresh Page
                </button>

                {this.props.fallbackComponent && (
                  <button
                    onClick={() => this.setState({ hasError: false })}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Continue Anyway
                  </button>
                )}
              </div>

              {/* Development Error Details */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mt-6 p-3 bg-red-50 rounded-md">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Development Error Details:
                  </h3>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap break-all">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 cursor-pointer">
                        Component Stack
                      </summary>
                      <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Contact Support */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  If this problem persists, please{' '}
                  <a 
                    href="mailto:support@marketgenie.app" 
                    className="text-blue-600 hover:text-blue-500"
                  >
                    contact support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProductionErrorBoundary;