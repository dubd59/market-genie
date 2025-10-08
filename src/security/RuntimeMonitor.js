/**
 * 🚨 RUNTIME SECURITY MONITOR
 * 
 * ACTIVE SURVEILLANCE FOR DATABASE OPERATIONS
 * 
 * This module provides real-time monitoring and enforcement of
 * MarketGenie database security policies. It actively watches
 * for violations and blocks unauthorized operations.
 * 
 * 🔍 MONITORING FEATURES:
 * - Real-time Firebase operation interception
 * - Network request monitoring for external API calls
 * - Console log analysis for security violations
 * - Automatic blocking of suspicious activities
 * - Emergency shutdown capabilities
 */

import { dbGuardian } from './DatabaseGuardian.js';

class RuntimeSecurityMonitor {
  constructor() {
    this.isActive = true;
    this.interceptedOperations = [];
    this.blockedOperations = [];
    this.networkRequests = [];
    
    this.initialize();
  }

  initialize() {
    console.log('🔍 RUNTIME SECURITY MONITOR ACTIVATED');
    
    // Monitor network requests
    this.interceptNetworkRequests();
    
    // Monitor Firebase operations
    this.monitorFirebaseOperations();
    
    // Monitor for forbidden URLs/domains
    this.monitorForbiddenDomains();
    
    // Set up periodic security sweeps
    this.setupSecuritySweeps();
  }

  /**
   * 🌐 Intercepts network requests to prevent cross-app communication
   */
  interceptNetworkRequests() {
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options = {}) => {
      const urlString = url.toString();
      
      // Log all network requests
      this.networkRequests.push({
        url: urlString,
        timestamp: new Date().toISOString(),
        method: options.method || 'GET'
      });
      
      // Check for forbidden domains/endpoints
      const forbiddenPatterns = [
        'supportgenie',
        'officegenie', 
        'support-genie',
        'office-genie'
      ];
      
      for (const pattern of forbiddenPatterns) {
        if (urlString.toLowerCase().includes(pattern)) {
          const violation = {
            type: 'FORBIDDEN_NETWORK_REQUEST',
            url: urlString,
            pattern: pattern,
            timestamp: new Date().toISOString(),
            blocked: true
          };
          
          this.blockedOperations.push(violation);
          dbGuardian.reportViolation('NETWORK_VIOLATION', urlString, `Blocked request to ${pattern}`);
          
          // BLOCK THE REQUEST
          throw new Error(`🚨 SECURITY BLOCK: Network request to forbidden domain: ${urlString}`);
        }
      }
      
      // Allow the request if no violations
      return originalFetch(url, options);
    };
  }

  /**
   * 🔥 Monitors Firebase operations for compliance
   */
  monitorFirebaseOperations() {
    // Override localStorage to catch Firebase persistence operations
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key.includes('firebase') || key.includes('firestore')) {
        // Check if the value contains forbidden references
        const forbiddenTerms = ['SupportGenie', 'OfficeGenie', 'supportgenie', 'officegenie'];
        
        for (const term of forbiddenTerms) {
          if (value.includes(term)) {
            dbGuardian.reportViolation('STORAGE_VIOLATION', key, `Found ${term} in localStorage`);
            // Clean the value
            value = value.replace(new RegExp(term, 'gi'), 'MarketGenie');
          }
        }
      }
      
      return originalSetItem.call(localStorage, key, value);
    };
  }

  /**
   * 🚫 Monitors for access to forbidden domains
   */
  monitorForbiddenDomains() {
    const forbiddenDomains = [
      'supportgenie.help',
      'officegenie.com',
      'support-genie.app',
      'office-genie.app'
    ];
    
    // Monitor window.location changes
    const originalReplaceState = history.replaceState;
    const originalPushState = history.pushState;
    
    history.replaceState = function(state, title, url) {
      if (url && forbiddenDomains.some(domain => url.includes(domain))) {
        dbGuardian.reportViolation('NAVIGATION_VIOLATION', url, 'Attempted navigation to forbidden domain');
        return; // Block the navigation
      }
      return originalReplaceState.apply(history, arguments);
    };
    
    history.pushState = function(state, title, url) {
      if (url && forbiddenDomains.some(domain => url.includes(domain))) {
        dbGuardian.reportViolation('NAVIGATION_VIOLATION', url, 'Attempted navigation to forbidden domain');
        return; // Block the navigation  
      }
      return originalPushState.apply(history, arguments);
    };
  }

  /**
   * 🔄 Sets up periodic security sweeps
   */
  setupSecuritySweeps() {
    // Sweep every 60 seconds
    setInterval(() => {
      this.performSecuritySweep();
    }, 60000);
    
    // Critical sweep every 10 seconds
    setInterval(() => {
      this.performCriticalSweep();
    }, 10000);
  }

  /**
   * 🧹 Performs comprehensive security sweep
   */
  performSecuritySweep() {
    if (!this.isActive) return;
    
    const violations = dbGuardian.getViolationReport();
    
    if (violations.totalViolations > 0) {
      console.warn(`🚨 Security Sweep: ${violations.totalViolations} violations detected`);
      
      // If too many violations, take emergency action
      if (violations.totalViolations > 10) {
        this.emergencyShutdown();
      }
    }
    
    // Check for suspicious localStorage data
    this.scanLocalStorage();
    
    // Check for suspicious network activity
    this.analyzeNetworkActivity();
  }

  /**
   * ⚡ Performs critical security checks
   */
  performCriticalSweep() {
    if (!this.isActive) return;
    
    // Check for immediate threats
    const recentViolations = dbGuardian.violations.filter(v => 
      new Date(v.timestamp) > new Date(Date.now() - 10000)
    );
    
    if (recentViolations.length > 3) {
      console.error('🚨 CRITICAL: Multiple recent security violations detected!');
      this.emergencyShutdown();
    }
  }

  /**
   * 🔍 Scans localStorage for security violations
   */
  scanLocalStorage() {
    const forbiddenTerms = ['SupportGenie', 'OfficeGenie', 'supportgenie', 'officegenie'];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      for (const term of forbiddenTerms) {
        if (value && value.includes(term)) {
          dbGuardian.reportViolation('STORAGE_CONTAMINATION', key, `Found ${term} in localStorage`);
          
          // Clean the contaminated data
          const cleanValue = value.replace(new RegExp(term, 'gi'), 'MarketGenie');
          localStorage.setItem(key, cleanValue);
          
          console.warn(`🧹 CLEANED: Removed ${term} from localStorage key: ${key}`);
        }
      }
    }
  }

  /**
   * 📊 Analyzes network activity for suspicious patterns
   */
  analyzeNetworkActivity() {
    const recentRequests = this.networkRequests.filter(req => 
      new Date(req.timestamp) > new Date(Date.now() - 300000) // Last 5 minutes
    );
    
    const suspiciousRequests = recentRequests.filter(req =>
      req.url.toLowerCase().includes('support') || 
      req.url.toLowerCase().includes('office')
    );
    
    if (suspiciousRequests.length > 0) {
      console.warn('🔍 Suspicious network activity detected:', suspiciousRequests);
    }
  }

  /**
   * 🚨 Emergency shutdown procedure
   */
  emergencyShutdown() {
    console.error('🚨 EMERGENCY SECURITY SHUTDOWN INITIATED');
    console.error('🔒 MULTIPLE SECURITY VIOLATIONS DETECTED');
    
    // Block all further operations
    this.isActive = false;
    
    // Clear potentially contaminated data
    this.clearContaminatedData();
    
    // Redirect to safe landing page
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    
    // Show security alert
    alert('🚨 SECURITY ALERT: Multiple database security violations detected. Application has been secured.');
  }

  /**
   * 🧹 Clears contaminated data
   */
  clearContaminatedData() {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      if (value && (value.includes('SupportGenie') || value.includes('OfficeGenie'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 Removed ${keysToRemove.length} contaminated localStorage entries`);
  }

  /**
   * 📊 Gets monitoring report
   */
  getMonitoringReport() {
    return {
      isActive: this.isActive,
      interceptedOperations: this.interceptedOperations.length,
      blockedOperations: this.blockedOperations.length,
      networkRequests: this.networkRequests.length,
      recentViolations: dbGuardian.violations.filter(v => 
        new Date(v.timestamp) > new Date(Date.now() - 3600000) // Last hour
      ).length
    };
  }

  /**
   * 🔄 Restart monitoring after emergency shutdown
   */
  restart() {
    this.isActive = true;
    console.log('🔄 RUNTIME SECURITY MONITOR RESTARTED');
  }
}

// 🌟 SINGLETON INSTANCE
export const securityMonitor = new RuntimeSecurityMonitor();

// 🔒 FREEZE TO PREVENT TAMPERING
Object.freeze(securityMonitor);

export default securityMonitor;