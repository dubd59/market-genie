/**
 * EMERGENCY LEAD MIGRATION SCRIPT
 * Move all leads from 'default-tenant' to the correct tenant ID
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

// Firebase configuration - use your project's config
const firebaseConfig = {
  apiKey: "AIzaSyBLJlgBE7VJNYb9-s7CUVZGP8bL8g8QvJo",
  authDomain: "market-genie-f2d41.firebaseapp.com",
  projectId: "market-genie-f2d41",
  storageBucket: "market-genie-f2d41.firebasestorage.app",
  messagingSenderId: "1020521353513",
  appId: "1:1020521353513:web:ad8ee54e0d04e6dd71b93e",
  measurementId: "G-8H9F2BQXD7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Migrate leads from default-tenant to specified tenant
 */
async function migrateLeadsToTenant(targetTenantId) {
  console.log(`🔄 Starting migration from 'default-tenant' to '${targetTenantId}'...`);
  
  try {
    // Step 1: Get all leads from default-tenant
    const defaultTenantLeadsRef = collection(db, 'MarketGenie_tenants', 'default-tenant', 'leads');
    const defaultLeadsQuery = query(defaultTenantLeadsRef, orderBy('createdAt', 'desc'));
    const defaultLeadsSnapshot = await getDocs(defaultLeadsQuery);
    
    console.log(`📊 Found ${defaultLeadsSnapshot.size} leads in default-tenant`);
    
    if (defaultLeadsSnapshot.size === 0) {
      console.log('✅ No leads to migrate');
      return;
    }
    
    // Step 2: Get target tenant leads collection
    const targetTenantLeadsRef = collection(db, 'MarketGenie_tenants', targetTenantId, 'leads');
    
    // Step 3: Migrate each lead
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const leadDoc of defaultLeadsSnapshot.docs) {
      try {
        const leadData = leadDoc.data();
        
        // Update tenant ID in lead data
        const updatedLeadData = {
          ...leadData,
          tenantId: targetTenantId,
          migratedFromDefaultTenant: true,
          migrationTimestamp: new Date().toISOString()
        };
        
        // Add to target tenant
        await addDoc(targetTenantLeadsRef, updatedLeadData);
        
        // Delete from default-tenant (optional - comment out if you want to keep backup)
        // await deleteDoc(leadDoc.ref);
        
        migratedCount++;
        console.log(`✅ Migrated lead: ${leadData.email || leadData.name || 'Unknown'}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to migrate lead ${leadDoc.id}:`, error);
      }
    }
    
    console.log(`🎯 Migration complete! Migrated: ${migratedCount}, Errors: ${errorCount}`);
    
    return {
      success: true,
      migrated: migratedCount,
      errors: errorCount,
      total: defaultLeadsSnapshot.size
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * List all tenant IDs to help identify the correct one
 */
async function listAllTenants() {
  console.log('📋 Listing all tenant IDs...');
  
  try {
    const tenantsRef = collection(db, 'MarketGenie_tenants');
    const tenantsSnapshot = await getDocs(tenantsRef);
    
    console.log('🏢 Available tenants:');
    tenantsSnapshot.docs.forEach(doc => {
      console.log(`  - ${doc.id}`);
    });
    
    return tenantsSnapshot.docs.map(doc => doc.id);
    
  } catch (error) {
    console.error('❌ Failed to list tenants:', error);
    return [];
  }
}

// Example usage - REPLACE WITH YOUR ACTUAL TENANT ID
async function runMigration() {
  console.log('🚀 Emergency Lead Migration Script Starting...');
  
  // First, list all available tenants
  const tenants = await listAllTenants();
  
  // IMPORTANT: Replace this with your ACTUAL tenant ID from the list above
  // Look for the tenant ID that's NOT 'default-tenant' or 'founder-tenant'
  const YOUR_ACTUAL_TENANT_ID = 'U9vez3sI36Ti5JqoWi5gJUMq2nX2'; // CHANGE THIS!
  
  if (!tenants.includes(YOUR_ACTUAL_TENANT_ID)) {
    console.error(`❌ Tenant ID '${YOUR_ACTUAL_TENANT_ID}' not found!`);
    console.log('Available tenants:', tenants);
    return;
  }
  
  // Run the migration
  const result = await migrateLeadsToTenant(YOUR_ACTUAL_TENANT_ID);
  
  if (result.success) {
    console.log(`🎉 SUCCESS! Migrated ${result.migrated} leads to tenant ${YOUR_ACTUAL_TENANT_ID}`);
    console.log('💡 Now refresh your Recent Leads tab to see all your leads!');
  } else {
    console.error('❌ Migration failed:', result.error);
  }
}

// Run the migration
runMigration().catch(console.error);

export { migrateLeadsToTenant, listAllTenants };