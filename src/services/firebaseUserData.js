// Firebase User Data Service - Replaces ALL localStorage with live Firebase persistence
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

export class FirebaseUserDataService {
  
  // Get user document reference
  static getUserDocRef(userId) {
    return doc(db, 'users', userId);
  }

  // Get user data collection reference  
  static getUserDataRef(userId, collection) {
    return doc(db, 'userData', `${userId}_${collection}`);
  }

  // Initialize user data document if it doesn't exist
  static async initializeUserData(userId) {
    try {
      const userRef = this.getUserDocRef(userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          userId,
          createdAt: new Date(),
          lastActive: new Date()
        });
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  }

  // ===== API KEYS MANAGEMENT =====
  static async saveAPIKeys(userId, apiKeys) {
    try {
      const apiKeysRef = this.getUserDataRef(userId, 'apiKeys');
      await setDoc(apiKeysRef, {
        apiKeys: apiKeys,
        updatedAt: new Date()
      });
      toast.success('API keys saved to cloud!');
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error('Failed to save API keys to cloud');
      throw error;
    }
  }

  static async getAPIKeys(userId) {
    try {
      const apiKeysRef = this.getUserDataRef(userId, 'apiKeys');
      const doc = await getDoc(apiKeysRef);
      return doc.exists() ? doc.data().apiKeys : [];
    } catch (error) {
      console.error('Error loading API keys:', error);
      return [];
    }
  }

  // ===== BUDGET CONTROL MANAGEMENT =====
  static async saveBudgetSettings(userId, budgetData) {
    try {
      const budgetRef = this.getUserDataRef(userId, 'budget');
      await setDoc(budgetRef, {
        scrapingBudget: budgetData.scrapingBudget,
        currentBudgetUsage: budgetData.currentBudgetUsage,
        budgetPeriod: budgetData.budgetPeriod || 'monthly',
        updatedAt: new Date()
      });
      toast.success('Budget settings saved to cloud!');
    } catch (error) {
      console.error('Error saving budget settings:', error);
      toast.error('Failed to save budget settings');
      throw error;
    }
  }

  static async getBudgetSettings(userId) {
    try {
      const budgetRef = this.getUserDataRef(userId, 'budget');
      const doc = await getDoc(budgetRef);
      
      if (doc.exists()) {
        return doc.data();
      } else {
        // Return default budget settings
        return {
          scrapingBudget: 100,
          currentBudgetUsage: 0,
          budgetPeriod: 'monthly'
        };
      }
    } catch (error) {
      console.error('Error loading budget settings:', error);
      return {
        scrapingBudget: 100,
        currentBudgetUsage: 0,
        budgetPeriod: 'monthly'
      };
    }
  }

  // ===== CAMPAIGNS MANAGEMENT =====
  static async saveCampaigns(userId, campaigns) {
    try {
      const campaignsRef = this.getUserDataRef(userId, 'campaigns');
      await setDoc(campaignsRef, {
        campaigns: campaigns,
        updatedAt: new Date()
      });
      toast.success('Campaigns saved to cloud!');
    } catch (error) {
      console.error('Error saving campaigns:', error);
      toast.error('Failed to save campaigns');
      throw error;
    }
  }

  static async getCampaigns(userId) {
    try {
      const campaignsRef = this.getUserDataRef(userId, 'campaigns');
      const doc = await getDoc(campaignsRef);
      return doc.exists() ? doc.data().campaigns : [];
    } catch (error) {
      console.error('Error loading campaigns:', error);
      return [];
    }
  }

  // ===== USER PREFERENCES =====
  static async saveUserPreferences(userId, preferences) {
    try {
      const prefsRef = this.getUserDataRef(userId, 'preferences');
      await setDoc(prefsRef, {
        ...preferences,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  static async getUserPreferences(userId) {
    try {
      const prefsRef = this.getUserDataRef(userId, 'preferences');
      const doc = await getDoc(prefsRef);
      
      if (doc.exists()) {
        return doc.data();
      } else {
        // Return default preferences
        return {
          theme: 'light',
          defaultAIProvider: 'openai',
          emailSignature: 'Best regards,\nThe MarketGenie Team'
        };
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return {
        theme: 'light',
        defaultAIProvider: 'openai',
        emailSignature: 'Best regards,\nThe MarketGenie Team'
      };
    }
  }

  // ===== REAL-TIME SYNC UTILITIES =====
  static async syncUserData(userId) {
    try {
      // Update last active timestamp
      const userRef = this.getUserDocRef(userId);
      await updateDoc(userRef, {
        lastActive: new Date()
      });
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  }

  // ===== INTEGRATION CREDENTIALS =====
  static async saveIntegrationCredentials(userId, integrationId, credentials) {
    try {
      const integRef = this.getUserDataRef(userId, `integration_${integrationId}`);
      await setDoc(integRef, {
        credentials: credentials,
        integrationId: integrationId,
        updatedAt: new Date()
      });
      toast.success(`${integrationId} credentials saved to cloud!`);
    } catch (error) {
      console.error('Error saving integration credentials:', error);
      toast.error('Failed to save integration credentials');
      throw error;
    }
  }

  static async getIntegrationCredentials(userId, integrationId) {
    try {
      const integRef = this.getUserDataRef(userId, `integration_${integrationId}`);
      const doc = await getDoc(integRef);
      return doc.exists() ? doc.data().credentials : null;
    } catch (error) {
      console.error('Error loading integration credentials:', error);
      return null;
    }
  }

  // ===== WORKFLOW AUTOMATION =====
  static async saveWorkflows(userId, workflowData) {
    try {
      const workflowRef = this.getUserDataRef(userId, 'workflows');
      await setDoc(workflowRef, {
        ...workflowData,
        updatedAt: new Date()
      });
      console.log('Workflows saved to Firebase successfully');
    } catch (error) {
      console.error('Error saving workflows:', error);
      throw error;
    }
  }

  static async getWorkflows(userId) {
    try {
      const workflowRef = this.getUserDataRef(userId, 'workflows');
      const doc = await getDoc(workflowRef);
      
      if (doc.exists()) {
        return doc.data();
      } else {
        // Return default empty workflows
        return {
          workflows: [],
          templates: []
        };
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      return {
        workflows: [],
        templates: []
      };
    }
  }

  // ===== CRM SYSTEM =====
  static async saveCRMContacts(userId, contactsData) {
    try {
      const contactsRef = this.getUserDataRef(userId, 'crm_contacts');
      await setDoc(contactsRef, {
        ...contactsData,
        updatedAt: new Date()
      });
      console.log('CRM Contacts saved to Firebase successfully');
    } catch (error) {
      console.error('Error saving CRM contacts:', error);
      throw error;
    }
  }

  static async getCRMContacts(userId) {
    try {
      const contactsRef = this.getUserDataRef(userId, 'crm_contacts');
      const doc = await getDoc(contactsRef);
      
      if (doc.exists()) {
        return doc.data();
      } else {
        return {
          contacts: []
        };
      }
    } catch (error) {
      console.error('Error loading CRM contacts:', error);
      return {
        contacts: []
      };
    }
  }

  static async saveCRMDeals(userId, dealsData) {
    try {
      const dealsRef = this.getUserDataRef(userId, 'crm_deals');
      await setDoc(dealsRef, {
        ...dealsData,
        updatedAt: new Date()
      });
      console.log('CRM Deals saved to Firebase successfully');
    } catch (error) {
      console.error('Error saving CRM deals:', error);
      throw error;
    }
  }

  static async getCRMDeals(userId) {
    try {
      const dealsRef = this.getUserDataRef(userId, 'crm_deals');
      const doc = await getDoc(dealsRef);
      
      if (doc.exists()) {
        return doc.data();
      } else {
        return {
          deals: []
        };
      }
    } catch (error) {
      console.error('Error loading CRM deals:', error);
      return {
        deals: []
      };
    }
  }

  static async saveCRMFunnels(userId, funnelsData) {
    try {
      const funnelsRef = this.getUserDataRef(userId, 'crm_funnels');
      await setDoc(funnelsRef, {
        ...funnelsData,
        updatedAt: new Date()
      });
      console.log('CRM Funnels saved to Firebase successfully');
    } catch (error) {
      console.error('Error saving CRM funnels:', error);
      throw error;
    }
  }

  static async getCRMFunnels(userId) {
    try {
      const funnelsRef = this.getUserDataRef(userId, 'crm_funnels');
      const doc = await getDoc(funnelsRef);
      
      if (doc.exists()) {
        return doc.data();
      } else {
        return {
          funnels: []
        };
      }
    } catch (error) {
      console.error('Error loading CRM funnels:', error);
      return {
        funnels: []
      };
    }
  }
}

export default FirebaseUserDataService;