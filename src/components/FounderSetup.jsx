import React, { useEffect, useState } from 'react'
import TenantService from '../services/firebase/tenants'

function FounderSetup({ children }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    initializeFounder()
  }, [])

  const initializeFounder = async () => {
    const maxRetries = 3
    const timeout = 30000 // 30 seconds timeout
    
    try {
      console.log('Initializing founder account...')
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Initialization timeout after 30 seconds')), timeout)
      )
      
      // Race between initialization and timeout
      const result = await Promise.race([
        TenantService.setupFounderAccount(),
        timeoutPromise
      ])
      
      if (result.success) {
        console.log('Founder account initialized successfully')
        setError(null)
      } else {
        console.log('Founder account initialization failed:', result.error)
        if (retryCount < maxRetries) {
          console.log(`Retrying initialization... (${retryCount + 1}/${maxRetries})`)
          setRetryCount(prev => prev + 1)
          setTimeout(() => initializeFounder(), 2000 * (retryCount + 1)) // Exponential backoff
          return
        } else {
          setError(result.error)
        }
      }
    } catch (error) {
      console.error('Founder initialization error:', error)
      
      if (retryCount < maxRetries && error.message !== 'Initialization timeout after 30 seconds') {
        console.log(`Retrying initialization... (${retryCount + 1}/${maxRetries})`)
        setRetryCount(prev => prev + 1)
        setTimeout(() => initializeFounder(), 2000 * (retryCount + 1)) // Exponential backoff
        return
      } else {
        setError(error)
      }
    } finally {
      setIsInitialized(true)
      setIsLoading(false)
    }
  }

  const handleSkipInitialization = () => {
    console.log('Skipping initialization - proceeding with degraded mode')
    setIsInitialized(true)
    setIsLoading(false)
    setError(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#38BEBA' }}></div>
          <p style={{ color: '#38BEBA' }} className="font-medium mb-2">Initializing Market Genie...</p>
          <p className="text-sm text-gray-500 mb-4">Setting up founder workspace</p>
          {retryCount > 0 && (
            <p className="text-xs text-gray-400">Retry attempt {retryCount}/3...</p>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-red-800 font-medium mb-2">Initialization Failed</h3>
            <p className="text-red-600 text-sm mb-4">
              {error.message || 'Unable to connect to the database. This may be due to connectivity issues.'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  setError(null)
                  setRetryCount(0)
                  setIsLoading(true)
                  initializeFounder()
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Retry
              </button>
              <button
                onClick={handleSkipInitialization}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
              >
                Continue Anyway
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            If this problem persists, please check your internet connection or try again later.
          </p>
        </div>
      </div>
    )
  }

  return children
}

export default FounderSetup
