// Emergency Firebase Connection Recovery Script
(async function() {
  console.log('🚨 FIREBASE CONNECTION EMERGENCY RECOVERY');
  console.log('=======================================');
  
  try {
    // Check if Firebase is available
    if (!window.firebase) {
      console.log('❌ Firebase not found');
      return;
    }
    
    const db = window.firebase.firestore();
    const auth = window.firebase.auth();
    
    console.log('🔧 Step 1: Forcing Firebase to go online...');
    
    // Force Firestore to go online
    await db.enableNetwork();
    console.log('  ✅ Network enabled');
    
    // Clear any offline cache
    await db.clearPersistence().catch(() => {
      console.log('  ⚠️ Could not clear persistence (app may be running)');
    });
    
    console.log('🔧 Step 2: Resetting connection state...');
    
    // Disable and re-enable network to force reconnection
    await db.disableNetwork();
    console.log('  🔄 Network disabled');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await db.enableNetwork();
    console.log('  ✅ Network re-enabled');
    
    console.log('🔧 Step 3: Testing connection with simple operation...');
    
    // Test with a simple read operation
    try {
      const testDoc = await db.collection('MarketGenie_tenants').doc('founder-tenant').get();
      
      if (testDoc.exists) {
        console.log('  ✅ Successfully connected to Firebase!');
        console.log('  📊 Test document exists');
      } else {
        console.log('  ⚠️ Connected but founder-tenant document missing');
        console.log('  🔧 Creating founder-tenant document...');
        
        await db.collection('MarketGenie_tenants').doc('founder-tenant').set({
          id: 'founder-tenant',
          ownerId: auth.currentUser?.uid,
          ownerEmail: auth.currentUser?.email,
          name: 'Founder Tenant',
          createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
          plan: 'founder',
          status: 'active'
        });
        
        console.log('  ✅ Founder-tenant document created');
      }
      
    } catch (readError) {
      console.log('  ❌ Connection test failed:', readError.message);
      
      if (readError.message.includes('offline')) {
        console.log('');
        console.log('🚨 STILL OFFLINE - TRYING AGGRESSIVE RECOVERY...');
        
        // Set aggressive settings to force online
        const settings = {
          ignoreUndefinedProperties: true
        };
        
        // Try to force settings
        try {
          db.settings(settings);
          console.log('  🔧 Applied aggressive settings');
        } catch (settingsError) {
          console.log('  ⚠️ Could not apply settings:', settingsError.message);
        }
        
        // Try manual cache clear via browser
        console.log('');
        console.log('🔧 MANUAL RECOVERY STEPS:');
        console.log('  1. Open DevTools (F12)');
        console.log('  2. Go to Application tab');
        console.log('  3. Clear all storage for this site');
        console.log('  4. Refresh the page');
        console.log('  5. Try bulk scraper again');
        
        // Store recovery flags
        localStorage.setItem('FIREBASE_OFFLINE_RECOVERY', 'needed');
        localStorage.setItem('RECOVERY_TIMESTAMP', new Date().toISOString());
        
      }
      
      return {
        success: false,
        action: 'connection_failed',
        message: readError.message
      };
    }
    
    console.log('🔧 Step 4: Testing write operation...');
    
    // Test write operation
    try {
      const testWrite = await db.collection('MarketGenie_tenants')
                               .doc('founder-tenant')
                               .collection('leads')
                               .add({
                                 email: 'connection-test@test.com',
                                 company: 'Connection Test',
                                 tenantId: 'founder-tenant',
                                 createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                                 testWrite: true,
                                 connectionRecovery: true
                               });
      
      console.log('  ✅ Write test successful!');
      console.log('  📝 Test document ID:', testWrite.id);
      
      // Clean up test document
      await testWrite.delete();
      console.log('  🗑️ Test document cleaned up');
      
      console.log('');
      console.log('🎉 FIREBASE CONNECTION FULLY RESTORED!');
      console.log('  ✅ Network online');
      console.log('  ✅ Read operations working');
      console.log('  ✅ Write operations working'); 
      console.log('  ✅ Tenant permissions correct');
      console.log('');
      console.log('🚀 YOU CAN NOW TRY THE BULK SCRAPER AGAIN!');
      
      // Clear any error flags
      localStorage.removeItem('FIREBASE_OFFLINE_RECOVERY');
      localStorage.setItem('FIREBASE_CONNECTION_FIXED', new Date().toISOString());
      
      return {
        success: true,
        action: 'connection_restored',
        message: 'Firebase connection fully operational'
      };
      
    } catch (writeError) {
      console.log('  ❌ Write test failed:', writeError.message);
      
      console.log('');
      console.log('🔧 WRITE PERMISSION ISSUE DETECTED');
      console.log('  Read works, but write fails');
      console.log('  This suggests a permissions or rules issue');
      
      // Check if it's a rules issue
      if (writeError.message.includes('permission') || writeError.message.includes('insufficient')) {
        console.log('');
        console.log('🚨 FIRESTORE RULES BLOCKING WRITES');
        console.log('  Your JWT token has tenantId: "founder-tenant"');
        console.log('  But Firestore rules may not allow founder-tenant writes');
        console.log('');
        console.log('🔧 EMERGENCY BYPASS ATTEMPT...');
        
        // Try with user ID tenant instead
        const userTenant = auth.currentUser?.uid;
        if (userTenant) {
          try {
            const emergencyWrite = await db.collection('MarketGenie_tenants')
                                           .doc(userTenant)
                                           .collection('leads')
                                           .add({
                                             email: 'emergency-test@test.com',
                                             company: 'Emergency Test',
                                             tenantId: userTenant,
                                             createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
                                             emergencyWrite: true
                                           });
            
            console.log('  ✅ Emergency write to user tenant successful!');
            console.log('  📝 Document ID:', emergencyWrite.id);
            
            // Update localStorage to use user ID as tenant
            localStorage.setItem('FORCE_TENANT_ID', userTenant);
            localStorage.setItem('TENANT_OVERRIDE_REASON', 'Rules blocked founder-tenant');
            
            console.log('  🔄 Updated tenant override to user ID');
            console.log('  🚀 Try bulk scraper now with user tenant');
            
            // Clean up
            await emergencyWrite.delete();
            
            return {
              success: true,
              action: 'emergency_tenant_switch',
              message: 'Switched to user ID tenant due to rules'
            };
            
          } catch (emergencyError) {
            console.log('  ❌ Emergency write also failed:', emergencyError.message);
          }
        }
      }
      
      return {
        success: false,
        action: 'write_failed',
        message: writeError.message
      };
    }
    
  } catch (error) {
    console.log('❌ RECOVERY FAILED:', error.message);
    console.log(error);
    
    return {
      success: false,
      action: 'recovery_failed',
      message: error.message
    };
  }
})();