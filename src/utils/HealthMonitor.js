/**
 * 🏥 APPLICATION HEALTH MONITOR
 * 
 * Comprehensive system health monitoring with automated checks,
 * performance metrics, and service status validation.
 * 
 * Features:
 * - Real-time health status monitoring
 * - Performance metrics collection
 * - Service dependency checking
 * - Automated diagnostics
 * - Health reporting dashboard
 */

import { logger } from '../utils/ProductionLogger.js';
import { apiClient } from '../utils/ProductionApiClient.js';
import { dbGuardian } from '../security/DatabaseGuardian.js';
import { securityMonitor } from '../security/RuntimeMonitor.js';
import { db, auth } from '../firebase.js';

class ApplicationHealthMonitor {
  constructor() {
    this.healthChecks = new Map();
    this.metrics = {
      performance: {},
      services: {},
      security: {},
      firebase: {},
      system: {}
    };
    this.isRunning = false;
    this.checkInterval = 30000; // 30 seconds
    this.lastHealthCheck = null;
    
    this.initializeHealthChecks();
  }

  /**
   * 🔧 Initialize all health check functions
   */
  initializeHealthChecks() {
    this.healthChecks.set('firebase-auth', this.checkFirebaseAuth.bind(this));
    this.healthChecks.set('firebase-firestore', this.checkFirebaseFirestore.bind(this));
    this.healthChecks.set('security-system', this.checkSecuritySystem.bind(this));
    this.healthChecks.set('api-client', this.checkApiClient.bind(this));
    this.healthChecks.set('local-storage', this.checkLocalStorage.bind(this));
    this.healthChecks.set('network-connectivity', this.checkNetworkConnectivity.bind(this));
    this.healthChecks.set('performance-metrics', this.checkPerformanceMetrics.bind(this));
    this.healthChecks.set('memory-usage', this.checkMemoryUsage.bind(this));
  }

  /**
   * 🔥 Check Firebase Authentication health
   */
  async checkFirebaseAuth() {
    try {
      const startTime = performance.now();
      
      // Check if auth is initialized
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      // Test auth state (this is a quick check)
      const currentUser = auth.currentUser;
      const responseTime = performance.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime: responseTime.toFixed(2),
        details: {
          initialized: true,
          userAuthenticated: !!currentUser,
          userId: currentUser?.uid || null
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: { initialized: false }
      };
    }
  }

  /**
   * 📊 Check Firebase Firestore health
   */
  async checkFirebaseFirestore() {
    try {
      const startTime = performance.now();
      
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      // Test a simple read operation
      const { doc, getDoc } = await import('../security/SecureFirebase.js');
      const testDoc = doc(db, '_health', 'connection_test');
      
      await getDoc(testDoc);
      const responseTime = performance.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime: responseTime.toFixed(2),
        details: {
          initialized: true,
          connected: true
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: { 
          initialized: !!db,
          connected: false 
        }
      };
    }
  }

  /**
   * 🛡️ Check Security System health
   */
  async checkSecuritySystem() {
    try {
      const guardianReport = dbGuardian.getViolationReport();
      const monitorReport = securityMonitor.getMonitoringReport();
      
      const hasViolations = guardianReport.totalViolations > 0;
      const isMonitorActive = monitorReport.isActive;
      
      const status = hasViolations ? 'warning' : (isMonitorActive ? 'healthy' : 'unhealthy');
      
      return {
        status,
        details: {
          violations: guardianReport.totalViolations,
          securityStatus: guardianReport.securityStatus,
          monitorActive: isMonitorActive,
          blockedOperations: monitorReport.blockedOperations
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * 🌐 Check API Client health
   */
  async checkApiClient() {
    try {
      const stats = apiClient.getStats();
      const successRate = parseFloat(stats.successRate);
      
      const status = successRate >= 95 ? 'healthy' : 
                    successRate >= 80 ? 'warning' : 'unhealthy';
      
      return {
        status,
        details: {
          successRate: stats.successRate,
          totalRequests: stats.total,
          pendingRequests: stats.pendingRequests,
          errors: stats.errors
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * 💾 Check Local Storage health
   */
  async checkLocalStorage() {
    try {
      const testKey = '_health_check';
      const testValue = Date.now().toString();
      
      // Test write
      localStorage.setItem(testKey, testValue);
      
      // Test read
      const retrieved = localStorage.getItem(testKey);
      
      // Clean up
      localStorage.removeItem(testKey);
      
      if (retrieved !== testValue) {
        throw new Error('LocalStorage read/write mismatch');
      }
      
      // Check storage usage
      const storageInfo = this.getStorageInfo();
      
      return {
        status: 'healthy',
        details: {
          available: true,
          usage: storageInfo
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: { available: false }
      };
    }
  }

  /**
   * 🌐 Check Network Connectivity
   */
  async checkNetworkConnectivity() {
    try {
      const startTime = performance.now();
      
      // Test basic connectivity with a lightweight request
      const response = await fetch('https://api.github.com/zen', {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = performance.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`Network test failed: ${response.status}`);
      }
      
      return {
        status: 'healthy',
        responseTime: responseTime.toFixed(2),
        details: {
          online: navigator.onLine,
          connectionType: navigator.connection?.effectiveType || 'unknown'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: {
          online: navigator.onLine,
          connectionType: navigator.connection?.effectiveType || 'unknown'
        }
      };
    }
  }

  /**
   * ⚡ Check Performance Metrics
   */
  async checkPerformanceMetrics() {
    try {
      const performance = window.performance;
      const navigation = performance.getEntriesByType('navigation')[0];
      
      const metrics = {
        loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        memoryUsage: performance.memory ? {
          used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
          total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
          limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
        } : null
      };
      
      const loadTime = parseFloat(metrics.loadTime);
      const status = loadTime < 3000 ? 'healthy' : 
                    loadTime < 5000 ? 'warning' : 'unhealthy';
      
      return {
        status,
        details: metrics
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * 🧠 Check Memory Usage
   */
  async checkMemoryUsage() {
    try {
      if (!performance.memory) {
        return {
          status: 'unknown',
          details: { message: 'Memory API not available' }
        };
      }
      
      const memory = performance.memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
      const usagePercent = (usedMB / limitMB) * 100;
      
      const status = usagePercent < 70 ? 'healthy' : 
                    usagePercent < 85 ? 'warning' : 'unhealthy';
      
      return {
        status,
        details: {
          used: usedMB.toFixed(2),
          limit: limitMB.toFixed(2),
          percentage: usagePercent.toFixed(2)
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * 📊 Get localStorage usage info
   */
  getStorageInfo() {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      
      return {
        itemCount: localStorage.length,
        sizeKB: (totalSize / 1024).toFixed(2)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * 🏥 Run all health checks
   */
  async runHealthChecks() {
    const results = {};
    const startTime = performance.now();
    
    logger.debug('Starting comprehensive health check...');
    
    // Run all health checks in parallel
    const checkPromises = Array.from(this.healthChecks.entries()).map(
      async ([name, checkFunction]) => {
        try {
          const result = await checkFunction();
          results[name] = result;
        } catch (error) {
          results[name] = {
            status: 'unhealthy',
            error: error.message
          };
        }
      }
    );
    
    await Promise.all(checkPromises);
    
    const totalTime = performance.now() - startTime;
    this.lastHealthCheck = new Date().toISOString();
    
    // Calculate overall health status
    const statuses = Object.values(results).map(r => r.status);
    const overallStatus = statuses.includes('unhealthy') ? 'unhealthy' :
                         statuses.includes('warning') ? 'warning' : 'healthy';
    
    const healthReport = {
      overall: {
        status: overallStatus,
        checkTime: totalTime.toFixed(2),
        timestamp: this.lastHealthCheck
      },
      checks: results,
      summary: {
        healthy: statuses.filter(s => s === 'healthy').length,
        warning: statuses.filter(s => s === 'warning').length,
        unhealthy: statuses.filter(s => s === 'unhealthy').length,
        unknown: statuses.filter(s => s === 'unknown').length,
        total: statuses.length
      }
    };
    
    logger.info(`Health check completed in ${totalTime.toFixed(2)}ms - Status: ${overallStatus}`);
    
    return healthReport;
  }

  /**
   * 🚀 Start continuous health monitoring
   */
  startMonitoring() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    logger.info('Starting continuous health monitoring...');
    
    // Run initial check
    this.runHealthChecks();
    
    // Set up interval
    this.monitoringInterval = setInterval(() => {
      this.runHealthChecks().catch(error => {
        logger.error('Health monitoring error:', error);
      });
    }, this.checkInterval);
  }

  /**
   * ⏹️ Stop health monitoring
   */
  stopMonitoring() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    logger.info('Health monitoring stopped');
  }

  /**
   * 📊 Get current health status
   */
  async getCurrentHealth() {
    return await this.runHealthChecks();
  }

  /**
   * 🎯 Get health summary for dashboard
   */
  getHealthSummary() {
    return {
      isMonitoring: this.isRunning,
      lastCheck: this.lastHealthCheck,
      checkInterval: this.checkInterval,
      checksCount: this.healthChecks.size
    };
  }
}

// 🌟 Global health monitor instance
export const healthMonitor = new ApplicationHealthMonitor();

// 🚀 Auto-start monitoring in production
if (import.meta.env.PROD) {
  healthMonitor.startMonitoring();
}

export default healthMonitor;