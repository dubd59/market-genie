import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, setDoc } from '../security/SecureFirebase.js';
import { CheckCircle, Crown, Star, Infinity, Shield, Zap, Users, TrendingUp } from 'lucide-react';

const LifetimePlanSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signUp } = useAuth();
  const { tenant, refreshTenant } = useTenant();
  
  const [setupStep, setSetupStep] = useState('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [upgradeData, setUpgradeData] = useState(null);

  // Check if this is a payment success redirect
  const paymentSuccess = searchParams.get('payment_success') === 'true';
  const paymentType = searchParams.get('payment_type');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (paymentSuccess && paymentType === 'lifetime' && sessionId) {
      handlePaymentSuccess();
    }
  }, [paymentSuccess, paymentType, sessionId]);

  const handlePaymentSuccess = async () => {
    try {
      setIsLoading(true);
      
      // If user is not logged in, they need to create an account first
      if (!user) {
        setSetupStep('create-account');
        return;
      }

      // Update or create tenant with Lifetime plan
      const tenantId = tenant?.id || user.uid;
      const tenantRef = doc(db, 'MarketGenie_tenants', tenantId);
      
      // Check if tenant exists
      const tenantDoc = await getDoc(tenantRef);
      
      const lifetimeData = {
        plan: 'lifetime',
        planType: 'lifetime',
        upgradeDate: new Date(),
        paymentSessionId: sessionId,
        subscriptionStatus: 'lifetime',
        lifetimeFee: 300,
        nextBillingDate: null, // No future billing for lifetime
        features: {
          // All Pro features
          advancedCRM: true,
          aiSwarm: true,
          advancedIntegrations: true,
          prioritySupport: true,
          customFunnels: true,
          advancedAnalytics: true,
          // Lifetime exclusive features
          whiteLabel: true,
          unlimitedCampaigns: true,
          apiAccess: true,
          customBranding: true,
          dedicatedSupport: true,
          betaFeatures: true
        }
      };

      if (tenantDoc.exists()) {
        // Update existing tenant
        await updateDoc(tenantRef, lifetimeData);
        console.log('✅ Updated existing tenant to Lifetime plan');
      } else {
        // Create new tenant with lifetime plan
        const newTenantData = {
          id: tenantId,
          ownerId: user.uid,
          ownerEmail: user.email,
          ownerName: user.displayName || user.email,
          name: `${user.displayName || user.email}'s Lifetime Workspace`,
          status: 'active',
          role: 'user',
          createdAt: new Date(),
          settings: {
            theme: 'light',
            timezone: 'America/New_York',
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY'
          },
          ...lifetimeData
        };
        
        await setDoc(tenantRef, newTenantData);
        console.log('✅ Created new tenant with Lifetime plan');
      }
      
      setUpgradeData(lifetimeData);
      setSetupStep('upgrade-complete');
      
      // Refresh tenant context
      if (refreshTenant) {
        await refreshTenant();
      }
      
    } catch (error) {
      console.error('Error processing Lifetime upgrade:', error);
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
        plan: 'lifetime'
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

      // Create tenant with lifetime plan for the new user
      const tenantId = newUser.uid;
      const tenantRef = doc(db, 'MarketGenie_tenants', tenantId);
      
      const lifetimeData = {
        plan: 'lifetime',
        planType: 'lifetime',
        upgradeDate: new Date(),
        paymentSessionId: sessionId,
        subscriptionStatus: 'lifetime',
        lifetimeFee: 300,
        nextBillingDate: null,
        features: {
          advancedCRM: true,
          aiSwarm: true,
          advancedIntegrations: true,
          prioritySupport: true,
          customFunnels: true,
          advancedAnalytics: true,
          whiteLabel: true,
          unlimitedCampaigns: true,
          apiAccess: true,
          customBranding: true,
          dedicatedSupport: true,
          betaFeatures: true
        }
      };

      const newTenantData = {
        id: tenantId,
        ownerId: newUser.uid,
        ownerEmail: newUser.email,
        ownerName: newUser.displayName || newUser.email,
        name: `${newUser.displayName || newUser.email}'s Lifetime Workspace`,
        status: 'active',
        role: 'user',
        createdAt: new Date(),
        settings: {
          theme: 'light',
          timezone: 'America/New_York',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY'
        },
        ...lifetimeData
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
      setUpgradeData(lifetimeData);
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Upgrading to Lifetime...</h2>
          <p className="text-gray-600 mt-2">Please wait while we activate your lifetime access</p>
        </div>
      </div>
    );
  }

  if (setupStep === 'create-account') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Crown className="h-16 w-16 text-purple-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Create Your Lifetime Account</h1>
            <p className="text-gray-600 mt-2">Payment successful! Now create your Lifetime account</p>
          </div>

          <CreateAccountForm onSubmit={handleAccountCreation} />
        </div>
      </div>
    );
  }

  if (setupStep === 'upgrade-complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">🎉 Welcome to Lifetime!</h1>
            <p className="text-gray-600 mt-2">Your Lifetime membership has been activated successfully</p>
            <div className="bg-gradient-to-r from-purple-500 to-yellow-500 text-white px-4 py-2 rounded-full inline-block mt-4">
              <span className="font-semibold">✨ LIFETIME ACCESS UNLOCKED ✨</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-purple-50 rounded-lg p-6">
              <Crown className="h-8 w-8 text-purple-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">WhiteLabel Rights</h3>
              <p className="text-sm text-gray-600">Full access to WhiteLabel partner program and licensing</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6">
              <Infinity className="h-8 w-8 text-yellow-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Unlimited Everything</h3>
              <p className="text-sm text-gray-600">No limits on campaigns, contacts, or AI usage</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <Shield className="h-8 w-8 text-blue-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">API Access</h3>
              <p className="text-sm text-gray-600">Full API access for custom integrations and automation</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <Star className="h-8 w-8 text-green-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Beta Features</h3>
              <p className="text-sm text-gray-600">First access to all new features and experiments</p>
            </div>

            <div className="bg-red-50 rounded-lg p-6">
              <Users className="h-8 w-8 text-red-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Dedicated Support</h3>
              <p className="text-sm text-gray-600">Direct line to our development team for priority support</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6">
              <TrendingUp className="h-8 w-8 text-orange-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Revenue Opportunities</h3>
              <p className="text-sm text-gray-600">Monetize through WhiteLabel partnerships and referrals</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-yellow-500 rounded-lg p-6 text-white text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Your Lifetime Membership</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="opacity-80">One-time Fee:</span>
                <div className="font-semibold">$300 (Paid)</div>
              </div>
              <div>
                <span className="opacity-80">Future Billing:</span>
                <div className="font-semibold">Never!</div>
              </div>
              <div>
                <span className="opacity-80">Session ID:</span>
                <div className="font-mono text-xs">{sessionId}</div>
              </div>
              <div>
                <span className="opacity-80">Status:</span>
                <div className="font-semibold text-yellow-200">Lifetime Active</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gradient-to-r from-purple-500 to-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-yellow-600 transition-all"
            >
              Go to Lifetime Dashboard
            </button>
            <button
              onClick={() => navigate('/dashboard?tab=whitelabel')}
              className="flex-1 border border-purple-300 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all"
            >
              Explore WhiteLabel
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
          <p className="text-gray-600 mb-6">There was an error upgrading to Lifetime. Please contact support.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <Crown className="h-16 w-16 text-purple-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Lifetime Plan Signup</h1>
        <p className="text-gray-600 mb-6">Get lifetime access to MarketGenie with all premium features!</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-purple-500 to-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-yellow-600 transition-all"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-500 to-yellow-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-yellow-600 transition-all"
      >
        Create Lifetime Account
      </button>
    </form>
  );
};

export default LifetimePlanSignup;