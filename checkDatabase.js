// Simple database check using web SDK
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4pJAF4Ao2KbD8aWdgXBQjBqKHKfV5rEE",
  authDomain: "market-genie-f2d41.firebaseapp.com",
  databaseURL: "https://market-genie-f2d41-default-rtdb.firebaseio.com",
  projectId: "market-genie-f2d41",
  storageBucket: "market-genie-f2d41.firebasestorage.app",
  messagingSenderId: "474050672468",
  appId: "1:474050672468:web:c5b61f2a3e5b8e3f8b02a3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDatabase() {
  try {
    console.log('🔍 Checking MarketGenie_tenants collection...');
    
    const tenantsRef = collection(db, 'MarketGenie_tenants');
    const snapshot = await getDocs(tenantsRef);
    
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
      console.log(`   Created: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
      if (data.features) {
        console.log(`   Features: ${Object.keys(data.features).filter(k => data.features[k]).join(', ')}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkDatabase();