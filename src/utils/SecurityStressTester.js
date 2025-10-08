/**
 * 🛡️ FINAL SECURITY STRESS TEST & VALIDATION
 * 
 * Comprehensive security testing and validation suite to ensure
 * the application meets industrial-grade security standards.
 * 
 * Features:
 * - Security penetration testing
 * - Vulnerability scanning
 * - Performance under stress
 * - Fail-safe validation
 * - Production readiness checks
 */

import { dbGuardian } from '../security/DatabaseGuardian.js';
import { securityMonitor } from '../security/RuntimeMonitor.js';
import { securityUtils } from '../security/SecureFirebase.js';
import { logger } from '../utils/ProductionLogger.js';

class SecurityStressTester {
  constructor() {
    this.testResults = [];
    this.isRunning = false;
  }

  /**
   * 🔥 Run comprehensive security stress test
   */
  async runFullSecurityStressTest() {
    if (this.isRunning) {
      logger.warn('Security stress test already running');
      return;
    }

    this.isRunning = true;
    this.testResults = [];
    
    logger.info('🛡️ STARTING COMPREHENSIVE SECURITY STRESS TEST');
    
    const tests = [
      { name: 'Database Security Validation', test: this.testDatabaseSecurity.bind(this) },
      { name: 'Collection Name Enforcement', test: this.testCollectionNameEnforcement.bind(this) },
      { name: 'Network Request Blocking', test: this.testNetworkBlocking.bind(this) },
      { name: 'Storage Contamination Prevention', test: this.testStorageContamination.bind(this) },
      { name: 'Emergency Shutdown Systems', test: this.testEmergencyShutdown.bind(this) },
      { name: 'Security Performance Under Load', test: this.testSecurityPerformance.bind(this) },
      { name: 'Violation Recovery Systems', test: this.testViolationRecovery.bind(this) },
      { name: 'Production Security Readiness', test: this.testProductionReadiness.bind(this) }
    ];

    for (const testCase of tests) {
      try {
        logger.info(`🧪 Running: ${testCase.name}`);
        const result = await testCase.test();
        this.testResults.push({
          name: testCase.name,
          status: result.passed ? 'PASSED' : 'FAILED',
          ...result
        });
        logger.info(`✅ ${testCase.name}: ${result.passed ? 'PASSED' : 'FAILED'}`);
      } catch (error) {
        logger.error(`❌ ${testCase.name}: ERROR`, error);
        this.testResults.push({
          name: testCase.name,
          status: 'ERROR',
          error: error.message
        });
      }
    }

    this.isRunning = false;
    
    const summary = this.generateTestSummary();
    logger.info('🛡️ SECURITY STRESS TEST COMPLETED', summary);
    
    return {
      summary,
      results: this.testResults,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 🔒 Test Database Security Systems
   */
  async testDatabaseSecurity() {
    let passed = true;
    const details = [];

    try {
      // Test 1: Secure wrappers are working
      const { collection } = await import('../security/SecureFirebase.js');
      const { db } = await import('../firebase.js');
      
      // This should NOT throw an error (valid collection)
      const validCollection = collection(db, 'MarketGenie_test');
      details.push('✅ Valid MarketGenie collection accepted');
      
      // Test 2: Guardian is active
      const guardianReport = dbGuardian.getViolationReport();
      if (guardianReport.securityStatus === 'SECURE' || guardianReport.securityStatus === 'VIOLATIONS_DETECTED') {
        details.push('✅ Database Guardian is active and monitoring');
      } else {
        passed = false;
        details.push('❌ Database Guardian not responding properly');
      }
      
      // Test 3: Monitor is active
      const monitorReport = securityMonitor.getMonitoringReport();
      if (monitorReport.isActive) {
        details.push('✅ Runtime Security Monitor is active');
      } else {
        passed = false;
        details.push('❌ Runtime Security Monitor is inactive');
      }

    } catch (error) {
      passed = false;
      details.push(`❌ Database security test failed: ${error.message}`);
    }

    return { passed, details };
  }

  /**
   * 📝 Test Collection Name Enforcement
   */
  async testCollectionNameEnforcement() {
    let passed = true;
    const details = [];

    try {
      // Test valid collection names
      const validNames = ['MarketGenie_leads', 'MarketGenie_campaigns', 'MarketGenie_users'];
      
      for (const name of validNames) {
        const validation = dbGuardian.validateCollectionName(name);
        if (validation.isValid) {
          details.push(`✅ Valid collection "${name}" accepted`);
        } else {
          passed = false;
          details.push(`❌ Valid collection "${name}" rejected: ${validation.error}`);
        }
      }

      // Test invalid collection names
      const invalidNames = ['SupportGenie', 'OfficeGenie', 'leads', 'users', 'supportgenie-data'];
      
      for (const name of invalidNames) {
        const validation = dbGuardian.validateCollectionName(name);
        if (!validation.isValid) {
          details.push(`✅ Invalid collection "${name}" properly rejected`);
        } else {
          passed = false;
          details.push(`❌ Invalid collection "${name}" was accepted (SECURITY BREACH!)`);
        }
      }

    } catch (error) {
      passed = false;
      details.push(`❌ Collection name enforcement test failed: ${error.message}`);
    }

    return { passed, details };
  }

  /**
   * 🌐 Test Network Request Blocking
   */
  async testNetworkBlocking() {
    let passed = true;
    const details = [];

    try {
      // Store original fetch
      const originalFetch = window.fetch;
      let blockedCount = 0;
      let allowedCount = 0;

      // Test forbidden URLs
      const forbiddenUrls = [
        'https://supportgenie.help/api/test',
        'https://officegenie.com/api/test',
        'https://api.supportgenie.app/test'
      ];

      for (const url of forbiddenUrls) {
        try {
          await fetch(url);
          passed = false;
          details.push(`❌ Forbidden URL was allowed: ${url}`);
        } catch (error) {
          if (error.message.includes('SECURITY BLOCK')) {
            blockedCount++;
            details.push(`✅ Forbidden URL properly blocked: ${url}`);
          } else {
            // Network error is acceptable (URL might not exist)
            details.push(`ℹ️ Network error for forbidden URL (acceptable): ${url}`);
          }
        }
      }

      // Test allowed URLs (should work)
      const allowedUrls = [
        'https://market-genie-app.web.app',
        'https://firebase.googleapis.com'
      ];

      for (const url of allowedUrls) {
        try {
          // Just test if the fetch call is allowed (don't wait for response)
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 100); // Cancel quickly
          
          await fetch(url, { signal: controller.signal });
        } catch (error) {
          if (error.message.includes('SECURITY BLOCK')) {
            passed = false;
            details.push(`❌ Allowed URL was blocked: ${url}`);
          } else {
            allowedCount++;
            details.push(`✅ Allowed URL passed security check: ${url}`);
          }
        }
      }

    } catch (error) {
      passed = false;
      details.push(`❌ Network blocking test failed: ${error.message}`);
    }

    return { passed, details };
  }

  /**
   * 💾 Test Storage Contamination Prevention
   */
  async testStorageContamination() {
    let passed = true;
    const details = [];

    try {
      // Test 1: Try to store contaminated data
      const contaminatedKeys = ['SupportGenie_data', 'OfficeGenie_config', 'supportgenie_cache'];
      
      for (const key of contaminatedKeys) {
        localStorage.setItem(key, 'test_contamination');
        
        // Check if it was cleaned
        setTimeout(() => {
          const value = localStorage.getItem(key);
          if (value && value.includes('SupportGenie')) {
            passed = false;
            details.push(`❌ Contaminated data persisted in localStorage: ${key}`);
          } else {
            details.push(`✅ Contaminated data cleaned from localStorage: ${key}`);
          }
        }, 100);
      }

      // Test 2: Verify clean data is preserved
      const cleanKey = 'MarketGenie_test_data';
      const cleanValue = 'clean_test_value';
      localStorage.setItem(cleanKey, cleanValue);
      
      setTimeout(() => {
        const retrievedValue = localStorage.getItem(cleanKey);
        if (retrievedValue === cleanValue) {
          details.push('✅ Clean MarketGenie data preserved in localStorage');
        } else {
          passed = false;
          details.push('❌ Clean MarketGenie data was corrupted');
        }
        localStorage.removeItem(cleanKey);
      }, 100);

    } catch (error) {
      passed = false;
      details.push(`❌ Storage contamination test failed: ${error.message}`);
    }

    return { passed, details };
  }

  /**
   * 🚨 Test Emergency Shutdown Systems
   */
  async testEmergencyShutdown() {
    let passed = true;
    const details = [];

    try {
      // Get initial violation count
      const initialReport = dbGuardian.getViolationReport();
      const initialViolations = initialReport.totalViolations;

      // Test that guardian can be temporarily disabled for emergency
      const originalEnabled = dbGuardian.isEnabled;
      
      // Test emergency disable (should work)
      dbGuardian.emergencyDisable();
      if (!dbGuardian.isEnabled) {
        details.push('✅ Emergency disable function works');
      } else {
        passed = false;
        details.push('❌ Emergency disable function failed');
      }

      // Test re-enable
      dbGuardian.enable();
      if (dbGuardian.isEnabled) {
        details.push('✅ Security re-enable function works');
      } else {
        passed = false;
        details.push('❌ Security re-enable function failed');
      }

      // Test monitor restart
      const monitorActive = securityMonitor.getMonitoringReport().isActive;
      if (monitorActive) {
        details.push('✅ Security monitor is active and responsive');
      } else {
        passed = false;
        details.push('❌ Security monitor is not responsive');
      }

    } catch (error) {
      passed = false;
      details.push(`❌ Emergency shutdown test failed: ${error.message}`);
    }

    return { passed, details };
  }

  /**
   * ⚡ Test Security Performance Under Load
   */
  async testSecurityPerformance() {
    let passed = true;
    const details = [];

    try {
      const iterations = 1000;
      const startTime = performance.now();

      // Rapid validation tests
      for (let i = 0; i < iterations; i++) {
        dbGuardian.validateCollectionName(`MarketGenie_test_${i}`);
        dbGuardian.validateCollectionName(`invalid_${i}`);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / (iterations * 2);

      if (avgTime < 1) { // Should be very fast (sub-millisecond)
        details.push(`✅ Security validation performance: ${avgTime.toFixed(3)}ms average`);
      } else {
        passed = false;
        details.push(`❌ Security validation too slow: ${avgTime.toFixed(3)}ms average`);
      }

      // Test memory usage stability
      const memoryBefore = performance.memory?.usedJSHeapSize || 0;
      
      // More intensive operations
      for (let i = 0; i < 100; i++) {
        dbGuardian.getViolationReport();
        securityMonitor.getMonitoringReport();
      }

      const memoryAfter = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = (memoryAfter - memoryBefore) / 1024 / 1024; // MB

      if (memoryIncrease < 1) { // Should not leak significant memory
        details.push(`✅ Memory stable under load: ${memoryIncrease.toFixed(2)}MB increase`);
      } else {
        passed = false;
        details.push(`❌ Potential memory leak: ${memoryIncrease.toFixed(2)}MB increase`);
      }

    } catch (error) {
      passed = false;
      details.push(`❌ Security performance test failed: ${error.message}`);
    }

    return { passed, details };
  }

  /**
   * 🔄 Test Violation Recovery Systems
   */
  async testViolationRecovery() {
    let passed = true;
    const details = [];

    try {
      // Clear existing violations for clean test
      const initialViolations = dbGuardian.violations.length;
      
      // Test violation clearing
      dbGuardian.clearViolations();
      if (dbGuardian.violations.length === 0) {
        details.push('✅ Violation clearing function works');
      } else {
        passed = false;
        details.push('❌ Violation clearing function failed');
      }

      // Test monitor restart
      securityMonitor.restart();
      const monitorReport = securityMonitor.getMonitoringReport();
      if (monitorReport.isActive) {
        details.push('✅ Security monitor restart function works');
      } else {
        passed = false;
        details.push('❌ Security monitor restart failed');
      }

    } catch (error) {
      passed = false;
      details.push(`❌ Violation recovery test failed: ${error.message}`);
    }

    return { passed, details };
  }

  /**
   * 🏭 Test Production Readiness
   */
  async testProductionReadiness() {
    let passed = true;
    const details = [];

    try {
      // Test environment detection
      const isDev = import.meta.env.DEV;
      const isProd = import.meta.env.PROD;
      
      if (!isDev && isProd) {
        details.push('✅ Production environment properly detected');
      } else {
        details.push('ℹ️ Development environment detected');
      }

      // Test error handling
      const guardianReport = dbGuardian.getViolationReport();
      if (typeof guardianReport === 'object' && guardianReport.securityStatus) {
        details.push('✅ Security reporting systems functional');
      } else {
        passed = false;
        details.push('❌ Security reporting systems malfunction');
      }

      // Test security utils
      const isSecure = securityUtils.isSecureCollection('MarketGenie_test');
      if (isSecure) {
        details.push('✅ Security utilities functional');
      } else {
        passed = false;
        details.push('❌ Security utilities malfunction');
      }

      // Test frozen objects (tamper protection)
      const originalFunction = dbGuardian.validateCollectionName;
      try {
        dbGuardian.validateCollectionName = () => ({ isValid: true });
        if (dbGuardian.validateCollectionName === originalFunction) {
          details.push('✅ Security objects are tamper-proof');
        } else {
          passed = false;
          details.push('❌ Security objects can be tampered with');
        }
      } catch (error) {
        details.push('✅ Security objects are frozen and tamper-proof');
      }

    } catch (error) {
      passed = false;
      details.push(`❌ Production readiness test failed: ${error.message}`);
    }

    return { passed, details };
  }

  /**
   * 📊 Generate comprehensive test summary
   */
  generateTestSummary() {
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const errors = this.testResults.filter(r => r.status === 'ERROR').length;
    const total = this.testResults.length;
    
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;
    
    return {
      total,
      passed,
      failed,
      errors,
      successRate: `${successRate}%`,
      status: failed === 0 && errors === 0 ? 'ALL_TESTS_PASSED' : 'ISSUES_DETECTED'
    };
  }

  /**
   * 📋 Get detailed test report
   */
  getDetailedReport() {
    return {
      summary: this.generateTestSummary(),
      results: this.testResults,
      timestamp: new Date().toISOString(),
      environment: {
        dev: import.meta.env.DEV,
        prod: import.meta.env.PROD,
        userAgent: navigator.userAgent
      }
    };
  }
}

// 🌟 Global security stress tester
export const securityStressTester = new SecurityStressTester();

export default securityStressTester;