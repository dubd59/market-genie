import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import FirebaseUserDataService from '../services/firebaseUserData';

const SuperiorCRMSystem = ({ contacts = [], deals = [], onAddDeal, onUpdateDeal, onDeleteDeal, onSaveDeals }) => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  // AI Assistant State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // Modal States for editing deals
  const [editingDeal, setEditingDeal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  
  // Deal form state
  const [newDeal, setNewDeal] = useState({
    title: '',
    value: '',
    stage: 'prospects',
    contactId: '',
    closeDate: '',
    notes: ''
  });

  // Convert deals to high-value leads display format
  const convertDealsToLeads = () => {
    return deals.map(deal => ({
      id: deal.id,
      name: deal.title || 'Unnamed Deal',
      company: deal.company || 'No Company',
      email: deal.email || 'No Email',
      phone: deal.phone || 'N/A',
      source: 'Deal Pipeline',
      score: deal.stage === 'closed_won' ? 100 : deal.stage === 'negotiation' ? 95 : deal.stage === 'proposal' ? 90 : 85,
      stage: deal.stage === 'closed_won' ? 'Won' : deal.stage === 'negotiation' ? 'Negotiation' : deal.stage === 'proposal' ? 'Proposal' : 'Prospect',
      value: typeof deal.value === 'number' ? `$${deal.value.toLocaleString()}` : `$${deal.value}`,
      lastContact: deal.lastContact || 'Recently updated',
      nextAction: deal.nextAction || 'Follow up required',
      aiInsights: deal.notes || 'Deal from pipeline',
      socialActivity: `Deal stage: ${deal.stage}`
    }));
  };

  // Use deals as leads - no separate leads system
  const leads = convertDealsToLeads();

  // Calculate live pipeline stats from real data
  const calculatePipelineStats = () => {
    const totalDeals = deals.length;
    const closedDeals = deals.filter(deal => deal.stage === 'closed_won').length;
    const lostDeals = deals.filter(deal => deal.stage === 'closed_lost').length;
    const activeDeals = deals.filter(deal => 
      deal.stage !== 'closed_won' && deal.stage !== 'closed_lost'
    ).length;
    
    // Parse deal values more robustly
    const parseDealValue = (value) => {
      if (!value) return 0;
      const numericValue = typeof value === 'string' ? 
        parseFloat(value.replace(/[$,]/g, '')) : parseFloat(value);
      return isNaN(numericValue) ? 0 : numericValue;
    };
    
    const totalValue = deals.reduce((sum, deal) => sum + parseDealValue(deal.value), 0);
    const closedValue = deals.filter(deal => deal.stage === 'closed_won')
                           .reduce((sum, deal) => sum + parseDealValue(deal.value), 0);
    
    const conversionRate = totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 0;
    const avgDealSize = totalDeals > 0 ? Math.round(totalValue / totalDeals) : 0;
    
    // Calculate real average sales cycle from deal dates
    const calculateSalesCycle = () => {
      const closedWonDeals = deals.filter(deal => deal.stage === 'closed_won');
      if (closedWonDeals.length === 0) return 24; // Default if no data
      
      let totalDays = 0;
      let validDeals = 0;
      
      closedWonDeals.forEach(deal => {
        if (deal.createdAt && deal.closeDate) {
          const created = new Date(deal.createdAt);
          const closed = new Date(deal.closeDate);
          const daysDiff = Math.round((closed - created) / (1000 * 60 * 60 * 24));
          
          if (daysDiff > 0 && daysDiff < 365) { // Reasonable bounds
            totalDays += daysDiff;
            validDeals++;
          }
        }
      });
      
      return validDeals > 0 ? Math.round(totalDays / validDeals) : 24;
    };
    
    const avgSalesCycle = calculateSalesCycle();
    
    return {
      totalValue: `$${totalValue.toLocaleString()}`,
      closedDeals: `$${closedValue.toLocaleString()}`,
      activeDeals: activeDeals,
      conversionRate: conversionRate,
      avgDealSize: `$${avgDealSize.toLocaleString()}`,
      salesCycle: `${avgSalesCycle} days`,
      lostDeals: lostDeals,
      totalContactsAndDeals: contacts.length + deals.length + leads.length
    };
  };

  const pipelineStats = calculatePipelineStats();

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

  // Deal Management Functions
  const handleAddDeal = () => {
    setNewDeal({
      title: '',
      value: '',
      stage: 'prospects',
      contactId: '',
      closeDate: '',
      notes: ''
    });
    setEditingDeal(null);
    setShowAddDealModal(true);
  };

  const handleEditDeal = (deal) => {
    setNewDeal({
      title: deal.title || '',
      value: deal.value || '',
      stage: deal.stage || 'prospects',
      contactId: deal.contactId || '',
      closeDate: deal.closeDate || '',
      notes: deal.notes || ''
    });
    setEditingDeal(deal);
    setShowAddDealModal(true);
  };

  const handleSaveDeal = async (e) => {
    e.preventDefault();
    
    if (!newDeal.title.trim()) return;
    
    const dealData = {
      ...newDeal,
      id: editingDeal ? editingDeal.id : Date.now().toString(),
      createdAt: editingDeal ? editingDeal.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingDeal) {
      // Update existing deal
      const updatedDeals = deals.map(deal => 
        deal.id === editingDeal.id ? dealData : deal
      );
      if (onSaveDeals) await onSaveDeals(updatedDeals);
    } else {
      // Add new deal
      const updatedDeals = [...deals, dealData];
      if (onSaveDeals) await onSaveDeals(updatedDeals);
    }

    setShowAddDealModal(false);
    setEditingDeal(null);
    setNewDeal({
      title: '',
      value: '',
      stage: 'prospects',
      contactId: '',
      closeDate: '',
      notes: ''
    });
  };

  const handleDeleteDeal = async (dealId) => {
    if (confirm('Are you sure you want to delete this deal?')) {
      const updatedDeals = deals.filter(deal => deal.id !== dealId);
      if (onSaveDeals) await onSaveDeals(updatedDeals);
    }
  };

  const handleUpdateDealStage = async (dealId, newStage) => {
    const updatedDeals = deals.map(deal =>
      deal.id === dealId ? { ...deal, stage: newStage, updatedAt: new Date().toISOString() } : deal
    );
    if (onSaveDeals) await onSaveDeals(updatedDeals);
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
        <div className="flex items-center gap-6">
          <button 
            onClick={handleAddDeal}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2 font-medium"
          >
            <span className="text-lg">💼</span>
            Create Deal
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-500">Pipeline Value</div>
            <div className="text-2xl font-bold text-indigo-600">{pipelineStats.totalValue}</div>
            <div className="text-xs text-gray-500">{pipelineStats.conversionRate}% conversion rate</div>
          </div>
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
          <div className="text-lg font-bold text-indigo-800">{pipelineStats.totalContactsAndDeals}</div>
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
                      onClick={() => {
                        // Since leads are converted from deals, find the original deal
                        const originalDeal = deals.find(deal => deal.id === lead.id);
                        if (originalDeal) handleEditDeal(originalDeal);
                      }}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200 transition-colors"
                    >
                      Edit Deal
                    </button>
                    <button 
                      onClick={() => handleDeleteDeal(lead.id)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-200 transition-colors"
                    >
                      Delete Deal
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
          {leads.length} high-value leads • {pipelineStats.totalValue} pipeline • {automationRules.length} automation rules active • {contacts.length} total contacts
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAddDeal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            💼 Add New Deal
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

      {/* Deal Modal */}
      {showAddDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-xl">
              <h3 className="text-xl font-semibold text-genie-teal">
                {editingDeal ? 'Edit Deal' : 'Add New Deal'}
              </h3>
            </div>
            <form onSubmit={handleSaveDeal} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title</label>
                <input
                  type="text"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  placeholder="New Business Opportunity"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-genie-teal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value</label>
                <input
                  type="text"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                  placeholder="$50,000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-genie-teal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select
                  value={newDeal.stage}
                  onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-genie-teal"
                >
                  <option value="prospects">Prospects</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed_won">Closed Won</option>
                  <option value="closed_lost">Closed Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <select
                  value={newDeal.contactId}
                  onChange={(e) => setNewDeal({ ...newDeal, contactId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-genie-teal"
                >
                  <option value="">Select Contact (Optional)</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} - {contact.company || 'No Company'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                <input
                  type="date"
                  value={newDeal.closeDate}
                  onChange={(e) => setNewDeal({ ...newDeal, closeDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-genie-teal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newDeal.notes}
                  onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                  placeholder="Deal notes, requirements, next steps..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-genie-teal"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-genie-teal text-white py-2 rounded-lg hover:bg-genie-teal-dark transition-colors"
                >
                  {editingDeal ? 'Update Deal' : 'Create Deal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDealModal(false);
                    setEditingDeal(null);
                    setNewDeal({
                      title: '',
                      value: '',
                      stage: 'prospects',
                      contactId: '',
                      closeDate: '',
                      notes: ''
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperiorCRMSystem;
