import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  getIdToken,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshingToken, setIsRefreshingToken] = useState(false)

  // 🔐 DAILY LOGIN FIX - Simple persistence setup
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => console.log('🔐 Authentication persistence enabled - no more daily logins!'))
      .catch(error => console.error('Auth persistence failed:', error));
  }, [])

  // Enhanced authentication state management with token refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user ? user.email : 'No user')
      
      if (user) {
        try {
          // Force token refresh on auth state change to ensure valid tokens
          const token = await getIdToken(user, true)
          console.log('✅ ID token refreshed successfully')
          setUser(user)
        } catch (error) {
          console.error('❌ Token refresh failed:', error)
          // If token refresh fails, sign out to force re-authentication
          if (error.code === 'auth/network-request-failed' || 
              error.code === 'auth/internal-error') {
            console.log('🔄 Network error - keeping user signed in for offline mode')
            setUser(user) // Keep user signed in for offline capability
          } else {
            console.log('🚪 Signing out due to token error')
            await signOut(auth)
            setUser(null)
          }
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
    }, (error) => {
      console.error('🚨 Auth state change error:', error)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Periodic token refresh to prevent CORS issues
  useEffect(() => {
    let tokenRefreshInterval
    
    if (user && !loading) {
      console.log('🔄 Setting up token refresh interval')
      tokenRefreshInterval = setInterval(async () => {
        try {
          if (auth.currentUser && !isRefreshingToken) {
            setIsRefreshingToken(true)
            await getIdToken(auth.currentUser, true)
            console.log('🔄 Background token refresh successful')
          }
        } catch (error) {
          console.error('⚠️ Background token refresh failed:', error)
        } finally {
          setIsRefreshingToken(false)
        }
      }, 50 * 60 * 1000) // Refresh every 50 minutes (tokens expire in 60 minutes)
    }

    return () => {
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval)
      }
    }
  }, [user, loading, isRefreshingToken])

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Attempting sign in...')
      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ Sign in successful')
      return { data: result, error: null }
    } catch (error) {
      console.error('❌ Sign in error:', error)
      
      // Handle specific CORS-related errors
      if (error.message?.includes('CORS') || error.message?.includes('blocked')) {
        console.error('🚫 CORS error detected - this is a Firebase configuration issue')
        return { 
          data: null, 
          error: { 
            ...error, 
            message: 'Connection issue detected. Please try again in a moment.' 
          }
        }
      }
      
      return { data: null, error }
    }
  }

  const signUp = async (email, password, metadata = {}) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update profile with additional metadata
      if (metadata.displayName) {
        await updateProfile(result.user, {
          displayName: metadata.displayName
        })
      }
      
      // Store plan type in user's custom claims or in a temporary way
      if (metadata.plan) {
        // We'll handle this in the tenant creation
        result.planType = metadata.plan
      }
      
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { data: { message: 'Password reset email sent' }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updateUserProfile = async (updates) => {
    try {
      await updateProfile(auth.currentUser, updates)
      return { data: { user: auth.currentUser }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Manual token refresh function for critical operations
  const refreshAuthToken = async () => {
    try {
      if (auth.currentUser) {
        const token = await getIdToken(auth.currentUser, true)
        console.log('🔄 Manual token refresh successful')
        return { data: { token }, error: null }
      } else {
        throw new Error('No authenticated user')
      }
    } catch (error) {
      console.error('❌ Manual token refresh failed:', error)
      return { data: null, error }
    }
  }

  // Check if user authentication is healthy
  const checkAuthHealth = async () => {
    try {
      if (!auth.currentUser) {
        return { healthy: false, reason: 'No authenticated user' }
      }
      
      const token = await getIdToken(auth.currentUser, false) // Don't force refresh, just check
      return { healthy: true, token }
    } catch (error) {
      console.error('🩺 Auth health check failed:', error)
      return { healthy: false, reason: error.message, error }
    }
  }

  const value = {
    user,
    loading,
    isRefreshingToken,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    refreshAuthToken,
    checkAuthHealth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
