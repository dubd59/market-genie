// Test the current Prospeo API key and integration
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBoN_nHIdmgJ8aGZE3C3ViEUNKfwZkM7zg",
  authDomain: "market-genie-f2d41.firebaseapp.com",
  projectId: "market-genie-f2d41",
  storageBucket: "market-genie-f2d41.firebasestorage.app",
  messagingSenderId: "1011717577432",
  appId: "1:1011717577432:web:c1e31bf1e9f9c8b8c8fc22"
};

async function testProspeoIntegration() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('🔍 Checking current Prospeo API key in database...');
    
    const tenantId = '8ZJY8LY3g2H3Mw2eRcmd';
    const integrationDoc = doc(db, 'MarketGenie_tenants', tenantId, 'integrations', 'prospeo-io');
    const docSnap = await getDoc(integrationDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('\n📊 Current Prospeo Integration Data:');
      console.log('Status:', data.status);
      console.log('API Key (first 8 chars):', data.apiKey?.substring(0, 8) + '...');
      console.log('Credits:', data.credits);
      console.log('Connection Method:', data.connectionMethod);
      console.log('Connected At:', data.connectedAt);
      console.log('Last Updated:', data._updatedAt);
      
      // Test the API key directly with Firebase proxy
      console.log('\n🧪 Testing API key with Firebase proxy...');
      
      try {
        const response = await fetch('https://leadgenproxy-aopxj7f3aa-uc.a.run.app/api/prospeo-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            apiKey: data.apiKey
          })
        });

        const result = await response.json();
        console.log('Proxy test result:', result);
        
        if (result.success) {
          console.log(`✅ API Key is WORKING! Credits: ${result.credits}`);
        } else {
          console.log(`❌ API Key FAILED: ${result.error}`);
          console.log('\n🔧 Possible solutions:');
          console.log('1. Update API key in the app');
          console.log('2. Check Prospeo account for remaining credits');
          console.log('3. Verify API key format');
        }
      } catch (proxyError) {
        console.log('❌ Proxy test failed:', proxyError.message);
      }
      
      // Test with a real email search
      console.log('\n🔍 Testing real email search (Joel from Buffer)...');
      
      try {
        const emailResponse = await fetch('https://leadgenproxy-aopxj7f3aa-uc.a.run.app', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            provider: 'prospeo',
            apiKey: data.apiKey,
            searchData: {
              firstName: 'Joel',
              lastName: 'Gascoigne',
              domain: 'buffer.com'
            }
          })
        });

        const emailResult = await emailResponse.json();
        console.log('Email search result:', emailResult);
        
        if (emailResult.success) {
          console.log(`✅ Email search WORKING! Found: ${emailResult.data.email}`);
        } else {
          console.log(`❌ Email search FAILED: ${emailResult.error}`);
        }
      } catch (emailError) {
        console.log('❌ Email search failed:', emailError.message);
      }
      
    } else {
      console.log('❌ No Prospeo integration found in database');
      console.log('You need to connect Prospeo.io in the API Keys & Integrations section');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error testing Prospeo integration:', error);
    process.exit(1);
  }
}

testProspeoIntegration();