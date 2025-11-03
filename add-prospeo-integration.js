// ADD PROSPEO INTEGRATION TO CLEAN TENANT
console.log('🔌 Adding Prospeo integration to clean tenant...');

async function addProspeoIntegration() {
    try {
        // Get Firebase from your app
        let db;
        if (window.firebase && window.firebase.firestore) {
            db = window.firebase.firestore();
            console.log('✅ Using Firebase v8 API');
        } else {
            console.error('❌ Firebase not available');
            return;
        }
        
        const founderTenant = 'U9vez3sI36Ti5JqoWi5gJUMq2nX2';
        
        // Get API key from user
        const prospeoKey = prompt('Enter your Prospeo API key:');
        if (!prospeoKey) {
            console.error('❌ API key required');
            return;
        }
        
        // Add Prospeo integration to founder tenant
        const prospeoData = {
            apiKey: prospeoKey,
            status: 'connected',
            connectedAt: new Date(),
            connectionMethod: 'clean_tenant_fix',
            credits: 75,
            _marketGenieApp: true,
            _securityValidated: true,
            _updatedAt: new Date()
        };
        
        // Add to Firebase - Fixed Firebase v8 syntax
        const integrationRef = db.collection('MarketGenie_tenants')
            .doc(founderTenant)
            .collection('integrations')
            .doc('prospeo-io');
        await integrationRef.set(prospeoData);
        
        console.log('✅ Prospeo integration added to clean tenant!');
        
        // Also add to emergency localStorage
        localStorage.setItem('prospeo_api_key_emergency', prospeoKey);
        localStorage.setItem('prospeo_fix_applied', 'true');
        
        console.log('✅ Emergency localStorage backup set');
        console.log('');
        console.log('🎉 PROSPEO INTEGRATION RESTORED!');
        console.log('Now test the bulk scraper - it should work!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Failed to add Prospeo integration:', error);
        return false;
    }
}

// Run the integration fix
addProspeoIntegration();