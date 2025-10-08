import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'

function MainDashboard() {
  const [activeSection, setActiveSection] = useState('Market Genie Dashboard')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Helper function to update classes with dark mode support
  const getDarkModeClasses = (lightClasses, darkClasses = '') => {
    const dark = darkClasses || lightClasses.replace('bg-white', 'bg-gray-800').replace('text-gray-900', 'text-white').replace('text-gray-700', 'text-gray-300')
    return isDarkMode ? dark : lightClasses
  }

  return (
    <div className={`app-container min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`} style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activeSection={activeSection} onSelect={setActiveSection} />
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex justify-between items-center`}>
          <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {activeSection}
          </h1>
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            {/* Account Menu */}
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
              >
                ⚙️
              </button>
              
              {showAccountMenu && (
                <div className={`absolute right-0 mt-2 w-48 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-50`}>
                  <div className="py-2">
                    <button 
                      onClick={() => {setActiveSection('Account Settings'); setShowAccountMenu(false)}}
                      className={`w-full text-left block px-4 py-2 text-sm ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      Account Settings
                    </button>
                    <a href="#" className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      Profile
                    </a>
                    <a href="#" className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      Billing
                    </a>
                    <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                    <button 
                      onClick={() => {setActiveSection('Admin Panel'); setShowAccountMenu(false)}}
                      className={`w-full text-left block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      🛡️ Admin Panel
                    </button>
                    <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                    <a href="#" className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}>
                      Sign Out
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <main className={`flex-1 p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Section content rendering */}
        {activeSection === 'Market Genie Dashboard' && (
          <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-white to-blue-50'}`}>
            <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-teal-400' : 'text-genie-teal'}`}>Welcome to Market Genie</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {/* Stat Boxes */}
              <div className={`shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                <div className={`rounded-full p-3 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Contacts</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2,847</p>
                  <p className="text-xs text-green-600">↗ +12% from last month</p>
                </div>
              </div>

              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`rounded-full p-3 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conversion Rate</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>18.2%</p>
                  <p className="text-xs text-green-600">↗ +3.4% from last month</p>
                </div>
              </div>

              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`rounded-full p-3 ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Revenue</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$24,680</p>
                  <p className="text-xs text-green-600">↗ +18.7% from last month</p>
                </div>
              </div>

              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`rounded-full p-3 ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Campaigns</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>47</p>
                  <p className="text-xs text-blue-600">↗ +5 new this week</p>
                </div>
              </div>
            </div>

            {/* Financial Growth Chart */}
            <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-8 mb-10 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Financial Growth</h2>
              <div className={`h-64 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
                <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <svg className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <p className="text-lg">Interactive Chart Placeholder</p>
                  <p className="text-sm">Connect Chart.js or D3 for live data visualization</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveSection('Lead Generation')}
                    className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-3"
                  >
                    <span className="text-blue-600 text-xl">🎯</span>
                    <span className="font-medium text-blue-700">Generate New Leads</span>
                  </button>
                  <button 
                    onClick={() => setActiveSection('CRM & Pipeline')}
                    className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors flex items-center gap-3"
                  >
                    <span className="text-green-600 text-xl">📊</span>
                    <span className="font-medium text-green-700">Manage Pipeline</span>
                  </button>
                  <button 
                    onClick={() => setActiveSection('Outreach Automation')}
                    className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-3"
                  >
                    <span className="text-purple-600 text-xl">📧</span>
                    <span className="font-medium text-purple-700">Send Campaign</span>
                  </button>
                </div>
              </div>

              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className="text-green-500 text-xl">✅</span>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Campaign "Summer Sale" completed</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>2 hours ago</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className="text-blue-500 text-xl">📬</span>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>147 new leads imported</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>4 hours ago</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className="text-purple-500 text-xl">🔄</span>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Automation sequence triggered</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>6 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Performance Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Email Open Rate</span>
                      <span className="font-medium text-gray-900">34.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '34.2%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Click Through Rate</span>
                      <span className="font-medium text-gray-900">8.7%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '8.7%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Lead Quality Score</span>
                      <span className="font-medium text-gray-900">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* SOPHISTICATED Lead Generation Section */}
        {activeSection === 'Lead Generation' && (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <h1 className="text-4xl font-bold text-blue-900 mb-8">AI Swarm Lead Generation</h1>
            
            {/* Budget-Aware Controls Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-blue-600">
              <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                <span className="mr-3">💰</span>
                Budget-Aware Scraping Controls
              </h3>
              
              {/* Budget Input Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget ($)</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="1000" 
                    defaultValue="50" 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>$10</span>
                    <span className="font-bold text-blue-600">$50</span>
                    <span>$1000</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Leads</label>
                  <div className="text-2xl font-bold text-green-600">~100 leads</div>
                  <div className="text-sm text-gray-600">at $0.50/lead avg</div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Usage</label>
                  <div className="text-2xl font-bold text-purple-600">$32 / $50</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 items-center">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Update Budget
                </button>
                <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium">
                  Enable Auto-Scale
                </button>
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="text-sm text-yellow-700">Budget tracking helps startups scale efficiently</span>
                </div>
              </div>
            </div>

            {/* AI Scraping Agents Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                <span className="mr-3">🤖</span>
                AI Scraping Agents
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-blue-800">Directory Agent</h4>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-4">Scanning business directories for leads matching your criteria</p>
                  <div className="text-xs text-blue-600">
                    <div>Found: 47 leads</div>
                    <div>Cost: $23.50</div>
                    <div>Quality Score: 8.3/10</div>
                  </div>
                  <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                    Configure Agent
                  </button>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-purple-800">Social Media Agent</h4>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Paused</span>
                  </div>
                  <p className="text-sm text-purple-700 mb-4">LinkedIn & Twitter lead discovery with engagement analysis</p>
                  <div className="text-xs text-purple-600">
                    <div>Found: 23 leads</div>
                    <div>Cost: $8.50</div>
                    <div>Quality Score: 9.1/10</div>
                  </div>
                  <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors">
                    Resume Agent
                  </button>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-green-800">Custom Web Agent</h4>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Ready</span>
                  </div>
                  <p className="text-sm text-green-700 mb-4">Target specific websites and competitor analysis</p>
                  <div className="text-xs text-green-600">
                    <div>URLs Configured: 3</div>
                    <div>Est. Cost: $15/run</div>
                    <div>Expected: 30-50 leads</div>
                  </div>
                  <button className="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors">
                    Start Agent
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">Agent Control Panel</h4>
                    <p className="text-sm text-gray-600">Manage all your AI agents from one place</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
                      Start All
                    </button>
                    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
                      Stop All
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Enrichment & Deduplication */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                  <span className="mr-3">🎯</span>
                  Lead Enrichment Engine
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-800 font-medium">Email Verification</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-800 font-medium">Social Profile Matching</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-800 font-medium">Company Data Enrichment</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Processing</span>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Configure Enrichment
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                  <span className="mr-3">🔄</span>
                  Smart Deduplication
                </h3>
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-red-800 font-medium">Duplicates Found</span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">23 duplicates</span>
                    </div>
                    <p className="text-sm text-red-700">AI detected potential duplicate leads based on email, phone, and company matching</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-800 font-medium">Auto-Merged</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">15 merged</span>
                    </div>
                    <p className="text-sm text-green-700">Successfully merged leads with high confidence scores</p>
                  </div>
                  <button className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors">
                    Review Pending Merges
                  </button>
                </div>
              </div>
            </div>

            {/* Lead Analytics Dashboard */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-blue-900 mb-6 flex items-center">
                <span className="mr-3">�</span>
                Lead Generation Analytics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">320</div>
                  <div className="text-sm text-gray-600">Total Leads Generated</div>
                  <div className="text-xs text-green-600">↗ +15% this week</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">87%</div>
                  <div className="text-sm text-gray-600">Email Delivery Rate</div>
                  <div className="text-xs text-green-600">↗ +2% improvement</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">$0.42</div>
                  <div className="text-sm text-gray-600">Avg Cost per Lead</div>
                  <div className="text-xs text-green-600">↓ -8% optimization</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">8.7</div>
                  <div className="text-sm text-gray-600">Quality Score (1-10)</div>
                  <div className="text-xs text-green-600">↗ +0.3 improvement</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Performance Insights</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Best performing source: LinkedIn (92% quality score)</li>
                  <li>• Peak activity time: Tuesday 2-4 PM EST</li>
                  <li>• Recommended budget increase: $25/month for 40% more leads</li>
                  <li>• AI suggestion: Focus on "SaaS Startups" segment (18% higher conversion)</li>
                </ul>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium">
                🚀 Launch Campaign
              </button>
              <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium">
                📥 Import CSV
              </button>
              <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium">
                🎯 Create Target List
              </button>
              <button className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium">
                📊 Export Report
              </button>
            </div>
          </div>
        )}

        {/* Outreach Automation Section */}
        {activeSection === 'Outreach Automation' && (
          <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-purple-50 to-pink-100'}`}>
            <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-900'}`}>Outreach Automation</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📧 Email Campaigns</h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Create and send automated email sequences.</p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">Create Campaign</button>
              </div>
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📱 SMS Campaigns</h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Send targeted SMS messages to your leads.</p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">Send SMS</button>
              </div>
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📞 Voice Campaigns</h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Automated voice calls and voicemail drops.</p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">Setup Voice</button>
              </div>
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📲 Social Media</h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Automate social media outreach and posting.</p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">Connect Social</button>
              </div>
            </div>
          </div>
        )}

        {/* CRM & Pipeline Section */}
        {activeSection === 'CRM & Pipeline' && (
          <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-green-50 to-emerald-100'}`}>
            <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-green-400' : 'text-green-900'}`}>CRM & Pipeline</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 text-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Leads</h3>
                <p className="text-3xl font-bold text-blue-600">2,847</p>
              </div>
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 text-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Qualified</h3>
                <p className="text-3xl font-bold text-yellow-600">524</p>
              </div>
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 text-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Proposals</h3>
                <p className="text-3xl font-bold text-orange-600">89</p>
              </div>
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 text-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Closed</h3>
                <p className="text-3xl font-bold text-green-600">42</p>
              </div>
            </div>
            <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pipeline Management</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Visual pipeline with drag-and-drop functionality.</p>
            </div>
          </div>
        )}

        {/* Appointments Section */}
        {activeSection === 'Appointments' && (
          <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-yellow-50 to-amber-100'}`}>
            <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-900'}`}>Appointments</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📅 Calendar Integration</h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sync with Google Calendar, Outlook, and more.</p>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg">Connect Calendar</button>
              </div>
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🔔 Automated Reminders</h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Send automatic email and SMS reminders.</p>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg">Setup Reminders</button>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Automation Section */}
        {activeSection === 'Workflow Automation' && (
          <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-indigo-50 to-purple-100'}`}>
            <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-900'}`}>Workflow Automation</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🔄 Automation Builder</h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Visual workflow builder with triggers and actions.</p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Build Workflow</button>
              </div>
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>⚡ Smart Triggers</h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>AI-powered triggers based on user behavior.</p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Configure AI</button>
              </div>
            </div>
          </div>
        )}

        {/* API Keys & Integrations Section */}
        {activeSection === 'API Keys & Integrations' && (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">API Keys & Integrations</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🔑 API Management</h3>
                <p className="text-gray-600 mb-4">Manage your API keys and access tokens.</p>
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Manage APIs</button>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🔗 Third-Party Apps</h3>
                <p className="text-gray-600 mb-4">Connect with Zapier, HubSpot, Salesforce.</p>
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Add Integration</button>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Webhooks</h3>
                <p className="text-gray-600 mb-4">Setup webhooks for real-time data sync.</p>
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Configure</button>
              </div>
            </div>
          </div>
        )}

        {/* Reporting & Analytics Section */}
        {activeSection === 'Reporting & Analytics' && (
          <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-8">
            <h1 className="text-4xl font-bold text-red-900 mb-8">Reporting & Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Performance Dashboard</h3>
                <p className="text-gray-600 mb-4">Real-time analytics and performance metrics.</p>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">View Reports</button>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Custom Reports</h3>
                <p className="text-gray-600 mb-4">Build custom reports and export data.</p>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Create Report</button>
              </div>
            </div>
          </div>
        )}

        {/* White-Label SaaS Section */}
        {activeSection === 'White-Label SaaS' && (
          <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-8">
            <h1 className="text-4xl font-bold text-cyan-900 mb-8">White-Label SaaS</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🏷️ Branding Control</h3>
                <p className="text-gray-600 mb-4">Customize logos, colors, and domain names.</p>
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg">Customize Brand</button>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">👥 Client Management</h3>
                <p className="text-gray-600 mb-4">Manage multiple client accounts and billing.</p>
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg">Manage Clients</button>
              </div>
            </div>
          </div>
        )}

        {/* Cost Controls Section */}
        {activeSection === 'Cost Controls' && (
          <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 p-8">
            <h1 className="text-4xl font-bold text-emerald-900 mb-8">Cost Controls</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 Budget Management</h3>
                <p className="text-gray-600 mb-4">Set and monitor campaign budgets automatically.</p>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">Set Budgets</button>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Cost Analysis</h3>
                <p className="text-gray-600 mb-4">Detailed cost breakdown and ROI analysis.</p>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">View Analysis</button>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">⚠️ Alert System</h3>
                <p className="text-gray-600 mb-4">Get notified when costs exceed thresholds.</p>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">Setup Alerts</button>
              </div>
            </div>
          </div>
        )}

        {/* AI & Automation Section */}
        {activeSection === 'AI & Automation' && (
          <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 p-8">
            <h1 className="text-4xl font-bold text-violet-900 mb-8">AI & Automation</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🤖 AI Genie Assistant</h3>
                <p className="text-gray-600 mb-4">Your personal AI assistant for marketing tasks.</p>
                <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg">Chat with Genie</button>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">✨ Smart Optimization</h3>
                <p className="text-gray-600 mb-4">AI-powered campaign optimization and recommendations.</p>
                <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg">Optimize Now</button>
              </div>
            </div>
          </div>
        )}
        {/* Continue with all other sections... */}
        {/* I'll copy the rest of the beautiful dashboard code here */}
        
        </main>
      </div>
    </div>
  )
}

export default MainDashboard
