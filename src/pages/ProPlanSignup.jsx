import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, setDoc } from '../security/SecureFirebase.js';
import { CheckCircle, Zap, Crown, Star, ArrowRight } from 'lucide-react';

const ProPlanSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signUp } = useAuth();
  const { tenant, refreshTenant } = useTenant();
  
  const [setupStep, setSetupStep] = useState('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [upgradeData, setUpgradeData] = useState(null);
  const [accountCreationMode, setAccountCreationMode] = useState(false);

  // Check if this is a payment success redirect
  const paymentSuccess = searchParams.get('payment_success') === 'true';
  const paymentType = searchParams.get('payment_type');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (paymentSuccess && paymentType === 'pro' && sessionId && !accountCreationMode) {
      handlePaymentSuccess();
    }
  }, [paymentSuccess, paymentType, sessionId, setupStep, accountCreationMode]);

  const handlePaymentSuccess = async () => {
    try {
      setIsLoading(true);
      
      // If user is not logged in, they need to create an account first
      if (!user) {
        setAccountCreationMode(true);
        setSetupStep('create-account');
        return;
      }

      // Update tenant to Pro plan
      const tenantRef = doc(db, 'MarketGenie_tenants', tenant?.id || user.uid);
      const updateData = {
        plan: 'pro',
        planType: 'pro',
        upgradeDate: new Date(),
        paymentSessionId: sessionId,
        subscriptionStatus: 'active',
        monthlyFee: 20,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        features: {
          advancedCRM: true,
          aiSwarm: true,
          advancedIntegrations: true,
          prioritySupport: true,
          customFunnels: true,
          advancedAnalytics: true
        }
      };

      await updateDoc(tenantRef, updateData);
      setUpgradeData(updateData);
      setSetupStep('upgrade-complete');
      
      // Refresh tenant context
      if (refreshTenant) {
        await refreshTenant();
      }
      
    } catch (error) {
      console.error('Error processing Pro upgrade:', error);
      setSetupStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountCreation = async (email, password, displayName) => {
    try {
      setIsLoading(true);
      const result = await signUp(email, password, {
        displayName,
        plan: 'pro'
      });

      if (result.error) {
        alert('Error creating account: ' + result.error.message);
        setIsLoading(false);
        return;
      }

      // Get the new user from the signup result
      const newUser = result.data.user;
      console.log('✅ Account created for user:', newUser.uid, newUser.email);

      // Create tenant directly with the new user info
      await createTenantForNewUser(newUser);
      
    } catch (error) {
      console.error('Account creation error:', error);
      alert('Error creating account. Please try again.');
      setIsLoading(false);
    }
  };

  const createTenantForNewUser = async (newUser) => {
    try {
      setIsLoading(true);

      // Create tenant with Pro plan for the new user
      const tenantId = newUser.uid;
      const tenantRef = doc(db, 'MarketGenie_tenants', tenantId);
      
      const proData = {
        plan: 'pro',
        planType: 'pro',
        upgradeDate: new Date(),
        paymentSessionId: sessionId,
        subscriptionStatus: 'active',
        monthlyFee: 20,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        features: {
          advancedCRM: true,
          aiSwarm: true,
          advancedIntegrations: true,
          prioritySupport: true,
          customFunnels: true,
          advancedAnalytics: true
        }
      };

      const newTenantData = {
        id: tenantId,
        ownerId: newUser.uid,
        ownerEmail: newUser.email,
        ownerName: newUser.displayName || newUser.email,
        name: `${newUser.displayName || newUser.email}'s Pro Workspace`,
        status: 'active',
        role: 'user',
        createdAt: new Date(),
        settings: {
          theme: 'light',
          timezone: 'America/New_York',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY'
        },
        ...proData
      };

      // Ensure the auth token for the newly created user is fresh.
      // Security rules require request.auth.uid to match ownerId.
      try {
        if (newUser && typeof newUser.getIdToken === 'function') {
          await newUser.getIdToken(true);
          // Small pause to allow auth state to settle in the client and server
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (tokenErr) {
        console.warn('⚠️ Token refresh for new user failed (continuing):', tokenErr);
      }

      // Attempt to write the tenant. If permission denied, try a single retry
      // after forcing a token refresh (covers race conditions between signUp and security rules).
      try {
        await setDoc(tenantRef, newTenantData);
      } catch (writeErr) {
        console.warn('⚠️ Tenant write failed, checking for permission issues:', writeErr);
        const isPermission = writeErr?.code === 'permission-denied' || (writeErr?.message || '').toLowerCase().includes('permission');
        if (isPermission) {
          try {
            console.log('🔄 Permission denied - refreshing token and retrying tenant write');
            if (newUser && typeof newUser.getIdToken === 'function') {
              await newUser.getIdToken(true);
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
            await setDoc(tenantRef, newTenantData);
            console.log('✅ Tenant write succeeded on retry');
          } catch (retryErr) {
            console.error('❌ Tenant write failed after retry:', retryErr);
            throw retryErr;
          }
        } else {
          throw writeErr;
        }
      }

      console.log('✅ Created tenant for new user:', tenantId);
      setUpgradeData(proData);
      setSetupStep('upgrade-complete');

      // Refresh tenant context
      if (refreshTenant) {
        await refreshTenant();
      }

    } catch (error) {
      console.error('Error creating tenant for new user:', error);
      // Surface permission-specific errors clearly so we can triage faster
      if (error?.code === 'permission-denied' || (error?.message || '').toLowerCase().includes('permission')) {
        setSetupStep('permission-denied');
        alert('We could not create your workspace due to permission rules. Please contact support and include your email.');
      } else {
        setSetupStep('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Upgrading to Pro Plan...</h2>
          <p className="text-gray-600 mt-2">Please wait while we activate your subscription</p>
        </div>
      </div>
    );
  }

  if (setupStep === 'create-account') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Zap className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Create Your Pro Account</h1>
            <p className="text-gray-600 mt-2">Payment successful! Now create your Pro account</p>
          </div>

          <CreateAccountForm onSubmit={handleAccountCreation} />
        </div>
      </div>
    );
  }

  if (setupStep === 'upgrade-complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">🎉 Welcome to Pro!</h1>
            <p className="text-gray-600 mt-2">Your Pro subscription has been activated successfully</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <Zap className="h-8 w-8 text-blue-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Advanced CRM</h3>
              <p className="text-sm text-gray-600">Full customer relationship management with automation</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <Star className="h-8 w-8 text-purple-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">AI Swarm Technology</h3>
              <p className="text-sm text-gray-600">Multiple AI agents working together on your campaigns</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <ArrowRight className="h-8 w-8 text-green-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Advanced Integrations</h3>
              <p className="text-sm text-gray-600">Connect with premium marketing tools and platforms</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6">
              <CheckCircle className="h-8 w-8 text-orange-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Priority Support</h3>
              <p className="text-sm text-gray-600">24/7 premium support with faster response times</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Your Pro Subscription</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="opacity-80">Monthly Fee:</span>
                <div className="font-semibold">$20/month</div>
              </div>
              <div>
                <span className="opacity-80">Next Billing:</span>
                <div className="font-semibold">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="opacity-80">Session ID:</span>
                <div className="font-mono text-xs">{sessionId}</div>
              </div>
              <div>
                <span className="opacity-80">Status:</span>
                <div className="font-semibold text-green-200">Active</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              Go to Pro Dashboard
            </button>
            <button
              onClick={() => window.open('https://docs.marketgenie.com/pro-features', '_blank')}
              className="flex-1 border border-blue-300 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all"
            >
              Explore Pro Features
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (setupStep === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Upgrade Error</h1>
          <p className="text-gray-600 mb-6">There was an error upgrading to Pro. Please contact support.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Default welcome step
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <Zap className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Pro Plan Signup</h1>
        <p className="text-gray-600 mb-6">Upgrade to MarketGenie Pro for advanced features!</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
};

// Account creation form component
const CreateAccountForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSubmit(formData.email, formData.password, formData.displayName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          required
          value={formData.displayName}
          onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Your Name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input
          type="password"
          required
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
      >
        Create Pro Account
      </button>
    </form>
  );
};

export default ProPlanSignup;