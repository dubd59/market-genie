// Firebase Connection Health Check and Recovery System
import { doc, getDoc, writeBatch, Timestamp } from 'firebase/firestore';
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
      
      // Simple read test to check connection
      const testDoc = doc(db, 'system', 'health-check');
      const startTime = Date.now();
      
      // Set a 5-second timeout for the health check
      const healthPromise = getDoc(testDoc);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      );
      
      await Promise.race([healthPromise, timeoutPromise]);
      
      const responseTime = Date.now() - startTime;
      console.log(`✅ Firebase connection healthy (${responseTime}ms)`);
      
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
    // Check if we need a health check
    const needsCheck = !this.lastHealthCheck || 
                      Date.now() - this.lastHealthCheck > 30000 || // 30 seconds
                      !this.isHealthy;
    
    if (needsCheck) {
      const health = await this.checkFirebaseConnection();
      
      if (!health.healthy && this.connectionRetries < this.maxRetries) {
        console.log(`🔄 Connection unhealthy, attempting recovery (${this.connectionRetries}/${this.maxRetries})`);
        await this.attemptConnectionRecovery();
      }
    }
    
    return this.isHealthy;
  }

  async writeWithRecovery(writeOperation) {
    // Ensure connection is healthy first
    await this.ensureHealthyConnection();
    
    try {
      return await writeOperation();
    } catch (error) {
      // If write fails, check if it's a connection issue
      if (error.message.includes('transport') || 
          error.message.includes('network') ||
          error.message.includes('timeout')) {
        
        console.log('🚨 Write failed with connection error, attempting recovery...');
        
        const recovered = await this.attemptConnectionRecovery();
        
        if (recovered) {
          console.log('🔄 Retrying write after connection recovery...');
          return await writeOperation();
        }
      }
      
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

// Health monitoring
export function startHealthMonitoring() {
  console.log('🏥 Starting Firebase health monitoring...');
  
  // Check health every 60 seconds
  setInterval(() => {
    firebaseHealthChecker.checkFirebaseConnection();
  }, 60000);
}