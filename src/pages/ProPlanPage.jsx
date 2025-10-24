import React from 'react';
import { Zap, Star, CheckCircle, ArrowRight, TrendingUp, Shield, Users } from 'lucide-react';

const ProPlanPage = () => {
  const handleGetProAccess = () => {
    // Direct redirect to Stripe payment link
    window.location.href = 'https://buy.stripe.com/test_cNibJ16vfdU08u89pXaVa05';
  };

  const features = [
    {
      icon: Star,
      title: 'AI Swarm Technology',
      description: 'Multiple AI agents working together on your marketing campaigns',
      highlight: true
    },
    {
      icon: TrendingUp,
      title: 'Advanced CRM',
      description: 'Complete customer relationship management with automation workflows',
      highlight: true
    },
    {
      icon: Shield,
      title: 'Premium Integrations',
      description: 'Connect with top marketing tools and platforms seamlessly',
      highlight: false
    },
    {
      icon: Users,
      title: 'Priority Support',
      description: '24/7 premium support with faster response times',
      highlight: false
    },
    {
      icon: Zap,
      title: 'Custom Funnels',
      description: 'Build unlimited custom marketing funnels with advanced features',
      highlight: true
    },
    {
      icon: CheckCircle,
      title: 'Advanced Analytics',
      description: 'Deep insights and reporting to optimize your marketing performance',
      highlight: false
    }
  ];

  const includedFeatures = [
    'Everything in Free plan',
    'AI Swarm Technology (multiple AI agents)',
    'Advanced CRM with automation',
    'Custom funnel builder',
    'Advanced analytics & reporting',
    'Premium integrations (Zapier, HubSpot, etc.)',
    'Priority customer support',
    'Advanced lead scoring',
    'Custom email templates',
    'A/B testing capabilities',
    'Advanced segmentation',
    'Marketing automation workflows'
  ];

  const comparisonData = [
    { feature: 'AI Agents', free: '1 Basic', pro: 'AI Swarm (Multiple)' },
    { feature: 'Campaigns', free: '3 per month', pro: 'Unlimited' },
    { feature: 'Contacts', free: '100', pro: 'Unlimited' },
    { feature: 'Integrations', free: 'Basic (5)', pro: 'Premium (50+)' },
    { feature: 'Support', free: 'Community', pro: '24/7 Priority' },
    { feature: 'Funnels', free: 'Templates only', pro: 'Custom builder' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-500 opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Zap className="h-20 w-20 text-blue-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              MarketGenie
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500">
                {' '}Pro
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Unlock the full power of AI marketing with advanced features, unlimited usage, and priority support
            </p>
            
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">$20</div>
                <div className="text-lg text-gray-500 mb-2">per month</div>
                <div className="text-green-600 font-semibold text-lg mb-4">Cancel anytime</div>
                <div className="text-sm text-gray-600 mb-6">Billed monthly • No setup fees</div>
                <button
                  onClick={handleGetProAccess}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-500 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Start Pro Now - $20/month
                </button>
                <div className="text-xs text-gray-500 mt-2">Monthly subscription • Cancel anytime • Secure payment via Stripe</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pro Features That Drive Real Results
          </h2>
          <p className="text-xl text-gray-600">
            Advanced AI marketing tools used by successful businesses
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`rounded-2xl p-8 transition-all duration-200 hover:transform hover:scale-105 ${
                feature.highlight 
                  ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-200' 
                  : 'bg-white shadow-lg hover:shadow-xl'
              }`}
            >
              <feature.icon className={`h-12 w-12 mb-4 ${feature.highlight ? 'text-blue-600' : 'text-gray-700'}`} />
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              {feature.highlight && (
                <div className="mt-4 inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Pro Feature
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Free vs Pro Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-500">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-blue-600">Pro</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-4 px-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-gray-500">{row.free}</td>
                    <td className="py-4 px-4 text-center text-blue-600 font-semibold">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Included Features List */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Everything Included in Pro
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

        {/* ROI Highlight */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-500 rounded-2xl p-8 text-white text-center mb-16">
          <TrendingUp className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            📈 See Real ROI in 30 Days
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Pro users typically see 3-5x improvement in campaign performance 
            and 50% time savings on marketing tasks.
          </p>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 max-w-md mx-auto">
            <div className="text-sm opacity-80">Average Monthly Savings</div>
            <div className="text-3xl font-bold">$500 - $2,000</div>
            <div className="text-sm opacity-80">In time and improved conversions</div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Start Your Pro Journey Today
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join successful marketers who've upgraded to Pro. Get started with full access immediately.
          </p>
          <button
            onClick={handleGetProAccess}
            className="bg-gradient-to-r from-blue-600 to-purple-500 text-white py-4 px-12 rounded-xl font-bold text-xl hover:from-blue-700 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-xl"
          >
            Get Pro Access - $20/month
            <ArrowRight className="ml-2 h-5 w-5 inline" />
          </button>
          <div className="text-sm text-gray-500 mt-4">
            Monthly subscription • Cancel anytime • Secure payment via Stripe
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1,000+</div>
              <div className="text-gray-600">Pro Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">5x</div>
              <div className="text-gray-600">Better Performance</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Priority Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">$20</div>
              <div className="text-gray-600">Monthly Plan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProPlanPage;