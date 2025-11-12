import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, setDoc, getDoc } from '../security/SecureFirebase.js';
import { isFeatureEnabled } from '../services/planLimits';
import stripePaymentService from '../services/StripePaymentService';
import WhiteLabelFunnelBuilder from './WhiteLabelFunnelBuilder';

// FOUNDER ACCESS: dubdproducts@gmail.com always has full WhiteLabel access
// regardless of tenant plan or other restrictions

const WhiteLabelDashboard = ({ isDarkMode = false }) => {
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
  const [showFunnelBuilder, setShowFunnelBuilder] = useState(false);
  const [signupLinks, setSignupLinks] = useState([]);
  const [customPricing, setCustomPricing] = useState({
    basicPlan: { price: 47, name: 'Basic Plan', features: ['Lead Generation', 'Email Automation', '1000 Contacts'] },
    proPlan: { price: 97, name: 'Professional', features: ['Everything in Basic', 'Advanced Analytics', '10000 Contacts', 'Priority Support'] },
    enterprisePlan: { price: 197, name: 'Enterprise', features: ['Everything in Pro', 'White Label Rights', 'Unlimited Everything', 'Custom Integrations'] }
  });
  
  // Helper function to update classes with dark mode support
  const getDarkModeClasses = (lightClasses, darkClasses = '') => {
    const dark = darkClasses || lightClasses.replace('bg-white', 'bg-gray-800').replace('text-gray-900', 'text-white').replace('text-gray-700', 'text-gray-300')
    return isDarkMode ? dark : lightClasses
  }

  // Check if user has WhiteLabel access (Lifetime, Founder, or Admin bypass)
  const isFounderUser = user?.email === 'dubdproducts@gmail.com';
  const isFounderPlan = tenant?.plan === 'founder';
  const hasFeatureAccess = isFeatureEnabled(tenant?.plan || 'free', 'whiteLabel');
  const hasWhiteLabelAccess = isFounderUser || isFounderPlan || hasFeatureAccess;
  
  // Debug logging
  console.log('🔍 WhiteLabel Access Check:', {
    userEmail: user?.email,
    isFounderUser,
    tenantPlan: tenant?.plan,
    isFounderPlan,
    hasFeatureAccess,
    hasWhiteLabelAccess,
    tenantId: tenant?.id,
    userUid: user?.uid,
    tenantHasWhiteLabel: tenant?.hasWhiteLabel
  });

  // Load partner data on component mount
  useEffect(() => {
    const loadPartnerData = async () => {
      if (!user?.uid || (!hasWhiteLabelAccess && user?.email !== 'dubdproducts@gmail.com')) {
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
        } else if (tenant?.hasWhiteLabel || tenant?.plan === 'lifetime_with_whitelabel' || user?.email === 'dubdproducts@gmail.com' || tenant?.plan === 'founder') {
          // Auto-create partner record if tenant has White Label but no partner record exists
          console.log('🔧 Auto-creating missing partner record for White Label tenant or founder...');
          console.log('🔍 Tenant data:', { hasWhiteLabel: tenant.hasWhiteLabel, plan: tenant.plan, isFounder: user?.email === 'dubdproducts@gmail.com' });
          
          const partnerData = {
            userId: user.uid,
            tenantId: tenant.id,
            contactEmail: user.email,
            companyName: user?.email === 'dubdproducts@gmail.com' ? 'Market Genie Founder' : (tenant.name || 'White Label Partner'),
            status: 'active',
            activatedAt: new Date(),
            licenseType: user?.email === 'dubdproducts@gmail.com' ? 'founder' : 'whiteLabel',
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
    setShowFunnelBuilder(true);
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

  // Partner Marketing Materials Functions
  const downloadSalesDeck = () => {
    const partnerCode = `WL_${partnerData?.partnerId?.slice(-8) || user?.uid?.slice(-8) || 'PARTNER'}`;
    const currentDomain = window.location.origin;
    const partnerLink = `${currentDomain}/signup?partner=${partnerCode}`;
    
    // Create RTF content with compact spacing and 12pt font
    const salesDeckContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;} {\\f1 Arial;} {\\f2 Calibri;}}
{\\colortbl;\\red0\\green0\\blue0;\\red0\\green102\\blue204;\\red204\\green0\\blue0;\\red0\\green153\\blue0;\\red255\\green102\\blue0;}

{\\f2\\fs32\\b\\cf2 [YOUR COMPANY NAME] - AI Marketing Automation Platform\\par}
{\\f2\\fs24\\b Sales Presentation & Business Opportunity\\par}
\\par\\par
{\\f2\\fs32\\b\\cf2 WHAT WE OFFER:\\par}
{\\f2\\fs26\\b AI-Powered Marketing Automation Platform\\par}
\\par
{\\f1\\fs24 \\u9989? Automated Lead Generation & Prospecting\\par}
{\\f1\\fs24 \\u9989? Email & SMS Campaign Automation\\par}
{\\f1\\fs24 \\u9989? Complete CRM & Pipeline Management\\par}
{\\f1\\fs24 \\u9989? AI-Powered Sales Funnel Builder\\par}
{\\f1\\fs24 \\u9989? Multi-Channel Marketing Automation\\par}
{\\f1\\fs24 \\u9989? Advanced Analytics & Reporting\\par}
\\par\\par
{\\f2\\fs32\\b\\cf2 EXCLUSIVE PRICING FOR YOUR CLIENTS:\\par}
\\par
{\\f1\\fs24 Instead of paying market rates of $97-$297/month, your clients get:\\par}
\\par
{\\f2\\fs26\\b\\cf4 Basic Plan: $${customPricing.basicPlan.price}/month }{\\f1\\fs24\\cf3 (Save ${Math.round((1 - customPricing.basicPlan.price/97) * 100)}%!)\\par}
{\\f2\\fs26\\b\\cf4 Professional: $${customPricing.proPlan.price}/month }{\\f1\\fs24\\cf3 (Save ${Math.round((1 - customPricing.proPlan.price/197) * 100)}%!)\\par}
{\\f2\\fs26\\b\\cf4 Enterprise: $${customPricing.enterprisePlan.price}/month }{\\f1\\fs24\\cf3 (Save ${Math.round((1 - customPricing.enterprisePlan.price/297) * 100)}%!)\\par}
\\par\\par
{\\f2\\fs32\\b\\cf2 WHY CHOOSE OUR PLATFORM?\\par}
\\par
{\\f1\\fs24 \\u9989? Complete All-in-One Solution\\par}
{\\f1\\fs24 \\u9989? AI-Powered Automation (No Manual Work)\\par}
{\\f1\\fs24 \\u9989? No Setup Fees or Hidden Costs\\par}
{\\f1\\fs24 \\u9989? 24/7 Professional Support Included\\par}
{\\f1\\fs24 \\u9989? White Label Rights Available\\par}
{\\f1\\fs24 \\u9989? Proven ROI for Businesses of All Sizes\\par}
{\\f1\\fs24 \\u9989? Simple Setup - Live in 24 Hours\\par}
\\par\\par
{\\f2\\fs32\\b\\cf2 CLIENT SUCCESS STORIES:\\par}
\\par
{\\f1\\fs24\\i "Increased our lead generation by 400% in the first month"\\par}
{\\f1\\fs22 - Local Business Owner\\par}
\\par
{\\f1\\fs24\\i "Saved 20 hours per week on marketing tasks"\\par}
{\\f1\\fs22 - Digital Agency\\par}
\\par
{\\f1\\fs24\\i "ROI paid for itself in the first 2 weeks"\\par}
{\\f1\\fs22 - E-commerce Store\\par}
\\par\\par
{\\f2\\fs32\\b\\cf2 GET STARTED TODAY:\\par}
\\par
{\\f2\\fs24\\b Your Exclusive Client Signup Link:\\par}
{\\f1\\fs22\\cf2 ${partnerLink}\\par}
\\par
{\\f2\\fs24\\b Your Partner Reference Code: }{\\f1\\fs24\\cf2 ${partnerCode}\\par}
\\par\\par
{\\f2\\fs28\\b\\cf2 QUESTIONS OR SUPPORT:\\par}
{\\f1\\fs24 Contact: ${user?.email || '[YOUR EMAIL ADDRESS]'}\\par}
{\\f1\\fs24 Phone: [YOUR PHONE NUMBER]\\par}
{\\f1\\fs24 Website: [YOUR WEBSITE]\\par}
\\par\\par
{\\f2\\fs26\\b\\cf3 INSTRUCTIONS FOR USE:\\par}
{\\f1\\fs24 1. Replace [YOUR COMPANY NAME] with your business name\\par}
{\\f1\\fs24 2. Add your contact information above\\par}
{\\f1\\fs24 3. Share your exclusive signup link with prospects\\par}
{\\f1\\fs24 4. Use this presentation to explain the value proposition\\par}
{\\f1\\fs24 5. Emphasize the exclusive pricing only available through you\\par}
\\par
{\\f1\\fs22\\i This platform is white-labeled for your business.\\par}
{\\f1\\fs22\\i Generated by your AI Marketing Automation System\\par}
}`;

    // Create and download as RTF file
    const blob = new Blob([salesDeckContent], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sales-Deck-${partnerCode}.rtf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Sales deck downloaded! Now with 12pt font and compact 2-3 space sections.');
  };

  const downloadMarketingGraphics = () => {
    const partnerCode = `WL_${partnerData?.partnerId?.slice(-8) || user?.uid?.slice(-8) || 'PARTNER'}`;
    
    // Create RTF content with compact spacing and 12pt font
    const graphicsContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;} {\\f1 Arial;} {\\f2 Calibri;}}
{\\colortbl;\\red0\\green0\\blue0;\\red0\\green102\\blue204;\\red204\\green0\\blue0;\\red0\\green153\\blue0;\\red255\\green102\\blue0;\\red102\\green0\\blue204;}

{\\f2\\fs32\\b\\cf2 [YOUR COMPANY NAME] - Social Media & Marketing Content Kit\\par}
\\par\\par
{\\f2\\fs26\\b\\cf2 LINKEDIN POSTS:\\par}
\\par
{\\f2\\fs24\\b\\cf6 Post #1:\\par}
{\\f1\\fs24 \\u128640? Exciting news! I'm now offering an AI-powered marketing automation platform that's transforming how businesses generate leads and close sales.\\par}
\\par
{\\f1\\fs24 Get exclusive access at ${Math.round((1 - customPricing.basicPlan.price/97) * 100)}% OFF regular pricing!\\par}
\\par
{\\f1\\fs24 \\u9989? Automated Lead Generation\\par}
{\\f1\\fs24 \\u9989? Email & SMS Automation\\par}
{\\f1\\fs24 \\u9989? Complete CRM System\\par}
{\\f1\\fs24 \\u9989? AI Funnel Builder\\par}
\\par
{\\f1\\fs24 Limited time offer - message me for your exclusive access!\\par}
{\\f1\\fs22\\cf2 #MarketingAutomation #AI #BusinessGrowth #Sales\\par}
\\par\\par
{\\f2\\fs24\\b\\cf6 Post #2:\\par}
{\\f1\\fs24 \\u128161? Are you tired of manually chasing leads and managing scattered marketing tools?\\par}
\\par
{\\f1\\fs24 I've partnered with an AI marketing platform that automates everything:\\par}
{\\f1\\fs24 \\u8594? Finds qualified prospects automatically\\par}
{\\f1\\fs24 \\u8594? Sends personalized follow-up sequences\\par}
{\\f1\\fs24 \\u8594? Tracks every interaction in one dashboard\\par}
{\\f1\\fs24 \\u8594? Builds high-converting sales funnels\\par}
\\par
{\\f1\\fs24 My clients are seeing 300-400% increases in lead generation.\\par}
{\\f1\\fs24 Want to see how this could work for your business?\\par}
\\par\\par
{\\f2\\fs26\\b\\cf2 FACEBOOK/INSTAGRAM POSTS:\\par}
\\par
{\\f2\\fs24\\b\\cf6 Post #1:\\par}
{\\f1\\fs24 \\u128161? Transform your marketing with AI automation!\\par}
\\par
{\\f1\\fs24 I'm excited to offer an exclusive AI marketing platform to my network:\\par}
{\\f1\\fs24 \\u128176? Basic Plan: $${customPricing.basicPlan.price}/month (normally $97)\\par}
{\\f1\\fs24 \\u128176? Pro Plan: $${customPricing.proPlan.price}/month (normally $197)\\par}
\\par
{\\f1\\fs24 \\u127919? Complete marketing automation\\par}
{\\f1\\fs24 \\u127919? AI-powered lead generation\\par}
{\\f1\\fs24 \\u127919? No setup fees required\\par}
{\\f1\\fs24 \\u127919? Live in 24 hours\\par}
\\par
{\\f1\\fs24 Comment "INFO" for exclusive access!\\par}
\\par\\par
{\\f2\\fs24\\b\\cf6 Post #2:\\par}
{\\f1\\fs24 \\u128293? BUSINESS OWNERS: Stop wasting time on manual marketing!\\par}
\\par
{\\f1\\fs24 This AI platform handles:\\par}
{\\f1\\fs24 \\u9989? Lead generation (automatically finds prospects)\\par}
{\\f1\\fs24 \\u9989? Email sequences (sends follow-ups for you)\\par}
{\\f1\\fs24 \\u9989? Pipeline management (tracks everything)\\par}
{\\f1\\fs24 \\u9989? Funnel creation (AI builds sales pages)\\par}
\\par
{\\f1\\fs24\\b Result: 400% more leads, 80% less work\\par}
{\\f1\\fs24 Message me to see if this fits your business!\\par}
\\par\\par
{\\f2\\fs26\\b\\cf2 TWITTER/X POSTS:\\par}
\\par
{\\f2\\fs24\\b\\cf6 Post #1:\\par}
{\\f1\\fs24 \\u128293? Exclusive offer for business owners!\\par}
\\par
{\\f1\\fs24 Get AI marketing automation:\\par}
{\\f1\\fs24 \\u8594? $${customPricing.basicPlan.price}/month (normally $97)\\par}
{\\f1\\fs24 \\u8594? Includes lead generation\\par}
{\\f1\\fs24 \\u8594? Email automation\\par}
{\\f1\\fs24 \\u8594? Complete CRM\\par}
{\\f1\\fs24 \\u8594? AI funnel builder\\par}
\\par
{\\f1\\fs24 DM for exclusive access! #MarketingAI #Automation\\par}
\\par\\par
{\\f2\\fs24\\b\\cf6 Post #2:\\par}
{\\f1\\fs24 \\u9889? Stop chasing leads manually\\par}
\\par
{\\f1\\fs24 This AI platform:\\par}
{\\f1\\fs24 \\u8594? Finds prospects automatically\\par}
{\\f1\\fs24 \\u8594? Sends personalized emails\\par}
{\\f1\\fs24 \\u8594? Tracks all conversations\\par}
{\\f1\\fs24 \\u8594? Builds sales funnels\\par}
\\par
{\\f1\\fs24\\b Result: 4x more leads, 80% less work\\par}
{\\f1\\fs24 Want to see how? DM me.\\par}
\\par\\par
{\\f2\\fs28\\b\\cf2 SUGGESTED HASHTAGS:\\par}
{\\f1\\fs24\\cf2 #MarketingAutomation #AI #LeadGeneration #BusinessGrowth\\par}
{\\f1\\fs24\\cf2 #Sales #CRM #EmailMarketing #DigitalMarketing #Entrepreneur\\par}
{\\f1\\fs24\\cf2 #SmallBusiness #MarketingTech #SalesAutomation\\par}
\\par\\par
{\\f2\\fs28\\b\\cf2 CONTENT CALENDAR IDEAS:\\par}
\\par
{\\f2\\fs24\\b Monday:} {\\f1\\fs24 Success story/case study\\par}
{\\f2\\fs24\\b Tuesday:} {\\f1\\fs24 Feature spotlight (AI tools)\\par}
{\\f2\\fs24\\b Wednesday:} {\\f1\\fs24 Tips & best practices\\par}
{\\f2\\fs24\\b Thursday:} {\\f1\\fs24 Behind-the-scenes content\\par}
{\\f2\\fs24\\b Friday:} {\\f1\\fs24 Weekend motivation/results\\par}
\\par\\par
{\\f2\\fs26\\b\\cf3 INSTRUCTIONS FOR USE:\\par}
{\\f1\\fs24 1. Replace [YOUR COMPANY NAME] with your business name\\par}
{\\f1\\fs24 2. Replace contact info with your actual details\\par}
{\\f1\\fs24 3. Use these templates for consistent messaging\\par}
{\\f1\\fs24 4. Post 3-5 times per week for best results\\par}
{\\f1\\fs24 5. Always include your exclusive signup link when appropriate\\par}
\\par
{\\f2\\fs24\\b Your Partner Reference Code: }{\\f1\\fs24\\cf2 ${partnerCode}\\par}
}`;

    const blob = new Blob([graphicsContent], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Marketing-Content-Kit-${partnerCode}.rtf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Marketing content kit downloaded! Now with 12pt font and compact 2-3 space sections.');
  };

  const downloadEmailTemplates = () => {
    const partnerCode = `WL_${partnerData?.partnerId?.slice(-8) || user?.uid?.slice(-8) || 'PARTNER'}`;
    const currentDomain = window.location.origin;
    const partnerLink = `${currentDomain}/signup?partner=${partnerCode}`;
    
    const emailTemplates = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;} {\\f1 Arial;} {\\f2 Calibri;}}
{\\colortbl;\\red0\\green0\\blue0;\\red0\\green102\\blue204;\\red204\\green0\\blue0;\\red0\\green153\\blue0;\\red255\\green102\\blue0;\\red102\\green0\\blue204;}

{\\f2\\fs32\\b\\cf2 [YOUR COMPANY NAME] - Email Outreach Templates\\par}
{\\f2\\fs24\\b Cold Outreach & Follow-up Sequences\\par}
\\par\\par
{\\f2\\fs26\\b\\cf2 EMAIL #1: INTRODUCTION\\par}
{\\f2\\fs24\\b\\cf6 Subject:} {\\f1\\fs24 Transform Your Marketing with AI (Exclusive Offer Inside)\\par}
\\par
{\\f1\\fs24 Hi [PROSPECT NAME],\\par}
\\par
{\\f1\\fs24 I hope this email finds you well. I'm reaching out because I believe your business could benefit tremendously from the marketing automation revolution that's happening right now.\\par}
\\par
{\\f1\\fs24 I've recently started offering an AI-powered marketing automation platform that's helping businesses like yours:\\par}
\\par
{\\f1\\fs24 \\u9989? Generate 400% more qualified leads\\par}
{\\f1\\fs24 \\u9989? Automate email & SMS campaigns completely\\par}
{\\f1\\fs24 \\u9989? Track every prospect through a visual pipeline\\par}
{\\f1\\fs24 \\u9989? Build high-converting sales funnels with AI assistance\\par}
\\par
{\\f1\\fs24 The best part? As one of my preferred clients, you get exclusive pricing:\\par}
{\\f1\\fs24 \\u128176? Basic Plan: $${customPricing.basicPlan.price}/month (normally $97)\\par}
{\\f1\\fs24 \\u128176? Professional: $${customPricing.proPlan.price}/month (normally $197)\\par}
\\par
{\\f1\\fs24 This exclusive pricing is only available through my direct referral link:\\par}
{\\f1\\fs22\\cf2 ${partnerLink}\\par}
\\par
{\\f1\\fs24 Would you be interested in a 15-minute demo to see how this could transform your marketing results?\\par}
\\par
{\\f1\\fs24 Best regards,\\par}
{\\f1\\fs24 [YOUR NAME]\\par}
{\\f1\\fs24 [YOUR TITLE]\\par}
{\\f1\\fs24 [YOUR CONTACT INFO]\\par}
\\par\\par
{\\f2\\fs26\\b\\cf2 EMAIL #2: FOLLOW-UP (Send 3 days later)\\par}
{\\f2\\fs24\\b\\cf6 Subject:} {\\f1\\fs24 Quick question about your lead generation\\par}
\\par
{\\f1\\fs24 Hi [PROSPECT NAME],\\par}
\\par
{\\f1\\fs24 I wanted to follow up on my previous email about the AI marketing automation platform.\\par}
\\par
{\\f1\\fs24\\b Quick question: What's your biggest challenge with lead generation right now?\\par}
\\par
{\\f1\\fs24 I ask because this platform specifically solves the most common issues I see with my clients:\\par}
{\\f1\\fs24 \\u8226? Inconsistent lead flow month-to-month\\par}
{\\f1\\fs24 \\u8226? Manual, time-consuming marketing processes\\par}
{\\f1\\fs24 \\u8226? Poor lead quality and low conversion rates\\par}
{\\f1\\fs24 \\u8226? Lack of systematic follow-up\\par}
\\par
{\\f1\\fs24 If any of these sound familiar, I'd love to show you how other businesses in [THEIR INDUSTRY] have solved them.\\par}
\\par
{\\f1\\fs24 The exclusive pricing I mentioned is still available: }{\\f1\\fs22\\cf2 ${partnerLink}\\par}
\\par
{\\f1\\fs24 Even if you're not ready to move forward now, I'm happy to answer any questions about marketing automation.\\par}
\\par
{\\f1\\fs24 Best,\\par}
{\\f1\\fs24 [YOUR NAME]\\par}
\\par\\par
{\\f2\\fs26\\b\\cf2 EMAIL #3: SOCIAL PROOF (Send 1 week later)\\par}
{\\f2\\fs24\\b\\cf6 Subject:} {\\f1\\fs24 Case study: How [BUSINESS TYPE] increased leads by 400%\\par}
\\par
{\\f1\\fs24 Hi [PROSPECT NAME],\\par}
\\par
{\\f1\\fs24 I wanted to share a quick success story that might interest you.\\par}
\\par
{\\f1\\fs24 One of my clients, a [SIMILAR BUSINESS TYPE], was struggling with:\\par}
{\\f1\\fs24 - Inconsistent lead generation (some months good, some terrible)\\par}
{\\f1\\fs24 - Spending hours every day on manual outreach\\par}
{\\f1\\fs24 - Poor conversion rates from their marketing efforts\\par}
\\par
{\\f1\\fs24\\b After implementing this AI marketing platform, here's what happened in just 60 days:\\par}
{\\f1\\fs24\\cf3 \\u128200? 400% increase in qualified leads\\par}
{\\f1\\fs24\\cf3 \\u128200? 80% reduction in time spent on marketing tasks\\par}
{\\f1\\fs24\\cf3 \\u128200? 3x improvement in conversion rates\\par}
\\par
{\\f1\\fs24 The platform's AI automation now handles:\\par}
{\\f1\\fs24 \\u9989? Lead prospecting and qualification\\par}
{\\f1\\fs24 \\u9989? Personalized email sequence delivery\\par}
{\\f1\\fs24 \\u9989? Follow-up scheduling and reminders\\par}
{\\f1\\fs24 \\u9989? Complete pipeline management\\par}
\\par
{\\f1\\fs24 Your exclusive pricing is still available: }{\\f1\\fs22\\cf2 ${partnerLink}\\par}
\\par
{\\f1\\fs24 Would you like to see exactly how this could work for your business? I can show you in just 15 minutes.\\par}
\\par
{\\f1\\fs24 Best regards,\\par}
{\\f1\\fs24 [YOUR NAME]\\par}
\\par\\par
{\\f2\\fs26\\b\\cf2 EMAIL #4: FINAL FOLLOW-UP\\par}
{\\f2\\fs24\\b\\cf6 Subject:} {\\f1\\fs24 Last chance for exclusive AI marketing platform pricing\\par}
\\par
{\\f1\\fs24 Hi [PROSPECT NAME],\\par}
\\par
{\\f1\\fs24 I don't want to keep bothering you, so this will be my last email about the AI marketing automation opportunity.\\par}
\\par
{\\f1\\fs24 I genuinely believe this platform could transform your marketing results, and I wanted to make sure you didn't miss out on the exclusive pricing I arranged for my network:\\par}
\\par
{\\f1\\fs24\\b\\cf4 \\u128176? $${customPricing.basicPlan.price}/month instead of $97 (${Math.round((1 - customPricing.basicPlan.price/97) * 100)}% savings!)\\par}
\\par
{\\f1\\fs24 If you're interested, here's your exclusive link: }{\\f1\\fs22\\cf2 ${partnerLink}\\par}
\\par
{\\f1\\fs24 If not, no worries at all. I hope we can connect about other opportunities in the future.\\par}
\\par
{\\f1\\fs24 Best of luck with your business growth!\\par}
\\par
{\\f1\\fs24 [YOUR NAME]\\par}
{\\f1\\fs24 [YOUR CONTACT INFO]\\par}
\\par\\par
{\\f2\\fs28\\b\\cf2 BONUS: SMS TEMPLATES\\par}
\\par
{\\f2\\fs24\\b\\cf6 SMS #1:\\par}
{\\f1\\fs24 "Hi [NAME], it's [YOUR NAME]. Got you exclusive access to AI marketing automation - $${customPricing.basicPlan.price}/mo (normally $97). Interested in 15-min demo? ${partnerLink}"\\par}
\\par
{\\f2\\fs24\\b\\cf6 SMS #2:\\par}
{\\f1\\fs24 "[NAME], quick follow-up on the AI marketing platform. My other clients are seeing 400% lead increases. Your exclusive pricing expires soon: ${partnerLink}"\\par}
\\par
{\\f2\\fs24\\b\\cf6 SMS #3:\\par}
{\\f1\\fs24 "Hi [NAME], [YOUR NAME] here. Quick question - what's your biggest marketing challenge right now? I might have a solution that could help."\\par}
\\par\\par
{\\f2\\fs28\\b\\cf2 EMAIL BEST PRACTICES:\\par}
\\par
{\\f2\\fs24\\b\\cf6 TIMING:\\par}
{\\f1\\fs24 - Send emails Tuesday-Thursday\\par}
{\\f1\\fs24 - Best times: 10am-2pm or 6pm-8pm\\par}
{\\f1\\fs24 - Wait 3-7 days between follow-ups\\par}
{\\f1\\fs24 - Don't give up after 1-2 emails\\par}
\\par
{\\f2\\fs24\\b\\cf6 PERSONALIZATION:\\par}
{\\f1\\fs24 - Always use their actual name\\par}
{\\f1\\fs24 - Reference their business/industry\\par}
{\\f1\\fs24 - Mention specific pain points for their sector\\par}
{\\f1\\fs24 - Include mutual connections if possible\\par}
\\par
{\\f2\\fs24\\b\\cf6 FOLLOW-UP STRATEGY:\\par}
{\\f1\\fs24 - Email 1: Introduction & value proposition\\par}
{\\f1\\fs24 - Email 2: Pain point focus\\par}
{\\f1\\fs24 - Email 3: Social proof & case study\\par}
{\\f1\\fs24 - Email 4: Final opportunity\\par}
{\\f1\\fs24 - Then move to other channels (phone, LinkedIn, etc.)\\par}
\\par\\par
{\\f2\\fs26\\b\\cf3 INSTRUCTIONS FOR USE:\\par}
{\\f1\\fs24 1. Replace [YOUR COMPANY NAME] with your business name\\par}
{\\f1\\fs24 2. Replace [YOUR NAME] and contact info with your details\\par}
{\\f1\\fs24 3. Replace [PROSPECT NAME] with actual prospect names\\par}
{\\f1\\fs24 4. Customize [THEIR INDUSTRY] and pain points for each prospect\\par}
{\\f1\\fs24 5. Send emails 3-7 days apart for best results\\par}
{\\f1\\fs24 6. Track opens and responses to optimize timing\\par}
\\par
{\\f2\\fs24\\b Your Partner Reference Code: }{\\f1\\fs24\\cf2 ${partnerCode}\\par}
{\\f2\\fs24\\b Your Exclusive Signup Link: }{\\f1\\fs22\\cf2 ${partnerLink}\\par}
\\par\\par
{\\f1\\fs24\\b\\i Remember: This is YOUR business. Present yourself as the marketing automation expert, not a reseller. You are providing a valuable service to help businesses grow.\\par}
}`;

    const blob = new Blob([emailTemplates], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Email-Templates-${partnerCode}.rtf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Email templates downloaded! Now with 12pt font and compact 2-3 space sections.');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen p-8 flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading WhiteLabel dashboard...</p>
        </div>
      </div>
    );
  }

  // Access denied for non-lifetime/founder users - but ALWAYS allow founder email
  if (!hasWhiteLabelAccess && user?.email !== 'dubdproducts@gmail.com') {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-xl text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">🚀 WhiteLabel SaaS Opportunity</h1>
            <p className="text-xl opacity-90">Exclusive to Lifetime & Founder Members</p>
          </div>

          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow-lg p-8 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>💰 Revenue Potential</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>50 customers @ $47/month:</span>
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$2,350/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Annual revenue potential:</span>
                    <span className="font-bold text-green-600">$28,200/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Your share (85%):</span>
                    <span className="font-bold text-blue-600">$23,970/year</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>🎯 What You Get</h2>
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
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#38beba' }}>
            WhiteLabel SaaS Management
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Build your branded SaaS empire with MarketGenie's WhiteLabel program</p>
        </div>

        {/* Partner Status */}
        {!isPartner ? (
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow-lg p-8 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Become a WhiteLabel Partner</h2>
              <p className={`mb-6 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Join our exclusive WhiteLabel program and start your own branded SaaS business. 
                Pay $497 licensing fee and keep 85% of all revenue from your customers.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50'}`}>
                  <div className="text-2xl font-bold text-purple-600">$497</div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>One-time licensing fee</div>
                </div>
                
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-50'}`}>
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Revenue share for you</div>
                </div>
                
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50'}`}>
                  <div className="text-2xl font-bold text-blue-600">15%</div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Royalty to MarketGenie</div>
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
              <div className={`shadow-lg rounded-xl p-6 text-center ${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'}`}>
                <div className="text-3xl mb-2">👥</div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{partnerData?.metrics?.totalCustomers || 0}</div>
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Customers</div>
              </div>
              
              <div className={`shadow-lg rounded-xl p-6 text-center ${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'}`}>
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold text-green-600">${partnerData?.metrics?.monthlyRevenue?.toFixed(2) || '0.00'}</div>
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Revenue</div>
              </div>
              
              <div className={`shadow-lg rounded-xl p-6 text-center ${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'}`}>
                <div className="text-3xl mb-2">🏦</div>
                <div className="text-2xl font-bold text-blue-600">${(partnerData?.metrics?.monthlyRevenue * 0.85)?.toFixed(2) || '0.00'}</div>
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your Share (85%)</div>
              </div>
              
              <div className={`shadow-lg rounded-xl p-6 text-center ${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'}`}>
                <div className="text-3xl mb-2">📊</div>
                <div className="text-2xl font-bold text-purple-600">${partnerData?.metrics?.royaltyOwed?.toFixed(2) || '0.00'}</div>
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Royalty Due (15%)</div>
              </div>
            </div>

            {/* Plan Status - Show current plan instead of upgrade options for White Label users */}
            <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700' : 'bg-gradient-to-r from-green-50 to-emerald-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>🎉 Active White Label License</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>You have full access to all White Label features and revenue opportunities</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 mb-1">LIFETIME</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>+ White Label Rights</div>
                </div>
              </div>
            </div>

            {/* Partner Controls */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Partner Sales Center - Expanded */}
              <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>💼 Partner Sales Center</h3>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Create custom pricing and signup links for your customers</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <button 
                    onClick={handleGenerateSignupLinks}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-center"
                  >
                    🔗 Generate Signup Links
                  </button>
                  <button 
                    onClick={handleSetCustomPricing}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-center"
                  >
                    💰 Set Custom Pricing
                  </button>
                </div>
                <button 
                  onClick={handleViewSalesFunnel}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  🏗️ Your Sales Funnel Builder
                </button>
              </div>

              {/* Quick Stats Summary */}
              <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>📊 Quick Overview</h3>
                <div className="space-y-4">
                  <div className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50'}`}>
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Customers</span>
                    <span className="font-bold text-blue-600">{partnerData?.metrics?.totalCustomers || 0}</span>
                  </div>
                  <div className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-50'}`}>
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Monthly Revenue</span>
                    <span className="font-bold text-green-600">${partnerData?.metrics?.monthlyRevenue?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50'}`}>
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your Share (85%)</span>
                    <span className="font-bold text-purple-600">${((partnerData?.metrics?.monthlyRevenue || 0) * 0.85).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Marketing Resources */}
            <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>📈 Partner Marketing Center</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>🎯 Sales Materials</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={downloadSalesDeck}
                      className={`w-full text-left p-3 rounded-lg transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      📄 Download Sales Deck
                    </button>
                    <button 
                      onClick={downloadMarketingGraphics}
                      className={`w-full text-left p-3 rounded-lg transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      🎨 Marketing Graphics
                    </button>
                    <button 
                      onClick={downloadEmailTemplates}
                      className={`w-full text-left p-3 rounded-lg transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      📧 Email Templates
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>🔗 Referral Tools</h4>
                  <div className="space-y-2">
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50'}`}>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your Partner Code:</div>
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
            </div>

            {/* Revenue Timeline */}
            <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>💳 Revenue & Payments</h3>
              <div className={`border rounded-lg p-4 mb-4 ${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}>
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>Next royalty payment due:</span>
                  <span className="font-bold text-green-600">
                    ${partnerData?.metrics?.royaltyOwed?.toFixed(2) || '0.00'} on {partnerData?.metrics?.nextPaymentDate?.toLocaleDateString() || 'TBD'}
                  </span>
                </div>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Royalty payments are automatically deducted from your Stripe account monthly via Stripe Connect.
              </p>
            </div>
          </div>
        )}

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white'}`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>WhiteLabel Partnership Application</h2>
                  <button 
                    onClick={() => setShowApplicationForm(false)}
                    className={`text-2xl ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
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

        {/* White Label Sales Funnel Builder */}
        {showFunnelBuilder && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="min-h-screen">
              <div className="flex justify-between items-center p-6 bg-white border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">🏗️ Your Sales Funnel Builder</h1>
                <button 
                  onClick={() => setShowFunnelBuilder(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <div className="p-6">
                <WhiteLabelFunnelBuilder />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhiteLabelDashboard;