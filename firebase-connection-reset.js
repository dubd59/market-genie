// FIREBASE CONNECTION RESET - Run this in browser console
// This will reset Firebase connection and clear offline cache

console.log('🔄 RESETTING FIREBASE CONNECTION...');

async function resetFirebaseConnection() {
  try {
    console.log('1. Attempting to clear Firebase offline cache...');
    
    // Try multiple methods to clear Firebase cache
    let cacheCleared = false;
    
    // Method 1: Try clearPersistence (Firebase v8/v9)
    if (window.firebase && window.firebase.firestore) {
      try {
        const db = window.firebase.firestore();
        if (typeof db.clearPersistence === 'function') {
          await db.clearPersistence();
          console.log('✅ Firebase cache cleared (v8 method)');
          cacheCleared = true;
        }
      } catch (e) {
        console.log('   v8 clearPersistence failed:', e.message);
      }
    }
    
    // Method 2: Try Firebase v9+ method
    if (!cacheCleared && window.db && typeof window.db.clearPersistence === 'function') {
      try {
        await window.db.clearPersistence();
        console.log('✅ Firebase cache cleared (v9 method)');
        cacheCleared = true;
      } catch (e) {
        console.log('   v9 clearPersistence failed:', e.message);
      }
    }
    
    // Method 3: Force connection termination
    if (!cacheCleared) {
      console.log('⚠️ clearPersistence not available, forcing connection reset...');
      
      // Try to terminate existing connections
      if (window.firebase && window.firebase.firestore) {
        try {
          const db = window.firebase.firestore();
          if (typeof db.terminate === 'function') {
            await db.terminate();
            console.log('✅ Firebase connection terminated');
          }
        } catch (e) {
          console.log('   Connection termination failed:', e.message);
        }
      }
    }
    
    // Clear relevant localStorage
    console.log('2. Clearing localStorage overrides...');
    let clearedCount = 0;
    Object.keys(localStorage).forEach(key => {
      if (key.includes('firebase') || 
          key.includes('Firebase') || 
          key.includes('FORCE_TENANT') || 
          key.includes('EMERGENCY') ||
          key.includes('TEMP_TENANT') ||
          key.includes('BYPASS')) {
        localStorage.removeItem(key);
        console.log(`   Removed: ${key}`);
        clearedCount++;
      }
    });
    console.log(`✅ Cleared ${clearedCount} localStorage entries`);
    
    // Clear IndexedDB Firebase data
    console.log('3. Clearing IndexedDB Firebase data...');
    try {
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name && (db.name.includes('firebase') || db.name.includes('firestore'))) {
            indexedDB.deleteDatabase(db.name);
            console.log(`   Deleted IndexedDB: ${db.name}`);
          }
        }
      }
    } catch (e) {
      console.log('   IndexedDB cleanup failed:', e.message);
    }
    
    console.log('4. Forcing page refresh to reset Firebase...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('Reset failed:', error);
    console.log('📱 Manual fix required:');
    console.log('   1. Close ALL browser tabs');
    console.log('   2. Restart your browser completely');
    console.log('   3. Clear browser cache (Ctrl+Shift+Delete)');
    console.log('   4. Try a different browser if issues persist');
  }
}

resetFirebaseConnection();