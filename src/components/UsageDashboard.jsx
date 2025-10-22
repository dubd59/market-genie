// Usage Dashboard Component for Plan Limits
import React, { useState, useEffect } from 'react'
import { Users, Mail, Target, Crown, TrendingUp } from 'lucide-react'
import { useLimitEnforcement } from '../hooks/useLimitEnforcement'
import { UsageLimitWarning } from './UpgradeModal'
import UpgradeModal from './UpgradeModal'

const UsageDashboard = ({ currentPlan = 'free' }) => {
  const { limitStatus, loading } = useLimitEnforcement()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState(null)

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  const usageCards = [
    {
      title: 'Contacts',
      icon: <Users className="w-5 h-5" />,
      current: limitStatus?.contacts?.current || 0,
      limit: limitStatus?.contacts?.limit || 0,
      remaining: limitStatus?.contacts?.remaining || 0,
      isAtLimit: limitStatus?.contacts?.isAtLimit || false,
      isNearLimit: limitStatus?.contacts?.isNearLimit || false,
      color: 'blue',
      type: 'contact'
    },
    {
      title: 'Emails This Month',
      icon: <Mail className="w-5 h-5" />,
      current: limitStatus?.emails?.current || 0,
      limit: limitStatus?.emails?.limit || 0,
      remaining: limitStatus?.emails?.remaining || 0,
      isAtLimit: limitStatus?.emails?.isAtLimit || false,
      isNearLimit: limitStatus?.emails?.isNearLimit || false,
      color: 'green',
      type: 'email'
    },
    {
      title: 'Active Campaigns',
      icon: <Target className="w-5 h-5" />,
      current: limitStatus?.campaigns?.current || 0,
      limit: limitStatus?.campaigns?.limit || 0,
      remaining: limitStatus?.campaigns?.remaining || 0,
      isAtLimit: limitStatus?.campaigns?.isAtLimit || false,
      isNearLimit: limitStatus?.campaigns?.isNearLimit || false,
      color: 'purple',
      type: 'campaign'
    }
  ]

  const getProgressColor = (card) => {
    if (card.isAtLimit) return 'bg-red-500'
    if (card.isNearLimit) return 'bg-yellow-500'
    
    const colorMap = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500'
    }
    return colorMap[card.color] || 'bg-gray-500'
  }

  const getProgressPercentage = (current, limit) => {
    if (limit === 0) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const handleUpgradeClick = (limitType) => {
    setUpgradeReason(limitType)
    setShowUpgradeModal(true)
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Usage Overview</h3>
              <p className="text-sm text-gray-600 capitalize">Current Plan: {currentPlan}</p>
            </div>
          </div>
          
          {currentPlan === 'free' && (
            <button
              onClick={() => handleUpgradeClick('general')}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade</span>
            </button>
          )}
        </div>

        {/* Usage Warning */}
        <UsageLimitWarning limitStatus={limitStatus} currentPlan={currentPlan} />

        {/* Usage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {usageCards.map((card, index) => (
            <div key={index} className="relative">
              <div className={`rounded-lg border-2 p-4 ${
                card.isAtLimit ? 'border-red-200 bg-red-50' :
                card.isNearLimit ? 'border-yellow-200 bg-yellow-50' :
                'border-gray-200 bg-white'
              }`}>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded ${
                      card.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      card.color === 'green' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {card.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{card.title}</span>
                  </div>
                  
                  {card.isAtLimit && (
                    <button
                      onClick={() => handleUpgradeClick(card.type)}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                    >
                      Upgrade
                    </button>
                  )}
                </div>

                {/* Usage Numbers */}
                <div className="mb-3">
                  <div className="flex items-end space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {card.current.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 mb-1">
                      {card.limit === 0 ? 'unlimited' : `of ${card.limit.toLocaleString()}`}
                    </span>
                  </div>
                  
                  {card.remaining !== null && card.limit > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {card.remaining > 0 ? `${card.remaining.toLocaleString()} remaining` : 'Limit reached'}
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                {card.limit > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(card)}`}
                      style={{ width: `${getProgressPercentage(card.current, card.limit)}%` }}
                    ></div>
                  </div>
                )}

                {/* Unlimited indicator */}
                {card.limit === 0 && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Crown className="w-3 h-3" />
                    <span className="text-xs font-medium">Unlimited</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Plan Comparison CTA */}
        {currentPlan === 'free' && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Ready to scale your business?</h4>
                <p className="text-xs text-gray-600 mt-1">Upgrade to Pro for unlimited campaigns and advanced features</p>
              </div>
              <button
                onClick={() => handleUpgradeClick('general')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                View Plans
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType={upgradeReason}
        currentPlan={currentPlan}
      />
    </>
  )
}

export default UsageDashboard