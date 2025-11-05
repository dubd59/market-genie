// 🚨 EMERGENCY FIX: Set tenant claims for new user
// Run this in browser console to fix permissions immediately

(async function fixUserPermissions() {
    console.log('🚨 EMERGENCY: Fixing user tenant claims...');
    
    try {
        // The new user's details
        const userId = 'rkkPAWV8fnc41K7PwReQDuiKINm2';
        const tenantId = 'rkkPAWV8fnc41K7PwReQDuiKINm2';
        
        console.log(`🎯 Fixing claims for user: ${userId}`);
        console.log(`🏢 Setting tenant ID: ${tenantId}`);
        
        // Call the deployed function to fix user claims
        const response = await fetch('https://us-central1-market-genie-f2d41.cloudfunctions.net/fixUserClaims', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                tenantId: tenantId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ SUCCESS: User claims fixed!');
            console.log('📊 Result:', result);
            console.log('🔄 Please refresh the page and try again');
            
            // Force token refresh
            if (window.auth && window.auth.currentUser) {
                console.log('🔄 Forcing token refresh...');
                await window.auth.currentUser.getIdToken(true);
                console.log('✅ Token refreshed - permissions should work now!');
            }
            
        } else {
            console.error('❌ FAILED to fix user claims:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Error fixing user claims:', error);
    }
})();