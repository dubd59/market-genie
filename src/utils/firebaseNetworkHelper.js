/**
 * Quick network error handler for Firebase WebChannelConnection errors
 */

export const handleFirebaseNetworkError = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Firebase operation attempt ${attempt}/${maxRetries}`);
      const result = await operation();
      return result;
    } catch (error) {
      const errorMsg = error.message?.toLowerCase() || '';
      
      // Check if it's a retryable network error
      const isNetworkError = errorMsg.includes('webchannelconnection') || 
                            errorMsg.includes('transport errored') ||
                            errorMsg.includes('network error');
      
      if (!isNetworkError || attempt === maxRetries) {
        throw error;
      }
      
      console.log(`❌ Network error, retrying in ${attempt * 1000}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
};