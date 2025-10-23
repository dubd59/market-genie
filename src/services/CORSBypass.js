// CORSBypass.js - Emergency fallback for Firebase CORS issues
class CORSBypass {
  constructor() {
    this.corsDetected = false;
    this.offlineMode = false;
    this.initializeDetection();
  }

  initializeDetection() {
    // Monitor for CORS errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        return response;
      } catch (error) {
        if (error.message.includes('CORS') || 
            error.message.includes('Access-Control-Allow-Origin') ||
            args[0]?.includes('firestore.googleapis.com')) {
          console.log('🛡️ CORS detected on Firebase request - activating bypass');
          this.corsDetected = true;
          this.activateOfflineMode();
        }
        throw error;
      }
    };
  }

  activateOfflineMode() {
    if (this.offlineMode) return;
    
    this.offlineMode = true;
    console.log('🔄 Activating Firebase offline-first mode');
    
    // Force Firebase to work in offline mode with cached data
    window.firebaseOfflineMode = true;
    
    // Dispatch custom event to inform components
    window.dispatchEvent(new CustomEvent('firebase-cors-bypass', {
      detail: { offlineMode: true, corsDetected: true }
    }));
  }

  isOfflineMode() {
    return this.offlineMode;
  }

  isCORSDetected() {
    return this.corsDetected;
  }

  // Fallback for tenant loading when CORS blocks Firebase
  async loadTenantFallback(userId, email) {
    console.log('🚨 Using CORS fallback for tenant loading');
    
    // Return a basic tenant structure with founder privileges
    return {
      id: `offline-${userId}`,
      ownerId: userId,
      ownerEmail: email,
      name: 'MarketGenie Workspace (Offline Mode)',
      plan: 'founder',
      createdAt: new Date(),
      isOfflineMode: true,
      // Essential settings for WhiteLabel access
      settings: {
        whiteLabel: true,
        multiTenant: true
      }
    };
  }

  // Simple key-value storage for offline data
  setOfflineData(key, data) {
    try {
      localStorage.setItem(`marketgenie_offline_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Offline storage failed:', error);
    }
  }

  getOfflineData(key) {
    try {
      const data = localStorage.getItem(`marketgenie_offline_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Offline retrieval failed:', error);
      return null;
    }
  }
}

// Export singleton instance
export const corsBypass = new CORSBypass();
export default corsBypass;