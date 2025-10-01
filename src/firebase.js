import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, enableNetwork, disableNetwork, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services with improved settings
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Initialize analytics conditionally
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Enhanced connection management
let isOnline = true;
let retryCount = 0;
const maxRetries = 3;

// Monitor connection status
export const monitorConnection = () => {
  window.addEventListener('online', () => {
    console.log('Network online - re-enabling Firestore');
    isOnline = true;
    enableNetwork(db);
  });
  
  window.addEventListener('offline', () => {
    console.log('Network offline - using Firestore offline mode');
    isOnline = false;
  });
};

export const retryFirebaseConnection = async () => {
  if (retryCount < maxRetries && isOnline) {
    try {
      console.log(`Attempting Firebase connection retry ${retryCount + 1}/${maxRetries}`);
      await disableNetwork(db);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      await enableNetwork(db);
      retryCount++;
      console.log(`Firebase connection retry ${retryCount}/${maxRetries} successful`);
      return true;
    } catch (error) {
      console.error('Firebase retry failed:', error);
      retryCount++;
      return false;
    }
  }
  return false;
};

// Initialize connection monitoring
if (typeof window !== 'undefined') {
  monitorConnection();
}

export default app;
