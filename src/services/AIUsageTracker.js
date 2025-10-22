// AIUsageTracker.js - Real-time AI API usage monitoring and rate limiting
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, orderBy, limit } from '../security/SecureFirebase.js';

export class AIUsageTracker {
  
  // Track AI API usage and costs
  static async trackAIUsage(tenantId, provider, tokens, cost, operation) {
    if (!tenantId) return;
    
    try {
      await addDoc(collection(db, 'MarketGenie_ai_usage'), {
        tenantId,
        provider, // 'openai', 'claude', 'deepseek'
        tokens,
        cost,
        operation, // 'lead_generation', 'content_creation', 'enrichment'
        timestamp: new Date(),
        createdAt: new Date()
      });
      
      console.log(`📊 AI Usage tracked: ${provider} - ${tokens} tokens - $${cost}`);
    } catch (error) {
      console.error('Error tracking AI usage:', error);
    }
  }
  
  // Get current month AI usage by provider
  static async getMonthlyAIUsage(tenantId) {
    if (!tenantId) return { openai: 0, claude: 0, deepseek: 0, total: 0 };
    
    try {
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const usageRef = collection(db, 'MarketGenie_ai_usage');
      const usageQuery = query(
        usageRef,
        where('tenantId', '==', tenantId),
        where('timestamp', '>=', thisMonth)
      );
      
      const usageDocs = await getDocs(usageQuery);
      
      const usage = {
        openai: 0,
        claude: 0,
        deepseek: 0,
        total: 0,
        tokens: {
          openai: 0,
          claude: 0,
          deepseek: 0,
          total: 0
        }
      };
      
      usageDocs.forEach(doc => {
        const data = doc.data();
        const provider = data.provider.toLowerCase();
        
        if (usage[provider] !== undefined) {
          usage[provider] += data.cost || 0;
          usage.tokens[provider] += data.tokens || 0;
        }
        
        usage.total += data.cost || 0;
        usage.tokens.total += data.tokens || 0;
      });
      
      return usage;
    } catch (error) {
      console.error('Error getting monthly AI usage:', error);
      return { openai: 0, claude: 0, deepseek: 0, total: 0 };
    }
  }
  
  // Get hourly rate limits (tokens/hour)
  static async getHourlyUsage(tenantId, provider) {
    if (!tenantId) return 0;
    
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const usageRef = collection(db, 'MarketGenie_ai_usage');
      const usageQuery = query(
        usageRef,
        where('tenantId', '==', tenantId),
        where('provider', '==', provider),
        where('timestamp', '>=', oneHourAgo)
      );
      
      const usageDocs = await getDocs(usageQuery);
      
      let totalTokens = 0;
      usageDocs.forEach(doc => {
        totalTokens += doc.data().tokens || 0;
      });
      
      return totalTokens;
    } catch (error) {
      console.error('Error getting hourly usage:', error);
      return 0;
    }
  }
  
  // Check if usage is approaching limits
  static async checkRateLimit(tenantId, provider, tokens) {
    const rateLimits = {
      openai: 10000, // tokens per hour
      claude: 8000,
      deepseek: 5000
    };
    
    const currentHourlyUsage = await this.getHourlyUsage(tenantId, provider);
    const projectedUsage = currentHourlyUsage + tokens;
    
    const limit = rateLimits[provider] || 1000;
    const usagePercentage = (projectedUsage / limit) * 100;
    
    return {
      allowed: usagePercentage < 90, // Stop at 90% of rate limit
      currentUsage: currentHourlyUsage,
      projectedUsage,
      limit,
      usagePercentage
    };
  }
  
  // Get automation usage (workflow executions, enrichments, etc.)
  static async getAutomationUsage(tenantId) {
    if (!tenantId) return { workflows: 0, enrichments: 0, emails: 0 };
    
    try {
      const thisHour = new Date();
      thisHour.setMinutes(0, 0, 0);
      
      // Count workflow executions this hour
      const workflowsRef = collection(db, 'MarketGenie_workflow_logs');
      const workflowsQuery = query(
        workflowsRef,
        where('tenantId', '==', tenantId),
        where('timestamp', '>=', thisHour)
      );
      const workflowDocs = await getDocs(workflowsQuery);
      
      // Count enrichments this hour  
      const enrichmentsRef = collection(db, 'MarketGenie_contacts');
      const enrichmentsQuery = query(
        enrichmentsRef,
        where('tenantId', '==', tenantId),
        where('updatedAt', '>=', thisHour)
      );
      const enrichmentDocs = await getDocs(enrichmentsQuery);
      
      // Count campaign emails this hour
      const emailsRef = collection(db, 'MarketGenie_campaign_logs');
      const emailsQuery = query(
        emailsRef,
        where('tenantId', '==', tenantId),
        where('timestamp', '>=', thisHour)
      );
      const emailDocs = await getDocs(emailsQuery);
      
      return {
        workflows: workflowDocs.size,
        enrichments: enrichmentDocs.size,
        emails: emailDocs.size
      };
    } catch (error) {
      console.error('Error getting automation usage:', error);
      return { workflows: 0, enrichments: 0, emails: 0 };
    }
  }
  
  // Get comprehensive usage report
  static async getUsageReport(tenantId) {
    try {
      const [monthlyUsage, automationUsage] = await Promise.all([
        this.getMonthlyAIUsage(tenantId),
        this.getAutomationUsage(tenantId)
      ]);
      
      return {
        ai: monthlyUsage,
        automation: automationUsage,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting usage report:', error);
      return null;
    }
  }
}

export default AIUsageTracker;