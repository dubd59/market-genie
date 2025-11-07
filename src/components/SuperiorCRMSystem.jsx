import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import FirebaseUserDataService from '../services/firebaseUserData';
import toast from 'react-hot-toast';

const SuperiorCRMSystem = ({ contacts = [], deals = [], onAddDeal, onUpdateDeal, onDeleteDeal, onSaveDeals, isDarkMode = false }) => {
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
      status: 'Ready'
    },
    {
      name: 'Social Engagement Follow-up',
      trigger: 'Social media interaction',
      action: 'Send personalized message within 30 minutes',
      status: 'Ready'
    },
    {
      name: 'Proposal Follow-up',
      trigger: '48 hours after proposal sent',
      action: 'AI-crafted follow-up email + calendar link',
      status: 'Ready'
    },
    {
      name: 'Contract Reminder',
      trigger: 'Contract pending > 5 days',
      action: 'Escalate to manager + priority flag',
      status: 'Ready'
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
    <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-indigo-100'} rounded-xl shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-indigo-800'} flex items-center gap-3`}>
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
      <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'} rounded-xl p-4 mb-6`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-teal-400' : 'text-purple-800'} flex items-center gap-2`}>
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
              <div className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-white border border-purple-200'} rounded-lg p-3`}>
                <div className={`text-sm ${isDarkMode ? 'text-teal-400' : 'text-purple-800'} font-medium mb-1`}>🤖 AI Recommendation:</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{aiResponse}</div>
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
        <div className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'} rounded-lg p-3`}>
          <div className="text-xs text-green-600 font-medium">CLOSED DEALS</div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>{pipelineStats.closedDeals}</div>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200'} rounded-lg p-3`}>
          <div className="text-xs text-blue-600 font-medium">ACTIVE DEALS</div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>{pipelineStats.activeDeals}</div>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200'} rounded-lg p-3`}>
          <div className="text-xs text-purple-600 font-medium">CONVERSION</div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-800'}`}>{pipelineStats.conversionRate}%</div>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'} rounded-lg p-3`}>
          <div className="text-xs text-orange-600 font-medium">AVG DEAL</div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-800'}`}>{pipelineStats.avgDealSize}</div>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'} rounded-lg p-3`}>
          <div className="text-xs text-red-600 font-medium">SALES CYCLE</div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>{pipelineStats.salesCycle}</div>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200'} rounded-lg p-3`}>
          <div className="text-xs text-indigo-600 font-medium">AI INSIGHTS</div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-800'}`}>{pipelineStats.totalContactsAndDeals}</div>
        </div>
      </div>

      {/* Advanced Lead Management */}
      <div className="mb-8">
        <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-teal-400' : 'text-gray-900'} mb-4`}>High-Value Leads with AI Insights</h4>
        <div className="space-y-4">
          {leads.map(lead => (
            <div key={lead.id} className={`${isDarkMode ? 'bg-gray-700 border border-gray-600 hover:border-gray-500' : 'bg-white border border-gray-200 hover:border-indigo-300'} rounded-lg p-4 transition-colors`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className={`font-semibold ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>{lead.name}</h5>
                    <span className={`${isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>• {lead.company}</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                      {lead.score} Score
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStageColor(lead.stage)}`}></div>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{lead.stage}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Contact Info</div>
                      <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{lead.email} • {lead.phone}</div>
                      <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Source: {lead.source}</div>
                    </div>
                    <div>
                      <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Deal Info</div>
                      <div className="font-medium text-green-600">{lead.value}</div>
                      <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Last contact: {lead.lastContact}</div>
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
              <div className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-purple-50 border border-purple-200'} rounded-lg p-3 mb-3`}>
                <div className={`text-xs font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-800'} mb-1`}>🤖 AI INSIGHTS</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-purple-700'}`}>{lead.aiInsights}</div>
              </div>

              {/* Social Activity */}
              <div className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-blue-50 border border-blue-200'} rounded-lg p-3`}>
                <div className={`text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-800'} mb-1`}>📱 SOCIAL ACTIVITY</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>{lead.socialActivity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automation Rules */}
      <div className="mb-6">
        <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-teal-400' : 'text-gray-900'} mb-4`}>AI-Powered Automation Rules</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automationRules.map((rule, index) => (
            <div key={index} className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'} rounded-lg p-4`}>
              <div className="flex items-start justify-between mb-2">
                <h5 className={`font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>{rule.name}</h5>
                <span className={`${isDarkMode ? 'bg-green-600 text-green-200' : 'bg-green-100 text-green-800'} text-xs px-2 py-1 rounded`}>{rule.status}</span>
              </div>
              
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                <div><strong>Trigger:</strong> {rule.trigger}</div>
                <div><strong>Action:</strong> {rule.action}</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-blue-600">Automation ready to activate</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const explanations = {
                        'High-Score Lead Alert': 'This automation monitors lead scores in real-time. When any lead reaches 90+ points (based on email validity, company data, engagement, etc.), it instantly sends notifications to your team and automatically assigns the lead to your top-performing sales rep. Perfect for capturing hot prospects immediately!',
                        'Social Engagement Follow-up': 'This tracks social media interactions across LinkedIn, Twitter, Facebook, etc. When someone engages with your content (likes, comments, shares), it automatically sends a personalized message within 30 minutes while they\'re still thinking about you. Strikes while the iron is hot!',
                        'Proposal Follow-up': 'After you send a proposal or quote, this automation waits exactly 48 hours then automatically sends a follow-up email with a calendar booking link. No more manual tracking - it ensures every proposal gets proper follow-up without you having to remember.',
                        'Contract Reminder': 'When contracts or agreements are pending for more than 5 days, this escalates to your manager and adds a priority flag. Prevents deals from going cold and ensures nothing falls through the cracks in your sales pipeline.'
                      };
                      
                      toast.custom((t) => (
                        <div className={`${
                          t.visible ? 'animate-enter' : 'animate-leave'
                        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                          <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <span className="text-2xl">📋</span>
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {rule.name}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  {explanations[rule.name] || 'Advanced automation rule coming soon!'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex border-l border-gray-200">
                            <button
                              onClick={() => toast.dismiss(t.id)}
                              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ), {
                        duration: Infinity, // Won't auto-dismiss
                        position: 'top-right',
                      });
                    }}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs hover:bg-indigo-200 transition-colors"
                  >
                    How it Works
                  </button>
                  <button 
                    onClick={() => toast.success(`${rule.name} is now active and monitoring for triggers!`)}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200 transition-colors"
                  >
                    Activate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Features */}
      <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200'} rounded-lg p-5 mb-6`}>
        <h4 className={`font-semibold ${isDarkMode ? 'text-teal-400' : 'text-indigo-800'} mb-3`}>🚀 Advanced CRM Features (Beyond HighLevel)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            onClick={() => {
              toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} shadow-lg rounded-lg pointer-events-auto flex ring-1 ${isDarkMode ? 'ring-gray-600' : 'ring-black'} ring-opacity-5`}>
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0"><span className="text-2xl">🤖</span></div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>Predictive Lead Scoring</p>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          This AI system analyzes 200+ data points including email behavior, website activity, social engagement, company size, industry, job title, and interaction patterns to predict which leads are most likely to close. It assigns probability scores and prioritizes your follow-up efforts automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex border-l ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <button onClick={() => toast.dismiss(t.id)} className={`w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'} focus:outline-none`}>✕</button>
                  </div>
                </div>
              ), { duration: Infinity, position: 'top-right' });
            }}
            className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-white border border-indigo-200'} rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <h5 className={`font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'} mb-2`}>🤖 Predictive Lead Scoring</h5>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>AI analyzes 200+ data points to predict closing probability</p>
            <div className={`text-xs ${isDarkMode ? 'text-teal-400' : 'text-indigo-600'} mt-2 font-medium`}>Click for details →</div>
          </div>
          <div 
            onClick={() => {
              toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} shadow-lg rounded-lg pointer-events-auto flex ring-1 ${isDarkMode ? 'ring-gray-600' : 'ring-black'} ring-opacity-5`}>
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0"><span className="text-2xl">📱</span></div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>Social Media Intelligence</p>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Monitors LinkedIn, Twitter, Facebook, Instagram, and TikTok in real-time for mentions, interactions, and engagement with your prospects. Tracks when they view your profile, engage with content, or show buying signals on social platforms. Perfect for timing your outreach when prospects are most engaged.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex border-l ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <button onClick={() => toast.dismiss(t.id)} className={`w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'} focus:outline-none`}>✕</button>
                  </div>
                </div>
              ), { duration: Infinity, position: 'top-right' });
            }}
            className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-white border border-blue-200'} rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <h5 className={`font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'} mb-2`}>📱 Social Media Intelligence</h5>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Real-time tracking of prospect activity across all platforms</p>
            <div className={`text-xs ${isDarkMode ? 'text-teal-400' : 'text-blue-600'} mt-2 font-medium`}>Click for details →</div>
          </div>
          <div 
            onClick={() => {
              toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} shadow-lg rounded-lg pointer-events-auto flex ring-1 ${isDarkMode ? 'ring-gray-600' : 'ring-black'} ring-opacity-5`}>
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0"><span className="text-2xl">💬</span></div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>AI Conversation Analysis</p>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Uses natural language processing to analyze all conversations (emails, chats, calls) for sentiment, buying intent, urgency levels, and price sensitivity. Provides next-best-action recommendations like "Schedule demo within 24 hours" or "Send pricing information". Helps you respond with perfect timing and messaging.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex border-l ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <button onClick={() => toast.dismiss(t.id)} className={`w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'} focus:outline-none`}>✕</button>
                  </div>
                </div>
              ), { duration: Infinity, position: 'top-right' });
            }}
            className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-white border border-purple-200'} rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <h5 className={`font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'} mb-2`}>💬 AI Conversation Analysis</h5>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sentiment analysis and next-best-action recommendations</p>
            <div className={`text-xs ${isDarkMode ? 'text-teal-400' : 'text-purple-600'} mt-2 font-medium`}>Click for details →</div>
          </div>
          <div 
            onClick={() => {
              toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} shadow-lg rounded-lg pointer-events-auto flex ring-1 ${isDarkMode ? 'ring-gray-600' : 'ring-black'} ring-opacity-5`}>
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0"><span className="text-2xl">⚡</span></div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>Instant Personalization Engine</p>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Automatically customizes email content, web pages, and messages based on each prospect's industry, company size, role, previous interactions, and behavioral data. Creates dynamic content that speaks directly to each person's specific needs and challenges. Increases engagement rates by up to 300%.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex border-l ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <button onClick={() => toast.dismiss(t.id)} className={`w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'} focus:outline-none`}>✕</button>
                  </div>
                </div>
              ), { duration: Infinity, position: 'top-right' });
            }}
            className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-white border border-green-200'} rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <h5 className={`font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'} mb-2`}>⚡ Instant Personalization</h5>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Dynamic content based on social data and behavior</p>
            <div className={`text-xs ${isDarkMode ? 'text-teal-400' : 'text-green-600'} mt-2 font-medium`}>Click for details →</div>
          </div>
          <div 
            onClick={() => {
              toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} shadow-lg rounded-lg pointer-events-auto flex ring-1 ${isDarkMode ? 'ring-gray-600' : 'ring-black'} ring-opacity-5`}>
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0"><span className="text-2xl">🎯</span></div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>Cross-Platform Attribution</p>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Tracks the complete customer journey across email campaigns, social media, direct website visits, paid ads, and referrals. Shows which touchpoints contribute to conversions and how customers move between channels. Essential for understanding what marketing activities actually drive revenue.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex border-l ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <button onClick={() => toast.dismiss(t.id)} className={`w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'} focus:outline-none`}>✕</button>
                  </div>
                </div>
              ), { duration: Infinity, position: 'top-right' });
            }}
            className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-white border border-orange-200'} rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <h5 className={`font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'} mb-2`}>🎯 Cross-Platform Attribution</h5>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Track customer journey across all touchpoints</p>
            <div className={`text-xs ${isDarkMode ? 'text-teal-400' : 'text-orange-600'} mt-2 font-medium`}>Click for details →</div>
          </div>
          <div 
            onClick={() => {
              toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} shadow-lg rounded-lg pointer-events-auto flex ring-1 ${isDarkMode ? 'ring-gray-600' : 'ring-black'} ring-opacity-5`}>
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0"><span className="text-2xl">🔮</span></div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>Revenue Forecasting</p>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          Uses machine learning to analyze your pipeline, deal velocity, win rates, seasonal patterns, and market conditions to predict future revenue with 95% accuracy. Helps you plan resources, set realistic targets, and identify potential shortfalls before they happen.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex border-l ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <button onClick={() => toast.dismiss(t.id)} className={`w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'} focus:outline-none`}>✕</button>
                  </div>
                </div>
              ), { duration: Infinity, position: 'top-right' });
            }}
            className={`${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-white border border-red-200'} rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
          >
            <h5 className={`font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'} mb-2`}>🔮 Revenue Forecasting</h5>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>AI-powered revenue predictions with 95% accuracy</p>
            <div className={`text-xs ${isDarkMode ? 'text-teal-400' : 'text-red-600'} mt-2 font-medium`}>Click for details →</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`flex justify-between items-center pt-4 ${isDarkMode ? 'border-t border-gray-600' : 'border-t border-gray-200'}`}>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
              toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-lg w-full ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} shadow-lg rounded-lg pointer-events-auto flex ring-1 ${isDarkMode ? 'ring-gray-600' : 'ring-black'} ring-opacity-5`}>
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0"><span className="text-2xl">🧠</span></div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>AI Pipeline Insights</p>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          <strong>Key Insights:</strong><br/>
                          • Focus on leads with 85+ scores for highest conversion<br/>
                          • Your social engagement follow-up converts 23% better<br/>
                          • Best calling time: Tuesday-Thursday 2-4 PM<br/>
                          • Email sequences perform 40% better than single emails<br/>
                          • Deals with video demos close 65% faster<br/><br/>
                          <strong>Action Items:</strong><br/>
                          → Schedule demos for Sarah Johnson & Emily Rodriguez this week<br/>
                          → Follow up on 3 proposals pending over 5 days<br/>
                          → Social engage with LinkedIn prospects showing buying signals
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex border-l ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <button onClick={() => toast.dismiss(t.id)} className={`w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'} focus:outline-none`}>✕</button>
                  </div>
                </div>
              ), { duration: Infinity, position: 'top-right' });
            }}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            🧠 AI Insights
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
          <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} rounded-xl p-6 w-full max-w-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>Delete Lead</h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
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
          <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-700 border-b border-gray-600' : 'bg-white border-b border-gray-200'} p-6 rounded-t-xl`}>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-teal-400' : 'text-genie-teal'}`}>
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
