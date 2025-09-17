import React, { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import TenantService from '../services/firebase/tenants'
import toast from 'react-hot-toast'

const TenantContext = createContext({})

export const useTenant = () => {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

export function TenantProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      setTenant(null)
      setLoading(false)
      return
    }

    loadUserTenant()
  }, [user, authLoading])

  const loadUserTenant = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Loading tenant for user:', user?.email)
      const result = await TenantService.getCurrentUserTenant()
      
      if (result.error) {
        console.error('Tenant loading error:', result.error)
        setError(result.error)
        
        // More specific error message for debugging
        if (result.error.message?.includes('permission')) {
          toast.error('Permission denied. Checking Firestore rules...')
        } else {
          toast.error('Failed to load workspace: ' + result.error.message)
        }
        return
      }

      if (result.data) {
        console.log('Tenant loaded:', result.data)
        setTenant(result.data)
        
        // Initialize tenant collections if this is a new tenant
        if (!result.data.initialized) {
          console.log('Initializing tenant collections...')
          await TenantService.initializeTenantCollections(result.data.id)
          await TenantService.updateTenantSettings(result.data.id, { initialized: true })
          
          // Reload tenant data
          const updatedResult = await TenantService.getCurrentUserTenant()
          if (updatedResult.data) {
            setTenant(updatedResult.data)
          }
        }

        // Welcome toast removed per user request
      } else {
        console.log('No tenant found, will create one on first sign-in')
      }
    } catch (err) {
      console.error('Tenant loading exception:', err)
      setError(err)
      toast.error('Failed to load workspace: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateTenantSettings = async (settings) => {
    if (!tenant) return { error: { message: 'No active tenant' } }

    try {
      const result = await TenantService.updateTenantSettings(tenant.id, settings)
      
      if (result.error) {
        toast.error('Failed to update settings')
        return result
      }

      // Update local state
      setTenant(prev => ({
        ...prev,
        settings: { ...prev.settings, ...settings }
      }))

      toast.success('Settings updated successfully')
      return result
    } catch (err) {
      toast.error('Failed to update settings')
      return { error: err }
    }
  }

  const updateTenantUsage = async (usageUpdate) => {
    if (!tenant) return { error: { message: 'No active tenant' } }

    try {
      const result = await TenantService.updateTenantUsage(tenant.id, usageUpdate)
      
      if (result.error) {
        return result
      }

      // Update local state
      setTenant(prev => ({
        ...prev,
        usage: { ...prev.usage, ...usageUpdate }
      }))

      return result
    } catch (err) {
      return { error: err }
    }
  }

  const checkFeatureLimit = async (feature, currentCount) => {
    if (!tenant) return false
    
    return await TenantService.checkFeatureLimit(tenant.id, feature, currentCount)
  }

  const getTenantCollectionPath = (collection) => {
    if (!tenant) return null
    return `tenants/${tenant.id}/${collection}`
  }

  const value = {
    tenant,
    loading,
    error,
    updateTenantSettings,
    updateTenantUsage,
    checkFeatureLimit,
    getTenantCollectionPath,
    reloadTenant: loadUserTenant
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export default TenantProvider
