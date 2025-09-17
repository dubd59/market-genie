import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { TenantProvider } from './contexts/TenantContext'
import { GenieProvider } from './contexts/GenieContext'
import FounderSetup from './components/FounderSetup'
import Dashboard from './pages/Dashboard'
import CampaignBuilder from './pages/CampaignBuilder'
import ContactManagement from './pages/ContactManagement'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/RegisterSimple'
import LandingPage from './pages/LandingPage'
import AIAgentHelper from './components/AIAgentHelper'
import { useTenant } from './contexts/TenantContext'
import LeadService from './services/leadService'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import VoiceButton from './features/voice-control/VoiceButton'
import './assets/brand.css'
import Sidebar from './components/Sidebar'
import SupportTicketForm from './components/SupportTicketForm'
import SupportTicketList from './components/SupportTicketList'
import APIKeysIntegrations from './components/APIKeysIntegrations'
import AISwarmDashboard from './components/AISwarmDashboard'
import CostControlsDashboard from './components/CostControlsDashboard'
import SocialMediaScrapingAgents from './components/SocialMediaScrapingAgents'
import LeadGenerationWorkflows from './components/LeadGenerationWorkflows'
import IntegrationConnectionStatus from './components/IntegrationConnectionStatus'
import AdvancedFunnelBuilder from './components/AdvancedFunnelBuilder'
import SuperiorCRMSystem from './components/SuperiorCRMSystem'
import MultiChannelAutomationHub from './components/MultiChannelAutomationHub'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { tenant, loading: tenantLoading } = useTenant()
  
  if (loading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-light)]">
        <div className="genie-enter">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-genie-teal"></div>
          <p className="mt-4 text-genie-teal font-medium">Market Genie is awakening...</p>
          {tenantLoading && <p className="text-sm text-gray-500">Setting up your workspace...</p>}
        </div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function SophisticatedDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // URL-based section mapping
  const getSectionFromURL = () => {
    const path = location.pathname
    if (path.includes('lead-generation')) return 'Lead Generation'
    if (path.includes('outreach-automation')) return 'Outreach Automation'
    if (path.includes('workflow-automation')) return 'Workflow Automation'
    if (path.includes('appointment-booking')) return 'Appointment Booking'
    if (path.includes('crm-pipeline')) return 'CRM & Pipeline'
    if (path.includes('analytics')) return 'Analytics & Reporting'
    if (path.includes('api-keys')) return 'API Keys & Integrations'
    if (path.includes('admin-panel')) return 'Admin Panel'
    return 'SuperGenie Dashboard'
  }

  const [activeSection, setActiveSection] = useState(getSectionFromURL())
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { user, logout } = useAuth()
  const { tenant, loading: tenantLoading } = useTenant()

  // Lead Generation State
  const [leads, setLeads] = useState([])
  const [leadStats, setLeadStats] = useState({})
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    linkedin: '',
    twitter: '',
    website: '',
    source: '',
    description: ''
  })
  const [scrapingBudget, setScrapingBudget] = useState(50)
  const [currentBudgetUsage, setCurrentBudgetUsage] = useState(32)

  // Campaign State
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: "Summer Product Launch",
      status: "Active",
      type: "Email",
      emailsSent: 1234,
      openRate: 68,
      responseRate: 24,
      createdDate: "2024-01-15",
      subject: "🌞 Summer Sale - 50% Off Everything!",
      emailContent: `Hi {firstName},

Summer is here and we're celebrating with our biggest sale of the year!

🌞 50% OFF EVERYTHING 🌞
Valid until July 31st

This is the perfect time to upgrade your marketing automation tools and take your business to the next level.

What's included:
• All premium features unlocked
• Priority customer support
• Advanced analytics dashboard
• Custom integrations

Don't miss out - this offer expires soon!

[SHOP NOW - 50% OFF]

Best regards,
The MarketGenie Team

P.S. This offer is exclusive to our valued customers like you!`,
      template: "Product Launch",
      targetAudience: "All Leads"
    }
  ])
  const [campaignStats, setCampaignStats] = useState({
    totalCampaigns: 12,
    totalEmailsSent: 2430,
    averageOpenRate: 68,
    averageResponseRate: 24
  })
  const [campaignFormData, setCampaignFormData] = useState({
    name: '',
    type: 'Email',
    subject: '',
    template: '',
    targetAudience: '',
    sendDate: ''
  })
  const [emailTemplates] = useState([
    { 
      id: 1, 
      name: "Welcome Series", 
      category: "Onboarding",
      subject: "Welcome to our platform!",
      preview: "Hi {{firstName}}, welcome to our amazing platform! We're excited to have you on board...",
      content: `Hi {{firstName}},

Welcome to our amazing platform! We're excited to have you on board.

Here's what you can expect:
• Complete access to all features
• 24/7 customer support  
• Regular updates and improvements
• A dedicated success manager

To get started, simply log in to your account and explore the dashboard.

If you have any questions, don't hesitate to reach out to our support team.

Best regards,
The MarketGenie Team

P.S. Keep an eye out for our weekly newsletter with tips and best practices!`
    },
    { 
      id: 2, 
      name: "Product Launch", 
      category: "Promotion",
      subject: "🚀 New Product Launch - Limited Time Offer!",
      preview: "Hi {{firstName}}, we're thrilled to announce our latest product! Get 20% off during launch week...",
      content: `Hi {{firstName}},

We're thrilled to announce our latest product launch!

🎉 Introducing our new AI-powered marketing automation suite that will revolutionize how you connect with customers.

LIMITED TIME LAUNCH OFFER:
✅ 20% off your first 3 months
✅ Free premium onboarding session
✅ Exclusive access to new features

This offer expires in 7 days, so don't miss out!

[CLAIM YOUR DISCOUNT NOW]

Why our customers love this new product:
"This has transformed our marketing strategy completely!" - Sarah M.
"The automation features saved us 10+ hours per week" - John D.

Ready to get started? Click the button above or reply to this email.

Cheers,
The MarketGenie Team`
    },
    { 
      id: 3, 
      name: "Follow-up", 
      category: "Nurture",
      subject: "Following up on your interest",
      preview: "Hi {{firstName}}, I wanted to follow up on our previous conversation about...",
      content: `Hi {{firstName}},

I wanted to follow up on our previous conversation about improving your marketing automation.

I know you mentioned being interested in:
• Streamlining your lead generation process
• Improving email campaign performance
• Better tracking and analytics

I'd love to show you how MarketGenie can specifically help with these challenges.

Would you be available for a quick 15-minute demo this week? I can show you:
1. How to set up automated lead nurturing
2. Our advanced analytics dashboard
3. Real ROI improvements our clients have seen

Here are a few time slots that work for me:
• Tuesday 2:00 PM - 3:00 PM
• Wednesday 10:00 AM - 11:00 AM  
• Thursday 3:00 PM - 4:00 PM

Just reply with what works best for you, or feel free to suggest another time.

Looking forward to hearing from you!

Best regards,
[Your Name]
MarketGenie Team`
    },
    { 
      id: 4, 
      name: "Re-engagement", 
      category: "Retention",
      subject: "We miss you! Special offer inside",
      preview: "Hi {{firstName}}, we noticed you haven't been active lately. Here's a special offer just for you...",
      content: `Hi {{firstName}},

We noticed you haven't been active on MarketGenie lately, and we miss you!

We want to make sure you're getting the most value from our platform, so we've prepared something special for you:

🎁 EXCLUSIVE RE-ENGAGEMENT OFFER:
• 30% off your next billing cycle
• Free 1-on-1 strategy session ($200 value)
• Access to our new AI templates library

We've also added some amazing new features since your last visit:
✨ Advanced A/B testing tools
✨ Improved analytics dashboard
✨ New integration with popular CRMs
✨ Enhanced automation workflows

Don't let your account gather dust! Log in today and rediscover what MarketGenie can do for your business.

[CLAIM YOUR OFFER & LOG IN NOW]

This offer expires in 5 days, so don't wait!

If you're facing any challenges or have questions, our support team is here to help. Just reply to this email.

We'd love to have you back!

The MarketGenie Team

P.S. If you're no longer interested in MarketGenie, you can unsubscribe here [unsubscribe link]`
    }
  ])
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Ensure proper initialization
  React.useEffect(() => {
    setIsInitialized(true)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Helper function to update classes with dark mode support
  const getDarkModeClasses = (lightClasses, darkClasses = '') => {
    const dark = darkClasses || lightClasses.replace('bg-white', 'bg-gray-800').replace('text-gray-900', 'text-white').replace('text-gray-700', 'text-gray-300')
    return isDarkMode ? dark : lightClasses
  }

  // Lead Generation Functions
  const loadLeadData = async () => {
    console.log('loadLeadData called, tenant:', tenant)
    if (!tenant?.id) {
      console.log('No tenant ID available')
      return
    }
    
    try {
      console.log('Fetching leads for tenant:', tenant.id)
      const [leadsResult, statsResult] = await Promise.all([
        LeadService.getLeads(tenant.id),
        LeadService.getLeadStats(tenant.id)
      ])

      console.log('Leads result:', leadsResult)
      console.log('Stats result:', statsResult)

      if (leadsResult.success && leadsResult.data) {
        setLeads(leadsResult.data)
      }

      if (statsResult.success && statsResult.data) {
        setLeadStats(statsResult.data)
      }
    } catch (error) {
      console.error('Error loading lead data:', error)
    }
  }

  const handleLeadFormSubmit = async (e) => {
    e.preventDefault()
    
    console.log('Form submitted with data:', leadFormData)
    console.log('Current tenant:', tenant)
    
    if (!leadFormData.name || !leadFormData.email) {
      toast.error('Please fill in Name and Email')
      return
    }

    if (!tenant?.id) {
      toast.error('No tenant available. Please try logging in again.')
      return
    }

    try {
      const [firstName, ...lastNameParts] = leadFormData.name.split(' ')
      const lastName = lastNameParts.join(' ')
      
      const leadData = {
        firstName: firstName || '',
        lastName: lastName || '',
        email: leadFormData.email,
        phone: leadFormData.phone,
        company: leadFormData.company,
        title: '',
        source: leadFormData.source || 'manual',
        notes: [leadFormData.description],
        tags: ['manual-entry'],
        score: Math.floor(Math.random() * 40) + 60
      }

      console.log('Sending lead data:', leadData)
      const result = await LeadService.createLead(tenant.id, leadData)
      console.log('Create lead result:', result)
      
      if (result.success) {
        toast.success('Lead added successfully!')
        setLeadFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          linkedin: '',
          twitter: '',
          website: '',
          source: '',
          description: ''
        })
        await loadLeadData()
      } else {
        toast.error('Failed to add lead: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error adding lead:', error)
      toast.error('Failed to add lead: ' + error.message)
    }
  }

  const handleScrapingAction = async (source) => {
    toast.loading('Generating leads from ' + source + '...', { duration: 2000 })
    
    try {
      const result = await LeadService.generateAILeads(tenant.id, source.toLowerCase(), 5)
      
      if (result.success && result.data && result.data.length > 0) {
        toast.success(`Generated ${result.data.length} leads from ${source}!`)
        
        // Update budget usage and save to localStorage
        const newUsage = currentBudgetUsage + (result.data.length * 0.5)
        setCurrentBudgetUsage(newUsage)
        localStorage.setItem('currentBudgetUsage', newUsage.toString())
        
        await loadLeadData()
      } else {
        toast.error('Failed to generate leads')
      }
    } catch (error) {
      console.error('Error generating leads:', error)
      toast.error('Failed to generate leads')
    }
  }

  const updateBudget = async () => {
    try {
      // Save budget to localStorage for persistence
      localStorage.setItem('scrapingBudget', scrapingBudget.toString())
      
      // In a real app, you'd save this to the tenant's profile in Firebase
      if (tenant?.id) {
        // For now, we'll just store locally
        console.log(`Budget ${scrapingBudget} saved for tenant ${tenant.id}`)
      }
      
      toast.success('Budget updated successfully!')
    } catch (error) {
      console.error('Error updating budget:', error)
      toast.error('Failed to update budget')
    }
  }

  // Load saved budget on component mount
  React.useEffect(() => {
    const savedBudget = localStorage.getItem('scrapingBudget')
    if (savedBudget) {
      setScrapingBudget(parseFloat(savedBudget))
    }
    
    const savedUsage = localStorage.getItem('currentBudgetUsage')
    if (savedUsage) {
      setCurrentBudgetUsage(parseFloat(savedUsage))
    }
  }, [])

  const handleExportCSV = () => {
    try {
      if (leads.length === 0) {
        toast.error('No leads to export')
        return
      }

      // Create CSV headers
      const headers = ['Name', 'Email', 'Phone', 'Company', 'Source', 'Score', 'Created Date']
      
      // Create CSV rows
      const rows = leads.map(lead => [
        `${lead.firstName} ${lead.lastName}`,
        lead.email,
        lead.phone || '',
        lead.company || '',
        lead.source,
        lead.score,
        lead.createdAt ? (lead.createdAt.toDate ? lead.createdAt.toDate().toLocaleDateString() : new Date(lead.createdAt).toLocaleDateString()) : ''
      ])

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Exported ${leads.length} leads to CSV`)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error('Failed to export CSV')
    }
  }

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0]
    
    if (!file) {
      toast.error('Please select a CSV file')
      return
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        toast.error('CSV file appears to be empty or invalid')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('first'))
      const emailIndex = headers.findIndex(h => h.includes('email'))
      const phoneIndex = headers.findIndex(h => h.includes('phone'))
      const companyIndex = headers.findIndex(h => h.includes('company'))

      if (emailIndex === -1) {
        toast.error('CSV must contain an email column')
        return
      }

      const leadsToImport = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''))
        
        if (values[emailIndex] && values[emailIndex].includes('@')) {
          const [firstName, ...lastNameParts] = (values[nameIndex] || '').split(' ')
          
          leadsToImport.push({
            firstName: firstName || 'Unknown',
            lastName: lastNameParts.join(' ') || '',
            email: values[emailIndex],
            phone: values[phoneIndex] || '',
            company: values[companyIndex] || '',
            source: 'csv-import',
            score: Math.floor(Math.random() * 40) + 60
          })
        }
      }

      if (leadsToImport.length === 0) {
        toast.error('No valid leads found in CSV')
        return
      }

      toast.loading(`Importing ${leadsToImport.length} leads...`)
      
      let successCount = 0
      for (const leadData of leadsToImport) {
        const result = await LeadService.createLead(tenant.id, leadData)
        if (result.success) {
          successCount++
        }
      }

      toast.dismiss()
      toast.success(`Successfully imported ${successCount} leads!`)
      await loadLeadData()
      
      // Clear the file input
      event.target.value = ''
      
    } catch (error) {
      console.error('Error importing CSV:', error)
      toast.error('Failed to import CSV file')
    }
  }

  // Load lead data when tenant is available
  React.useEffect(() => {
    if (tenant?.id) {
      loadLeadData()
    }
  }, [tenant])

  // URL synchronization - update section when URL changes
  React.useEffect(() => {
    const newSection = getSectionFromURL()
    if (newSection !== activeSection) {
      setActiveSection(newSection)
    }
  }, [location.pathname])

  // Campaign Functions
  const updateCampaignStats = () => {
    const activeCampaigns = campaigns.filter(c => c.status === 'Active')
    const totalEmailsSent = campaigns.reduce((sum, campaign) => sum + (campaign.emailsSent || 0), 0)
    const avgOpenRate = campaigns.length > 0 
      ? Math.round(campaigns.reduce((sum, campaign) => sum + (campaign.openRate || 0), 0) / campaigns.length)
      : 0
    const avgResponseRate = campaigns.length > 0 
      ? Math.round(campaigns.reduce((sum, campaign) => sum + (campaign.responseRate || 0), 0) / campaigns.length)
      : 0

    setCampaignStats({
      totalCampaigns: activeCampaigns.length,
      totalEmailsSent: totalEmailsSent,
      averageOpenRate: avgOpenRate,
      averageResponseRate: avgResponseRate
    })
  }

  // Update stats whenever campaigns change
  React.useEffect(() => {
    updateCampaignStats()
  }, [campaigns])

  const handleCampaignFormSubmit = async (e) => {
    e.preventDefault()
    
    if (!campaignFormData.name || !campaignFormData.subject) {
      toast.error('Please fill in Campaign Name and Subject')
      return
    }

    try {
      // Find the selected template to get its content
      const selectedTemplate = emailTemplates.find(t => t.name === campaignFormData.template)
      
      // Generate AI-powered email content based on campaign settings
      const aiGeneratedContent = generateAIEmailContent(campaignFormData)
      
      // Use AI content if no template, or enhance template with AI if available
      let finalEmailContent
      if (selectedTemplate && selectedTemplate.content) {
        // Enhance template with AI personalization
        finalEmailContent = `${selectedTemplate.content}\n\n--- AI Enhancement ---\n\n${aiGeneratedContent}`
      } else {
        // Use pure AI generation
        finalEmailContent = aiGeneratedContent
      }
      
      // New campaigns start with 0 emails sent until actually launched
      const newCampaign = {
        id: Date.now(), // Use timestamp for unique ID
        name: campaignFormData.name,
        status: "Draft", // New campaigns start as Draft, not Active
        type: campaignFormData.type,
        emailsSent: 0, // Start with 0 emails sent
        openRate: 0, // No opens until emails are sent
        responseRate: 0, // No responses until emails are sent
        createdDate: new Date().toISOString().split('T')[0],
        subject: campaignFormData.subject,
        template: campaignFormData.template,
        emailContent: finalEmailContent,
        targetAudience: campaignFormData.targetAudience,
        sendDate: campaignFormData.sendDate,
        totalContacts: leads.filter(lead => {
          // Calculate how many contacts match the target audience
          if (!campaignFormData.targetAudience || campaignFormData.targetAudience === 'All Leads') {
            return true
          }
          if (campaignFormData.targetAudience === 'New Leads') {
            return lead.score < 50
          }
          if (campaignFormData.targetAudience === 'Warm Prospects') {
            return lead.score >= 50
          }
          return false
        }).length
      }

      setCampaigns([...campaigns, newCampaign])
      
      // Stats will be automatically updated by useEffect

      // Reset form
      setCampaignFormData({
        name: '',
        type: 'Email',
        subject: '',
        template: '',
        targetAudience: '',
        sendDate: ''
      })

      toast.success('🤖 Campaign created with AI-generated content! Click "View Email" or "Edit" to see the personalized content.')
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.error('Failed to create campaign')
    }
  }

  const handleCampaignAction = (campaignId, action) => {
    console.log('handleCampaignAction called:', { campaignId, action })
    const campaign = campaigns.find(c => c.id === campaignId)
    
    if (action === 'edit') {
      setEditingCampaign(campaign)
      setShowEditModal(true)
      toast.info('Opening campaign editor...')
      return
    }
    
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        switch (action) {
          case 'pause':
            const newStatus = campaign.status === 'Active' ? 'Paused' : 'Active'
            toast.success(`Campaign ${newStatus === 'Paused' ? 'paused' : 'resumed'} successfully`)
            return { ...campaign, status: newStatus }
          case 'delete':
            toast.success('Campaign deleted')
            return null
          default:
            return campaign
        }
      }
      return campaign
    }).filter(Boolean))
  }

  // AI-powered email content generation based on campaign settings
  const generateAIEmailContent = (campaignData) => {
    const { name, type, targetAudience, subject } = campaignData
    
    // AI-style content generation based on campaign parameters
    let content = `Hi {firstName},\n\n`
    
    // Customize opening based on audience
    if (targetAudience === 'New Leads') {
      content += `Welcome to MarketGenie! We're excited to have you join our community of successful marketers.\n\n`
    } else if (targetAudience === 'Warm Prospects') {
      content += `Thank you for your continued interest in MarketGenie. We have something special for you.\n\n`
    } else {
      content += `We hope this message finds you well and that your business is thriving.\n\n`
    }
    
    // Customize content based on campaign type
    if (type === 'Email') {
      content += `This ${name.toLowerCase()} campaign is designed to help you:\n`
      content += `• Increase your email engagement rates\n`
      content += `• Build stronger relationships with your audience\n`
      content += `• Drive more conversions through targeted messaging\n\n`
    } else if (type === 'SMS') {
      content += `Our SMS marketing approach for "${name}" focuses on:\n`
      content += `• Immediate, direct communication\n`
      content += `• Higher open rates than traditional email\n`
      content += `• Time-sensitive offers and updates\n\n`
    } else if (type === 'LinkedIn') {
      content += `Through LinkedIn outreach for "${name}", we're connecting with:\n`
      content += `• Industry professionals in your target market\n`
      content += `• Decision-makers who can benefit from your solution\n`
      content += `• Potential partners and collaborators\n\n`
    } else {
      content += `Our multi-channel approach for "${name}" includes:\n`
      content += `• Coordinated messaging across all platforms\n`
      content += `• Consistent brand experience\n`
      content += `• Maximum reach and engagement\n\n`
    }
    
    // Add value proposition based on campaign name keywords
    if (name.toLowerCase().includes('launch')) {
      content += `🚀 We're thrilled to announce this exciting launch! Here's what you can expect:\n\n`
      content += `✅ Early access to new features\n`
      content += `✅ Special launch pricing (limited time)\n`
      content += `✅ Exclusive bonuses for early adopters\n`
      content += `✅ Direct access to our product team\n\n`
    } else if (name.toLowerCase().includes('welcome')) {
      content += `As a warm welcome, we're providing you with:\n\n`
      content += `🎁 Complete access to our platform\n`
      content += `📚 Free training materials and guides\n`
      content += `🎯 Personalized strategy session\n`
      content += `💬 24/7 customer support\n\n`
    } else if (name.toLowerCase().includes('follow')) {
      content += `Following up on our previous conversation, I wanted to share:\n\n`
      content += `📈 How other companies like {company} have seen 300% ROI\n`
      content += `⏰ Limited-time implementation bonus\n`
      content += `🤝 Personalized demo tailored to your needs\n`
      content += `📞 Direct line to our success team\n\n`
    } else {
      content += `Here's what makes this campaign special for you:\n\n`
      content += `🎯 Personalized content based on your interests\n`
      content += `📊 Data-driven insights for better results\n`
      content += `🔧 Tools and resources to succeed\n`
      content += `🏆 Proven strategies from top performers\n\n`
    }
    
    // Call to action based on campaign type
    if (targetAudience === 'New Leads') {
      content += `Ready to get started? Click below to:\n`
      content += `[GET STARTED NOW]\n\n`
      content += `Or reply to this email if you have any questions. We're here to help!\n\n`
    } else {
      content += `Want to learn more? Here are your next steps:\n`
      content += `[SCHEDULE A DEMO] [LEARN MORE] [CONTACT US]\n\n`
      content += `Or simply reply to this email and let's start a conversation.\n\n`
    }
    
    content += `Best regards,\n`
    content += `The MarketGenie Team\n\n`
    content += `P.S. This email was crafted specifically for "${name}" to deliver maximum value to ${targetAudience?.toLowerCase() || 'your audience'}!`
    
    return content
  }

  const selectEmailTemplate = (template) => {
    console.log('selectEmailTemplate called:', template)
    setCampaignFormData(prev => ({
      ...prev,
      template: template.name,
      subject: template.subject // Auto-fill subject from template
    }))
    toast.success(`Template "${template.name}" selected! Subject auto-filled.`)
    
    // Show template preview
    toast.info(`Preview: ${template.preview.substring(0, 100)}...`, {
      duration: 5000
    })
  }

  // Security function to validate section access
  const isAuthorizedForSection = (section) => {
    if (section === 'Admin Panel') {
      return user?.email === 'dubdproducts@gmail.com' && tenant?.role === 'founder'
    }
    return true // All other sections are accessible
  }

  // Secure section setter with validation and URL navigation
  const setSecureActiveSection = (section) => {
    if (isAuthorizedForSection(section)) {
      setActiveSection(section)
      
      // Navigate to appropriate URL
      const sectionURLs = {
        'SuperGenie Dashboard': '/dashboard',
        'Lead Generation': '/dashboard/lead-generation',
        'Outreach Automation': '/dashboard/outreach-automation',
        'Workflow Automation': '/dashboard/workflow-automation',
        'Appointment Booking': '/dashboard/appointment-booking',
        'CRM & Pipeline': '/dashboard/crm-pipeline',
        'Analytics & Reporting': '/dashboard/analytics',
        'API Keys & Integrations': '/dashboard/api-keys',
        'Admin Panel': '/dashboard/admin-panel'
      }
      
      const targetURL = sectionURLs[section] || '/dashboard'
      if (location.pathname !== targetURL) {
        navigate(targetURL, { replace: true })
      }
    } else {
      console.warn(`Unauthorized access attempt to section: ${section}`)
      setActiveSection('SuperGenie Dashboard')
      navigate('/dashboard', { replace: true })
    }
  }

  // Prevent flash of wrong content during initialization
  if (!isInitialized || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <GenieProvider>
      <div className={`app-container min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`} style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar activeSection={activeSection} onSelect={setSecureActiveSection} />
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex justify-between items-center`}>
            <div>
              <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeSection}
              </h1>
              {tenant && (
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tenant.name} • 
                    <span className={tenant.plan === 'founder' ? 'executive-plan' : ''}> 
                      {tenant.plan === 'founder' ? 'Executive Plan' : tenant.plan} 
                    </span>
                    • {user?.email}
                  </p>
                  {tenant.role === 'founder' && (
                    <span className="founder-badge">Founder</span>
                  )}
                  {tenant.billing?.lifetime && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Lifetime Access
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              {/* Account Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
                >
                  ⚙️
                </button>
                
                {showAccountMenu && (
                  <div className={`absolute right-0 mt-2 w-48 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-50`}>
                    <div className="py-2">
                      <button 
                        onClick={() => {setSecureActiveSection('Account Settings'); setShowAccountMenu(false)}}
                        className={`w-full text-left block px-4 py-2 text-sm ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        Account Settings
                      </button>
                      <button 
                        onClick={() => {setSecureActiveSection('Profile'); setShowAccountMenu(false)}}
                        className={`w-full text-left block px-4 py-2 text-sm ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        Profile
                      </button>
                      <button 
                        onClick={() => {setSecureActiveSection('Billing'); setShowAccountMenu(false)}}
                        className={`w-full text-left block px-4 py-2 text-sm ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        Billing
                      </button>
                      <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                      {/* Admin Panel - FOUNDER ONLY ACCESS */}
                      {user?.email === 'dubdproducts@gmail.com' && tenant?.role === 'founder' && (
                        <>
                          <button 
                            onClick={() => {setSecureActiveSection('Admin Panel'); setShowAccountMenu(false)}}
                            className={`w-full text-left block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                          >
                            🛡️ Admin Panel
                          </button>
                          <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                        </>
                      )}
                      <button 
                        onClick={async () => {
                          await logout()
                          setShowAccountMenu(false)
                        }}
                        className={`w-full text-left block px-4 py-2 text-sm ${isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
          
          <main className={`flex-1 p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Section content rendering */}
          {activeSection === 'SuperGenie Dashboard' && (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
              <h1 className="text-4xl font-bold text-genie-teal mb-8">Welcome to Market Genie</h1>
              
              {/* Interactive Stat Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <button 
                  onClick={() => setActiveSection('Lead Generation')}
                  className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform hover:shadow-xl cursor-pointer text-left"
                >
                  <div className="bg-genie-teal/10 p-3 rounded-full">
                    <span role="img" aria-label="users" className="text-genie-teal text-2xl">👥</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{tenant?.usage?.leads || 0}</div>
                    <div className="text-gray-500">Total Leads</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveSection('CRM & Pipeline')}
                  className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform hover:shadow-xl cursor-pointer text-left"
                >
                  <div className="bg-genie-teal/10 p-3 rounded-full">
                    <span role="img" aria-label="revenue" className="text-genie-teal text-2xl">💰</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">$12,400</div>
                    <div className="text-gray-500">Pipeline Value</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveSection('Outreach Automation')}
                  className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform hover:shadow-xl cursor-pointer text-left"
                >
                  <div className="bg-genie-teal/10 p-3 rounded-full">
                    <span role="img" aria-label="campaigns" className="text-genie-teal text-2xl">⚡</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{tenant?.usage?.campaigns || 0}</div>
                    <div className="text-gray-500">Active Campaigns</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveSection('Reporting & Analytics')}
                  className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-4 hover:scale-105 transition-transform hover:shadow-xl cursor-pointer text-left"
                >
                  <div className="bg-genie-teal/10 p-3 rounded-full">
                    <span role="img" aria-label="conversion" className="text-genie-teal text-2xl">📈</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">23%</div>
                    <div className="text-gray-500">Conversion Rate</div>
                  </div>
                </button>
              </div>
              
              {/* AI Agent Helper / Chatbot */}
              <AIAgentHelper />
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
                <button 
                  onClick={() => setActiveSection('Lead Generation')} 
                  className="bg-genie-teal/10 rounded-xl p-6 flex flex-col items-center hover:bg-genie-teal/20 transition group"
                >
                  <span role="img" aria-label="contacts" className="text-genie-teal text-3xl mb-2 group-hover:scale-110 transition-transform">👥</span>
                  <span className="font-semibold text-genie-teal">Generate Leads</span>
                  <span className="text-sm text-gray-600 mt-1">Budget-aware scraping & enrichment</span>
                </button>
                
                <button 
                  onClick={() => setActiveSection('Outreach Automation')} 
                  className="bg-genie-teal/10 rounded-xl p-6 flex flex-col items-center hover:bg-genie-teal/20 transition group"
                >
                  <span role="img" aria-label="automation" className="text-genie-teal text-3xl mb-2 group-hover:scale-110 transition-transform">🤖</span>
                  <span className="font-semibold text-genie-teal">Start Campaign</span>
                  <span className="text-sm text-gray-600 mt-1">Multi-channel automation</span>
                </button>
                
                <button 
                  onClick={() => setActiveSection('AI Swarm')} 
                  className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-6 flex flex-col items-center hover:from-purple-200 hover:to-blue-200 transition group"
                >
                  <span role="img" aria-label="ai-swarm" className="text-purple-600 text-3xl mb-2 group-hover:scale-110 transition-transform">🧠</span>
                  <span className="font-semibold text-purple-600">AI Swarm</span>
                  <span className="text-sm text-gray-600 mt-1">Multiple AI agents working</span>
                </button>
                
                <button 
                  onClick={() => setActiveSection('Reporting & Analytics')} 
                  className="bg-genie-teal/10 rounded-xl p-6 flex flex-col items-center hover:bg-genie-teal/20 transition group"
                >
                  <span role="img" aria-label="analytics" className="text-genie-teal text-3xl mb-2 group-hover:scale-110 transition-transform">📊</span>
                  <span className="font-semibold text-genie-teal">View Analytics</span>
                  <span className="text-sm text-gray-600 mt-1">Performance insights</span>
                </button>
              </div>
            </div>
          )}
          {activeSection === 'Lead Generation' && (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
              <h2 className="text-3xl font-bold text-genie-teal mb-8">Lead Generation</h2>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="leads" className="text-genie-teal text-3xl mb-2">🧲</span>
                  <div className="text-2xl font-bold text-gray-900">{leadStats.totalLeads || 0}</div>
                  <div className="text-gray-500">New Leads</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="import" className="text-genie-teal text-3xl mb-2">📥</span>
                  <div className="text-2xl font-bold text-gray-900">{leadStats.highQuality || 0}</div>
                  <div className="text-gray-500">Quality Leads</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="conversion" className="text-genie-teal text-3xl mb-2">🔄</span>
                  <div className="text-2xl font-bold text-gray-900">{leadStats.conversionRate || 0}%</div>
                  <div className="text-gray-500">Lead Conversion</div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                  <span role="img" aria-label="budget" className="text-genie-teal text-3xl mb-2">💸</span>
                  <div className="text-2xl font-bold text-gray-900">${currentBudgetUsage.toFixed(2)}</div>
                  <div className="text-gray-500">Budget Used</div>
                </div>
              </div>
              {/* Budget-Aware Scraping Controls */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-2">Budget-Aware Scraping Controls</h3>
                <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                  <label className="font-medium text-gray-700">Monthly Scraping/API Budget ($):</label>
                  <input 
                    type="number" 
                    min="10" 
                    max="1000" 
                    value={scrapingBudget}
                    onChange={(e) => setScrapingBudget(parseFloat(e.target.value) || 50)}
                    className="border p-2 rounded w-32" 
                  />
                  <button 
                    onClick={updateBudget}
                    className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80"
                  >
                    Update Budget
                  </button>
                </div>
                <div className="text-gray-600 mb-2">Estimated leads per budget: <span className="font-bold">{Math.floor(scrapingBudget/0.5)} leads</span></div>
                <div className="bg-blue-50 rounded p-4 mb-2">Current usage: <span className="font-bold">${currentBudgetUsage.toFixed(2)}</span> / ${scrapingBudget}</div>
                <div className="text-xs text-gray-500 mb-2">You can update your budget as your capital grows. Low-cost mode helps startups stay within limits.</div>
                <div className="text-xs text-red-500">{currentBudgetUsage > scrapingBudget ? 'Warning: Budget exceeded! Scraping limited.' : ''}</div>
              </div>
              {/* Scraping Agents */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-2">Integrated Web Scraping Agents</h3>
                <div className="flex gap-4 mb-4">
                  <button 
                    onClick={() => handleScrapingAction('Business Directories')}
                    className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80"
                  >
                    Business Directories
                  </button>
                  <button 
                    onClick={() => handleScrapingAction('Social Media')}
                    className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80"
                  >
                    Social Media
                  </button>
                  <button 
                    onClick={() => handleScrapingAction('Custom Sources')}
                    className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80"
                  >
                    Custom Sources
                  </button>
                </div>
                <div className="text-gray-600 mb-2">Choose a source and start generating leads. Each button creates 5 sample leads for demo purposes.</div>
                <div className="bg-blue-50 rounded p-4">
                  <strong>Demo Mode:</strong> Generating realistic sample leads. In production, these would connect to real scraping APIs like LinkedIn Sales Navigator, Yellow Pages, etc.
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Total leads generated: <span className="font-bold">{leadStats.totalLeads || 0}</span>
                </div>
              </div>
              {/* Lead Import Tool */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-2">Import Leads (CSV)</h3>
                <div className="flex flex-col gap-3">
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleCSVUpload}
                    className="border p-2 rounded" 
                    id="csvFileInput"
                  />
                  <button 
                    onClick={() => document.getElementById('csvFileInput').click()}
                    className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80 self-start"
                  >
                    Choose CSV File
                  </button>
                  <div className="text-xs text-gray-500">
                    CSV should contain columns: name, email, phone, company. Upload happens automatically when file is selected.
                  </div>
                </div>
              </div>
              {/* Lead Capture Form with Enrichment */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-2">Add New Lead & Enrichment</h3>
                <form onSubmit={handleLeadFormSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input 
                    type="text" 
                    placeholder="Name" 
                    value={leadFormData.name}
                    onChange={(e) => setLeadFormData(prev => ({...prev, name: e.target.value}))}
                    className="border p-2 rounded" 
                    required 
                  />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={leadFormData.email}
                    onChange={(e) => setLeadFormData(prev => ({...prev, email: e.target.value}))}
                    className="border p-2 rounded" 
                    required 
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone" 
                    value={leadFormData.phone}
                    onChange={(e) => setLeadFormData(prev => ({...prev, phone: e.target.value}))}
                    className="border p-2 rounded" 
                  />
                  <input 
                    type="text" 
                    placeholder="Company" 
                    value={leadFormData.company}
                    onChange={(e) => setLeadFormData(prev => ({...prev, company: e.target.value}))}
                    className="border p-2 rounded" 
                  />
                  <input 
                    type="text" 
                    placeholder="LinkedIn" 
                    value={leadFormData.linkedin}
                    onChange={(e) => setLeadFormData(prev => ({...prev, linkedin: e.target.value}))}
                    className="border p-2 rounded" 
                  />
                  <input 
                    type="text" 
                    placeholder="Twitter" 
                    value={leadFormData.twitter}
                    onChange={(e) => setLeadFormData(prev => ({...prev, twitter: e.target.value}))}
                    className="border p-2 rounded" 
                  />
                  <input 
                    type="text" 
                    placeholder="Website" 
                    value={leadFormData.website}
                    onChange={(e) => setLeadFormData(prev => ({...prev, website: e.target.value}))}
                    className="border p-2 rounded" 
                  />
                  <input 
                    type="text" 
                    placeholder="Source" 
                    value={leadFormData.source}
                    onChange={(e) => setLeadFormData(prev => ({...prev, source: e.target.value}))}
                    className="border p-2 rounded" 
                  />
                  <textarea 
                    placeholder="Lead Description" 
                    value={leadFormData.description}
                    onChange={(e) => setLeadFormData(prev => ({...prev, description: e.target.value}))}
                    className="border p-2 rounded col-span-1 md:col-span-4" 
                  />
                  <button type="submit" className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80 col-span-1 md:col-span-4">Add Lead</button>
                </form>
              </div>
              {/* Filters/Search */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input type="text" placeholder="Search leads..." className="border p-2 rounded flex-1" />
                <select className="border p-2 rounded">
                  <option>All Sources</option>
                  <option>Website</option>
                  <option>Referral</option>
                  <option>Event</option>
                </select>
                <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">Filter</button>
              </div>
              {/* Recent Leads Table with Enrichment and Deduplication */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Recent Leads</h3>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2">Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Phone</th>
                      <th className="py-2">Company</th>
                      <th className="py-2">Source</th>
                      <th className="py-2">Score</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length > 0 ? leads.map((lead, index) => (
                      <tr key={lead.id} className={index % 2 === 0 ? 'bg-blue-50' : ''}>
                        <td className="py-2">{lead.firstName} {lead.lastName}</td>
                        <td className="py-2">{lead.email}</td>
                        <td className="py-2">{lead.phone || 'N/A'}</td>
                        <td className="py-2">{lead.company || 'N/A'}</td>
                        <td className="py-2">{lead.source}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${lead.score >= 80 ? 'bg-green-100 text-green-800' : lead.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {lead.score}
                          </span>
                        </td>
                        <td className="py-2">
                          <button className="text-genie-teal mr-2">Edit</button>
                          <button className="text-red-500">Delete</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="py-4 text-center text-gray-500">
                          No leads yet. Add your first lead above or use the scraping tools!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="flex justify-end mt-4 gap-2">
                  <button 
                    onClick={handleExportCSV}
                    className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80"
                  >
                    Export CSV
                  </button>
                  <button 
                    onClick={() => setActiveSection('Lead Generation')}
                    className="bg-genie-teal/10 text-genie-teal px-4 py-2 rounded hover:bg-genie-teal/20"
                  >
                    Add Lead
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-600">Total leads: <span className="font-bold">{leads.length}</span></div>
              </div>
            </div>
          )}
          {activeSection === 'Outreach Automation' && (
            <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
              <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Outreach Automation</h2>
              
              {/* Campaign Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span role="img" aria-label="campaigns" className="text-genie-teal text-3xl mb-2">📧</span>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{campaignStats.totalCampaigns}</div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Campaigns</div>
                </div>
                <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span role="img" aria-label="sent" className="text-genie-teal text-3xl mb-2">📤</span>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{campaignStats.totalEmailsSent.toLocaleString()}</div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Emails Sent</div>
                </div>
                <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span role="img" aria-label="opened" className="text-genie-teal text-3xl mb-2">�</span>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{campaignStats.averageOpenRate}%</div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Open Rate</div>
                </div>
                <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span role="img" aria-label="responses" className="text-genie-teal text-3xl mb-2">�</span>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{campaignStats.averageResponseRate}%</div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Response Rate</div>
                </div>
              </div>

              {/* Campaign Builder */}
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Create New Campaign</h3>
                <form onSubmit={handleCampaignFormSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Campaign Name</label>
                    <input 
                      type="text" 
                      value={campaignFormData.name}
                      onChange={(e) => setCampaignFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} 
                      placeholder="Q1 Product Launch"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email Subject</label>
                    <input 
                      type="text" 
                      value={campaignFormData.subject}
                      onChange={(e) => setCampaignFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} 
                      placeholder="Exciting news about our latest product!"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Campaign Type</label>
                      <select 
                        value={campaignFormData.type}
                        onChange={(e) => setCampaignFormData(prev => ({ ...prev, type: e.target.value }))}
                        className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="Email">Email Sequence</option>
                        <option value="SMS">SMS Campaign</option>
                        <option value="LinkedIn">LinkedIn Outreach</option>
                        <option value="Multi-Channel">Multi-Channel</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Target Audience</label>
                      <select 
                        value={campaignFormData.targetAudience}
                        onChange={(e) => setCampaignFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                        className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="">Select Audience</option>
                        <option value="All Leads">All Leads</option>
                        <option value="New Leads">New Leads</option>
                        <option value="Warm Prospects">Warm Prospects</option>
                        <option value="Custom Segment">Custom Segment</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email Template</label>
                      <input 
                        type="text" 
                        value={campaignFormData.template}
                        onChange={(e) => setCampaignFormData(prev => ({ ...prev, template: e.target.value }))}
                        className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} 
                        placeholder="Select template below or type custom"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Send Date</label>
                      <input 
                        type="datetime-local" 
                        value={campaignFormData.sendDate}
                        onChange={(e) => setCampaignFormData(prev => ({ ...prev, sendDate: e.target.value }))}
                        className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                  <button type="submit" className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 transition-colors">
                    Create Campaign
                  </button>
                </form>
              </div>

              {/* Active Campaigns */}
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Active Campaigns</h3>
                <div className="space-y-4">
                  {campaigns.length === 0 ? (
                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No campaigns created yet. Create your first campaign above!
                    </div>
                  ) : (
                    campaigns.map(campaign => (
                      <div key={campaign.id} className={`border-l-4 border-genie-teal ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{campaign.name}</h4>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {campaign.type} • {campaign.emailsSent} of {campaign.totalContacts || 0} contacts • Created: {campaign.createdDate}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                              Status: <span className={`px-2 py-1 rounded-full text-xs ${
                                campaign.status === 'Active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : campaign.status === 'Draft'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>{campaign.status}</span>
                              {campaign.subject && (
                                <span className={`ml-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Subject: "{campaign.subject}"
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                if (campaign.emailContent) {
                                  toast.success(`📧 Email Preview for "${campaign.name}":\n\nSubject: ${campaign.subject}\n\nContent:\n${campaign.emailContent.substring(0, 300)}${campaign.emailContent.length > 300 ? '...' : ''}`, {
                                    duration: 10000
                                  })
                                } else {
                                  toast.error('No email content available. Click Edit to add content.')
                                }
                              }}
                              className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600 transition-colors"
                            >
                              View Email
                            </button>
                            <button 
                              onClick={() => handleCampaignAction(campaign.id, 'edit')}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleCampaignAction(campaign.id, 'pause')}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                campaign.status === 'Active' 
                                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {campaign.status === 'Active' ? 'Pause' : 'Resume'}
                            </button>
                            <button 
                              onClick={() => handleCampaignAction(campaign.id, 'delete')}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1 flex justify-between`}>
                            <span>Open Rate: {campaign.openRate}%</span>
                            <span>Response Rate: {campaign.responseRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-genie-teal h-2 rounded-full" style={{width: `${campaign.openRate}%`}}></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Email Templates */}
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Email Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {emailTemplates.map(template => (
                    <div key={template.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}`}>
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{template.name}</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{template.category}</p>
                      <button 
                        onClick={() => selectEmailTemplate(template)}
                        className="w-full bg-genie-teal text-white px-3 py-2 rounded text-sm hover:bg-genie-teal/80 transition-colors"
                      >
                        Use Template
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campaign Edit Modal */}
              {showEditModal && editingCampaign && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-xl font-semibold text-genie-teal`}>Edit Campaign: {editingCampaign.name}</h3>
                      <button 
                        onClick={() => setShowEditModal(false)}
                        className={`text-gray-500 hover:text-gray-700 text-2xl ${isDarkMode ? 'hover:text-gray-300' : ''}`}
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Campaign Name</label>
                        <input 
                          type="text" 
                          value={editingCampaign.name}
                          onChange={(e) => setEditingCampaign({...editingCampaign, name: e.target.value})}
                          className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email Subject</label>
                        <input 
                          type="text" 
                          value={editingCampaign.subject || ''}
                          onChange={(e) => setEditingCampaign({...editingCampaign, subject: e.target.value})}
                          className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Campaign Status</label>
                        <select 
                          value={editingCampaign.status}
                          onChange={(e) => setEditingCampaign({...editingCampaign, status: e.target.value})}
                          className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Active">Active</option>
                          <option value="Paused">Paused</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Selected Template</label>
                        <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
                          {editingCampaign.template || 'No template selected'}
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Target Audience</label>
                        <select 
                          value={editingCampaign.targetAudience || ''}
                          onChange={(e) => setEditingCampaign({...editingCampaign, targetAudience: e.target.value})}
                          className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">Select Audience</option>
                          <option value="All Leads">All Leads</option>
                          <option value="New Leads">New Leads</option>
                          <option value="Warm Prospects">Warm Prospects</option>
                          <option value="Custom Segment">Custom Segment</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email Content</label>
                        <textarea 
                          value={editingCampaign.emailContent || ''}
                          onChange={(e) => setEditingCampaign({...editingCampaign, emailContent: e.target.value})}
                          className={`w-full border p-3 rounded h-64 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                          placeholder="Enter the email content that will be sent to contacts..."
                          style={{fontFamily: 'monospace', fontSize: '14px'}}
                        />
                        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          You can use variables like {'{firstName}'} {'{lastName}'} {'{company}'} that will be replaced with actual contact data.
                        </div>
                      </div>

                      <div className={`p-4 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                        <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email Preview</h4>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap max-h-32 overflow-y-auto border rounded p-2 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                          {editingCampaign.emailContent ? 
                            editingCampaign.emailContent
                              .replace(/{firstName}/g, 'John')
                              .replace(/{lastName}/g, 'Doe')
                              .replace(/{company}/g, 'Acme Corp') 
                            : 'No content to preview'
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => {
                          setCampaigns(campaigns.map(c => 
                            c.id === editingCampaign.id ? editingCampaign : c
                          ))
                          setShowEditModal(false)
                          toast.success('Campaign updated successfully!')
                        }}
                        className="bg-genie-teal text-white px-6 py-2 rounded hover:bg-genie-teal/80 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button 
                        onClick={() => setShowEditModal(false)}
                        className={`px-6 py-2 rounded border transition-colors ${
                          isDarkMode 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
              {/* Pipeline Management */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Sales Pipeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Prospects</h4>
                    <div className="text-2xl font-bold text-blue-900">18</div>
                    <div className="text-sm text-blue-700">$45,000</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Qualified</h4>
                    <div className="text-2xl font-bold text-yellow-900">12</div>
                    <div className="text-sm text-yellow-700">$78,000</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Proposal</h4>
                    <div className="text-2xl font-bold text-orange-900">8</div>
                    <div className="text-sm text-orange-700">$95,000</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Closed Won</h4>
                    <div className="text-2xl font-bold text-green-900">5</div>
                    <div className="text-sm text-green-700">$67,000</div>
                  </div>
                </div>
              </div>

              {/* Contact Management */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Recent Contacts</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3">Name</th>
                        <th className="py-3">Company</th>
                        <th className="py-3">Stage</th>
                        <th className="py-3">Value</th>
                        <th className="py-3">Last Contact</th>
                        <th className="py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3">John Smith</td>
                        <td className="py-3">Acme Corp</td>
                        <td className="py-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Qualified</span></td>
                        <td className="py-3">$15,000</td>
                        <td className="py-3">2 days ago</td>
                        <td className="py-3">
                          <button className="text-genie-teal mr-2 hover:underline">View</button>
                          <button className="text-blue-600 hover:underline">Call</button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3">Sarah Johnson</td>
                        <td className="py-3">Tech Startup</td>
                        <td className="py-3"><span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">Proposal</span></td>
                        <td className="py-3">$28,000</td>
                        <td className="py-3">1 week ago</td>
                        <td className="py-3">
                          <button className="text-genie-teal mr-2 hover:underline">View</button>
                          <button className="text-blue-600 hover:underline">Email</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow p-6 text-center">
                  <h4 className="font-semibold text-genie-teal mb-4">Add Contact</h4>
                  <button className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 w-full">New Contact</button>
                </div>
                <div className="bg-white rounded-xl shadow p-6 text-center">
                  <h4 className="font-semibold text-genie-teal mb-4">Create Deal</h4>
                  <button className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 w-full">New Deal</button>
                </div>
                <div className="bg-white rounded-xl shadow p-6 text-center">
                  <h4 className="font-semibold text-genie-teal mb-4">Export Data</h4>
                  <button className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 w-full">Export CSV</button>
                </div>
              </div>
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
              {/* Calendar Integration */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Calendar Integration</h3>
                <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 flex items-center gap-2">
                    <span>📅</span> Connect Google Calendar
                  </button>
                  <button className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                    <span>📧</span> Connect Outlook
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 flex items-center gap-2">
                    <span>🔗</span> Custom Integration
                  </button>
                </div>
              </div>

              {/* Booking Settings */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Booking Settings</h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Duration</label>
                    <select className="border p-3 rounded w-full">
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>45 minutes</option>
                      <option>60 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Time</label>
                    <select className="border p-3 rounded w-full">
                      <option>No buffer</option>
                      <option>5 minutes</option>
                      <option>10 minutes</option>
                      <option>15 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Hours</label>
                    <input type="time" className="border p-3 rounded w-full" defaultValue="09:00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input type="time" className="border p-3 rounded w-full" defaultValue="17:00" />
                  </div>
                  <button type="submit" className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 col-span-1 md:col-span-2">Save Settings</button>
                </form>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Upcoming Appointments</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-genie-teal bg-blue-50 p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Demo Call - Acme Corp</h4>
                        <p className="text-gray-600">John Smith</p>
                        <p className="text-sm text-gray-500">Today at 2:00 PM - 3:00 PM</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-genie-teal hover:underline">Join</button>
                        <button className="text-blue-600 hover:underline">Reschedule</button>
                      </div>
                    </div>
                  </div>
                  <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Strategy Session - Tech Startup</h4>
                        <p className="text-gray-600">Sarah Johnson</p>
                        <p className="text-sm text-gray-500">Tomorrow at 10:00 AM - 11:00 AM</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-genie-teal hover:underline">Prepare</button>
                        <button className="text-blue-600 hover:underline">Send Reminder</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6 gap-2">
                  <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">View Calendar</button>
                  <button className="bg-genie-teal/10 text-genie-teal px-4 py-2 rounded hover:bg-genie-teal/20">Book Meeting</button>
                </div>
              </div>
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
              {/* Workflow Builder */}
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Create New Workflow</h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Workflow Name" className="border p-3 rounded" required />
                  <select className="border p-3 rounded">
                    <option>Select Trigger</option>
                    <option>New Lead Added</option>
                    <option>Email Opened</option>
                    <option>Form Submitted</option>
                    <option>Deal Stage Changed</option>
                  </select>
                  <select className="border p-3 rounded">
                    <option>Select Action</option>
                    <option>Send Email</option>
                    <option>Add to Sequence</option>
                    <option>Update Field</option>
                    <option>Create Task</option>
                  </select>
                  <input type="number" placeholder="Delay (minutes)" className="border p-3 rounded" />
                  <textarea placeholder="Workflow Description" className="border p-3 rounded col-span-1 md:col-span-2" />
                  <button type="submit" className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 col-span-1 md:col-span-2">Create Workflow</button>
                </form>
              </div>

              {/* Active Workflows */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold text-genie-teal mb-4">Active Workflows</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Welcome New Leads</h4>
                      <p className="text-gray-600">Trigger: New Lead → Send welcome email sequence</p>
                      <p className="text-sm text-gray-500">Last triggered: 2 hours ago</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span>
                      <button className="text-genie-teal hover:underline">Edit</button>
                      <button className="text-red-500 hover:underline">Pause</button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">Follow-up Reminder</h4>
                      <p className="text-gray-600">Trigger: No response after 3 days → Create task</p>
                      <p className="text-sm text-gray-500">Last triggered: 1 day ago</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span>
                      <button className="text-genie-teal hover:underline">Edit</button>
                      <button className="text-red-500 hover:underline">Pause</button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6 gap-2">
                  <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">View All</button>
                  <button className="bg-genie-teal/10 text-genie-teal px-4 py-2 rounded hover:bg-genie-teal/20">New Workflow</button>
                </div>
              </div>
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
          {activeSection === 'Cost Controls' && <CostControlsDashboard />}
          
          {activeSection === 'API Keys & Integrations' && <APIKeysIntegrations />}
          {activeSection === 'AI Swarm' && <AISwarmDashboard />}
          {activeSection === 'Admin Panel' && user?.email === 'dubdproducts@gmail.com' && tenant?.role === 'founder' && renderAdminPanel()}
          {activeSection === 'Account Settings' && renderAccountSettings()}
          {activeSection === 'Profile' && renderProfile()}
          {activeSection === 'Billing' && renderBilling()}
        </main>
        </div>
      </div>
    </GenieProvider>
  )

  function renderDashboard() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
        <h2 className={`text-3xl font-bold text-genie-teal mb-8 ${isDarkMode ? 'text-genie-teal' : ''}`}>SuperGenie Dashboard</h2>
        
        {/* Financial Overview Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="revenue" className="text-genie-teal text-3xl mb-2">💰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$45,230</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Revenue</div>
            <div className="text-green-500 text-sm mt-1">+12.5% ↗️</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="leads" className="text-genie-teal text-3xl mb-2">🎯</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1,247</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Leads</div>
            <div className="text-green-500 text-sm mt-1">+8.3% ↗️</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="conversion" className="text-genie-teal text-3xl mb-2">📊</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>24.6%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Conversion Rate</div>
            <div className="text-green-500 text-sm mt-1">+3.1% ↗️</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="campaigns" className="text-genie-teal text-3xl mb-2">🚀</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>18</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Campaigns</div>
            <div className="text-blue-500 text-sm mt-1">Running</div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Revenue Growth</h3>
          <div className="h-64 flex items-end justify-between bg-gradient-to-t from-blue-50 to-white rounded p-4">
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-32 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jan</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-40 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Feb</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-36 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mar</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-48 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Apr</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-44 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>May</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-52 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jun</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-genie-teal text-white p-6 rounded-xl shadow hover:bg-genie-teal/90 transition-colors text-left">
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-semibold mb-1">Start New Campaign</div>
            <div className="text-genie-teal-light text-sm">Launch a new lead generation campaign</div>
          </button>
          <button className="bg-blue-600 text-white p-6 rounded-xl shadow hover:bg-blue-700 transition-colors text-left">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold mb-1">View Analytics</div>
            <div className="text-blue-200 text-sm">Deep dive into your performance metrics</div>
          </button>
          <button className="bg-purple-600 text-white p-6 rounded-xl shadow hover:bg-purple-700 transition-colors text-left">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-semibold mb-1">Automation Hub</div>
            <div className="text-purple-200 text-sm">Manage your automated workflows</div>
          </button>
        </div>
      </div>
    )
  }

  function renderAccountSettings() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Account Settings</h2>
        
        {/* Profile Information */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Full Name</label>
              <input 
                type="text" 
                defaultValue="John Smith" 
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Email Address</label>
              <input 
                type="email" 
                defaultValue="john@company.com" 
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Company</label>
              <input 
                type="text" 
                defaultValue="Acme Corporation" 
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Time Zone</label>
              <select className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}>
                <option>Eastern Time (ET)</option>
                <option>Central Time (CT)</option>
                <option>Mountain Time (MT)</option>
                <option>Pacific Time (PT)</option>
              </select>
            </div>
          </div>
          <button className="mt-6 bg-genie-teal text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors">
            Save Changes
          </button>
        </div>

        {/* Security Settings */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add an extra layer of security to your account</p>
              </div>
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm">Enabled</button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Change Password</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Update your account password</p>
              </div>
              <button className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Change</button>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email Notifications</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Receive updates about your campaigns</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SMS Notifications</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Get alerts via text message</p>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Marketing Updates</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stay informed about new features</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderProfile() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Profile</h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Picture & Basic Info */}
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-genie-teal to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.displayName || 'User'}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user?.email}</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {tenant?.role === 'founder' ? '👑 Founder Account' : 'Standard User'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                  Display Name
                </label>
                <input 
                  type="text" 
                  defaultValue={user?.displayName || ''}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className={`w-full px-4 py-2 border rounded-lg opacity-50 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Account Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold text-genie-teal`}>{tenant?.usage?.campaigns || 0}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Campaigns Created</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold text-genie-teal`}>{tenant?.usage?.leads || 0}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Leads Generated</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold text-genie-teal`}>{tenant?.usage?.apiCalls || 0}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>API Calls Made</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderBilling() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Billing & Subscription</h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Current Plan */}
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tenant?.plan === 'founder' ? '👑 Founder Plan' : tenant?.plan?.toUpperCase() || 'STARTER'} Plan
                </h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tenant?.billing?.lifetime ? 'Lifetime Access' : 'Monthly Subscription'}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tenant?.billing?.lifetime ? 'FREE' : `$${tenant?.billing?.amount || 0}`}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tenant?.billing?.lifetime ? 'Forever' : 'per month'}
                </div>
              </div>
            </div>
            
            {tenant?.plan === 'founder' && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-yellow-600 text-xl mr-3">👑</span>
                  <div>
                    <p className="font-semibold text-yellow-800">Founder Account Benefits</p>
                    <p className="text-sm text-yellow-700">Unlimited everything, lifetime access, priority support</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Usage Overview */}
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Current Usage</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Leads</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tenant?.usage?.leads || 0} / {tenant?.features?.maxLeads === 999999 ? '∞' : tenant?.features?.maxLeads || 1000}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Campaigns</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tenant?.usage?.campaigns || 0} / {tenant?.features?.maxCampaigns === 999999 ? '∞' : tenant?.features?.maxCampaigns || 10}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>API Calls</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tenant?.usage?.apiCalls || 0} / {tenant?.features?.apiCalls === 999999 ? '∞' : tenant?.features?.apiCalls || 5000}
                </span>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Billing History</h3>
            {tenant?.billing?.lifetime ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🎉</span>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  You have lifetime access! No billing history needed.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No billing history available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  function renderAPIKeys() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>API Keys & Integrations</h2>
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="keys" className="text-genie-teal text-3xl mb-2">🔑</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active API Keys</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="integrations" className="text-genie-teal text-3xl mb-2">🔗</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>12</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Connected Services</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="usage" className="text-genie-teal text-3xl mb-2">📊</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>89%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>API Usage</div>
          </div>
        </div>

        {/* Add New API Key */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Add New API Key</h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            Connect your own API keys for AI services. Your keys are stored securely and never shared with Genie Labs.
          </p>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Service Provider</label>
              <select className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                <option>Select Provider</option>
                <option>OpenAI (GPT-4)</option>
                <option>Anthropic (Claude)</option>
                <option>Google (Gemini)</option>
                <option>Cohere</option>
                <option>Hugging Face</option>
                <option>Custom API</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>API Key Name</label>
              <input type="text" className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="My OpenAI Key" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 w-full">Add Key</button>
            </div>
          </form>
        </div>

        {/* Existing API Keys */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Your API Keys</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Usage</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>OpenAI GPT-4</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Production Key</td>
                  <td className="py-3 px-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span></td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>12,450 requests</td>
                  <td className="py-3 px-4">
                    <button className="text-genie-teal hover:text-genie-teal/80 mr-3">Edit</button>
                    <button className="text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Anthropic Claude</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Development Key</td>
                  <td className="py-3 px-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Limited</span></td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>3,200 requests</td>
                  <td className="py-3 px-4">
                    <button className="text-genie-teal hover:text-genie-teal/80 mr-3">Edit</button>
                    <button className="text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  function renderAdminPanel() {
    // SECURITY CHECK: Only founder can access Admin Panel
    if (user?.email !== 'dubdproducts@gmail.com' || tenant?.role !== 'founder') {
      return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
          <div className="max-w-md mx-auto text-center mt-20">
            <div className="text-6xl mb-6">🚫</div>
            <h2 className={`text-3xl font-bold text-red-500 mb-4`}>Access Denied</h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              You do not have permission to access the Admin Panel.
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              This area is restricted to founder accounts only.
            </p>
            <button 
              onClick={() => setActiveSection('SuperGenie Dashboard')}
              className="mt-6 px-6 py-3 bg-genie-teal text-white rounded-lg hover:bg-genie-teal/80 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Admin Panel</h2>
        
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="users" className="text-genie-teal text-3xl mb-2">👥</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2,847</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="revenue" className="text-genie-teal text-3xl mb-2">💰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$125K</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Revenue</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="support" className="text-genie-teal text-3xl mb-2">🎫</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>23</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Open Tickets</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="system" className="text-genie-teal text-3xl mb-2">⚡</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>99.8%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>System Uptime</div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>User Management</h3>
            <div className="space-y-4">
              <button className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 text-left flex items-center gap-3">
                <span>👤</span> View All Users
              </button>
              <button className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 text-left flex items-center gap-3">
                <span>➕</span> Create New User
              </button>
              <button className="w-full bg-orange-600 text-white p-3 rounded hover:bg-orange-700 text-left flex items-center gap-3">
                <span>🔒</span> Manage Permissions
              </button>
              <button className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 text-left flex items-center gap-3">
                <span>🚫</span> Suspended Users
              </button>
            </div>
          </div>

          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>System Administration</h3>
            <div className="space-y-4">
              <button className="w-full bg-purple-600 text-white p-3 rounded hover:bg-purple-700 text-left flex items-center gap-3">
                <span>📊</span> System Analytics
              </button>
              <button className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 text-left flex items-center gap-3">
                <span>⚙️</span> System Configuration
              </button>
              <button className="w-full bg-gray-600 text-white p-3 rounded hover:bg-gray-700 text-left flex items-center gap-3">
                <span>📝</span> View System Logs
              </button>
              <button className="w-full bg-yellow-600 text-white p-3 rounded hover:bg-yellow-700 text-left flex items-center gap-3">
                <span>🔧</span> Maintenance Mode
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Recent Admin Activity</h3>
          <div className="space-y-4">
            <div className={`border-l-4 border-blue-500 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded`}>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User Registration Spike</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>47 new users registered in the last hour</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>2 minutes ago</div>
            </div>
            <div className={`border-l-4 border-green-500 ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'} p-4 rounded`}>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Update Completed</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Version 2.1.3 deployed successfully</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>15 minutes ago</div>
            </div>
            <div className={`border-l-4 border-yellow-500 ${isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'} p-4 rounded`}>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>High API Usage Alert</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>OpenAI API usage at 85% of monthly limit</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>1 hour ago</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderLeadGeneration() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>🚀 Ultimate Lead Generation Ecosystem</h2>
        
        {/* Integration Connection Status */}
        <div className="mb-10">
          <IntegrationConnectionStatus />
        </div>
        
        {/* Social Media Scraping Agents */}
        <div className="mb-10">
          <SocialMediaScrapingAgents />
        </div>
        
        {/* Lead Generation Automation Workflows */}
        <div className="mb-10">
          <LeadGenerationWorkflows />
        </div>
        
        {/* Multi-Channel Automation Hub */}
        <div className="mb-10">
          <MultiChannelAutomationHub />
        </div>
        
        {/* Advanced Funnel Builder */}
        <div className="mb-10">
          <AdvancedFunnelBuilder />
        </div>
        
        {/* Superior CRM System */}
        <div className="mb-10">
          <SuperiorCRMSystem />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="leads" className="text-genie-teal text-3xl mb-2">🧲</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>320</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>New Leads</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="import" className="text-genie-teal text-3xl mb-2">📥</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>120</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Imported Contacts</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="conversion" className="text-genie-teal text-3xl mb-2">🔄</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>18%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Lead Conversion</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="budget" className="text-genie-teal text-3xl mb-2">💸</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$120</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Budget Used</div>
          </div>
        </div>

        {/* Budget-Aware Scraping Controls */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-2`}>Budget-Aware Scraping Controls</h3>
          <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
            <label className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Monthly Scraping/API Budget ($):</label>
            <input type="number" min="10" max="1000" defaultValue="50" className={`border p-2 rounded w-32 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
            <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">Update Budget</button>
          </div>
          <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Estimated leads per budget: <span className="font-bold">{Math.floor(50/0.5)} leads</span> (demo)</div>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded p-4 mb-2`}>Current usage: <span className="font-bold">$32</span> / $50</div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>You can update your budget as your capital grows. Low-cost mode helps startups stay within limits.</div>
          <div className="text-xs text-red-500">{32 > 50 ? 'Warning: Budget exceeded! Scraping limited.' : ''}</div>
        </div>

        {/* Recent Leads Table */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Recent Leads</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Company</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Source</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Jane Doe</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>jane@example.com</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Acme Inc.</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Website</td>
                  <td className="py-3 px-4">
                    <button className="text-genie-teal hover:text-genie-teal/80 mr-3">Contact</button>
                    <button className="text-blue-500 hover:text-blue-700">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  function renderCRMPipeline() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>CRM & Pipeline</h2>
        
        {/* Pipeline Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="prospects" className="text-genie-teal text-3xl mb-2">🎯</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>127</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Prospects</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="qualified" className="text-genie-teal text-3xl mb-2">✅</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>43</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Qualified</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="proposals" className="text-genie-teal text-3xl mb-2">📄</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>18</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Proposals Sent</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="closed" className="text-genie-teal text-3xl mb-2">💰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$89K</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Closed Won</div>
          </div>
        </div>

        {/* Pipeline Kanban */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Sales Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead (34)</h4>
              <div className="space-y-2">
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Acme Corp</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$15,000</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>TechStart Inc</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$8,500</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Qualified (18)</h4>
              <div className="space-y-2">
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Global Solutions</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$25,000</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Proposal (8)</h4>
              <div className="space-y-2">
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise Co</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$45,000</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Closed Won (5)</h4>
              <div className="space-y-2">
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Success Ltd</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$32,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderAppointments() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Appointments</h2>
        
        {/* Appointment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="today" className="text-genie-teal text-3xl mb-2">📅</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Today's Meetings</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="week" className="text-genie-teal text-3xl mb-2">📊</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>23</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>This Week</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="rate" className="text-genie-teal text-3xl mb-2">✅</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>92%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Show-up Rate</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="conversion" className="text-genie-teal text-3xl mb-2">💰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>67%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Conversion Rate</div>
          </div>
        </div>

        {/* Calendar Integration */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Calendar Integrations</h3>
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 flex items-center gap-2">
              <span>📅</span> Connect Google Calendar
            </button>
            <button className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
              <span>📧</span> Connect Outlook
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 flex items-center gap-2">
              <span>🔗</span> Custom Integration
            </button>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Upcoming Appointments</h3>
          <div className="space-y-4">
            <div className={`border-l-4 border-genie-teal ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product Demo - TechCorp</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Today at 2:00 PM • John Smith • john@techcorp.com</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Join</button>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Reschedule</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderWorkflowAutomation() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Workflow Automation</h2>
        
        {/* Automation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="workflows" className="text-genie-teal text-3xl mb-2">⚡</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>8</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Workflows</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="tasks" className="text-genie-teal text-3xl mb-2">✅</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1,247</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tasks Automated</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="time" className="text-genie-teal text-3xl mb-2">⏰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>42h</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Time Saved</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="success" className="text-genie-teal text-3xl mb-2">📈</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>94%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Success Rate</div>
          </div>
        </div>

        {/* Workflow Builder */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Workflow Builder</h3>
          <div className="flex gap-4 mb-4">
            <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">+ New Workflow</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Import Template</button>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-4`}>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Drag and drop workflow components here to build your automation</p>
          </div>
        </div>

        {/* Active Workflows */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Active Workflows</h3>
          <div className="space-y-4">
            <div className={`border-l-4 border-green-500 ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'} p-4 rounded`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead Nurturing Sequence</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Triggers: New lead added • Actions: Send welcome email, add to CRM</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                  <button className="text-blue-500 hover:text-blue-700">Edit</button>
                </div>
              </div>
              <div className="mt-2">
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Executed 247 times this month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

// Admin Component
function AdminPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Admin Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex justify-between items-center`}>
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🛡️ Admin Panel
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            System administration and user management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <Link 
            to="/dashboard" 
            className="bg-genie-teal text-white px-4 py-2 rounded-lg hover:bg-genie-teal/90"
          >
            Dashboard
          </Link>
          <Link 
            to="/" 
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Landing
          </Link>
        </div>
      </header>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
              <div className="ml-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User Management</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage user accounts and permissions</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Users: 1,247</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Active: 892</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pending: 23</div>
            </div>
          </div>

          {/* System Settings */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">⚙️</span>
              </div>
              <div className="ml-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Settings</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Configure system preferences</p>
              </div>
            </div>
            <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
              Configure Settings
            </button>
          </div>

          {/* Analytics Overview */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div className="ml-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Analytics</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monitor system performance</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Uptime: 99.9%</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>API Calls: 2.3M today</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Storage: 75% used</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg md:col-span-2 lg:col-span-3`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Recent Admin Activity</h3>
            <div className="space-y-3">
              <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User registration spike</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-2`}>+47 new users today</span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>2 hours ago</span>
              </div>
              <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System backup completed</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-2`}>All data backed up successfully</span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>4 hours ago</span>
              </div>
              <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>API rate limit updated</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-2`}>Increased to 10,000 req/min</span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main App Component with Routing
function App() {
  return (
    <FounderSetup>
      <AuthProvider>
        <TenantProvider>
          <GenieProvider>
            <Toaster position="top-right" />
            <Routes>
              {/* Landing Page - Public sales page */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Auth Routes - Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Dashboard - Protected User workspace */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <SophisticatedDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <SophisticatedDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin Panel - Protected Admin only */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/*" element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } />
              
              {/* Catch all - redirect to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </GenieProvider>
        </TenantProvider>
      </AuthProvider>
    </FounderSetup>
  )
}

export default App
