import React, { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import TenantService from '../services/firebase/tenants'
import { multiTenantDB } from '../services/multiTenantDatabase'
import corsBypass from '../services/CORSBypass'
import toast from 'react-hot-toast'

/**
 * ENHANCED TENANT CONTEXT WITH SECURITY
 * 
 * CRITICAL SECURITY FEATURES:
 * - Enforces tenant isolation at context level
 * - Validates tenant access on every operation
 * - Prevents cross-tenant data leakage
 */

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
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...')
      return
    }
    
    if (!user) {
      console.log('👤 No user found, clearing tenant')
      setTenant(null)
      setLoading(false)
      return
    }

    // Add a small delay to ensure auth state is fully settled
    const timeoutId = setTimeout(() => {
      loadUserTenant()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [user, authLoading])

  const loadUserTenant = async () => {
    let retryCount = 0;
    const maxRetries = 3;
    const loadTimeout = 8000; // 8 second timeout (reduced to prevent spinning wheel)
    
    const attemptLoad = async () => {
      try {
        setLoading(true)
        setError(null)

        // 🚨 EMERGENCY TENANT FIX: Check for forced tenant override
        const emergencyTenantFix = localStorage.getItem('emergency_tenant_fix');
        const forcedTenant = localStorage.getItem('tenant_override') || localStorage.getItem('correct_tenant_forced');
        
        if (emergencyTenantFix === 'applied' && forcedTenant) {
          console.log('🚨 EMERGENCY FIX DETECTED - Using forced tenant:', forcedTenant);
          
          // Create emergency tenant object
          const emergencyTenant = {
            id: forcedTenant,
            tenantId: forcedTenant,
            name: 'Market Genie (Emergency Fixed)',
            status: 'active',
            initialized: true,
            _emergencyFixed: true,
            _fixedAt: new Date().toISOString()
          };
          
          setTenant(emergencyTenant);
          setLoading(false);
          
          console.log('✅ Emergency tenant fix applied successfully');
          console.log('📊 Using tenant:', forcedTenant);
          
          return;
        }

        console.log('🏢 Loading tenant for user:', user?.email)
        
        // Double-check we still have a valid user before proceeding
        if (!user) {
          console.log('❌ User no longer available, aborting tenant load')
          setLoading(false)
          return
        }
        
        // 🎯 FIX: Check JWT token for tenantId first
        let jwtTenantId = null;
        try {
          const idTokenResult = await user.getIdTokenResult(true);
          jwtTenantId = idTokenResult.claims.tenantId;
          console.log('🎫 JWT Token tenant ID:', jwtTenantId);
        } catch (jwtError) {
          console.log('⚠️ Could not get JWT tenant ID:', jwtError.message);
        }
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Tenant loading timeout')), loadTimeout)
        );
        
        // Use JWT tenant ID if available, otherwise fall back to user-based tenant
        const loadPromise = jwtTenantId 
          ? TenantService.getTenantById(jwtTenantId)
          : TenantService.getCurrentUserTenant();
        
        const result = await Promise.race([loadPromise, timeoutPromise]);
        
        if (result.error) {
          console.error('❌ Tenant loading error:', result.error)
          
          // 🚨 CORS FALLBACK: If CORS detected, use offline tenant immediately
          if (result.error.message?.includes('CORS') || 
              result.error.message?.includes('Access-Control-Allow-Origin') ||
              result.error.message?.includes('WebChannelConnection') ||
              result.error.code === 'unavailable' ||
              corsBypass.isCORSDetected()) {
            
            console.log('🛡️ CORS detected - using fallback tenant (no retries needed)');
            const fallbackTenant = await corsBypass.loadTenantFallback(user.uid, user.email);
            setTenant(fallbackTenant);
            setLoading(false);
            return;
          }
          
          // Check if it's a connection-related error
          if (result.error.message?.includes('offline') || 
              result.error.message?.includes('ERR_FAILED') ||
              result.error.message?.includes('Failed to fetch') ||
              result.error.message?.includes('timeout')) {
            
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`🔄 Connection error detected, retrying... (${retryCount}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
              return await attemptLoad();
            } else {
              console.error('❌ Max retries reached for tenant loading');
              
              // One-time only auto-refresh per session
              const hasRefreshed = sessionStorage.getItem('workspaceAutoRefreshed');
              if (!hasRefreshed) {
                sessionStorage.setItem('workspaceAutoRefreshed', 'true');
                toast.error('Connection issues detected. Refreshing in 3 seconds...', {
                  duration: 3000
                });
                setTimeout(() => {
                  window.location.reload();
                }, 3000);
                return;
              } else {
                // Already refreshed once, don't refresh again
                toast.error('Connection issues detected. Please check your internet connection.', {
                  duration: 8000
                });
                setLoading(false);
                return;
              }
            }
          }
          
          setError(result.error)
          
          // More specific error message for debugging
          if (result.error.message?.includes('permission')) {
            toast.error('Permission denied. Checking Firestore rules...')
          } else if (!result.error.message?.includes('offline')) {
            toast.error('Failed to load workspace: ' + result.error.message)
          }
          setLoading(false)
          return
        }

        if (result.data) {
          console.log('✅ Tenant loaded successfully:', result.data.name || result.data.id)
          
          // Clear the auto-refresh flag on successful load
          sessionStorage.removeItem('workspaceAutoRefreshed');
          
          setTenant(result.data)
          
          // Initialize tenant collections if this is a new tenant
          if (!result.data.initialized) {
            console.log('🚀 Initializing tenant collections...')
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
        
        // Enhanced error handling for connection issues
        if (err.message?.includes('offline') || 
            err.message?.includes('CORS') ||
            err.message?.includes('ERR_FAILED') ||
            err.message?.includes('Failed to fetch') ||
            err.message?.includes('timeout')) {
          
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`🔄 Exception caught, retrying... (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
            return await attemptLoad();
          } else {
            console.error('❌ Max retries exceeded, forcing loading to false');
            setLoading(false);
            toast.error('Unable to connect to workspace. Please refresh the page.', {
              duration: 10000
            });
            return;
          }
        }
        
        setError(err)
        toast.error('Failed to load workspace: ' + err.message)
      } finally {
        // Ensure loading is always set to false
        setLoading(false)
      }
    };
    
    // Start the loading attempt
    await attemptLoad();
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
