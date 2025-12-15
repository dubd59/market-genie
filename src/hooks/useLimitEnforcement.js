// Limit Enforcement Hook for React Components
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTenant } from '../contexts/TenantContext'
import { UsageTracker } from '../services/usageTracker'

export const useLimitEnforcement = () => {
  const { user } = useAuth()
  const { tenant } = useTenant()
  const [limitStatus, setLimitStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tenant?.id && tenant?.plan) {
      fetchLimitStatus()
    }
  }, [tenant])

  const fetchLimitStatus = async () => {
    try {
      const plan = tenant.plan || tenant.subscription?.plan || 'free'
      const tracker = new UsageTracker(tenant.id)
      const status = await tracker.getLimitStatus(plan)
      setLimitStatus(status)
    } catch (error) {
      console.error('Error fetching limit status:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAndEnforce = async (actionType, amount = 1) => {
    if (!tenant?.id || (!tenant?.plan && !tenant?.subscription?.plan)) {
      return { allowed: false, reason: 'No tenant configured' }
    }

    const currentPlan = tenant.plan || tenant.subscription?.plan || 'free'
    const tracker = new UsageTracker(tenant.id)
    const canPerform = await tracker.canPerformAction(currentPlan, actionType, amount)

    if (!canPerform) {
      const actionLimits = {
        addContact: 'contact',
        sendEmail: 'email',
        createCampaign: 'campaign'
      }
      
      const limitType = actionLimits[actionType]
      return {
        allowed: false,
        reason: 'limit_reached',
        limitType,
        currentPlan
      }
    }

    return { allowed: true }
  }

  const trackAction = async (actionType, amount = 1) => {
    if (!tenant?.id) return false

    const tracker = new UsageTracker(tenant.id)
    const typeMapping = {
      addContact: 'contacts',
      sendEmail: 'emails',
      createCampaign: 'campaigns'
    }

    const trackingType = typeMapping[actionType]
    if (trackingType) {
      const success = await tracker.incrementUsage(trackingType, amount)
      if (success) {
        // Refresh limit status after tracking
        await fetchLimitStatus()
      }
      return success
    }

    return false
  }

  return {
    limitStatus,
    loading,
    checkAndEnforce,
    trackAction,
    refreshLimits: fetchLimitStatus
  }
}