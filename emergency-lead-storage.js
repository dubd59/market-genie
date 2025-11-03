/**
 * EMERGENCY LEAD STORAGE SYSTEM
 * For use when Firebase is completely offline
 * Stores leads locally with sync capabilities
 */

class EmergencyLeadStorage {
    constructor() {
        this.storageKey = 'emergency_leads_backup';
        this.tenantId = '8ZJY8LY3g2H3Mw2eRcmd';
        this.leads = this.loadFromStorage();
        this.syncQueue = [];
        
        console.log('🚨 Emergency Lead Storage System Activated');
        console.log(`📦 Loaded ${this.leads.length} leads from local storage`);
    }

    // Store lead locally when Firebase is down
    storeLeadOffline(leadData) {
        try {
            const emergencyLead = {
                ...leadData,
                id: this.generateLeadId(),
                tenantId: this.tenantId,
                storedAt: new Date().toISOString(),
                status: 'pending_sync',
                source: 'emergency_storage'
            };

            this.leads.push(emergencyLead);
            this.saveToStorage();
            this.addToSyncQueue(emergencyLead);

            console.log('💾 Lead stored offline:', emergencyLead.email);
            return { success: true, leadId: emergencyLead.id };
        } catch (error) {
            console.error('❌ Emergency storage failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Load leads from localStorage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('❌ Failed to load from storage:', error);
            return [];
        }
    }

    // Save leads to localStorage
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.leads));
            console.log(`💾 Saved ${this.leads.length} leads to local storage`);
        } catch (error) {
            console.error('❌ Failed to save to storage:', error);
        }
    }

    // Add lead to sync queue for later Firebase upload
    addToSyncQueue(lead) {
        this.syncQueue.push(lead);
        localStorage.setItem('emergency_sync_queue', JSON.stringify(this.syncQueue));
    }

    // Generate unique lead ID
    generateLeadId() {
        return `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get all stored leads
    getAllLeads() {
        return this.leads.filter(lead => lead.tenantId === this.tenantId);
    }

    // Get leads pending sync
    getPendingSync() {
        return this.leads.filter(lead => lead.status === 'pending_sync');
    }

    // Attempt to sync with Firebase when connection is restored
    async syncWithFirebase() {
        if (this.syncQueue.length === 0) {
            console.log('✅ No leads to sync');
            return { success: true, synced: 0 };
        }

        console.log(`🔄 Attempting to sync ${this.syncQueue.length} leads...`);
        
        let synced = 0;
        let failed = 0;

        for (const lead of this.syncQueue) {
            try {
                // Test Firebase connection first
                const connectionTest = await this.testFirebaseConnection();
                if (!connectionTest) {
                    console.log('❌ Firebase still offline, aborting sync');
                    break;
                }

                // Attempt to save to Firebase
                const result = await this.saveToFirebase(lead);
                if (result.success) {
                    // Mark as synced
                    lead.status = 'synced';
                    lead.syncedAt = new Date().toISOString();
                    synced++;
                    console.log(`✅ Synced: ${lead.email}`);
                } else {
                    failed++;
                    console.log(`❌ Failed to sync: ${lead.email}`);
                }
            } catch (error) {
                failed++;
                console.error(`❌ Sync error for ${lead.email}:`, error);
            }
        }

        // Remove synced leads from queue
        this.syncQueue = this.syncQueue.filter(lead => lead.status !== 'synced');
        localStorage.setItem('emergency_sync_queue', JSON.stringify(this.syncQueue));
        this.saveToStorage();

        console.log(`🔄 Sync complete: ${synced} synced, ${failed} failed`);
        return { success: true, synced, failed };
    }

    // Test Firebase connection
    async testFirebaseConnection() {
        try {
            // Simple connection test
            const testDoc = doc(getFirestore(), 'test', 'connection');
            await getDoc(testDoc);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Save lead to Firebase (when connection is restored)
    async saveToFirebase(lead) {
        try {
            // Import Firebase functions (assuming they're available globally)
            const { doc, setDoc, getFirestore } = window;
            
            const leadRef = doc(getFirestore(), `MarketGenie_tenants/${this.tenantId}/leads`, lead.id);
            await setDoc(leadRef, {
                ...lead,
                syncedFromEmergencyStorage: true,
                originalStorageTime: lead.storedAt
            });

            return { success: true };
        } catch (error) {
            console.error('Firebase save error:', error);
            return { success: false, error: error.message };
        }
    }

    // Export leads for manual backup
    exportLeads() {
        const exportData = {
            tenantId: this.tenantId,
            exportedAt: new Date().toISOString(),
            leads: this.getAllLeads(),
            pendingSync: this.getPendingSync().length
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `emergency_leads_backup_${Date.now()}.json`;
        link.click();

        console.log('📥 Leads exported to file');
        return exportData;
    }

    // Get storage statistics
    getStats() {
        const total = this.leads.length;
        const pending = this.getPendingSync().length;
        const synced = total - pending;

        return {
            total,
            pending,
            synced,
            storageSize: JSON.stringify(this.leads).length,
            lastUpdate: new Date().toISOString()
        };
    }

    // Clear all emergency storage (use with caution)
    clearStorage() {
        if (confirm('⚠️ This will delete all emergency stored leads. Are you sure?')) {
            this.leads = [];
            this.syncQueue = [];
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem('emergency_sync_queue');
            console.log('🗑️ Emergency storage cleared');
            return true;
        }
        return false;
    }
}

// Global emergency storage instance
window.emergencyLeadStorage = new EmergencyLeadStorage();

// Expose functions globally for console access
window.emergencyStorage = {
    store: (leadData) => window.emergencyLeadStorage.storeLeadOffline(leadData),
    sync: () => window.emergencyLeadStorage.syncWithFirebase(),
    export: () => window.emergencyLeadStorage.exportLeads(),
    stats: () => window.emergencyLeadStorage.getStats(),
    clear: () => window.emergencyLeadStorage.clearStorage(),
    leads: () => window.emergencyLeadStorage.getAllLeads()
};

console.log('🚨 Emergency Lead Storage loaded. Use emergencyStorage.* functions');
console.log('📊 Current stats:', window.emergencyLeadStorage.getStats());