import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Play, 
  Pause, 
  Save, 
  Eye, 
  Settings,
  Mail,
  MessageSquare,
  Share2,
  Users,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  ArrowDown,
  ArrowRight,
  Trash2,
  Copy
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useGenie } from '../contexts/GenieContext'
import { useCampaignHealth } from '../features/self-healing/useCampaignHealth'
import GenieConsole from '../components/ai/GenieConsole'
import IntegratedMarketingService from '../services/integratedMarketing'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const CAMPAIGN_BLOCKS = {
  TRIGGER: {
    type: 'trigger',
    icon: Play,
    name: 'Trigger',
    color: 'blue',
    description: 'Start your campaign'
  },
  EMAIL: {
    type: 'email',
    icon: Mail,
    name: 'Email',
    color: 'green',
    description: 'Send personalized emails'
  },
  SMS: {
    type: 'sms',
    icon: MessageSquare,
    name: 'SMS',
    color: 'purple',
    description: 'Send text messages'
  },
  SOCIAL: {
    type: 'social',
    icon: Share2,
    name: 'Social Post',
    color: 'orange',
    description: 'Post to social media'
  },
  WAIT: {
    type: 'wait',
    icon: Clock,
    name: 'Wait',
    color: 'gray',
    description: 'Add delays between actions'
  },
  CONDITION: {
    type: 'condition',
    icon: Target,
    name: 'Condition',
    color: 'teal',
    description: 'Branch based on criteria'
  },
  SEGMENT: {
    type: 'segment',
    icon: Users,
    name: 'Segment',
    color: 'indigo',
    description: 'Filter your audience'
  }
}

export default function CampaignBuilder() {
  const { createCampaign, analyzeCampaign } = useGenie()
  const { user } = useAuth()
  const [campaignBlocks, setCampaignBlocks] = useState([
    {
      id: 'trigger-1',
      type: 'trigger',
      name: 'Campaign Start',
      config: { triggerType: 'manual' },
      position: { x: 0, y: 0 }
    }
  ])
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [campaignName, setCampaignName] = useState('New Campaign')
  const [campaignStatus, setCampaignStatus] = useState('draft')
  const [showGenieConsole, setShowGenieConsole] = useState(false)
  const [healthScore, setHealthScore] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  
  // CRM Integration States
  const [crmContacts, setCrmContacts] = useState([])
  const [selectedContacts, setSelectedContacts] = useState([])
  const [showContactSelector, setShowContactSelector] = useState(false)
  const [contactFilters, setContactFilters] = useState({
    tags: [],
    status: '',
    company: '',
    source: ''
  })
  const [availableTags, setAvailableTags] = useState([])
  const [showCampaignExecutor, setShowCampaignExecutor] = useState(false)

  // Campaign health monitoring
  const { healthData, isMonitoring, startMonitoring, stopMonitoring } = useCampaignHealth(
    campaignBlocks.length > 1 ? 'active-campaign' : null
  )

  useEffect(() => {
    if (healthData) {
      setHealthScore(healthData.overallHealth)
      setSuggestions(healthData.suggestions || [])
    }
  }, [healthData])

  // Load CRM contacts for campaign targeting
  useEffect(() => {
    const loadCRMContacts = async () => {
      if (!user) return
      
      try {
        const contacts = await IntegratedMarketingService.getContactsForCampaign(user.uid, contactFilters)
        setCrmContacts(contacts)
        
        // Extract unique tags for filtering
        const tags = [...new Set(contacts.flatMap(contact => contact.tags || []))]
        setAvailableTags(tags)
      } catch (error) {
        console.error('Error loading CRM contacts:', error)
        toast.error('Failed to load contacts')
      }
    }

    loadCRMContacts()
  }, [user, contactFilters])

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

      toast.success(`Campaign launched! Targeting ${selectedContacts.length} contacts`)
      setShowCampaignExecutor(false)
      setSelectedContacts([])
      
      // Update campaign status
      setCampaignStatus('running')
      
    } catch (error) {
      console.error('Error executing campaign:', error)
      toast.error('Failed to launch campaign')
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

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destIndex = result.destination.index

    if (result.source.droppableId === 'toolbox' && result.destination.droppableId === 'canvas') {
      // Adding new block from toolbox
      const blockType = Object.values(CAMPAIGN_BLOCKS)[sourceIndex]
      const newBlock = {
        id: `${blockType.type}-${Date.now()}`,
        type: blockType.type,
        name: blockType.name,
        config: {},
        position: { x: 0, y: destIndex * 100 }
      }
      
      const newBlocks = [...campaignBlocks]
      newBlocks.splice(destIndex, 0, newBlock)
      setCampaignBlocks(newBlocks)
    } else if (result.source.droppableId === 'canvas' && result.destination.droppableId === 'canvas') {
      // Reordering blocks in canvas
      const newBlocks = Array.from(campaignBlocks)
      const [reorderedItem] = newBlocks.splice(sourceIndex, 1)
      newBlocks.splice(destIndex, 0, reorderedItem)
      setCampaignBlocks(newBlocks)
    }
  }

  const removeBlock = (blockId) => {
    setCampaignBlocks(blocks => blocks.filter(block => block.id !== blockId))
  }

  const duplicateBlock = (block) => {
    const newBlock = {
      ...block,
      id: `${block.type}-${Date.now()}`,
      name: `${block.name} (Copy)`
    }
    setCampaignBlocks(blocks => [...blocks, newBlock])
  }

  const saveCampaign = async () => {
    try {
      const campaign = {
        name: campaignName,
        blocks: campaignBlocks,
        status: campaignStatus,
        created_at: new Date().toISOString()
      }
      
      await createCampaign(campaign)
      
      // Show success notification
      alert('Campaign saved successfully!')
    } catch (error) {
      console.error('Error saving campaign:', error)
      alert('Error saving campaign. Please try again.')
    }
  }

  const launchCampaign = async () => {
    if (campaignBlocks.length < 2) {
      alert('Add at least one action block to launch the campaign.')
      return
    }

    setCampaignStatus('active')
    startMonitoring()
    
    // Auto-analyze campaign for optimization suggestions
    try {
      const analysis = await analyzeCampaign({
        blocks: campaignBlocks,
        name: campaignName
      })
      setSuggestions(analysis.suggestions || [])
    } catch (error) {
      console.error('Error analyzing campaign:', error)
    }
  }

  const pauseCampaign = () => {
    setCampaignStatus('paused')
    stopMonitoring()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none outline-none text-gray-900"
            />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              campaignStatus === 'active' ? 'bg-green-100 text-green-800' :
              campaignStatus === 'paused' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {campaignStatus}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Health Score */}
            {healthScore && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  healthScore >= 80 ? 'bg-green-500' :
                  healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">{healthScore}% Health</span>
              </div>
            )}

            <button
              onClick={() => setShowGenieConsole(!showGenieConsole)}
              className="btn-secondary flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={saveCampaign}
                className="btn-secondary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>

              {campaignStatus === 'active' ? (
                <button
                  onClick={pauseCampaign}
                  className="btn-orange flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              ) : (
                <>
                  <button
                    onClick={launchCampaign}
                    className="btn-teal flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Launch
                  </button>
                  <button
                    onClick={() => setShowCampaignExecutor(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Launch with CRM Contacts
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Genie Console */}
      <AnimatePresence>
        {showGenieConsole && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 300 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-gray-200 p-6"
          >
            <GenieConsole 
              context="campaign-builder"
              campaignData={{ blocks: campaignBlocks, name: campaignName }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex">
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Toolbox */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Blocks</h3>
            
            <Droppable droppableId="toolbox" isDropDisabled={true}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {Object.values(CAMPAIGN_BLOCKS).map((block, index) => (
                    <Draggable 
                      key={block.type} 
                      draggableId={block.type} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-4 bg-white rounded-lg border border-gray-200 cursor-move hover:shadow-md transition-shadow ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-${block.color}-100 flex items-center justify-center`}>
                              <block.icon className={`w-5 h-5 text-${block.color}-600`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{block.name}</p>
                              <p className="text-sm text-gray-600">{block.description}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-8">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  AI Suggestions
                </h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <p className="text-sm text-teal-800">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Canvas */}
          <div className="flex-1 p-6">
            <Droppable droppableId="canvas">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`min-h-full rounded-lg border-2 border-dashed p-6 transition-colors ${
                    snapshot.isDraggingOver 
                      ? 'border-teal-400 bg-teal-50' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {campaignBlocks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Campaign</h3>
                      <p className="text-gray-600">Drag campaign blocks from the left to start building your automation.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaignBlocks.map((block, index) => (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                            >
                              <CampaignBlock
                                block={block}
                                isSelected={selectedBlock?.id === block.id}
                                onSelect={() => setSelectedBlock(block)}
                                onRemove={() => removeBlock(block.id)}
                                onDuplicate={() => duplicateBlock(block)}
                                dragHandleProps={provided.dragHandleProps}
                              />
                              
                              {/* Connection Arrow */}
                              {index < campaignBlocks.length - 1 && (
                                <div className="flex justify-center py-2">
                                  <ArrowDown className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Properties Panel */}
          {selectedBlock && (
            <div className="w-80 bg-white border-l border-gray-200 p-6">
              <BlockPropertiesPanel 
                block={selectedBlock}
                onUpdate={(updates) => {
                  setCampaignBlocks(blocks => 
                    blocks.map(b => b.id === selectedBlock.id ? { ...b, ...updates } : b)
                  )
                  setSelectedBlock({ ...selectedBlock, ...updates })
                }}
                onClose={() => setSelectedBlock(null)}
              />
            </div>
          )}
        </DragDropContext>
      </div>
    </div>
  )
}

// Campaign Block Component
function CampaignBlock({ block, isSelected, onSelect, onRemove, onDuplicate, dragHandleProps }) {
  const blockConfig = CAMPAIGN_BLOCKS[block.type.toUpperCase()]
  
  if (!blockConfig) return null

  return (
    <div
      className={`relative p-4 bg-white rounded-lg border-2 cursor-pointer transition-all ${
        isSelected 
          ? 'border-teal-400 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center cursor-move opacity-0 hover:opacity-100 transition-opacity"
      >
        <div className="w-4 h-4 grid grid-cols-2 gap-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-gray-400 rounded-full"></div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-lg bg-${blockConfig.color}-100 flex items-center justify-center`}>
          <blockConfig.icon className={`w-6 h-6 text-${blockConfig.color}-600`} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{block.name}</h4>
          <p className="text-sm text-gray-600">{blockConfig.description}</p>
        </div>
      </div>

      {/* Block Actions */}
      <div className="absolute top-2 left-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate()
          }}
          className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center"
        >
          <Copy className="w-3 h-3 text-gray-600" />
        </button>
        {block.type !== 'trigger' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="w-6 h-6 bg-red-100 hover:bg-red-200 rounded flex items-center justify-center"
          >
            <Trash2 className="w-3 h-3 text-red-600" />
          </button>
        )}
      </div>
    </div>
  )
}

// Block Properties Panel Component
function BlockPropertiesPanel({ block, onUpdate, onClose }) {
  const [config, setConfig] = useState(block.config || {})

  const updateConfig = (key, value) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onUpdate({ config: newConfig })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Block Settings</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Block Name
          </label>
          <input
            type="text"
            value={block.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Block-specific configuration */}
        {block.type === 'email' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template
              </label>
              <select
                value={config.template || ''}
                onChange={(e) => updateConfig('template', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select a template</option>
                <option value="welcome">Welcome Email</option>
                <option value="promotional">Promotional Email</option>
                <option value="newsletter">Newsletter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line
              </label>
              <input
                type="text"
                value={config.subject || ''}
                onChange={(e) => updateConfig('subject', e.target.value)}
                placeholder="Enter email subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </>
        )}

        {block.type === 'wait' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wait Duration
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={config.duration || 1}
                onChange={(e) => updateConfig('duration', parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <select
                value={config.unit || 'hours'}
                onChange={(e) => updateConfig('unit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>
        )}

        {block.type === 'condition' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition Type
            </label>
            <select
              value={config.condition || ''}
              onChange={(e) => updateConfig('condition', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select condition</option>
              <option value="email_opened">Email Opened</option>
              <option value="link_clicked">Link Clicked</option>
              <option value="form_submitted">Form Submitted</option>
              <option value="tag_added">Tag Added</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )

  // Add the CRM Contact Selection Modal here
  return (
    <>
      {/* All the existing JSX content above this point */}
      
      {/* CRM Contact Selection Modal */}
      <AnimatePresence>
        {showCampaignExecutor && (
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
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Launch Campaign: {campaignName}</h2>
                    <p className="text-blue-100 mt-1">Select contacts from your CRM to target</p>
                  </div>
                  <button
                    onClick={() => setShowCampaignExecutor(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Contact Selection and Execution Logic */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ready to Launch with CRM Contacts
                  </h3>
                  <p className="text-gray-600 mb-6">
                    This will connect your campaign to contacts from the CRM Pipeline section.
                    Currently showing {crmContacts.length} available contacts.
                  </p>
                  
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowCampaignExecutor(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeCampaignWithContacts}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Launch with All CRM Contacts ({crmContacts.length})
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
