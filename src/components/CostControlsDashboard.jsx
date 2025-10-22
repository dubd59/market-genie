import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import AIUsageTracker from '../services/AIUsageTracker';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from '../security/SecureFirebase.js';

const CostControlsDashboard = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
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

  // Load real AI usage data
  useEffect(() => {
    const loadUsageData = async () => {
      if (!tenant?.id) return;
      
      setIsLoading(true);
      
      try {
        const usageReport = await AIUsageTracker.getUsageReport(tenant.id);
        if (usageReport && usageReport.ai && usageReport.automation) {
          setRealUsageData(usageReport);
          
          // Update cost breakdown with real data
          setCostBreakdown(prev => ({
            ...prev,
            aiServices: {
              openai: { 
                ...(prev?.aiServices?.openai || {}), 
                used: usageReport?.ai?.openai || 0,
                currentTokens: usageReport?.ai?.tokens?.openai || 0
              },
              claude: { 
                ...(prev?.aiServices?.claude || {}), 
                used: usageReport?.ai?.claude || 0,
                currentTokens: usageReport?.ai?.tokens?.claude || 0
              },
              deepseek: { 
                ...(prev?.aiServices?.deepseek || {}), 
                used: usageReport?.ai?.deepseek || 0,
                currentTokens: usageReport?.ai?.tokens?.deepseek || 0
              }
            },
            automationTools: {
              workflows: { 
                ...(prev?.automationTools?.workflows || {}), 
                currentRuns: usageReport?.automation?.workflows || 0
              },
              enrichment: { 
                ...(prev?.automationTools?.enrichment || {}), 
                currentEnrichments: usageReport?.automation?.enrichments || 0
              }
            }
          }));
          
          console.log('✅ Real AI usage data loaded:', usageReport);
        }
      } catch (error) {
        console.error('❌ Error loading usage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsageData();
    
    // Refresh every 5 minutes for real-time monitoring
    const interval = setInterval(loadUsageData, 300000);
    return () => clearInterval(interval);
  }, [tenant?.id]);

  const [budgetSettings, setBudgetSettings] = useState({
    monthlyBudget: 200, // AI services monthly limit
    autoScale: false, // Don't auto-scale AI limits
    alertThreshold: 75, // Alert at 75% usage 
    emergencyStop: 90, // Hard stop at 90% to prevent overages
    aiSafetyMode: true, // Enable AI safety controls
    rateLimitBuffer: 20 // Keep 20% buffer below rate limits
  });

  // Load saved budget settings
  useEffect(() => {
    const loadBudgetSettings = async () => {
      if (!tenant?.id) return;
      
      try {
        const settingsDoc = await getDoc(doc(db, 'MarketGenie_budget_settings', tenant.id));
        if (settingsDoc.exists()) {
          const savedSettings = settingsDoc.data();
          setBudgetSettings(prev => ({...prev, ...savedSettings}));
          console.log('✅ Budget settings loaded:', savedSettings);
        }
      } catch (error) {
        console.error('❌ Error loading budget settings:', error);
      }
    };

    loadBudgetSettings();
  }, [tenant?.id]);

  // Save budget settings to Firebase
  const saveBudgetSettings = async () => {
    if (!tenant?.id) return;

    try {
      await setDoc(doc(db, 'MarketGenie_budget_settings', tenant.id), {
        ...budgetSettings,
        updatedAt: new Date(),
        updatedBy: user?.email || 'anonymous'
      });
      
      console.log('✅ Budget settings saved successfully');
      
      // Show success feedback
      alert('Budget settings saved successfully! 🎉');
      
    } catch (error) {
      console.error('❌ Error saving budget settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };



  const [costBreakdown, setCostBreakdown] = useState({
    aiServices: {
      openai: { used: 0, limit: 100, name: 'OpenAI GPT-4', rateLimit: '10,000 tokens/hour', currentTokens: 0 },
      claude: { used: 0, limit: 75, name: 'Anthropic Claude-3', rateLimit: '8,000 tokens/hour', currentTokens: 0 },
      deepseek: { used: 0, limit: 50, name: 'DeepSeek AI', rateLimit: '5,000 tokens/hour', currentTokens: 0 }
    },
    automationTools: {
      workflows: { used: 0, limit: 25, name: 'AI Workflow Executions', rateLimit: '100 workflows/hour', currentRuns: 0 },
      enrichment: { used: 0, limit: 20, name: 'Contact Data Enrichment', rateLimit: '500 contacts/hour', currentEnrichments: 0 }
    }
  });

  const [realUsageData, setRealUsageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTotalUsed = () => {
    const total = Object.values(costBreakdown).reduce((acc, category) => {
      return acc + Object.values(category).reduce((catAcc, service) => catAcc + service.used, 0);
    }, 0);
    return total;
  };

  const getTotalLimit = () => {
    const total = Object.values(costBreakdown).reduce((acc, category) => {
      return acc + Object.values(category).reduce((catAcc, service) => catAcc + service.limit, 0);
    }, 0);
    return total;
  };

  const getUsagePercentage = () => {
    return (getTotalUsed() / budgetSettings.monthlyBudget) * 100;
  };

  const updateBudget = (newBudget) => {
    setBudgetSettings(prev => ({ ...prev, monthlyBudget: newBudget }));
    
    // Auto-scale individual service limits based on new budget
    if (budgetSettings.autoScale) {
      const scaleFactor = newBudget / budgetSettings.monthlyBudget;
      setCostBreakdown(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(category => {
          Object.keys(updated[category]).forEach(service => {
            updated[category][service].limit = Math.round(updated[category][service].limit * scaleFactor);
          });
        });
        return updated;
      });
    }
  };

  const getBudgetGrowthSuggestion = () => {
    const currentRevenue = tenant?.metrics?.monthlyRevenue || 5000; // Demo value
    switch(budgetSettings.budgetGrowth) {
      case 'conservative': return Math.round(currentRevenue * 0.05); // 5% of revenue
      case 'moderate': return Math.round(currentRevenue * 0.10); // 10% of revenue
      case 'aggressive': return Math.round(currentRevenue * 0.15); // 15% of revenue
      default: return budgetSettings.monthlyBudget;
    }
  };

  const getStatusColor = (percentage) => {
    if (percentage >= budgetSettings.emergencyStop) return 'bg-red-500';
    if (percentage >= budgetSettings.alertThreshold) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getCategoryColor = (category) => {
    const colors = {
      aiServices: 'from-purple-500 to-indigo-500',
      automationTools: 'from-green-500 to-teal-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  // Check for budget alerts based on current usage
  const checkBudgetAlerts = () => {
    const currentUsage = getTotalUsed();
    const usagePercentage = (currentUsage / budgetSettings.monthlyBudget) * 100;
    
    if (usagePercentage >= budgetSettings.emergencyStop) {
      return {
        level: 'emergency',
        message: `🚨 EMERGENCY STOP: You've reached ${usagePercentage.toFixed(1)}% of your monthly budget ($${currentUsage}/$${budgetSettings.monthlyBudget}). AI operations are blocked to prevent overages.`,
        color: 'text-red-600 bg-red-100'
      };
    } else if (usagePercentage >= budgetSettings.alertThreshold) {
      return {
        level: 'warning',
        message: `⚠️ WARNING: You've used ${usagePercentage.toFixed(1)}% of your monthly budget ($${currentUsage}/$${budgetSettings.monthlyBudget}). Consider monitoring your AI usage closely.`,
        color: 'text-yellow-600 bg-yellow-100'
      };
    }
    
    return null;
  };

  const currentAlert = checkBudgetAlerts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            AI Rate Limiting & Cost Controls
          </h1>
          <p className="text-gray-600 text-lg">Prevent AI API overages and maintain optimal performance with intelligent rate limiting</p>
        </div>

        {/* Budget Alert */}
        {currentAlert && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${currentAlert.color} ${currentAlert.level === 'emergency' ? 'border-red-500' : 'border-yellow-500'}`}>
            <p className="font-semibold">{currentAlert.message}</p>
            {currentAlert.level === 'emergency' && (
              <p className="text-sm mt-2 text-red-700">All AI operations have been temporarily suspended. Please review your usage or increase your budget limit.</p>
            )}
          </div>
        )}

        {/* Budget Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">${getTotalUsed().toFixed(2)}</div>
              <div className="text-gray-500">AI Costs This Month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">${budgetSettings.monthlyBudget}</div>
              <div className="text-gray-500">Monthly AI Limit</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">${(budgetSettings.monthlyBudget - getTotalUsed()).toFixed(2)}</div>
              <div className="text-gray-500">Remaining Budget</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getUsagePercentage() >= budgetSettings.alertThreshold ? 'text-red-600' : 'text-green-600'}`}>
                {getUsagePercentage().toFixed(1)}%
              </div>
              <div className="text-gray-500">Rate Limit Used</div>
            </div>
          </div>

          {/* Budget Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Budget Usage</span>
              <span className="text-sm text-gray-500">${getTotalUsed().toFixed(2)} / ${budgetSettings.monthlyBudget}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-300 ${
                  getUsagePercentage() >= budgetSettings.emergencyStop ? 'bg-red-500' :
                  getUsagePercentage() >= budgetSettings.alertThreshold ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
              ></div>
            </div>
            {getUsagePercentage() >= budgetSettings.alertThreshold && (
              <div className={`mt-2 p-3 rounded-lg ${
                getUsagePercentage() >= budgetSettings.emergencyStop 
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span className="font-semibold">
                    {getUsagePercentage() >= budgetSettings.emergencyStop 
                      ? 'Emergency Stop Triggered!' 
                      : 'Budget Alert!'
                    }
                  </span>
                </div>
                <p className="text-sm mt-1">
                  {getUsagePercentage() >= budgetSettings.emergencyStop 
                    ? 'All non-essential services have been paused to prevent budget overrun.'
                    : `You've used ${getUsagePercentage().toFixed(1)}% of your monthly budget. Consider reviewing your spending.`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Budget Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget ($)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={budgetSettings.monthlyBudget}
                  onChange={(e) => updateBudget(Number(e.target.value))}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="100"
                  max="10000"
                />
                <button 
                  onClick={() => updateBudget(getBudgetGrowthSuggestion())}
                  className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                >
                  Auto-Scale
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Suggested based on revenue: ${getBudgetGrowthSuggestion()} ({budgetSettings.budgetGrowth} growth)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Growth Strategy</label>
              <select
                value={budgetSettings.budgetGrowth}
                onChange={(e) => setBudgetSettings(prev => ({ ...prev, budgetGrowth: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="conservative">Conservative (5% of revenue)</option>
                <option value="moderate">Moderate (10% of revenue)</option>
                <option value="aggressive">Aggressive (15% of revenue)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cost Breakdown by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {Object.entries(costBreakdown).map(([category, services]) => (
            <div key={category} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className={`text-xl font-bold mb-4 bg-gradient-to-r ${getCategoryColor(category)} bg-clip-text text-transparent`}>
                {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h3>
              
              <div className="space-y-4">
                {Object.entries(services).map(([key, service]) => {
                  const percentage = (service.used / service.limit) * 100;
                  return (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-gray-900">{service.name}</span>
                          {service.rateLimit && (
                            <div className="text-xs text-gray-500 mt-1">
                              Rate Limit: {service.rateLimit}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500">
                            ${service.used.toFixed(2)} / ${service.limit}
                          </span>
                          {(service.currentTokens > 0 || service.currentRuns > 0 || service.currentEnrichments > 0 || service.currentEmails > 0) && (
                            <div className="text-xs text-blue-600 mt-1">
                              Current: {service.currentTokens || service.currentRuns || service.currentEnrichments || service.currentEmails || 0}
                              {service.currentTokens ? ' tokens' : service.currentRuns ? ' workflows' : service.currentEnrichments ? ' enrichments' : ' emails'}/hour
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full ${
                            percentage >= 90 ? 'bg-red-500' :
                            percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {percentage.toFixed(1)}% of monthly limit
                          {isLoading && <span className="ml-1">⟳</span>}
                        </span>
                        <button 
                          onClick={() => {
                            const newLimit = prompt(`Set new monthly limit for ${service.name}:`, service.limit);
                            if (newLimit && !isNaN(newLimit)) {
                              setCostBreakdown(prev => ({
                                ...prev,
                                [category]: {
                                  ...prev[category],
                                  [key]: { ...prev[category][key], limit: Number(newLimit) }
                                }
                              }));
                            }
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Adjust Limit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Budget Alerts & Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Alert Settings & Automation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Threshold ({budgetSettings.alertThreshold}%)
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={budgetSettings.alertThreshold}
                onChange={(e) => setBudgetSettings(prev => ({ ...prev, alertThreshold: Number(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50%</span>
                <span>95%</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Stop ({budgetSettings.emergencyStop}%)
              </label>
              <input
                type="range"
                min="85"
                max="100"
                value={budgetSettings.emergencyStop}
                onChange={(e) => setBudgetSettings(prev => ({ ...prev, emergencyStop: Number(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>85%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={budgetSettings.autoScale}
                onChange={(e) => setBudgetSettings(prev => ({ ...prev, autoScale: e.target.checked }))}
                className="mr-3 w-4 h-4 text-blue-600"
              />
              <label className="text-sm font-medium text-gray-700">
                Auto-scale service limits when budget changes
              </label>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">Smart Budget Scaling</h4>
                  <p className="text-blue-700 text-sm">
                    Your budget automatically adjusts based on company revenue growth. 
                    As your business scales, your marketing automation budget scales with it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <button 
              onClick={() => setBudgetSettings({
                monthlyBudget: 200,
                autoScale: false,
                alertThreshold: 75,
                emergencyStop: 90,
                aiSafetyMode: true,
                rateLimitBuffer: 20
              })}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset to Defaults
            </button>
            <button 
              onClick={saveBudgetSettings}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostControlsDashboard;
