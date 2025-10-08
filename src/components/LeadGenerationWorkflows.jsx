import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import persistenceService from '../services/persistenceService';

const LeadGenerationWorkflows = () => {
  const { user } = useAuth();
  const [hasLoaded, setHasLoaded] = useState(false); // Prevent saving during initial load
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Helper function to update classes with dark mode support
  const getDarkModeClasses = (lightClasses, darkClasses = '') => {
    const dark = darkClasses || lightClasses.replace('bg-white', 'bg-gray-800').replace('text-gray-900', 'text-white').replace('text-gray-700', 'text-gray-300')
    return isDarkMode ? dark : lightClasses
  }
  
  // Check for dark mode preference
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);
  
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: 'LinkedIn Lead Discovery',
      status: 'running',
      trigger: 'LinkedIn API Scraper',
      actions: ['Enrich with Apollo', 'Add to CRM', 'Send Welcome Email'],
      leadsGenerated: 847,
      lastRun: 'Running now',
      platform: 'LinkedIn',
      icon: '💼'
    },
    {
      id: 2,
      name: 'Twitter Engagement Follow-up',
      status: 'running',
      trigger: 'Twitter/X Mentions',
      actions: ['Check Sentiment', 'Qualify Lead', 'Schedule Follow-up'],
      leadsGenerated: 523,
      lastRun: 'Running now',
      platform: 'Twitter',
      icon: '🐦'
    },
    {
      id: 3,
      name: 'Facebook Business Page Leads',
      status: 'running',
      trigger: 'Facebook Business Directory',
      actions: ['Scrape Contact Info', 'Validate Email', 'Add to Pipeline'],
      leadsGenerated: 392,
      lastRun: 'Running now',
      platform: 'Facebook',
      icon: '📘'
    },
    {
      id: 4,
      name: 'Multi-Platform Competitor Analysis',
      status: 'running',
      trigger: 'Competitor Customer Discovery',
      actions: ['Cross-Platform Search', 'Contact Enrichment', 'Outreach Sequence'],
      leadsGenerated: 1247,
      lastRun: 'Running now',
      platform: 'Multi-Platform',
      icon: '🔄'
    },
    {
      id: 5,
      name: 'Instagram Creator Outreach',
      status: 'running',
      trigger: 'Instagram Business Scanner',
      actions: ['Profile Analysis', 'Engagement Score', 'DM Automation'],
      leadsGenerated: 289,
      lastRun: 'Running now',
      platform: 'Instagram',
      icon: '📸'
    },
    {
      id: 6,
      name: 'YouTube Channel Partnership',
      status: 'running',
      trigger: 'YouTube Analytics API',
      actions: ['Channel Evaluation', 'Collaboration Score', 'Partnership Email'],
      leadsGenerated: 156,
      lastRun: 'Running now',
      platform: 'YouTube',
      icon: '📺'
    },
    {
      id: 7,
      name: 'TikTok Viral Content Leads',
      status: 'running',
      trigger: 'TikTok Trend Monitor',
      actions: ['Viral Analysis', 'Creator Contact', 'Brand Partnership'],
      leadsGenerated: 178,
      lastRun: 'Running now',
      platform: 'TikTok',
      icon: '🎵'
    },
    {
      id: 8,
      name: 'AI-Powered Lead Scoring',
      status: 'running',
      trigger: 'All Social Platforms',
      actions: ['GPT-4 Analysis', 'Predictive Scoring', 'Priority Routing'],
      leadsGenerated: 2847,
      lastRun: 'Running now',
      platform: 'AI Engine',
      icon: '🤖'
    }
  ]);

  const [automationRules, setAutomationRules] = useState({
    dailyBudget: 500,
    maxLeadsPerDay: 200,
    autoEnrichment: true,
    duplicateDetection: true,
    qualityThreshold: 85,
    autoOutreach: true
  });

  // Load and save persistent data
  useEffect(() => {
    if (user?.uid) {
      loadPersistentData();
      
      // Live updates every 8 seconds
      const interval = setInterval(() => {
        updateWorkflowStats();
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const loadPersistentData = async () => {
    try {
      const savedWorkflows = await persistenceService.loadWorkflows(user.uid);
      const savedRules = await persistenceService.loadData(user.uid, 'automationRules', {});
      
      if (savedWorkflows.length > 0) {
        setWorkflows(savedWorkflows);
      }
      
      if (Object.keys(savedRules).length > 0) {
        setAutomationRules({ ...automationRules, ...savedRules });
      }
      
      setHasLoaded(true); // Mark as loaded to enable saving
    } catch (error) {
      console.error('Error loading workflow data:', error);
      setHasLoaded(true); // Still mark as loaded even if there's an error
    }
  };

  useEffect(() => {
    if (user?.uid && hasLoaded) {
      persistenceService.saveWorkflows(user.uid, workflows);
      console.log('💾 Saving workflows data');
    }
  }, [workflows, user, hasLoaded]);

  useEffect(() => {
    if (user?.uid && hasLoaded) {
      persistenceService.saveData(user.uid, 'automationRules', automationRules);
      console.log('💾 Saving automation rules:', automationRules);
    }
  }, [automationRules, user, hasLoaded]);

  // Simulate live workflow updates
  const updateWorkflowStats = () => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.status === 'running') {
        const increment = Math.floor(Math.random() * 8) + 2; // 2-10 new leads
        return {
          ...workflow,
          leadsGenerated: workflow.leadsGenerated + increment,
          lastRun: 'Running now'
        };
      }
      return workflow;
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

  const getTotalLeads = () => workflows.reduce((sum, workflow) => sum + workflow.leadsGenerated, 0);
  const getActiveWorkflows = () => workflows.filter(w => w.status === 'active' || w.status === 'running').length;

  return (
    <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-purple-100'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-purple-400' : 'text-purple-800'}`}>
            <span className="text-3xl">⚡</span>
            Lead Generation Automation Workflows
          </h3>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Intelligent automation connecting social media scraping to your sales pipeline</p>
        </div>
        <div className="text-right">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Leads Generated</div>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{getTotalLeads()}</div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getActiveWorkflows()} workflows active</div>
        </div>
      </div>

      {/* Automation Rules */}
      <div className={`rounded-lg p-4 mb-6 border ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'}`}>
        <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-purple-400' : 'text-purple-800'}`}>Global Automation Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Daily Budget ($)</label>
            <input
              type="number"
              value={automationRules.dailyBudget}
              onChange={(e) => setAutomationRules(prev => ({ ...prev, dailyBudget: Number(e.target.value) }))}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Max Leads/Day</label>
            <input
              type="number"
              value={automationRules.maxLeadsPerDay}
              onChange={(e) => setAutomationRules(prev => ({ ...prev, maxLeadsPerDay: Number(e.target.value) }))}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quality Threshold (%)</label>
            <input
              type="range"
              min="50"
              max="100"
              value={automationRules.qualityThreshold}
              onChange={(e) => setAutomationRules(prev => ({ ...prev, qualityThreshold: Number(e.target.value) }))}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600">{automationRules.qualityThreshold}%</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={automationRules.autoEnrichment}
              onChange={(e) => setAutomationRules(prev => ({ ...prev, autoEnrichment: e.target.checked }))}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm font-medium text-gray-700">Auto Enrichment</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={automationRules.duplicateDetection}
              onChange={(e) => setAutomationRules(prev => ({ ...prev, duplicateDetection: e.target.checked }))}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm font-medium text-gray-700">Duplicate Detection</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={automationRules.autoOutreach}
              onChange={(e) => setAutomationRules(prev => ({ ...prev, autoOutreach: e.target.checked }))}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm font-medium text-gray-700">Auto Outreach</span>
          </label>
          <div className="text-sm text-purple-700">
            <span className="font-medium">Estimated daily cost: ${(automationRules.maxLeadsPerDay * 0.75).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {workflows.map(workflow => (
          <div key={workflow.id} className="border border-gray-200 rounded-lg p-5 hover:border-purple-300 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{workflow.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{workflow.name}</h4>
                  <p className="text-sm text-gray-600">{workflow.platform}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)}`}></div>
                <span className="text-xs font-medium capitalize">{workflow.status}</span>
              </div>
            </div>

            {/* Workflow Details */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">TRIGGER</div>
                <div className="bg-blue-50 text-blue-800 text-sm px-2 py-1 rounded inline-block">
                  {workflow.trigger}
                </div>
              </div>
              
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">ACTIONS</div>
                <div className="flex flex-wrap gap-1">
                  {workflow.actions.map((action, idx) => (
                    <span key={idx} className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Leads Generated:</span>
                  <span className="font-medium ml-2">{workflow.leadsGenerated}</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Run:</span>
                  <span className="font-medium ml-2">{workflow.lastRun}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {workflow.status === 'idle' || workflow.status === 'paused' ? (
                <button className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
                  Start
                </button>
              ) : (
                <button className="px-3 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors">
                  Pause
                </button>
              )}
              <button className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                Configure
              </button>
              <button className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                Logs
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Builder */}
      <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg p-5 border border-purple-200">
        <h4 className="font-semibold text-purple-800 mb-3">Create New Workflow</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Select Trigger</option>
            <option>LinkedIn Scraper</option>
            <option>Twitter Monitor</option>
            <option>Facebook Scraper</option>
            <option>Instagram Scanner</option>
            <option>YouTube Analyzer</option>
            <option>TikTok Scout</option>
            <option>Website Form</option>
            <option>Email Signup</option>
          </select>
          <select className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Add Action</option>
            <option>Enrich with Apollo</option>
            <option>Verify Email</option>
            <option>Add to CRM</option>
            <option>Score Lead</option>
            <option>Send Email</option>
            <option>Create Task</option>
            <option>Update Pipeline</option>
          </select>
          <input
            type="text"
            placeholder="Workflow name"
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Create Workflow
          </button>
        </div>
        <div className="text-sm text-purple-700">
          💡 Tip: Connect social media scraping agents to automated lead qualification and outreach sequences
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
        <div className="text-sm text-gray-600">
          {workflows.filter(w => w.status === 'running' || w.status === 'active').length} workflows running
          • {getTotalLeads()} total leads generated
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setWorkflows(prev => prev.map(w => ({ ...w, status: 'running', lastRun: 'Running now' })))}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            🚀 Start All
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            📊 View Analytics
          </button>
          <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors">
            🔧 Advanced Builder
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadGenerationWorkflows;
