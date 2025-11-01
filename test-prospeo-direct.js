// Direct Prospeo API Test - Test the API outside of our application
// This will help verify if the issue is with our integration or the API itself

async function testProspeoAPIDirect() {
  console.log('🧪 DIRECT PROSPEO API TEST');
  console.log('==========================');
  
  // You'll need to get your API key from Firebase or the UI
  const apiKey = 'pk_d96cfaf95fe8e43df4e5e4346b949ba4f9ff16b5'; // Replace with your actual API key
  
  if (apiKey === 'YOUR_PROSPEO_API_KEY_HERE') {
    console.log('❌ Please update the API key in this script first!');
    console.log('Go to Market Genie > API Keys & Integrations > Lead Generation > Prospeo > Configure');
    return;
  }
  
  try {
    console.log('1️⃣ Testing account info...');
    
    // Test 1: Account Info
    const accountResponse = await fetch('https://api.prospeo.io/account', {
      method: 'GET',
      headers: {
        'X-KEY': apiKey
      }
    });
    
    const accountData = await accountResponse.json();
    console.log('Account response:', accountData);
    
    if (accountResponse.ok) {
      console.log(`✅ Account connected! Credits: ${accountData.remaining_credits}`);
      
      console.log('\n2️⃣ Testing domain search...');
      
      // Test 2: Domain Search
      const domainResponse = await fetch('https://api.prospeo.io/domain-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KEY': apiKey
        },
        body: JSON.stringify({
          domain: 'tesla.com'
        })
      });
      
      const domainData = await domainResponse.json();
      console.log('Domain search response:', domainData);
      
      if (domainResponse.ok && domainData.emails) {
        console.log(`✅ SUCCESS! Found ${domainData.emails.length} contacts at tesla.com:`);
        domainData.emails.slice(0, 3).forEach((email, index) => {
          console.log(`📧 ${index + 1}. ${email.first_name} ${email.last_name} - ${email.email}`);
        });
        console.log(`💰 Credits remaining: ${domainData.remaining_credits}`);
        
        return {
          success: true,
          message: 'Prospeo API is working perfectly!',
          contactsFound: domainData.emails.length,
          creditsRemaining: domainData.remaining_credits
        };
      } else {
        console.log('❌ Domain search failed:', domainData);
        return { success: false, error: 'Domain search failed' };
      }
      
    } else {
      console.log('❌ Account connection failed:', accountData);
      return { success: false, error: 'Invalid API key or account issue' };
    }
    
  } catch (error) {
    console.log('💥 Direct API test failed:', error);
    return { success: false, error: error.message };
  }
}

console.log(`
🧪 DIRECT PROSPEO API TEST
===========================

This tests the Prospeo API directly to verify it's working.

Instructions:
1. Get your Prospeo API key from Market Genie
2. Replace 'YOUR_PROSPEO_API_KEY_HERE' with your actual key
3. Run: testProspeoAPIDirect()

This will test:
✓ Account connection
✓ Credits available  
✓ Domain search for tesla.com
`);

// Uncomment to run automatically:
testProspeoAPIDirect().then(result => console.log('Final result:', result));