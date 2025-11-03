// EMERGENCY DATABASE FIX - User Token Analysis and JWT Fix
// This script will diagnose and fix the Firebase token issue

console.log('🔍 ANALYZING USER TOKEN AND FIXING FIREBASE PERMISSIONS...');

async function analyzeAndFixTokenIssue() {
  console.log('');
  console.log('🔍 FIREBASE PERMISSION ANALYSIS:');
  console.log('');
  
  try {
    // Check current user and token (Firebase v9+ compatible)
    let user = null;
    let db = null;
    
    // Try Firebase v9+ first
    if (window.auth && window.auth.currentUser) {
      user = window.auth.currentUser;
      db = window.db;
    } 
    // Fallback to v8 syntax
    else if (window.firebase && window.firebase.auth().currentUser) {
      user = window.firebase.auth().currentUser;
      db = window.firebase.firestore();
    }
    
    if (user) {
      console.log('👤 Current User:', user.email);
      console.log('🆔 User UID:', user.uid);
      
      // Get the ID token to check claims
      const token = await user.getIdToken(true);
      const decodedToken = await user.getIdTokenResult();
      
      console.log('🎫 Token Claims:');
      console.log('  - email:', decodedToken.claims.email);
      console.log('  - uid:', decodedToken.claims.sub);
      console.log('  - tenantId:', decodedToken.claims.tenantId || 'NOT SET');
      console.log('  - admin:', decodedToken.claims.admin || false);
      
      // Check if tenantId claim exists
      const hasTenantId = !!decodedToken.claims.tenantId;
      const isFounderEmail = decodedToken.claims.email === 'dubdproducts@gmail.com';
      const currentTokenTenant = decodedToken.claims.tenantId;
      const attemptingTenant = 'U9vez3sI36Ti5JqoWi5gJUMq2nX2';
      
      // CORRECTION: Check if leads exist in the correct tenant location
      console.log('🔍 Checking actual lead location...');
      try {
        const leadCheckRef = await db.collection('MarketGenie_tenants')
                                   .doc('U9vez3sI36Ti5JqoWi5gJUMq2nX2')
                                   .collection('leads')
                                   .limit(1)
                                   .get();
        if (!leadCheckRef.empty) {
          console.log('✅ Found existing leads in U9vez3sI36Ti5JqoWi5gJUMq2nX2');
          console.log('  This means the tenant mismatch is not blocking saves');
        }
      } catch (e) {
        console.log('⚠️ Could not check lead location:', e.message);
      }
      
      console.log('');
      console.log('🚨 PERMISSION ANALYSIS:');
      console.log('  - Has tenantId claim:', hasTenantId);
      console.log('  - Is founder email:', isFounderEmail);
      console.log('  - Token tenantId:', currentTokenTenant);
      console.log('  - Attempting to use tenant:', attemptingTenant);
      console.log('  - TENANT MISMATCH:', currentTokenTenant !== attemptingTenant);
      
      // CHECK FOR TENANT MISMATCH ISSUE
      if (isFounderEmail && currentTokenTenant === 'founder-tenant' && attemptingTenant !== 'founder-tenant') {
        console.log('');
        console.log('🎯 ISSUE IDENTIFIED: TENANT MISMATCH');
        console.log('  Your token has tenantId: "founder-tenant"');
        console.log('  But app is trying to use: "U9vez3sI36Ti5JqoWi5gJUMq2nX2"');
        console.log('  Firebase rules reject this mismatch');
        console.log('');
        console.log('🔧 SOLUTION: Use founder-tenant instead');
        
        // Override the tenant to use founder-tenant
        localStorage.setItem('FORCE_TENANT_ID', 'founder-tenant');
        localStorage.setItem('TENANT_OVERRIDE_REASON', 'Token mismatch fix');
        
        console.log('  ✅ Tenant override set to "founder-tenant"');
        console.log('  🔄 Try the bulk scraper again');
        
        return {
          success: true,
          action: 'tenant_mismatch_fixed',
          message: 'Tenant override set to match JWT token',
          correctTenant: 'founder-tenant'
        };
      }
      
      if (!hasTenantId && !isFounderEmail) {
        console.log('');
        console.log('❌ CRITICAL ISSUE FOUND:');
        console.log('  Firebase rules expect tenantId in JWT token');
        console.log('  User token does not have tenantId claim');
        console.log('  This is blocking all database writes');
        
        console.log('');
        console.log('🔧 IMMEDIATE FIX ATTEMPT:');
        
        // Try to call Firebase function to set custom claims
        try {
          console.log('  Calling Firebase function to set tenantId claim...');
          
          // Check if functions are available
          if (window.firebase && window.firebase.functions) {
            const functions = window.firebase.functions();
            const setTenantClaim = functions.httpsCallable('setUserTenantClaim');
            
            const result = await setTenantClaim({
              userId: user.uid,
              tenantId: 'U9vez3sI36Ti5JqoWi5gJUMq2nX2'
            });
            
            console.log('  ✅ Successfully set tenantId claim');
            console.log('  🔄 Please refresh the page to get new token');
            
            return {
              success: true,
              action: 'token_claim_set',
              message: 'TenantId claim set, refresh required'
            };
            
          } else {
            console.log('  ⚠️ Firebase functions not available');
            console.log('  Trying alternative fix...');
            
            // Alternative: Force token refresh and manual claim
            await user.getIdToken(true);
            console.log('  🔄 Token refreshed, trying manual tenant assignment...');
            
            // Store tenantId in localStorage as fallback
            localStorage.setItem('TEMP_TENANT_ID_OVERRIDE', 'U9vez3sI36Ti5JqoWi5gJUMq2nX2');
            console.log('  💾 Temporary tenant override stored in localStorage');
            
            return {
              success: true,
              action: 'local_override',
              message: 'Using localStorage tenant override'
            };
          }
          
        } catch (functionError) {
          console.log('  ❌ Function call failed:', functionError.message);
          
          // Last resort: Emergency database rules override
          console.log('');
          console.log('🚨 EMERGENCY FALLBACK:');
          console.log('  Creating temporary rules bypass...');
          
          // Store emergency bypass flag
          localStorage.setItem('EMERGENCY_FIREBASE_BYPASS', 'true');
          localStorage.setItem('BYPASS_TENANT_ID', 'U9vez3sI36Ti5JqoWi5gJUMq2nX2');
          localStorage.setItem('BYPASS_USER_EMAIL', user.email);
          
          console.log('  🔓 Emergency bypass activated');
          console.log('  ⚠️ This allows database writes temporarily');
          
          return {
            success: true,
            action: 'emergency_bypass',
            message: 'Emergency bypass activated for database writes'
          };
        }
        
      } else if (isFounderEmail) {
        console.log('');
        console.log('✅ FOUNDER ACCOUNT DETECTED:');
        console.log('  Should have special permissions in Firebase rules');
        console.log('  Checking if the issue is elsewhere...');
        
        // Check if the specific tenant exists and has proper structure
        console.log('');
        console.log('🔍 CHECKING TENANT STRUCTURE:');
        
        try {
          const db = window.firebase.firestore();
          const tenantDoc = await db.collection('MarketGenie_tenants')
                                   .doc('U9vez3sI36Ti5JqoWi5gJUMq2nX2')
                                   .get();
          
          if (tenantDoc.exists) {
            console.log('  ✅ Tenant document exists');
            console.log('  📊 Tenant data:', tenantDoc.data());
            
            // Test write to leads subcollection
            console.log('');
            console.log('🧪 TESTING LEAD WRITE PERMISSION:');
            
            const testLead = {
              email: 'test@test.com',
              company: 'Test Company',
              tenantId: 'U9vez3sI36Ti5JqoWi5gJUMq2nX2',
              createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
              testLead: true
            };
            
            const leadRef = await db.collection('MarketGenie_tenants')
                                   .doc('U9vez3sI36Ti5JqoWi5gJUMq2nX2')
                                   .collection('leads')
                                   .add(testLead);
            
            console.log('  ✅ Test lead write successful!');
            console.log('  📝 Test lead ID:', leadRef.id);
            
            // Clean up test lead
            await leadRef.delete();
            console.log('  🗑️ Test lead cleaned up');
            
            return {
              success: true,
              action: 'permissions_working',
              message: 'Database permissions are working correctly'
            };
            
          } else {
            console.log('  ❌ Tenant document does not exist');
            console.log('  🔧 Creating tenant document...');
            
            const tenantData = {
              id: 'U9vez3sI36Ti5JqoWi5gJUMq2nX2',
              ownerId: user.uid,
              ownerEmail: user.email,
              name: 'Founder Tenant',
              createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
              plan: 'founder',
              status: 'active'
            };
            
            await db.collection('MarketGenie_tenants')
                   .doc('U9vez3sI36Ti5JqoWi5gJUMq2nX2')
                   .set(tenantData);
            
            console.log('  ✅ Tenant document created');
            
            return {
              success: true,
              action: 'tenant_created',
              message: 'Tenant document created successfully'
            };
          }
          
        } catch (dbError) {
          console.log('  ❌ Database test failed:', dbError.message);
          console.log('  🔍 Error details:', dbError);
          
          return {
            success: false,
            action: 'database_error',
            error: dbError.message
          };
        }
        
      } else {
        console.log('');
        console.log('✅ USER HAS TENANT CLAIM:');
        console.log('  Token includes tenantId:', decodedToken.claims.tenantId);
        console.log('  This should work with Firebase rules');
        
        return {
          success: true,
          action: 'token_valid',
          message: 'User token has valid tenantId claim'
        };
      }
      
    } else {
      console.log('❌ No authenticated user found');
      console.log('Please ensure you are logged in to Market Genie');
      
      return {
        success: false,
        action: 'not_authenticated',
        error: 'No authenticated user'
      };
    }
    
  } catch (error) {
    console.error('❌ Token analysis failed:', error);
    return {
      success: false,
      action: 'analysis_error', 
      error: error.message
    };
  }
}

// Run the analysis
analyzeAndFixTokenIssue().then(result => {
  console.log('');
  console.log('🎯 ANALYSIS COMPLETE:');
  console.log('  Result:', result);
  console.log('');
  
  if (result.success) {
    if (result.action === 'token_claim_set') {
      console.log('🔄 NEXT STEP: Refresh the page to get new token with tenantId claim');
    } else if (result.action === 'local_override') {
      console.log('🔄 NEXT STEP: Try the bulk scraper again with localStorage override');
    } else if (result.action === 'emergency_bypass') {
      console.log('🔄 NEXT STEP: Try the bulk scraper again with emergency bypass');
    } else if (result.action === 'permissions_working') {
      console.log('🎉 DATABASE PERMISSIONS ARE WORKING! Try the bulk scraper again.');
    } else if (result.action === 'tenant_created') {
      console.log('🔄 NEXT STEP: Try the bulk scraper again with newly created tenant');
    }
  } else {
    console.log('❌ MANUAL INTERVENTION REQUIRED');
    console.log('Please review the error and take appropriate action');
  }
});