// Create collections using Firebase Admin SDK
// This script has full administrative access and bypasses Firestore security rules
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
try {
  const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'market-genie-f2d41'
  });
  
  console.log('✅ Firebase Admin initialized successfully!');
} catch (error) {
  console.log('❌ Error loading service account key:', error.message);
  console.log('\n📝 To fix this:');
  console.log('1. Download your service account key from Firebase Console');
  console.log('2. Save it as service-account-key.json in the project root');
  console.log('3. Run this script again');
  process.exit(1);
}

const db = admin.firestore();

async function createCollections() {
  console.log('🚀 Creating all database collections...');

  try {
    // 1. Create Tenants Collection
    console.log('📁 Creating tenants collection...');
    await db.collection('tenants').doc('founder-tenant').set({
      id: "founder-tenant",
      name: "Market Genie - Founder Account",
      domain: "marketgenie.com",
      plan: "enterprise",
      status: "active",
      ownerId: "founder-user-id",
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
        plan: "enterprise",
        status: "active",
        subscriptionId: "sub_enterprise_001"
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 2. Create Deals Collection
    console.log('💰 Creating deals collection...');
    const deals = [
      {
        id: "deal_001",
        tenantId: "founder-tenant",
        title: "Enterprise SaaS Implementation - TechCorp",
        description: "Complete CRM implementation for 5000+ employee enterprise client",
        value: 75000,
        currency: "USD",
        stage: "negotiation",
        probability: 80,
        priority: "high",
        contactId: "contact_001",
        companyId: "company_001",
        assignedTo: "founder-user-id",
        expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        source: "referral",
        tags: ["enterprise", "high-value", "strategic"],
        customFields: {
          implementationTimeline: "6 months",
          technicalComplexity: "high",
          decisionMakers: 3
        },
        activities: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: "deal_002",
        tenantId: "founder-tenant",
        title: "Marketing Automation Package - Growth Startup",
        description: "Marketing automation and lead nurturing setup",
        value: 25000,
        currency: "USD",
        stage: "proposal",
        probability: 60,
        priority: "medium",
        contactId: "contact_002",
        companyId: "company_002",
        assignedTo: "founder-user-id",
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        source: "website",
        tags: ["marketing", "automation", "startup"],
        customFields: {
          campaignGoals: "Lead generation",
          monthlyVolume: "10000 contacts"
        },
        activities: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: "deal_003",
        tenantId: "founder-tenant",
        title: "CRM Migration - Legacy Systems Inc",
        description: "Migrate from Salesforce to Market Genie platform",
        value: 45000,
        currency: "USD",
        stage: "qualified",
        probability: 40,
        priority: "medium",
        contactId: "contact_003",
        companyId: "company_003",
        assignedTo: "founder-user-id",
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        source: "cold_outreach",
        tags: ["migration", "salesforce", "legacy"],
        customFields: {
          currentSystem: "Salesforce",
          dataVolume: "50000 records",
          migrationComplexity: "high"
        },
        activities: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const deal of deals) {
      await db.collection('deals').doc(deal.id).set(deal);
    }

    // 3. Create Contacts Collection
    console.log('👤 Creating contacts collection...');
    const contacts = [
      {
        id: "contact_001",
        tenantId: "founder-tenant",
        firstName: "Sarah",
        lastName: "Johnson",
        fullName: "Sarah Johnson",
        email: "sarah.johnson@techcorp.com",
        phone: "+1-555-0123",
        mobile: "+1-555-0123",
        companyId: "company_001",
        company: "TechCorp Solutions",
        position: "Chief Technology Officer",
        department: "Technology",
        status: "hot",
        leadScore: 95,
        source: "referral",
        tags: ["enterprise", "decision-maker", "technical"],
        address: {
          street: "123 Tech Avenue",
          city: "San Francisco",
          state: "CA",
          zip: "94102",
          country: "USA"
        },
        socialProfiles: {
          linkedin: "https://linkedin.com/in/sarahjohnson",
          twitter: "@sarahtech",
          github: "sarahj-tech"
        },
        customFields: {
          budget: "$50000-100000",
          decisionAuthority: "Final approver",
          technicalExpertise: "High"
        },
        notes: "Very interested in enterprise solutions. Has budget approval authority. Technical background helps with complex implementations.",
        lastContactDate: admin.firestore.FieldValue.serverTimestamp(),
        nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: "contact_002",
        tenantId: "founder-tenant",
        firstName: "Michael",
        lastName: "Chen",
        fullName: "Michael Chen",
        email: "mchen@growthstartup.io",
        phone: "+1-555-0124",
        mobile: "+1-555-0124",
        companyId: "company_002",
        company: "Growth Startup",
        position: "Marketing Director",
        department: "Marketing",
        status: "warm",
        leadScore: 75,
        source: "website",
        tags: ["startup", "marketing", "growth"],
        address: {
          street: "456 Startup Street",
          city: "Austin",
          state: "TX",
          zip: "78701",
          country: "USA"
        },
        socialProfiles: {
          linkedin: "https://linkedin.com/in/michaelchen",
          twitter: "@mchen_growth"
        },
        customFields: {
          budget: "$10000-50000",
          growthStage: "Series A",
          marketingChannels: "Digital, Social"
        },
        notes: "Looking for marketing automation tools. Fast-growing startup with good funding.",
        lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        nextFollowUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: "contact_003",
        tenantId: "founder-tenant",
        firstName: "Emily",
        lastName: "Rodriguez",
        fullName: "Emily Rodriguez",
        email: "emily@legacyinc.com",
        phone: "+1-555-0125",
        mobile: "+1-555-0125",
        companyId: "company_003",
        company: "Legacy Inc",
        position: "Operations Manager",
        department: "Operations",
        status: "cold",
        leadScore: 45,
        source: "cold_outreach",
        tags: ["legacy-system", "operations", "enterprise"],
        address: {
          street: "789 Corporate Blvd",
          city: "Chicago",
          state: "IL",
          zip: "60601",
          country: "USA"
        },
        socialProfiles: {
          linkedin: "https://linkedin.com/in/emilyrodriguez"
        },
        customFields: {
          currentCRM: "Salesforce",
          painPoints: "Data silos, poor reporting",
          timeline: "6-12 months"
        },
        notes: "Needs to modernize current systems. Large organization with complex requirements.",
        lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextFollowUpDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const contact of contacts) {
      await db.collection('contacts').doc(contact.id).set(contact);
    }

    // 4. Create Companies Collection
    console.log('🏢 Creating companies collection...');
    const companies = [
      {
        id: "company_001",
        tenantId: "founder-tenant",
        name: "TechCorp Solutions",
        domain: "techcorp.com",
        industry: "Technology",
        type: "Enterprise",
        size: "Large",
        employees: 5000,
        revenue: 500000000,
        website: "https://techcorp.com",
        description: "Leading enterprise technology solutions provider",
        address: {
          street: "123 Tech Avenue",
          city: "San Francisco",
          state: "CA",
          zip: "94102",
          country: "USA"
        },
        status: "active_prospect",
        tier: "enterprise",
        tags: ["technology", "enterprise", "high-value"],
        socialProfiles: {
          linkedin: "https://linkedin.com/company/techcorp",
          twitter: "@techcorp"
        },
        customFields: {
          fiscalYearEnd: "December",
          decisionProcess: "Committee-based",
          budgetCycle: "Annual"
        },
        keyContacts: ["contact_001"],
        activeDeals: ["deal_001"],
        totalDealValue: 75000,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: "company_002",
        tenantId: "founder-tenant",
        name: "Growth Startup",
        domain: "growthstartup.io",
        industry: "Marketing Technology",
        type: "Startup",
        size: "Small",
        employees: 25,
        revenue: 2000000,
        website: "https://growthstartup.io",
        description: "Fast-growing marketing technology startup",
        address: {
          street: "456 Startup Street",
          city: "Austin",
          state: "TX",
          zip: "78701",
          country: "USA"
        },
        status: "qualified_prospect",
        tier: "mid-market",
        tags: ["startup", "marketing", "growth"],
        socialProfiles: {
          linkedin: "https://linkedin.com/company/growthstartup",
          twitter: "@growthstartup"
        },
        customFields: {
          fundingStage: "Series A",
          investors: "Sequoia Capital, a16z",
          growthRate: "200% YoY"
        },
        keyContacts: ["contact_002"],
        activeDeals: ["deal_002"],
        totalDealValue: 25000,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: "company_003",
        tenantId: "founder-tenant",
        name: "Legacy Inc",
        domain: "legacyinc.com",
        industry: "Manufacturing",
        type: "Enterprise",
        size: "Large",
        employees: 2500,
        revenue: 150000000,
        website: "https://legacyinc.com",
        description: "Established manufacturing company modernizing operations",
        address: {
          street: "789 Corporate Blvd",
          city: "Chicago",
          state: "IL",
          zip: "60601",
          country: "USA"
        },
        status: "research_prospect",
        tier: "enterprise",
        tags: ["manufacturing", "legacy", "modernization"],
        socialProfiles: {
          linkedin: "https://linkedin.com/company/legacyinc"
        },
        customFields: {
          establishedYear: "1985",
          modernizationBudget: "$1M annually",
          currentSystems: "SAP, Salesforce, Oracle"
        },
        keyContacts: ["contact_003"],
        activeDeals: ["deal_003"],
        totalDealValue: 45000,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const company of companies) {
      await db.collection('companies').doc(company.id).set(company);
    }

    // 5. Create Tasks Collection
    console.log('✅ Creating tasks collection...');
    const tasks = [
      {
        id: "task_001",
        tenantId: "founder-tenant",
        title: "Follow up with TechCorp - Enterprise Implementation",
        description: "Schedule technical deep-dive demo for Sarah Johnson and her team",
        type: "follow_up",
        priority: "high",
        status: "pending",
        assignedTo: "founder-user-id",
        createdBy: "founder-user-id",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        reminderDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        relatedTo: {
          type: "deal",
          id: "deal_001",
          title: "Enterprise SaaS Implementation - TechCorp"
        },
        tags: ["follow-up", "demo", "enterprise"],
        customFields: {
          callType: "Technical Demo",
          attendees: "Sarah Johnson, CTO + 3 team members",
          duration: "60 minutes"
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: "task_002",
        tenantId: "founder-tenant",
        title: "Prepare proposal for Growth Startup",
        description: "Create customized marketing automation proposal with pricing",
        type: "proposal",
        priority: "medium",
        status: "in_progress",
        assignedTo: "founder-user-id",
        createdBy: "founder-user-id",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        reminderDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        relatedTo: {
          type: "deal",
          id: "deal_002",
          title: "Marketing Automation Package - Growth Startup"
        },
        tags: ["proposal", "marketing", "startup"],
        customFields: {
          proposalType: "Marketing Automation Package",
          budgetRange: "$20,000 - $30,000",
          timeline: "4-6 weeks implementation"
        },
        progress: 35,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const task of tasks) {
      await db.collection('tasks').doc(task.id).set(task);
    }

    // 6. Create Settings Collection
    console.log('⚙️ Creating settings collection...');
    await db.collection('settings').doc('general_settings').set({
      tenantId: "founder-tenant",
      category: "general",
      companyInfo: {
        name: "Market Genie",
        industry: "SaaS",
        size: "startup",
        website: "https://marketgenie.com",
        phone: "+1-555-GENIE-01"
      },
      preferences: {
        timezone: "America/New_York",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        currency: "USD",
        language: "en"
      },
      notifications: {
        email: true,
        push: true,
        sms: false,
        desktop: true
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.collection('settings').doc('crm_settings').set({
      tenantId: "founder-tenant",
      category: "crm",
      pipeline: {
        stages: [
          { id: "lead", name: "Lead", color: "#94A3B8", order: 1 },
          { id: "qualified", name: "Qualified", color: "#3B82F6", order: 2 },
          { id: "proposal", name: "Proposal", color: "#F59E0B", order: 3 },
          { id: "negotiation", name: "Negotiation", color: "#EF4444", order: 4 },
          { id: "closed_won", name: "Closed Won", color: "#10B981", order: 5 },
          { id: "closed_lost", name: "Closed Lost", color: "#6B7280", order: 6 }
        ],
        defaultStage: "lead"
      },
      contactStatuses: [
        { id: "cold", name: "Cold", color: "#6B7280" },
        { id: "warm", name: "Warm", color: "#F59E0B" },
        { id: "hot", name: "Hot", color: "#EF4444" },
        { id: "customer", name: "Customer", color: "#10B981" }
      ],
      leadSources: [
        { id: "website", name: "Website" },
        { id: "referral", name: "Referral" },
        { id: "cold_outreach", name: "Cold Outreach" },
        { id: "social_media", name: "Social Media" },
        { id: "advertising", name: "Advertising" },
        { id: "event", name: "Event" },
        { id: "partner", name: "Partner" }
      ],
      automation: {
        autoAssignDeals: true,
        autoCreateTasks: true,
        autoLogEmails: true,
        autoUpdateLastContact: true
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`
🎉 DATABASE SETUP COMPLETE!

✅ Collections Created:
- tenants (1 document)
- deals (3 documents)  
- contacts (3 documents)
- companies (3 documents)
- tasks (2 documents)
- settings (2 documents)

🔐 Security Features:
- All documents include tenantId: "founder-tenant"
- Firestore rules enforce tenant isolation
- Multi-layer security active

🚀 Your Market Genie CRM is fully populated and ready!
`);

    return { success: true };

  } catch (error) {
    console.error('❌ Error creating collections:', error);
    return { success: false, error };
  }
}

// Run the setup
createCollections()
  .then(result => {
    if (result.success) {
      console.log('✅ All collections created successfully!');
      process.exit(0);
    } else {
      console.error('❌ Failed to create collections:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });