// Firebase Connection Stability Monitor
// This service ensures Firebase connections remain stable across development changes

import { db, auth } from '../firebase';
import { enableNetwork, disableNetwork, waitForPendingWrites, doc, setDoc } from 'firebase/firestore';
import connectionService from './connectionService';

class StabilityMonitor {
  constructor() {
    this.isMonitoring = false;
    this.healthCheckInterval = null;
    this.lastSuccessfulConnection = null;
    this.failureCount = 0;
    this.maxFailures = 3;
  }

  // Start continuous monitoring
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Starting Firebase stability monitoring...');
    
    // Health check every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);

    // Monitor auth state changes
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('🔐 Auth state changed - verifying connection...');
        this.performHealthCheck();
      }
    });

    // Monitor network status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Network back online - reconnecting...');
        this.handleNetworkReconnection();
      });

      window.addEventListener('offline', () => {
        console.log('🚫 Network offline detected');
        this.failureCount = 0; // Reset failure count when offline
      });
    }

    // Initial health check
    setTimeout(() => this.performHealthCheck(), 2000);
  }

  // Stop monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    console.log('⏹️ Firebase stability monitoring stopped');
  }

  // Perform health check
  async performHealthCheck() {
    if (!auth.currentUser) return;

    try {
      // Test a simple Firestore operation
      const testResult = await connectionService.executeWithRetry(
        () => this.testFirestoreConnection(),
        'Health check'
      );

      if (testResult.success) {
        this.lastSuccessfulConnection = new Date();
        this.failureCount = 0;
        console.log('✅ Firebase connection healthy');
      } else {
        this.handleConnectionFailure(testResult.error);
      }
    } catch (error) {
      this.handleConnectionFailure(error);
    }
  }

  // Test Firestore connection with a minimal operation
  async testFirestoreConnection() {
    // Simple test - just check if we can access the database
    const testDoc = doc(db, '_health', 'connection_test');
    await setDoc(testDoc, { 
      timestamp: new Date(),
      userId: auth.currentUser?.uid || 'anonymous'
    }, { merge: true });
    return true;
  }

  // Handle connection failures
  async handleConnectionFailure(error) {
    this.failureCount++;
    console.warn(`⚠️ Firebase connection issue detected (${this.failureCount}/${this.maxFailures}):`, error);

    if (this.failureCount >= this.maxFailures) {
      console.log('🔄 Attempting comprehensive connection recovery...');
      await this.performComprehensiveRecovery();
    }
  }

  // Comprehensive recovery procedure
  async performComprehensiveRecovery() {
    try {
      console.log('1️⃣ Waiting for pending writes...');
      await waitForPendingWrites(db);

      console.log('2️⃣ Disabling network...');
      await disableNetwork(db);

      console.log('3️⃣ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('4️⃣ Re-enabling network...');
      await enableNetwork(db);

      console.log('5️⃣ Testing connection...');
      const testResult = await this.testFirestoreConnection();
      
      if (testResult) {
        console.log('✅ Comprehensive recovery successful!');
        this.failureCount = 0;
        this.lastSuccessfulConnection = new Date();
      } else {
        console.error('❌ Comprehensive recovery failed');
      }
    } catch (error) {
      console.error('💥 Recovery procedure failed:', error);
    }
  }

  // Handle network reconnection
  async handleNetworkReconnection() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await enableNetwork(db);
    await this.performHealthCheck();
  }

  // Get monitoring status
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      lastSuccessfulConnection: this.lastSuccessfulConnection,
      failureCount: this.failureCount,
      connectionAge: this.lastSuccessfulConnection 
        ? Date.now() - this.lastSuccessfulConnection.getTime() 
        : null
    };
  }

  // Force connection refresh
  async forceRefresh() {
    console.log('🔄 Forcing Firebase connection refresh...');
    await this.performComprehensiveRecovery();
  }
}

// Create singleton instance
const stabilityMonitor = new StabilityMonitor();

export default stabilityMonitor;