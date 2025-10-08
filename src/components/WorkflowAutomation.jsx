import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import FirebaseUserDataService from '../services/firebaseUserData'
import IntegratedMarketingService from '../services/integratedMarketing'
import { useGenie } from '../contexts/GenieContext'
import toast from 'react-hot-toast'

const WorkflowAutomation = () => {
  const { user } = useAuth()
  const { createWorkflow: genieCreateWorkflow, optimizeWorkflow } = useGenie()
  
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
  
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [availableCampaigns, setAvailableCampaigns] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    trigger: '',
    action: '',
    delay: 0,
    description: '',
    conditions: [],
    status: 'active',
    campaignId: '',
    targetTags: [],
    aiOptimized: false
  })

  // Load workflows from Firebase
  useEffect(() => {
    const loadWorkflows = async () => {
      if (!user) return
      
      try {
        const data = await FirebaseUserDataService.getWorkflows(user.uid)
        setWorkflows(data.workflows || [])
      } catch (error) {
        console.error('Error loading workflows:', error)
        toast.error('Failed to load workflows')
      } finally {
        setLoading(false)
      }
    }

    loadWorkflows()
  }, [user])

  // Load available campaigns and CRM tags for workflow integration
  useEffect(() => {
    const loadIntegrationData = async () => {
      if (!user) return
      
      try {
        // Load automation campaigns
        const campaigns = await IntegratedMarketingService.getAutomationCampaigns(user.uid)
        setAvailableCampaigns(campaigns)
        
        // Load CRM contacts to extract tags
        const contacts = await IntegratedMarketingService.getContactsForCampaign(user.uid)
        const tags = [...new Set(contacts.flatMap(contact => contact.tags || []))]
        setAvailableTags(tags)
      } catch (error) {
        console.error('Error loading integration data:', error)
      }
    }

    loadIntegrationData()
  }, [user])

  // Save workflows to Firebase
  const saveWorkflows = async (updatedWorkflows) => {
    if (!user) return

    try {
      await FirebaseUserDataService.saveWorkflows(user.uid, { workflows: updatedWorkflows })
      setWorkflows(updatedWorkflows)
      toast.success('Workflows updated successfully')
    } catch (error) {
      console.error('Error saving workflows:', error)
      toast.error('Failed to save workflows')
    }
  }

  // Create new workflow
  const createWorkflow = async (e) => {
    e.preventDefault()
    
    if (!newWorkflow.name || !newWorkflow.trigger || !newWorkflow.action) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate campaign-specific fields
    if ((newWorkflow.action === 'launch_campaign' || newWorkflow.action === 'add_to_campaign') && !newWorkflow.campaignId) {
      toast.error('Please select a campaign for this action')
      return
    }

    // If editing, use update function instead
    if (editingWorkflow) {
      return updateWorkflow(e)
    }

    try {
      const workflow = {
        id: Date.now().toString(),
        ...newWorkflow,
        createdAt: new Date().toISOString(),
        lastTriggered: null,
        triggerCount: 0,
        integrationData: {
          campaignId: newWorkflow.campaignId,
          targetTags: newWorkflow.targetTags,
          aiOptimized: newWorkflow.aiOptimized
        }
      }

      // If this is a campaign-triggering workflow, create the integration trigger
      if (newWorkflow.action === 'launch_campaign' || newWorkflow.action === 'add_to_campaign') {
        await IntegratedMarketingService.createWorkflowCampaignTrigger(
          user.uid,
          workflow.id,
          newWorkflow.campaignId,
          {
            trigger: newWorkflow.trigger,
            targetTags: newWorkflow.targetTags,
            delay: newWorkflow.delay
          }
        )
        
        toast.success('🚀 Workflow with campaign integration created!')
      } else {
        toast.success('Workflow created successfully!')
      }

      const updatedWorkflows = [...workflows, workflow]
      await saveWorkflows(updatedWorkflows)
      
      setNewWorkflow({
        name: '',
        trigger: '',
        action: '',
        delay: 0,
        description: '',
        conditions: [],
        status: 'active',
        campaignId: '',
        targetTags: [],
        aiOptimized: false
      })
      setShowBuilder(false)
      
    } catch (error) {
      console.error('Error creating workflow:', error)
      toast.error('Failed to create workflow')
    }
  }

  // Toggle workflow status
  const toggleWorkflowStatus = async (workflowId) => {
    const updatedWorkflows = workflows.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, status: workflow.status === 'active' ? 'paused' : 'active' }
        : workflow
    )
    await saveWorkflows(updatedWorkflows)
  }

  // Delete workflow
  const deleteWorkflow = async (workflowId) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      const updatedWorkflows = workflows.filter(workflow => workflow.id !== workflowId)
      await saveWorkflows(updatedWorkflows)
      toast.success('Workflow deleted')
    }
  }

  // Start editing workflow
  const startEditWorkflow = (workflow) => {
    setEditingWorkflow(workflow.id)
    setNewWorkflow({
      name: workflow.name,
      trigger: workflow.trigger,
      action: workflow.action,
      delay: workflow.delay,
      description: workflow.description,
      conditions: workflow.conditions || [],
      status: workflow.status
    })
    setShowBuilder(true)
  }

  // Update existing workflow
  const updateWorkflow = async (e) => {
    e.preventDefault()
    
    if (!newWorkflow.name || !newWorkflow.trigger || !newWorkflow.action) {
      toast.error('Please fill in all required fields')
      return
    }

    const updatedWorkflows = workflows.map(workflow => 
      workflow.id === editingWorkflow 
        ? { 
            ...workflow, 
            ...newWorkflow,
            updatedAt: new Date().toISOString()
          }
        : workflow
    )
    
    await saveWorkflows(updatedWorkflows)
    
    // Reset form
    setNewWorkflow({
      name: '',
      trigger: '',
      action: '',
      delay: 0,
      description: '',
      conditions: [],
      status: 'active'
    })
    setShowBuilder(false)
    setEditingWorkflow(null)
    toast.success('Workflow updated successfully!')
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingWorkflow(null)
    setShowBuilder(false)
    setNewWorkflow({
      name: '',
      trigger: '',
      action: '',
      delay: 0,
      description: '',
      conditions: [],
      status: 'active',
      campaignId: '',
      targetTags: [],
      aiOptimized: false
    })
  }

  // Calculate statistics
  const stats = {
    total: workflows.length,
    active: workflows.filter(w => w.status === 'active').length,
    paused: workflows.filter(w => w.status === 'paused').length,
    totalTriggers: workflows.reduce((sum, w) => sum + (w.triggerCount || 0), 0)
  }

  const triggerOptions = [
    { value: 'lead_added', label: 'New Lead Added' },
    { value: 'email_opened', label: 'Email Opened' },
    { value: 'form_submitted', label: 'Form Submitted' },
    { value: 'deal_stage_changed', label: 'Deal Stage Changed' },
    { value: 'contact_tagged', label: 'Contact Tagged' },
    { value: 'time_based', label: 'Time-Based' },
    { value: 'webhook', label: 'Webhook Received' }
  ]

  const actionOptions = [
    { value: 'send_email', label: 'Send Email' },
    { value: 'launch_campaign', label: '🚀 Launch Campaign' },
    { value: 'add_to_campaign', label: '📧 Add to Email Campaign' },
    { value: 'add_to_sequence', label: 'Add to Sequence' },
    { value: 'update_field', label: 'Update Field' },
    { value: 'create_task', label: 'Create Task' },
    { value: 'add_tag', label: '🏷️ Add Tag' },
    { value: 'send_sms', label: 'Send SMS' },
    { value: 'create_deal', label: '💰 Create Deal' },
    { value: 'assign_to_user', label: 'Assign to User' },
    { value: 'webhook', label: 'Send Webhook' }
  ]

  // AI Workflow Suggestions
  const aiWorkflowTemplates = [
    {
      name: 'Welcome New Leads',
      trigger: 'lead_added',
      action: 'launch_campaign',
      description: 'Automatically send welcome email campaign to new leads',
      tags: ['new_lead'],
      delay: 0
    },
    {
      name: 'VIP Customer Outreach',
      trigger: 'contact_tagged',
      action: 'launch_campaign',
      description: 'Send exclusive offers to VIP-tagged customers',
      tags: ['VIP'],
      delay: 60
    },
    {
      name: 'Re-engage Cold Leads',
      trigger: 'time_based',
      action: 'add_to_campaign',
      description: 'Target leads who haven\'t been contacted in 30 days',
      tags: ['cold_lead'],
      delay: 43200 // 30 days in minutes
    },
    {
      name: 'Enterprise Lead Follow-up',
      trigger: 'form_submitted',
      action: 'launch_campaign',
      description: 'Immediate follow-up for enterprise demo requests',
      tags: ['enterprise'],
      delay: 15
    }
  ]

  // AI Assistant Functions
  const generateAIWorkflow = async (prompt) => {
    if (!prompt.trim()) {
      toast.error('Please enter a workflow description')
      return
    }

    // Show loading state
    toast.loading('🤖 AI is generating your workflow...', { id: 'ai-workflow' })

    try {
      let workflowData = null

      if (!genieCreateWorkflow) {
        // Fallback to template matching
        const matchedTemplate = aiWorkflowTemplates.find(template => 
          prompt.toLowerCase().includes(template.name.toLowerCase().split(' ')[0]) ||
          prompt.toLowerCase().includes(template.trigger.replace('_', ' '))
        )
        
        if (matchedTemplate) {
          workflowData = {
            name: matchedTemplate.name,
            trigger: matchedTemplate.trigger,
            action: matchedTemplate.action,
            description: matchedTemplate.description,
            targetTags: matchedTemplate.tags,
            delay: matchedTemplate.delay,
            conditions: [],
            status: 'active',
            campaignId: '',
            aiOptimized: true
          }
        }
      } else {
        // Use Genie AI if available
        const suggestion = await genieCreateWorkflow({
          prompt,
          context: 'workflow-automation',
          availableTriggers: triggerOptions,
          availableActions: actionOptions,
          availableTags: availableTags
        })
        
        if (suggestion) {
          workflowData = {
            ...suggestion,
            aiOptimized: true,
            conditions: [],
            status: 'active',
            campaignId: ''
          }
        }
      }

      // If no workflow generated, create a basic one
      if (!workflowData) {
        workflowData = {
          name: `AI Workflow: ${prompt.slice(0, 30)}...`,
          trigger: 'lead_added',
          action: 'launch_campaign',
          description: `AI-generated workflow based on: "${prompt}"`,
          targetTags: ['all'],
          delay: 0,
          conditions: [],
          status: 'active',
          campaignId: '',
          aiOptimized: true
        }
      }

      // Auto-save the AI-generated workflow
      const workflow = {
        id: `workflow_${Date.now()}`,
        ...workflowData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const updatedWorkflows = [...workflows, workflow]
      await saveWorkflows(updatedWorkflows)
      
      // Update state to show the new workflow
      setWorkflows(updatedWorkflows)
      
      // Close the AI assistant and reset form
      setShowAIAssistant(false)
      setAiSuggestion('')
      
      // Success feedback with next steps
      toast.success(
        `✨ AI Workflow "${workflow.name}" created and saved! 
        Check the workflow list below to edit or activate.`, 
        { 
          id: 'ai-workflow',
          duration: 5000 
        }
      )

      // Optional: Show builder with the new workflow for immediate editing
      // setNewWorkflow(workflowData)
      // setShowBuilder(true)

    } catch (error) {
      console.error('Error generating AI workflow:', error)
      toast.error('AI assistant temporarily unavailable', { id: 'ai-workflow' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-genie-teal">Workflow Automation</h2>
        <button
          onClick={() => {
            if (showBuilder && editingWorkflow) {
              cancelEdit()
            } else {
              setShowBuilder(!showBuilder)
            }
          }}
          className="bg-genie-teal text-white px-6 py-3 rounded-lg hover:bg-genie-teal/80 transition-colors"
        >
          {showBuilder ? 'Cancel' : '+ Create Workflow'}
        </button>
        
        <button
          onClick={() => setShowAIAssistant(!showAIAssistant)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg flex items-center gap-2"
        >
          🤖 AI Assistant
        </button>
      </div>

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 mb-8 border border-purple-200">
          <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
            🤖 AI Workflow Assistant
          </h3>
          
          {aiSuggestion && (
            <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-4">
              <strong>AI Suggestion:</strong> {aiSuggestion}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Quick Prompts */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Quick AI Templates</h4>
              <div className="space-y-2">
                {aiWorkflowTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => generateAIWorkflow(template.name)}
                    className="w-full text-left bg-white border border-purple-200 rounded-lg p-3 hover:bg-purple-50 transition-colors"
                  >
                    <div className="font-medium text-purple-800">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Custom AI Prompt */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Custom Workflow Request</h4>
              <div className="space-y-3">
                <textarea
                  placeholder="Describe the workflow you want to create... 
                  
Examples:
• 'Send welcome emails to new VIP customers'
• 'Follow up with leads who visited pricing page'
• 'Auto-tag enterprise prospects'"
                  className="w-full border border-purple-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="4"
                  value={aiSuggestion.includes('AI generated') ? '' : aiSuggestion}
                  onChange={(e) => setAiSuggestion(e.target.value)}
                />
                <button
                  onClick={() => generateAIWorkflow(aiSuggestion)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full"
                >
                  🚀 Create & Save AI Workflow
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  ℹ️ Your new workflow will appear in the "Existing Workflows" list below
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
          <span role="img" aria-label="automation" className="text-genie-teal text-3xl mb-2">🤖</span>
          <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
          <div className="text-gray-500">Active Workflows</div>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
          <span role="img" aria-label="total" className="text-genie-teal text-3xl mb-2">📝</span>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-gray-500">Total Workflows</div>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
          <span role="img" aria-label="triggers" className="text-genie-teal text-3xl mb-2">⚡</span>
          <div className="text-2xl font-bold text-gray-900">{stats.totalTriggers}</div>
          <div className="text-gray-500">Total Triggers</div>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
          <span role="img" aria-label="efficiency" className="text-genie-teal text-3xl mb-2">⚙️</span>
          <div className="text-2xl font-bold text-gray-900">{stats.active > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%</div>
          <div className="text-gray-500">Active Rate</div>
        </div>
      </div>

      {/* Workflow Builder */}
      {showBuilder && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-genie-teal">
          <h3 className="text-xl font-semibold text-genie-teal mb-6">
            {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
          </h3>
          <form onSubmit={createWorkflow} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  placeholder="Enter workflow name"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delay (minutes)</label>
                <input
                  type="number"
                  value={newWorkflow.delay}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, delay: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trigger</label>
                <select
                  value={newWorkflow.trigger}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, trigger: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                  required
                >
                  <option value="">Select Trigger</option>
                  {triggerOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <select
                  value={newWorkflow.action}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, action: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                  required
                >
                  <option value="">Select Action</option>
                  {actionOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Campaign Integration Fields */}
            {(newWorkflow.action === 'launch_campaign' || newWorkflow.action === 'add_to_campaign') && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  🚀 Campaign Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Campaign</label>
                    <select
                      value={newWorkflow.campaignId}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, campaignId: e.target.value })}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose campaign...</option>
                      {availableCampaigns.map(campaign => (
                        <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Tags (Optional)</label>
                    <select
                      multiple
                      value={newWorkflow.targetTags}
                      onChange={(e) => setNewWorkflow({ 
                        ...newWorkflow, 
                        targetTags: Array.from(e.target.selectedOptions, option => option.value)
                      })}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      size="3"
                    >
                      {availableTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Hold Ctrl/Cmd to select multiple tags. Leave empty to target all contacts.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                placeholder="Describe what this workflow does..."
                rows="3"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-genie-teal text-white px-6 py-3 rounded-lg hover:bg-genie-teal/80 transition-colors"
              >
                {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
              </button>
              <button
                type="button"
                onClick={() => editingWorkflow ? cancelEdit() : setShowBuilder(false)}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Workflows */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-genie-teal">Active Workflows</h3>
          <div className="flex gap-2">
            <span className="text-sm text-gray-500">{workflows.length} workflows total</span>
          </div>
        </div>

        {workflows.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Workflows Yet</h3>
            <p className="text-gray-600 mb-6">Create your first workflow to automate your marketing processes</p>
            <button
              onClick={() => setShowBuilder(true)}
              className="bg-genie-teal text-white px-6 py-3 rounded-lg hover:bg-genie-teal/80 transition-colors"
            >
              Create Your First Workflow
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.map(workflow => {
              const triggerLabel = triggerOptions.find(t => t.value === workflow.trigger)?.label || workflow.trigger
              const actionLabel = actionOptions.find(a => a.value === workflow.action)?.label || workflow.action
              
              return (
                <div key={workflow.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{workflow.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          workflow.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {workflow.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Trigger:</span> {triggerLabel} → 
                        <span className="font-medium"> Action:</span> {actionLabel}
                        {workflow.delay > 0 && (
                          <span className="text-sm text-gray-500"> (after {workflow.delay} min)</span>
                        )}
                      </p>
                      {workflow.description && (
                        <p className="text-sm text-gray-500 mb-2">{workflow.description}</p>
                      )}
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Created: {new Date(workflow.createdAt).toLocaleDateString()}</span>
                        <span>Triggers: {workflow.triggerCount || 0}</span>
                        {workflow.lastTriggered && (
                          <span>Last triggered: {new Date(workflow.lastTriggered).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEditWorkflow(workflow)}
                        className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleWorkflowStatus(workflow.id)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          workflow.status === 'active'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {workflow.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => deleteWorkflow(workflow.id)}
                        className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkflowAutomation