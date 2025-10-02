import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export class MetricsService {
  
  // Get real lead count from database
  static async getLeadCount(tenantId) {
    try {
      const leadsRef = collection(db, 'leads');
      const q = query(leadsRef, where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error fetching lead count:', error);
      return 0;
    }
  }

  // Calculate real pipeline value from CRM data
  static async getPipelineValue(tenantId) {
    try {
      const pipelineRef = collection(db, 'pipeline');
      const q = query(
        pipelineRef, 
        where('tenantId', '==', tenantId),
        where('status', 'in', ['qualified', 'proposal', 'negotiation'])
      );
      const snapshot = await getDocs(q);
      
      let totalValue = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        totalValue += data.value || 0;
      });
      
      return totalValue;
    } catch (error) {
      console.error('Error fetching pipeline value:', error);
      return 0;
    }
  }

  // Get active campaign count
  static async getActiveCampaigns(tenantId) {
    try {
      const campaignsRef = collection(db, 'campaigns');
      const q = query(
        campaignsRef, 
        where('tenantId', '==', tenantId),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      return 0;
    }
  }

  // Calculate real conversion rate
  static async getConversionRate(tenantId) {
    try {
      // Get total leads
      const leadsRef = collection(db, 'leads');
      const leadsQuery = query(leadsRef, where('tenantId', '==', tenantId));
      const leadsSnapshot = await getDocs(leadsQuery);
      const totalLeads = leadsSnapshot.size;

      if (totalLeads === 0) return 0;

      // Get converted leads (customers)
      const customersRef = collection(db, 'customers');
      const customersQuery = query(customersRef, where('tenantId', '==', tenantId));
      const customersSnapshot = await getDocs(customersQuery);
      const totalCustomers = customersSnapshot.size;

      const conversionRate = (totalCustomers / totalLeads) * 100;
      return Math.round(conversionRate * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Error calculating conversion rate:', error);
      return 0;
    }
  }

  // Get recent activity for dashboard
  static async getRecentActivity(tenantId, limitCount = 5) {
    try {
      const activitiesRef = collection(db, 'activities');
      const q = query(
        activitiesRef,
        where('tenantId', '==', tenantId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      const activities = [];
      snapshot.forEach(doc => {
        activities.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return activities;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // Get all metrics at once for dashboard
  static async getAllMetrics(tenantId) {
    try {
      const [leadCount, pipelineValue, activeCampaigns, conversionRate, recentActivity] = await Promise.all([
        this.getLeadCount(tenantId),
        this.getPipelineValue(tenantId),
        this.getActiveCampaigns(tenantId),
        this.getConversionRate(tenantId),
        this.getRecentActivity(tenantId)
      ]);

      return {
        leadCount,
        pipelineValue,
        activeCampaigns,
        conversionRate,
        recentActivity,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching all metrics:', error);
      return {
        leadCount: 0,
        pipelineValue: 0,
        activeCampaigns: 0,
        conversionRate: 0,
        recentActivity: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Format currency values
  static formatCurrency(value) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else {
      return `$${value.toLocaleString()}`;
    }
  }

  // Get growth percentage (compare with previous period)
  static async getGrowthMetrics(tenantId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get leads from last 30 days
      const leadsRef = collection(db, 'leads');
      const recentLeadsQuery = query(
        leadsRef,
        where('tenantId', '==', tenantId),
        where('createdAt', '>=', thirtyDaysAgo)
      );
      const recentLeadsSnapshot = await getDocs(recentLeadsQuery);
      const recentLeadsCount = recentLeadsSnapshot.size;

      // Get total leads to calculate growth
      const totalLeadsQuery = query(leadsRef, where('tenantId', '==', tenantId));
      const totalLeadsSnapshot = await getDocs(totalLeadsQuery);
      const totalLeads = totalLeadsSnapshot.size;

      const growthPercentage = totalLeads > 0 ? ((recentLeadsCount / totalLeads) * 100) : 0;

      return {
        recentLeads: recentLeadsCount,
        totalLeads,
        growthPercentage: Math.round(growthPercentage)
      };
    } catch (error) {
      console.error('Error calculating growth metrics:', error);
      return {
        recentLeads: 0,
        totalLeads: 0,
        growthPercentage: 0
      };
    }
  }
}

export default MetricsService;