// TENANT VERIFICATION AND LEAD SAVE DIAGNOSTIC
// Run this in your Market Genie app console to diagnose the exact issue

async function diagnoseTenantAndSave() {
  console.log('🔍 TENANT & SAVE DIAGNOSTIC');
  console.log('===========================');
  
  try {
    // 1. Check authentication
    const auth = window.auth || window.firebase?.auth();
    const user = auth?.currentUser;
    
    if (!user) {
      console.log('❌ No authenticated user found');
      return false;
    }
    
    console.log('👤 User authenticated:', user.email);
    console.log('🆔 User UID:', user.uid);
    
    // 2. Get ID token and claims
    const idTokenResult = await user.getIdTokenResult(true);
    console.log('🎫 Token claims:', idTokenResult.claims);
    console.log('🏢 Tenant ID from token:', idTokenResult.claims.tenantId);
    
    // 3. Check what tenant the app is using
    const tenantContext = window.tenant;
    console.log('🏢 Tenant from context:', tenantContext);
    
    // 4. Check localStorage for any tenant overrides
    const localTenant = localStorage.getItem('marketgenie_tenant_id');
    console.log('💾 Tenant from localStorage:', localTenant);
    
    // 5. Determine which tenant ID will be used
    const effectiveTenantId = tenantContext?.id || localTenant || user.uid;
    console.log('🎯 Effective tenant ID that will be used:', effectiveTenantId);
    
    // 6. Check if this tenant exists in Firestore
    console.log('🔍 Checking if tenant exists in Firestore...');
    const db = window.db || window.firebase?.firestore();
    
    if (!db) {
      console.log('❌ No Firestore database connection available');
      return false;
    }
    
    try {
      const tenantDoc = await db.collection('MarketGenie_tenants').doc(effectiveTenantId).get();
      
      if (tenantDoc.exists) {
        console.log('✅ Tenant document exists');
        console.log('📋 Tenant data:', tenantDoc.data());
      } else {
        console.log('❌ Tenant document does NOT exist');
        console.log('💡 This could be causing permission issues');
      }
    } catch (tenantError) {
      console.log('❌ Error checking tenant:', tenantError.message);
    }
    
    // 7. Test Firebase collection access
    console.log('🧪 Testing collection access...');
    try {
      const leadsCollection = db.collection('MarketGenie_tenants').doc(effectiveTenantId).collection('leads');
      const testQuery = await leadsCollection.limit(1).get();
      console.log('✅ Collection access successful');
      console.log('📊 Current leads count:', testQuery.size);
    } catch (collectionError) {
      console.log('❌ Collection access failed:', collectionError.message);
      console.log('💡 This indicates a permissions or security rules issue');
    }
    
    // 8. Test a simple lead save
    console.log('💾 Testing simple lead save...');
    const testLead = {
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'Lead',
      company: 'Test Company',
      source: 'diagnostic-test',
      createdAt: new Date(),
      tenantId: effectiveTenantId
    };
    
    try {
      const leadsCollection = db.collection('MarketGenie_tenants').doc(effectiveTenantId).collection('leads');
      const docRef = await leadsCollection.add(testLead);
      console.log('✅ LEAD SAVE SUCCESSFUL!');
      console.log('🆔 Saved lead ID:', docRef.id);
      
      // Clean up test lead
      await docRef.delete();
      console.log('🗑️ Test lead cleaned up');
      
      return true;
    } catch (saveError) {
      console.log('❌ LEAD SAVE FAILED!');
      console.log('💥 Save error:', saveError.message);
      console.log('📋 Error code:', saveError.code);
      console.log('📋 Full error:', saveError);
      
      // Check if it's a permissions error
      if (saveError.code === 'permission-denied') {
        console.log('🚨 PERMISSION DENIED ERROR');
        console.log('💡 Check Firestore security rules');
        console.log('💡 Verify user has correct tenantId claim');
      }
      
      return false;
    }
    
  } catch (error) {
    console.error('💥 Diagnostic failed:', error);
    return false;
  }
}

console.log('🔍 Tenant & Save Diagnostic loaded');
console.log('Run: diagnoseTenantAndSave() to identify the exact issue');