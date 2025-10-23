import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from '../security/SecureFirebase.js';
import { Crown, CheckCircle, Building2, Palette, Users, DollarSign } from 'lucide-react';

const WhiteLabelPartnerSetup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signUp } = useAuth();
  const { tenant } = useTenant();
  
  const [setupStep, setSetupStep] = useState('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [partnerData, setPartnerData] = useState(null);
  const [setupData, setSetupData] = useState({
    companyName: '',
    businessType: '',
    website: '',
    expectedCustomers: '',
    brandingPreferences: {
      primaryColor: '#3B82F6',
      logoUrl: '',
      companyDomain: ''
    }
  });

  // Check if this is a payment success redirect
  const paymentSuccess = searchParams.get('payment_success') === 'true';
  const paymentType = searchParams.get('payment_type');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (paymentSuccess && paymentType === 'whiteLabel' && sessionId) {
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

      // Create WhiteLabel partner record
      const partnerDoc = {
        tenantId: tenant?.id || user.uid,
        userId: user.uid,
        companyName: setupData.companyName || 'New Partner',
        contactEmail: user.email,
        status: 'active',
        activatedAt: new Date(),
        paymentSessionId: sessionId,
        licenseType: 'whiteLabel',
        revenueShare: 0.85, // Partner gets 85%
        licensingFee: 497,
        nextPaymentDate: null, // One-time payment
        brandingConfig: setupData.brandingPreferences,
        customerCount: 0,
        monthlyRevenue: 0
      };

      await setDoc(doc(db, 'MarketGenie_whitelabel_partners', user.uid), partnerDoc);
      setPartnerData(partnerDoc);
      setSetupStep('setup-complete');
      
    } catch (error) {
      console.error('Error processing WhiteLabel setup:', error);
      setSetupStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountCreation = async (email, password, companyName) => {
    try {
      setIsLoading(true);
      const result = await signUp(email, password, {
        displayName: companyName,
        plan: 'whiteLabel'
      });

      if (result.error) {
        alert('Error creating account: ' + result.error.message);
        return;
      }

      // Continue with partner setup after account creation
      setSetupData(prev => ({ ...prev, companyName }));
      await handlePaymentSuccess();
      
    } catch (error) {
      console.error('Account creation error:', error);
      alert('Error creating account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Setting up your WhiteLabel partnership...</h2>
          <p className="text-gray-600 mt-2">Please wait while we activate your license</p>
        </div>
      </div>
    );
  }

  if (setupStep === 'create-account') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Crown className="h-16 w-16 text-purple-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Create Your Partner Account</h1>
            <p className="text-gray-600 mt-2">Payment successful! Now create your WhiteLabel partner account</p>
          </div>

          <CreateAccountForm onSubmit={handleAccountCreation} />
        </div>
      </div>
    );
  }

  if (setupStep === 'setup-complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">🎉 Welcome to WhiteLabel Partnership!</h1>
            <p className="text-gray-600 mt-2">Your license has been activated successfully</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-purple-50 rounded-lg p-6">
              <Building2 className="h-8 w-8 text-purple-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Company Setup</h3>
              <p className="text-sm text-gray-600">Configure your company branding and domain settings</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <Palette className="h-8 w-8 text-blue-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Brand Customization</h3>
              <p className="text-sm text-gray-600">Customize colors, logos, and white-label appearance</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <Users className="h-8 w-8 text-green-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Customer Management</h3>
              <p className="text-sm text-gray-600">Manage your white-labeled customer accounts</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6">
              <DollarSign className="h-8 w-8 text-orange-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Revenue Tracking</h3>
              <p className="text-sm text-gray-600">Track your 85% revenue share and payments</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-6 text-white text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Your Partnership Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="opacity-80">License Fee:</span>
                <div className="font-semibold">$497 (One-time)</div>
              </div>
              <div>
                <span className="opacity-80">Revenue Share:</span>
                <div className="font-semibold">85% to you</div>
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
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              Go to Partner Dashboard
            </button>
            <button
              onClick={() => window.open('https://docs.marketgenie.com/whitelabel', '_blank')}
              className="flex-1 border border-purple-300 text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all"
            >
              View Partner Guide
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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Setup Error</h1>
          <p className="text-gray-600 mb-6">There was an error setting up your WhiteLabel partnership. Please contact support.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <Crown className="h-16 w-16 text-purple-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">WhiteLabel Partner Setup</h1>
        <p className="text-gray-600 mb-6">Welcome to the MarketGenie WhiteLabel partner program!</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
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
    companyName: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSubmit(formData.email, formData.password, formData.companyName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input
          type="text"
          required
          value={formData.companyName}
          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          placeholder="Your Company Name"
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
          placeholder="partner@company.com"
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
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
      >
        Create Partner Account
      </button>
    </form>
  );
};

export default WhiteLabelPartnerSetup;