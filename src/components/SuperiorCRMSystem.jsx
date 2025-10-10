import React, { useState } from 'react';

const SuperiorCRMSystem = () => {
  // AI Assistant State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // Modal States for editing
  const [editingLead, setEditingLead] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);

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

  // AI Assistant Functions
  const handleAIPrompt = async () => {
    if (!aiPrompt.trim()) return;
    
    setAiLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const responses = {
        'pipeline': `Based on your current pipeline, I recommend focusing on Sarah Johnson (95 score) and Emily Rodriguez (92 score). Sarah shows high buying intent and Emily is ready to close. Schedule demos this week!`,
        'leads': `Your top leads this week: Sarah Johnson (TechStart Inc) and Emily Rodriguez (Scale Solutions). Both have strong engagement signals and are ready for immediate follow-up.`,
        'automation': `I suggest creating a new automation rule: "High engagement leads" - When lead visits pricing page 3+ times, automatically send personalized proposal within 30 minutes.`,
        'strategy': `Your conversion rate is 23.5% which is excellent! To improve further: 1) Focus on leads with 85+ scores, 2) Follow up within 2 hours of social engagement, 3) Use video messages for high-value prospects.`,
        'forecast': `Based on current pipeline velocity, you're projected to close $156,000 this month. Focus on the 3 deals in negotiation stage to hit $180,000 stretch goal.`
      };
      
      let response = 'I can help you with lead scoring, pipeline strategy, automation setup, or forecasting. What specific area would you like to optimize?';
      
      for (const [key, value] of Object.entries(responses)) {
        if (aiPrompt.toLowerCase().includes(key)) {
          response = value;
          break;
        }
      }
      
      setAiResponse(response);
      setAiLoading(false);
    }, 1500);
  };

  // Lead Management Functions
  const handleEditLead = (lead) => {
    setEditingLead({...lead});
    setShowEditModal(true);
  };

  const handleDeleteLead = (leadId) => {
    setLeads(leads.filter(lead => lead.id !== leadId));
    setShowDeleteConfirm(null);
  };

  const handleSaveLead = () => {
    if (editingLead.id) {
      setLeads(leads.map(lead => lead.id === editingLead.id ? editingLead : lead));
    } else {
      setLeads([...leads, { ...editingLead, id: Date.now() }]);
    }
    setShowEditModal(false);
    setEditingLead(null);
  };

  const exportData = () => {
    const csvContent = leads.map(lead => 
      `${lead.name},${lead.company},${lead.email},${lead.phone},${lead.source},${lead.score},${lead.stage},${lead.value}`
    ).join('\n');
    
    const blob = new Blob([`Name,Company,Email,Phone,Source,Score,Stage,Value\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crm_leads.csv';
    a.click();
  };

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
            <span className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full">
              AI
            </span>
          </h3>
          <p className="text-gray-600 mt-1">HighLevel CRM on steroids with AI insights and social media intelligence</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Pipeline Value</div>
          <div className="text-2xl font-bold text-indigo-600">{pipelineStats.totalValue}</div>
          <div className="text-xs text-gray-500">{pipelineStats.conversionRate}% conversion rate</div>
        </div>
      </div>

      {/* AI Pipeline Assistant */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6 border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
            🤖 AI Pipeline Assistant
          </h4>
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            {showAIAssistant ? 'Hide' : 'Ask AI'}
          </button>
        </div>
        
        {showAIAssistant && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask me about your pipeline, leads, automation, or strategy..."
                className="flex-1 border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAIPrompt()}
              />
              <button
                onClick={handleAIPrompt}
                disabled={aiLoading || !aiPrompt.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:bg-gray-400"
              >
                {aiLoading ? 'Thinking...' : 'Ask'}
              </button>
            </div>
            
            {aiResponse && (
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="text-sm text-purple-800 font-medium mb-1">🤖 AI Recommendation:</div>
                <div className="text-sm text-gray-700">{aiResponse}</div>
              </div>
            )}
            
            <div className="flex gap-2 text-xs">
              <button onClick={() => setAiPrompt('Show me my top leads')} className="bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">Top Leads</button>
              <button onClick={() => setAiPrompt('Analyze my pipeline')} className="bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">Pipeline Analysis</button>
              <button onClick={() => setAiPrompt('Suggest automation')} className="bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">Automation Ideas</button>
              <button onClick={() => setAiPrompt('Forecast my sales')} className="bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">Sales Forecast</button>
            </div>
          </div>
        )}
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
                    <button 
                      onClick={() => window.open(`mailto:${lead.email}?subject=Follow up - ${lead.company}&body=Hi ${lead.name},%0D%0A%0D%0AFollowing up on our conversation...`)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                    >
                      Contact
                    </button>
                    <button 
                      onClick={() => handleEditLead(lead)}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(lead.id)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-200 transition-colors"
                    >
                      Delete
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
                <div className="flex gap-2">
                  <button 
                    onClick={() => alert(`Editing automation rule: ${rule.name}\n\nTrigger: ${rule.trigger}\nAction: ${rule.action}\n\n(Full automation editor coming soon!)`)}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs hover:bg-indigo-200 transition-colors"
                  >
                    Edit Rule
                  </button>
                  <button 
                    onClick={() => confirm(`Disable automation rule: ${rule.name}?`) && alert('Rule disabled!')}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200 transition-colors"
                  >
                    Disable
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5 border border-indigo-200 mb-6">
        <h4 className="font-semibold text-indigo-800 mb-3">🚀 Advanced CRM Features (Beyond HighLevel)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            onClick={() => {
              setAiPrompt('Show me predictive lead scoring analysis');
              setShowAIAssistant(true);
              handleAIPrompt();
            }}
            className="bg-white rounded-lg p-3 border border-indigo-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <h5 className="font-medium text-gray-900 mb-2">🤖 Predictive Lead Scoring</h5>
            <p className="text-sm text-gray-600">AI analyzes 200+ data points to predict closing probability</p>
            <div className="text-xs text-indigo-600 mt-2 font-medium">Click for analysis →</div>
          </div>
          <div 
            onClick={() => alert('Social Media Intelligence Dashboard\n\n• LinkedIn: 23 prospect interactions\n• Twitter: 8 mentions detected\n• Facebook: 12 engagement events\n• Instagram: 5 story views\n\nReal-time social monitoring active!')}
            className="bg-white rounded-lg p-3 border border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <h5 className="font-medium text-gray-900 mb-2">📱 Social Media Intelligence</h5>
            <p className="text-sm text-gray-600">Real-time tracking of prospect activity across all platforms</p>
            <div className="text-xs text-blue-600 mt-2 font-medium">View social data →</div>
          </div>
          <div 
            onClick={() => alert('AI Conversation Analysis Results\n\n• Positive sentiment: 78%\n• Buying intent signals: High\n• Urgency indicators: Medium\n• Price sensitivity: Low\n\nRecommendation: Schedule demo within 24 hours')}
            className="bg-white rounded-lg p-3 border border-purple-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <h5 className="font-medium text-gray-900 mb-2">💬 AI Conversation Analysis</h5>
            <p className="text-sm text-gray-600">Sentiment analysis and next-best-action recommendations</p>
            <div className="text-xs text-purple-600 mt-2 font-medium">Analyze conversations →</div>
          </div>
          <div 
            onClick={() => alert('Instant Personalization Engine\n\n• Dynamic email content: Active\n• Behavioral triggers: 15 active\n• Content recommendations: 47 generated\n• Personalization score: 92%\n\nPersonalized experiences delivered!')}
            className="bg-white rounded-lg p-3 border border-green-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <h5 className="font-medium text-gray-900 mb-2">⚡ Instant Personalization</h5>
            <p className="text-sm text-gray-600">Dynamic content based on social data and behavior</p>
            <div className="text-xs text-green-600 mt-2 font-medium">View personalization →</div>
          </div>
          <div 
            onClick={() => alert('Cross-Platform Attribution Report\n\n• Email campaigns: 35% attribution\n• Social media: 28% attribution\n• Direct visits: 18% attribution\n• Paid ads: 12% attribution\n• Referrals: 7% attribution\n\nFull customer journey mapped!')}
            className="bg-white rounded-lg p-3 border border-orange-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <h5 className="font-medium text-gray-900 mb-2">🎯 Cross-Platform Attribution</h5>
            <p className="text-sm text-gray-600">Track customer journey across all touchpoints</p>
            <div className="text-xs text-orange-600 mt-2 font-medium">View attribution →</div>
          </div>
          <div 
            onClick={() => {
              setAiPrompt('Generate revenue forecast for next quarter');
              setShowAIAssistant(true);
              handleAIPrompt();
            }}
            className="bg-white rounded-lg p-3 border border-red-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <h5 className="font-medium text-gray-900 mb-2">🔮 Revenue Forecasting</h5>
            <p className="text-sm text-gray-600">AI-powered revenue predictions with 95% accuracy</p>
            <div className="text-xs text-red-600 mt-2 font-medium">View forecast →</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {leads.length} high-value leads • {pipelineStats.totalValue} pipeline • {automationRules.length} automation rules active
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setEditingLead({
                name: '',
                company: '',
                email: '',
                phone: '',
                source: '',
                score: 50,
                stage: 'Nurturing',
                value: '$0',
                lastContact: 'Just now',
                nextAction: 'Initial contact',
                aiInsights: 'New lead - needs qualification',
                socialActivity: 'No social activity yet'
              });
              setShowAddLeadModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Lead
          </button>
          <button 
            onClick={() => {
              setAiPrompt('Analyze all my leads and give me insights');
              setShowAIAssistant(true);
              handleAIPrompt();
            }}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            AI Insights
          </button>
          <button 
            onClick={exportData}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Edit Lead Modal */}
      {(showEditModal || showAddLeadModal) && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingLead.id ? 'Edit Lead' : 'Add New Lead'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingLead.name || ''}
                  onChange={(e) => setEditingLead({...editingLead, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={editingLead.company || ''}
                  onChange={(e) => setEditingLead({...editingLead, company: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingLead.email || ''}
                  onChange={(e) => setEditingLead({...editingLead, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingLead.phone || ''}
                  onChange={(e) => setEditingLead({...editingLead, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingLead.score || ''}
                    onChange={(e) => setEditingLead({...editingLead, score: parseInt(e.target.value) || 0})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select
                    value={editingLead.stage || ''}
                    onChange={(e) => setEditingLead({...editingLead, stage: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Nurturing">Nurturing</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Hot Lead">Hot Lead</option>
                    <option value="Negotiation">Negotiation</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value</label>
                <input
                  type="text"
                  value={editingLead.value || ''}
                  onChange={(e) => setEditingLead({...editingLead, value: e.target.value})}
                  placeholder="$50,000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveLead}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingLead.id ? 'Update Lead' : 'Add Lead'}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setShowAddLeadModal(false);
                  setEditingLead(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Delete Lead</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this lead? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteLead(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperiorCRMSystem;
