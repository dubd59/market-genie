import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDGf5lx6WqQlZqNjEpqQJMHJ7DGKHLtlD4",
  authDomain: "market-genie-f2d41.firebaseapp.com",
  projectId: "market-genie-f2d41",
  storageBucket: "market-genie-f2d41.appspot.com",
  messagingSenderId: "751823050892",
  appId: "1:751823050892:web:14feff9d4e1b4b7d9e1234"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = 'fqq53L3ca5ScPBtCdlcRqcCgXPy1';
const tenantId = 'fqq53L3ca5ScPBtCdlcRqcCgXPy1';

async function createPartnerRecord() {
  try {
    console.log('🔍 Checking if partner record exists...');
    
    // Check if partner record already exists
    const partnerDoc = await getDoc(doc(db, 'MarketGenie_whitelabel_partners', userId));
    
    if (partnerDoc.exists()) {
      console.log('✅ Partner record already exists:', partnerDoc.data());
      return;
    }
    
    console.log('📝 Creating missing partner record...');
    
    // Create the partner record
    const partnerData = {
      userId: userId,
      tenantId: tenantId,
      contactEmail: 'marketgenie2@gmail.com',
      companyName: 'Market Genie White Label Partner',
      status: 'active',
      activatedAt: new Date(),
      licenseType: 'whiteLabel',
      revenueShare: 0.85,
      nextPaymentDate: null, // One-time payment
      customerCount: 0,
      monthlyRevenue: 0,
      parentTenantId: tenantId,
      paymentSessionId: '{CHECKOUT_SESSION_ID}',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'MarketGenie_whitelabel_partners', userId), partnerData);
    
    console.log('✅ Successfully created partner record!');
    console.log('Partner data:', partnerData);
    
  } catch (error) {
    console.error('❌ Error creating partner record:', error);
  }
}

createPartnerRecord();