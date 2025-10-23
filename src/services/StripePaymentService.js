// StripePaymentService.js - Handle Stripe payment links and processing
class StripePaymentService {
  constructor() {
    this.isTestMode = true; // Toggle this for production
    
    // Test mode payment links
    this.testPaymentLinks = {
      pro: 'https://buy.stripe.com/test_cNibJ16vfdU08u89pXaVa05',
      lifetime: 'https://buy.stripe.com/test_aFa14n7zj6rybGkeKhaVa06', 
      whiteLabel: 'https://buy.stripe.com/test_8x2bJ16vfaHOcKoby5aVa07'
    };
    
    // Production payment links (to be updated when going live)
    this.livePaymentLinks = {
      pro: '', // Will be populated when going live
      lifetime: '',
      whiteLabel: ''
    };
    
    this.prices = {
      pro: 20, // $20/month
      lifetime: 300, // $300 one-time
      whiteLabel: 497 // $497 one-time
    };
  }

  // Get the appropriate payment link based on plan and mode
  getPaymentLink(planType) {
    const links = this.isTestMode ? this.testPaymentLinks : this.livePaymentLinks;
    return links[planType];
  }

  // Redirect to Stripe payment with user context
  async initiatePayment(planType, userContext = {}) {
    const paymentLink = this.getPaymentLink(planType);
    
    if (!paymentLink) {
      throw new Error(`Payment link not configured for plan: ${planType}`);
    }

    // Store user context for post-payment processing
    this.storePaymentContext(planType, userContext);
    
    // Create success URL with payment completion parameters - LIVE FIREBASE URLs
    const liveBaseUrl = 'https://market-genie-f2d41.web.app';
    const successUrl = `${liveBaseUrl}/whitelabel-setup?payment_success=true&payment_type=${planType}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${liveBaseUrl}/dashboard?payment_cancelled=true&payment_type=${planType}`;
    
    console.log(`💳 Redirecting to Stripe payment: ${planType} - $${this.prices[planType]}`);
    console.log(`📍 Live Success URL: ${successUrl}`);
    console.log(`📍 Live Cancel URL: ${cancelUrl}`);
    
    // Redirect to payment link - Update your Stripe payment links with these URLs:
    window.location.href = paymentLink;
    
    // LIVE URLS FOR STRIPE CONFIGURATION:
    // Success URL: ${successUrl}
    // Cancel URL: ${cancelUrl}
  }

  // Store payment context in localStorage for retrieval after redirect
  storePaymentContext(planType, userContext) {
    const paymentContext = {
      planType,
      userContext,
      timestamp: new Date().toISOString(),
      isTestMode: this.isTestMode
    };
    
    localStorage.setItem('marketgenie_payment_context', JSON.stringify(paymentContext));
  }

  // Retrieve payment context after redirect
  getPaymentContext() {
    try {
      const context = localStorage.getItem('marketgenie_payment_context');
      return context ? JSON.parse(context) : null;
    } catch (error) {
      console.error('Error retrieving payment context:', error);
      return null;
    }
  }

  // Clear payment context after processing
  clearPaymentContext() {
    localStorage.removeItem('marketgenie_payment_context');
  }

  // Handle successful WhiteLabel payment
  async processWhiteLabelPayment(paymentData) {
    console.log('✅ Processing WhiteLabel payment success:', paymentData);
    
    try {
      // Update user's plan and activate WhiteLabel features
      const updateData = {
        plan: 'whiteLabel',
        whiteLabel: true,
        paymentStatus: 'completed',
        paymentAmount: this.prices.whiteLabel,
        paymentDate: new Date(),
        activatedAt: new Date(),
        stripePaymentId: paymentData.paymentId || null
      };

      // In a real implementation, this would update Firebase
      console.log('🎯 WhiteLabel activation data:', updateData);
      
      // For now, store in localStorage as fallback
      localStorage.setItem('marketgenie_whitelabel_activated', JSON.stringify(updateData));
      
      return {
        success: true,
        message: 'WhiteLabel license activated successfully!',
        data: updateData
      };
      
    } catch (error) {
      console.error('❌ WhiteLabel payment processing failed:', error);
      return {
        success: false,
        message: 'Payment processing failed. Please contact support.',
        error: error.message
      };
    }
  }

  // Check if user has active WhiteLabel license
  hasWhiteLabelLicense(userContext) {
    // Check localStorage for offline/test mode
    const activation = localStorage.getItem('marketgenie_whitelabel_activated');
    if (activation) {
      try {
        const data = JSON.parse(activation);
        return data.paymentStatus === 'completed';
      } catch (error) {
        console.error('Error checking WhiteLabel license:', error);
      }
    }
    
    // Check user plan (from tenant context)
    return userContext?.plan === 'whiteLabel' || 
           userContext?.plan === 'founder' || 
           userContext?.whiteLabel === true;
  }

  // Get pricing info for display
  getPricingInfo(planType) {
    const prices = {
      pro: {
        amount: this.prices.pro,
        currency: 'USD',
        interval: 'month',
        description: 'Professional Plan - Monthly billing'
      },
      lifetime: {
        amount: this.prices.lifetime,
        currency: 'USD',
        interval: 'one-time',
        description: 'Lifetime Access - One-time payment'
      },
      whiteLabel: {
        amount: this.prices.whiteLabel,
        currency: 'USD',
        interval: 'one-time',
        description: 'WhiteLabel License + 15% revenue sharing'
      }
    };
    
    return prices[planType] || null;
  }

  // Switch between test and live mode
  setTestMode(isTest) {
    this.isTestMode = isTest;
    console.log(`💳 Stripe mode: ${isTest ? 'TEST' : 'LIVE'}`);
  }

  // Update live payment links when going to production
  setLivePaymentLinks(links) {
    this.livePaymentLinks = { ...this.livePaymentLinks, ...links };
    console.log('🔴 Live payment links updated');
  }
}

// Export singleton instance
export const stripePaymentService = new StripePaymentService();
export default stripePaymentService;