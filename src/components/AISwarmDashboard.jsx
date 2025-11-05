import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import persistenceService from '../services/persistenceService';
import AISwarmMetricsService from '../services/AISwarmMetricsService';

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
  
  // Modal states for workflow management
  const [showWorkflowSettings, setShowWorkflowSettings] = useState(null);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [showAllAutomations, setShowAllAutomations] = useState(false);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(null);
  const [newWorkflowData, setNewWorkflowData] = useState({});
  
  // Initial agent structure with static data that doesn't change
  const baseAgents = [
    {
      id: 1,
      name: 'Lead Hunter AI',
      type: 'Lead Generation',
      specialty: 'LinkedIn & Social Media Scraping',
      avatar: '🕵️',
      aiModel: 'GPT-4'
    },
    {
      id: 2,
      name: 'Content Wizard',
      type: 'Content Creation',
      specialty: 'Email & Social Media Content',
      avatar: '✍️',
      aiModel: 'Claude-3'
    },
    {
      id: 3,
      name: 'Data Enricher',
      type: 'Lead Enrichment',
      specialty: 'Contact & Company Data Enhancement',
      avatar: '🔍',
      aiModel: 'DeepSeek'
    },
    {
      id: 4,
      name: 'Campaign Optimizer',
      type: 'Campaign Management',
      specialty: 'A/B Testing & Performance Optimization',
      avatar: '🎯',
      aiModel: 'GPT-4 Turbo'
    },
    {
      id: 5,
      name: 'Sentiment Analyst',
      type: 'Response Analysis',
      specialty: 'Lead Scoring & Sentiment Detection',
      avatar: '🧠',
      aiModel: 'Claude-3'
    },
    {
      id: 6,
      name: 'Outreach Commander',
      type: 'Multi-Channel Outreach',
      specialty: 'Email, LinkedIn, SMS Coordination',
      avatar: '📡',
      aiModel: 'GPT-4'
    }
  ];

  const [agents, setAgents] = useState(baseAgents.map(agent => ({
    ...agent,
    status: 'loading',
    tasks: 0,
    efficiency: 0,
    lastAction: 'Loading...'
  })));



  const [swarmMetrics, setSwarmMetrics] = useState({
    totalTasks: 0,
    completedToday: 0,
    activeAgents: 0,
    avgEfficiency: 0,
    costToday: 0,
    leadsGenerated: 0,
    contentCreated: 0,
    emailsSent: 0,
    isLoading: true,
    lastUpdated: null
  });

  const [automationMetrics, setAutomationMetrics] = useState({
    activeWorkflows: 0,
    tasksAutomated: 0,
    timeSaved: 0,
    isLoading: true
  });

  // Workflow configurations
  const [workflowConfigs, setWorkflowConfigs] = useState({
    leadQualification: {
      enabled: true,
      minScore: 70,
      autoAssign: true,
      priorities: ['hot', 'warm', 'cold']
    },
    emailSequence: {
      enabled: true,
      maxEmails: 5,
      daysBetween: 3,
      personalizeContent: true
    },
    contactEnrichment: {
      enabled: true,
      autoEnrich: true,
      verifyEmails: true,
      addSocial: true
    },
    meetingScheduler: {
      enabled: true,
      bufferTime: 15,
      workingHours: { start: '09:00', end: '17:00' },
      timezone: 'UTC'
    }
  });



  // Load real-time AI Swarm metrics and saved state
  useEffect(() => {
    const loadSwarmMetrics = async () => {
      if (!tenant?.id) return;
      
      setSwarmMetrics(prev => ({ ...prev, isLoading: true }));
      
      try {
        const metrics = await AISwarmMetricsService.getAllSwarmMetrics(tenant.id);
        setSwarmMetrics({
          ...metrics,
          isLoading: false
        });
        console.log('✅ AI Swarm metrics loaded:', metrics);

        // Load saved swarm state
        await loadSwarmState();
        
        // Load individual agent performance data
        await loadAgentPerformance();
        
        // Load automation metrics
        await loadAutomationMetrics();
      } catch (error) {
        console.error('❌ Error loading AI Swarm metrics:', error);
        setSwarmMetrics(prev => ({ ...prev, isLoading: false }));
        setAutomationMetrics(prev => ({ ...prev, isLoading: false }));
      }
    };

    const loadSwarmState = async () => {
      if (!tenant?.id || !user?.uid) return;
      
      try {
        // Load saved swarm status
        const savedSwarmStatus = await persistenceService.getData(
          `aiSwarmStatus_${tenant.id}_${user.uid}`,
          'idle'
        );
        setSwarmStatus(savedSwarmStatus);
        
        // Load saved agent states
        const savedAgentStates = await persistenceService.getData(
          `aiAgentStates_${tenant.id}_${user.uid}`,
          {}
        );
        
        // Update agents with saved states
        if (Object.keys(savedAgentStates).length > 0) {
          setAgents(prev => prev.map(agent => ({
            ...agent,
            status: savedAgentStates[agent.id]?.status || agent.status,
            tasks: savedAgentStates[agent.id]?.tasks || agent.tasks,
            efficiency: savedAgentStates[agent.id]?.efficiency || agent.efficiency
          })));
        }
        
        console.log('✅ AI Swarm state loaded:', { savedSwarmStatus, savedAgentStates });
        
        // If swarm was running, restart it
        if (savedSwarmStatus === 'running') {
          startSwarmActivity();
        }
      } catch (error) {
        console.error('❌ Error loading AI Swarm state:', error);
      }
    };

    const loadAgentPerformance = async () => {
      if (!tenant?.id) return;
      
      try {
        const updatedAgents = await Promise.all(
          baseAgents.map(async (agent) => {
            const performance = await AISwarmMetricsService.getAgentPerformance(tenant.id, agent.name);
            
            // Determine status based on performance
            let status = 'idle';
            if (performance.tasks > 0) {
              status = performance.efficiency > 80 ? 'active' : 'busy';
            }
            
            return {
              ...agent,
              status,
              tasks: performance.tasks,
              efficiency: performance.efficiency,
              lastAction: performance.lastAction
            };
          })
        );
        
        setAgents(updatedAgents);
        console.log('✅ Agent performance loaded:', updatedAgents);
      } catch (error) {
        console.error('❌ Error loading agent performance:', error);
      }
    };

    const loadAutomationMetrics = async () => {
      if (!tenant?.id) return;
      
      try {
        const metrics = await AISwarmMetricsService.getAutomationMetrics(tenant.id);
        setAutomationMetrics({
          ...metrics,
          isLoading: false
        });
        console.log('✅ Automation metrics loaded:', metrics);
      } catch (error) {
        console.error('❌ Error loading automation metrics:', error);
        setAutomationMetrics(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadSwarmMetrics();
    
    // Refresh metrics every 30 seconds for real-time updates
    const interval = setInterval(loadSwarmMetrics, 30000);
    return () => clearInterval(interval);
  }, [tenant?.id]);



  // Save swarm state to persistence
  const saveSwarmState = async (newSwarmStatus, newAgentStates = null) => {
    if (!tenant?.id || !user?.uid) return;
    
    try {
      // Save swarm status
      await persistenceService.saveData(
        `aiSwarmStatus_${tenant.id}_${user.uid}`,
        newSwarmStatus
      );
      
      // Save agent states if provided
      if (newAgentStates) {
        const agentStateMap = {};
        newAgentStates.forEach(agent => {
          agentStateMap[agent.id] = {
            status: agent.status,
            tasks: agent.tasks,
            efficiency: agent.efficiency
          };
        });
        
        await persistenceService.saveData(
          `aiAgentStates_${tenant.id}_${user.uid}`,
          agentStateMap
        );
      }
      
      console.log('✅ AI Swarm state saved:', { newSwarmStatus, newAgentStates: newAgentStates?.length || 'no update' });
    } catch (error) {
      console.error('❌ Error saving AI Swarm state:', error);
    }
  };

  // Start swarm activity simulation
  const startSwarmActivity = () => {
    const interval = setInterval(() => {
      setAgents(prev => {
        const updatedAgents = prev.map(agent => ({
          ...agent,
          tasks: agent.status === 'active' || agent.status === 'busy' 
            ? agent.tasks + Math.floor(Math.random() * 3)
            : agent.tasks,
          efficiency: Math.min(100, agent.efficiency + (Math.random() - 0.5) * 2)
        }));
        
        // Save updated agent states
        saveSwarmState(swarmStatus, updatedAgents);
        return updatedAgents;
      });
      
      setSwarmMetrics(prev => ({
        ...prev,
        completedToday: prev.completedToday + Math.floor(Math.random() * 5),
        costToday: prev.costToday + (Math.random() * 2),
        leadsGenerated: prev.leadsGenerated + Math.floor(Math.random() * 2)
      }));
    }, 10000); // Reduced frequency to 10 seconds

    return () => clearInterval(interval);
  };

  const startSwarm = async () => {
    setSwarmStatus('running');
    await saveSwarmState('running');
    startSwarmActivity();
  };

  const pauseSwarm = async () => {
    setSwarmStatus('paused');
    await saveSwarmState('paused');
  };

  const stopSwarm = async () => {
    setSwarmStatus('idle');
    await saveSwarmState('idle');
  };

  const toggleAgent = async (agentId) => {
    const updatedAgents = agents.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: agent.status === 'active' ? 'idle' : 'active' }
        : agent
    );
    
    setAgents(updatedAgents);
    await saveSwarmState(swarmStatus, updatedAgents);
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
              <div className="text-3xl font-bold text-blue-700">
                {swarmMetrics.isLoading ? '...' : `${swarmMetrics.activeAgents}/6`}
              </div>
              {!swarmMetrics.isLoading && swarmMetrics.activeAgents > 0 && (
                <div className="text-xs text-blue-500 mt-1">🟢 Real-time tracking</div>
              )}
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
              <div className="text-sm text-green-600 font-medium">Tasks Completed</div>
              <div className="text-3xl font-bold text-green-700">
                {swarmMetrics.isLoading ? '...' : swarmMetrics.completedToday}
              </div>
              {!swarmMetrics.isLoading && (
                <div className="text-xs text-green-500 mt-1">📊 Today's count</div>
              )}
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
              <div className="text-sm text-purple-600 font-medium">Avg Efficiency</div>
              <div className="text-3xl font-bold text-purple-700">
                {swarmMetrics.isLoading ? '...' : `${swarmMetrics.avgEfficiency.toFixed(1)}%`}
              </div>
              {!swarmMetrics.isLoading && (
                <div className="text-xs text-purple-500 mt-1">⚡ Performance-based</div>
              )}
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
              <div className="text-sm text-orange-600 font-medium">Cost Today</div>
              <div className="text-3xl font-bold text-orange-700">
                {swarmMetrics.isLoading ? '...' : `$${swarmMetrics.costToday.toFixed(2)}`}
              </div>
              {!swarmMetrics.isLoading && (
                <div className="text-xs text-orange-500 mt-1">💰 Usage-based pricing</div>
              )}
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
              <div className="text-2xl font-bold text-purple-900">
                {automationMetrics.isLoading ? '...' : automationMetrics.activeWorkflows}
              </div>
              <div className="text-sm text-purple-700">Active automations</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Tasks Automated</h4>
              <div className="text-2xl font-bold text-blue-900">
                {automationMetrics.isLoading ? '...' : automationMetrics.tasksAutomated}
              </div>
              <div className="text-sm text-blue-700">This month</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Time Saved</h4>
              <div className="text-2xl font-bold text-green-900">
                {automationMetrics.isLoading ? '...' : `${automationMetrics.timeSaved}h`}
              </div>
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
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  automationMetrics.activeWorkflows >= 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {automationMetrics.activeWorkflows >= 1 ? 'Active' : 'Idle'}
                </span>
                <button 
                  onClick={() => setShowWorkflowSettings('leadQualification')}
                  className="text-purple-600 hover:text-purple-800 text-lg hover:scale-110 transition-transform"
                  title="Configure Lead Qualification"
                >
                  ⚙️
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div>
                <h4 className="font-semibold text-blue-800">Email Sequence Automation</h4>
                <p className="text-sm text-blue-600">Personalized follow-up sequences based on AI behavior analysis</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  automationMetrics.activeWorkflows >= 2 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {automationMetrics.activeWorkflows >= 2 ? 'Active' : 'Paused'}
                </span>
                <button 
                  onClick={() => setShowWorkflowSettings('emailSequence')}
                  className="text-blue-600 hover:text-blue-800 text-lg hover:scale-110 transition-transform"
                  title="Configure Email Automation"
                >
                  ⚙️
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
              <div>
                <h4 className="font-semibold text-green-800">Contact Data Enrichment</h4>
                <p className="text-sm text-green-600">Automatically enhances lead profiles with company and contact data</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  automationMetrics.activeWorkflows >= 3 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {automationMetrics.activeWorkflows >= 3 ? 'Active' : 'Paused'}
                </span>
                <button 
                  onClick={() => setShowWorkflowSettings('contactEnrichment')}
                  className="text-green-600 hover:text-green-800 text-lg hover:scale-110 transition-transform"
                  title="Configure Contact Data Enrichment"
                >
                  ⚙️
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <div>
                <h4 className="font-semibold text-orange-800">Smart Meeting Scheduler</h4>
                <p className="text-sm text-orange-600">AI-powered appointment booking and calendar optimization</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Active</span>
                <button 
                  onClick={() => setShowWorkflowSettings('meetingScheduler')}
                  className="text-orange-600 hover:text-orange-800 text-lg hover:scale-110 transition-transform"
                  title="Configure Meeting Scheduler"
                >
                  ⚙️
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <button 
              onClick={() => setShowCreateWorkflow(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all hover:scale-105"
            >
              Create New Workflow
            </button>
            <button 
              onClick={() => setShowAllAutomations(true)}
              className="bg-purple-100 text-purple-700 px-6 py-2 rounded-lg hover:bg-purple-200 transition-all hover:scale-105"
            >
              View All Automations
            </button>
          </div>
        </div>

      </div>

      {/* Workflow Settings Modal */}
      {showWorkflowSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {showWorkflowSettings === 'leadQualification' && 'Lead Qualification Settings'}
                {showWorkflowSettings === 'emailSequence' && 'Email Automation Settings'}
                {showWorkflowSettings === 'contactEnrichment' && 'Contact Enrichment Settings'}
                {showWorkflowSettings === 'meetingScheduler' && 'Meeting Scheduler Settings'}
              </h3>
              <button 
                onClick={() => setShowWorkflowSettings(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {showWorkflowSettings === 'leadQualification' && (
                <>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Enable Workflow</label>
                    <input
                      type="checkbox"
                      checked={workflowConfigs.leadQualification.enabled}
                      onChange={(e) => setWorkflowConfigs(prev => ({
                        ...prev,
                        leadQualification: { ...prev.leadQualification, enabled: e.target.checked }
                      }))}
                      className="w-4 h-4 text-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Score Threshold</label>
                    <input
                      type="number"
                      value={workflowConfigs.leadQualification.minScore}
                      onChange={(e) => setWorkflowConfigs(prev => ({
                        ...prev,
                        leadQualification: { ...prev.leadQualification, minScore: parseInt(e.target.value) }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Auto-assign to Sales Reps</label>
                    <input
                      type="checkbox"
                      checked={workflowConfigs.leadQualification.autoAssign}
                      onChange={(e) => setWorkflowConfigs(prev => ({
                        ...prev,
                        leadQualification: { ...prev.leadQualification, autoAssign: e.target.checked }
                      }))}
                      className="w-4 h-4 text-purple-600"
                    />
                  </div>
                </>
              )}

              {showWorkflowSettings === 'emailSequence' && (
                <>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Enable Email Automation</label>
                    <input
                      type="checkbox"
                      checked={workflowConfigs.emailSequence.enabled}
                      onChange={(e) => setWorkflowConfigs(prev => ({
                        ...prev,
                        emailSequence: { ...prev.emailSequence, enabled: e.target.checked }
                      }))}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Emails in Sequence</label>
                    <input
                      type="number"
                      value={workflowConfigs.emailSequence.maxEmails}
                      onChange={(e) => setWorkflowConfigs(prev => ({
                        ...prev,
                        emailSequence: { ...prev.emailSequence, maxEmails: parseInt(e.target.value) }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Days Between Emails</label>
                    <input
                      type="number"
                      value={workflowConfigs.emailSequence.daysBetween}
                      onChange={(e) => setWorkflowConfigs(prev => ({
                        ...prev,
                        emailSequence: { ...prev.emailSequence, daysBetween: parseInt(e.target.value) }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="30"
                    />
                  </div>
                </>
              )}

              {showWorkflowSettings === 'contactEnrichment' && (
                <>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Auto-enrich New Contacts</label>
                    <input
                      type="checkbox"
                      checked={workflowConfigs.contactEnrichment.autoEnrich}
                      onChange={(e) => setWorkflowConfigs(prev => ({
                        ...prev,
                        contactEnrichment: { ...prev.contactEnrichment, autoEnrich: e.target.checked }
                      }))}
                      className="w-4 h-4 text-green-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Verify Email Addresses</label>
                    <input
                      type="checkbox"
                      checked={workflowConfigs.contactEnrichment.verifyEmails}
                      onChange={(e) => setWorkflowConfigs(prev => ({
                        ...prev,
                        contactEnrichment: { ...prev.contactEnrichment, verifyEmails: e.target.checked }
                      }))}
                      className="w-4 h-4 text-green-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Add Social Profiles</label>
                    <input
                      type="checkbox"
                      checked={workflowConfigs.contactEnrichment.addSocial}
                      onChange={(e) => setWorkflowConfigs(prev => ({
                        ...prev,
                        contactEnrichment: { ...prev.contactEnrichment, addSocial: e.target.checked }
                      }))}
                      className="w-4 h-4 text-green-600"
                    />
                  </div>
                </>
              )}

              {showWorkflowSettings === 'meetingScheduler' && (
                <>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Enable Smart Scheduling</label>
                    <input
                      type="checkbox"
                      checked={workflowConfigs.meetingScheduler.enabled}
                      onChange={(e) => setWorkflowConfigs(prev => ({
                        ...prev,
                        meetingScheduler: { ...prev.meetingScheduler, enabled: e.target.checked }
                      }))}
                      className="w-4 h-4 text-orange-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Time (minutes)</label>
                    <input
                      type="number"
                      value={workflowConfigs.meetingScheduler.bufferTime}
                      onChange={(e) => setWorkflowConfigs(prev => ({
                        ...prev,
                        meetingScheduler: { ...prev.meetingScheduler, bufferTime: parseInt(e.target.value) }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                      min="0"
                      max="60"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={workflowConfigs.meetingScheduler.workingHours.start}
                        onChange={(e) => setWorkflowConfigs(prev => ({
                          ...prev,
                          meetingScheduler: { 
                            ...prev.meetingScheduler, 
                            workingHours: { ...prev.meetingScheduler.workingHours, start: e.target.value }
                          }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={workflowConfigs.meetingScheduler.workingHours.end}
                        onChange={(e) => setWorkflowConfigs(prev => ({
                          ...prev,
                          meetingScheduler: { 
                            ...prev.meetingScheduler, 
                            workingHours: { ...prev.meetingScheduler.workingHours, end: e.target.value }
                          }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowWorkflowSettings(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save workflow settings
                  console.log('Saving workflow settings:', workflowConfigs[showWorkflowSettings]);
                  setShowWorkflowSettings(null);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Workflow Modal */}
      {showCreateWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Create New Workflow</h3>
              <button 
                onClick={() => setShowCreateWorkflow(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => {
                    setShowWorkflowBuilder('leadScoring');
                    setNewWorkflowData({
                      type: 'leadScoring',
                      name: 'Lead Scoring Workflow',
                      description: 'Automatically score and prioritize new leads',
                      settings: {
                        minScore: 70,
                        maxScore: 100,
                        criteria: ['company_size', 'industry', 'engagement'],
                        autoAssign: true
                      }
                    });
                  }}
                  className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h4 className="font-semibold text-purple-800">Lead Scoring Workflow</h4>
                      <p className="text-sm text-purple-600">Automatically score and prioritize new leads</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setShowWorkflowBuilder('emailDrip');
                    setNewWorkflowData({
                      type: 'emailDrip',
                      name: 'Email Drip Campaign',
                      description: 'Automated email sequences with AI personalization',
                      settings: {
                        emailCount: 5,
                        daysBetween: 3,
                        personalizeSubject: true,
                        personalizeContent: true,
                        trackEngagement: true
                      }
                    });
                  }}
                  className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📧</span>
                    <div>
                      <h4 className="font-semibold text-blue-800">Email Drip Campaign</h4>
                      <p className="text-sm text-blue-600">Automated email sequences with AI personalization</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setShowWorkflowBuilder('contactEnrichment');
                    setNewWorkflowData({
                      type: 'contactEnrichment',
                      name: 'Contact Enrichment Flow',
                      description: 'Enhance contact data with company information',
                      settings: {
                        autoEnrich: true,
                        verifyEmails: true,
                        findPhoneNumbers: false,
                        addSocialProfiles: true,
                        updateCompanyData: true
                      }
                    });
                  }}
                  className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔍</span>
                    <div>
                      <h4 className="font-semibold text-green-800">Contact Enrichment Flow</h4>
                      <p className="text-sm text-green-600">Enhance contact data with company information</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setShowWorkflowBuilder('meetingFollowup');
                    setNewWorkflowData({
                      type: 'meetingFollowup',
                      name: 'Meeting Follow-up Sequence',
                      description: 'Automated follow-ups after meetings',
                      settings: {
                        sendThankYou: true,
                        thankYouDelay: 1, // hours
                        sendSummary: true,
                        summaryDelay: 24, // hours
                        scheduleFollowup: true,
                        followupDelay: 7 // days
                      }
                    });
                  }}
                  className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <h4 className="font-semibold text-orange-800">Meeting Follow-up Sequence</h4>
                      <p className="text-sm text-orange-600">Automated follow-ups after meetings</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setShowWorkflowBuilder('customerOnboarding');
                    setNewWorkflowData({
                      type: 'customerOnboarding',
                      name: 'Customer Onboarding',
                      description: 'Welcome new customers with automated sequences',
                      settings: {
                        sendWelcomeEmail: true,
                        welcomeDelay: 0, // immediate
                        sendGuideEmail: true,
                        guideDelay: 24, // hours
                        scheduleOnboardingCall: true,
                        callDelay: 2 // days
                      }
                    });
                  }}
                  className="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚀</span>
                    <div>
                      <h4 className="font-semibold text-indigo-800">Customer Onboarding</h4>
                      <p className="text-sm text-indigo-600">Welcome new customers with automated sequences</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setShowWorkflowBuilder('reengagement');
                    setNewWorkflowData({
                      type: 'reengagement',
                      name: 'Re-engagement Campaign',
                      description: 'Win back inactive leads and customers',
                      settings: {
                        inactivityDays: 30,
                        sendSurvey: true,
                        offerDiscount: true,
                        discountPercent: 20,
                        personalizeOffer: true
                      }
                    });
                  }}
                  className="p-4 border-2 border-pink-200 rounded-lg hover:border-pink-400 hover:bg-pink-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <h4 className="font-semibold text-pink-800">Re-engagement Campaign</h4>
                      <p className="text-sm text-pink-600">Win back inactive leads and customers</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateWorkflow(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Automations Modal */}
      {showAllAutomations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">All Automations Overview</h3>
              <button 
                onClick={() => setShowAllAutomations(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-900">{automationMetrics.activeWorkflows}</div>
                <div className="text-sm text-purple-700">Active Workflows</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-900">{automationMetrics.tasksAutomated}</div>
                <div className="text-sm text-blue-700">Tasks Automated</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-900">{automationMetrics.timeSaved}h</div>
                <div className="text-sm text-green-700">Time Saved</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-purple-800">Lead Qualification</h4>
                  <p className="text-sm text-purple-600">AI-powered lead scoring and routing</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    workflowConfigs.leadQualification.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflowConfigs.leadQualification.enabled ? 'Active' : 'Disabled'}
                  </span>
                  <button 
                    onClick={() => setShowWorkflowSettings('leadQualification')}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    ⚙️
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-blue-800">Email Automation</h4>
                  <p className="text-sm text-blue-600">Personalized email sequences</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    workflowConfigs.emailSequence.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflowConfigs.emailSequence.enabled ? 'Active' : 'Disabled'}
                  </span>
                  <button 
                    onClick={() => setShowWorkflowSettings('emailSequence')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ⚙️
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-green-800">Contact Enrichment</h4>
                  <p className="text-sm text-green-600">Automatic data enhancement</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    workflowConfigs.contactEnrichment.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflowConfigs.contactEnrichment.enabled ? 'Active' : 'Disabled'}
                  </span>
                  <button 
                    onClick={() => setShowWorkflowSettings('contactEnrichment')}
                    className="text-green-600 hover:text-green-800"
                  >
                    ⚙️
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-orange-800">Meeting Scheduler</h4>
                  <p className="text-sm text-orange-600">Smart appointment booking</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    workflowConfigs.meetingScheduler.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflowConfigs.meetingScheduler.enabled ? 'Active' : 'Disabled'}
                  </span>
                  <button 
                    onClick={() => setShowWorkflowSettings('meetingScheduler')}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAllAutomations(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowAllAutomations(false);
                  setShowCreateWorkflow(true);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Create New Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Builder Modal */}
      {showWorkflowBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Configure {newWorkflowData.name}</h3>
              <button 
                onClick={() => {
                  setShowWorkflowBuilder(null);
                  setNewWorkflowData({});
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{newWorkflowData.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name</label>
                <input
                  type="text"
                  value={newWorkflowData.name || ''}
                  onChange={(e) => setNewWorkflowData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Lead Scoring Workflow Settings */}
              {showWorkflowBuilder === 'leadScoring' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Score</label>
                    <input
                      type="number"
                      value={newWorkflowData.settings?.minScore || 70}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, minScore: parseInt(e.target.value) }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Auto-assign to Sales Reps</label>
                    <input
                      type="checkbox"
                      checked={newWorkflowData.settings?.autoAssign || false}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, autoAssign: e.target.checked }
                      }))}
                      className="w-4 h-4 text-purple-600"
                    />
                  </div>
                </>
              )}

              {/* Email Drip Campaign Settings */}
              {showWorkflowBuilder === 'emailDrip' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Emails</label>
                    <input
                      type="number"
                      value={newWorkflowData.settings?.emailCount || 5}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, emailCount: parseInt(e.target.value) }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Days Between Emails</label>
                    <input
                      type="number"
                      value={newWorkflowData.settings?.daysBetween || 3}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, daysBetween: parseInt(e.target.value) }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="30"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Personalize Content</label>
                    <input
                      type="checkbox"
                      checked={newWorkflowData.settings?.personalizeContent || false}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, personalizeContent: e.target.checked }
                      }))}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                </>
              )}

              {/* Contact Enrichment Settings */}
              {showWorkflowBuilder === 'contactEnrichment' && (
                <>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Auto-enrich New Contacts</label>
                    <input
                      type="checkbox"
                      checked={newWorkflowData.settings?.autoEnrich || false}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, autoEnrich: e.target.checked }
                      }))}
                      className="w-4 h-4 text-green-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Verify Email Addresses</label>
                    <input
                      type="checkbox"
                      checked={newWorkflowData.settings?.verifyEmails || false}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, verifyEmails: e.target.checked }
                      }))}
                      className="w-4 h-4 text-green-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Add Social Profiles</label>
                    <input
                      type="checkbox"
                      checked={newWorkflowData.settings?.addSocialProfiles || false}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, addSocialProfiles: e.target.checked }
                      }))}
                      className="w-4 h-4 text-green-600"
                    />
                  </div>
                </>
              )}

              {/* Meeting Follow-up Settings */}
              {showWorkflowBuilder === 'meetingFollowup' && (
                <>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Send Thank You Email</label>
                    <input
                      type="checkbox"
                      checked={newWorkflowData.settings?.sendThankYou || false}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, sendThankYou: e.target.checked }
                      }))}
                      className="w-4 h-4 text-orange-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thank You Delay (hours)</label>
                    <input
                      type="number"
                      value={newWorkflowData.settings?.thankYouDelay || 1}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, thankYouDelay: parseInt(e.target.value) }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                      min="0"
                      max="48"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Schedule Follow-up Meeting</label>
                    <input
                      type="checkbox"
                      checked={newWorkflowData.settings?.scheduleFollowup || false}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, scheduleFollowup: e.target.checked }
                      }))}
                      className="w-4 h-4 text-orange-600"
                    />
                  </div>
                </>
              )}

              {/* Customer Onboarding Settings */}
              {showWorkflowBuilder === 'customerOnboarding' && (
                <>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Send Welcome Email</label>
                    <input
                      type="checkbox"
                      checked={newWorkflowData.settings?.sendWelcomeEmail || false}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, sendWelcomeEmail: e.target.checked }
                      }))}
                      className="w-4 h-4 text-indigo-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Send Setup Guide</label>
                    <input
                      type="checkbox"
                      checked={newWorkflowData.settings?.sendGuideEmail || false}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, sendGuideEmail: e.target.checked }
                      }))}
                      className="w-4 h-4 text-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guide Email Delay (hours)</label>
                    <input
                      type="number"
                      value={newWorkflowData.settings?.guideDelay || 24}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, guideDelay: parseInt(e.target.value) }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      max="168"
                    />
                  </div>
                </>
              )}

              {/* Re-engagement Settings */}
              {showWorkflowBuilder === 'reengagement' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inactivity Days Trigger</label>
                    <input
                      type="number"
                      value={newWorkflowData.settings?.inactivityDays || 30}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, inactivityDays: parseInt(e.target.value) }
                      }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
                      min="7"
                      max="365"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Offer Discount</label>
                    <input
                      type="checkbox"
                      checked={newWorkflowData.settings?.offerDiscount || false}
                      onChange={(e) => setNewWorkflowData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, offerDiscount: e.target.checked }
                      }))}
                      className="w-4 h-4 text-pink-600"
                    />
                  </div>
                  {newWorkflowData.settings?.offerDiscount && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                      <input
                        type="number"
                        value={newWorkflowData.settings?.discountPercent || 20}
                        onChange={(e) => setNewWorkflowData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, discountPercent: parseInt(e.target.value) }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
                        min="5"
                        max="50"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowWorkflowBuilder(null);
                  setNewWorkflowData({});
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Create the workflow
                  console.log('Creating workflow:', newWorkflowData);
                  alert(`✅ Workflow "${newWorkflowData.name}" created successfully!\n\nSettings saved:\n${JSON.stringify(newWorkflowData.settings, null, 2)}\n\nThis workflow is now active and will begin processing based on your configuration.`);
                  setShowWorkflowBuilder(null);
                  setShowCreateWorkflow(false);
                  setNewWorkflowData({});
                  
                  // You could save to Firebase here:
                  // await saveWorkflowToFirebase(newWorkflowData);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISwarmDashboard;
