/**
 * EMERGENCY FIREBASE BYPASS SYSTEM
 * When Firebase WebChannel transport fails repeatedly, use this emergency persistence layer
 */

class EmergencyLeadStorage {
  constructor() {
    // 🎯 CRITICAL FIX: Use correct tenant ID for storage key
    const correctTenantId = this.getCorrectTenantId();
    this.storageKey = `emergency_leads_${correctTenantId}`;
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
    console.log(`🎯 Emergency storage initialized for tenant: ${correctTenantId}`);
  }

  /**
   * Get the correct tenant ID - prioritize actual user ID over app tenant
   */
  getCorrectTenantId() {
    // Priority order: Firebase auth user > window.user > localStorage > fallback to known user ID
    const authUser = window.auth?.currentUser?.uid;
    const windowUser = window.user?.uid;
    
    // Check localStorage for user info
    let localStorageUser = null;
    try {
      const userStr = localStorage.getItem('user') || localStorage.getItem('currentUser') || localStorage.getItem('authUser');
      if (userStr) {
        const userData = JSON.parse(userStr);
        localStorageUser = userData.uid || userData.id || userData.userId;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    
    // Check for Firebase persistence
    let firebaseUser = null;
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('firebase:authUser:')) {
          const authData = JSON.parse(localStorage.getItem(key));
          if (authData && authData.uid) {
            firebaseUser = authData.uid;
          }
        }
      });
    } catch (e) {
      // Ignore errors
    }
    
    const knownUserId = 'U9vez3sI36Ti5JqoWi5gJUMq2nX2';
    
    const tenantId = authUser || windowUser || localStorageUser || firebaseUser || knownUserId;
    
    const source = authUser ? 'firebase.auth' : 
                  windowUser ? 'window.user' : 
                  localStorageUser ? 'localStorage.user' :
                  firebaseUser ? 'firebase.persistence' : 'hardcoded.fallback';
    
    console.log(`🎯 Resolved tenant ID: ${tenantId} (source: ${source})`);
    
    // 🚨 CRITICAL: If we're using fallback, warn user
    if (tenantId === knownUserId && !authUser && !windowUser && !localStorageUser && !firebaseUser) {
      console.warn('⚠️ Using hardcoded tenant ID fallback - user may not be properly authenticated');
    }
    
    return tenantId;
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🟢 Network back online - attempting to sync emergency leads');
      this.syncEmergencyLeads();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('🔴 Network offline - switching to emergency storage');
    });
  }

  /**
   * Save lead to emergency local storage when Firebase fails
   */
  saveLeadEmergency(leadData) {
    try {
      const emergencyLeads = this.getEmergencyLeads();
      const leadWithId = {
        ...leadData,
        emergencyId: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        emergencyTimestamp: new Date().toISOString(),
        needsFirebaseSync: true
      };

      emergencyLeads.push(leadWithId);
      localStorage.setItem(this.storageKey, JSON.stringify(emergencyLeads));
      
      console.log('🚨 EMERGENCY: Lead saved to local storage:', leadWithId.email);
      
      // Add to sync queue
      this.syncQueue.push(leadWithId);
      
      return leadWithId;
    } catch (error) {
      console.error('❌ Emergency storage failed:', error);
      throw new Error('Complete storage failure - both Firebase and local storage failed');
    }
  }

  /**
   * Get all emergency leads from local storage
   */
  getEmergencyLeads() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to read emergency leads:', error);
      return [];
    }
  }

  /**
   * Get count of emergency leads waiting for sync
   */
  getEmergencyLeadCount() {
    return this.getEmergencyLeads().filter(lead => lead.needsFirebaseSync).length;
  }

  /**
   * Attempt to sync emergency leads to Firebase when connection is restored
   */
  async syncEmergencyLeads() {
    const emergencyLeads = this.getEmergencyLeads().filter(lead => lead.needsFirebaseSync);
    
    if (emergencyLeads.length === 0) {
      console.log('✅ No emergency leads to sync');
      return [];
    }

    console.log(`🔄 Attempting to sync ${emergencyLeads.length} emergency leads to Firebase database...`);

    const results = [];
    const updatedLeads = [...emergencyLeads]; // Work with a copy to track changes
    
    for (let i = 0; i < updatedLeads.length; i++) {
      const lead = updatedLeads[i];
      try {
        // Remove emergency metadata before syncing
        const cleanLead = { ...lead };
        delete cleanLead.emergencyId;
        delete cleanLead.emergencyTimestamp;
        delete cleanLead.needsFirebaseSync;

        // Try to save to Firebase database - this should be PERSISTENT
        const { createLead } = await import('../services/leadService.js');
        
        // 🎯 CRITICAL FIX: Re-resolve tenant ID at sync time (user might have loaded since init)
        const correctTenantId = this.getCorrectTenantId();
        const currentAppTenant = window.userTenant || window.currentTenant;
        
        console.log(`🎯 EMERGENCY SAVE: Using tenant ${correctTenantId} (app thinks: ${currentAppTenant})`);
        
        // Temporarily override tenant for this save if needed
        const originalTenant = window.userTenant;
        if (currentAppTenant !== correctTenantId) {
          console.log(`🔧 Overriding app tenant ${currentAppTenant} → ${correctTenantId}`);
          window.userTenant = correctTenantId;
        }
        
        const firebaseResult = await createLead(cleanLead, { 
          bulkMode: true,
          forceDatabase: true,  // Force database save, not just UI
          tenantId: correctTenantId  // Explicitly pass correct tenant ID
        });
        
        // Restore original tenant if we changed it
        if (originalTenant !== undefined) {
          window.userTenant = originalTenant;
        }
        
        if (firebaseResult && firebaseResult.success) {
          // Mark as synced to database in our working copy
          updatedLeads[i] = {
            ...lead,
            needsFirebaseSync: false,
            firebaseSyncTimestamp: new Date().toISOString(),
            firebaseId: firebaseResult.id,
            savedToDatabase: true,
            syncedSuccessfully: true
          };
          
          results.push({ success: true, lead: lead.email, firebaseId: firebaseResult.id });
          console.log(`✅ PERMANENTLY saved to Firebase database: ${lead.email} (ID: ${firebaseResult.id})`);
        } else {
          throw new Error('Firebase save returned false/null');
        }
        
      } catch (error) {
        console.error(`❌ Failed to sync emergency lead ${lead.email} to database:`, error);
        results.push({ success: false, lead: lead.email, error: error.message });
      }
    }

    // 🛑 CRITICAL FIX: Save the updated leads array with sync status
    localStorage.setItem(this.storageKey, JSON.stringify(updatedLeads));
    
    const successCount = results.filter(r => r.success).length;
    console.log(`🔄 Emergency database sync complete: ${successCount}/${emergencyLeads.length} leads saved to Firebase database`);
    
    return results;
  }

  /**
   * Start background sync that keeps trying until all leads are saved to database
   */
  startBackgroundDatabaseSync() {
    console.log('🔄 Starting background database sync for emergency leads...');
    
    const syncInterval = setInterval(async () => {
      const pendingLeads = this.getEmergencyLeads().filter(lead => lead.needsFirebaseSync);
      
      if (pendingLeads.length === 0) {
        console.log('✅ All emergency leads synced to database - stopping background sync');
        clearInterval(syncInterval);
        return;
      }
      
      console.log(`🔄 Background sync: Attempting to save ${pendingLeads.length} emergency leads to database...`);
      
      try {
        const results = await this.syncEmergencyLeads();
        const successCount = results.filter(r => r.success).length;
        
        if (successCount > 0) {
          // Show toast notification for successful database saves
          if (window.toast) {
            window.toast.success(`✅ Saved ${successCount} emergency leads to database permanently!`);
          }
          
          // � CRITICAL FIX: Clear synced leads from localStorage to prevent infinite loop
          this.clearSyncedLeads();
          
          // �🔄 FORCE REFRESH of Recent Leads UI to show database leads
          console.log('🔄 Triggering Recent Leads refresh to load database leads...');
          
          // Dispatch custom event to force Recent Leads to reload from database
          window.dispatchEvent(new CustomEvent('forceLoadLeadsFromDatabase', {
            detail: { 
              message: 'Emergency leads saved to database, refresh UI',
              savedCount: successCount 
            }
          }));
        }
        
      } catch (error) {
        console.log('⏳ Background sync failed, will retry in 30 seconds:', error.message);
      }
    }, 30000); // Try every 30 seconds
    
    // Store interval ID for cleanup
    this.syncInterval = syncInterval;
    return syncInterval;
  }

  /**
   * Clear leads that have been successfully synced to database
   */
  clearSyncedLeads() {
    try {
      const emergencyLeads = this.getEmergencyLeads();
      
      // 🎯 CRITICAL FIX: Filter out leads that were actually synced successfully
      const stillPendingLeads = emergencyLeads.filter(lead => {
        const needsSync = lead.needsFirebaseSync !== false;
        const notSynced = !lead.syncedSuccessfully;
        return needsSync && notSynced;
      });
      
      const syncedCount = emergencyLeads.length - stillPendingLeads.length;
      console.log(`🧹 Clearing synced leads: ${syncedCount} synced, ${stillPendingLeads.length} still pending`);
      
      // Save the filtered list back to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(stillPendingLeads));
      
      // 🛑 CRITICAL: If no leads are pending, we're done!
      if (stillPendingLeads.length === 0) {
        console.log('✅ All emergency leads successfully synced - clearing localStorage completely');
        localStorage.removeItem(this.storageKey);
      }
      
      return stillPendingLeads.length;
    } catch (error) {
      console.error('❌ Failed to clear synced leads:', error);
      return -1;
    }
  }

  /**
   * EMERGENCY STOP - Clear all emergency leads and stop sync
   */
  emergencyStop() {
    console.log('🛑 EMERGENCY STOP: Clearing all emergency leads and stopping sync');
    
    // Stop background sync
    this.stopBackgroundDatabaseSync();
    
    // Clear all emergency leads from localStorage
    localStorage.removeItem(this.storageKey);
    
    // Clear sync queue
    this.syncQueue = [];
    
    console.log('🛑 Emergency stop complete - all emergency storage cleared');
    
    return {
      success: true,
      message: 'Emergency stop complete - all emergency leads cleared'
    };
  }

  /**
   * Stop background sync
   */
  stopBackgroundDatabaseSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🛑 Stopped background database sync');
    }
  }

  /**
   * EMERGENCY LEAD MIGRATION - Move leads from default-tenant to current tenant
   */
  async migrateDefaultTenantLeads() {
    console.log('🔄 Starting Emergency Lead Migration from default-tenant...');
    
    try {
      // Get current tenant
      let currentTenantId = null;
      
      if (window.currentMarketGenieTenant?.id) {
        currentTenantId = window.currentMarketGenieTenant.id;
      } else {
        const savedTenant = localStorage.getItem('marketgenie_current_tenant');
        if (savedTenant) {
          const tenant = JSON.parse(savedTenant);
          currentTenantId = tenant.id;
        }
      }
      
      if (!currentTenantId || currentTenantId === 'default-tenant') {
        throw new Error('No valid current tenant found for migration');
      }
      
      console.log(`📍 Migrating to tenant: ${currentTenantId}`);
      
      // Import Firebase functions
      const { collection, getDocs, addDoc, query, orderBy } = await import('../security/SecureFirebase.js');
      const { db } = await import('../firebase.js');
      
      // Get leads from default-tenant
      const defaultLeadsRef = collection(db, 'MarketGenie_tenants', 'default-tenant', 'leads');
      const defaultLeadsQuery = query(defaultLeadsRef, orderBy('createdAt', 'desc'));
      const defaultLeadsSnapshot = await getDocs(defaultLeadsQuery);
      
      console.log(`📊 Found ${defaultLeadsSnapshot.size} leads in default-tenant`);
      
      if (defaultLeadsSnapshot.size === 0) {
        console.log('✅ No leads to migrate');
        return { success: true, migrated: 0, message: 'No leads found in default-tenant' };
      }
      
      // Get target tenant leads collection
      const targetLeadsRef = collection(db, 'MarketGenie_tenants', currentTenantId, 'leads');
      
      // Migrate each lead
      let migratedCount = 0;
      let skippedCount = 0;
      
      for (const leadDoc of defaultLeadsSnapshot.docs) {
        try {
          const leadData = leadDoc.data();
          
          // Skip if already has correct tenant ID
          if (leadData.tenantId === currentTenantId) {
            skippedCount++;
            continue;
          }
          
          // Update tenant ID and add migration metadata
          const migratedLeadData = {
            ...leadData,
            tenantId: currentTenantId,
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
      
      console.log(`🎉 Migration Complete! Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
      
      // Force refresh Recent Leads
      window.dispatchEvent(new CustomEvent('forceLoadLeadsFromDatabase', {
        detail: { 
          message: 'Leads migrated from default-tenant',
          migratedCount: migratedCount 
        }
      }));
      
      return {
        success: true,
        migrated: migratedCount,
        skipped: skippedCount,
        total: defaultLeadsSnapshot.size,
        message: `Successfully migrated ${migratedCount} leads to ${currentTenantId}`
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
   * Sync emergency leads directly to Recent Leads UI (bypass Firebase)
   * This shows emergency leads in the UI immediately while Firebase is down
   */
  async syncEmergencyLeadsToUI() {
    const emergencyLeads = this.getEmergencyLeads().filter(lead => lead.needsFirebaseSync);
    
    if (emergencyLeads.length === 0) {
      console.log('✅ No emergency leads to sync to UI');
      return [];
    }

    console.log(`📱 Syncing ${emergencyLeads.length} emergency leads to Recent Leads UI...`);

    try {
      // Dispatch custom event to update Recent Leads section
      const syncEvent = new CustomEvent('emergencyLeadsSync', {
        detail: {
          leads: emergencyLeads.map(lead => ({
            id: lead.emergencyId,
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            company: lead.company,
            title: lead.title || 'Executive',
            source: lead.source || 'emergency-storage',
            status: 'emergency-saved',
            createdAt: lead.emergencyTimestamp,
            notes: lead.notes || 'Saved during Firebase outage'
          }))
        }
      });

      window.dispatchEvent(syncEvent);
      console.log(`📱 Successfully synced ${emergencyLeads.length} emergency leads to UI`);
      
      return emergencyLeads;
    } catch (error) {
      console.error('❌ Failed to sync emergency leads to UI:', error);
      throw error;
    }
  }

  /**
   * Get emergency leads formatted for UI display
   */
  getEmergencyLeadsForUI() {
    const emergencyLeads = this.getEmergencyLeads();
    return emergencyLeads.map(lead => ({
      id: lead.emergencyId,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      company: lead.company,
      title: lead.title || 'Executive',
      source: '🚨 Emergency Storage',
      status: lead.needsFirebaseSync ? 'emergency-pending' : 'emergency-synced',
      createdAt: lead.emergencyTimestamp,
      notes: lead.notes || 'Saved during Firebase outage',
      isEmergency: true
    }));
  }

  /**
   * Clear emergency storage (use with caution)
   */
  clearEmergencyStorage() {
    localStorage.removeItem(this.storageKey);
    this.syncQueue = [];
    console.log('🗑️ Emergency storage cleared');
  }

  /**
   * Export emergency leads as CSV for backup
   */
  exportEmergencyLeadsCSV() {
    const leads = this.getEmergencyLeads();
    if (leads.length === 0) return '';

    const headers = ['email', 'firstName', 'lastName', 'company', 'emergencyTimestamp', 'needsFirebaseSync'];
    const rows = leads.map(lead => 
      headers.map(header => lead[header] || '').join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  }
}

// Global emergency storage instance
window.emergencyLeadStorage = new EmergencyLeadStorage();

export default EmergencyLeadStorage;