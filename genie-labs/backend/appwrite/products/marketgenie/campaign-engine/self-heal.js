import { Databases } from 'node-appwrite';

export async function monitorCampaign(campaignId) {
  const db = new Databases(AppwriteClient);
  
  // 1. Get KPI data from PostgreSQL
  const kpis = await db.listDocuments(
    'analytics',
    'campaign_kpis',
    [Query.equal('campaignId', campaignId)]
  );

  // 2. Auto-adjust underperforming campaigns
  if (kpis.CTR < 1.5) {
    await db.updateDocument('marketGenie_campaigns', campaignId, {
      status: 'optimizing',
      budgetReallocation: kpis.budget * 0.8 // Reduce by 20%
    });
  }
}
