// Complete Database Collections Setup for Market Genie
// This script will create all collections with proper tenant isolation

const collections = {
  // 1. CORE TENANT & USER MANAGEMENT
  tenants: {
    "founder-tenant": {
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
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // 2. CRM - DEALS PIPELINE
  deals: {
    "deal_001": {
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
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "deal_002": {
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
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "deal_003": {
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
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // 3. CRM - CONTACTS
  contacts: {
    "contact_001": {
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
      lastContactDate: new Date(),
      nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "contact_002": {
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
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "contact_003": {
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
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // 4. CRM - COMPANIES
  companies: {
    "company_001": {
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
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "company_002": {
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
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "company_003": {
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
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // 5. MARKETING - CAMPAIGNS
  campaigns: {
    "campaign_001": {
      tenantId: "founder-tenant",
      name: "Enterprise Q4 2025 Outreach",
      type: "email",
      status: "active",
      channel: "email",
      targetAudience: "enterprise_ctos",
      budget: 15000,
      spent: 8500,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      goals: {
        leads: 500,
        meetings: 25,
        deals: 5
      },
      metrics: {
        sent: 2500,
        delivered: 2350,
        opened: 705,
        clicked: 176,
        replied: 47,
        bounced: 150,
        unsubscribed: 23,
        leads: 89,
        meetings: 12,
        deals: 2
      },
      content: {
        subject: "Transform Your Enterprise CRM in 2025",
        template: "enterprise_cto_outreach",
        personalization: "high"
      },
      tags: ["enterprise", "q4", "email"],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "campaign_002": {
      tenantId: "founder-tenant",
      name: "Startup Growth Marketing Automation",
      type: "content",
      status: "active",
      channel: "social",
      targetAudience: "startup_marketers",
      budget: 8000,
      spent: 4200,
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      goals: {
        impressions: 100000,
        engagement: 5000,
        leads: 200
      },
      metrics: {
        impressions: 45000,
        reach: 32000,
        engagement: 2100,
        clicks: 890,
        leads: 67,
        cost_per_lead: 62.69
      },
      content: {
        theme: "Marketing Automation Best Practices",
        formats: ["blog", "webinar", "social"],
        cta: "Download Free Guide"
      },
      tags: ["startup", "marketing", "automation"],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // 6. AUTOMATION - WORKFLOWS
  workflows: {
    "workflow_001": {
      tenantId: "founder-tenant",
      name: "New Lead Welcome Sequence",
      description: "Automated welcome and nurturing sequence for new leads",
      status: "active",
      type: "lead_nurturing",
      trigger: {
        type: "contact_created",
        conditions: {
          source: ["website", "social"],
          status: ["cold", "warm"]
        }
      },
      steps: [
        {
          id: "step_1",
          type: "email",
          delay: 0,
          action: {
            template: "welcome_email",
            subject: "Welcome to Market Genie!",
            personalized: true
          }
        },
        {
          id: "step_2",
          type: "wait",
          delay: 1440, // 24 hours
          action: {
            duration: "1 day"
          }
        },
        {
          id: "step_3",
          type: "email",
          delay: 0,
          action: {
            template: "value_proposition",
            subject: "How Market Genie Can Transform Your Business",
            personalized: true
          }
        },
        {
          id: "step_4",
          type: "wait",
          delay: 4320, // 3 days
          action: {
            duration: "3 days"
          }
        },
        {
          id: "step_5",
          type: "task",
          delay: 0,
          action: {
            assignTo: "founder-user-id",
            title: "Follow up with warm lead",
            priority: "medium"
          }
        }
      ],
      performance: {
        triggered: 89,
        completed: 67,
        conversion_rate: 18.5,
        avg_completion_time: 7
      },
      tags: ["lead-nurturing", "email", "automation"],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "workflow_002": {
      tenantId: "founder-tenant",
      name: "Deal Closing Reminder Sequence",
      description: "Automated reminders and tasks for deals nearing close date",
      status: "active",
      type: "deal_management",
      trigger: {
        type: "deal_close_date",
        conditions: {
          days_before: 7,
          stages: ["proposal", "negotiation"],
          probability: ">= 50"
        }
      },
      steps: [
        {
          id: "step_1",
          type: "task",
          delay: 0,
          action: {
            assignTo: "deal_owner",
            title: "Review deal status - closing in 7 days",
            priority: "high"
          }
        },
        {
          id: "step_2",
          type: "email",
          delay: 0,
          action: {
            template: "deal_closing_check",
            to: "contact",
            subject: "Following up on our proposal",
            personalized: true
          }
        },
        {
          id: "step_3",
          type: "wait",
          delay: 2880, // 2 days
          action: {
            duration: "2 days"
          }
        },
        {
          id: "step_4",
          type: "notification",
          delay: 0,
          action: {
            type: "slack",
            message: "Deal {{deal.title}} closes in 3 days - status check needed"
          }
        }
      ],
      performance: {
        triggered: 23,
        completed: 21,
        deals_closed: 8,
        close_rate_improvement: 15.3
      },
      tags: ["deal-management", "closing", "reminders"],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // 7. ANALYTICS & REPORTING
  analytics: {
    "analytics_dashboard": {
      tenantId: "founder-tenant",
      type: "dashboard",
      period: "current_month",
      dateRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date()
      },
      metrics: {
        // Revenue Metrics
        totalRevenue: 145000,
        monthlyRecurringRevenue: 28500,
        averageDealSize: 48333,
        revenueGrowth: 23.5,
        
        // Sales Metrics
        totalDeals: 3,
        dealsWon: 1,
        dealsLost: 0,
        winRate: 33.3,
        salesCycleLength: 45,
        
        // Lead Metrics
        totalContacts: 3,
        newLeads: 15,
        leadConversionRate: 8.7,
        costPerLead: 125,
        
        // Activity Metrics
        emailsSent: 450,
        callsMade: 67,
        meetingsScheduled: 12,
        proposalsSent: 3,
        
        // Pipeline Metrics
        pipelineValue: 145000,
        pipelineVelocity: 2.3,
        forecastAccuracy: 87.5
      },
      charts: {
        revenueByMonth: [
          { month: "Aug", revenue: 95000 },
          { month: "Sep", revenue: 117500 },
          { month: "Oct", revenue: 145000 }
        ],
        dealsByStage: [
          { stage: "qualified", count: 1, value: 45000 },
          { stage: "proposal", count: 1, value: 25000 },
          { stage: "negotiation", count: 1, value: 75000 }
        ],
        leadsBySource: [
          { source: "website", count: 5 },
          { source: "referral", count: 4 },
          { source: "cold_outreach", count: 3 },
          { source: "social", count: 3 }
        ]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "analytics_sales_performance": {
      tenantId: "founder-tenant",
      type: "sales_performance",
      period: "quarter",
      userId: "founder-user-id",
      dateRange: {
        start: new Date(2025, 9, 1), // Q4 2025
        end: new Date(2025, 11, 31)
      },
      metrics: {
        quotaAttainment: 73.5,
        dealsWon: 8,
        dealsLost: 3,
        totalRevenue: 485000,
        averageDealSize: 60625,
        salesCycleLength: 42,
        activitiesLogged: 234,
        callsPerDay: 8.5,
        emailsPerDay: 15.2
      },
      goals: {
        quarterlyQuota: 660000,
        dealsTarget: 12,
        newLeadsTarget: 150,
        meetingsTarget: 60
      },
      performance: {
        trending: "up",
        rank: 1,
        improvement: 18.3
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // 8. TASKS & ACTIVITIES
  tasks: {
    "task_001": {
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
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "task_002": {
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
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "task_003": {
      tenantId: "founder-tenant",
      title: "Research Legacy Inc's current tech stack",
      description: "Understand their Salesforce setup and migration requirements",
      type: "research",
      priority: "low",
      status: "pending",
      assignedTo: "founder-user-id",
      createdBy: "founder-user-id",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      reminderDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      relatedTo: {
        type: "deal",
        id: "deal_003",
        title: "CRM Migration Project"
      },
      tags: ["research", "migration", "salesforce"],
      customFields: {
        researchType: "Technical Discovery",
        focusAreas: "Data structure, customizations, integrations",
        deliverable: "Migration complexity assessment"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // 9. INTEGRATIONS & SETTINGS
  integrations: {
    "integration_email": {
      tenantId: "founder-tenant",
      name: "Gmail Integration",
      type: "email",
      provider: "gmail",
      status: "connected",
      config: {
        email: "dubdproducts@gmail.com",
        syncEnabled: true,
        syncDirection: "bidirectional",
        autoLog: true
      },
      features: {
        emailTracking: true,
        templateSync: true,
        calendarSync: true,
        contactSync: true
      },
      lastSync: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "integration_calendar": {
      tenantId: "founder-tenant",
      name: "Google Calendar",
      type: "calendar",
      provider: "google_calendar",
      status: "connected",
      config: {
        calendarId: "primary",
        syncMeetings: true,
        createEvents: true,
        updateEvents: true
      },
      features: {
        meetingScheduling: true,
        autoReminders: true,
        dealSync: true
      },
      lastSync: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  // 10. SYSTEM SETTINGS
  settings: {
    "general_settings": {
      tenantId: "founder-tenant",
      category: "general",
      companyInfo: {
        name: "Market Genie",
        industry: "SaaS",
        size: "startup",
        website: "https://marketgenie.com",
        phone: "+1-555-GENIE-01",
        address: {
          street: "123 Innovation Drive",
          city: "San Francisco",
          state: "CA",
          zip: "94105",
          country: "USA"
        }
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
      createdAt: new Date(),
      updatedAt: new Date()
    },
    "crm_settings": {
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
      customFields: {
        deals: [
          { name: "Implementation Timeline", type: "text", required: false },
          { name: "Technical Complexity", type: "select", options: ["Low", "Medium", "High"], required: false },
          { name: "Decision Makers", type: "number", required: false }
        ],
        contacts: [
          { name: "Budget Authority", type: "select", options: ["Yes", "No", "Partial"], required: false },
          { name: "Technical Expertise", type: "select", options: ["Low", "Medium", "High"], required: false },
          { name: "Previous CRM Experience", type: "text", required: false }
        ],
        companies: [
          { name: "Fiscal Year End", type: "select", options: ["March", "June", "September", "December"], required: false },
          { name: "Decision Process", type: "text", required: false },
          { name: "Current CRM", type: "text", required: false }
        ]
      },
      automation: {
        autoAssignDeals: true,
        autoCreateTasks: true,
        autoLogEmails: true,
        autoUpdateLastContact: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
};

console.log("Database Collections Structure Ready:");
console.log("- Tenants: 1 collection");
console.log("- Deals: 3 sample deals");
console.log("- Contacts: 3 sample contacts");
console.log("- Companies: 3 sample companies");
console.log("- Campaigns: 2 marketing campaigns");
console.log("- Workflows: 2 automation workflows");
console.log("- Analytics: 2 analytics dashboards");
console.log("- Tasks: 3 sample tasks");
console.log("- Integrations: 2 integrations");
console.log("- Settings: 2 settings groups");
console.log("\nAll collections include proper tenantId isolation for security!");

export default collections;