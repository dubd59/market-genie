// EMERGENCY TENANT FIX - Copy and paste this entire script into your browser console
// This will fix the tenant mismatch and add your Prospeo API key

console.log('🚨 EMERGENCY TENANT FIX STARTING...');

// Step 1: First, replace YOUR_PROSPEO_API_KEY with your actual API key
const PROSPEO_API_KEY = prompt('🔑 Enter your Prospeo API key:'); // Will prompt you for the key

if (!PROSPEO_API_KEY || PROSPEO_API_KEY.trim() === '') {
    console.error('❌ STOP! No API key entered!');
    console.log('📝 Please refresh and run the script again, then enter your Prospeo API key when prompted.');
} else {
    // Emergency fix function
    async function emergencyTenantFix() {
        try {
            const founderTenant = 'U9vez3sI36Ti5JqoWi5gJUMq2nX2';
            
            console.log('🔧 Step 1: Clearing wrong tenant data...');
            // Clear all wrong tenant cache
            localStorage.removeItem('tenant_HihMMQuIh52phzB2yety');
            localStorage.removeItem('cached_tenant');
            localStorage.removeItem('currentTenant');
            sessionStorage.clear();
            
            console.log('🔧 Step 2: Setting correct tenant...');
            // Force correct tenant in localStorage
            localStorage.setItem('marketgenie_tenant_id', founderTenant);
            localStorage.setItem('tenant_override', founderTenant);
            localStorage.setItem('emergency_tenant_fix', 'applied');
            localStorage.setItem('correct_tenant_forced', founderTenant);
            localStorage.setItem('tenantId', founderTenant);
            
            console.log('🔧 Step 3: Adding Prospeo API key...');
            // Store API key temporarily in localStorage for the app to pick up
            localStorage.setItem('prospeo_api_key_emergency', PROSPEO_API_KEY);
            localStorage.setItem('prospeo_fix_applied', 'true');
            
            console.log('✅ Emergency fix applied successfully!');
            console.log('📊 Status:');
            console.log('  ✅ Forced tenant to:', founderTenant);
            console.log('  ✅ Cleared wrong tenant cache');
            console.log('  ✅ Added Prospeo API key to emergency storage');
            console.log('');
            console.log('🚀 NEXT STEPS:');
            console.log('1. Refresh your Market Genie app (Ctrl+F5 or Cmd+Shift+R)');
            console.log('2. The app should now use the correct tenant');
            console.log('3. Test the bulk scraper - it should save leads successfully');
            console.log('');
            console.log('🔍 To verify the fix worked, check the console after refresh.');
            console.log('   You should see tenant ID: U9vez3sI36Ti5JqoWi5gJUMq2nX2');
            
            return true;
        } catch (error) {
            console.error('❌ Emergency fix failed:', error);
            console.log('💡 Try refreshing the page and running this script again.');
            return false;
        }
    }
    
    // Run the emergency fix
    emergencyTenantFix();
}