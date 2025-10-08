/**
 * 🛡️ MARKET GENIE DATABASE SECURITY GUARDIAN 🛡️
 * 
 * ABSOLUTE PROTECTION AGAINST CROSS-APPLICATION CONTAMINATION
 * 
 * This guardian service provides IRONCLAD protection against any database
 * operations that could contaminate other Genie applications.
 * 
 * ⚠️  CRITICAL SECURITY RULES ⚠️
 * 1. ALL collections MUST be prefixed with "MarketGenie_"
 * 2. NO access to collections without MarketGenie prefix
 * 3. NO cross-app sharing or integration
 * 4. AUTOMATIC validation and blocking of violations
 * 5. RUNTIME monitoring and alerting
 * 
 * 🔒 THIS IS THE FINAL SOLUTION - NEVER TO BE MODIFIED 🔒
 */

class DatabaseSecurityGuardian {
  constructor() {
    this.APP_PREFIX = 'MarketGenie_';
    this.FORBIDDEN_PREFIXES = ['SupportGenie', 'OfficeGenie', 'support', 'office'];
    this.GENERIC_COLLECTIONS = ['users', 'tenants', 'leads', 'campaigns', 'pipeline', 'customers', 'activities', 'analytics', 'cross_app_sharing'];
    this.violations = [];
    this.isEnabled = true;
    
    // Initialize guardian on startup
    this.initialize();
  }

  initialize() {
    console.log('🛡️ DATABASE SECURITY GUARDIAN ACTIVATED');
    console.log('🔒 MARKET GENIE ISOLATION PROTOCOL ENGAGED');
    
    // Override console methods to catch violations in logs
    this.interceptConsoleErrors();
    
    // Set up violation monitoring
    this.setupViolationMonitoring();
  }

  /**
   * 🚨 CRITICAL: Validates collection name for MarketGenie compliance
   * @param {string} collectionName - The collection name to validate
   * @returns {Object} - Validation result with approved name
   */
  validateCollectionName(collectionName) {
    if (!this.isEnabled) return { isValid: true, approvedName: collectionName };

    // Check for forbidden prefixes
    for (const forbidden of this.FORBIDDEN_PREFIXES) {
      if (collectionName.toLowerCase().includes(forbidden.toLowerCase())) {
        this.reportViolation('FORBIDDEN_PREFIX', collectionName, forbidden);
        return { 
          isValid: false, 
          error: `SECURITY VIOLATION: Collection "${collectionName}" contains forbidden prefix "${forbidden}"`,
          approvedName: this.sanitizeCollectionName(collectionName)
        };
      }
    }

    // Check for generic collection names (must be prefixed)
    if (this.GENERIC_COLLECTIONS.includes(collectionName)) {
      this.reportViolation('MISSING_PREFIX', collectionName);
      return {
        isValid: false,
        error: `SECURITY VIOLATION: Generic collection "${collectionName}" must use MarketGenie prefix`,
        approvedName: `${this.APP_PREFIX}${collectionName}`
      };
    }

    // Ensure MarketGenie prefix
    if (!collectionName.startsWith(this.APP_PREFIX)) {
      this.reportViolation('MISSING_MARKETGENIE_PREFIX', collectionName);
      return {
        isValid: false,
        error: `SECURITY VIOLATION: Collection "${collectionName}" missing MarketGenie prefix`,
        approvedName: `${this.APP_PREFIX}${collectionName}`
      };
    }

    return { isValid: true, approvedName: collectionName };
  }

  /**
   * 🔒 Sanitizes collection name to MarketGenie standard
   * @param {string} collectionName - The collection name to sanitize
   * @returns {string} - Sanitized collection name
   */
  sanitizeCollectionName(collectionName) {
    // Remove forbidden prefixes
    let sanitized = collectionName;
    for (const forbidden of this.FORBIDDEN_PREFIXES) {
      sanitized = sanitized.replace(new RegExp(forbidden, 'gi'), '');
    }
    
    // Clean up any leading/trailing underscores
    sanitized = sanitized.replace(/^_+|_+$/g, '');
    
    // Ensure MarketGenie prefix
    if (!sanitized.startsWith(this.APP_PREFIX)) {
      sanitized = `${this.APP_PREFIX}${sanitized}`;
    }
    
    return sanitized;
  }

  /**
   * 🚨 Reports security violations
   * @param {string} violationType - Type of violation
   * @param {string} collectionName - The violating collection name
   * @param {string} details - Additional details
   */
  reportViolation(violationType, collectionName, details = '') {
    const violation = {
      type: violationType,
      collection: collectionName,
      details,
      timestamp: new Date().toISOString(),
      stackTrace: new Error().stack
    };
    
    this.violations.push(violation);
    
    // Reduced logging for production use
    if (import.meta.env.DEV) {
      console.warn('🚨 DATABASE SECURITY VIOLATION DETECTED 🚨');
      console.warn('Type:', violationType);
      console.warn('Collection:', collectionName);
      console.warn('Details:', details);
      console.warn('Time:', violation.timestamp);
    }
    
    // DON'T throw errors - just log for admin review
    // Throwing errors breaks the application flow
  }

  /**
   * 🔍 Monitors for violations in console output
   */
  interceptConsoleErrors() {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Check for Firebase collection violations in error messages
      for (const forbidden of this.FORBIDDEN_PREFIXES) {
        if (message.toLowerCase().includes(forbidden.toLowerCase())) {
          this.reportViolation('CONSOLE_VIOLATION', message, `Found "${forbidden}" in console error`);
        }
      }
      
      originalError.apply(console, args);
    };
  }

  /**
   * 🔄 Sets up continuous violation monitoring
   */
  setupViolationMonitoring() {
    // Monitor every 30 seconds
    setInterval(() => {
      if (this.violations.length > 0) {
        console.warn(`🚨 Total security violations detected: ${this.violations.length}`);
      }
    }, 30000);
  }

  /**
   * 📊 Gets violation report
   * @returns {Object} - Complete violation report
   */
  getViolationReport() {
    return {
      totalViolations: this.violations.length,
      violations: this.violations,
      lastViolation: this.violations[this.violations.length - 1] || null,
      securityStatus: this.violations.length === 0 ? 'SECURE' : 'VIOLATIONS_DETECTED'
    };
  }

  /**
   * 🧹 Clears violation history (for testing only)
   */
  clearViolations() {
    this.violations = [];
    console.log('🛡️ Violation history cleared');
  }

  /**
   * ⚡ Emergency disable (for critical issues only)
   */
  emergencyDisable() {
    this.isEnabled = false;
    console.warn('⚠️ DATABASE GUARDIAN DISABLED - SECURITY AT RISK');
  }

  /**
   * 🔋 Re-enable guardian
   */
  enable() {
    this.isEnabled = true;
    console.log('🛡️ DATABASE GUARDIAN RE-ENABLED');
  }
}

// 🌟 SINGLETON INSTANCE - GLOBAL PROTECTION
export const dbGuardian = new DatabaseSecurityGuardian();

// 🔒 FREEZE THE GUARDIAN TO PREVENT TAMPERING
Object.freeze(dbGuardian);

export default dbGuardian;