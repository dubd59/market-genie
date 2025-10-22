import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console (and potentially to error reporting service)
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">🧞‍♂️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              The genie encountered an unexpected issue. Don't worry, your data is safe!
            </p>
            <button
              onClick={() => {
                console.log('🔄 Restarting Market Genie...');
                this.setState({ hasError: false, error: null, errorInfo: null });
                // Force a page reload to reset the app state
                window.location.reload();
              }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105"
            >
              🔄 Restart Market Genie
            </button>
            
            {/* Debug info (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  Technical Details (Dev Mode)
                </summary>
                <div className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  <div className="font-bold text-red-600">Error:</div>
                  <pre className="whitespace-pre-wrap">{this.state.error.toString()}</pre>
                  
                  <div className="font-bold text-red-600 mt-2">Stack Trace:</div>
                  <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;