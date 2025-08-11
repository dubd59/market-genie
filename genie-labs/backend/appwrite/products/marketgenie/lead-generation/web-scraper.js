// Web scraping service for lead generation
import { Databases } from 'node-appwrite';
import { CostController } from './cost-controller.js';

export class WebLeadScraper {
  constructor(appwriteClient, userId) {
    this.db = new Databases(appwriteClient);
    this.costController = new CostController(appwriteClient);
    this.userId = userId;
  }

  async scrapeBusinessDirectories(criteria) {
    // Check budget before starting bulk operation
    const budgetCheck = await this.costController.checkBudgetBeforeOperation(
      this.userId, 
      'basicScrape', 
      100 // Estimate 100 leads per source
    );

    if (!budgetCheck.canProceed) {
      throw new Error(`Budget limit reached. Current spend: $${budgetCheck.currentSpend.toFixed(3)}, Daily budget: $${budgetCheck.dailyBudget}`);
    }

    // Adjust sources based on budget tier
    const budgetSettings = await this.costController.getBudgetStatus(this.userId);
    let sources = ['yellowpages.com', 'yelp.com'];
    
    // Add more sources as budget allows
    if (budgetSettings.dailyBudget >= 2.00) {
      sources.push('google.com/business');
    }
    if (budgetSettings.dailyBudget >= 10.00) {
      sources.push('linkedin.com/company', 'crunchbase.com');
    }

    const leads = [];
    let totalCost = 0;
    
    for (const source of sources) {
      try {
        // Check budget before each source
        const sourceCheck = await this.costController.checkBudgetBeforeOperation(
          this.userId, 
          'basicScrape', 
          50 // 50 leads per source
        );

        if (!sourceCheck.canProceed) {
          console.log(`Stopping scraping at ${source} due to budget limit`);
          break;
        }

        const scrapedData = await this.scrapeSource(source, criteria);
        leads.push(...scrapedData.leads);
        
        // Record the actual cost
        const actualCost = scrapedData.leads.length * 0.0005; // $0.0005 per lead
        await this.costController.recordOperation(this.userId, 'basicScrape', scrapedData.leads.length, actualCost);
        totalCost += actualCost;
        
      } catch (error) {
        console.error(`Error scraping ${source}:`, error);
      }
    }

  // Deduplicate and validate leads before returning
  const deduped = this.deduplicateLeads(leads);
  const validated = this.validateLeads(deduped);
  console.log(`Scraped ${validated.length} valid leads for $${totalCost.toFixed(3)}`);
  return { leads: validated, totalCost };
  deduplicateLeads(leads) {
    const unique = [];
    const seen = new Set();
    for (const lead of leads) {
      const key = `${lead.email || ''}|${lead.phone || ''}|${lead.name || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(lead);
      }
    }
    return unique;
  }

  validateLeads(leads) {
    return leads.filter(lead => lead.email || lead.phone);
  }
  }

  async scrapeSource(source, criteria) {
    // Implementation would use headless browser (Puppeteer/Playwright)
    // This is a placeholder for the actual scraping logic
    return {
      source,
      leads: [
        {
          name: 'Sample Business',
          email: 'contact@samplebusiness.com',
          phone: '+1-555-123-4567',
          website: 'samplebusiness.com',
          industry: criteria.industry,
          location: criteria.location,
          employeeCount: '10-50',
          revenue: '$1M-$5M'
        }
      ]
    };
  }

  async enrichLeadData(leadData) {
    // Check budget for enrichment operations
    const emailCheck = await this.costController.checkBudgetBeforeOperation(this.userId, 'emailLookup', 1);
    const companyCheck = await this.costController.checkBudgetBeforeOperation(this.userId, 'companyEnrichment', 1);
    
    const enrichedLead = { ...leadData };
    let enrichmentCost = 0;

    // Only enrich if budget allows (prioritize based on budget tier)
    if (emailCheck.canProceed) {
      enrichedLead.socialProfiles = await this.findSocialProfiles(leadData);
      await this.costController.recordOperation(this.userId, 'emailLookup', 1, 0.003);
      enrichmentCost += 0.003;
    }

    if (companyCheck.canProceed) {
      enrichedLead.companyInfo = await this.getCompanyInfo(leadData);
      enrichedLead.contactInfo = await this.findContactInfo(leadData);
      await this.costController.recordOperation(this.userId, 'companyEnrichment', 1, 0.015);
      enrichmentCost += 0.015;
    }

    console.log(`Enriched lead for $${enrichmentCost.toFixed(3)}`);
    return enrichedLead;
  }

  async findSocialProfiles(leadData) {
    // Find LinkedIn, Twitter, Facebook profiles
    return {
      linkedin: `https://linkedin.com/company/${leadData.name.toLowerCase()}`,
      twitter: `@${leadData.name.toLowerCase()}`,
      facebook: `https://facebook.com/${leadData.name.toLowerCase()}`
    };
  }

  async getCompanyInfo(leadData) {
    // Get additional company information
    return {
      foundedYear: 2015,
      industry: leadData.industry,
      technologies: ['React', 'Node.js', 'AWS'],
      fundingInfo: 'Series A',
      competitors: ['Competitor A', 'Competitor B']
    };
  }

  async findContactInfo(leadData) {
    // Find decision maker contact information
    return {
      decisionMakers: [
        {
          name: 'John Smith',
          title: 'CEO',
          email: 'john@samplebusiness.com',
          linkedin: 'https://linkedin.com/in/johnsmith'
        }
      ]
    };
  }

  deduplicateLeads(leads) {
    const unique = [];
    const seen = new Set();
    for (const lead of leads) {
      const key = `${lead.email || ''}|${lead.phone || ''}|${lead.name || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(lead);
      }
    }
    return unique;
  }

  validateLeads(leads) {
    return leads.filter(lead => lead.email || lead.phone);
  }
}
