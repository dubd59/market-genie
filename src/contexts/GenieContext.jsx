import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from './AuthContext'

const GenieContext = createContext({})

export const useGenie = () => {
  const context = useContext(GenieContext)
  if (!context) {
    throw new Error('useGenie must be used within a GenieProvider')
  }
  return context
}

const initialState = {
  wishes: [],
  activeWish: null,
  isProcessing: false,
  campaigns: [],
  contacts: [],
  analytics: {
    totalLeads: 0,
    conversionRate: 0,
    revenueGenerated: 0,
    activeCampaigns: 0,
  },
  settings: {
    aiEnabled: true,
    autoOptimization: true,
    emailNotifications: true,
  }
}

function genieReducer(state, action) {
  switch (action.type) {
    case 'SET_WISHES':
      return { ...state, wishes: action.payload }
    
    case 'ADD_WISH':
      return { ...state, wishes: [action.payload, ...state.wishes] }
    
    case 'SET_ACTIVE_WISH':
      return { ...state, activeWish: action.payload }
    
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload }
    
    case 'SET_CAMPAIGNS':
      return { ...state, campaigns: action.payload }
    
    case 'ADD_CAMPAIGN':
      return { ...state, campaigns: [action.payload, ...state.campaigns] }
    
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map(campaign =>
          campaign.id === action.payload.id ? action.payload : campaign
        )
      }
    
    case 'SET_CONTACTS':
      return { ...state, contacts: action.payload }
    
    case 'ADD_CONTACT':
      return { ...state, contacts: [action.payload, ...state.contacts] }
    
    case 'UPDATE_ANALYTICS':
      return { ...state, analytics: { ...state.analytics, ...action.payload } }
    
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    
    default:
      return state
  }
}

export function GenieProvider({ children }) {
  const [state, dispatch] = useReducer(genieReducer, initialState)
  const { user } = useAuth()

  // Load user data when authenticated
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      // Load wishes, campaigns, contacts, etc.
      // This would integrate with your Supabase functions
      console.log('Loading user data...')
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const grantWish = async (wishText) => {
    dispatch({ type: 'SET_PROCESSING', payload: true })
    
    try {
      // Create new wish
      const newWish = {
        id: Date.now(), // In real app, this would come from Supabase
        text: wishText,
        status: 'processing',
        createdAt: new Date().toISOString(),
        userId: user.id,
      }
      
      dispatch({ type: 'ADD_WISH', payload: newWish })
      dispatch({ type: 'SET_ACTIVE_WISH', payload: newWish })
      
      // Here you would integrate with your AI service
      // For now, simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const fulfilledWish = {
        ...newWish,
        status: 'fulfilled',
        result: `Wish "${wishText}" has been granted! Your marketing strategy has been optimized.`,
        suggestions: [
          'Create a targeted email campaign',
          'Set up lead scoring automation',
          'Optimize your landing pages'
        ]
      }
      
      dispatch({ type: 'SET_ACTIVE_WISH', payload: fulfilledWish })
      
      return fulfilledWish
    } catch (error) {
      console.error('Error granting wish:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false })
    }
  }

  const createCampaign = async (campaignData) => {
    try {
      const newCampaign = {
        id: Date.now(),
        ...campaignData,
        createdAt: new Date().toISOString(),
        userId: user.id,
        status: 'draft'
      }
      
      dispatch({ type: 'ADD_CAMPAIGN', payload: newCampaign })
      return newCampaign
    } catch (error) {
      console.error('Error creating campaign:', error)
      throw error
    }
  }

  const createWorkflow = async (workflowData) => {
    try {
      // AI-powered workflow generation
      const { prompt, context, availableTriggers, availableActions, availableTags } = workflowData
      
      // Template-based AI suggestions based on prompt keywords
      const aiTemplates = {
        'welcome': {
          name: 'Welcome New Leads',
          trigger: 'lead_added',
          action: 'launch_campaign',
          description: 'Automatically send welcome email campaign to new leads',
          targetTags: ['new_lead'],
          delay: 0
        },
        'vip': {
          name: 'VIP Customer Outreach',
          trigger: 'contact_tagged',
          action: 'launch_campaign',
          description: 'Send exclusive offers to VIP-tagged customers',
          targetTags: ['VIP'],
          delay: 60
        },
        'follow': {
          name: 'Lead Follow-up',
          trigger: 'time_based',
          action: 'add_to_campaign',
          description: 'Follow up with leads after specified time',
          targetTags: ['prospect'],
          delay: 1440 // 24 hours
        },
        'enterprise': {
          name: 'Enterprise Lead Response',
          trigger: 'form_submitted',
          action: 'launch_campaign',
          description: 'Immediate response for enterprise inquiries',
          targetTags: ['enterprise'],
          delay: 15
        }
      }
      
      // Find matching template based on prompt
      const promptLower = prompt.toLowerCase()
      let matchedWorkflow = null
      
      for (const [key, template] of Object.entries(aiTemplates)) {
        if (promptLower.includes(key) || promptLower.includes(template.trigger.replace('_', ' '))) {
          matchedWorkflow = template
          break
        }
      }
      
      // If no template match, create a custom workflow
      if (!matchedWorkflow) {
        matchedWorkflow = {
          name: `Custom Workflow: ${prompt.slice(0, 30)}...`,
          trigger: 'lead_added',
          action: 'launch_campaign',
          description: `AI-generated workflow based on: "${prompt}"`,
          targetTags: ['all'],
          delay: 0
        }
      }
      
      return {
        ...matchedWorkflow,
        aiOptimized: true,
        conditions: [],
        status: 'active',
        campaignId: ''
      }
    } catch (error) {
      console.error('Error creating AI workflow:', error)
      throw error
    }
  }

  const updateAnalytics = (analytics) => {
    dispatch({ type: 'UPDATE_ANALYTICS', payload: analytics })
  }

  const updateSettings = (settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
  }

  const value = {
    ...state,
    grantWish,
    createCampaign,
    createWorkflow,
    updateAnalytics,
    updateSettings,
  }

  return (
    <GenieContext.Provider value={value}>
      {children}
    </GenieContext.Provider>
  )
}
