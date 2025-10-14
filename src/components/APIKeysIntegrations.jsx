import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import IntegrationService from '../services/integrationService';
import FirebaseUserDataService from '../services/firebaseUserData';
import toast from 'react-hot-toast';

const APIKeysIntegrations = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  // Tab management
  const [activeTab, setActiveTab] = useState('ai-services');
  
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
  
  const [apiKeys, setApiKeys] = useState([]);
  const [loadingApiKeys, setLoadingApiKeys] = useState(true);
  const [renderKey, setRenderKey] = useState(0); // Force re-render trigger

  // Organize integrations by category
  const [aiServices, setAiServices] = useState([
    {
      id: 'openai',
      name: 'OpenAI GPT',
      type: 'AI Service',
      status: 'disconnected',
      icon: '🤖',
      description: 'GPT-4 for AI-powered email writing and lead research',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      type: 'AI Service',
      status: 'disconnected',
      icon: '🧠',
      description: 'Claude AI for advanced content generation and analysis',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      type: 'AI Service',
      status: 'disconnected',
      icon: '💎',
      description: 'Google\'s AI for multimodal content processing',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'perplexity',
      name: 'Perplexity AI',
      type: 'AI Service',
      status: 'disconnected',
      icon: '🔮',
      description: 'AI-powered research and fact-checking for lead intelligence',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek AI',
      type: 'AI Service',
      status: 'disconnected',
      icon: '🌊',
      description: 'Advanced AI reasoning and code generation for professional content',
      lastSync: 'Never',
      account: 'Not connected'
    }
  ]);

  const [emailIntegrations, setEmailIntegrations] = useState([
    {
      id: 'gmail',
      name: 'Gmail',
      type: 'Email',
      status: 'disconnected',
      icon: '📧',
      description: 'Send personalized emails and track responses',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'zoho-mail',
      name: 'Zoho Mail',
      type: 'Email',
      status: 'disconnected',
      icon: '📮',
      description: 'Professional email sending with Zoho Mail',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'outlook',
      name: 'Outlook/Office 365',
      type: 'Email',
      status: 'disconnected',
      icon: '📬',
      description: 'Microsoft Outlook integration for email campaigns',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      type: 'Email Marketing',
      status: 'disconnected',
      icon: '🐵',
      description: 'Email marketing automation and list management',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      type: 'Email Service',
      status: 'disconnected',
      icon: '📤',
      description: 'Reliable email delivery service for campaigns',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'hubspot-email',
      name: 'HubSpot Email',
      type: 'Email Marketing',
      status: 'disconnected',
      icon: '🏢',
      description: 'HubSpot email marketing and automation',
      lastSync: 'Never',
      account: 'Not connected'
    }
  ]);

  const [socialMediaIntegrations, setSocialMediaIntegrations] = useState([
    {
      id: 'linkedin-basic',
      name: 'LinkedIn Basic',
      type: 'Professional Network',
      status: 'disconnected',
      icon: '💼',
      description: 'Basic LinkedIn profile integration and connection requests',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'linkedin-sales',
      name: 'LinkedIn Sales Navigator',
      type: 'Professional Network',
      status: 'disconnected',
      icon: '🎯',
      description: 'Advanced LinkedIn prospecting and lead identification',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'twitter',
      name: 'Twitter/X API',
      type: 'Social Media',
      status: 'disconnected',
      icon: '🐦',
      description: 'Post content and engage with prospects on X/Twitter',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'facebook-business',
      name: 'Facebook Business',
      type: 'Social Media',
      status: 'disconnected',
      icon: '📘',
      description: 'Manage Facebook business pages and advertising',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'instagram-business',
      name: 'Instagram Business',
      type: 'Social Media',
      status: 'disconnected',
      icon: '📷',
      description: 'Instagram business account integration and content management',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'tiktok-business',
      name: 'TikTok for Business',
      type: 'Social Media',
      status: 'disconnected',
      icon: '🎵',
      description: 'TikTok business integration for video content and ads',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'youtube',
      name: 'YouTube Data API',
      type: 'Social Media',
      status: 'disconnected',
      icon: '📺',
      description: 'YouTube channel management and video analytics',
      lastSync: 'Never',
      account: 'Not connected'
    }
  ]);

  const [leadGenerationIntegrations, setLeadGenerationIntegrations] = useState([
    {
      id: 'hunter-io',
      name: 'Hunter.io Email Finding',
      type: 'Lead Generation',
      status: 'disconnected',
      icon: '🎯',
      description: 'Find and verify email addresses for prospects',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'apollo',
      name: 'Apollo.io',
      type: 'Lead Generation',
      status: 'disconnected',
      icon: '🚀',
      description: 'Sales intelligence and prospecting platform',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'zoominfo',
      name: 'ZoomInfo',
      type: 'Lead Generation',
      status: 'disconnected',
      icon: '🔍',
      description: 'B2B contact database and sales intelligence',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'clearbit',
      name: 'Clearbit',
      type: 'Lead Generation',
      status: 'disconnected',
      icon: '🏢',
      description: 'Company data enrichment and lead scoring',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      type: 'Automation',
      status: 'disconnected',
      icon: '⚡',
      description: 'Automate workflows between different apps and services',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'phantombuster',
      name: 'PhantomBuster',
      type: 'Lead Generation',
      status: 'disconnected',
      icon: '👻',
      description: 'Automated lead generation and social media scraping',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'linkedin-helper',
      name: 'LinkedIn Helper',
      type: 'Lead Generation',
      status: 'disconnected',
      icon: '🤝',
      description: 'Automated LinkedIn outreach and connection management',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      type: 'CRM Integration',
      status: 'disconnected',
      icon: '☁️',
      description: 'Sync leads and contacts with Salesforce CRM',
      lastSync: 'Never',
      account: 'Not connected'
    }
  ]);

  // States for forms and modals
  const [showAddKey, setShowAddKey] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [integrationConfig, setIntegrationConfig] = useState({});
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    service: '',
    key: ''
  });

  // Load API keys and check integration statuses
  useEffect(() => {
    if (tenant && user) {
      loadApiKeys();
      checkIntegrationStatuses();
    }
  }, [tenant, user]);

  const loadApiKeys = async () => {
    try {
      setLoadingApiKeys(true);
      const keys = await FirebaseUserDataService.getApiKeys(user.uid, tenant.id);
      setApiKeys(keys || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoadingApiKeys(false);
    }
  };

  const checkIntegrationStatuses = async () => {
    if (!tenant || !user) return;
    
    try {
      setLoadingStatuses(true);
      
      // Check all integration types
      const allIntegrations = [...aiServices, ...emailIntegrations, ...socialMediaIntegrations, ...leadGenerationIntegrations];
      
      for (const integration of allIntegrations) {
        try {
          const result = await IntegrationService.getConnectionStatus(integration.id, tenant.id);
          let isActuallyConnected = false;
          
          if (integration.id === 'gmail') {
            isActuallyConnected = result.data && result.data.email && (result.data.appPassword || result.data.password);
          } else {
            isActuallyConnected = result.data && (result.data.apiKey || result.data.accessToken) && result.data.status === 'connected';
          }
          
          if (isActuallyConnected) {
            // Update the appropriate state based on category
            updateIntegrationStatus(integration.id, 'connected', result.data);
          }
        } catch (error) {
          console.error(`Error checking ${integration.id} status:`, error);
        }
      }
    } catch (error) {
      console.error('Error checking integration statuses:', error);
    } finally {
      setLoadingStatuses(false);
    }
  };

  const updateIntegrationStatus = (integrationId, status, data) => {
    const updateFunction = (prevState) => 
      prevState.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              status, 
              account: data?.email || data?.username || 'Connected',
              lastSync: new Date().toLocaleString()
            }
          : integration
      );

    // Update appropriate state based on integration type
    setAiServices(updateFunction);
    setEmailIntegrations(updateFunction);
    setSocialMediaIntegrations(updateFunction);
    setLeadGenerationIntegrations(updateFunction);
  };

  const addApiKey = async (e) => {
    e.preventDefault();
    try {
      await FirebaseUserDataService.saveApiKey(user.uid, tenant.id, newApiKey);
      toast.success('API key added successfully');
      setNewApiKey({ name: '', service: '', key: '' });
      setShowAddKey(false);
      loadApiKeys();
    } catch (error) {
      console.error('Error adding API key:', error);
      toast.error('Failed to add API key');
    }
  };

  const deleteApiKey = async (keyId) => {
    try {
      await FirebaseUserDataService.deleteApiKey(user.uid, tenant.id, keyId);
      toast.success('API key deleted');
      loadApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const connectIntegration = async (integration) => {
    // Open configuration modal instead of trying to connect directly
    setSelectedIntegration(integration);
    setIntegrationConfig({});
    setShowConfigModal(true);
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await IntegrationService.connectService(selectedIntegration.id, {
        tenantId: tenant.id,
        userId: user.uid,
        integration: selectedIntegration,
        config: integrationConfig
      });

      if (result.success) {
        toast.success(`${selectedIntegration.name} connected successfully!`);
        
        // Update the integration status immediately in the UI
        updateIntegrationStatus(selectedIntegration.id, 'connected', {
          account: 'Connected',
          lastSync: new Date().toLocaleString()
        });
        
        setShowConfigModal(false);
        setSelectedIntegration(null);
        setIntegrationConfig({});
        
        // Force a re-render to update the UI
        setRenderKey(prev => prev + 1);
        
        // Check statuses again after a short delay to ensure Firebase data is updated
        setTimeout(() => {
          checkIntegrationStatuses();
        }, 1000);
      } else {
        toast.error(result.error || `Failed to connect ${selectedIntegration.name}`);
      }
    } catch (error) {
      console.error('Error connecting integration:', error);
      toast.error(`Error connecting ${selectedIntegration.name}`);
    }
  };

  const disconnectIntegration = async (integration) => {
    try {
      const result = await IntegrationService.disconnectService(integration.id, {
        tenantId: tenant.id,
        userId: user.uid
      });

      if (result.success) {
        toast.success(`${integration.name} disconnected`);
        updateIntegrationStatus(integration.id, 'disconnected', {});
      } else {
        toast.error(result.error || `Failed to disconnect ${integration.name}`);
      }
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast.error(`Error disconnecting ${integration.name}`);
    }
  };

  const tabs = [
    { id: 'ai-services', label: 'AI Services', icon: '🤖', count: aiServices.filter(s => s.status === 'connected').length },
    { id: 'email-integrations', label: 'Email Integrations', icon: '📧', count: emailIntegrations.filter(s => s.status === 'connected').length },
    { id: 'social-media', label: 'Social Media', icon: '📱', count: socialMediaIntegrations.filter(s => s.status === 'connected').length },
    { id: 'lead-generation', label: 'Lead Generation', icon: '🎯', count: leadGenerationIntegrations.filter(s => s.status === 'connected').length }
  ];

  const getCurrentIntegrations = () => {
    switch (activeTab) {
      case 'ai-services':
        return aiServices;
      case 'email-integrations':
        return emailIntegrations;
      case 'social-media':
        return socialMediaIntegrations;
      case 'lead-generation':
        return leadGenerationIntegrations;
      default:
        return [];
    }
  };

  const renderIntegrationCard = (integration) => (
    <div key={integration.id} className="bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{integration.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
            <p className="text-sm text-gray-500">{integration.type}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          integration.status === 'connected' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {integration.status === 'connected' ? '✓ Connected' : 'Not Connected'}
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4">{integration.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>Account: {integration.account}</span>
        <span>Last sync: {integration.lastSync}</span>
      </div>

      <div className="flex gap-2">
        {integration.status === 'connected' ? (
          <>
            <button
              onClick={() => disconnectIntegration(integration)}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Disconnect
            </button>
            <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
              Configure
            </button>
          </>
        ) : (
          <button
            onClick={() => connectIntegration(integration)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-sm"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );

  const renderConfigModal = () => {
    if (!showConfigModal || !selectedIntegration) return null;

    const getConfigFields = () => {
      switch (selectedIntegration.id) {
        case 'openai':
          return [
            { key: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-...' }
          ];
        case 'anthropic':
          return [
            { key: 'apiKey', label: 'Anthropic API Key', type: 'password', placeholder: 'sk-ant-...' }
          ];
        case 'gemini':
          return [
            { key: 'apiKey', label: 'Google AI API Key', type: 'password', placeholder: 'AI...' }
          ];
        case 'perplexity':
          return [
            { key: 'apiKey', label: 'Perplexity API Key', type: 'password', placeholder: 'pplx-...' }
          ];
        case 'deepseek':
          return [
            { key: 'apiKey', label: 'DeepSeek API Key', type: 'password', placeholder: 'sk-...' }
          ];
        case 'gmail':
          return [
            { key: 'email', label: 'Gmail Address', type: 'email', placeholder: 'your.email@gmail.com' },
            { key: 'appPassword', label: 'App Password', type: 'password', placeholder: 'Generated app password' }
          ];
        case 'zoho-mail':
          return [
            { key: 'email', label: 'Zoho Email', type: 'email', placeholder: 'your.email@zoho.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: 'Your Zoho password' }
          ];
        case 'outlook':
          return [
            { key: 'email', label: 'Outlook Email', type: 'email', placeholder: 'your.email@outlook.com' },
            { key: 'appPassword', label: 'App Password', type: 'password', placeholder: 'Generated app password' }
          ];
        case 'hunter-io':
          return [
            { key: 'apiKey', label: 'Hunter.io API Key', type: 'password', placeholder: 'Your Hunter.io API key' }
          ];
        case 'apollo':
          return [
            { key: 'apiKey', label: 'Apollo.io API Key', type: 'password', placeholder: 'Your Apollo.io API key' }
          ];
        case 'zoominfo':
          return [
            { key: 'username', label: 'ZoomInfo Username', type: 'text', placeholder: 'Your username' },
            { key: 'password', label: 'ZoomInfo Password', type: 'password', placeholder: 'Your password' }
          ];
        case 'clearbit':
          return [
            { key: 'apiKey', label: 'Clearbit API Key', type: 'password', placeholder: 'sk_...' }
          ];
        default:
          return [
            { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your API key' }
          ];
      }
    };

    const configFields = getConfigFields();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{selectedIntegration.icon}</span>
            <div>
              <h3 className="text-xl font-semibold">Configure {selectedIntegration.name}</h3>
              <p className="text-sm text-gray-600">{selectedIntegration.description}</p>
            </div>
          </div>

          <form onSubmit={handleConfigSubmit}>
            <div className="space-y-4 mb-6">
              {configFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={integrationConfig[field.key] || ''}
                    onChange={(e) => setIntegrationConfig(prev => ({ 
                      ...prev, 
                      [field.key]: e.target.value 
                    }))}
                    placeholder={field.placeholder}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                Connect
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfigModal(false);
                  setSelectedIntegration(null);
                  setIntegrationConfig({});
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderApiKeysSection = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Custom API Keys</h3>
        <button
          onClick={() => setShowAddKey(!showAddKey)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-sm"
        >
          + Add Key
        </button>
      </div>

      {showAddKey && (
        <form onSubmit={addApiKey} className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-4">Add New API Key</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
              <input
                type="text"
                value={newApiKey.name}
                onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Production OpenAI Key"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <select
                value={newApiKey.service}
                onChange={(e) => setNewApiKey(prev => ({ ...prev, service: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a service</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="gemini">Google Gemini</option>
                <option value="hunter">Hunter.io</option>
                <option value="apollo">Apollo.io</option>
                <option value="clearbit">Clearbit</option>
                <option value="zoominfo">ZoomInfo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                value={newApiKey.key}
                onChange={(e) => setNewApiKey(prev => ({ ...prev, key: e.target.value }))}
                placeholder="sk-..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Key
              </button>
              <button
                type="button"
                onClick={() => setShowAddKey(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loadingApiKeys ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading API keys...</p>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">🔑</span>
            <p className="text-gray-500">No API keys added yet</p>
            <p className="text-sm text-gray-400">Add your first API key to get started</p>
          </div>
        ) : (
          apiKeys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{key.name}</h4>
                <p className="text-sm text-gray-500">{key.service}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
                <button
                  onClick={() => deleteApiKey(key.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            API Keys & Integrations
          </h1>
          <p className="text-gray-600 text-lg">Manage your AI services and third-party integrations</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {tabs.map((tab) => (
            <div key={tab.id} className="bg-white rounded-xl p-6 shadow-lg border">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{tab.icon}</span>
                <h3 className="text-lg font-semibold">{tab.label}</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">{tab.count}</div>
              <div className="text-sm text-gray-500">Connected</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loadingStatuses ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Checking integration statuses...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCurrentIntegrations().map(renderIntegrationCard)}
              </div>
            )}
          </div>
        </div>

        {/* Advanced API Keys Management (Optional) */}
        <div className="mt-8">
          <details className="bg-white rounded-xl shadow-lg border">
            <summary className="p-6 cursor-pointer font-semibold text-gray-700 hover:text-blue-600 transition-colors">
              🔧 Advanced API Keys Management (Optional)
            </summary>
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-600 mb-4">
                Most integrations handle their API keys automatically. Use this section only if you need to manage additional custom keys.
              </p>
              {renderApiKeysSection()}
            </div>
          </details>
        </div>

        {/* Configuration Modal */}
        {renderConfigModal()}
      </div>
    </div>
  );
};

export default APIKeysIntegrations;