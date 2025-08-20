import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import persistenceService from '../services/persistenceService';

const SocialMediaScrapingAgents = () => {
  const { user } = useAuth();
  
  const [scrapingAgents, setScrapingAgents] = useState([
    {
      id: 1,
      name: 'LinkedIn Professional Hunter',
      platform: 'LinkedIn',
      status: 'running',
      icon: '💼',
      leadsFound: 847,
      searchFilters: ['SaaS Companies', 'Decision Makers', '50+ Employees'],
      lastRun: 'Running now',
      costPerLead: '$0.75',
      apiConnected: true
    },
    {
      id: 2,
      name: 'Twitter/X Engagement Scanner',
      platform: 'Twitter/X',
      status: 'running',
      icon: '🐦',
      leadsFound: 523,
      searchFilters: ['#startup', '#B2B', '#entrepreneur'],
      lastRun: 'Running now',
      costPerLead: '$0.45',
      apiConnected: true
    },
    {
      id: 3,
      name: 'Facebook Business Prospector',
      platform: 'Facebook',
      status: 'running',
      icon: '📘',
      leadsFound: 392,
      searchFilters: ['Business Pages', 'Industry Groups', 'Lead Ads'],
      lastRun: 'Running now',
      costPerLead: '$0.55',
      apiConnected: true
    },
    {
      id: 4,
      name: 'Instagram Creator Finder',
      platform: 'Instagram',
      status: 'running',
      icon: '📸',
      leadsFound: 289,
      searchFilters: ['Business Profiles', '#businessowner', 'Verified Accounts'],
      lastRun: 'Running now',
      costPerLead: '$0.65',
      apiConnected: true
    },
    {
      id: 5,
      name: 'YouTube Channel Analyzer',
      platform: 'YouTube',
      status: 'running',
      icon: '📺',
      leadsFound: 156,
      searchFilters: ['Business Channels', 'Creator Economy', '10K+ Subscribers'],
      lastRun: 'Running now',
      costPerLead: '$0.85',
      apiConnected: true
    },
    {
      id: 6,
      name: 'TikTok Business Scout',
      platform: 'TikTok',
      status: 'running',
      icon: '🎵',
      leadsFound: 178,
      searchFilters: ['Business Accounts', '#entrepreneur', 'Viral Content'],
      lastRun: 'Running now',
      costPerLead: '$0.35',
      apiConnected: true
    }
  ]);

  const [budgetSettings, setBudgetSettings] = useState({
    dailyBudget: 250,
    maxCostPerLead: 2.00,
    autoStop: true
  });

  // Load data from Firebase on component mount
  useEffect(() => {
    if (user?.uid) {
      loadPersistentData();
      
      // Set up real-time sync for live updates
      const interval = setInterval(() => {
        updateLeadCounts();
      }, 5000); // Update every 5 seconds for live effect

      return () => clearInterval(interval);
    }
  }, [user]);

  // Load persistent data from Firebase
  const loadPersistentData = async () => {
    try {
      const savedAgents = await persistenceService.loadScrapingAgents(user.uid);
      const savedBudget = await persistenceService.loadBudgetSettings(user.uid);
      
      if (savedAgents.length > 0) {
        setScrapingAgents(savedAgents);
      }
      
      if (Object.keys(savedBudget).length > 0) {
        setBudgetSettings(savedBudget);
      }
    } catch (error) {
      console.error('Error loading scraping agents data:', error);
    }
  };

  // Save data to Firebase whenever state changes
  useEffect(() => {
    if (user?.uid && scrapingAgents.length > 0) {
      persistenceService.saveScrapingAgents(user.uid, scrapingAgents);
    }
  }, [scrapingAgents, user]);

  useEffect(() => {
    if (user?.uid) {
      persistenceService.saveBudgetSettings(user.uid, budgetSettings);
    }
  }, [budgetSettings, user]);

  // Simulate live lead generation
  const updateLeadCounts = () => {
    setScrapingAgents(prev => prev.map(agent => {
      if (agent.status === 'running' || agent.status === 'active') {
        const increment = Math.floor(Math.random() * 5) + 1; // 1-5 new leads
        return {
          ...agent,
          leadsFound: agent.leadsFound + increment,
          lastRun: 'Running now'
        };
      }
      return agent;
    }));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'running': return 'bg-blue-500 animate-pulse';
      case 'paused': return 'bg-yellow-500';
      case 'idle': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'running': return 'Running';
      case 'paused': return 'Paused';
      case 'idle': return 'Idle';
      default: return 'Unknown';
    }
  };

  const startAgent = (agentId) => {
    setScrapingAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, status: 'running', lastRun: 'Running now' } : agent
    ));
  };

  const pauseAgent = (agentId) => {
    setScrapingAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, status: 'paused' } : agent
    ));
  };

  const startAllAgents = () => {
    setScrapingAgents(prev => prev.map(agent => ({ 
      ...agent, 
      status: 'running', 
      lastRun: 'Running now',
      apiConnected: true 
    })));
  };

  const getTotalLeads = () => scrapingAgents.reduce((sum, agent) => sum + agent.leadsFound, 0);
  const getAverageCost = () => {
    const totalCost = scrapingAgents.reduce((sum, agent) => sum + (parseFloat(agent.costPerLead.replace('$', '')) * agent.leadsFound), 0);
    const totalLeads = getTotalLeads();
    return totalLeads > 0 ? (totalCost / totalLeads).toFixed(2) : 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-blue-800 flex items-center gap-3">
            <span className="text-3xl">🌐</span>
            Social Media Scraping Agents
          </h3>
          <p className="text-gray-600 mt-1">AI-powered lead discovery across all major social platforms</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Leads Found</div>
          <div className="text-2xl font-bold text-blue-600">{getTotalLeads()}</div>
        </div>
      </div>

      {/* Budget Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-3">Scraping Budget Controls</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Budget ($)</label>
            <input
              type="number"
              value={budgetSettings.dailyBudget}
              onChange={(e) => setBudgetSettings(prev => ({ ...prev, dailyBudget: Number(e.target.value) }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="10"
              max="500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Cost Per Lead ($)</label>
            <input
              type="number"
              step="0.10"
              value={budgetSettings.maxCostPerLead}
              onChange={(e) => setBudgetSettings(prev => ({ ...prev, maxCostPerLead: Number(e.target.value) }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0.10"
              max="5.00"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={budgetSettings.autoStop}
                onChange={(e) => setBudgetSettings(prev => ({ ...prev, autoStop: e.target.checked }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Auto-stop when budget reached</span>
            </label>
          </div>
        </div>
        <div className="mt-3 text-sm text-blue-700">
          <span className="font-medium">Average cost per lead: ${getAverageCost()}</span>
          <span className="ml-4">Estimated daily leads: ~{Math.floor(budgetSettings.dailyBudget / getAverageCost())}</span>
        </div>
      </div>

      {/* Scraping Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {scrapingAgents.map(agent => (
          <div key={agent.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{agent.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                  <p className="text-sm text-gray-600">{agent.platform}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
                <span className="text-xs font-medium">{getStatusText(agent.status)}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Leads Found:</span>
                <span className="font-medium">{agent.leadsFound}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cost/Lead:</span>
                <span className="font-medium">{agent.costPerLead}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Run:</span>
                <span className="font-medium">{agent.lastRun}</span>
              </div>
            </div>

            {/* Search Filters */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">Active Filters:</div>
              <div className="flex flex-wrap gap-1">
                {agent.searchFilters.map((filter, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {filter}
                  </span>
                ))}
              </div>
            </div>

            {/* API Connection Status */}
            <div className={`mb-3 p-2 rounded text-xs ${
              agent.apiConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {agent.apiConnected ? '✅ API Connected' : '❌ API Not Connected - Connect in Integrations'}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {agent.status === 'idle' || agent.status === 'paused' ? (
                <button
                  onClick={() => startAgent(agent.id)}
                  disabled={!agent.apiConnected}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    agent.apiConnected
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={() => pauseAgent(agent.id)}
                  className="px-3 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                >
                  Pause
                </button>
              )}
              <button className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {scrapingAgents.filter(a => a.status === 'running' || a.status === 'active').length} agents running
        </div>
        <div className="flex gap-3">
          <button 
            onClick={startAllAgents}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            🚀 Start All Connected
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
            📊 Export Leads
          </button>
          <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors">
            🔗 → Connect APIs
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaScrapingAgents;
