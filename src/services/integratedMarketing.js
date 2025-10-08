// Enhanced Firebase service to support cross-system integrations
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc
} from '../security/SecureFirebase.js'
import { writeBatch } from 'firebase/firestore'
import { db } from '../firebase'

export class IntegratedMarketingService {
  
  // ===== UNIFIED DATA MODELS =====
  
  static getUserDataRef(userId, dataType) {
    return doc(db, 'userData', `${userId}_${dataType}`)
  }

  // ===== AUTOMATION CAMPAIGNS =====
  
  // Create campaign with CRM contact integration
  static async createAutomationCampaign(userId, campaignData) {
    try {
      const campaign = {
        id: `campaign_${Date.now()}`,
        ...campaignData,
        type: 'automation',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          totalContacts: 0,
          emailsSent: 0,
          opensCount: 0,
          clicksCount: 0,
          openRate: 0,
          clickRate: 0
        }
      }

      const campaignsRef = this.getUserDataRef(userId, 'automation_campaigns')
      const existingDoc = await getDoc(campaignsRef)
      const campaigns = existingDoc.exists() ? existingDoc.data().campaigns || [] : []
      
      campaigns.push(campaign)
      await setDoc(campaignsRef, { campaigns, updatedAt: new Date() })
      
      return campaign
    } catch (error) {
      console.error('Error creating automation campaign:', error)
      throw error
    }
  }

  // Get campaigns with contact data
  static async getAutomationCampaigns(userId) {
    try {
      // First try to get campaigns from OutreachAutomation
      const outreachCampaignsRef = this.getUserDataRef(userId, 'outreach_campaigns')
      const outreachDoc = await getDoc(outreachCampaignsRef)
      
      let campaigns = []
      
      if (outreachDoc.exists()) {
        campaigns = outreachDoc.data().campaigns || []
      }
      
      // If no OutreachAutomation campaigns, provide some default campaign options
      if (campaigns.length === 0) {
        campaigns = [
          {
            id: 'welcome_sequence',
            name: 'Welcome Email Sequence',
            type: 'email_sequence',
            status: 'ready',
            description: 'AI-powered welcome emails for new leads'
          },
          {
            id: 'product_launch',
            name: 'Product Launch Campaign',
            type: 'marketing',
            status: 'ready', 
            description: 'Announce new products to your audience'
          },
          {
            id: 'reengagement',
            name: 'Re-engagement Campaign',
            type: 'retention',
            status: 'ready',
            description: 'Win back inactive customers'
          },
          {
            id: 'vip_outreach',
            name: 'VIP Customer Outreach',
            type: 'targeted',
            status: 'ready',
            description: 'Exclusive offers for VIP customers'
          }
        ]
        
        // Save default campaigns for future use
        await setDoc(outreachCampaignsRef, { 
          campaigns, 
          updatedAt: new Date(),
          source: 'workflow_integration'
        })
      }
      
      return campaigns
    } catch (error) {
      console.error('Error loading automation campaigns:', error)
      return []
    }
  }

  // ===== WORKFLOW-CAMPAIGN INTEGRATION =====
  
  // Link workflow to campaign triggers
  static async createWorkflowCampaignTrigger(userId, workflowId, campaignId, triggerConditions) {
    try {
      const trigger = {
        id: `trigger_${Date.now()}`,
        workflowId,
        campaignId,
        conditions: triggerConditions,
        status: 'active',
        createdAt: new Date().toISOString()
      }

      const triggersRef = this.getUserDataRef(userId, 'workflow_triggers')
      const existingDoc = await getDoc(triggersRef)
      const triggers = existingDoc.exists() ? existingDoc.data().triggers || [] : []
      
      triggers.push(trigger)
      await setDoc(triggersRef, { triggers, updatedAt: new Date() })
      
      return trigger
    } catch (error) {
      console.error('Error creating workflow trigger:', error)
      throw error
    }
  }

  // ===== CRM-CAMPAIGN INTEGRATION =====
  
  // Get contacts for campaign targeting
  static async getContactsForCampaign(userId, filters = {}) {
    try {
      const contactsRef = this.getUserDataRef(userId, 'crm_contacts')
      const doc = await getDoc(contactsRef)
      
      if (!doc.exists()) return []
      
      let contacts = doc.data().contacts || []
      
      // Apply filters
      if (filters.tags && filters.tags.length > 0) {
        contacts = contacts.filter(contact => 
          contact.tags?.some(tag => filters.tags.includes(tag))
        )
      }
      
      if (filters.status) {
        contacts = contacts.filter(contact => contact.status === filters.status)
      }
      
      if (filters.company) {
        contacts = contacts.filter(contact => 
          contact.company?.toLowerCase().includes(filters.company.toLowerCase())
        )
      }
      
      if (filters.source) {
        contacts = contacts.filter(contact => contact.source === filters.source)
      }
      
      return contacts
    } catch (error) {
      console.error('Error getting contacts for campaign:', error)
      return []
    }
  }

  // ===== EMAIL AUTOMATION ENGINE =====
  
  // Create scheduled email campaign
  static async scheduleEmailCampaign(userId, campaignData) {
    try {
      const scheduledCampaign = {
        id: `scheduled_${Date.now()}`,
        ...campaignData,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        scheduledFor: campaignData.scheduleDate,
        emailTemplate: campaignData.template,
        targetContacts: campaignData.contacts || [],
        automationRules: campaignData.rules || {}
      }

      const scheduledRef = this.getUserDataRef(userId, 'scheduled_campaigns')
      const existingDoc = await getDoc(scheduledRef)
      const scheduled = existingDoc.exists() ? existingDoc.data().campaigns || [] : []
      
      scheduled.push(scheduledCampaign)
      await setDoc(scheduledRef, { campaigns: scheduled, updatedAt: new Date() })
      
      return scheduledCampaign
    } catch (error) {
      console.error('Error scheduling email campaign:', error)
      throw error
    }
  }

  // Get scheduled campaigns
  static async getScheduledCampaigns(userId) {
    try {
      const scheduledRef = this.getUserDataRef(userId, 'scheduled_campaigns')
      const doc = await getDoc(scheduledRef)
      
      if (doc.exists()) {
        return doc.data().campaigns || []
      }
      return []
    } catch (error) {
      console.error('Error loading scheduled campaigns:', error)
      return []
    }
  }

  // ===== CAMPAIGN EXECUTION =====
  
  // Execute campaign with contact list
  static async executeCampaign(userId, campaignId, contactIds) {
    try {
      // Get campaign details
      const campaigns = await this.getAutomationCampaigns(userId)
      const campaign = campaigns.find(c => c.id === campaignId)
      if (!campaign) throw new Error('Campaign not found')

      // Get contacts
      const allContacts = await this.getContactsForCampaign(userId)
      const targetContacts = allContacts.filter(contact => contactIds.includes(contact.id))

      // Create execution record
      const execution = {
        id: `execution_${Date.now()}`,
        campaignId,
        contactIds,
        targetContacts: targetContacts.length,
        status: 'executing',
        startedAt: new Date().toISOString(),
        emailsSent: 0,
        emailsDelivered: 0,
        opens: 0,
        clicks: 0
      }

      // Save execution record
      const executionsRef = this.getUserDataRef(userId, 'campaign_executions')
      const existingDoc = await getDoc(executionsRef)
      const executions = existingDoc.exists() ? existingDoc.data().executions || [] : []
      
      executions.push(execution)
      await setDoc(executionsRef, { executions, updatedAt: new Date() })

      // Update campaign stats
      campaign.stats.totalContacts += targetContacts.length
      campaign.lastExecuted = new Date().toISOString()
      
      // Save updated campaign
      const updatedCampaigns = campaigns.map(c => c.id === campaignId ? campaign : c)
      const campaignsRef = this.getUserDataRef(userId, 'automation_campaigns')
      await setDoc(campaignsRef, { campaigns: updatedCampaigns, updatedAt: new Date() })

      return execution
    } catch (error) {
      console.error('Error executing campaign:', error)
      throw error
    }
  }

  // ===== ANALYTICS & TRACKING =====
  
  // Get unified automation analytics
  static async getAutomationAnalytics(userId) {
    try {
      const [campaigns, executions, workflows] = await Promise.all([
        this.getAutomationCampaigns(userId),
        this.getCampaignExecutions(userId),
        this.getWorkflows(userId)
      ])

      const analytics = {
        campaigns: {
          total: campaigns.length,
          active: campaigns.filter(c => c.status === 'active').length,
          scheduled: campaigns.filter(c => c.status === 'scheduled').length
        },
        emails: {
          totalSent: campaigns.reduce((sum, c) => sum + (c.stats?.emailsSent || 0), 0),
          totalOpens: campaigns.reduce((sum, c) => sum + (c.stats?.opensCount || 0), 0),
          totalClicks: campaigns.reduce((sum, c) => sum + (c.stats?.clicksCount || 0), 0),
          avgOpenRate: campaigns.length > 0 
            ? campaigns.reduce((sum, c) => sum + (c.stats?.openRate || 0), 0) / campaigns.length 
            : 0
        },
        workflows: {
          total: workflows.length,
          active: workflows.filter(w => w.status === 'active').length,
          triggered: workflows.reduce((sum, w) => sum + (w.triggered || 0), 0)
        },
        executions: {
          total: executions.length,
          successful: executions.filter(e => e.status === 'completed').length,
          failed: executions.filter(e => e.status === 'failed').length
        }
      }

      return analytics
    } catch (error) {
      console.error('Error getting automation analytics:', error)
      return null
    }
  }

  // ===== HELPER METHODS =====
  
  static async getCampaignExecutions(userId) {
    try {
      const executionsRef = this.getUserDataRef(userId, 'campaign_executions')
      const doc = await getDoc(executionsRef)
      
      if (doc.exists()) {
        return doc.data().executions || []
      }
      return []
    } catch (error) {
      console.error('Error loading campaign executions:', error)
      return []
    }
  }

  static async getWorkflows(userId) {
    try {
      const workflowsRef = this.getUserDataRef(userId, 'workflows')
      const doc = await getDoc(workflowsRef)
      
      if (doc.exists()) {
        return doc.data().workflows || []
      }
      return []
    } catch (error) {
      console.error('Error loading workflows:', error)
      return []
    }
  }

  // Update contact engagement from campaign interactions
  static async updateContactEngagement(userId, contactId, engagementData) {
    try {
      const contactsRef = this.getUserDataRef(userId, 'crm_contacts')
      const doc = await getDoc(contactsRef)
      
      if (!doc.exists()) return
      
      const contacts = doc.data().contacts || []
      const contactIndex = contacts.findIndex(c => c.id === contactId)
      
      if (contactIndex !== -1) {
        // Update contact engagement history
        if (!contacts[contactIndex].engagementHistory) {
          contacts[contactIndex].engagementHistory = []
        }
        
        contacts[contactIndex].engagementHistory.push({
          ...engagementData,
          timestamp: new Date().toISOString()
        })
        
        // Update last contact date
        contacts[contactIndex].lastContact = new Date().toISOString()
        
        await setDoc(contactsRef, { contacts, updatedAt: new Date() })
      }
    } catch (error) {
      console.error('Error updating contact engagement:', error)
      throw error
    }
  }
}

export default IntegratedMarketingService