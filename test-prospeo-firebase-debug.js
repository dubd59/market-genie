// Test the Firebase proxy with improved error reporting
async function testProspeoFirebaseDebug() {
  console.log('🧪 TESTING FIREBASE PROSPEO PROXY WITH DEBUG INFO');
  
  const PROXY_URL = 'https://leadgenproxy-aopxj7f3aa-uc.a.run.app';
  const API_KEY = 'af031c01367fd2aede39804a69094b84'; // Your Prospeo API key
  
  try {
    console.log('1️⃣ Testing Prospeo connection via Firebase proxy...');
    
    const response = await fetch(`${PROXY_URL}/api/prospeo-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: API_KEY
      })
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('📊 Response data:', result);
    
    if (result.success) {
      console.log('✅ SUCCESS! Prospeo connected via Firebase proxy');
      console.log('💳 Credits:', result.credits);
      
      // Now test a domain search
      console.log('\n2️⃣ Testing domain search...');
      
      const searchResponse = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: 'prospeo',
          apiKey: API_KEY,
          searchData: {
            domain: 'tesla.com'
          }
        })
      });
      
      const searchResult = await searchResponse.json();
      console.log('🔍 Search result:', searchResult);
      
      if (searchResult.success) {
        console.log('✅ Domain search successful!');
        console.log('📧 Found contacts:', searchResult.data.contacts?.length || 0);
      } else {
        console.log('❌ Domain search failed:', searchResult.error);
      }
      
    } else {
      console.log('❌ Connection failed:', result.error);
      if (result.details) {
        console.log('🔍 Error details:', result.details);
      }
      if (result.stack) {
        console.log('📱 Stack trace:', result.stack);
      }
    }
    
  } catch (error) {
    console.log('💥 Test failed:', error);
  }
}

console.log(`
🔧 FIREBASE PROXY DEBUG TEST
=============================

This test will:
1. Test Prospeo connection via Firebase proxy
2. Show detailed error information if it fails
3. Test domain search if connection succeeds

Run: testProspeoFirebaseDebug()
`);

// Auto-run the test
testProspeoFirebaseDebug();