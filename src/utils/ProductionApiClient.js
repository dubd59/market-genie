/**
 * 🚀 PRODUCTION-GRADE API CLIENT
 * 
 * Robust HTTP client with comprehensive error handling,
 * retry logic, timeout management, and monitoring.
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Request/response interceptors
 * - Timeout handling
 * - Error classification and recovery
 * - Performance monitoring
 * - Rate limiting support
 * - Request deduplication
 */

import { logger } from '../utils/ProductionLogger.js';

class ProductionApiClient {
  constructor(options = {}) {
    this.baseURL = options.baseURL || '';
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.maxRetryDelay = options.maxRetryDelay || 10000;
    
    // Request tracking
    this.pendingRequests = new Map();
    this.requestStats = {
      total: 0,
      success: 0,
      errors: 0,
      retries: 0
    };
    
    // Rate limiting
    this.rateLimits = new Map();
    
    // Global headers
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'MarketGenie/1.0',
      ...options.headers
    };
  }

  /**
   * 🔧 Configure request with defaults
   */
  configureRequest(url, options = {}) {
    const config = {
      timeout: this.timeout,
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options
    };

    // Handle relative URLs
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    return { url: fullUrl, config };
  }

  /**
   * ⏱️ Create timeout promise
   */
  createTimeoutPromise(timeout, requestId) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * 🔄 Implement exponential backoff
   */
  calculateDelay(attempt) {
    const delay = this.retryDelay * Math.pow(2, attempt - 1);
    return Math.min(delay, this.maxRetryDelay);
  }

  /**
   * 🔍 Check if error is retryable
   */
  isRetryableError(error, response) {
    // Network errors are retryable
    if (!response) return true;
    
    // Server errors (5xx) are retryable
    if (response.status >= 500) return true;
    
    // Rate limiting (429) is retryable
    if (response.status === 429) return true;
    
    // Timeout errors are retryable
    if (error.message.includes('timeout')) return true;
    
    return false;
  }

  /**
   * 🎯 Rate limiting check
   */
  checkRateLimit(url) {
    const domain = new URL(url).hostname;
    const rateLimit = this.rateLimits.get(domain);
    
    if (rateLimit && Date.now() < rateLimit.resetTime) {
      const waitTime = rateLimit.resetTime - Date.now();
      throw new Error(`Rate limited. Wait ${Math.ceil(waitTime / 1000)}s before retrying.`);
    }
    
    return true;
  }

  /**
   * 📊 Update rate limit info
   */
  updateRateLimit(url, response) {
    if (response.status === 429) {
      const domain = new URL(url).hostname;
      const retryAfter = response.headers.get('Retry-After') || 60;
      const resetTime = Date.now() + (parseInt(retryAfter) * 1000);
      
      this.rateLimits.set(domain, { resetTime });
      logger.warn(`Rate limited by ${domain}, retry after ${retryAfter}s`);
    }
  }

  /**
   * 🚀 Main request method with retry logic
   */
  async request(url, options = {}) {
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const { url: fullUrl, config } = this.configureRequest(url, options);
    
    logger.startTimer(`api-request-${requestId}`);
    this.requestStats.total++;
    
    // Check for duplicate requests
    if (this.pendingRequests.has(fullUrl) && !options.allowDuplicate) {
      logger.debug(`Deduplicating request to ${fullUrl}`);
      return this.pendingRequests.get(fullUrl);
    }

    const requestPromise = this.executeRequestWithRetry(fullUrl, config, requestId);
    
    // Store pending request for deduplication
    this.pendingRequests.set(fullUrl, requestPromise);
    
    try {
      const result = await requestPromise;
      this.requestStats.success++;
      return result;
    } catch (error) {
      this.requestStats.errors++;
      throw error;
    } finally {
      this.pendingRequests.delete(fullUrl);
      logger.endTimer(`api-request-${requestId}`);
    }
  }

  /**
   * 🔄 Execute request with retry logic
   */
  async executeRequestWithRetry(url, config, requestId, attempt = 1) {
    try {
      // Check rate limiting
      this.checkRateLimit(url);
      
      logger.debug(`API Request (attempt ${attempt}): ${config.method || 'GET'} ${url}`);
      
      // Create fetch promise with timeout
      const fetchPromise = fetch(url, config);
      const timeoutPromise = this.createTimeoutPromise(config.timeout, requestId);
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Update rate limiting info
      this.updateRateLimit(url, response);
      
      // Handle HTTP errors
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.response = response;
        error.status = response.status;
        
        // Try to get error details from response
        try {
          const errorData = await response.text();
          error.data = errorData;
        } catch (e) {
          // Ignore parsing errors
        }
        
        throw error;
      }
      
      // Parse response based on content type
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      logger.success(`API Request successful: ${config.method || 'GET'} ${url}`);
      
      return {
        data,
        status: response.status,
        headers: response.headers,
        ok: response.ok
      };
      
    } catch (error) {
      logger.error(`API Request failed (attempt ${attempt}): ${config.method || 'GET'} ${url}`, error);
      
      // Check if we should retry
      if (attempt < this.retries && this.isRetryableError(error, error.response)) {
        this.requestStats.retries++;
        const delay = this.calculateDelay(attempt);
        
        logger.info(`Retrying request in ${delay}ms (attempt ${attempt + 1}/${this.retries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeRequestWithRetry(url, config, requestId, attempt + 1);
      }
      
      // Enhance error with request context
      error.url = url;
      error.method = config.method || 'GET';
      error.attempt = attempt;
      error.requestId = requestId;
      
      throw error;
    }
  }

  /**
   * 🔧 HTTP method shortcuts
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async patch(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  /**
   * 📊 Get performance statistics
   */
  getStats() {
    const successRate = this.requestStats.total > 0 
      ? ((this.requestStats.success / this.requestStats.total) * 100).toFixed(2)
      : 0;
      
    return {
      ...this.requestStats,
      successRate: `${successRate}%`,
      pendingRequests: this.pendingRequests.size,
      rateLimits: Array.from(this.rateLimits.entries())
    };
  }

  /**
   * 🧹 Clear cache and reset stats
   */
  reset() {
    this.pendingRequests.clear();
    this.rateLimits.clear();
    this.requestStats = {
      total: 0,
      success: 0,
      errors: 0,
      retries: 0
    };
    logger.info('API client reset completed');
  }

  /**
   * 🔒 Create secure headers for authentication
   */
  createAuthHeaders(token, type = 'Bearer') {
    return {
      'Authorization': `${type} ${token}`
    };
  }

  /**
   * 🛡️ Validate API response
   */
  validateResponse(response, schema = null) {
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    // Could add JSON schema validation here if needed
    if (schema && typeof schema.validate === 'function') {
      const validation = schema.validate(response.data);
      if (!validation.valid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }
    }
    
    return response;
  }
}

// 🌟 Default client instance
export const apiClient = new ProductionApiClient({
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'X-App': 'MarketGenie',
    'X-Version': '1.0.0'
  }
});

// 🔧 Specialized clients for different services
export const createSecureApiClient = (baseURL, options = {}) => {
  return new ProductionApiClient({
    baseURL,
    timeout: 30000,
    retries: 3,
    ...options
  });
};

// 🔒 Firebase Functions client
export const firebaseFunctionsClient = createSecureApiClient(
  'https://us-central1-genie-labs-81b9b.cloudfunctions.net',
  {
    headers: {
      'X-MarketGenie-App': 'true'
    }
  }
);

// 🌐 External APIs client (with lower retry count)
export const externalApiClient = createSecureApiClient('', {
  retries: 2,
  timeout: 20000
});

export default apiClient;