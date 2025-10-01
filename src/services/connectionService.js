import { db, retryFirebaseConnection } from '../firebase';
import { enableNetwork, disableNetwork } from 'firebase/firestore';

class ConnectionService {
  constructor() {
    this.isConnected = true;
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 1000; // Start with 1 second
    this.monitoring = false;
  }

  async initializeConnection() {
    console.log('Initializing Firebase connection service...');
    
    try {
      // Ensure network is enabled
      await enableNetwork(db);
      this.isConnected = true;
      console.log('Firebase connection initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Firebase connection:', error);
      this.isConnected = false;
      return false;
    }
  }

  async handleConnectionError(error) {
    console.error('Firebase connection error detected:', error);
    
    // Check if it's a CORS or network error
    if (this.isCORSError(error) || this.isNetworkError(error)) {
      console.log('Attempting to recover from connection error...');
      return await this.attemptRecovery();
    }
    
    return false;
  }

  isCORSError(error) {
    const errorMessage = error?.message?.toLowerCase() || '';
    return errorMessage.includes('cors') || 
           errorMessage.includes('cross-origin') ||
           errorMessage.includes('access-control-allow-origin');
  }

  isNetworkError(error) {
    const errorMessage = error?.message?.toLowerCase() || '';
    return errorMessage.includes('network') ||
           errorMessage.includes('fetch') ||
           errorMessage.includes('connection') ||
           errorMessage.includes('unavailable');
  }

  async attemptRecovery() {
    if (this.retryAttempts >= this.maxRetries) {
      console.log('Max retry attempts reached, switching to offline mode');
      this.isConnected = false;
      return false;
    }

    this.retryAttempts++;
    const delay = this.retryDelay * Math.pow(2, this.retryAttempts - 1); // Exponential backoff

    console.log(`Connection recovery attempt ${this.retryAttempts}/${this.maxRetries} in ${delay}ms`);

    try {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Try to reset the connection
      await disableNetwork(db);
      await new Promise(resolve => setTimeout(resolve, 500));
      await enableNetwork(db);
      
      this.isConnected = true;
      this.retryAttempts = 0; // Reset on success
      console.log('Firebase connection recovered successfully');
      return true;
      
    } catch (retryError) {
      console.error(`Recovery attempt ${this.retryAttempts} failed:`, retryError);
      
      // If this was the last attempt, try the legacy retry method
      if (this.retryAttempts >= this.maxRetries) {
        try {
          const legacyResult = await retryFirebaseConnection();
          if (legacyResult) {
            this.isConnected = true;
            this.retryAttempts = 0;
            console.log('Legacy connection recovery successful');
            return true;
          }
        } catch (legacyError) {
          console.error('Legacy recovery also failed:', legacyError);
        }
      }
      
      return false;
    }
  }

  async executeWithRetry(operation, context = 'Firebase operation') {
    if (!this.isConnected) {
      console.log('Connection not available, attempting to reconnect...');
      await this.attemptRecovery();
    }

    try {
      const result = await operation();
      // Reset retry count on successful operation
      this.retryAttempts = 0;
      return { success: true, data: result };
    } catch (error) {
      console.error(`${context} failed:`, error);
      
      const recovered = await this.handleConnectionError(error);
      if (recovered) {
        try {
          // Retry the operation after recovery
          const result = await operation();
          return { success: true, data: result };
        } catch (retryError) {
          console.error(`${context} failed again after recovery:`, retryError);
          return { success: false, error: retryError };
        }
      } else {
        return { success: false, error };
      }
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      retryAttempts: this.retryAttempts,
      maxRetries: this.maxRetries
    };
  }

  reset() {
    this.retryAttempts = 0;
    this.isConnected = true;
    console.log('Connection service reset');
  }
}

// Create singleton instance
const connectionService = new ConnectionService();

export default connectionService;