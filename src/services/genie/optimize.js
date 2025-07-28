import { supabase } from '../supabase/client'

export const optimizeCampaign = async (campaignId, metrics) => {
  try {
    // Call AI optimization service
    const { data, error } = await supabase.functions.invoke('optimize-campaign', {
      body: JSON.stringify({
        campaign_id: campaignId,
        metrics: metrics,
        optimization_goals: ['conversion_rate', 'cost_per_acquisition', 'roi']
      })
    })
    
    if (error) throw error
    
    return data
  } catch (error) {
    console.error('Error optimizing campaign:', error)
    
    // Fallback optimization logic
    return await fallbackOptimization(campaignId, metrics)
  }
}

const fallbackOptimization = async (campaignId, metrics) => {
  const suggestions = []
  
  // Analyze conversion rate
  if (metrics.conversion_rate < 0.02) { // Less than 2%
    suggestions.push({
      type: 'conversion_rate',
      priority: 'high',
      title: 'Improve Conversion Rate',
      description: 'Your conversion rate is below industry average',
      actions: [
        'Optimize landing page design',
        'Improve call-to-action placement',
        'Test different value propositions',
        'Reduce form fields'
      ]
    })
  }
  
  // Analyze cost per acquisition
  if (metrics.cost_per_acquisition > metrics.target_cpa * 1.5) {
    suggestions.push({
      type: 'cost_optimization',
      priority: 'high',
      title: 'Reduce Cost Per Acquisition',
      description: 'CPA is significantly above target',
      actions: [
        'Refine audience targeting',
        'Pause underperforming ad sets',
        'Optimize bidding strategy',
        'Improve ad relevance score'
      ]
    })
  }
  
  // Analyze click-through rate
  if (metrics.click_through_rate < 0.01) { // Less than 1%
    suggestions.push({
      type: 'engagement',
      priority: 'medium',
      title: 'Improve Click-Through Rate',
      description: 'Low engagement with your ads',
      actions: [
        'Test new ad creatives',
        'Improve ad copy',
        'Use more compelling headlines',
        'Add emotional triggers'
      ]
    })
  }
  
  // Analyze email open rates
  if (metrics.email_open_rate < 0.2) { // Less than 20%
    suggestions.push({
      type: 'email_optimization',
      priority: 'medium',
      title: 'Boost Email Performance',
      description: 'Email open rates need improvement',
      actions: [
        'A/B test subject lines',
        'Optimize send times',
        'Improve sender reputation',
        'Segment email lists better'
      ]
    })
  }
  
  return {
    success: true,
    campaign_id: campaignId,
    optimization_score: calculateOptimizationScore(metrics),
    suggestions,
    estimated_improvement: {
      conversion_rate_lift: '15-25%',
      cost_reduction: '10-20%',
      roi_improvement: '20-30%'
    }
  }
}

const calculateOptimizationScore = (metrics) => {
  let score = 100
  
  // Deduct points based on performance
  if (metrics.conversion_rate < 0.02) score -= 20
  if (metrics.cost_per_acquisition > metrics.target_cpa * 1.5) score -= 25
  if (metrics.click_through_rate < 0.01) score -= 15
  if (metrics.email_open_rate < 0.2) score -= 10
  if (metrics.roi < 3) score -= 20
  
  return Math.max(score, 0)
}

export const getOptimizationHistory = async (campaignId) => {
  const { data, error } = await supabase
    .from('campaign_optimizations')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const saveOptimizationResult = async (optimizationData) => {
  const { data, error } = await supabase
    .from('campaign_optimizations')
    .insert(optimizationData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const autoOptimizeCampaigns = async (userId) => {
  try {
    // Get all active campaigns for the user
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        campaign_analytics (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
    
    if (error) throw error
    
    const optimizationResults = []
    
    for (const campaign of campaigns) {
      if (campaign.campaign_analytics) {
        const result = await optimizeCampaign(campaign.id, campaign.campaign_analytics)
        optimizationResults.push(result)
      }
    }
    
    return optimizationResults
  } catch (error) {
    console.error('Error in auto-optimization:', error)
    throw error
  }
}
