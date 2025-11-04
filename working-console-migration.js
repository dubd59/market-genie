/**
 * WORKING CONSOLE MIGRATION SCRIPT
 * This uses the already-loaded Firebase functions instead of trying to import them
 * Run this in your browser console at https://market-genie-f2d41.web.app
 */

// WORKING MIGRATION - PASTE THIS IN CONSOLE NOW!
(async function workingMigration() {
  console.log('🚚 Starting Working Lead Migration...');
  
  try {
    // Check if we have current tenant
    const tenant = window.currentMarketGenieTenant;
    if (!tenant || !tenant.id) {
      alert('❌ No tenant found. Please refresh the page and try again.');
      return;
    }
    
    console.log(`📍 Migrating to tenant: ${tenant.id}`);
    
    // Use the already loaded leadService instead of importing
    const leadService = window.LeadService || (await import('/assets/index-u9hkOLmx.js')).default;
    
    if (!leadService) {
      throw new Error('LeadService not available');
    }
    
    // Use the emergency storage service to run migration
    if (window.emergencyStorageSync && window.emergencyStorageSync.migrateDefaultTenantLeads) {
      console.log('🔄 Using emergency storage migration...');
      
      const result = await window.emergencyStorageSync.migrateDefaultTenantLeads();
      
      if (result.success) {
        alert(`🎉 ${result.message}\n\nMigrated: ${result.migrated} leads\nSkipped: ${result.skipped} leads\n\nCheck your Recent Leads tab now!`);
        console.log('✅ Migration successful:', result);
      } else {
        throw new Error(result.error);
      }
      
    } else {
      // Fallback: Use direct Firebase approach
      console.log('🔄 Using fallback Firebase approach...');
      
      // Create a simple migration using fetch to your Firebase REST API
      const projectId = 'market-genie-f2d41';
      
      // This approach bypasses module loading issues
      const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/MarketGenie_tenants/default-tenant/leads`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📊 Found ${data.documents?.length || 0} leads in default-tenant`);
      
      if (!data.documents || data.documents.length === 0) {
        alert('✅ No leads found in default-tenant to migrate.');
        return;
      }
      
      alert(`📊 Found ${data.documents.length} leads in default-tenant.\n\n⚠️ For security reasons, please use the Admin Panel migration button instead of console migration.\n\nGo to: Admin Panel → Emergency Lead Dashboard → "🚚 Migrate DB Leads"`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    alert(`❌ Migration failed: ${error.message}\n\nPlease try using the Admin Panel instead:\n1. Go to Admin Panel\n2. Find Emergency Lead Dashboard\n3. Click "🚚 Migrate DB Leads" button`);
  }
})();

console.log('🚚 Working Migration Script loaded! Starting migration...');