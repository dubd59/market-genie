import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { useGenie } from '../contexts/GenieContext';
import FirebaseUserDataService from '../services/firebaseUserData';
import IntegratedMarketingService from '../services/integratedMarketing';
import BusinessProfileSettings from './BusinessProfileSettings';
import toast from 'react-hot-toast';

const OutreachAutomation = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { createCampaign: genieCreateCampaign } = useGenie();
  
  // Business Profile State
  const [showBusinessProfile, setShowBusinessProfile] = useState(false);
  const [businessProfileComplete, setBusinessProfileComplete] = useState(false);
  
  // Campaign State
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    emailsSent: 1200,
    smsSent: 800,
    socialPosts: 350,
    activeCampaigns: 3
  });
  
  // Form States
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: '',
    audience: '',
    description: ''
  });

  useEffect(() => {
    if (tenant?.id) {
      loadCampaigns();
      checkBusinessProfile();
    }
  }, [tenant?.id]);

  const checkBusinessProfile = async () => {
    try {
      const profile = await FirebaseUserDataService.getBusinessProfile(tenant.id);
      const isComplete = profile && 
        profile.businessInfo?.companyName && 
        profile.senderInfo?.senderName;
      setBusinessProfileComplete(isComplete);
    } catch (error) {
      console.error('Error checking business profile:', error);
    }
  };

  const loadCampaigns = async () => {
    // Sample campaigns for demo
    setCampaigns([
      {
        id: 1,
        name: 'Welcome Series',
        type: 'Email Sequence',
        status: 'active',
        recipients: 1247,
        openRate: 24.5,
        clickRate: 8.2
      },
      {
        id: 2,
        name: 'Product Launch',
        type: 'Multi-Channel',
        status: 'paused',
        recipients: 890,
        openRate: 31.2,
        clickRate: 12.1
      }
    ]);
  };

  const createCampaign = async (e) => {
    e.preventDefault();
    
    if (!campaignForm.name || !campaignForm.type) {
      toast.error('Please fill in required fields');
      return;
    }

    const newCampaign = {
      id: Date.now(),
      name: campaignForm.name,
      type: campaignForm.type,
      status: 'draft',
      recipients: 0,
      openRate: 0,
      clickRate: 0
    };

    setCampaigns(prev => [...prev, newCampaign]);
    setCampaignForm({ name: '', type: '', audience: '', description: '' });
    setShowCampaignForm(false);
    toast.success('Campaign created successfully!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
          Outreach Automation
        </h1>
        <p className="text-gray-600 text-lg">Create and manage multi-channel marketing campaigns</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📧</span>
            <h3 className="text-lg font-semibold">Emails Sent</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.emailsSent.toLocaleString()}</div>
          <div className="text-sm text-gray-500">This month</div>
        </div>
        
        <div className="bg-white shadow-lg rounded-xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📱</span>
            <h3 className="text-lg font-semibold">SMS Sent</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.smsSent.toLocaleString()}</div>
          <div className="text-sm text-gray-500">This month</div>
        </div>
        
        <div className="bg-white shadow-lg rounded-xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📢</span>
            <h3 className="text-lg font-semibold">Social Posts</h3>
          </div>
          <div className="text-3xl font-bold text-purple-600">{stats.socialPosts.toLocaleString()}</div>
          <div className="text-sm text-gray-500">This month</div>
        </div>
        
        <div className="bg-white shadow-lg rounded-xl p-6 border border-orange-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎯</span>
            <h3 className="text-lg font-semibold">Active Campaigns</h3>
          </div>
          <div className="text-3xl font-bold text-orange-600">{stats.activeCampaigns}</div>
          <div className="text-sm text-gray-500">Running now</div>
        </div>
      </div>

      {/* Business Profile Setup - Prominently placed for easy access */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-teal-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Business Profile</h2>
                  <p className="text-sm text-gray-600">Configure your business information for professional email signatures and footers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!businessProfileComplete && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                    Setup Required
                  </span>
                )}
                <button
                  onClick={() => setShowBusinessProfile(!showBusinessProfile)}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  {showBusinessProfile ? 'Hide' : businessProfileComplete ? 'Edit Profile' : 'Setup Profile'}
                </button>
              </div>
            </div>

            {!businessProfileComplete && !showBusinessProfile && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-500 text-lg">⚠️</span>
                  <div>
                    <h3 className="font-medium text-yellow-800">Complete your business profile for professional emails</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your emails will include proper business signatures and unsubscribe footers when you complete this setup.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {showBusinessProfile && (
            <div className="p-6">
              <BusinessProfileSettings onSave={checkBusinessProfile} />
            </div>
          )}
        </div>
      </div>

      {/* Campaign Management */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
          <button
            onClick={() => setShowCampaignForm(!showCampaignForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCampaignForm ? 'Cancel' : 'Create Campaign'}
          </button>
        </div>
        
        {showCampaignForm && (
          <form onSubmit={createCampaign} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Campaign Name *"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={campaignForm.type}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, type: e.target.value }))}
                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Campaign Type *</option>
                <option value="Email Sequence">Email Sequence</option>
                <option value="SMS Campaign">SMS Campaign</option>
                <option value="Social Media">Social Media</option>
                <option value="Multi-Channel">Multi-Channel</option>
              </select>
            </div>
            
            <input
              type="text"
              placeholder="Target Audience"
              value={campaignForm.audience}
              onChange={(e) => setCampaignForm(prev => ({ ...prev, audience: e.target.value }))}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <textarea
              placeholder="Campaign Description"
              value={campaignForm.description}
              onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🚀 Create Campaign
            </button>
          </form>
        )}
      </div>

      {/* Active Campaigns */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Campaigns</h2>
        
        {campaigns.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">📭</span>
            <p className="text-gray-500">No campaigns yet. Create your first campaign above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-600">{campaign.type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Recipients:</span>
                    <span className="font-medium ml-2">{campaign.recipients.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Open Rate:</span>
                    <span className="font-medium ml-2">{campaign.openRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Click Rate:</span>
                    <span className="font-medium ml-2">{campaign.clickRate}%</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors">
                    {campaign.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                  <button className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                    Edit
                  </button>
                  <button className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                    Analytics
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutreachAutomation;