import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { data: result, error: null }
    } catch (error) {
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

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
