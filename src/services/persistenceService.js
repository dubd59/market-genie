import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc
} from '../security/SecureFirebase.js';
import { onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

class PersistenceService {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
  }

  // Generic save function for any component data
  async saveData(userId, componentName, data) {
    try {
      const docRef = doc(db, 'MarketGenie_userData', userId, 'components', componentName);
      await setDoc(docRef, {
        ...data,
        lastUpdated: serverTimestamp(),
        componentName
      }, { merge: true });
      
      // Update cache
      this.cache.set(`${userId}_${componentName}`, data);
      console.log(`✅ Saved ${componentName} data for user ${userId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error saving ${componentName} data:`, error);
      return false;
    }
  }

  // Generic load function for any component data
  async loadData(userId, componentName, defaultData = {}) {
    try {
      // Check cache first
      const cacheKey = `${userId}_${componentName}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const docRef = doc(db, 'MarketGenie_userData', userId, 'components', componentName);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.cache.set(cacheKey, data);
        console.log(`✅ Loaded ${componentName} data for user ${userId}`);
        return data;
      } else {
        console.log(`📝 No existing data for ${componentName}, using defaults`);
        // Save default data
        await this.saveData(userId, componentName, defaultData);
        return defaultData;
      }
    } catch (error) {
      console.error(`❌ Error loading ${componentName} data:`, error);
      return defaultData;
    }
  }

  // Real-time listener for component data
  subscribeToData(userId, componentName, callback) {
    const docRef = doc(db, 'MarketGenie_userData', userId, 'components', componentName);
    const listenerKey = `${userId}_${componentName}`;
    
    // Unsubscribe existing listener if any
    if (this.listeners.has(listenerKey)) {
      this.listeners.get(listenerKey)();
    }

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        this.cache.set(listenerKey, data);
        callback(data);
      }
    });

    this.listeners.set(listenerKey, unsubscribe);
    return unsubscribe;
  }

  // Update specific field in component data
  async updateField(userId, componentName, fieldPath, value) {
    try {
      const docRef = doc(db, 'MarketGenie_userData', userId, 'components', componentName);
      await updateDoc(docRef, {
        [fieldPath]: value,
        lastUpdated: serverTimestamp()
      });
      
      // Update cache
      const cacheKey = `${userId}_${componentName}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        cached[fieldPath] = value;
        this.cache.set(cacheKey, cached);
      }
      
      console.log(`✅ Updated ${fieldPath} in ${componentName} for user ${userId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating ${fieldPath} in ${componentName}:`, error);
      return false;
    }
  }

  // Save integration settings
  async saveIntegrationSettings(userId, integrations) {
    return await this.saveData(userId, 'integrationSettings', { integrations });
  }

  // Load integration settings
  async loadIntegrationSettings(userId) {
    const data = await this.loadData(userId, 'integrationSettings', { integrations: [] });
    return data.integrations || [];
  }

  // Save scraping agent states
  async saveScrapingAgents(userId, agents) {
    return await this.saveData(userId, 'scrapingAgents', { agents });
  }

  // Load scraping agent states
  async loadScrapingAgents(userId) {
    const data = await this.loadData(userId, 'scrapingAgents', { agents: [] });
    return data.agents || [];
  }

  // Save workflow configurations
  async saveWorkflows(userId, workflows) {
    return await this.saveData(userId, 'workflows', { workflows });
  }

  // Load workflow configurations
  async loadWorkflows(userId) {
    const data = await this.loadData(userId, 'workflows', { workflows: [] });
    return data.workflows || [];
  }

  // Save funnel data
  async saveFunnels(userId, funnels) {
    return await this.saveData(userId, 'funnels', { funnels });
  }

  // Load funnel data
  async loadFunnels(userId) {
    const data = await this.loadData(userId, 'funnels', { funnels: [] });
    return data.funnels || [];
  }

  // Save CRM data
  async saveCRMData(userId, crmData) {
    return await this.saveData(userId, 'crmData', crmData);
  }

  // Load CRM data
  async loadCRMData(userId) {
    return await this.loadData(userId, 'crmData', { leads: [], pipelineStats: {}, automationRules: [] });
  }

  // Save automation hub data
  async saveAutomationHub(userId, automationData) {
    return await this.saveData(userId, 'automationHub', automationData);
  }

  // Load automation hub data
  async loadAutomationHub(userId) {
    return await this.loadData(userId, 'automationHub', { activeAutomations: [], advancedFeatures: [] });
  }

  // Save budget settings
  async saveBudgetSettings(userId, budgetSettings) {
    return await this.saveData(userId, 'budgetSettings', budgetSettings);
  }

  // Load budget settings
  async loadBudgetSettings(userId) {
    return await this.loadData(userId, 'budgetSettings', {});
  }

  // Clean up listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
    this.cache.clear();
  }
}

// Export singleton instance
export const persistenceService = new PersistenceService();
export default persistenceService;
