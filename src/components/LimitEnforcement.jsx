// Higher-Order Component for Limit Enforcement
import React, { useState } from 'react'
import { useLimitEnforcement } from '../hooks/useLimitEnforcement'
import UpgradeModal from './UpgradeModal'
import { useTenant } from '../contexts/TenantContext'

// HOC to wrap components with limit enforcement
export const withLimitEnforcement = (WrappedComponent, actionType, options = {}) => {
  return function LimitEnforcedComponent(props) {
    const { checkAndEnforce, trackAction } = useLimitEnforcement()
    const { tenant } = useTenant()
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [limitType, setLimitType] = useState(null)

    const enforceAndExecute = async (originalAction, amount = 1) => {
      // Check if action is allowed
      const enforcement = await checkAndEnforce(actionType, amount)
      
      if (!enforcement.allowed) {
        if (enforcement.reason === 'limit_reached') {
          setLimitType(enforcement.limitType)
          setShowUpgradeModal(true)
          return { success: false, reason: 'limit_reached' }
        }
        return { success: false, reason: enforcement.reason }
      }

      // Execute the original action
      const result = await originalAction()
      
      // Track usage if action was successful
      if (result && result.success !== false) {
        await trackAction(actionType, amount)
      }
      
      return result
    }

    return (
      <>
        <WrappedComponent
          {...props}
          enforceAndExecute={enforceAndExecute}
        />
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          limitType={limitType}
          currentPlan={tenant?.plan || 'free'}
        />
      </>
    )
  }
}

// Hook for manual limit enforcement in components
export const useActionWithLimits = () => {
  const { checkAndEnforce, trackAction } = useLimitEnforcement()
  const { tenant } = useTenant()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [limitType, setLimitType] = useState(null)

  const executeWithLimits = async (actionType, action, amount = 1) => {
    // Check if action is allowed
    const enforcement = await checkAndEnforce(actionType, amount)
    
    if (!enforcement.allowed) {
      if (enforcement.reason === 'limit_reached') {
        setLimitType(enforcement.limitType)
        setShowUpgradeModal(true)
        return { success: false, reason: 'limit_reached', showedUpgrade: true }
      }
      return { success: false, reason: enforcement.reason }
    }

    try {
      // Execute the action
      const result = await action()
      
      // Track usage if action was successful
      if (result && result.success !== false) {
        await trackAction(actionType, amount)
      }
      
      return result
    } catch (error) {
      console.error('Error executing action:', error)
      return { success: false, error }
    }
  }

  const UpgradeModalComponent = () => (
    <UpgradeModal
      isOpen={showUpgradeModal}
      onClose={() => setShowUpgradeModal(false)}
      limitType={limitType}
      currentPlan={tenant?.plan || 'free'}
    />
  )

  return {
    executeWithLimits,
    UpgradeModalComponent,
    closeUpgradeModal: () => setShowUpgradeModal(false)
  }
}

// Utility component for showing limit-aware action buttons
export const LimitAwareButton = ({ 
  actionType, 
  amount = 1, 
  onAction, 
  children, 
  className = '',
  disabled = false,
  ...props 
}) => {
  const { executeWithLimits, UpgradeModalComponent } = useActionWithLimits()

  const handleClick = async () => {
    if (disabled) return

    const result = await executeWithLimits(actionType, onAction, amount)
    
    if (result.success === false && result.reason !== 'limit_reached') {
      console.error('Action failed:', result.reason || result.error)
    }
  }

  return (
    <>
      <button
        {...props}
        className={className}
        onClick={handleClick}
        disabled={disabled}
      >
        {children}
      </button>
      <UpgradeModalComponent />
    </>
  )
}

// Component to show when limits are reached
export const LimitReachedBanner = ({ limitType, onUpgrade }) => {
  const limitMessages = {
    contact: "You've reached your contact limit. Upgrade to add more contacts.",
    email: "You've reached your monthly email limit. Upgrade to send more emails.",
    campaign: "You've reached your campaign limit. Upgrade to create more campaigns."
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 font-bold">!</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-800">Limit Reached</h3>
            <p className="text-sm text-red-700">{limitMessages[limitType]}</p>
          </div>
        </div>
        <button
          onClick={onUpgrade}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  )
}

export default withLimitEnforcement