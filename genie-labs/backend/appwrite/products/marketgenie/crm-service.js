// CRM & Pipeline Management Service
import { Databases } from 'node-appwrite';

export class CRMService {
  constructor(appwriteClient, userId) {
    this.db = new Databases(appwriteClient);
    this.userId = userId;
  }

  async addContact(contact) {
    return await this.db.createDocument(
      'marketGenie_crm',
      'contacts',
      'unique()',
      contact
    );
  }

  async addNote(contactId, note) {
    return await this.db.createDocument(
      'marketGenie_crm',
      'notes',
      'unique()',
      {
        contactId,
        note,
        createdAt: new Date().toISOString(),
        userId: this.userId
      }
    );
  }

  async addActivity(contactId, activity) {
    return await this.db.createDocument(
      'marketGenie_crm',
      'activities',
      'unique()',
      {
        contactId,
        activity,
        timestamp: new Date().toISOString(),
        userId: this.userId
      }
    );
  }

  async getTimeline(contactId) {
    // Fetch notes and activities for contact
    const notes = await this.db.listDocuments('marketGenie_crm', 'notes', [Query.equal('contactId', contactId)]);
    const activities = await this.db.listDocuments('marketGenie_crm', 'activities', [Query.equal('contactId', contactId)]);
    return { notes, activities };
  }

  async addToPipeline(contactId, stage) {
    return await this.db.createDocument(
      'marketGenie_crm',
      'pipeline',
      'unique()',
      {
        contactId,
        stage,
        updatedAt: new Date().toISOString(),
        userId: this.userId
      }
    );
  }

  async updatePipelineStage(contactId, stage) {
    // Find pipeline doc and update stage
    const pipelineDocs = await this.db.listDocuments('marketGenie_crm', 'pipeline', [Query.equal('contactId', contactId)]);
    if (pipelineDocs.documents.length > 0) {
      const pipelineId = pipelineDocs.documents[0].$id;
      await this.db.updateDocument('marketGenie_crm', 'pipeline', pipelineId, { stage, updatedAt: new Date().toISOString() });
    }
  }

  async scoreLead(contactId, score) {
    await this.db.updateDocument('marketGenie_crm', 'contacts', contactId, { score });
  }

  async assignLead(contactId, userId) {
    await this.db.updateDocument('marketGenie_crm', 'contacts', contactId, { assignedTo: userId });
  }

  async setPermissions(contactId, permissions) {
    await this.db.updateDocument('marketGenie_crm', 'contacts', contactId, { permissions });
  }
}
