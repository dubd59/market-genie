// Automated lead generation and sales pipeline
import { Databases, Query } from 'node-appwrite';
import { WebLeadScraper } from './web-scraper.js';

export class AutomatedSalesEngine {
  constructor(appwriteClient) {
    this.db = new Databases(appwriteClient);
    this.scraper = new WebLeadScraper(appwriteClient);
  }

  async generateLeadsAutopilot(criteria) {
    // 1. Scrape web for potential leads
    const scrapedLeads = await this.scraper.scrapeBusinessDirectories(criteria);
    
    // 2. Enrich lead data
    const enrichedLeads = [];
    for (const lead of scrapedLeads.leads) {
      const enriched = await this.scraper.enrichLeadData(lead);
      enrichedLeads.push(enriched);
    }

    // 3. Score and qualify leads
    const qualifiedLeads = await this.scoreAndQualifyLeads(enrichedLeads);

    // 4. Automatically add to CRM
    await this.addLeadsToCRM(qualifiedLeads);

    // 5. Trigger automated outreach sequences
    await this.triggerOutreachSequences(qualifiedLeads);

    return {
      totalScraped: scrapedLeads.leads.length,
      qualified: qualifiedLeads.length,
      addedToCRM: qualifiedLeads.length,
      outreachTriggered: qualifiedLeads.filter(l => l.score >= 70).length
    };
  }

  async scoreAndQualifyLeads(leads) {
    const qualified = [];
    
    for (const lead of leads) {
      const score = await this.calculateLeadScore(lead);
      
      if (score >= 50) { // Minimum qualification score
        qualified.push({
          ...lead,
          score,
          status: score >= 80 ? 'hot' : score >= 60 ? 'warm' : 'cold',
          qualificationDate: new Date()
        });
      }
    }

    return qualified;
  }

  async calculateLeadScore(lead) {
    let score = 0;

    // Company size scoring
    if (lead.employeeCount) {
      const employees = parseInt(lead.employeeCount.split('-')[0]);
      if (employees >= 100) score += 30;
      else if (employees >= 50) score += 20;
      else if (employees >= 10) score += 10;
    }

    // Revenue scoring
    if (lead.revenue) {
      const revenue = lead.revenue.toLowerCase();
      if (revenue.includes('m') && !revenue.includes('k')) score += 25;
      else if (revenue.includes('k')) score += 10;
    }

    // Industry relevance
    const targetIndustries = ['SaaS', 'Technology', 'Marketing', 'E-commerce'];
    if (targetIndustries.includes(lead.industry)) score += 20;

    // Contact information completeness
    if (lead.email) score += 15;
    if (lead.phone) score += 10;
    if (lead.website) score += 5;

    // Social presence
    if (lead.socialProfiles?.linkedin) score += 10;
    if (lead.socialProfiles?.twitter) score += 5;

    return Math.min(score, 100);
  }

  async addLeadsToCRM(leads) {
    const crmLeads = leads.map(lead => ({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.name,
      industry: lead.industry,
      location: lead.location,
      source: 'automated_scraping',
      score: lead.score,
      status: 'lead',
      value: this.estimateLeadValue(lead),
      metadata: {
        scrapingDate: new Date(),
        enrichmentData: lead.companyInfo,
        socialProfiles: lead.socialProfiles
      }
    }));

    await this.db.createDocument(
      'marketGenie_campaigns',
      'leads',
      'unique()',
      { leads: crmLeads }
    );
  }

  async triggerOutreachSequences(leads) {
    for (const lead of leads) {
      // Determine outreach sequence based on lead score
      let sequenceType = 'basic_outreach';
      
      if (lead.score >= 80) {
        sequenceType = 'vip_outreach';
      } else if (lead.score >= 60) {
        sequenceType = 'warm_outreach';
      }

      await this.startEmailSequence(lead, sequenceType);
      
      // Schedule follow-up tasks
      await this.scheduleFollowups(lead);
    }
  }

  async startEmailSequence(lead, sequenceType) {
    const sequences = {
      vip_outreach: [
        { delay: 0, template: 'vip_introduction' },
        { delay: 3, template: 'value_proposition' },
        { delay: 7, template: 'case_study' },
        { delay: 14, template: 'demo_invitation' }
      ],
      warm_outreach: [
        { delay: 0, template: 'warm_introduction' },
        { delay: 5, template: 'industry_insights' },
        { delay: 12, template: 'follow_up' }
      ],
      basic_outreach: [
        { delay: 0, template: 'basic_introduction' },
        { delay: 7, template: 'follow_up' }
      ]
    };

    const sequence = sequences[sequenceType];
    
    for (const step of sequence) {
      await this.scheduleEmail(lead, step.template, step.delay);
    }
  }

  async scheduleEmail(lead, template, delayDays) {
    const sendDate = new Date();
    sendDate.setDate(sendDate.getDate() + delayDays);

    await this.db.createDocument(
      'marketGenie_campaigns',
      'scheduled_emails',
      'unique()',
      {
        leadId: lead.id,
        template,
        sendDate: sendDate.toISOString(),
        status: 'scheduled'
      }
    );
  }

  async scheduleFollowups(lead) {
    const followups = [
      { days: 1, action: 'linkedin_connect' },
      { days: 3, action: 'phone_call' },
      { days: 7, action: 'personalized_video' },
      { days: 14, action: 'retargeting_ads' }
    ];

    for (const followup of followups) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + followup.days);

      await this.db.createDocument(
        'marketGenie_campaigns',
        'followup_tasks',
        'unique()',
        {
          leadId: lead.id,
          action: followup.action,
          dueDate: dueDate.toISOString(),
          status: 'pending'
        }
      );
    }
  }

  estimateLeadValue(lead) {
    // Estimate potential customer value based on company data
    let value = 0;

    if (lead.revenue) {
      const revenue = lead.revenue.toLowerCase();
      if (revenue.includes('m')) {
        const amount = parseInt(revenue);
        value = Math.min(amount * 0.001, 10000); // 0.1% of revenue, max $10k
      }
    }

    // Industry multipliers
    const industryMultipliers = {
      'SaaS': 1.5,
      'Technology': 1.3,
      'Marketing': 1.2,
      'E-commerce': 1.1
    };

    const multiplier = industryMultipliers[lead.industry] || 1;
    return Math.round(value * multiplier);
  }

  // Automated booking system
  async enableAutomatedBooking(lead) {
    // Generate calendar booking link
    const bookingLink = await this.generateBookingLink(lead);
    
    // Send booking invitation email
    await this.sendBookingInvitation(lead, bookingLink);
    
    // Set up automated reminders
    await this.setupBookingReminders(lead, bookingLink);

    return bookingLink;
  }

  async generateBookingLink(lead) {
    // Integration with calendar systems (Calendly, Acuity, etc.)
    return `https://calendly.com/marketgenie/consultation?lead=${lead.id}`;
  }

  async sendBookingInvitation(lead, bookingLink) {
    const emailContent = {
      to: lead.email,
      subject: `Quick 15-minute consultation for ${lead.name}?`,
      template: 'booking_invitation',
      variables: {
        leadName: lead.name,
        bookingLink,
        companyName: lead.name
      }
    };

    await this.db.createDocument(
      'marketGenie_campaigns',
      'outbound_emails',
      'unique()',
      emailContent
    );
  }

  async setupBookingReminders(lead, bookingLink) {
    // Set up automated reminder sequence
    const reminders = [
      { hours: 24, message: 'Reminder: Your consultation is tomorrow' },
      { hours: 2, message: 'Your consultation starts in 2 hours' },
      { hours: 0.5, message: 'Your consultation starts in 30 minutes' }
    ];

    for (const reminder of reminders) {
      const reminderTime = new Date();
      reminderTime.setHours(reminderTime.getHours() + reminder.hours);

      await this.db.createDocument(
        'marketGenie_campaigns',
        'booking_reminders',
        'unique()',
        {
          leadId: lead.id,
          message: reminder.message,
          sendTime: reminderTime.toISOString(),
          bookingLink
        }
      );
    }
  }
}
