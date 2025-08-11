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
  const [activeSection, setActiveSection] = useState('Lead Generation')

  return (
    <AuthProvider>
      <GenieProvider>
        {/* Main App Structure */}
        <div className="app-container bg-[var(--bg-light)] text-[var(--text-primary)] min-h-screen" style={{ display: 'flex', minHeight: '100vh', background: '#f6f8fa' }}>
          <Sidebar activeSection={activeSection} onSelect={setActiveSection} />
          <main style={{ flex: 1, padding: '2rem 3vw' }}>
            {/* Section content rendering */}
            {activeSection === 'Lead Generation' && (
              <div>
                <h2 style={{ color: '#38beba' }}>Lead Generation</h2>
                {/* Lead generation UI will go here */}
                <SupportTicketForm />
                <SupportTicketList />
              </div>
            )}
            {activeSection === 'Outreach Automation' && (
              <div>
                <h2 style={{ color: '#38beba' }}>Outreach Automation</h2>
                {/* Outreach automation UI will go here */}
              </div>
            )}
            {activeSection === 'CRM & Pipeline' && (
              <div>
                <h2 style={{ color: '#38beba' }}>CRM & Pipeline</h2>
                {/* CRM & pipeline UI will go here */}
              </div>
            )}
            {activeSection === 'Appointments' && (
              <div>
                <h2 style={{ color: '#38beba' }}>Appointments</h2>
                {/* Appointment booking UI will go here */}
              </div>
            )}
            {activeSection === 'Workflow Automation' && (
              <div>
                <h2 style={{ color: '#38beba' }}>Workflow Automation</h2>
                {/* Workflow automation UI will go here */}
              </div>
            )}
            {activeSection === 'Reporting & Analytics' && (
              <div>
                <h2 style={{ color: '#38beba' }}>Reporting & Analytics</h2>
                {/* Reporting & analytics UI will go here */}
              </div>
            )}
            {activeSection === 'White-Label SaaS' && (
              <div>
                <h2 style={{ color: '#38beba' }}>White-Label SaaS</h2>
                {/* White-label SaaS UI will go here */}
              </div>
            )}
            {activeSection === 'Cost Controls' && (
              <div>
                <h2 style={{ color: '#38beba' }}>Cost Controls</h2>
                {/* Budget control UI will go here */}
              </div>
            )}
            {activeSection === 'AI & Automation' && (
              <div>
                <h2 style={{ color: '#38beba' }}>AI & Automation</h2>
                {/* AI & automation UI will go here */}
              </div>
            )}
            {activeSection === 'SuperGenie Dashboard' && (
              <div>
                <h2 style={{ color: '#38beba' }}>SuperGenie Dashboard</h2>
                {/* Unified dashboard UI will go here */}
              </div>
            )}
          </main>
        </div>
      </GenieProvider>
    </AuthProvider>
  )
}

export default App
