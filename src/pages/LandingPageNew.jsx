import React from 'react'
import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧞‍♂️</span>
          <h1 className="text-2xl font-bold text-genie-teal">Market Genie</h1>
        </div>
        <div className="flex gap-4">
          <Link to="/dashboard" className="bg-genie-teal text-white px-6 py-2 rounded-lg hover:bg-genie-teal/90">
            Dashboard
          </Link>
          <Link to="/admin" className="border border-genie-teal text-genie-teal px-6 py-2 rounded-lg hover:bg-genie-teal/10">
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Automate Your <span className="text-genie-teal">Lead Generation</span> & Marketing
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Market Genie is the complete AI-powered marketing automation platform. Generate leads, 
          nurture prospects, and close deals with sophisticated automation workflows.
        </p>
        
        <div className="flex justify-center gap-4 mb-16">
          <Link 
            to="/dashboard" 
            className="bg-genie-teal text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-genie-teal/90 transition-colors"
          >
            Get Started Free
          </Link>
          <button className="border border-gray-300 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
            Watch Demo
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3">Smart Lead Generation</h3>
            <p className="text-gray-600">Budget-aware scraping with AI enrichment and deduplication</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-3">Automation Workflows</h3>
            <p className="text-gray-600">Visual workflow builder with multi-channel campaigns</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Analytics & CRM</h3>
            <p className="text-gray-600">Complete pipeline management with advanced reporting</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-2xl">🧞‍♂️</span>
            <h2 className="text-xl font-bold text-genie-teal">Market Genie</h2>
          </div>
          <p className="text-gray-600">© 2024 Market Genie. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
