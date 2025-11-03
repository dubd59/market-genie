// Browser-compatible token analysis and fix script
(async function() {
  console.log('🔍 JWT TOKEN ANALYSIS & PERMISSION FIX');
  console.log('=====================================');
  
  try {
    // Check if Firebase is loaded
    if (!window.firebase) {
      console.log('❌ Firebase not found. Make sure you\'re on the Market Genie app page.');
      return;
    }
    
    // Check authentication
    const auth = window.firebase.auth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('❌ No authenticated user found. Please log in first.');
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    console.log('📋 User ID:', user.uid);
    
    // Get fresh token with claims
    console.log('');
    console.log('🎫 Analyzing JWT token...');
    
    const idTokenResult = await user.getIdTokenResult(true);
    const decodedToken = idTokenResult;
    
    console.log('🎫 Token Claims:');
    console.log('  - email:', decodedToken.claims.email);
    console.log('  - uid:', decodedToken.claims.sub);
    console.log('  - tenantId:', decodedToken.claims.tenantId || 'NOT SET');
    console.log('  - admin:', decodedToken.claims.admin || false);
    
    // Check for tenant mismatch
    const currentTokenTenant = decodedToken.claims.tenantId;
    const attemptingTenant = 'U9vez3sI36Ti5JqoWi5gJUMq2nX2';
    const isFounderEmail = decodedToken.claims.email === 'dubdproducts@gmail.com';
    
    console.log('');
    console.log('🚨 PERMISSION ANALYSIS:');
    console.log('  - Has tenantId claim:', !!currentTokenTenant);
    console.log('  - Is founder email:', isFounderEmail);
    console.log('  - Token tenantId:', currentTokenTenant);
    console.log('  - App trying to use:', attemptingTenant);
    console.log('  - TENANT MISMATCH:', currentTokenTenant !== attemptingTenant);
    
    // Fix tenant mismatch if detected
    if (isFounderEmail && currentTokenTenant === 'founder-tenant' && attemptingTenant !== 'founder-tenant') {
      console.log('');
      console.log('🎯 ISSUE IDENTIFIED: TENANT MISMATCH');
      console.log('  Your token has tenantId: "founder-tenant"');
      console.log('  But app is trying to use: "U9vez3sI36Ti5JqoWi5gJUMq2nX2"');
      console.log('  Firebase rules reject this mismatch');
      console.log('');
      console.log('🔧 APPLYING FIX...');
      
      // Set localStorage overrides
      localStorage.setItem('FORCE_TENANT_ID', 'founder-tenant');
      localStorage.setItem('TENANT_OVERRIDE_REASON', 'Token mismatch fix');
      localStorage.setItem('TENANT_FIX_TIMESTAMP', new Date().toISOString());
      
      console.log('  ✅ Tenant override set to "founder-tenant"');
      console.log('  💾 Stored in localStorage');
      console.log('');
      console.log('🔄 NEXT STEPS:');
      console.log('  1. Refresh the page');
      console.log('  2. Try the bulk scraper again');
      console.log('  3. Leads should now save successfully');
      
      return {
        success: true,
        action: 'tenant_mismatch_fixed',
        message: 'Tenant override set to match JWT token',
        correctTenant: 'founder-tenant'
      };
    }
    
    // Test database access if no mismatch
    console.log('');
    console.log('🔍 Testing database access...');
    
    try {
      const db = window.firebase.firestore();
      const testTenant = currentTokenTenant || user.uid;
      
      console.log('  Testing access to tenant:', testTenant);
      
      const tenantDoc = await db.collection('MarketGenie_tenants').doc(testTenant).get();
      
      if (tenantDoc.exists) {
        console.log('  ✅ Tenant document exists');
        console.log('  📊 Tenant data:', tenantDoc.data());
        
        // Test write permission
        console.log('');
        console.log('🧪 Testing write permission...');
        
        const testLead = {
          email: 'test@test.com',
          company: 'Test Company',
          tenantId: testTenant,
          createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
          testLead: true
        };
        
        const leadRef = await db.collection('MarketGenie_tenants')
                               .doc(testTenant)
                               .collection('leads')
                               .add(testLead);
        
        console.log('  ✅ Test write successful!');
        console.log('  📝 Test lead ID:', leadRef.id);
        
        // Clean up
        await leadRef.delete();
        console.log('  🗑️ Test lead cleaned up');
        
        console.log('');
        console.log('✅ ALL TESTS PASSED');
        console.log('  Database permissions are working correctly');
        console.log('  Bulk scraper should work now');
        
        return {
          success: true,
          action: 'permissions_working',
          message: 'Database permissions are working correctly'
        };
        
      } else {
        console.log('  ❌ Tenant document does not exist');
        console.log('  🔧 This might be the issue - missing tenant setup');
        
        return {
          success: false,
          action: 'tenant_missing',
          message: 'Tenant document does not exist'
        };
      }
      
    } catch (dbError) {
      console.log('  ❌ Database test failed:', dbError.message);
      console.log('  🚨 This confirms permissions issue');
      
      if (dbError.message.includes('Missing or insufficient permissions')) {
        console.log('');
        console.log('🔧 PERMISSION FIX ATTEMPT:');
        console.log('  Setting emergency tenant override...');
        
        localStorage.setItem('FORCE_TENANT_ID', currentTokenTenant || 'founder-tenant');
        localStorage.setItem('EMERGENCY_BYPASS', 'true');
        localStorage.setItem('BYPASS_REASON', 'Permission denied - using token tenant');
        
        console.log('  ✅ Emergency override set');
        console.log('  🔄 Refresh page and try again');
      }
      
      return {
        success: false,
        action: 'database_error',
        message: dbError.message
      };
    }
    
  } catch (error) {
    console.log('❌ ANALYSIS FAILED:', error.message);
    console.log(error);
    
    return {
      success: false,
      action: 'analysis_failed',
      message: error.message
    };
  }
})();