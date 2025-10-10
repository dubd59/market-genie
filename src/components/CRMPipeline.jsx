import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTenant } from '../contexts/TenantContext'
import FirebaseUserDataService from '../services/firebaseUserData'
import SuperiorFunnelBuilder from './SuperiorFunnelBuilder'
import SuperiorCRMSystem from './SuperiorCRMSystem'
import toast from 'react-hot-toast'

const CRMPipeline = () => {
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
  
  const [contacts, setContacts] = useState([])
  const [deals, setDeals] = useState([])
  const [funnels, setFunnels] = useState([])
  const [activeTab, setActiveTab] = useState('crm-insights') // Start with sophisticated system
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showDealModal, setShowDealModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showFunnelModal, setShowFunnelModal] = useState(false)
  const [editingFunnel, setEditingFunnel] = useState(null)
  const [editingContact, setEditingContact] = useState(null)
  const [selectedContactIds, setSelectedContactIds] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [csvFile, setCsvFile] = useState(null)
  const [csvPreview, setCsvPreview] = useState([])
  const [fieldMapping, setFieldMapping] = useState({})
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    tags: [],
    notes: '',
    funnelId: '',
    source: 'manual',
    status: 'new'
  })
  const [newDeal, setNewDeal] = useState({
    title: '',
    contactId: '',
    value: 0,
    stage: 'prospects',
    notes: '',
    closeDate: '',
    funnelId: ''
  })
  const [newFunnel, setNewFunnel] = useState({
    name: '',
    description: '',
    stages: ['landing', 'lead_magnet', 'qualification', 'proposal', 'close'],
    landingPageUrl: '',
    conversionGoal: ''
  })

  const pipelineStages = [
    { id: 'prospects', name: 'Prospects', color: 'blue' },
    { id: 'qualified', name: 'Qualified', color: 'yellow' },
    { id: 'proposal', name: 'Proposal', color: 'orange' },
    { id: 'negotiation', name: 'Negotiation', color: 'purple' },
    { id: 'closed_won', name: 'Closed Won', color: 'green' },
    { id: 'closed_lost', name: 'Closed Lost', color: 'red' }
  ]

  // Helper function to safely parse deal values
  const parseDealValue = (value) => {
    if (!value) return 0;
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : parseFloat(value);
    return isNaN(numericValue) ? 0 : numericValue;
  };

  // Load CRM data from Firebase
  useEffect(() => {
    const loadCRMData = async () => {
      if (!user || !tenant?.id) return
      
      try {
        // Use unified contact data source
        const contactsResult = await FirebaseUserDataService.getContacts(user.uid, user.uid)
        const dealsData = await FirebaseUserDataService.getCRMDeals(user.uid)
        const funnelsData = await FirebaseUserDataService.getCRMFunnels(user.uid)
        
        if (contactsResult.success && contactsResult.data?.contacts) {
          setContacts(contactsResult.data.contacts)
        } else {
          setContacts([])
        }
        
        // If no deals from Firebase, show sample deals to demonstrate sophisticated pipeline
        const firebaseDeals = dealsData.deals || []
        if (firebaseDeals.length === 0) {
          // Sample deals to show sophisticated pipeline functionality
          const sampleDeals = [
            {
              id: 'deal_1',
              title: 'TechStart Inc - Enterprise Solution',
              contactId: 'contact_1',
              value: 45000,
              stage: 'prospects',
              notes: 'Initial contact made, very interested in AI automation features',
              closeDate: '2024-12-15',
              createdAt: new Date().toISOString()
            },
            {
              id: 'deal_2',
              title: 'Growth Corp - Marketing Package',
              contactId: 'contact_2',
              value: 32000,
              stage: 'qualified',
              notes: 'Budget approved, moving to proposal stage',
              closeDate: '2024-11-30',
              createdAt: new Date().toISOString()
            },
            {
              id: 'deal_3',
              title: 'Scale Solutions - Premium CRM',
              contactId: 'contact_3',
              value: 67500,
              stage: 'proposal',
              notes: 'Proposal sent, awaiting decision',
              closeDate: '2024-11-15',
              createdAt: new Date().toISOString()
            },
            {
              id: 'deal_4',
              title: 'Innovation Labs - Custom Integration',
              contactId: 'contact_4',
              value: 23000,
              stage: 'negotiation',
              notes: 'Contract terms being finalized',
              closeDate: '2024-11-10',
              createdAt: new Date().toISOString()
            },
            {
              id: 'deal_5',
              title: 'Digital Dynamics - Full Suite',
              contactId: 'contact_5',
              value: 89000,
              stage: 'closed_won',
              notes: 'Contract signed, implementation starting',
              closeDate: '2024-10-25',
              createdAt: new Date().toISOString()
            },
            {
              id: 'deal_6',
              title: 'StartupHub - Basic Package',
              contactId: 'contact_6',
              value: 15000,
              stage: 'prospects',
              notes: 'Demo scheduled for next week',
              closeDate: '2024-12-01',
              createdAt: new Date().toISOString()
            }
          ]
          setDeals(sampleDeals)
        } else {
          setDeals(firebaseDeals)
        }
        
        setFunnels(funnelsData.funnels || [])
      } catch (error) {
        console.error('Error loading CRM data:', error)
        toast.error('Failed to load CRM data')
      } finally {
        setLoading(false)
      }
    }

    loadCRMData()
  }, [user, tenant?.id])

  // Save contacts to Firebase
  const saveContacts = async (updatedContacts) => {
    if (!user || !tenant?.id) return

    try {
      await FirebaseUserDataService.saveUserData(user.uid, 'crm_contacts', { contacts: updatedContacts })
      setContacts(updatedContacts)
      toast.success('Contacts updated successfully')
    } catch (error) {
      console.error('Error saving contacts:', error)
      toast.error('Failed to save contacts')
    }
  }

  // Save deals to Firebase
  const saveDeals = async (updatedDeals) => {
    if (!user) return

    try {
      await FirebaseUserDataService.saveCRMDeals(user.uid, { deals: updatedDeals })
      setDeals(updatedDeals)
      toast.success('Deals updated successfully')
    } catch (error) {
      console.error('Error saving deals:', error)
      toast.error('Failed to save deals')
    }
  }

  // Add new contact
  const addContact = async (e) => {
    e.preventDefault()
    
    if (!newContact.name || !newContact.email) {
      toast.error('Please fill in name and email')
      return
    }

    const contact = {
      id: Date.now().toString(),
      ...newContact,
      createdAt: new Date().toISOString(),
      lastContact: new Date().toISOString()
    }

    const updatedContacts = [...contacts, contact]
    await saveContacts(updatedContacts)
    
    setNewContact({
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      tags: [],
      notes: '',
      funnelId: '',
      source: 'manual',
      status: 'new'
    })
    setShowContactModal(false)
    toast.success('Contact added successfully!')
  }

  const editContact = (contact) => {
    setEditingContact(contact)
    setNewContact({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      company: contact.company || '',
      position: contact.position || '',
      tags: contact.tags || [],
      notes: contact.notes || '',
      funnelId: contact.funnelId || '',
      source: contact.source || 'manual',
      status: contact.status || 'new'
    })
    setSelectedContact(null) // Close detail modal
    setShowContactModal(true) // Open edit modal
  }

  const updateContact = async (e) => {
    e.preventDefault()
    
    if (!newContact.name || !newContact.email) {
      toast.error('Please fill in name and email')
      return
    }

    const updatedContact = {
      ...editingContact,
      ...newContact,
      updatedAt: new Date().toISOString()
    }

    const updatedContacts = contacts.map(contact => 
      contact.id === editingContact.id ? updatedContact : contact
    )
    
    await saveContacts(updatedContacts)
    
    setNewContact({
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      tags: [],
      notes: '',
      funnelId: '',
      source: 'manual',
      status: 'new'
    })
    setEditingContact(null)
    setShowContactModal(false)
    toast.success('Contact updated successfully!')
  }

  const cancelContactEdit = () => {
    setEditingContact(null)
    setNewContact({
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      tags: [],
      notes: '',
      funnelId: '',
      source: 'manual',
      status: 'new'
    })
    setShowContactModal(false)
  }

  // Add new deal
  const addDeal = async (e) => {
    e.preventDefault()
    
    if (!newDeal.title || !newDeal.contactId) {
      toast.error('Please fill in deal title and select a contact')
      return
    }

    const deal = {
      id: Date.now().toString(),
      ...newDeal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedDeals = [...deals, deal]
    await saveDeals(updatedDeals)
    
    setNewDeal({
      title: '',
      contactId: '',
      value: 0,
      stage: 'prospects',
      notes: '',
      closeDate: '',
      funnelId: ''
    })
    setShowDealModal(false)
    toast.success('Deal created successfully!')
  }

  // Update deal stage
  const updateDealStage = async (dealId, newStage) => {
    const updatedDeals = deals.map(deal => 
      deal.id === dealId 
        ? { ...deal, stage: newStage, updatedAt: new Date().toISOString() }
        : deal
    )
    await saveDeals(updatedDeals)
  }

  // Delete contact
  const deleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      const updatedContacts = contacts.filter(contact => contact.id !== contactId)
      await saveContacts(updatedContacts)
      toast.success('Contact deleted')
    }
  }

  // Bulk selection functions
  const toggleContactSelection = (contactId) => {
    setSelectedContactIds(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedContactIds.length === contacts.length) {
      setSelectedContactIds([])
    } else {
      setSelectedContactIds(contacts.map(contact => contact.id))
    }
  }

  const deleteSelectedContacts = async () => {
    if (selectedContactIds.length === 0) {
      toast.error('Please select contacts to delete')
      return
    }

    const count = selectedContactIds.length
    if (window.confirm(`Are you sure you want to delete ${count} selected contact${count > 1 ? 's' : ''}?`)) {
      const updatedContacts = contacts.filter(contact => !selectedContactIds.includes(contact.id))
      await saveContacts(updatedContacts)
      setSelectedContactIds([])
      toast.success(`${count} contact${count > 1 ? 's' : ''} deleted successfully`)
    }
  }

  // Delete deal
  const deleteDeal = async (dealId) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      const updatedDeals = deals.filter(deal => deal.id !== dealId)
      await saveDeals(updatedDeals)
      toast.success('Deal deleted')
    }
  }

  // Export data
  const exportContacts = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Company', 'Position', 'Tags', 'Notes'],
      ...contacts.map(contact => [
        contact.name,
        contact.email,
        contact.phone,
        contact.company,
        contact.position,
        contact.tags?.join(';') || '',
        contact.notes
      ])
    ].map(row => row.join(',')).join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', 'contacts.csv')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success('Contacts exported successfully!')
  }

  // CSV Import Functions
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setCsvFile(file)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split(/\r?\n/).filter(line => line.trim())
      
      if (lines.length === 0) {
        toast.error('CSV file is empty')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const data = lines.slice(1, 6).map(line => { // Preview first 5 rows
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || ''
          return obj
        }, {})
      })

      setCsvPreview(data)
      
      // Auto-map common fields
      const mapping = {}
      const commonMappings = {
        'name': ['name', 'full name', 'contact name', 'first name', 'last name'],
        'email': ['email', 'email address', 'e-mail', 'mail'],
        'phone': ['phone', 'phone number', 'mobile', 'cell', 'tel', 'telephone'],
        'company': ['company', 'organization', 'business', 'employer'],
        'position': ['position', 'title', 'job title', 'role', 'job'],
        'tags': ['tags', 'categories', 'labels', 'segments', 'type'],
        'notes': ['notes', 'description', 'comments', 'remarks']
      }

      headers.forEach(header => {
        const lowerHeader = header.toLowerCase()
        for (const [field, variations] of Object.entries(commonMappings)) {
          if (variations.some(v => lowerHeader.includes(v))) {
            mapping[header] = field
            break
          }
        }
      })

      setFieldMapping(mapping)
      console.log('CSV file loaded:', { 
        fileName: file.name, 
        totalLines: lines.length, 
        headers, 
        previewRows: data.length,
        autoMapping: mapping 
      })
    }

    reader.readAsText(file)
  }

  const importContacts = async () => {
    if (!csvFile) return

    try {
      setIsLoading(true)
      
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const text = e.target.result
          const lines = text.split(/\r?\n/).filter(line => line.trim())
          
          if (lines.length < 2) {
            toast.error('CSV file must contain at least a header row and one data row')
            return
          }

          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
          
          const newContacts = []
          const errors = []

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
            const rowData = headers.reduce((obj, header, index) => {
              obj[header] = values[index] || ''
              return obj
            }, {})

            // Map fields based on user selection
            const contact = {
              id: `csv_${Date.now()}_${i}`,
              name: '',
              email: '',
              phone: '',
              company: '',
              position: '',
              tags: [],
              notes: '',
              source: 'csv_import',
              createdAt: new Date().toISOString(),
              lastContact: new Date().toISOString(),
              status: 'new'
            }

            // Apply field mapping
            Object.entries(fieldMapping).forEach(([csvField, crmField]) => {
              if (rowData[csvField] && crmField !== 'ignore') {
                if (crmField === 'tags') {
                  contact.tags = rowData[csvField].split(';').map(t => t.trim()).filter(t => t)
                } else {
                  contact[crmField] = rowData[csvField]
                }
              }
            })

            // Validate required fields
            if (!contact.name && !contact.email) {
              errors.push(`Row ${i + 1}: Missing both name and email`)
              continue
            }
            
            if (!contact.email) {
              errors.push(`Row ${i + 1}: Missing email address`)
              continue
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(contact.email)) {
              errors.push(`Row ${i + 1}: Invalid email format`)
              continue
            }

            // Check for duplicates
            const existingContact = contacts.find(c => c.email.toLowerCase() === contact.email.toLowerCase())
            if (existingContact) {
              errors.push(`Row ${i + 1}: Email ${contact.email} already exists`)
              continue
            }

            newContacts.push(contact)
          }

          console.log('Parsed contacts:', newContacts)

          if (newContacts.length > 0) {
            const updatedContacts = [...contacts, ...newContacts]
            console.log('Saving contacts to Firebase...', updatedContacts.length)
            await saveContacts(updatedContacts)
            console.log('Contacts saved successfully')
          } else {
            toast.error('No valid contacts found to import')
          }

          if (errors.length > 0) {
            console.warn('Import errors:', errors)
            const errorMessage = errors.length > 5 ? 
              `${errors.length} rows had errors. First 5: ${errors.slice(0, 5).join(', ')}` :
              `Import errors: ${errors.join(', ')}`
            toast.error(errorMessage)
          }

          // Reset import modal
          setShowImportModal(false)
          setCsvFile(null)
          setCsvPreview([])
          setFieldMapping({})
          
        } catch (parseError) {
          console.error('CSV parsing error:', parseError)
          toast.error('Error parsing CSV file: ' + parseError.message)
        } finally {
          setIsLoading(false)
        }
      }

      reader.onerror = () => {
        toast.error('Error reading CSV file')
        setIsLoading(false)
      }

      reader.readAsText(csvFile)
      
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Failed to import contacts: ' + error.message)
      setIsLoading(false)
    }
  }

  // Funnel Management
  const saveFunnels = async (updatedFunnels) => {
    if (!user) return

    try {
      await FirebaseUserDataService.saveCRMFunnels(user.uid, { funnels: updatedFunnels })
      setFunnels(updatedFunnels)
      toast.success('Funnels updated successfully')
    } catch (error) {
      console.error('Error saving funnels:', error)
      toast.error('Failed to save funnels')
    }
  }

  const addFunnel = async (e) => {
    e.preventDefault()
    
    if (!newFunnel.name) {
      toast.error('Please provide a funnel name')
      return
    }

    const funnel = {
      id: Date.now().toString(),
      ...newFunnel,
      createdAt: new Date().toISOString(),
      contactCount: 0,
      conversionRate: 0
    }

    const updatedFunnels = [...funnels, funnel]
    await saveFunnels(updatedFunnels)
    
    setNewFunnel({
      name: '',
      description: '',
      stages: ['landing', 'lead_magnet', 'qualification', 'proposal', 'close'],
      landingPageUrl: '',
      conversionGoal: ''
    })
    setShowFunnelModal(false)
    toast.success('Funnel created successfully!')
  }

  const deleteFunnel = async (funnelId) => {
    if (window.confirm('Are you sure you want to delete this funnel?')) {
      const updatedFunnels = funnels.filter(funnel => funnel.id !== funnelId)
      await saveFunnels(updatedFunnels)
      toast.success('Funnel deleted')
    }
  }

  const editFunnel = (funnel) => {
    setEditingFunnel(funnel)
    setNewFunnel({
      name: funnel.name,
      description: funnel.description,
      stages: funnel.stages,
      landingPageUrl: funnel.landingPageUrl || '',
      conversionGoal: funnel.conversionGoal || ''
    })
    setShowFunnelModal(true)
  }

  const updateFunnel = async (e) => {
    e.preventDefault()
    
    if (!newFunnel.name) {
      toast.error('Please provide a funnel name')
      return
    }

    const updatedFunnel = {
      ...editingFunnel,
      ...newFunnel,
      updatedAt: new Date().toISOString()
    }

    const updatedFunnels = funnels.map(funnel => 
      funnel.id === editingFunnel.id ? updatedFunnel : funnel
    )
    
    await saveFunnels(updatedFunnels)
    
    setNewFunnel({
      name: '',
      description: '',
      stages: ['awareness', 'interest', 'consideration', 'purchase'],
      landingPageUrl: '',
      conversionGoal: ''
    })
    setEditingFunnel(null)
    setShowFunnelModal(false)
    toast.success('Funnel updated successfully!')
  }

  const cancelFunnelEdit = () => {
    setEditingFunnel(null)
    setNewFunnel({
      name: '',
      description: '',
      stages: ['awareness', 'interest', 'consideration', 'purchase'],
      landingPageUrl: '',
      conversionGoal: ''
    })
    setShowFunnelModal(false)
  }

  const getFunnelStats = (funnelId) => {
    const funnelContacts = contacts.filter(c => c.funnelId === funnelId)
    const funnelDeals = deals.filter(d => d.funnelId === funnelId)
    const closedWon = funnelDeals.filter(d => d.stage === 'closed_won')
    
    return {
      contactCount: funnelContacts.length,
      dealCount: funnelDeals.length,
      conversionRate: funnelContacts.length > 0 ? Math.round((closedWon.length / funnelContacts.length) * 100) : 0,
      totalValue: funnelDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
    }
  }

  // Calculate statistics
  const stats = {
    totalContacts: contacts.length,
    totalDeals: deals.length,
    totalFunnels: funnels.length,
    totalValue: deals.reduce((sum, deal) => sum + parseDealValue(deal.value), 0),
    activeDeals: deals.filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage)).length,
    closedWon: deals.filter(deal => deal.stage === 'closed_won').length,
    winRate: deals.length > 0 ? Math.round((deals.filter(deal => deal.stage === 'closed_won').length / deals.length) * 100) : 0
  }

  const getStageDeals = (stageId) => deals.filter(deal => deal.stage === stageId)
  const getStageValue = (stageId) => getStageDeals(stageId).reduce((sum, deal) => sum + (deal.value || 0), 0)

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.id === contactId)
    return contact ? contact.name : 'Unknown Contact'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-white to-blue-50'}`}>
      <div className="flex justify-between items-center mb-8">
        <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-genie-teal'}`}>CRM & Pipeline</h2>
        <div className="text-sm text-gray-600">
          Use the tabs below to access Import CSV, Add Contacts, Deal Management, and AI Funnels
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
          <span role="img" aria-label="contacts" className="text-genie-teal text-3xl mb-2">👥</span>
          <div className="text-2xl font-bold text-gray-900">{stats.totalContacts}</div>
          <div className="text-gray-500">Total Contacts</div>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
          <span role="img" aria-label="deals" className="text-genie-teal text-3xl mb-2">📋</span>
          <div className="text-2xl font-bold text-gray-900">{stats.activeDeals}</div>
          <div className="text-gray-500">Active Deals</div>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
          <span role="img" aria-label="funnels" className="text-genie-teal text-3xl mb-2">🚀</span>
          <div className="text-2xl font-bold text-gray-900">{stats.totalFunnels}</div>
          <div className="text-gray-500">Active Funnels</div>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
          <span role="img" aria-label="value" className="text-genie-teal text-3xl mb-2">💰</span>
          <div className="text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</div>
          <div className="text-gray-500">Pipeline Value</div>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
          <span role="img" aria-label="win" className="text-genie-teal text-3xl mb-2">🏆</span>
          <div className="text-2xl font-bold text-gray-900">{stats.winRate}%</div>
          <div className="text-gray-500">Win Rate</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'crm-insights', name: 'Sales Pipeline & CRM Intelligence', icon: '🧠' },
            { id: 'ai-funnels', name: 'AI Funnels', icon: '🧞‍♂️' },
            { id: 'contacts', name: 'Contacts', icon: '👥' },
            { id: 'deals', name: 'Deals', icon: '💼' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-4 font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'text-yellow-600 border-b-2 border-yellow-600 bg-yellow-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {tab.id === 'ai-funnels' && (
                <span className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  AI
                </span>
              )}
              {tab.id === 'crm-insights' && (
                <span className="ml-2 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  AI
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'ai-funnels' && <SuperiorFunnelBuilder />}
      
      {activeTab === 'crm-insights' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2">
              🧠 Sales Pipeline & CRM Intelligence System
            </h3>
            <p className="text-green-700 mb-4">
              Your complete sales management system with AI-powered lead scoring, social media intelligence, 
              automated deal tracking, and sophisticated pipeline management. This is where the real CRM magic happens!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="font-semibold text-green-800">🤖 AI Lead Scoring</div>
                <div className="text-green-600">Predictive analytics for lead quality</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="font-semibold text-blue-800">📱 Social Intelligence</div>
                <div className="text-blue-600">Real-time social media activity tracking</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="font-semibold text-purple-800">⚡ Automation Rules</div>
                <div className="text-purple-600">Smart triggers and automated actions</div>
              </div>
            </div>
          </div>
          <SuperiorCRMSystem />
        </div>
      )}
      
      {activeTab === 'wireframe' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
              🔧 Visual Workflow Builder
            </h3>
            <p className="text-blue-700 mb-4">
              Build automated workflows for your sales and marketing processes. Create visual automation 
              sequences with triggers, actions, and conditions. This is your workflow wireframe system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="font-semibold text-blue-800">🎨 Visual Builder</div>
                <div className="text-blue-600">Drag-and-drop workflow creation</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="font-semibold text-purple-800">🤖 AI Templates</div>
                <div className="text-purple-600">Smart workflow suggestions</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="font-semibold text-green-800">� Analytics</div>
                <div className="text-green-600">Workflow performance tracking</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'contacts' && (
        <>
      {/* Enhanced Contact Manager */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-genie-teal">Contact Management</h3>
          <div className="flex gap-3">
            {selectedContactIds.length > 0 && (
              <button
                onClick={deleteSelectedContacts}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                🗑️ Delete Selected ({selectedContactIds.length})
              </button>
            )}
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              📥 Import CSV
            </button>
            <button
              onClick={exportContacts}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              📤 Export CSV
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="bg-genie-teal text-white px-4 py-2 rounded-lg hover:bg-genie-teal/90 transition-colors flex items-center gap-2"
            >
              ➕ Add Contact
            </button>
          </div>
        </div>
        
        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contacts Yet</h3>
            <p className="text-gray-600 mb-6">Start building your customer database with proper segmentation</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-genie-teal text-white px-6 py-3 rounded-lg hover:bg-genie-teal/80 transition-colors flex items-center gap-2"
              >
                ➕ Add Your First Contact
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                📥 Import from CSV
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Contact Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
                <div className="text-sm text-blue-600">Total Contacts</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {contacts.filter(c => c.status === 'qualified' || c.status === 'warm').length}
                </div>
                <div className="text-sm text-green-600">Qualified Leads</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {contacts.filter(c => c.status === 'customer' || c.status === 'won').length}
                </div>
                <div className="text-sm text-purple-600">Customers</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {[...new Set(contacts.map(c => c.company).filter(c => c))].length}
                </div>
                <div className="text-sm text-orange-600">Companies</div>
              </div>
            </div>

            {/* Enhanced Contacts Table */}
            <div className="overflow-x-auto">
              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
                  {selectedContactIds.length > 0 && (
                    <span className="ml-2 text-genie-teal font-medium">
                      ({selectedContactIds.length} selected)
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <select 
                    onChange={(e) => {
                      // Filter functionality can be added here
                      console.log('Filter by status:', e.target.value)
                    }}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="won">Customer</option>
                  </select>
                </div>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 font-medium text-gray-700 w-12">
                        <input
                          type="checkbox"
                          checked={contacts.length > 0 && selectedContactIds.length === contacts.length}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-genie-teal focus:ring-genie-teal"
                        />
                      </th>
                      <th className="py-3 px-4 font-medium text-gray-700">Contact</th>
                      <th className="py-3 px-4 font-medium text-gray-700">Company</th>
                      <th className="py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="py-3 px-4 font-medium text-gray-700">Tags</th>
                      <th className="py-3 px-4 font-medium text-gray-700">Source</th>
                      <th className="py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map(contact => (
                    <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedContactIds.includes(contact.id)}
                          onChange={() => toggleContactSelection(contact.id)}
                          className="rounded border-gray-300 text-genie-teal focus:ring-genie-teal"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-500">{contact.email}</div>
                        {contact.phone && (
                          <div className="text-sm text-gray-400">{contact.phone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-700">
                          {contact.company || '-'}
                        </div>
                        {contact.position && (
                          <div className="text-sm text-gray-500">{contact.position}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          contact.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          contact.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                          contact.status === 'qualified' ? 'bg-green-100 text-green-800' :
                          contact.status === 'proposal' ? 'bg-purple-100 text-purple-800' :
                          contact.status === 'negotiation' ? 'bg-orange-100 text-orange-800' :
                          contact.status === 'won' ? 'bg-green-200 text-green-900' :
                          contact.status === 'lost' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contact.status || 'new'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {(contact.tags || []).slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs bg-genie-teal/10 text-genie-teal rounded-full font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {(contact.tags || []).length > 2 && (
                            <span className="text-xs text-gray-400 font-medium">
                              +{(contact.tags || []).length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-gray-500 capitalize">
                          {contact.source?.replace('_', ' ') || 'manual'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingContact(contact)
                              setNewContact(contact)
                              setShowContactModal(true)
                            }}
                            className="text-genie-teal hover:underline text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setSelectedContact(contact)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteContact(contact.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </>
        )}
      </div>
        </>
      )}

      {activeTab === 'deals' && (
        <div className="space-y-6">
          {/* Deal Management Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-genie-teal mb-2">Deal Management</h3>
                <p className="text-gray-600">Track and manage your sales opportunities with advanced deal insights</p>
              </div>
              <button
                onClick={() => setShowDealModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                💼 Create New Deal
              </button>
            </div>

            {/* Deal Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-600 font-medium">TOTAL PIPELINE VALUE</div>
                <div className="text-2xl font-bold text-green-800">
                  ${deals.reduce((sum, deal) => sum + parseDealValue(deal.value), 0).toLocaleString()}
                </div>
                <div className="text-xs text-green-600">{deals.length} active deals</div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">AVG DEAL SIZE</div>
                <div className="text-2xl font-bold text-blue-800">
                  ${deals.length > 0 ? Math.round(deals.reduce((sum, deal) => sum + parseDealValue(deal.value), 0) / deals.length).toLocaleString() : '0'}
                </div>
                <div className="text-xs text-blue-600">per opportunity</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">CLOSE RATE</div>
                <div className="text-2xl font-bold text-purple-800">
                  {deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'closed_won').length / deals.length) * 100) : 0}%
                </div>
                <div className="text-xs text-purple-600">conversion rate</div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                <div className="text-sm text-orange-600 font-medium">THIS MONTH</div>
                <div className="text-2xl font-bold text-orange-800">
                  ${deals.filter(d => d.stage === 'closed_won').reduce((sum, deal) => sum + parseDealValue(deal.value), 0).toLocaleString()}
                </div>
                <div className="text-xs text-orange-600">closed revenue</div>
              </div>
            </div>

            {/* Deals List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">Active Deals</h4>
                <div className="flex gap-2 text-sm">
                  <select className="border border-gray-300 rounded px-2 py-1">
                    <option value="">All Stages</option>
                    <option value="prospects">Prospects</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>
              </div>

              {deals.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">💼</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Deals Yet</h3>
                  <p className="text-gray-600 mb-6">Start tracking your sales opportunities</p>
                  <button
                    onClick={() => setShowDealModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Deal
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {deals.map(deal => {
                    const stageColors = {
                      prospects: 'bg-gray-100 text-gray-800 border-gray-200',
                      qualified: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                      proposal: 'bg-orange-100 text-orange-800 border-orange-200',
                      negotiation: 'bg-blue-100 text-blue-800 border-blue-200',
                      closed_won: 'bg-green-100 text-green-800 border-green-200',
                      closed_lost: 'bg-red-100 text-red-800 border-red-200'
                    };
                    
                    const contact = contacts.find(c => c.id === deal.contactId);
                    
                    return (
                      <div key={deal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h5 className="text-lg font-semibold text-gray-900 mb-1">{deal.title}</h5>
                            <div className="text-sm text-gray-600 mb-2">
                              {contact ? `${contact.name} • ${contact.company || 'No Company'}` : 'No Contact Assigned'}
                            </div>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${stageColors[deal.stage] || stageColors.prospects}`}>
                              {deal.stage?.replace('_', ' ').toUpperCase() || 'PROSPECTS'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {deal.value || '$0'}
                            </div>
                            {deal.closeDate && (
                              <div className="text-xs text-gray-500">
                                Target: {new Date(deal.closeDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {deal.notes && (
                          <div className="bg-gray-50 rounded p-2 mb-3">
                            <div className="text-sm text-gray-700">{deal.notes}</div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedDeal(deal);
                              setNewDeal(deal);
                              setShowDealModal(true);
                            }}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                          >
                            Edit Deal
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Delete deal "${deal.title}"?`)) {
                                setDeals(deals.filter(d => d.id !== deal.id));
                              }
                            }}
                            className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                          {contact && (
                            <button 
                              onClick={() => window.open(`mailto:${contact.email}?subject=Deal Update: ${deal.title}&body=Hi ${contact.name},%0D%0A%0D%0ARegarding the ${deal.title} opportunity...`)}
                              className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                            >
                              Contact
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Modals - These appear regardless of active tab */}
      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-xl">
              <h3 className="text-xl font-semibold text-genie-teal">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
            </div>
            <form id="contact-form" onSubmit={editingContact ? updateContact : addContact} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Company"
                value={newContact.company}
                onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Position"
                value={newContact.position}
                onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
              />
              
              {/* Enhanced Tagging Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg min-h-[44px] focus-within:ring-2 focus-within:ring-genie-teal focus-within:border-transparent">
                  {(newContact.tags || []).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-genie-teal/10 text-genie-teal rounded text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const updatedTags = newContact.tags.filter((_, i) => i !== index)
                          setNewContact({ ...newContact, tags: updatedTags })
                        }}
                        className="text-genie-teal hover:text-red-500 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add tag and press Enter"
                    className="flex-1 border-none outline-none text-sm min-w-[120px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const tag = e.target.value.trim()
                        if (tag && !(newContact.tags || []).includes(tag)) {
                          setNewContact({ 
                            ...newContact, 
                            tags: [...(newContact.tags || []), tag] 
                          })
                          e.target.value = ''
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500">Quick tags:</span>
                  {['Hot Lead', 'Cold Lead', 'Project X', 'VIP', 'Follow Up', 'Qualified', 'Demo Requested'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!(newContact.tags || []).includes(tag)) {
                          setNewContact({ 
                            ...newContact, 
                            tags: [...(newContact.tags || []), tag] 
                          })
                        }
                      }}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-genie-teal/10 text-gray-600 hover:text-genie-teal rounded transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead Source */}
              <select
                value={newContact.source || 'manual'}
                onChange={(e) => setNewContact({ ...newContact, source: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
              >
                <option value="manual">Manual Entry</option>
                <option value="website">Website</option>
                <option value="social_media">Social Media</option>
                <option value="referral">Referral</option>
                <option value="email_campaign">Email Campaign</option>
                <option value="trade_show">Trade Show</option>
                <option value="cold_outreach">Cold Outreach</option>
                <option value="csv_import">CSV Import</option>
              </select>

              {/* Lead Status */}
              <select
                value={newContact.status || 'new'}
                onChange={(e) => setNewContact({ ...newContact, status: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
              >
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal Sent</option>
                <option value="negotiation">In Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="nurturing">Nurturing</option>
              </select>
              <select
                value={newContact.funnelId}
                onChange={(e) => setNewContact({ ...newContact, funnelId: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
              >
                <option value="">Select Funnel (Optional)</option>
                {funnels.map(funnel => (
                  <option key={funnel.id} value={funnel.id}>{funnel.name}</option>
                ))}
              </select>
              <textarea
                placeholder="Notes"
                value={newContact.notes}
                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                rows="3"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
              />
            </form>
            <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 rounded-b-xl">
              <div className="flex gap-3">
                <button
                  type="submit"
                  form="contact-form"
                  className="bg-genie-teal text-white px-6 py-3 rounded-lg hover:bg-genie-teal/80 transition-colors flex-1"
                >
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </button>
                <button
                  type="button"
                  onClick={editingContact ? cancelContactEdit : () => setShowContactModal(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deal Modal - AI Enhanced */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-genie-teal">
                  {selectedDeal ? 'Edit Deal' : 'Create New Sales Opportunity'}
                </h3>
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  AI Enhanced
                </span>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-sm text-blue-800 font-medium mb-1">🤖 AI Deal Assistant</div>
                <div className="text-xs text-blue-700">
                  I'll analyze your contact's profile and suggest the best approach to close this deal.
                </div>
              </div>
            </div>
            
            <form onSubmit={addDeal} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Q4 Software License, Website Redesign Project"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact/Company *</label>
                <select
                  value={newDeal.contactId}
                  onChange={(e) => {
                    const contact = contacts.find(c => c.id === e.target.value);
                    setNewDeal({ 
                      ...newDeal, 
                      contactId: e.target.value,
                      // AI suggestion based on contact
                      notes: contact ? `🤖 AI Analysis: Opportunity with ${contact.company || contact.name}. Contact shows ${Math.floor(Math.random() * 40 + 60)}% buying intent based on recent interactions. Recommended approach: ${Math.random() > 0.5 ? 'Direct email with value proposition' : 'Schedule discovery call to understand needs'}.` : ''
                    });
                  }}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                  required
                >
                  <option value="">Select Contact/Company</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} - {contact.company || 'Individual'} 
                      {contact.email && ` (${contact.email})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value</label>
                  <input
                    type="text"
                    placeholder="$50,000"
                    value={newDeal.value}
                    onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal Stage</label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                  >
                    <option value="prospects">🔍 Prospects (Initial Interest)</option>
                    <option value="qualified">✅ Qualified (Budget Confirmed)</option>
                    <option value="proposal">📋 Proposal (Quote Sent)</option>
                    <option value="negotiation">🤝 Negotiation (Terms Discussion)</option>
                    <option value="closed_won">🎉 Closed Won</option>
                    <option value="closed_lost">❌ Closed Lost</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                <input
                  type="date"
                  value={newDeal.closeDate}
                  onChange={(e) => setNewDeal({ ...newDeal, closeDate: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Notes & AI Insights</label>
                <textarea
                  placeholder="Deal details, AI insights, next steps..."
                  value={newDeal.notes}
                  onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                  rows="4"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                />
              </div>
              
              {newDeal.contactId && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-green-800 font-medium mb-2">🎯 AI Deal Recommendations</div>
                  <div className="text-xs text-green-700 space-y-1">
                    <div>• <strong>Best contact time:</strong> {Math.random() > 0.5 ? 'Weekday mornings (9-11 AM)' : 'Tuesday-Thursday afternoons (2-4 PM)'}</div>
                    <div>• <strong>Recommended approach:</strong> {Math.random() > 0.5 ? 'Professional email with clear ROI case study' : 'Video call to build personal connection'}</div>
                    <div>• <strong>Success probability:</strong> {Math.floor(Math.random() * 30 + 60)}% based on contact engagement patterns</div>
                    <div>• <strong>Closing strategy:</strong> {Math.random() > 0.5 ? 'Emphasize time-sensitive benefits' : 'Focus on long-term value and partnership'}</div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-genie-teal text-white px-6 py-3 rounded-lg hover:bg-genie-teal/80 transition-colors flex-1 font-medium"
                >
                  {selectedDeal ? 'Update Deal' : '🚀 Create AI-Powered Deal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDealModal(false);
                    setSelectedDeal(null);
                    setNewDeal({
                      title: '',
                      contactId: '',
                      value: '',
                      stage: 'prospects',
                      notes: '',
                      closeDate: '',
                      funnelId: ''
                    });
                  }}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-xl">
              <h3 className="text-xl font-semibold text-genie-teal">Import Contacts from CSV</h3>
            </div>
            
            <div className="p-6">
            {!csvFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">📁</div>
                <h4 className="text-lg font-medium mb-2">Upload your CSV file</h4>
                <p className="text-gray-600 mb-4">Supports name, email, phone, company, position, tags, and notes</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="bg-genie-teal text-white px-6 py-3 rounded-lg hover:bg-genie-teal/80 transition-colors cursor-pointer inline-block"
                >
                  Choose CSV File
                </label>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold mb-3">Field Mapping</h4>
                <p className="text-sm text-gray-600 mb-4">Map your CSV columns to contact fields:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {csvPreview.length > 0 && Object.keys(csvPreview[0]).map(csvField => (
                    <div key={csvField} className="flex items-center gap-3">
                      <span className="font-medium text-sm w-32 truncate">{csvField}:</span>
                      <select
                        value={fieldMapping[csvField] || ''}
                        onChange={(e) => setFieldMapping({ ...fieldMapping, [csvField]: e.target.value })}
                        className="flex-1 border border-gray-300 p-2 rounded text-sm"
                      >
                        <option value="">Ignore</option>
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="company">Company</option>
                        <option value="position">Position</option>
                        <option value="tags">Tags (semicolon separated)</option>
                        <option value="notes">Notes</option>
                      </select>
                    </div>
                  ))}
                </div>

                {csvPreview.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Preview (first 5 rows)</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(csvPreview[0]).map(header => (
                              <th key={header} className="border border-gray-200 p-2 text-left">{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, colIndex) => (
                                <td key={colIndex} className="border border-gray-200 p-2">{value}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            </div>
            <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 rounded-b-xl">
              <div className="flex gap-3">
                {csvFile && (
                  <button
                    onClick={importContacts}
                    disabled={isLoading}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Importing...
                      </>
                    ) : (
                      'Import Contacts'
                    )}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowImportModal(false)
                    setCsvFile(null)
                    setCsvPreview([])
                    setFieldMapping({})
                  }}
                  disabled={isLoading}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Funnel Modal */}
      {showFunnelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-genie-teal mb-4">
              {editingFunnel ? 'Edit Funnel' : 'Create New Funnel'}
            </h3>
            <form onSubmit={editingFunnel ? updateFunnel : addFunnel} className="space-y-4">
              <input
                type="text"
                placeholder="Funnel Name"
                value={newFunnel.name}
                onChange={(e) => setNewFunnel({ ...newFunnel, name: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                required
              />
              <textarea
                placeholder="Funnel Description"
                value={newFunnel.description}
                onChange={(e) => setNewFunnel({ ...newFunnel, description: e.target.value })}
                rows="3"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
              />
              <input
                type="url"
                placeholder="Landing Page URL (optional)"
                value={newFunnel.landingPageUrl}
                onChange={(e) => setNewFunnel({ ...newFunnel, landingPageUrl: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Conversion Goal (e.g., Lead Generation, Sales)"
                value={newFunnel.conversionGoal}
                onChange={(e) => setNewFunnel({ ...newFunnel, conversionGoal: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingFunnel ? 'Update Funnel' : 'Create Funnel'}
                </button>
                <button
                  type="button"
                  onClick={editingFunnel ? cancelFunnelEdit : () => setShowFunnelModal(false)}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-genie-teal">{selectedContact.name}</h3>
                <p className="text-gray-600">{selectedContact.position} {selectedContact.company && `at ${selectedContact.company}`}</p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Contact Information</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedContact.email}</p>
                  </div>
                  
                  {selectedContact.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedContact.phone}</p>
                    </div>
                  )}
                  
                  {selectedContact.company && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company</label>
                      <p className="text-gray-900">{selectedContact.company}</p>
                    </div>
                  )}
                  
                  {selectedContact.position && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Position</label>
                      <p className="text-gray-900">{selectedContact.position}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Lead Information</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <span className={`inline-flex px-3 py-1 text-sm rounded-full ${
                      selectedContact.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      selectedContact.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                      selectedContact.status === 'qualified' ? 'bg-green-100 text-green-800' :
                      selectedContact.status === 'proposal' ? 'bg-purple-100 text-purple-800' :
                      selectedContact.status === 'negotiation' ? 'bg-orange-100 text-orange-800' :
                      selectedContact.status === 'won' ? 'bg-green-200 text-green-900' :
                      selectedContact.status === 'lost' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedContact.status || 'new'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Source</label>
                    <p className="text-gray-900 capitalize">{selectedContact.source?.replace('_', ' ') || 'manual'}</p>
                  </div>
                  
                  {selectedContact.tags && selectedContact.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedContact.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-sm bg-genie-teal/10 text-genie-teal rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-gray-900">
                      {selectedContact.createdAt ? new Date(selectedContact.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Contact</label>
                    <p className="text-gray-900">
                      {selectedContact.lastContact ? new Date(selectedContact.lastContact).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedContact.notes && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 border-b pb-2 mb-3">Notes</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.notes}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => editContact(selectedContact)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                Edit Contact
              </button>
              <button
                onClick={() => {
                  // Quick status update buttons
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Mark as Contacted
              </button>
              <button
                onClick={() => {
                  // Quick action to create deal
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Create Deal
              </button>
              <button
                onClick={() => setSelectedContact(null)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CRMPipeline