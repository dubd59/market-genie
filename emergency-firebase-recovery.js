// Emergency Firebase Recovery Script
// Run this when Firebase client connection is completely offline

import admin from 'firebase-admin';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Initialize Firebase Admin SDK
const serviceAccount = require('./service-account-key.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://market-genie-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function emergencyFirebaseRecovery() {
  console.log('🚨 Starting Emergency Firebase Recovery...');
  
  try {
    // Test admin connection
    console.log('1️⃣ Testing Firebase Admin connectivity...');
    const testDoc = await db.collection('MarketGenie_tenants').limit(1).get();
    console.log('✅ Admin SDK connected successfully');
    
    // Check tenant data
    console.log('2️⃣ Checking tenant data integrity...');
    const tenantSnapshot = await db.collection('MarketGenie_tenants').get();
    console.log(`✅ Found ${tenantSnapshot.size} tenants`);
    
    // Check founder tenant specifically
    console.log('3️⃣ Checking founder tenant...');
    const founderTenant = 'U9vez3sI36Ti5JqoWi5gJUMq2nX2';
    const founderDoc = await db.collection('MarketGenie_tenants').doc(founderTenant).get();
    
    if (founderDoc.exists) {
      console.log('✅ Founder tenant accessible');
      
      // Check leads subcollection
      const leadsSnapshot = await db.collection('MarketGenie_tenants')
        .doc(founderTenant)
        .collection('leads')
        .get();
      
      console.log(`✅ Found ${leadsSnapshot.size} leads in founder tenant`);
      
      // List recent leads
      const recentLeads = await db.collection('MarketGenie_tenants')
        .doc(founderTenant)
        .collection('leads')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
      
      console.log('📊 Recent leads:');
      recentLeads.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.email} | ${data.company || 'No company'}`);
      });
      
    } else {
      console.log('❌ Founder tenant not found!');
    }
    
    // Test write capability
    console.log('4️⃣ Testing write capability...');
    const testWrite = await db.collection('system').doc('recovery-test').set({
      timestamp: admin.firestore.Timestamp.now(),
      test: 'Emergency recovery test',
      status: 'admin-write-successful'
    });
    
    console.log('✅ Admin write test successful');
    
    // Recovery recommendations
    console.log('\n🔧 RECOVERY RECOMMENDATIONS:');
    console.log('1. Firebase Admin SDK is working - server-side operations are fine');
    console.log('2. The issue is client-side Firebase connection in the browser');
    console.log('3. Possible causes:');
    console.log('   - Network connectivity issues');
    console.log('   - Browser blocking Firebase domains');
    console.log('   - Firewall or proxy interference');
    console.log('   - Firebase quota limits reached');
    console.log('   - Client-side authentication issues');
    
    console.log('\n✅ Emergency recovery analysis complete!');
    
  } catch (error) {
    console.error('❌ Emergency recovery failed:', error);
  }
}

async function createEmergencyLead(email, company, name = null) {
  console.log(`🚨 Creating emergency lead: ${email}`);
  
  try {
    const founderTenant = 'U9vez3sI36Ti5JqoWi5gJUMq2nX2';
    const leadData = {
      email: email,
      company: company || 'Unknown Company',
      name: name || 'No name',
      createdAt: admin.firestore.Timestamp.now(),
      source: 'emergency-recovery',
      status: 'new',
      isValidated: false,
      emergency: true
    };
    
    await db.collection('MarketGenie_tenants')
      .doc(founderTenant)
      .collection('leads')
      .doc(email.replace(/[.#$\[\]]/g, '_'))
      .set(leadData);
    
    console.log(`✅ Emergency lead saved: ${email}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to save emergency lead ${email}:`, error);
    return false;
  }
}

// Run recovery
const __filename = new URL(import.meta.url).pathname;
if (process.argv[1] === __filename) {
  emergencyFirebaseRecovery().then(() => {
    console.log('\n🏁 Recovery analysis complete');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Recovery failed:', error);
    process.exit(1);
  });
}

export { emergencyFirebaseRecovery, createEmergencyLead };