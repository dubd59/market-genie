// Funnel Builder Service
import { Databases } from 'node-appwrite';

export class FunnelBuilderService {
  constructor(appwriteClient, userId) {
    this.db = new Databases(appwriteClient);
    this.userId = userId;
  }

  async createFunnel(name, stages) {
    return await this.db.createDocument(
      'marketGenie_crm',
      'funnels',
      'unique()',
      {
        name,
        stages,
        createdAt: new Date().toISOString(),
        userId: this.userId
      }
    );
  }

  async updateFunnel(funnelId, stages) {
    await this.db.updateDocument('marketGenie_crm', 'funnels', funnelId, { stages });
  }

  async getFunnels() {
    return await this.db.listDocuments('marketGenie_crm', 'funnels', []);
  }

  async dragAndDropStage(funnelId, fromIndex, toIndex) {
    // Fetch funnel, reorder stages
    const funnel = await this.db.getDocument('marketGenie_crm', 'funnels', funnelId);
    const stages = funnel.stages;
    const [moved] = stages.splice(fromIndex, 1);
    stages.splice(toIndex, 0, moved);
    await this.db.updateDocument('marketGenie_crm', 'funnels', funnelId, { stages });
  }
}
