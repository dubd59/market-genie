/**
 * Enhanced Firebase Error Handler
 * Manages and recovers from common Firebase connection issues
 */

export class FirebaseErrorHandler {
  constructor() {
    this.errorCounts = {};
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.setupGlobalErrorHandler();
  }

  setupGlobalErrorHandler() {
    // Catch Firebase-specific errors
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isFirebaseError(event.reason)) {
        console.warn('🔧 Handling Firebase error:', event.reason);
        this.handleFirebaseError(event.reason);
        event.preventDefault(); // Prevent console spam
      }
    });

    // Catch network errors
    window.addEventListener('error', (event) => {
      if (this.isNetworkError(event)) {
        console.warn('🌐 Handling network error:', event.message);
        this.handleNetworkError(event);
        event.preventDefault();
      }
    });
  }

  isFirebaseError(error) {
    if (!error) return false;
    const errorMessage = error.message || error.toString();
    return errorMessage.includes('firestore') || 
           errorMessage.includes('firebase') ||
           error.code?.startsWith('firestore/') ||
           error.code?.startsWith('auth/');
  }

  isNetworkError(error) {
    if (!error) return false;
    const errorMessage = error.message || error.toString();
    return errorMessage.includes('net::ERR_FAILED') ||
           errorMessage.includes('fetch') ||
           errorMessage.includes('CORS') ||
           errorMessage.includes('Failed to load resource');
  }

  handleFirebaseError(error) {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case 'OFFLINE':
        this.handleOfflineError(error);
        break;
      case 'QUOTA_EXCEEDED':
        this.handleQuotaError(error);
        break;
      case 'PERMISSION_DENIED':
        this.handlePermissionError(error);
        break;
      case 'UNAVAILABLE':
        this.handleUnavailableError(error);
        break;
      default:
        console.warn('🔍 Unknown Firebase error:', error);
    }
  }

  handleNetworkError(error) {
    // For network errors, we just log them and let Firebase handle offline mode
    console.log('🌐 Network issue detected - Firebase will handle offline mode');
  }

  getErrorType(error) {
    const code = error.code || '';
    const message = error.message || '';

    if (code.includes('offline') || message.includes('offline')) return 'OFFLINE';
    if (code.includes('quota') || message.includes('quota')) return 'QUOTA_EXCEEDED';
    if (code.includes('permission') || message.includes('permission')) return 'PERMISSION_DENIED';
    if (code.includes('unavailable') || message.includes('unavailable')) return 'UNAVAILABLE';
    
    return 'UNKNOWN';
  }

  handleOfflineError(error) {
    console.log('📱 Offline mode detected - using cached data');
    // Firebase handles offline automatically, no action needed
  }

  handleQuotaError(error) {
    console.warn('💰 Firebase quota exceeded - check billing');
    // Could notify user about quota limits
  }

  handlePermissionError(error) {
    console.error('🔒 Permission denied - check security rules');
    // Could redirect to login or show permission error
  }

  handleUnavailableError(error) {
    console.log('🔄 Firebase temporarily unavailable - retrying...');
    // Firebase will retry automatically
  }
}

// Create global instance
export const firebaseErrorHandler = new FirebaseErrorHandler();

console.log('🛡️ Firebase error handler initialized');