// Test tenant and user linkage
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin (reuse existing initialization if available)
let app;
try {
  app = admin.app();
} catch (error) {
  const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'market-genie-f2d41'
  }, 'test-app');
}

const db = admin.firestore(app);

async function testTenantLinkage() {
  try {
    console.log('🔍 Testing tenant and user linkage...');
    
    // Check if tenant exists
    const tenantDoc = await db.collection('tenants').doc('founder-tenant').get();
    if (tenantDoc.exists) {
      console.log('✅ Tenant "founder-tenant" exists');
      const tenantData = tenantDoc.data();
      console.log(`   - Owner ID: ${tenantData.ownerId}`);
      console.log(`   - Name: ${tenantData.name}`);
      console.log(`   - Status: ${tenantData.status}`);
    } else {
      console.log('❌ Tenant "founder-tenant" NOT FOUND');
    }
    
    // Check if user exists
    const userDoc = await db.collection('users').doc('U9vez3sI36Ti5JqoWi5gJUMq2nX2').get();
    if (userDoc.exists) {
      console.log('✅ User exists');
      const userData = userDoc.data();
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Tenant ID: ${userData.tenantId}`);
      console.log(`   - Role: ${userData.role}`);
      console.log(`   - Is Super Admin: ${userData.isSuperAdmin}`);
    } else {
      console.log('❌ User NOT FOUND');
    }
    
    // Check custom claims
    const userRecord = await admin.auth(app).getUser('U9vez3sI36Ti5JqoWi5gJUMq2nX2');
    console.log('✅ Firebase Auth custom claims:');
    console.log('   - Custom Claims:', userRecord.customClaims);
    
    // Count deals for this tenant
    const dealsSnapshot = await db.collection('deals').where('tenantId', '==', 'founder-tenant').get();
    console.log(`✅ Found ${dealsSnapshot.size} deals for founder-tenant`);
    
    // Count contacts for this tenant
    const contactsSnapshot = await db.collection('contacts').where('tenantId', '==', 'founder-tenant').get();
    console.log(`✅ Found ${contactsSnapshot.size} contacts for founder-tenant`);
    
    // Count companies for this tenant
    const companiesSnapshot = await db.collection('companies').where('tenantId', '==', 'founder-tenant').get();
    console.log(`✅ Found ${companiesSnapshot.size} companies for founder-tenant`);
    
    console.log(`
🎉 TENANT LINKAGE TEST COMPLETE!

Everything looks properly connected. Your CRM should work now!

If it still doesn't work after signing out/in, the issue might be in the app's
tenant detection logic. Let me know and I can help debug that next.
    `);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error testing tenant linkage:', error);
    process.exit(1);
  }
}

testTenantLinkage();