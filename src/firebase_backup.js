import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableNetwork, disableNetwork, connectFirestoreEmulator, initializeFirestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
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

// Initialize Firebase with enhanced error handling
const app = initializeApp(firebaseConfig);

// Initialize services with bulletproof settings
export const auth = getAuth(app);

// 🔐 Set authentication persistence to prevent daily login issues
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('🔐 Firebase auth persistence set to LOCAL');
  } catch (error) {
    console.error('⚠️ Auth persistence setup failed:', error);
  }
})();

// Initialize Firestore with CORS-safe configuration
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  cacheSizeBytes: 40000000, // 40MB cache
});

console.log('✅ Firebase initialized successfully');

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

// Enhanced connection monitoring
let isConnected = true;

const monitorConnection = () => {
  const handleOnline = () => {
    if (!isConnected) {
      console.log('🌐 Network back online - Firebase should reconnect automatically');
      isConnected = true;
    }
  };

  const handleOffline = () => {
    console.log('📴 Network offline - Firebase entering offline mode');
    isConnected = false;
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Start monitoring
if (typeof window !== 'undefined') {
  monitorConnection();
}

// Export connection status
export const getConnectionStatus = () => isConnected;

// Enhanced error handling wrapper
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

// Utility function for retrying operations
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
      delay *= 2; // Exponential backoff
    }
  }
};

console.log('🚀 Firebase setup complete - ready for operations');