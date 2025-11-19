/**
 * Retry Manager for handling Firebase WebChannelConnection errors
 * Implements exponential backoff with jitter for robust network error handling
 */

class RetryManager {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 5;
    this.baseDelay = options.baseDelay || 1000; // 1 second
    this.maxDelay = options.maxDelay || 30000; // 30 seconds
    this.jitter = options.jitter || 0.1; // 10% jitter
  }

  /**
   * Execute operation with exponential backoff retry
   */
  async executeWithRetry(operation, context = '') {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Retry attempt ${attempt + 1}/${this.maxRetries + 1} for ${context}`);
        
        const result = await operation();
        
        if (attempt > 0) {
          console.log(`✅ Operation succeeded on attempt ${attempt + 1} for ${context}`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        console.error(`❌ Attempt ${attempt + 1} failed for ${context}:`, error.message);
        
        // Don't retry on final attempt
        if (attempt === this.maxRetries) {
          break;
        }
        
        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          console.log(`🚫 Non-retryable error for ${context}, stopping retries`);
          break;
        }
        
        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(attempt);
        console.log(`⏱️  Waiting ${delay}ms before retry ${attempt + 2} for ${context}`);
        
        await this.sleep(delay);
      }
    }
    
    console.error(`💥 All retry attempts failed for ${context}`);
    throw lastError;
  }

  /**
   * Check if error is retryable (network/transport errors)
   */
  isRetryableError(error) {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';
    
    // Retryable Firebase errors
    const retryableErrors = [
      'transport errored',
      'webchannelconnection',
      'network error',
      'unavailable',
      'deadline-exceeded',
      'resource-exhausted',
      'aborted',
      'internal',
      'failed to fetch',
      'fetch error',
      'connection timeout',
      'network timeout'
    ];
    
    return retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError) || errorCode.includes(retryableError)
    );
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  calculateDelay(attempt) {
    // Exponential backoff: baseDelay * 2^attempt
    let delay = this.baseDelay * Math.pow(2, attempt);
    
    // Apply maximum delay cap
    delay = Math.min(delay, this.maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitterAmount = delay * this.jitter;
    const jitterOffset = (Math.random() - 0.5) * 2 * jitterAmount;
    
    return Math.max(0, Math.floor(delay + jitterOffset));
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Batch retry with controlled concurrency
   */
  async executeBatchWithRetry(operations, options = {}) {
    const concurrency = options.concurrency || 3;
    const batchDelay = options.batchDelay || 500;
    
    console.log(`🔄 Starting batch execution with ${operations.length} operations, concurrency: ${concurrency}`);
    
    const results = [];
    const errors = [];
    
    // Process operations in batches with controlled concurrency
    for (let i = 0; i < operations.length; i += concurrency) {
      const batch = operations.slice(i, i + concurrency);
      
      console.log(`📦 Processing batch ${Math.floor(i/concurrency) + 1} (${batch.length} operations)`);
      
      const batchPromises = batch.map(async (operation, index) => {
        const globalIndex = i + index;
        try {
          const result = await this.executeWithRetry(
            operation.fn,
            `${operation.context || 'operation'} ${globalIndex + 1}/${operations.length}`
          );
          return { index: globalIndex, result, success: true };
        } catch (error) {
          console.error(`💥 Final failure for operation ${globalIndex + 1}:`, error);
          return { index: globalIndex, error, success: false };
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process batch results
      batchResults.forEach((promiseResult, batchIndex) => {
        if (promiseResult.status === 'fulfilled') {
          const { index, result, error, success } = promiseResult.value;
          if (success) {
            results.push({ index, result });
          } else {
            errors.push({ index, error });
          }
        } else {
          const globalIndex = i + batchIndex;
          errors.push({ index: globalIndex, error: promiseResult.reason });
        }
      });
      
      // Delay between batches to avoid overwhelming the network
      if (i + concurrency < operations.length) {
        console.log(`⏱️  Batch delay ${batchDelay}ms before next batch`);
        await this.sleep(batchDelay);
      }
    }
    
    console.log(`✅ Batch execution complete: ${results.length} succeeded, ${errors.length} failed`);
    
    return {
      successes: results,
      failures: errors,
      totalProcessed: operations.length,
      successRate: (results.length / operations.length * 100).toFixed(1)
    };
  }
}

// Export singleton instance
export const retryManager = new RetryManager({
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 30000,
  jitter: 0.1
});

export default RetryManager;