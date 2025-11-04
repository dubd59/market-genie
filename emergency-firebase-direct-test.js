/**
 * 🚨 EMERGENCY FIREBASE DIRECT CONNECTION TEST
 * Bypasses all security wrappers and throttling to test raw Firebase connection
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, addDoc, collection } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBKgX8A23Q2XsJoMWpWdxeZW-fOGYOGr6k",
  authDomain: "market-genie-f2d41.firebaseapp.com",
  projectId: "market-genie-f2d41",
  storageBucket: "market-genie-f2d41.firebasestorage.app",
  messagingSenderId: "1026992745516",
  appId: "1:1026992745516:web:fa28e35fcff067c1b6df26"
};

console.log('🔥 EMERGENCY: Testing direct Firebase connection...');

// Initialize with minimal config
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Using standard getFirestore, NOT initializeFirestore

// Test simple document creation
async function testDirectSave() {
  try {
    console.log('📝 Testing direct Firebase save...');
    
    const testData = {
      email: 'emergency-test@test.com',
      name: 'Emergency Test',
      timestamp: new Date().toISOString(),
      source: 'emergency-direct-test'
    };
    
    // Direct Firebase operation with zero security wrappers
    const testCollection = collection(db, 'emergency-test');
    const docRef = await addDoc(testCollection, testData);
    
    console.log('✅ EMERGENCY SUCCESS: Document saved with ID:', docRef.id);
    return true;
    
  } catch (error) {
    console.error('❌ EMERGENCY FAILURE:', error);
    console.error('Full error:', error.message);
    console.error('Error code:', error.code);
    return false;
  }
}

// Test multiple rapid saves to see if it's a frequency issue
async function testRapidSaves() {
  console.log('🚀 Testing rapid saves...');
  
  for (let i = 1; i <= 5; i++) {
    try {
      const testData = {
        email: `rapid-test-${i}@test.com`,
        batch: i,
        timestamp: new Date().toISOString()
      };
      
      const testCollection = collection(db, 'emergency-rapid-test');
      const docRef = await addDoc(testCollection, testData);
      console.log(`✅ Rapid save ${i}/5 successful: ${docRef.id}`);
      
    } catch (error) {
      console.error(`❌ Rapid save ${i}/5 failed:`, error.message);
    }
    
    // No delay - testing raw Firebase limits
  }
}

// Run emergency tests
console.log('🚨 Starting emergency Firebase tests...');

testDirectSave()
  .then(success => {
    if (success) {
      console.log('✅ Basic save works - testing rapid saves...');
      return testRapidSaves();
    } else {
      console.error('❌ Basic save failed - Firebase connection broken');
    }
  })
  .then(() => {
    console.log('🏁 Emergency tests completed');
  })
  .catch(error => {
    console.error('💥 Emergency tests crashed:', error);
  });