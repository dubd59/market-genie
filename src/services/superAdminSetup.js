import { multiTenantDB } from './multiTenantDatabase.js';
import { auth, db } from '../firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * SUPER ADMIN & FOUNDER ACCOUNT SETUP
 * 
 * This script sets up the founder account with:
 * - Super admin privileges
 * - Master tenant access
 * - Full system control
 * - Sample data for demonstrations
 */

class SuperAdminSetup {
  constructor() {
    // Founder account details
    this.founderEmail = 'dubdproducts@gmail.com';
    this.founderTenantId = 'founder_master_tenant';
    this.demoTenantId = 'demo_showcase_tenant';
  }

  /**
   * Initialize the complete super admin system
   */
  async initializeSuperAdmin() {
    try {
      console.log('🔥 Initializing Super Admin & Founder Account System...');

      // Step 1: Create founder tenant (master tenant)
      await this.createFounderTenant();

      // Step 2: Create demo tenant for showcasing
      await this.createDemoTenant();

      // Step 3: Set up super admin user record
      await this.setupSuperAdminUser();

      // Step 4: Create sample data in both tenants
      await this.createFounderSampleData();
      await this.createDemoSampleData();

      console.log('✅ Super Admin system initialization complete!');
      return {
        success: true,
        founderTenantId: this.founderTenantId,
        demoTenantId: this.demoTenantId,
        founderEmail: this.founderEmail
      };

    } catch (error) {
      console.error('❌ Super Admin initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create the founder's master tenant
   */
  async createFounderTenant() {
    console.log('👑 Creating Founder Master Tenant...');

    const founderTenantData = {
      name: 'Market Genie - Founder Account',
      domain: 'marketgenie.com',
      type: 'master',
      ownerId: 'founder',
      ownerEmail: this.founderEmail,
      isFounderAccount: true,
      isMasterTenant: true,
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        businessHours: {
          start: '09:00',
          end: '17:00',
          timezone: 'America/New_York'
        },
        features: {
          allFeatures: true,
          adminPanel: true,
          systemAccess: true,
          tenantManagement: true
        }
      },
      subscription: {
        plan: 'founder',
        status: 'lifetime',
        features: ['all'],
        limits: {
          users: 'unlimited',
          deals: 'unlimited',
          contacts: 'unlimited',
          campaigns: 'unlimited'
        }
      },
      permissions: {
        superAdmin: true,
        systemAccess: true,
        tenantAccess: 'all',
        dataAccess: 'full'
      }
    };

    await multiTenantDB.initializeTenant(this.founderTenantId, founderTenantData);
    console.log('✅ Founder Master Tenant created');
  }

  /**
   * Create demo tenant for showcasing to prospects
   */
  async createDemoTenant() {
    console.log('🎭 Creating Demo Showcase Tenant...');

    const demoTenantData = {
      name: 'Market Genie - Demo Showcase',
      domain: 'demo.marketgenie.com',
      type: 'demo',
      ownerId: 'founder',
      ownerEmail: this.founderEmail,
      isDemoAccount: true,
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
        plan: 'enterprise_demo',
        status: 'active',
        features: ['crm', 'automation', 'analytics', 'integrations', 'ai_assistant']
      }
    };

    await multiTenantDB.initializeTenant(this.demoTenantId, demoTenantData);
    console.log('✅ Demo Showcase Tenant created');
  }

  /**
   * Set up super admin user record
   */
  async setupSuperAdminUser() {
    console.log('👤 Setting up Super Admin User Record...');

    // Create user record in Firestore with super admin privileges
    const superAdminUser = {
      email: this.founderEmail,
      role: 'super_admin',
      isFounder: true,
      isSuperAdmin: true,
      tenantAccess: [this.founderTenantId, this.demoTenantId],
      primaryTenantId: this.founderTenantId,
      permissions: {
        systemAccess: true,
        tenantManagement: true,
        userManagement: true,
        billingAccess: true,
        analyticsAccess: true,
        supportAccess: true
      },
      profile: {
        firstName: 'David',
        lastName: 'Founder',
        title: 'Founder & CEO',
        company: 'Market Genie',
        phone: '',
        avatar: null
      },
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: 'active'
    };

    // Create user document (will be associated when you first sign in)
    await setDoc(doc(db, 'users', 'founder_user'), {
      ...superAdminUser,
      tenantId: this.founderTenantId
    });

    console.log('✅ Super Admin user record created');
  }

  /**
   * Create sample data for founder tenant
   */
  async createFounderSampleData() {
    console.log('📊 Creating Founder Sample Data...');

    // Create pipeline for founder
    const founderPipeline = {
      name: 'Market Genie Sales Pipeline',
      description: 'Main sales process for Market Genie customers',
      stages: [
        { id: 'lead', name: 'Lead', color: '#3B82F6', order: 1 },
        { id: 'qualified', name: 'Qualified', color: '#8B5CF6', order: 2 },
        { id: 'demo', name: 'Demo Scheduled', color: '#06B6D4', order: 3 },
        { id: 'proposal', name: 'Proposal Sent', color: '#F59E0B', order: 4 },
        { id: 'negotiation', name: 'Negotiation', color: '#EF4444', order: 5 },
        { id: 'closed-won', name: 'Closed Won', color: '#10B981', order: 6 },
        { id: 'closed-lost', name: 'Closed Lost', color: '#6B7280', order: 7 }
      ],
      isDefault: true,
      isActive: true
    };

    await multiTenantDB.createDocument('pipelines', founderPipeline, this.founderTenantId);

    // Create sample deals for founder
    const founderDeals = [
      {
        title: 'Enterprise Client - Full CRM Implementation',
        value: 50000,
        stage: 'qualified',
        description: 'Large enterprise looking for complete CRM solution',
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        probability: 80,
        source: 'Referral',
        tags: ['enterprise', 'high-value', 'priority']
      },
      {
        title: 'SaaS Startup - Growth Package',
        value: 25000,
        stage: 'demo',
        description: 'Fast-growing SaaS company needs scalable CRM',
        expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        probability: 70,
        source: 'Website',
        tags: ['saas', 'growth', 'automation']
      }
    ];

    for (const deal of founderDeals) {
      await multiTenantDB.createDeal(deal, this.founderTenantId);
    }

    console.log('✅ Founder sample data created');
  }

  /**
   * Create demo data for showcase tenant
   */
  async createDemoSampleData() {
    console.log('🎪 Creating Demo Showcase Data...');

    // Create realistic demo pipeline
    const demoPipeline = {
      name: 'Demo Sales Pipeline',
      description: 'Showcase pipeline with realistic data',
      stages: [
        { id: 'lead', name: 'New Lead', color: '#3B82F6', order: 1 },
        { id: 'contacted', name: 'First Contact', color: '#8B5CF6', order: 2 },
        { id: 'qualified', name: 'Qualified', color: '#06B6D4', order: 3 },
        { id: 'proposal', name: 'Proposal', color: '#F59E0B', order: 4 },
        { id: 'negotiation', name: 'Negotiation', color: '#EF4444', order: 5 },
        { id: 'won', name: 'Won', color: '#10B981', order: 6 },
        { id: 'lost', name: 'Lost', color: '#6B7280', order: 7 }
      ],
      isDefault: true,
      isActive: true
    };

    await multiTenantDB.createDocument('pipelines', demoPipeline, this.demoTenantId);

    // Create impressive demo deals
    const demoDeals = [
      {
        title: 'TechCorp Global - Enterprise CRM',
        value: 125000,
        stage: 'negotiation',
        description: 'Multi-national corporation CRM implementation',
        expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        probability: 90,
        source: 'Partner Referral',
        tags: ['enterprise', 'multinational', 'high-priority']
      },
      {
        title: 'InnovateNow Inc - AI Integration',
        value: 75000,
        stage: 'proposal',
        description: 'AI-powered CRM with custom integrations',
        expectedCloseDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        probability: 85,
        source: 'LinkedIn Outreach',
        tags: ['ai', 'integration', 'custom']
      },
      {
        title: 'FastGrow Startup - Scale Package',
        value: 35000,
        stage: 'qualified',
        description: 'Rapidly scaling startup needs robust CRM',
        expectedCloseDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        probability: 75,
        source: 'Website Demo',
        tags: ['startup', 'scaling', 'growth']
      },
      {
        title: 'LocalBiz Chain - Multi-Location CRM',
        value: 45000,
        stage: 'contacted',
        description: 'Chain business with multiple locations',
        expectedCloseDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        probability: 60,
        source: 'Cold Outreach',
        tags: ['multi-location', 'chain', 'local']
      }
    ];

    for (const deal of demoDeals) {
      await multiTenantDB.createDeal(deal, this.demoTenantId);
    }

    // Create demo contacts
    const demoContacts = [
      {
        firstName: 'Sarah',
        lastName: 'Mitchell',
        email: 'sarah.mitchell@techcorp.com',
        phone: '+1-555-0123',
        company: 'TechCorp Global',
        title: 'VP of Sales Operations',
        industry: 'Technology',
        source: 'Partner Referral',
        status: 'hot',
        tags: ['decision-maker', 'enterprise']
      },
      {
        firstName: 'James',
        lastName: 'Rodriguez',
        email: 'james@innovatenow.io',
        phone: '+1-555-0456',
        company: 'InnovateNow Inc',
        title: 'CTO',
        industry: 'AI/ML',
        source: 'LinkedIn',
        status: 'warm',
        tags: ['technical', 'ai-focused']
      }
    ];

    for (const contact of demoContacts) {
      await multiTenantDB.createContact(contact, this.demoTenantId);
    }

    console.log('✅ Demo showcase data created');
  }

  /**
   * Run the complete super admin setup
   */
  static async initialize() {
    const setup = new SuperAdminSetup();
    return await setup.initializeSuperAdmin();
  }
}

export default SuperAdminSetup;