import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

// You'll need to get these from your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyDRdYaXJkJNZIkMzKM4cZEFTADOJJhDiEs",
  authDomain: "market-genie-f2d41.firebaseapp.com", 
  projectId: "market-genie-f2d41",
  storageBucket: "market-genie-f2d41.firebasestorage.app",
  messagingSenderId: "1023666208479",
  appId: "1:1023666208479:web:7cf3c7b4db4b24cfb02e6c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

class DatabaseInitializer {
  constructor() {
    this.founderEmail = 'dubdproducts@gmail.com';
    this.founderTenantId = 'founder-tenant';
  }

  async initializeCompleteDatabase() {
    try {
      console.log('🚀 Starting complete database initialization...');

      // Sign in as founder (you should already be signed in)
      console.log('📧 Verifying founder authentication...');
      
      // Get current user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found. Please sign in first.');
      }
      
      console.log('✅ Authenticated as:', currentUser.email);

      // Initialize all collections with batch writes for efficiency
      const batch = writeBatch(db);
      
      // 1. Create/Update Tenants Collection
      await this.setupTenants(batch, currentUser.uid);
      
      // 2. Create/Update Users Collection  
      await this.setupUsers(batch, currentUser.uid);
      
      // 3. Create Deals Collection with sample data
      await this.setupDeals(batch);
      
      // 4. Create Contacts Collection with sample data
      await this.setupContacts(batch);
      
      // 5. Create Companies Collection
      await this.setupCompanies(batch);
      
      // 6. Create Campaigns Collection
      await this.setupCampaigns(batch);
      
      // 7. Create Analytics Collection
      await this.setupAnalytics(batch);
      
      // 8. Create Workflows Collection
      await this.setupWorkflows(batch);
      
      // 9. Create Settings Collection
      await this.setupSettings(batch);

      // Commit all batch operations
      console.log('💾 Committing batch operations to database...');
      await batch.commit();
      
      // 10. Create additional sample data that requires individual operations
      await this.createAdditionalSampleData(currentUser.uid);

      console.log(`
      🎉 DATABASE INITIALIZATION COMPLETE!
      
      ✅ Collections Created:
      - tenants (with founder tenant)
      - users (with your founder account)
      - deals (with sample deals)
      - contacts (with sample contacts)
      - companies (with sample companies)
      - campaigns (with sample campaigns)
      - analytics (with sample data)
      - workflows (with automation templates)
      - settings (with system settings)
      
      🔐 Your Access:
      - Email: ${this.founderEmail}
      - Role: Super Admin
      - Tenant: ${this.founderTenantId}
      - Permissions: Full system access
      
      🚀 Your Market Genie CRM is ready to use!
      `);

      return { success: true };

    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      return { success: false, error };
    }
  }

  async setupTenants(batch, userId) {
    console.log('🏢 Setting up tenants collection...');
    
    const tenantRef = doc(db, 'tenants', this.founderTenantId);
    batch.set(tenantRef, {
      id: this.founderTenantId,
      name: 'Market Genie - Founder Account',
      domain: 'marketgenie.com',
      ownerId: userId,
      plan: 'enterprise',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        maxUsers: 1000,
        maxDeals: 50000,
        maxContacts: 100000,
        featuresEnabled: {
          crm: true,
          automation: true,
          analytics: true,
          integrations: true,
          aiFeatures: true,
          socialMedia: true,
          emailMarketing: true,
          voiceControl: true
        }
      },
      billing: {
        plan: 'enterprise',
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      customization: {
        brandColor: '#3B82F6',
        logo: '',
        theme: 'modern'
      }
    }, { merge: true });
  }

  async setupUsers(batch, userId) {
    console.log('👤 Setting up users collection...');
    
    const userRef = doc(db, 'users', userId);
    batch.set(userRef, {
      uid: userId,
      email: this.founderEmail,
      displayName: 'Founder - Market Genie',
      role: 'super-admin',
      tenantId: this.founderTenantId,
      isSuperAdmin: true,
      isFounder: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      permissions: {
        canAccessAllTenants: true,
        canManageUsers: true,
        canManageSettings: true,
        canViewAnalytics: true,
        canManageBilling: true,
        canManageIntegrations: true,
        canExportData: true,
        canDeleteData: true
      },
      profile: {
        firstName: 'Founder',
        lastName: 'Admin',
        company: 'Market Genie',
        phone: '',
        avatar: '',
        timezone: 'America/New_York',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    }, { merge: true });
  }

  async setupDeals(batch) {
    console.log('💰 Setting up deals collection...');
    
    const sampleDeals = [
      {
        tenantId: this.founderTenantId,
        title: 'Enterprise SaaS Implementation',
        value: 50000,
        stage: 'negotiation',
        probability: 75,
        contactId: 'contact_1',
        companyId: 'company_1',
        assignedTo: 'founder',
        expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notes: 'Large enterprise client interested in full CRM implementation',
        source: 'referral'
      },
      {
        tenantId: this.founderTenantId,
        title: 'Marketing Automation Setup',
        value: 15000,
        stage: 'proposal',
        probability: 50,
        contactId: 'contact_2',
        companyId: 'company_2',
        assignedTo: 'founder',
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notes: 'Mid-size company needs marketing automation',
        source: 'website'
      },
      {
        tenantId: this.founderTenantId,
        title: 'CRM Migration Project',
        value: 25000,
        stage: 'qualified',
        probability: 25,
        contactId: 'contact_3',
        companyId: 'company_3',
        assignedTo: 'founder',
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notes: 'Looking to migrate from legacy CRM system',
        source: 'cold_outreach'
      }
    ];

    sampleDeals.forEach((deal, index) => {
      const dealRef = doc(collection(db, 'deals'));
      batch.set(dealRef, deal);
    });
  }

  async setupContacts(batch) {
    console.log('📞 Setting up contacts collection...');
    
    const sampleContacts = [
      {
        tenantId: this.founderTenantId,
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1-555-0123',
        company: 'TechCorp Solutions',
        position: 'CTO',
        status: 'hot',
        source: 'referral',
        tags: ['enterprise', 'decision-maker'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        socialProfiles: {
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          twitter: '@sarahtech'
        },
        notes: 'Very interested in enterprise solutions'
      },
      {
        tenantId: this.founderTenantId,
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'mchen@growthstartup.io',
        phone: '+1-555-0124',
        company: 'Growth Startup',
        position: 'Marketing Director',
        status: 'warm',
        source: 'website',
        tags: ['startup', 'marketing'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        socialProfiles: {
          linkedin: 'https://linkedin.com/in/michaelchen',
          twitter: '@mchen_growth'
        },
        notes: 'Looking for marketing automation tools'
      },
      {
        tenantId: this.founderTenantId,
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily@legacyinc.com',
        phone: '+1-555-0125',
        company: 'Legacy Inc',
        position: 'Operations Manager',
        status: 'cold',
        source: 'cold_outreach',
        tags: ['legacy-system', 'operations'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        socialProfiles: {
          linkedin: 'https://linkedin.com/in/emilyrodriguez'
        },
        notes: 'Needs to modernize current systems'
      }
    ];

    sampleContacts.forEach((contact, index) => {
      const contactRef = doc(collection(db, 'contacts'));
      batch.set(contactRef, contact);
    });
  }

  async setupCompanies(batch) {
    console.log('🏢 Setting up companies collection...');
    
    const sampleCompanies = [
      {
        tenantId: this.founderTenantId,
        name: 'TechCorp Solutions',
        industry: 'Technology',
        size: 'Enterprise',
        employees: 5000,
        revenue: 50000000,
        website: 'https://techcorp.com',
        address: {
          street: '123 Tech Avenue',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          country: 'USA'
        },
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        tenantId: this.founderTenantId,
        name: 'Growth Startup',
        industry: 'Marketing',
        size: 'Small',
        employees: 25,
        revenue: 2000000,
        website: 'https://growthstartup.io',
        address: {
          street: '456 Startup Street',
          city: 'Austin',
          state: 'TX',
          zip: '78701',
          country: 'USA'
        },
        status: 'prospect',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    sampleCompanies.forEach((company, index) => {
      const companyRef = doc(collection(db, 'companies'));
      batch.set(companyRef, company);
    });
  }

  async setupCampaigns(batch) {
    console.log('📧 Setting up campaigns collection...');
    
    const sampleCampaigns = [
      {
        tenantId: this.founderTenantId,
        name: 'Enterprise Outreach Q4 2025',
        type: 'email',
        status: 'active',
        targetAudience: 'enterprise',
        startDate: serverTimestamp(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        metrics: {
          sent: 1250,
          opened: 375,
          clicked: 89,
          converted: 12
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    sampleCampaigns.forEach((campaign, index) => {
      const campaignRef = doc(collection(db, 'campaigns'));
      batch.set(campaignRef, campaign);
    });
  }

  async setupAnalytics(batch) {
    console.log('📊 Setting up analytics collection...');
    
    const analyticsRef = doc(db, 'analytics', `${this.founderTenantId}_dashboard`);
    batch.set(analyticsRef, {
      tenantId: this.founderTenantId,
      period: 'current_month',
      metrics: {
        totalDeals: 3,
        totalContacts: 3,
        totalRevenue: 90000,
        conversionRate: 8.5,
        averageDealSize: 30000
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async setupWorkflows(batch) {
    console.log('⚡ Setting up workflows collection...');
    
    const workflowRef = doc(collection(db, 'workflows'));
    batch.set(workflowRef, {
      tenantId: this.founderTenantId,
      name: 'New Lead Follow-up',
      trigger: 'contact_created',
      status: 'active',
      steps: [
        {
          type: 'email',
          delay: 0,
          template: 'welcome_email'
        },
        {
          type: 'wait',
          delay: 1440 // 24 hours in minutes
        },
        {
          type: 'email',
          delay: 0,
          template: 'follow_up_email'
        }
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async setupSettings(batch) {
    console.log('⚙️ Setting up settings collection...');
    
    const settingsRef = doc(db, 'settings', this.founderTenantId);
    batch.set(settingsRef, {
      tenantId: this.founderTenantId,
      general: {
        companyName: 'Market Genie',
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY'
      },
      crm: {
        dealStages: ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
        contactStatuses: ['cold', 'warm', 'hot', 'customer'],
        leadSources: ['website', 'referral', 'cold_outreach', 'social_media', 'advertising']
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false
      },
      integrations: {
        email: {
          enabled: false,
          provider: null
        },
        calendar: {
          enabled: false,
          provider: null
        }
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async createAdditionalSampleData(userId) {
    console.log('📝 Creating additional sample data...');
    
    // Create sample tasks
    await addDoc(collection(db, 'tasks'), {
      tenantId: this.founderTenantId,
      title: 'Follow up with TechCorp Solutions',
      description: 'Schedule demo call for next week',
      assignedTo: userId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'pending',
      priority: 'high',
      relatedTo: {
        type: 'deal',
        id: 'deal_1'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Create sample notes
    await addDoc(collection(db, 'notes'), {
      tenantId: this.founderTenantId,
      title: 'Discovery Call - TechCorp',
      content: 'Client is very interested in our enterprise package. They have 5000+ employees and need full CRM integration.',
      author: userId,
      relatedTo: {
        type: 'contact',
        id: 'contact_1'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

// Initialize the database
const initializer = new DatabaseInitializer();
initializer.initializeCompleteDatabase()
  .then(result => {
    if (result.success) {
      console.log('🎉 Database initialization completed successfully!');
      process.exit(0);
    } else {
      console.error('❌ Database initialization failed:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Fatal error during initialization:', error);
    process.exit(1);
  });