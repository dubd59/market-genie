// Test the Contact Manager with a REAL executive
async function testRealExecutiveSearch() {
  console.log('🎯 TESTING CONTACT MANAGER WITH REAL EXECUTIVE');
  
  const PROXY_URL = 'https://leadgenproxy-aopxj7f3aa-uc.a.run.app';
  const API_KEY = 'af031c01367fd2aede39804a69094b84';
  
  // Test with Tim Cook (Apple CEO) - we know this works
  const realExecutive = {
    firstName: 'Tim',
    lastName: 'Cook',
    company: 'apple.com',
    domain: 'apple.com'
  };
  
  try {
    console.log('📤 Searching for real executive...');
    console.log('Executive:', realExecutive);
    
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'prospeo',
        apiKey: API_KEY,
        searchData: realExecutive
      })
    });
    
    const result = await response.json();
    console.log('📊 Contact Manager Result:', result);
    
    if (result.success && result.data.email) {
      console.log('🎉 SUCCESS! Found real executive email:');
      console.log(`   📧 Email: ${result.data.email}`);
      console.log(`   👤 Name: ${result.data.first_name} ${result.data.last_name}`);
      console.log(`   🏢 Company: ${result.data.domain}`);
      console.log(`   ✅ Status: ${result.data.email_status}`);
      console.log('');
      console.log('💡 This is a REAL lead you can use for outreach!');
    } else {
      console.log('❌ No email found:', result.error);
    }
    
  } catch (error) {
    console.log('💥 Test failed:', error);
  }
}

console.log(`
🎯 REAL EXECUTIVE SEARCH TEST
============================

This will test the Contact Manager (not Lead Generation Hub) 
with a real executive name to get actual business emails.

Run: testRealExecutiveSearch()
`);

testRealExecutiveSearch();