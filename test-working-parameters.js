// Test with the EXACT same parameters that worked before
async function testWorkingParameters() {
  console.log('🎯 TESTING WITH EXACT WORKING PARAMETERS');
  
  const PROXY_URL = 'https://leadgenproxy-aopxj7f3aa-uc.a.run.app';
  const API_KEY = 'af031c01367fd2aede39804a69094b84';
  
  // These are the EXACT parameters that found tcook@apple.com successfully
  const workingTestData = {
    firstName: 'Tim',
    lastName: 'Cook',
    company: 'apple.com'  // Changed from 'Apple' to 'apple.com'
  };
  
  try {
    console.log('📤 Using working parameters...');
    console.log('Test data:', workingTestData);
    
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'prospeo',
        apiKey: API_KEY,
        searchData: workingTestData
      })
    });
    
    const result = await response.json();
    console.log('📊 Response:', result);
    
    if (result.success) {
      console.log('✅ SUCCESS! Found email:', result.data.email);
    } else if (result.error && result.error.includes('No email found')) {
      console.log('✅ API KEY VALID! (No email found for this specific person)');
    } else {
      console.log('❌ Failed:', result.error);
    }
    
  } catch (error) {
    console.log('💥 Test failed:', error);
  }
}

testWorkingParameters();