import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * MULTI-TENANT DATABASE SERVICE
 * 
 * CRITICAL SECURITY PRINCIPLES:
 * 1. ALL operations MUST include tenantId filtering
 * 2. NO cross-tenant data access allowed
 * 3. Every document includes tenantId field
 * 4. All queries filtered by authenticated user's tenantId
 */

class MultiTenantDatabase {
  constructor() {
    this.COLLECTIONS = {
      TENANTS: 'tenants',
      USERS: 'users', 
      DEALS: 'deals',
      CONTACTS: 'contacts',
      CAMPAIGNS: 'campaigns',
      PIPELINES: 'pipelines',
      ACTIVITIES: 'activities',
      SETTINGS: 'settings',
      INTEGRATIONS: 'integrations',
      WORKFLOWS: 'workflows'
    };
  }

  /**
   * Initialize tenant structure - creates base tenant document
   */
  async initializeTenant(tenantId, tenantData) {
    try {
      const tenantDoc = {
        id: tenantId,
        name: tenantData.name || 'New Organization',
        domain: tenantData.domain,
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY'
        },
        subscription: {
          plan: 'free',
          status: 'active',
          createdAt: serverTimestamp()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await this.setDoc(this.COLLECTIONS.TENANTS, tenantId, tenantDoc);
      
      // Create default pipeline for tenant
      await this.createDefaultPipeline(tenantId);
      
      console.log(`✅ Tenant ${tenantId} initialized successfully`);
      return tenantId;
    } catch (error) {
      console.error('❌ Error initializing tenant:', error);
      throw error;
    }
  }

  /**
   * SECURE DOCUMENT CREATION - Always includes tenantId
   */
  async createDocument(collectionName, data, tenantId) {
    if (!tenantId) {
      throw new Error('SECURITY VIOLATION: tenantId is required for all operations');
    }

    const docData = {
      ...data,
      tenantId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, collectionName), docData);
      console.log(`✅ Document created in ${collectionName} for tenant ${tenantId}: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error(`❌ Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * SECURE DOCUMENT QUERY - Always filtered by tenantId
   */
  async getDocuments(collectionName, tenantId, additionalFilters = [], orderByField = 'createdAt') {
    if (!tenantId) {
      throw new Error('SECURITY VIOLATION: tenantId is required for all queries');
    }

    try {
      let q = query(
        collection(db, collectionName),
        where('tenantId', '==', tenantId)
      );

      // Add additional filters
      additionalFilters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });

      // Add ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, 'desc'));
      }

      const snapshot = await getDocs(q);
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ Retrieved ${documents.length} documents from ${collectionName} for tenant ${tenantId}`);
      return documents;
    } catch (error) {
      console.error(`❌ Error querying ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * SECURE DOCUMENT UPDATE - Verifies tenantId ownership
   */
  async updateDocument(collectionName, docId, updates, tenantId) {
    if (!tenantId) {
      throw new Error('SECURITY VIOLATION: tenantId is required for updates');
    }

    try {
      // First verify document belongs to tenant
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Document not found');
      }

      const docData = docSnap.data();
      if (docData.tenantId !== tenantId) {
        throw new Error('SECURITY VIOLATION: Document does not belong to tenant');
      }

      // Safe to update
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);
      console.log(`✅ Document ${docId} updated in ${collectionName} for tenant ${tenantId}`);
    } catch (error) {
      console.error(`❌ Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * SECURE DOCUMENT DELETION - Verifies tenantId ownership
   */
  async deleteDocument(collectionName, docId, tenantId) {
    if (!tenantId) {
      throw new Error('SECURITY VIOLATION: tenantId is required for deletion');
    }

    try {
      // First verify document belongs to tenant
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Document not found');
      }

      const docData = docSnap.data();
      if (docData.tenantId !== tenantId) {
        throw new Error('SECURITY VIOLATION: Document does not belong to tenant');
      }

      // Safe to delete
      await deleteDoc(docRef);
      console.log(`✅ Document ${docId} deleted from ${collectionName} for tenant ${tenantId}`);
    } catch (error) {
      console.error(`❌ Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * CRM-specific methods with tenant isolation
   */
  
  // DEALS
  async createDeal(dealData, tenantId) {
    return this.createDocument(this.COLLECTIONS.DEALS, dealData, tenantId);
  }

  async getDeals(tenantId, stage = null) {
    const filters = stage ? [{ field: 'stage', operator: '==', value: stage }] : [];
    return this.getDocuments(this.COLLECTIONS.DEALS, tenantId, filters);
  }

  async updateDeal(dealId, updates, tenantId) {
    return this.updateDocument(this.COLLECTIONS.DEALS, dealId, updates, tenantId);
  }

  // CONTACTS
  async createContact(contactData, tenantId) {
    return this.createDocument(this.COLLECTIONS.CONTACTS, contactData, tenantId);
  }

  async getContacts(tenantId) {
    return this.getDocuments(this.COLLECTIONS.CONTACTS, tenantId);
  }

  // CAMPAIGNS
  async createCampaign(campaignData, tenantId) {
    return this.createDocument(this.COLLECTIONS.CAMPAIGNS, campaignData, tenantId);
  }

  async getCampaigns(tenantId) {
    return this.getDocuments(this.COLLECTIONS.CAMPAIGNS, tenantId);
  }

  // ACTIVITIES
  async logActivity(activityData, tenantId) {
    return this.createDocument(this.COLLECTIONS.ACTIVITIES, activityData, tenantId);
  }

  async getActivities(tenantId, limit = 50) {
    return this.getDocuments(this.COLLECTIONS.ACTIVITIES, tenantId, [], 'createdAt');
  }

  /**
   * Create default pipeline structure for new tenant
   */
  async createDefaultPipeline(tenantId) {
    const defaultPipeline = {
      name: 'Sales Pipeline',
      stages: [
        { id: 'lead', name: 'Lead', color: '#3B82F6', order: 1 },
        { id: 'qualified', name: 'Qualified', color: '#8B5CF6', order: 2 },
        { id: 'proposal', name: 'Proposal', color: '#F59E0B', order: 3 },
        { id: 'negotiation', name: 'Negotiation', color: '#EF4444', order: 4 },
        { id: 'closed-won', name: 'Closed Won', color: '#10B981', order: 5 },
        { id: 'closed-lost', name: 'Closed Lost', color: '#6B7280', order: 6 }
      ],
      isDefault: true
    };

    return this.createDocument(this.COLLECTIONS.PIPELINES, defaultPipeline, tenantId);
  }

  /**
   * Bulk operations with tenant safety
   */
  async bulkCreate(collectionName, documents, tenantId) {
    if (!tenantId) {
      throw new Error('SECURITY VIOLATION: tenantId is required for bulk operations');
    }

    const batch = writeBatch(db);
    const refs = [];

    documents.forEach(docData => {
      const docRef = doc(collection(db, collectionName));
      const safeData = {
        ...docData,
        tenantId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      batch.set(docRef, safeData);
      refs.push(docRef);
    });

    try {
      await batch.commit();
      console.log(`✅ Bulk created ${documents.length} documents in ${collectionName} for tenant ${tenantId}`);
      return refs.map(ref => ref.id);
    } catch (error) {
      console.error(`❌ Error in bulk create for ${collectionName}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const multiTenantDB = new MultiTenantDatabase();
export default multiTenantDB;