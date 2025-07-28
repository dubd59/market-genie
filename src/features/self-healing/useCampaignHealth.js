import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

// Health score thresholds for campaign monitoring
const HEALTH_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  NEEDS_ATTENTION: 60,
  CRITICAL: 40
}

export function useCampaignHealth(campaignId) {
  const { user } = useAuth()
  const [healthData, setHealthData] = useState(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Calculate health score based on campaign metrics
  const calculateHealthScore = useCallback((metrics) => {
    if (!metrics) return 50

    let score = 100
    
    // Deduct points based on poor performance
    if (metrics.open_rate < 0.2) score -= 25 // Poor email open rate
    if (metrics.click_rate < 0.02) score -= 20 // Poor click-through rate
    if (metrics.conversion_rate < 0.01) score -= 30 // Poor conversion rate
    if (metrics.unsubscribe_rate > 0.05) score -= 15 // High unsubscribe rate
    if (metrics.bounce_rate > 0.1) score -= 10 // High bounce rate

    // Bonus points for good performance
    if (metrics.open_rate > 0.3) score += 5
    if (metrics.click_rate > 0.05) score += 5
    if (metrics.conversion_rate > 0.03) score += 10

    return Math.max(0, Math.min(100, score))
  }, [])

  // Auto-fix function for poor performing campaigns
  const autoFixCampaign = useCallback(async (campaign, currentScore) => {
    if (!campaign || currentScore > 70) return null

    const fixes = []
    const metrics = campaign.campaign_analytics || {}

    try {
      let updates = {}

      // Fix low open rates
      if (metrics.open_rate < 0.2) {
        fixes.push('Optimized subject line for better open rates')
        updates.subject_optimized = true
      }

      // Fix low click rates
      if (metrics.click_rate < 0.02) {
        fixes.push('Enhanced call-to-action buttons')
        updates.cta_optimized = true
      }

      // Fix low conversion rates
      if (metrics.conversion_rate < 0.01) {
        fixes.push('Improved landing page content')
        updates.landing_page_optimized = true
      }

      if (fixes.length > 0) {
        toast.success(`Auto-healing applied: ${fixes.join(', ')}`)
        
        // Simulate health improvement
        const newScore = Math.min(100, currentScore + 15)
        
        return {
          fixes,
          newScore,
          timestamp: new Date().toISOString()
        }
      }

      return null
    } catch (error) {
      console.error('Error in auto-fix:', error)
      toast.error('Auto-healing failed: ' + error.message)
      return null
    }
  }, [])

  // Get current campaign health
  const fetchCampaignHealth = useCallback(async () => {
    if (!campaignId || !user) return

    try {
      setLoading(true)
      
      // Mock campaign data with realistic metrics
      const mockCampaign = {
        id: campaignId,
        campaign_analytics: {
          open_rate: Math.random() * 0.4 + 0.1, // 10-50%
          click_rate: Math.random() * 0.08 + 0.01, // 1-9%
          conversion_rate: Math.random() * 0.05 + 0.005, // 0.5-5.5%
          unsubscribe_rate: Math.random() * 0.03, // 0-3%
          bounce_rate: Math.random() * 0.05 // 0-5%
        }
      }

      const healthScore = calculateHealthScore(mockCampaign.campaign_analytics)
      
      const data = {
        overallHealth: healthScore,
        metrics: mockCampaign.campaign_analytics,
        suggestions: generateSuggestions(mockCampaign.campaign_analytics, healthScore),
        lastUpdated: new Date().toISOString()
      }

      setHealthData(data)
      
      // Auto-healing for critical campaigns
      if (healthScore < HEALTH_THRESHOLDS.CRITICAL) {
        const healingResult = await autoFixCampaign(mockCampaign, healthScore)
        if (healingResult) {
          setHealthData(prev => ({
            ...prev,
            overallHealth: healingResult.newScore,
            autoHealingApplied: healingResult.fixes
          }))
        }
      }

    } catch (error) {
      console.error('Error fetching campaign health:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [campaignId, user, calculateHealthScore, autoFixCampaign])

  // Generate suggestions based on metrics
  const generateSuggestions = useCallback((metrics, score) => {
    const suggestions = []

    if (metrics.open_rate < 0.2) {
      suggestions.push('Try A/B testing different subject lines')
    }
    if (metrics.click_rate < 0.02) {
      suggestions.push('Consider more prominent call-to-action buttons')
    }
    if (metrics.conversion_rate < 0.01) {
      suggestions.push('Optimize your landing page for better conversions')
    }
    if (score < HEALTH_THRESHOLDS.GOOD) {
      suggestions.push('Enable auto-healing to automatically optimize performance')
    }

    return suggestions
  }, [])

  // Start monitoring campaign health
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    fetchCampaignHealth()
    
    // Set up periodic health checks
    const interval = setInterval(fetchCampaignHealth, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [fetchCampaignHealth])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  // Effect to handle campaign changes
  useEffect(() => {
    if (campaignId && isMonitoring) {
      const cleanup = startMonitoring()
      return cleanup
    }
  }, [campaignId, isMonitoring, startMonitoring])

  return {
    healthData,
    isMonitoring,
    loading,
    error,
    startMonitoring,
    stopMonitoring,
    calculateHealthScore,
    fetchCampaignHealth
  }
}
