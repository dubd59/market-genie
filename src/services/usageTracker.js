// Usage Tracking Service for Freemium System
import { collection, doc, getDoc, updateDoc, increment, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { PLAN_LIMITS, isLimitReached, getRemainingQuota } from './planLimits'

export class UsageTracker {
  constructor(tenantId) {
    this.tenantId = tenantId
  }

  // Get current usage stats for a tenant
  async getUsageStats() {
    try {
      const tenantDoc = await getDoc(doc(db, 'tenants', this.tenantId))
      
      if (!tenantDoc.exists()) {
        return this.getDefaultUsageStats()
      }

      const tenantData = tenantDoc.data()
      const usage = tenantData.usage || this.getDefaultUsageStats()
      
      // Ensure we have current month tracking
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      if (!usage.emailsSentThisMonth || usage.currentMonth !== currentMonth) {
        usage.emailsSentThisMonth = 0
        usage.currentMonth = currentMonth
        
        // Update in database
        await this.updateUsage({ 
          emailsSentThisMonth: 0, 
          currentMonth: currentMonth 
        })
      }

      return usage
    } catch (error) {
      console.error('Error getting usage stats:', error)
      return this.getDefaultUsageStats()
    }
  }

  getDefaultUsageStats() {
    const currentMonth = new Date().toISOString().slice(0, 7)
    return {
      contactCount: 0,
      emailsSentThisMonth: 0,
      activeCampaigns: 0,
      currentMonth: currentMonth,
      lastUpdated: new Date().toISOString()
    }
  }

  // Update usage stats
  async updateUsage(updates) {
    try {
      const tenantRef = doc(db, 'tenants', this.tenantId)
      const updateData = {
        [`usage.lastUpdated`]: serverTimestamp()
      }

      // Add all updates with proper nested field syntax
      Object.keys(updates).forEach(key => {
        updateData[`usage.${key}`] = updates[key]
      })

      await updateDoc(tenantRef, updateData)
      return true
    } catch (error) {
      console.error('Error updating usage:', error)
      return false
    }
  }

  // Increment usage counters
  async incrementUsage(type, amount = 1) {
    try {
      const tenantRef = doc(db, 'tenants', this.tenantId)
      const updateData = {
        [`usage.lastUpdated`]: serverTimestamp()
      }

      switch (type) {
        case 'contacts':
          updateData[`usage.contactCount`] = increment(amount)
          break
        case 'emails':
          updateData[`usage.emailsSentThisMonth`] = increment(amount)
          // Ensure current month is set
          updateData[`usage.currentMonth`] = new Date().toISOString().slice(0, 7)
          break
        case 'campaigns':
          updateData[`usage.activeCampaigns`] = increment(amount)
          break
        default:
          console.warn('Unknown usage type:', type)
          return false
      }

      await updateDoc(tenantRef, updateData)
      return true
    } catch (error) {
      console.error('Error incrementing usage:', error)
      return false
    }
  }

  // Check if an action would exceed limits
  async canPerformAction(planType, actionType, amount = 1) {
    const usage = await this.getUsageStats()
    const limits = PLAN_LIMITS[planType] || PLAN_LIMITS.free

    switch (actionType) {
      case 'addContact':
        return !isLimitReached(planType, 'maxContacts', usage.contactCount + amount)
      case 'sendEmail':
        return !isLimitReached(planType, 'maxEmailsPerMonth', usage.emailsSentThisMonth + amount)
      case 'createCampaign':
        return !isLimitReached(planType, 'maxCampaigns', usage.activeCampaigns + amount)
      default:
        return true
    }
  }

  // Get limit status for UI display
  async getLimitStatus(planType) {
    const usage = await this.getUsageStats()
    const limits = PLAN_LIMITS[planType] || PLAN_LIMITS.free

    return {
      contacts: {
        current: usage.contactCount,
        limit: limits.maxContacts,
        remaining: getRemainingQuota(planType, 'maxContacts', usage.contactCount),
        isNearLimit: limits.maxContacts > 0 && usage.contactCount >= limits.maxContacts * 0.8,
        isAtLimit: isLimitReached(planType, 'maxContacts', usage.contactCount)
      },
      emails: {
        current: usage.emailsSentThisMonth,
        limit: limits.maxEmailsPerMonth,
        remaining: getRemainingQuota(planType, 'maxEmailsPerMonth', usage.emailsSentThisMonth),
        isNearLimit: limits.maxEmailsPerMonth > 0 && usage.emailsSentThisMonth >= limits.maxEmailsPerMonth * 0.8,
        isAtLimit: isLimitReached(planType, 'maxEmailsPerMonth', usage.emailsSentThisMonth)
      },
      campaigns: {
        current: usage.activeCampaigns,
        limit: limits.maxCampaigns,
        remaining: getRemainingQuota(planType, 'maxCampaigns', usage.activeCampaigns),
        isNearLimit: limits.maxCampaigns > 0 && usage.activeCampaigns >= limits.maxCampaigns * 0.8,
        isAtLimit: isLimitReached(planType, 'maxCampaigns', usage.activeCampaigns)
      }
    }
  }

  // Reset monthly counters (for email usage)
  async resetMonthlyUsage() {
    const currentMonth = new Date().toISOString().slice(0, 7)
    await this.updateUsage({
      emailsSentThisMonth: 0,
      currentMonth: currentMonth
    })
  }

  // Sync usage from actual data (for accuracy)
  async syncUsageFromActualData() {
    try {
      // Count actual contacts
      const contactsQuery = query(
        collection(db, 'contacts'),
        where('tenantId', '==', this.tenantId)
      )
      const contactsSnapshot = await getDocs(contactsQuery)
      const actualContactCount = contactsSnapshot.size

      // Count active campaigns
      const campaignsQuery = query(
        collection(db, 'campaigns'),
        where('tenantId', '==', this.tenantId),
        where('status', '==', 'active')
      )
      const campaignsSnapshot = await getDocs(campaignsQuery)
      const actualCampaignCount = campaignsSnapshot.size

      // Update usage with actual counts
      await this.updateUsage({
        contactCount: actualContactCount,
        activeCampaigns: actualCampaignCount
      })

      console.log('Usage synced with actual data:', {
        contacts: actualContactCount,
        campaigns: actualCampaignCount
      })

      return true
    } catch (error) {
      console.error('Error syncing usage:', error)
      return false
    }
  }
}

// Convenience functions for use throughout the app
export const trackUsage = (tenantId) => new UsageTracker(tenantId)

export const checkLimit = async (tenantId, planType, actionType, amount = 1) => {
  const tracker = new UsageTracker(tenantId)
  return await tracker.canPerformAction(planType, actionType, amount)
}

export const incrementUsage = async (tenantId, type, amount = 1) => {
  const tracker = new UsageTracker(tenantId)
  return await tracker.incrementUsage(type, amount)
}

export const getLimitStatus = async (tenantId, planType) => {
  const tracker = new UsageTracker(tenantId)
  return await tracker.getLimitStatus(planType)
}