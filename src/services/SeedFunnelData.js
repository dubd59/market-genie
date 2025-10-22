// SeedFunnelData.js - Helper to create sample funnel data for testing
import FunnelMetricsService from './FunnelMetricsService';

export const seedSampleFunnelData = async (tenantId) => {
  if (!tenantId || tenantId === 'undefined') {
    console.warn('Cannot seed data: Invalid tenantId');
    return false;
  }

  try {
    console.log('🌱 Seeding sample funnel data for tenant:', tenantId);

    // Track some sample funnel performance data
    await FunnelMetricsService.trackFunnelPerformance(tenantId, 'funnel_1', 18.5, 92);
    await FunnelMetricsService.trackFunnelPerformance(tenantId, 'funnel_2', 24.7, 88);
    await FunnelMetricsService.trackFunnelPerformance(tenantId, 'funnel_3', 31.2, 95);

    // Track some wishes granted
    await FunnelMetricsService.trackWishGranted(tenantId, 'optimization', 'AI improved conversion rate by 15%');
    await FunnelMetricsService.trackWishGranted(tenantId, 'campaign_success', 'Email campaign exceeded open rate target');
    await FunnelMetricsService.trackWishGranted(tenantId, 'lead_generation', 'Generated 50+ high-quality leads');

    console.log('✅ Sample funnel data seeded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    return false;
  }
};

// Call this in the browser console to seed data: window.seedSampleData()
if (typeof window !== 'undefined') {
  window.seedSampleData = () => {
    const tenantId = localStorage.getItem('marketgenie_tenant_id');
    if (tenantId) {
      seedSampleFunnelData(tenantId);
    } else {
      console.log('No tenant ID found. Please log in first.');
    }
  };
}