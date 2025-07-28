import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Mail,
  Phone,
  MessageSquare,
  Star,
  Tag,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Sparkles,
  Target,
  Calendar,
  MapPin,
  DollarSign
} from 'lucide-react'
import { useGenie } from '../contexts/GenieContext'
import GenieConsole from '../components/ai/GenieConsole'

export default function ContactManagement() {
  const { contacts, segments, createSegment, updateContact } = useGenie()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContacts, setSelectedContacts] = useState([])
  const [selectedSegment, setSelectedSegment] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showGenieConsole, setShowGenieConsole] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  // Sample contact data
  const [contactList, setContactList] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      status: 'active',
      tags: ['VIP', 'Customer'],
      lastActivity: '2 hours ago',
      source: 'Website',
      value: 2500,
      location: 'New York, NY',
      created_at: new Date('2024-01-15'),
      engagement_score: 92
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 987-6543',
      status: 'lead',
      tags: ['Prospect', 'High-Intent'],
      lastActivity: '1 day ago',
      source: 'LinkedIn',
      value: 0,
      location: 'San Francisco, CA',
      created_at: new Date('2024-01-20'),
      engagement_score: 78
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 456-7890',
      status: 'customer',
      tags: ['Customer', 'Repeat Buyer'],
      lastActivity: '3 days ago',
      source: 'Facebook Ads',
      value: 1800,
      location: 'Austin, TX',
      created_at: new Date('2024-01-10'),
      engagement_score: 85
    }
  ])

  // Sample segments
  const [segmentList, setSegmentList] = useState([
    { id: 'all', name: 'All Contacts', count: contactList.length, color: 'gray' },
    { id: 'customers', name: 'Customers', count: contactList.filter(c => c.status === 'customer').length, color: 'green' },
    { id: 'leads', name: 'Leads', count: contactList.filter(c => c.status === 'lead').length, color: 'blue' },
    { id: 'vip', name: 'VIP Contacts', count: contactList.filter(c => c.tags.includes('VIP')).length, color: 'purple' },
    { id: 'high-value', name: 'High Value', count: contactList.filter(c => c.value > 1000).length, color: 'orange' }
  ])

  const filteredContacts = contactList.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSegment = selectedSegment === 'all' ||
                          (selectedSegment === 'customers' && contact.status === 'customer') ||
                          (selectedSegment === 'leads' && contact.status === 'lead') ||
                          (selectedSegment === 'vip' && contact.tags.includes('VIP')) ||
                          (selectedSegment === 'high-value' && contact.value > 1000)
    
    return matchesSearch && matchesSegment
  })

  const handleContactAction = (action, contactId) => {
    const contact = contactList.find(c => c.id === contactId)
    
    switch (action) {
      case 'edit':
        setEditingContact(contact)
        setShowContactModal(true)
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this contact?')) {
          setContactList(contacts => contacts.filter(c => c.id !== contactId))
        }
        break
      case 'email':
        // Open email composer
        console.log('Opening email for:', contact.email)
        break
      case 'sms':
        // Open SMS composer
        console.log('Opening SMS for:', contact.phone)
        break
    }
  }

  const handleBulkAction = (action) => {
    switch (action) {
      case 'delete':
        if (confirm(`Delete ${selectedContacts.length} contacts?`)) {
          setContactList(contacts => 
            contacts.filter(c => !selectedContacts.includes(c.id))
          )
          setSelectedContacts([])
        }
        break
      case 'export':
        // Export selected contacts
        console.log('Exporting contacts:', selectedContacts)
        break
      case 'segment':
        // Create segment from selected contacts
        const segmentName = prompt('Enter segment name:')
        if (segmentName) {
          const newSegment = {
            id: `segment-${Date.now()}`,
            name: segmentName,
            count: selectedContacts.length,
            color: 'teal',
            contactIds: selectedContacts
          }
          setSegmentList(segments => [...segments, newSegment])
          setSelectedContacts([])
        }
        break
    }
  }

  const aiInsights = [
    {
      type: 'opportunity',
      title: 'High-Value Prospects Identified',
      description: '12 leads showing high engagement patterns similar to your best customers',
      action: 'Create targeted campaign',
      color: 'green'
    },
    {
      type: 'optimization',
      title: 'Engagement Opportunity',
      description: '25 contacts haven\'t been contacted in 30+ days but show high intent signals',
      action: 'Re-engage automatically',
      color: 'blue'
    },
    {
      type: 'prediction',
      title: 'Churn Risk Alert',
      description: '8 customers showing decreased engagement - at risk of churning',
      action: 'Launch retention campaign',
      color: 'orange'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your contacts with AI-powered insights and smart segmentation
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGenieConsole(!showGenieConsole)}
            className="btn-secondary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Insights
          </button>
          
          <button className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
          </button>
          
          <button 
            onClick={() => setShowContactModal(true)}
            className="btn-teal flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Genie Console */}
      <AnimatePresence>
        {showGenieConsole && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card-genie p-6"
          >
            <GenieConsole 
              context="contact-management"
              contactData={{ contacts: contactList, segments: segmentList }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {aiInsights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-genie p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg bg-${insight.color}-100 flex items-center justify-center`}>
                <Sparkles className={`w-5 h-5 text-${insight.color}-600`} />
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {insight.type}
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{insight.description}</p>
            
            <button className={`text-sm font-medium text-${insight.color}-600 hover:text-${insight.color}-800`}>
              {insight.action} →
            </button>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Segments Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-genie p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Segments</h2>
            
            <div className="space-y-2">
              {segmentList.map((segment) => (
                <button
                  key={segment.id}
                  onClick={() => setSelectedSegment(segment.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    selectedSegment === segment.id
                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${segment.color}-500`}></div>
                    <span className="font-medium">{segment.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{segment.count}</span>
                </button>
              ))}
            </div>

            <button className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors">
              <Plus className="w-4 h-4 mx-auto mb-1" />
              Create Segment
            </button>
          </div>
        </div>

        {/* Main Contact List */}
        <div className="lg:col-span-3">
          <div className="card-genie">
            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                {selectedContacts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedContacts.length} selected
                    </span>
                    <button
                      onClick={() => handleBulkAction('segment')}
                      className="btn-secondary text-sm"
                    >
                      Create Segment
                    </button>
                    <button
                      onClick={() => handleBulkAction('export')}
                      className="btn-secondary text-sm"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="btn-red text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Filters Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">All Statuses</option>
                        <option value="lead">Lead</option>
                        <option value="customer">Customer</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">All Sources</option>
                        <option value="website">Website</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="facebook">Facebook Ads</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value Range
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">All Values</option>
                        <option value="0-500">$0 - $500</option>
                        <option value="500-1000">$500 - $1,000</option>
                        <option value="1000+">$1,000+</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Contact Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContacts(filteredContacts.map(c => c.id))
                          } else {
                            setSelectedContacts([])
                          }
                        }}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContacts([...selectedContacts, contact.id])
                            } else {
                              setSelectedContacts(selectedContacts.filter(id => id !== contact.id))
                            }
                          }}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {contact.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                            <div className="text-sm text-gray-500">{contact.email}</div>
                            {contact.phone && (
                              <div className="text-sm text-gray-500">{contact.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          contact.status === 'customer' ? 'bg-green-100 text-green-800' :
                          contact.status === 'lead' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contact.status}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contact.tags.map((tag, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                contact.engagement_score >= 80 ? 'bg-green-500' :
                                contact.engagement_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${contact.engagement_score}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-600">{contact.engagement_score}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${contact.value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {contact.lastActivity}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleContactAction('email', contact.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleContactAction('sms', contact.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleContactAction('edit', contact.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleContactAction('delete', contact.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredContacts.length} of {contactList.length} contacts
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 bg-teal-600 text-white rounded text-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <ContactModal
            contact={editingContact}
            onClose={() => {
              setShowContactModal(false)
              setEditingContact(null)
            }}
            onSave={(contactData) => {
              if (editingContact) {
                // Update existing contact
                setContactList(contacts => 
                  contacts.map(c => c.id === editingContact.id ? { ...c, ...contactData } : c)
                )
              } else {
                // Add new contact
                const newContact = {
                  ...contactData,
                  id: Date.now(),
                  created_at: new Date(),
                  engagement_score: 0,
                  lastActivity: 'Just added'
                }
                setContactList(contacts => [...contacts, newContact])
              }
              setShowContactModal(false)
              setEditingContact(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Contact Modal Component
function ContactModal({ contact, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    status: contact?.status || 'lead',
    tags: contact?.tags || [],
    source: contact?.source || '',
    value: contact?.value || 0,
    location: contact?.location || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="lead">Lead</option>
                <option value="customer">Customer</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Website, LinkedIn, Facebook Ads"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Value ($)
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="City, State/Country"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-teal"
            >
              {contact ? 'Update Contact' : 'Add Contact'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
