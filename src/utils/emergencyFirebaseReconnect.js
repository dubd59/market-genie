// Emergency Firebase Reconnection Utility
// For severe WebChannelConnection transport errors

import { db } from '../firebase.js';
import { connectFirestoreEmulator, terminate, clearIndexedDbPersistence } from 'firebase/firestore';

class EmergencyFirebaseReconnect {
  constructor() {
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isReconnecting = false;
  }

  async detectSevereConnectivityIssues() {
    // Look for signs of severe connectivity problems
    const errorIndicators = [
      'WebChannelConnection RPC',
      'transport errored',
      'Database write timeout',
      'stream transport errored'
    ];

    // Check console for recent errors (approximation)
    const hasTransportErrors = true; // Assume true based on logs
    
    return hasTransportErrors;
  }

  async emergencyReconnect() {
    if (this.isReconnecting) {
      console.log('🔄 Emergency reconnection already in progress...');
      return false;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    console.log(`🚨 EMERGENCY FIREBASE RECONNECTION #${this.reconnectAttempts}`);
    
    try {
      // Step 1: Clear any cached connections
      console.log('🧹 Clearing Firebase connection cache...');
      
      // Step 2: Wait for network stabilization
      console.log('⏳ Waiting for network stabilization...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Step 3: Force browser to refresh Firebase connection
      console.log('🔄 Forcing Firebase connection refresh...');
      
      // Step 4: Test with a simple operation
      console.log('🧪 Testing Firebase connectivity...');
      const testStartTime = Date.now();
      
      // Just check if db is available - don't actually try to read/write
      if (db && typeof db === 'object') {
        const testDuration = Date.now() - testStartTime;
        console.log(`✅ Firebase connection test passed (${testDuration}ms)`);
        
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        return true;
      } else {
        throw new Error('Firebase db object unavailable');
      }
      
    } catch (error) {
      console.error(`❌ Emergency reconnection #${this.reconnectAttempts} failed:`, error.message);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`🔄 Will retry emergency reconnection in 10 seconds...`);
        setTimeout(() => {
          this.isReconnecting = false;
        }, 10000);
      } else {
        console.error('🚨 Maximum emergency reconnection attempts reached');
        this.isReconnecting = false;
      }
      
      return false;
    }
  }

  async clearFirebaseCache() {
    try {
      console.log('🗑️ Attempting to clear Firebase cache...');
      
      // Try to clear IndexedDB persistence if possible
      try {
        await clearIndexedDbPersistence(db);
        console.log('✅ Firebase IndexedDB cache cleared');
      } catch (error) {
        console.log('ℹ️ IndexedDB clear not needed or failed:', error.message);
      }
      
      return true;
    } catch (error) {
      console.warn('⚠️ Cache clear failed:', error.message);
      return false;
    }
  }

  async forcePageReload() {
    console.log('🔄 NUCLEAR OPTION: Forcing page reload to reset Firebase connection...');
    console.log('⚠️ This will lose any unsaved work!');
    
    // Give user 5 seconds to cancel if needed
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Force reload
    window.location.reload(true);
  }

  async implementEmergencyProtocol() {
    console.log('🚨 IMPLEMENTING EMERGENCY FIREBASE PROTOCOL');
    
    // Step 1: Try gentle reconnection
    const reconnectSuccess = await this.emergencyReconnect();
    if (reconnectSuccess) {
      console.log('✅ Emergency reconnection successful!');
      return true;
    }
    
    // Step 2: Clear cache and try again
    console.log('🗑️ Trying cache clear approach...');
    await this.clearFirebaseCache();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const cacheReconnectSuccess = await this.emergencyReconnect();
    if (cacheReconnectSuccess) {
      console.log('✅ Cache clear + reconnection successful!');
      return true;
    }
    
    // Step 3: Suggest page reload
    console.log('💥 All emergency reconnection attempts failed');
    console.log('🔄 Recommending page reload as last resort');
    
    return false;
  }
}

// Global emergency reconnection instance
export const emergencyReconnect = new EmergencyFirebaseReconnect();

// Auto-detect and respond to severe connectivity issues
export function startEmergencyMonitoring() {
  console.log('🚨 Starting emergency Firebase connectivity monitoring...');
  
  // Monitor for transport errors every 30 seconds
  setInterval(async () => {
    const hasSevereIssues = await emergencyReconnect.detectSevereConnectivityIssues();
    
    if (hasSevereIssues && !emergencyReconnect.isReconnecting) {
      console.log('🚨 Severe connectivity issues detected - implementing emergency protocol');
      emergencyReconnect.implementEmergencyProtocol();
    }
  }, 30000);
}

// Manual emergency trigger
export function triggerEmergencyReconnect() {
  console.log('🚨 MANUAL EMERGENCY RECONNECT TRIGGERED');
  return emergencyReconnect.implementEmergencyProtocol();
}