import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { multiTenantDB } from '../services/multiTenantDatabase';
import SuperAdminSetup from '../services/superAdminSetup';

/**
 * FOUNDER ACCOUNT HOOK
 * 
 * Automatically detects and sets up founder account privileges
 * - Detects dubdproducts@gmail.com as founder
 * - Sets up super admin privileges
 * - Provides access to all tenants
 * - Initializes demo data if needed
 */

export const useFounderAccount = () => {
  const { user } = useAuth();
  const [isFounder, setIsFounder] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if current user is the founder
  const checkFounderStatus = (user) => {
    return user && user.email === 'dubdproducts@gmail.com';
  };

  // Initialize founder account and data
  const initializeFounderAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔥 Initializing founder account...');
      
      // Run super admin setup
      const result = await SuperAdminSetup.initialize();
      
      if (result.success) {
        // Get all tenants that founder has access to
        const founderTenants = [];
        
        // Add founder tenant
        try {
          const founderTenantData = await multiTenantDB.getDocuments('tenants', result.founderTenantId);
          if (founderTenantData.length > 0) {
            founderTenants.push({
              id: result.founderTenantId,
              name: 'Founder Account',
              type: 'master',
              ...founderTenantData[0]
            });
          }
        } catch (err) {
          console.log('Founder tenant not found, will be created on first access');
        }

        // Add demo tenant
        try {
          const demoTenantData = await multiTenantDB.getDocuments('tenants', result.demoTenantId);
          if (demoTenantData.length > 0) {
            founderTenants.push({
              id: result.demoTenantId,
              name: 'Demo Showcase',
              type: 'demo',
              ...demoTenantData[0]
            });
          }
        } catch (err) {
          console.log('Demo tenant not found, will be created on first access');
        }

        setTenants(founderTenants);
        setCurrentTenant(founderTenants[0] || null);
        
        console.log('✅ Founder account initialized successfully');
      }

    } catch (err) {
      console.error('❌ Error initializing founder account:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Switch between tenants (founder privilege)
  const switchTenant = async (tenantId) => {
    try {
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
        setCurrentTenant(tenant);
        console.log(`✅ Switched to tenant: ${tenant.name}`);
      } else {
        throw new Error('Tenant not found or access denied');
      }
    } catch (err) {
      console.error('❌ Error switching tenant:', err);
      setError(err.message);
    }
  };

  // Get all deals across all tenants (founder privilege)
  const getAllDeals = async () => {
    if (!isFounder) return [];
    
    try {
      const allDeals = [];
      for (const tenant of tenants) {
        const deals = await multiTenantDB.getDeals(tenant.id);
        allDeals.push(...deals.map(deal => ({ ...deal, tenantName: tenant.name })));
      }
      return allDeals;
    } catch (err) {
      console.error('Error getting all deals:', err);
      return [];
    }
  };

  // Get all contacts across all tenants (founder privilege)
  const getAllContacts = async () => {
    if (!isFounder) return [];
    
    try {
      const allContacts = [];
      for (const tenant of tenants) {
        const contacts = await multiTenantDB.getContacts(tenant.id);
        allContacts.push(...contacts.map(contact => ({ ...contact, tenantName: tenant.name })));
      }
      return allContacts;
    } catch (err) {
      console.error('Error getting all contacts:', err);
      return [];
    }
  };

  // Initialize when user changes
  useEffect(() => {
    if (user) {
      const founderStatus = checkFounderStatus(user);
      setIsFounder(founderStatus);
      
      if (founderStatus) {
        initializeFounderAccount();
      } else {
        setLoading(false);
      }
    } else {
      setIsFounder(false);
      setTenants([]);
      setCurrentTenant(null);
      setLoading(false);
    }
  }, [user]);

  return {
    isFounder,
    tenants,
    currentTenant,
    loading,
    error,
    switchTenant,
    getAllDeals,
    getAllContacts,
    initializeFounderAccount
  };
};

export default useFounderAccount;