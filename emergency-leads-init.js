/**
 * 🚨 EMERGENCY: Initialize Missing Leads Collection
 * This script creates the missing leads subcollection that's causing bulk scraper failure
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA7C3QkdiRfLOHIzrUebvlLKwLKASnPWmA",
  authDomain: "market-genie-f2d41.firebaseapp.com",
  projectId: "market-genie-f2d41",
  storageBucket: "market-genie-f2d41.firebasestorage.app",
  messagingSenderId: "346539496568",
  appId: "1:346539496568:web:44a85da9dc62ad8cc9a8b2"
};

async function initializeLeadsCollection() {
  console.log('🚨 EMERGENCY: Initializing missing leads collection...');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const tenantId = '8ZJY8LY3g2H3Mw2eRcmd';
    
    // Create the first lead document to initialize the subcollection
    const leadsCollectionRef = collection(db, 'MarketGenie_tenants', tenantId, 'leads');
    const firstLeadRef = doc(leadsCollectionRef, 'initialization-lead');
    
    const initializationLead = {
      email: 'initialization@marketgenie.com',
      firstName: 'System',
      lastName: 'Initialization',
      company: 'Market Genie System',
      timestamp: new Date(),
      source: 'system-initialization',
      status: 'initialization',
      note: 'This lead was created to initialize the leads subcollection',
      isSystemLead: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 Creating initialization lead...');
    await setDoc(firstLeadRef, initializationLead);
    
    console.log('✅ SUCCESS: Leads collection initialized!');
    console.log('🎯 The bulk scraper should now work properly.');
    
    // Test with a real lead
    const testLeadRef = doc(leadsCollectionRef, 'test-lead-' + Date.now());
    const testLead = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      company: 'Test Company',
      timestamp: new Date(),
      source: 'collection-test',
      status: 'new',
      createdAt: new Date()
    };
    
    console.log('🧪 Testing lead creation...');
    await setDoc(testLeadRef, testLead);
    
    console.log('✅ SUCCESS: Test lead created successfully!');
    console.log('🚀 LEADS COLLECTION IS NOW READY FOR BULK SCRAPER!');
    
    return true;
    
  } catch (error) {
    console.error('❌ FAILED to initialize leads collection:', error);
    console.error('Error details:', error.message);
    return false;
  }
}

// Auto-run when imported
initializeLeadsCollection().then(success => {
  if (success) {
    console.log('🎉 COLLECTION INITIALIZATION COMPLETE!');
    console.log('👉 Go back to your bulk scraper and try again!');
  } else {
    console.log('💥 INITIALIZATION FAILED - Check browser console for errors');
  }
});

// Make available globally
window.initializeLeadsCollection = initializeLeadsCollection;