import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTenant } from '../contexts/TenantContext'
import LeadService from '../services/leadService'
import ProspeoLeadSearch from './ProspeoLeadSearch'
import toast from 'react-hot-toast'

const LiveLeadGeneration = () => {
  const { user } = useAuth()
  const { tenant } = useTenant()
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Helper function to update classes with dark mode support
  const getDarkModeClasses = (lightClasses, darkClasses = '') => {
    const dark = darkClasses || lightClasses.replace('bg-white', 'bg-gray-800').replace('text-gray-900', 'text-white').replace('text-gray-700', 'text-gray-300')
    return isDarkMode ? dark : lightClasses
  }
  
  // Check for dark mode preference
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);
  
  const [leads, setLeads] = useState([])
  const [leadStats, setLeadStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState([])
  const [emergencySyncStatus, setEmergencySyncStatus] = useState({ syncing: false, count: 0 })

  const [newLead, setNewLead] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    title: '',
    phone: '',
    source: 'manual',
    notes: ''
  })

  useEffect(() => {
    if (tenant?.id) {
      // 🚀 PERFORMANCE FIX: Trigger immediate sync when user opens Recent Leads tab
      triggerEmergencySync()
      
      loadLeadData()
      
      // Set up automatic refresh every 10 seconds to catch new scraped leads
      const refreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing Recent Leads (checking database + emergency storage)...')
        loadLeadData()
      }, 10000) // 10 seconds
      
      // Listen for emergency lead storage events
      const handleForceRefresh = (event) => {
        console.log('🚨 Emergency lead storage triggered refresh:', event.detail)
        loadLeadData()
      }
      
      window.addEventListener('forceLoadLeadsFromDatabase', handleForceRefresh)
      window.addEventListener('refreshRecentLeads', handleForceRefresh)
      window.addEventListener('emergencyLeadsSync', handleForceRefresh) // 🚨 CRITICAL: Listen for emergency sync events
      
      return () => {
        clearInterval(refreshInterval)
        window.removeEventListener('forceLoadLeadsFromDatabase', handleForceRefresh)
        window.removeEventListener('refreshRecentLeads', handleForceRefresh)
        window.removeEventListener('emergencyLeadsSync', handleForceRefresh) // 🚨 CRITICAL: Cleanup
      }
    }
  }, [tenant])

  // 🚀 NEW: Manual force sync function when user clicks button
  const handleForceSync = async () => {
    setEmergencySyncStatus(prev => ({ ...prev, syncing: true }))
    
    try {
      const emergencyStorage = window.emergencyLeadStorage
      if (emergencyStorage) {
        const pendingCount = emergencyStorage.getEmergencyLeadCount()
        if (pendingCount > 0) {
          console.log(`🚀 FORCE SYNC: User requested manual sync of ${pendingCount} emergency leads`)
          toast.loading(`Syncing ${pendingCount} emergency leads...`, { duration: 3000 })
          
          const result = await emergencyStorage.triggerImmediateSync()
          
          if (result.success) {
            toast.success(`✅ Successfully synced ${result.synced} leads to database!`)
            await loadLeadData() // Refresh the leads list
            setEmergencySyncStatus({ syncing: false, count: 0 })
          } else {
            toast.error('❌ Sync failed: ' + (result.error || 'Unknown error'))
            setEmergencySyncStatus(prev => ({ ...prev, syncing: false }))
          }
        } else {
          toast.success('✅ No emergency leads to sync - all caught up!')
          setEmergencySyncStatus({ syncing: false, count: 0 })
        }
      } else {
        toast.error('Emergency storage not available')
        setEmergencySyncStatus(prev => ({ ...prev, syncing: false }))
      }
    } catch (error) {
      console.error('Force sync error:', error)
      toast.error('❌ Force sync failed: ' + error.message)
      setEmergencySyncStatus(prev => ({ ...prev, syncing: false }))
    }
  }

  // 🚀 NEW: Trigger immediate emergency sync when user switches to Recent Leads
  const triggerEmergencySync = async () => {
    try {
      const emergencyStorage = window.emergencyLeadStorage
      if (emergencyStorage) {
        const pendingCount = emergencyStorage.getEmergencyLeadCount()
        setEmergencySyncStatus({ syncing: pendingCount > 0, count: pendingCount })
        
        if (pendingCount > 0) {
          console.log(`🚀 RECENT LEADS: Triggering fast sync for ${pendingCount} emergency leads...`)
          const result = await emergencyStorage.triggerImmediateSync()
          if (result.success && result.synced > 0) {
            console.log(`✅ Fast sync completed: ${result.synced} leads moved to database`)
            setEmergencySyncStatus({ syncing: false, count: 0 })
          }
        }
      }
    } catch (error) {
      console.log('Emergency sync trigger failed:', error.message)
      setEmergencySyncStatus({ syncing: false, count: 0 })
    }
  }

  const loadLeadData = async () => {
    try {
      setLoading(true)
      
      // Load leads and stats from Firebase database
      const [leadsResult, statsResult] = await Promise.all([
        LeadService.getLeads(tenant.id),
        LeadService.getLeadStats(tenant.id)
      ])

      let allLeads = []
      
      if (leadsResult.data) {
        allLeads = [...leadsResult.data]
      }

      // 🚨 CRITICAL: Also include emergency storage leads that haven't been synced yet
      try {
        const emergencyLeadStorage = window.emergencyLeadStorage || window.EmergencyLeadStorage
        if (emergencyLeadStorage) {
          const emergencyLeads = emergencyLeadStorage.getAllLeads()
          if (emergencyLeads && emergencyLeads.length > 0) {
            console.log(`📱 Including ${emergencyLeads.length} emergency storage leads in Recent Leads display`)
            
            // Add emergency leads to the display, avoiding duplicates
            const existingEmails = new Set(allLeads.map(lead => lead.email))
            const newEmergencyLeads = emergencyLeads.filter(lead => !existingEmails.has(lead.email))
            
            allLeads = [...allLeads, ...newEmergencyLeads]
            console.log(`📊 Total leads displayed: ${allLeads.length} (${leadsResult.data?.length || 0} from database + ${newEmergencyLeads.length} from emergency storage)`)
          }
        }
      } catch (emergencyError) {
        console.log('No emergency storage found or error accessing it:', emergencyError.message)
      }

      setLeads(allLeads)

      if (statsResult.data) {
        setLeadStats(statsResult.data)
      }
    } catch (error) {
      console.error('Error loading lead data:', error)
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLead = async (e) => {
    e.preventDefault()
    
    if (!newLead.firstName || !newLead.lastName || !newLead.email) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      const result = await LeadService.createLead(tenant.id, newLead)
      
      if (result.data) {
        toast.success('Lead created successfully!')
        setNewLead({
          firstName: '',
          lastName: '',
          email: '',
          company: '',
          title: '',
          phone: '',
          source: 'manual',
          notes: ''
        })
        await loadLeadData() // Refresh data
      } else {
        toast.error('Failed to create lead')
      }
    } catch (error) {
      console.error('Error creating lead:', error)
      toast.error('Failed to create lead')
    }
  }

  const handleGenerateAILeads = async (source) => {
    setGenerating(true)
    try {
      const result = await LeadService.generateAILeads(tenant.id, source, 5)
      
      if (result.data && result.data.length > 0) {
        toast.success(`Generated ${result.data.length} AI leads from ${source}!`)
        await loadLeadData() // Refresh data
      } else {
        toast.error('Failed to generate leads')
      }
    } catch (error) {
      console.error('Error generating AI leads:', error)
      toast.error('Failed to generate leads')
    } finally {
      setGenerating(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'converted': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Export CSV functionality
  const exportToCSV = (leadsToExport = null) => {
    const dataToExport = leadsToExport || leads;
    if (dataToExport.length === 0) {
      toast.error('No leads to export');
      return;
    }

    const csvHeaders = [
      'First Name',
      'Last Name', 
      'Email',
      'Company',
      'Title',
      'Phone',
      'Source',
      'Status',
      'Score',
      'Notes',
      'Created Date'
    ];

    const csvData = dataToExport.map(lead => [
      lead.firstName || '',
      lead.lastName || '',
      lead.email || '',
      lead.company || '',
      lead.title || '',
      lead.phone || '',
      lead.source || '',
      lead.status || '',
      lead.score || '',
      lead.notes || '',
      lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ''
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `market-genie-leads-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${dataToExport.length} leads to CSV`);
  }

  // Export selected leads only
  const exportSelectedLeads = () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads to export');
      return;
    }
    const selectedLeadData = leads.filter(lead => selectedLeads.includes(lead.id));
    exportToCSV(selectedLeadData);
  }

  // Select/deselect all leads
  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  }

  // Toggle individual lead selection
  const toggleLeadSelection = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  }

  // Move qualified leads to CRM
  const moveSelectedToCRM = async () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads to move to CRM');
      return;
    }

    try {
      const selectedLeadData = leads.filter(lead => selectedLeads.includes(lead.id));
      
      // Here you would integrate with your CRM service
      // For now, we'll simulate the move
      toast.success(`Moving ${selectedLeads.length} qualified leads to CRM & Pipeline section`);
      
      // In a real implementation, you'd call a CRM service here
      // await CRMService.importLeads(selectedLeadData, tenant.id);
      
      // Clear selection after successful move
      setSelectedLeads([]);
      
    } catch (error) {
      console.error('Error moving leads to CRM:', error);
      toast.error('Failed to move leads to CRM');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-white to-blue-50">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lead generation system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-genie-teal mb-2">🚀 Lead Generation Center</h1>
            <p className="text-gray-600">AI-powered lead discovery and management system</p>
            
            {/* 🚀 Emergency Sync Status Indicator */}
            {emergencySyncStatus.syncing && (
              <div className="mt-2 flex items-center px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                <span className="text-yellow-800 text-sm font-medium">
                  🔄 Syncing {emergencySyncStatus.count} emergency leads to database...
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{leadStats.total || 0}</div>
            <div className="text-sm text-gray-500">Total Leads</div>
            
            {/* Emergency sync count if any */}
            {emergencySyncStatus.count > 0 && !emergencySyncStatus.syncing && (
              <div className="mt-1 text-xs text-yellow-600">
                {emergencySyncStatus.count} pending sync
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-xl p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{leadStats.todayCount || 0}</div>
                <div className="text-gray-500">Today's Leads</div>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-xl p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{leadStats.qualified || 0}</div>
                <div className="text-gray-500">Qualified</div>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-xl p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600">{leadStats.contacted || 0}</div>
                <div className="text-gray-500">Contacted</div>
              </div>
              <div className="text-3xl">📞</div>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-xl p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">{leadStats.converted || 0}</div>
                <div className="text-gray-500">Converted</div>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Lead Generation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🤖 AI Lead Generation</h3>
              <p className="text-gray-600 mb-6">Generate leads from social media platforms using AI</p>
              
              <div className="space-y-3">
                {['LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'YouTube'].map(platform => (
                  <button
                    key={platform}
                    onClick={() => handleGenerateAILeads(platform)}
                    disabled={generating}
                    className="w-full flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-genie-teal hover:bg-genie-teal/5 transition-colors disabled:opacity-50"
                  >
                    <span className="font-medium">Generate from {platform}</span>
                    <span className="text-genie-teal">→</span>
                  </button>
                ))}
              </div>
              
              {generating && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-genie-teal mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Generating leads...</p>
                </div>
              )}
            </div>

            {/* Manual Lead Entry */}
            <div className="bg-white rounded-xl shadow-lg p-6 border">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">✏️ Add Lead Manually</h3>
              
              <form onSubmit={handleCreateLead} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={newLead.firstName}
                    onChange={(e) => setNewLead({...newLead, firstName: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name *"
                    value={newLead.lastName}
                    onChange={(e) => setNewLead({...newLead, lastName: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                    required
                  />
                </div>
                
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company"
                    value={newLead.company}
                    onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={newLead.title}
                    onChange={(e) => setNewLead({...newLead, title: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                  />
                </div>
                
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                />
                
                <button
                  type="submit"
                  className="w-full bg-genie-teal text-white py-3 rounded-lg hover:bg-genie-teal/80 transition-colors font-semibold"
                >
                  Add Lead
                </button>
              </form>
            </div>

            {/* Prospeo Lead Search */}
            <div className="mt-6">
              <ProspeoLeadSearch />
            </div>
          </div>

          {/* Leads List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Recent Leads</h3>
                  
                  {/* 🚀 Force Sync Button */}
                  <div className="flex items-center space-x-3">
                    {emergencySyncStatus.count > 0 && (
                      <button
                        onClick={handleForceSync}
                        disabled={emergencySyncStatus.syncing}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {emergencySyncStatus.syncing ? (
                          <>
                            <div className="inline-flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Syncing...
                            </div>
                          </>
                        ) : (
                          `🚀 Force Sync (${emergencySyncStatus.count})`
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => loadLeadData()}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-hidden">
                {leads.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Leads Yet</h3>
                    <p className="text-gray-600 mb-6">Start generating leads with AI or add them manually</p>
                    <button
                      onClick={() => handleGenerateAILeads('LinkedIn')}
                      disabled={generating}
                      className="bg-genie-teal text-white px-6 py-3 rounded-lg hover:bg-genie-teal/80 transition-colors"
                    >
                      Generate Sample Leads
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {leads.slice(0, 10).map((lead) => (
                      <div key={lead.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-genie-teal rounded-full flex items-center justify-center text-white font-semibold">
                                  {lead.firstName?.[0]}{lead.lastName?.[0]}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {lead.firstName} {lead.lastName}
                                </h4>
                                <p className="text-gray-600">{lead.title} at {lead.company}</p>
                                <p className="text-sm text-gray-500">{lead.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">Score: {lead.score || 0}</div>
                              <div className="text-xs text-gray-500">Source: {lead.source}</div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveLeadGeneration