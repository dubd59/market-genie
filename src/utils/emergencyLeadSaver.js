// Emergency Lead Save System
// Direct database saves when client Firebase is experiencing transport errors

import { db } from '../firebase.js';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase.js';

class EmergencyLeadSaver {
  constructor() {
    this.saveQueue = [];
    this.isProcessing = false;
    this.successCount = 0;
    this.failureCount = 0;
  }

  // Add leads to emergency save queue
  queueLeadsForEmergencySave(leads, tenantId) {
    console.log(`🚨 EMERGENCY: Queueing ${leads.length} leads for direct database save`);
    
    leads.forEach(lead => {
      this.saveQueue.push({
        ...lead,
        tenantId,
        queuedAt: Date.now(),
        attempts: 0
      });
    });

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processEmergencyQueue();
    }
  }

  // Process the emergency save queue using Firebase Functions
  async processEmergencyQueue() {
    if (this.isProcessing || this.saveQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`🚨 EMERGENCY SAVE: Processing ${this.saveQueue.length} queued leads`);

    while (this.saveQueue.length > 0) {
      const lead = this.saveQueue.shift();
      
      try {
        await this.emergencySaveLead(lead);
        this.successCount++;
        console.log(`✅ EMERGENCY SAVE SUCCESS: ${lead.email} (${this.successCount} saved)`);
      } catch (error) {
        lead.attempts++;
        console.error(`❌ EMERGENCY SAVE FAILED: ${lead.email} (attempt ${lead.attempts}):`, error.message);
        
        // Retry up to 3 times
        if (lead.attempts < 3) {
          this.saveQueue.push(lead);
          console.log(`🔄 Re-queuing ${lead.email} for retry (attempt ${lead.attempts + 1})`);
        } else {
          this.failureCount++;
          console.error(`💀 EMERGENCY SAVE ABANDONED: ${lead.email} after 3 attempts`);
        }
      }

      // Small delay between saves to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.isProcessing = false;
    console.log(`🏁 EMERGENCY SAVE COMPLETE: ${this.successCount} saved, ${this.failureCount} failed`);
  }

  // Use Firebase Functions to save lead directly to database
  async emergencySaveLead(lead) {
    try {
      // Try Firebase Functions approach for direct database write
      console.log(`🚨 Attempting emergency save for ${lead.email} via Firebase Functions`);
      
      const saveLeadFunction = httpsCallable(functions, 'emergencySaveLead');
      
      const result = await saveLeadFunction({
        tenantId: lead.tenantId,
        leadData: {
          email: lead.email,
          firstName: lead.firstName || '',
          lastName: lead.lastName || '',
          company: lead.company || '',
          title: lead.title || '',
          domain: lead.domain || lead.company || '',
          source: lead.source || 'bulk-scraper',
          score: lead.score || 75,
          status: 'new',
          tags: lead.tags || ['bulk-scraped'],
          notes: lead.notes || `Emergency saved via direct database write at ${new Date().toISOString()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });

      if (result.data.success) {
        console.log(`✅ Firebase Function save successful for ${lead.email}: ${result.data.leadId}`);
        return result.data.leadId;
      } else {
        throw new Error(result.data.error || 'Firebase Function save failed');
      }
      
    } catch (error) {
      console.error(`❌ Firebase Function save failed for ${lead.email}:`, error.message);
      
      // Fallback to browser-side localStorage as last resort
      this.saveToLocalStorageBackup(lead);
      throw error;
    }
  }

  // Last resort: Save to localStorage for manual recovery
  saveToLocalStorageBackup(lead) {
    try {
      const backupKey = `emergency_leads_${lead.tenantId}`;
      const existingBackup = JSON.parse(localStorage.getItem(backupKey) || '[]');
      
      existingBackup.push({
        ...lead,
        backupedAt: Date.now(),
        reason: 'emergency_save_failed'
      });

      localStorage.setItem(backupKey, JSON.stringify(existingBackup));
      console.log(`💾 LAST RESORT: Saved ${lead.email} to localStorage backup`);
      
      // Show user notification about backup
      if (window.showToast) {
        window.showToast(`Lead ${lead.email} backed up locally - check Emergency Recovery`, 'warning');
      }
      
    } catch (localError) {
      console.error(`❌ Even localStorage backup failed for ${lead.email}:`, localError.message);
    }
  }

  // Get backup leads from localStorage
  getLocalStorageBackup(tenantId) {
    try {
      const backupKey = `emergency_leads_${tenantId}`;
      return JSON.parse(localStorage.getItem(backupKey) || '[]');
    } catch (error) {
      console.error('Failed to get localStorage backup:', error.message);
      return [];
    }
  }

  // Clear localStorage backup after successful recovery
  clearLocalStorageBackup(tenantId) {
    try {
      const backupKey = `emergency_leads_${tenantId}`;
      localStorage.removeItem(backupKey);
      console.log(`🧹 Cleared localStorage backup for tenant ${tenantId}`);
    } catch (error) {
      console.error('Failed to clear localStorage backup:', error.message);
    }
  }

  // Get status of emergency save system
  getStatus() {
    return {
      queueLength: this.saveQueue.length,
      isProcessing: this.isProcessing,
      successCount: this.successCount,
      failureCount: this.failureCount
    };
  }
}

// Global emergency lead saver instance
export const emergencyLeadSaver = new EmergencyLeadSaver();

// Export utility functions
export function triggerEmergencyLeadSave(leads, tenantId) {
  console.log('🚨 TRIGGERING EMERGENCY LEAD SAVE');
  emergencyLeadSaver.queueLeadsForEmergencySave(leads, tenantId);
}

export function getEmergencyBackup(tenantId) {
  return emergencyLeadSaver.getLocalStorageBackup(tenantId);
}

export function clearEmergencyBackup(tenantId) {
  emergencyLeadSaver.clearLocalStorageBackup(tenantId);
}

export function getEmergencySaveStatus() {
  return emergencyLeadSaver.getStatus();
}