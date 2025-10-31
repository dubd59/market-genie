// Test the Prospeo API key directly without Firebase authentication

async function testProspeoDirectly() {
  try {
    const apiKey = 'f5526d834d7ad4eba595ddee37494a27';
    
    console.log('🧪 Testing Prospeo API key directly...');
    console.log('🔑 Key:', apiKey.substring(0, 8) + '...');
    
    // Test 1: Check account status
    console.log('\n1️⃣ Testing account status...');
    
    try {
      const response = await fetch('https://leadgenproxy-aopxj7f3aa-uc.a.run.app/api/prospeo-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: apiKey
        })
      });

      const result = await response.json();
      console.log('Account test result:', result);
      
      if (result.success) {
        console.log(`✅ API Key is VALID! Credits: ${result.credits}`);
      } else {
        console.log(`❌ API Key INVALID: ${result.error}`);
      }
    } catch (error) {
      console.log('❌ Account test failed:', error.message);
    }
    
    // Test 2: Try finding a known email
    console.log('\n2️⃣ Testing email search (Joel from Buffer)...');
    
    try {
      const emailResponse = await fetch('https://leadgenproxy-aopxj7f3aa-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: 'prospeo',
          apiKey: apiKey,
          searchData: {
            firstName: 'Joel',
            lastName: 'Gascoigne',
            domain: 'buffer.com'
          }
        })
      });

      const emailResult = await emailResponse.json();
      console.log('Email search result:', emailResult);
      
      if (emailResult.success) {
        console.log(`✅ Email search WORKING! Found: ${emailResult.data.email}`);
      } else {
        console.log(`❌ Email search FAILED: ${emailResult.error}`);
        
        if (emailResult.error && emailResult.error.includes('400')) {
          console.log('\n🔧 Diagnosis: API Key likely exhausted or invalid');
          console.log('💡 Solution: Need to update API key in the app');
        }
      }
    } catch (emailError) {
      console.log('❌ Email search failed:', emailError.message);
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('If you see "400" errors, the API key needs to be updated.');
    console.log('Go to API Keys & Integrations in the app and reconnect Prospeo.io');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Fallback test using curl-like approach
    console.log('\n🔄 Trying fallback test...');
    console.log('If the API key is exhausted, you need to:');
    console.log('1. Check your Prospeo account for remaining credits');
    console.log('2. Get a new API key if needed');
    console.log('3. Update it in the app');
  }
}

testProspeoDirectly();