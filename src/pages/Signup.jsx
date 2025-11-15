import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, 
  Mail, 
  Target, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Crown,
  Gift
} from 'lucide-react'
import toast from 'react-hot-toast'

function Signup() {
  const [step, setStep] = useState(1) // 1: signup, 2: onboarding, 3: welcome
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, signUp, signInWithGoogle } = useAuth()
  const [searchParams] = useSearchParams()

  // Extract partner parameters from URL
  const [partnerInfo, setPartnerInfo] = useState({
    partner: null,
    plan: null,
    discount: 0,
    campaign: null,
    source: null
  })

  useEffect(() => {
    // Extract partner information from URL parameters
    const partner = searchParams.get('partner')
    const plan = searchParams.get('plan')
    const discount = parseInt(searchParams.get('discount')) || 0
    const campaign = searchParams.get('campaign')
    const source = searchParams.get('source')

    if (partner) {
      setPartnerInfo({
        partner,
        plan: plan || 'basic',
        discount,
        campaign: campaign || 'Default',
        source: source || 'partner'
      })
      console.log('🎯 Partner signup detected:', { partner, plan, discount, campaign, source })
    }
  }, [searchParams])

  // Don't redirect authenticated users if they came from a partner link
  if (user && step === 3 && !partnerInfo.partner) {
    return <Navigate to="/dashboard" replace />
  }

  const getPlanDetails = (planType) => {
    const plans = {
      basic: { 
        name: 'Basic Plan', 
        originalPrice: 47, 
        features: ['Lead Generation', 'Email Automation', '1000 Contacts', 'Basic Support'] 
      },
      pro: { 
        name: 'Professional', 
        originalPrice: 97, 
        features: ['Everything in Basic', 'Advanced Analytics', '10000 Contacts', 'Priority Support', 'Advanced AI'] 
      },
      enterprise: { 
        name: 'Enterprise', 
        originalPrice: 197, 
        features: ['Everything in Pro', 'White Label Rights', 'Unlimited Everything', 'Custom Integrations', 'Dedicated Support'] 
      }
    }
    return plans[planType] || plans.basic
  }

  const calculateDiscountedPrice = (originalPrice, discount) => {
    return originalPrice - (originalPrice * (discount / 100))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const signupData = { 
        displayName: name,
        plan: 'free', // Default to free, can upgrade later
        businessName,
        industry
      }

      // Add partner attribution if present
      if (partnerInfo.partner) {
        signupData.partnerAttribution = {
          partnerCode: partnerInfo.partner,
          referralPlan: partnerInfo.plan,
          discount: partnerInfo.discount,
          campaign: partnerInfo.campaign,
          source: partnerInfo.source,
          signupDate: new Date()
        }
        console.log('💾 Storing partner attribution:', signupData.partnerAttribution)
      }

      const { error } = await signUp(email, password, signupData)
      
      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      toast.success('Account created successfully!')
      setStep(2)
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('Failed to create account. Please try again.')
    }
    
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Account created successfully!')
        setStep(2)
      }
    } catch (error) {
      console.error('Google signup error:', error)
      toast.error('Failed to sign up with Google')
    }
    setLoading(false)
  }

  const handleOnboardingComplete = () => {
    setStep(3)
    // Small delay then redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 2000)
  }

  if (step === 1) {
    const planDetails = getPlanDetails(partnerInfo.plan)
    const discountedPrice = partnerInfo.discount > 0 ? 
      calculateDiscountedPrice(planDetails.originalPrice, partnerInfo.discount) : 
      planDetails.originalPrice

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Partner Banner */}
            {partnerInfo.partner && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Partner Referral</span>
                </div>
                <div className="text-sm text-green-700">
                  <p><strong>Campaign:</strong> {partnerInfo.campaign}</p>
                  <p><strong>Recommended Plan:</strong> {planDetails.name}</p>
                  {partnerInfo.discount > 0 && (
                    <div className="mt-2 p-2 bg-green-100 rounded">
                      <p className="font-bold text-green-800">
                        🎉 Special Discount: {partnerInfo.discount}% OFF!
                      </p>
                      <p className="text-xs">
                        Was ${planDetails.originalPrice}/mo → Now ${discountedPrice.toFixed(2)}/mo
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {partnerInfo.partner ? 'Join Market Genie' : 'Start Your Free Trial'}
              </h1>
              <p className="text-gray-600">
                {partnerInfo.partner 
                  ? `Recommended by your partner • ${planDetails.name}` 
                  : 'Create your account and start generating leads today'
                }
              </p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength="6"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Creating Account...' : 'Create Free Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Signup */}
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Market Genie!</h1>
              <p className="text-gray-600">Let's set up your workspace</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name (Optional)
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Business Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                onClick={handleOnboardingComplete}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                Complete Setup
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <Sparkles className="w-20 h-20 text-purple-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">You're All Set!</h1>
            <p className="text-xl text-gray-600 mb-6">
              {partnerInfo.partner 
                ? `Thanks for joining through our partner program! Redirecting to your dashboard...`
                : 'Welcome to Market Genie! Redirecting to your dashboard...'
              }
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        </motion.div>
      </div>
    )
  }
}

export default Signup