/**
 * EMERGENCY CONSOLE MIGRATION - SAFEST APPROACH
 * Run this in browser console at https://market-genie-f2d41.web.app
 * This bypasses all React hook issues and directly migrates your leads
 */

console.log('🚚 EMERGENCY CONSOLE MIGRATION SCRIPT');
console.log('====================================');

// Create migration button in console
const createMigrationButton = () => {
  // Remove existing button if any
  const existingButton = document.getElementById('emergency-migration-btn');
  if (existingButton) {
    existingButton.remove();
  }

  // Create floating migration button
  const button = document.createElement('button');
  button.id = 'emergency-migration-btn';
  button.innerHTML = '🚚 MIGRATE LEADS NOW';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    background: #8B5CF6;
    color: white;
    border: none;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    transition: all 0.3s ease;
  `;

  button.onmouseover = () => {
    button.style.background = '#7C3AED';
    button.style.transform = 'scale(1.05)';
  };

  button.onmouseout = () => {
    button.style.background = '#8B5CF6';
    button.style.transform = 'scale(1)';
  };

  button.onclick = async () => {
    button.innerHTML = '🔄 MIGRATING...';
    button.disabled = true;
    button.style.background = '#6B7280';

    try {
      await runMigration();
    } catch (error) {
      console.error('Migration failed:', error);
      alert(`❌ Migration failed: ${error.message}`);
    } finally {
      button.remove();
    }
  };

  document.body.appendChild(button);
  console.log('✅ Migration button added to page (top-right corner)');
};

// Migration function
const runMigration = async () => {
  console.log('🚚 Starting migration...');

  // Get tenant info
  let tenantId = null;
  
  if (window.currentMarketGenieTenant?.id) {
    tenantId = window.currentMarketGenieTenant.id;
  } else {
    // Try localStorage
    try {
      const savedTenant = localStorage.getItem('marketgenie_current_tenant');
      if (savedTenant) {
        const tenant = JSON.parse(savedTenant);
        tenantId = tenant.id;
      }
    } catch (e) {
      console.error('Could not get tenant from localStorage:', e);
    }
  }

  if (!tenantId) {
    throw new Error('No tenant ID found. Please refresh the page and try again.');
  }

  console.log(`📍 Migrating to tenant: ${tenantId}`);

  // Try using emergency storage service
  if (window.emergencyStorageSync?.migrateDefaultTenantLeads) {
    console.log('🔄 Using emergency storage migration service...');
    const result = await window.emergencyStorageSync.migrateDefaultTenantLeads();
    
    if (result.success) {
      console.log('✅ Migration successful:', result);
      alert(`🎉 SUCCESS!\n\nMigrated: ${result.migrated} leads\nSkipped: ${result.skipped} leads\n\nCheck your Recent Leads tab now!`);
      
      // Force refresh Recent Leads
      window.dispatchEvent(new CustomEvent('forceLoadLeadsFromDatabase', {
        detail: { migratedCount: result.migrated }
      }));
      
      return result;
    } else {
      throw new Error(result.error);
    }
  } else {
    throw new Error('Emergency storage migration service not available. Please refresh the page and try again.');
  }
};

// Run setup
createMigrationButton();

console.log('💡 INSTRUCTIONS:');
console.log('1. Look for the purple "🚚 MIGRATE LEADS NOW" button in the top-right corner');
console.log('2. Click it to start the migration');
console.log('3. Wait for the success message');
console.log('4. Check your Recent Leads tab');
console.log('');
console.log('If you don\'t see the button, refresh the page and run this script again.');

// Also provide manual function
window.emergencyMigrate = runMigration;
console.log('💡 Alternative: Type "emergencyMigrate()" in console to run migration manually');