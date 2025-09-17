import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const OutreachAutomation = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  // Campaign State
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    emailsSent: 0,
    smsSent: 0,
    socialPosts: 0,
    activecampaigns: 0,
    totalRecipients: 0,
    avgOpenRate: 0
  });
  
  // Form States
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: '',
    audience: '',
    scheduleDate: '',
    description: '',
    channels: []
  });

  // Email Templates
  const emailTemplates = [
    {
      id: 1,
      name: 'Welcome Series',
      description: '5-email welcome sequence for new subscribers',
      type: 'sequence',
      emails: 5,
      category: 'onboarding',
      preview: 'Welcome to [Company]! We\'re excited to have you...',
      template: {
        subject: 'Welcome to [Company Name]!',
        content: `Hi [First Name],

Welcome to [Company Name]! We're thrilled to have you join our community.

Over the next few days, you'll receive emails that will help you:
• Get started with our platform
• Discover key features that will save you time
• Connect with our support team if you need help

Your journey starts now!

Best regards,
The [Company Name] Team

P.S. Reply to this email if you have any questions - we read every message!`
      }
    },
    {
      id: 2,
      name: 'Product Launch',
      description: 'Announcement campaign for new product releases',
      type: 'single',
      emails: 1,
      category: 'marketing',
      preview: 'Introducing our latest innovation...',
      template: {
        subject: '🚀 Introducing [Product Name] - You Asked, We Delivered!',
        content: `Hi [First Name],

The wait is over! We're excited to announce the launch of [Product Name].

Here's what makes it special:
✨ [Key Feature 1]
✨ [Key Feature 2] 
✨ [Key Feature 3]

Early Bird Special: Get 20% off for the first 48 hours!

[CTA Button: Get Started Now]

Questions? Just reply to this email.

Cheers,
[Your Name]`
      }
    },
    {
      id: 3,
      name: 'Re-engagement',
      description: 'Win back inactive users with personalized content',
      type: 'sequence',
      emails: 3,
      category: 'retention',
      preview: 'We miss you! Here\'s what you\'ve been missing...',
      template: {
        subject: 'We miss you, [First Name] 💔',
        content: `Hi [First Name],

We noticed you haven't been active lately, and we wanted to reach out.

Since you've been away, here's what's new:
• [Recent Update 1]
• [Recent Update 2]
• [Recent Update 3]

We'd love to have you back! Here's a special offer just for you:
[Special Offer Details]

[CTA Button: Come Back Now]

Miss us too? Just hit reply and let us know what we can do better.

Best,
The [Company Name] Team`
      }
    },
    {
      id: 4,
      name: 'Lead Nurture',
      description: 'Educational content to warm up cold leads',
      type: 'sequence',
      emails: 7,
      category: 'sales',
      preview: 'Here\'s how [Industry] leaders are solving [Problem]...',
      template: {
        subject: 'How [Industry] Leaders Solve [Common Problem]',
        content: `Hi [First Name],

I've been researching how companies like yours tackle [specific challenge], and I found some interesting insights.

Top-performing companies are doing 3 things differently:

1. [Strategy 1] - This alone increased efficiency by 40%
2. [Strategy 2] - Reduced costs while improving quality
3. [Strategy 3] - Scaled without adding overhead

I've put together a detailed case study showing exactly how they did it.

[CTA Button: Get the Case Study]

Worth a quick look?

Best regards,
[Your Name]`
      }
    },
    {
      id: 5,
      name: 'Event Invitation',
      description: 'Professional invitation for webinars and events',
      type: 'single',
      emails: 1,
      category: 'events',
      preview: 'You\'re invited to our exclusive [Event Type]...',
      template: {
        subject: '🎯 Exclusive Invitation: [Event Name] - [Date]',
        content: `Hi [First Name],

You're personally invited to our exclusive [Event Type]:

📅 **[Event Name]**
🗓️ Date: [Event Date]
⏰ Time: [Event Time]
📍 Location: [Event Location/Virtual]

What you'll learn:
• [Key Takeaway 1]
• [Key Takeaway 2]
• [Key Takeaway 3]

Plus: Q&A session with industry experts!

Limited spots available - only [Number] seats left.

[CTA Button: Reserve My Spot]

See you there!

[Your Name]
[Title]`
      }
    },
    {
      id: 6,
      name: 'Follow-up Sequence',
      description: 'Professional follow-up after meetings or demos',
      type: 'sequence',
      emails: 4,
      category: 'sales',
      preview: 'Thanks for your time today - here\'s what we discussed...',
      template: {
        subject: 'Following up on our conversation',
        content: `Hi [First Name],

Thanks for taking the time to speak with me today about [Topic Discussed].

As promised, here's a summary of what we covered:
• [Key Point 1]
• [Key Point 2]
• [Next Steps]

I've also attached [Resource/Document] that addresses the [specific challenge] you mentioned.

Next steps:
1. [Action Item 1]
2. [Action Item 2]
3. [Proposed Meeting/Call]

What works best for your schedule?

Best regards,
[Your Name]`
      }
    }
  ];

  // Load campaigns and stats
  useEffect(() => {
    if (tenant?.id) {
      loadCampaigns();
      loadStats();
    }
  }, [tenant?.id]);

  const loadCampaigns = async () => {
    try {
      // In production, this would fetch from Firebase/database
      // For now, using demo data
      setCampaigns([
        {
          id: 1,
          name: 'Welcome New Users',
          type: 'Email Sequence',
          status: 'active',
          recipients: 1247,
          openRate: 24.5,
          clickRate: 3.2,
          created: new Date().toISOString(),
          channels: ['email'],
          description: 'Automated welcome sequence for new sign-ups'
        },
        {
          id: 2,
          name: 'Product Launch 2024',
          type: 'Multi-Channel',
          status: 'scheduled',
          recipients: 3542,
          openRate: 0,
          clickRate: 0,
          created: new Date().toISOString(),
          channels: ['email', 'sms', 'social'],
          description: 'Launch campaign for Q4 product release'
        }
      ]);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
    }
  };

  const loadStats = async () => {
    try {
      // Calculate stats from campaigns
      const totalEmails = campaigns.reduce((sum, campaign) => {
        return campaign.channels.includes('email') ? sum + campaign.recipients : sum;
      }, 0);
      
      const totalSMS = campaigns.reduce((sum, campaign) => {
        return campaign.channels.includes('sms') ? sum + campaign.recipients : sum;
      }, 0);
      
      const totalSocial = campaigns.reduce((sum, campaign) => {
        return campaign.channels.includes('social') ? sum + (campaign.recipients * 0.1) : sum;
      }, 0);

      setStats({
        emailsSent: totalEmails || 1200,
        smsSent: totalSMS || 800,
        socialPosts: Math.floor(totalSocial) || 350,
        activecampaigns: campaigns.filter(c => c.status === 'active').length,
        totalRecipients: campaigns.reduce((sum, c) => sum + c.recipients, 0),
        avgOpenRate: campaigns.length > 0 
          ? campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length 
          : 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const createCampaign = async (e) => {
    e.preventDefault();
    
    if (!campaignForm.name || !campaignForm.type) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const newCampaign = {
        id: Date.now(),
        name: campaignForm.name,
        type: campaignForm.type,
        status: 'draft',
        recipients: 0,
        openRate: 0,
        clickRate: 0,
        created: new Date().toISOString(),
        channels: campaignForm.channels,
        description: campaignForm.description,
        audience: campaignForm.audience,
        scheduleDate: campaignForm.scheduleDate
      };

      setCampaigns(prev => [...prev, newCampaign]);
      setCampaignForm({
        name: '',
        type: '',
        audience: '',
        scheduleDate: '',
        description: '',
        channels: []
      });
      setShowCampaignForm(false);
      toast.success('Campaign created successfully!');
      
      // Reload stats
      loadStats();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const useTemplate = (template) => {
    setCampaignForm({
      name: `${template.name} Campaign`,
      type: 'Email Sequence',
      audience: '',
      scheduleDate: '',
      description: template.description,
      channels: ['email']
    });
    setSelectedTemplate(template);
    setShowTemplateModal(false);
    setShowCampaignForm(true);
    toast.success(`${template.name} template loaded!`);
  };

  const pauseCampaign = (campaignId) => {
    setCampaigns(prev => prev.map(campaign =>
      campaign.id === campaignId
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' }
        : campaign
    ));
    toast.success('Campaign status updated');
  };

  const deleteCampaign = (campaignId) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
    toast.success('Campaign deleted');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
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
          <div className="text-3xl font-bold text-orange-600">{stats.activeCompaigns}</div>
          <div className="text-sm text-gray-500">Running now</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campaign Management */}
        <div className="space-y-6">
          {/* Create Campaign */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Target Audience"
                    value={campaignForm.audience}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, audience: e.target.value }))}
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="datetime-local"
                    value={campaignForm.scheduleDate}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduleDate: e.target.value }))}
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <textarea
                  placeholder="Campaign Description"
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Campaign
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
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
                        {campaign.description && (
                          <p className="text-xs text-gray-500 mt-1">{campaign.description}</p>
                        )}
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
                      <button
                        onClick={() => pauseCampaign(campaign.id)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          campaign.status === 'active' 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {campaign.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                      <button className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                        Analytics
                      </button>
                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Templates */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Templates</h2>
          
          <div className="space-y-4">
            {emailTemplates.map(template => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>📧 {template.emails} email{template.emails > 1 ? 's' : ''}</span>
                      <span>📂 {template.category}</span>
                      <span>📝 {template.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm text-gray-600 italic">"{template.preview}"</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => useTemplate(template)}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowTemplateModal(true);
                    }}
                    className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm"
                  >
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                📧 {selectedTemplate.name} Template
              </h3>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplate(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line:</label>
                <div className="bg-gray-50 border rounded-lg p-3">
                  <code className="text-sm">{selectedTemplate.template.subject}</code>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Content:</label>
                <div className="bg-gray-50 border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">{selectedTemplate.template.content}</pre>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplate(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => useTemplate(selectedTemplate)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutreachAutomation;