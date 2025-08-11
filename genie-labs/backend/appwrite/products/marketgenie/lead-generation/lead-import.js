// Lead import and deduplication service
import { Databases } from 'node-appwrite';
import csvParser from 'csv-parse/sync';

export class LeadImportService {
  constructor(appwriteClient, userId) {
    this.db = new Databases(appwriteClient);
    this.userId = userId;
  }

  async importFromCSV(csvString) {
    const records = csvParser.parse(csvString, {
      columns: true,
      skip_empty_lines: true
    });
    return this.deduplicateLeads(records);
  }

  async importFromAPI(apiData) {
    // apiData: array of lead objects
    return this.deduplicateLeads(apiData);
  }

  async importFromZapier(zapierPayload) {
    // zapierPayload: array of lead objects
    return this.deduplicateLeads(zapierPayload);
  }

  async deduplicateLeads(leads) {
    // Remove duplicates by email/phone/company
    const unique = [];
    const seen = new Set();
    for (const lead of leads) {
      const key = `${lead.email || ''}|${lead.phone || ''}|${lead.company || lead.name || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(lead);
      }
    }
    return unique;
  }

  async validateLeads(leads) {
    // Basic validation: must have email or phone
    return leads.filter(lead => lead.email || lead.phone);
  }

  async saveLeadsToCRM(leads) {
    for (const lead of leads) {
      await this.db.createDocument(
        'marketGenie_campaigns',
        'leads',
        'unique()',
        lead
      );
    }
  }
}
