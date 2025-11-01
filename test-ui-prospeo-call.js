// Test EXACTLY what the app UI is calling
async function testUIProspeoCall() {
  console.log('🧪 TESTING EXACT UI CALL TO FIREBASE PROXY');
  
  const PROXY_URL = 'https://leadgenproxy-aopxj7f3aa-uc.a.run.app';
  const API_KEY = 'af031c01367fd2aede39804a69094b84';
  
  // This is EXACTLY what the UI testLeadProvider method calls
  const testData = {
    firstName: 'Tim',
    lastName: 'Cook',
    company: 'Apple'
  };
  
  try {
    console.log('📤 Sending request exactly like the UI...');
    console.log('Request body:', {
      provider: 'prospeo',
      apiKey: API_KEY,
      searchData: testData
    });
    
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'prospeo',
        apiKey: API_KEY,
        searchData: testData
      })
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('📊 Full response:', result);
    console.log('📊 Result.success:', result.success, typeof result.success);
    console.log('📊 Result.error:', result.error, typeof result.error);
    console.log('📊 Result.provider:', result.provider);
    
    // Check what the UI logic would do
    if (result.success || 
        (result.error && result.error.includes('No email found')) ||
        (result.error && result.error.includes('not found for this person')) ||
        (result.error && result.error.includes('No results found'))) {
      
      console.log('✅ UI would consider this successful');
    } else {
      console.log('❌ UI would consider this failed');
      console.log('🔍 Error type:', typeof result.error);
      console.log('🔍 Error value:', result.error);
    }
    
  } catch (error) {
    console.log('💥 Test failed:', error);
  }
}

console.log('Run: testUIProspeoCall()');
testUIProspeoCall();