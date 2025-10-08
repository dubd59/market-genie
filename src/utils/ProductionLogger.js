/**
 * 🚀 PRODUCTION-GRADE LOGGING SERVICE
 * 
 * Provides intelligent logging with environment-aware output,
 * performance monitoring, and production-safe debugging.
 * 
 * Features:
 * - Environment-aware logging (dev vs production)
 * - Performance timing and monitoring
 * - Structured error reporting
 * - Log level management
 * - Production-safe debugging
 */

class ProductionLogger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
    this.logLevel = this.isDevelopment ? 'debug' : 'error';
    this.performanceTimers = new Map();
    this.errorCounts = new Map();
  }

  /**
   * 🔧 Development-only debug logging
   */
  debug(message, ...args) {
    if (this.isDevelopment) {
      console.log(`🔧 [DEBUG] ${message}`, ...args);
    }
  }

  /**
   * ℹ️ Informational logging (production-safe)
   */
  info(message, ...args) {
    if (this.isDevelopment) {
      console.log(`ℹ️ [INFO] ${message}`, ...args);
    } else {
      // In production, only log important info
      if (message.includes('ERROR') || message.includes('SECURITY') || message.includes('CRITICAL')) {
        console.log(`ℹ️ ${message}`);
      }
    }
  }

  /**
   * ⚠️ Warning logging (always shown)
   */
  warn(message, ...args) {
    console.warn(`⚠️ [WARN] ${message}`, ...args);
    this.trackError('warning', message);
  }

  /**
   * 🚨 Error logging (always shown)
   */
  error(message, error, ...args) {
    console.error(`🚨 [ERROR] ${message}`, error, ...args);
    this.trackError('error', message);
    
    // In production, send to monitoring service
    if (this.isProduction) {
      this.sendToMonitoring('error', message, error);
    }
  }

  /**
   * ✅ Success logging (development-aware)
   */
  success(message, ...args) {
    if (this.isDevelopment) {
      console.log(`✅ [SUCCESS] ${message}`, ...args);
    }
  }

  /**
   * 🛡️ Security logging (always shown)
   */
  security(message, ...args) {
    console.log(`🛡️ [SECURITY] ${message}`, ...args);
    
    // Always track security events
    this.trackError('security', message);
  }

  /**
   * ⏱️ Performance timing
   */
  startTimer(label) {
    this.performanceTimers.set(label, performance.now());
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  /**
   * ⏱️ End performance timing
   */
  endTimer(label) {
    const startTime = this.performanceTimers.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceTimers.delete(label);
      
      if (this.isDevelopment) {
        console.timeEnd(label);
        console.log(`⏱️ [PERF] ${label}: ${duration.toFixed(2)}ms`);
      }
      
      // Track slow operations in production
      if (duration > 1000) {
        this.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
  }

  /**
   * 📊 Track error frequency
   */
  trackError(type, message) {
    const key = `${type}:${message}`;
    const count = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, count + 1);
    
    // Alert on repeated errors
    if (count > 5) {
      this.warn(`Repeated ${type} detected: ${message} (${count + 1} times)`);
    }
  }

  /**
   * 📈 Get error statistics
   */
  getErrorStats() {
    const stats = {};
    for (const [key, count] of this.errorCounts.entries()) {
      const [type, message] = key.split(':');
      if (!stats[type]) stats[type] = [];
      stats[type].push({ message, count });
    }
    return stats;
  }

  /**
   * 🔍 Send to monitoring service (production)
   */
  sendToMonitoring(level, message, error) {
    // In a real production app, this would send to a service like Sentry, LogRocket, etc.
    try {
      // Simplified monitoring - could integrate with Firebase Analytics
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: message,
          fatal: level === 'error'
        });
      }
    } catch (e) {
      // Fail silently - don't break app for logging issues
    }
  }

  /**
   * 🧹 Clean up resources
   */
  cleanup() {
    this.performanceTimers.clear();
    
    // Keep only recent errors (last 100)
    if (this.errorCounts.size > 100) {
      const entries = Array.from(this.errorCounts.entries());
      const recent = entries.slice(-50);
      this.errorCounts.clear();
      recent.forEach(([key, count]) => this.errorCounts.set(key, count));
    }
  }

  /**
   * 📋 Generate health report
   */
  getHealthReport() {
    return {
      environment: this.isDevelopment ? 'development' : 'production',
      logLevel: this.logLevel,
      totalErrors: this.errorCounts.size,
      activeTimers: this.performanceTimers.size,
      errorStats: this.getErrorStats()
    };
  }
}

// 🌟 Global logger instance
export const logger = new ProductionLogger();

// 🧹 Cleanup every 5 minutes
setInterval(() => {
  logger.cleanup();
}, 5 * 60 * 1000);

// 🔒 Freeze to prevent tampering
Object.freeze(logger);

export default logger;