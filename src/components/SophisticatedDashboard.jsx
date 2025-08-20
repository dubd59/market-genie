import React, { useState } from 'react'
import Sidebar from './Sidebar'

function SophisticatedDashboard() {
  const [activeSection, setActiveSection] = useState('SuperGenie Dashboard')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Ensure proper initialization
  React.useEffect(() => {
    setIsInitialized(true)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Helper function to update classes with dark mode support
  const getDarkModeClasses = (lightClasses, darkClasses = '') => {
    const dark = darkClasses || lightClasses.replace('bg-white', 'bg-gray-800').replace('text-gray-900', 'text-white').replace('text-gray-700', 'text-gray-300')
    return isDarkMode ? dark : lightClasses
  }

  // Prevent flash of wrong content during initialization
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
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
                    <button 
                      onClick={() => {setActiveSection('Admin Panel'); setShowAccountMenu(false)}}
                      className={`w-full text-left block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      🛡️ Admin Panel
                    </button>
                    <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                    <a href="/" className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}>
                      ← Back to Landing
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <main className={`flex-1 p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* SuperGenie Dashboard */}
        {activeSection === 'SuperGenie Dashboard' && (
          <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
            <h1 className="text-4xl font-bold text-genie-teal mb-8">Welcome to Market Genie</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {/* Stat Boxes */}
              <div className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform">
                <div className="bg-genie-teal/10 p-3 rounded-full">
                  <span role="img" aria-label="users" className="text-genie-teal text-2xl">👥</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">128</div>
                  <div className="text-gray-500">New Customers</div>
                </div>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform">
                <div className="bg-genie-teal/10 p-3 rounded-full">
                  <span role="img" aria-label="revenue" className="text-genie-teal text-2xl">💰</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">$12,400</div>
                  <div className="text-gray-500">Revenue</div>
                </div>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform">
                <div className="bg-genie-teal/10 p-3 rounded-full">
                  <span role="img" aria-label="campaigns" className="text-genie-teal text-2xl">⚡</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">7</div>
                  <div className="text-gray-500">Active Campaigns</div>
                </div>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform">
                <div className="bg-genie-teal/10 p-3 rounded-full">
                  <span role="img" aria-label="conversion" className="text-genie-teal text-2xl">📈</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">12%</div>
                  <div className="text-gray-500">Conversion Rate</div>
                </div>
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

        {/* Lead Generation - ALL YOUR SOPHISTICATED CONTENT */}
        {activeSection === 'Lead Generation' && (
          <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
            <h2 className="text-3xl font-bold text-genie-teal mb-8">Lead Generation</h2>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                <span role="img" aria-label="leads" className="text-genie-teal text-3xl mb-2">🧲</span>
                <div className="text-2xl font-bold text-gray-900">320</div>
                <div className="text-gray-500">New Leads</div>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                <span role="img" aria-label="import" className="text-genie-teal text-3xl mb-2">📥</span>
                <div className="text-2xl font-bold text-gray-900">120</div>
                <div className="text-gray-500">Imported Contacts</div>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                <span role="img" aria-label="conversion" className="text-genie-teal text-3xl mb-2">🔄</span>
                <div className="text-2xl font-bold text-gray-900">18%</div>
                <div className="text-gray-500">Lead Conversion</div>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                <span role="img" aria-label="budget" className="text-genie-teal text-3xl mb-2">💸</span>
                <div className="text-2xl font-bold text-gray-900">$120</div>
                <div className="text-gray-500">Budget Used</div>
              </div>
            </div>
            {/* Budget-Aware Scraping Controls */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h3 className="text-xl font-semibold text-genie-teal mb-2">Budget-Aware Scraping Controls</h3>
              <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                <label className="font-medium text-gray-700">Monthly Scraping/API Budget ($):</label>
                <input type="number" min="10" max="1000" defaultValue="50" className="border p-2 rounded w-32" />
                <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">Update Budget</button>
              </div>
              <div className="text-gray-600 mb-2">Estimated leads per budget: <span className="font-bold">{Math.floor(50/0.5)} leads</span> (demo)</div>
              <div className="bg-blue-50 rounded p-4 mb-2">Current usage: <span className="font-bold">$32</span> / $50</div>
              <div className="text-xs text-gray-500 mb-2">You can update your budget as your capital grows. Low-cost mode helps startups stay within limits.</div>
            </div>
            {/* Scraping Agents */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h3 className="text-xl font-semibold text-genie-teal mb-2">Integrated Web Scraping Agents</h3>
              <div className="flex gap-4 mb-4">
                <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">Business Directories</button>
                <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">Social Media</button>
                <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">Custom Sources</button>
              </div>
              <div className="text-gray-600 mb-2">Choose a source and start scraping for new leads. Progress and results will appear here.</div>
              <div className="bg-blue-50 rounded p-4">Scraping progress: <span className="font-bold">Demo: 80 leads found</span></div>
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {activeSection === 'Admin Panel' && (
          <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
            <h2 className="text-3xl font-bold text-genie-teal mb-8">Admin Panel</h2>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold text-genie-teal mb-4">Admin Features</h3>
              <p className="text-gray-600">Advanced admin functionality will be available here.</p>
            </div>
          </div>
        )}

        {/* Default content for other sections */}
        {!['SuperGenie Dashboard', 'Lead Generation', 'Admin Panel'].includes(activeSection) && (
          <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
            <h2 className="text-3xl font-bold text-genie-teal mb-8">{activeSection}</h2>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-600">This section is being loaded...</p>
            </div>
          </div>
        )}
        
        </main>
      </div>
    </div>
  )
}

export default SophisticatedDashboard
