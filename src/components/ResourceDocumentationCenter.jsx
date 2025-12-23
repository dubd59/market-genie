import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';

const ResourceDocumentationCenter = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Active section state
  const [activeSection, setActiveSection] = useState('user-manual');
  
  // Detailed content state
  const [expandedUserSection, setExpandedUserSection] = useState(null);
  const [expandedWhiteLabelSection, setExpandedWhiteLabelSection] = useState(null);
  const [expandedAPISection, setExpandedAPISection] = useState(null);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Helper function to update classes with dark mode support
  const getDarkModeClasses = (lightClasses, darkClasses = '') => {
    const dark = darkClasses || lightClasses.replace('bg-white', 'bg-gray-800').replace('text-gray-900', 'text-white').replace('text-gray-700', 'text-gray-300')
    return isDarkMode ? dark : lightClasses
  }
  
  // Check for dark mode preference and listen for changes
  useEffect(() => {
    const checkDarkMode = () => {
      const saved = localStorage.getItem('marketGenieDarkMode');
      const isDark = saved ? JSON.parse(saved) : false;
      console.log('ResourceDocumentationCenter - Dark mode:', isDark, 'localStorage value:', saved); // Debug
      setIsDarkMode(isDark);
    };
    
    // Check initially
    checkDarkMode();
    
    // Poll for changes every 100ms (simple but effective)
    const interval = setInterval(checkDarkMode, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Documentation sections data
  const documentationSections = [
    {
      id: 'user-manual',
      title: 'User Manual',
      icon: '📖',
      description: 'Complete guide to using all application features',
      category: 'Getting Started'
    },
    {
      id: 'white-label-guide',
      title: 'White Label SaaS Guide',
      icon: '🏷️',
      description: 'Partner program, revenue sharing, and custom branding',
      category: 'Partnership'
    },
    {
      id: 'api-integrations',
      title: 'API Keys & Integrations',
      icon: '🔗',
      description: 'Setup guides for all third-party services',
      category: 'Technical'
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting Guide',
      icon: '🔧',
      description: 'Common issues and their solutions',
      category: 'Support'
    },
    {
      id: 'video-tutorials',
      title: 'Video Tutorials',
      icon: '🎥',
      description: 'Step-by-step video walkthroughs',
      category: 'Learning'
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      icon: '🔒',
      description: 'How we collect, use, and protect your information',
      category: 'Legal'
    },
    {
      id: 'terms-of-service',
      title: 'Terms of Service',
      icon: '📋',
      description: 'User agreement and service terms',
      category: 'Legal'
    },
    {
      id: 'support-contact',
      title: 'Support & Contact',
      icon: '📞',
      description: 'Get help from our technical support team',
      category: 'Support'
    }
  ];

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = documentationSections.filter(section =>
      section.title.toLowerCase().includes(query.toLowerCase()) ||
      section.description.toLowerCase().includes(query.toLowerCase()) ||
      section.category.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  // User Manual Content
  const UserManualContent = () => (
    <div className="space-y-8">
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}`}>
        <h2 className="text-2xl font-bold mb-4" style={isDarkMode ? { color: '#38beba' } : { color: '#1f2937' }}>📖 Complete User Manual</h2>
        <p className="mb-4" style={isDarkMode ? { color: '#38beba' } : { color: '#4b5563' }}>Master every feature of Market Genie with our comprehensive user guide. Click any section below for detailed instructions.</p>
      </div>

      <div className="space-y-6">
        {/* Getting Started */}
        <div className={`rounded-lg p-6 shadow-lg ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={isDarkMode ? { color: '#38beba' } : { color: '#1f2937' }}>
            <span>🚀</span> Getting Started
          </h3>
          
          {expandedUserSection !== 'getting-started' ? (
            <>
              <ul className="space-y-3" style={isDarkMode ? { color: '#38beba' } : { color: '#374151' }}>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Account setup and first login</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Dashboard navigation and layout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>User profile and settings configuration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Understanding subscription plans</span>
                </li>
              </ul>
              <button 
                onClick={() => setExpandedUserSection('getting-started')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
              >
                📖 View Detailed Guide
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedUserSection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">🔐 Account Setup & First Login</h4>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 1: Creating Your Account</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Visit the Market Genie signup page - Navigate to our secure registration portal where you'll begin your journey to automated lead generation and business growth.</li>
                        <li>Enter your business email address - Use your primary business email as this will be your main communication channel for notifications, lead alerts, and important account updates.</li>
                        <li>Create a strong password (minimum 8 characters) - Choose a password that includes uppercase letters, numbers, and special characters to ensure maximum security for your valuable business data.</li>
                        <li>Verify your email address by clicking the confirmation link - Check your inbox (and spam folder) for our verification email and click the secure link to activate your account within 24 hours.</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 2: Initial Login Process</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Return to the login page after email verification - Access our secure login portal using the same credentials you created during registration.</li>
                        <li>Enter your credentials and click "Sign In" - Input your verified email and password, then click the secure sign-in button to access your personalized dashboard.</li>
                        <li>Complete the onboarding wizard (business details, goals) - Follow our guided setup process to configure your business profile, target markets, and lead generation objectives for optimal results.</li>
                        <li>Choose your subscription plan (Free, Pro, or Enterprise) - Select the plan that best fits your business needs, with options ranging from our free starter tier to enterprise-level features and support.</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 3: Security Setup</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Enable two-factor authentication (recommended) - Add an extra layer of security to protect your business data by enabling SMS or authenticator app verification for all login attempts.</li>
                        <li>Set up recovery email and phone number - Provide backup contact information to ensure you can always regain access to your account, even if your primary credentials are compromised.</li>
                        <li>Review privacy settings and data preferences - Customize how your data is used, what notifications you receive, and which features have access to your business information.</li>
                        <li>Accept terms of service and privacy policy - Review and acknowledge our comprehensive legal agreements that protect both your business and our service standards.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-3">🧭 Dashboard Navigation & Layout</h4>
                  <div className="space-y-3 text-sm text-green-700">
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Main Navigation Sidebar</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>SuperGenie Dashboard:</strong> Overview of all activities and metrics - Your central command center displaying real-time analytics, campaign performance, and key business insights at a glance.</li>
                        <li><strong>Lead Generation:</strong> Tools for finding and capturing prospects - Access powerful scraping tools, database searches, and lead capture forms to build your sales pipeline efficiently.</li>
                        <li><strong>Outreach Automation:</strong> Email and LinkedIn campaign management - Create, schedule, and monitor personalized outreach sequences with advanced automation and A/B testing capabilities.</li>
                        <li><strong>CRM & Pipeline:</strong> Customer relationship management - Organize leads, track interactions, manage deal stages, and monitor your entire sales funnel from prospect to customer.</li>
                        <li><strong>Appointments:</strong> Booking and calendar integration - Seamlessly schedule meetings with integrated calendar sync, automated reminders, and professional booking pages.</li>
                        <li><strong>API Keys & Integrations:</strong> Third-party service connections - Configure and manage all external service integrations including Prospeo, Hunter, Firecrawl, and email providers.</li>
                        <li><strong>Resources & Docs:</strong> This documentation center - Access comprehensive guides, tutorials, troubleshooting help, and best practices for maximizing your success.</li>
                        <li><strong>White-Label SaaS:</strong> Partner program and reseller tools - Explore partnership opportunities, revenue sharing programs, and white-label solutions for scaling your business.</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Header Features</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Search bar for quick navigation - Instantly find any feature, contact, campaign, or setting using our intelligent search that learns from your usage patterns.</li>
                        <li>Notification bell for important updates - Stay informed about campaign completions, new leads, system updates, and urgent items requiring your attention.</li>
                        <li>User profile dropdown with settings - Access your account preferences, subscription details, security settings, and logout options from any page.</li>
                        <li>Subscription plan indicator - View your current plan status, usage limits, and upgrade options to ensure you're maximizing your account benefits.</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Action Buttons</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>+ New Campaign: Start email or LinkedIn outreach - Launch targeted campaigns with pre-built templates, personalization options, and automated follow-up sequences.</li>
                        <li>+ Add Leads: Import or manually add prospects - Upload CSV files, integrate with existing databases, or add contacts individually with automatic data enrichment.</li>
                        <li>+ Schedule Meeting: Book appointments with leads - Send professional booking links, sync with your calendar, and automate confirmation emails and reminders.</li>
                        <li>AI Assistant: Get help with any task - Access our intelligent chatbot for instant support, feature explanations, and guided workflows for complex processes.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-3">👤 User Profile & Settings</h4>
                  <div className="space-y-3 text-sm text-purple-700">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Information</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Update your name, title, and company information - Keep your professional details current to ensure personalized communications and accurate team member identification.</li>
                        <li>Upload professional profile photo - Add a high-quality headshot that will appear in email signatures, meeting invitations, and team directories for better engagement.</li>
                        <li>Set timezone and language preferences - Configure your location settings to ensure accurate scheduling, reporting timestamps, and localized content delivery.</li>
                        <li>Configure email signature for outreach - Design professional email signatures with your contact information, social links, and branding that automatically append to all outbound communications.</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notification Preferences</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Email notifications for new leads and responses - Customize when and how you receive alerts about incoming leads, prospect replies, and campaign engagement activity.</li>
                        <li>Push notifications for urgent items - Set up instant browser or mobile alerts for high-priority events like hot leads, expired campaigns, or system issues requiring immediate attention.</li>
                        <li>Weekly/monthly performance reports - Schedule automated summaries of your campaign results, lead generation metrics, and business growth indicators delivered to your inbox.</li>
                        <li>System maintenance and update alerts - Stay informed about planned downtime, new feature releases, and important security updates that may affect your workflow.</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Security Settings</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Change password and enable 2FA - Update your login credentials regularly and add two-factor authentication for enterprise-grade security protection of your business data.</li>
                        <li>Manage active sessions and devices - Monitor all logged-in devices and locations, with the ability to remotely terminate suspicious sessions for enhanced account security.</li>
                        <li>Set data retention preferences - Control how long your data is stored, configure automatic deletion schedules, and manage compliance with industry regulations.</li>
                        <li>Configure privacy and sharing settings - Determine what information is shared with integrations, team members, and third-party services while maintaining full control over your data.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-800 mb-3">💳 Understanding Subscription Plans</h4>
                  <div className="space-y-3 text-sm text-orange-700">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="border border-orange-200 rounded-lg p-3">
                        <h5 className="font-bold">Free Plan</h5>
                        <ul className="mt-2 space-y-1 text-xs list-disc ml-4">
                          <li>Up to 100 leads per month - Perfect for testing our platform and small-scale prospecting with basic lead generation capabilities.</li>
                          <li>Basic email templates - Access to essential email templates with limited customization options for simple outreach campaigns.</li>
                          <li>Manual lead import - Upload leads individually or via CSV files with standard data fields and basic validation.</li>
                          <li>Community support - Get help through our user community forum with peer assistance and basic documentation access.</li>
                        </ul>
                      </div>
                      <div className="border border-orange-200 rounded-lg p-3">
                        <h5 className="font-bold">Pro Plan ($97/month)</h5>
                        <ul className="mt-2 space-y-1 text-xs list-disc ml-4">
                          <li>Unlimited leads - Generate and store unlimited prospects with no monthly caps, perfect for aggressive growth strategies.</li>
                          <li>AI-powered automation - Advanced machine learning algorithms optimize your campaigns, personalization, and follow-up timing for maximum conversion rates.</li>
                          <li>Advanced analytics - Comprehensive reporting dashboards with ROI tracking, conversion metrics, and predictive insights for data-driven decisions.</li>
                          <li>Priority support - Direct access to our technical support team with guaranteed response times and dedicated account management.</li>
                          <li>CRM integration - Seamless connection with popular CRM platforms like Salesforce, HubSpot, and Pipedrive for unified workflow management.</li>
                        </ul>
                      </div>
                      <div className="border border-orange-200 rounded-lg p-3">
                        <h5 className="font-bold">Enterprise ($297/month)</h5>
                        <ul className="mt-2 space-y-1 text-xs list-disc ml-4">
                          <li>Everything in Pro - All advanced features plus enterprise-grade scalability and security for large organizations and agencies.</li>
                          <li>White-label access - Complete rebranding capabilities allowing you to offer Market Genie as your own service with custom domains and branding.</li>
                          <li>Custom integrations - Bespoke API connections and custom development work to integrate with your existing business systems and workflows.</li>
                          <li>Dedicated support - Personal account manager, priority technical support, and custom training sessions for your team members.</li>
                          <li>Advanced reporting - Enterprise-level analytics with custom dashboards, API access, and white-labeled reporting for client presentations.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lead Generation */}
        <div className={`rounded-lg p-6 shadow-lg ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={isDarkMode ? { color: '#38beba' } : { color: '#1f2937' }}>
            <span>🎯</span> Lead Generation
          </h3>
          
          {expandedUserSection !== 'lead-generation' ? (
            <>
              <ul className="space-y-3" style={isDarkMode ? { color: '#38beba' } : { color: '#374151' }}>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Lead scraper setup and configuration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Social media lead discovery (LinkedIn, Twitter)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Lead scoring and qualification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Export and management tools</span>
                </li>
              </ul>
              <button 
                onClick={() => setExpandedUserSection('lead-generation')}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full"
              >
                🎯 View Complete Lead Generation Guide
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedUserSection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-3">🔧 Lead Scraper Setup & Configuration</h4>
                  <div className="space-y-3 text-sm text-green-700">
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Initial Setup</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Navigate to "Lead Generation" in the sidebar - Access the comprehensive lead discovery tools from your main dashboard menu for immediate prospecting capabilities.</li>
                        <li>Click "Configure Lead Scraper" button - Launch the setup wizard that will guide you through connecting data sources and setting targeting parameters.</li>
                        <li>Connect your Prospeo API key (required for email finding) - Integrate your Prospeo account to enable automatic email discovery and verification for maximum deliverability rates.</li>
                        <li>Set your target market criteria (industry, company size, location) - Define your ideal customer profile to ensure the system finds the most relevant prospects for your business.</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Search Criteria Configuration</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Industry Targeting:</strong> Select specific industries or use broad categories - Choose from over 500 industry classifications to find prospects in your exact market niche with precision targeting.</li>
                        <li><strong>Company Size:</strong> Filter by employee count (1-10, 11-50, 51-200, 200+) - Target organizations that match your ideal customer size for better conversion rates and resource allocation.</li>
                        <li><strong>Geographic Location:</strong> Target by country, state, or city - Narrow your search to specific regions where you operate or want to expand your business presence.</li>
                        <li><strong>Job Titles:</strong> Specify decision-maker roles (CEO, Marketing Manager, etc.) - Focus on contacts with purchasing authority and budget control to maximize your sales efficiency.</li>
                        <li><strong>Keywords:</strong> Add relevant business keywords for more precise targeting - Use industry-specific terms, technology mentions, or business challenges to find highly qualified prospects.</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Advanced Filters</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Revenue ranges for company financial targeting - Filter prospects by annual revenue to ensure you're targeting companies with appropriate budgets for your products or services.</li>
                        <li>Technology stack filters (uses Salesforce, HubSpot, etc.) - Find companies using specific tools or platforms that indicate compatibility with your solutions or readiness for your services.</li>
                        <li>Funding stage for startups (Seed, Series A, B, C+) - Target high-growth companies at the right funding stage for optimal timing and budget availability for new purchases.</li>
                        <li>Recent news mentions or company growth indicators - Identify prospects experiencing growth, funding, expansions, or other trigger events that create buying opportunities.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">📱 Social Media Lead Discovery</h4>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>LinkedIn Lead Discovery</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Set up LinkedIn Sales Navigator integration - Connect your Sales Navigator account to access premium LinkedIn search capabilities and advanced filtering options.</li>
                        <li>Use Boolean search operators for precise targeting - Master advanced search syntax with AND, OR, NOT operators to create highly specific prospect queries that find exactly who you need.</li>
                        <li>Monitor company pages for new hires and promotions</li>
                        <li>Extract leads from industry groups and events</li>
                        <li>Track engagement on posts to identify active prospects</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Twitter/X Lead Mining</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Follow industry hashtags and conversations</li>
                        <li>Identify prospects asking questions in your niche</li>
                        <li>Monitor competitor followers for potential customers</li>
                        <li>Engage with relevant threads to build relationships</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Social Listening Setup</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Configure keyword monitoring for pain points</li>
                        <li>Set up alerts for competitor mentions</li>
                        <li>Track industry events and conference attendees</li>
                        <li>Monitor startup accelerator programs</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-3">⭐ Lead Scoring & Qualification</h4>
                  <div className="space-y-3 text-sm text-purple-700">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Automatic Scoring Criteria</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Company Size (30 points):</strong> Larger companies score higher</li>
                        <li><strong>Industry Match (25 points):</strong> Perfect industry fit gets full points</li>
                        <li><strong>Job Title Relevance (20 points):</strong> Decision-makers score highest</li>
                        <li><strong>Geographic Preference (15 points):</strong> Local/preferred regions</li>
                        <li><strong>Technology Stack (10 points):</strong> Uses complementary tools</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Manual Qualification Process</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Review company website and recent news</li>
                        <li>Check LinkedIn profiles for recent activity</li>
                        <li>Verify email addresses using built-in validator</li>
                        <li>Research potential pain points and challenges</li>
                        <li>Identify mutual connections or warm introductions</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead Categorization</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Hot Leads (80-100 points):</strong> Perfect fit, immediate outreach</li>
                        <li><strong>Warm Leads (60-79 points):</strong> Good potential, standard sequence</li>
                        <li><strong>Cold Leads (40-59 points):</strong> Longer nurture sequence</li>
                        <li><strong>Research Needed (&lt;40 points):</strong> Require manual review</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-800 mb-3">📊 Export & Management Tools</h4>
                  <div className="space-y-3 text-sm text-orange-700">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Export Options</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>CSV Export:</strong> Standard spreadsheet format for external tools</li>
                        <li><strong>CRM Integration:</strong> Direct sync to Salesforce, HubSpot, Pipedrive</li>
                        <li><strong>Email Marketing:</strong> Export to Mailchimp, ConvertKit, ActiveCampaign</li>
                        <li><strong>Custom Fields:</strong> Include scoring, notes, and qualification status</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>List Management</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Create custom lists by industry, score, or criteria</li>
                        <li>Set up automatic list updates based on new leads</li>
                        <li>Duplicate detection and merge functionality</li>
                        <li>Bulk actions for updating, tagging, or deleting</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead Lifecycle Tracking</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Track lead source and acquisition date</li>
                        <li>Monitor outreach attempts and responses</li>
                        <li>Record meeting scheduled and outcomes</li>
                        <li>Measure conversion rates by source and criteria</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Funnel Builder */}
        <div className={`rounded-lg p-6 shadow-lg ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={isDarkMode ? { color: '#38beba' } : { color: '#1f2937' }}>
            <span>🤖</span> AI Funnel Builder
          </h3>
          
          {expandedUserSection !== 'ai-funnel-builder' ? (
            <>
              <ul className="space-y-3" style={isDarkMode ? { color: '#38beba' } : { color: '#374151' }}>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Creating your first AI-generated funnel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Customizing funnel templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>A/B testing and optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Deployment and tracking</span>
                </li>
              </ul>
              <button 
                onClick={() => setExpandedUserSection('ai-funnel-builder')}
                className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full"
              >
                🤖 View AI Funnel Builder Masterclass
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedUserSection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-3">🚀 Creating Your First AI-Generated Funnel</h4>
                  <div className="space-y-3 text-sm text-purple-700">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 1: Define Your Funnel Goal</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Navigate to AI Funnel Builder from the main menu</li>
                        <li>Click "Create New Funnel" button</li>
                        <li>Select your primary objective: Lead Generation, Sales, Webinar Registration, or Product Launch</li>
                        <li>Define your target audience and their pain points</li>
                        <li>Set your conversion goal and success metrics</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 2: AI Prompt Configuration</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Describe your business and unique value proposition</li>
                        <li>Provide details about your ideal customer</li>
                        <li>Specify your industry and competitive landscape</li>
                        <li>Include any specific requirements or constraints</li>
                        <li>Choose your preferred tone and style (professional, casual, urgent, etc.)</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 3: AI Generation Process</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>AI analyzes your inputs and generates funnel structure</li>
                        <li>Creates compelling headlines and copy for each page</li>
                        <li>Designs optimal user flow and conversion points</li>
                        <li>Generates email sequences for follow-up</li>
                        <li>Suggests images, colors, and design elements</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 4: Review and Refine</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Review the generated funnel structure and content</li>
                        <li>Make adjustments to messaging and flow</li>
                        <li>Customize design elements to match your brand</li>
                        <li>Test all forms and conversion elements</li>
                        <li>Preview the funnel on desktop and mobile</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">🎨 Customizing Funnel Templates</h4>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Design Customization</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Upload your logo and brand assets</li>
                        <li>Customize color scheme to match your brand</li>
                        <li>Choose from 20+ professional fonts</li>
                        <li>Adjust spacing, margins, and layout elements</li>
                        <li>Add custom CSS for advanced styling</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Content Optimization</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Edit headlines and subheadings for impact</li>
                        <li>Customize call-to-action buttons and text</li>
                        <li>Add testimonials and social proof elements</li>
                        <li>Include video content and interactive elements</li>
                        <li>Optimize form fields for higher conversion</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Advanced Features</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Add countdown timers for urgency</li>
                        <li>Implement exit-intent popups</li>
                        <li>Set up progressive profiling forms</li>
                        <li>Configure conditional logic and branching</li>
                        <li>Integrate with payment processors</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-3">📊 A/B Testing & Optimization</h4>
                  <div className="space-y-3 text-sm text-green-700">
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Setting Up A/B Tests</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Create variant versions of your funnel pages</li>
                        <li>Test different headlines, images, and CTAs</li>
                        <li>Experiment with various pricing strategies</li>
                        <li>Try different form lengths and field types</li>
                        <li>Test various color schemes and layouts</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tracking and Analytics</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Monitor conversion rates for each variant</li>
                        <li>Track user behavior with heatmaps</li>
                        <li>Analyze drop-off points in the funnel</li>
                        <li>Measure time spent on each page</li>
                        <li>Calculate statistical significance</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Optimization Strategies</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Implement winning variants automatically</li>
                        <li>Continuous optimization based on performance</li>
                        <li>Seasonal adjustments and campaign updates</li>
                        <li>Mobile-specific optimizations</li>
                        <li>Loading speed improvements</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-800 mb-3">🚀 Deployment & Tracking</h4>
                  <div className="space-y-3 text-sm text-orange-700">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Deployment Options</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Hosted on Market Genie:</strong> Use our subdomain (yourfunnel.marketgenie.com)</li>
                        <li><strong>Custom Domain:</strong> Connect your own domain name</li>
                        <li><strong>Embed Code:</strong> Add to existing website pages</li>
                        <li><strong>WordPress Plugin:</strong> Seamless WordPress integration</li>
                        <li><strong>Landing Page:</strong> Standalone page for campaigns</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Performance Tracking</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Real-time visitor and conversion analytics</li>
                        <li>Traffic source attribution and ROI tracking</li>
                        <li>Goal completion and revenue reporting</li>
                        <li>Email integration for lead nurturing</li>
                        <li>CRM synchronization for sales follow-up</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Integration Setup</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Connect Google Analytics and Facebook Pixel</li>
                        <li>Set up email marketing automation triggers</li>
                        <li>Configure CRM lead capture and scoring</li>
                        <li>Enable payment processing and order tracking</li>
                        <li>Set up webhook notifications for key events</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Outreach Automation */}
        <div className={`rounded-lg p-6 shadow-lg ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={isDarkMode ? { color: '#38beba' } : { color: '#1f2937' }}>
            <span>📧</span> Outreach Automation
          </h3>
          
          {expandedUserSection !== 'outreach-automation' ? (
            <>
              <ul className="space-y-3" style={isDarkMode ? { color: '#38beba' } : { color: '#374151' }}>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Email campaign creation and scheduling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>LinkedIn connection automation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Multi-channel follow-up sequences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Performance analytics and optimization</span>
                </li>
              </ul>
              <button 
                onClick={() => setExpandedUserSection('outreach-automation')}
                className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors w-full"
              >
                📧 Master Outreach Automation
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedUserSection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-800 mb-3">📧 Email Campaign Creation & Scheduling</h4>
                  <div className="space-y-3 text-sm text-orange-700">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Campaign Setup</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Navigate to "Outreach Automation" from main menu - Access the campaign builder where you'll create sophisticated multi-touch sequences that nurture prospects automatically.</li>
                        <li>Click "Create New Campaign" and select "Email Campaign" - Launch the campaign wizard that guides you through setting up professional outreach sequences with proven templates.</li>
                        <li>Choose campaign type: Cold Outreach, Nurture Sequence, or Product Launch - Select the appropriate campaign framework designed for your specific business objectives and target audience behavior.</li>
                        <li>Set campaign goals and success metrics - Define measurable objectives like open rates, reply rates, meeting bookings, or sales conversions to track campaign effectiveness.</li>
                        <li>Select your target lead list or import contacts - Choose from your existing prospect database or upload new contacts with automatic data validation and enrichment.</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email Sequence Builder</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Design your email sequence (typically 3-7 emails) - Create a strategic series of touchpoints that gradually build trust and move prospects through your sales funnel effectively.</li>
                        <li>Set delays between emails (3-5 days recommended) - Schedule appropriate intervals that maintain engagement without overwhelming prospects, based on industry best practices.</li>
                        <li>Use AI-powered subject line generation - Leverage machine learning algorithms to create compelling subject lines that maximize open rates and avoid spam filters.</li>
                        <li>Personalize content with dynamic fields (name, company, etc.) - Insert custom variables that automatically populate with prospect-specific information for authentic, tailored messaging.</li>
                        <li>Include clear call-to-action buttons - Add prominent, trackable CTA buttons that guide prospects to your desired next step with professional design and compelling copy.</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email Templates & Content</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Email 1:</strong> Introduction and value proposition - Create a compelling first impression that quickly communicates how you solve their specific business challenges.</li>
                        <li><strong>Email 2:</strong> Social proof and case studies - Share relevant success stories and testimonials that demonstrate proven results for similar companies or situations.</li>
                        <li><strong>Email 3:</strong> Address common objections - Proactively handle typical concerns about price, timing, implementation, or competitor comparisons with factual responses.</li>
                        <li><strong>Email 4:</strong> Limited-time offer or urgency - Introduce time-sensitive incentives or exclusive opportunities that encourage prompt decision-making and action.</li>
                        <li><strong>Email 5:</strong> Final attempt with alternative offer - Provide a different approach, smaller commitment option, or resource that maintains the relationship even if not ready to buy.</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Scheduling & Timing</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Optimal send times: Tuesday-Thursday, 10 AM or 2 PM - Schedule emails during peak business hours when prospects are most likely to check and respond to professional communications.</li>
                        <li>Avoid Mondays and Fridays for business outreach - Respect busy start-of-week planning and end-of-week wrap-up periods when decision-makers have limited attention for new opportunities.</li>
                        <li>Consider timezone differences for global campaigns - Automatically adjust send times based on recipient locations to ensure messages arrive during their local business hours for maximum impact.</li>
                        <li>Use A/B testing for optimal timing - Experiment with different send times and days to discover what works best for your specific audience and industry vertical.</li>
                        <li>Set up automatic follow-ups based on engagement</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">💼 LinkedIn Connection Automation</h4>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>LinkedIn Setup & Safety</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Connect your LinkedIn account through secure OAuth</li>
                        <li>Configure daily limits to avoid account restrictions</li>
                        <li>Use realistic human-like timing between actions</li>
                        <li>Maintain a 90%+ connection acceptance rate</li>
                        <li>Monitor for any LinkedIn warning messages</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Connection Request Strategy</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Research prospects before sending connection requests</li>
                        <li>Personalize connection messages (not generic)</li>
                        <li>Mention mutual connections or common interests</li>
                        <li>Keep messages under 200 characters</li>
                        <li>Focus on providing value, not selling</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Follow-up Sequence</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Day 1:</strong> Send connection request</li>
                        <li><strong>Day 3:</strong> Thank you message after acceptance</li>
                        <li><strong>Day 7:</strong> Share valuable content or insight</li>
                        <li><strong>Day 14:</strong> Soft pitch or meeting request</li>
                        <li><strong>Day 21:</strong> Final follow-up with case study</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Engagement Tactics</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Like and comment on prospect's posts</li>
                        <li>Share their content with thoughtful commentary</li>
                        <li>Endorse skills and congratulate on achievements</li>
                        <li>Invite to relevant LinkedIn events or groups</li>
                        <li>Send valuable industry reports or insights</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-3">📞 Multi-Channel Follow-up Sequences</h4>
                  <div className="space-y-3 text-sm text-green-700">
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Channel Integration Strategy</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Start with LinkedIn connection request</li>
                        <li>Follow with email after connection acceptance</li>
                        <li>Use phone calls for high-value prospects</li>
                        <li>Add social media engagement throughout</li>
                        <li>Send direct mail for enterprise prospects</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Coordinated Messaging</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Maintain consistent messaging across all channels</li>
                        <li>Reference previous touchpoints in follow-ups</li>
                        <li>Adjust tone for each platform appropriately</li>
                        <li>Track engagement across all channels</li>
                        <li>Coordinate timing to avoid overwhelming prospects</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Response Management</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Set up automatic reply detection</li>
                        <li>Pause sequences when prospects respond</li>
                        <li>Route qualified leads to sales team</li>
                        <li>Handle unsubscribe requests automatically</li>
                        <li>Track conversation history across channels</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-3">📊 Performance Analytics & Optimization</h4>
                  <div className="space-y-3 text-sm text-purple-700">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Key Metrics to Track</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Open Rates:</strong> Target 25-30% for cold emails</li>
                        <li><strong>Click-through Rates:</strong> Aim for 3-5% CTR</li>
                        <li><strong>Response Rates:</strong> 5-15% depending on targeting</li>
                        <li><strong>Meeting Booking Rate:</strong> 1-3% of total contacts</li>
                        <li><strong>LinkedIn Acceptance Rate:</strong> 30-50% is good</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>A/B Testing Elements</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Subject lines and preview text</li>
                        <li>Email send times and days of week</li>
                        <li>Message length and formatting</li>
                        <li>Call-to-action placement and wording</li>
                        <li>Personalization level and approach</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Optimization Strategies</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Regularly clean and update email lists</li>
                        <li>Refine targeting based on response data</li>
                        <li>Update templates based on performance</li>
                        <li>Adjust send frequency and timing</li>
                        <li>Implement feedback from sales team</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reporting Dashboard</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Real-time campaign performance overview</li>
                        <li>Individual email and sequence analytics</li>
                        <li>Lead scoring and qualification tracking</li>
                        <li>ROI and revenue attribution reporting</li>
                        <li>Automated weekly performance summaries</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-bold text-yellow-800 mb-2">💡 Pro Tips for Success</h3>
        <ul className="space-y-2 text-yellow-700">
          <li>• Start with lead generation to build your prospect database</li>
          <li>• Use AI funnel builder for high-converting landing pages</li>
          <li>• Set up automated follow-up sequences for consistent outreach</li>
          <li>• Monitor analytics regularly to optimize your campaigns</li>
          <li>• Always provide value before asking for anything</li>
          <li>• Test everything and iterate based on results</li>
        </ul>
      </div>
    </div>
  );

  // White Label Guide Content
  const WhiteLabelGuideContent = () => (
    <div className="space-y-8">
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-700' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'}`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>🏷️ White Label SaaS Partner Guide</h2>
        <p className={`mb-4 ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>Everything you need to know about our white label partnership program and revenue sharing. Click any section for detailed instructions.</p>
      </div>

      <div className="space-y-6">
        {/* Partnership Overview */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <span>🤝</span> Partnership Overview
          </h3>
          
          {expandedWhiteLabelSection !== 'partnership-overview' ? (
            <>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}>
                  <h4 className={`font-bold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>Revenue Sharing: 85% / 15%</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>You keep 85% of all subscription revenue from your referred customers</p>
                </div>
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                  <h4 className={`font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>One-time Setup Fee: $497</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>Covers white label setup, custom branding, and dedicated partner dashboard</p>
                </div>
              </div>
              <button 
                onClick={() => setExpandedWhiteLabelSection('partnership-overview')}
                className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full"
              >
                🤝 View Complete Partnership Details
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedWhiteLabelSection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-3">💰 Revenue Sharing Model</h4>
                  <div className="space-y-3 text-sm text-green-700">
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>How Revenue Sharing Works</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>85% to You:</strong> You receive 85% of all recurring subscription revenue</li>
                        <li><strong>15% to Market Genie:</strong> Covers platform maintenance, updates, and support</li>
                        <li><strong>Monthly Payouts:</strong> Payments processed on the 1st of each month</li>
                        <li><strong>No Hidden Fees:</strong> What you see is what you get</li>
                        <li><strong>Lifetime Revenue:</strong> Earn as long as customers remain subscribed</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Revenue Examples</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Customer pays $97/month → You earn $82.45/month</li>
                        <li>10 customers at $97/month → You earn $824.50/month</li>
                        <li>50 customers at $97/month → You earn $4,122.50/month</li>
                        <li>100 customers at $97/month → You earn $8,245/month</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Methods</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Direct bank transfer (ACH) - No fees</li>
                        <li>PayPal - Small processing fee applies</li>
                        <li>Wire transfer for international partners</li>
                        <li>Cryptocurrency options available</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">🎯 Target Market & Positioning</h4>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ideal Partner Profile</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Digital marketing agencies with 10+ clients</li>
                        <li>Business consultants and coaches</li>
                        <li>Software resellers and system integrators</li>
                        <li>Enterprise sales teams and lead generation companies</li>
                        <li>Marketing automation specialists</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Perfect Customer Segments</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Small to medium businesses (10-500 employees)</li>
                        <li>Real estate agencies and mortgage brokers</li>
                        <li>Insurance and financial services companies</li>
                        <li>SaaS companies needing lead generation</li>
                        <li>Professional services (law, accounting, consulting)</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Competitive Advantages</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>All-in-one platform (no need for multiple tools)</li>
                        <li>AI-powered automation saves time and money</li>
                        <li>85% revenue share is industry-leading</li>
                        <li>White-label branding looks like your product</li>
                        <li>Comprehensive support and training included</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-3">📊 Expected ROI & Growth</h4>
                  <div className="space-y-3 text-sm text-purple-700">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Timeline to Profitability</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Month 1-2:</strong> Setup and first 5 customers (Break even)</li>
                        <li><strong>Month 3-6:</strong> 15-25 customers ($1,200-2,000/month)</li>
                        <li><strong>Month 6-12:</strong> 50+ customers ($4,000+/month)</li>
                        <li><strong>Year 2+:</strong> Scale to 100+ customers ($8,000+/month)</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Growth Strategies</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Start with existing client base</li>
                        <li>Offer Market Genie as add-on service</li>
                        <li>Create bundled packages with your services</li>
                        <li>Leverage case studies and success stories</li>
                        <li>Build referral programs for customers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Application Process */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <span>📝</span> Application Process
          </h3>
          
          {expandedWhiteLabelSection !== 'application-process' ? (
            <>
              <ol className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                  <span>Submit partner application with business details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                  <span>Review and approval process (24-48 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                  <span>Setup fee payment and onboarding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                  <span>Custom branding and partner dashboard access</span>
                </li>
              </ol>
              <button 
                onClick={() => setExpandedWhiteLabelSection('application-process')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
              >
                📝 View Step-by-Step Application Guide
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedWhiteLabelSection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">📋 Application Requirements</h4>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Required Information</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Company name and business registration details</li>
                        <li>Primary contact information and role</li>
                        <li>Business website and social media profiles</li>
                        <li>Current client base size and industries served</li>
                        <li>Expected number of Market Genie customers in first year</li>
                        <li>Marketing and sales approach description</li>
                        <li>Technical integration capabilities</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Qualification Criteria</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Established business with proven track record</li>
                        <li>Existing client base or marketing reach</li>
                        <li>Commitment to quality customer service</li>
                        <li>Technical capability to support customers</li>
                        <li>Financial stability to pay setup fee</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Application Review Process</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Automated initial screening (within 2 hours)</li>
                        <li>Manual review by partnership team (24-48 hours)</li>
                        <li>Reference checks for larger applications</li>
                        <li>Video call interview for strategic partnerships</li>
                        <li>Final approval and contract generation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-3">🚀 Onboarding Process</h4>
                  <div className="space-y-3 text-sm text-green-700">
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Week 1: Setup & Configuration</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Payment processing and contract signing</li>
                        <li>Custom subdomain creation (yourcompany.marketgenie.com)</li>
                        <li>White-label branding setup (logo, colors, fonts)</li>
                        <li>Partner dashboard access and initial training</li>
                        <li>API keys and integration setup</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Week 2: Training & Testing</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Complete platform training sessions (live + recorded)</li>
                        <li>Sales methodology and pricing strategy training</li>
                        <li>Technical support and troubleshooting guidance</li>
                        <li>Test account setup for demonstration purposes</li>
                        <li>Marketing materials customization and approval</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Week 3-4: Launch Preparation</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>First customer onboarding rehearsal</li>
                        <li>Support ticket system setup and training</li>
                        <li>Reporting and analytics dashboard walkthrough</li>
                        <li>Launch plan development and review</li>
                        <li>Go-live approval and official launch</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tools & Resources */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <span>🛠️</span> Partner Tools
          </h3>
          
          {expandedWhiteLabelSection !== 'partner-tools' ? (
            <>
              <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <div>
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Signup link generator with tracking</span>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Create unique referral links with real-time analytics, conversion tracking, and commission calculations for all your marketing campaigns</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <div>
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Custom pricing manager for special offers</span>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Build personalized pricing proposals with flexible discounts, bundle options, and professional branded quotes for enterprise clients</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <div>
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Marketing materials and sales deck</span>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Access professionally designed presentations, brochures, case studies, and white papers customized with your company branding</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <div>
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Funnel Builder for partner use</span>
                    <p className="text-sm text-gray-600 mt-1">Leverage the same AI-powered funnel creation tools your customers use to build lead magnets and sales funnels for your own business growth</p>
                  </div>
                </li>
              </ul>
              <button 
                onClick={() => setExpandedWhiteLabelSection('partner-tools')}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full"
              >
                🛠️ Explore All Partner Tools
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedWhiteLabelSection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-3">🔗 Signup Link Generator</h4>
                  <div className="space-y-3 text-sm text-green-700">
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>How to Create Signup Links</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Access the Partner Sales Center in your dashboard</li>
                        <li>Click "Generate Signup Links" button</li>
                        <li>Choose subscription plan (Pro, Enterprise, Custom)</li>
                        <li>Set discount percentage (0-50% allowed)</li>
                        <li>Add campaign name for tracking purposes</li>
                        <li>Generate and copy the unique tracking link</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Link Tracking Features</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Real-time click tracking and conversion rates</li>
                        <li>Geographic data showing where clicks originated</li>
                        <li>Device and browser analytics</li>
                        <li>Time-based performance reporting</li>
                        <li>A/B testing capabilities for different offers</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Best Practices</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Create separate links for different marketing campaigns</li>
                        <li>Use descriptive campaign names for easy tracking</li>
                        <li>Test links before sharing with prospects</li>
                        <li>Monitor performance and optimize based on data</li>
                        <li>Set expiration dates for limited-time offers</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">💰 Custom Pricing Manager</h4>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Creating Custom Pricing</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Access Custom Pricing Manager from partner dashboard</li>
                        <li>Select base plan as starting point</li>
                        <li>Adjust pricing up or down (within approved ranges)</li>
                        <li>Add or remove features as needed</li>
                        <li>Set billing frequency (monthly, quarterly, annual)</li>
                        <li>Generate custom pricing proposal</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pricing Guidelines</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Minimum pricing: 50% of standard rates</li>
                        <li>Maximum pricing: 200% of standard rates</li>
                        <li>Enterprise deals require approval for larger discounts</li>
                        <li>Annual plans can include up to 20% additional discount</li>
                        <li>Bundle deals with your services encouraged</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Proposal Generation</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Branded PDF proposals with your company logo</li>
                        <li>Detailed feature comparison charts</li>
                        <li>ROI calculations and business case examples</li>
                        <li>Implementation timeline and support details</li>
                        <li>Electronic signature capability</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-3">📊 Marketing Materials Library</h4>
                  <div className="space-y-3 text-sm text-purple-700">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Available Marketing Assets</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Professional sales deck (PowerPoint + PDF)</li>
                        <li>Email templates for cold outreach</li>
                        <li>Social media graphics and post templates</li>
                        <li>Case studies and success stories</li>
                        <li>Product feature comparison charts</li>
                        <li>ROI calculators and business case templates</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Customization Options</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Replace Market Genie branding with your own</li>
                        <li>Add your company contact information</li>
                        <li>Customize pricing and package details</li>
                        <li>Include your own case studies and testimonials</li>
                        <li>Modify messaging to match your brand voice</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Content Updates</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Monthly updates with new features and benefits</li>
                        <li>Seasonal campaigns and promotional materials</li>
                        <li>Industry-specific versions for different verticals</li>
                        <li>A/B tested versions with performance data</li>
                        <li>Partner feedback incorporated into updates</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Tips */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <span>🎯</span> Success Strategies
          </h3>
          
          {expandedWhiteLabelSection !== 'success-strategies' ? (
            <>
              <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">💡</span>
                  <span>Focus on your existing customer base first</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">💡</span>
                  <span>Use provided marketing materials for consistency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">💡</span>
                  <span>Leverage the AI Funnel Builder for demos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">💡</span>
                  <span>Track performance and optimize campaigns</span>
                </li>
              </ul>
              <button 
                onClick={() => setExpandedWhiteLabelSection('success-strategies')}
                className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors w-full"
              >
                🎯 Learn Proven Success Strategies
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedWhiteLabelSection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-800 mb-3">🏆 Top Partner Success Strategies</h4>
                  <div className="space-y-3 text-sm text-orange-700">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Start with Existing Clients</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Analyze current client base for ideal prospects</li>
                        <li>Identify clients struggling with lead generation</li>
                        <li>Position Market Genie as solution to their pain points</li>
                        <li>Offer pilot programs or trials to reduce risk</li>
                        <li>Bundle with existing services for higher value</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Effective Sales Approach</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Focus on ROI and business outcomes, not features</li>
                        <li>Use case studies specific to their industry</li>
                        <li>Demonstrate live with AI Funnel Builder</li>
                        <li>Show competitive advantages over other solutions</li>
                        <li>Address objections proactively with data</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Scaling Techniques</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Develop referral programs for satisfied customers</li>
                        <li>Create industry-specific marketing campaigns</li>
                        <li>Partner with complementary service providers</li>
                        <li>Leverage social proof and testimonials</li>
                        <li>Build thought leadership through content marketing</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Customer Success & Retention</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Provide excellent onboarding and training</li>
                        <li>Regular check-ins and performance reviews</li>
                        <li>Help customers achieve quick wins early</li>
                        <li>Offer ongoing optimization and strategy guidance</li>
                        <li>Facilitate user community and networking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // API Integration Guide Content
  const APIIntegrationContent = () => (
    <div className="space-y-8">
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-green-900/30 to-teal-900/30 border-green-700' : 'bg-gradient-to-r from-green-50 to-teal-50 border-green-200'}`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>🔗 API Keys & Integration Setup</h2>
        <p className={`mb-4 ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>Configure all third-party services and API integrations for optimal performance. Click any service for detailed setup instructions.</p>
      </div>

      <div className="space-y-6">
        {/* Prospeo API */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <span>🔍</span> Prospeo API Setup
          </h3>
          
          {expandedAPISection !== 'prospeo' ? (
            <>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50'}`}>
                  <h4 className={`font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Purpose:</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>Email finder and verification for lead generation</p>
                </div>
                <ol className="space-y-2 text-sm">
                  <li>1. Visit <a href="https://prospeo.io" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">prospeo.io</a> and create account</li>
                  <li>2. Navigate to API section in dashboard</li>
                  <li>3. Generate new API key</li>
                  <li>4. Add key to Market Genie settings</li>
                  <li>5. Test connection with sample lead</li>
                </ol>
              </div>
              <button 
                onClick={() => setExpandedAPISection('prospeo')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
              >
                🔍 View Complete Prospeo Setup Guide
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedAPISection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">📝 Account Creation & Setup</h4>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 1: Sign Up for Prospeo</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Visit <a href="https://prospeo.io" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">prospeo.io</a> and click "Sign Up"</li>
                        <li>Choose the "Professional" plan for best value ($99/month)</li>
                        <li>Complete registration with business email address</li>
                        <li>Verify your email and complete account setup</li>
                        <li>Add billing information and activate subscription</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 2: Generate API Key</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Log into your Prospeo dashboard</li>
                        <li>Navigate to "Settings" → "API & Integrations"</li>
                        <li>Click "Generate New API Key"</li>
                        <li>Copy the generated key (it's only shown once)</li>
                        <li>Store the key securely for Market Genie integration</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 3: Configure in Market Genie</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Go to "API Keys & Integrations" in Market Genie - Navigate to the central integration hub where all your third-party service connections are managed securely.</li>
                        <li>Find the "Prospeo API" section - Locate the dedicated Prospeo configuration area with clear setup instructions and status indicators for easy management.</li>
                        <li>Paste your API key in the designated field - Securely enter your unique API credentials in the encrypted input field designed specifically for sensitive authentication data.</li>
                        <li>Click "Test Connection" to verify setup - Validate your API key with a real-time connection test that confirms proper authentication and service availability.</li>
                        <li>Save settings when test passes - Finalize your configuration once the connection test succeeds, enabling automatic email discovery for all future lead generation campaigns.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-3">⚙️ Configuration Options</h4>
                  <div className="space-y-3 text-sm text-green-700">
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email Verification Settings</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Enable real-time email verification (recommended)</li>
                        <li>Set verification confidence threshold (85% or higher)</li>
                        <li>Configure retry attempts for failed verifications</li>
                        <li>Enable catch-all domain detection</li>
                        <li>Set up role-based email filtering (info@, support@, etc.)</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rate Limiting & Credits</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Monitor daily credit usage and limits</li>
                        <li>Set up usage alerts at 80% and 95% thresholds</li>
                        <li>Configure automatic credit top-ups if needed</li>
                        <li>Implement rate limiting to stay within API limits</li>
                        <li>Track cost-per-verified-email metrics</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Data Enrichment Options</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Enable LinkedIn profile enrichment</li>
                        <li>Add phone number discovery (where available)</li>
                        <li>Include company information enrichment</li>
                        <li>Set up social media profile linking</li>
                        <li>Configure data export formats</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-3">🧪 Testing & Troubleshooting</h4>
                  <div className="space-y-3 text-sm text-purple-700">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Testing Your Setup</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Use the built-in test tool in Market Genie</li>
                        <li>Try finding emails for known contacts first</li>
                        <li>Test with different company domains and sizes</li>
                        <li>Verify email validation accuracy</li>
                        <li>Check data enrichment quality</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Common Issues & Solutions</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>API Key Invalid:</strong> Regenerate key and update in settings</li>
                        <li><strong>Rate Limit Exceeded:</strong> Wait for reset or upgrade plan</li>
                        <li><strong>Low Email Quality:</strong> Adjust confidence threshold</li>
                        <li><strong>Credits Depleted:</strong> Add more credits or upgrade plan</li>
                        <li><strong>Slow Response Times:</strong> Check Prospeo service status</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* OpenAI API */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <span>🤖</span> OpenAI API Setup
          </h3>
          
          {expandedAPISection !== 'openai' ? (
            <>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50'}`}>
                  <h4 className={`font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>Purpose:</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>AI-powered content generation and funnel building</p>
                </div>
                <ol className="space-y-2 text-sm">
                  <li>1. Create account at <a href="https://platform.openai.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">platform.openai.com</a> - Register for OpenAI's developer platform to access their powerful GPT models for content generation and AI-powered marketing automation.</li>
                  <li>2. Add billing information and set limits - Configure your payment method and establish spending limits to control costs while ensuring uninterrupted access to AI features.</li>
                  <li>3. Generate API key in API section - Create secure API credentials that allow Market Genie to authenticate and communicate with OpenAI's services on your behalf.</li>
                  <li>4. Configure usage limits for cost control - Set daily or monthly spending caps to prevent unexpected charges while maintaining sufficient capacity for your business needs.</li>
                  <li>5. Test with AI Funnel Builder - Verify your integration by using Market Genie's AI-powered funnel creation tools to generate compelling marketing content and campaigns.</li>
                </ol>
              </div>
              <button 
                onClick={() => setExpandedAPISection('openai')}
                className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full"
              >
                🤖 View Complete OpenAI Setup Guide
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedAPISection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-3">🚀 Account Setup & Billing</h4>
                  <div className="space-y-3 text-sm text-purple-700">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 1: Create OpenAI Account</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Visit <a href="https://platform.openai.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">platform.openai.com</a> and sign up</li>
                        <li>Verify your phone number and email address</li>
                        <li>Complete identity verification if required</li>
                        <li>Accept OpenAI's usage policies and terms</li>
                        <li>Navigate to the API platform dashboard</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 2: Configure Billing</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Go to "Billing" section in your dashboard</li>
                        <li>Add a valid credit card or payment method</li>
                        <li>Set monthly spending limits ($50-200 recommended)</li>
                        <li>Enable usage alerts at different thresholds</li>
                        <li>Review pricing for GPT-4 and GPT-3.5 models</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 3: Generate API Key</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Navigate to "API Keys" in the dashboard</li>
                        <li>Click "Create new secret key"</li>
                        <li>Give your key a descriptive name (e.g., "Market Genie")</li>
                        <li>Copy the key immediately (it won't be shown again)</li>
                        <li>Store the key securely in a password manager</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">⚙️ Configuration & Optimization</h4>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Model Selection</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>GPT-4:</strong> Best quality for complex tasks ($0.03/1K tokens)</li>
                        <li><strong>GPT-3.5-Turbo:</strong> Good balance of quality and cost ($0.002/1K tokens)</li>
                        <li><strong>GPT-4-Turbo:</strong> Latest model with improved capabilities</li>
                        <li>Configure fallback models for cost optimization</li>
                        <li>Set different models for different use cases</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Usage Optimization</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Set appropriate temperature values (0.7 for creative tasks)</li>
                        <li>Configure max tokens to control response length</li>
                        <li>Use system prompts for consistent behavior</li>
                        <li>Implement caching for repeated queries</li>
                        <li>Monitor token usage and costs regularly</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Integration in Market Genie</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Add API key to "API Keys & Integrations" section</li>
                        <li>Select preferred model for different features</li>
                        <li>Configure cost limits and usage monitoring</li>
                        <li>Test AI Funnel Builder functionality</li>
                        <li>Verify content generation quality</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-800 mb-3">💰 Cost Management</h4>
                  <div className="space-y-3 text-sm text-orange-700">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Budgeting Guidelines</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Starter Budget:</strong> $50/month for basic usage</li>
                        <li><strong>Small Business:</strong> $100-200/month for regular use</li>
                        <li><strong>Agency/Enterprise:</strong> $500+/month for heavy usage</li>
                        <li>Monitor actual usage vs. budget regularly</li>
                        <li>Adjust limits based on business value generated</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cost Optimization Tips</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Use GPT-3.5 for simpler tasks to reduce costs</li>
                        <li>Implement prompt engineering for shorter responses</li>
                        <li>Cache frequently requested content</li>
                        <li>Set up usage alerts before reaching limits</li>
                        <li>Review monthly usage reports and optimize</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Microsoft OAuth */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <span>🔒</span> Microsoft OAuth Setup
          </h3>
          
          {expandedAPISection !== 'microsoft' ? (
            <>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-orange-900/30 border border-orange-700' : 'bg-orange-50'}`}>
                  <h4 className={`font-bold ${isDarkMode ? 'text-orange-300' : 'text-orange-800'}`}>Purpose:</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-orange-200' : 'text-orange-700'}`}>Secure authentication and Office 365 integration</p>
                </div>
                <ol className="space-y-2 text-sm">
                  <li>1. Access Azure Portal app registrations - Navigate to portal.azure.com and sign in with your Microsoft business account to access the Azure Active Directory application management console.</li>
                  <li>2. Create new application registration - Register Market Genie as a trusted application that can authenticate your users and access Microsoft services on their behalf.</li>
                  <li>3. Configure redirect URIs - Set up secure callback URLs that Microsoft will use to return authentication tokens after successful user login verification.</li>
                  <li>4. Generate client secret - Create secure credentials that allow Market Genie to authenticate with Microsoft's OAuth service and maintain secure API communications.</li>
                  <li>5. Test login flow - Verify the complete authentication process by attempting a login and confirming that user permissions and data access work correctly.</li>
                </ol>
              </div>
              <button 
                onClick={() => setExpandedAPISection('microsoft')}
                className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors w-full"
              >
                🔒 View Complete Microsoft OAuth Guide
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedAPISection(null)}
                className={`px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-orange-900/30 border border-orange-700' : 'bg-orange-50'}`}>
                  <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-orange-300' : 'text-orange-800'}`}>🏢 Azure Portal Setup</h4>
                  <div className={`space-y-3 text-sm ${isDarkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-orange-400' : 'border-orange-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 1: Access Azure Portal</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Visit <a href="https://portal.azure.com" className={`underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`} target="_blank" rel="noopener noreferrer">portal.azure.com</a> and sign in</li>
                        <li>Navigate to "Azure Active Directory"</li>
                        <li>Click on "App registrations" in the left sidebar</li>
                        <li>Select "New registration" button</li>
                        <li>Ensure you have admin permissions for your organization</li>
                      </ul>
                    </div>
                    
                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-orange-400' : 'border-orange-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 2: Create App Registration</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Name: "Market Genie Integration"</li>
                        <li>Supported account types: "Accounts in this organizational directory only"</li>
                        <li>Redirect URI: "Web" → "https://marketgenie.tech/oauth/callback"</li>
                        <li>Click "Register" to create the application</li>
                        <li>Note the Application (client) ID for later use</li>
                      </ul>
                    </div>

                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-orange-400' : 'border-orange-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 3: Configure Permissions</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Go to "API permissions" tab</li>
                        <li>Click "Add a permission" → "Microsoft Graph"</li>
                        <li>Select "Delegated permissions"</li>
                        <li>Add: User.Read, Mail.Send, Calendars.ReadWrite</li>
                        <li>Click "Grant admin consent" for your organization</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50'}`}>
                  <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>🔑 Client Secret Configuration</h4>
                  <div className={`space-y-3 text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Creating Client Secret</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Navigate to "Certificates & secrets" tab</li>
                        <li>Click "New client secret"</li>
                        <li>Description: "Market Genie API Access"</li>
                        <li>Expires: "24 months" (recommended)</li>
                        <li>Copy the secret value immediately (won't be shown again)</li>
                      </ul>
                    </div>
                    
                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Security Best Practices</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Store client secret in secure password manager</li>
                        <li>Never commit secrets to version control</li>
                        <li>Set up secret rotation before expiration</li>
                        <li>Use environment variables for secret storage</li>
                        <li>Monitor secret usage in Azure logs</li>
                      </ul>
                    </div>

                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Integration in Market Genie</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Go to "API Keys & Integrations" in Market Genie</li>
                        <li>Find "Microsoft OAuth" section</li>
                        <li>Enter Client ID and Client Secret</li>
                        <li>Set Tenant ID (found in Azure overview)</li>
                        <li>Test the OAuth flow with your account</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-50'}`}>
                  <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>✅ Testing & Validation</h4>
                  <div className={`space-y-3 text-sm ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-green-400' : 'border-green-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>OAuth Flow Testing</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Use Market Genie's built-in OAuth test feature</li>
                        <li>Verify successful login and token exchange</li>
                        <li>Test email sending capabilities</li>
                        <li>Check calendar integration functionality</li>
                        <li>Validate user profile data retrieval</li>
                      </ul>
                    </div>
                    
                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-green-400' : 'border-green-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Common Issues & Solutions</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Invalid Redirect URI:</strong> Check exact URL in Azure config</li>
                        <li><strong>Insufficient Permissions:</strong> Verify admin consent granted</li>
                        <li><strong>Token Expiration:</strong> Implement automatic token refresh</li>
                        <li><strong>Consent Issues:</strong> Check organization security policies</li>
                        <li><strong>Multi-factor Auth:</strong> Ensure MFA is handled properly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ConvertKit */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <span>📧</span> ConvertKit Integration
          </h3>
          
          {expandedAPISection !== 'convertkit' ? (
            <>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-50'}`}>
                  <h4 className={`font-bold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>Purpose:</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>Email marketing automation and list management</p>
                </div>
                <ol className="space-y-2 text-sm">
                  <li>1. Sign up at <a href="https://convertkit.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">convertkit.com</a> - Create your ConvertKit account with their creator-focused email marketing platform designed for scaling your business communications.</li>
                  <li>2. Find API key in account settings - Navigate to your account settings to locate your unique API credentials that enable secure integration with Market Genie.</li>
                  <li>3. Create forms and sequences - Design professional opt-in forms and automated email sequences that will capture and nurture your Market Genie leads effectively.</li>
                  <li>4. Configure webhook endpoints - Set up real-time data synchronization between ConvertKit and Market Genie for seamless lead management and campaign tracking.</li>
                  <li>5. Test lead capture integration - Verify that leads from Market Genie are properly flowing into your ConvertKit lists and triggering your automated sequences correctly.</li>
                </ol>
              </div>
              <button 
                onClick={() => setExpandedAPISection('convertkit')}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full"
              >
                📧 View Complete ConvertKit Setup Guide
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedAPISection(null)}
                className={`px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-50'}`}>
                  <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>📝 Account Setup & API Access</h4>
                  <div className={`space-y-3 text-sm ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-green-400' : 'border-green-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 1: ConvertKit Account Creation</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Visit <a href="https://convertkit.com" className={`underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`} target="_blank" rel="noopener noreferrer">convertkit.com</a> and start free trial</li>
                        <li>Complete business information and email verification</li>
                        <li>Choose appropriate plan based on subscriber count</li>
                        <li>Set up your sender profile and domain authentication</li>
                        <li>Complete the onboarding wizard</li>
                      </ul>
                    </div>
                    
                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-green-400' : 'border-green-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 2: API Key Configuration</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Navigate to "Settings" → "Advanced" → "API"</li>
                        <li>Copy your API Key (format: ck_xxxxxxxxx)</li>
                        <li>Copy your API Secret for webhook verification</li>
                        <li>Enable API access if it's currently disabled</li>
                        <li>Review API rate limits and usage guidelines</li>
                      </ul>
                    </div>

                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-green-400' : 'border-green-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 3: Domain Authentication</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Add your business domain in ConvertKit settings</li>
                        <li>Configure SPF and DKIM records for deliverability</li>
                        <li>Verify domain ownership through DNS records</li>
                        <li>Set up custom sender email address</li>
                        <li>Test email deliverability to major providers</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50'}`}>
                  <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>📋 Forms & Sequences Setup</h4>
                  <div className={`space-y-3 text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Creating Lead Capture Forms</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Go to "Grow" → "Landing Pages & Forms"</li>
                        <li>Create forms for different lead magnets</li>
                        <li>Customize form design to match your brand</li>
                        <li>Configure form settings and confirmation messages</li>
                        <li>Set up tags and segments for new subscribers</li>
                      </ul>
                    </div>
                    
                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email Sequence Development</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Navigate to "Automate" → "Sequences"</li>
                        <li>Create welcome sequences for new subscribers</li>
                        <li>Set up nurture sequences by topic/interest</li>
                        <li>Configure triggered sequences based on actions</li>
                        <li>Design re-engagement sequences for inactive subscribers</li>
                      </ul>
                    </div>

                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tagging & Segmentation</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Create tags for lead sources (Market Genie, Website, etc.)</li>
                        <li>Set up interest-based tags and segments</li>
                        <li>Configure behavioral tags based on email interactions</li>
                        <li>Use custom fields for additional subscriber data</li>
                        <li>Create smart segments for targeted campaigns</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50'}`}>
                  <h4 className={`font-bold mb-3 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>🔗 Market Genie Integration</h4>
                  <div className={`space-y-3 text-sm ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-purple-400' : 'border-purple-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>API Configuration in Market Genie</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Go to "API Keys & Integrations" → "ConvertKit"</li>
                        <li>Enter your ConvertKit API Key</li>
                        <li>Add API Secret for webhook verification</li>
                        <li>Map ConvertKit forms to Market Genie lead sources</li>
                        <li>Configure default tags for imported leads</li>
                      </ul>
                    </div>
                    
                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-purple-400' : 'border-purple-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Webhook Configuration</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Set up webhook URLs in ConvertKit settings</li>
                        <li>Configure subscriber.created webhook for new leads</li>
                        <li>Set subscriber.unsubscribed webhook for opt-outs</li>
                        <li>Enable form.subscribed webhook for form tracking</li>
                        <li>Test webhook delivery and error handling</li>
                      </ul>
                    </div>

                    <div className={`border-l-4 pl-4 ${isDarkMode ? 'border-purple-400' : 'border-purple-500'}`}>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead Sync & Automation</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li>Enable automatic lead sync from Market Genie to ConvertKit</li>
                        <li>Configure lead scoring sync for segmentation</li>
                        <li>Set up campaign tracking and attribution</li>
                        <li>Map Market Genie custom fields to ConvertKit</li>
                        <li>Test bidirectional data sync functionality</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}>
        <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>🔐 Security Best Practices</h3>
        <ul className={`space-y-2 ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
          <li>• Never share API keys in public repositories or documentation</li>
          <li>• Set usage limits and monitoring alerts for all services</li>
          <li>• Regularly rotate API keys for enhanced security</li>
          <li>• Use environment variables for sensitive configuration</li>
          <li>• Monitor API usage and costs regularly</li>
          <li>• Enable two-factor authentication on all service accounts</li>
          <li>• Regularly review and audit API permissions</li>
        </ul>
      </div>
    </div>
  );

  // Privacy Policy Content
  const PrivacyPolicyContent = () => (
    <div className="space-y-8">
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'}`}>
        <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>🔒 Privacy Policy for Market Genie</h2>
        <p className={`mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}><strong>Last Updated:</strong> November 5, 2025</p>
        <p className={`${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>This Privacy Policy describes how Market Genie collects, uses, and protects your information when you use our services.</p>
      </div>

      <div className="grid gap-6">
        {/* Section 1: Information We Collect */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>1. Information We Collect</h3>
          
          <div className="space-y-6">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>1.1 Customer Data You Provide</h4>
              <ul className={`space-y-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                <li>• Account information (name, email, business details)</li>
                <li>• Customer support tickets, emails, and chat conversations</li>
                <li>• Payment information processed through our third-party payment processors</li>
                <li>• Integration credentials for connected services</li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}>
              <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>1.2 Data We Collect Automatically</h4>
              <ul className={`space-y-2 ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                <li>• Usage data and analytics</li>
                <li>• Log data (IP addresses, browser type, pages visited)</li>
                <li>• Cookies and similar tracking technologies</li>
                <li>• Performance metrics and error reports</li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
              <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>1.3 AI Training Data</h4>
              <ul className={`space-y-2 ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                <li>• Anonymized conversation data may be used to improve our AI models</li>
                <li>• Personal identifiers are removed before training</li>
                <li>• You may opt-out of data use for AI training</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: How We Use Your Information */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>2. How We Use Your Information</h3>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>• Provide and maintain Market Genie services</li>
              <li>• Process transactions and send related information</li>
              <li>• Personalize and improve our AI responses</li>
              <li>• Monitor and analyze usage trends</li>
              <li>• Communicate with you about updates and support</li>
              <li>• Develop new products, features, and functionality</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Data Sharing */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>3. Data Sharing and Disclosure</h3>
          <div className={`p-4 rounded-lg border mb-4 ${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}>
            <p className={`font-bold text-lg ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>We do not sell your personal data.</p>
          </div>
          <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>We may share information with:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>•</span>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Service Providers:</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment processors, hosting providers, analytics services</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>•</span>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Legal Requirements:</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>When required by law or to protect our rights</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>•</span>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Business Transfers:</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>In connection with merger, acquisition, or asset sale</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>•</span>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>With Your Consent:</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>When you direct us to share with third parties</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Data Security */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>4. Data Security</h3>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>We implement industry-standard security measures including:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}>
              <ul className={`space-y-2 ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                <li>• Encryption of data in transit and at rest</li>
                <li>• Regular security assessments and monitoring</li>
              </ul>
            </div>
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <ul className={`space-y-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                <li>• Access controls and authentication procedures</li>
                <li>• Secure data backup and disaster recovery procedures</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 5: Data Retention */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>5. Data Retention</h3>
          <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>We retain personal data only as long as necessary for:</p>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>• Providing services to you</li>
              <li>• Compliance with legal obligations</li>
              <li>• Resolving disputes and enforcing agreements</li>
              <li>• Legitimate business needs</li>
            </ul>
          </div>
        </div>

        {/* Section 6: Your Rights */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>6. Your Rights</h3>
          <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>You have the right to:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <ul className={`space-y-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                <li>• Access and receive copies of your personal data</li>
                <li>• Correct inaccurate or incomplete data</li>
                <li>• Delete your personal data</li>
              </ul>
            </div>
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
              <ul className={`space-y-2 ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                <li>• Restrict or object to processing</li>
                <li>• Data portability</li>
                <li>• Withdraw consent where processing is based on consent</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 7: International Data Transfers */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>7. International Data Transfers</h3>
          <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Data may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards through:</p>
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
            <ul className={`space-y-2 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
              <li>• Standard Contractual Clauses</li>
              <li>• Privacy Shield certification (where applicable)</li>
              <li>• Binding corporate rules</li>
            </ul>
          </div>
        </div>

        {/* Section 8: Children's Privacy */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>8. Children's Privacy</h3>
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}>
            <p className={`${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>Our services are not directed to individuals under 16. We do not knowingly collect personal information from children under 16.</p>
          </div>
        </div>

        {/* Section 9: Changes to Policy */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>9. Changes to This Policy</h3>
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
            <p className={`${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>We may update this policy and will notify you of material changes via email or through our services.</p>
          </div>
        </div>

        {/* Section 10: Contact Us */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>10. Contact Us</h3>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>For privacy-related questions or to exercise your rights, contact us at:</p>
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-indigo-900/30 to-blue-900/30 border-indigo-700' : 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200'}`}>
            <div className="space-y-2">
              <p className={`${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                <strong>Email:</strong> <a href="mailto:Help@dubdproducts.com" className={`underline ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}>Help@dubdproducts.com</a>
              </p>
              <p className={`${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                <strong>Address:</strong> Colorado Springs, CO, USA
              </p>
              <p className={`${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                <strong>AI Support Portal:</strong> <a 
                  href="https://supportgenie.help/customer?tenant=supportgenie-tenant" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`underline ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
                >
                  Support Genie Help Center
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Terms of Service Content
  const TermsOfServiceContent = () => (
    <div className="space-y-8">
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-700' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'}`}>
        <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>📋 Terms of Service for Market Genie</h2>
        <p className={`mb-2 ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}><strong>Last Updated:</strong> November 5, 2025</p>
        <p className={`${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>These Terms of Service govern your use of Market Genie services. Please read them carefully.</p>
      </div>

      <div className="grid gap-6">
        {/* Section 1: Agreement to Terms */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>1. Agreement to Terms</h3>
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
            <p className={`${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>By accessing or using Market Genie, you agree to be bound by these Terms. If you disagree with any part, you may not access our services.</p>
          </div>
        </div>

        {/* Section 2: Eligibility */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>2. Eligibility</h3>
          <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>You must be:</p>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>• At least 18 years old</li>
              <li>• Able to form a binding contract</li>
              <li>• Not barred from receiving services under applicable laws</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Account Registration */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>3. Account Registration</h3>
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
            <ul className={`space-y-2 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
              <li>• You must provide accurate and complete information</li>
              <li>• You are responsible for maintaining account security</li>
              <li>• You are responsible for all activities under your account</li>
              <li>• You must notify us immediately of any unauthorized use</li>
            </ul>
          </div>
        </div>

        {/* Section 4: Services Description */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>4. Services Description</h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Market Genie provides AI-powered marketing automation including:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}>
              <ul className={`space-y-2 ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                <li>• Lead generation and management</li>
                <li>• Email automation and campaigns</li>
              </ul>
            </div>
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <ul className={`space-y-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                <li>• AI-powered customer support</li>
                <li>• Analytics and reporting features</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 5: Fees and Payment */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>5. Fees and Payment</h3>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
              <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-purple-200' : 'text-purple-800'}`}>5.1 Subscription Fees</h4>
              <ul className={`space-y-1 ${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                <li>• Fees are specified on our pricing page</li>
                <li>• We may change fees with 30 days' notice</li>
                <li>• Subscription fees are billed in advance</li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>5.2 Payment Processing</h4>
              <ul className={`space-y-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                <li>• Payments processed by third-party providers</li>
                <li>• You agree to their terms and conditions</li>
                <li>• We are not responsible for payment processor errors</li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}>
              <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>5.3 Refunds</h4>
              <ul className={`space-y-1 ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
                <li>• Subscription fees are non-refundable</li>
                <li>• Exceptions may be made at our sole discretion</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 6: Acceptable Use */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>6. Acceptable Use</h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 font-semibold`}>You agree not to:</p>
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}>
            <ul className={`space-y-2 ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
              <li>• Use the service for any illegal purpose</li>
              <li>• Harass, abuse, or harm others</li>
              <li>• Impersonate any person or entity</li>
              <li>• Interfere with or disrupt service integrity</li>
              <li>• Attempt to gain unauthorized access</li>
              <li>• Use the service to generate spam or malicious content</li>
              <li>• Violate any applicable laws or regulations</li>
            </ul>
          </div>
        </div>

        {/* Section 7: Intellectual Property */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>7. Intellectual Property</h3>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-indigo-900/30 border-indigo-700' : 'bg-indigo-50 border-indigo-200'}`}>
              <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>7.1 Our Rights</h4>
              <p className={`${isDarkMode ? 'text-indigo-200' : 'text-indigo-700'} mb-2`}>We own all rights, title, and interest in:</p>
              <ul className={`space-y-1 ${isDarkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>
                <li>• The Market Genie platform and software</li>
                <li>• Our trademarks, logos, and branding</li>
                <li>• Analytics and aggregated data</li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}>
              <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>7.2 Your Data</h4>
              <p className={`${isDarkMode ? 'text-green-200' : 'text-green-700'} mb-2`}>You retain ownership of your customer data. You grant us a license to:</p>
              <ul className={`space-y-1 ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                <li>• Process and display your data through our services</li>
                <li>• Use anonymized data to improve our AI models</li>
                <li>• Store and backup your data as necessary</li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
              <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>7.3 AI-Generated Content</h4>
              <ul className={`space-y-1 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                <li>• AI responses are generated automatically</li>
                <li>• We do not guarantee accuracy or appropriateness</li>
                <li>• You are responsible for reviewing AI-generated content</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 8: Limitation of Liability */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>10. Limitation of Liability</h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 font-semibold`}>To the maximum extent permitted by law:</p>
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}>
            <ul className={`space-y-2 ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
              <li>• We are not liable for indirect, incidental, or consequential damages</li>
              <li>• Our total liability is limited to fees paid in the past 6 months</li>
              <li>• We are not liable for AI-generated content or decisions</li>
              <li>• We are not liable for data loss or security breaches caused by you</li>
            </ul>
          </div>
        </div>

        {/* Section 9: Dispute Resolution */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>13. Dispute Resolution</h3>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>13.1 Governing Law</h4>
              <p className={`${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>These terms are governed by the laws of Colorado, USA.</p>
            </div>

            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
              <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-purple-200' : 'text-purple-800'}`}>13.2 Arbitration</h4>
              <p className={`${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>Any disputes shall be resolved through binding arbitration in Colorado Springs, CO.</p>
            </div>

            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
              <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>13.3 Class Action Waiver</h4>
              <p className={`${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>You waive any right to participate in class actions.</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>15. Contact Information</h3>
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-indigo-900/30 to-blue-900/30 border-indigo-700' : 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200'}`}>
            <div className="space-y-2">
              <p className={`${isDarkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>
                <strong>Email:</strong> <a href="mailto:Help@dubdproducts.com" className={`underline ${isDarkMode ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-800'}`}>Help@dubdproducts.com</a>
              </p>
              <p className={`${isDarkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>
                <strong>Address:</strong> Colorado Springs, CO, USA
              </p>
              <p className={`${isDarkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>
                <strong>AI Support Portal:</strong> <a 
                  href="https://supportgenie.help/customer?tenant=supportgenie-tenant" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`underline ${isDarkMode ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-800'}`}
                >
                  Support Genie Help Center
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* AI-Specific Disclaimer */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>AI-Specific Disclaimer</h3>
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
            <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>AI Limitations Acknowledgement</h4>
            <p className={`${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'} mb-3`}>Market Genie uses artificial intelligence and machine learning technologies. You acknowledge that:</p>
            <ul className={`space-y-2 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
              <li><strong>1. No Guaranteed Accuracy:</strong> AI responses may contain errors or inaccuracies</li>
              <li><strong>2. Human Supervision Recommended:</strong> Critical decisions should involve human review</li>
              <li><strong>3. Continuous Learning:</strong> The AI system evolves and may produce varying outputs</li>
              <li><strong>4. Third-Party AI Models:</strong> We may use third-party AI services subject to their limitations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Support Contact Content
  const SupportContactContent = () => (
    <div className="space-y-8">
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-indigo-900/30 to-blue-900/30 border-indigo-700' : 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200'}`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>📞 Support & Contact Information</h2>
        <p className={`${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'} mb-4`}>Get instant help from our 24/7 AI support system. Our intelligent support portal handles all questions and provides immediate assistance.</p>
      </div>

      <div className="space-y-6">
        {/* Primary Support */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <span>🤖</span> AI Support System (24/7)
          </h3>
          <div className="space-y-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'}`}>
              <span className="text-blue-500 text-xl">🎯</span>
              <div className="flex-1">
                <p className={`font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Primary Support Portal</p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>Available 24/7 • Instant AI chat • Ticket submission • Immediate assistance</p>
                <div className="mt-3">
                  <a 
                    href="https://supportgenie.help/customer?tenant=supportgenie-tenant" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-lg text-sm inline-block font-medium text-white ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    Launch Support Genie
                  </a>
                </div>
              </div>
            </div>
            
            
            <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-300'}`}>
              <span className="text-green-500 text-xl">📧</span>
              <div className="flex-1">
                <p className={`font-semibold ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>Email Support (24/7)</p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>Available 24/7 • All inquiries welcome • Professional assistance</p>
                <div className="mt-3">
                  <a 
                    href="mailto:Help@dubdproducts.com" 
                    className={`px-4 py-2 rounded-lg text-sm inline-block font-medium text-white ${isDarkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    Send Email
                  </a>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-indigo-700' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'}`}>
              <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>🤖 AI Support Capabilities</h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                <li>• Account setup and configuration - Complete guidance through initial account creation, subscription selection, user profile setup, and dashboard customization to get you started quickly.</li>
                <li>• Lead generation and scraping guidance - Expert assistance with configuring search parameters, targeting criteria, API integrations, and troubleshooting scraper performance issues.</li>
                <li>• Campaign creation and optimization - Strategic advice on building effective marketing campaigns, email sequences, funnel design, and conversion rate optimization techniques.</li>
                <li>• API integration assistance - Technical support for connecting third-party services, managing API keys, configuring webhooks, and resolving authentication issues.</li>
                <li>• Troubleshooting and error resolution - Immediate help with diagnosing problems, interpreting error messages, implementing fixes, and preventing future issues.</li>
                <li>• Feature explanations and tutorials - Comprehensive walkthroughs of all platform features, best practices, and advanced usage techniques to maximize your results.</li>
                <li>• Billing and subscription support - Assistance with plan changes, payment issues, usage tracking, invoice questions, and account management needs.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Priorities */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <span>⏰</span> AI Support Capabilities
          </h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}`}>
              <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>🤖 Instant AI Responses</h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                <li>• Account setup and configuration</li>
                <li>• Feature explanations and tutorials</li>
                <li>• Troubleshooting common issues</li>
                <li>• API integration guidance</li>
              </ul>
            </div>
            
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'}`}>
              <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>🎯 Smart Ticket Routing</h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                <li>• Complex technical issues - Advanced problems requiring developer intervention, custom code modifications, or specialized technical expertise beyond standard troubleshooting.</li>
                <li>• Custom integration requests - Bespoke API connections, enterprise-level integrations, and specialized third-party service connections requiring custom development work.</li>
                <li>• Billing and account questions - Subscription management, payment processing issues, invoice disputes, refund requests, and enterprise pricing discussions.</li>
                <li>• Feature requests and feedback - Product enhancement suggestions, new feature ideas, user experience feedback, and strategic platform development input.</li>
              </ul>
            </div>
            
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-700' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'}`}>
              <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-purple-200' : 'text-purple-800'}`}>⏰ 24/7 Availability</h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                <li>• No wait times or business hours - Round-the-clock availability means instant access to help whenever you need it, regardless of time zones or holidays.</li>
                <li>• Instant chat responses - Real-time AI-powered conversations provide immediate answers and solutions without the delays of traditional support channels.</li>
                <li>• Comprehensive help database - Extensive knowledge base with searchable articles, tutorials, and solutions covering every aspect of the platform and common issues.</li>
                <li>• Multi-language support - Assistance available in multiple languages to serve our global user base and ensure clear communication for all customers.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Guidelines */}
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <span>💡</span> Getting Better Support
          </h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>📋 Include This Information</h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                <li>• Your account email address - Essential for account identification and accessing your specific configuration, subscription details, and usage history.</li>
                <li>• Detailed description of the issue - Clear explanation of what's happening, what you expected to happen, and how it differs from normal behavior.</li>
                <li>• Steps to reproduce the problem - Specific sequence of actions that consistently triggers the issue, helping our team identify the root cause.</li>
                <li>• Screenshots or error messages - Visual evidence and exact error text provide crucial diagnostic information for faster problem resolution.</li>
                <li>• Browser/device information - Technical specifications including browser version, operating system, and device type affect platform performance and compatibility.</li>
                <li>• When the issue first occurred - Timeline information helps correlate problems with system changes, updates, or configuration modifications.</li>
              </ul>
            </div>
            
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}>
              <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>🚀 Pro Tips for Faster Resolution</h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                <li>• Start with our AI support portal first - Support Genie can instantly resolve 80% of common issues and provide immediate solutions without waiting for human agents.</li>
                <li>• Search the knowledge base - Comprehensive documentation often contains step-by-step solutions for known issues, saving time for both you and our support team.</li>
                <li>• Use descriptive email subject lines - Clear subjects like "Lead Scraper API Error" help prioritize and route your request to the right specialist immediately.</li>
                <li>• One issue per support ticket - Separate tickets allow for focused troubleshooting, better tracking, and faster resolution of individual problems.</li>
                <li>• Be specific about expected behavior - Clearly state what should happen versus what actually happens to help identify gaps and solution approaches.</li>
                <li>• Include relevant account details - Subscription level, feature usage, and recent changes provide context that accelerates diagnosis and solution implementation.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-100 to-blue-100 p-6 rounded-lg border border-indigo-200">
        <h3 className="text-lg font-bold text-indigo-800 mb-4">🎯 Need Immediate Help?</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="text-center">
            <h4 className="font-bold text-indigo-700 mb-2">🤖 AI Support Portal</h4>
            <p className="text-sm text-indigo-600 mb-3">Instant assistance 24/7</p>
            <a 
              href="https://supportgenie.help/customer?tenant=supportgenie-tenant" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm inline-block"
            >
              Launch Support Portal
            </a>
          </div>
          <div className="text-center">
            <h4 className="font-bold text-green-700 mb-2">📧 Email Support</h4>
            <p className="text-sm text-green-600 mb-3">Detailed help 24/7</p>
            <a 
              href="mailto:Help@dubdproducts.com" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm inline-block"
            >
              Send Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  // Troubleshooting Guide Content
  const TroubleshootingContent = () => (
    <div className="space-y-8">
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-red-900 to-pink-900 border-red-700' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'}`}>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-red-200' : 'text-red-800'} mb-4`}>🛠️ Troubleshooting & Common Issues</h2>
        <p className={`${isDarkMode ? 'text-red-300' : 'text-red-700'} mb-4`}>Find quick solutions to common problems and get your account running smoothly. Click any category for detailed troubleshooting steps.</p>
      </div>

      <div className="space-y-6">
        {/* Lead Generation Issues */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 shadow-lg border`}>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
            <span>🔍</span> Lead Generation Issues
          </h3>
          
          {expandedAPISection !== 'lead-issues' ? (
            <>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`${isDarkMode ? 'bg-blue-900 bg-opacity-50' : 'bg-blue-50'} p-4 rounded-lg`}>
                  <h4 className={`font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Common Problems:</h4>
                  <p className={`${isDarkMode ? 'text-blue-200' : 'text-blue-700'} text-sm`}>Lead scraper not finding results, email verification failures, export issues</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• No leads found for search query - Occurs when search parameters are too narrow or the target market has limited online presence requiring broader search criteria.</li>
                  <li>• Email addresses not verifying - Happens when email verification services are experiencing high load or the email addresses are outdated or invalid in the source database.</li>
                  <li>• Scraper timing out or crashing - Usually caused by network connectivity issues, server overload, or when processing very large datasets that exceed system resources.</li>
                  <li>• Low-quality lead data returned - Results from scraping sources with incomplete profiles or when targeting overly broad audiences without proper filtering criteria.</li>
                  <li>• Export functionality not working - Typically due to browser popup blockers, insufficient permissions, or attempting to export datasets that exceed file size limits.</li>
                </ul>
              </div>
              <button 
                onClick={() => setExpandedAPISection('lead-issues')}
                className={`mt-4 px-4 py-2 rounded-lg transition-colors w-full ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                🔍 View Detailed Solutions
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedAPISection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className={`${isDarkMode ? 'bg-red-900 bg-opacity-50' : 'bg-red-50'} p-4 rounded-lg`}>
                  <h4 className={`font-bold ${isDarkMode ? 'text-red-300' : 'text-red-800'} mb-3`}>🚫 No Leads Found Issues</h4>
                  <div className={`space-y-3 text-sm ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
                    <div className="border-l-4 border-red-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Search returns empty results</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Solution 1:</strong> Broaden your search criteria (remove specific job titles)</li>
                        <li><strong>Solution 2:</strong> Check location settings - try "United States" instead of specific cities</li>
                        <li><strong>Solution 3:</strong> Verify company name spelling and try variations</li>
                        <li><strong>Solution 4:</strong> Use industry keywords instead of exact company names</li>
                        <li><strong>Solution 5:</strong> Clear browser cache and restart the scraper</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-red-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Scraper finds very few results</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Check filters:</strong> Remove restrictive filters like specific experience levels</li>
                        <li><strong>Expand location:</strong> Use broader geographic areas</li>
                        <li><strong>Try synonyms:</strong> Use alternative job titles (CEO, President, Founder)</li>
                        <li><strong>Different platforms:</strong> Switch between LinkedIn, Indeed, ZoomInfo sources</li>
                        <li><strong>Time of day:</strong> Try scraping during off-peak hours</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-800 mb-3">✉️ Email Verification Problems</h4>
                  <div className="space-y-3 text-sm text-orange-700">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Emails showing as invalid/unverified</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Check Prospeo credits:</strong> Verify you have remaining email verification credits</li>
                        <li><strong>API key issues:</strong> Regenerate and update your Prospeo API key</li>
                        <li><strong>Rate limiting:</strong> Wait 10-15 minutes before retrying verification</li>
                        <li><strong>Bulk verification:</strong> Verify emails in smaller batches (50-100 at a time)</li>
                        <li><strong>Quality threshold:</strong> Lower verification confidence threshold in settings</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Verification process too slow</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Internet connection:</strong> Check your connection speed and stability</li>
                        <li><strong>Server status:</strong> Check Prospeo service status page</li>
                        <li><strong>Batch processing:</strong> Use smaller verification batches</li>
                        <li><strong>Premium account:</strong> Upgrade Prospeo plan for faster processing</li>
                        <li><strong>Time zones:</strong> Try verification during Prospeo's off-peak hours</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-3">⚡ Performance & Timeout Issues</h4>
                  <div className="space-y-3 text-sm text-yellow-700">
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Scraper timing out or crashing</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Reduce scope:</strong> Limit results to 100-500 leads per search</li>
                        <li><strong>Clear browser data:</strong> Clear cookies, cache, and localStorage</li>
                        <li><strong>Close other tabs:</strong> Reduce browser memory usage</li>
                        <li><strong>Restart browser:</strong> Fresh browser session often resolves issues</li>
                        <li><strong>Check system resources:</strong> Ensure adequate RAM and CPU availability</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Export functionality not working</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Pop-up blockers:</strong> Allow pop-ups for Market Genie domain</li>
                        <li><strong>Download permissions:</strong> Check browser download settings</li>
                        <li><strong>File size limits:</strong> Export in smaller batches if dataset is large</li>
                        <li><strong>Browser compatibility:</strong> Try Chrome or Edge for best compatibility</li>
                        <li><strong>Alternative formats:</strong> Try different export formats (CSV, Excel, JSON)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Funnel Builder Issues */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 shadow-lg border`}>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
            <span>🤖</span> AI Funnel Builder Issues
          </h3>
          
          {expandedAPISection !== 'funnel-issues' ? (
            <>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`${isDarkMode ? 'bg-purple-900 bg-opacity-50' : 'bg-purple-50'} p-4 rounded-lg`}>
                  <h4 className={`font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>Common Problems:</h4>
                  <p className={`${isDarkMode ? 'text-purple-200' : 'text-purple-700'} text-sm`}>AI generation failures, design problems, deployment issues</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• AI not generating content properly - Usually occurs when OpenAI API limits are reached, insufficient input context is provided, or network connectivity issues interrupt the generation process.</li>
                  <li>• Funnel preview not displaying correctly - Typically caused by browser caching issues, incomplete template loading, or conflicts with browser extensions that block certain display elements.</li>
                  <li>• Publishing/deployment failures - Happens due to hosting connectivity problems, insufficient server resources, or domain configuration issues that prevent successful deployment.</li>
                  <li>• Template customization not saving - Often results from browser storage limitations, network timeouts during save operations, or conflicting changes being made simultaneously.</li>
                  <li>• Integration issues with landing pages - Caused by misconfigured tracking codes, incompatible third-party scripts, or improper API connections between the funnel and external services.</li>
                </ul>
              </div>
              <button 
                onClick={() => setExpandedAPISection('funnel-issues')}
                className={`mt-4 px-4 py-2 rounded-lg transition-colors w-full ${isDarkMode ? 'bg-purple-700 hover:bg-purple-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
              >
                🤖 View Detailed Solutions
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedAPISection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-3">🧠 AI Content Generation Issues</h4>
                  <div className="space-y-3 text-sm text-purple-700">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: AI not generating relevant content</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Be more specific:</strong> Provide detailed business description and target audience</li>
                        <li><strong>Include keywords:</strong> Add industry-specific terms and pain points</li>
                        <li><strong>Specify tone:</strong> Choose professional, casual, or urgent tone explicitly</li>
                        <li><strong>Add examples:</strong> Provide sample content or competitor references</li>
                        <li><strong>Retry generation:</strong> Click regenerate for different variations</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: AI generation timing out or failing</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Check OpenAI credits:</strong> Verify your OpenAI account has sufficient credits</li>
                        <li><strong>API key validation:</strong> Regenerate and update OpenAI API key</li>
                        <li><strong>Simplify prompt:</strong> Use shorter, clearer descriptions</li>
                        <li><strong>Try different model:</strong> Switch between GPT-4 and GPT-3.5 in settings</li>
                        <li><strong>Server status:</strong> Check OpenAI service status page</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">🎨 Design & Display Problems</h4>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Funnel preview not displaying correctly</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Browser cache:</strong> Clear browser cache and hard refresh (Ctrl+F5)</li>
                        <li><strong>Browser compatibility:</strong> Use Chrome or Edge for best results</li>
                        <li><strong>Disable extensions:</strong> Turn off ad blockers and privacy extensions</li>
                        <li><strong>Mobile preview:</strong> Try desktop view if mobile preview is broken</li>
                        <li><strong>Template reload:</strong> Save and reload the funnel template</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Customizations not saving properly</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Save frequently:</strong> Use Ctrl+S or click save button regularly</li>
                        <li><strong>Internet stability:</strong> Ensure stable internet connection</li>
                        <li><strong>Browser storage:</strong> Clear localStorage and try again</li>
                        <li><strong>Single tab editing:</strong> Edit funnel in only one browser tab</li>
                        <li><strong>Auto-save check:</strong> Verify auto-save is enabled in settings</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-3">🚀 Publishing & Deployment Issues</h4>
                  <div className="space-y-3 text-sm text-green-700">
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Funnel won't publish or deploy</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Complete all sections:</strong> Ensure headline, content, and CTA are filled</li>
                        <li><strong>Valid domain:</strong> Check that custom domain is properly configured</li>
                        <li><strong>SSL certificate:</strong> Verify SSL is active for custom domains</li>
                        <li><strong>Publishing permissions:</strong> Check account limits and subscription status</li>
                        <li><strong>Retry publishing:</strong> Wait 5 minutes and try publishing again</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Published funnel not loading for visitors</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>DNS propagation:</strong> Wait 24-48 hours for DNS changes to propagate</li>
                        <li><strong>Clear CDN cache:</strong> Clear any CDN or caching service cache</li>
                        <li><strong>Test different devices:</strong> Check on mobile and desktop separately</li>
                        <li><strong>Browser testing:</strong> Test in incognito/private browsing mode</li>
                        <li><strong>Analytics check:</strong> Verify tracking codes aren't blocking page load</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Authentication & Access Issues */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 shadow-lg border`}>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
            <span>🔐</span> Authentication & Access
          </h3>
          
          {expandedAPISection !== 'auth-issues' ? (
            <>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`${isDarkMode ? 'bg-red-900 bg-opacity-50' : 'bg-red-50'} p-4 rounded-lg`}>
                  <h4 className={`font-bold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>Common Problems:</h4>
                  <p className={`${isDarkMode ? 'text-red-200' : 'text-red-700'} text-sm`}>Login failures, password resets, permission errors</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Cannot log in to account - Authentication failures often caused by incorrect credentials, browser issues, account lockouts, or expired sessions requiring password reset or cache clearing.</li>
                  <li>• Password reset not working - Email delivery issues, spam filtering, expired reset links, or incorrect email addresses preventing successful password recovery completion.</li>
                  <li>• Account locked or suspended - Security measures triggered by multiple failed login attempts, billing issues, terms violations, or suspicious activity requiring support intervention.</li>
                  <li>• Permission denied errors - Access control issues stemming from subscription limitations, user role restrictions, or backend permission synchronization problems.</li>
                  <li>• Two-factor authentication issues - Problems with authenticator apps, SMS delivery, backup codes, device synchronization, or lost access to 2FA devices requiring recovery procedures.</li>
                </ul>
              </div>
              <button 
                onClick={() => setExpandedAPISection('auth-issues')}
                className={`mt-4 px-4 py-2 rounded-lg transition-colors w-full ${isDarkMode ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
              >
                🔐 View Authentication Solutions
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedAPISection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-bold text-red-800 mb-3">🚪 Login & Access Problems</h4>
                  <div className="space-y-3 text-sm text-red-700">
                    <div className="border-l-4 border-red-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Cannot log in with correct credentials</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Clear browser data:</strong> Clear cookies, cache, and saved passwords</li>
                        <li><strong>Incognito mode:</strong> Try logging in using private/incognito browsing</li>
                        <li><strong>Different browser:</strong> Test login in Chrome, Firefox, or Edge</li>
                        <li><strong>Password case:</strong> Verify caps lock and password case sensitivity</li>
                        <li><strong>Email verification:</strong> Check if email address needs verification</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-red-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Account appears locked or suspended</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Multiple attempts:</strong> Wait 30 minutes after failed login attempts</li>
                        <li><strong>Account status:</strong> Check email for any account suspension notices</li>
                        <li><strong>Billing issues:</strong> Verify subscription status and payment method</li>
                        <li><strong>Terms violation:</strong> Review account for any terms of service violations</li>
                        <li><strong>Contact support:</strong> Reach out with account details for manual review</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-800 mb-3">🔄 Password Reset Issues</h4>
                  <div className="space-y-3 text-sm text-orange-700">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Not receiving password reset emails</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Check spam folder:</strong> Look in spam, junk, and promotions folders</li>
                        <li><strong>Email filters:</strong> Check for email filters blocking Market Genie</li>
                        <li><strong>Correct email:</strong> Verify you're using the exact registration email</li>
                        <li><strong>Wait time:</strong> Allow up to 15 minutes for email delivery</li>
                        <li><strong>Whitelist domain:</strong> Add Market Genie domain to email whitelist</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Reset link expired or not working</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>New reset request:</strong> Request a fresh password reset link</li>
                        <li><strong>Time limit:</strong> Use reset links within 1 hour of receiving</li>
                        <li><strong>Copy/paste link:</strong> Don't click email link, copy URL to browser</li>
                        <li><strong>Browser issues:</strong> Try password reset in different browser</li>
                        <li><strong>Link format:</strong> Ensure complete link is copied without line breaks</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-3">🛡️ Two-Factor Authentication Issues</h4>
                  <div className="space-y-3 text-sm text-purple-700">
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: 2FA codes not working or expired</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Time sync:</strong> Ensure device time is synchronized correctly</li>
                        <li><strong>Fresh code:</strong> Generate new code from authenticator app</li>
                        <li><strong>Backup codes:</strong> Use backup codes if available</li>
                        <li><strong>App reinstall:</strong> Remove and re-add account to authenticator app</li>
                        <li><strong>Recovery method:</strong> Use SMS or email backup if configured</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Lost access to authenticator device</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Backup codes:</strong> Use previously saved backup codes</li>
                        <li><strong>Recovery email:</strong> Use email-based 2FA recovery</li>
                        <li><strong>Contact support:</strong> Provide identity verification for manual reset</li>
                        <li><strong>Account recovery:</strong> Follow account recovery process</li>
                        <li><strong>Prevention:</strong> Set up multiple 2FA methods for future</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* API & Integration Issues */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 shadow-lg border`}>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
            <span>🔗</span> API & Integration Issues
          </h3>
          
          {expandedAPISection !== 'api-issues' ? (
            <>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`${isDarkMode ? 'bg-green-900 bg-opacity-50' : 'bg-green-50'} p-4 rounded-lg`}>
                  <h4 className={`font-bold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>Common Problems:</h4>
                  <p className={`${isDarkMode ? 'text-green-200' : 'text-green-700'} text-sm`}>API connection failures, integration errors, sync issues</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• API keys not working or invalid</li>
                  <li>• Third-party service connections failing</li>
                  <li>• Data sync not working properly</li>
                  <li>• Rate limit errors and timeouts</li>
                  <li>• Webhook delivery failures</li>
                </ul>
              </div>
              <button 
                onClick={() => setExpandedAPISection('api-issues')}
                className={`mt-4 px-4 py-2 rounded-lg transition-colors w-full ${isDarkMode ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
                🔗 View Integration Solutions
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={() => setExpandedAPISection(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Overview
              </button>
              
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-3">🔑 API Key & Authentication Problems</h4>
                  <div className="space-y-3 text-sm text-green-700">
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: API keys showing as invalid or expired</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Regenerate keys:</strong> Create new API keys in service dashboards</li>
                        <li><strong>Copy format:</strong> Ensure no extra spaces or characters when copying</li>
                        <li><strong>Permission scope:</strong> Verify API keys have required permissions</li>
                        <li><strong>Account status:</strong> Check if service accounts are active and paid</li>
                        <li><strong>Update immediately:</strong> Replace old keys in Market Genie settings</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: API rate limits being exceeded</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Upgrade plans:</strong> Consider higher-tier plans for increased limits</li>
                        <li><strong>Spacing requests:</strong> Add delays between API calls</li>
                        <li><strong>Batch processing:</strong> Process data in smaller batches</li>
                        <li><strong>Peak avoidance:</strong> Schedule heavy usage during off-peak hours</li>
                        <li><strong>Monitor usage:</strong> Track daily/monthly API usage regularly</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3">🔄 Data Sync & Integration Problems</h4>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Data not syncing between services</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Force sync:</strong> Use manual sync buttons in integration settings</li>
                        <li><strong>Field mapping:</strong> Verify custom field mappings are correct</li>
                        <li><strong>Data format:</strong> Check for data format compatibility issues</li>
                        <li><strong>Sync frequency:</strong> Adjust sync intervals in settings</li>
                        <li><strong>Error logs:</strong> Check integration logs for specific error messages</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Problem: Webhook delivery failures</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>URL validation:</strong> Verify webhook URLs are accessible and correct</li>
                        <li><strong>SSL requirements:</strong> Ensure webhook endpoints use HTTPS</li>
                        <li><strong>Response codes:</strong> Webhook endpoints must return 200 status codes</li>
                        <li><strong>Timeout limits:</strong> Optimize webhook processing for under 10 seconds</li>
                        <li><strong>Retry configuration:</strong> Set up automatic retry logic for failures</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-3">⚠️ Service-Specific Issues</h4>
                  <div className="space-y-3 text-sm text-yellow-700">
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Prospeo API Issues</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Credit depletion:</strong> Check remaining email verification credits</li>
                        <li><strong>Domain issues:</strong> Some domains block email verification</li>
                        <li><strong>Quality settings:</strong> Adjust verification confidence thresholds</li>
                        <li><strong>Service status:</strong> Check Prospeo status page for outages</li>
                        <li><strong>IP blocking:</strong> Contact Prospeo if IP appears blocked</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>OpenAI API Issues</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Model availability:</strong> Check if requested model is available</li>
                        <li><strong>Token limits:</strong> Reduce prompt length or max tokens</li>
                        <li><strong>Content policy:</strong> Ensure prompts comply with OpenAI policies</li>
                        <li><strong>Billing alerts:</strong> Verify OpenAI account has sufficient credits</li>
                        <li><strong>Regional restrictions:</strong> Check OpenAI service availability by region</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-yellow-500 pl-4">
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Microsoft OAuth Issues</p>
                      <ul className="mt-2 space-y-1 list-disc ml-4">
                        <li><strong>Redirect URIs:</strong> Check exact URL in Azure configuration</li>
                        <li><strong>Admin consent:</strong> Ensure admin consent granted for organization</li>
                        <li><strong>Token expiration:</strong> Implement automatic token refresh</li>
                        <li><strong>Permission scopes:</strong> Check that all required scopes are approved</li>
                        <li><strong>Tenant configuration:</strong> Verify correct tenant ID in configuration</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} p-6 rounded-lg border`}>
        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>🆘 Still Need Help?</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="text-center">
            <h4 className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} mb-2`}>🤖 AI Support Portal</h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Instant assistance 24/7</p>
            <a 
              href="https://supportgenie.help/customer?tenant=supportgenie-tenant" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} underline`}
            >
              Support Genie Help Center
            </a>
          </div>
          <div className="text-center">
            <h4 className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'} mb-2`}>📧 Email Support</h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Get detailed help via email</p>
            <a href="mailto:Help@dubdproducts.com" className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} underline`}>Help@dubdproducts.com</a>
          </div>
        </div>
      </div>
    </div>
  );

  // Video Tutorials Content
  const VideoTutorialsContent = () => (
    <div className="space-y-8">
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'}`}>
        <div className="flex items-center gap-4 mb-4">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-red-800'}`}>🎥 Video Tutorials</h2>
          <span className="text-2xl font-bold text-orange-600 bg-orange-100 px-4 py-2 rounded-full border-2 border-orange-300">
            Coming Soon
          </span>
        </div>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-red-700'} mb-4`}>Step-by-step video guides to master every feature of Market Genie.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Getting Started Videos */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 shadow-lg border`}>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
            <span>🚀</span> Getting Started
          </h3>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">▶️</span>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Account Setup & First Login</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>5:32 • Introduction to dashboard</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">▶️</span>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Navigation & Layout Overview</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>3:45 • Understanding the interface</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">▶️</span>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subscription Plans Explained</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>4:20 • Choosing the right plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Generation Videos */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 shadow-lg border`}>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
            <span>🎯</span> Lead Generation
          </h3>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">▶️</span>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Setting Up Lead Scraper</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>8:15 • Configuration and targeting</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">▶️</span>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>LinkedIn Lead Discovery</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>12:30 • Advanced social media scraping</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">▶️</span>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead Scoring & Qualification</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>6:45 • Quality assessment techniques</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Funnel Builder Videos */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 shadow-lg border`}>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
            <span>🤖</span> AI Funnel Builder
          </h3>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">▶️</span>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Creating Your First AI Funnel</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>15:20 • Complete walkthrough</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">▶️</span>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Customizing Funnel Templates</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>9:30 • Advanced customization</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">▶️</span>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>A/B Testing & Optimization</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>11:45 • Performance optimization</p>
              </div>
            </div>
          </div>
        </div>

        {/* White Label Videos */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 shadow-lg border`}>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
            <span>🏷️</span> White Label Program
          </h3>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">▶️</span>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Partner Application Process</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>7:20 • Step-by-step application</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">▶️</span>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Using Partner Sales Tools</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>13:10 • Signup links & pricing</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">▶️</span>
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Marketing Materials & Strategy</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>10:50 • Sales deck & resources</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-purple-50 border-purple-200'}`}>
        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-purple-800'} mb-2`}>🎓 Learning Path Recommendation</h3>
        <div className="grid md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">1</div>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Getting Started</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">2</div>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Lead Generation</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">3</div>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>AI Funnel Builder</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">4</div>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Advanced Features</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render active section content
  const renderActiveContent = () => {
    switch(activeSection) {
      case 'user-manual':
        return <UserManualContent />;
      case 'white-label-guide':
        return <WhiteLabelGuideContent />;
      case 'api-integrations':
        return <APIIntegrationContent />;
      case 'troubleshooting':
        return <TroubleshootingContent />;
      case 'video-tutorials':
        return <VideoTutorialsContent />;
      case 'privacy-policy':
        return <PrivacyPolicyContent />;
      case 'terms-of-service':
        return <TermsOfServiceContent />;
      case 'support-contact':
        return <SupportContactContent />;
      default:
        return <UserManualContent />;
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#38beba' }}>
            📚 Resource & Documentation Center
          </h1>
          <p className="text-lg" style={{ color: '#38beba' }}>
            Your complete guide to Market Genie features, integrations, and support resources
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-w-md">
              {searchResults.map(section => (
                <div 
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span>{section.icon}</span>
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">{section.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {documentationSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeSection === section.id
                    ? (isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-blue-600 text-white')
                    : (isDarkMode ? 'bg-gray-600 hover:bg-gray-500 border border-gray-500' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200')
                }`}
                style={isDarkMode ? { color: '#38beba' } : {}}
              >
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className={`rounded-xl shadow-lg p-8 ${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'}`}>
          {renderActiveContent()}
        </div>
      </div>
    </div>
  );
};

export default ResourceDocumentationCenter;


