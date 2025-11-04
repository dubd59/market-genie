// 🔧 FIREBASE CONNECTION DIAGNOSTIC SCRIPT
// Copy and paste this into your browser console at https://market-genie-f2d41.web.app

console.log('🔧 Starting Firebase Connection Diagnostic...');

// Test 1: Check Firebase Auth State
console.log('1️⃣ Checking Authentication...');
if (window.firebase) {
  const authInstance = window.firebase.auth();
  const user = authInstance.currentUser;
  if (user) {
    console.log('✅ User authenticated:', user.email);
    console.log('🆔 User ID:', user.uid);
    
    // Check for custom claims (tenant info)
    user.getIdTokenResult()
      .then(idTokenResult => {
        console.log('🎫 User claims:', idTokenResult.claims);
        if (idTokenResult.claims.tenantId) {
          console.log('✅ Tenant ID found:', idTokenResult.claims.tenantId);
        } else {
          console.log('❌ NO TENANT ID - This could be the problem!');
        }
      })
      .catch(error => {
        console.error('❌ Failed to get token claims:', error);
      });
  } else {
    console.log('❌ NO USER AUTHENTICATED - This is the problem!');
  }
} else {
  console.log('❌ Firebase bridge not found');
}

// Test 2: Direct Firestore Write Test
console.log('2️⃣ Testing Direct Firestore Write...');

// Import Firebase functions from the global scope or try to access them
const testFirestoreWrite = async () => {
  try {
    // Access the Firebase bridge
    const firebase = window.firebase;
    
    if (!firebase) {
      console.log('❌ Firebase bridge not available');
      return;
    }
    
    const db = firebase.firestore();
    
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      tenantId: 'founder-tenant', // Use your tenant ID
      _marketGenieApp: true,
      _securityValidated: true
    };
    
    console.log('🔍 Attempting write to leads collection...');
    
    const docRef = await db.collection('MarketGenie_tenants/founder-tenant/leads').add(testData);
    
    console.log('✅ SUCCESS! Document written with ID:', docRef.id);
    
  } catch (error) {
    console.error('❌ WRITE FAILED:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('🔐 ISSUE: Permission denied - check authentication and Firestore rules');
    } else if (error.code === 'unavailable') {
      console.log('🌐 ISSUE: Network connectivity problem');
    } else if (error.message?.includes('transport')) {
      console.log('🚨 ISSUE: WebChannel transport error - this is the exact problem!');
    }
  }
};

// Run the test
testFirestoreWrite();

// Test 3: Check Network Connectivity
console.log('3️⃣ Checking Network Connectivity...');
fetch('https://firestore.googleapis.com/v1/projects/market-genie-f2d41/databases/(default)/documents')
  .then(response => {
    console.log('✅ Firebase API reachable, status:', response.status);
  })
  .catch(error => {
    console.error('❌ Firebase API unreachable:', error);
  });

console.log('🔧 Diagnostic complete. Check results above ☝️');