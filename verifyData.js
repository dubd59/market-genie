// Simple verification script
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize with service account key
try {
  const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'market-genie-f2d41'
  });
  
  console.log('✅ Firebase Admin initialized successfully!');
} catch (error) {
  console.log('❌ Error loading service account key:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function verifyData() {
  console.log('🔍 Verifying data creation...\n');

  try {
    // Check MarketGenie_tenants
    console.log('1. Checking MarketGenie_tenants collection:');
    const marketGenieTenants = await db.collection('MarketGenie_tenants').get();
    if (!marketGenieTenants.empty) {
      marketGenieTenants.forEach(doc => {
        console.log(`   ✅ ${doc.id}:`, {
          name: doc.data().name,
          ownerId: doc.data().ownerId,
          status: doc.data().status
        });
      });
    } else {
      console.log('   ❌ No documents found in MarketGenie_tenants');
    }

    // Check tenants
    console.log('\n2. Checking tenants collection:');
    const tenants = await db.collection('tenants').get();
    if (!tenants.empty) {
      tenants.forEach(doc => {
        console.log(`   ✅ ${doc.id}:`, {
          name: doc.data().name,
          ownerId: doc.data().ownerId,
          status: doc.data().status
        });
      });
    } else {
      console.log('   ❌ No documents found in tenants');
    }

    // Check deals
    console.log('\n3. Checking deals collection:');
    const deals = await db.collection('deals').get();
    console.log(`   Found ${deals.size} deals`);

    // Check contacts
    console.log('\n4. Checking contacts collection:');
    const contacts = await db.collection('contacts').get();
    console.log(`   Found ${contacts.size} contacts`);

    // Check companies
    console.log('\n5. Checking companies collection:');
    const companies = await db.collection('companies').get();
    console.log(`   Found ${companies.size} companies`);

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  }

  process.exit(0);
}

verifyData();