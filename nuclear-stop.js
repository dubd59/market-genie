/**
 * NUCLEAR STOP SCRIPT - IMMEDIATE HALT
 * Run this RIGHT NOW to stop the infinite localStorage loop
 */

// NUCLEAR STOP - PASTE THIS IN CONSOLE IMMEDIATELY!
(function() {
  console.log('🛑 NUCLEAR STOP: Halting all emergency processes...');
  
  // 1. Stop all background sync intervals
  if (window.emergencyStorageSync) {
    window.emergencyStorageSync.stopBackgroundDatabaseSync();
    console.log('✅ Stopped background sync');
  }
  
  // 2. Clear all intervals (nuclear approach)
  for (let i = 1; i < 99999; i++) {
    clearInterval(i);
    clearTimeout(i);
  }
  console.log('✅ Cleared all intervals and timeouts');
  
  // 3. NUKE the emergency localStorage
  localStorage.removeItem('marketgenie_emergency_leads');
  console.log('✅ Cleared emergency leads from localStorage');
  
  // 4. Clear any other Market Genie localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.toLowerCase().includes('marketgenie') || key.toLowerCase().includes('emergency')) {
      localStorage.removeItem(key);
      console.log(`✅ Cleared localStorage: ${key}`);
    }
  });
  
  // 5. Stop any running migration processes
  window.emergencyStorageSync = null;
  window.emergencyMigrate = null;
  
  // 6. Remove any floating buttons
  const existingButton = document.getElementById('emergency-migration-btn');
  if (existingButton) {
    existingButton.remove();
    console.log('✅ Removed migration button');
  }
  
  console.log('🎉 NUCLEAR STOP COMPLETE!');
  console.log('💡 Refresh the page to start fresh');
  
  alert('🛑 EMERGENCY STOP COMPLETE!\n\nAll emergency processes halted.\nLocalStorage cleared.\n\nPlease REFRESH the page now.');
  
})();