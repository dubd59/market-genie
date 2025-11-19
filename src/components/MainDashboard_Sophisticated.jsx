import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'

function MainDashboard() {
  const [activeSection, setActiveSection] = useState('Market Genie Dashboard')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  // Check for dark mode preference and listen for changes (same as ResourceDocumentationCenter)
  React.useEffect(() => {
    const checkDarkMode = () => {
      const saved = localStorage.getItem('marketGenieDarkMode');
      const isDark = saved ? JSON.parse(saved) : false;
      setIsDarkMode(isDark);
    };
    
    // Check initially
    checkDarkMode();
    
    // Poll for changes every 100ms (reliable detection)
    const interval = setInterval(checkDarkMode, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
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
        {/* Market Genie Dashboard Section */}
        {activeSection === 'Market Genie Dashboard' && (
          <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
            <h1 className="text-4xl font-bold text-genie-teal mb-8">Welcome to Market Genie</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {/* Stat Boxes */}
              <div className={`shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'}`}>
                <div className="bg-genie-teal/10 p-3 rounded-full">
                  <span role="img" aria-label="users" className="text-genie-teal text-2xl">👥</span>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={isDarkMode ? { color: '#38beba' } : { color: '#111827' }}>128</div>
                  <div style={isDarkMode ? { color: '#38beba' } : { color: '#6b7280' }}>New Customers</div>
                </div>
              </div>
              <div className={`shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'}`}>
                <div className="bg-genie-teal/10 p-3 rounded-full">
                  <span role="img" aria-label="revenue" className="text-genie-teal text-2xl">💰</span>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={isDarkMode ? { color: '#38beba' } : { color: '#111827' }}>$12,400</div>
                  <div style={isDarkMode ? { color: '#38beba' } : { color: '#6b7280' }}>Revenue</div>
                </div>
              </div>
              <div className={`shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'}`}>
                <div className="bg-genie-teal/10 p-3 rounded-full">
                  <span role="img" aria-label="campaigns" className="text-genie-teal text-2xl">🚀</span>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={isDarkMode ? { color: '#38beba' } : { color: '#111827' }}>7</div>
                  <div style={isDarkMode ? { color: '#38beba' } : { color: '#6b7280' }}>Active Campaigns</div>
                </div>
              </div>
              <div className={`shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'}`}>
                <div className="bg-genie-teal/10 p-3 rounded-full">
                  <span role="img" aria-label="conversion" className="text-genie-teal text-2xl">📈</span>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={isDarkMode ? { color: '#38beba' } : { color: '#111827' }}>12%</div>
                  <div style={isDarkMode ? { color: '#38beba' } : { color: '#6b7280' }}>Conversion Rate</div>
                </div>
              </div>
            </div>
            {/* Financial Graph */}
            <div className={`shadow-lg rounded-xl p-8 mb-10 ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'}`}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#38beba' }}>Financial Growth</h2>
              <div className="w-full h-64">
                {/* Simple SVG Line Chart */}
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  <polyline
                    fill="none"
                    stroke="#38BEBA"
                    strokeWidth="4"
                    points="30,143 100,114 170,86 240,71 310,43 380,40"
                  />
                  {/* Dots */}
                  <circle cx="30" cy="143" r="6" fill="#38BEBA" />
                  <circle cx="100" cy="114" r="6" fill="#38BEBA" />
                  <circle cx="170" cy="86" r="6" fill="#38BEBA" />
                  <circle cx="240" cy="71" r="6" fill="#38BEBA" />
                  <circle cx="310" cy="43" r="6" fill="#38BEBA" />
                  <circle cx="380" cy="40" r="6" fill="#38BEBA" />
                  {/* Month labels */}
                  <text x="30" y="190" textAnchor="middle" fontSize="14" fill="#888">Jan</text>
                  <text x="100" y="190" textAnchor="middle" fontSize="14" fill="#888">Feb</text>
                  <text x="170" y="190" textAnchor="middle" fontSize="14" fill="#888">Mar</text>
                  <text x="240" y="190" textAnchor="middle" fontSize="14" fill="#888">Apr</text>
                  <text x="310" y="190" textAnchor="middle" fontSize="14" fill="#888">May</text>
                  <text x="380" y="190" textAnchor="middle" fontSize="14" fill="#888">Jun</text>
                </svg>
              </div>
            </div>
            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button onClick={() => setActiveSection('Lead Generation')} className="bg-genie-teal/10 rounded-xl p-6 flex flex-col items-center hover:bg-genie-teal/20 transition">
                <span role="img" aria-label="contacts" className="text-genie-teal text-3xl mb-2">👥</span>
                <span className="font-semibold text-genie-teal">Manage Contacts</span>
              </button>
              <button onClick={() => setActiveSection('Cost Controls')} className="bg-genie-teal/10 rounded-xl p-6 flex flex-col items-center hover:bg-genie-teal/20 transition">
                <span role="img" aria-label="cost" className="text-genie-teal text-3xl mb-2">💸</span>
                <span className="font-semibold text-genie-teal">Cost Controls</span>
              </button>
              <button onClick={() => setActiveSection('Reporting & Analytics')} className="bg-genie-teal/10 rounded-xl p-6 flex flex-col items-center hover:bg-genie-teal/20 transition">
                <span role="img" aria-label="analytics" className="text-genie-teal text-3xl mb-2">📊</span>
                <span className="font-semibold text-genie-teal">Analytics</span>
              </button>
            </div>
          </div>
        )}

        {/* SOPHISTICATED Lead Generation Section */}
        {activeSection === 'Lead Generation' && (
          <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
            <h2 className="text-3xl font-bold text-genie-teal mb-8">AI Swarm Lead Generation</h2>
            
            {/* Budget-Aware Controls Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-genie-teal">
              <h3 className="text-xl font-semibold text-genie-teal mb-4 flex items-center">
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
                    <span className="font-bold text-genie-teal">$50</span>
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
                <button className="bg-genie-teal text-white px-6 py-3 rounded-lg hover:bg-genie-teal/80 transition-colors font-medium">
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
              <h3 className="text-xl font-semibold text-genie-teal mb-4 flex items-center">
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
                <h3 className="text-xl font-semibold text-genie-teal mb-4 flex items-center">
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
                  <button className="w-full bg-genie-teal text-white py-3 rounded-lg hover:bg-genie-teal/80 transition-colors">
                    Configure Enrichment
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-genie-teal mb-4 flex items-center">
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
              <h3 className="text-xl font-semibold text-genie-teal mb-6 flex items-center">
                <span className="mr-3">📊</span>
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

        {/* Add all other sections similarly... */}
        
        </main>
      </div>
    </div>
  )
}

export default MainDashboard
