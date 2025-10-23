import React from 'react';
import { Crown, Star, Infinity, Shield, Zap, Users, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

const LifetimePlanPage = () => {
  const handleGetLifetimeAccess = () => {
    // Direct redirect to Stripe payment link
    window.location.href = 'https://buy.stripe.com/test_aFa14n7zj6rybGkeKhaVa06';
  };

  const features = [
    {
      icon: Crown,
      title: 'WhiteLabel Rights Included',
      description: 'Full access to resell MarketGenie under your own brand with 85% revenue share',
      highlight: true
    },
    {
      icon: Infinity,
      title: 'Unlimited Everything',
      description: 'No limits on campaigns, contacts, AI usage, or integrations',
      highlight: true
    },
    {
      icon: Shield,
      title: 'Full API Access',
      description: 'Complete API access for custom integrations and advanced automation',
      highlight: false
    },
    {
      icon: Star,
      title: 'Beta Features First',
      description: 'Get exclusive early access to all new features and experiments',
      highlight: false
    },
    {
      icon: Users,
      title: 'Dedicated Support',
      description: 'Direct line to our development team with priority support',
      highlight: false
    },
    {
      icon: TrendingUp,
      title: 'Revenue Opportunities',
      description: 'Monetize through WhiteLabel partnerships and affiliate referrals',
      highlight: true
    }
  ];

  const includedFeatures = [
    'Advanced CRM with automation',
    'AI Swarm Technology (multiple AI agents)',
    'Custom funnel builder',
    'Advanced analytics & reporting',
    'Priority integrations with major platforms',
    'Custom branding options',
    'Unlimited campaigns & contacts',
    'WhiteLabel licensing rights',
    'API access for developers',
    'Beta feature access',
    'Dedicated support channel',
    'Revenue sharing opportunities'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-yellow-500 opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Crown className="h-20 w-20 text-purple-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              MarketGenie
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-yellow-500">
                {' '}Lifetime
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get lifetime access to all premium features, WhiteLabel rights, and unlimited usage for one low price
            </p>
            
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">$300</div>
                <div className="text-lg text-gray-500 line-through mb-2">$1,200+ value</div>
                <div className="text-green-600 font-semibold text-lg mb-4">Save $900+</div>
                <div className="text-sm text-gray-600 mb-6">One-time payment • No monthly fees • Forever</div>
                <button
                  onClick={handleGetLifetimeAccess}
                  className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Get Lifetime Access Now
                </button>
                <div className="text-xs text-gray-500 mt-2">Secure payment via Stripe</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Get With Lifetime Access
          </h2>
          <p className="text-xl text-gray-600">
            Premium features that normally cost $20-50/month, yours forever
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`rounded-2xl p-8 transition-all duration-200 hover:transform hover:scale-105 ${
                feature.highlight 
                  ? 'bg-gradient-to-br from-purple-100 to-yellow-100 border-2 border-purple-200' 
                  : 'bg-white shadow-lg hover:shadow-xl'
              }`}
            >
              <feature.icon className={`h-12 w-12 mb-4 ${feature.highlight ? 'text-purple-600' : 'text-gray-700'}`} />
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              {feature.highlight && (
                <div className="mt-4 inline-block bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Premium Feature
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Included Features List */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Complete Feature List Included
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {includedFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WhiteLabel Highlight */}
        <div className="bg-gradient-to-r from-purple-600 to-yellow-500 rounded-2xl p-8 text-white text-center mb-16">
          <Crown className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            🎯 WhiteLabel Rights Included!
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Resell MarketGenie under your own brand and keep 85% of revenue. 
            Turn your $300 investment into a recurring income stream!
          </p>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 max-w-md mx-auto">
            <div className="text-sm opacity-80">Potential Monthly Revenue</div>
            <div className="text-3xl font-bold">$2,000 - $10,000+</div>
            <div className="text-sm opacity-80">Based on 10-50 customers at $20/month</div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of marketers who've already upgraded to Lifetime access. 
            No monthly fees, no limits, no worries.
          </p>
          <button
            onClick={handleGetLifetimeAccess}
            className="bg-gradient-to-r from-purple-600 to-yellow-500 text-white py-4 px-12 rounded-xl font-bold text-xl hover:from-purple-700 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 shadow-xl"
          >
            Get Lifetime Access - $300
            <ArrowRight className="ml-2 h-5 w-5 inline" />
          </button>
          <div className="text-sm text-gray-500 mt-4">
            30-day money-back guarantee • Secure payment via Stripe
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Priority Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifetimePlanPage;