// FIND LEADS IN FIREBASE - Run this in browser console
// This script will help you locate where your leads are stored

console.log('🔍 SEARCHING FOR LEADS IN FIREBASE DATABASE...');

async function findLeads() {
  try {
    // Check if Firebase is available
    if (!window.firebase) {
      console.log('❌ Firebase not loaded');
      return;
    }

    const db = window.firebase.firestore();
    const auth = window.firebase.auth();
    const user = auth.currentUser;

    if (!user) {
      console.log('❌ No authenticated user');
      return;
    }

    console.log('✅ User:', user.email);
    console.log('✅ UID:', user.uid);

    // Based on your token analysis, you should use "founder-tenant"
    const correctTenantId = 'founder-tenant';
    
    console.log('\n🔍 SEARCHING IN MULTIPLE LOCATIONS:');

    // 1. Check MarketGenie_tenants/{founder-tenant}/leads
    console.log('\n1. Checking MarketGenie_tenants/founder-tenant/leads...');
    try {
      const founderLeadsRef = db.collection('MarketGenie_tenants')
                                .doc('founder-tenant')
                                .collection('leads');
      const founderSnapshot = await founderLeadsRef.limit(10).get();
      console.log(`   Found ${founderSnapshot.size} leads in founder-tenant`);
      
      if (founderSnapshot.size > 0) {
        console.log('   ✅ LEADS FOUND HERE! Sample:');
        founderSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`     - ${data.firstName || 'No name'} ${data.lastName || ''} | ${data.email || 'No email'} | ${data.company || 'No company'}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    // 2. Check MarketGenie_tenants/{your-uid}/leads
    console.log(`\n2. Checking MarketGenie_tenants/${user.uid}/leads...`);
    try {
      const userLeadsRef = db.collection('MarketGenie_tenants')
                             .doc(user.uid)
                             .collection('leads');
      const userSnapshot = await userLeadsRef.limit(10).get();
      console.log(`   Found ${userSnapshot.size} leads in user tenant`);
      
      if (userSnapshot.size > 0) {
        console.log('   ✅ LEADS FOUND HERE! Sample:');
        userSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`     - ${data.firstName || 'No name'} ${data.lastName || ''} | ${data.email || 'No email'} | ${data.company || 'No company'}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    // 3. Check all tenants to see what exists
    console.log('\n3. Checking all tenants in MarketGenie_tenants...');
    try {
      const tenantsSnapshot = await db.collection('MarketGenie_tenants').get();
      console.log(`   Found ${tenantsSnapshot.size} tenants:`);
      
      for (const tenantDoc of tenantsSnapshot.docs) {
        console.log(`     - ${tenantDoc.id}: ${tenantDoc.data().name || 'No name'}`);
        
        // Check if this tenant has leads
        try {
          const tenantLeadsRef = tenantDoc.ref.collection('leads');
          const tenantLeadsSnapshot = await tenantLeadsRef.limit(1).get();
          if (tenantLeadsSnapshot.size > 0) {
            console.log(`       🎯 HAS LEADS! (${tenantLeadsSnapshot.size}+ leads)`);
          }
        } catch (e) {
          console.log(`       ❌ Cannot check leads: ${e.message}`);
        }
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    // 4. Check old-style MarketGenie_leads collection (if any)
    console.log('\n4. Checking MarketGenie_leads collection...');
    try {
      const oldLeadsRef = db.collection('MarketGenie_leads');
      const oldSnapshot = await oldLeadsRef.where('tenantId', '==', 'founder-tenant').limit(10).get();
      console.log(`   Found ${oldSnapshot.size} leads in old collection`);
      
      if (oldSnapshot.size > 0) {
        console.log('   ✅ LEADS FOUND HERE! Sample:');
        oldSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`     - ${data.firstName || 'No name'} ${data.lastName || ''} | ${data.email || 'No email'} | ${data.company || 'No company'}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('\n🎯 SUMMARY:');
    console.log('Your leads should be in: MarketGenie_tenants/founder-tenant/leads');
    console.log('If no leads found, they may not have been saved yet or saved elsewhere.');

  } catch (error) {
    console.error('❌ Search failed:', error);
  }
}

// Run the search
findLeads();