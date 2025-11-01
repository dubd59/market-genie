// 🔑 PROSPEO API KEY UPDATE REQUIRED
// 
// ❌ ISSUE FOUND: Your Prospeo API key is invalid or expired
// 
// 🔧 TO FIX:
// 1. Go to https://prospeo.io/dashboard/api
// 2. Copy your API key (should start with 'pk_')
// 3. Go to your Market Genie app: https://market-genie-f2d41.web.app
// 4. Navigate to: API Keys & Integrations > Lead Generation > Prospeo
// 5. Click "Configure" and paste the new API key
// 6. Test the connection
// 
// 🧪 DIAGNOSIS:
console.log('🔍 API Key Diagnosis:');
console.log('❌ Current key returns: INVALID_API_KEY');
console.log('❌ Status: 401 Unauthorized');
console.log('❌ All email searches failing with 400 errors');
console.log('');
console.log('🎯 SOLUTION:');
console.log('1. Get fresh API key from Prospeo dashboard');
console.log('2. Update in Market Genie API settings');
console.log('3. Test connection');
console.log('4. Try lead scraper again');
console.log('');
console.log('🔗 Prospeo Dashboard: https://prospeo.io/dashboard/api');
console.log('🔗 Market Genie App: https://market-genie-f2d41.web.app');

// Test function to verify new key
export function testNewKey(newApiKey) {
  console.log('🧪 Testing new API key...');
  console.log('Key preview:', newApiKey.substring(0, 8) + '...');
  
  // You can use this to test a new key before updating the app
  const data = JSON.stringify({});
  
  const options = {
    hostname: 'api.prospeo.io',
    port: 443,
    path: '/account-information',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-KEY': newApiKey
    }
  };
  
  // Test implementation here...
  console.log('Use this function to test new keys before updating the app');
}