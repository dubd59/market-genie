import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import IntegrationService from '../services/integrationService';
import FirebaseUserDataService from '../services/firebaseUserData';
import CalendarService from '../services/calendarService';
import toast from 'react-hot-toast';

const APIKeysIntegrations = ({ calendarConnections, onCalendarConnect, saveCalendarConnections, isDarkMode = false }) => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  // Tab management
  const [activeTab, setActiveTab] = useState('ai-services');
  
  // Helper function to update classes with dark mode support
  const getDarkModeClasses = (lightClasses, darkClasses = '') => {
    const dark = darkClasses || lightClasses.replace('bg-white', 'bg-gray-800').replace('text-gray-900', 'text-white').replace('text-gray-700', 'text-gray-300')
    return isDarkMode ? dark : lightClasses
  }
  
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
      id: 'prospeo-io',
      name: 'Prospeo.io',
      type: 'Lead Generation',
      status: 'disconnected',
      icon: '🥇',
      description: '75 FREE credits! Email + mobile finder with highest free tier',
      lastSync: 'Never',
      account: 'Not connected',
      freeCredits: '75 FREE credits',
      features: ['Email Finder', 'Mobile Finder', 'Chrome Extension', 'API Access', 'Bulk Processing']
    },
    {
      id: 'voila-norbert',
      name: 'VoilaNorbert',
      type: 'Lead Generation',
      status: 'disconnected',
      icon: '�',
      description: '50 FREE credits! 98% success rate with Google Sheets add-on',
      lastSync: 'Never',
      account: 'Not connected',
      freeCredits: '50 FREE credits',
      features: ['98% Success Rate', 'Chrome Extension', 'Google Sheets Add-on', 'API + Zapier']
    },
    {
      id: 'hunter-io',
      name: 'Hunter.io',
      type: 'Lead Generation',
      status: 'disconnected',
      icon: '🎯',
      description: '50 FREE credits! Most reliable email finder, easy setup',
      lastSync: 'Never',
      account: 'Not connected',
      freeCredits: '50 FREE credits',
      features: ['98% Email Accuracy', 'Browser Extension', 'Domain Search', 'Email Verification']

    },
    {
      id: 'anymailfinder',
      name: 'AnymailFinder',
      type: 'Lead Generation',
      status: 'disconnected',
      icon: '�',
      description: '3-day FREE trial! Pay only for valid emails, credits roll over',
      lastSync: 'Never',
      account: 'Not connected',
      freeCredits: '3-day FREE trial',
    }
  ]);

  const [automationIntegrations, setAutomationIntegrations] = useState([
    {
      id: 'zapier',
      name: 'Zapier',
      type: 'Automation',
      status: 'disconnected',
      icon: '⚡',
      description: 'Automate workflows between lead generation tools and Market Genie',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      type: 'CRM Integration',
      status: 'disconnected',
      icon: '☁️',
      description: 'Enterprise CRM for large teams (optional)',
      lastSync: 'Never',
      account: 'Not connected'
    }
  ]);

  // Calendar Integrations
  const [calendarIntegrations, setCalendarIntegrations] = useState([
    {
      id: 'outlook-calendar',
      name: 'Outlook Calendar',
      type: 'Calendar',
      status: 'disconnected',
      icon: '📅',
      description: 'Microsoft Outlook calendar integration for appointment scheduling',
      lastSync: 'Never',
      account: 'Not connected',
      requiresOAuth: true,
      authUrl: '/auth/microsoft'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      type: 'Calendar',
      status: 'disconnected',
      icon: '📆',
      description: 'Google Calendar integration for appointment scheduling',
      lastSync: 'Never',
      account: 'Not connected',
      requiresOAuth: true,
      authUrl: '/auth/google'
    },
    {
      id: 'calendly',
      name: 'Calendly',
      type: 'Scheduling',
      status: 'disconnected',
      icon: '🗓️',
      description: 'Calendly integration for automated scheduling links',
      lastSync: 'Never',
      account: 'Not connected',
      requiresOAuth: true,
      authUrl: '/auth/calendly'
    }
  ]);

  // Sync calendar integrations with parent state
  useEffect(() => {
    if (calendarConnections) {
      setCalendarIntegrations(prev => prev.map(integration => {
        if (integration.id === 'outlook-calendar') {
          return {
            ...integration,
            status: calendarConnections.outlook ? 'connected' : 'disconnected',
            account: calendarConnections.outlook ? 'outlook.user@example.com' : 'Not connected',
            lastSync: calendarConnections.outlook ? new Date().toLocaleString() : 'Never'
          };
        }
        if (integration.id === 'google-calendar') {
          const googleEmail = localStorage.getItem('google_user_email') || 'google.user@example.com';
          return {
            ...integration,
            status: calendarConnections.google ? 'connected' : 'disconnected',
            account: calendarConnections.google ? googleEmail : 'Not connected',
            lastSync: calendarConnections.google ? new Date().toLocaleString() : 'Never'
          };
        }
        return integration;
      }));
    }
  }, [calendarConnections]);

  // States for forms and modals
  const [showAddKey, setShowAddKey] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showGmailChoiceModal, setShowGmailChoiceModal] = useState(false);
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
      const keys = await FirebaseUserDataService.getAPIKeys(user.uid);
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
      const allIntegrations = [...aiServices, ...emailIntegrations, ...socialMediaIntegrations, ...leadGenerationIntegrations, ...calendarIntegrations];
      
      for (const integration of allIntegrations) {
        try {
          const result = await IntegrationService.getConnectionStatus(integration.id, tenant.id);
          let isActuallyConnected = false;
          
          if (integration.id === 'gmail') {
            // Gmail can be connected via OAuth (accessToken) OR SMTP (appPassword)
            const hasOAuth = result.data && result.data.accessToken && result.data.refreshToken;
            const hasSMTP = result.data && result.data.email && (result.data.appPassword || result.data.password);
            isActuallyConnected = hasOAuth || (hasSMTP && result.data.status === 'connected');
          } else if (integration.id === 'outlook') {
            isActuallyConnected = result.data && result.data.email && (result.data.appPassword || result.data.password) && result.data.status === 'connected';
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
    setCalendarIntegrations(updateFunction);
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

  const handleCalendarConnection = async (integration) => {
    try {
      console.log('🔗 APIKeysIntegrations: Starting calendar connection for:', integration.name);
      console.log('🔗 onCalendarConnect available?', !!onCalendarConnect);
      
      if (integration.id === 'outlook-calendar') {
        const loadingToast = toast.loading('Connecting to Microsoft Outlook...');
        
        let result = await CalendarService.initiateMicrosoftAuth();
        console.log('🔗 Calendar service result:', result);
        
        // If popup was blocked or OAuth not set up, show manual dialog
        if (result && result.showFallback) {
          toast.dismiss(loadingToast);
          const fallbackToast = toast.loading('Opening connection dialog...');
          result = await CalendarService.showManualConnectionDialog();
          toast.dismiss(fallbackToast);
        } else {
          toast.dismiss(loadingToast);
        }
        
        if (result && result.success) {
          if (result.cancelled) {
            toast('Connection cancelled');
            return;
          }
          
          toast.success(result.message || 'Outlook Calendar connected successfully!');
          
          // Use parent component's connection handler if available
          if (onCalendarConnect) {
            console.log('🔗 Calling parent onCalendarConnect with "outlook"');
            await onCalendarConnect('outlook');
          } else {
            console.log('🔗 No parent handler, using local update');
            // Fallback to local update
            updateIntegrationStatus('outlook-calendar', 'connected', {
              email: result.email || 'outlook.user@example.com',
              lastSync: new Date().toLocaleString()
            });
          }
        } else {
          console.log('🔗 Calendar connection failed:', result);
          toast.error(result?.error || 'Failed to connect Outlook Calendar');
        }
      } else if (integration.id === 'google-calendar') {
        const loadingToast = toast.loading('Connecting to Google Calendar...');
        
        let result = await CalendarService.showGoogleCalendarConnectionDialog();
        console.log('🔗 Google Calendar service result:', result);
        
        if (result && result.success) {
          if (result.cancelled) {
            toast('Connection cancelled');
            return;
          }
          
          toast.success(result.message || 'Google Calendar connected successfully!');
          
          // Use parent component's connection handler if available
          if (onCalendarConnect) {
            console.log('🔗 Calling parent onCalendarConnect with "google"');
            await onCalendarConnect('google');
          } else {
            console.log('🔗 No parent handler, using local update');
            // Fallback to local update
            updateIntegrationStatus('google-calendar', 'connected', {
              email: result.email || 'google.user@example.com',
              lastSync: new Date().toLocaleString()
            });
          }
        } else {
          console.log('🔗 Google Calendar connection failed or cancelled:', result);
          if (!result?.cancelled) {
            toast.error(result?.error || 'Failed to connect Google Calendar');
          }
        }
        
        toast.dismiss(loadingToast);
      } else if (integration.id === 'calendly') {
        toast('Calendly integration coming soon!', { icon: 'ℹ️' });
      }
    } catch (error) {
      toast.error(`Failed to connect ${integration.name}: ${error.message}`);
      console.error('Calendar connection error:', error);
    }
  };

  // Handle Gmail OAuth connection
  const handleGmailOAuth = async () => {
    try {
      console.log('🔗 Starting Gmail OAuth flow...');
      toast.loading('Connecting to Google...', { id: 'gmail-oauth' });
      
      const CLIENT_ID = '1023666208479-besa8q2moobncp0ih4njtop8a95htop9.apps.googleusercontent.com';
      const REDIRECT_URI = window.location.origin + '/oauth/gmail/callback';
      const SCOPES = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/userinfo.email'
      ].join(' ');
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(SCOPES)}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${tenant.id}`;
      
      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        authUrl,
        'Gmail OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Listen for OAuth completion message from popup
      const handleMessage = (event) => {
        if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
          console.log('✅ Gmail OAuth successful');
          toast.dismiss('gmail-oauth');
          toast.success('Gmail connected successfully!');
          
          // Update integration status
          updateIntegrationStatus('gmail', 'connected', {
            email: event.data.tokens?.email || 'Connected via OAuth',
            lastSync: new Date().toLocaleString()
          });
          
          // Refresh statuses
          setTimeout(() => checkIntegrationStatuses(), 1000);
          
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
          console.error('❌ Gmail OAuth failed:', event.data.error);
          toast.dismiss('gmail-oauth');
          toast.error('Gmail connection failed: ' + event.data.error);
          window.removeEventListener('message', handleMessage);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Check if popup was blocked
      if (!popup || popup.closed) {
        toast.dismiss('gmail-oauth');
        toast.error('Popup blocked! Please allow popups for this site.');
        window.removeEventListener('message', handleMessage);
      }
      
    } catch (error) {
      console.error('Gmail OAuth error:', error);
      toast.dismiss('gmail-oauth');
      toast.error('Failed to start Gmail connection: ' + error.message);
    }
  };

  const connectIntegration = async (integration) => {
    // Handle calendar integrations separately
    if (integration.type === 'Calendar' || integration.type === 'Scheduling') {
      return handleCalendarConnection(integration);
    }
    
    // Handle Gmail with OAuth option
    if (integration.id === 'gmail') {
      // Show choice modal for OAuth vs SMTP
      setSelectedIntegration(integration);
      setShowGmailChoiceModal(true);
      return;
    }
    
    // Open configuration modal for other integrations
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

  const handleTestConnection = async () => {
    if (!selectedIntegration || !integrationConfig.apiKey) {
      toast.error('Please enter an API key first');
      return;
    }

    try {
      toast('Testing connection...', { icon: 'ℹ️' });
      
      // Test the connection using the integration service
      const result = await IntegrationService.testConnection(selectedIntegration.id, {
        tenantId: tenant.id,
        userId: user.uid,
        integration: selectedIntegration,
        config: integrationConfig
      });

      if (result.success) {
        toast.success(`${selectedIntegration.name} connection test successful!`);
      } else {
        toast.error(result.error || `Connection test failed for ${selectedIntegration.name}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error(`Error testing ${selectedIntegration.name} connection`);
    }
  };

  const disconnectIntegration = async (integration) => {
    try {
      // Handle calendar integrations specially
      if (integration.type === 'Calendar' || integration.type === 'Scheduling') {
        if (integration.id === 'outlook-calendar' && onCalendarConnect) {
          // Disconnect outlook by setting it to false
          const newConnections = {
            google: false,
            outlook: false,
            custom: false
          };
          
          // Update parent state
          await saveCalendarConnections(newConnections);
          toast.success(`${integration.name} disconnected`);
          return;
        }
        
        if (integration.id === 'google-calendar' && onCalendarConnect) {
          // Clear Google calendar data
          localStorage.removeItem('google_calendar_token');
          localStorage.removeItem('google_connected');
          localStorage.removeItem('google_user_email');
          localStorage.removeItem('google_connection_method');
          
          // Disconnect google by setting it to false
          const newConnections = {
            google: false,
            outlook: false,
            custom: false
          };
          
          // Update parent state
          await saveCalendarConnections(newConnections);
          toast.success(`${integration.name} disconnected`);
          return;
        }
      }

      // Handle other integrations normally
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
    { id: 'lead-generation', label: 'Lead Generation', icon: '🎯', count: leadGenerationIntegrations.filter(s => s.status === 'connected').length },
    { id: 'calendar-integrations', label: 'Calendar & Scheduling', icon: '📅', count: calendarIntegrations.filter(s => s.status === 'connected').length }
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
      case 'calendar-integrations':
        return calendarIntegrations;
      default:
        return [];
    }
  };

  const renderIntegrationCard = (integration) => (
    <div key={integration.id} className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border'} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{integration.icon}</span>
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>{integration.name}</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{integration.type}</p>
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

      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>{integration.description}</p>

      <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
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
            <button 
              onClick={() => connectIntegration(integration)}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
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
        case 'prospeo-io':
          return [
            { key: 'apiKey', label: 'Prospeo.io API Key', type: 'password', placeholder: 'Your Prospeo.io API key (75 FREE credits)' }
          ];
        case 'voila-norbert':
          return [
            { key: 'apiKey', label: 'Voila Norbert API Key', type: 'password', placeholder: 'Your Voila Norbert API key' }
          ];
        case 'rocketreach':
          return [
            { key: 'apiKey', label: 'RocketReach API Key', type: 'password', placeholder: 'Your RocketReach API key' }
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
        case 'sendgrid':
          return [
            { key: 'apiKey', label: 'SendGrid API Key', type: 'password', placeholder: 'SG.xxxxxx...' }
          ];
        case 'mailgun':
          return [
            { key: 'apiKey', label: 'Mailgun API Key', type: 'password', placeholder: 'key-xxxxxx...' },
            { key: 'domain', label: 'Mailgun Domain', type: 'text', placeholder: 'mg.yourdomain.com' }
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
        <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} rounded-xl p-6 max-w-md w-full m-4`}>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{selectedIntegration.icon}</span>
            <div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>Configure {selectedIntegration.name}</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedIntegration.description}</p>
            </div>
          </div>

          <form onSubmit={handleConfigSubmit}>
            <div className="space-y-4 mb-6">
              {configFields.map((field) => (
                <div key={field.key}>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
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
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                disabled={!integrationConfig.apiKey}
              >
                Test Connection
              </button>
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
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            API Keys & Integrations
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage your AI services and third-party integrations</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {tabs.map((tab) => (
            <div key={tab.id} className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl p-6 shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{tab.icon}</span>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tab.label}</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">{tab.count}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Connected</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow-lg mb-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:border-gray-500' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
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
            {/* Connected Account Status Banner - Show for Email tab when Gmail is connected */}
            {activeTab === 'email-integrations' && emailIntegrations.find(e => e.id === 'gmail' && e.status === 'connected') && (
              <div className={`mb-6 p-4 rounded-xl border-2 ${isDarkMode ? 'bg-green-900/30 border-green-500' : 'bg-green-50 border-green-400'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>
                      📧 Email Sending Account Connected
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                      <span className="font-semibold">Active Account: </span>
                      <span className="font-mono bg-green-200 text-green-800 px-2 py-0.5 rounded">
                        {emailIntegrations.find(e => e.id === 'gmail')?.account || 'Connected'}
                      </span>
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-green-400/70' : 'text-green-600'}`}>
                      All campaign emails will be sent from this Google Workspace account
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500 text-white text-sm font-medium">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {loadingStatuses ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Checking integration statuses...</p>
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
          <details className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border'} rounded-xl shadow-lg`}>
            <summary className={`p-6 cursor-pointer font-semibold ${isDarkMode ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-blue-600'} transition-colors`}>
              🔧 Advanced API Keys Management (Optional)
            </summary>
            <div className="px-6 pb-6">
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Most integrations handle their API keys automatically. Use this section only if you need to manage additional custom keys.
              </p>
              {renderApiKeysSection()}
            </div>
          </details>
        </div>

        {/* Gmail Connection Choice Modal */}
        {showGmailChoiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl p-6 max-w-lg w-full m-4 shadow-2xl`}>
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">📧</span>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Connect Gmail / Google Workspace
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Choose how you want to connect your email account
                </p>
              </div>

              <div className="space-y-4">
                {/* OAuth Option - Recommended */}
                <button
                  onClick={() => {
                    setShowGmailChoiceModal(false);
                    handleGmailOAuth();
                  }}
                  className="w-full p-4 rounded-xl border-2 border-green-500 bg-green-50 hover:bg-green-100 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl">
                      🔐
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-green-800 text-lg">Connect with Google</h4>
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">Recommended</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        OAuth 2.0 • Higher limits (2,000/day) • Auto bounce detection
                      </p>
                    </div>
                    <span className="text-green-500 text-2xl group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>

                {/* SMTP Option */}
                <button
                  onClick={() => {
                    setShowGmailChoiceModal(false);
                    setIntegrationConfig({});
                    setShowConfigModal(true);
                  }}
                  className={`w-full p-4 rounded-xl border-2 ${isDarkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'} transition-all text-left group`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'} flex items-center justify-center text-white text-2xl`}>
                      🔑
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} text-lg`}>App Password (SMTP)</h4>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                        Manual setup • Lower limits (500/day) • Requires 2FA app password
                      </p>
                    </div>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-400'} text-2xl group-hover:translate-x-1 transition-transform`}>→</span>
                  </div>
                </button>
              </div>

              <button
                onClick={() => {
                  setShowGmailChoiceModal(false);
                  setSelectedIntegration(null);
                }}
                className={`w-full mt-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Configuration Modal */}
        {renderConfigModal()}
      </div>
    </div>
  );
};

export default APIKeysIntegrations;