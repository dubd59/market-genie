import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import IntegratedMarketingService from '../services/integratedMarketing'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Play, Users, Filter, X } from 'lucide-react'

const CRMCampaignIntegration = ({ 
  campaignName, 
  campaignBlocks, 
  onCampaignLaunched,
  isVisible,
  onClose 
}) => {
  const { user } = useAuth()
  
  // CRM Integration States
  const [crmContacts, setCrmContacts] = useState([])
  const [selectedContacts, setSelectedContacts] = useState([])
  const [contactFilters, setContactFilters] = useState({
    tags: [],
    status: '',
    company: '',
    source: ''
  })
  const [availableTags, setAvailableTags] = useState([])
  const [loading, setLoading] = useState(false)

  // Load CRM contacts when component mounts
  useEffect(() => {
    const loadCRMContacts = async () => {
      if (!user || !isVisible) return
      
      setLoading(true)
      try {
        const contacts = await IntegratedMarketingService.getContactsForCampaign(user.uid, contactFilters)
        setCrmContacts(contacts)
        
        // Extract unique tags for filtering
        const tags = [...new Set(contacts.flatMap(contact => contact.tags || []))]
        setAvailableTags(tags)
      } catch (error) {
        console.error('Error loading CRM contacts:', error)
        toast.error('Failed to load contacts')
      } finally {
        setLoading(false)
      }
    }

    loadCRMContacts()
  }, [user, contactFilters, isVisible])

  // Filter contacts based on current filters
  const filteredContacts = crmContacts.filter(contact => {
    if (contactFilters.tags.length > 0 && !contactFilters.tags.some(tag => contact.tags?.includes(tag))) {
      return false
    }
    if (contactFilters.status && contact.status !== contactFilters.status) {
      return false
    }
    if (contactFilters.company && !contact.company?.toLowerCase().includes(contactFilters.company.toLowerCase())) {
      return false
    }
    if (contactFilters.source && contact.source !== contactFilters.source) {
      return false
    }
    return true
  })

  // Campaign execution functions
  const executeCampaignWithContacts = async () => {
    if (selectedContacts.length === 0) {
      toast.error('Please select contacts for the campaign')
      return
    }

    if (campaignBlocks.length < 2) {
      toast.error('Please add email blocks to your campaign')
      return
    }

    try {
      setLoading(true)
      
      // Create automation campaign
      const campaignData = {
        name: campaignName,
        blocks: campaignBlocks,
        targetContacts: selectedContacts.length,
        filters: contactFilters
      }

      const campaign = await IntegratedMarketingService.createAutomationCampaign(user.uid, campaignData)
      
      // Execute campaign with selected contacts
      const execution = await IntegratedMarketingService.executeCampaign(
        user.uid, 
        campaign.id, 
        selectedContacts.map(c => c.id)
      )

      toast.success(`🚀 Campaign launched! Targeting ${selectedContacts.length} contacts`)
      
      // Call parent callback
      if (onCampaignLaunched) {
        onCampaignLaunched({
          campaign,
          execution,
          targetContacts: selectedContacts.length
        })
      }
      
      // Reset and close
      setSelectedContacts([])
      onClose()
      
    } catch (error) {
      console.error('Error executing campaign:', error)
      toast.error('Failed to launch campaign')
    } finally {
      setLoading(false)
    }
  }

  const toggleContactSelection = (contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.find(c => c.id === contact.id)
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id)
      } else {
        return [...prev, contact]
      }
    })
  }

  const selectAllContacts = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts([...filteredContacts])
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">🚀 Launch Campaign: {campaignName}</h2>
                  <p className="text-blue-100 mt-1">Select contacts from your CRM to target with this campaign</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Filters Section */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filter Your CRM Contacts</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Tags Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
                  <select
                    multiple
                    value={contactFilters.tags}
                    onChange={(e) => setContactFilters(prev => ({
                      ...prev,
                      tags: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    size="3"
                  >
                    {availableTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Status</label>
                  <select
                    value={contactFilters.status}
                    onChange={(e) => setContactFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                  </select>
                </div>

                {/* Company Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={contactFilters.company}
                    onChange={(e) => setContactFilters(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Filter by company name..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Source Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
                  <select
                    value={contactFilters.source}
                    onChange={(e) => setContactFilters(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sources</option>
                    <option value="manual">Manual Entry</option>
                    <option value="csv">CSV Import</option>
                    <option value="website">Website Form</option>
                    <option value="social">Social Media</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact List */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Available Contacts ({filteredContacts.length})
                  </h3>
                  <button
                    onClick={selectAllContacts}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {selectedContacts.length === filteredContacts.length && filteredContacts.length > 0 ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedContacts.length} selected
                </div>
              </div>

              {/* Contact Table */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading contacts...</p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p>No contacts found matching your filters</p>
                    <p className="text-sm">Try adjusting your filter criteria</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                            onChange={selectAllContacts}
                            className="w-4 h-4 text-blue-600"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tags
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContacts.map(contact => (
                        <tr
                          key={contact.id}
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedContacts.find(c => c.id === contact.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                          onClick={() => toggleContactSelection(contact)}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={!!selectedContacts.find(c => c.id === contact.id)}
                              onChange={() => toggleContactSelection(contact)}
                              className="w-4 h-4 text-blue-600"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {contact.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {contact.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {contact.company || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {contact.tags?.slice(0, 2).map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {contact.tags?.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{contact.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              contact.status === 'new' ? 'bg-green-100 text-green-800' :
                              contact.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                              contact.status === 'qualified' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {contact.status || 'new'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Campaign Target:</span> {selectedContacts.length} selected contacts will receive this email campaign
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeCampaignWithContacts}
                  disabled={selectedContacts.length === 0 || loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Launching...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Launch Campaign ({selectedContacts.length} contacts)
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CRMCampaignIntegration