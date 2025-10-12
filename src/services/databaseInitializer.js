import { multiTenantDB } from './multiTenantDatabase.js';
import { auth } from '../firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

/**
 * DATABASE INITIALIZATION SCRIPT
 * 
 * Sets up everything needed for Market Genie to function:
 * - Sample tenant data
 * - Demo deals and contacts
 * - Pipeline stages
 * - User accounts
 */

class DatabaseInitializer {
  constructor() {
    this.demoTenantId = 'demo_tenant_001';
    this.adminEmail = 'dubdproducts@gmail.com';
  }

  /**
   * Initialize complete database structure
   */
  async initializeDatabase() {
    try {
      console.log('🚀 Starting Market Genie database initialization...');

      // Step 1: Create demo tenant
      await this.createDemoTenant();

      // Step 2: Create sample pipeline
      await this.createSamplePipeline();

      // Step 3: Create sample deals
      await this.createSampleDeals();

      // Step 4: Create sample contacts
      await this.createSampleContacts();

      // Step 5: Create sample campaigns
      await this.createSampleCampaigns();

      // Step 6: Create sample activities
      await this.createSampleActivities();

      console.log('✅ Database initialization complete!');
      return true;

    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create demo tenant
   */
  async createDemoTenant() {
    console.log('📊 Creating demo tenant...');

    const tenantData = {
      name: 'Market Genie Demo',
      domain: 'marketgenie.demo',
      ownerId: 'demo_user',
      ownerEmail: this.adminEmail,
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        businessHours: {
          start: '09:00',
          end: '17:00',
          timezone: 'America/New_York'
        }
      },
      subscription: {
        plan: 'enterprise',
        status: 'active',
        features: ['crm', 'automation', 'analytics', 'integrations']
      }
    };

    await multiTenantDB.initializeTenant(this.demoTenantId, tenantData);
    console.log('✅ Demo tenant created');
  }

  /**
   * Create sample pipeline
   */
  async createSamplePipeline() {
    console.log('🔄 Creating sample pipeline...');

    const pipelineData = {
      name: 'Sales Pipeline',
      description: 'Main sales process for Market Genie',
      stages: [
        { 
          id: 'lead', 
          name: 'Lead', 
          color: '#3B82F6', 
          order: 1,
          description: 'Initial interest shown'
        },
        { 
          id: 'qualified', 
          name: 'Qualified', 
          color: '#8B5CF6', 
          order: 2,
          description: 'Budget and need confirmed'
        },
        { 
          id: 'demo', 
          name: 'Demo Scheduled', 
          color: '#06B6D4', 
          order: 3,
          description: 'Product demonstration booked'
        },
        { 
          id: 'proposal', 
          name: 'Proposal', 
          color: '#F59E0B', 
          order: 4,
          description: 'Formal proposal sent'
        },
        { 
          id: 'negotiation', 
          name: 'Negotiation', 
          color: '#EF4444', 
          order: 5,
          description: 'Terms being discussed'
        },
        { 
          id: 'closed-won', 
          name: 'Closed Won', 
          color: '#10B981', 
          order: 6,
          description: 'Deal successfully closed'
        },
        { 
          id: 'closed-lost', 
          name: 'Closed Lost', 
          color: '#6B7280', 
          order: 7,
          description: 'Deal lost to competitor or no decision'
        }
      ],
      isDefault: true,
      isActive: true
    };

    await multiTenantDB.createDocument('pipelines', pipelineData, this.demoTenantId);
    console.log('✅ Sample pipeline created');
  }

  /**
   * Create sample deals
   */
  async createSampleDeals() {
    console.log('💰 Creating sample deals...');

    const sampleDeals = [
      {
        title: 'Acme Corp - CRM Implementation',
        value: 25000,
        stage: 'qualified',
        contactId: 'contact_001',
        description: 'Full CRM system implementation for 50-person sales team',
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        probability: 75,
        source: 'Website Inquiry',
        assignedTo: 'demo_user',
        tags: ['enterprise', 'crm', 'high-value']
      },
      {
        title: 'TechStart Inc - Sales Automation',
        value: 15000,
        stage: 'demo',
        contactId: 'contact_002',
        description: 'Sales automation and lead nurturing system',
        expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        probability: 60,
        source: 'LinkedIn Outreach',
        assignedTo: 'demo_user',
        tags: ['automation', 'startup', 'mid-market']
      },
      {
        title: 'Global Manufacturing - Enterprise CRM',
        value: 75000,
        stage: 'proposal',
        contactId: 'contact_003',
        description: 'Multi-location CRM with custom integrations',
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        probability: 80,
        source: 'Partner Referral',
        assignedTo: 'demo_user',
        tags: ['enterprise', 'manufacturing', 'integrations']
      },
      {
        title: 'Local Services Co - Basic CRM',
        value: 5000,
        stage: 'lead',
        contactId: 'contact_004',
        description: 'Basic CRM setup for local service business',
        expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days
        probability: 40,
        source: 'Google Ads',
        assignedTo: 'demo_user',
        tags: ['small-business', 'basic-plan']
      },
      {
        title: 'E-commerce Platform - Integration',
        value: 35000,
        stage: 'negotiation',
        contactId: 'contact_005',
        description: 'E-commerce CRM integration with custom workflows',
        expectedCloseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        probability: 85,
        source: 'Existing Customer',
        assignedTo: 'demo_user',
        tags: ['e-commerce', 'integration', 'upsell']
      }
    ];

    for (const deal of sampleDeals) {
      await multiTenantDB.createDeal(deal, this.demoTenantId);
    }

    console.log(`✅ Created ${sampleDeals.length} sample deals`);
  }

  /**
   * Create sample contacts
   */
  async createSampleContacts() {
    console.log('👥 Creating sample contacts...');

    const sampleContacts = [
      {
        id: 'contact_001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@acmecorp.com',
        phone: '+1-555-0123',
        company: 'Acme Corp',
        title: 'VP of Sales',
        industry: 'Technology',
        source: 'Website Form',
        status: 'active',
        tags: ['decision-maker', 'enterprise'],
        notes: 'Very interested in automation features. Budget approved.',
        socialProfiles: {
          linkedin: 'https://linkedin.com/in/johnsmith'
        }
      },
      {
        id: 'contact_002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@techstart.io',
        phone: '+1-555-0456',
        company: 'TechStart Inc',
        title: 'Founder & CEO',
        industry: 'SaaS',
        source: 'LinkedIn',
        status: 'active',
        tags: ['founder', 'startup'],
        notes: 'Fast-growing startup, needs scalable solution.',
        socialProfiles: {
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          twitter: '@sarahj_ceo'
        }
      },
      {
        id: 'contact_003',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'm.brown@globalmanufacturing.com',
        phone: '+1-555-0789',
        company: 'Global Manufacturing Ltd',
        title: 'CTO',
        industry: 'Manufacturing',
        source: 'Partner Referral',
        status: 'active',
        tags: ['technical', 'enterprise', 'integration-needs'],
        notes: 'Complex requirements, multiple locations, existing ERP system.',
        socialProfiles: {
          linkedin: 'https://linkedin.com/in/michaelbrown-cto'
        }
      },
      {
        id: 'contact_004',
        firstName: 'Lisa',
        lastName: 'Davis',
        email: 'lisa@localservices.com',
        phone: '+1-555-0321',
        company: 'Local Services Co',
        title: 'Owner',
        industry: 'Services',
        source: 'Google Ads',
        status: 'prospect',
        tags: ['small-business', 'owner'],
        notes: 'Looking for simple, affordable solution.',
        socialProfiles: {}
      },
      {
        id: 'contact_005',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david@ecommerceplatform.com',
        phone: '+1-555-0654',
        company: 'E-commerce Platform Inc',
        title: 'Head of Operations',
        industry: 'E-commerce',
        source: 'Existing Customer',
        status: 'customer',
        tags: ['existing-customer', 'upsell-opportunity'],
        notes: 'Current customer looking to expand usage.',
        socialProfiles: {
          linkedin: 'https://linkedin.com/in/davidwilson-ops'
        }
      }
    ];

    for (const contact of sampleContacts) {
      await multiTenantDB.createContact(contact, this.demoTenantId);
    }

    console.log(`✅ Created ${sampleContacts.length} sample contacts`);
  }

  /**
   * Create sample campaigns
   */
  async createSampleCampaigns() {
    console.log('📧 Creating sample campaigns...');

    const sampleCampaigns = [
      {
        name: 'Q4 Enterprise Outreach',
        type: 'email',
        status: 'active',
        description: 'Targeting enterprise prospects for Q4 sales push',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        budget: 10000,
        targetAudience: 'Enterprise decision makers',
        goals: ['lead generation', 'demo bookings'],
        metrics: {
          sent: 1250,
          opened: 425,
          clicked: 87,
          replied: 23,
          booked: 8
        }
      },
      {
        name: 'Startup Growth Series',
        type: 'content',
        status: 'active',
        description: 'Educational content series for growing startups',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Started 30 days ago
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        budget: 5000,
        targetAudience: 'Startup founders and sales leaders',
        goals: ['brand awareness', 'lead nurturing'],
        metrics: {
          views: 5420,
          downloads: 234,
          signups: 67,
          demos: 12
        }
      }
    ];

    for (const campaign of sampleCampaigns) {
      await multiTenantDB.createCampaign(campaign, this.demoTenantId);
    }

    console.log(`✅ Created ${sampleCampaigns.length} sample campaigns`);
  }

  /**
   * Create sample activities
   */
  async createSampleActivities() {
    console.log('📋 Creating sample activities...');

    const sampleActivities = [
      {
        type: 'call',
        subject: 'Discovery call with Acme Corp',
        description: 'Initial discovery call to understand requirements',
        contactId: 'contact_001',
        dealId: 'deal_001',
        userId: 'demo_user',
        status: 'completed',
        scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: 'Great call! They are very interested in our automation features.'
      },
      {
        type: 'email',
        subject: 'Follow-up with proposal',
        description: 'Sent detailed proposal and pricing information',
        contactId: 'contact_003',
        dealId: 'deal_003',
        userId: 'demo_user',
        status: 'completed',
        scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notes: 'Proposal sent via email. Awaiting response.'
      },
      {
        type: 'meeting',
        subject: 'Product demo for TechStart',
        description: 'Live product demonstration',
        contactId: 'contact_002',
        dealId: 'deal_002',
        userId: 'demo_user',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        notes: 'Demo scheduled for Friday 2 PM EST'
      }
    ];

    for (const activity of sampleActivities) {
      await multiTenantDB.logActivity(activity, this.demoTenantId);
    }

    console.log(`✅ Created ${sampleActivities.length} sample activities`);
  }

  /**
   * Run initialization if called directly
   */
  static async run() {
    const initializer = new DatabaseInitializer();
    return await initializer.initializeDatabase();
  }
}

export default DatabaseInitializer;