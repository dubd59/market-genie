/**
 * SIMPLE CONSOLE MIGRATION SCRIPT
 * Run this in your browser console at https://market-genie-f2d41.web.app
 * This will migrate all leads from 'default-tenant' to your current tenant immediately
 */

(async function simpleLeadMigration() {
  console.log('🚚 Starting Simple Lead Migration...');
  
  try {
    // Get current tenant ID
    const currentTenant = window.currentMarketGenieTenant;
    if (!currentTenant || !currentTenant.id) {
      console.error('❌ No current tenant found! Make sure you are logged in.');
      alert('❌ No tenant found. Please make sure you are logged in and try again.');
      return;
    }
    
    console.log(`📍 Current tenant: ${currentTenant.id}`);
    
    // Import necessary Firebase functions
    const { collection, getDocs, addDoc, query, orderBy } = await import('./src/security/SecureFirebase.js');
    const { db } = await import('./src/firebase.js');
    
    // Get all leads from default-tenant
    console.log('📊 Fetching leads from default-tenant...');
    const defaultLeadsRef = collection(db, 'MarketGenie_tenants', 'default-tenant', 'leads');
    const defaultLeadsQuery = query(defaultLeadsRef, orderBy('createdAt', 'desc'));
    const defaultLeadsSnapshot = await getDocs(defaultLeadsQuery);
    
    console.log(`📊 Found ${defaultLeadsSnapshot.size} leads in default-tenant`);
    
    if (defaultLeadsSnapshot.size === 0) {
      console.log('✅ No leads to migrate');
      alert('✅ No leads found in default-tenant to migrate.');
      return;
    }
    
    // Get target tenant leads collection
    const targetLeadsRef = collection(db, 'MarketGenie_tenants', currentTenant.id, 'leads');
    
    // Migrate each lead
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    console.log('🔄 Starting migration...');
    
    for (const leadDoc of defaultLeadsSnapshot.docs) {
      try {
        const leadData = leadDoc.data();
        
        // Skip if already has correct tenant ID
        if (leadData.tenantId === currentTenant.id) {
          skippedCount++;
          continue;
        }
        
        // Create migrated lead data
        const migratedLeadData = {
          ...leadData,
          tenantId: currentTenant.id,
          migratedFromDefaultTenant: true,
          migrationTimestamp: new Date().toISOString(),
          originalDefaultTenantId: leadDoc.id
        };
        
        // Remove emergency metadata if exists
        delete migratedLeadData.emergencyId;
        delete migratedLeadData.emergencyTimestamp;
        delete migratedLeadData.needsFirebaseSync;
        
        // Add to correct tenant collection
        await addDoc(targetLeadsRef, migratedLeadData);
        migratedCount++;
        
        console.log(`✅ Migrated: ${leadData.email || leadData.name || 'Unknown'}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to migrate lead ${leadDoc.id}:`, error);
      }
    }
    
    console.log(`🎉 Migration Complete!`);
    console.log(`✅ Migrated: ${migratedCount} leads`);
    console.log(`⏭️ Skipped: ${skippedCount} leads (already correct tenant)`);
    console.log(`❌ Errors: ${errorCount} leads`);
    
    // Force refresh Recent Leads
    console.log('🔄 Refreshing Recent Leads...');
    window.dispatchEvent(new CustomEvent('forceLoadLeadsFromDatabase', {
      detail: { 
        message: 'Leads migrated from default-tenant',
        migratedCount: migratedCount 
      }
    }));
    
    // Show success message
    alert(`🎉 Migration Complete!\n\n✅ Migrated: ${migratedCount} leads\n⏭️ Skipped: ${skippedCount} leads\n❌ Errors: ${errorCount} leads\n\nCheck your Recent Leads tab now!`);
    
    console.log('💡 Check your Recent Leads tab now!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    alert(`❌ Migration failed: ${error.message}\n\nPlease try refreshing the page and running the script again.`);
  }
})();

console.log('🚚 Simple Lead Migration Script loaded! Migration starting...');