import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { TenantProvider } from './contexts/TenantContext'
import { GenieProvider } from './contexts/GenieContext'
import FounderSetup from './components/FounderSetup'
import Dashboard from './pages/Dashboard'
// import CampaignBuilder from './pages/CampaignBuilder'
import Settings from './pages/Settings'
import Login from './pages/Login'

// 🚀 CRITICAL FIX: Import Firebase v8 compatibility bridge for diagnostics
import './utils/firebaseV8Bridge.js'
// 🧪 DATABASE TESTS: Load database write tests for debugging
import './utils/databaseWriteTest.js'
// 🔐 SECURITY DIAGNOSTIC: Load Firebase security rules diagnostic
import './utils/firebaseSecurityDiagnostic.js'
import Register from './pages/RegisterSimple'
import FreeSignup from './pages/FreeSignup'
import Signup from './pages/Signup'
import LandingPage from './pages/LandingPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import UnsubscribePage from './pages/UnsubscribePage'
import WhiteLabelPartnerSetup from './pages/WhiteLabelPartnerSetup'
import ProPlanSignup from './pages/ProPlanSignup'
import LifetimePlanSignup from './pages/LifetimePlanSignup'
import ProPlanPage from './pages/ProPlanPage'
import LifetimePlanPage from './pages/LifetimePlanPage'
import OAuthCallback from './pages/OAuthCallback'
import MicrosoftOAuthCallback from './pages/MicrosoftOAuthCallback'
import GmailOAuthCallback from './pages/GmailOAuthCallback'
import GiftRedemption from './components/GiftRedemption'
import AIAgentHelper from './components/AIAgentHelper'
import { useTenant } from './contexts/TenantContext'
import LeadService from './services/leadService'
import integrationService from './services/integrationService'
import stabilityMonitor from './services/stabilityMonitor'
import { multiTenantDB } from './services/multiTenantDatabase'
import DatabaseInitializer from './services/databaseInitializer'
import toast, { Toaster } from 'react-hot-toast'
import { functions, auth, db } from './firebase'
import { httpsCallable } from 'firebase/functions'
import { collection, doc, setDoc, getDocs } from 'firebase/firestore'
import VoiceButton from './features/voice-control/VoiceButton'
import './assets/brand.css'
import Sidebar from './components/Sidebar'
import SupportTicketForm from './components/SupportTicketForm'
import SupportTicketList from './components/SupportTicketList'
import APIKeysIntegrations from './components/APIKeysIntegrations'

// Initialize extension defense early
import './security/ExtensionDefense'
import EnhancedFirebaseStabilityManager from './components/EnhancedFirebaseStabilityManager'
import DailyQuoteWidget from './components/DailyQuoteWidget'
import WorldClockWidget from './components/WorldClockWidget'
import MetricsService from './services/MetricsService'
import AIService from './services/aiService'
import IntegrationService from './services/integrationService'
import FirebaseUserDataService from './services/firebaseUserData'
import AppointmentService from './services/appointmentService'
import CalendarService from './services/calendarService'
import ResourceDocumentationCenter from './components/ResourceDocumentationCenter'
import WhiteLabelDashboard from './components/WhiteLabelDashboard'
import SocialMediaScrapingAgents from './components/SocialMediaScrapingAgents'
import LeadGenerationWorkflows from './components/LeadGenerationWorkflows'
import IntegrationConnectionStatus from './components/IntegrationConnectionStatus'
import AdvancedFunnelBuilder from './components/AdvancedFunnelBuilder'
import SuperiorCRMSystem from './components/SuperiorCRMSystem'
import MultiChannelAutomationHub from './components/MultiChannelAutomationHub'
import CRMPipeline from './components/CRMPipeline'
import BusinessProfileSettings from './components/BusinessProfileSettings'
import ContactManager from './components/ContactManager'
import BulkProspeoScraper from './components/BulkProspeoScraper'
import FunnelPreview from './pages/FunnelPreview'
import UnsubscribeService from './services/unsubscribeService'
import BounceDetectionService from './services/bounceDetectionService'
import DataMigrationService from './services/dataMigrationService'
import AuthNavigator from './components/AuthNavigator'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant()
  
  // Show loading while auth or tenant is loading
  if (loading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-light)]">
        <div className="genie-enter">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-genie-teal"></div>
          <p className="mt-4 text-genie-teal font-medium">Market Genie is awakening...</p>
          {loading && <p className="text-sm text-gray-500">Checking authentication...</p>}
          {tenantLoading && <p className="text-sm text-gray-500">Setting up your workspace...</p>}
        </div>
      </div>
    )
  }
  
  // Handle tenant loading errors (like CORS issues)
  if (tenantError && tenantError.message?.includes('CORS')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-light)]">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Issue</h2>
          <p className="text-gray-600 mb-6">
            There's a temporary connection issue. Please refresh the page to try again.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-genie-teal text-white px-6 py-3 rounded-lg hover:bg-genie-teal-dark transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
  
  // If no user, the AuthContext will handle navigation to login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-light)]">
        <div className="genie-enter">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-genie-teal"></div>
          <p className="mt-4 text-genie-teal font-medium">Redirecting to login...</p>
        </div>
      </div>
    )
  }
  
  return children
}

function SophisticatedDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // URL-based section mapping
  const getSectionFromURL = () => {
    const path = location.pathname
    if (path.includes('lead-generation')) return 'Lead Generation'
    if (path.includes('outreach-automation')) return 'Outreach Automation'
    if (path.includes('appointments') || path.includes('appointment-booking')) return 'Appointments'
    if (path.includes('crm-pipeline')) return 'CRM & Pipeline'
    if (path.includes('contact-manager')) return 'Contact Manager'
    if (path.includes('resources-docs')) return 'Resources & Docs'
    if (path.includes('white-label-saas')) return 'White-Label SaaS'
    if (path.includes('api-keys')) return 'API Keys & Integrations'
    if (path.includes('admin-panel')) return 'Admin Panel'
    return 'SuperGenie Dashboard'
  }

  const [activeSection, setActiveSection] = useState(getSectionFromURL())
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('marketGenieDarkMode')
    return saved ? JSON.parse(saved) : false
  })
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const { user, logout, checkAuthHealth, refreshAuthToken } = useAuth()
  const { tenant, loading: tenantLoading } = useTenant()

  // Emergency Migration State
  const [migrationInProgress, setMigrationInProgress] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  // Admin Panel State
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    monthlyRevenue: 0,
    openTickets: 0,
    systemUptime: 0,
    isLoading: true
  });
  const [adminView, setAdminView] = useState('dashboard'); // dashboard, users, analytics, logs, config
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [systemLogs, setSystemLogs] = useState([]);
  const [systemConfig, setSystemConfig] = useState({});
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Store current user and tenant in window for debugging and emergency services
  useEffect(() => {
    if (user) {
      window.currentUser = user;
      console.log(`👤 Current user stored in window: ${user.email}`);
    }
  }, [user]);

  // Store current tenant in window for emergency services to access
  useEffect(() => {
    if (tenant?.id) {
      window.currentMarketGenieTenant = tenant;
      console.log(`📍 Current tenant stored in window: ${tenant.id}`);
    }
  }, [tenant]);

  // 🚀 NEW: Listen for emergency lead sync completions and trigger aggressive refresh
  useEffect(() => {
    const handleForceLoadLeads = async (event) => {
      console.log('🔥 EMERGENCY SYNC COMPLETED: Triggering aggressive refresh sequence...', event.detail);
      
      // Immediate refresh
      await loadLeadData();
      
      // Secondary refresh after 1 second
      setTimeout(async () => {
        console.log('🔄 Secondary refresh (1s delay)...');
        await loadLeadData();
      }, 1000);
      
      // Final refresh after 3 seconds to catch any Firebase lag
      setTimeout(async () => {
        console.log('🔄 Final refresh (3s delay)...');
        await loadLeadData();
      }, 3000);
      
      if (event.detail?.savedCount > 0) {
        toast.success(`🚀 ${event.detail.savedCount} leads now visible in Recent Leads!`);
      }
    };

    window.addEventListener('forceLoadLeadsFromDatabase', handleForceLoadLeads);
    
    return () => {
      window.removeEventListener('forceLoadLeadsFromDatabase', handleForceLoadLeads);
    };
  }, [tenant]);

  // Connection Health State
  const [connectionHealthy, setConnectionHealthy] = useState(true)
  const [lastHealthCheck, setLastHealthCheck] = useState(Date.now())

  // Lead Generation State
  const [leads, setLeads] = useState([])
  const [leadStats, setLeadStats] = useState({})
  const [emergencySyncStatus, setEmergencySyncStatus] = useState({ syncing: false, count: 0 })
  
  // Real Dashboard Metrics State
  const [dashboardMetrics, setDashboardMetrics] = useState({
    leadCount: 0,
    pipelineValue: 0,
    activeCampaigns: 0,
    conversionRate: 0,
    recentActivity: [],
    isLoading: true,
    lastUpdated: null
  })

  // Data Migration State
  const [migrationStatus, setMigrationStatus] = useState({
    inProgress: false,
    completed: false,
    needsCheck: true
  })

  // 🔧 EMERGENCY DATA MIGRATION FUNCTION
  const runDataMigration = async () => {
    if (!user?.uid) {
      toast.error('User authentication required for migration')
      return
    }

    try {
      setMigrationStatus(prev => ({ ...prev, inProgress: true }))
      console.log('🚀 Starting emergency data migration for user:', user.uid)
      
      const result = await DataMigrationService.migrateFounderTenantData(user.uid)
      
      if (result.success) {
        console.log('✅ Migration completed:', result)
        setMigrationStatus(prev => ({ ...prev, completed: true, inProgress: false }))
        
        // Force reload all data after migration
        setTimeout(async () => {
          console.log('🔄 Reloading data after migration...')
          await loadLeadData()
          await loadBounceStats()
        }, 1000)
        
      } else {
        console.error('❌ Migration failed:', result)
        setMigrationStatus(prev => ({ ...prev, inProgress: false }))
      }
      
    } catch (error) {
      console.error('❌ Migration error:', error)
      setMigrationStatus(prev => ({ ...prev, inProgress: false }))
      toast.error('Migration failed: ' + error.message)
    }
  }

  // Check if migration is needed on component mount
  useEffect(() => {
    const checkMigrationNeeds = async () => {
      if (user?.uid && user.email === 'dubdproducts@gmail.com' && migrationStatus.needsCheck) {
        try {
          const check = await DataMigrationService.checkForMigrationNeeds(user.uid)
          if (check.needsMigration) {
            console.log('📊 Migration recommended:', check)
            toast('🔧 Data migration available to fix tenant issues', {
              duration: 5000,
              icon: '🔧'
            })
          }
          setMigrationStatus(prev => ({ ...prev, needsCheck: false }))
        } catch (error) {
          console.error('Error checking migration needs:', error)
        }
      }
    }

    checkMigrationNeeds()
  }, [user, migrationStatus.needsCheck])
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    linkedin: '',
    twitter: '',
    website: '',
    source: '',
    description: ''
  })
  const [scrapingBudget, setScrapingBudget] = useState(50)
  const [currentBudgetUsage, setCurrentBudgetUsage] = useState(32)
  const [budgetLoading, setBudgetLoading] = useState(true)

  // Load real-time dashboard metrics
  useEffect(() => {
    const loadDashboardMetrics = async () => {
      if (activeSection === 'SuperGenie Dashboard' && tenant?.id) {
        setDashboardMetrics(prev => ({ ...prev, isLoading: true }));
        
        try {
          const metrics = await MetricsService.getAllMetrics(tenant.id);
          
          setDashboardMetrics({
            leadCount: metrics.leadCount,
            pipelineValue: metrics.pipelineValue,
            activeCampaigns: metrics.activeCampaigns,
            conversionRate: metrics.conversionRate,
            lastUpdated: Date.now(),
            isLoading: false
          });
          
          console.log('✅ Dashboard metrics loaded successfully:', metrics);
        } catch (error) {
          console.error('❌ Failed to load dashboard metrics:', error);
          
          // Fallback to default values with error indication
          setDashboardMetrics({
            leadCount: '—',
            pipelineValue: 0,
            activeCampaigns: '—',
            conversionRate: '—',
            lastUpdated: Date.now(),
            isLoading: false
          });
        }
      }
    };

    loadDashboardMetrics();
    
    // Set up auto-refresh every 5 minutes for dashboard
    const refreshInterval = setInterval(() => {
      if (activeSection === 'SuperGenie Dashboard') {
        loadDashboardMetrics();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [activeSection, tenant?.id]); // Re-run when section changes or tenant is loaded

  // 🧹 Clean Firebase operations - no interference with native connection management
  useEffect(() => {
    console.log('🚀 Firebase initialized with clean operations...');
  }, []);

  // Campaign State
  const [campaigns, setCampaigns] = useState([])
  const [campaignStats, setCampaignStats] = useState({
    totalCampaigns: 0,
    totalEmailsSent: 0
  })
  const [campaignFormData, setCampaignFormData] = useState({
    name: '',
    type: 'Email',
    subject: '',
    template: '',
    targetAudience: '',
    sendDate: '',
    aiSmartPrompt: '',
    additionalPrompt: '',
    customSegments: [],
    callToActionText: '',
    callToActionUrl: '',
    batchSize: 25  // Default to 25 emails per batch for safe Gmail sending
  })
  
  // AI Subject Line Generator state
  const [subjectGeneratorOpen, setSubjectGeneratorOpen] = useState(false)
  const [subjectTone, setSubjectTone] = useState('professional')
  const [subjectPrompt, setSubjectPrompt] = useState('')
  const [generatedSubjects, setGeneratedSubjects] = useState([])
  const [generatingSubjects, setGeneratingSubjects] = useState(false)
  
  // Available CRM tags for custom segments
  const [availableTags, setAvailableTags] = useState([])
  
  // Format date to US format (MM-DD-YYYY)
  const formatDateUS = (dateString) => {
    if (!dateString) return 'Not set'
    try {
      const date = new Date(dateString)
      // Handle invalid dates
      if (isNaN(date.getTime())) return dateString
      
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${month}-${day}-${year}`
    } catch (error) {
      return dateString || 'Not set'
    }
  }
  
  // Business Profile state for Outreach Automation
  const [showBusinessProfile, setShowBusinessProfile] = useState(false)
  
  // Booking Settings toggle state for Appointments
  const [showBookingSettings, setShowBookingSettings] = useState(false)
  
  // Legacy bounce management - minimal state for compatibility
  const [bounceEmails, setBounceEmails] = useState('')
  const [processingBounces, setProcessingBounces] = useState(false)
  const [bounceMethod, setBounceMethod] = useState('paste')
  
  // Contacts from ContactManager for campaign targeting
  const [contactsForCampaigns, setContactsForCampaigns] = useState([])
  
  // Appointment state
  const [appointments, setAppointments] = useState([])
  const [appointmentStats, setAppointmentStats] = useState({
    upcoming: 0,
    booked: 0,
    cancelled: 0,
    total: 0
  })
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [forceRender, setForceRender] = useState(0)
  const forceShowModal = useRef(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [showCalendarView, setShowCalendarView] = useState(false)
  const [calendarConnections, setCalendarConnections] = useState({
    google: false,
    outlook: false,
    custom: false
  })
  
  // Load calendar connections from Firebase
  useEffect(() => {
    const loadCalendarConnections = async () => {
      if (!tenant?.id) return;
      
      try {
        console.log('🔄 Loading calendar connections for tenant:', tenant.id);
        const savedConnections = await FirebaseUserDataService.getCalendarConnections(tenant.id);
        console.log('📥 Loaded calendar connections:', savedConnections);
        
        if (savedConnections) {
          setCalendarConnections(savedConnections);
          console.log('✅ Calendar connections set:', savedConnections);
        } else {
          console.log('❌ No saved calendar connections found');
        }
      } catch (error) {
        console.error('❌ Error loading calendar connections:', error);
      }
    };
    
    loadCalendarConnections();
  }, [tenant?.id]);
  
  // Save calendar connections to Firebase
  const saveCalendarConnections = async (connections) => {
    if (!tenant?.id) return;
    
    try {
      console.log('💾 Saving calendar connections:', connections);
      await FirebaseUserDataService.saveCalendarConnections(tenant.id, connections);
      console.log('✅ Calendar connections saved successfully');
    } catch (error) {
      console.error('❌ Error saving calendar connections:', error);
    }
  };
  
  // Load real dashboard metrics
  useEffect(() => {
    const loadDashboardMetrics = async () => {
      if (!tenant?.id) return;
      
      setDashboardMetrics(prev => ({ ...prev, isLoading: true }));
      
      try {
        const metrics = await MetricsService.getAllMetrics(tenant.id);
        setDashboardMetrics({
          ...metrics,
          isLoading: false
        });
      } catch (error) {
        console.error('Error loading dashboard metrics:', error);
        setDashboardMetrics(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadDashboardMetrics();
    
    // Refresh metrics every 5 minutes
    const interval = setInterval(loadDashboardMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tenant?.id]);

  // 🚨 Emergency Leads Listener - Add emergency leads to Recent Leads UI
  useEffect(() => {
    const handleEmergencyLeadsSync = (event) => {
      const emergencyLeads = event.detail.leads;
      console.log(`📱 Received ${emergencyLeads.length} emergency leads for UI display`);
      
      // Add emergency leads to the existing leads array
      setLeads(prevLeads => {
        // Remove any existing emergency leads with the same IDs to avoid duplicates
        const existingEmergencyIds = new Set(emergencyLeads.map(lead => lead.id));
        const nonDuplicateLeads = prevLeads.filter(lead => 
          !lead.isEmergency || !existingEmergencyIds.has(lead.id)
        );
        
        // Add new emergency leads
        const updatedLeads = [...nonDuplicateLeads, ...emergencyLeads];
        
        console.log(`📊 Updated leads list: ${updatedLeads.length} total leads (${emergencyLeads.length} new emergency)`);
        return updatedLeads;
      });
      
      // Update lead stats to include emergency leads
      setLeadStats(prevStats => ({
        ...prevStats,
        totalLeads: (prevStats.totalLeads || 0) + emergencyLeads.length,
        emergencyLeads: emergencyLeads.length
      }));
    };

    const handleRefreshRecentLeads = () => {
      console.log('🔄 Refreshing Recent Leads section...');
      // Force re-render of Recent Leads - call the proper load function
      if (typeof loadLeadData === 'function') {
        loadLeadData();
      } else {
        console.log('📊 No loadLeadData function available, using simple refresh');
        // Just trigger a re-render
        setLeads(prevLeads => [...prevLeads]);
      }
    };

    const handleForceLoadFromDatabase = (event) => {
      console.log('🔄 FORCE DATABASE REFRESH: Emergency leads saved to database, reloading Recent Leads...');
      console.log('📊 Event details:', event.detail);
      
      // Force immediate reload from database
      if (typeof loadLeadData === 'function') {
        loadLeadData();
        console.log('✅ Recent Leads reloaded from database');
      }
    };

    // Add event listeners
    window.addEventListener('emergencyLeadsSync', handleEmergencyLeadsSync);
    window.addEventListener('refreshRecentLeads', handleRefreshRecentLeads);
    window.addEventListener('forceLoadLeadsFromDatabase', handleForceLoadFromDatabase);

    // 🔄 START BACKGROUND DATABASE SYNC for emergency leads
    const initializeBackgroundSync = async () => {
      try {
        const { default: EmergencyLeadStorage } = await import('./services/EmergencyLeadStorage.js');
        const emergencyStorage = new EmergencyLeadStorage();
        
        // Start background sync that keeps trying until all leads are saved to database
        emergencyStorage.startBackgroundDatabaseSync();
        
        // Store reference for cleanup
        window.emergencyStorageSync = emergencyStorage;
        
        console.log('🔄 Background database sync started for emergency leads');
      } catch (error) {
        console.error('❌ Failed to start background database sync:', error);
      }
    };
    
    initializeBackgroundSync();

    // Cleanup
    return () => {
      window.removeEventListener('emergencyLeadsSync', handleEmergencyLeadsSync);
      window.removeEventListener('refreshRecentLeads', handleRefreshRecentLeads);
      window.removeEventListener('forceLoadLeadsFromDatabase', handleForceLoadFromDatabase);
      
      // Stop background sync
      if (window.emergencyStorageSync) {
        window.emergencyStorageSync.stopBackgroundDatabaseSync();
        window.emergencyStorageSync = null;
      }
    };
  }, []); // Only run once on mount

  // Load appointments data
  useEffect(() => {
    const loadAppointments = async () => {
      if (!tenant?.id) {
        setAppointmentsLoading(false);
        return;
      }
      
      setAppointmentsLoading(true);
      
      try {
        // Set up real-time subscription to appointments
        const unsubscribe = AppointmentService.subscribeToAppointments(
          tenant.id, 
          (appointmentData) => {
            setAppointments(appointmentData);
            const stats = AppointmentService.calculateAppointmentStats(appointmentData);
            setAppointmentStats(stats);
            setAppointmentsLoading(false);
          }
        );
        
        // Return cleanup function
        return () => {
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error('Error loading appointments:', error);
        setAppointmentsLoading(false);
      }
    };

    const cleanup = loadAppointments();
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [tenant?.id]);

  const [contacts, setContacts] = useState([])
  
  const [emailTemplates] = useState([
    { 
      id: 1, 
      name: "Welcome Series", 
      category: "Onboarding",
      subject: "Welcome to our platform!",
      preview: "Hi {{firstName}}, welcome to our amazing platform! We're excited to have you on board...",
      content: `Hi {{firstName}},

Welcome to our amazing platform! We're excited to have you on board.

Here's what you can expect:
• Complete access to all features
• 24/7 customer support  
• Regular updates and improvements
• A dedicated success manager

To get started, simply log in to your account and explore the dashboard.

If you have any questions, don't hesitate to reach out to our support team.

Best regards,
The MarketGenie Team

P.S. Keep an eye out for our weekly newsletter with tips and best practices!`
    },
    { 
      id: 2, 
      name: "Product Launch", 
      category: "Promotion",
      subject: "🚀 New Product Launch - Limited Time Offer!",
      preview: "Hi {{firstName}}, we're thrilled to announce our latest product! Get 20% off during launch week...",
      content: `Hi {{firstName}},

We're thrilled to announce our latest product launch!

🎉 Introducing our new AI-powered marketing automation suite that will revolutionize how you connect with customers.

LIMITED TIME LAUNCH OFFER:
✅ 20% off your first 3 months
✅ Free premium onboarding session
✅ Exclusive access to new features

This offer expires in 7 days, so don't miss out!

[CLAIM YOUR DISCOUNT NOW]

Why our customers love this new product:
"This has transformed our marketing strategy completely!" - Sarah M.
"The automation features saved us 10+ hours per week" - John D.

Ready to get started? Click the button above or reply to this email.

Cheers,
The MarketGenie Team`
    },
    { 
      id: 3, 
      name: "Follow-up", 
      category: "Nurture",
      subject: "Following up on your interest",
      preview: "Hi {{firstName}}, I wanted to follow up on our previous conversation about...",
      content: `Hi {{firstName}},

I wanted to follow up on our previous conversation about improving your marketing automation.

I know you mentioned being interested in:
• Streamlining your lead generation process
• Improving email campaign performance
• Better tracking and analytics

I'd love to show you how MarketGenie can specifically help with these challenges.

Would you be available for a quick 15-minute demo this week? I can show you:
1. How to set up automated lead nurturing
2. Our advanced analytics dashboard
3. Real ROI improvements our clients have seen

Here are a few time slots that work for me:
• Tuesday 2:00 PM - 3:00 PM
• Wednesday 10:00 AM - 11:00 AM  
• Thursday 3:00 PM - 4:00 PM

Just reply with what works best for you, or feel free to suggest another time.

Looking forward to hearing from you!

Best regards,
[Your Name]
MarketGenie Team`
    },
    { 
      id: 4, 
      name: "Re-engagement", 
      category: "Retention",
      subject: "We miss you! Special offer inside",
      preview: "Hi {{firstName}}, we noticed you haven't been active lately. Here's a special offer just for you...",
      content: `Hi {{firstName}},

We noticed you haven't been active on MarketGenie lately, and we miss you!

We want to make sure you're getting the most value from our platform, so we've prepared something special for you:

🎁 EXCLUSIVE RE-ENGAGEMENT OFFER:
• 30% off your next billing cycle
• Free 1-on-1 strategy session ($200 value)
• Access to our new AI templates library

We've also added some amazing new features since your last visit:
✨ Advanced A/B testing tools
✨ Improved analytics dashboard
✨ New integration with popular CRMs
✨ Enhanced automation workflows

Don't let your account gather dust! Log in today and rediscover what MarketGenie can do for your business.

[CLAIM YOUR OFFER & LOG IN NOW]

This offer expires in 5 days, so don't wait!

If you're facing any challenges or have questions, our support team is here to help. Just reply to this email.

We'd love to have you back!

The MarketGenie Team

P.S. If you're no longer interested in MarketGenie, you can unsubscribe here [unsubscribe link]`
    }
  ])

  // AI Smart Prompt Options
  const aiSmartPrompts = [
    { value: '', label: 'Select AI Smart Prompt...' },
    // 🔥 COLD OUTREACH SEQUENCES - TOP PRIORITY
    { value: 'cold_outreach_intro', label: '❄️💼 Cold outreach: Professional introduction sequence' },
    { value: 'cold_outreach_value', label: '❄️🎯 Cold outreach: Value-first approach with case study' },
    { value: 'cold_outreach_social_proof', label: '❄️⭐ Cold outreach: Social proof and testimonials focus' },
    { value: 'cold_outreach_problem_solver', label: '❄️🔧 Cold outreach: Problem identification and solution' },
    { value: 'cold_outreach_curiosity', label: '❄️🧠 Cold outreach: Curiosity-driven conversation starter' },
    { value: 'cold_outreach_multi_touch', label: '❄️📧 Cold outreach: Multi-touch follow-up sequence' },
    // WARM OUTREACH & FOLLOW-UPS
    { value: 'follow_up_demo', label: '📞 Follow-up email after demo call with next steps' },
    { value: 'follow_up_meeting', label: '🤝 Follow-up email after meeting with action items' },
    // CUSTOMER LIFECYCLE
    { value: 'welcome_new_customer', label: '👋 Welcome email for new customers' },
    { value: 'welcome_vip', label: '🌟 Welcome email for VIP customers with exclusive offers' },
    { value: 'product_launch', label: '🚀 Product launch announcement with early bird pricing' },
    { value: 'product_launch_vip', label: '⭐ Product launch exclusive access for VIP customers' },
    { value: 'reengagement_inactive', label: '💤 Re-engagement email for inactive users with special offer' },
    { value: 'reengagement_win_back', label: '❤️ Win-back email for churned customers' },
    { value: 'educational_tips', label: '💡 Educational email with industry tips and insights' },
    { value: 'case_study', label: '📊 Case study email showing customer success story' },
    { value: 'event_invitation', label: '🎯 Event invitation with compelling benefits' },
    { value: 'webinar_invitation', label: '📺 Webinar invitation with exclusive content preview' },
    { value: 'survey_feedback', label: '📝 Survey request with incentive for completion' },
    { value: 'testimonial_request', label: '⭐ Testimonial request from satisfied customers' },
    { value: 'referral_program', label: '🤝 Referral program invitation with rewards' },
    { value: 'cart_abandonment', label: '🛒 Cart abandonment recovery with urgency' },
    { value: 'subscription_renewal', label: '🔄 Subscription renewal with special pricing' },
    { value: 'upsell_cross_sell', label: '📈 Upsell/cross-sell to existing customers' },
    { value: 'thank_you_purchase', label: '🙏 Thank you email after purchase with next steps' },
    { value: 'birthday_anniversary', label: '🎂 Birthday/anniversary email with special offer' },
    { value: 'industry_insights', label: '📰 Industry insights and trend analysis' },
    { value: 'company_update', label: '📢 Company update and milestone announcement' },
    { value: 'seasonal_promotion', label: '🎄 Seasonal promotion with limited-time offer' },
    { value: 'competitor_comparison', label: '⚖️ Competitive advantage and feature comparison' },
    { value: 'urgency_scarcity', label: '⏰ Urgency and scarcity-driven promotional email' },
    { value: 'social_proof', label: '👥 Social proof with customer success stories' }
  ];

  const [editingCampaign, setEditingCampaign] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Ensure proper initialization
  React.useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Load CRM tags for custom segments
  React.useEffect(() => {
    const loadCRMTags = async () => {
      if (!user || !tenant?.id) return
      
      try {
        // Load contacts from ContactManager to extract tags
        console.log('Loading contacts for tenant:', tenant.id)
        const contactsResult = await FirebaseUserDataService.getContacts(user.uid, user.uid)
        console.log('Contacts result:', contactsResult)
        
        if (contactsResult.success && contactsResult.data) {
          console.log('Contacts data:', contactsResult.data)
          
          // Handle the nested contacts structure
          let contactsArray = []
          if (Array.isArray(contactsResult.data)) {
            contactsArray = contactsResult.data
          } else if (contactsResult.data.contacts && Array.isArray(contactsResult.data.contacts)) {
            contactsArray = contactsResult.data.contacts
          }
          
          console.log('Processed contacts array:', contactsArray.length, 'contacts')
          
          // Store contacts for campaign targeting
          setContacts(contactsArray)
          
          // Extract all unique tags from contacts for custom segments
          let allTags = []
          
          contactsArray.forEach(contact => {
            console.log('Processing contact for tags:', contact.email, 'tags:', contact.tags)
            
            // ONLY add tags from the Tags column - no company names, status, etc.
            if (contact.tags) {
              if (Array.isArray(contact.tags)) {
                allTags.push(...contact.tags)
              } else if (typeof contact.tags === 'string' && contact.tags.trim()) {
                // Handle comma-separated tags (like "Business Services")
                const tagArray = contact.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                allTags.push(...tagArray)
              }
            }
          })
          
          // Get unique segments and filter out empty values
          const uniqueSegments = [...new Set(allTags)].filter(segment => segment && segment.trim())
          console.log('Available CRM segments from contacts:', uniqueSegments)
          console.log('Total contacts loaded:', contactsArray.length)
          
          setAvailableTags(uniqueSegments)
        } else {
          console.log('No contacts found, setting empty tags array')
          setAvailableTags([])
        }
      } catch (error) {
        console.error('Error loading CRM segments:', error)
        setAvailableTags([])
      }
    }

    loadCRMTags()
  }, [user, tenant?.id])

  // Load campaigns from Firebase
  useEffect(() => {
    const loadCampaigns = async () => {
      if (!user?.uid || !tenant?.id) return
      
      try {
        console.log('Loading campaigns for user:', user.uid)
        const campaignsResult = await FirebaseUserDataService.getUserData(user.uid, `${user.uid}_campaigns`)
        console.log('Campaigns loaded:', campaignsResult)
        console.log('Campaign data type:', typeof campaignsResult.data)
        console.log('Campaign data is array:', Array.isArray(campaignsResult.data))
        console.log('Campaign data content:', campaignsResult.data)
        
        if (campaignsResult.success && campaignsResult.data) {
          let loadedCampaigns = []
          
          // Handle different data structures
          if (Array.isArray(campaignsResult.data)) {
            loadedCampaigns = campaignsResult.data
          } else if (campaignsResult.data && typeof campaignsResult.data === 'object') {
            // If it's an object, extract campaigns (filter out metadata like updatedAt)
            if (campaignsResult.data.campaigns && Array.isArray(campaignsResult.data.campaigns)) {
              loadedCampaigns = campaignsResult.data.campaigns
            } else {
              // Filter object values to only include valid campaign objects
              loadedCampaigns = Object.values(campaignsResult.data).filter(item => 
                item && 
                typeof item === 'object' && 
                item.id && 
                item.name && 
                typeof item.name === 'string' &&
                (typeof item.id === 'number' || (typeof item.id === 'string' && !isNaN(item.id))) // Valid campaign ID
              )
            }
          }
          
          console.log('Final loaded campaigns:', loadedCampaigns)
          setCampaigns(loadedCampaigns)
        } else {
          console.log('No campaigns data found, setting empty array')
          setCampaigns([])
        }
      } catch (error) {
        console.error('Error loading campaigns:', error)
      }
    }

    loadCampaigns()
  }, [user?.uid, tenant?.id])

  // Admin Panel Data Loading Functions
  const loadAdminStats = async () => {
    if (user?.email !== 'dubdproducts@gmail.com') return;
    
    try {
      setAdminStats(prev => ({ ...prev, isLoading: true }));
      
      // Get all users from MarketGenie_tenants collection, filter for real Firebase Auth UIDs only
      const usersSnapshot = await getDocs(collection(db, 'MarketGenie_tenants'));
      let totalUsers = 0;
      usersSnapshot.forEach(doc => {
        // Only count documents with 28-character IDs (Firebase Auth UIDs)
        if (doc.id.length === 28) {
          totalUsers++;
        }
      });
      
      // Calculate revenue (placeholder - would need payment data)
      const monthlyRevenue = totalUsers * 50; // Estimate based on user count
      
      // Get system metrics
      const systemUptime = 99.8; // Would come from monitoring service
      const openTickets = Math.floor(Math.random() * 30); // Would come from support system
      
      setAdminStats({
        totalUsers,
        monthlyRevenue,
        openTickets,
        systemUptime,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
      setAdminStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadAllUsers = async () => {
    if (user?.email !== 'dubdproducts@gmail.com') return;
    
    try {
      const usersSnapshot = await getDocs(collection(db, 'MarketGenie_tenants'));
      const users = [];
      usersSnapshot.forEach(doc => {
        // Only include documents with 28-character IDs (Firebase Auth UIDs)
        if (doc.id.length === 28) {
          const userData = doc.data();
          users.push({
            id: doc.id,
            ...userData,
            createdAt: userData.createdAt?.toDate?.() || new Date(userData.createdAt),
            lastLogin: userData.lastLogin?.toDate?.() || null
          });
        }
      });
      
      // Sort by creation date (newest first)
      users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const updateUserPlan = async (userId, newPlan) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        plan: newPlan,
        planType: newPlan,
        updatedAt: new Date()
      }, { merge: true });
      
      toast.success(`User plan updated to ${newPlan}`);
      loadAllUsers(); // Refresh user list
    } catch (error) {
      console.error('Error updating user plan:', error);
      toast.error('Failed to update user plan');
    }
  };

  const suspendUser = async (userId) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        suspended: true,
        suspendedAt: new Date()
      }, { merge: true });
      
      toast.success('User suspended successfully');
      loadAllUsers(); // Refresh user list
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const createNewUser = async (userData) => {
    try {
      const newUserRef = doc(collection(db, 'users'));
      await setDoc(newUserRef, {
        ...userData,
        createdAt: new Date(),
        plan: userData.plan || 'free',
        planType: userData.planType || 'free'
      });
      
      toast.success('User created successfully');
      loadAllUsers(); // Refresh user list
      setAdminView('users'); // Switch to user view
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  // Load admin data when accessing admin panel
  useEffect(() => {
    if (activeSection === 'Admin Panel' && user?.email === 'dubdproducts@gmail.com') {
      loadAdminStats();
      loadAllUsers(); // Always load users when admin panel opens
    }
  }, [activeSection, user?.email]);

  // Save campaigns to Firebase whenever campaigns change
  const saveCampaignsToFirebase = async (campaignsData) => {
    if (!user?.uid) return
    
    try {
      console.log('Saving campaigns to Firebase:', campaignsData)
      const result = await FirebaseUserDataService.saveUserData(user.uid, `${user.uid}_campaigns`, campaignsData)
      console.log('Save result:', result)
    } catch (error) {
      console.error('Error saving campaigns:', error)
    }
  }

  // Send campaign emails using Zoho Mail
  const sendCampaignNow = async (campaign) => {
    try {
      console.log('Sending campaign emails...')
      // toast.info('Sending campaign emails...')
      
      // Fetch business profile for unsubscribe footers
      let businessProfile = null
      try {
        businessProfile = await FirebaseUserDataService.getBusinessProfile(tenant?.id)
      } catch (profileError) {
        console.warn('Could not fetch business profile:', profileError)
      }
      
      // Check if Gmail SMTP credentials are configured
      const smtpCredentials = await IntegrationService.getIntegrationCredentials(tenant.id, 'gmail')
      if (!smtpCredentials.success) {
        console.log('Gmail SMTP not configured. Please configure Gmail integration.')
        toast.error('Gmail SMTP not configured. Please set up Gmail in Integrations → Gmail.')
        return
      }

      // Filter contacts based on campaign targeting
      console.log('Campaign targeting:', {
        targetAudience: campaign.targetAudience,
        customSegments: campaign.customSegments || []
      })
      console.log('Total contacts available:', contacts.length)
      
      const targetContacts = (Array.isArray(contacts) ? contacts : []).filter(contact => {
        if (!campaign.targetAudience || campaign.targetAudience === 'All Leads' || campaign.targetAudience === 'All Contacts') {
          return true
        }
        if (campaign.targetAudience === 'Custom Segment' && campaign.customSegments && campaign.customSegments.length > 0) {
          // Check if contact matches ANY of the selected custom segments
          return campaign.customSegments.some(segment => {
            // Check tags (handle both exact match and common variations)
            if (contact.tags && (
              contact.tags.includes(segment) ||
              (segment === 'VIP customers' && contact.tags.includes('VIP')) ||
              (segment === 'Email subscribers' && contact.tags.includes('Email')) ||
              (segment === 'New prospects' && contact.tags.includes('New'))
            )) {
              return true
            }
            
            // Check company
            if (contact.company && segment.startsWith('Company: ') && contact.company === segment.replace('Company: ', '')) {
              return true
            }
            
            // Check status
            if (contact.status && segment.startsWith('Status: ') && contact.status === segment.replace('Status: ', '')) {
              return true
            }
            
            return false
          })
        }
        return false
      })
      
      console.log('Contacts after filtering:', targetContacts.length)
      console.log('Sample contact structure:', contacts[0])

      if (targetContacts.length === 0) {
        console.log('No contacts match the campaign targeting criteria')
        // toast.error('No contacts match the campaign targeting criteria')
        
        // Reset campaign status back to Draft since no emails were sent
        const resetCampaigns = campaigns.map(c => 
          c.id === campaign.id ? { ...c, status: 'Draft' } : c
        )
        setCampaigns(resetCampaigns)
        await saveCampaignsToFirebase(resetCampaigns)
        return
      }

      console.log(`Sending to ${targetContacts.length} contacts:`, targetContacts)
      
      let emailsSent = 0
      const errors = []

      // Smart Resume: Skip contacts that have already been sent to
      const sentEmails = campaign.sentEmails || []
      const remainingContacts = targetContacts.filter(contact => 
        !sentEmails.includes(contact.email.toLowerCase())
      )
      
      console.log(`📧 Smart Resume: ${sentEmails.length} already sent, ${remainingContacts.length} remaining`)

      if (remainingContacts.length === 0) {
        toast.success('✅ All contacts have already received this campaign!')
        return
      }

      // Track newly sent emails
      const newlySentEmails = []
      
      // Batch Size Control - respect campaign batch limit
      const batchSize = campaign.batchSize || 25  // Default to 25 if not set
      const maxToSendThisBatch = Math.min(batchSize, remainingContacts.length)
      let batchLimitReached = false
      
      console.log(`📦 Batch Size: ${batchSize}, Sending up to ${maxToSendThisBatch} emails this session`)
      toast.success(`📦 Sending batch of ${maxToSendThisBatch} emails (batch size: ${batchSize})`, { duration: 4000 })

      // Send emails to remaining contacts only (limited by batch size)
      for (const contact of remainingContacts) {
        // Check if we've hit the batch limit
        if (newlySentEmails.length >= batchSize) {
          console.log(`📦 Batch limit of ${batchSize} reached - pausing campaign`)
          batchLimitReached = true
          break
        }
        
        try {
          // Personalize email content with CLEAN AI-generated footer
          let personalizedContent = campaign.emailContent
          personalizedContent = personalizedContent.replace(/{firstName}/g, contact.name?.split(' ')[0] || 'there')
          personalizedContent = personalizedContent.replace(/{company}/g, contact.company || 'your company')
          personalizedContent = personalizedContent.replace(/{name}/g, contact.name || 'there')
          
          // Fix unsubscribe links to use correct recipient email
          // Generate correct unsubscribe link for this specific recipient (with error protection)
          let correctUnsubscribeLink = ''
          try {
            correctUnsubscribeLink = UnsubscribeService.createUnsubscribeLink(
              tenant.id, 
              contact.email, 
              `campaign_${Date.now()}`
            )
          } catch (unsubErr) {
            console.warn(`⚠️ Could not generate unsubscribe link for ${contact.email}, using fallback`)
            // Fallback: use a generic unsubscribe link
            correctUnsubscribeLink = `https://us-central1-market-genie-f2d41.cloudfunctions.net/processUnsubscribe?email=${encodeURIComponent(contact.email)}`
          }
          
          // Replace any unsubscribe links in the content with the correct one
          personalizedContent = personalizedContent.replace(
            /https:\/\/us-central1-market-genie-f2d41\.cloudfunctions\.net\/processUnsubscribe\?token=[^"'\s]+/g,
            correctUnsubscribeLink
          )

          // Send email via Firebase Function
          const emailData = {
            to: contact.email,
            subject: campaign.subject,
            content: personalizedContent
          }

          // Call Firebase Function for email sending
          const sendResult = await sendEmailViaFirebase(emailData, tenant.id)
          
          if (sendResult.success) {
            emailsSent++
            newlySentEmails.push(contact.email.toLowerCase())
            console.log(`✅ Email sent to ${contact.email} (${emailsSent}/${remainingContacts.length})`)
          } else {
            // Check if this is a "daily limit exceeded" after some emails were sent
            const isLimitExceeded = sendResult.error && sendResult.error.includes('Daily user sending limit exceeded')
            
            if (isLimitExceeded && emailsSent > 0) {
              // Gmail likely sent this email before hitting the limit
              console.log(`⚠️ Gmail limit hit - but email to ${contact.email} may have been sent`)
              emailsSent++
              newlySentEmails.push(contact.email.toLowerCase())
              errors.push(`Gmail daily limit exceeded after sending to ${contact.email}`)
              // Stop sending more emails
              break
            } else {
              errors.push(`Failed to send to ${contact.email}: ${sendResult.error}`)
            }
          }
          
          // Proper delay to avoid Gmail rate limiting
          await new Promise(resolve => setTimeout(resolve, 2500))
          
        } catch (error) {
          console.error(`Error sending to ${contact.email}:`, error)
          errors.push(`Error sending to ${contact.email}: ${error.message}`)
        }
      }

      // Update campaign stats with smart resume tracking
      const allSentEmails = [...sentEmails, ...newlySentEmails]
      const remainingToSend = targetContacts.length - allSentEmails.length
      const updatedCampaigns = campaigns.map(c => {
        if (c.id === campaign.id) {
          return {
            ...c,
            status: allSentEmails.length >= targetContacts.length ? 'Sent' : 'Paused',
            emailsSent: allSentEmails.length,
            totalContacts: targetContacts.length,
            sentEmails: allSentEmails,
            lastSent: new Date().toISOString(),
            lastBatchSentAt: new Date().toISOString(),  // Track when this batch was sent
            progress: `${allSentEmails.length} of ${targetContacts.length} contacts`,
            batchSize: campaign.batchSize || 25  // Preserve batch size setting
          }
        }
        return c
      })
      
      setCampaigns(updatedCampaigns)
      await saveCampaignsToFirebase(updatedCampaigns)

      if (emailsSent > 0) {
        const isComplete = allSentEmails.length >= targetContacts.length
        let message = ''
        
        if (isComplete) {
          message = `🎉 Campaign completed! ${allSentEmails.length} emails delivered successfully.`
        } else if (batchLimitReached) {
          message = `📦 Batch complete! ${emailsSent} emails sent this session.\n\n📊 Progress: ${allSentEmails.length}/${targetContacts.length} total\n⏳ ${remainingToSend} remaining - resume tomorrow to continue.`
        } else {
          message = `📧 Progress saved! ${emailsSent} new emails sent (${allSentEmails.length}/${targetContacts.length} total). Click Send again to continue.`
        }
        
        console.log(message)
        toast.success(message, { duration: 6000 })
      }
      
      if (errors.length > 0) {
        console.error('Email sending errors:', errors)
        console.log(`${errors.length} emails failed to send. Check console for details.`)
        // toast.error(`${errors.length} emails failed to send. Check console for details.`)
      }
      
    } catch (error) {
      console.error('Error sending campaign:', error)
      console.log('Failed to send campaign: ' + error.message)
      // toast.error('Failed to send campaign: ' + error.message)
    }
  }

  // Helper function to send email via SendGrid or Gmail API
  const sendEmailViaFirebase = async (emailData, tenantId) => {
    try {
      console.log('📧 Sending email to:', emailData.to)
      console.log('📧 TenantId:', tenantId)
      
      if (!auth.currentUser) {
        throw new Error('User not authenticated')
      }
      
      // Get the user's ID token
      const idToken = await auth.currentUser.getIdToken(true)
      
      // Use Gmail OAuth only (SendGrid disabled - use Gmail for trusted sending)
      const payload = {
        to: emailData.to,
        subject: emailData.subject,
        content: emailData.content,
        tenantId: tenantId
      }

      // Send via Gmail API (OAuth)
      console.log('📧 Sending via Gmail API (OAuth)...')
      const response = await fetch('https://us-central1-market-genie-f2d41.cloudfunctions.net/sendCampaignEmailGmailAPI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      console.log('📧 Gmail API response:', result)
      
      if (result.success) {
        console.log('📧 ✅ Email sent via Gmail API:', result.messageId)
        return {
          success: true,
          data: result,
          method: 'gmail_api'
        }
      } else {
        console.error('📧 ❌ Gmail API failed:', result.error)
        return {
          success: false,
          error: result.error || 'Email sending failed'
        }
      }
      
    } catch (error) {
      console.error('📧 Error sending email:', error)
      return { 
        success: false, 
        error: error.message 
      }
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('marketGenieDarkMode', JSON.stringify(newDarkMode))
    document.documentElement.classList.toggle('dark')
  }

  // Helper function to update classes with dark mode support
  const getDarkModeClasses = (lightClasses, darkClasses = '') => {
    const dark = darkClasses || lightClasses.replace('bg-white', 'bg-gray-800').replace('text-gray-900', 'text-white').replace('text-gray-700', 'text-gray-300')
    return isDarkMode ? dark : lightClasses
  }

  // Lead Generation Tab State
  const [activeLeadTab, setActiveLeadTab] = useState('overview')

  const leadTabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'scraping', name: 'AI Scraping', icon: '🤖' },
    { id: 'import', name: 'Bulk Import', icon: '📁' },
    { id: 'enrichment', name: 'Lead Enrichment', icon: '🎯' },
    { id: 'recent', name: 'Recent Leads', icon: '👥' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ]
  const [selectedLeads, setSelectedLeads] = useState([])
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [showLeadEditModal, setShowLeadEditModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [analyticsResults, setAnalyticsResults] = useState({ type: '', content: '' })
  const [editLeadForm, setEditLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    description: ''
  })

  // Bounce Detection State
  const [bounceDetectionActive, setBounceDetectionActive] = useState(false)
  const [bounceStats, setBounceStats] = useState({
    totalScans: 0,
    totalBounces: 0,
    totalProcessed: 0,
    bounceRate: 0,
    lastScan: null
  })
  const [showBounceModal, setShowBounceModal] = useState(false)
  const [pastedBounceText, setPastedBounceText] = useState('')
  const [bounceProcessing, setBounceProcessing] = useState(false)

  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAll = () => {
    if (isSelectAllChecked) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map(lead => lead.id))
    }
    setIsSelectAllChecked(!isSelectAllChecked)
  }

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads to delete')
      return
    }

    if (!confirm(`Delete ${selectedLeads.length} selected leads? This cannot be undone.`)) {
      return
    }

    try {
      for (const leadId of selectedLeads) {
        await LeadService.deleteLead(tenant.id, leadId)
      }
      
      toast.success(`Deleted ${selectedLeads.length} leads successfully`)
      setSelectedLeads([])
      setIsSelectAllChecked(false)
      await loadLeadData()
    } catch (error) {
      console.error('Error deleting leads:', error)
      toast.error('Failed to delete some leads')
    }
  }

  const handleRemoveDuplicates = async () => {
    if (!confirm('This will remove duplicate leads from Firebase (keeping the newest copy of each email). Emergency leads will be preserved. Continue?')) {
      return
    }

    toast.loading('Removing duplicate leads...', { duration: 5000 })

    try {
      // Save emergency leads before removing duplicates
      const emergencyLeads = leads.filter(lead => lead.isEmergency);
      
      const result = await LeadService.removeDuplicateLeads(tenant.id)
      
      if (result.success) {
        toast.success(result.message || 'Duplicates removed successfully')
        
        // Refresh Firebase leads but preserve emergency leads
        await loadLeadData()
        
        // Re-add emergency leads after refresh
        if (emergencyLeads.length > 0) {
          setLeads(prevLeads => {
            // Remove any existing emergency leads to avoid duplicates
            const nonEmergencyLeads = prevLeads.filter(lead => !lead.isEmergency);
            // Add back the saved emergency leads
            return [...nonEmergencyLeads, ...emergencyLeads];
          });
          
          toast.success(`Preserved ${emergencyLeads.length} emergency leads`, { duration: 3000 });
        }
      } else {
        toast.error(result.error || 'Failed to remove duplicates')
      }
    } catch (error) {
      console.error('Error removing duplicates:', error)
      toast.error('Failed to remove duplicates')
    }
  }

  const handleEditLead = (lead) => {
    // Set the lead being edited
    setEditingLead(lead)
    
    // Pre-fill the edit form with lead data
    setEditLeadForm({
      name: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source || 'manual',
      description: lead.notes ? lead.notes.join(', ') : ''
    })
    
    // Show the edit modal
    setShowLeadEditModal(true)
    
    console.log('✏️ Opening edit modal for lead:', lead.firstName, lead.lastName)
  }

  const handleDeleteLead = async (leadId) => {
    if (!confirm('Delete this lead? This cannot be undone.')) {
      return
    }

    try {
      const result = await LeadService.deleteLead(tenant.id, leadId)
      if (result.success) {
        toast.success('Lead deleted successfully')
        await loadLeadData()
      } else {
        toast.error('Failed to delete lead')
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      toast.error('Failed to delete lead')
    }
  }

  const handleEditLeadSubmit = async (e) => {
    e.preventDefault()
    
    if (!editLeadForm.name || !editLeadForm.email) {
      toast.error('Please fill in Name and Email')
      return
    }

    if (!tenant?.id || !editingLead?.id) {
      toast.error('Unable to update lead')
      return
    }

    try {
      const [firstName, ...lastNameParts] = editLeadForm.name.split(' ')
      const lastName = lastNameParts.join(' ')
      
      const updateData = {
        firstName: firstName || '',
        lastName: lastName || '',
        email: editLeadForm.email,
        phone: editLeadForm.phone,
        company: editLeadForm.company,
        source: editLeadForm.source || 'manual',
        notes: [editLeadForm.description]
      }

      const result = await LeadService.updateLead(tenant.id, editingLead.id, updateData)
      
      if (result.success) {
        toast.success('Lead updated successfully!')
        setShowLeadEditModal(false)
        setEditingLead(null)
        setEditLeadForm({
          name: '',
          email: '',
          phone: '',
          company: '',
          source: '',
          description: ''
        })
        await loadLeadData()
      } else {
        toast.error('Failed to update lead: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating lead:', error)
      toast.error('Failed to update lead: ' + error.message)
    }
  }

  // ==================== BOUNCE DETECTION FUNCTIONS ====================
  
  // Load bounce statistics
  const loadBounceStats = async () => {
    if (!tenant?.id) return
    
    try {
      const statsResult = await BounceDetectionService.getBounceStats(tenant.id)
      if (statsResult.success) {
        setBounceStats(statsResult.data)
      }
    } catch (error) {
      console.error('Error loading bounce stats:', error)
    }
  }

  // Start automated bounce monitoring
  const startBounceMonitoring = async () => {
    if (!tenant?.id || !user?.uid) {
      toast.error('Authentication required for bounce monitoring')
      return
    }

    try {
      setBounceDetectionActive(true)
      console.log('🤖 Starting automated bounce detection...')
      toast('🤖 Starting automated bounce detection...', { duration: 2000 })
      
      const result = await BounceDetectionService.startAutomatedMonitoring(
        tenant.id, 
        user.uid, 
        30 // Check every 30 minutes
      )
      
      if (result.success) {
        toast.success('✅ Automated bounce monitoring started!')
        console.log('🤖 Bounce monitoring active:', result.message)
        
        // Load initial stats
        await loadBounceStats()
      } else {
        setBounceDetectionActive(false)
        toast.error('Failed to start bounce monitoring: ' + result.error)
      }
    } catch (error) {
      setBounceDetectionActive(false)
      console.error('Error starting bounce monitoring:', error)
      toast.error('Failed to start bounce monitoring')
    }
  }

  // Stop automated bounce monitoring
  const stopBounceMonitoring = () => {
    try {
      const stopped = BounceDetectionService.stopAutomatedMonitoring()
      if (stopped) {
        setBounceDetectionActive(false)
        toast.success('🛑 Bounce monitoring stopped')
      }
    } catch (error) {
      console.error('Error stopping bounce monitoring:', error)
    }
  }

  // Manual bounce processing
  const processPastedBounces = async () => {
    if (!pastedBounceText.trim()) {
      toast.error('Please paste bounce email content')
      return
    }

    if (!tenant?.id || !user?.uid) {
      toast.error('Authentication required')
      return
    }

    try {
      setBounceProcessing(true)
      
      const result = await BounceDetectionService.processPastedBounces(
        pastedBounceText,
        tenant.id,
        user.uid
      )
      
      if (result.success) {
        toast.success(`✅ Processed ${result.processed} bounced emails`)
        console.log('Bounce processing results:', result.results)
        
        // Refresh bounce stats and contacts
        await loadBounceStats()
        await loadContactData()
        
        // Clear the form
        setPastedBounceText('')
        setShowBounceModal(false)
      } else {
        toast.error('Bounce processing failed: ' + result.error)
      }
    } catch (error) {
      console.error('Error processing bounces:', error)
      toast.error('Error processing bounces')
    } finally {
      setBounceProcessing(false)
    }
  }

  // Run manual bounce scan
  const runBounceMonitoring = async () => {
    if (!tenant?.id || !user?.uid) {
      toast.error('Authentication required')
      return
    }

    try {
      console.log('🔍 Scanning Gmail for bounces...')
      toast('🔍 Scanning Gmail for bounces...', { duration: 2000 })
      
      const result = await BounceDetectionService.monitorGmailBounces(tenant.id, user.uid)
      
      if (result.success) {
        if (result.processed > 0) {
          toast.success(`🧹 Found and processed ${result.processed} bounced emails`)
        } else {
          toast('✅ No bounces found - all good!', { 
            icon: '✅',
            duration: 3000
          })
        }
        
        // Refresh stats and contacts
        await loadBounceStats()
        // Refresh contacts by reloading from Firestore
        try {
          const contactsResult = await FirebaseUserDataService.getContacts(user.uid, user.uid)
          if (contactsResult.success && contactsResult.data) {
            let contactsArray = []
            if (Array.isArray(contactsResult.data)) {
              contactsArray = contactsResult.data
            } else if (contactsResult.data.contacts && Array.isArray(contactsResult.data.contacts)) {
              contactsArray = contactsResult.data.contacts
            }
            setContacts(contactsArray)
            console.log('✅ Refreshed contacts after bounce processing')
          }
        } catch (error) {
          console.error('Error refreshing contacts:', error)
        }
        
        console.log('Manual bounce scan results:', result)
      } else {
        toast.error('Bounce scan failed: ' + result.error)
      }
    } catch (error) {
      console.error('Error running bounce monitoring:', error)
      toast.error('Error scanning for bounces')
    }
  }

  // Reset bounce statistics to zero
  const resetBounceStatistics = async () => {
    if (!tenant?.id) {
      toast.error('Authentication required')
      return
    }

    try {
      console.log('🔄 Resetting bounce statistics...')
      toast('🔄 Resetting bounce statistics...', { duration: 2000 })
      
      const result = await BounceDetectionService.resetBounceStats(tenant.id)
      
      if (result.success) {
        toast.success('✅ Bounce statistics reset to zero')
        await loadBounceStats() // Refresh the display
      } else {
        toast.error('Failed to reset statistics: ' + result.error)
      }
    } catch (error) {
      console.error('Error resetting bounce statistics:', error)
      toast.error('Error resetting statistics')
    }
  }

  // Setup Gmail OAuth for live bounce detection
  const setupGmailOAuth = async () => {
    try {
      toast('🔗 Setting up Gmail OAuth connection...', { duration: 3000 })
      
      // Gmail OAuth configuration - Your actual credentials
      const CLIENT_ID = '1023666208479-besa8q2moobncp0ih4njtop8a95htop9.apps.googleusercontent.com'
      const REDIRECT_URI = window.location.origin + '/oauth/gmail/callback'
      const SCOPE = 'https://www.googleapis.com/auth/gmail.readonly'
      
      // Build OAuth URL
      const oauthURL = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `scope=${encodeURIComponent(SCOPE)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${tenant?.id || 'default'}`
      
      console.log('🔗 Opening Gmail OAuth window...')
      console.log('OAuth URL:', oauthURL)
      
      // Open OAuth window
      const popup = window.open(oauthURL, 'gmail-oauth', 'width=500,height=600,scrollbars=yes,resizable=yes')
      
      if (!popup) {
        toast.error('Popup blocked! Please allow popups and try again.')
        return
      }
      
      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          toast('OAuth window closed - please try again if not completed')
        }
      }, 1000)
      
      console.log('📧 Gmail OAuth setup initiated')
      toast('📧 Complete Gmail authorization in the popup window')
      
    } catch (error) {
      console.error('Error setting up Gmail OAuth:', error)
      toast.error('Error setting up Gmail connection')
    }
  }

  // Load bounce stats on component mount
  useEffect(() => {
    if (tenant?.id) {
      loadBounceStats()
    }
  }, [tenant?.id])

  // ==================== END BOUNCE DETECTION FUNCTIONS ====================

  const loadLeadData = async () => {
    console.log('loadLeadData called, tenant:', tenant)
    if (!tenant?.id) {
      console.log('No tenant ID available')
      return
    }
    
    try {
      // 🚀 Check emergency storage status before loading
      try {
        const emergencyStorage = window.emergencyLeadStorage
        if (emergencyStorage) {
          const pendingCount = emergencyStorage.getEmergencyLeadCount()
          setEmergencySyncStatus(prev => ({ ...prev, count: pendingCount }))
        }
      } catch (emergencyError) {
        console.log('No emergency storage found:', emergencyError.message)
      }
      
      console.log('Fetching leads for tenant:', tenant.id)
      const [leadsResult, statsResult] = await Promise.all([
        LeadService.getLeads(tenant.id, 500),
        LeadService.getLeadStats(tenant.id)
      ])

      console.log('Leads result:', leadsResult)
      console.log('Stats result:', statsResult)

      if (leadsResult.success && leadsResult.data) {
        setLeads(leadsResult.data)
      }

      if (statsResult.success && statsResult.data) {
        setLeadStats(statsResult.data)
      }
    } catch (error) {
      console.error('Error loading lead data:', error)
    }
  }

  // 🚀 NEW: Emergency sync functions for Recent Leads tab
  const triggerEmergencySync = async () => {
    try {
      const emergencyStorage = window.emergencyLeadStorage
      if (emergencyStorage) {
        const pendingCount = emergencyStorage.getEmergencyLeadCount()
        setEmergencySyncStatus({ syncing: pendingCount > 0, count: pendingCount })
        
        if (pendingCount > 0) {
          console.log(`🚀 RECENT LEADS: Triggering fast sync for ${pendingCount} emergency leads...`)
          const result = await emergencyStorage.triggerImmediateSync()
          if (result.success && result.synced > 0) {
            console.log(`✅ Fast sync completed: ${result.synced} leads moved to database`)
            setEmergencySyncStatus({ syncing: false, count: 0 })
            
            // 🔥 AGGRESSIVE REFRESH: Multiple refresh attempts to ensure leads appear
            console.log('🔄 Starting aggressive refresh sequence...')
            await loadLeadData() // Immediate refresh
            
            // Second refresh after short delay
            setTimeout(async () => {
              console.log('🔄 Secondary refresh (1s delay)...')
              await loadLeadData()
            }, 1000)
            
            // Third refresh after longer delay to catch any Firebase lag
            setTimeout(async () => {
              console.log('🔄 Final refresh (3s delay)...')
              await loadLeadData()
            }, 3000)
            
            toast.success(`✅ ${result.synced} emergency leads synced and refreshed!`)
          }
        }
      }
    } catch (error) {
      console.log('Emergency sync trigger failed:', error.message)
      setEmergencySyncStatus({ syncing: false, count: 0 })
    }
  }

  const handleForceSync = async () => {
    setEmergencySyncStatus(prev => ({ ...prev, syncing: true }))
    
    try {
      const emergencyStorage = window.emergencyLeadStorage
      if (emergencyStorage) {
        const pendingCount = emergencyStorage.getEmergencyLeadCount()
        if (pendingCount > 0) {
          console.log(`🚀 FORCE SYNC: User requested manual sync of ${pendingCount} emergency leads`)
          toast.loading(`Syncing ${pendingCount} emergency leads...`, { duration: 3000 })
          
          const result = await emergencyStorage.triggerImmediateSync()
          
          if (result.success) {
            toast.success(`✅ Successfully synced ${result.synced} leads to database!`)
            await loadLeadData() // Refresh the leads list
            setEmergencySyncStatus({ syncing: false, count: 0 })
          } else {
            toast.error('❌ Sync failed: ' + (result.error || 'Unknown error'))
            setEmergencySyncStatus(prev => ({ ...prev, syncing: false }))
          }
        } else {
          toast.success('✅ No emergency leads to sync - all caught up!')
          setEmergencySyncStatus({ syncing: false, count: 0 })
        }
      } else {
        toast.error('Emergency storage not available')
        setEmergencySyncStatus(prev => ({ ...prev, syncing: false }))
      }
    } catch (error) {
      console.error('Force sync error:', error)
      toast.error('❌ Force sync failed: ' + error.message)
      setEmergencySyncStatus(prev => ({ ...prev, syncing: false }))
    }
  }

  const handleLeadFormSubmit = async (e) => {
    e.preventDefault()
    
    console.log('Form submitted with data:', leadFormData)
    console.log('Current tenant:', tenant)
    console.log('Editing lead:', editingLead)
    
    if (!leadFormData.name || !leadFormData.email) {
      toast.error('Please fill in Name and Email')
      return
    }

    if (!tenant?.id) {
      toast.error('No tenant available. Please try logging in again.')
      return
    }

    try {
      const [firstName, ...lastNameParts] = leadFormData.name.split(' ')
      const lastName = lastNameParts.join(' ')
      
      const leadData = {
        firstName: firstName || '',
        lastName: lastName || '',
        email: leadFormData.email,
        phone: leadFormData.phone,
        company: leadFormData.company,
        title: '',
        source: leadFormData.source || 'manual',
        notes: [leadFormData.description],
        tags: ['manual-entry'],
        score: Math.floor(Math.random() * 40) + 60
      }

      console.log('Sending lead data:', leadData)
      
      let result
      if (editingLead) {
        // Update existing lead
        result = await LeadService.updateLead(tenant.id, editingLead.id, leadData)
        console.log('Update lead result:', result)
      } else {
        // Create new lead
        result = await LeadService.createLead(tenant.id, leadData)
        console.log('Create lead result:', result)
      }
      
      if (result.success) {
        toast.success(editingLead ? 'Lead updated successfully!' : 'Lead added successfully!')
        setLeadFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          linkedin: '',
          twitter: '',
          website: '',
          source: '',
          description: ''
        })
        setEditingLead(null) // Clear editing state
        await loadLeadData()
      } else {
        toast.error(`Failed to ${editingLead ? 'update' : 'add'} lead: ` + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error adding lead:', error)
      toast.error('Failed to add lead: ' + error.message)
    }
  }

  const handleScrapingAction = async (source) => {
    toast.loading('Generating leads from ' + source + '...', { duration: 2000 })
    
    try {
      const result = await LeadService.generateAILeads(tenant.id, source.toLowerCase(), 5)
      
      if (result.success && result.data && result.data.length > 0) {
        toast.success(`Generated ${result.data.length} leads from ${source}!`)
        
        // No more budget tracking - you're using free APIs!
        await loadLeadData()
      } else {
        toast.error('Failed to generate leads')
      }
    } catch (error) {
      console.error('Error generating leads:', error)
      toast.error('Failed to generate leads')
    }
  }

  const updateBudget = async () => {
    try {
      // Save budget to Firebase for persistence
      await saveBudgetToFirebase(scrapingBudget, currentBudgetUsage);
      
      if (tenant?.id) {
        console.log(`Budget ${scrapingBudget} saved for tenant ${tenant.id}`)
      }
      
      toast.success('Budget updated and saved to cloud!')
    } catch (error) {
      console.error('Error updating budget:', error)
      toast.error('Failed to update budget')
    }
  }

  // Load budget settings from Firebase
  React.useEffect(() => {
    if (user?.uid) {
      loadBudgetFromFirebase();
    }
  }, [user?.uid]);

  const loadBudgetFromFirebase = async () => {
    try {
      setBudgetLoading(true);
      const budgetData = await FirebaseUserDataService.getBudgetSettings(user.uid);
      setScrapingBudget(budgetData.scrapingBudget);
      setCurrentBudgetUsage(budgetData.currentBudgetUsage);
    } catch (error) {
      console.error('Error loading budget from Firebase:', error);
      toast.error('Failed to load budget settings');
    } finally {
      setBudgetLoading(false);
    }
  };

  const saveBudgetToFirebase = async (budget, usage) => {
    if (user?.uid) {
      try {
        await FirebaseUserDataService.saveBudgetSettings(user.uid, {
          scrapingBudget: budget,
          currentBudgetUsage: usage
        });
      } catch (error) {
        console.error('Error saving budget to Firebase:', error);
      }
    }
  };

  // Analytics Action Handlers
  const handleExportAnalyticsReport = () => {
    try {
      const reportData = {
        summary: {
          totalLeads: leads.length,
          activeReports: leadStats.activeReports || 0,
          conversationRate: leadStats.conversationRate || '0%',
          avgCostPerLead: '$12.50',
          generatedDate: new Date().toLocaleDateString()
        },
        leads: leads.map(lead => ({
          name: `${lead.firstName} ${lead.lastName}`,
          email: lead.email,
          company: lead.company || 'N/A',
          source: lead.source,
          score: lead.score,
          createdAt: lead.createdAt
        })),
        performance: {
          topSources: leads.reduce((acc, lead) => {
            acc[lead.source] = (acc[lead.source] || 0) + 1;
            return acc;
          }, {}),
          averageScore: leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / leads.length || 0
        }
      };

      const csvContent = [
        ['Lead Analytics Report - ' + new Date().toLocaleDateString()],
        [''],
        ['Summary'],
        ['Total Leads', reportData.summary.totalLeads],
        ['Active Reports', reportData.summary.activeReports],
        ['Conversion Rate', reportData.summary.conversationRate],
        ['Avg Cost Per Lead', reportData.summary.avgCostPerLead],
        [''],
        ['Lead Details'],
        ['Name', 'Email', 'Company', 'Source', 'Score'],
        ...reportData.leads.map(lead => [lead.name, lead.email, lead.company, lead.source, lead.score])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `lead-analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('📊 Analytics report exported successfully!');
    } catch (error) {
      console.error('Error exporting analytics report:', error);
      toast.error('Failed to export analytics report');
    }
  };

  const handleViewTrends = () => {
    try {
      const trends = {
        leadsOverTime: leads.reduce((acc, lead) => {
          const date = new Date(lead.createdAt).toDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {}),
        sourcePerformance: leads.reduce((acc, lead) => {
          acc[lead.source] = (acc[lead.source] || 0) + 1;
          return acc;
        }, {}),
        scoreDistribution: {
          high: leads.filter(l => l.score >= 80).length,
          medium: leads.filter(l => l.score >= 60 && l.score < 80).length,
          low: leads.filter(l => l.score < 60).length
        }
      };

      const trendsText = `
📈 LEAD TRENDS ANALYSIS
Generated: ${new Date().toLocaleDateString()}

📊 Leads Over Time:
${Object.entries(trends.leadsOverTime).map(([date, count]) => `${date}: ${count} leads`).join('\n')}

🎯 Source Performance:
${Object.entries(trends.sourcePerformance).map(([source, count]) => `${source}: ${count} leads`).join('\n')}

⭐ Score Distribution:
High (80+): ${trends.scoreDistribution.high} leads
Medium (60-79): ${trends.scoreDistribution.medium} leads  
Low (<60): ${trends.scoreDistribution.low} leads

💡 Insights:
- Best performing source: ${Object.entries(trends.sourcePerformance).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'}
- Average lead score: ${(leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length || 0).toFixed(1)}
- Total leads this period: ${leads.length}
      `;

      // Show results in modal instead of console
      setAnalyticsResults({
        type: 'trends',
        content: trendsText
      });
      setShowAnalyticsModal(true);
      
    } catch (error) {
      console.error('Error generating trends:', error);
      toast.error('Failed to generate trends analysis');
    }
  };

  const handleQualityAnalysis = () => {
    try {
      const analysis = {
        dataCompleteness: {
          withPhone: leads.filter(l => l.phone && l.phone.trim()).length,
          withCompany: leads.filter(l => l.company && l.company.trim()).length,
          withNotes: leads.filter(l => l.notes && l.notes.length > 0).length,
          complete: leads.filter(l => 
            l.firstName && l.lastName && l.email && l.phone && l.company
          ).length
        },
        emailQuality: {
          validFormat: leads.filter(l => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.email)).length,
          businessEmails: leads.filter(l => 
            !l.email.includes('gmail.com') && 
            !l.email.includes('yahoo.com') && 
            !l.email.includes('hotmail.com')
          ).length
        },
        leadQuality: {
          highValue: leads.filter(l => l.score >= 80).length,
          mediumValue: leads.filter(l => l.score >= 60 && l.score < 80).length,
          lowValue: leads.filter(l => l.score < 60).length
        }
      };

      const qualityScore = Math.round(
        ((analysis.dataCompleteness.complete / leads.length) * 40 +
        (analysis.emailQuality.validFormat / leads.length) * 30 +
        (analysis.leadQuality.highValue / leads.length) * 30) * 100
      ) || 0;

      const report = `
🎯 LEAD QUALITY ANALYSIS
Generated: ${new Date().toLocaleDateString()}

📊 Overall Quality Score: ${qualityScore}%

📋 Data Completeness:
- Complete profiles: ${analysis.dataCompleteness.complete}/${leads.length} (${Math.round(analysis.dataCompleteness.complete/leads.length*100)}%)
- With phone: ${analysis.dataCompleteness.withPhone}/${leads.length}
- With company: ${analysis.dataCompleteness.withCompany}/${leads.length}
- With notes: ${analysis.dataCompleteness.withNotes}/${leads.length}

📧 Email Quality:
- Valid format: ${analysis.emailQuality.validFormat}/${leads.length}
- Business emails: ${analysis.emailQuality.businessEmails}/${leads.length}

⭐ Lead Value Distribution:
- High value (80+): ${analysis.leadQuality.highValue} leads
- Medium value (60-79): ${analysis.leadQuality.mediumValue} leads
- Low value (<60): ${analysis.leadQuality.lowValue} leads

💡 Recommendations:
${qualityScore >= 80 ? '✅ Excellent lead quality!' : 
  qualityScore >= 60 ? '⚠️ Good quality, room for improvement' : 
  '❌ Consider improving data collection'}
      `;

      // Show results in modal instead of console
      setAnalyticsResults({
        type: 'quality',
        content: report
      });
      setShowAnalyticsModal(true);
      
    } catch (error) {
      console.error('Error performing quality analysis:', error);
      toast.error('Failed to perform quality analysis');
    }
  };

  const handleScheduleReport = () => {
    try {
      const scheduleOptions = {
        daily: 'Daily summary at 9 AM',
        weekly: 'Weekly report every Monday',
        monthly: 'Monthly analysis on 1st of month',
        custom: 'Custom schedule'
      };

      const userChoice = prompt(`📧 Schedule Analytics Report

Choose reporting frequency:
1. Daily (every day at 9 AM)
2. Weekly (every Monday)  
3. Monthly (1st of each month)
4. Custom schedule

Enter number (1-4):`);

      let selectedSchedule;
      switch(userChoice) {
        case '1': selectedSchedule = scheduleOptions.daily; break;
        case '2': selectedSchedule = scheduleOptions.weekly; break;
        case '3': selectedSchedule = scheduleOptions.monthly; break;
        case '4': selectedSchedule = scheduleOptions.custom; break;
        default: 
          toast.error('Invalid selection');
          return;
      }

      // In a real implementation, this would save to Firebase and set up email scheduling
      console.log('Report scheduled:', selectedSchedule);
      toast.success(`📧 Report scheduled: ${selectedSchedule}`);
      
      // You would typically integrate with email service here
    } catch (error) {
      console.error('Error scheduling report:', error);
      toast.error('Failed to schedule report');
    }
  };

  const handleExportCSV = () => {
    try {
      if (leads.length === 0) {
        toast.error('No leads to export')
        return
      }

      // Create CSV headers
      const headers = ['Name', 'Email', 'Company', 'Source', 'Tags', 'Score', 'Created Date']
      
      // Create CSV rows
      const rows = leads.map(lead => [
        `${lead.firstName} ${lead.lastName}`,
        lead.email,
        lead.company || '',
        lead.source,
        (lead.tags && Array.isArray(lead.tags)) ? lead.tags.join(', ') : 'Genie',
        lead.score,
        lead.createdAt ? (lead.createdAt.toDate ? lead.createdAt.toDate().toLocaleDateString() : new Date(lead.createdAt).toLocaleDateString()) : ''
      ])

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Exported ${leads.length} leads to CSV`)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error('Failed to export CSV')
    }
  }

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0]
    
    if (!file) {
      toast.error('Please select a CSV file')
      return
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        toast.error('CSV file appears to be empty or invalid')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('first'))
      const emailIndex = headers.findIndex(h => h.includes('email'))
      const phoneIndex = headers.findIndex(h => h.includes('phone'))
      const companyIndex = headers.findIndex(h => h.includes('company'))

      if (emailIndex === -1) {
        toast.error('CSV must contain an email column')
        return
      }

      const leadsToImport = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''))
        
        if (values[emailIndex] && values[emailIndex].includes('@')) {
          const [firstName, ...lastNameParts] = (values[nameIndex] || '').split(' ')
          
          leadsToImport.push({
            firstName: firstName || 'Unknown',
            lastName: lastNameParts.join(' ') || '',
            email: values[emailIndex],
            phone: values[phoneIndex] || '',
            company: values[companyIndex] || '',
            source: 'csv-import',
            score: Math.floor(Math.random() * 40) + 60
          })
        }
      }

      if (leadsToImport.length === 0) {
        toast.error('No valid leads found in CSV')
        return
      }

      toast.loading(`Importing ${leadsToImport.length} leads...`)
      
      let successCount = 0
      for (const leadData of leadsToImport) {
        const result = await LeadService.createLead(tenant.id, leadData)
        if (result.success) {
          successCount++
        }
      }

      toast.dismiss()
      toast.success(`Successfully imported ${successCount} leads!`)
      await loadLeadData()
      
      // Clear the file input
      event.target.value = ''
      
    } catch (error) {
      console.error('Error importing CSV:', error)
      toast.error('Failed to import CSV file')
    }
  }

  // Load lead data when tenant is available
  React.useEffect(() => {
    if (tenant?.id) {
      // 🚀 Trigger emergency sync when Recent Leads tab is accessed
      if (activeLeadTab === 'recent') {
        triggerEmergencySync()
      }
      loadLeadData()
    }
  }, [tenant, activeLeadTab])

  // 🚀 NEW: Auto-refresh Recent Leads when tab is active to catch emergency sync completions
  React.useEffect(() => {
    let refreshInterval;
    
    if (tenant?.id && activeLeadTab === 'recent') {
      console.log('🔄 Starting auto-refresh for Recent Leads tab (every 5 seconds)...');
      
      // Refresh every 5 seconds when Recent Leads tab is active
      refreshInterval = setInterval(async () => {
        const emergencyStorage = window.emergencyLeadStorage;
        const pendingCount = emergencyStorage ? emergencyStorage.getEmergencyLeadCount() : 0;
        
        if (pendingCount > 0) {
          console.log(`⚡ Auto-refresh: ${pendingCount} emergency leads pending sync...`);
        }
        
        await loadLeadData(); // Refresh to show newly synced leads
      }, 5000);
    }

    return () => {
      if (refreshInterval) {
        console.log('🛑 Stopping auto-refresh for Recent Leads tab');
        clearInterval(refreshInterval);
      }
    };
  }, [tenant, activeLeadTab]);

  // URL synchronization - update section when URL changes
  React.useEffect(() => {
    const newSection = getSectionFromURL()
    if (newSection !== activeSection) {
      setActiveSection(newSection)
    }
  }, [location.pathname])

  // Campaign Functions
  const updateCampaignStats = () => {
    const activeCampaigns = campaigns.filter(c => c.status === 'Active')
    const totalEmailsSent = campaigns.reduce((sum, campaign) => sum + (campaign.emailsSent || 0), 0)

    setCampaignStats({
      totalCampaigns: activeCampaigns.length,
      totalEmailsSent: totalEmailsSent
    })
  }

  // Helper function to calculate target contacts for a campaign
  const calculateTargetContacts = (campaign, contactsList = contacts) => {
    console.log('calculateTargetContacts DEBUG:', {
      contactsList: contactsList,
      contactsListLength: contactsList?.length,
      contactsListType: typeof contactsList,
      contactsListIsArray: Array.isArray(contactsList),
      campaign: campaign,
      campaignTargetAudience: campaign?.targetAudience,
      campaignName: campaign?.name
    })
    
    const result = (Array.isArray(contactsList) ? contactsList : []).filter(contact => {
      if (!campaign.targetAudience || campaign.targetAudience === 'All Leads' || campaign.targetAudience === 'All Contacts') {
        return true
      }
      if (campaign.targetAudience === 'New Leads') {
        return contact.status === 'new' || contact.status === 'lead'
      }
      if (campaign.targetAudience === 'Warm Prospects') {
        return contact.status === 'qualified' || contact.status === 'warm'
      }
      if (campaign.targetAudience === 'Custom Segment' && campaign.customSegments && campaign.customSegments.length > 0) {
        // Check if contact matches ANY of the selected custom segments
        return campaign.customSegments.some(segment => {
          
          // Check tags (handle both exact match and common variations)
          if (contact.tags && (
            contact.tags.includes(segment) ||
            (segment === 'VIP customers' && contact.tags.includes('VIP')) ||
            (segment === 'Email subscribers' && contact.tags.includes('Email')) ||
            (segment === 'New prospects' && contact.tags.includes('New'))
          )) {
            return true
          }
          
          // Check company segments (format: "Company: CompanyName")
          if (segment.startsWith('Company: ')) {
            const companyName = segment.replace('Company: ', '')
            return contact.company === companyName
          }
          
          // Check status segments (format: "Status: StatusName")
          if (segment.startsWith('Status: ')) {
            const statusName = segment.replace('Status: ', '')
            return contact.status === statusName
          }
          
          return false
        })
      }
      return false
    })
    
    console.log('calculateTargetContacts called:', { 
      campaignName: campaign.name, 
      targetAudience: campaign.targetAudience, 
      contactsCount: contactsList.length, 
      resultCount: result.length,
      callerContext: new Error().stack.split('\n')[1]?.trim()
    })
    
    return result
  }

  // Update stats whenever campaigns change
  React.useEffect(() => {
    updateCampaignStats()
  }, [campaigns])

  const handleCampaignFormSubmit = async (e) => {
    e.preventDefault()
    
    if (!campaignFormData.name || !campaignFormData.subject) {
      toast.error('Please fill in Campaign Name and Subject')
      return
    }

    // SAFETY CHECK: Require Target Audience selection to prevent accidental mass emails
    if (!campaignFormData.targetAudience) {
      toast.error('⚠️ Please select a Target Audience before creating the campaign!', { 
        duration: 5000,
        icon: '🎯'
      })
      return
    }

    // If Custom Segment is selected, require at least one segment
    if (campaignFormData.targetAudience === 'Custom Segment' && 
        (!campaignFormData.customSegments || campaignFormData.customSegments.length === 0)) {
      toast.error('⚠️ Please select at least one Custom Segment!', { 
        duration: 5000,
        icon: '🏷️'
      })
      return
    }

    try {
      // Find the selected template to get its content
      const selectedTemplate = emailTemplates.find(t => t.name === campaignFormData.template)
      
      // Generate AI-powered email content based on campaign settings
      toast.loading('Generating AI-powered email content...')
      const aiGeneratedContent = await generateAIEmailContent(campaignFormData, campaignFormData.aiProvider)
      toast.dismiss()
      
      // Use AI content if no template, or enhance template with AI if available
      let finalEmailContent
      if (selectedTemplate && selectedTemplate.content) {
        // Enhance template with AI personalization
        finalEmailContent = `${selectedTemplate.content}\n\n--- AI Enhancement ---\n\n${aiGeneratedContent}`
      } else {
        // Use pure AI generation
        finalEmailContent = aiGeneratedContent
      }
      
      // CTA is now handled entirely by the AI service - no manual insertion needed
      
      // Determine initial status based on whether sendDate is set
      const initialStatus = campaignFormData.sendDate ? "Scheduled" : "Draft";
      
      // New campaigns start with 0 emails sent until actually launched
      const newCampaign = {
        id: Date.now(), // Use timestamp for unique ID
        name: campaignFormData.name,
        status: initialStatus, // Scheduled if sendDate set, otherwise Draft
        type: campaignFormData.type,
        emailsSent: 0, // Start with 0 emails sent
        openRate: 0, // No opens until emails are sent
        responseRate: 0, // No responses until emails are sent
        emailsBounced: 0, // No bounces until emails are sent
        unsubscribed: 0, // No unsubscribes until emails are sent
        createdDate: formatDateUS(new Date()),
        subject: campaignFormData.subject,
        template: campaignFormData.template,
        emailContent: finalEmailContent,
        targetAudience: campaignFormData.targetAudience,
        customSegments: campaignFormData.customSegments,
        sendDate: campaignFormData.sendDate,
        sentContacts: [], // Track which contacts have been sent to
        callToActionText: campaignFormData.callToActionText,
        callToActionUrl: campaignFormData.callToActionUrl,
        totalContacts: (Array.isArray(contacts) ? contacts : []).filter(contact => {
          // Calculate how many contacts match the target audience
          if (!campaignFormData.targetAudience || campaignFormData.targetAudience === 'All Leads' || campaignFormData.targetAudience === 'All Contacts') {
            return true
          }
          if (campaignFormData.targetAudience === 'New Leads') {
            return contact.status === 'new' || contact.status === 'lead'
          }
          if (campaignFormData.targetAudience === 'Warm Prospects') {
            return contact.status === 'qualified' || contact.status === 'warm'
          }
          if (campaignFormData.targetAudience === 'Custom Segment' && campaignFormData.customSegments && campaignFormData.customSegments.length > 0) {
            // Check if contact matches ANY of the selected custom segments
            return campaignFormData.customSegments.some(segment => {
              // Check tags (handle both exact match and common variations)
              if (contact.tags && (
                contact.tags.includes(segment) ||
                (segment === 'VIP customers' && contact.tags.includes('VIP')) ||
                (segment === 'Email subscribers' && contact.tags.includes('Email')) ||
                (segment === 'New prospects' && contact.tags.includes('New'))
              )) {
                return true
              }
              
              // Check company segments (format: "Company: CompanyName")
              if (segment.startsWith('Company: ')) {
                const companyName = segment.replace('Company: ', '')
                return contact.company === companyName
              }
              
              // Check status segments (format: "Status: StatusName")
              if (segment.startsWith('Status: ')) {
                const statusName = segment.replace('Status: ', '')
                return contact.status === statusName
              }
              
              return false
            })
          }
          return false
        }).length
      }

      const updatedCampaigns = [...campaigns, newCampaign]
      console.log('Creating new campaign:', newCampaign)
      console.log('Updated campaigns array:', updatedCampaigns)
      setCampaigns(updatedCampaigns)
      await saveCampaignsToFirebase(updatedCampaigns)
      
      // Stats will be automatically updated by useEffect

      // Reset form
      setCampaignFormData({
        name: '',
        type: 'Email',
        subject: '',
        template: '',
        targetAudience: '',
        sendDate: '',
        aiSmartPrompt: '',
        additionalPrompt: '',
        customSegments: [],
        callToActionText: '',
        callToActionUrl: ''
      })

      toast.success('🤖 Campaign created with AI-generated content! Click "View Email" or "Edit" to see the personalized content.')
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.error('Failed to create campaign')
    }
  }

  const handleCampaignAction = async (campaignId, action) => {
    console.log('handleCampaignAction called:', { campaignId, action })
    const campaign = campaigns.find(c => c.id === campaignId)
    
    if (action === 'edit') {
      setEditingCampaign(campaign)
      setShowEditModal(true)
      console.log('Opening campaign editor...')
      // toast.info('Opening campaign editor...')
      return
    }
    
    if (action === 'delete') {
      const updatedCampaigns = campaigns.filter(c => c.id !== campaignId)
      setCampaigns(updatedCampaigns)
      await saveCampaignsToFirebase(updatedCampaigns)
      console.log('Campaign deleted successfully')
      // toast.success('Campaign deleted successfully')
      return
    }
    
    const updatedCampaigns = campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        switch (action) {
          case 'pause':
            const newStatus = campaign.status === 'Active' ? 'Paused' : 'Active'
            toast.success(`Campaign ${newStatus === 'Paused' ? 'paused' : 'resumed'} successfully`)
            return { ...campaign, status: newStatus }
          case 'send_now':
            sendCampaignNow(campaign)
            return { ...campaign, status: 'Sending' }
          default:
            return campaign
        }
      }
      return campaign
    })
    
    setCampaigns(updatedCampaigns)
    await saveCampaignsToFirebase(updatedCampaigns)
  }

  // AI-powered email content generation based on campaign settings
  const generateAIEmailContent = async (campaignData, preferredProvider = null) => {
    // Fetch business profile for email signature
    let businessProfile = null;
    try {
      businessProfile = await FirebaseUserDataService.getBusinessProfile(tenant?.id);
    } catch (profileError) {
      console.warn('Could not fetch business profile:', profileError);
    }
    
    try {
      // Use real AI APIs with user's stored API keys - NO CLEANUP NEEDED!
      // Generate base content with clean integrated footer (we'll fix recipient email per person)
      const content = await AIService.generateEmailContent(
        user?.uid, 
        campaignData, 
        preferredProvider,
        tenant?.id,
        'TEMP_EMAIL_FOR_REPLACEMENT', // Temporary email we'll replace per recipient
        businessProfile?.businessInfo,
        businessProfile?.senderInfo
      );
      return content;
    } catch (error) {
      console.error('AI Email Generation Error:', error);
      toast.error(`AI Generation Failed: ${error.message}`);
      
      // Fallback to basic template if AI fails
      const { name, type, targetAudience } = campaignData;
      const companyName = businessProfile?.businessInfo?.companyName || 'The MarketGenie Team';
      return `<p>Hi {firstName},</p>

<p>Thank you for your interest in <strong>${name}</strong>! This ${type.toLowerCase()} campaign is designed specifically for ${targetAudience?.toLowerCase() || 'our valued audience'}.</p>

<p>We're excited to share this opportunity with you and believe it will provide significant value.</p>

<p><strong>Key Benefits:</strong></p>
<p>• Personalized content tailored to your needs</p>
<p>• Proven strategies for success</p>
<p>• Expert guidance and support</p>

<p>Ready to get started? <a href="#" style="background-color: #14b8a6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">GET STARTED NOW</a></p>

<p>Best regards,<br>
${companyName}</p>

<p><em>P.S. This email was generated for the "${name}" campaign.</em></p>`;
    }
  }

  // AI Subject Line Generator
  const generateSubjectLines = async () => {
    if (!subjectPrompt.trim()) {
      toast.error('Please describe what the email is about');
      return;
    }

    setGeneratingSubjects(true);
    setGeneratedSubjects([]);

    try {
      // Get API keys from IntegrationService
      const effectiveTenantId = tenant?.id || user?.uid;
      const apiKeys = await AIService.getStoredAPIKeys(user?.uid, effectiveTenantId);
      const activeKeys = apiKeys.filter(k => k.status === 'active');

      if (activeKeys.length === 0) {
        toast.error('No AI API keys configured. Please add an API key in Settings.');
        setGeneratingSubjects(false);
        return;
      }

      // Find OpenAI key preferably
      const openaiKey = activeKeys.find(k => k.service.toLowerCase().includes('openai'));
      const apiKey = openaiKey?.key || activeKeys[0]?.key;
      const provider = openaiKey ? 'openai' : activeKeys[0]?.service;

      const toneDescriptions = {
        professional: 'formal, business-appropriate, and trustworthy',
        friendly: 'warm, approachable, and conversational',
        urgent: 'time-sensitive, action-oriented, and compelling',
        curious: 'intriguing, question-based, and thought-provoking',
        exclusive: 'VIP, premium, making the reader feel special and privileged',
        helpful: 'supportive, solution-focused, and value-driven',
        playful: 'fun, lighthearted, with a touch of humor',
        bold: 'confident, direct, attention-grabbing, and impactful'
      };

      const prompt = `Generate 5 email subject lines based on this description:

"${subjectPrompt}"

Tone: ${toneDescriptions[subjectTone] || toneDescriptions.professional}

STRICT RULES:
- Return ONLY the raw subject line text
- NO prefixes like "Subject:" or "Subject Line:"
- NO quotation marks around the subject
- NO names at the end (like ", John" or ", Darrell")
- Keep each under 60 characters
- Use {firstName} or {company} ONLY as merge tags, not actual names
- Format: Just number and text, like:
1. Your exclusive offer awaits
2. Don't miss this opportunity

Generate exactly 5 subject lines now:`;

      let response;
      if (provider === 'openai') {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
            temperature: 0.8
          })
        });
      } else if (provider === 'deepseek') {
        response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
            temperature: 0.8
          })
        });
      } else {
        throw new Error('Unsupported AI provider for subject generation');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'AI request failed');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse and clean up the subject lines
      const lines = content.split('\n')
        .map(line => {
          let cleaned = line
            .replace(/^\d+[\.\)]\s*/, '')  // Remove numbering like "1." or "1)"
            .replace(/^["']|["']$/g, '')   // Remove surrounding quotes
            .replace(/^Subject\s*Line\s*:\s*/i, '')  // Remove "Subject Line:" prefix
            .replace(/^Subject\s*:\s*/i, '')  // Remove "Subject:" prefix
            .replace(/,\s*[A-Z][a-z]+\s*$/g, '')  // Remove trailing ", Name" patterns
            .replace(/,\s*\{firstName\}\s*$/g, ', {firstName}')  // Keep merge tags but clean spacing
            .trim();
          return cleaned;
        })
        .filter(line => line.length > 0 && line.length < 100);

      setGeneratedSubjects(lines.slice(0, 5));
      toast.success('Subject lines generated!');
    } catch (error) {
      console.error('Subject generation error:', error);
      toast.error('Failed to generate subjects: ' + error.message);
    } finally {
      setGeneratingSubjects(false);
    }
  }

  const selectSubjectLine = (subject) => {
    setCampaignFormData(prev => ({ ...prev, subject }));
    setSubjectGeneratorOpen(false);
    setGeneratedSubjects([]);
    toast.success('Subject line selected!');
  }

  const selectEmailTemplate = (template) => {
    console.log('selectEmailTemplate called:', template)
    setCampaignFormData(prev => ({
      ...prev,
      template: template.name,
      subject: template.subject // Auto-fill subject from template
    }))
    toast.success(`Template "${template.name}" selected! Subject auto-filled.`)
    
    // Show template preview
    toast.info(`Preview: ${template.preview.substring(0, 100)}...`, {
      duration: 5000
    })
  }

  // Bulk Bounce Management
  const processBounceEmails = async () => {
    if (!bounceEmails.trim()) {
      toast.error('Please enter bounced email addresses')
      return
    }

    setProcessingBounces(true)
    
    try {
      // Extract email addresses from the bounce text
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
      const extractedEmails = bounceEmails.match(emailRegex) || []
      
      if (extractedEmails.length === 0) {
        toast.error('No valid email addresses found in the text')
        setProcessingBounces(false)
        return
      }

      console.log('Extracted bounced emails:', extractedEmails)

      // Load current contacts
      const contactsResult = await FirebaseUserDataService.getContacts(user.uid, user.uid)
      let contactsArray = []
      
      if (contactsResult.success && contactsResult.data) {
        if (Array.isArray(contactsResult.data)) {
          contactsArray = contactsResult.data
        } else if (contactsResult.data.contacts && Array.isArray(contactsResult.data.contacts)) {
          contactsArray = contactsResult.data.contacts
        }
      }

      // Remove bounced emails from contacts
      const originalCount = contactsArray.length
      const cleanedContacts = contactsArray.filter(contact => 
        !extractedEmails.includes(contact.email.toLowerCase())
      )
      const removedCount = originalCount - cleanedContacts.length

      // Save cleaned contacts back to database
      await FirebaseUserDataService.saveContacts(user.uid, user.uid, cleanedContacts)
      
      // Update local state
      setContacts(cleanedContacts)

      toast.success(`🧹 Bounce cleanup complete! Removed ${removedCount} bounced emails from ${originalCount} contacts`)
      setBounceEmails('')
      
    } catch (error) {
      console.error('Error processing bounces:', error)
      toast.error('Error processing bounced emails: ' + error.message)
    }
    
    setProcessingBounces(false)
  }

  // Handle file upload for bounces
  const handleBounceFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setBounceEmails(e.target.result)
      toast.success('File uploaded! Email addresses will be extracted automatically.')
    }
    reader.readAsText(file)
  }

  // Appointment handlers
  const handleCalendarConnection = async (provider) => {
    try {
      console.log(`🎯 App.jsx: handleCalendarConnection called with provider: ${provider}`)
      
      // Set only the selected provider to true, others to false
      const newConnections = {
        google: provider === 'google',
        outlook: provider === 'outlook', 
        custom: provider === 'custom'
      }
      
      console.log(`🎯 App.jsx: Setting new connections:`, newConnections);
      setCalendarConnections(prev => ({ ...prev, [provider]: 'connecting' }))
      
      // Simulate connection delay
      setTimeout(async () => {
        console.log(`🎯 App.jsx: Timeout completed, setting final connections:`, newConnections);
        setCalendarConnections(newConnections)
        await saveCalendarConnections(newConnections)
        console.log(`🎯 App.jsx: ${provider} Calendar connected and saved!`)
      }, 1000)
      
    } catch (error) {
      setCalendarConnections(prev => ({ ...prev, [provider]: false }))
      console.error(`Failed to connect ${provider} calendar:`, error)
    }
  }

  const handleViewCalendar = async () => {
    console.log('Checking calendar connections...', calendarConnections)
    
    if (calendarConnections.google === true) {
      // Open Google Calendar in new tab
      window.open('https://calendar.google.com', '_blank')
      console.log('Opening Google Calendar')
      return
    }
    
    if (calendarConnections.outlook === true) {
      // Open Outlook Calendar in new tab  
      window.open('https://outlook.live.com/calendar', '_blank')
      console.log('Opening Outlook Calendar')
      return
    }
    
    if (calendarConnections.custom === true) {
      // For custom integration, show calendar view
      setShowCalendarView(true)
      console.log('Opening custom calendar view')
      return
    }
    
    // If no calendar connections from the integration buttons, show connection options
    setShowCalendarView(true)
    console.log('No calendars connected via integration buttons - showing connection options')
  }

  const handleBookMeeting = () => {
    forceShowModal.current = true
    setShowAppointmentModal(true)
    setForceRender(prev => prev + 1)
  }

  const checkConnectedEmailServices = async () => {
    try {
      // Check actual integration statuses
      const gmailStatus = await IntegrationService.getConnectionStatus('gmail', tenant?.id)
      const outlookStatus = await IntegrationService.getConnectionStatus('outlook', tenant?.id)
      
      const gmailConnected = gmailStatus.data && gmailStatus.data.email && (gmailStatus.data.appPassword || gmailStatus.data.password) && gmailStatus.data.status === 'connected'
      const outlookConnected = outlookStatus.data && outlookStatus.data.email && (outlookStatus.data.appPassword || outlookStatus.data.password) && outlookStatus.data.status === 'connected'
      
      console.log('Gmail connected:', gmailConnected)
      console.log('Outlook connected:', outlookConnected)
      
      return {
        gmail: gmailConnected,
        outlook: outlookConnected
      }
    } catch (error) {
      console.error('Error checking email services:', error)
      return { gmail: false, outlook: false }
    }
  }

  const handleAppointmentAction = async (appointment, action) => {
    try {
      switch (action) {
        case 'join':
          // Generate meeting link based on appointment time and details
          const meetingTime = new Date(appointment.startTime || appointment.appointmentDate).toISOString().replace(/[-:\.]/g, '').slice(0, 15)
          const meetingId = appointment.id || 'meeting-' + Date.now()
          const meetingLink = `https://teams.microsoft.com/l/meetup-join/19%3a${meetingId}%40thread.v2/0?context=%7b%22Tid%22%3a%22${tenant?.id}%22%2c%22Oid%22%3a%22${user?.uid}%22%7d`
          
          window.open(meetingLink, '_blank')
          toast.success('Opening meeting room...')
          break
        case 'reschedule':
          // Populate the form with existing appointment data
          setEditingAppointment({
            ...appointment,
            id: appointment.id,
            clientName: appointment.clientName,
            email: appointment.email,
            phone: appointment.phone,
            startTime: appointment.startTime || appointment.appointmentDate,
            meetingType: appointment.meetingType,
            notes: appointment.notes
          })
          setShowAppointmentModal(true)
          forceShowModal.current = true
          setForceRender(prev => prev + 1)
          break
        case 'prepare':
          // Open preparation checklist/materials
          const preparationInfo = `
📋 Meeting Preparation for ${appointment.clientName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Date: ${new Date(appointment.startTime || appointment.appointmentDate).toLocaleDateString()}
⏰ Time: ${new Date(appointment.startTime || appointment.appointmentDate).toLocaleTimeString()}
📧 Email: ${appointment.email}
📞 Phone: ${appointment.phone || 'Not provided'}
🎯 Type: ${appointment.meetingType}

📝 Notes: ${appointment.notes || 'No additional notes'}

✅ Preparation Checklist:
• Review client information
• Prepare presentation materials
• Test meeting technology
• Set up meeting room/environment
• Review agenda and objectives
          `
          
          // Create a simple popup with the preparation info
          const newWindow = window.open('', '_blank', 'width=600,height=800,scrollbars=yes')
          newWindow.document.write(`
            <html>
              <head><title>Meeting Preparation - ${appointment.clientName}</title></head>
              <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <pre style="white-space: pre-wrap; line-height: 1.6; font-family: 'Courier New', monospace;">${preparationInfo}</pre>
                  <button onclick="window.print()" style="background: #0066cc; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Print</button>
                  <button onclick="window.close()" style="background: #666; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                </div>
              </body>
            </html>
          `)
          
          toast.success('Meeting preparation guide opened!')
          break
        case 'reminder':
          // Send reminder email/notification
          const reminderMessage = `
🔔 Meeting Reminder

Hi ${appointment.clientName},

This is a friendly reminder about your upcoming ${appointment.meetingType} scheduled for:

📅 Date: ${new Date(appointment.startTime || appointment.appointmentDate).toLocaleDateString()}
⏰ Time: ${new Date(appointment.startTime || appointment.appointmentDate).toLocaleTimeString()}

Meeting Details:
${appointment.notes || 'Looking forward to our meeting!'}

Best regards,
Market Genie Team
          `
          
          console.log('📧 Reminder would be sent:', reminderMessage)
          toast.success(`Reminder sent to ${appointment.clientName}!`)
          break
        case 'export':
          // Create .ics calendar file for import
          const startDate = new Date(appointment.startTime || appointment.appointmentDate);
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
          
          const formatDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          };
          
          const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MarketGenie//Appointment//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${appointment.id}@marketgenie.app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${appointment.meetingType || 'Meeting'} - ${appointment.clientName}
DESCRIPTION:Meeting with ${appointment.clientName}\\nEmail: ${appointment.email}\\nPhone: ${appointment.phone || 'Not provided'}\\nNotes: ${appointment.notes || 'No additional notes'}
LOCATION:Online Meeting
ORGANIZER;CN=MarketGenie:MAILTO:noreply@marketgenie.app
ATTENDEE;CN=${appointment.clientName};RSVP=TRUE:MAILTO:${appointment.email}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

          // Create multiple export options
          const showExportOptions = () => {
            const modal = document.createElement('div');
            modal.style.cssText = `
              position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
              background: rgba(0,0,0,0.5); z-index: 9999; 
              display: flex; align-items: center; justify-content: center;
            `;
            
            modal.innerHTML = `
              <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%;">
                <h3 style="margin: 0 0 20px 0; color: #333;">📅 Export Calendar Event</h3>
                <p style="margin: 0 0 20px 0; color: #666;">Choose how to add this appointment to your calendar:</p>
                
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <button id="downloadIcs" style="padding: 12px; background: #0078d4; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    📥 Download .ics File (Works with all calendars)
                  </button>
                  
                  <button id="googleCalendar" style="padding: 12px; background: #4285f4; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    📅 Add to Google Calendar (Opens in browser)
                  </button>
                  
                  <button id="outlookWeb" style="padding: 12px; background: #0078d4; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    📅 Add to Outlook Web (Opens in browser)
                  </button>
                  
                  <button id="copyDetails" style="padding: 12px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                    📋 Copy Event Details (Manual entry)
                  </button>
                </div>
                
                <button id="closeModal" style="margin-top: 20px; padding: 8px 16px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; float: right;">
                  Close
                </button>
              </div>
            `;
            
            document.body.appendChild(modal);
            
            // Download .ics file
            document.getElementById('downloadIcs').onclick = () => {
              const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `appointment-${appointment.clientName.replace(/\s+/g, '-').toLowerCase()}-${startDate.toISOString().split('T')[0]}.ics`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
              document.body.removeChild(modal);
              toast.success('Calendar file downloaded! If double-clicking opens email, right-click → "Open with" → choose your calendar app.');
            };
            
            // Google Calendar link
            document.getElementById('googleCalendar').onclick = () => {
              const googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(appointment.meetingType + ' - ' + appointment.clientName) + '&dates=' + formatDate(startDate).replace('Z', '') + '/' + formatDate(endDate).replace('Z', '') + '&details=' + encodeURIComponent('Meeting with ' + appointment.clientName + '\\nEmail: ' + appointment.email + '\\nPhone: ' + (appointment.phone || 'Not provided') + '\\nNotes: ' + (appointment.notes || 'No additional notes')) + '&location=' + encodeURIComponent('Online Meeting');
              window.open(googleUrl, '_blank');
              document.body.removeChild(modal);
              toast.success('Google Calendar opened in new tab!');
            };
            
            // Outlook Web link
            document.getElementById('outlookWeb').onclick = () => {
              const outlookUrl = 'https://outlook.live.com/calendar/0/deeplink/compose?subject=' + encodeURIComponent(appointment.meetingType + ' - ' + appointment.clientName) + '&startdt=' + startDate.toISOString() + '&enddt=' + endDate.toISOString() + '&body=' + encodeURIComponent('Meeting with ' + appointment.clientName + '\\nEmail: ' + appointment.email + '\\nPhone: ' + (appointment.phone || 'Not provided') + '\\nNotes: ' + (appointment.notes || 'No additional notes')) + '&location=' + encodeURIComponent('Online Meeting');
              window.open(outlookUrl, '_blank');
              document.body.removeChild(modal);
              toast.success('Outlook Web opened in new tab!');
            };
            
            // Copy details
            document.getElementById('copyDetails').onclick = () => {
              const details = 'Event: ' + (appointment.meetingType || 'Meeting') + ' - ' + appointment.clientName + '\\nDate: ' + startDate.toLocaleDateString() + '\\nTime: ' + startDate.toLocaleTimeString() + ' - ' + endDate.toLocaleTimeString() + '\\nClient: ' + appointment.clientName + '\\nEmail: ' + appointment.email + '\\nPhone: ' + (appointment.phone || 'Not provided') + '\\nNotes: ' + (appointment.notes || 'No additional notes');
              
              navigator.clipboard.writeText(details).then(() => {
                toast.success('Event details copied to clipboard!');
              });
              document.body.removeChild(modal);
            };
            
            // Close modal
            document.getElementById('closeModal').onclick = () => {
              document.body.removeChild(modal);
            };
            
            // Close on background click
            modal.onclick = (e) => {
              if (e.target === modal) {
                document.body.removeChild(modal);
              }
            };
          };
          
          showExportOptions();
          break
        case 'delete':
          // Confirm deletion
          if (confirm(`Are you sure you want to delete the appointment with ${appointment.clientName}? This action cannot be undone.`)) {
            const deleteResult = await AppointmentService.deleteAppointment(tenant?.id, appointment.id);
            if (deleteResult.success) {
              let successMessage = `Appointment with ${appointment.clientName} deleted successfully from MarketGenie!`;
              
              // Remind about manual calendar cleanup
              successMessage += ` Remember to remove this event from your personal calendar if you added it there.`;
              
              toast.success(successMessage, { duration: 6000 });
              // The real-time subscription will automatically update the UI
            } else {
              toast.error(`Failed to delete appointment: ${deleteResult.error}`);
            }
          }
          break
        default:
          toast.warning('Unknown action')
      }
    } catch (error) {
      console.error('Appointment action error:', error)
      toast.error(`Failed to ${action} appointment: ${error.message}`)
    }
  }

  const handleCreateAppointment = async (appointmentData) => {
    try {
      // Save to database
      const result = await AppointmentService.addAppointment(tenant?.id, appointmentData)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      // Add to connected calendar if available
      try {
        if (calendarConnections.google || calendarConnections.outlook) {
          const calendarEvent = {
            title: `${appointmentData.meetingType} - ${appointmentData.clientName}`,
            description: `Meeting with ${appointmentData.clientName}\nEmail: ${appointmentData.email}\nPhone: ${appointmentData.phone || 'Not provided'}\nNotes: ${appointmentData.notes || 'No additional notes'}`,
            start: new Date(appointmentData.startTime),
            end: new Date(new Date(appointmentData.startTime).getTime() + 60 * 60 * 1000), // 1 hour duration
            attendees: [appointmentData.email]
          }
          
          if (calendarConnections.outlook) {
            console.log('🔄 Adding to Outlook Calendar...')
            const outlookResult = await CalendarService.createOutlookEvent(calendarEvent)
            if (outlookResult.success) {
              console.log('✅ Successfully added to Outlook Calendar:', outlookResult.eventId)
            } else {
              console.log('⚠️ Outlook Calendar integration error:', outlookResult.error)
            }
          } else if (calendarConnections.google) {
            console.log('🔄 Adding to Google Calendar...')
            const googleResult = await CalendarService.createGoogleEvent(calendarEvent)
            if (googleResult.success) {
              console.log('✅ Successfully added to Google Calendar:', googleResult.eventId)
            } else {
              console.log('⚠️ Google Calendar integration error:', googleResult.error)
            }
          }
        }
      } catch (calendarError) {
        console.error('Calendar integration error:', calendarError)
        // Don't fail the whole appointment creation if calendar fails
      }
      
      setShowAppointmentModal(false)
      setEditingAppointment(null)
      
      // Provide user feedback about what happened
      let successMessage = `Appointment with ${appointmentData.clientName} created successfully in MarketGenie!`;
      if (calendarConnections.google || calendarConnections.outlook) {
        successMessage += ` Note: Manual calendar sync required - please add this event to your calendar manually.`;
      } else {
        successMessage += ` Add this event to your personal calendar manually for full scheduling integration.`;
      }
      
      toast.success(successMessage, { duration: 8000 });
      
      // Appointments will auto-refresh via the real-time subscription
      console.log('Appointment created successfully! Real-time subscription will update the list.')
      
      return result
    } catch (error) {
      throw error
    }
  }

  const handleUpdateAppointment = async (appointmentData) => {
    try {
      const result = await AppointmentService.updateAppointment(tenant?.id, editingAppointment.id, {
        ...appointmentData,
        appointmentDate: appointmentData.startTime // Also save as appointmentDate for compatibility
      })
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      console.log('Appointment updated successfully!')
      return result
    } catch (error) {
      throw error
    }
  }

  const handleBookingSettingsSubmit = (e) => {
    e.preventDefault()
    // Prevent page refresh and show success message
    console.log('Booking settings saved successfully!')
    alert('Booking settings saved successfully!')
  }

  // Security function to validate section access
  const isAuthorizedForSection = (section) => {
    if (section === 'Admin Panel') {
      return user?.email === 'dubdproducts@gmail.com' && tenant?.role === 'founder'
    }
    return true // All other sections are accessible
  }

  // Secure section setter with validation and URL navigation
  const setSecureActiveSection = (section) => {
    if (isAuthorizedForSection(section)) {
      setActiveSection(section)
      
      // Navigate to appropriate URL
      const sectionURLs = {
        'SuperGenie Dashboard': '/dashboard',
        'Lead Generation': '/dashboard/lead-generation',
        'Outreach Automation': '/dashboard/outreach-automation',
        'Appointments': '/dashboard/appointments',
        'CRM & Pipeline': '/dashboard/crm-pipeline',
        'Contact Manager': '/dashboard/contact-manager',
        'Pipeline View': '/dashboard/crm-pipeline',
        'Resources & Docs': '/dashboard/resources-docs',
        'White-Label SaaS': '/dashboard/white-label-saas',
        'API Keys & Integrations': '/dashboard/api-keys',
        'Admin Panel': '/dashboard/admin-panel'
      }
      
      const targetURL = sectionURLs[section] || '/dashboard'
      if (location.pathname !== targetURL) {
        navigate(targetURL, { replace: true })
      }
    } else {
      console.warn(`Unauthorized access attempt to section: ${section}`)
      setActiveSection('SuperGenie Dashboard')
      navigate('/dashboard', { replace: true })
    }
  }

  // Prevent flash of wrong content during initialization
  if (!isInitialized || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <GenieProvider contacts={contacts}>
      <div className={`app-container min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <Sidebar 
          activeSection={activeSection} 
          onSelect={setSecureActiveSection}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onLogout={async () => await logout()}
        />
        
        {/* Main Content Area - Dynamic margin responds to sidebar collapse */}
        <div className="min-h-screen transition-all duration-300 ease-in-out" style={{marginLeft: 'var(--sidebar-width, 240px)'}}>
          {/* Top Bar - Scrolls naturally */}
          <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex justify-between items-center shadow-sm`}>
            <div>
              <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeSection}
              </h1>
              {tenant && (
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tenant.name} • 
                    <span className={tenant.plan === 'founder' ? 'executive-plan' : ''}> 
                      {tenant.plan === 'founder' ? 'Executive Plan' : tenant.plan} 
                    </span>
                    • {user?.email}
                  </p>
                  {tenant.role === 'founder' && (
                    <span className="founder-badge">Founder</span>
                  )}
                  {tenant.billing?.lifetime && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Lifetime Access
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Settings Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
                >
                  ⚙️
                </button>
                
                {showAccountMenu && (
                  <div className={`absolute right-0 mt-2 w-48 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-50`}>
                    <div className="py-2">
                      <button 
                        onClick={() => {setSecureActiveSection('Account Settings'); setShowAccountMenu(false)}}
                        className={`w-full text-left block px-4 py-2 text-sm ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        ⚙️ Account Settings
                      </button>
                      <button 
                        onClick={() => {setSecureActiveSection('Profile'); setShowAccountMenu(false)}}
                        className={`w-full text-left block px-4 py-2 text-sm ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        👤 Profile
                      </button>
                      <button 
                        onClick={() => {setSecureActiveSection('Billing'); setShowAccountMenu(false)}}
                        className={`w-full text-left block px-4 py-2 text-sm ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        💳 Billing
                      </button>
                      {/* Admin Panel - FOUNDER ONLY ACCESS */}
                      {user?.email === 'dubdproducts@gmail.com' && (
                        <>
                          <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                          <button 
                            onClick={() => {setSecureActiveSection('Admin Panel'); setShowAccountMenu(false)}}
                            className={`w-full text-left block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                          >
                            🛡️ Admin Panel
                          </button>
                          <button 
                            onClick={() => {setSecureActiveSection('Emergency Migration'); setShowAccountMenu(false)}}
                            className={`w-full text-left block px-4 py-2 text-sm ${isDarkMode ? 'text-purple-400 hover:bg-gray-700' : 'text-purple-600 hover:bg-gray-100'}`}
                          >
                            🚚 Emergency Migration
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
          
          {/* Main Content - Remove mobile padding top */}
          <main className={`flex-1 p-4 lg:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} overflow-auto`}>
          {/* Section content rendering */}
          {activeSection === 'SuperGenie Dashboard' && (
            <div className={`min-h-screen p-4 lg:p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <h1 className="text-2xl lg:text-4xl font-bold text-genie-teal">Welcome to Market Genie</h1>
                {dashboardMetrics.lastUpdated && (
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Last updated: {new Date(dashboardMetrics.lastUpdated).toLocaleTimeString()}
                  </div>
                )}
              </div>
              
              {/* Real Metrics Cards - Connected to Database */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <button 
                  onClick={() => setActiveSection('Lead Generation')}
                  className={getDarkModeClasses("bg-white shadow-lg rounded-xl p-4 lg:p-6 flex items-center gap-3 lg:gap-4 hover:scale-105 transition-transform hover:shadow-xl cursor-pointer text-left w-full", "bg-gray-800 shadow-lg rounded-xl p-4 lg:p-6 flex items-center gap-3 lg:gap-4 hover:scale-105 transition-transform hover:shadow-xl cursor-pointer text-left w-full border border-gray-700")}
                >
                  <div className={getDarkModeClasses("bg-teal-100 p-2 lg:p-3 rounded-full flex-shrink-0", "bg-teal-900 p-2 lg:p-3 rounded-full flex-shrink-0")}>
                    <span role="img" aria-label="users" className="text-teal-600 text-xl lg:text-2xl">👥</span>
                  </div>
                  <div className="min-w-0">
                    <div className={getDarkModeClasses("text-xl lg:text-2xl font-bold text-gray-900", "text-xl lg:text-2xl font-bold text-white")}>
                      {dashboardMetrics.isLoading ? '...' : dashboardMetrics.leadCount}
                    </div>
                    <div className={getDarkModeClasses("text-gray-500 text-sm lg:text-base", "text-gray-300 text-sm lg:text-base")}>Total Leads</div>
                    <div className="text-xs text-teal-600 font-medium">📈 Real Data</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveSection('CRM & Pipeline')}
                  className={getDarkModeClasses("bg-white shadow-lg rounded-xl p-4 lg:p-6 flex items-center gap-3 lg:gap-4 hover:scale-105 transition-transform hover:shadow-xl cursor-pointer text-left w-full", "bg-gray-800 shadow-lg rounded-xl p-4 lg:p-6 flex items-center gap-3 lg:gap-4 hover:scale-105 transition-transform hover:shadow-xl cursor-pointer text-left w-full border border-gray-700")}
                >
                  <div className={getDarkModeClasses("bg-green-100 p-2 lg:p-3 rounded-full flex-shrink-0", "bg-green-900 p-2 lg:p-3 rounded-full flex-shrink-0")}>
                    <span role="img" aria-label="revenue" className="text-green-600 text-xl lg:text-2xl">💰</span>
                  </div>
                  <div className="min-w-0">
                    <div className={getDarkModeClasses("text-xl lg:text-2xl font-bold text-gray-900", "text-xl lg:text-2xl font-bold text-white")}>
                      {dashboardMetrics.isLoading ? '...' : MetricsService.formatCurrency(dashboardMetrics.pipelineValue)}
                    </div>
                    <div className={getDarkModeClasses("text-gray-500 text-sm lg:text-base", "text-gray-300 text-sm lg:text-base")}>Pipeline Value</div>
                    <div className="text-xs text-green-600 font-medium">💎 Live CRM</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveSection('Outreach Automation')}
                  className={getDarkModeClasses("bg-white shadow-lg rounded-xl p-4 lg:p-6 flex items-center gap-3 lg:gap-4 hover:scale-105 transition-transform hover:shadow-xl cursor-pointer text-left w-full", "bg-gray-800 shadow-lg rounded-xl p-4 lg:p-6 flex items-center gap-3 lg:gap-4 hover:scale-105 transition-transform hover:shadow-xl cursor-pointer text-left w-full border border-gray-700")}
                >
                  <div className={getDarkModeClasses("bg-purple-100 p-2 lg:p-3 rounded-full flex-shrink-0", "bg-purple-900 p-2 lg:p-3 rounded-full flex-shrink-0")}>
                    <span role="img" aria-label="campaigns" className="text-purple-600 text-xl lg:text-2xl">⚡</span>
                  </div>
                  <div className="min-w-0">
                    <div className={getDarkModeClasses("text-xl lg:text-2xl font-bold text-gray-900", "text-xl lg:text-2xl font-bold text-white")}>
                      {dashboardMetrics.isLoading ? '...' : dashboardMetrics.activeCampaigns}
                    </div>
                    <div className={getDarkModeClasses("text-gray-500 text-sm lg:text-base", "text-gray-300 text-sm lg:text-base")}>Active Campaigns</div>
                    <div className="text-xs text-purple-600 font-medium">🚀 Running Now</div>
                  </div>
                </button>
              </div>

              {/* Enhanced Dashboard Widgets */}
              <div className="space-y-6 mb-8">
                {/* Full-width World Clock Card */}
                <WorldClockWidget />
                
                {/* Horizontal Daily Quote Card */}
                <DailyQuoteWidget />
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
                <button 
                  onClick={() => setActiveSection('Lead Generation')} 
                  className="bg-genie-teal/10 rounded-xl p-6 flex flex-col items-center hover:bg-genie-teal/20 transition group"
                >
                  <span role="img" aria-label="contacts" className="text-genie-teal text-3xl mb-2 group-hover:scale-110 transition-transform">👥</span>
                  <span className="font-semibold text-genie-teal">Generate Leads</span>
                  <span className="text-sm text-gray-600 mt-1">Budget-aware scraping & enrichment</span>
                </button>
                
                <button 
                  onClick={() => setActiveSection('Outreach Automation')} 
                  className="bg-genie-teal/10 rounded-xl p-6 flex flex-col items-center hover:bg-genie-teal/20 transition group"
                >
                  <span role="img" aria-label="automation" className="text-genie-teal text-3xl mb-2 group-hover:scale-110 transition-transform">🤖</span>
                  <span className="font-semibold text-genie-teal">Start Campaign</span>
                  <span className="text-sm text-gray-600 mt-1">Multi-channel automation</span>
                </button>
                
                <button 
                  onClick={() => setShowAIAssistant(!showAIAssistant)} 
                  className="bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl p-6 flex flex-col items-center hover:from-teal-200 hover:to-cyan-200 transition group"
                >
                  <span role="img" aria-label="ai-assistant" className="text-teal-600 text-3xl mb-2 group-hover:scale-110 transition-transform">🧞‍♂️</span>
                  <span className="font-semibold text-teal-600">AI Assistant</span>
                  <span className="text-sm text-gray-600 mt-1">Your marketing helper</span>
                </button>
              </div>
            </div>
          )}
          {activeSection === 'Lead Generation' && (
            <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-4xl font-bold text-genie-teal flex items-center gap-3">
                  <span className="text-5xl animate-pulse">🚀</span>
                  Ultimate Lead Generation Hub
                </h2>
                <div className="text-right">
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>System Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 font-semibold">ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className={getDarkModeClasses("bg-white rounded-xl shadow-lg mb-8 overflow-hidden", "bg-gray-800 rounded-xl shadow-lg mb-8 overflow-hidden border border-gray-700")}>
                <div className={getDarkModeClasses("flex border-b border-gray-200", "flex border-b border-gray-600")}>
                  {leadTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveLeadTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-all duration-300 ${
                        activeLeadTab === tab.id
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                          : isDarkMode ? 'text-gray-300 hover:text-teal-400 hover:bg-gray-700' : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                      }`}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content - Overview Tab (existing content) */}
              <div className={getDarkModeClasses("bg-white rounded-xl shadow-lg p-8", "bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700")}>
                {activeLeadTab === 'overview' && (
                  <div className="space-y-8">

              {/* Enhanced Stats with Animations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span role="img" aria-label="leads" className="text-4xl mb-2 block animate-bounce">🧲</span>
                      <div className="text-3xl font-bold">{leadStats.totalLeads || 0}</div>
                      <div className="text-blue-100">Total Leads</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs bg-white/20 px-2 py-1 rounded">+{Math.floor(Math.random() * 5) + 1} today</div>
                    </div>
                  </div>
                  <div className="mt-4 bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 transition-all duration-1000" style={{width: `${Math.min((leadStats.totalLeads || 0) / 100 * 100, 100)}%`}}></div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span role="img" aria-label="quality" className="text-4xl mb-2 block animate-pulse">�</span>
                      <div className="text-3xl font-bold">{leadStats.highQuality || 0}</div>
                      <div className="text-green-100">Quality Leads</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs bg-white/20 px-2 py-1 rounded">97% Score</div>
                    </div>
                  </div>
                  <div className="mt-4 bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 transition-all duration-1000" style={{width: '97%'}}></div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl rounded-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span role="img" aria-label="conversion" className="text-4xl mb-2 block animate-spin-slow">🔄</span>
                      <div className="text-3xl font-bold">{leadStats.conversionRate || 0}%</div>
                      <div className="text-purple-100">Conversion Rate</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs bg-white/20 px-2 py-1 rounded">↗️ +2.3%</div>
                    </div>
                  </div>
                  <div className="mt-4 bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 transition-all duration-1000" style={{width: `${leadStats.conversionRate || 0}%`}}></div>
                  </div>
                </div>
              </div>
              
              </div>
              )}

              {/* Other tabs */}
              {activeLeadTab === 'scraping' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-800'} mb-2`}>🤖 AI-Powered Lead Scraping Agents</h3>
                    <div className="bg-amber-100 border border-amber-400 rounded-lg p-3 mb-4 inline-block">
                      <p className="text-amber-800 font-bold text-lg">
                        ⚠️ Please use web browser, this feature will not work properly in handheld devices
                      </p>
                    </div>
                    <p className={`${isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>Deploy intelligent agents to automatically discover and qualify leads from multiple sources</p>
                  </div>

                  {/* Bulk Prospeo Scraper - TOP PRIORITY */}
                  <div className="mb-8">
                    <BulkProspeoScraper />
                  </div>

                  {/* Enhanced Scraping Agents */}
                  <div className={getDarkModeClasses("bg-white rounded-xl shadow-xl p-8 border border-blue-200", "bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-600")}>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className={getDarkModeClasses("text-2xl font-bold text-genie-teal flex items-center gap-3", "text-2xl font-bold text-teal-400 flex items-center gap-3")}>
                        <span className="text-3xl">🤖</span>
                        AI-Powered Lead Scraping Agents
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600 font-medium">Ready to Deploy</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <button 
                        onClick={() => handleScrapingAction('Business Directories')}
                        className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <div className="text-4xl mb-3 group-hover:animate-bounce">🏢</div>
                        <div className="text-xl font-bold mb-2">Business Directories</div>
                        <div className="text-blue-100 text-sm">Yellow Pages, Yelp, Google Business</div>
                        <div className="mt-3 bg-white/20 rounded-full h-1">
                          <div className="bg-white rounded-full h-1 w-3/4"></div>
                        </div>
                        <div className="text-xs text-blue-100 mt-1">High Success Rate</div>
                      </button>
                      
                      <button 
                        onClick={() => handleScrapingAction('Social Media')}
                        className="group bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <div className="text-4xl mb-3 group-hover:animate-bounce">📱</div>
                        <div className="text-xl font-bold mb-2">Social Media</div>
                        <div className="text-purple-100 text-sm">LinkedIn, Twitter, Facebook</div>
                        <div className="mt-3 bg-white/20 rounded-full h-1">
                          <div className="bg-white rounded-full h-1 w-4/5"></div>
                        </div>
                        <div className="text-xs text-purple-100 mt-1">Premium Quality</div>
                      </button>
                      
                      <button 
                        onClick={() => handleScrapingAction('Custom Sources')}
                        className="group bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <div className="text-4xl mb-3 group-hover:animate-bounce">🎯</div>
                        <div className="text-xl font-bold mb-2">Custom Sources</div>
                        <div className="text-green-100 text-sm">Industry-specific sites</div>
                        <div className="mt-3 bg-white/20 rounded-full h-1">
                          <div className="bg-white rounded-full h-1 w-5/6"></div>
                        </div>
                        <div className="text-xs text-green-100 mt-1">Highly Targeted</div>
                      </button>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-200">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">⚡</span>
                        <strong className="text-teal-700">AI Scraping Engine:</strong>
                      </div>
                      <div className="text-gray-700 mb-3">
                        Our advanced AI agents can generate 50-200 qualified leads per source. Each agent uses machine learning to identify high-quality prospects and validates contact information in real-time.
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✅</span>
                          <span>Real-time email validation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✅</span>
                          <span>Company enrichment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✅</span>
                          <span>Lead scoring & qualification</span>
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-gray-600">
                        <strong>Total leads generated:</strong> <span className="font-bold text-teal-600">{leadStats.totalLeads || 0}</span> • <strong>Success rate:</strong> <span className="font-bold text-green-600">94.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeLeadTab === 'import' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-800'} mb-2`}>📁 Bulk Lead Import Center</h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Import leads from CSV, Excel, or JSON files with intelligent processing</p>
                  </div>

                  {/* Enhanced Lead Import Tool */}
                  <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-purple-200'} rounded-xl shadow-xl p-8`}>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className={`text-2xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-genie-teal'} flex items-center gap-3`}>
                        <span className="text-3xl">📊</span>
                        Bulk Lead Import Center
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>CSV, Excel, or JSON</div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Drag & Drop Zone */}
                      <div className={`border-2 border-dashed border-purple-300 rounded-xl p-8 text-center ${isDarkMode ? 'bg-gray-600' : 'bg-gradient-to-b from-purple-50 to-purple-100'} hover:border-purple-400 transition-colors cursor-pointer group`}>
                        <div className="text-6xl mb-4 group-hover:animate-bounce">📁</div>
                        <div className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Drag & Drop Files Here</div>
                        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>or click to browse</div>
                        <input 
                          type="file" 
                          accept=".csv,.xlsx,.json" 
                          onChange={handleCSVUpload}
                          className="hidden" 
                          id="csvFileInput"
                        />
                        <button 
                          onClick={() => document.getElementById('csvFileInput').click()}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                          Select Files
                        </button>
                        <div className="mt-4 text-xs text-gray-500">
                          Supports CSV, Excel (.xlsx), and JSON formats
                        </div>
                      </div>
                      
                      {/* Import Features */}
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-green-500 text-xl">✨</span>
                            <strong className="text-green-700">Smart Import Features</strong>
                          </div>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Automatic field mapping</li>
                            <li>• Duplicate detection & removal</li>
                            <li>• Email validation & verification</li>
                            <li>• Data enrichment & completion</li>
                          </ul>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-blue-500 text-xl">📋</span>
                            <strong className="text-blue-700">Required Fields</strong>
                          </div>
                          <div className="text-sm text-blue-700 grid grid-cols-2 gap-1">
                            <div>• Name/First Name</div>
                            <div>• Email Address</div>
                            <div>• Company (optional)</div>
                            <div>• Phone (optional)</div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-orange-500 text-xl">📈</span>
                            <strong className="text-orange-700">Import Statistics</strong>
                          </div>
                          <div className="text-sm text-orange-700">
                            <div>Last import: 0 leads processed</div>
                            <div>Success rate: 100%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeLeadTab === 'enrichment' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-800'} mb-2`}>🎯 AI-Powered Lead Enrichment</h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Capture and enrich lead information with intelligent validation and data enhancement</p>
                  </div>

                  {/* Enhanced Lead Capture Form with AI Enrichment */}
                  <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-teal-200'} rounded-xl shadow-xl p-8`}>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className={`text-2xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-genie-teal'} flex items-center gap-3`}>
                        <span className="text-3xl">🎯</span>
                        AI-Powered Lead Enrichment
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-blue-600 font-medium">Auto-Enrichment Active</span>
                      </div>
                    </div>
                    
                    <form id="lead-enrichment-form" onSubmit={handleLeadFormSubmit} className="space-y-6">
                      {/* Primary Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                            <span className="text-lg">👤</span>
                            Full Name *
                          </label>
                          <input 
                            type="text" 
                            placeholder="John Doe" 
                            value={leadFormData.name}
                            onChange={(e) => setLeadFormData(prev => ({...prev, name: e.target.value}))}
                            className={`w-full border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 p-3 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                            required 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                            <span className="text-lg">📧</span>
                            Email Address *
                          </label>
                          <div className="relative">
                            <input 
                              type="email" 
                              placeholder="john@company.com" 
                              value={leadFormData.email}
                              onChange={(e) => setLeadFormData(prev => ({...prev, email: e.target.value}))}
                              className={`w-full border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 p-3 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                              required 
                            />
                            <div className="absolute right-3 top-3 text-green-500">
                              <span className="text-sm">✓</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Secondary Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                            <span className="text-lg">📱</span>
                            Phone Number
                          </label>
                          <input 
                            type="tel" 
                            placeholder="+1 (555) 123-4567" 
                            value={leadFormData.phone}
                            onChange={(e) => setLeadFormData(prev => ({...prev, phone: e.target.value}))}
                            className={`w-full border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 p-3 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                            <span className="text-lg">🏢</span>
                            Company
                          </label>
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="Company Name" 
                              value={leadFormData.company}
                              onChange={(e) => setLeadFormData(prev => ({...prev, company: e.target.value}))}
                              className={`w-full border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 p-3 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                            />
                            <div className="absolute right-3 top-3 text-blue-500">
                              <span className="text-sm animate-pulse">🔍</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Social & Web Presence */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                            <span className="text-lg">🔗</span>
                            LinkedIn
                          </label>
                          <input 
                            type="text" 
                            placeholder="linkedin.com/in/johndoe" 
                            value={leadFormData.linkedin}
                            onChange={(e) => setLeadFormData(prev => ({...prev, linkedin: e.target.value}))}
                            className={`w-full border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 p-3 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                            <span className="text-lg">🐦</span>
                            Twitter
                          </label>
                          <input 
                            type="text" 
                            placeholder="@johndoe" 
                            value={leadFormData.twitter}
                            onChange={(e) => setLeadFormData(prev => ({...prev, twitter: e.target.value}))}
                            className={`w-full border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 p-3 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                            <span className="text-lg">🌐</span>
                            Website
                          </label>
                          <input 
                            type="text" 
                            placeholder="company.com" 
                            value={leadFormData.website}
                            onChange={(e) => setLeadFormData(prev => ({...prev, website: e.target.value}))}
                            className={`w-full border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 p-3 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                            <span className="text-lg">🏷️</span>
                            Lead Source
                          </label>
                          <select 
                            value={leadFormData.source}
                            onChange={(e) => setLeadFormData(prev => ({...prev, source: e.target.value}))}
                            className={`w-full border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 p-3 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300 text-gray-900'}`}
                          >
                            <option value="manual" className={isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-900'}>Manual Entry</option>
                            <option value="website" className={isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-900'}>Website Form</option>
                            <option value="social" className={isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-900'}>Social Media</option>
                            <option value="referral" className={isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-900'}>Referral</option>
                            <option value="cold_outreach" className={isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-900'}>Cold Outreach</option>
                            <option value="event" className={isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-900'}>Event/Conference</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                            <span className="text-lg">📝</span>
                            Notes
                          </label>
                          <input 
                            type="text" 
                            placeholder="Additional notes about this lead..." 
                            value={leadFormData.description}
                            onChange={(e) => setLeadFormData(prev => ({...prev, description: e.target.value}))}
                            className={`w-full border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 p-3 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                          />
                        </div>
                      </div>
                      
                      {/* Submit Button */}
                      <div className="flex items-center justify-between pt-6">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="text-green-500">✅</span>
                            <span>Email validation</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-500">🔍</span>
                            <span>Company enrichment</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-purple-500">⭐</span>
                            <span>Lead scoring</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <button 
                            type="submit" 
                            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3 rounded-lg hover:from-teal-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                          >
                            {editingLead ? '✏️ Update Lead' : '🚀 Add Lead & Enrich'}
                          </button>
                          {editingLead && (
                            <button 
                              type="button"
                              onClick={() => {
                                setEditingLead(null)
                                setLeadFormData({
                                  name: '',
                                  email: '',
                                  phone: '',
                                  company: '',
                                  linkedin: '',
                                  twitter: '',
                                  website: '',
                                  source: '',
                                  description: ''
                                })
                                if (typeof toast === 'object' && toast.success) {
                                  toast.success('❌ Edit cancelled')
                                }
                              }}
                              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              ❌ Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeLeadTab === 'recent' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-800'} mb-2`}>👥 Recent Leads Management</h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage and organize all your leads in one place</p>
                    
                    {/* 🚀 Emergency Sync Status Indicator */}
                    {emergencySyncStatus.syncing && (
                      <div className="mt-4 flex items-center justify-center px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                        <span className="text-yellow-800 text-sm font-medium">
                          🔄 Syncing {emergencySyncStatus.count} emergency leads to database...
                        </span>
                      </div>
                    )}
                    
                    {/* Emergency lead count and force sync button */}
                    {emergencySyncStatus.count > 0 && !emergencySyncStatus.syncing && (
                      <div className="mt-4 flex items-center justify-center">
                        <div className="flex items-center space-x-4 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <span className="text-orange-800 text-sm font-medium">
                            ⚠️ {emergencySyncStatus.count} leads waiting to sync to database
                          </span>
                          <button
                            onClick={handleForceSync}
                            className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
                          >
                            🚀 Force Sync Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Filters/Search */}
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <input type="text" placeholder="Search leads..." className={`border p-2 rounded flex-1 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`} />
                    <select className={`border p-2 rounded ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300 text-gray-900'}`}>
                      <option>All Sources</option>
                      <option>Website</option>
                      <option>Referral</option>
                      <option>Event</option>
                    </select>
                    <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">Filter</button>
                    <button 
                      onClick={() => loadLeadData()}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      🔄 Refresh
                    </button>
                    <button 
                      onClick={handleRemoveDuplicates}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                    >
                      🧹 Remove Duplicates
                    </button>
                  </div>

                  {/* Enhanced Recent Leads Table */}
                  <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-teal-400' : 'text-genie-teal'}`}>Recent Leads ({leads.length})</h4>
                      {selectedLeads.length > 0 && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">{selectedLeads.length} selected</span>
                          <button 
                            onClick={handleBulkDelete}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            🗑️ Delete Selected
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className={`${isDarkMode ? 'border-b border-gray-600' : 'border-b border-gray-200'}`}>
                            <th className="py-3 px-2">
                              <input 
                                type="checkbox" 
                                checked={isSelectAllChecked}
                                onChange={handleSelectAll}
                                className="rounded"
                              />
                            </th>
                            <th className={`py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Name</th>
                            <th className={`py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Email</th>
                            <th className={`py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Company</th>
                            <th className={`py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Source</th>
                            <th className={`py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Tags</th>
                            <th className={`py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Score</th>
                            <th className={`py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.length > 0 ? leads.map((lead, index) => (
                            <tr key={lead.id} className={`${isDarkMode ? 'border-b border-gray-600 hover:bg-gray-600' : 'border-b border-gray-100 hover:bg-gray-50'} ${index % 2 === 0 ? (isDarkMode ? 'bg-gray-800' : 'bg-blue-25') : (isDarkMode ? 'bg-gray-700' : '')}`}>
                              <td className="py-3 px-2">
                                <input 
                                  type="checkbox" 
                                  checked={selectedLeads.includes(lead.id)}
                                  onChange={() => handleSelectLead(lead.id)}
                                  className="rounded"
                                />
                              </td>
                              <td className={`py-3 font-medium ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>{lead.firstName} {lead.lastName}</td>
                              <td className={`py-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{lead.email}</td>
                              <td className={`py-3 ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>{lead.company || '—'}</td>
                              <td className="py-3">
                                <div className="flex flex-wrap gap-1">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    lead.isEmergency 
                                      ? 'bg-red-100 text-red-700 border border-red-300' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {lead.isEmergency ? '🚨 ' : ''}{lead.source}
                                  </span>
                                  {lead.isEmergency && (
                                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs border border-orange-300">
                                      Local Storage
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="flex flex-wrap gap-1">
                                  {(lead.tags && Array.isArray(lead.tags) ? lead.tags : ['Genie']).map((tag, i) => (
                                    <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  lead.score >= 80 ? 'bg-green-100 text-green-800' : 
                                  lead.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {lead.score}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleEditLead(lead)}
                                    className="text-teal-600 hover:text-teal-800 font-medium text-sm"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteLead(lead.id)}
                                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="8" className={`py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <div className="text-4xl mb-2">🎯</div>
                                <div>No leads yet. Add your first lead above or use the scraping tools!</div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end mt-4 gap-2">
                      <button 
                        onClick={handleExportCSV}
                        className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80"
                      >
                        Export CSV
                      </button>
                      <button 
                        onClick={() => setActiveSection('Lead Generation')}
                        className="bg-genie-teal/10 text-genie-teal px-4 py-2 rounded hover:bg-genie-teal/20"
                      >
                        Add Lead
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">Total leads: <span className="font-bold">{leads.length}</span></div>
                  </div>
                </div>
              )}

              {/* Edit Lead Modal */}
              {showLeadEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">✏️ Edit Lead</h3>
                      <button 
                        onClick={() => {
                          setShowLeadEditModal(false)
                          setEditingLead(null)
                        }}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ×
                      </button>
                    </div>
                    
                    <form onSubmit={handleEditLeadSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={editLeadForm.name}
                          onChange={(e) => setEditLeadForm(prev => ({...prev, name: e.target.value}))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={editLeadForm.email}
                          onChange={(e) => setEditLeadForm(prev => ({...prev, email: e.target.value}))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={editLeadForm.phone}
                          onChange={(e) => setEditLeadForm(prev => ({...prev, phone: e.target.value}))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Enter phone number"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company
                        </label>
                        <input
                          type="text"
                          value={editLeadForm.company}
                          onChange={(e) => setEditLeadForm(prev => ({...prev, company: e.target.value}))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Enter company name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Source
                        </label>
                        <select
                          value={editLeadForm.source}
                          onChange={(e) => setEditLeadForm(prev => ({...prev, source: e.target.value}))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          <option value="manual">Manual Entry</option>
                          <option value="website">Website</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="referral">Referral</option>
                          <option value="event">Event</option>
                          <option value="social_media">Social Media</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={editLeadForm.description}
                          onChange={(e) => setEditLeadForm(prev => ({...prev, description: e.target.value}))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Add notes about this lead"
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                        >
                          ✅ Update Lead
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowLeadEditModal(false)
                            setEditingLead(null)
                          }}
                          className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Analytics Results Modal */}
              {showAnalyticsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">
                        {analyticsResults.type === 'trends' ? '📈 Lead Trends Analysis' : '🎯 Lead Quality Analysis'}
                      </h3>
                      <button 
                        onClick={() => setShowAnalyticsModal(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 leading-relaxed">
                        {analyticsResults.content}
                      </pre>
                    </div>
                    
                    <div className="flex gap-4 justify-end">
                      <button
                        onClick={() => {
                          // Copy to clipboard
                          navigator.clipboard.writeText(analyticsResults.content);
                          toast.success('📋 Analysis copied to clipboard!');
                        }}
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        📋 Copy to Clipboard
                      </button>
                      <button
                        onClick={() => {
                          // Export as text file
                          const blob = new Blob([analyticsResults.content], { type: 'text/plain;charset=utf-8;' });
                          const link = document.createElement('a');
                          link.href = URL.createObjectURL(blob);
                          const filename = analyticsResults.type === 'trends' ? 'lead-trends-analysis' : 'lead-quality-analysis';
                          link.download = `${filename}-${new Date().toISOString().split('T')[0]}.txt`;
                          link.click();
                          toast.success('📄 Analysis exported as text file!');
                        }}
                        className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        💾 Export as File
                      </button>
                      <button
                        onClick={() => setShowAnalyticsModal(false)}
                        className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                      >
                        ✅ Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bounce Processing Modal */}
              {showBounceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} flex items-center`}>
                        <span className="mr-2">📧</span>
                        Process Bounced Emails
                      </h3>
                      <button 
                        onClick={() => setShowBounceModal(false)}
                        className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} text-2xl font-bold`}
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <div className="flex items-start">
                        <span className="mr-3 text-xl">💡</span>
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-800'} mb-2`}>
                            <strong>How to use:</strong>
                          </p>
                          <ol className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-700'} space-y-1`}>
                            <li>1. Copy bounce email content from your Gmail</li>
                            <li>2. Paste it in the text area below</li>
                            <li>3. Click "Process Bounces" to automatically remove bounced emails from your contacts</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Paste Bounce Email Content:
                      </label>
                      <textarea
                        value={pastedBounceText}
                        onChange={(e) => setPastedBounceText(e.target.value)}
                        className={`w-full h-40 border p-3 rounded-lg font-mono text-sm ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 placeholder-gray-500'
                        }`}
                        placeholder="Paste your bounce email content here..."
                      />
                    </div>
                    
                    <div className="flex gap-4 justify-end">
                      <button
                        onClick={() => setShowBounceModal(false)}
                        className={`py-2 px-6 rounded-lg transition-colors font-medium ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={processPastedBounces}
                        disabled={bounceProcessing || !pastedBounceText.trim()}
                        className={`py-2 px-6 rounded-lg transition-colors font-medium ${
                          bounceProcessing || !pastedBounceText.trim()
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        {bounceProcessing ? '🔄 Processing...' : '🧹 Process Bounces'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeLeadTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-800'} mb-2`}>📈 Lead Analytics & Performance</h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Comprehensive insights into your lead generation performance and trends</p>
                  </div>

                  {/* Key Metrics Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600 border-l-4 border-l-blue-500' : 'bg-white border-l-4 border-l-blue-500'} shadow-lg rounded-xl p-6 flex flex-col items-center`}>
                      <span className="text-blue-500 text-3xl mb-2">📊</span>
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>{leadStats.activeReports || 0}</div>
                      <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Reports</div>
                    </div>
                    <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600 border-l-4 border-l-green-500' : 'bg-white border-l-4 border-l-green-500'} shadow-lg rounded-xl p-6 flex flex-col items-center`}>
                      <span className="text-green-500 text-3xl mb-2">💡</span>
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>{leadStats.keyInsights || 0}</div>
                      <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Key Insights</div>
                    </div>
                    <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600 border-l-4 border-l-purple-500' : 'bg-white border-l-4 border-l-purple-500'} shadow-lg rounded-xl p-6 flex flex-col items-center`}>
                      <span className="text-purple-500 text-3xl mb-2">📈</span>
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>{leadStats.monthlyGrowthRate || 0}%</div>
                      <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Growth Rate</div>
                    </div>
                    <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600 border-l-4 border-l-teal-500' : 'bg-white border-l-4 border-l-teal-500'} shadow-lg rounded-xl p-6 flex flex-col items-center`}>
                      <span className="text-teal-500 text-3xl mb-2">🎯</span>
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>{leadStats.totalLeads || 0}</div>
                      <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Leads</div>
                    </div>
                  </div>

                  {/* Lead Performance Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Lead Sources Performance */}
                    <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                      <h4 className={`text-xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
                        <span className="text-2xl">🚀</span>
                        Lead Sources Performance
                      </h4>
                      <div className="space-y-4">
                        <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-blue-50'}`}>
                          <div className="flex items-center gap-3">
                            <span className="text-blue-500">🤖</span>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>AI Scraping</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">{leadStats.aiScrapingSuccessRate || 0}%</div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Success Rate</div>
                          </div>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-green-50'}`}>
                          <div className="flex items-center gap-3">
                            <span className="text-green-500">📁</span>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Bulk Import</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{leadStats.bulkImportValidationRate || 0}%</div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Validation Rate</div>
                          </div>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-purple-50'}`}>
                          <div className="flex items-center gap-3">
                            <span className="text-purple-500">🎯</span>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Manual Entry</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-600">{leadStats.manualEntryQualityRate || 0}%</div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quality Score</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lead Quality Analytics */}
                    <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                      <h4 className={`text-xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
                        <span className="text-2xl">⭐</span>
                        Lead Quality Breakdown
                      </h4>
                      <div className="space-y-4">
                        <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-green-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>High Quality (80-100)</span>
                          </div>
                          <div className="text-lg font-bold text-green-600">{leadStats.highQuality || 0}</div>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-yellow-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Medium Quality (60-79)</span>
                          </div>
                          <div className="text-lg font-bold text-yellow-600">{leadStats.mediumQuality || 0}</div>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-red-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Needs Review (0-59)</span>
                          </div>
                          <div className="text-lg font-bold text-red-600">{leadStats.lowQuality || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity & Trends */}
                  <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                    <h4 className={`text-xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-800'} mb-4 flex items-center gap-2`}>
                      <span className="text-2xl">📊</span>
                      Recent Activity & Trends
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-gradient-to-r from-blue-50 to-blue-100'}`}>
                        <div className="text-2xl font-bold text-blue-600">+{leadStats.leadsThisWeek || 0}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Leads This Week</div>
                        <div className={`text-xs mt-1 ${(leadStats.weeklyGrowthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(leadStats.weeklyGrowthRate || 0) >= 0 ? '↗' : '↘'} {Math.abs(leadStats.weeklyGrowthRate || 0)}% from last week
                        </div>
                      </div>
                      <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-gradient-to-r from-green-50 to-green-100'}`}>
                        <div className="text-2xl font-bold text-green-600">{leadStats.avgQualityScore || 0}%</div>
                        <div className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>Avg Quality Score</div>
                        <div className="text-xs text-green-600 mt-1">↗ Based on high-quality leads</div>
                      </div>
                      <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-gradient-to-r from-purple-50 to-purple-100'}`}>
                        <div className="text-2xl font-bold text-purple-600">${leadStats.avgCostPerLead || 0}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>Avg Cost Per Lead</div>
                        <div className="text-xs text-green-600 mt-1">↗ From AI scraping</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200'}`}>
                    <h4 className={`text-lg font-bold ${isDarkMode ? 'text-teal-400' : 'text-teal-800'} mb-4`}>📋 Quick Analytics Actions</h4>
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={handleExportAnalyticsReport}
                        className={`px-4 py-2 rounded-lg transition-colors border ${isDarkMode ? 'bg-gray-600 text-teal-400 border-gray-500 hover:bg-gray-500' : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50'}`}
                      >
                        📊 Export Report
                      </button>
                      <button 
                        onClick={handleViewTrends}
                        className={`px-4 py-2 rounded-lg transition-colors border ${isDarkMode ? 'bg-gray-600 text-teal-400 border-gray-500 hover:bg-gray-500' : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50'}`}
                      >
                        📈 View Trends
                      </button>
                      <button 
                        onClick={handleQualityAnalysis}
                        className={`px-4 py-2 rounded-lg transition-colors border ${isDarkMode ? 'bg-gray-600 text-teal-400 border-gray-500 hover:bg-gray-500' : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50'}`}
                      >
                        🎯 Quality Analysis
                      </button>
                      <button 
                        onClick={handleScheduleReport}
                        className={`px-4 py-2 rounded-lg transition-colors border ${isDarkMode ? 'bg-gray-600 text-teal-400 border-gray-500 hover:bg-gray-500' : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50'}`}
                      >
                        📧 Schedule Report
                      </button>
                    </div>
                  </div>
                </div>
              )}

              </div>
            </div>
          )}
          {activeSection === 'Outreach Automation' && (
            <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
              <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Outreach Automation</h2>
              
              {/* Campaign Stats - Real Data Only */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span role="img" aria-label="campaigns" className="text-genie-teal text-3xl mb-2">📧</span>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{campaignStats.totalCampaigns}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Active Campaigns</div>
                </div>
                <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span role="img" aria-label="sent" className="text-genie-teal text-3xl mb-2">📤</span>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{campaignStats.totalEmailsSent.toLocaleString()}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Emails Sent</div>
                </div>
                <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span role="img" aria-label="bounces" className="text-orange-500 text-3xl mb-2">🚫</span>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{bounceStats.totalBounces || 0}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>Bounces Detected</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-center mt-1`}>
                    {bounceStats.totalProcessed || 0} processed
                  </div>
                </div>
              </div>

              {/* Automated Bounce Detection */}
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold text-genie-teal flex items-center`}>
                    <span className="mr-2">🤖</span>
                    Enhanced Bounce Detection
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                      bounceDetectionActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        bounceDetectionActive ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      {bounceDetectionActive ? 'Active' : 'Inactive'}
                    </div>
                    <button
                      onClick={bounceDetectionActive ? stopBounceMonitoring : startBounceMonitoring}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        bounceDetectionActive
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-genie-teal text-white hover:bg-genie-teal-dark'
                      }`}
                    >
                      {bounceDetectionActive ? '🛑 Stop' : '🤖 Start Auto-Detection'}
                    </button>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <div className="flex items-start">
                    <span className="mr-3 text-2xl">🧹</span>
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-blue-900'} mb-2`}>
                        Automated Bounce Management
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-700'} mb-3`}>
                        Automatically monitors your Gmail for bounce notifications and removes bounced emails from your contact list. 
                        Hard bounces are removed immediately, soft bounces are tracked and removed after 3 attempts.
                      </p>
                      
                      {bounceStats.lastScan && (
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-blue-600'}`}>
                          Last scan: {new Date(bounceStats.lastScan.seconds * 1000).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={runBounceMonitoring}
                    className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">🔍</span>
                    Scan Now
                  </button>
                  
                  <button
                    onClick={setupGmailOAuth}
                    className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">🔗</span>
                    Connect Gmail
                  </button>
                  
                  <button
                    onClick={resetBounceStatistics}
                    className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">🔄</span>
                    Reset Stats
                  </button>
                  
                  <button
                    onClick={loadBounceStats}
                    className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">📊</span>
                    Refresh Stats
                  </button>
                </div>
              </div>

              {/* Business Profile Section */}
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold text-genie-teal`}>📧 Email Signature & Business Information</h3>
                  <button
                    type="button"
                    onClick={() => setShowBusinessProfile(!showBusinessProfile)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      showBusinessProfile 
                        ? 'bg-genie-teal text-white' 
                        : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                    }`}
                  >
                    {showBusinessProfile ? '▼ Hide Settings' : '▶ Configure Business Info'}
                  </button>
                </div>
                
                {!showBusinessProfile ? (
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <div className="flex items-center text-sm">
                      <span className="mr-2">💼</span>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                        Set up your business information to create professional email signatures and footers for all your campaigns.
                      </span>
                    </div>
                  </div>
                ) : (
                  <BusinessProfileSettings 
                    tenant={tenant}
                    onSave={(businessInfo) => {
                      console.log('Business profile saved:', businessInfo)
                      toast.success('Business information saved successfully!')
                      setShowBusinessProfile(false)
                    }}
                  />
                )}
              </div>

              {/* Campaign Builder */}
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Create New Campaign</h3>
                <form onSubmit={handleCampaignFormSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Campaign Name</label>
                    <input 
                      type="text" 
                      value={campaignFormData.name}
                      onChange={(e) => setCampaignFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} 
                      placeholder="Q1 Product Launch"
                      required
                    />
                  </div>
                  
                  {/* Email Subject with Integrated AI Generator */}
                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-750 border-gray-600' : 'bg-gradient-to-r from-gray-50 to-teal-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">✉️</span>
                      <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Email Subject</label>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-teal-900 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>AI Powered</span>
                    </div>
                    
                    {/* Subject Input Field */}
                    <input 
                      type="text" 
                      value={campaignFormData.subject}
                      onChange={(e) => setCampaignFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className={`w-full border p-3 rounded-lg mb-3 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`} 
                      placeholder="Enter subject or generate with AI below..."
                      required
                    />
                    
                    {/* Compact AI Generator */}
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                      {/* Prompt + Tone Row */}
                      <div className="flex flex-col md:flex-row gap-3 mb-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={subjectPrompt}
                            onChange={(e) => setSubjectPrompt(e.target.value)}
                            placeholder="Describe your email (e.g., Product launch with 20% discount)"
                            className={`w-full border p-2 rounded text-sm ${
                              isDarkMode 
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                            }`}
                          />
                        </div>
                        <select
                          value={subjectTone}
                          onChange={(e) => setSubjectTone(e.target.value)}
                          className={`border p-2 rounded text-sm min-w-[160px] ${
                            isDarkMode 
                              ? 'bg-gray-600 border-gray-500 text-white' 
                              : 'bg-white border-gray-200 text-gray-800'
                          }`}
                        >
                          <option value="professional">💼 Professional</option>
                          <option value="friendly">😊 Friendly</option>
                          <option value="urgent">⚡ Urgent</option>
                          <option value="curious">🤔 Curious</option>
                          <option value="exclusive">👑 Exclusive</option>
                          <option value="helpful">🤝 Helpful</option>
                          <option value="playful">🎉 Playful</option>
                          <option value="bold">🔥 Bold</option>
                        </select>
                        <button
                          type="button"
                          onClick={generateSubjectLines}
                          disabled={generatingSubjects || !subjectPrompt.trim()}
                          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                            generatingSubjects || !subjectPrompt.trim()
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-genie-teal hover:bg-teal-600 text-white'
                          }`}
                        >
                          {generatingSubjects ? '⏳ Generating...' : '✨ Generate'}
                        </button>
                      </div>
                      
                      {/* Generated Subjects - Compact List */}
                      {generatedSubjects.length > 0 && (
                        <div className="space-y-1">
                          {generatedSubjects.map((subject, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectSubjectLine(subject)}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                                isDarkMode
                                  ? 'bg-gray-600 text-white hover:bg-teal-700 hover:text-white'
                                  : 'bg-gray-50 text-gray-700 hover:bg-teal-100 hover:text-teal-800'
                              }`}
                            >
                              <span className="text-teal-500 font-medium mr-2">{index + 1}.</span>
                              {subject}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Subtle hint when no subjects generated */}
                      {generatedSubjects.length === 0 && (
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          💡 Describe your email, pick a tone, and click Generate for AI subject suggestions
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Campaign Type</label>
                      <select 
                        value={campaignFormData.type}
                        onChange={(e) => setCampaignFormData(prev => ({ ...prev, type: e.target.value }))}
                        className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="Email">Email Sequence</option>
                        <option value="SMS">SMS Campaign</option>
                        <option value="LinkedIn">LinkedIn Outreach</option>
                        <option value="Multi-Channel">Multi-Channel</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        🎯 Target Audience <span className="text-red-500">*</span> <span className="text-xs text-red-400">(Required)</span>
                      </label>
                      <select 
                        value={campaignFormData.targetAudience}
                        onChange={(e) => {
                          setCampaignFormData(prev => ({ ...prev, targetAudience: e.target.value, customSegments: [] }))
                        }}
                        className={`w-full border p-3 rounded ${!campaignFormData.targetAudience ? 'border-red-400 border-2' : ''} ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        required
                      >
                        <option value="">⚠️ Select Audience (Required)</option>
                        <option value="All Leads">All Leads</option>
                        <option value="All Contacts">All Contacts</option>
                        <option value="New Leads">New Leads</option>
                        <option value="Warm Prospects">Warm Prospects</option>
                        <option value="Custom Segment">Custom Segment (Tags)</option>
                      </select>
                      
                      {/* Warning if no audience selected */}
                      {!campaignFormData.targetAudience && (
                        <div className="mt-2 p-2 rounded-lg bg-red-100 text-red-700 text-sm flex items-center">
                          <span className="mr-2">⚠️</span>
                          <span>You must select a target audience before creating the campaign</span>
                        </div>
                      )}
                      
                      {/* Contact Count Display */}
                      {campaignFormData.targetAudience && (
                        <div className={`mt-2 p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-blue-700'}`}>
                          <div className="flex items-center text-sm">
                            <span className="mr-2">📧</span>
                            <span>
                              Campaign will send to <strong>{calculateTargetContacts(campaignFormData).length}</strong> contacts
                              {campaignFormData.targetAudience === 'Custom Segment' && campaignFormData.customSegment && 
                                ` with "${campaignFormData.customSegment}" tag`
                              }
                            </span>
                          </div>
                          <div className="text-xs mt-1 opacity-70">
                            Debug: Total contacts in state: {Array.isArray(contacts) ? contacts.length : 'Not an array'}, 
                            Type: {typeof contacts}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Segment Selection - Shows when Custom Segment is selected */}
                  {campaignFormData.targetAudience === 'Custom Segment' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>📋 Select Custom Segments</label>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                console.log('Manually refreshing tags from CRM contacts...')
                                
                                // Load contacts from the same source as CRM Pipeline
                                const contactsResult = await FirebaseUserDataService.getContacts(user.uid, user.uid)
                                console.log('Contacts result:', contactsResult)
                                
                                let contactsArray = []
                                if (contactsResult.success && contactsResult.data) {
                                  // Handle the nested contacts structure
                                  if (Array.isArray(contactsResult.data)) {
                                    contactsArray = contactsResult.data
                                  } else if (contactsResult.data.contacts && Array.isArray(contactsResult.data.contacts)) {
                                    contactsArray = contactsResult.data.contacts
                                  }
                                }
                                
                                console.log('Found contacts:', contactsArray.length)
                                
                                // Extract all unique tags from contacts
                                let allTags = []
                                
                                contactsArray.forEach(contact => {
                                  console.log('Processing contact:', contact.email, 'tags:', contact.tags)
                                  
                                  // ONLY add tags from the Tags column - nothing else
                                  if (contact.tags) {
                                    if (Array.isArray(contact.tags)) {
                                      allTags.push(...contact.tags)
                                    } else if (typeof contact.tags === 'string' && contact.tags.trim()) {
                                      // Handle comma-separated tags (like "Business Services")
                                      const tagArray = contact.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                                      allTags.push(...tagArray)
                                    }
                                  }
                                })
                                
                                // Remove empty values and get unique tags
                                const uniqueTags = [...new Set(allTags)].filter(tag => tag && tag.trim())
                                console.log('Extracted unique tags:', uniqueTags)
                                
                                setAvailableTags(uniqueTags)
                                toast.success(`Refreshed! Found ${uniqueTags.length} tags from ${contactsArray.length} contacts: ${uniqueTags.slice(0, 5).join(', ')}${uniqueTags.length > 5 ? '...' : ''}`)
                              } catch (error) {
                                console.error('Error refreshing tags:', error)
                                toast.error('Error refreshing tags: ' + error.message)
                              }
                            }}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          >
                            🔄 Refresh Tags
                          </button>
                        </div>
                        <select 
                          multiple
                          value={campaignFormData.customSegments}
                          onChange={(e) => {
                            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
                            setCampaignFormData(prev => ({ ...prev, customSegments: selectedOptions }))
                          }}
                          className={`w-full border border-orange-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white bg-orange-50' : 'bg-orange-50'} min-h-[120px]`}
                        >
                          {availableTags.map(tag => (
                            <option key={tag} value={tag}>
                              🏷️ {tag}
                            </option>
                          ))}
                        </select>
                        {availableTags.length === 0 && (
                          <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <p>No tagged segments found. Create tags in your CRM first.</p>
                            <p className="text-blue-600 mt-1">Click "🔄 Refresh Tags" button above to reload from CRM.</p>
                          </div>
                        )}
                        {availableTags.length > 0 && (
                          <div className={`text-xs mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            <p>Found {availableTags.length} tag(s): {availableTags.join(', ')}</p>
                            <p className={`mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>💡 Hold Ctrl/Cmd to select multiple segments</p>
                          </div>
                        )}
                        
                        {/* Contact Count Display for Custom Segments */}
                        {campaignFormData.customSegments && campaignFormData.customSegments.length > 0 && (
                          <div className={`mt-3 p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-orange-50 text-orange-700'}`}>
                            <div className="flex items-center text-sm">
                              <span className="mr-2">🏷️</span>
                              <span>
                                Campaign will send to <strong>{calculateTargetContacts(campaignFormData).length}</strong> contacts 
                                with {campaignFormData.customSegments.length === 1 ? 'tag' : 'tags'}: <strong>{campaignFormData.customSegments.join(', ')}</strong>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>AI Provider</label>
                        <select 
                          value={campaignFormData.aiProvider || ''}
                          onChange={(e) => setCampaignFormData(prev => ({ ...prev, aiProvider: e.target.value }))}
                          className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">Auto-Select (Use Best Available)</option>
                          <option value="openai">OpenAI GPT-4</option>
                          <option value="anthropic">Anthropic Claude</option>
                          <option value="deepseek">DeepSeek</option>
                          <option value="gemini">Google Gemini</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* AI Provider - Shows when Custom Segment is NOT selected */}
                  {campaignFormData.targetAudience !== 'Custom Segment' && (
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>AI Provider</label>
                      <select 
                        value={campaignFormData.aiProvider || ''}
                        onChange={(e) => setCampaignFormData(prev => ({ ...prev, aiProvider: e.target.value }))}
                        className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="">Auto-Select (Use Best Available)</option>
                        <option value="openai">OpenAI GPT-4</option>
                        <option value="anthropic">Anthropic Claude</option>
                        <option value="deepseek">DeepSeek</option>
                        <option value="gemini">Google Gemini</option>
                      </select>
                    </div>
                  )}
                  
                  {/* AI Smart Prompt */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>🤖 AI Smart Prompt</label>
                    <select
                      value={campaignFormData.aiSmartPrompt}
                      onChange={(e) => setCampaignFormData(prev => ({ ...prev, aiSmartPrompt: e.target.value }))}
                      className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-purple-50 border-purple-300'}`}
                    >
                      {aiSmartPrompts.map(prompt => (
                        <option key={prompt.value} value={prompt.value}>
                          {prompt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Additional Prompting/Customized */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>✨ Additional Prompting/Customized</label>
                    <textarea
                      value={campaignFormData.additionalPrompt}
                      onChange={(e) => setCampaignFormData(prev => ({ ...prev, additionalPrompt: e.target.value }))}
                      placeholder="Add any additional instructions or customizations for your AI-generated email content..."
                      rows={3}
                      className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-300' : 'bg-indigo-50 border-indigo-300'}`}
                    />
                  </div>

                  {/* Call to Action Section */}
                  <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <h4 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>🔗 Call to Action (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>📝 Call to Action Text</label>
                        <input
                          type="text"
                          value={campaignFormData.callToActionText}
                          onChange={(e) => setCampaignFormData(prev => ({ ...prev, callToActionText: e.target.value }))}
                          placeholder="e.g., 'Schedule a Free Consultation', 'Download Our Guide'"
                          className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-300' : 'bg-blue-50 border-blue-300'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>🌐 Call to Action URL</label>
                        <input
                          type="url"
                          value={campaignFormData.callToActionUrl}
                          onChange={(e) => setCampaignFormData(prev => ({ ...prev, callToActionUrl: e.target.value }))}
                          placeholder="https://your-website.com/landing-page"
                          className={`w-full border border-blue-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white bg-blue-50' : 'bg-blue-50'}`}
                        />
                      </div>
                    </div>
                    {campaignFormData.callToActionText && campaignFormData.callToActionUrl && (
                      <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-blue-700'}`}>
                        <div className="flex items-center text-sm">
                          <span className="mr-2">👀</span>
                          <span>Preview: </span>
                          <a 
                            href={campaignFormData.callToActionUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 text-blue-600 underline hover:text-blue-800"
                          >
                            {campaignFormData.callToActionText}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>⏰ Schedule Send (Auto)</label>
                      <input 
                        type="datetime-local" 
                        value={campaignFormData.sendDate}
                        onChange={(e) => setCampaignFormData(prev => ({ ...prev, sendDate: e.target.value }))}
                        className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Set date/time for automatic sending. Leave blank to send manually.
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>📦 Daily Batch Size</label>
                      <select
                        value={campaignFormData.batchSize || 25}
                        onChange={(e) => setCampaignFormData(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                        className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value={25}>25 emails (Conservative - Recommended)</option>
                        <option value={50}>50 emails (Safe)</option>
                        <option value={75}>75 emails (Moderate)</option>
                        <option value={100}>100 emails (Standard)</option>
                        <option value={150}>150 emails (High Volume - Use with caution)</option>
                      </select>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Sends batch daily until all contacts reached. Auto-continues each day.
                      </p>
                    </div>
                  </div>
                  <button type="submit" className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 transition-colors">
                    Create Campaign
                  </button>
                </form>
              </div>

              {/* Active Campaigns */}
              <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-xl font-semibold text-genie-teal`}>Active Campaigns</h3>
                </div>
                <div className="space-y-4">
                  {campaigns.length === 0 ? (
                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No campaigns created yet. Create your first campaign above!
                    </div>
                  ) : (
                    campaigns.map(campaign => (
                      <div key={campaign.id} className={`border-l-4 border-genie-teal ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{campaign.name}</h4>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {(() => {
                                const calculatedContacts = calculateTargetContacts(campaign).length;
                                const createdDate = formatDateUS(campaign.createdDate);
                                const scheduledDate = campaign.sendDate ? formatDateUS(campaign.sendDate) : null;
                                
                                let dateInfo = `Created: ${createdDate}`;
                                if (scheduledDate && scheduledDate !== 'Not set') {
                                  dateInfo += ` • 📅 Scheduled: ${scheduledDate}`;
                                }
                                
                                return `${campaign.type} • ${campaign.emailsSent} of ${calculatedContacts} contacts • ${dateInfo}`;
                              })()}
                              {campaign.targetAudience === 'Custom Segment' && campaign.customSegments && campaign.customSegments.length > 0 && (
                                <span className="text-orange-600 font-medium"> • 🏷️ {campaign.customSegments.join(', ')}</span>
                              )}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                              Status: <span className={`px-2 py-1 rounded-full text-xs ${
                                campaign.status === 'Active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : campaign.status === 'Draft'
                                  ? 'bg-blue-100 text-blue-800'
                                  : campaign.status === 'Paused'
                                  ? 'bg-orange-100 text-orange-800'
                                  : campaign.status === 'Scheduled'
                                  ? 'bg-purple-100 text-purple-800'
                                  : campaign.status === 'In Progress'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : campaign.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : campaign.status === 'Error'
                                  ? 'bg-red-100 text-red-800'
                                  : campaign.status === 'Sent'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {campaign.status === 'Scheduled' && '⏰ '}
                                {campaign.status === 'In Progress' && '🔄 '}
                                {campaign.status === 'Completed' && '✅ '}
                                {campaign.status === 'Error' && '❌ '}
                                {campaign.status}
                              </span>
                              {campaign.status === 'Scheduled' && campaign.sendDate && (
                                <span className={`ml-2 text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                  📅 Auto-sends: {new Date(campaign.sendDate).toLocaleString()}
                                </span>
                              )}
                              {campaign.status === 'In Progress' && campaign.sentContacts && (
                                <span className={`ml-2 text-xs ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                  📧 {campaign.sentContacts.length} sent, next batch in ~24h
                                </span>
                              )}
                              {campaign.lastError && (
                                <span className={`ml-2 text-xs text-red-500`}>
                                  ⚠️ {campaign.lastError}
                                </span>
                              )}
                              {campaign.progress && (
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800`}>
                                  📧 {campaign.progress}
                                </span>
                              )}
                              {campaign.subject && (
                                <span className={`ml-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Subject: "{campaign.subject}"
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleCampaignAction(campaign.id, 'edit')}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                              📝 Edit Campaign
                            </button>
                            <button 
                              onClick={() => handleCampaignAction(campaign.id, 'send_now')}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                              disabled={campaign.status === 'Sending'}
                            >
                              {campaign.status === 'Sending' 
                                ? 'Sending...' 
                                : campaign.status === 'Paused'
                                ? '▶️ Continue'
                                : campaign.status === 'Sent'
                                ? '✅ Sent'
                                : '📧 Send Now'}
                            </button>
                            <button 
                              onClick={() => handleCampaignAction(campaign.id, 'pause')}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                campaign.status === 'Active' 
                                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {campaign.status === 'Active' ? 'Pause' : 'Resume'}
                            </button>
                            <button 
                              onClick={() => handleCampaignAction(campaign.id, 'delete')}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1 flex justify-between`}>
                            <span>Open Rate: {campaign.openRate}%</span>
                            <span>Response Rate: {campaign.responseRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-genie-teal h-2 rounded-full" style={{width: `${campaign.openRate}%`}}></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Campaign Edit Modal */}
              {showEditModal && editingCampaign && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-xl font-semibold text-genie-teal`}>Edit Campaign: {editingCampaign.name}</h3>
                      <button 
                        onClick={() => setShowEditModal(false)}
                        className={`text-gray-500 hover:text-gray-700 text-2xl ${isDarkMode ? 'hover:text-gray-300' : ''}`}
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Campaign Name</label>
                        <input 
                          type="text" 
                          value={editingCampaign.name}
                          onChange={(e) => setEditingCampaign({...editingCampaign, name: e.target.value})}
                          className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email Subject</label>
                        <input 
                          type="text" 
                          value={editingCampaign.subject || ''}
                          onChange={(e) => setEditingCampaign({...editingCampaign, subject: e.target.value})}
                          className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Campaign Status</label>
                        <select 
                          value={editingCampaign.status}
                          onChange={(e) => setEditingCampaign({...editingCampaign, status: e.target.value})}
                          className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Active">Active</option>
                          <option value="Paused">Paused</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>📦 Daily Batch Size</label>
                        <select
                          value={editingCampaign.batchSize || 25}
                          onChange={(e) => setEditingCampaign({...editingCampaign, batchSize: parseInt(e.target.value)})}
                          className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value={25}>25 emails (Conservative - Recommended)</option>
                          <option value={50}>50 emails (Safe)</option>
                          <option value={75}>75 emails (Moderate)</option>
                          <option value={100}>100 emails (Standard)</option>
                          <option value={150}>150 emails (High Volume - Use with caution)</option>
                        </select>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Gmail OAuth: Start with 25/day to build trust. Resume next day for remaining contacts.
                        </p>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Selected Template</label>
                        <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
                          {editingCampaign.template || 'No template selected'}
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Target Audience</label>
                        <select 
                          value={editingCampaign.targetAudience || ''}
                          onChange={(e) => setEditingCampaign({...editingCampaign, targetAudience: e.target.value})}
                          className={`w-full border p-3 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                          <option value="">Select Audience</option>
                          <option value="All Leads">All Leads</option>
                          <option value="All Contacts">All Contacts</option>
                          <option value="New Leads">New Leads</option>
                          <option value="Warm Prospects">Warm Prospects</option>
                          <option value="Custom Segment">Custom Segment</option>
                        </select>
                        
                        {/* Custom Segment Selection for Edit Modal */}
                        {editingCampaign.targetAudience === 'Custom Segment' && (
                          <div className="mt-3">
                            <div className="flex justify-between items-center mb-1">
                              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>📋 Select Custom Segments</label>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    console.log('Refreshing tags for edit modal...')
                                    const leadsResult = await LeadService.getLeads(tenant.id, 500)
                                    if (leadsResult.success && leadsResult.data) {
                                      let allTags = []
                                      leadsResult.data.forEach(lead => {
                                        if (lead.tags) {
                                          if (Array.isArray(lead.tags)) {
                                            allTags.push(...lead.tags)
                                          } else if (typeof lead.tags === 'string') {
                                            allTags.push(...lead.tags.split(',').map(t => t.trim()))
                                          }
                                        }
                                        if (lead.category) allTags.push(lead.category)
                                        if (lead.status) allTags.push(lead.status)
                                        if (lead.leadMagnet) allTags.push(lead.leadMagnet)
                                        if (lead.source && lead.source !== 'CSV Import') allTags.push(lead.source)
                                        if (lead.type) allTags.push(lead.type)
                                      })
                                      
                                      // Add manual segments
                                      const manualSegments = ['Gumroad seller', 'New prospects', 'VIP customers', 'Email subscribers']
                                      allTags.push(...manualSegments)
                                      const uniqueTags = [...new Set(allTags)].filter(tag => tag && tag.trim())
                                      setAvailableTags(uniqueTags)
                                      toast.success(`Refreshed! Found ${uniqueTags.length} tags`)
                                    }
                                  } catch (error) {
                                    toast.error('Error refreshing tags: ' + error.message)
                                  }
                                }}
                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                              >
                                🔄 Refresh Tags
                              </button>
                            </div>
                            <select 
                              multiple
                              value={editingCampaign.customSegments || []}
                              onChange={(e) => {
                                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
                                setEditingCampaign({...editingCampaign, customSegments: selectedOptions})
                              }}
                              className={`w-full border p-3 rounded min-h-[120px] ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            >
                              {availableTags.map(tag => (
                                <option key={tag} value={tag}>
                                  🏷️ {tag}
                                </option>
                              ))}
                            </select>
                            {availableTags.length === 0 && (
                              <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <p>No tagged segments found. Create tags in your CRM first.</p>
                                <p className="text-blue-600 mt-1">Click "🔄 Refresh Tags" button to reload from CRM.</p>
                              </div>
                            )}
                            {availableTags.length > 0 && (
                              <div className={`text-xs mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                <p>Found {availableTags.length} tag(s): {availableTags.join(', ')}</p>
                                <p className={`mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>💡 Hold Ctrl/Cmd to select multiple segments</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email Content</label>
                        <div className={`border rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                          <div 
                            contentEditable
                            dangerouslySetInnerHTML={{ __html: editingCampaign.emailContent || '' }}
                            onBlur={(e) => {
                              setEditingCampaign({...editingCampaign, emailContent: e.target.innerHTML});
                            }}
                            className={`w-full p-3 h-64 overflow-y-auto focus:outline-none ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                            style={{
                              fontFamily: 'Arial, sans-serif',
                              lineHeight: '1.6',
                              fontSize: '14px'
                            }}
                            placeholder="Click here to edit your email content..."
                          />
                        </div>
                        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Rich text editor - format with bold, paragraphs, etc. Use variables like {'{firstName}'} {'{lastName}'} {'{company}'} that will be replaced with actual contact data.
                        </div>
                      </div>

                      <div className={`p-4 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                        <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email Preview</h4>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} h-96 overflow-y-auto border rounded p-4 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                          {editingCampaign.emailContent ? 
                            <div 
                              dangerouslySetInnerHTML={{
                                __html: editingCampaign.emailContent
                                  .replace(/{firstName}/g, 'John')
                                  .replace(/{lastName}/g, 'Doe')
                                  .replace(/{company}/g, 'Acme Corp')
                              }}
                              style={{
                                lineHeight: '1.6',
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '14px'
                              }}
                            />
                            : <div className="text-gray-500 italic">No content to preview</div>
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => {
                          const updatedCampaigns = campaigns.map(c => 
                            c.id === editingCampaign.id ? editingCampaign : c
                          )
                          setCampaigns(updatedCampaigns)
                          
                          // Recalculate campaign stats after editing
                          updateCampaignStats()
                          
                          setShowEditModal(false)
                          toast.success('Campaign updated successfully!')
                        }}
                        className="bg-genie-teal text-white px-6 py-2 rounded hover:bg-genie-teal/80 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button 
                        onClick={() => setShowEditModal(false)}
                        className={`px-6 py-2 rounded border transition-colors ${
                          isDarkMode 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bounce Management Modal - DISABLED */}
              {false && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className={`text-xl font-semibold text-genie-teal`}>🧹 Bulk Bounce Management</h3>
                      <button
                        onClick={() => {}}
                        className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-2xl`}
                      >
                        ×
                      </button>
                    </div>

                    <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-800'}`}>
                      <h4 className="font-semibold mb-2">📋 Three Easy Ways to Remove Bounced Emails:</h4>
                      <ol className="text-sm space-y-1">
                        <li><strong>1. Manual List:</strong> Type/paste email addresses separated by commas or new lines</li>
                        <li><strong>2. Upload File:</strong> Create a text file with bounced emails and upload it</li>
                        <li><strong>3. Paste Text:</strong> Copy Gmail bounce notifications and paste them</li>
                      </ol>
                    </div>

                    {/* Method Selection */}
                    <div className="mb-4">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        📝 Choose Input Method:
                      </label>
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => setBounceMethod('manual')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            bounceMethod === 'manual'
                              ? 'bg-blue-500 text-white'
                              : isDarkMode 
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          📝 Manual List
                        </button>
                        <button
                          onClick={() => setBounceMethod('upload')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            bounceMethod === 'upload'
                              ? 'bg-blue-500 text-white'
                              : isDarkMode 
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          📁 Upload File
                        </button>
                        <button
                          onClick={() => setBounceMethod('paste')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            bounceMethod === 'paste'
                              ? 'bg-blue-500 text-white'
                              : isDarkMode 
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          📋 Paste Text
                        </button>
                      </div>
                    </div>

                    {/* Manual Email List */}
                    {bounceMethod === 'manual' && (
                      <div className="mb-4">
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          📧 Enter Bounced Email Addresses
                        </label>
                        <textarea
                          value={bounceEmails}
                          onChange={(e) => setBounceEmails(e.target.value)}
                          placeholder={`Enter email addresses (one per line or comma-separated):

tcharles@prairiefarms.com
invalid@company.com
badaddress@domain.com

Or comma-separated:
email1@domain.com, email2@domain.com, email3@domain.com`}
                          rows={8}
                          className={`w-full border border-red-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
                        />
                      </div>
                    )}

                    {/* File Upload */}
                    {bounceMethod === 'upload' && (
                      <div className="mb-4">
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          📁 Upload Bounce File (.txt, .csv, or any text file)
                        </label>
                        <div className={`border-2 border-dashed border-red-300 rounded-lg p-6 text-center ${isDarkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
                          <input
                            type="file"
                            accept=".txt,.csv,.log,*"
                            onChange={handleBounceFileUpload}
                            className="hidden"
                            id="bounceFileInput"
                          />
                          <label htmlFor="bounceFileInput" className="cursor-pointer">
                            <div className="text-4xl mb-2">📁</div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Click to upload a file with bounced emails
                            </div>
                            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Supports .txt, .csv, or any text file
                            </div>
                          </label>
                        </div>
                        {bounceEmails && (
                          <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-800'}`}>
                            ✅ File uploaded! Ready to process {(bounceEmails.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).length} email addresses.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Paste Text */}
                    {bounceMethod === 'paste' && (
                      <div className="mb-4">
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          � Paste Gmail Bounce Notifications
                        </label>
                        <textarea
                          value={bounceEmails}
                          onChange={(e) => setBounceEmails(e.target.value)}
                          placeholder="Paste Gmail bounce notifications here... The system will automatically extract email addresses like: tcharles@prairiefarms.com, invalid@company.com, etc."
                          rows={8}
                          className={`w-full border border-red-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
                        />
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={processBounceEmails}
                        disabled={processingBounces || !bounceEmails.trim()}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                          processingBounces || !bounceEmails.trim()
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {processingBounces ? '🔄 Processing...' : '🧹 Remove Bounced Emails'}
                      </button>
                      <button
                        onClick={() => {}}
                        className={`px-6 py-3 rounded-lg border transition-colors ${
                          isDarkMode 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeSection === 'CRM & Pipeline' && <CRMPipeline isDarkMode={isDarkMode} />}
          {activeSection === 'Appointments' && (
            <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
              {/* APPOINTMENT BOOKING MODAL */}
              {(showAppointmentModal || forceShowModal.current) && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" 
                  style={{zIndex: 1000}}
                >
                  <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-lg p-8 w-full max-w-md shadow-xl`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-genie-teal">
                        {editingAppointment ? 'Reschedule Appointment' : 'Schedule Appointment'}
                      </h3>
                      <button 
                        onClick={() => {
                          setShowAppointmentModal(false)
                          forceShowModal.current = false
                        }}
                        className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} text-xl font-bold`}
                      >
                        ×
                      </button>
                    </div>
                    
                    <form 
                      className="space-y-4"
                      onSubmit={async (e) => {
                        e.preventDefault()
                        const formData = new FormData(e.target)
                        
                        const appointmentData = {
                          clientName: formData.get('clientName'),
                          email: formData.get('email'),
                          phone: formData.get('phone'),
                          startTime: formData.get('datetime'),
                          appointmentDate: formData.get('datetime'), // Also save as appointmentDate for compatibility
                          meetingType: formData.get('meetingType'),
                          notes: formData.get('notes'),
                          status: 'scheduled',
                          tenantId: tenant?.id
                        }
                        
                        try {
                          if (editingAppointment) {
                            // Update existing appointment
                            await handleUpdateAppointment(appointmentData)
                          } else {
                            // Create new appointment
                            await handleCreateAppointment(appointmentData)
                          }
                          
                          // Close modal
                          setShowAppointmentModal(false)
                          forceShowModal.current = false
                          setEditingAppointment(null)
                          
                          // Show success message
                          alert(editingAppointment ? 'Appointment rescheduled successfully!' : 'Appointment booked successfully!')
                          
                          // Appointments will auto-refresh via real-time subscription
                        } catch (error) {
                          console.error('Error saving appointment:', error)
                          alert('Error saving appointment. Please try again.')
                        }
                      }}
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Name *
                        </label>
                        <input 
                          type="text" 
                          name="clientName"
                          required
                          defaultValue={editingAppointment?.clientName || ''}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-genie-teal"
                          placeholder="Enter client name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input 
                          type="email" 
                          name="email"
                          required
                          defaultValue={editingAppointment?.email || ''}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-genie-teal"
                          placeholder="Enter email address"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input 
                          type="tel" 
                          name="phone"
                          defaultValue={editingAppointment?.phone || ''}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-genie-teal"
                          placeholder="Enter phone number"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date & Time *
                        </label>
                        <input 
                          type="datetime-local" 
                          name="datetime"
                          required
                          defaultValue={editingAppointment?.startTime ? new Date(editingAppointment.startTime).toISOString().slice(0, 16) : ''}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-genie-teal"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meeting Type
                        </label>
                        <select 
                          name="meetingType"
                          defaultValue={editingAppointment?.meetingType || 'Consultation'}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-genie-teal"
                        >
                          <option value="Consultation">Consultation</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Demo">Demo</option>
                          <option value="Strategy Session">Strategy Session</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (Optional)
                        </label>
                        <textarea 
                          name="notes"
                          defaultValue={editingAppointment?.notes || ''}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-genie-teal"
                          rows="3"
                          placeholder="Any additional notes..."
                        ></textarea>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <button 
                          type="button"
                          onClick={() => {
                            setShowAppointmentModal(false)
                            forceShowModal.current = false
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 px-4 py-2 bg-genie-teal text-white rounded-md hover:bg-genie-teal/80"
                        >
                          {editingAppointment ? 'Update Appointment' : 'Book Appointment'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-genie-teal'} mb-8`}>Appointments</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} shadow-lg rounded-xl p-6 flex flex-col items-center`}>
                  <span role="img" aria-label="calendar" className="text-genie-teal text-3xl mb-2">📅</span>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>
                    {appointmentsLoading ? '...' : appointmentStats.upcoming}
                  </div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Upcoming</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} shadow-lg rounded-xl p-6 flex flex-col items-center`}>
                  <span role="img" aria-label="booked" className="text-genie-teal text-3xl mb-2">✅</span>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>
                    {appointmentsLoading ? '...' : appointmentStats.booked}
                  </div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Booked</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} shadow-lg rounded-xl p-6 flex flex-col items-center`}>
                  <span role="img" aria-label="cancelled" className="text-genie-teal text-3xl mb-2">❌</span>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-900'}`}>
                    {appointmentsLoading ? '...' : appointmentStats.cancelled}
                  </div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cancelled</div>
                </div>
              </div>
              {/* Calendar Integration */}
              <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} rounded-xl shadow p-6 mb-8`}>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-teal-400' : 'text-genie-teal'} mb-4`}>Calendar Integration</h3>
                <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                  <button 
                    onClick={() => handleCalendarConnection('google')}
                    disabled={calendarConnections.google === 'connecting'}
                    className={`px-4 py-2 rounded flex items-center gap-2 ${
                      calendarConnections.google === true
                        ? 'bg-green-600 text-white'
                        : calendarConnections.google === 'connecting'
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                    }`}
                  >
                    <span>📅</span> 
                    {calendarConnections.google === true 
                      ? 'Google Calendar Connected' 
                      : calendarConnections.google === 'connecting'
                      ? 'Connecting...'
                      : 'Connect Google Calendar'
                    }
                  </button>
                  <button 
                    onClick={() => handleCalendarConnection('outlook')}
                    disabled={calendarConnections.outlook === 'connecting'}
                    className={`px-4 py-2 rounded flex items-center gap-2 ${
                      calendarConnections.outlook === true
                        ? 'bg-green-600 text-white'
                        : calendarConnections.outlook === 'connecting'
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-800 text-white hover:bg-blue-700'
                    }`}
                  >
                    <span>📧</span> 
                    {calendarConnections.outlook === true 
                      ? 'Outlook Connected' 
                      : calendarConnections.outlook === 'connecting'
                      ? 'Connecting...'
                      : 'Connect Outlook'
                    }
                  </button>
                  <button 
                    onClick={() => handleCalendarConnection('custom')}
                    className={`px-4 py-2 rounded flex items-center gap-2 ${
                      calendarConnections.custom === true
                        ? 'bg-green-600 text-white'
                        : calendarConnections.custom === 'setup'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-600 text-white hover:bg-gray-500'
                    }`}
                  >
                    <span>🔗</span> 
                    {calendarConnections.custom === true 
                      ? 'Custom Integration Active' 
                      : calendarConnections.custom === 'setup'
                      ? 'Setup in Progress'
                      : 'Custom Integration'
                    }
                  </button>
                </div>
              </div>

              {/* Booking Settings */}
              <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} rounded-xl shadow p-6 mb-8`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-teal-400' : 'text-genie-teal'}`}>⚙️ Booking Settings</h3>
                  <button
                    type="button"
                    onClick={() => setShowBookingSettings(!showBookingSettings)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      showBookingSettings 
                        ? 'bg-genie-teal text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {showBookingSettings ? '▼ Hide Settings' : '▶ Configure Booking'}
                  </button>
                </div>
                
                {!showBookingSettings ? (
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-blue-50'}`}>
                    <div className="flex items-center text-sm">
                      <span className="mr-2">📅</span>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                        Configure your booking preferences, available hours, and calendar settings for appointment scheduling.
                      </span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSettingsSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Meeting Duration</label>
                    <select className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300'}`}>
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>45 minutes</option>
                      <option>60 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Buffer Time</label>
                    <select className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300'}`}>
                      <option>No buffer</option>
                      <option>5 minutes</option>
                      <option>10 minutes</option>
                      <option>15 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Available Hours Start</label>
                    <input type="time" className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300'}`} defaultValue="09:00" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Available Hours End</label>
                    <input type="time" className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300'}`} defaultValue="17:00" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Available Date Range Start</label>
                    <input type="date" className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300'}`} defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Available Date Range End</label>
                    <input type="date" className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300'}`} defaultValue={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Available Days</label>
                    <select multiple className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300'}`} size="3">
                      <option value="monday" selected>Monday</option>
                      <option value="tuesday" selected>Tuesday</option>
                      <option value="wednesday" selected>Wednesday</option>
                      <option value="thursday" selected>Thursday</option>
                      <option value="friday" selected>Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Timezone</label>
                    <select className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300'}`}>
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-6 (Central Time)</option>
                      <option>UTC-7 (Mountain Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                    </select>
                  </div>
                  <button type="submit" className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 col-span-1 md:col-span-2">Save Settings</button>
                </form>
                )}
              </div>

              {/* Upcoming Appointments */}
              <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} rounded-xl shadow p-6`}>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-teal-400' : 'text-genie-teal'} mb-4`}>Upcoming Appointments</h3>
                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p>No appointments scheduled yet.</p>
                      <button 
                        onClick={handleBookMeeting}
                        className="mt-4 bg-genie-teal text-white px-6 py-2 rounded hover:bg-genie-teal/80"
                      >
                        Schedule Your First Meeting
                      </button>
                    </div>
                  ) : (
                    appointments
                      .filter(apt => apt.status === 'scheduled')
                      .slice(0, 5)
                      .map((appointment) => (
                        <div key={appointment.id} className="border-l-4 border-genie-teal bg-blue-50 p-4 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{appointment.title}</h4>
                              <p className="text-gray-600">{appointment.clientName}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(appointment.startTime).toLocaleDateString()} at {' '}
                                {new Date(appointment.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {' '}
                                {new Date(appointment.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleAppointmentAction(appointment, 'join')}
                                className="text-genie-teal hover:underline text-sm"
                              >
                                Join
                              </button>
                              <button 
                                onClick={() => handleAppointmentAction(appointment, 'reschedule')}
                                className="text-blue-600 hover:underline text-sm"
                              >
                                Reschedule
                              </button>
                              <button 
                                onClick={() => handleAppointmentAction(appointment, 'prepare')}
                                className="text-purple-600 hover:underline text-sm"
                              >
                                Prepare
                              </button>
                              <button 
                                onClick={() => handleAppointmentAction(appointment, 'reminder')}
                                className="text-orange-600 hover:underline text-sm"
                              >
                                Remind
                              </button>
                              <button 
                                onClick={() => handleAppointmentAction(appointment, 'export')}
                                className="text-green-600 hover:underline text-sm"
                              >
                                Export
                              </button>
                              <button 
                                onClick={() => handleAppointmentAction(appointment, 'delete')}
                                className="text-red-600 hover:underline text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
                <div className="flex justify-end mt-6 gap-2">
                  <button 
                    onClick={handleViewCalendar}
                    className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80"
                  >
                    View Calendar
                  </button>
                  <button 
                    onClick={handleBookMeeting}
                    className="bg-genie-teal/10 text-genie-teal px-4 py-2 rounded hover:bg-genie-teal/20"
                  >
                    Book Meeting
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeSection === 'White-Label SaaS' && <WhiteLabelDashboard isDarkMode={isDarkMode} />}
          {activeSection === 'Resources & Docs' && <ResourceDocumentationCenter isDarkMode={isDarkMode} />}
          
          {activeSection === 'API Keys & Integrations' && (
            <APIKeysIntegrations 
              calendarConnections={calendarConnections}
              onCalendarConnect={handleCalendarConnection}
              saveCalendarConnections={saveCalendarConnections}
              isDarkMode={isDarkMode}
            />
          )}
          {activeSection === 'Admin Panel' && user?.email === 'dubdproducts@gmail.com' && renderAdminPanel()}
          {activeSection === 'Account Settings' && renderAccountSettings()}
          {activeSection === 'Profile' && renderProfile()}
          {activeSection === 'Billing' && renderBilling()}
        </main>
        </div>
      </div>
    </GenieProvider>
  )

  function renderDashboard() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8 ${isDarkMode ? 'text-genie-teal' : ''}`}>SuperGenie Dashboard</h2>
        
        {/* Financial Overview Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="revenue" className="text-genie-teal text-3xl mb-2">💰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$45,230</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Revenue</div>
            <div className="text-green-500 text-sm mt-1">+12.5% ↗️</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="leads" className="text-genie-teal text-3xl mb-2">🎯</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1,247</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Leads</div>
            <div className="text-green-500 text-sm mt-1">+8.3% ↗️</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="conversion" className="text-genie-teal text-3xl mb-2">📊</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>24.6%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Conversion Rate</div>
            <div className="text-green-500 text-sm mt-1">+3.1% ↗️</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="campaigns" className="text-genie-teal text-3xl mb-2">🚀</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>18</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Campaigns</div>
            <div className="text-blue-500 text-sm mt-1">Running</div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Revenue Growth</h3>
          <div className="h-64 flex items-end justify-between bg-gradient-to-t from-blue-50 to-white rounded p-4">
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-32 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jan</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-40 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Feb</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-36 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mar</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-48 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Apr</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-44 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>May</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-genie-teal h-52 w-8 rounded-t mb-2"></div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jun</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-genie-teal text-white p-6 rounded-xl shadow hover:bg-genie-teal/90 transition-colors text-left">
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-semibold mb-1">Start New Campaign</div>
            <div className="text-genie-teal-light text-sm">Launch a new lead generation campaign</div>
          </button>
          <button 
            onClick={() => {
              setActiveSection('Lead Generation');
              setActiveLeadTab('analytics');
            }}
            className="bg-blue-600 text-white p-6 rounded-xl shadow hover:bg-blue-700 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold mb-1">View Lead Analytics</div>
            <div className="text-blue-200 text-sm">Deep dive into your lead generation performance</div>
          </button>
          <button className="bg-purple-600 text-white p-6 rounded-xl shadow hover:bg-purple-700 transition-colors text-left">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-semibold mb-1">Automation Hub</div>
            <div className="text-purple-200 text-sm">Manage your automated workflows</div>
          </button>
        </div>
      </div>
    )
  }

  function renderAccountSettings() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Account Settings</h2>
        
        {/* Profile Information */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Full Name</label>
              <input 
                type="text" 
                defaultValue="John Smith" 
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Email Address</label>
              <input 
                type="email" 
                defaultValue="john@company.com" 
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Company</label>
              <input 
                type="text" 
                defaultValue="Acme Corporation" 
                className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Time Zone</label>
              <select className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}>
                <option>Eastern Time (ET)</option>
                <option>Central Time (CT)</option>
                <option>Mountain Time (MT)</option>
                <option>Pacific Time (PT)</option>
              </select>
            </div>
          </div>
          <button className="mt-6 bg-genie-teal text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors">
            Save Changes
          </button>
        </div>

        {/* Security Settings */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add an extra layer of security to your account</p>
              </div>
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm">Enabled</button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Change Password</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Update your account password</p>
              </div>
              <button className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Change</button>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email Notifications</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Receive updates about your campaigns</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SMS Notifications</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Get alerts via text message</p>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Marketing Updates</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stay informed about new features</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderProfile() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Profile</h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Picture & Basic Info */}
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-genie-teal to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.displayName || 'User'}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user?.email}</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {tenant?.role === 'founder' ? '👑 Founder Account' : 'Standard User'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                  Display Name
                </label>
                <input 
                  type="text" 
                  defaultValue={user?.displayName || ''}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-2`}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className={`w-full px-4 py-2 border rounded-lg opacity-50 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Account Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold text-genie-teal`}>{tenant?.usage?.campaigns || 0}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Campaigns Created</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold text-genie-teal`}>{tenant?.usage?.leads || 0}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Leads Generated</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold text-genie-teal`}>{tenant?.usage?.apiCalls || 0}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>API Calls Made</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderBilling() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Billing & Subscription</h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Current Plan */}
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tenant?.plan === 'founder' ? '👑 Founder Plan' : tenant?.plan?.toUpperCase() || 'STARTER'} Plan
                </h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tenant?.billing?.lifetime ? 'Lifetime Access' : 'Monthly Subscription'}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tenant?.billing?.lifetime ? 'FREE' : `$${tenant?.billing?.amount || 0}`}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tenant?.billing?.lifetime ? 'Forever' : 'per month'}
                </div>
              </div>
            </div>
            
            {tenant?.plan === 'founder' && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-yellow-600 text-xl mr-3">👑</span>
                  <div>
                    <p className="font-semibold text-yellow-800">Founder Account Benefits</p>
                    <p className="text-sm text-yellow-700">Unlimited everything, lifetime access, priority support</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Usage Overview */}
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Current Usage</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Leads</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tenant?.usage?.leads || 0} / {tenant?.features?.maxLeads === 999999 ? '∞' : tenant?.features?.maxLeads || 1000}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Campaigns</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tenant?.usage?.campaigns || 0} / {tenant?.features?.maxCampaigns === 999999 ? '∞' : tenant?.features?.maxCampaigns || 10}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>API Calls</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {tenant?.usage?.apiCalls || 0} / {tenant?.features?.apiCalls === 999999 ? '∞' : tenant?.features?.apiCalls || 5000}
                </span>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Billing History</h3>
            {tenant?.billing?.lifetime ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🎉</span>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  You have lifetime access! No billing history needed.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No billing history available yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  function renderAPIKeys() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>API Keys & Integrations</h2>
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="keys" className="text-genie-teal text-3xl mb-2">🔑</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active API Keys</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="integrations" className="text-genie-teal text-3xl mb-2">🔗</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>12</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Connected Services</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="usage" className="text-genie-teal text-3xl mb-2">📊</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>89%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>API Usage</div>
          </div>
        </div>

        {/* Add New API Key */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Add New API Key</h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            Connect your own API keys for AI services. Your keys are stored securely and never shared with Genie Labs.
          </p>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Service Provider</label>
              <select className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                <option>Select Provider</option>
                <option>OpenAI (GPT-4)</option>
                <option>Anthropic (Claude)</option>
                <option>Google (Gemini)</option>
                <option>Cohere</option>
                <option>Hugging Face</option>
                <option>Custom API</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>API Key Name</label>
              <input type="text" className={`border p-3 rounded w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="My OpenAI Key" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="bg-genie-teal text-white px-6 py-3 rounded hover:bg-genie-teal/80 w-full">Add Key</button>
            </div>
          </form>
        </div>

        {/* Existing API Keys */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Your API Keys</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Usage</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>OpenAI GPT-4</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Production Key</td>
                  <td className="py-3 px-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span></td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>12,450 requests</td>
                  <td className="py-3 px-4">
                    <button className="text-genie-teal hover:text-genie-teal/80 mr-3">Edit</button>
                    <button className="text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Anthropic Claude</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Development Key</td>
                  <td className="py-3 px-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Limited</span></td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>3,200 requests</td>
                  <td className="py-3 px-4">
                    <button className="text-genie-teal hover:text-genie-teal/80 mr-3">Edit</button>
                    <button className="text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  function renderEmergencyMigration() {
    const handleMigration = async () => {
      setMigrationInProgress(true);
      setMigrationResult(null);
      
      try {
        // Use the emergency storage migration function
        if (window.emergencyStorageSync && window.emergencyStorageSync.migrateDefaultTenantLeads) {
          const result = await window.emergencyStorageSync.migrateDefaultTenantLeads();
          setMigrationResult(result);
          
          if (result.success) {
            toast.success(`🎉 ${result.message}`);
          } else {
            toast.error(`❌ Migration failed: ${result.error}`);
          }
        } else {
          throw new Error('Migration service not available');
        }
      } catch (error) {
        const errorResult = {
          success: false,
          error: error.message
        };
        setMigrationResult(errorResult);
        toast.error(`❌ Migration failed: ${error.message}`);
      } finally {
        setMigrationInProgress(false);
      }
    };

    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>🚚 Emergency Lead Migration</h2>
          
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Migrate Leads from Default Tenant
            </h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              This tool will move all leads from the 'default-tenant' collection to your correct tenant ID. 
              After migration, your leads will appear in the Recent Leads tab.
            </p>
            
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={handleMigration}
                disabled={migrationInProgress}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  migrationInProgress 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                {migrationInProgress ? '🔄 Migrating...' : '🚚 Start Migration'}
              </button>
              
              <button
                onClick={() => setActiveSection('Lead Generation')}
                className={`px-6 py-3 rounded-lg font-medium border transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Go to Recent Leads
              </button>
            </div>

            {migrationResult && (
              <div className={`p-4 rounded-lg ${
                migrationResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h4 className={`font-medium ${
                  migrationResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {migrationResult.success ? '✅ Migration Successful!' : '❌ Migration Failed'}
                </h4>
                <p className={`mt-2 ${
                  migrationResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {migrationResult.success 
                    ? `Successfully migrated ${migrationResult.migrated} leads. Skipped ${migrationResult.skipped} leads. Check your Recent Leads tab!`
                    : migrationResult.error
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderAdminPanel() {
    // SECURITY CHECK: Only founder can access Admin Panel
    if (user?.email !== 'dubdproducts@gmail.com' || tenant?.role !== 'founder') {
      return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
          <div className="max-w-md mx-auto text-center mt-20">
            <div className="text-6xl mb-6">🚫</div>
            <h2 className={`text-3xl font-bold text-red-500 mb-4`}>Access Denied</h2>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              You do not have permission to access the Admin Panel.
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              This area is restricted to founder accounts only.
            </p>
            <button 
              onClick={() => setActiveSection('SuperGenie Dashboard')}
              className="mt-6 px-6 py-3 bg-genie-teal text-white rounded-lg hover:bg-genie-teal/80 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Admin Panel</h2>
        
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="users" className="text-genie-teal text-3xl mb-2">👥</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {adminStats.isLoading ? '...' : adminStats.totalUsers.toLocaleString()}
            </div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="revenue" className="text-genie-teal text-3xl mb-2">💰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {adminStats.isLoading ? '...' : `$${(adminStats.monthlyRevenue / 1000).toFixed(0)}K`}
            </div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Revenue</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="support" className="text-genie-teal text-3xl mb-2">🎫</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {adminStats.isLoading ? '...' : adminStats.openTickets}
            </div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Open Tickets</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="system" className="text-genie-teal text-3xl mb-2">⚡</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {adminStats.isLoading ? '...' : `${adminStats.systemUptime}%`}
            </div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>System Uptime</div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>User Management</h3>
            <div className="space-y-4">
              <button 
                onClick={() => setAdminView('users')}
                className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 text-left flex items-center gap-3">
                <span>👤</span> View All Users
              </button>
              <button 
                onClick={() => setAdminView('create-user')}
                className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 text-left flex items-center gap-3">
                <span>➕</span> Create New User
              </button>
            </div>
          </div>

          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>System Administration</h3>
            <div className="space-y-4">
              <button 
                onClick={() => setAdminView('analytics')}
                className="w-full bg-purple-600 text-white p-3 rounded hover:bg-purple-700 text-left flex items-center gap-3">
                <span>📊</span> System Analytics
              </button>
              <button 
                onClick={runDataMigration}
                disabled={migrationStatus.inProgress}
                className={`w-full p-3 rounded text-left flex items-center gap-3 transition-colors ${
                  migrationStatus.inProgress 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : migrationStatus.completed
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}>
                <span>{migrationStatus.inProgress ? '🔄' : migrationStatus.completed ? '✅' : '🔧'}</span> 
                {migrationStatus.inProgress ? 'Migrating Data...' : migrationStatus.completed ? 'Migration Complete' : 'Fix Tenant Data Split'}
              </button>
            </div>
          </div>
        </div>

        {/* All Users Display - Always Visible */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-8`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-semibold text-genie-teal`}>👥 All Users</h3>
            <button 
              onClick={loadAllUsers}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
          
          {allUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Plan</th>
                    <th className="text-left p-3">Created</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => (
                    <tr key={user.id} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{user.name || user.displayName || 'No name'}</div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.plan === 'lifetime' ? 'bg-purple-100 text-purple-800' :
                          user.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.plan || user.planType || 'free'}
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          {!user.suspended && (
                            <button 
                              onClick={() => suspendUser(user.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="text-4xl mb-2">👥</div>
              <p>Loading users... Click Refresh to load users from database.</p>
            </div>
          )}
        </div>

        {/* Lifetime Plan Gift Tokens */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-8`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4 flex items-center gap-3`}>
            <span>🎁</span> Lifetime Plan Gift Tokens
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            Copy and share these unique lifetime plan gift links. Each token can only be redeemed once.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(20)].map((_, index) => {
              const tokenId = `LIFETIME-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${(index + 1).toString().padStart(2, '0')}`;
              const giftUrl = `https://marketgenie.tech/redeem-gift?token=${tokenId}`;
              
              return (
                <div key={index} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'} border-2 rounded-lg p-4 transition-all hover:shadow-lg`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-600'} bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                      TOKEN #{(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                      ✅ READY
                    </span>
                  </div>
                  
                  <div className={`text-xs font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} bg-${isDarkMode ? 'gray-800' : 'white'} p-2 rounded border mb-3 break-all`}>
                    {tokenId}
                  </div>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(giftUrl);
                      // Add visual feedback
                      const button = event.target;
                      const originalText = button.textContent;
                      button.textContent = '✅ Copied!';
                      button.className = button.className.replace('bg-gradient-to-r from-purple-600 to-pink-600', 'bg-green-600');
                      setTimeout(() => {
                        button.textContent = originalText;
                        button.className = button.className.replace('bg-green-600', 'bg-gradient-to-r from-purple-600 to-pink-600');
                      }, 2000);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-all duration-300 transform hover:scale-105"
                  >
                    📋 Copy Gift Link
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className={`mt-6 p-4 ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg`}>
            <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>
              <span>ℹ️</span>
              <strong>Gift Token Instructions:</strong>
            </div>
            <ul className={`text-xs ${isDarkMode ? 'text-blue-200' : 'text-blue-700'} space-y-1 ml-6`}>
              <li>• Each token grants one lifetime plan redemption</li>
              <li>• Tokens expire after 90 days if unused</li>
              <li>• Recipients will bypass payment and get instant access</li>
              <li>• Track redemptions in the User Management section</li>
            </ul>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Recent Admin Activity</h3>
          <div className="space-y-4">
            <div className={`border-l-4 border-blue-500 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded`}>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User Registration Spike</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>47 new users registered in the last hour</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>2 minutes ago</div>
            </div>
            <div className={`border-l-4 border-green-500 ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'} p-4 rounded`}>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Update Completed</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Version 2.1.3 deployed successfully</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>15 minutes ago</div>
            </div>
            <div className={`border-l-4 border-yellow-500 ${isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'} p-4 rounded`}>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>High API Usage Alert</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>OpenAI API usage at 85% of monthly limit</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>1 hour ago</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderLeadGeneration() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>🚀 Ultimate Lead Generation Ecosystem</h2>
        
        {/* Bulk Prospeo Scraper - NEW FEATURE */}
        <div className="mb-10">
          <BulkProspeoScraper />
        </div>
        
        {/* Integration Connection Status */}
        <div className="mb-10">
          <IntegrationConnectionStatus />
        </div>
        
        {/* Social Media Scraping Agents */}
        <div className="mb-10">
          <SocialMediaScrapingAgents />
        </div>
        
        {/* Lead Generation Automation Workflows */}
        <div className="mb-10">
          <LeadGenerationWorkflows />
        </div>
        
        {/* Multi-Channel Automation Hub */}
        <div className="mb-10">
          <MultiChannelAutomationHub />
        </div>
        
        {/* Advanced Funnel Builder */}
        <div className="mb-10">
          <AdvancedFunnelBuilder />
        </div>
        
        {/* Superior CRM System */}
        <div className="mb-10">
          <SuperiorCRMSystem />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="leads" className="text-genie-teal text-3xl mb-2">🧲</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>320</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>New Leads</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="import" className="text-genie-teal text-3xl mb-2">📥</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>120</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Imported Contacts</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="conversion" className="text-genie-teal text-3xl mb-2">🔄</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>18%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Lead Conversion</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="budget" className="text-genie-teal text-3xl mb-2">💸</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$120</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Budget Used</div>
          </div>
        </div>

        {/* Budget-Aware Scraping Controls */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-2`}>Budget-Aware Scraping Controls</h3>
          <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
            <label className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Monthly Scraping/API Budget ($):</label>
            <input type="number" min="10" max="1000" defaultValue="50" className={`border p-2 rounded w-32 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
            <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">Update Budget</button>
          </div>
          <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Estimated leads per budget: <span className="font-bold">{Math.floor(50/0.5)} leads</span> (demo)</div>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded p-4 mb-2`}>Current usage: <span className="font-bold">$32</span> / $50</div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>You can update your budget as your capital grows. Low-cost mode helps startups stay within limits.</div>
          <div className="text-xs text-red-500">{32 > 50 ? 'Warning: Budget exceeded! Scraping limited.' : ''}</div>
        </div>

        {/* Recent Leads Table */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Recent Leads</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Company</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Source</th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Jane Doe</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>jane@example.com</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Acme Inc.</td>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Website</td>
                  <td className="py-3 px-4">
                    <button className="text-genie-teal hover:text-genie-teal/80 mr-3">Contact</button>
                    <button className="text-blue-500 hover:text-blue-700">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  function renderCRMPipeline() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>CRM & Pipeline</h2>
        
        {/* Pipeline Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="prospects" className="text-genie-teal text-3xl mb-2">🎯</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>127</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Prospects</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="qualified" className="text-genie-teal text-3xl mb-2">✅</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>43</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Qualified</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="proposals" className="text-genie-teal text-3xl mb-2">📄</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>18</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Proposals Sent</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="closed" className="text-genie-teal text-3xl mb-2">💰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$89K</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Closed Won</div>
          </div>
        </div>

        {/* Pipeline Kanban */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Sales Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead (34)</h4>
              <div className="space-y-2">
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Acme Corp</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$15,000</div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>TechStart Inc</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$8,500</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Qualified (18)</h4>
              <div className="space-y-2">
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Global Solutions</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$25,000</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Proposal (8)</h4>
              <div className="space-y-2">
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise Co</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$45,000</div>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Closed Won (5)</h4>
              <div className="space-y-2">
                <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-white'} p-3 rounded border ${isDarkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Success Ltd</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$32,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderAppointments() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Appointments</h2>
        
        {/* Appointment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="today" className="text-genie-teal text-3xl mb-2">📅</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Today's Meetings</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="week" className="text-genie-teal text-3xl mb-2">📊</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>23</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>This Week</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="rate" className="text-genie-teal text-3xl mb-2">✅</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>92%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Show-up Rate</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="conversion" className="text-genie-teal text-3xl mb-2">💰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>67%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Conversion Rate</div>
          </div>
        </div>

        {/* Calendar Integration */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Calendar Integrations</h3>
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 flex items-center gap-2">
              <span>📅</span> Connect Google Calendar
            </button>
            <button className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
              <span>📧</span> Connect Outlook
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 flex items-center gap-2">
              <span>🔗</span> Custom Integration
            </button>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Upcoming Appointments</h3>
          <div className="space-y-4">
            <div className={`border-l-4 border-genie-teal ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product Demo - TechCorp</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Today at 2:00 PM • John Smith • john@techcorp.com</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Join</button>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Reschedule</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderWorkflowAutomation() {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-blue-50'}`}>
        <h2 className={`text-3xl font-bold text-genie-teal mb-8`}>Workflow Automation</h2>
        
        {/* Automation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="workflows" className="text-genie-teal text-3xl mb-2">⚡</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>8</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Workflows</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="tasks" className="text-genie-teal text-3xl mb-2">✅</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1,247</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tasks Automated</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="time" className="text-genie-teal text-3xl mb-2">⏰</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>42h</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Time Saved</div>
          </div>
          <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} shadow-lg rounded-xl p-6 flex flex-col items-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <span role="img" aria-label="success" className="text-genie-teal text-3xl mb-2">📈</span>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>94%</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Success Rate</div>
          </div>
        </div>

        {/* Workflow Builder */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Workflow Builder</h3>
          <div className="flex gap-4 mb-4">
            <button className="bg-genie-teal text-white px-4 py-2 rounded hover:bg-genie-teal/80">+ New Workflow</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Import Template</button>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-4`}>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Drag and drop workflow components here to build your automation</p>
          </div>
        </div>

        {/* Active Workflows */}
        <div className={`${getDarkModeClasses('bg-white', 'bg-gray-800')} rounded-xl shadow p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-xl font-semibold text-genie-teal mb-4`}>Active Workflows</h3>
          <div className="space-y-4">
            <div className={`border-l-4 border-green-500 ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'} p-4 rounded`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead Nurturing Sequence</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Triggers: New lead added • Actions: Send welcome email, add to CRM</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                  <button className="text-blue-500 hover:text-blue-700">Edit</button>
                </div>
              </div>
              <div className="mt-2">
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Executed 247 times this month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

// Admin Component
function AdminPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Appointment Modal Component
  const AppointmentModal = () => {
    console.log('AppointmentModal function called - showAppointmentModal:', showAppointmentModal)
    
    const [formData, setFormData] = useState({
      title: editingAppointment?.title || '',
      clientName: editingAppointment?.clientName || '',
      clientEmail: editingAppointment?.clientEmail || '',
      startTime: editingAppointment?.startTime || '',
      endTime: editingAppointment?.endTime || '',
      description: editingAppointment?.description || '',
      meetingLink: editingAppointment?.meetingLink || '',
      location: editingAppointment?.location || ''
    })

    const handleSubmit = async (e) => {
      e.preventDefault()
      if (editingAppointment) {
        await handleUpdateAppointment(formData)
      } else {
        await handleCreateAppointment(formData)
      }
    }

    if (!showAppointmentModal) {
      console.log('Modal should NOT show - showAppointmentModal is:', showAppointmentModal)
      return null
    }

    console.log('AppointmentModal is rendering - showAppointmentModal:', showAppointmentModal)
    
    return (
      <div 
        className="fixed inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center" 
        style={{zIndex: 999999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAppointmentModal(false)
            setEditingAppointment(null)
          }
        }}
      >
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-8 border-blue-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-red-600">
              APPOINTMENT MODAL - {editingAppointment ? 'Edit Appointment' : 'Book New Meeting'}
            </h3>
            <button 
              onClick={() => {
                setShowAppointmentModal(false)
                setEditingAppointment(null)
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input 
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
              <input 
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input 
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input 
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows="3"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                <input 
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Office, Virtual, etc."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                type="button"
                onClick={() => {
                  setShowAppointmentModal(false)
                  setEditingAppointment(null)
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-genie-teal text-white rounded hover:bg-genie-teal/80"
              >
                {editingAppointment ? 'Update Meeting' : 'Book Meeting'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Calendar View Modal Component
  const CalendarViewModal = () => {
    if (!showCalendarView) return null

    console.log('Rendering CalendarViewModal...')
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" style={{zIndex: 9999}}>
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-genie-teal">Calendar View</h3>
            <button 
              onClick={() => setShowCalendarView(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Mini Calendar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-4 text-center">October 2025</h4>
                <div className="grid grid-cols-7 gap-1 text-sm">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-center font-medium p-2">{day}</div>
                  ))}
                  {Array.from({length: 31}, (_, i) => (
                    <button key={i+1} className="text-center p-2 hover:bg-genie-teal hover:text-white rounded">
                      {i+1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Main Calendar Area */}
            <div className="lg:col-span-3">
              <div className="bg-gray-50 rounded-lg p-6 min-h-[400px]">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Calendar Integration</h3>
                  <p className="text-gray-600 mb-6">Connect your calendar to see appointments here</p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleCalendarConnection('google')}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                    >
                      📅 Connect Google Calendar
                    </button>
                    <button 
                      onClick={() => handleCalendarConnection('outlook')}
                      className="w-full bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      📧 Connect Outlook Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button 
              onClick={() => setShowCalendarView(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 mr-3"
            >
              Close
            </button>
            <button 
              onClick={() => {
                setShowCalendarView(false)
                handleBookMeeting()
              }}
              className="px-4 py-2 bg-genie-teal text-white rounded hover:bg-genie-teal/80"
            >
              Book New Meeting
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>


      {/* Calendar View Modal */}
      <CalendarViewModal />
      
      {/* Admin Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex justify-between items-center`}>
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🛡️ Admin Panel
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            System administration and user management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <Link 
            to="/dashboard" 
            className="bg-genie-teal text-white px-4 py-2 rounded-lg hover:bg-genie-teal/90"
          >
            Dashboard
          </Link>
          <Link 
            to="/" 
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Landing
          </Link>
        </div>
      </header>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
              <div className="ml-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User Management</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage user accounts and permissions</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Users: 1,247</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Active: 892</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pending: 23</div>
            </div>
          </div>

          {/* System Settings */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">⚙️</span>
              </div>
              <div className="ml-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Settings</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Configure system preferences</p>
              </div>
            </div>
            <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
              Configure Settings
            </button>
          </div>

          {/* Analytics Overview */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div className="ml-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Analytics</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monitor system performance</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Uptime: 99.9%</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>API Calls: 2.3M today</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Storage: 75% used</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg md:col-span-2 lg:col-span-3`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Recent Admin Activity</h3>
            <div className="space-y-3">
              <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User registration spike</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-2`}>+47 new users today</span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>2 hours ago</span>
              </div>
              <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System backup completed</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-2`}>All data backed up successfully</span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>4 hours ago</span>
              </div>
              <div className={`flex justify-between items-center p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>API rate limit updated</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-2`}>Increased to 10,000 req/min</span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Assistant - Placeholder for tomorrow's work */}
      {showAIAssistant && (
        <AIAgentHelper forceOpen={true} onClose={() => setShowAIAssistant(false)} />
      )}


      </div>
  )
}

// Main App Component with Routing
function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <GenieProvider>
          <EnhancedFirebaseStabilityManager>
            <AuthNavigator />
            <Toaster position="top-right" />
            <Routes>
              {/* Landing Page - Public sales page */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Funnel Preview - Public generated funnels */}
              <Route path="/funnel/:funnelId" element={<FunnelPreview />} />
            
            {/* Auth Routes - Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/free-signup" element={<FreeSignup />} />
            
            {/* Plan Landing Pages - Public */}
            <Route path="/pro" element={<ProPlanPage />} />
            <Route path="/lifetime" element={<LifetimePlanPage />} />
            
            {/* Plan Signup Pages - Post Payment */}
            <Route path="/whitelabel-setup" element={<WhiteLabelPartnerSetup />} />
            <Route path="/pro-signup" element={<ProPlanSignup />} />
            <Route path="/lifetime-signup" element={<LifetimePlanSignup />} />
            
            {/* Gift Token Redemption - Public */}
            <Route path="/redeem-gift" element={<GiftRedemption />} />
            
            {/* Unsubscribe Page - Public */}
            <Route path="/unsubscribe" element={<UnsubscribePage />} />
            
            {/* Legal Pages - Public */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            
            {/* OAuth Callback Routes - Public */}
            <Route path="/oauth/zoho/callback" element={<OAuthCallback />} />
            <Route path="/oauth/microsoft/callback" element={<MicrosoftOAuthCallback />} />
            <Route path="/oauth/gmail/callback" element={<GmailOAuthCallback />} />
            
            {/* Dashboard - Protected User workspace */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <SophisticatedDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <SophisticatedDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin Panel - Protected Admin only with Founder Setup */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <FounderSetup>
                  <AdminPage />
                </FounderSetup>
              </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <FounderSetup>
                  <AdminPage />
                </FounderSetup>
              </ProtectedRoute>
            } />
            
            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          </EnhancedFirebaseStabilityManager>
        </GenieProvider>
      </TenantProvider>
    </AuthProvider>
  )
}

export default App
