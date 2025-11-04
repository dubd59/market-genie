// 🛑 EMERGENCY STOP INFINITE LOOP
// Run this immediately to stop the infinite re-syncing

(function emergencyStop() {
    console.log('🛑 EMERGENCY STOP: Stopping infinite loop...');
    
    try {
        // Get the emergency storage service
        const emergencyStorage = window.emergencyLeadStorage;
        if (emergencyStorage) {
            console.log('🛑 Found emergency storage service - executing emergency stop...');
            emergencyStorage.emergencyStop();
        }
        
        // Also manually clear any intervals that might be running
        for (let i = 1; i < 10000; i++) {
            clearInterval(i);
        }
        
        // Clear emergency localStorage manually as backup
        const tenantId = window.userTenant || window.user?.uid || 'default-tenant';
        const storageKey = `emergency_leads_${tenantId}`;
        
        console.log(`🧹 Clearing localStorage key: ${storageKey}`);
        localStorage.removeItem(storageKey);
        
        console.log('✅ Emergency stop complete - infinite loop should be stopped');
        console.log('🔄 Refresh the page to load the fixed code');
        
    } catch (error) {
        console.error('❌ Emergency stop error:', error);
    }
})();