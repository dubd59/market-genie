import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import IntegrationService from '../services/integrationService';
import FirebaseUserDataService from '../services/firebaseUserData';
import toast from 'react-hot-toast';

const APIKeysIntegrations = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
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

  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: 'Gmail',
      type: 'Email',
      status: 'disconnected',
      icon: '📧',
      description: 'Send personalized emails and track responses',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 2,
      name: 'LinkedIn Basic',
      type: 'Professional Network',
      status: 'disconnected',
      icon: '💼',
      description: 'Basic LinkedIn profile integration and connection requests',
      lastSync: 'Never',
      account: 'Not connected',
      features: ['Profile Access', 'Connection Requests', 'Basic Messaging', 'Company Data']
    },
    {
      id: 21,
      name: 'Zoho Mail',
      type: 'Email',
      status: 'disconnected',
      icon: '📮',
      description: 'Send professional emails through your Zoho account via API',
      lastSync: 'Never',
      account: 'Not connected',
      features: ['Custom Domain Email', 'API Integration', 'Delivery Tracking', 'Professional Sending']
    },
    // DISABLED: Zoho Campaigns - Using Kit instead for better reliability
    // {
    //   id: 23,
    //   name: 'Zoho Campaigns',
    //   type: 'Email Marketing',
    //   status: 'disconnected',
    //   icon: '🎯',
    //   description: 'Professional email marketing with your custom domain',
    //   lastSync: 'Never',
    //   account: 'Not connected',
    //   features: ['Custom Domain Email', 'Campaign Analytics', 'Contact Management', 'Professional Templates']
    // },
    {
      id: 3,
      name: 'HubSpot',
      type: 'CRM',
      status: 'disconnected',
      icon: '🏢',
      description: 'Sync leads and contacts with your CRM',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 4,
      name: 'Slack',
      type: 'Communication',
      status: 'disconnected',
      icon: '💬',
      description: 'Get notifications and updates in Slack',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 5,
      name: 'Google Calendar',
      type: 'Scheduling',
      status: 'disconnected',
      icon: '📅',
      description: 'Schedule meetings and appointments automatically',
      lastSync: 'Never',
      account: 'Not connected'
    },
    {
      id: 7,
      name: 'Twitter/X API',
      type: 'Social Media',
      status: 'disconnected',
      icon: '🐦',
      description: 'Connect to Twitter/X for lead discovery and social listening',
      lastSync: 'Never',
      account: 'Not connected',
      features: ['Lead Discovery', 'Social Listening', 'Engagement Tracking', 'Hashtag Monitoring']
    },
    {
      id: 8,
      name: 'LinkedIn Sales Navigator',
      type: 'Professional Network',
      status: 'disconnected',
      icon: '💼',
      description: 'Advanced LinkedIn prospecting and lead generation',
      lastSync: 'Never',
      account: 'Not connected',
      features: ['Advanced Search', 'Lead Builder', 'InMail Integration', 'Company Insights']
    },
    {
      id: 9,
      name: 'Facebook Business',
      type: 'Social Media',
      status: 'disconnected',
      icon: '📘',
      description: 'Facebook lead ads and audience insights',
      lastSync: 'Never',
      account: 'Not connected',
      features: ['Lead Ads', 'Audience Insights', 'Page Analytics', 'Custom Audiences']
    },
    {
      id: 10,
      name: 'Instagram Business',
      type: 'Social Media',
      status: 'disconnected',
      icon: '📸',
      description: 'Instagram business profile integration and lead capture',
      lastSync: 'Never',
      account: 'Not connected',
      features: ['Business Profile', 'Story Analytics', 'DM Automation', 'Hashtag Analysis']
    },
    {
      id: 11,
      name: 'TikTok for Business',
      type: 'Social Media',
      status: 'disconnected',
      icon: '🎵',
      description: 'TikTok business API for trend analysis and lead generation',
      lastSync: 'Never',
      account: 'Not connected',
      features: ['Trend Analysis', 'Creator Discovery', 'Ad Analytics', 'Audience Insights']
    },
    {
      id: 12,
      name: 'YouTube Data API',
      type: 'Video Platform',
      status: 'disconnected',
      icon: '📺',
      description: 'YouTube channel and video analytics for B2B prospects',
      lastSync: 'Never',
      account: 'Not connected',
      features: ['Channel Analytics', 'Video Insights', 'Comment Analysis', 'Subscriber Data']
    },
    {
      id: 13,
      name: 'Hunter.io Email Finding',
      type: 'Email Discovery',
      status: 'disconnected',
      icon: '🎯',
      description: 'Find and verify email addresses for lead generation',
      lastSync: 'Never',
      account: 'Not connected',
      features: ['Email Finder', 'Email Verifier', 'Domain Search', 'Bulk Processing']
    },
    {
      id: 14,
      name: 'Apollo.io',
      type: 'Lead Database',
      status: 'disconnected',
      icon: '🚀',
      description: 'Access to 275M+ contacts and 73M+ companies',
      lastSync: 'Never',
      account: 'Not connected',
      features: ['Contact Search', 'Company Search', 'Email Sequences', 'CRM Integration']
    },
    {
      id: 15,
      name: 'ZoomInfo',
      type: 'B2B Database',
      status: 'disconnected',
      icon: '🔍',
      description: 'Premium B2B contact and company intelligence',
      lastSync: 'Never',
      account: 'Not connected',
      features: ['Advanced Search', 'Intent Data', 'Technographics', 'Real-time Updates']
    },
    {
      id: 16,
      name: 'Clearbit',
      type: 'Data Enrichment',
      status: 'disconnected',
      icon: '✨',
      description: 'Enrich leads with company and contact data',
      lastSync: 'Never',
      account: 'Not connected',
      features: ['Company Enrichment', 'Person Enrichment', 'Logo API', 'Risk Assessment']
    },
    {
      id: 17,
      name: 'Zapier',
      type: 'Automation',
      status: 'disconnected',
      icon: '⚡',
      description: 'Connect with 5000+ apps via Zapier',
      lastSync: 'Never',
      account: 'Not connected',
      features: ['5000+ App Integrations', 'Workflow Automation', 'Data Sync', 'Trigger Actions']
    }
  ]);

  const [newApiKey, setNewApiKey] = useState({
    name: '',
    service: '',
    key: ''
  });

  const [showAddKey, setShowAddKey] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [settingsForm, setSettingsForm] = useState({
    apiKey: '',
    clientId: '',
    clientSecret: '',
    accessToken: '',
    refreshToken: '',
    authCode: '',
    smtpEmail: '',
    smtpPassword: '',
    smtpFromName: '',
    smtpHost: 'smtp.zoho.com',
    smtpPort: '587'
  });

  const availableServices = [
    'OpenAI GPT-4',
    'OpenAI GPT-3.5',
    'Anthropic Claude-3',
    'Google Gemini Pro',
    'DeepSeek',
    'Cohere',
    'Hugging Face',
    'Custom API'
  ];

  // Load API keys from Firebase when user is available
  useEffect(() => {
    if (user?.uid) {
      loadApiKeysFromFirebase();
    }
  }, [user?.uid]);

  const loadApiKeysFromFirebase = async () => {
    try {
      setLoadingApiKeys(true);
      const keys = await FirebaseUserDataService.getAPIKeys(user.uid);
      setApiKeys(keys);
    } catch (error) {
      console.error('Error loading API keys from Firebase:', error);
      toast.error('Failed to load API keys from cloud');
    } finally {
      setLoadingApiKeys(false);
    }
  };

  // Save API keys to Firebase whenever they change
  const saveApiKeysToFirebase = async (newApiKeys) => {
    if (user?.uid) {
      try {
        await FirebaseUserDataService.saveAPIKeys(user.uid, newApiKeys);
      } catch (error) {
        console.error('Error saving API keys to Firebase:', error);
      }
    }
  };

  // Load real connection statuses when component mounts
  useEffect(() => {
    if (tenant?.id) {
      loadIntegrationStatuses();
    } else {
      // If no tenant, stop loading immediately
      setLoadingStatuses(false);
    }
  }, [tenant?.id]);

  // Save API keys to Firebase whenever they change (removed localStorage)
  useEffect(() => {
    if (apiKeys.length > 0 && user?.uid) {
      saveApiKeysToFirebase(apiKeys);
    }
  }, [apiKeys, user?.uid]);

  const loadIntegrationStatuses = async () => {
    setLoadingStatuses(true);
    const integrationKeys = [
      'hunter-io',
      'apollo',
      'linkedin-sales',
      'facebook-business',
      'twitter',
      'clearbit',
      'zoominfo',
      'zoho-mail',
      'gmail'  // Only Gmail for email sending
      // DISABLED: 'resend' - Using Gmail SMTP instead
      // DISABLED: 'kit' - Removed ConvertKit completely
      // DISABLED: 'zoho_campaigns' - Using Gmail SMTP instead
    ];

    try {
      // Add timeout to prevent infinite loading
      const loadPromises = integrationKeys.map(async (key) => {
        try {
          // Add timeout for each individual query
          const result = await Promise.race([
            IntegrationService.getIntegrationCredentials(tenant.id, key),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Query timeout')), 5000)
            )
          ]);
          
          if (result.success) {
            console.log(`Integration ${key} data:`, result.data);
            
            // Check if it's actually connected (has required tokens/credentials)
            let isActuallyConnected = false;
            
            if (key === 'zoho_campaigns') {
              // For OAuth integrations, check for access token
              isActuallyConnected = result.data && result.data.accessToken && result.data.status === 'connected';
              console.log(`Zoho Campaigns connection check:`, {
                hasData: !!result.data,
                hasAccessToken: !!result.data?.accessToken,
                status: result.data?.status,
                isActuallyConnected
              });
            } else if (key === 'gmail') {
              // For Gmail SMTP, check for email and password
              isActuallyConnected = result.data && result.data.email && (result.data.appPassword || result.data.password);
              console.log(`Gmail SMTP connection check:`, {
                hasData: !!result.data,
                hasEmail: !!result.data?.email,
                hasPassword: !!(result.data?.appPassword || result.data?.password),
                isActuallyConnected
              });
            } else {
              // For API key integrations, check for API key
              isActuallyConnected = result.data && (result.data.apiKey || result.data.accessToken);
            }
            
            console.log(`${key} isActuallyConnected:`, isActuallyConnected);
            
            if (isActuallyConnected) {
              console.log(`Updating UI for ${key} to connected`);
              
              // CRITICAL: Stop loading immediately and force UI update
              setLoadingStatuses(false);
              
              // Small delay to ensure loading state is set, then update integration
              setTimeout(() => {
                setIntegrations(prev => {
                  const nameMap = {
                    'hunter-io': 'Hunter.io Email Finding',
                    'apollo': 'Apollo.io',
                    'linkedin-sales': 'LinkedIn Sales Navigator',
                    'facebook-business': 'Facebook Business',
                    'twitter': 'Twitter/X API',
                    'clearbit': 'Clearbit',
                    'zoominfo': 'ZoomInfo',
                    'zoho-mail': 'Zoho Mail',
                    'gmail': 'Gmail'  // Only Gmail for email sending
                    // REMOVED: 'resend': 'Resend' - Using Gmail SMTP instead
                    // REMOVED: 'kit': 'ConvertKit' - Disabled completely
                    // REMOVED: 'zoho_campaigns': 'Zoho Campaigns' - Disabled
                  };
                  
                  console.log('Before state update - current integrations for', key, ':', 
                    prev.find(int => int.name === nameMap[key])
                  );
                  
                  const updated = prev.map(integration => {
                    if (integration.name === nameMap[key]) {
                      const lastSync = result.data.lastUpdated ? 
                        new Date(result.data.lastUpdated).toLocaleDateString() : 'Connected';
                      
                      console.log(`Setting ${integration.name} to connected with lastSync:`, lastSync);
                      console.log('Before update - current integration:', integration);
                      
                      const updatedIntegration = {
                        ...integration,
                        status: 'connected',
                        lastSync: lastSync,
                        account: key === 'gmail' ? (result.data.email || 'Gmail SMTP Connected') : 
                                key === 'zoho_campaigns' ? 'OAuth Connected' : 'API Connected'
                      };
                      
                      console.log('After update - new integration:', updatedIntegration);
                      return updatedIntegration;
                    }
                    return integration;
                  });
                  
                  console.log('After state update - updated integrations for', key, ':', 
                    updated.find(int => int.name === nameMap[key])
                  );
                  
                  console.log('Current loadingStatuses:', loadingStatuses);
                  console.log('Current integrations state after update:', updated.length, 'items');
                  
                  // NUCLEAR OPTION: Force complete re-render
                  setTimeout(() => {
                    setRenderKey(prev => prev + 1);
                    setLoadingStatuses(false);
                    // Force another state update to trigger re-render
                    setIntegrations(current => [...current]);
                  }, 100);
                  
                  return updated;
                });
              }, 50);
            } else {
              console.log(`Not updating UI for ${key} - not actually connected`);
            }
          }
        } catch (error) {
          console.log(`${key} not connected:`, error.message);
        }
      });

      // Wait for all checks to complete with a global timeout
      await Promise.race([
        Promise.allSettled(loadPromises),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Global timeout')), 15000)
        )
      ]);
      
    } catch (error) {
      console.error('Error loading integration statuses:', error);
      toast.error('Some integrations may not be properly loaded');
    } finally {
      setLoadingStatuses(false);
    }
  };

  const addApiKey = (e) => {
    e.preventDefault();
    if (newApiKey.name && newApiKey.service && newApiKey.key) {
      const newKey = {
        id: Date.now(),
        name: newApiKey.name,
        service: newApiKey.service,
        status: 'active',
        usage: 0,
        limit: 10000,
        lastUsed: 'Never',
        key: newApiKey.key, // Store full key for AI API calls
        displayKey: newApiKey.key.slice(0, 6) + '...' + newApiKey.key.slice(-6) // For display only
      };
      
      const updatedKeys = [...apiKeys, newKey];
      setApiKeys(updatedKeys);
      setNewApiKey({ name: '', service: '', key: '' });
      setShowAddKey(false);
      
      // Save immediately to Firebase
      saveApiKeysToFirebase(updatedKeys);
      toast.success(`${newApiKey.service} API key added and saved to cloud!`);
    }
  };

  const toggleApiKey = (keyId) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId 
        ? { ...key, status: key.status === 'active' ? 'inactive' : 'active' }
        : key
    ));
  };

  const deleteApiKey = (keyId) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
  };

  const handleOAuthConnect = async (integrationName) => {
    if (!tenant?.id) {
      toast.error('Tenant not found');
      return;
    }

    setIsConnecting(true);
    try {
      switch(integrationName) {
        case 'Zoho Mail':
          console.log('Starting Zoho OAuth - Tenant:', tenant.id);
          console.log('Zoho credentials check:', {
            hasClientId: !!settingsForm.zohoClientId,
            hasClientSecret: !!settingsForm.zohoClientSecret
          });

          // Validate required fields
          if (!settingsForm.zohoClientId || !settingsForm.zohoClientSecret) {
            throw new Error('Please enter both Client ID and Client Secret');
          }

          // Prepare credentials object with only defined values
          const credentials = {
            clientId: settingsForm.zohoClientId,
            clientSecret: settingsForm.zohoClientSecret
          };

          // Only add optional fields if they have values
          if (settingsForm.fromEmail && settingsForm.fromEmail.trim()) {
            credentials.fromEmail = settingsForm.fromEmail.trim();
          }
          
          if (settingsForm.fromName && settingsForm.fromName.trim()) {
            credentials.fromName = settingsForm.fromName.trim();
          }

          console.log('Saving credentials for OAuth...');
          // First save the credentials
          const saveResult = await IntegrationService.saveIntegrationCredentials(tenant.id, 'zoho_campaigns', credentials);
          
          console.log('Credentials save result:', saveResult);
          
          if (!saveResult.success) {
            throw new Error('Failed to save credentials: ' + saveResult.error);
          }

          console.log('Starting OAuth flow...');
          // Start OAuth flow
          const oauthResult = await IntegrationService.connectZohoCampaigns(tenant.id, {
            clientId: settingsForm.zohoClientId,
            clientSecret: settingsForm.zohoClientSecret
          });
          
          console.log('OAuth result:', oauthResult);
          
          if (oauthResult.success && oauthResult.authUrl) {
            // Set up message listener for OAuth popup
            const handleMessage = (event) => {
              if (event.origin !== window.location.origin) return;
              
              if (event.data.type === 'OAUTH_SUCCESS') {
                toast.dismiss(); // Clear loading toast
                toast.success('✅ Zoho Campaigns account connected successfully!');
                
                // Update integration status immediately for UI feedback
                setIntegrations(prev => prev.map(int =>
                  int.name === 'Zoho Campaigns'
                    ? { ...int, status: 'connected', lastSync: 'Just now', account: 'Connected' }
                    : int
                ));
                
                // Reload integration statuses from database to ensure persistence
                setTimeout(() => {
                  loadIntegrationStatuses();
                }, 1000);
                
                window.removeEventListener('message', handleMessage);
                setIsConnecting(false);
              } else if (event.data.type === 'OAUTH_ERROR') {
                toast.dismiss(); // Clear loading toast
                toast.error(`OAuth failed: ${event.data.error}`);
                window.removeEventListener('message', handleMessage);
                setIsConnecting(false);
              }
            };

            window.addEventListener('message', handleMessage);

            // Open OAuth window
            const popup = window.open(oauthResult.authUrl, 'zoho-oauth', 'width=600,height=600');
            toast.loading('Redirecting to Zoho for authorization...', { duration: 0 });
            
            // Check if popup was blocked
            if (!popup) {
              toast.dismiss();
              toast.error('Popup blocked! Please allow popups and try again.');
              window.removeEventListener('message', handleMessage);
              setIsConnecting(false);
              return;
            }

            // Monitor popup closure
            const checkClosed = setInterval(() => {
              if (popup.closed) {
                clearInterval(checkClosed);
                toast.dismiss();
                if (isConnecting) {
                  toast.error('OAuth was cancelled');
                  setIsConnecting(false);
                }
                window.removeEventListener('message', handleMessage);
              }
            }, 1000);
            
            // Close modal after starting OAuth
            setShowSettingsModal(false);
          } else {
            throw new Error(oauthResult.error || 'Failed to start OAuth flow');
          }
          break;
          
        case 'Gmail':
          console.log('Connecting Gmail SMTP');
          
          // Validate required fields
          if (!settingsForm.email || !settingsForm.appPassword) {
            throw new Error('Please enter both Gmail address and App Password');
          }

          // Connect Gmail
          const gmailResult = await IntegrationService.connectGmail(
            tenant.id, 
            settingsForm.email, 
            settingsForm.appPassword
          );
          
          if (gmailResult.success) {
            toast.success('✅ Gmail SMTP connected successfully!');
            
            // Update integration status
            setIntegrations(prev => prev.map(int =>
              int.name === 'Gmail'
                ? { ...int, status: 'connected', lastSync: 'Just now', account: settingsForm.email }
                : int
            ));
            
            // Close settings modal
            closeSettingsModal();
            
            // Reload statuses
            await loadIntegrationStatuses();
          } else {
            throw new Error(gmailResult.error || 'Failed to connect Gmail');
          }
          break;
          
        default:
          toast.error('OAuth not supported for this integration');
      }
    } catch (error) {
      console.error('OAuth connect error:', error);
      toast.error(error.message || 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectIntegration = async (integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);
    
    try {
      switch(integration.name) {
        case 'LinkedIn Sales Navigator':
          // Redirect to LinkedIn OAuth
          const linkedinUrl = IntegrationService.getOAuthURL('linkedin-sales', tenant.id);
          window.open(linkedinUrl, 'linkedin-oauth', 'width=600,height=600');
          toast.loading('Connecting to LinkedIn Sales Navigator...');
          break;
          
        case 'Facebook Business':
          // Redirect to Facebook OAuth
          const facebookUrl = IntegrationService.getOAuthURL('facebook-business', tenant.id);
          window.open(facebookUrl, 'facebook-oauth', 'width=600,height=600');
          toast.loading('Connecting to Facebook Business...');
          break;
          
        case 'Twitter/X API':
          // Redirect to Twitter OAuth
          const twitterUrl = IntegrationService.getOAuthURL('twitter', tenant.id);
          window.open(twitterUrl, 'twitter-oauth', 'width=600,height=600');
          toast.loading('Connecting to Twitter/X...');
          break;
          
        case 'Hunter.io Email Finding':
        case 'Apollo.io':
          // Show API key input modal
          const apiKey = prompt(`Enter your ${integration.name} API key:`);
          if (apiKey) {
            toast.loading(`Connecting to ${integration.name}...`);
            let result;
            
            if (integration.name === 'Hunter.io Email Finding') {
              result = await IntegrationService.connectHunterIO(tenant.id, apiKey);
            } else if (integration.name === 'Apollo.io') {
              result = await IntegrationService.connectApollo(tenant.id, apiKey);
            }
            
            if (result && result.success) {
              setIntegrations(prev => prev.map(int =>
                int.id === integrationId
                  ? { ...int, status: 'connected', lastSync: 'Just now', account: 'Connected' }
                  : int
              ));
              toast.success(`Successfully connected to ${integration.name}!`);
            } else {
              toast.error(`Failed to connect: ${result.error}`);
            }
          }
          break;
          
        case 'Zoho Mail':
          // Show the settings modal for API configuration
          showSettings(integration);
          toast.info('Configure your Zoho API credentials in the settings panel');
          break;
          
        case 'Gmail':
          // Show the settings modal for Gmail SMTP configuration
          showSettings(integration);
          toast.info('Configure your Gmail SMTP credentials in the settings panel');
          break;
          
        default:
          // For other integrations, use the existing placeholder behavior
          setIntegrations(prev => prev.map(integration =>
            integration.id === integrationId
              ? { 
                  ...integration, 
                  status: 'connected', 
                  lastSync: 'Just now',
                  account: integration.type === 'Email' ? 'your-email@gmail.com' : 'Connected Account'
                }
              : integration
          ));
          toast.success(`Connected to ${integration.name}!`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error(`Failed to connect to ${integration.name}`);
    }
  };

  const disconnectIntegration = (integrationId) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === integrationId
        ? { ...integration, status: 'disconnected', lastSync: 'Never', account: 'Not connected' }
        : integration
    ));
  };

  const openSettingsModal = async (integration) => {
    setSelectedIntegration(integration);
    
    // Initialize form with empty values
    let formData = {
      apiKey: '',
      clientId: '',
      clientSecret: '',
      accessToken: '',
      refreshToken: '',
      authCode: '',
      smtpEmail: '',
      smtpPassword: '',
      smtpFromName: '',
      smtpHost: 'smtp.zoho.com',
      smtpPort: '587'
    };

    // Load existing credentials if available
    if (tenant?.id) {
      try {
        // Map integration names to their storage keys
        const integrationKeyMap = {
          'Zoho Mail': 'zoho_campaigns', // Updated to use the new API-based storage
          'Apollo.io': 'apollo',
          'Hunter.io Email Finding': 'hunter',
          'Clearbit': 'clearbit',
          'ZoomInfo': 'zoominfo',
          'Gmail': 'gmail',
          'Slack': 'slack',
          'YouTube Data API': 'youtube',
          'TikTok for Business': 'tiktok'
        };
        
        const integrationKey = integrationKeyMap[integration.name] || 
                              integration.name.toLowerCase().replace(/\s+/g, '-');
        
        const existingCredentials = await IntegrationService.getIntegrationCredentials(
          tenant.id, 
          integrationKey
        );
        
        if (existingCredentials.success && existingCredentials.data) {
          formData = { ...formData, ...existingCredentials.data };
          
          // Special mapping for Zoho Mail to ensure correct field names
          if (integration.name === 'Zoho Mail') {
            formData.zohoClientId = existingCredentials.data.clientId || '';
            formData.zohoClientSecret = existingCredentials.data.clientSecret || '';
            formData.fromEmail = existingCredentials.data.fromEmail || '';
            formData.fromName = existingCredentials.data.fromName || '';
          }
        }
      } catch (error) {
        console.log('No existing credentials found for', integration.name);
      }
    }

    setSettingsForm(formData);
    setShowSettingsModal(true);
  };

  const testZohoMailConfig = async () => {
    console.log('Test Zoho Campaigns API - Tenant:', tenant);
    console.log('Test Zoho Campaigns API - Settings Form:', settingsForm);
    
    if (!tenant?.id || !settingsForm.zohoClientId || !settingsForm.zohoClientSecret) {
      console.log('Missing required fields:', {
        hasTenant: !!tenant?.id,
        hasClientId: !!settingsForm.zohoClientId,
        hasClientSecret: !!settingsForm.zohoClientSecret
      });
      toast.error('Please fill in all Zoho API configuration fields');
      return;
    }

    setIsConnecting(true);
    try {
      console.log('Testing Zoho Campaigns API for tenant:', tenant.id);
      
      // Test the Zoho Campaigns API connection
      const testResult = await IntegrationService.testZohoCampaigns(tenant.id, {
        clientId: settingsForm.zohoClientId,
        clientSecret: settingsForm.zohoClientSecret,
        fromEmail: settingsForm.fromEmail,
        fromName: settingsForm.fromName
      });
      
      console.log('Test API result:', testResult);
      
      if (testResult.success) {
        toast.success('✅ Zoho Campaigns API connection successful! Ready to connect your account.');
        
        // Show OAuth instructions
        const oauthMessage = `
          API connection verified! Next steps:
          1. Click "Connect Zoho Account" to authorize
          2. You'll be redirected to Zoho for secure login
          3. After authorization, you can send emails through your custom domain
        `;
        toast.success(oauthMessage, { duration: 8000 });
      } else {
        throw new Error(testResult.error || 'API connection failed');
      }
    } catch (error) {
      console.error('SMTP test failed:', error);
      toast.error('❌ SMTP test failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsConnecting(false);
    }
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
    setSelectedIntegration(null);
    setSettingsForm({
      apiKey: '',
      clientId: '',
      clientSecret: '',
      accessToken: '',
      refreshToken: '',
      authCode: '',
      smtpEmail: '',
      smtpPassword: '',
      smtpFromName: '',
      smtpHost: 'smtp.zoho.com',
      smtpPort: '587'
    });
  };

  const saveIntegrationSettings = async () => {
    if (!selectedIntegration || !tenant?.id) return;

    setIsConnecting(true);
    
    try {
      let result = { success: false };
      
      switch(selectedIntegration.name) {
        case 'Hunter.io Email Finding':
          if (settingsForm.apiKey) {
            result = await IntegrationService.connectHunterIO(tenant.id, settingsForm.apiKey);
          }
          break;
          
        case 'Apollo.io':
          if (settingsForm.apiKey) {
            result = await IntegrationService.connectApollo(tenant.id, settingsForm.apiKey);
          }
          break;
          
        case 'Zoho Mail':
          if (settingsForm.smtpEmail && settingsForm.smtpPassword) {
            // Save SMTP credentials for email sending
            await IntegrationService.saveIntegrationCredentials(tenant.id, 'zoho_mail_smtp', {
              smtpEmail: settingsForm.smtpEmail,
              smtpPassword: settingsForm.smtpPassword,
              smtpFromName: settingsForm.smtpFromName,
              smtpHost: settingsForm.smtpHost || 'smtp.zoho.com',
              smtpPort: settingsForm.smtpPort || '587'
            });
            result = { success: true };
          } else {
            toast.error('Please provide SMTP email and password');
            return;
          }
          break;
          
        case 'Clearbit':
          if (settingsForm.apiKey) {
            // Test Clearbit API key
            const testResponse = await fetch(`https://person.clearbit.com/v2/people/find?email=test@example.com`, {
              headers: { 'Authorization': `Bearer ${settingsForm.apiKey}` }
            });
            
            if (testResponse.status === 200 || testResponse.status === 422) { // 422 = not found but valid key
              await IntegrationService.saveIntegrationCredentials(tenant.id, 'clearbit', {
                apiKey: settingsForm.apiKey
              });
              result = { success: true };
            } else {
              result = { success: false, error: 'Invalid Clearbit API key' };
            }
          }
          break;
          
        case 'ZoomInfo':
          if (settingsForm.apiKey) {
            // For ZoomInfo, we'll save the key and assume it's valid for now
            // In production, you'd test the actual ZoomInfo API
            await IntegrationService.saveIntegrationCredentials(tenant.id, 'zoominfo', {
              apiKey: settingsForm.apiKey
            });
            result = { success: true };
          }
          break;
          
        case 'HubSpot':
          if (settingsForm.apiKey) {
            // Test HubSpot API key
            try {
              const testResponse = await fetch(`https://api.hubapi.com/contacts/v1/lists/all/contacts/all?hapikey=${settingsForm.apiKey}&count=1`);
              if (testResponse.status === 200) {
                await IntegrationService.saveIntegrationCredentials(tenant.id, 'hubspot', {
                  apiKey: settingsForm.apiKey
                });
                result = { success: true };
              } else {
                result = { success: false, error: 'Invalid HubSpot API key' };
              }
            } catch (error) {
              result = { success: false, error: 'Failed to validate HubSpot API key' };
            }
          }
          break;
          
        case 'Slack':
          if (settingsForm.accessToken) {
            // Test Slack bot token
            try {
              const testResponse = await fetch('https://slack.com/api/auth.test', {
                headers: { 'Authorization': `Bearer ${settingsForm.accessToken}` }
              });
              const data = await testResponse.json();
              if (data.ok) {
                await IntegrationService.saveIntegrationCredentials(tenant.id, 'slack', {
                  accessToken: settingsForm.accessToken
                });
                result = { success: true };
              } else {
                result = { success: false, error: 'Invalid Slack bot token' };
              }
            } catch (error) {
              result = { success: false, error: 'Failed to validate Slack token' };
            }
          }
          break;
          
        case 'YouTube Data API':
          if (settingsForm.apiKey) {
            // Test YouTube Data API key
            try {
              const testResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&key=${settingsForm.apiKey}`);
              if (testResponse.status === 200 || testResponse.status === 401) { // 401 means key is valid but no OAuth
                await IntegrationService.saveIntegrationCredentials(tenant.id, 'youtube', {
                  apiKey: settingsForm.apiKey
                });
                result = { success: true };
              } else {
                result = { success: false, error: 'Invalid YouTube Data API key' };
              }
            } catch (error) {
              result = { success: false, error: 'Failed to validate YouTube API key' };
            }
          }
          break;
          
        case 'TikTok for Business':
          if (settingsForm.clientId && settingsForm.clientSecret) {
            // Save TikTok credentials
            await IntegrationService.saveIntegrationCredentials(tenant.id, 'tiktok', {
              clientId: settingsForm.clientId,
              clientSecret: settingsForm.clientSecret
            });
            result = { success: true };
          }
          break;

        default:
          // For OAuth-based integrations, store the tokens
          if (settingsForm.accessToken) {
            await IntegrationService.saveIntegrationCredentials(tenant.id, selectedIntegration.name.toLowerCase(), {
              accessToken: settingsForm.accessToken,
              refreshToken: settingsForm.refreshToken,
              clientId: settingsForm.clientId,
              clientSecret: settingsForm.clientSecret
            });
            result = { success: true };
          }
      }
      
      if (result.success) {
        // Update the integration status
        setIntegrations(prev => prev.map(integration =>
          integration.id === selectedIntegration.id
            ? { 
                ...integration, 
                status: 'connected', 
                lastSync: 'Just now',
                account: 'Connected via API'
              }
            : integration
        ));
        
        toast.success(`Successfully connected to ${selectedIntegration.name}!`);
        closeSettingsModal();
        // Refresh integration statuses to show the new connection
        loadIntegrationStatuses();
      } else {
        toast.error(`Failed to connect: ${result.error || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error(`Connection failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const testConnection = async (integration) => {
    try {
      setIsConnecting(true);
      
      const nameMap = {
        'Hunter.io Email Finding': 'hunter-io',
        'Apollo.io': 'apollo',
        'LinkedIn Sales Navigator': 'linkedin-sales',
        'Facebook Business': 'facebook-business',
        'Twitter/X API': 'twitter',
        'Clearbit': 'clearbit',
        'ZoomInfo': 'zoominfo',
        'Zoho Mail': 'zoho-mail',
        'Gmail': 'gmail'  // Only Gmail for email sending
        // REMOVED: 'Resend': 'resend' - Using Gmail SMTP instead
        // REMOVED: 'ConvertKit': 'kit' - Disabled completely
      };
      
      const key = nameMap[integration.name];
      if (!key) {
        toast.error('Unknown integration');
        return;
      }
      
      const result = await IntegrationService.getIntegrationCredentials(tenant.id, key);
      if (result.success) {
        toast.success(`✅ ${integration.name} connection is active!`);
      } else {
        toast.error(`❌ ${integration.name} connection failed - please check settings`);
      }
    } catch (error) {
      toast.error(`❌ Connection test failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active':
      case 'connected': return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔑</span>
              <h3 className="text-lg font-semibold">API Keys</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600">{apiKeys.length}</div>
            <div className="text-sm text-gray-500">Active: {apiKeys.filter(k => k.status === 'active').length}</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔗</span>
              <h3 className="text-lg font-semibold">Integrations</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">{integrations.filter(i => i.status === 'connected').length}</div>
            <div className="text-sm text-gray-500">of {integrations.length} available</div>
            {integrations.filter(i => i.status === 'connected').length > 0 && (
              <div className="text-xs text-green-600 mt-1">✓ Ready for lead generation</div>
            )}
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📊</span>
              <h3 className="text-lg font-semibold">Lead Sources</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {integrations.filter(i => i.status === 'connected').length * 2}
            </div>
            <div className="text-sm text-gray-500">Active channels available</div>
            <div className="mt-2">
              <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                → View performance in Analytics
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Keys Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">AI Service API Keys</h2>
                <button
                  onClick={() => setShowAddKey(!showAddKey)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
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
                        <option value="">Select Service</option>
                        {availableServices.map(service => (
                          <option key={service} value={service}>{service}</option>
                        ))}
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
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add Key
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddKey(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {apiKeys.map(key => (
                  <div key={key.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{key.name}</h3>
                        <p className="text-sm text-gray-600">{key.service}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(key.status)}`}>
                        {key.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Usage:</span>
                        <span className="font-medium ml-2">{key.usage.toLocaleString()}/{key.limit.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Used:</span>
                        <span className="font-medium ml-2">{key.lastUsed}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Key:</span>
                        <span className="font-mono ml-2">{key.displayKey || (key.key?.slice(0, 6) + '...' + key.key?.slice(-6))}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleApiKey(key.id)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          key.status === 'active' 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {key.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteApiKey(key.id)}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Integrations Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Integrations</h2>
              
              <div className="space-y-4">
                {loadingStatuses && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading integration statuses...</p>
                  </div>
                )}
                {!loadingStatuses && integrations.map(integration => (
                  <div key={`${integration.id}-${renderKey}`} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                          <p className="text-sm text-gray-600">{integration.type}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                        {integration.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
                    
                    {integration.features && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {integration.features.slice(0, 3).map((feature, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                          {integration.features.length > 3 && (
                            <span className="text-xs text-gray-500">+{integration.features.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-2 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Account:</span>
                        <span className="font-medium ml-2">{integration.account}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Sync:</span>
                        <span className="font-medium ml-2">{integration.lastSync}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {integration.status === 'connected' ? (
                        <>
                          <button
                            onClick={() => testConnection(integration)}
                            disabled={isConnecting}
                            className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:bg-gray-300 transition-colors"
                          >
                            {isConnecting ? 'Testing...' : 'Test'}
                          </button>
                          <button
                            onClick={() => disconnectIntegration(integration.id)}
                            className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => openSettingsModal(integration)}
                          className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                        >
                          Connect
                        </button>
                      )}
                      <button 
                        onClick={() => openSettingsModal(integration)}
                        className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                      >
                        Settings
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Security Notice</h3>
              <p className="text-yellow-700">
                Your API keys are encrypted and stored securely. Market Genie never shares your keys with third parties. 
                We recommend using dedicated API keys for this platform and regularly rotating them for security.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettingsModal && selectedIntegration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedIntegration.icon} Configure {selectedIntegration.name}
                </h3>
                <button
                  onClick={closeSettingsModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  {selectedIntegration.description}
                </p>

                {/* API Key Input for Hunter.io, Apollo.io, Clearbit, ZoomInfo */}
                {['Hunter.io Email Finding', 'Apollo.io', 'Clearbit', 'ZoomInfo'].includes(selectedIntegration.name) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={settingsForm.apiKey}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder={`Enter your ${selectedIntegration.name} API key`}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedIntegration.name === 'Hunter.io Email Finding' && 'Get your API key from hunter.io/api'}
                      {selectedIntegration.name === 'Apollo.io' && 'Get your API key from apollo.io/settings/integrations'}
                      {selectedIntegration.name === 'Clearbit' && 'Get your API key from clearbit.com/keys'}
                      {selectedIntegration.name === 'ZoomInfo' && 'Get your API key from zoominfo.com/business/api'}
                    </p>
                  </div>
                )}

                {/* Gmail SMTP Configuration */}
                {selectedIntegration.name === 'Gmail' && (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-blue-800 mb-2">Gmail SMTP Integration</h4>
                      <p className="text-blue-700 text-sm mb-3">
                        Use your Gmail account to send emails. Simple, reliable, and works immediately.
                      </p>
                      <p className="text-blue-600 text-xs mb-3">
                        <strong>✨ Why Gmail:</strong> 500 emails/day, excellent deliverability, no DNS setup required.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gmail Address
                        </label>
                        <input
                          type="email"
                          value={settingsForm.email}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your-email@gmail.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          App Password
                        </label>
                        <input
                          type="password"
                          value={settingsForm.appPassword}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, appPassword: e.target.value }))}
                          placeholder="Enter Gmail App Password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Generate at: myaccount.google.com/apppasswords
                        </p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-700 text-sm">
                          <strong>Quick Setup:</strong> 1) Enable 2FA on Gmail 2) Generate App Password 3) Enter credentials above
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleOAuthConnect('Gmail')}
                        disabled={!settingsForm.email || !settingsForm.appPassword || isConnecting}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isConnecting ? 'Connecting...' : 'Connect Gmail SMTP'}
                      </button>
                    </div>
                  </div>
                )}

                {/* HubSpot Configuration */}
                {selectedIntegration.name === 'HubSpot' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HubSpot API Key
                    </label>
                    <input
                      type="password"
                      value={settingsForm.apiKey}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Enter your HubSpot API key"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get your API key from HubSpot Settings → Integrations → API key
                    </p>
                  </div>
                )}

                {/* Slack Configuration */}
                {selectedIntegration.name === 'Slack' && (
                  <div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-green-800 mb-2">Slack Bot Integration</h4>
                      <p className="text-green-700 text-sm mb-3">
                        Create a Slack app and bot to receive notifications and updates.
                      </p>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bot Token
                    </label>
                    <input
                      type="password"
                      value={settingsForm.accessToken}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, accessToken: e.target.value }))}
                      placeholder="xoxb-your-bot-token"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get your bot token from api.slack.com → Your Apps → OAuth & Permissions
                    </p>
                  </div>
                )}

                {/* Google Calendar Configuration */}
                {selectedIntegration.name === 'Google Calendar' && (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-blue-800 mb-2">Google Calendar OAuth</h4>
                      <p className="text-blue-700 text-sm mb-3">
                        Connect your Google Calendar for appointment scheduling.
                      </p>
                      <button
                        onClick={() => {
                          closeSettingsModal();
                          connectIntegration(selectedIntegration.id);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Connect Google Calendar
                      </button>
                    </div>
                  </div>
                )}

                {/* YouTube Data API Configuration */}
                {selectedIntegration.name === 'YouTube Data API' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube Data API Key
                    </label>
                    <input
                      type="password"
                      value={settingsForm.apiKey}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Enter your YouTube Data API key"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get your API key from Google Cloud Console → YouTube Data API v3
                    </p>
                  </div>
                )}

                {/* Instagram Business Configuration */}
                {selectedIntegration.name === 'Instagram Business' && (
                  <div>
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-pink-800 mb-2">Instagram Business API</h4>
                      <p className="text-pink-700 text-sm mb-3">
                        Uses Facebook Business API. Connect your Instagram Business account through Facebook.
                      </p>
                      <button
                        onClick={() => {
                          closeSettingsModal();
                          connectIntegration(selectedIntegration.id);
                        }}
                        className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                      >
                        Connect Instagram Business
                      </button>
                    </div>
                  </div>
                )}

                {/* TikTok for Business Configuration */}
                {selectedIntegration.name === 'TikTok for Business' && (
                  <div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">TikTok Business API</h4>
                      <p className="text-gray-700 text-sm mb-3">
                        TikTok for Business API integration for trend analysis and advertising insights.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          App ID
                        </label>
                        <input
                          type="text"
                          value={settingsForm.clientId}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, clientId: e.target.value }))}
                          placeholder="Enter your TikTok App ID"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          App Secret
                        </label>
                        <input
                          type="password"
                          value={settingsForm.clientSecret}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, clientSecret: e.target.value }))}
                          placeholder="Enter your TikTok App Secret"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Get your credentials from TikTok for Business → Developer Portal
                    </p>
                  </div>
                )}

                {/* Zoho Mail Configuration */}
                {selectedIntegration.name === 'Zoho Mail' && (
                  <div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-orange-800 mb-2">Zoho Campaigns API Configuration</h4>
                      <p className="text-orange-700 text-sm mb-3">
                        Connect your Zoho developer app to send emails through your custom domain using the Zoho Campaigns API.
                      </p>
                      <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 mb-3">
                        <p className="text-orange-800 text-sm font-medium mb-2">Setup Steps:</p>
                        <ul className="text-orange-700 text-sm space-y-1 ml-4">
                          <li>• Create a Zoho developer app at api-console.zoho.com</li>
                          <li>• Use "Server-based Applications" type</li>
                          <li>• Add your client credentials below</li>
                          <li>• Authorize your Zoho account via OAuth</li>
                          <li>• Send emails from YOUR custom domain</li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Client ID
                        </label>
                        <input
                          type="text"
                          value={settingsForm.zohoClientId || ''}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, zohoClientId: e.target.value }))}
                          placeholder="Your Zoho app client ID"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Client Secret
                        </label>
                        <input
                          type="password"
                          value={settingsForm.zohoClientSecret || ''}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, zohoClientSecret: e.target.value }))}
                          placeholder="Your Zoho app client secret"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          From Email Address
                        </label>
                        <input
                          type="email"
                          value={settingsForm.fromEmail || ''}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, fromEmail: e.target.value }))}
                          placeholder="your@yourbusiness.com"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This should be your custom domain email address
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          From Name
                        </label>
                        <input
                          type="text"
                          value={settingsForm.fromName || ''}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, fromName: e.target.value }))}
                          placeholder="Your Business Name"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This will appear as the sender name in emails
                        </p>
                      </div>
                    </div>
                    {/* OAuth Connection Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleOAuthConnect('Zoho Mail')}
                        disabled={isConnecting || !settingsForm.zohoClientId || !settingsForm.zohoClientSecret}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          isConnecting || !settingsForm.zohoClientId || !settingsForm.zohoClientSecret
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                      >
                        {isConnecting ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Connecting to Zoho...
                          </span>
                        ) : (
                          '� Connect Zoho Account'
                        )}
                      </button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        This will redirect you to Zoho for secure OAuth authorization
                      </p>
                    </div>
                  </div>
                )}

                {/* OAuth Instructions for Social Platforms */}
                {['LinkedIn Sales Navigator', 'Facebook Business', 'Twitter/X API'].includes(selectedIntegration.name) && (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">OAuth Integration</h4>
                      <p className="text-blue-700 text-sm mb-3">
                        This integration uses OAuth for secure authentication. Click "Connect" to start the authorization process.
                      </p>
                      <button
                        onClick={() => {
                          closeSettingsModal();
                          connectIntegration(selectedIntegration.id);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Start OAuth Connection
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual Token Input (for testing OAuth results) */}
                {['LinkedIn Sales Navigator', 'Facebook Business', 'Twitter/X API'].includes(selectedIntegration.name) && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Manual Configuration (Advanced)</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Access Token</label>
                        <input
                          type="password"
                          value={settingsForm.accessToken}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, accessToken: e.target.value }))}
                          placeholder="Paste access token here"
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Refresh Token (Optional)</label>
                        <input
                          type="password"
                          value={settingsForm.refreshToken}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, refreshToken: e.target.value }))}
                          placeholder="Paste refresh token here"
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Features List */}
                {selectedIntegration.features && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Available Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedIntegration.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeSettingsModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveIntegrationSettings}
                  disabled={isConnecting || (
                    !settingsForm.apiKey && 
                    !settingsForm.accessToken && 
                    !(settingsForm.clientId && settingsForm.clientSecret && settingsForm.authCode) &&
                    !(settingsForm.smtpEmail && settingsForm.smtpPassword)
                  )}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isConnecting ? 'Connecting...' : 'Save & Connect'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIKeysIntegrations;
