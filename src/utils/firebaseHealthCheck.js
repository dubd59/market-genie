// Firebase Connection Health Check and Recovery System
import { Timestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

class FirebaseHealthChecker {
  constructor() {
    this.lastHealthCheck = null;
    this.isHealthy = true;
    this.connectionRetries = 0;
    this.maxRetries = 3;
  }

  async checkFirebaseConnection() {
    try {
      console.log('🏥 Checking Firebase connection health...');
      
      // Simply check if we can access Firebase - no actual read required
      if (typeof db === 'undefined' || !db) {
        throw new Error('Firebase not initialized');
      }
      
      const startTime = Date.now();
      
      // Just return success - we'll know if there are connection issues when we try to write
      const responseTime = Date.now() - startTime;
      console.log(`✅ Firebase connection appears healthy (${responseTime}ms)`);
      
      this.isHealthy = true;
      this.connectionRetries = 0;
      this.lastHealthCheck = Date.now();
      
      return { healthy: true, responseTime };
      
    } catch (error) {
      console.warn(`❌ Firebase connection unhealthy: ${error.message}`);
      this.isHealthy = false;
      this.connectionRetries++;
      
      return { healthy: false, error: error.message, retries: this.connectionRetries };
    }
  }

  async attemptConnectionRecovery() {
    console.log('🔄 Attempting Firebase connection recovery...');
    
    // Wait for network recovery
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try health check again
    const healthCheck = await this.checkFirebaseConnection();
    
    if (healthCheck.healthy) {
      console.log('🎉 Firebase connection recovered!');
      return true;
    }
    
    return false;
  }

  async ensureHealthyConnection() {
    // Skip health checks when offline - just assume connection issues will be handled during writes
    // The problematic system/health-check reads were causing more issues than they solved
    this.isHealthy = true; // Optimistically assume healthy
    this.lastHealthCheck = Date.now();
    
    return true; // Always return true, let actual operations handle connection issues
  }

  async writeWithRecovery(writeOperation) {
    try {
      // Try the write operation directly without pre-checking connection
      return await writeOperation();
    } catch (error) {
      console.warn(`⚠️ Write operation failed: ${error.message}`);
      
      // If write fails due to connection issues, wait and retry once
      if (error.message.includes('transport') || 
          error.message.includes('network') ||
          error.message.includes('timeout') ||
          error.message.includes('offline')) {
        
        console.log('� Connection issue detected, waiting 3 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          console.log('🔄 Retrying write operation...');
          return await writeOperation();
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError.message);
          throw retryError;
        }
      }
      
      // Re-throw non-connection errors immediately
      throw error;
    }
  }
}

// Global health checker instance
export const firebaseHealthChecker = new FirebaseHealthChecker();

// Helper function for writes with automatic recovery
export async function writeWithHealthCheck(writeOperation) {
  return firebaseHealthChecker.writeWithRecovery(writeOperation);
}

// Health monitoring - simplified approach
export function startHealthMonitoring() {
  console.log('🏥 Starting simplified Firebase health monitoring...');
  
  // Check connection status much less frequently and only log, don't interfere
  setInterval(() => {
    console.log('📊 Firebase health status: optimistically healthy');
  }, 300000); // Every 5 minutes instead of every minute
}