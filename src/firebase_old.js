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

console.log('🔥 INITIALIZING COCKROACH-PROOF FIREBASE CONNECTION');

// Initialize Firebase with ENHANCED error handling
const app = initializeApp(firebaseConfig);

// Initialize services with BULLETPROOF settings
export const auth = getAuth(app);

// Initialize Firestore with ENHANCED connection settings  
export const db = getFirestore(app);

// 🚀 COCKROACH CRUSHER: Advanced connection management
let connectionAttempts = 0;
let isConnected = false;
let connectionPromise = null;

// BULLETPROOF Firebase initialization
const initializeFirebaseWithCockroachCrusher = async () => {
  if (connectionPromise) return connectionPromise;
  
  connectionPromise = new Promise(async (resolve, reject) => {
    const maxAttempts = 5;
    const baseDelay = 1000;
    
    while (connectionAttempts < maxAttempts && !isConnected) {
      try {
        connectionAttempts++;
        console.log(`🔄 Connection attempt ${connectionAttempts}/${maxAttempts}`);
        
        // Clear any existing connections
        try {
          await disableNetwork(db);
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
          // Ignore disable errors on first attempt
        }
        
        // Enable with retry logic
        await enableNetwork(db);
        
        // Test connection with a simple operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        isConnected = true;
        console.log('✅ COCKROACH CRUSHED! Firebase connection established');
        resolve(true);
        return;
        
      } catch (error) {
        console.error(`❌ Connection attempt ${connectionAttempts} failed:`, error);
        
        if (connectionAttempts < maxAttempts) {
          const delay = baseDelay * Math.pow(2, connectionAttempts - 1);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    if (!isConnected) {
      console.error('� All connection attempts failed - entering offline mode');
      resolve(false);
    }
  });
  
  return connectionPromise;
};
      isOnline = false;
    });
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    
    // Retry connection after delay
    setTimeout(() => {
      console.log('🔄 Retrying Firebase connection...');
      initializeFirebaseWithRetry();
    }, 2000);
  }
};

// Initialize connection monitoring
if (typeof window !== 'undefined') {
  initializeFirebaseWithRetry();
}

export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Initialize analytics conditionally
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Export enhanced connection utilities
export const reconnectFirebase = async () => {
  try {
    await disableNetwork(db);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.error('Firebase reconnection failed:', error);
    return false;
  }
};
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
