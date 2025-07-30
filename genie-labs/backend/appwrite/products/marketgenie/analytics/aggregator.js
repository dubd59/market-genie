export async function generateDailyReport() {
  const db = new Databases(AppwriteClient);
  
  // PostgreSQL query via Appwrite
  return await db.query(
    `SELECT 
       campaign_id, 
       SUM(clicks) as clicks,
       SUM(spend) as spend
     FROM campaign_events
     WHERE date >= NOW() - INTERVAL '1 day'
     GROUP BY campaign_id`
  );
}
