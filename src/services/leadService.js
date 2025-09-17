import { FirebaseAPI } from '../FirebaseAPI.js'

class LeadService {
  constructor() {
    this.api = new FirebaseAPI('leads')
  }

  // Create a new lead
  async createLead(tenantId, leadData) {
    try {
      const enrichedLead = {
        ...leadData,
        tenantId,
        status: 'new',
        enriched: false,
        lastContact: null,
        score: leadData.score || Math.floor(Math.random() * 40) + 60
      }

      const docId = await this.api.create(enrichedLead)
      
      if (docId) {
        await this.updateTenantUsage(tenantId, 'leads', 1)
        return { success: true, data: { id: docId, ...enrichedLead } }
      }

      return { success: false, error: 'Failed to create lead' }
    } catch (error) {
      console.error('Error creating lead:', error)
      return { success: false, error: error.message }
    }
  }

  // Get leads for a tenant
  async getLeads(tenantId, limitCount = 50) {
    try {
      const result = await this.api.read(
        { tenantId },
        { limit: limitCount }
      )

      if (result && result.documents) {
        return { success: true, data: result.documents }
      }

      return { success: false, error: 'No data returned' }
    } catch (error) {
      console.error('Error getting leads:', error)
      return { success: false, error: error.message }
    }
  }

  // Update a lead
  async updateLead(leadId, updateData) {
    try {
      await this.api.update(leadId, updateData)
      return { success: true, data: updateData }
    } catch (error) {
      console.error('Error updating lead:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete a lead
  async deleteLead(leadId) {
    try {
      await this.api.delete(leadId)
      return { success: true }
    } catch (error) {
      console.error('Error deleting lead:', error)
      return { success: false, error: error.message }
    }
  }

  // Get lead statistics for a tenant
  async getLeadStats(tenantId) {
    try {
      const result = await this.getLeads(tenantId, 1000)
      
      if (result.success) {
        const leads = result.data
        const totalLeads = leads.length
        const highQuality = leads.filter(lead => lead.score >= 80).length
        const mediumQuality = leads.filter(lead => lead.score >= 60 && lead.score < 80).length
        const lowQuality = leads.filter(lead => lead.score < 60).length
        
        const converted = leads.filter(lead => lead.status === 'converted').length
        const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0

        return {
          success: true,
          data: {
            totalLeads,
            highQuality,
            mediumQuality,
            lowQuality,
            conversionRate,
            newThisMonth: leads.filter(lead => {
              if (!lead.createdAt) return false
              const createdDate = lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt)
              const now = new Date()
              return createdDate.getMonth() === now.getMonth() && 
                     createdDate.getFullYear() === now.getFullYear()
            }).length
          }
        }
      }

      return { success: false, error: result.error }
    } catch (error) {
      console.error('Error getting lead stats:', error)
      return { success: false, error: error.message }
    }
  }

  // Generate AI-powered leads (simulated for demo)
  async generateAILeads(tenantId, source, count = 5) {
    try {
      const sampleLeads = [
        { firstName: 'John', lastName: 'Smith', email: 'john.smith@techcorp.com', company: 'TechCorp', phone: '555-0101' },
        { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@innovate.co', company: 'Innovate Co', phone: '555-0102' },
        { firstName: 'Mike', lastName: 'Chen', email: 'mike.chen@startup.io', company: 'Startup.io', phone: '555-0103' },
        { firstName: 'Emily', lastName: 'Davis', email: 'emily@digitalagency.com', company: 'Digital Agency', phone: '555-0104' },
        { firstName: 'David', lastName: 'Wilson', email: 'david.w@consulting.biz', company: 'Wilson Consulting', phone: '555-0105' },
        { firstName: 'Lisa', lastName: 'Brown', email: 'lisa.brown@solutions.net', company: 'Brown Solutions', phone: '555-0106' },
        { firstName: 'James', lastName: 'Miller', email: 'james@marketing.pro', company: 'Miller Marketing', phone: '555-0107' },
        { firstName: 'Anna', lastName: 'Garcia', email: 'anna.garcia@web.dev', company: 'Garcia Web Dev', phone: '555-0108' }
      ]

      const selectedLeads = sampleLeads
        .sort(() => 0.5 - Math.random())
        .slice(0, count)
        .map(lead => ({
          ...lead,
          source: source.toLowerCase(),
          title: this.generateRandomTitle(),
          score: Math.floor(Math.random() * 40) + 60,
          tags: [source.toLowerCase(), 'ai-generated'],
          notes: [`Generated from ${source} scraping`]
        }))

      const results = []
      for (const leadData of selectedLeads) {
        const result = await this.createLead(tenantId, leadData)
        if (result.success) {
          results.push(result.data)
        }
      }

      return { success: true, data: results }
    } catch (error) {
      console.error('Error generating AI leads:', error)
      return { success: false, error: error.message }
    }
  }

  // Helper method to generate random job titles
  generateRandomTitle() {
    const titles = [
      'Marketing Manager', 'Sales Director', 'CEO', 'CTO', 'VP Sales',
      'Marketing Director', 'Business Owner', 'Founder', 'Head of Marketing',
      'Sales Manager', 'Product Manager', 'Operations Manager'
    ]
    return titles[Math.floor(Math.random() * titles.length)]
  }

  // Update tenant usage statistics
  async updateTenantUsage(tenantId, metric, increment = 1) {
    try {
      console.log(`Updated tenant ${tenantId} ${metric} by ${increment}`)
    } catch (error) {
      console.error('Error updating tenant usage:', error)
    }
  }

  // Search leads
  async searchLeads(tenantId, searchTerm, filters = {}) {
    try {
      const result = await this.getLeads(tenantId, 1000)
      
      if (result.success) {
        let filteredLeads = result.data

        if (searchTerm) {
          filteredLeads = filteredLeads.filter(lead => 
            lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        }

        if (filters.source && filters.source !== 'all') {
          filteredLeads = filteredLeads.filter(lead => lead.source === filters.source)
        }

        if (filters.minScore) {
          filteredLeads = filteredLeads.filter(lead => lead.score >= filters.minScore)
        }

        return { success: true, data: filteredLeads }
      }

      return { success: false, error: result.error }
    } catch (error) {
      console.error('Error searching leads:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new LeadService()