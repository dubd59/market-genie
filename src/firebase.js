import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";
import { firebaseErrorHandler } from "./security/FirebaseErrorHandler.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log('🔥 Firebase initialization starting...');

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Set authentication persistence
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('🔐 Firebase auth persistence set to LOCAL');
  } catch (error) {
    console.error('⚠️ Auth persistence setup failed:', error);
  }
})();

// Initialize Firestore with minimal configuration to avoid transport issues
export const db = getFirestore(app);

// Other Firebase services
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Analytics for production
let analytics = null;
try {
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    analytics = getAnalytics(app);
    console.log('📊 Firebase Analytics initialized');
  }
} catch (error) {
  console.log('⚠️ Analytics not available:', error.message);
}

export { analytics };

// Initialize auth provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

console.log('✅ Firebase initialized successfully');

// Reconnection utilities for compatibility
export const reconnectFirebase = async () => {
  try {
    console.log('🔄 Reconnecting Firebase...');
    // Firebase v9+ handles reconnection automatically
    return true;
  } catch (error) {
    console.error('❌ Firebase reconnection failed:', error);
    return false;
  }
};

export const checkConnectionHealth = () => {
  // In Firebase v9+, connection health is managed automatically
  return navigator.onLine;
};

// Export utility functions
export const withErrorHandling = (operation) => {
  return async (...args) => {
    try {
      return await operation(...args);
    } catch (error) {
      firebaseErrorHandler(error, 'Firebase Operation');
      throw error;
    }
  };
};

export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`⏳ Retry ${attempt}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};