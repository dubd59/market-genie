// Manual Prospeo connection test - bypasses UI issues
async function manualProspeoConnect() {
  try {
    console.log('🧪 MANUAL PROSPEO CONNECTION TEST');
    
    const tenantId = 'U9vez3sI36Ti5JqoWi5gJUMq2nX2';
    
    // You need to get your API key from prospeo.io
    const apiKey = prompt('Enter your Prospeo.io API key:');
    
    if (!apiKey) {
      console.log('❌ No API key provided');
      return;
    }
    
    console.log('🔑 API Key entered:', apiKey.substring(0, 8) + '...');
    
    // Import the integration service
    const IntegrationService = (await import('./src/services/integrationService.js')).default;
    
    console.log('🔌 Connecting Prospeo...');
    const result = await IntegrationService.connectProspeo(tenantId, apiKey);
    
    if (result.success) {
      console.log('🎉 SUCCESS! Prospeo connected!');
      console.log('💰 Credits available:', result.data.credits);
      console.log('📋 Plan:', result.data.plan);
      
      // Now test domain search
      console.log('🔍 Testing domain search...');
      const searchResult = await IntegrationService.searchDomainProspeo(tenantId, 'tesla.com', 3);
      
      if (searchResult.success) {
        console.log('🎉 DOMAIN SEARCH WORKS!');
        console.log('📧 Found leads:', searchResult.data);
        console.log('💰 Credits remaining:', searchResult.credits_remaining);
      } else {
        console.log('❌ Domain search failed:', searchResult.error);
      }
      
    } else {
      console.log('❌ Connection failed:', result.error);
    }
    
  } catch (error) {
    console.log('💥 Error:', error);
  }
}

console.log(`
🔧 MANUAL CONNECTION TEST
=========================

This bypasses the UI and connects Prospeo directly.

1. Get your API key from prospeo.io
2. Run: manualProspeoConnect()
3. Enter your API key when prompted

This will test the fixed integration directly.
`);

// Uncomment to run:
// manualProspeoConnect();