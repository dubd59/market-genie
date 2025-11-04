// Firebase Connection Test - Direct to the core issue
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "market-genie-f2d41.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "market-genie-f2d41",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "market-genie-f2d41.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

console.log('🔥 Testing Firebase connection...');

// Test basic Firebase connection
async function testFirebaseConnection() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test a simple write operation
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: "Connection test"
    };
    
    console.log('🔍 Attempting direct Firestore write...');
    
    const docRef = await addDoc(collection(db, 'test-connection'), testData);
    
    console.log('✅ SUCCESS: Document written with ID:', docRef.id);
    return true;
    
  } catch (error) {
    console.error('❌ FIREBASE CONNECTION FAILED:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return false;
  }
}

// Run the test
testFirebaseConnection()
  .then(success => {
    if (success) {
      console.log('🎉 Firebase connection is working!');
    } else {
      console.log('💥 Firebase connection has issues');
    }
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
  });