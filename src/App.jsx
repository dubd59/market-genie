import React from 'react'
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
  return (
    <AuthProvider>
      <GenieProvider>
        {/* Main App Structure */}
        <div className="app-container bg-[var(--bg-light)] text-[var(--text-primary)] min-h-screen">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <CampaignBuilder />
              </ProtectedRoute>
            } />
            
            <Route path="/campaigns/builder" element={
              <ProtectedRoute>
                <CampaignBuilder />
              </ProtectedRoute>
            } />
            
            <Route path="/contacts" element={
              <ProtectedRoute>
                <ContactManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          {/* Competitive Differentiators UI */}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              success: {
                iconTheme: { primary: '#38BEBA', secondary: 'white' },
              },
              style: {
                background: 'var(--bg-dark)',
                color: 'white',
                border: '1px solid var(--teal-accent)',
              }
            }}
          />
          
          {/* Voice Command Floating Button */}
          <VoiceButton />
          
          {/* Support Ticket Form and List for Testing */}
          <SupportTicketForm />
          <SupportTicketList />
          
          {/* Trap door for future SuperGenie dashboard integration */}
          <div style={{margin:'2rem auto',padding:10,border:'1px dashed #aaa',maxWidth:400,textAlign:'center',background:'#f9f9f9'}}>
            <strong>SuperGenie Dashboard Placeholder</strong>
            <div style={{fontSize:12,color:'#888'}}>Future integration point for MarketGenie, OfficeGenie, and SupportGenie unified dashboard.</div>
          </div>
        </div>
      </GenieProvider>
    </AuthProvider>
  )
}

export default App
