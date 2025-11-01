// Quick Firebase connection test
// Run this in browser console to test if the connection works

const testFirebaseConnection = async () => {
  console.log('🧪 Testing Firebase connection...');
  
  try {
    // Test 1: Simple write to test collection
    const testRef = window.firebase.firestore().collection('test_connection');
    const testDoc = await testRef.add({
      timestamp: new Date(),
      test: 'connection_test_' + Date.now(),
      source: 'emergency_debug'
    });
    
    console.log('✅ Test 1 PASSED: Basic write successful', testDoc.id);
    
    // Test 2: Write to leads collection (the problematic one)
    const leadsRef = window.firebase.firestore().collection('MarketGenie_tenants').doc('8ZJY8LY3g2H3Mw2eRcmd').collection('leads');
    const leadDoc = await leadsRef.add({
      timestamp: new Date(),
      testLead: 'emergency_test_' + Date.now(),
      email: 'test@emergency.com',
      source: 'emergency_debug'
    });
    
    console.log('✅ Test 2 PASSED: Leads write successful', leadDoc.id);
    
    // Test 3: Multiple rapid writes (simulate bulk scraper)
    console.log('🔄 Test 3: Rapid writes...');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        testRef.add({
          timestamp: new Date(),
          test: 'rapid_test_' + i,
          batch: Date.now()
        })
      );
    }
    
    const results = await Promise.all(promises);
    console.log('✅ Test 3 PASSED: Rapid writes successful', results.length);
    
    return {
      success: true,
      message: 'All tests passed - Firebase connection is working!'
    };
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

// Run the test
testFirebaseConnection().then(result => {
  console.log('🏁 Test Result:', result);
});

console.log('📋 Copy and paste this into your browser console at https://market-genie-f2d41.web.app');