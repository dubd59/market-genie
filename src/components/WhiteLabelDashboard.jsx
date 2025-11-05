import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, setDoc, getDoc } from '../security/SecureFirebase.js';
import { isFeatureEnabled } from '../services/planLimits';
import stripePaymentService from '../services/StripePaymentService';

const WhiteLabelDashboard = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [isPartner, setIsPartner] = useState(false);
  const [partnerData, setPartnerData] = useState(null);
  const [partnerApplications, setPartnerApplications] = useState([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationFormData, setApplicationFormData] = useState({
    companyName: '',
    contactEmail: '',
    businessType: '',
    expectedCustomers: '',
    marketingExperience: '',
    websiteUrl: '',
    agreedToTerms: false
  });

  // New state for Partner Sales Center features
  const [showSignupLinksModal, setShowSignupLinksModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [signupLinks, setSignupLinks] = useState([]);
  const [customPricing, setCustomPricing] = useState({
    basicPlan: { price: 47, name: 'Basic Plan', features: ['Lead Generation', 'Email Automation', '1000 Contacts'] },
    proPlan: { price: 97, name: 'Professional', features: ['Everything in Basic', 'Advanced Analytics', '10000 Contacts', 'Priority Support'] },
    enterprisePlan: { price: 197, name: 'Enterprise', features: ['Everything in Pro', 'White Label Rights', 'Unlimited Everything', 'Custom Integrations'] }
  });
  const [analyticsData, setAnalyticsData] = useState({
    signups: 0,
    conversions: 0,
    revenue: 0,
    conversionRate: 0,
    recentActivity: []
  });

  // Check if user has WhiteLabel access (Lifetime or Founder only)
  const hasWhiteLabelAccess = isFeatureEnabled(tenant?.plan || 'free', 'whiteLabel');
  
  // Debug logging
  console.log('🔍 WhiteLabel Access Check:', {
    tenantPlan: tenant?.plan,
    hasWhiteLabelAccess,
    tenantId: tenant?.id,
    userUid: user?.uid,
    tenantHasWhiteLabel: tenant?.hasWhiteLabel
  });

  // Load partner data on component mount
  useEffect(() => {
    const loadPartnerData = async () => {
      if (!user?.uid || !hasWhiteLabelAccess) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Loading partner data for user:', user.uid);
        
        // Check if user is already a partner (use user.uid as document ID)
        const partnerDoc = await getDoc(doc(db, 'MarketGenie_whitelabel_partners', user.uid));
        console.log('🔍 Partner document exists:', partnerDoc.exists());
        
        if (partnerDoc.exists()) {
          console.log('✅ Found existing partner record:', partnerDoc.data());
          setIsPartner(true);
          setPartnerData(partnerDoc.data());
          
          // Load partner metrics
          await loadPartnerMetrics(user.uid);
        } else if (tenant?.hasWhiteLabel || tenant?.plan === 'lifetime_with_whitelabel') {
          // Auto-create partner record if tenant has White Label but no partner record exists
          console.log('🔧 Auto-creating missing partner record for White Label tenant...');
          console.log('🔍 Tenant data:', { hasWhiteLabel: tenant.hasWhiteLabel, plan: tenant.plan });
          
          const partnerData = {
            userId: user.uid,
            tenantId: tenant.id,
            contactEmail: user.email,
            companyName: tenant.name || 'White Label Partner',
            status: 'active',
            activatedAt: new Date(),
            licenseType: 'whiteLabel',
            revenueShare: 0.85,
            nextPaymentDate: null,
            customerCount: 0,
            monthlyRevenue: 0,
            parentTenantId: tenant.id,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          console.log('📝 Creating partner record with data:', partnerData);
          await setDoc(doc(db, 'MarketGenie_whitelabel_partners', user.uid), partnerData);
          setIsPartner(true);
          setPartnerData(partnerData);
          
          console.log('✅ Auto-created partner record successfully!');
        } else {
          console.log('❌ No White Label access found - showing signup interface');
        }

        // If founder, load all partner applications for approval
        if (tenant.plan === 'founder') {
          await loadPartnerApplications();
        }

      } catch (error) {
        console.error('Error loading partner data:', error);
      } finally {
        setIsLoading(false);
        console.log('🔍 Final component state:', { 
          isLoading: false, 
          isPartner, 
          hasWhiteLabelAccess,
          partnerDataExists: !!partnerData 
        });
      }
    };

    loadPartnerData();
  }, [user?.uid, hasWhiteLabelAccess]);

  // Handle payment success returns from Stripe
  useEffect(() => {
    const handlePaymentReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get('payment_success');
      const sessionId = urlParams.get('session_id');
      const paymentType = urlParams.get('payment_type');

      if (paymentSuccess === 'true' && sessionId) {
        try {
          // Process successful payment
          if (paymentType === 'whiteLabel' || paymentType === 'whitelabel') {
            // Activate WhiteLabel license
            const partnerDoc = {
              userId: user.uid, // Add user ID for rules compliance
              tenantId: tenant.id,
              companyName: tenant.businessName || 'New Partner',
              contactEmail: tenant.ownerEmail || user.email,
              status: 'active',
              activatedAt: new Date(),
              paymentSessionId: sessionId,
              licenseType: 'whiteLabel',
              revenueShare: 0.85,
              nextPaymentDate: null // One-time payment
            };

            await setDoc(doc(db, 'MarketGenie_whitelabel_partners', user.uid), partnerDoc);
            setIsPartner(true);
            setPartnerData(partnerDoc);
            
            alert('🎉 WhiteLabel license activated successfully! Welcome to the partner program!');
          } else if (paymentType === 'pro' || paymentType === 'lifetime') {
            // Handle Pro/Lifetime upgrades
            const updateData = {
              planType: paymentType,
              upgradeDate: new Date(),
              paymentSessionId: sessionId
            };
            
            await updateDoc(doc(db, 'MarketGenie_whitelabel_partners', user.uid), updateData);
            
            // Reload partner data
            const updatedDoc = await getDoc(doc(db, 'MarketGenie_whitelabel_partners', user.uid));
            if (updatedDoc.exists()) {
              setPartnerData(updatedDoc.data());
            }
            
            alert(`🚀 Successfully upgraded to ${paymentType === 'pro' ? 'Pro Plan' : 'Lifetime Access'}!`);
          }

          // Clean up URL parameters
          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
        } catch (error) {
          console.error('Error processing payment success:', error);
          alert('Payment successful but there was an error activating your license. Please contact support.');
        }
      }
    };

    handlePaymentReturn();
  }, [user?.uid, user?.email]);

  // Load partner performance metrics
  const loadPartnerMetrics = async (partnerId) => {
    try {
      // Get partner's customers
      const customersRef = collection(db, 'MarketGenie_partner_customers');
      const customersQuery = query(customersRef, where('partnerId', '==', partnerId));
      const customerDocs = await getDocs(customersQuery);

      // Get partner's revenue data
      const revenueRef = collection(db, 'MarketGenie_partner_revenue');
      const revenueQuery = query(revenueRef, where('partnerId', '==', partnerId));
      const revenueDocs = await getDocs(revenueQuery);

      let totalRevenue = 0;
      let monthlyRevenue = 0;
      const thisMonth = new Date();
      thisMonth.setDate(1);

      revenueDocs.forEach(doc => {
        const data = doc.data();
        totalRevenue += data.amount || 0;
        
        if (data.timestamp && data.timestamp.toDate() >= thisMonth) {
          monthlyRevenue += data.amount || 0;
        }
      });

      setPartnerData(prev => ({
        ...prev,
        metrics: {
          totalCustomers: customerDocs.size,
          totalRevenue,
          monthlyRevenue,
          royaltyOwed: monthlyRevenue * 0.15, // 15% royalty
          nextPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1, 1))
        }
      }));

    } catch (error) {
      console.error('Error loading partner metrics:', error);
    }
  };

  // Load all partner applications (founder only)
  const loadPartnerApplications = async () => {
    try {
      const applicationsRef = collection(db, 'MarketGenie_whitelabel_applications');
      const applicationsQuery = query(applicationsRef, where('status', '==', 'pending'));
      const applicationDocs = await getDocs(applicationsQuery);

      const applications = [];
      applicationDocs.forEach(doc => {
        applications.push({ id: doc.id, ...doc.data() });
      });

      setPartnerApplications(applications);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  // Handle partner application submission
  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    if (!applicationFormData.agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    try {
      await addDoc(collection(db, 'MarketGenie_whitelabel_applications'), {
        ...applicationFormData,
        applicantId: tenant.id,
        applicantEmail: user.email,
        tenantPlan: tenant.plan,
        applicationDate: new Date(),
        status: 'pending',
        licensingFee: 497,
        revenueSharePercentage: 15
      });

      alert('🎉 WhiteLabel application submitted successfully! You will receive approval notification within 24 hours.');
      setShowApplicationForm(false);
      setApplicationFormData({
        companyName: '',
        contactEmail: '',
        businessType: '',
        expectedCustomers: '',
        marketingExperience: '',
        websiteUrl: '',
        agreedToTerms: false
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    }
  };

  // Handle WhiteLabel license payment
  const handleWhiteLabelPayment = async () => {
    if (!applicationFormData.agreedToTerms) {
      alert('Please agree to the terms and conditions before proceeding to payment.');
      return;
    }

    try {
      // First submit the application
      await addDoc(collection(db, 'MarketGenie_whitelabel_applications'), {
        ...applicationFormData,
        applicantId: tenant.id,
        applicantEmail: user.email,
        tenantPlan: tenant.plan,
        applicationDate: new Date(),
        status: 'payment_pending',
        licensingFee: 497,
        revenueSharePercentage: 15
      });

      // Then redirect to Stripe payment
      await stripePaymentService.initiatePayment('whiteLabel', {
        userId: user.uid,
        email: user.email,
        tenantId: tenant.id,
        applicationData: applicationFormData
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  // Handle different plan upgrades
  const handlePlanUpgrade = async (planType) => {
    try {
      await stripePaymentService.initiatePayment(planType, {
        userId: user.uid,
        email: user.email,
        tenantId: tenant.id,
        currentPlan: tenant.plan
      });
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error initiating payment. Please try again.');
    }
  };

  // Partner Sales Tools Handlers
  const handleGenerateSignupLinks = () => {
    setShowSignupLinksModal(true);
  };

  const handleSetCustomPricing = () => {
    setShowPricingModal(true);
  };

  const handleViewSalesFunnel = () => {
    setShowAnalyticsModal(true);
  };

  // Generate a new signup link
  const generateNewSignupLink = (linkData) => {
    const partnerCode = `WL_${user?.uid?.slice(-8) || 'XXXXXXXX'}`;
    // Use the dedicated signup route that handles partner parameters properly
    const currentDomain = window.location.origin;
    const baseUrl = `${currentDomain}/signup`;
    const params = new URLSearchParams({
      partner: partnerCode,
      plan: linkData.plan || 'basic',
      discount: linkData.discount || 0,
      campaign: linkData.campaignName || 'default',
      source: linkData.source || 'partner'
    });
    
    const newLink = {
      id: Date.now(),
      url: `${baseUrl}?${params.toString()}`,
      campaignName: linkData.campaignName || 'Default Campaign',
      plan: linkData.plan || 'basic',
      discount: linkData.discount || 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      createdAt: new Date(),
      isActive: true
    };
    
    setSignupLinks(prev => [...prev, newLink]);
    return newLink;
  };

  // Save custom pricing to Firebase
  const saveCustomPricing = async (pricingData) => {
    try {
      const pricingRef = doc(db, 'MarketGenie_whitelabel_partners', user.uid);
      await setDoc(pricingRef, {
        customPricing: pricingData,
        pricingUpdatedAt: new Date()
      }, { merge: true });
      
      setCustomPricing(pricingData);
      alert('✅ Custom pricing saved successfully!');
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('❌ Error saving pricing. Please try again.');
    }
  };

  // Load analytics data (mock for now, replace with real Firebase data)
  const loadAnalyticsData = () => {
    // Simulate analytics data - in production, load from Firebase
    const mockData = {
      signups: Math.floor(Math.random() * 150) + 50,
      conversions: Math.floor(Math.random() * 45) + 15,
      revenue: (Math.floor(Math.random() * 5000) + 2000),
      conversionRate: 0,
      recentActivity: [
        { date: '2025-11-05', event: 'Signup', customer: 'john@example.com', plan: 'Pro', revenue: 97 },
        { date: '2025-11-04', event: 'Conversion', customer: 'sarah@company.com', plan: 'Basic', revenue: 47 },
        { date: '2025-11-03', event: 'Signup', customer: 'mike@startup.com', plan: 'Enterprise', revenue: 197 },
        { date: '2025-11-02', event: 'Signup', customer: 'lisa@agency.com', plan: 'Pro', revenue: 97 }
      ]
    };
    mockData.conversionRate = mockData.conversions > 0 ? ((mockData.conversions / mockData.signups) * 100).toFixed(1) : 0;
    setAnalyticsData(mockData);
  };

  const handleCopyPartnerLink = () => {
    const partnerCode = `WL_${partnerData?.partnerId?.slice(-8) || user?.uid?.slice(-8) || 'XXXXXXXX'}`;
    // Use the dedicated signup route that handles partner parameters properly
    const currentDomain = window.location.origin;
    const partnerLink = `${currentDomain}/signup?partner=${partnerCode}`;
    
    navigator.clipboard.writeText(partnerLink).then(() => {
      alert(`✅ Partner link copied! Share this link: ${partnerLink}`);
    }).catch(() => {
      alert(`📋 Your partner link: ${partnerLink}`);
    });
  };

  const handleDownloadSalesKit = () => {
    alert('🚧 Coming Soon: Download complete sales kit with presentations, graphics, and email templates!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading WhiteLabel dashboard...</p>
        </div>
      </div>
    );
  }

  // Access denied for non-lifetime/founder users
  if (!hasWhiteLabelAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-xl text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">🚀 WhiteLabel SaaS Opportunity</h1>
            <p className="text-xl opacity-90">Exclusive to Lifetime & Founder Members</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">💰 Revenue Potential</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>50 customers @ $47/month:</span>
                    <span className="font-bold">$2,350/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual revenue potential:</span>
                    <span className="font-bold text-green-600">$28,200/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your share (85%):</span>
                    <span className="font-bold text-blue-600">$23,970/year</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 What You Get</h2>
                <ul className="space-y-2">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Custom branded SaaS platform</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Your logo, colors, domain</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Revenue tracking dashboard</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Partner support & training</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Marketing materials included</li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-2">🔒 Upgrade Required</h3>
              <p className="text-gray-600 mb-4">WhiteLabel rights are exclusive to Lifetime and Founder members</p>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all">
                Upgrade to Lifetime Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main WhiteLabel Dashboard for eligible users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            WhiteLabel SaaS Management
          </h1>
          <p className="text-gray-600 text-lg">Build your branded SaaS empire with MarketGenie's WhiteLabel program</p>
        </div>

        {/* Partner Status */}
        {!isPartner ? (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Become a WhiteLabel Partner</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join our exclusive WhiteLabel program and start your own branded SaaS business. 
                Pay $497 licensing fee and keep 85% of all revenue from your customers.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">$497</div>
                  <div className="text-gray-600">One-time licensing fee</div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-gray-600">Revenue share for you</div>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">15%</div>
                  <div className="text-gray-600">Royalty to MarketGenie</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleWhiteLabelPayment}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105"
                >
                  💳 Pay $497 & Start Now
                </button>
                <button 
                  onClick={() => setShowApplicationForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                >
                  📝 Apply First
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Partner Dashboard */
          <div className="space-y-8">
            
            {/* Partner Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white shadow-lg rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-gray-900">{partnerData?.metrics?.totalCustomers || 0}</div>
                <div className="text-gray-500">Total Customers</div>
              </div>
              
              <div className="bg-white shadow-lg rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold text-green-600">${partnerData?.metrics?.monthlyRevenue?.toFixed(2) || '0.00'}</div>
                <div className="text-gray-500">Monthly Revenue</div>
              </div>
              
              <div className="bg-white shadow-lg rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">🏦</div>
                <div className="text-2xl font-bold text-blue-600">${(partnerData?.metrics?.monthlyRevenue * 0.85)?.toFixed(2) || '0.00'}</div>
                <div className="text-gray-500">Your Share (85%)</div>
              </div>
              
              <div className="bg-white shadow-lg rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-2xl font-bold text-purple-600">${partnerData?.metrics?.royaltyOwed?.toFixed(2) || '0.00'}</div>
                <div className="text-gray-500">Royalty Due (15%)</div>
              </div>
            </div>

            {/* Plan Status - Show current plan instead of upgrade options for White Label users */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">🎉 Active White Label License</h3>
                  <p className="text-gray-600">You have full access to all White Label features and revenue opportunities</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 mb-1">LIFETIME</div>
                  <div className="text-sm text-gray-500">+ White Label Rights</div>
                </div>
              </div>
            </div>

            {/* Partner Controls */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Partner Sales Center */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">💼 Partner Sales Center</h3>
                <p className="text-gray-600 mb-4">Create custom pricing and signup links for your customers</p>
                <div className="space-y-3">
                  <button 
                    onClick={handleGenerateSignupLinks}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
                  >
                    🔗 Generate Signup Links
                  </button>
                  <button 
                    onClick={handleSetCustomPricing}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
                  >
                    💰 Set Custom Pricing
                  </button>
                  <button 
                    onClick={handleViewSalesFunnel}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    📊 View Sales Funnel
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🎨 Branding Controls</h3>
                <p className="text-gray-600 mb-4">Customize your branded SaaS platform</p>
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all">
                  Manage Branding
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Customer Management</h3>
                <p className="text-gray-600 mb-4">View and manage your customers</p>
                <button className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all">
                  View Customers
                </button>
              </div>
            </div>

            {/* Marketing Resources */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Partner Marketing Center</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">🎯 Sales Materials</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={handleDownloadSalesKit}
                      className="w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-all"
                    >
                      📄 Download Sales Deck
                    </button>
                    <button 
                      onClick={handleDownloadSalesKit}
                      className="w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-all"
                    >
                      🎨 Marketing Graphics
                    </button>
                    <button 
                      onClick={handleDownloadSalesKit}
                      className="w-full text-left bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-all"
                    >
                      📧 Email Templates
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">🔗 Referral Tools</h4>
                  <div className="space-y-2">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Your Partner Code:</div>
                      <div className="font-mono text-blue-600 font-bold">WL_{partnerData?.partnerId?.slice(-8) || 'XXXXXXXX'}</div>
                    </div>
                    <button 
                      onClick={handleCopyPartnerLink}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
                    >
                      📋 Copy Partner Link
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-green-800">💡 Pro Tip</div>
                    <div className="text-sm text-green-600">Use your custom branded domain and partner code to maximize conversions</div>
                  </div>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">
                    Setup Domain
                  </button>
                </div>
              </div>
            </div>

            {/* Revenue Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">💳 Revenue & Payments</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-800">Next royalty payment due:</span>
                  <span className="font-bold text-green-600">
                    ${partnerData?.metrics?.royaltyOwed?.toFixed(2) || '0.00'} on {partnerData?.metrics?.nextPaymentDate?.toLocaleDateString() || 'TBD'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Royalty payments are automatically deducted from your Stripe account monthly via Stripe Connect.
              </p>
            </div>
          </div>
        )}

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">WhiteLabel Partnership Application</h2>
                  <button 
                    onClick={() => setShowApplicationForm(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={applicationFormData.companyName}
                      onChange={(e) => setApplicationFormData({...applicationFormData, companyName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={applicationFormData.contactEmail}
                      onChange={(e) => setApplicationFormData({...applicationFormData, contactEmail: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
                    <select
                      required
                      value={applicationFormData.businessType}
                      onChange={(e) => setApplicationFormData({...applicationFormData, businessType: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Business Type</option>
                      <option value="marketing-agency">Marketing Agency</option>
                      <option value="consultant">Business Consultant</option>
                      <option value="freelancer">Freelancer</option>
                      <option value="software-company">Software Company</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Customers (First 6 months)</label>
                    <select
                      value={applicationFormData.expectedCustomers}
                      onChange={(e) => setApplicationFormData({...applicationFormData, expectedCustomers: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Range</option>
                      <option value="1-10">1-10 customers</option>
                      <option value="11-25">11-25 customers</option>
                      <option value="26-50">26-50 customers</option>
                      <option value="51-100">51-100 customers</option>
                      <option value="100+">100+ customers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Experience *</label>
                    <textarea
                      required
                      value={applicationFormData.marketingExperience}
                      onChange={(e) => setApplicationFormData({...applicationFormData, marketingExperience: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="3"
                      placeholder="Brief description of your marketing experience and current client base..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                    <input
                      type="url"
                      value={applicationFormData.websiteUrl}
                      onChange={(e) => setApplicationFormData({...applicationFormData, websiteUrl: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-bold text-purple-800 mb-2">Partnership Terms:</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• One-time licensing fee: $497</li>
                      <li>• Revenue sharing: 85% to you, 15% royalty to MarketGenie</li>
                      <li>• Custom branding and domain setup included</li>
                      <li>• Partner support and marketing materials provided</li>
                      <li>• Monthly royalty payments via Stripe Connect</li>
                    </ul>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="agreedToTerms"
                      checked={applicationFormData.agreedToTerms}
                      onChange={(e) => setApplicationFormData({...applicationFormData, agreedToTerms: e.target.checked})}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="agreedToTerms" className="ml-2 text-sm text-gray-700">
                      I agree to the WhiteLabel partnership terms and conditions *
                    </label>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handleWhiteLabelPayment}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
                      >
                        💳 Pay $497 & Activate License
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                      >
                        📝 Submit Application Only
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Founder: Partner Applications Management */}
        {tenant?.plan === 'founder' && partnerApplications.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 Pending Partner Applications</h3>
            <div className="space-y-4">
              {partnerApplications.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800">{application.companyName}</h4>
                      <p className="text-gray-600">{application.contactEmail}</p>
                      <p className="text-sm text-gray-500">
                        {application.businessType} • Expected: {application.expectedCustomers}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                        Approve
                      </button>
                      <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signup Links Generation Modal */}
        {showSignupLinksModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">🔗 Generate Signup Links</h2>
                  <button 
                    onClick={() => setShowSignupLinksModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Link Generator Form */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Create New Link</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const linkData = {
                        campaignName: formData.get('campaignName'),
                        plan: formData.get('plan'),
                        discount: parseInt(formData.get('discount')) || 0,
                        source: formData.get('source')
                      };
                      generateNewSignupLink(linkData);
                      e.target.reset();
                    }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                        <input
                          name="campaignName"
                          type="text"
                          placeholder="e.g., Holiday Special 2025"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Plan</label>
                        <select name="plan" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                          <option value="basic">Basic Plan ($47/mo)</option>
                          <option value="pro">Professional ($97/mo)</option>
                          <option value="enterprise">Enterprise ($197/mo)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
                        <input
                          name="discount"
                          type="number"
                          min="0"
                          max="50"
                          placeholder="e.g., 20"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Traffic Source</label>
                        <select name="source" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                          <option value="email">Email Campaign</option>
                          <option value="social">Social Media</option>
                          <option value="website">Website</option>
                          <option value="referral">Referral</option>
                          <option value="advertising">Paid Advertising</option>
                        </select>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
                      >
                        Generate Link
                      </button>
                    </form>
                  </div>

                  {/* Generated Links List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Generated Links</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {signupLinks.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No links generated yet. Create your first link!</p>
                      ) : (
                        signupLinks.map((link) => (
                          <div key={link.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-800">{link.campaignName}</h4>
                              <span className={`px-2 py-1 text-xs rounded ${link.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {link.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {link.plan} plan • {link.discount}% discount
                            </p>
                            <div className="bg-gray-50 p-2 rounded font-mono text-xs break-all mb-2">
                              {link.url}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <div className="text-gray-500">
                                Clicks: {link.clicks} • Conversions: {link.conversions}
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(link.url);
                                  alert('✅ Link copied to clipboard!');
                                }}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Pricing Modal */}
        {showPricingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">💰 Custom Pricing Manager</h2>
                  <button 
                    onClick={() => setShowPricingModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  {Object.entries(customPricing).map(([key, plan]) => (
                    <div key={key} className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 capitalize">{plan.name}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                          <input
                            type="number"
                            value={plan.price}
                            onChange={(e) => setCustomPricing(prev => ({
                              ...prev,
                              [key]: { ...prev[key], price: parseInt(e.target.value) || 0 }
                            }))}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                          <input
                            type="text"
                            value={plan.name}
                            onChange={(e) => setCustomPricing(prev => ({
                              ...prev,
                              [key]: { ...prev[key], name: e.target.value }
                            }))}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                          <div className="space-y-1">
                            {plan.features.map((feature, index) => (
                              <input
                                key={index}
                                type="text"
                                value={feature}
                                onChange={(e) => {
                                  const newFeatures = [...plan.features];
                                  newFeatures[index] = e.target.value;
                                  setCustomPricing(prev => ({
                                    ...prev,
                                    [key]: { ...prev[key], features: newFeatures }
                                  }));
                                }}
                                className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Pricing Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Consider your market and competition when setting prices</li>
                    <li>• Higher prices can increase perceived value</li>
                    <li>• Offer clear value differentiation between tiers</li>
                    <li>• Remember: You keep 85% of all revenue!</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => saveCustomPricing(customPricing)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
                  >
                    Save Pricing
                  </button>
                  <button
                    onClick={() => {
                      setCustomPricing({
                        basicPlan: { price: 47, name: 'Basic Plan', features: ['Lead Generation', 'Email Automation', '1000 Contacts'] },
                        proPlan: { price: 97, name: 'Professional', features: ['Everything in Basic', 'Advanced Analytics', '10000 Contacts', 'Priority Support'] },
                        enterprisePlan: { price: 197, name: 'Enterprise', features: ['Everything in Pro', 'White Label Rights', 'Unlimited Everything', 'Custom Integrations'] }
                      });
                    }}
                    className="px-6 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sales Funnel Analytics Modal */}
        {showAnalyticsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">📊 Sales Funnel Analytics</h2>
                  <button 
                    onClick={() => setShowAnalyticsModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <button
                  onClick={loadAnalyticsData}
                  className="mb-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  🔄 Refresh Data
                </button>

                {/* Analytics Overview */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                    <div className="text-3xl font-bold">{analyticsData.signups}</div>
                    <div className="text-blue-100">Total Signups</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                    <div className="text-3xl font-bold">{analyticsData.conversions}</div>
                    <div className="text-green-100">Conversions</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                    <div className="text-3xl font-bold">{analyticsData.conversionRate}%</div>
                    <div className="text-purple-100">Conversion Rate</div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
                    <div className="text-3xl font-bold">${analyticsData.revenue}</div>
                    <div className="text-yellow-100">Revenue This Month</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">🎯 Recent Activity</h3>
                  <div className="space-y-3">
                    {analyticsData.recentActivity.map((activity, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="font-medium">{activity.event}: {activity.customer}</div>
                          <div className="text-sm text-gray-500">{activity.date} • {activity.plan} Plan</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">${activity.revenue}</div>
                          <div className="text-sm text-gray-500">Revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">💰 Revenue Breakdown</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-green-700">Total Revenue: <span className="font-bold">${analyticsData.revenue}</span></div>
                    </div>
                    <div>
                      <div className="text-green-700">Your Share (85%): <span className="font-bold">${(analyticsData.revenue * 0.85).toFixed(2)}</span></div>
                    </div>
                    <div>
                      <div className="text-green-700">MarketGenie Royalty (15%): <span className="font-bold">${(analyticsData.revenue * 0.15).toFixed(2)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhiteLabelDashboard;