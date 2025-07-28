import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

export default function Layout({ children }) {
  const { user } = useAuth()

  if (!user) {
    return children // Return children directly for auth pages
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
