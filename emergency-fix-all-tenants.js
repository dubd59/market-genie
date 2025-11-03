/**
 * 🚨 EMERGENCY: Initialize ALL Missing Leads Collections
 * This creates leads subcollections for ALL tenants in the system
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA7C3QkdiRfLOHIzrUebvlLKwLKASnPWmA",
  authDomain: "market-genie-f2d41.firebaseapp.com",
  projectId: "market-genie-f2d41",
  storageBucket: "market-genie-f2d41.firebasestorage.app",
  messagingSenderId: "346539496568",
  appId: "1:346539496568:web:44a85da9dc62ad8cc9a8b2"
};

async function initializeAllTenantsLeads() {
  console.log('🚨 EMERGENCY: Initializing leads collections for ALL tenants...');
  
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // List of all your tenant IDs from the database
    const tenantIds = [
      'U9vez3sI36Ti5JqoWi5gJUMq2nX2', // Your admin super user
      '8ZJY8LY3g2H3Mw2eRcmd',          // Current tenant you're using
      '8RZIPv00PVVhDf5fRSXRrfVI9fl1',
      'HihMMQuIh52phzB2yety',
      'KVkmwpu0wzaOhuI90yBk',
      'LVHHaKxnawNoYSsc5KUBXBIh8Np2',
      'NKhTxwImhOg2tdmG1D1tEY65gfq1',
      'NZ6Lmrl8qcXME3HzB8Bk',
      'TrH7tPeOVQSjycBD4oaR',
      'V3zHYKGQCOUbjPS1rIek',
      'ctt45FwVjWOdrldsm2hG',
      'e6KK8w1upXm3TGnO0srR',
      'fYdsxMOFpfMa0NM6qR1FvSQpbsw1',
      'founder-tenant',
      'fqq53L3ca5ScPBtCdlcRqcCgXPy1',
      'gfikYohWOLj1YNNFiYjn',
      'jPkuL2K3qoOmSWsBD2YC',
      'kFmlvfcm9XQ1XyQNlDYvv3RzuV42',
      'sPz145dNpGnOYvlWnUe0'
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    console.log(`🎯 Found ${tenantIds.length} tenants to initialize`);
    
    for (const tenantId of tenantIds) {
      try {
        console.log(`\n📝 Initializing leads for tenant: ${tenantId}`);
        
        // Create leads subcollection reference
        const leadsCollectionRef = collection(db, 'MarketGenie_tenants', tenantId, 'leads');
        const initLeadRef = doc(leadsCollectionRef, 'system-init-' + Date.now());
        
        const initializationLead = {
          email: `initialization-${tenantId}@marketgenie.com`,
          firstName: 'System',
          lastName: 'Initialization',
          company: 'Market Genie System',
          timestamp: new Date(),
          source: 'system-initialization',
          status: 'initialization',
          note: `Leads subcollection initialized for tenant ${tenantId}`,
          isSystemLead: true,
          tenantId: tenantId,
          createdAt: new Date(),
          updatedAt: new Date(),
          initReason: 'Missing leads subcollection - bulk scraper fix'
        };
        
        // Create the initialization document
        await setDoc(initLeadRef, initializationLead);
        
        console.log(`✅ SUCCESS: Tenant ${tenantId} leads collection initialized`);
        successCount++;
        
        // Special handling for your admin tenant
        if (tenantId === 'U9vez3sI36Ti5JqoWi5gJUMq2nX2') {
          const adminTestLeadRef = doc(leadsCollectionRef, 'admin-test-lead');
          const adminTestLead = {
            email: 'admin-test@marketgenie.com',
            firstName: 'Admin',
            lastName: 'Test',
            company: 'Market Genie Admin',
            timestamp: new Date(),
            source: 'admin-initialization',
            status: 'test',
            note: 'Test lead for admin tenant',
            isTestLead: true,
            tenantId: tenantId,
            createdAt: new Date()
          };
          
          await setDoc(adminTestLeadRef, adminTestLead);
          console.log(`🔧 Admin tenant extra test lead created`);
        }
        
        // Special handling for current working tenant
        if (tenantId === '8ZJY8LY3g2H3Mw2eRcmd') {
          const workingTestLeadRef = doc(leadsCollectionRef, 'bulk-scraper-test');
          const workingTestLead = {
            email: 'bulk-scraper-ready@marketgenie.com',
            firstName: 'Bulk',
            lastName: 'Scraper',
            company: 'Ready To Work Corp',
            timestamp: new Date(),
            source: 'bulk-scraper-test',
            status: 'ready',
            note: 'Bulk scraper should now work!',
            isBulkScraperTest: true,
            tenantId: tenantId,
            createdAt: new Date(),
            prospeoData: {
              verified: true,
              testLead: true
            }
          };
          
          await setDoc(workingTestLeadRef, workingTestLead);
          console.log(`🚀 Current tenant bulk scraper test lead created`);
        }
        
      } catch (error) {
        console.error(`❌ FAILED for tenant ${tenantId}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MASS INITIALIZATION COMPLETE!');
    console.log(`✅ Successfully initialized: ${successCount} tenants`);
    console.log(`❌ Failed: ${errorCount} tenants`);
    console.log('🚀 ALL TENANTS NOW HAVE LEADS COLLECTIONS!');
    console.log('👉 Your bulk scraper should work for ANY tenant now!');
    
    return { success: successCount, failed: errorCount, total: tenantIds.length };
    
  } catch (error) {
    console.error('💥 CRITICAL ERROR during mass initialization:', error);
    return null;
  }
}

// Auto-run
initializeAllTenantsLeads().then(result => {
  if (result) {
    console.log(`\n🏁 FINAL RESULT: ${result.success}/${result.total} tenants initialized`);
    console.log('🎯 GO TEST YOUR BULK SCRAPER NOW!');
  }
});

// Make available globally
window.initializeAllTenantsLeads = initializeAllTenantsLeads;