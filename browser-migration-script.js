/**
 * BROWSER CONSOLE MIGRATION SCRIPT
 * Run this directly in your browser console at https://market-genie-f2d41.web.app
 * This will migrate all leads from 'default-tenant' to your current tenant
 */

(async function migrateDefaultTenantLeads() {
  console.log('🔄 Starting Emergency Lead Migration...');
  
  try {
    // Get current tenant from app context
    const currentTenant = window.currentMarketGenieTenant;
    
    if (!currentTenant || !currentTenant.id) {
      console.error('❌ No current tenant found! Make sure you are logged in.');
      return;
    }
    
    console.log(`📍 Current tenant: ${currentTenant.id}`);
    
    // Import Firebase functions
    const { collection, getDocs, addDoc, query, orderBy } = await import('./src/security/SecureFirebase.js');
    const { db } = await import('./src/firebase.js');
    
    // Get leads from default-tenant
    console.log('📊 Fetching leads from default-tenant...');
    const defaultLeadsRef = collection(db, 'MarketGenie_tenants', 'default-tenant', 'leads');
    const defaultLeadsQuery = query(defaultLeadsRef, orderBy('createdAt', 'desc'));
    const defaultLeadsSnapshot = await getDocs(defaultLeadsQuery);
    
    console.log(`📊 Found ${defaultLeadsSnapshot.size} leads in default-tenant`);
    
    if (defaultLeadsSnapshot.size === 0) {
      console.log('✅ No leads to migrate');
      return;
    }
    
    // Get target tenant leads collection
    const targetLeadsRef = collection(db, 'MarketGenie_tenants', currentTenant.id, 'leads');
    
    // Migrate each lead
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const leadDoc of defaultLeadsSnapshot.docs) {
      try {
        const leadData = leadDoc.data();
        
        // Skip if already has correct tenant ID
        if (leadData.tenantId === currentTenant.id) {
          skippedCount++;
          continue;
        }
        
        // Update tenant ID and add migration metadata
        const migratedLeadData = {
          ...leadData,
          tenantId: currentTenant.id,
          migratedFromDefaultTenant: true,
          migrationTimestamp: new Date().toISOString(),
          originalDefaultTenantId: leadDoc.id
        };
        
        // Add to correct tenant collection
        await addDoc(targetLeadsRef, migratedLeadData);
        migratedCount++;
        
        console.log(`✅ Migrated: ${leadData.email || leadData.name || 'Unknown'}`);
        
      } catch (error) {
        console.error(`❌ Failed to migrate lead ${leadDoc.id}:`, error);
      }
    }
    
    console.log(`🎉 Migration Complete!`);
    console.log(`✅ Migrated: ${migratedCount} leads`);
    console.log(`⏭️ Skipped: ${skippedCount} leads (already correct tenant)`);
    
    // Force refresh Recent Leads
    console.log('🔄 Refreshing Recent Leads...');
    window.dispatchEvent(new CustomEvent('forceLoadLeadsFromDatabase', {
      detail: { 
        message: 'Leads migrated from default-tenant',
        migratedCount: migratedCount 
      }
    }));
    
    console.log('💡 Check your Recent Leads tab now!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
})();

console.log('🚀 Emergency Lead Migration Script loaded! Migration starting...');