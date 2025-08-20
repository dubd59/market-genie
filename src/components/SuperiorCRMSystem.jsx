import React, { useState } from 'react';

const SuperiorCRMSystem = () => {
  const [leads, setLeads] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      company: 'TechStart Inc',
      email: 'sarah@techstart.com',
      phone: '+1-555-0123',
      source: 'LinkedIn',
      score: 95,
      stage: 'Hot Lead',
      value: '$45,000',
      lastContact: '2 hours ago',
      nextAction: 'Demo scheduled',
      aiInsights: 'High buying intent - mentioned budget approval',
      socialActivity: 'Active on LinkedIn, recently posted about scaling challenges'
    },
    {
      id: 2,
      name: 'Michael Chen',
      company: 'Growth Corp',
      email: 'michael@growthcorp.com',
      phone: '+1-555-0124',
      source: 'Facebook',
      score: 87,
      stage: 'Qualified',
      value: '$32,000',
      lastContact: '45 minutes ago',
      nextAction: 'Send proposal',
      aiInsights: 'Decision maker, comparing 3 solutions',
      socialActivity: 'Shared competitor content, engaged with our posts'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      company: 'Scale Solutions',
      email: 'emily@scalesolutions.com',
      phone: '+1-555-0125',
      source: 'Instagram',
      score: 92,
      stage: 'Negotiation',
      value: '$67,500',
      lastContact: '1 hour ago',
      nextAction: 'Contract review',
      aiInsights: 'Ready to close, waiting on legal approval',
      socialActivity: 'Following our content, high engagement rates'
    },
    {
      id: 4,
      name: 'David Kim',
      company: 'Innovation Labs',
      email: 'david@innovationlabs.com',
      phone: '+1-555-0126',
      source: 'YouTube',
      score: 78,
      stage: 'Nurturing',
      value: '$23,000',
      lastContact: '3 hours ago',
      nextAction: 'Educational content',
      aiInsights: 'Early in buying cycle, needs education',
      socialActivity: 'Subscribed to channel, watches competitor content'
    }
  ]);

  const [pipelineStats] = useState({
    totalValue: '$1,247,500',
    closedDeals: '$324,750',
    activeDeals: 47,
    conversionRate: 23.5,
    avgDealSize: '$38,250',
    salesCycle: '18 days'
  });

  const [automationRules] = useState([
    {
      name: 'High-Score Lead Alert',
      trigger: 'Lead score > 90',
      action: 'Instant notification + auto-assign to top rep',
      status: 'Active',
      triggered: 23
    },
    {
      name: 'Social Engagement Follow-up',
      trigger: 'Social media interaction',
      action: 'Send personalized message within 30 minutes',
      status: 'Active',
      triggered: 156
    },
    {
      name: 'Proposal Follow-up',
      trigger: '48 hours after proposal sent',
      action: 'AI-crafted follow-up email + calendar link',
      status: 'Active',
      triggered: 34
    },
    {
      name: 'Contract Reminder',
      trigger: 'Contract pending > 5 days',
      action: 'Escalate to manager + priority flag',
      status: 'Active',
      triggered: 8
    }
  ]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-red-600 bg-red-100';
    if (score >= 80) return 'text-orange-600 bg-orange-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStageColor = (stage) => {
    switch(stage) {
      case 'Hot Lead': return 'bg-red-500';
      case 'Qualified': return 'bg-orange-500';
      case 'Negotiation': return 'bg-blue-500';
      case 'Nurturing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-indigo-800 flex items-center gap-3">
            <span className="text-3xl">👥</span>
            Superior CRM System
          </h3>
          <p className="text-gray-600 mt-1">HighLevel CRM on steroids with AI insights and social media intelligence</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Pipeline Value</div>
          <div className="text-2xl font-bold text-indigo-600">{pipelineStats.totalValue}</div>
          <div className="text-xs text-gray-500">{pipelineStats.conversionRate}% conversion rate</div>
        </div>
      </div>

      {/* CRM Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
          <div className="text-xs text-green-600 font-medium">CLOSED DEALS</div>
          <div className="text-lg font-bold text-green-800">{pipelineStats.closedDeals}</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
          <div className="text-xs text-blue-600 font-medium">ACTIVE DEALS</div>
          <div className="text-lg font-bold text-blue-800">{pipelineStats.activeDeals}</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-200">
          <div className="text-xs text-purple-600 font-medium">CONVERSION</div>
          <div className="text-lg font-bold text-purple-800">{pipelineStats.conversionRate}%</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
          <div className="text-xs text-orange-600 font-medium">AVG DEAL</div>
          <div className="text-lg font-bold text-orange-800">{pipelineStats.avgDealSize}</div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3 border border-red-200">
          <div className="text-xs text-red-600 font-medium">SALES CYCLE</div>
          <div className="text-lg font-bold text-red-800">{pipelineStats.salesCycle}</div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-200">
          <div className="text-xs text-indigo-600 font-medium">AI INSIGHTS</div>
          <div className="text-lg font-bold text-indigo-800">247</div>
        </div>
      </div>

      {/* Advanced Lead Management */}
      <div className="mb-8">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">High-Value Leads with AI Insights</h4>
        <div className="space-y-4">
          {leads.map(lead => (
            <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="font-semibold text-gray-900">{lead.name}</h5>
                    <span className="text-gray-600">• {lead.company}</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                      {lead.score} Score
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStageColor(lead.stage)}`}></div>
                    <span className="text-xs font-medium">{lead.stage}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Contact Info</div>
                      <div>{lead.email} • {lead.phone}</div>
                      <div className="text-gray-500 mt-1">Source: {lead.source}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Deal Info</div>
                      <div className="font-medium text-green-600">{lead.value}</div>
                      <div className="text-gray-500 mt-1">Last contact: {lead.lastContact}</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600">{lead.nextAction}</div>
                  <div className="flex gap-2 mt-2">
                    <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200 transition-colors">
                      Contact
                    </button>
                    <button className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200 transition-colors">
                      Update
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-purple-50 rounded-lg p-3 mb-3 border border-purple-200">
                <div className="text-xs font-medium text-purple-800 mb-1">🤖 AI INSIGHTS</div>
                <div className="text-sm text-purple-700">{lead.aiInsights}</div>
              </div>

              {/* Social Activity */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-xs font-medium text-blue-800 mb-1">📱 SOCIAL ACTIVITY</div>
                <div className="text-sm text-blue-700">{lead.socialActivity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automation Rules */}
      <div className="mb-6">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Automation Rules</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automationRules.map((rule, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium text-gray-900">{rule.name}</h5>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{rule.status}</span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <div><strong>Trigger:</strong> {rule.trigger}</div>
                <div><strong>Action:</strong> {rule.action}</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-blue-600">Triggered {rule.triggered} times today</div>
                <button className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs hover:bg-indigo-200 transition-colors">
                  Edit Rule
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5 border border-indigo-200 mb-6">
        <h4 className="font-semibold text-indigo-800 mb-3">🚀 Advanced CRM Features (Beyond HighLevel)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border border-indigo-200">
            <h5 className="font-medium text-gray-900 mb-2">🤖 Predictive Lead Scoring</h5>
            <p className="text-sm text-gray-600">AI analyzes 200+ data points to predict closing probability</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <h5 className="font-medium text-gray-900 mb-2">📱 Social Media Intelligence</h5>
            <p className="text-sm text-gray-600">Real-time tracking of prospect activity across all platforms</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <h5 className="font-medium text-gray-900 mb-2">💬 AI Conversation Analysis</h5>
            <p className="text-sm text-gray-600">Sentiment analysis and next-best-action recommendations</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <h5 className="font-medium text-gray-900 mb-2">⚡ Instant Personalization</h5>
            <p className="text-sm text-gray-600">Dynamic content based on social data and behavior</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <h5 className="font-medium text-gray-900 mb-2">🎯 Cross-Platform Attribution</h5>
            <p className="text-sm text-gray-600">Track customer journey across all touchpoints</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <h5 className="font-medium text-gray-900 mb-2">🔮 Revenue Forecasting</h5>
            <p className="text-sm text-gray-600">AI-powered revenue predictions with 95% accuracy</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {leads.length} high-value leads • {pipelineStats.totalValue} pipeline • {automationRules.length} automation rules active
        </div>
        <div className="flex gap-3">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Add Lead
          </button>
          <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
            AI Insights
          </button>
          <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperiorCRMSystem;
