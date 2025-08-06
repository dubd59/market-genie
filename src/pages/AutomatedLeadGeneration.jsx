// Frontend component for automated lead generation
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Users, 
  TrendingUp, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  BarChart3,
  Filter,
  Download,
  Play,
  Pause,
  Settings
} from 'lucide-react';

export default function AutomatedLeadGeneration() {
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapingCriteria, setScrapingCriteria] = useState({
    industry: 'SaaS',
    location: 'United States',
    companySize: '10-100',
    revenue: '$1M-$10M'
  });
  const [leadStats, setLeadStats] = useState({
    totalScraped: 0,
    qualified: 0,
    contacted: 0,
    booked: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);

  const startAutomatedGeneration = async () => {
    setIsScrapingActive(true);
    
    // Simulate automated lead generation
    const response = await fetch('/api/lead-generation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scrapingCriteria)
    });
    
    const result = await response.json();
    setLeadStats(result);
  };

  const stopAutomatedGeneration = () => {
    setIsScrapingActive(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automated Lead Generation</h1>
          <p className="text-gray-600 mt-1">
            AI-powered lead scraping, qualification, and outreach on autopilot
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isScrapingActive ? (
            <button
              onClick={startAutomatedGeneration}
              className="btn-teal flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Autopilot
            </button>
          ) : (
            <button
              onClick={stopAutomatedGeneration}
              className="btn-red flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Stop Autopilot
            </button>
          )}
          
          <button className="btn-secondary flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configure
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      {isScrapingActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-800 font-medium">
              Autopilot Active: Scanning {scrapingCriteria.industry} companies in {scrapingCriteria.location}
            </span>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-genie p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads Scraped</p>
              <p className="text-2xl font-bold text-gray-900">{leadStats.totalScraped}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card-genie p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Qualified</p>
              <p className="text-2xl font-bold text-gray-900">{leadStats.qualified}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card-genie p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contacted</p>
              <p className="text-2xl font-bold text-gray-900">{leadStats.contacted}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card-genie p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meetings Booked</p>
              <p className="text-2xl font-bold text-gray-900">{leadStats.booked}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card-genie p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scraping Criteria</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Industry
                </label>
                <select
                  value={scrapingCriteria.industry}
                  onChange={(e) => setScrapingCriteria({...scrapingCriteria, industry: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="SaaS">SaaS</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  value={scrapingCriteria.location}
                  onChange={(e) => setScrapingCriteria({...scrapingCriteria, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Size
                </label>
                <select
                  value={scrapingCriteria.companySize}
                  onChange={(e) => setScrapingCriteria({...scrapingCriteria, companySize: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="1-10">1-10 employees</option>
                  <option value="10-50">10-50 employees</option>
                  <option value="50-100">50-100 employees</option>
                  <option value="100-500">100-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Revenue Range
                </label>
                <select
                  value={scrapingCriteria.revenue}
                  onChange={(e) => setScrapingCriteria({...scrapingCriteria, revenue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="$100K-$1M">$100K-$1M</option>
                  <option value="$1M-$10M">$1M-$10M</option>
                  <option value="$10M-$50M">$10M-$50M</option>
                  <option value="$50M+">$50M+</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="lg:col-span-2">
          <div className="card-genie p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Qualified Leads</h3>
              <button className="btn-secondary flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <div className="space-y-4">
              {recentLeads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No leads generated yet.</p>
                  <p className="text-sm">Start autopilot to begin scraping qualified leads.</p>
                </div>
              ) : (
                recentLeads.map((lead, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-teal-600">
                          {lead.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{lead.name}</h4>
                        <p className="text-sm text-gray-600">{lead.title} at {lead.company}</p>
                        <p className="text-xs text-gray-500">{lead.industry} • {lead.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lead.score >= 80 ? 'bg-red-100 text-red-700' :
                        lead.score >= 60 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {lead.score >= 80 ? 'Hot' : lead.score >= 60 ? 'Warm' : 'Cold'}
                      </span>
                      
                      <button className="text-gray-400 hover:text-gray-600">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="card-genie p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Generation Performance</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Performance chart will appear here</p>
            <p className="text-sm">Start generating leads to see analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
