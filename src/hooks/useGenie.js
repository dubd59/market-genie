import { useState } from 'react'
import { supabase } from '../services/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export const useGenie = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastWish, setLastWish] = useState(null)
  const { user } = useAuth()

  const grantWish = async (wishText) => {
    if (!user) {
      toast.error('Please log in to make a wish')
      return null
    }

    setIsProcessing(true)
    
    try {
      // Competitive Edge: Voice + Text support
      const wish = typeof wishText === 'string' 
        ? { type: 'auto', text: wishText, source: 'text' }
        : { ...wishText, source: 'voice' }

      // Save wish to database first
      const wishRecord = {
        user_id: user.id,
        wish_text: wish.text,
        wish_type: wish.type,
        status: 'processing',
        created_at: new Date().toISOString(),
      }

      const { data: savedWish, error: saveError } = await supabase
        .from('genie_wishes')
        .insert(wishRecord)
        .select()
        .single()

      if (saveError) throw saveError

      // Call the AI service
      const { data, error } = await supabase.functions.invoke('grant-wish', {
        body: JSON.stringify({ 
          wish,
          wish_id: savedWish.id,
          user_id: user.id
        })
      })

      if (error) throw error

      // Update wish record with result
      const { error: updateError } = await supabase
        .from('genie_wishes')
        .update({
          status: 'completed',
          result: data,
          completed_at: new Date().toISOString()
        })
        .eq('id', savedWish.id)

      if (updateError) throw updateError

      setLastWish({ ...savedWish, result: data })
      
      toast.success('🧞‍♂️ Your wish has been granted!')
      
      return {
        ...data,
        wishId: savedWish.id,
        timestamp: savedWish.created_at
      }

    } catch (error) {
      console.error('Error granting wish:', error)
      toast.error('🧞‍♂️ Something went wrong with your wish. Try again!')
      
      // Fallback to local processing if AI service fails
      return await processFallbackWish(wishText)
    } finally {
      setIsProcessing(false)
    }
  }

  const getWishHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('genie_wishes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching wish history:', error)
      toast.error('Unable to load wish history')
      return []
    }
  }

  const retryWish = async (wishId) => {
    try {
      const { data: wish, error } = await supabase
        .from('genie_wishes')
        .select('*')
        .eq('id', wishId)
        .single()

      if (error) throw error

      return await grantWish(wish.wish_text)
    } catch (error) {
      console.error('Error retrying wish:', error)
      toast.error('Unable to retry wish')
      return null
    }
  }

  return { 
    grantWish, 
    isProcessing, 
    lastWish,
    getWishHistory,
    retryWish
  }
}

// Fallback wish processing for when AI services are unavailable
const processFallbackWish = async (wishText) => {
  const lowerWish = wishText.toLowerCase()
  
  // Enhanced pattern matching for marketing wishes
  const patterns = {
    'lead': {
      action: 'lead_generation',
      confidence: 0.9,
      suggestions: [
        'Create a lead magnet with high-converting content',
        'Set up landing page optimization with A/B testing',
        'Implement advanced lead scoring system',
        'Deploy lookalike audience campaigns'
      ],
      automations: [
        'Email sequence for new leads',
        'Lead qualification workflow',
        'CRM integration setup'
      ]
    },
    'email': {
      action: 'email_marketing',
      confidence: 0.85,
      suggestions: [
        'Design automated email sequence with personalization',
        'Create dynamic email templates with brand consistency',
        'Set up advanced A/B testing for subject lines and content',
        'Implement behavioral trigger campaigns'
      ],
      automations: [
        'Welcome series automation',
        'Abandoned cart recovery',
        'Re-engagement campaigns'
      ]
    },
    'social': {
      action: 'social_media',
      confidence: 0.8,
      suggestions: [
        'Plan AI-driven content calendar with optimal posting times',
        'Create engaging post templates with brand voice',
        'Set up social media automation and scheduling',
        'Implement social listening and engagement tracking'
      ],
      automations: [
        'Content scheduling pipeline',
        'Social media monitoring',
        'Engagement response templates'
      ]
    },
    'conversion': {
      action: 'conversion_optimization',
      confidence: 0.95,
      suggestions: [
        'Optimize checkout process with friction analysis',
        'Create urgency-driven campaigns with scarcity tactics',
        'Implement advanced retargeting strategies',
        'Deploy exit-intent popups with smart targeting'
      ],
      automations: [
        'Cart abandonment recovery',
        'Upsell/cross-sell workflows',
        'Conversion tracking setup'
      ]
    },
    'analytics': {
      action: 'analytics_setup',
      confidence: 0.9,
      suggestions: [
        'Set up comprehensive conversion tracking across all channels',
        'Create custom dashboards with actionable insights',
        'Implement multi-touch attribution modeling',
        'Deploy predictive analytics for customer behavior'
      ],
      automations: [
        'Automated reporting system',
        'Alert system for key metrics',
        'Data visualization pipeline'
      ]
    }
  }
  
  let matchedPattern = null
  let maxConfidence = 0
  
  // Find the best matching pattern
  for (const [key, pattern] of Object.entries(patterns)) {
    if (lowerWish.includes(key) && pattern.confidence > maxConfidence) {
      matchedPattern = pattern
      maxConfidence = pattern.confidence
    }
  }
  
  // Default pattern if no match found
  if (!matchedPattern) {
    matchedPattern = {
      action: 'general_marketing',
      confidence: 0.7,
      suggestions: [
        'Analyze your current marketing funnel for optimization opportunities',
        'Create comprehensive customer journey mapping',
        'Implement marketing automation with personalization',
        'Set up advanced analytics and performance tracking'
      ],
      automations: [
        'Marketing funnel analysis',
        'Customer segmentation',
        'Performance monitoring'
      ]
    }
  }
  
  return {
    success: true,
    action: matchedPattern.action,
    confidence: maxConfidence,
    message: `🧞‍♂️ I've analyzed your wish: "${wishText}". Here's my strategic recommendation:`,
    suggestions: matchedPattern.suggestions,
    automations: matchedPattern.automations,
    next_steps: [
      'Review the strategic suggestions above',
      'Choose the most relevant tactics for your goals',
      'Let me help you implement the automation workflows',
      'Set up tracking to measure success'
    ],
    estimated_impact: {
      timeline: '2-4 weeks',
      effort: 'Medium',
      expected_improvement: '25-40%'
    }
  }
}
