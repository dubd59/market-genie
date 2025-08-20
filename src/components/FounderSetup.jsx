import React, { useEffect, useState } from 'react'
import TenantService from '../services/firebase/tenants'

function FounderSetup({ children }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeFounder()
  }, [])

  const initializeFounder = async () => {
    try {
      console.log('Initializing founder account...')
      const result = await TenantService.setupFounderAccount()
      
      if (result.success) {
        console.log('Founder account initialized successfully')
      } else {
        console.log('Founder account initialization skipped or failed:', result.error)
      }
    } catch (error) {
      console.error('Founder initialization error:', error)
    } finally {
      setIsInitialized(true)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#38BEBA' }}></div>
          <p style={{ color: '#38BEBA' }} className="font-medium">Initializing Market Genie...</p>
          <p className="text-sm text-gray-500">Setting up founder workspace</p>
        </div>
      </div>
    )
  }

  return children
}

export default FounderSetup
