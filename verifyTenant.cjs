const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./genie-labs/backend/firebase/market-genie-f2d41-firebase-adminsdk-6plvz-7c4a2b3d48.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'market-genie-f2d41'
});

const db = admin.firestore();

async function verifyTenant() {
  try {
    console.log('🔍 Checking MarketGenie_tenants collection...');
    
    // Check if founder-tenant exists
    const founderTenantDoc = await db.collection('MarketGenie_tenants').doc('founder-tenant').get();
    
    if (founderTenantDoc.exists) {
      console.log('✅ Founder tenant found:', founderTenantDoc.data());
    } else {
      console.log('❌ Founder tenant NOT found');
    }
    
    // List all tenants
    console.log('\n🔍 All tenants in MarketGenie_tenants:');
    const allTenants = await db.collection('MarketGenie_tenants').get();
    
    if (allTenants.empty) {
      console.log('❌ No tenants found in MarketGenie_tenants collection');
    } else {
      allTenants.forEach(doc => {
        console.log(`- ${doc.id}:`, doc.data());
      });
    }
    
    // Check user by UID
    console.log('\n🔍 Checking user with UID: U9vez3sI36Ti5JqoWi5gJUMq2nX2');
    const userTenants = await db.collection('MarketGenie_tenants')
      .where('ownerId', '==', 'U9vez3sI36Ti5JqoWi5gJUMq2nX2')
      .get();
    
    if (userTenants.empty) {
      console.log('❌ No tenant found for user UID');
    } else {
      userTenants.forEach(doc => {
        console.log(`✅ Found tenant for user: ${doc.id}`, doc.data());
      });
    }
    
  } catch (error) {
    console.error('❌ Error verifying tenant:', error);
  }
  
  process.exit(0);
}

verifyTenant();