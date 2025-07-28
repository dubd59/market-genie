import { supabase } from '../supabase/client'

export const grantWish = async (wishText, userId) => {
  try {
    // 1. Check Office Genie connection (if available)
    if (window.OfficeGenie?.isConnected) {
      return await window.OfficeGenie.ask(wishText)
    }
    
    // 2. Use Supabase Edge Function for AI processing
    const { data, error } = await supabase.functions.invoke('grant-wish', {
      body: JSON.stringify({ 
        wish: wishText,
        user_id: userId,
        context: {
          timestamp: new Date().toISOString(),
          source: 'market-genie'
        }
      })
    })
    
    if (error) throw error
    
    return data
  } catch (error) {
    console.error('Error granting wish:', error)
    
    // 3. Fallback to local processing
    return await processFallbackWish(wishText)
  }
}

// Fallback wish processing for when AI services are unavailable
const processFallbackWish = async (wishText) => {
  const lowerWish = wishText.toLowerCase()
  
  // Simple pattern matching for common marketing wishes
  const patterns = {
    'lead': {
      action: 'lead_generation',
      suggestions: [
        'Create a lead magnet campaign',
        'Set up landing page optimization',
        'Implement lead scoring system'
      ]
    },
    'email': {
      action: 'email_marketing',
      suggestions: [
        'Design email sequence automation',
        'Create personalized email templates',
        'Set up A/B testing for subject lines'
      ]
    },
    'social': {
      action: 'social_media',
      suggestions: [
        'Plan social media content calendar',
        'Create engaging post templates',
        'Set up social media automation'
      ]
    },
    'conversion': {
      action: 'conversion_optimization',
      suggestions: [
        'Optimize checkout process',
        'Create urgency-driven campaigns',
        'Implement retargeting strategies'
      ]
    },
    'analytics': {
      action: 'analytics_setup',
      suggestions: [
        'Set up conversion tracking',
        'Create custom dashboards',
        'Implement attribution modeling'
      ]
    }
  }
  
  let matchedPattern = null
  for (const [key, pattern] of Object.entries(patterns)) {
    if (lowerWish.includes(key)) {
      matchedPattern = pattern
      break
    }
  }
  
  if (!matchedPattern) {
    matchedPattern = {
      action: 'general_marketing',
      suggestions: [
        'Analyze your current marketing funnel',
        'Create customer journey mapping',
        'Implement marketing automation'
      ]
    }
  }
  
  return {
    success: true,
    action: matchedPattern.action,
    message: `I've analyzed your wish: "${wishText}". Here's what I recommend:`,
    suggestions: matchedPattern.suggestions,
    next_steps: [
      'Review the suggestions above',
      'Choose the most relevant strategy',
      'Let me help you implement it'
    ]
  }
}

export const getWishHistory = async (userId) => {
  const { data, error } = await supabase
    .from('wishes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const saveWish = async (wishData) => {
  const { data, error } = await supabase
    .from('wishes')
    .insert(wishData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateWishStatus = async (wishId, status, result = null) => {
  const updates = { 
    status,
    updated_at: new Date().toISOString()
  }
  
  if (result) {
    updates.result = result
  }
  
  const { data, error } = await supabase
    .from('wishes')
    .update(updates)
    .eq('id', wishId)
    .select()
    .single()
  
  if (error) throw error
  return data
}
