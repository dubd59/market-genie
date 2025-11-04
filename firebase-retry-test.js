import { retryManager } from './src/services/retryManager.js';
import LeadService from './src/services/leadService.js';

// Quick test to verify retry manager works
const testRetryManager = async () => {
  console.log('🧪 Testing retry manager with Firebase operations...');
  
  const testLead = {
    firstName: 'Test',
    lastName: 'Retry',
    email: 'test.retry@example.com',
    company: 'Test Company',
    title: 'Test Title',
    source: 'retry-test'
  };
  
  try {
    const result = await retryManager.executeWithRetry(
      async () => {
        console.log('💾 Attempting to save test lead...');
        const saveResult = await LeadService.createLead('test-tenant', testLead);
        if (!saveResult?.success) {
          throw new Error(saveResult?.error || 'Save failed');
        }
        return saveResult;
      },
      'test lead save'
    );
    
    console.log('✅ Retry manager test successful:', result);
  } catch (error) {
    console.error('❌ Retry manager test failed:', error);
  }
};

export default testRetryManager;