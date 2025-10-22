// Test Component to Demo Freemium System
import React from 'react'
import { LimitAwareButton, useActionWithLimits } from '../components/LimitEnforcement'
import UsageDashboard from '../components/UsageDashboard'
import { useTenant } from '../contexts/TenantContext'

const FreemiumDemo = () => {
  const { tenant } = useTenant()
  const { executeWithLimits, UpgradeModalComponent } = useActionWithLimits()

  const handleAddContact = async () => {
    const result = await executeWithLimits('addContact', async () => {
      // Simulate adding a contact
      console.log('Adding contact...')
      return { success: true }
    }, 1)

    if (result.success) {
      alert('Contact added successfully!')
    }
  }

  const handleSendEmail = async () => {
    const result = await executeWithLimits('sendEmail', async () => {
      // Simulate sending email
      console.log('Sending email...')
      return { success: true }
    }, 1)

    if (result.success) {
      alert('Email sent successfully!')
    }
  }

  const handleCreateCampaign = async () => {
    const result = await executeWithLimits('createCampaign', async () => {
      // Simulate creating campaign
      console.log('Creating campaign...')
      return { success: true }
    }, 1)

    if (result.success) {
      alert('Campaign created successfully!')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Freemium System Demo</h1>
      
      {/* Usage Dashboard */}
      <UsageDashboard currentPlan={tenant?.plan || 'free'} />
      
      {/* Action Buttons */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
        
        <div className="space-y-4">
          {/* Method 1: Using executeWithLimits hook */}
          <div>
            <h3 className="font-medium mb-2">Using executeWithLimits Hook:</h3>
            <div className="flex gap-4">
              <button
                onClick={handleAddContact}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Add Contact
              </button>
              <button
                onClick={handleSendEmail}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Send Email
              </button>
              <button
                onClick={handleCreateCampaign}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Create Campaign
              </button>
            </div>
          </div>

          {/* Method 2: Using LimitAwareButton component */}
          <div>
            <h3 className="font-medium mb-2">Using LimitAwareButton Component:</h3>
            <div className="flex gap-4">
              <LimitAwareButton
                actionType="addContact"
                onAction={async () => {
                  console.log('Adding contact via LimitAwareButton...')
                  return { success: true }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Add Contact (Auto-Limit)
              </LimitAwareButton>
              
              <LimitAwareButton
                actionType="sendEmail"
                amount={5}
                onAction={async () => {
                  console.log('Sending 5 emails via LimitAwareButton...')
                  return { success: true }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Send 5 Emails (Auto-Limit)
              </LimitAwareButton>
              
              <LimitAwareButton
                actionType="createCampaign"
                onAction={async () => {
                  console.log('Creating campaign via LimitAwareButton...')
                  return { success: true }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Create Campaign (Auto-Limit)
              </LimitAwareButton>
            </div>
          </div>
        </div>
      </div>

      {/* Current Plan Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900">Current Plan: {tenant?.plan || 'free'}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Test the buttons above to see limit enforcement in action. 
          Free plan users will see upgrade prompts when limits are reached.
        </p>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModalComponent />
    </div>
  )
}

export default FreemiumDemo