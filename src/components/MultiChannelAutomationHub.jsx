import React, { useState } from 'react';

const MultiChannelAutomationHub = () => {
  const [activeAutomations, setActiveAutomations] = useState([
    {
      id: 1,
      name: 'Omnichannel Lead Nurture Sequence',
      channels: ['Email', 'SMS', 'Social DM', 'WhatsApp', 'Voice'],
      status: 'running',
      leadsInSequence: 1247,
      conversionRate: 34.7,
      revenue: '$387,500',
      avgEngagement: 89,
      icon: '🌐'
    },
    {
      id: 2,
      name: 'Social Media Engagement Amplifier',
      channels: ['LinkedIn', 'Twitter/X', 'Instagram', 'TikTok'],
      status: 'running',
      leadsInSequence: 892,
      conversionRate: 28.3,
      revenue: '$156,000',
      avgEngagement: 76,
      icon: '📱'
    },
    {
      id: 3,
      name: 'High-Ticket Sales Automation',
      channels: ['Email', 'Calendar', 'Video', 'Voice', 'CRM'],
      status: 'running',
      leadsInSequence: 234,
      conversionRate: 67.8,
      revenue: '$847,500',
      avgEngagement: 94,
      icon: '💎'
    },
    {
      id: 4,
      name: 'Abandoned Cart Recovery Pro',
      channels: ['Email', 'SMS', 'Push', 'Retargeting', 'Messenger'],
      status: 'running',
      leadsInSequence: 2156,
      conversionRate: 42.1,
      revenue: '$298,750',
      avgEngagement: 67,
      icon: '🛒'
    },
    {
      id: 5,
      name: 'Event Registration & Follow-up',
      channels: ['Email', 'SMS', 'Calendar', 'Social', 'Video'],
      status: 'running',
      leadsInSequence: 756,
      conversionRate: 78.9,
      revenue: '$189,000',
      avgEngagement: 91,
      icon: '🎯'
    }
  ]);

  const [advancedFeatures] = useState([
    {
      name: 'AI Response Generation',
      description: 'GPT-4 powered personalized responses across all channels',
      channels: 'All',
      impact: '+67% engagement',
      icon: '🤖'
    },
    {
      name: 'Cross-Channel Attribution',
      description: 'Track customer journey across 15+ touchpoints',
      channels: 'All',
      impact: '+45% ROI visibility',
      icon: '🔍'
    },
    {
      name: 'Predictive Channel Optimization',
      description: 'AI determines best channel per prospect automatically',
      channels: 'All',
      impact: '+38% conversion',
      icon: '🎯'
    },
    {
      name: 'Voice & Video Automation',
      description: 'AI-generated personalized voice and video messages',
      channels: 'Voice, Video',
      impact: '+124% response rate',
      icon: '🎬'
    },
    {
      name: 'Real-time Behavioral Triggers',
      description: 'Instant response to website, app, and social activity',
      channels: 'All',
      impact: '+89% relevance',
      icon: '⚡'
    },
    {
      name: 'Smart Send Time Optimization',
      description: 'AI predicts optimal contact time per individual',
      channels: 'Email, SMS',
      impact: '+56% open rates',
      icon: '⏰'
    }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'running': return 'bg-green-500 animate-pulse';
      case 'paused': return 'bg-yellow-500';
      case 'stopped': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTotalRevenue = () => {
    return activeAutomations.reduce((sum, automation) => {
      return sum + parseFloat(automation.revenue.replace('$', '').replace(',', ''));
    }, 0);
  };

  const getTotalLeads = () => {
    return activeAutomations.reduce((sum, automation) => sum + automation.leadsInSequence, 0);
  };

  const getAverageConversion = () => {
    return (activeAutomations.reduce((sum, automation) => sum + automation.conversionRate, 0) / activeAutomations.length).toFixed(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-orange-800 flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            Multi-Channel Automation Hub
          </h3>
          <p className="text-gray-600 mt-1">Beyond ClickFunnels & HighLevel - True omnichannel automation with AI orchestration</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Automation Revenue</div>
          <div className="text-2xl font-bold text-orange-600">${getTotalRevenue().toLocaleString()}</div>
          <div className="text-xs text-gray-500">{getTotalLeads().toLocaleString()} leads in sequences</div>
        </div>
      </div>

      {/* Automation Performance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-600 font-medium">Active Sequences</div>
          <div className="text-2xl font-bold text-green-800">{activeAutomations.length}</div>
          <div className="text-xs text-green-600">All AI-optimized</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Total Leads</div>
          <div className="text-2xl font-bold text-blue-800">{getTotalLeads().toLocaleString()}</div>
          <div className="text-xs text-blue-600">In automation</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-600 font-medium">Avg Conversion</div>
          <div className="text-2xl font-bold text-purple-800">{getAverageConversion()}%</div>
          <div className="text-xs text-purple-600">Cross-channel</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
          <div className="text-sm text-orange-600 font-medium">Channels Active</div>
          <div className="text-2xl font-bold text-orange-800">15+</div>
          <div className="text-xs text-orange-600">Synchronized</div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
          <div className="text-sm text-red-600 font-medium">AI Optimizations</div>
          <div className="text-2xl font-bold text-red-800">1,247</div>
          <div className="text-xs text-red-600">Today</div>
        </div>
      </div>

      {/* Active Automation Sequences */}
      <div className="mb-8">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">🔥 Live Automation Sequences</h4>
        <div className="space-y-4">
          {activeAutomations.map(automation => (
            <div key={automation.id} className="border border-gray-200 rounded-lg p-5 hover:border-orange-300 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{automation.icon}</span>
                    <h5 className="font-semibold text-gray-900">{automation.name}</h5>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(automation.status)}`}></div>
                    <span className="text-xs font-medium text-green-600">RUNNING</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {automation.channels.map((channel, idx) => (
                      <span key={idx} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        {channel}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Leads in Sequence</div>
                      <div className="font-bold text-blue-600">{automation.leadsInSequence.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Conversion Rate</div>
                      <div className="font-bold text-green-600">{automation.conversionRate}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Revenue Generated</div>
                      <div className="font-bold text-orange-600">{automation.revenue}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Engagement Score</div>
                      <div className="font-bold text-purple-600">{automation.avgEngagement}%</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200 transition-colors">
                    Optimize
                  </button>
                  <button className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200 transition-colors">
                    Analytics
                  </button>
                  <button className="bg-orange-100 text-orange-700 px-3 py-1 rounded text-xs hover:bg-orange-200 transition-colors">
                    Clone
                  </button>
                </div>
              </div>

              {/* Real-time Performance Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${automation.conversionRate}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">Performance trending upward with AI optimization</div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Features Beyond Competitors */}
      <div className="mb-6">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">🚀 Advanced Features (Unavailable in ClickFunnels/HighLevel)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advancedFeatures.map((feature, index) => (
            <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{feature.icon}</span>
                <h5 className="font-medium text-gray-900">{feature.name}</h5>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-orange-600 font-medium">IMPACT</div>
                  <div className="text-sm font-bold text-orange-700">{feature.impact}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {feature.channels}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Advantages */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-5 border border-orange-200 mb-6">
        <h4 className="font-semibold text-orange-800 mb-3">💪 Why We Crush ClickFunnels & HighLevel</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">🎯 vs ClickFunnels</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Multi-channel automation (not just email)</li>
              <li>• AI-powered optimization (not manual A/B testing)</li>
              <li>• Social media integration (beyond just landing pages)</li>
              <li>• Real-time behavioral triggers</li>
              <li>• Cross-platform attribution tracking</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">⚡ vs HighLevel</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Advanced AI automation (not basic workflows)</li>
              <li>• Social media scraping & intelligence</li>
              <li>• Predictive lead scoring & optimization</li>
              <li>• Voice & video automation capabilities</li>
              <li>• True omnichannel orchestration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {activeAutomations.length} sequences running • ${getTotalRevenue().toLocaleString()} automation revenue • {getAverageConversion()}% avg conversion
        </div>
        <div className="flex gap-3">
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Create Sequence
          </button>
          <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
            AI Optimizer
          </button>
          <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
            Performance Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiChannelAutomationHub;
