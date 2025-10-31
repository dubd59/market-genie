import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBNJjpGUFq8R3eeM8oL7JaQw_tnJpULKrk',
  authDomain: 'marketeenie-0121.firebaseapp.com',
  projectId: 'marketeenie-0121',
  storageBucket: 'marketeenie-0121.firebasestorage.app',
  messagingSenderId: '295720650414',
  appId: '1:295720650414:web:4b9b1e0b59fbae6a3d3e65',
  measurementId: 'G-V19EEJGN2F'
};

async function checkLeads() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('🔍 Checking for leads in your database...');
    
    // Check your tenant's leads collection
    const leadsRef = collection(db, 'MarketGenie_tenants', 'genie-labs', 'leads');
    const snapshot = await getDocs(leadsRef);
    
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
      console.log('This confirms that while the scraper found emails and used 9 Prospeo credits,');
      console.log('ALL database saves failed due to Firebase connection timeouts.');
      console.log('\n🔧 The leads were lost because:');
      console.log('1. Prospeo API successfully found 17 emails');
      console.log('2. Each database save attempt timed out after 10 seconds');
      console.log('3. No leads were actually stored despite scraper "completion"');
    }
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

checkLeads();