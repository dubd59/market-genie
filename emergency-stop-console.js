/**
 * EMERGENCY STOP SCRIPT
 * Run this in your browser console RIGHT NOW to stop the infinite lead loop!
 * Just copy and paste this entire block into the console at https://market-genie-f2d41.web.app
 */

(async function emergencyStopInfiniteLoop() {
  console.log('🛑 EMERGENCY STOP: Stopping infinite lead loop...');
  
  try {
    // Stop background sync
    if (window.emergencyStorageSync) {
      window.emergencyStorageSync.stopBackgroundDatabaseSync();
      console.log('✅ Stopped background sync');
    }
    
    // Clear emergency leads from localStorage
    localStorage.removeItem('marketgenie_emergency_leads');
    console.log('✅ Cleared emergency leads from browser storage');
    
    // Clear any intervals that might be running
    for (let i = 1; i < 99999; i++) {
      clearInterval(i);
    }
    console.log('✅ Cleared all intervals');
    
    console.log('🎉 EMERGENCY STOP COMPLETE!');
    console.log('💡 The infinite loop should now be stopped.');
    console.log('💡 Refresh the page to be safe.');
    
    // Show alert
    alert('🛑 Emergency stop complete! The infinite loop has been stopped. Please refresh the page.');
    
  } catch (error) {
    console.error('❌ Emergency stop failed:', error);
    alert('❌ Emergency stop failed. Please refresh the page and try again.');
  }
})();

console.log('🚨 EMERGENCY STOP SCRIPT LOADED - Executing now...');