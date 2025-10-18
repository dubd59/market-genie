import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthNavigator() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Don't navigate while still loading
    if (loading) return

    // Handle user authentication state changes
    if (user) {
      // User is authenticated - redirect to dashboard if on login/register page
      if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
        console.log('🎯 User authenticated, navigating to dashboard')
        navigate('/dashboard', { replace: true })
      }
    } else {
      // User is not authenticated - redirect to login if on protected page
      const publicPaths = ['/login', '/register', '/', '/unsubscribe']
      const isPublicPath = publicPaths.includes(location.pathname) || 
                          location.pathname.startsWith('/funnel/') ||
                          location.pathname.startsWith('/oauth/')
      
      if (!isPublicPath) {
        console.log('🚪 User not authenticated, redirecting to login')
        navigate('/login', { replace: true })
      }
    }
  }, [user, loading, location.pathname, navigate])

  return null // This component only handles navigation logic
}