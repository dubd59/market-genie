// Budget Control Dashboard Component
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

export default function BudgetControlDashboard({ userId }) {
  const [budgetSettings, setBudgetSettings] = useState({
    dailyBudget: 0.50,
    currentSpend: 0.00,
    tier: 'starter',
    isPaused: false
  });
  
  const [spendingHistory, setSpendingHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [newBudget, setNewBudget] = useState(0.50);

  useEffect(() => {
    loadBudgetData();
    const interval = setInterval(loadBudgetData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const loadBudgetData = async () => {
    try {
      const response = await fetch(`/api/budget/status/${userId}`);
      const data = await response.json();
      setBudgetSettings(data);
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  const updateBudget = async () => {
    try {
      const response = await fetch(`/api/budget/update/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyBudget: newBudget })
      });
      
      if (response.ok) {
        setBudgetSettings(prev => ({ ...prev, dailyBudget: newBudget }));
        setShowSettings(false);
      }
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const pauseOperations = async () => {
    try {
      await fetch(`/api/budget/pause/${userId}`, { method: 'POST' });
      setBudgetSettings(prev => ({ ...prev, isPaused: true }));
    } catch (error) {
      console.error('Error pausing operations:', error);
    }
  };

  const resumeOperations = async () => {
    try {
      await fetch(`/api/budget/resume/${userId}`, { method: 'POST' });
      setBudgetSettings(prev => ({ ...prev, isPaused: false }));
    } catch (error) {
      console.error('Error resuming operations:', error);
    }
  };

  const budgetUtilization = (budgetSettings.currentSpend / budgetSettings.dailyBudget) * 100;
  const remainingBudget = budgetSettings.dailyBudget - budgetSettings.currentSpend;

  // Estimate leads possible with remaining budget
  const estimatedLeadsRemaining = Math.floor(remainingBudget / 0.01); // $0.01 per lead average

  const budgetTiers = [
    { name: 'Starter', budget: 0.50, leads: '50-100', description: 'Ultra-conservative start' },
    { name: 'Basic', budget: 2.00, leads: '200-400', description: 'First sales milestone' },
    { name: 'Growth', budget: 10.00, leads: '1,000-2,000', description: 'Scaling up operations' },
    { name: 'Pro', budget: 50.00, leads: '5,000-10,000', description: 'Established business' },
    { name: 'Enterprise', budget: 200.00, leads: '20,000+', description: 'High-volume operations' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Control Center</h2>
          <p className="text-gray-600">Monitor and control your lead generation costs</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!budgetSettings.isPaused ? (
            <button
              onClick={pauseOperations}
              className="btn-red flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Emergency Stop
            </button>
          ) : (
            <button
              onClick={resumeOperations}
              className="btn-green flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Resume Operations
            </button>
          )}
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Budget Settings
          </button>
        </div>
      </div>

      {/* Budget Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Current Spend */}
        <div className="card-genie p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              budgetUtilization >= 90 ? 'bg-red-100 text-red-700' :
              budgetUtilization >= 70 ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {budgetUtilization.toFixed(1)}% used
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Today's Spend</p>
            <p className="text-2xl font-bold text-gray-900">
              ${budgetSettings.currentSpend.toFixed(3)}
            </p>
            <p className="text-sm text-gray-500">
              of ${budgetSettings.dailyBudget.toFixed(2)} budget
            </p>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="card-genie p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Remaining Budget</p>
            <p className="text-2xl font-bold text-green-600">
              ${remainingBudget.toFixed(3)}
            </p>
            <p className="text-sm text-gray-500">
              ~{estimatedLeadsRemaining} leads possible
            </p>
          </div>
        </div>

        {/* Current Tier */}
        <div className="card-genie p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Current Tier</p>
            <p className="text-2xl font-bold text-purple-600 capitalize">
              {budgetSettings.tier}
            </p>
            <p className="text-sm text-gray-500">
              {budgetTiers.find(t => t.name.toLowerCase() === budgetSettings.tier)?.leads} leads/day
            </p>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="card-genie p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Budget Usage</p>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{budgetUtilization.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    budgetUtilization >= 90 ? 'bg-red-500' :
                    budgetUtilization >= 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card-genie p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Settings</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Adjuster */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Budget Adjustment
              </label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="0.50"
                    max="200.00"
                    step="0.50"
                    value={newBudget}
                    onChange={(e) => setNewBudget(parseFloat(e.target.value))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={updateBudget}
                    className="btn-teal"
                  >
                    Update Budget
                  </button>
                </div>
                
                {/* Quick Budget Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[0.50, 1.00, 2.00, 5.00, 10.00, 25.00].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setNewBudget(amount)}
                      className={`px-3 py-1 text-sm rounded-md border ${
                        newBudget === amount 
                          ? 'bg-teal-100 border-teal-300 text-teal-700'
                          : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      ${amount.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget Tiers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Tiers & Capabilities
              </label>
              <div className="space-y-2">
                {budgetTiers.map((tier, index) => (
                  <div
                    key={tier.name}
                    className={`p-3 rounded-lg border ${
                      tier.name.toLowerCase() === budgetSettings.tier
                        ? 'bg-teal-50 border-teal-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{tier.name}</p>
                        <p className="text-sm text-gray-600">{tier.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${tier.budget.toFixed(2)}/day</p>
                        <p className="text-sm text-gray-600">{tier.leads} leads</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Cost Breakdown (Per Operation)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Basic Scrape</p>
                <p className="font-semibold">$0.0005</p>
              </div>
              <div>
                <p className="text-gray-600">Email Lookup</p>
                <p className="font-semibold">$0.003</p>
              </div>
              <div>
                <p className="text-gray-600">Company Data</p>
                <p className="font-semibold">$0.015</p>
              </div>
              <div>
                <p className="text-gray-600">Email Send</p>
                <p className="font-semibold">$0.0008</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Budget Alerts */}
      {budgetUtilization >= 90 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-red-800 font-medium">Budget Alert: {budgetUtilization.toFixed(1)}% Used</p>
              <p className="text-red-700 text-sm">
                Operations will pause at 95% usage. Consider increasing your daily budget.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
