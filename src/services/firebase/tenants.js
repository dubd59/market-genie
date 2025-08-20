import FirebaseService from './client'
import { auth } from '../../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

export class TenantService {
  // Setup founder account if it doesn't exist
  static async setupFounderAccount() {
    const founderEmail = 'dubdproducts@gmail.com'
    const founderPassword = 'Nosoup4u123$$'
    
    try {
      // Try to sign in first
      let userCredential
      try {
        userCredential = await signInWithEmailAndPassword(auth, founderEmail, founderPassword)
      } catch (signInError) {
        // If sign in fails, create the account
        console.log('Creating founder account...')
        userCredential = await createUserWithEmailAndPassword(auth, founderEmail, founderPassword)
      }
      
      const user = userCredential.user
      
      // Check if tenant already exists
      const existingTenant = await this.getCurrentUserTenant()
      
      if (!existingTenant.data) {
        // Create founder tenant
        console.log('Setting up founder workspace...')
        await this.createTenantForUser(user)
      }
      
      return { success: true, user }
    } catch (error) {
      console.error('Founder setup error:', error)
      return { success: false, error }
    }
  }
  // Get current user's tenant
  static async getCurrentUserTenant() {
    if (!auth.currentUser) {
      return { data: null, error: { message: 'No authenticated user' } }
    }

    try {
      console.log('Searching for tenant for user:', auth.currentUser.uid, auth.currentUser.email)
      
      // First check if user has an existing tenant
      const result = await FirebaseService.query('tenants', [
        { field: 'ownerId', operator: '==', value: auth.currentUser.uid }
      ])

      console.log('Tenant query result:', result)

      if (result.data && result.data.length > 0) {
        console.log('Found existing tenant:', result.data[0])
        return { data: result.data[0], error: null }
      }

      // If no tenant exists, create one automatically
      console.log('No tenant found, creating new tenant for user')
      return await this.createTenantForUser(auth.currentUser)
    } catch (error) {
      console.error('getCurrentUserTenant error:', error)
      return { data: null, error }
    }
  }

  // Create a new tenant for a user
  static async createTenantForUser(user) {
    // Special handling for founder account
    const isFounder = user.email === 'dubdproducts@gmail.com'
    
    const tenantData = {
      ownerId: user.uid,
      ownerEmail: user.email,
      ownerName: user.displayName || user.email,
      name: isFounder ? 'Market Genie Founder Workspace' : `${user.displayName || user.email}'s Workspace`,
      plan: isFounder ? 'founder' : 'starter',
      status: 'active',
      role: isFounder ? 'founder' : 'user',
      settings: {
        theme: 'light',
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        brandColors: {
          primary: '#38BEBA', // Your highlight color
          secondary: '#2D9CDB',
          background: '#FAFAFA', // Extremely light gray
          surface: '#FFFFFF', // White
          text: '#1F2937',
          textSecondary: '#6B7280'
        }
      },
      features: isFounder ? {
        // Unlimited everything for founder
        maxLeads: 999999,
        maxCampaigns: 999999,
        maxUsers: 999999,
        maxTenants: 999999,
        apiCalls: 999999,
        storage: 'unlimited',
        whiteLabel: true,
        customDomains: true,
        advancedAnalytics: true,
        prioritySupport: true,
        customIntegrations: true,
        bulkOperations: true,
        advancedAutomation: true,
        multiChannelCampaigns: true,
        aiContentGeneration: true,
        advancedReporting: true
      } : {
        maxLeads: 1000,
        maxCampaigns: 10,
        maxUsers: 1,
        apiCalls: 5000,
        storage: '1GB'
      },
      usage: {
        leads: 0,
        campaigns: 0,
        users: 1,
        apiCalls: 0,
        storageUsed: 0
      },
      billing: {
        plan: isFounder ? 'founder' : 'starter',
        status: 'active',
        nextBillingDate: isFounder ? new Date('2099-12-31') : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: 0,
        lifetime: isFounder ? true : false
      }
    }

    const result = await FirebaseService.create('tenants', tenantData)
    
    if (result.error) {
      console.error('Failed to create tenant:', result.error)
      return result
    }

    console.log('Created tenant:', result.data)
    
    // Also create a user profile document
    const userProfileResult = await this.createUserProfile(user, result.data.id)
    if (userProfileResult.error) {
      console.error('Failed to create user profile:', userProfileResult.error)
    } else {
      console.log('Created user profile:', userProfileResult.data)
    }
    
    return result
  }

  // Create user profile in the users collection
  static async createUserProfile(user, tenantId) {
    const isFounder = user.email === 'dubdproducts@gmail.com'
    
    const userProfile = {
      email: user.email,
      name: user.displayName || user.email,
      tenantId: tenantId,
      role: isFounder ? 'founder' : 'owner',
      status: 'active',
      permissions: isFounder ? ['all', 'super_admin', 'founder', 'system_admin'] : ['all'],
      lastLogin: new Date(),
      preferences: {
        notifications: true,
        emailUpdates: true,
        theme: 'light'
      },
      founder: isFounder
    }

    return await FirebaseService.create('users', userProfile, user.uid)
  }

  // Update tenant settings
  static async updateTenantSettings(tenantId, settings) {
    return await FirebaseService.update('tenants', tenantId, { settings })
  }

  // Get tenant usage statistics
  static async getTenantUsage(tenantId) {
    try {
      const tenant = await FirebaseService.getById('tenants', tenantId)
      return { data: tenant.data?.usage || {}, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Update tenant usage
  static async updateTenantUsage(tenantId, usageUpdate) {
    const tenant = await FirebaseService.getById('tenants', tenantId)
    if (tenant.data) {
      const currentUsage = tenant.data.usage || {}
      const newUsage = { ...currentUsage, ...usageUpdate }
      return await FirebaseService.update('tenants', tenantId, { usage: newUsage })
    }
    return { data: null, error: { message: 'Tenant not found' } }
  }

  // Check if user has permission for a feature
  static async checkFeatureLimit(tenantId, feature, currentCount) {
    const tenant = await FirebaseService.getById('tenants', tenantId)
    if (tenant.data) {
      const limit = tenant.data.features[feature]
      return currentCount < limit
    }
    return false
  }

  // Initialize tenant collections (creates default data)
  static async initializeTenantCollections(tenantId) {
    // Create default pipeline stages
    const defaultStages = [
      { name: 'Lead', color: '#3B82F6', order: 1 },
      { name: 'Qualified', color: '#F59E0B', order: 2 },
      { name: 'Proposal', color: '#8B5CF6', order: 3 },
      { name: 'Negotiation', color: '#EF4444', order: 4 },
      { name: 'Closed Won', color: '#10B981', order: 5 },
      { name: 'Closed Lost', color: '#6B7280', order: 6 }
    ]

    for (const stage of defaultStages) {
      await FirebaseService.create(`tenants/${tenantId}/pipeline_stages`, stage)
    }

    // Create default email templates
    const defaultTemplates = [
      {
        name: 'Welcome Email',
        subject: 'Welcome to Market Genie!',
        content: 'Hi {{name}}, welcome to Market Genie! We\'re excited to help you grow your business.',
        type: 'welcome'
      },
      {
        name: 'Follow Up',
        subject: 'Following up on our conversation',
        content: 'Hi {{name}}, I wanted to follow up on our recent conversation about {{topic}}.',
        type: 'followup'
      }
    ]

    for (const template of defaultTemplates) {
      await FirebaseService.create(`tenants/${tenantId}/email_templates`, template)
    }

    return { success: true }
  }
}

export default TenantService
