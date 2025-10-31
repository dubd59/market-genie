// Check leads using Firebase Admin SDK
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

async function checkLeads() {
  try {
    console.log('🔍 Checking for leads in your database...');
    
    // Check your tenant's leads collection (as subcollection)
    const leadsRef = db.collection('MarketGenie_tenants').doc('genie-labs').collection('leads');
    const snapshot = await leadsRef.get();
    
    console.log(`\n📊 RESULTS:`);
    console.log(`Total leads found: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      console.log('\n✅ Found these leads:');
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.name || 'No name'} | ${data.email || 'No email'} | ${data.company || 'No company'}`);
      });
    } else {
      console.log('\n❌ NO LEADS FOUND IN DATABASE');
      console.log('This may indicate that:');
      console.log('1. Leads have not been scraped yet');
      console.log('2. Database save operations failed');
      console.log('3. The tenant ID "genie-labs" may not exist or is incorrect');
      console.log('\n💡 Try running checkDatabase.js to see all tenants');
    }
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    console.error('Full error:', error);
  }
}

checkLeads();