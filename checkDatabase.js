// Database check using Firebase Admin SDK
// This script has full administrative access and bypasses Firestore security rules
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
// Supports GOOGLE_APPLICATION_CREDENTIALS environment variable or default path
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account-key.json';

try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'market-genie-f2d41'
  });
  
  console.log('✅ Firebase Admin initialized successfully!');
} catch (error) {
  console.log('❌ Error loading service account key:', error.message);
  console.log('\n📝 To fix this:');
  console.log('1. Download your service account key from Firebase Console');
  console.log('2. Save it as service-account-key.json in the project root');
  console.log('   OR set GOOGLE_APPLICATION_CREDENTIALS environment variable');
  console.log('3. Run this script again');
  process.exit(1);
}

const db = admin.firestore();

async function checkDatabase() {
  try {
    console.log('🔍 Checking Firebase Collection Structure...');
    console.log(' Checking tenant collection...');
    
    const tenantsRef = db.collection('MarketGenie_tenants');
    const snapshot = await tenantsRef.get();
    
    if (snapshot.empty) {
      console.log('❌ No tenants found in MarketGenie_tenants collection');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} tenant(s):`);
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n📄 Tenant ID: ${doc.id}`);
      console.log(`   Owner: ${data.ownerEmail || 'N/A'} (${data.ownerId || 'N/A'})`);
      console.log(`   Plan: ${data.plan || data.planType || 'N/A'}`);
      console.log(`   Status: ${data.status || 'N/A'}`);
      console.log(`   Created: ${data.createdAt?.toDate?.() || data.created_at?.toDate?.() || 'N/A'}`);
      if (data.features) {
        console.log(`   Features: ${Object.keys(data.features).filter(k => data.features[k]).join(', ')}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkDatabase();