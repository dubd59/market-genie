// NUCLEAR FIREBASE RESET - Run this in browser console
// This will completely reset Firebase connections and force a clean restart

console.log('🚨 NUCLEAR FIREBASE CONNECTION RESET...');

async function nuclearFirebaseReset() {
  console.log('1. 🔥 Terminating all Firebase connections...');
  
  // Try to access Firebase app instances and terminate them
  try {
    if (window.firebase && window.firebase.apps) {
      console.log(`Found ${window.firebase.apps.length} Firebase apps`);
      for (let app of window.firebase.apps) {
        try {
          if (app.firestore) {
            console.log('   🔥 Terminating Firestore...');
            await app.firestore().terminate();
          }
          console.log(`   🔥 Deleting app: ${app.name}`);
          await app.delete();
        } catch (e) {
          console.log(`   ⚠️ Error deleting app: ${e.message}`);
        }
      }
    }
  } catch (e) {
    console.log(`   ⚠️ Firebase apps cleanup error: ${e.message}`);
  }

  console.log('2. 🧹 Clearing ALL browser storage...');
  
  // Clear localStorage completely
  console.log('   🧹 Clearing localStorage...');
  localStorage.clear();
  
  // Clear sessionStorage
  console.log('   🧹 Clearing sessionStorage...');
  sessionStorage.clear();
  
  // Clear IndexedDB
  console.log('   🧹 Clearing IndexedDB...');
  try {
    const databases = await indexedDB.databases();
    for (let db of databases) {
      console.log(`   🗑️ Deleting database: ${db.name}`);
      indexedDB.deleteDatabase(db.name);
    }
  } catch (e) {
    console.log(`   ⚠️ IndexedDB cleanup error: ${e.message}`);
  }
  
  // Clear service worker caches
  console.log('   🧹 Clearing service worker caches...');
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (let name of cacheNames) {
        console.log(`   🗑️ Deleting cache: ${name}`);
        await caches.delete(name);
      }
    }
  } catch (e) {
    console.log(`   ⚠️ Cache cleanup error: ${e.message}`);
  }

  console.log('3. 🔄 Forcing hard reload with cache bypass...');
  
  // Add timestamp to force complete reload
  const currentUrl = new URL(window.location);
  currentUrl.searchParams.set('reset', Date.now());
  currentUrl.searchParams.set('nocache', 'true');
  
  // Force reload bypassing all caches
  window.location.replace(currentUrl.toString());
}

console.log('🚨 WARNING: This will clear ALL browser data for this site and force reload!');
console.log('🚨 You will need to sign in again after this reset.');
console.log('');
console.log('Starting nuclear reset in 3 seconds...');

setTimeout(() => {
  nuclearFirebaseReset().catch(console.error);
}, 3000);