// SIMPLE FIREBASE CONNECTION FIX - Run this in browser console
// Quick fixes for Firebase connectivity issues

console.log('🔧 QUICK FIREBASE CONNECTION FIX...');

function quickFirebaseFix() {
  console.log('1. Clearing problematic localStorage entries...');
  
  // Clear potential problem entries
  const keysToRemove = [
    'FORCE_TENANT_ID',
    'TENANT_OVERRIDE_REASON', 
    'EMERGENCY_FIREBASE_BYPASS',
    'BYPASS_TENANT_ID',
    'BYPASS_USER_EMAIL',
    'TEMP_TENANT_ID_OVERRIDE'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`   ✅ Removed: ${key}`);
    }
  });
  
  console.log('2. Forcing hard refresh...');
  
  // Force hard refresh to bypass cache
  window.location.href = window.location.href + '?refresh=' + Date.now();
}

console.log('Running quick fix...');
quickFirebaseFix();