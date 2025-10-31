// Direct test without any imports - run this in browser console
// This bypasses any module caching issues

async function directProspeoTest() {
  console.log('🧪 DIRECT PROSPEO API TEST (no modules)');
  
  // You need to replace these with actual values
  const API_KEY = 'YOUR_PROSPEO_API_KEY_HERE'; // Get this from Firebase credentials
  const TEST_DOMAIN = 'tesla.com';
  
  try {
    console.log('1️⃣ Testing Prospeo account endpoint...');
    
    // Test account info
    const accountResponse = await fetch('https://api.prospeo.io/account', {
      method: 'GET',
      headers: {
        'X-KEY': API_KEY
      }
    });
    
    const accountResult = await accountResponse.json();
    console.log('📊 Account Response:', accountResult);
    
    if (accountResponse.ok) {
      console.log('✅ API Key valid! Credits:', accountResult.remaining_credits);
      
      console.log('2️⃣ Testing domain search...');
      
      // Test domain search
      const domainResponse = await fetch('https://api.prospeo.io/domain-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KEY': API_KEY
        },
        body: JSON.stringify({
          domain: TEST_DOMAIN
        })
      });
      
      const domainResult = await domainResponse.json();
      console.log('📧 Domain Search Response:', domainResult);
      
      if (domainResponse.ok && domainResult.emails) {
        console.log('✅ SUCCESS! Found', domainResult.emails.length, 'emails');
        console.log('📧 Sample emails:', domainResult.emails.slice(0, 3));
      } else {
        console.log('❌ Domain search failed:', domainResult);
      }
      
    } else {
      console.log('❌ API Key invalid:', accountResult);
    }
    
  } catch (error) {
    console.log('💥 Test failed:', error);
  }
}

console.log(`
🔧 DIRECT API TEST
==================

1. Get your Prospeo API key from the app's integrations page
2. Replace 'YOUR_PROSPEO_API_KEY_HERE' with your actual API key
3. Run: directProspeoTest()

This test bypasses all modules and caching to test the API directly.
`);

// Uncomment to run automatically:
// directProspeoTest();