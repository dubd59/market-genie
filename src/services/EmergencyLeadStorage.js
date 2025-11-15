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
   * 🚀 NEW: Batch sync method to process leads in smaller chunks for better performance
   */
  async syncEmergencyLeadsBatch(batchSize = 5) {
    const emergencyLeads = this.getEmergencyLeads().filter(lead => lead.needsFirebaseSync);
    
    if (emergencyLeads.length === 0) {
      console.log('✅ No emergency leads to sync');
      return [];
    }

    // Take only the first 'batchSize' leads for processing
    const batchToProcess = emergencyLeads.slice(0, batchSize);
    console.log(`🚀 BATCH SYNC: Processing ${batchToProcess.length} leads out of ${emergencyLeads.length} total`);

    const results = [];
    const allLeads = this.getEmergencyLeads(); // Get all leads for updating
    
    for (let i = 0; i < batchToProcess.length; i++) {
      const lead = batchToProcess[i];
      try {
        // Remove emergency metadata before syncing
        const cleanLead = { ...lead };
        delete cleanLead.emergencyId;
        delete cleanLead.emergencyTimestamp;
        delete cleanLead.needsFirebaseSync;

        // Try to save to Firebase database
        const { createLead } = await import('../services/leadService.js');
        
        const correctTenantId = this.getCorrectTenantId();
        
        const firebaseResult = await createLead(cleanLead, { 
          bulkMode: true,
          forceDatabase: true,
          tenantId: correctTenantId
        });
        
        if (firebaseResult && firebaseResult.success) {
          // Find and mark this lead as synced in the full leads array
          const leadIndex = allLeads.findIndex(l => l.emergencyId === lead.emergencyId);
          if (leadIndex !== -1) {
            allLeads[leadIndex] = {
              ...lead,
              needsFirebaseSync: false,
              firebaseSyncTimestamp: new Date().toISOString(),
              firebaseId: firebaseResult.id,
              savedToDatabase: true,
              syncedSuccessfully: true
            };
          }
          
          results.push({ success: true, lead: lead.email, firebaseId: firebaseResult.id });
          console.log(`✅ BATCH: Saved ${lead.email} to database (${i+1}/${batchToProcess.length})`);
        } else {
          throw new Error('Firebase save returned false/null');
        }
        
        // 🚀 PERFORMANCE: Small delay between saves to avoid overwhelming Firebase
        if (i < batchToProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 250)); // 250ms between saves
        }
        
      } catch (error) {
        console.error(`❌ BATCH: Failed to sync ${lead.email}:`, error.message);
        results.push({ success: false, lead: lead.email, error: error.message });
      }
    }

    // Save the updated leads array back to localStorage
    localStorage.setItem(this.storageKey, JSON.stringify(allLeads));
    
    const successCount = results.filter(r => r.success).length;
    console.log(`🚀 BATCH COMPLETE: ${successCount}/${batchToProcess.length} leads saved to Firebase database`);
    
    return results;
  }

  /**
   * Start background sync that keeps trying until all leads are saved to database
   */
  startBackgroundDatabaseSync() {
    console.log('🔄 Starting background database sync for emergency leads...');
    
    // 🚀 PERFORMANCE FIX: Use adaptive timing - faster when we have leads, slower when empty
    let currentSyncInterval = 15000; // Start with 15 seconds instead of 30
    let consecutiveEmptyChecks = 0;
    
    const performSync = async () => {
      const pendingLeads = this.getEmergencyLeads().filter(lead => lead.needsFirebaseSync);
      
      if (pendingLeads.length === 0) {
        consecutiveEmptyChecks++;
        
        // 🚀 ADAPTIVE TIMING: If no leads for multiple checks, slow down the sync attempts
        if (consecutiveEmptyChecks >= 3) {
          console.log('✅ All emergency leads synced to database - stopping background sync');
          clearInterval(this.syncInterval);
          return;
        }
        
        console.log(`⏳ No emergency leads to sync (check ${consecutiveEmptyChecks}/3)`);
        return;
      }
      
      // Reset consecutive empty checks when we have leads
      consecutiveEmptyChecks = 0;
      
      console.log(`🔄 Background sync: Attempting to save ${pendingLeads.length} emergency leads to database...`);
      
      try {
        // 🚀 BATCH PROCESSING: Limit concurrent saves to avoid overwhelming Firebase
        const batchSize = Math.min(pendingLeads.length, 5); // Process max 5 leads at once
        console.log(`📦 Processing batch of ${batchSize} leads out of ${pendingLeads.length} total`);
        
        const results = await this.syncEmergencyLeadsBatch(batchSize);
        const successCount = results.filter(r => r.success).length;
        
        if (successCount > 0) {
          // Show toast notification for successful database saves
          if (window.toast) {
            window.toast.success(`✅ Saved ${successCount} emergency leads to database permanently!`);
          }
          
          // 🛑 CRITICAL FIX: Clear synced leads from localStorage to prevent infinite loop
          this.clearSyncedLeads();
          
          // 🔄 FORCE REFRESH of Recent Leads UI to show database leads
          console.log('🔄 Triggering Recent Leads refresh to load database leads...');
          
          // Dispatch custom event to force Recent Leads to reload from database
          window.dispatchEvent(new CustomEvent('forceLoadLeadsFromDatabase', {
            detail: { 
              message: 'Emergency leads saved to database, refresh UI',
              savedCount: successCount 
            }
          }));
          
          // 🚀 PERFORMANCE: If we successfully saved leads, check again sooner
          currentSyncInterval = 10000; // Speed up to 10 seconds when actively syncing
        } else {
          // 🚀 PERFORMANCE: If sync failed, slow down a bit to avoid hammering Firebase
          currentSyncInterval = Math.min(currentSyncInterval + 5000, 45000); // Max 45 seconds
        }
        
      } catch (error) {
        console.log(`⏳ Background sync failed, will retry in ${currentSyncInterval/1000} seconds:`, error.message);
        
        // 🚀 PERFORMANCE: Back off more aggressively on errors
        currentSyncInterval = Math.min(currentSyncInterval * 1.5, 60000); // Max 60 seconds
      }
    };
    
    // Initial sync attempt
    performSync();
    
    // 🚀 PERFORMANCE: Use adaptive timing instead of fixed 30-second intervals  
    this.syncInterval = setInterval(performSync, currentSyncInterval);
    return this.syncInterval;
  }

  /**
   * 🚀 NEW: Trigger immediate sync when user switches to Recent Leads tab
   */
  async triggerImmediateSync() {
    const pendingCount = this.getEmergencyLeadCount();
    if (pendingCount === 0) {
      console.log('✅ No emergency leads to sync');
      return { success: true, synced: 0, message: 'No leads to sync' };
    }

    console.log(`🚀 IMMEDIATE SYNC: User requested sync of ${pendingCount} emergency leads`);
    
    try {
      // Use batch sync for better performance
      const results = await this.syncEmergencyLeadsBatch(10); // Larger batch for manual sync
      const successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        this.clearSyncedLeads();
        
        // Force refresh Recent Leads UI
        window.dispatchEvent(new CustomEvent('forceLoadLeadsFromDatabase', {
          detail: { 
            message: `Manual sync: ${successCount} leads saved to database`,
            savedCount: successCount 
          }
        }));
        
        // Show success notification
        if (window.toast) {
          window.toast.success(`🚀 Fast sync: Saved ${successCount} leads to database!`);
        }
      }
      
      return { 
        success: true, 
        synced: successCount, 
        failed: results.length - successCount,
        message: `Synced ${successCount} out of ${results.length} leads` 
      };
      
    } catch (error) {
      console.error('❌ Immediate sync failed:', error);
      return { success: false, error: error.message };
    }
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
    
    // 🚀 SAFETY: Also clear any stuck intervals
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      console.log('🛑 Cleared backup sync interval');
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