import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';

const APIKeysIntegrations = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production OpenAI',
      service: 'OpenAI GPT-4',
      status: 'active',
      usage: 12450,
      limit: 50000,
      lastUsed: '2 hours ago',
      key: 'sk-...abc123'
    },
    {
      id: 2,
      name: 'Claude AI Assistant',
      service: 'Anthropic Claude-3',
      status: 'active',
      usage: 8900,
      limit: 25000,
      lastUsed: '1 hour ago',
      key: 'cl-...xyz789'
    },
    {
      id: 3,
      name: 'Backup GPT Key',
      service: 'OpenAI GPT-3.5',
      status: 'inactive',
      usage: 2100,
      limit: 10000,
      lastUsed: '1 day ago',
      key: 'sk-...def456'
    }
  ]);

  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: 'Gmail',
      type: 'Email',
      status: 'connected',
      icon: '📧',
      description: 'Send personalized emails and track responses',
      lastSync: '5 minutes ago',
      account: 'your-email@gmail.com'
    },
    {
      id: 2,
      name: 'LinkedIn Basic',
      type: 'Professional Network',
      status: 'connected',
      icon: '💼',
      description: 'Basic LinkedIn profile integration and connection requests',
      lastSync: '10 minutes ago',
      account: 'Your LinkedIn Profile',
      features: ['Profile Access', 'Connection Requests', 'Basic Messaging', 'Company Data']
    },
    {
      id: 3,
      name: 'HubSpot',
      type: 'CRM',
      status: 'connected',
      icon: '🏢',
      description: 'Sync leads and contacts with your CRM',
      lastSync: '1 hour ago',
      account: 'your-company.hubspot.com'
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
      status: 'connected',
      icon: '📅',
      description: 'Schedule meetings and appointments automatically',
      lastSync: '30 minutes ago',
      account: 'your-email@gmail.com'
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
        key: newApiKey.key.slice(0, 6) + '...' + newApiKey.key.slice(-6)
      };
      
      setApiKeys(prev => [...prev, newKey]);
      setNewApiKey({ name: '', service: '', key: '' });
      setShowAddKey(false);
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

  const connectIntegration = (integrationId) => {
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
  };

  const disconnectIntegration = (integrationId) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === integrationId
        ? { ...integration, status: 'disconnected', lastSync: 'Never', account: 'Not connected' }
        : integration
    ));
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
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📊</span>
              <h3 className="text-lg font-semibold">API Usage</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {apiKeys.reduce((sum, key) => sum + key.usage, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total requests this month</div>
            <div className="mt-2">
              <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                → View costs in Cost Controls
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
                        <span className="font-mono ml-2">{key.key}</span>
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
                {integrations.map(integration => (
                  <div key={integration.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
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
                        <button
                          onClick={() => disconnectIntegration(integration.id)}
                          className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => connectIntegration(integration.id)}
                          className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                        >
                          Connect
                        </button>
                      )}
                      <button className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
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
      </div>
    </div>
  );
};

export default APIKeysIntegrations;
