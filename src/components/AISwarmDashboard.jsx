import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import persistenceService from '../services/persistenceService';

const AISwarmDashboard = () => {
  const { tenant } = useTenant();
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
  
  const [swarmStatus, setSwarmStatus] = useState('idle'); // idle, running, paused
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'Lead Hunter AI',
      type: 'Lead Generation',
      status: 'active',
      tasks: 45,
      efficiency: 92,
      specialty: 'LinkedIn & Social Media Scraping',
      avatar: '🕵️',
      aiModel: 'GPT-4',
      lastAction: 'Found 12 high-quality leads in SaaS sector'
    },
    {
      id: 2,
      name: 'Content Wizard',
      type: 'Content Creation',
      status: 'active',
      tasks: 23,
      efficiency: 87,
      specialty: 'Email & Social Media Content',
      avatar: '✍️',
      aiModel: 'Claude-3',
      lastAction: 'Generated personalized email sequence for 8 prospects'
    },
    {
      id: 3,
      name: 'Data Enricher',
      type: 'Lead Enrichment',
      status: 'busy',
      tasks: 67,
      efficiency: 95,
      specialty: 'Contact & Company Data Enhancement',
      avatar: '🔍',
      aiModel: 'DeepSeek',
      lastAction: 'Enriched 34 lead profiles with contact details using advanced reasoning'
    },
    {
      id: 4,
      name: 'Campaign Optimizer',
      type: 'Campaign Management',
      status: 'idle',
      tasks: 12,
      efficiency: 89,
      specialty: 'A/B Testing & Performance Optimization',
      avatar: '🎯',
      aiModel: 'GPT-4 Turbo',
      lastAction: 'Optimized email subject lines - improved open rate by 23%'
    },
    {
      id: 5,
      name: 'Sentiment Analyst',
      type: 'Response Analysis',
      status: 'active',
      tasks: 56,
      efficiency: 91,
      specialty: 'Lead Scoring & Sentiment Detection',
      avatar: '🧠',
      aiModel: 'Claude-3',
      lastAction: 'Analyzed 89 prospect responses, flagged 12 hot leads'
    },
    {
      id: 6,
      name: 'Outreach Commander',
      type: 'Multi-Channel Outreach',
      status: 'busy',
      tasks: 78,
      efficiency: 88,
      specialty: 'Email, LinkedIn, SMS Coordination',
      avatar: '📡',
      aiModel: 'GPT-4',
      lastAction: 'Coordinated follow-up sequence across 3 channels for 24 prospects'
    }
  ]);

  const [swarmSettings, setSwarmSettings] = useState({
    maxConcurrentTasks: 50,
    agentCollaboration: true,
    autoScaling: true,
    budgetLimit: 200,
    qualityThreshold: 85
  });

  const [swarmMetrics, setSwarmMetrics] = useState({
    totalTasks: 281,
    completedToday: 156,
    activeAgents: 4,
    avgEfficiency: 90.3,
    costToday: 47.50,
    leadsGenerated: 89,
    contentCreated: 45,
    emailsSent: 234
  });

  // Load data from Firebase on component mount
  useEffect(() => {
    if (user?.uid) {
      loadPersistentData();
    }
  }, [user]);

  // Load persistent data from Firebase
  const loadPersistentData = async () => {
    try {
      const savedSettings = await persistenceService.loadData(user.uid, 'swarmSettings', {});
      
      if (Object.keys(savedSettings).length > 0) {
        setSwarmSettings(savedSettings);
      }
      
      setHasLoaded(true); // Mark as loaded to enable saving
    } catch (error) {
      console.error('Error loading AI swarm data:', error);
      setHasLoaded(true); // Still mark as loaded even if there's an error
    }
  };

  // Save swarm settings when they change
  useEffect(() => {
    if (user?.uid && hasLoaded) {
      persistenceService.saveData(user.uid, 'swarmSettings', swarmSettings);
      console.log('💾 Saving AI swarm settings:', swarmSettings);
    }
  }, [swarmSettings, user, hasLoaded]);

  const startSwarm = () => {
    setSwarmStatus('running');
    // Simulate agent activity
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        tasks: agent.status === 'active' || agent.status === 'busy' 
          ? agent.tasks + Math.floor(Math.random() * 3)
          : agent.tasks,
        efficiency: Math.min(100, agent.efficiency + (Math.random() - 0.5) * 2)
      })));
      
      setSwarmMetrics(prev => ({
        ...prev,
        completedToday: prev.completedToday + Math.floor(Math.random() * 5),
        costToday: prev.costToday + (Math.random() * 2),
        leadsGenerated: prev.leadsGenerated + Math.floor(Math.random() * 2)
      }));
    }, 3000);

    return () => clearInterval(interval);
  };

  const pauseSwarm = () => {
    setSwarmStatus('paused');
  };

  const stopSwarm = () => {
    setSwarmStatus('idle');
  };

  const toggleAgent = (agentId) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: agent.status === 'active' ? 'idle' : 'active' }
        : agent
    ));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'idle': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'busy': return 'Busy';
      case 'idle': return 'Idle';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600'}`}>
            AI Swarm Command Center
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Orchestrate multiple AI agents working simultaneously on your marketing automation</p>
        </div>

        {/* Swarm Control Panel */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-2xl shadow-xl p-8 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-purple-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Swarm Status</h2>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  swarmStatus === 'running' ? 'bg-green-500 animate-pulse' :
                  swarmStatus === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-lg font-semibold capitalize">{swarmStatus}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              {swarmStatus === 'idle' && (
                <button
                  onClick={startSwarm}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
                >
                  <span>▶️</span> Start Swarm
                </button>
              )}
              
              {swarmStatus === 'running' && (
                <>
                  <button
                    onClick={pauseSwarm}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all flex items-center gap-2"
                  >
                    <span>⏸️</span> Pause
                  </button>
                  <button
                    onClick={stopSwarm}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2"
                  >
                    <span>⏹️</span> Stop
                  </button>
                </>
              )}
              
              {swarmStatus === 'paused' && (
                <>
                  <button
                    onClick={startSwarm}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
                  >
                    <span>▶️</span> Resume
                  </button>
                  <button
                    onClick={stopSwarm}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2"
                  >
                    <span>⏹️</span> Stop
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Swarm Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="text-sm text-blue-600 font-medium">Active Agents</div>
              <div className="text-3xl font-bold text-blue-700">{swarmMetrics.activeAgents}/6</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
              <div className="text-sm text-green-600 font-medium">Tasks Completed</div>
              <div className="text-3xl font-bold text-green-700">{swarmMetrics.completedToday}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
              <div className="text-sm text-purple-600 font-medium">Avg Efficiency</div>
              <div className="text-3xl font-bold text-purple-700">{swarmMetrics.avgEfficiency.toFixed(1)}%</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
              <div className="text-sm text-orange-600 font-medium">Cost Today</div>
              <div className="text-3xl font-bold text-orange-700">${swarmMetrics.costToday.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* AI Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{agent.avatar}</div>
                  <div>
                    <h3 className="font-bold text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{agent.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
                  <span className="text-sm font-medium">{getStatusText(agent.status)}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">AI Model:</span>
                  <span className="font-medium">{agent.aiModel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tasks Completed:</span>
                  <span className="font-medium">{agent.tasks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Efficiency:</span>
                  <span className="font-medium">{agent.efficiency.toFixed(1)}%</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600 mb-1">Specialty:</p>
                <p className="text-sm font-medium text-gray-900">{agent.specialty}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-600 mb-1">Last Action:</p>
                <p className="text-sm text-blue-900">{agent.lastAction}</p>
              </div>

              <button
                onClick={() => toggleAgent(agent.id)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  agent.status === 'active' 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {agent.status === 'active' ? 'Pause Agent' : 'Activate Agent'}
              </button>
            </div>
          ))}
        </div>

        {/* AI-Powered Automation & Workflows Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 mb-8">
          <h3 className="text-2xl font-bold text-purple-800 mb-6 flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            AI-Powered Automation & Workflows
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Smart Workflows</h4>
              <div className="text-2xl font-bold text-purple-900">14</div>
              <div className="text-sm text-purple-700">Active automations</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Tasks Automated</h4>
              <div className="text-2xl font-bold text-blue-900">120</div>
              <div className="text-sm text-blue-700">This month</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Time Saved</h4>
              <div className="text-2xl font-bold text-green-900">45h</div>
              <div className="text-sm text-green-700">Per week</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div>
                <h4 className="font-semibold text-purple-800">Lead Qualification Workflow</h4>
                <p className="text-sm text-purple-600">Automatically scores and routes new leads using AI</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Active</span>
                <button className="text-purple-600 hover:text-purple-800 text-lg">⚙️</button>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div>
                <h4 className="font-semibold text-blue-800">Email Sequence Automation</h4>
                <p className="text-sm text-blue-600">Personalized follow-up sequences based on AI behavior analysis</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Active</span>
                <button className="text-blue-600 hover:text-blue-800 text-lg">⚙️</button>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
              <div>
                <h4 className="font-semibold text-green-800">Social Media AI Scheduler</h4>
                <p className="text-sm text-green-600">AI-optimized posting times and content generation</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Paused</span>
                <button className="text-green-600 hover:text-green-800 text-lg">⚙️</button>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <div>
                <h4 className="font-semibold text-orange-800">Smart Meeting Scheduler</h4>
                <p className="text-sm text-orange-600">AI-powered appointment booking and calendar optimization</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Active</span>
                <button className="text-orange-600 hover:text-orange-800 text-lg">⚙️</button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all">
              Create New Workflow
            </button>
            <button className="bg-purple-100 text-purple-700 px-6 py-2 rounded-lg hover:bg-purple-200 transition-colors">
              View All Automations
            </button>
          </div>
        </div>

        {/* Swarm Configuration */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Swarm Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Concurrent Tasks</label>
              <input
                type="number"
                value={swarmSettings.maxConcurrentTasks}
                onChange={(e) => setSwarmSettings(prev => ({ ...prev, maxConcurrentTasks: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Budget Limit ($)</label>
              <input
                type="number"
                value={swarmSettings.budgetLimit}
                onChange={(e) => setSwarmSettings(prev => ({ ...prev, budgetLimit: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality Threshold (%)</label>
              <input
                type="number"
                value={swarmSettings.qualityThreshold}
                onChange={(e) => setSwarmSettings(prev => ({ ...prev, qualityThreshold: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={swarmSettings.agentCollaboration}
                onChange={(e) => setSwarmSettings(prev => ({ ...prev, agentCollaboration: e.target.checked }))}
                className="mr-3 w-4 h-4 text-purple-600"
              />
              <label className="text-sm font-medium text-gray-700">Enable Agent Collaboration</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={swarmSettings.autoScaling}
                onChange={(e) => setSwarmSettings(prev => ({ ...prev, autoScaling: e.target.checked }))}
                className="mr-3 w-4 h-4 text-purple-600"
              />
              <label className="text-sm font-medium text-gray-700">Auto-Scale Based on Workload</label>
            </div>
          </div>

          <button className="mt-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISwarmDashboard;
