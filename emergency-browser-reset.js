// EMERGENCY BROWSER RESET SCRIPT
// Copy and paste this into browser console at https://market-genie-f2d41.web.app

console.log('🚨 EMERGENCY RESET STARTING...');

// 1. Clear all Firebase connections
if (window.firebase && window.firebase.firestore) {
  try {
    window.firebase.firestore().terminate();
    console.log('✅ Firebase connections terminated');
  } catch (e) {
    console.log('⚠️ Firebase termination error (may be normal):', e.message);
  }
}

// 2. Clear browser cache/storage
try {
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Browser storage cleared');
} catch (e) {
  console.log('⚠️ Storage clear error:', e.message);
}

// 3. Hard reload the page
console.log('🔄 Forcing hard reload in 2 seconds...');
setTimeout(() => {
  location.reload(true);
}, 2000);

console.log('📋 After reload, try the bulk scraper again with 2-3 leads max');
console.log('🎯 If it works, gradually increase to 5-10 leads');