// Upgrade Prompt Modals for Freemium Limits
import React from 'react'
import { X, Crown, Zap, Star } from 'lucide-react'
import { PLAN_LIMITS } from '../services/planLimits'

const UpgradeModal = ({ isOpen, onClose, limitType, currentPlan }) => {
  if (!isOpen) return null

  const limitMessages = {
    contact: {
      title: "Contact Limit Reached",
      message: "You've reached your contact limit for the free plan.",
      icon: <Crown className="w-12 h-12 text-yellow-500" />
    },
    email: {
      title: "Email Limit Reached", 
      message: "You've reached your monthly email limit for the free plan.",
      icon: <Zap className="w-12 h-12 text-blue-500" />
    },
    campaign: {
      title: "Campaign Limit Reached",
      message: "You've reached your campaign limit for the free plan.",
      icon: <Star className="w-12 h-12 text-purple-500" />
    }
  }

  const limit = limitMessages[limitType] || limitMessages.contact

  const plans = [
    {
      name: 'Pro Plan',
      price: '$20',
      period: '/month',
      features: [
        '10,000 contacts',
        '50,000 emails/month',
        'Unlimited campaigns',
        'Advanced analytics',
        'Priority support'
      ],
      buttonText: 'Upgrade to Pro',
      popular: true
    },
    {
      name: 'Lifetime',
      price: '$300',
      period: 'one-time',
      features: [
        'Unlimited contacts',
        'Unlimited emails',
        'Unlimited campaigns',
        'All premium features',
        'Lifetime updates',
        'VIP support'
      ],
      buttonText: 'Get Lifetime Access',
      popular: false
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            {limit.icon}
            <h2 className="text-2xl font-bold text-gray-900 mt-4">{limit.title}</h2>
            <p className="text-gray-600 mt-2">{limit.message}</p>
          </div>
        </div>

        {/* Current Plan Status */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="text-center">
            <p className="text-sm text-gray-600">Your current plan: <span className="font-semibold capitalize">{currentPlan}</span></p>
            <p className="text-sm text-gray-500 mt-1">Upgrade to continue growing your business</p>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-xl border-2 p-6 ${
                  plan.popular
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  onClick={() => handleUpgrade(plan.name.toLowerCase().replace(' ', '_'))}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t text-center">
          <p className="text-sm text-gray-600">
            Questions? <a 
              href="https://supportgenie.help/customer?tenant=supportgenie-tenant" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Contact our AI support portal
            </a> or email <a href="mailto:Help@dubdproducts.com" className="text-blue-600 hover:underline">Help@dubdproducts.com</a>
          </p>
        </div>
      </div>
    </div>
  )

  function handleUpgrade(planType) {
    // TODO: Integrate with payment processor
    console.log('Upgrading to:', planType)
    
    // For now, close modal and show success message
    onClose()
    
    // In production, this would:
    // 1. Open Stripe/payment processor
    // 2. Handle successful payment
    // 3. Update user's plan in Firebase
    // 4. Refresh the app state
    
    alert(`Upgrade to ${planType} initiated. Payment integration coming soon!`)
  }
}

// Usage Limit Warning Component (shows before hitting limit)
export const UsageLimitWarning = ({ limitStatus, currentPlan }) => {
  if (!limitStatus) return null

  const warnings = []

  // Check each limit type for near-limit status
  Object.entries(limitStatus).forEach(([type, status]) => {
    if (status.isNearLimit && !status.isAtLimit) {
      warnings.push({
        type,
        ...status
      })
    }
  })

  if (warnings.length === 0) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Crown className="w-5 h-5 text-yellow-600 mt-0.5" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Approaching Plan Limits
          </h3>
          <div className="mt-1 text-sm text-yellow-700">
            {warnings.map((warning, index) => (
              <div key={index} className="mb-1">
                <strong className="capitalize">{warning.type}:</strong> {warning.current} of {warning.limit} used
                {warning.remaining > 0 && ` (${warning.remaining} remaining)`}
              </div>
            ))}
          </div>
          <div className="mt-3">
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1 rounded transition-colors">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpgradeModal