import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { GenieProvider } from './contexts/GenieContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import CampaignBuilder from './pages/CampaignBuilder'
import ContactManagement from './pages/ContactManagement'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import VoiceButton from './features/voice-control/VoiceButton'
import './assets/brand.css'
import Sidebar from './components/Sidebar'
import SupportTicketForm from './components/SupportTicketForm'
import SupportTicketList from './components/SupportTicketList'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-light)]">
        <div className="genie-enter">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-genie-teal"></div>
          <p className="mt-4 text-genie-teal font-medium">Market Genie is awakening...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <Layout>{children}</Layout>
}

function App() {
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

  // Prevent flash of wrong content during initialization
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <GenieProvider>
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
              {/* Financial Graph */}
              <div className="bg-white shadow-lg rounded-xl p-8 mb-10">
                <h2 className="text-xl font-semibold text-genie-teal mb-4">Financial Growth</h2>
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
                <div className="text-xs text-red-500">{32 > 50 ? 'Warning: Budget exceeded! Scraping limited.' : ''}</div>
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
              {/* Lead Import Tool */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-2">Import Leads (CSV)</h3>
                <input type="file" accept=".csv" className="mb-2" />
                <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">Upload</button>
              </div>
              {/* Lead Capture Form with Enrichment */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-2">Add New Lead & Enrichment</h3>
                <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input type="text" placeholder="Name" className="border p-2 rounded" required />
                  <input type="email" placeholder="Email" className="border p-2 rounded" required />
                  <input type="tel" placeholder="Phone" className="border p-2 rounded" />
                  <input type="text" placeholder="Company" className="border p-2 rounded" />
                  <input type="text" placeholder="LinkedIn" className="border p-2 rounded" />
                  <input type="text" placeholder="Twitter" className="border p-2 rounded" />
                  <input type="text" placeholder="Website" className="border p-2 rounded" />
                  <input type="text" placeholder="Source" className="border p-2 rounded" />
                  <textarea placeholder="Lead Description" className="border p-2 rounded col-span-1 md:col-span-4" />
                  <button type="submit" className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80 col-span-1 md:col-span-4">Add Lead</button>
                </form>
              </div>
              {/* Filters/Search */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input type="text" placeholder="Search leads..." className="border p-2 rounded flex-1" />
                <select className="border p-2 rounded">
                  <option>All Sources</option>
                  <option>Website</option>
                  <option>Referral</option>
                  <option>Event</option>
                </select>
                <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">Filter</button>
              </div>
              {/* Recent Leads Table with Enrichment and Deduplication */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Recent Leads</h3>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2">Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Phone</th>
                      <th className="py-2">Company</th>
                      <th className="py-2">LinkedIn</th>
                      <th className="py-2">Twitter</th>
                      <th className="py-2">Website</th>
                      <th className="py-2">Source</th>
                      <th className="py-2">Description</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-blue-50">
                      <td className="py-2">Jane Doe</td>
                      <td className="py-2">jane@example.com</td>
                      <td className="py-2">555-1234</td>
                      <td className="py-2">Acme Inc.</td>
                      <td className="py-2">linkedin.com/in/janedoe</td>
                      <td className="py-2">@janedoe</td>
                      <td className="py-2">acme.com</td>
                      <td className="py-2">Website</td>
                      <td className="py-2">Interested in demo</td>
                      <td className="py-2">
                        <button className="text-genie-teal mr-2">Edit</button>
                        <button className="text-red-500">Delete</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">John Smith</td>
                      <td className="py-2">john@company.com</td>
                      <td className="py-2">555-5678</td>
                      <td className="py-2">Beta LLC</td>
                      <td className="py-2">linkedin.com/in/johnsmith</td>
                      <td className="py-2">@johnsmith</td>
                      <td className="py-2">betallc.com</td>
                      <td className="py-2">Referral</td>
                      <td className="py-2">Requested pricing</td>
                      <td className="py-2">
                        <button className="text-genie-teal mr-2">Edit</button>
                        <button className="text-red-500">Delete</button>
                      </td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="py-2">Alice Lee</td>
                      <td className="py-2">alice@startup.com</td>
                      <td className="py-2">555-8765</td>
                      <td className="py-2">Startup Hub</td>
                      <td className="py-2">linkedin.com/in/alicelee</td>
                      <td className="py-2">@alicelee</td>
                      <td className="py-2">startuphub.com</td>
                      <td className="py-2">Event</td>
                      <td className="py-2">Duplicate detected</td>
                      <td className="py-2">
                        <button className="text-genie-teal mr-2">Edit</button>
                        <button className="text-red-500">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex justify-end mt-4 gap-2">
                  <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">Export CSV</button>
                  <button className="bg-genie-teal/10 text-genie-teal px-4 py-2 rounded hover:bg-genie-teal/20">Add Lead</button>
                </div>
                <div className="mt-2 text-xs text-red-500">Deduplication: <span className="font-bold">1 duplicate found</span></div>
              </div>
            </div>
          )}
          {activeSection === 'Outreach Automation' && (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
              <h2 className="text-3xl font-bold text-genie-teal mb-8">Outreach Automation</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="email" className="text-genie-teal text-3xl mb-2">✉️</span>
                  <div className="text-2xl font-bold text-gray-900">1,200</div>
                  <div className="text-gray-500">Emails Sent</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="sms" className="text-genie-teal text-3xl mb-2">📱</span>
                  <div className="text-2xl font-bold text-gray-900">800</div>
                  <div className="text-gray-500">SMS Sent</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="social" className="text-genie-teal text-3xl mb-2">📢</span>
                  <div className="text-2xl font-bold text-gray-900">350</div>
                  <div className="text-gray-500">Social Posts</div>
                </div>
              </div>
              {/* Campaign Builder */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Create New Campaign</h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Campaign Name" className="border p-3 rounded" required />
                  <select className="border p-3 rounded">
                    <option>Select Campaign Type</option>
                    <option>Email Sequence</option>
                    <option>SMS Campaign</option>
                    <option>Social Media</option>
                    <option>Mixed Campaign</option>
                  </select>
                  <input type="text" placeholder="Target Audience" className="border p-3 rounded" />
                  <input type="datetime-local" className="border p-3 rounded" />
                  <textarea placeholder="Campaign Description" className="border p-3 rounded col-span-1 md:col-span-2" />
                  <button type="submit" className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 col-span-1 md:col-span-2">Create Campaign</button>
                </form>
              </div>
              
              {/* Email Templates */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Email Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 hover:border-genie-teal cursor-pointer">
                    <h4 className="font-semibold mb-2">Welcome Series</h4>
                    <p className="text-sm text-gray-600">5-email welcome sequence</p>
                    <button className="mt-2 text-genie-teal hover:underline">Use Template</button>
                  </div>
                  <div className="border rounded-lg p-4 hover:border-genie-teal cursor-pointer">
                    <h4 className="font-semibold mb-2">Product Launch</h4>
                    <p className="text-sm text-gray-600">Announcement campaign</p>
                    <button className="mt-2 text-genie-teal hover:underline">Use Template</button>
                  </div>
                  <div className="border rounded-lg p-4 hover:border-genie-teal cursor-pointer">
                    <h4 className="font-semibold mb-2">Re-engagement</h4>
                    <p className="text-sm text-gray-600">Win back inactive users</p>
                    <button className="mt-2 text-genie-teal hover:underline">Use Template</button>
                  </div>
                </div>
              </div>

              {/* Active Campaigns */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Active Campaigns</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3">Campaign</th>
                        <th className="py-3">Type</th>
                        <th className="py-3">Status</th>
                        <th className="py-3">Recipients</th>
                        <th className="py-3">Open Rate</th>
                        <th className="py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3">Welcome New Users</td>
                        <td className="py-3">Email</td>
                        <td className="py-3"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span></td>
                        <td className="py-3">1,247</td>
                        <td className="py-3">24.5%</td>
                        <td className="py-3">
                          <button className="text-genie-teal mr-2 hover:underline">Edit</button>
                          <button className="text-red-500 hover:underline">Pause</button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3">Product Launch 2024</td>
                        <td className="py-3">Mixed</td>
                        <td className="py-3"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Scheduled</span></td>
                        <td className="py-3">3,542</td>
                        <td className="py-3">--</td>
                        <td className="py-3">
                          <button className="text-genie-teal mr-2 hover:underline">Edit</button>
                          <button className="text-red-500 hover:underline">Cancel</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3">Re-engagement Campaign</td>
                        <td className="py-3">SMS</td>
                        <td className="py-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Paused</span></td>
                        <td className="py-3">892</td>
                        <td className="py-3">18.2%</td>
                        <td className="py-3">
                          <button className="text-genie-teal mr-2 hover:underline">Resume</button>
                          <button className="text-red-500 hover:underline">Delete</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4 gap-2">
                  <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">Export Report</button>
                  <button className="bg-genie-teal/10 text-genie-teal px-4 py-2 rounded hover:bg-genie-teal/20">New Campaign</button>
                </div>
              </div>
            </div>
          )}
          {activeSection === 'CRM & Pipeline' && (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
              <h2 className="text-3xl font-bold text-genie-teal mb-8">CRM & Pipeline</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="crm" className="text-genie-teal text-3xl mb-2">📋</span>
                  <div className="text-2xl font-bold text-gray-900">45</div>
                  <div className="text-gray-500">Active Deals</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="pipeline" className="text-genie-teal text-3xl mb-2">🔗</span>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-gray-500">Pipeline Stages</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="win" className="text-genie-teal text-3xl mb-2">🏆</span>
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-gray-500">Closed Won</div>
                </div>
              </div>
              {/* Pipeline Management */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Sales Pipeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Prospects</h4>
                    <div className="text-2xl font-bold text-blue-900">18</div>
                    <div className="text-sm text-blue-700">$45,000</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Qualified</h4>
                    <div className="text-2xl font-bold text-yellow-900">12</div>
                    <div className="text-sm text-yellow-700">$78,000</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Proposal</h4>
                    <div className="text-2xl font-bold text-orange-900">8</div>
                    <div className="text-sm text-orange-700">$95,000</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Closed Won</h4>
                    <div className="text-2xl font-bold text-green-900">5</div>
                    <div className="text-sm text-green-700">$67,000</div>
                  </div>
                </div>
              </div>

              {/* Contact Management */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Recent Contacts</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3">Name</th>
                        <th className="py-3">Company</th>
                        <th className="py-3">Stage</th>
                        <th className="py-3">Value</th>
                        <th className="py-3">Last Contact</th>
                        <th className="py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3">John Smith</td>
                        <td className="py-3">Acme Corp</td>
                        <td className="py-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Qualified</span></td>
                        <td className="py-3">$15,000</td>
                        <td className="py-3">2 days ago</td>
                        <td className="py-3">
                          <button className="text-genie-teal mr-2 hover:underline">View</button>
                          <button className="text-blue-600 hover:underline">Call</button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3">Sarah Johnson</td>
                        <td className="py-3">Tech Startup</td>
                        <td className="py-3"><span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">Proposal</span></td>
                        <td className="py-3">$28,000</td>
                        <td className="py-3">1 week ago</td>
                        <td className="py-3">
                          <button className="text-genie-teal mr-2 hover:underline">View</button>
                          <button className="text-blue-600 hover:underline">Email</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow p-6 text-center">
                  <h4 className="font-semibold text-genie-teal mb-4">Add Contact</h4>
                  <button className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 w-full">New Contact</button>
                </div>
                <div className="bg-white rounded-xl shadow p-6 text-center">
                  <h4 className="font-semibold text-genie-teal mb-4">Create Deal</h4>
                  <button className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 w-full">New Deal</button>
                </div>
                <div className="bg-white rounded-xl shadow p-6 text-center">
                  <h4 className="font-semibold text-genie-teal mb-4">Export Data</h4>
                  <button className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 w-full">Export CSV</button>
                </div>
              </div>
            </div>
          )}
          {activeSection === 'Appointments' && (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
              <h2 className="text-3xl font-bold text-genie-teal mb-8">Appointments</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="calendar" className="text-genie-teal text-3xl mb-2">📅</span>
                  <div className="text-2xl font-bold text-gray-900">22</div>
                  <div className="text-gray-500">Upcoming</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="booked" className="text-genie-teal text-3xl mb-2">✅</span>
                  <div className="text-2xl font-bold text-gray-900">15</div>
                  <div className="text-gray-500">Booked</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="cancelled" className="text-genie-teal text-3xl mb-2">❌</span>
                  <div className="text-2xl font-bold text-gray-900">3</div>
                  <div className="text-gray-500">Cancelled</div>
                </div>
              </div>
              {/* Calendar Integration */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Calendar Integration</h3>
                <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 flex items-center gap-2">
                    <span>📅</span> Connect Google Calendar
                  </button>
                  <button className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                    <span>📧</span> Connect Outlook
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 flex items-center gap-2">
                    <span>🔗</span> Custom Integration
                  </button>
                </div>
              </div>

              {/* Booking Settings */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Booking Settings</h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Duration</label>
                    <select className="border p-3 rounded w-full">
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>45 minutes</option>
                      <option>60 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Time</label>
                    <select className="border p-3 rounded w-full">
                      <option>No buffer</option>
                      <option>5 minutes</option>
                      <option>10 minutes</option>
                      <option>15 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Hours</label>
                    <input type="time" className="border p-3 rounded w-full" defaultValue="09:00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input type="time" className="border p-3 rounded w-full" defaultValue="17:00" />
                  </div>
                  <button type="submit" className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 col-span-1 md:col-span-2">Save Settings</button>
                </form>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Upcoming Appointments</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-genie-teal bg-blue-50 p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Demo Call - Acme Corp</h4>
                        <p className="text-gray-600">John Smith</p>
                        <p className="text-sm text-gray-500">Today at 2:00 PM - 3:00 PM</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-genie-teal hover:underline">Join</button>
                        <button className="text-blue-600 hover:underline">Reschedule</button>
                      </div>
                    </div>
                  </div>
                  <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Strategy Session - Tech Startup</h4>
                        <p className="text-gray-600">Sarah Johnson</p>
                        <p className="text-sm text-gray-500">Tomorrow at 10:00 AM - 11:00 AM</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-genie-teal hover:underline">Prepare</button>
                        <button className="text-blue-600 hover:underline">Send Reminder</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6 gap-2">
                  <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">View Calendar</button>
                  <button className="bg-genie-teal/10 text-genie-teal px-4 py-2 rounded hover:bg-genie-teal/20">Book Meeting</button>
                </div>
              </div>
            </div>
          )}
          {activeSection === 'Workflow Automation' && (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
              <h2 className="text-3xl font-bold text-genie-teal mb-8">Workflow Automation</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="automation" className="text-genie-teal text-3xl mb-2">🤖</span>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-gray-500">Active Workflows</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="tasks" className="text-genie-teal text-3xl mb-2">📝</span>
                  <div className="text-2xl font-bold text-gray-900">34</div>
                  <div className="text-gray-500">Tasks Automated</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="efficiency" className="text-genie-teal text-3xl mb-2">⚙️</span>
                  <div className="text-2xl font-bold text-gray-900">89%</div>
                  <div className="text-gray-500">Efficiency</div>
                </div>
              </div>
              {/* Workflow Builder */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Create New Workflow</h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Workflow Name" className="border p-3 rounded" required />
                  <select className="border p-3 rounded">
                    <option>Select Trigger</option>
                    <option>New Lead Added</option>
                    <option>Email Opened</option>
                    <option>Form Submitted</option>
                    <option>Deal Stage Changed</option>
                  </select>
                  <select className="border p-3 rounded">
                    <option>Select Action</option>
                    <option>Send Email</option>
                    <option>Add to Sequence</option>
                    <option>Update Field</option>
                    <option>Create Task</option>
                  </select>
                  <input type="number" placeholder="Delay (minutes)" className="border p-3 rounded" />
                  <textarea placeholder="Workflow Description" className="border p-3 rounded col-span-1 md:col-span-2" />
                  <button type="submit" className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 col-span-1 md:col-span-2">Create Workflow</button>
                </form>
              </div>

              {/* Active Workflows */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Active Workflows</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Welcome New Leads</h4>
                      <p className="text-gray-600">Trigger: New Lead → Send welcome email sequence</p>
                      <p className="text-sm text-gray-500">Last triggered: 2 hours ago</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span>
                      <button className="text-genie-teal hover:underline">Edit</button>
                      <button className="text-red-500 hover:underline">Pause</button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Follow-up Reminder</h4>
                      <p className="text-gray-600">Trigger: No response after 3 days → Create task</p>
                      <p className="text-sm text-gray-500">Last triggered: 1 day ago</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span>
                      <button className="text-genie-teal hover:underline">Edit</button>
                      <button className="text-red-500 hover:underline">Pause</button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6 gap-2">
                  <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">View All</button>
                  <button className="bg-genie-teal/10 text-genie-teal px-4 py-2 rounded hover:bg-genie-teal/20">New Workflow</button>
                </div>
              </div>
            </div>
          )}
          {activeSection === 'Reporting & Analytics' && (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
              <h2 className="text-3xl font-bold text-genie-teal mb-8">Reporting & Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="reports" className="text-genie-teal text-3xl mb-2">📊</span>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-gray-500">Active Reports</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="insights" className="text-genie-teal text-3xl mb-2">🔍</span>
                  <div className="text-2xl font-bold text-gray-900">5</div>
                  <div className="text-gray-500">Insights</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="growth" className="text-genie-teal text-3xl mb-2">📈</span>
                  <div className="text-2xl font-bold text-gray-900">22%</div>
                  <div className="text-gray-500">Growth Rate</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">Analytics and reporting features coming soon...</div>
            </div>
          )}
          {activeSection === 'White-Label SaaS' && (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
              <h2 className="text-3xl font-bold text-genie-teal mb-8">White-Label SaaS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="branding" className="text-genie-teal text-3xl mb-2">🏷️</span>
                  <div className="text-2xl font-bold text-gray-900">4</div>
                  <div className="text-gray-500">Brands</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="clients" className="text-genie-teal text-3xl mb-2">👔</span>
                  <div className="text-2xl font-bold text-gray-900">18</div>
                  <div className="text-gray-500">Clients</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="whitelabel" className="text-genie-teal text-3xl mb-2">🛠️</span>
                  <div className="text-2xl font-bold text-gray-900">6</div>
                  <div className="text-gray-500">Active SaaS</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">White-label SaaS management coming soon...</div>
            </div>
          )}
          {activeSection === 'Cost Controls' && (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
              <h2 className="text-3xl font-bold text-genie-teal mb-8">Cost Controls</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="budget" className="text-genie-teal text-3xl mb-2">💸</span>
                  <div className="text-2xl font-bold text-gray-900">$8,200</div>
                  <div className="text-gray-500">Budget Used</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="savings" className="text-genie-teal text-3xl mb-2">💰</span>
                  <div className="text-2xl font-bold text-gray-900">$2,400</div>
                  <div className="text-gray-500">Savings</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="controls" className="text-genie-teal text-3xl mb-2">🛡️</span>
                  <div className="text-2xl font-bold text-gray-900">5</div>
                  <div className="text-gray-500">Active Controls</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">Budget control and cost optimization features coming soon...</div>
            </div>
          )}
          {activeSection === 'AI & Automation' && (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
              <h2 className="text-3xl font-bold text-genie-teal mb-8">AI & Automation</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="ai" className="text-genie-teal text-3xl mb-2">🤖</span>
                  <div className="text-2xl font-bold text-gray-900">6</div>
                  <div className="text-gray-500">AI Models</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="automations" className="text-genie-teal text-3xl mb-2">⚡</span>
                  <div className="text-2xl font-bold text-gray-900">14</div>
                  <div className="text-gray-500">Automations</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="tasks" className="text-genie-teal text-3xl mb-2">📝</span>
                  <div className="text-2xl font-bold text-gray-900">120</div>
                  <div className="text-gray-500">Tasks Automated</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">AI-powered automation features coming soon...</div>
            </div>
          )}
          
          {activeSection === 'API Keys & Integrations' && renderAPIKeys()}
          {activeSection === 'Admin Panel' && renderAdminPanel()}
          {activeSection === 'Account Settings' && renderAccountSettings()}
        </main>
        </div>
      </div>
    </GenieProvider>
  )

  // Helper function to update classes with dark mode support
  const getDarkModeClasses = (lightClasses, darkClasses = '') => {
    const dark = darkClasses || lightClasses.replace('bg-white', 'bg-gray-800').replace('text-gray-900', 'text-white').replace('text-gray-700', 'text-gray-300')
    return isDarkMode ? dark : lightClasses
  }

  function renderDashboard() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
        <h2 className={`text-3xl font-bold text-genie-teal mb-8 ${isDarkMode ? 'text-genie-teal' : ''}`}>SuperGenie Dashboard</h2>
        
        {/* Financial Overview Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="revenue" className="text-genie-teal text-3xl mb-2">💰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$45,230</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Revenue</div>
            <div className="text-green-500 text-sm mt-1">+12.5% ↗️</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="leads" className="text-genie-teal text-3xl mb-2">🎯</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1,247</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Leads</div>
            <div className="text-green-500 text-sm mt-1">+8.3% ↗️</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="conversion" className="text-genie-teal text-3xl mb-2">📊</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>24.6%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Conversion Rate</div>
            <div className="text-green-500 text-sm mt-1">+3.1% ↗️</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="campaigns" className="text-genie-teal text-3xl mb-2">🚀</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>18</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Campaigns</div>
            <div className="text-blue-500 text-sm mt-1">Running</div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Revenue Growth</h3>
          <div className="h-64 flex items-end justify-between bg-gradient-to-t from-blue-50 to-white rounded p-4">
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-32 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jan</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-40 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Feb</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-36 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mar</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-48 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Apr</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-44 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>May</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-52 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jun</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-genie-teal text-white p-6 rounded-xl shadow hover:bg-genie-teal/90 transition-colors text-left">
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-semibold mb-1">Start New Campaign</div>
            <div className="text-genie-teal-light text-sm">Launch a new lead generation campaign</div>
          </button>
          <button className="bg-blue-600 text-white p-6 rounded-xl shadow hover:bg-blue-700 transition-colors text-left">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold mb-1">View Analytics</div>
            <div className="text-blue-200 text-sm">Deep dive into your performance metrics</div>
          </button>
          <button className="bg-purple-600 text-white p-6 rounded-xl shadow hover:bg-purple-700 transition-colors text-left">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-semibold mb-1">Automation Hub</div>
            <div className="text-purple-200 text-sm">Manage your automated workflows</div>
          </button>
        </div>
      </div>
    )
  }

  function renderAccountSettings() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Account Settings</h2>
        
        {/* Profile Information */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Full Name</label>
              <input 
                type="text" 
                defaultValue="John Smith" 
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Email Address</label>
              <input 
                type="email" 
                defaultValue="john@company.com" 
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Company</label>
              <input 
                type="text" 
                defaultValue="Acme Corporation" 
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Time Zone</label>
              <select className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}>
                <option>Eastern Time (ET)</option>
                <option>Central Time (CT)</option>
                <option>Mountain Time (MT)</option>
                <option>Pacific Time (PT)</option>
              </select>
            </div>
          </div>
          <button className="mt-6 bg-genie-teal text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors">
            Save Changes
          </button>
        </div>

        {/* Security Settings */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add an extra layer of security to your account</p>
              </div>
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm">Enabled</button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Change Password</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Update your account password</p>
              </div>
              <button className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Change</button>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email Notifications</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Receive updates about your campaigns</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SMS Notifications</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Get alerts via text message</p>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Marketing Updates</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stay informed about new features</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderAPIKeys() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>API Keys & Integrations</h2>
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="keys" className="text-genie-teal text-3xl mb-2">🔑</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active API Keys</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="integrations" className="text-genie-teal text-3xl mb-2">🔗</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>12</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Connected Services</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="usage" className="text-genie-teal text-3xl mb-2">📊</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>89%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>API Usage</div>
          </div>
        </div>

        {/* Add New API Key */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Add New API Key</h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            Connect your own API keys for AI services. Your keys are stored securely and never shared with Genie Labs.
          </p>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Service Provider</label>
              <select className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                <option>Select Provider</option>
                <option>OpenAI (GPT-4)</option>
                <option>Anthropic (Claude)</option>
                <option>Google (Gemini)</option>
                <option>Cohere</option>
                <option>Hugging Face</option>
                <option>Custom API</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>API Key Name</label>
              <input type="text" className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="My OpenAI Key" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 w-full">Add Key</button>
            </div>
          </form>
        </div>

        {/* Existing API Keys */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Your API Keys</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Usage</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>OpenAI GPT-4</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Production Key</td>
                  <td className="py-3 px-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span></td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>12,450 requests</td>
                  <td className="py-3 px-4">
                    <button className="text-genie-teal hover:text-genie-teal/80 mr-3">Edit</button>
                    <button className="text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Anthropic Claude</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Development Key</td>
                  <td className="py-3 px-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Limited</span></td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>3,200 requests</td>
                  <td className="py-3 px-4">
                    <button className="text-genie-teal hover:text-genie-teal/80 mr-3">Edit</button>
                    <button className="text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  function renderAdminPanel() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Admin Panel</h2>
        
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="users" className="text-genie-teal text-3xl mb-2">👥</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2,847</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="revenue" className="text-genie-teal text-3xl mb-2">💰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$125K</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Revenue</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="support" className="text-genie-teal text-3xl mb-2">🎫</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>23</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Open Tickets</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="system" className="text-genie-teal text-3xl mb-2">⚡</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>99.8%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>System Uptime</div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>User Management</h3>
            <div className="space-y-4">
              <button className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 text-left flex items-center gap-3">
                <span>👤</span> View All Users
              </button>
              <button className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 text-left flex items-center gap-3">
                <span>➕</span> Create New User
              </button>
              <button className="w-full bg-orange-600 text-white p-3 rounded hover:bg-orange-700 text-left flex items-center gap-3">
                <span>🔒</span> Manage Permissions
              </button>
              <button className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 text-left flex items-center gap-3">
                <span>🚫</span> Suspended Users
              </button>
            </div>
          </div>

          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>System Administration</h3>
            <div className="space-y-4">
              <button className="w-full bg-purple-600 text-white p-3 rounded hover:bg-purple-700 text-left flex items-center gap-3">
                <span>📊</span> System Analytics
              </button>
              <button className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 text-left flex items-center gap-3">
                <span>⚙️</span> System Configuration
              </button>
              <button className="w-full bg-gray-600 text-white p-3 rounded hover:bg-gray-700 text-left flex items-center gap-3">
                <span>📝</span> View System Logs
              </button>
              <button className="w-full bg-yellow-600 text-white p-3 rounded hover:bg-yellow-700 text-left flex items-center gap-3">
                <span>🔧</span> Maintenance Mode
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Recent Admin Activity</h3>
          <div className="space-y-4">
            <div className={`border-l-4 border-blue-500 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded`}>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User Registration Spike</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>47 new users registered in the last hour</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>2 minutes ago</div>
            </div>
            <div className={`border-l-4 border-green-500 ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'} p-4 rounded`}>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Update Completed</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Version 2.1.3 deployed successfully</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>15 minutes ago</div>
            </div>
            <div className={`border-l-4 border-yellow-500 ${isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'} p-4 rounded`}>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>High API Usage Alert</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>OpenAI API usage at 85% of monthly limit</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>1 hour ago</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderLeadGeneration() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Lead Generation</h2>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="leads" className="text-genie-teal text-3xl mb-2">🧲</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>320</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>New Leads</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="import" className="text-genie-teal text-3xl mb-2">📥</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>120</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Imported Contacts</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="conversion" className="text-genie-teal text-3xl mb-2">🔄</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>18%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Lead Conversion</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="budget" className="text-genie-teal text-3xl mb-2">💸</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$120</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Budget Used</div>
          </div>
        </div>

        {/* Budget-Aware Scraping Controls */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-2`}>Budget-Aware Scraping Controls</h3>
          <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
            <label className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Monthly Scraping/API Budget ($):</label>
            <input type="number" min="10" max="1000" defaultValue="50" className={`border p-2 rounded w-32 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
            <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">Update Budget</button>
          </div>
          <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Estimated leads per budget: <span className="font-bold">{Math.floor(50/0.5)} leads</span> (demo)</div>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded p-4 mb-2`}>Current usage: <span className="font-bold">$32</span> / $50</div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>You can update your budget as your capital grows. Low-cost mode helps startups stay within limits.</div>
          <div className="text-xs text-red-500">{32 > 50 ? 'Warning: Budget exceeded! Scraping limited.' : ''}</div>
        </div>

        {/* Recent Leads Table */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Recent Leads</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Company</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Source</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Jane Doe</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>jane@example.com</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Acme Inc.</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Website</td>
                  <td className="py-3 px-4">
                    <button className="text-genie-teal hover:text-genie-teal/80 mr-3">Contact</button>
                    <button className="text-blue-500 hover:text-blue-700">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  function renderOutreachAutomation() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Outreach Automation</h2>
        
        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="campaigns" className="text-genie-teal text-3xl mb-2">📧</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>12</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Campaigns</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="sent" className="text-genie-teal text-3xl mb-2">📤</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2,430</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Emails Sent</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="opened" className="text-genie-teal text-3xl mb-2">👀</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>68%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Open Rate</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="responses" className="text-genie-teal text-3xl mb-2">💬</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>24%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Response Rate</div>
          </div>
        </div>

        {/* Campaign Builder */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Create New Campaign</h3>
          <form className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Campaign Name</label>
              <input type="text" className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} placeholder="Q1 Product Launch" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Campaign Type</label>
                <select className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                  <option>Email Sequence</option>
                  <option>SMS Campaign</option>
                  <option>LinkedIn Outreach</option>
                  <option>Multi-Channel</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Target Audience</label>
                <select className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                  <option>All Leads</option>
                  <option>New Leads</option>
                  <option>Warm Prospects</option>
                  <option>Custom Segment</option>
                </select>
              </div>
            </div>
            <button type="submit" className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80">Create Campaign</button>
          </form>
        </div>

        {/* Active Campaigns */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Active Campaigns</h3>
          <div className="space-y-4">
            <div className={`border-l-4 border-genie-teal ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Q1 Product Launch</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Email sequence • 450 recipients</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Edit</button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Pause</button>
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Progress: 68% sent</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-genie-teal h-2 rounded-full" style={{width: '68%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderCRMPipeline() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>CRM & Pipeline</h2>
        
        {/* Pipeline Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="prospects" className="text-genie-teal text-3xl mb-2">🎯</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>127</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Prospects</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="qualified" className="text-genie-teal text-3xl mb-2">✅</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>43</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Qualified</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="proposals" className="text-genie-teal text-3xl mb-2">📄</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>18</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Proposals Sent</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="closed" className="text-genie-teal text-3xl mb-2">💰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$89K</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Closed Won</div>
          </div>
        </div>

        {/* Pipeline Kanban */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Sales Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead (34)</h4>
              <div className="space-y-2">
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Acme Corp</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$15,000</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>TechStart Inc</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$8,500</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Qualified (18)</h4>
              <div className="space-y-2">
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Global Solutions</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$25,000</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Proposal (8)</h4>
              <div className="space-y-2">
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise Co</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$45,000</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Closed Won (5)</h4>
              <div className="space-y-2">
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Success Ltd</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$32,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderAppointments() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Appointments</h2>
        
        {/* Appointment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="today" className="text-genie-teal text-3xl mb-2">📅</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Today's Meetings</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="week" className="text-genie-teal text-3xl mb-2">📊</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>23</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>This Week</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="rate" className="text-genie-teal text-3xl mb-2">✅</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>92%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Show-up Rate</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="conversion" className="text-genie-teal text-3xl mb-2">💰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>67%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Conversion Rate</div>
          </div>
        </div>

        {/* Calendar Integration */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Calendar Integrations</h3>
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 flex items-center gap-2">
              <span>📅</span> Connect Google Calendar
            </button>
            <button className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
              <span>📧</span> Connect Outlook
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 flex items-center gap-2">
              <span>🔗</span> Custom Integration
            </button>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Upcoming Appointments</h3>
          <div className="space-y-4">
            <div className={`border-l-4 border-genie-teal ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product Demo - TechCorp</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Today at 2:00 PM • John Smith • john@techcorp.com</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Join</button>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Reschedule</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderWorkflowAutomation() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Workflow Automation</h2>
        
        {/* Automation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="workflows" className="text-genie-teal text-3xl mb-2">⚡</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>8</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Workflows</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="tasks" className="text-genie-teal text-3xl mb-2">✅</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1,247</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tasks Automated</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="time" className="text-genie-teal text-3xl mb-2">⏰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>42h</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Time Saved</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="success" className="text-genie-teal text-3xl mb-2">📈</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>94%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Success Rate</div>
          </div>
        </div>

        {/* Workflow Builder */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Workflow Builder</h3>
          <div className="flex gap-4 mb-4">
            <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">+ New Workflow</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Import Template</button>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-4`}>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Drag and drop workflow components here to build your automation</p>
          </div>
        </div>

        {/* Active Workflows */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Active Workflows</h3>
          <div className="space-y-4">
            <div className={`border-l-4 border-green-500 ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'} p-4 rounded`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead Nurturing Sequence</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Triggers: New lead added • Actions: Send welcome email, add to CRM</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                  <button className="text-blue-500 hover:text-blue-700">Edit</button>
                </div>
              </div>
              <div className="mt-2">
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Executed 247 times this month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App
