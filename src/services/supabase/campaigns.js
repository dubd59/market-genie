import { supabase } from './client'

export const campaignsService = {
  // Get all campaigns for the current user
  async getCampaigns(userId) {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        campaign_steps (*),
        campaign_analytics (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create a new campaign
  async createCampaign(campaignData) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update campaign
  async updateCampaign(id, updates) {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete campaign
  async deleteCampaign(id) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Launch campaign
  async launchCampaign(campaignId) {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ 
        status: 'active',
        launched_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Pause campaign
  async pauseCampaign(campaignId) {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ status: 'paused' })
      .eq('id', campaignId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get campaign analytics
  async getCampaignAnalytics(campaignId) {
    const { data, error } = await supabase
      .from('campaign_analytics')
      .select('*')
      .eq('campaign_id', campaignId)
      .single()
    
    if (error) throw error
    return data
  },

  // Update campaign analytics
  async updateCampaignAnalytics(campaignId, analytics) {
    const { data, error } = await supabase
      .from('campaign_analytics')
      .upsert({
        campaign_id: campaignId,
        ...analytics,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get campaign templates
  async getCampaignTemplates() {
    const { data, error } = await supabase
      .from('campaign_templates')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data
  },

  // Create campaign from template
  async createFromTemplate(templateId, userId, customizations = {}) {
    const { data: template, error: templateError } = await supabase
      .from('campaign_templates')
      .select('*')
      .eq('id', templateId)
      .single()
    
    if (templateError) throw templateError

    const campaignData = {
      ...template.config,
      ...customizations,
      user_id: userId,
      template_id: templateId,
      created_at: new Date().toISOString()
    }

    return this.createCampaign(campaignData)
  }
}
