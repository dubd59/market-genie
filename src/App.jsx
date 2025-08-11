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

  return (
    <GenieProvider>
      <div className="app-container bg-[var(--bg-light)] text-[var(--text-primary)] min-h-screen" style={{ display: 'flex', minHeight: '100vh', background: '#f6f8fa' }}>
        <Sidebar activeSection={activeSection} onSelect={setActiveSection} />
        <main style={{ flex: 1, padding: '2rem 3vw' }}>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
              </div>
              <div className="bg-white rounded-xl shadow p-6">Lead generation tools and import options coming soon...</div>
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
              <div className="bg-white rounded-xl shadow p-6">Automated outreach and campaign scheduling coming soon...</div>
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
              <div className="bg-white rounded-xl shadow p-6">CRM and pipeline management features coming soon...</div>
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
              <div className="bg-white rounded-xl shadow p-6">Appointment booking and calendar integration coming soon...</div>
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
              <div className="bg-white rounded-xl shadow p-6">Workflow builder and automation tools coming soon...</div>
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
        </main>
      </div>
    </GenieProvider>
  )
}

export default App
