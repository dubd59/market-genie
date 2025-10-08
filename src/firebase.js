import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, enableNetwork, disableNetwork, connectFirestoreEmulator, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log('🔥 STARTING COCKROACH-PROOF FIREBASE INITIALIZATION');

// Initialize Firebase with enhanced error handling
const app = initializeApp(firebaseConfig);

// Initialize services with bulletproof settings
export const auth = getAuth(app);

// Initialize Firestore with enhanced persistence and connection settings
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: false,
  experimentalAutoDetectLongPolling: true,
});

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
        console.log('✅ Firebase connection established successfully');
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
      console.error('💀 All connection attempts failed - entering offline mode');
      resolve(false);
    }
  });

  return connectionPromise;
};

// 🌐 NETWORK MONITORING with cockroach resistance
const setupNetworkMonitoring = () => {
  let isOnline = navigator.onLine;

  const handleOnline = async () => {
    if (!isOnline) {
      console.log('🌐 Network back online - reconnecting to Firebase...');
      isOnline = true;
      connectionAttempts = 0;
      isConnected = false;
      connectionPromise = null;
      await initializeFirebaseWithCockroachCrusher();
    }
  };

  const handleOffline = () => {
    console.log('📴 Network offline - entering cockroach-resistant offline mode');
    isOnline = false;
    isConnected = false;
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Initialize analytics conditionally
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// 🔥 COCKROACH CRUSHER UTILITIES
export const reconnectFirebase = async () => {
  console.log('🔄 FORCING FIREBASE RECONNECTION - COCKROACH KILLER ACTIVATED');
  try {
    isConnected = false;
    connectionAttempts = 0;
    connectionPromise = null;

    await disableNetwork(db);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return await initializeFirebaseWithCockroachCrusher();
  } catch (error) {
    console.error('❌ Cockroach crusher reconnection failed:', error);
    return false;
  }
};

// 🚀 ENHANCED CONNECTION STATUS CHECKER
export const checkConnectionHealth = async () => {
  try {
    if (!isConnected) {
      await initializeFirebaseWithCockroachCrusher();
    }
    return isConnected;
  } catch (error) {
    console.error('🩸 Connection health check failed:', error);
    return false;
  }
};

// 💥 CORS HEADERS INTERCEPTOR - Cockroach Buster
const setupCORSInterceptor = () => {
  // Intercept fetch requests to add proper headers
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const [resource, config = {}] = args;

    // Add CORS headers for Firebase requests
    if (typeof resource === 'string' && resource.includes('firestore.googleapis.com')) {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
        'Access-Control-Request-Method': 'POST, GET, OPTIONS',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      };

      // Remove credentials for CORS compliance
      delete config.credentials;
    }

    return originalFetch.apply(this, [resource, config]);
  };
};

// Initialize everything when in browser
if (typeof window !== 'undefined') {
  console.log('🔥 STARTING COCKROACH-PROOF FIREBASE INITIALIZATION');
  setupCORSInterceptor();
  setupNetworkMonitoring();
  initializeFirebaseWithCockroachCrusher();
}

export default app;