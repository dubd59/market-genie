// Plan Limits Configuration for Freemium System
// This defines the limits for each plan type

export const PLAN_LIMITS = {
  free: {
    name: 'Free',
    maxContacts: 75,
    maxEmailsPerMonth: 300,
    maxCampaigns: 3,
    features: {
      basicAutomation: true,
      emailSupport: true,
      leadCaptureForms: true,
      basicAI: true,
      // Disabled features for free plan
      advancedAI: false,
      premiumIntegrations: false,
      prioritySupport: false,
      customIntegrations: false,
      whiteLabel: false,
      multiTenant: false,
      analytics3D: false,
      voiceControl: false
    }
  },
  
  pro: {
    name: 'Professional',
    maxContacts: 10000,
    maxEmailsPerMonth: 50000,
    maxCampaigns: -1, // -1 means unlimited
    features: {
      basicAutomation: true,
      emailSupport: true,
      leadCaptureForms: true,
      basicAI: true,
      advancedAI: true,
      premiumIntegrations: true,
      prioritySupport: true,
      customIntegrations: true,
      analytics3D: true,
      voiceControl: true,
      // Still disabled for pro
      whiteLabel: false,
      multiTenant: false
    }
  },
  
  lifetime: {
    name: 'Lifetime',
    maxContacts: -1, // unlimited
    maxEmailsPerMonth: -1, // unlimited
    maxCampaigns: -1, // unlimited
    features: {
      basicAutomation: true,
      emailSupport: true,
      leadCaptureForms: true,
      basicAI: true,
      advancedAI: true,
      premiumIntegrations: true,
      prioritySupport: true,
      customIntegrations: true,
      analytics3D: true,
      voiceControl: true,
      whiteLabel: true,
      multiTenant: true
    }
  },

  // Lifetime plan with active White Label license
  lifetime_with_whitelabel: {
    name: 'Lifetime + White Label',
    maxContacts: -1, // unlimited
    maxEmailsPerMonth: -1, // unlimited
    maxCampaigns: -1, // unlimited
    features: {
      basicAutomation: true,
      emailSupport: true,
      leadCaptureForms: true,
      basicAI: true,
      advancedAI: true,
      premiumIntegrations: true,
      prioritySupport: true,
      customIntegrations: true,
      analytics3D: true,
      voiceControl: true,
      whiteLabel: true,
      multiTenant: true
    }
  },
  
  // Existing users get founder benefits
  founder: {
    name: 'Founder',
    maxContacts: -1, // unlimited
    maxEmailsPerMonth: -1, // unlimited
    maxCampaigns: -1, // unlimited
    features: {
      basicAutomation: true,
      emailSupport: true,
      leadCaptureForms: true,
      basicAI: true,
      advancedAI: true,
      premiumIntegrations: true,
      prioritySupport: true,
      customIntegrations: true,
      analytics3D: true,
      voiceControl: true,
      whiteLabel: true,
      multiTenant: true
    }
  }
}

// Helper functions
export const getPlanLimits = (planType) => {
  return PLAN_LIMITS[planType] || PLAN_LIMITS.free
}

export const isFeatureEnabled = (planType, feature) => {
  const limits = getPlanLimits(planType)
  return limits.features[feature] || false
}

export const hasUnlimitedAccess = (planType) => {
  return planType === 'founder' || planType === 'lifetime'
}

export const isLimitReached = (planType, limitType, currentUsage) => {
  const limits = getPlanLimits(planType)
  const maxAllowed = limits[limitType]
  
  // -1 means unlimited
  if (maxAllowed === -1) return false
  
  return currentUsage >= maxAllowed
}

export const getLimitProgress = (planType, limitType, currentUsage) => {
  const limits = getPlanLimits(planType)
  const maxAllowed = limits[limitType]
  
  if (maxAllowed === -1) return 0 // unlimited
  
  return Math.min((currentUsage / maxAllowed) * 100, 100)
}

export const getRemainingQuota = (planType, limitType, currentUsage) => {
  const limits = getPlanLimits(planType)
  const maxAllowed = limits[limitType]
  
  if (maxAllowed === -1) return Infinity
  
  return Math.max(0, maxAllowed - currentUsage)
}